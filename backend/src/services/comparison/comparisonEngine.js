import LoanProduct from '../../models/LoanProduct.js';

/*
 * ============================================================
 * FINBRIDGE ADVANCED COMPARISON ENGINE
 * ============================================================
 *
 * This engine ranks existing LoanProduct records using:
 *
 * 1. Requested amount fit
 * 2. Preferred tenure fit
 * 3. Collateral compatibility
 * 4. Affordability / EMI
 * 5. Rate competitiveness
 * 6. Credit-profile fit
 * 7. Source verification confidence
 *
 * IMPORTANT:
 * This is a hackathon recommendation/comparison engine.
 * It is NOT a banking underwriting or sanction decision engine.
 */

const VALID_CATEGORIES = [
    'car',
    'education',
    'home'
];

const DEFAULT_LIMIT = 5;

/*
 * Weights total 100.
 */
const WEIGHTS = {
    amountFit: 15,
    tenureFit: 10,
    collateralFit: 10,
    affordability: 25,
    rateCompetitiveness: 20,
    creditFit: 10,
    sourceConfidence: 10
};

function clamp(value, min = 0, max = 100) {
    return Math.max(min, Math.min(max, value));
}

function isNumber(value) {
    return (
        typeof value === 'number' &&
        Number.isFinite(value)
    );
}

function normalizeProfile(input = {}) {
    const monthlyIncome =
        Number(input.monthlyIncome) || 0;

    const existingMonthlyObligations =
        Number(input.existingMonthlyObligations) || 0;

    const desiredAmount =
        Number(
            input.desiredAmount ??
            input.loanAmount ??
            input.amount
        ) || 0;

    const preferredTenure =
        Number(
            input.preferredTenure ??
            input.tenure
        ) || 0;

    const cibilScore =
        Number(
            input.cibilScore ??
            input.cibil
        ) || null;

    let collateralAvailable = null;

    if (typeof input.collateralAvailable === 'boolean') {
        collateralAvailable = input.collateralAvailable;
    }

    return {
        category:
            input.category ??
            input.loanType ??
            null,

        desiredAmount,

        preferredTenure,

        monthlyIncome,

        existingMonthlyObligations,

        cibilScore,

        collateralAvailable,

        borrowerType:
            input.borrowerType ??
            'individual',

        studyDestination:
            input.studyDestination ??
            null,

        isFemale:
            input.isFemale ??
            input.gender === 'Female'
    };
}

/*
 * ------------------------------------------------------------
 * EMI CALCULATION
 * ------------------------------------------------------------
 */

function calculateEmi(
    principal,
    annualRate,
    tenureMonths
) {
    if (
        !isNumber(principal) ||
        principal <= 0 ||
        !isNumber(annualRate) ||
        annualRate <= 0 ||
        !isNumber(tenureMonths) ||
        tenureMonths <= 0
    ) {
        return null;
    }

    const monthlyRate =
        annualRate / 100 / 12;

    const factor =
        Math.pow(
            1 + monthlyRate,
            tenureMonths
        );

    return (
        principal *
        monthlyRate *
        factor /
        (factor - 1)
    );
}

/*
 * ------------------------------------------------------------
 * RATE HELPERS
 * ------------------------------------------------------------
 */

function getComparableRate(loan) {
    if (
        isNumber(loan.rateDetails?.startingRate) &&
        loan.rateDetails.startingRate > 0
    ) {
        return loan.rateDetails.startingRate;
    }

    if (
        isNumber(loan.rateDetails?.minimumRate) &&
        loan.rateDetails.minimumRate > 0
    ) {
        return loan.rateDetails.minimumRate;
    }

    return null;
}

function calculateRateCompetitiveness(
    loan,
    candidateLoans
) {
    const rates = candidateLoans
        .map(getComparableRate)
        .filter(
            rate =>
                isNumber(rate) &&
                rate > 0
        );

    const loanRate =
        getComparableRate(loan);

    if (
        loanRate === null ||
        rates.length < 2
    ) {
        return {
            score: 50,
            rate: loanRate,
            reason:
                'Insufficient comparable rate data; rate score kept neutral.'
        };
    }

    const minRate =
        Math.min(...rates);

    const maxRate =
        Math.max(...rates);

    if (maxRate === minRate) {
        return {
            score: 100,
            rate: loanRate,
            reason:
                'Comparable products have the same starting rate.'
        };
    }

    const score =
        100 *
        (maxRate - loanRate) /
        (maxRate - minRate);

    return {
        score: clamp(score),
        rate: loanRate,
        reason:
            loanRate === minRate
                ? 'Starting rate is among the lowest in the compared set.'
                : 'Starting rate is competitive within the compared set.'
    };
}

/*
 * ------------------------------------------------------------
 * AMOUNT FIT
 * ------------------------------------------------------------
 */

function calculateAmountFit(
    loan,
    profile
) {
    const requested =
        profile.desiredAmount;

    if (!requested || requested <= 0) {
        return {
            score: 50,
            reason:
                'Requested loan amount was not provided.'
        };
    }

    const min =
        Number(loan.loanAmountMin);

    const max =
        Number(loan.loanAmountMax);

    const hasMin =
        Number.isFinite(min) &&
        min > 0;

    const hasMax =
        Number.isFinite(max) &&
        max > 0;

    if (
        hasMin &&
        requested < min
    ) {
        return {
            score: 0,
            reason:
                `Requested amount ₹${requested.toLocaleString('en-IN')} is below the published minimum.`
        };
    }

    if (
        hasMax &&
        requested > max
    ) {
        return {
            score: 0,
            reason:
                `Requested amount ₹${requested.toLocaleString('en-IN')} exceeds the published maximum.`
        };
    }

    if (hasMin && hasMax) {
        return {
            score: 100,
            reason:
                'Requested amount fits the published loan range.'
        };
    }

    return {
        score: 70,
        reason:
            'Requested amount appears compatible, but the source does not provide a complete numeric range for this product.'
    };
}

/*
 * ------------------------------------------------------------
 * TENURE FIT
 * ------------------------------------------------------------
 */

function calculateTenureFit(
    loan,
    profile
) {
    const requested =
        profile.preferredTenure;

    if (!requested || requested <= 0) {
        return {
            score: 50,
            reason:
                'Preferred tenure was not provided.'
        };
    }

    const min =
        Number(loan.tenureMin);

    const max =
        Number(loan.tenureMax);

    const hasMin =
        Number.isFinite(min) &&
        min > 0;

    const hasMax =
        Number.isFinite(max) &&
        max > 0;

    if (
        hasMin &&
        requested < min
    ) {
        return {
            score: 0,
            reason:
                `Preferred tenure of ${requested} months is below the published minimum.`
        };
    }

    if (
        hasMax &&
        requested > max
    ) {
        return {
            score: 0,
            reason:
                `Preferred tenure of ${requested} months exceeds the published maximum.`
        };
    }

    if (hasMin && hasMax) {
        return {
            score: 100,
            reason:
                'Preferred tenure fits the published tenure range.'
        };
    }

    return {
        score: 70,
        reason:
            'Tenure appears compatible, but complete numeric tenure limits are not available.'
    };
}

/*
 * ------------------------------------------------------------
 * COLLATERAL FIT
 * ------------------------------------------------------------
 */

function calculateCollateralFit(
    loan,
    profile
) {
    if (
        profile.collateralAvailable === null
    ) {
        return {
            score: 50,
            reason:
                'Collateral preference was not provided.'
        };
    }

    const text =
        String(
            loan.collateralRequired || ''
        ).toLowerCase();

    const collateralRequired =
        text.includes('yes') ||
        text.includes('required') ||
        text.includes('mortgage');

    const collateralFree =
        text.includes('no collateral') ||
        text.includes('collateral-free');

    if (
        profile.collateralAvailable === false &&
        collateralRequired &&
        !collateralFree
    ) {
        return {
            score: 0,
            reason:
                'This product appears to require collateral, while the profile indicates no collateral is available.'
        };
    }

    if (
        profile.collateralAvailable === false &&
        collateralFree
    ) {
        return {
            score: 100,
            reason:
                'Product appears compatible with a collateral-free profile.'
        };
    }

    if (
        profile.collateralAvailable === true &&
        collateralRequired
    ) {
        return {
            score: 100,
            reason:
                'Available collateral is compatible with the product requirement.'
        };
    }

    return {
        score: 75,
        reason:
            'Collateral terms require scheme-specific confirmation.'
    };
}

/*
 * ------------------------------------------------------------
 * CREDIT SCORE FIT
 * ------------------------------------------------------------
 */

function calculateCreditFit(
    profile
) {
    const cibil =
        profile.cibilScore;

    if (!isNumber(cibil)) {
        return {
            score: 50,
            reason:
                'CIBIL score was not provided.'
        };
    }

    if (cibil >= 800) {
        return {
            score: 100,
            reason:
                'Very strong CIBIL profile.'
        };
    }

    if (cibil >= 750) {
        return {
            score: 90,
            reason:
                'Strong CIBIL profile.'
        };
    }

    if (cibil >= 700) {
        return {
            score: 75,
            reason:
                'Reasonable CIBIL profile; product-specific pricing may vary.'
        };
    }

    if (cibil >= 650) {
        return {
            score: 55,
            reason:
                'Moderate CIBIL profile; enhanced rate/eligibility review may apply.'
        };
    }

    return {
        score: 30,
        reason:
            'Low CIBIL profile; approval and pricing may be materially less favorable.'
    };
}

/*
 * ------------------------------------------------------------
 * AFFORDABILITY
 * ------------------------------------------------------------
 *
 * Internal hackathon screening rule:
 * DTI > 55% = high-risk/poor affordability.
 *
 * This is NOT a universal banking rule.
 */

function calculateAffordability(
    loan,
    profile
) {
    const income =
        profile.monthlyIncome;

    if (!income || income <= 0) {
        return {
            score: 50,
            emi: null,
            dti: null,
            reason:
                'Monthly income was not provided.'
        };
    }

    const existing =
        Math.max(
            0,
            profile.existingMonthlyObligations
        );

    const rate =
        getComparableRate(loan);

    const tenure =
        profile.preferredTenure ||
        Number(loan.tenureMax) ||
        60;

    const amount =
        profile.desiredAmount;

    if (
        !rate ||
        !amount ||
        !tenure
    ) {
        return {
            score: 50,
            emi: null,
            dti: null,
            reason:
                'EMI could not be calculated because rate, amount or tenure data is incomplete.'
        };
    }

    const emi =
        calculateEmi(
            amount,
            rate,
            tenure
        );

    if (!emi) {
        return {
            score: 50,
            emi: null,
            dti: null,
            reason:
                'EMI could not be calculated.'
        };
    }

    const totalMonthlyDebt =
        existing + emi;

    const dti =
        totalMonthlyDebt /
        income *
        100;

    if (dti > 55) {
        return {
            score: 20,
            emi,
            dti,
            reason:
                `Estimated DTI is ${dti.toFixed(1)}%, above the 55% high-risk screening threshold.`
        };
    }

    if (dti > 50) {
        return {
            score: 45,
            emi,
            dti,
            reason:
                `Estimated DTI is ${dti.toFixed(1)}%; affordability needs closer review.`
        };
    }

    if (dti > 40) {
        return {
            score: 70,
            emi,
            dti,
            reason:
                `Estimated DTI is ${dti.toFixed(1)}%; affordability is acceptable but not conservative.`
        };
    }

    return {
        score: 100,
        emi,
        dti,
        reason:
            `Estimated DTI is ${dti.toFixed(1)}%, within the conservative screening range.`
    };
}

/*
 * ------------------------------------------------------------
 * SOURCE CONFIDENCE
 * ------------------------------------------------------------
 */

function calculateSourceConfidence(
    loan
) {
    const score =
        Number(
            loan.verification?.verificationScore
        );

    if (
        Number.isFinite(score)
    ) {
        return {
            score: clamp(score),
            reason:
                `Official-source verification confidence is ${score}/100.`
        };
    }

    return {
        score: 0,
        reason:
            'Verification score is unavailable.'
    };
}

/*
 * ------------------------------------------------------------
 * OVERALL LOAN EVALUATION
 * ------------------------------------------------------------
 */

function evaluateLoan(
    loan,
    profile,
    candidateLoans
) {
    const amount =
        calculateAmountFit(
            loan,
            profile
        );

    const tenure =
        calculateTenureFit(
            loan,
            profile
        );

    const collateral =
        calculateCollateralFit(
            loan,
            profile
        );

    const affordability =
        calculateAffordability(
            loan,
            profile
        );

    const rate =
        calculateRateCompetitiveness(
            loan,
            candidateLoans
        );

    const credit =
        calculateCreditFit(
            profile
        );

    const source =
        calculateSourceConfidence(
            loan
        );

    const weightedScore =
        (
            amount.score *
            WEIGHTS.amountFit +

            tenure.score *
            WEIGHTS.tenureFit +

            collateral.score *
            WEIGHTS.collateralFit +

            affordability.score *
            WEIGHTS.affordability +

            rate.score *
            WEIGHTS.rateCompetitiveness +

            credit.score *
            WEIGHTS.creditFit +

            source.score *
            WEIGHTS.sourceConfidence
        ) / 100;

    const reasons = [];
    const warnings = [];

    if (amount.score >= 90) {
        reasons.push(
            amount.reason
        );
    } else {
        warnings.push(
            amount.reason
        );
    }

    if (tenure.score >= 90) {
        reasons.push(
            tenure.reason
        );
    } else {
        warnings.push(
            tenure.reason
        );
    }

    if (collateral.score >= 90) {
        reasons.push(
            collateral.reason
        );
    } else if (collateral.score < 50) {
        warnings.push(
            collateral.reason
        );
    }

    if (affordability.score >= 90) {
        reasons.push(
            affordability.reason
        );
    } else {
        warnings.push(
            affordability.reason
        );
    }

    if (rate.score >= 80) {
        reasons.push(
            rate.reason
        );
    }

    if (credit.score >= 75) {
        reasons.push(
            credit.reason
        );
    }

    if (
        source.score >= 85
    ) {
        reasons.push(
            source.reason
        );
    } else {
        warnings.push(
            source.reason
        );
    }

    /*
     * Don't let an obviously incompatible loan rank first.
     */
    const hardMismatch =
        amount.score === 0 ||
        tenure.score === 0 ||
        collateral.score === 0;

    const finalScore =
        hardMismatch
            ? Math.min(
                weightedScore,
                35
            )
            : weightedScore;

    if (
        loan.verification?.overallStatus !==
        'verified'
    ) {
        warnings.push(
            'Loan data is partially verified; final lender terms should be confirmed before application.'
        );
    }

    if (
        loan.rateDetails?.conditions?.length
    ) {
        warnings.push(
            'Displayed rate is conditional and may vary by borrower, scheme or loan characteristics.'
        );
    }

    return {
        loanId: loan._id,
        bankName: loan.bankName,
        category: loan.category,
        productName: loan.productName,

        score: Number(
            clamp(finalScore).toFixed(2)
        ),

        recommendation:
            finalScore >= 80
                ? 'strong_match'
                : finalScore >= 65
                    ? 'good_match'
                    : finalScore >= 50
                        ? 'possible_match'
                        : 'weak_match',

        interestRate: loan.interestRate,
        processingFee: loan.processingFee,

        rateDetails: {
            startingRate:
                loan.rateDetails?.startingRate ??
                null,

            minimumRate:
                loan.rateDetails?.minimumRate ??
                null,

            maximumRate:
                loan.rateDetails?.maximumRate ??
                null,

            type:
                loan.rateDetails?.type ??
                'unknown'
        },

        estimatedEmi:
            affordability.emi
                ? Number(
                    affordability.emi.toFixed(2)
                )
                : null,

        emiBasis:
            affordability.emi
                ? 'Illustration using the available starting/comparable rate; actual lender rate may differ by borrower and scheme.'
                : null,

        estimatedDti:
            affordability.dti
                ? Number(
                    affordability.dti.toFixed(2)
                )
                : null,

        componentScores: {
            amountFit:
                Number(
                    amount.score.toFixed(2)
                ),

            tenureFit:
                Number(
                    tenure.score.toFixed(2)
                ),

            collateralFit:
                Number(
                    collateral.score.toFixed(2)
                ),

            affordability:
                Number(
                    affordability.score.toFixed(2)
                ),

            rateCompetitiveness:
                Number(
                    rate.score.toFixed(2)
                ),

            creditFit:
                Number(
                    credit.score.toFixed(2)
                ),

            sourceConfidence:
                Number(
                    source.score.toFixed(2)
                )
        },

        verification: {
            status:
                loan.verification?.overallStatus ??
                'unverified',

            score:
                loan.verification?.verificationScore ??
                0,

            lastVerified:
                loan.source?.lastVerified ??
                null
        },

        reasons: reasons.slice(0, 5),
        warnings: warnings.slice(0, 5)
    };
}

/*
 * ------------------------------------------------------------
 * COMPARISON HIGHLIGHTS
 * ------------------------------------------------------------
 */

function buildComparisonHighlights(results) {
    if (!Array.isArray(results) || results.length === 0) {
        return {
            bestOverall: null,
            lowestStartingRate: null,
            bestAffordability: null
        };
    }

    /*
     * 1. BEST OVERALL
     *
     * Results are already sorted by the main comparison score.
     */
    const bestOverall =
        results[0] || null;

    /*
     * 2. LOWEST STARTING RATE
     *
     * Ignore products whose starting rate is unavailable.
     */
    const rateCandidates =
        results.filter(
            item =>
                Number.isFinite(
                    item.rateDetails?.startingRate
                ) &&
                item.rateDetails.startingRate > 0
        );

    const lowestStartingRate =
        rateCandidates.length > 0
            ? [...rateCandidates].sort(
                (a, b) =>
                    a.rateDetails.startingRate -
                    b.rateDetails.startingRate
            )[0]
            : null;

    /*
     * 3. BEST AFFORDABILITY
     *
     * Lower DTI is better.
     *
     * We only compare records where EMI/DTI
     * could actually be calculated.
     */
    const affordabilityCandidates =
        results.filter(
            item =>
                Number.isFinite(
                    item.estimatedDti
                )
        );

    const bestAffordability =
        affordabilityCandidates.length > 0
            ? [...affordabilityCandidates].sort(
                (a, b) =>
                    a.estimatedDti -
                    b.estimatedDti
            )[0]
            : null;

    return {
        bestOverall: bestOverall
            ? {
                loanId: bestOverall.loanId,
                bankName: bestOverall.bankName,
                productName: bestOverall.productName,
                score: bestOverall.score,
                label: 'Best Overall',
                reason:
                    'Highest personalized comparison score across affordability, rate, eligibility fit, tenure, collateral compatibility and source confidence.'
            }
            : null,

        lowestStartingRate:
            lowestStartingRate
                ? {
                    loanId:
                        lowestStartingRate.loanId,
                    bankName:
                        lowestStartingRate.bankName,
                    productName:
                        lowestStartingRate.productName,
                    startingRate:
                        lowestStartingRate.rateDetails.startingRate,
                    label: 'Lowest Starting Rate',
                    reason:
                        'Lowest available starting rate among the compared products with usable rate data.'
                }
                : null,

        bestAffordability:
            bestAffordability
                ? {
                    loanId:
                        bestAffordability.loanId,
                    bankName:
                        bestAffordability.bankName,
                    productName:
                        bestAffordability.productName,
                    estimatedEmi:
                        bestAffordability.estimatedEmi,
                    estimatedDti:
                        bestAffordability.estimatedDti,
                    label: 'Best Affordability',
                    reason:
                        'Lowest estimated debt-to-income ratio among the compared products.'
                }
                : null
    };
}

/*
 * ------------------------------------------------------------
 * MAIN COMPARISON FUNCTION
 * ------------------------------------------------------------
 */

export async function compareLoans({
    profile: rawProfile,
    category = null,
    limit = DEFAULT_LIMIT
}) {
    const profile =
        normalizeProfile(rawProfile);

    const selectedCategory =
        category ||
        profile.category;

    if (
        !VALID_CATEGORIES.includes(
            selectedCategory
        )
    ) {
        throw new Error(
            'category must be one of: car, education, home'
        );
    }

    if (
        !profile.desiredAmount ||
        profile.desiredAmount <= 0
    ) {
        throw new Error(
            'desiredAmount must be greater than 0'
        );
    }

    const loans =
        await LoanProduct.find({
            category: selectedCategory
        }).lean();

    if (!loans.length) {
        return {
            category: selectedCategory,
            candidateCount: 0,
            results: []
        };
    }

    /*
     * Evaluate every product against the same candidate set
     * so rate competitiveness is comparable.
     */
    const evaluations =
        loans.map(
            loan =>
                evaluateLoan(
                    loan,
                    profile,
                    loans
                )
        );

    evaluations.sort(
        (a, b) =>
            b.score - a.score
    );

    const safeLimit =
        Math.min(
            Math.max(
                Number(limit) || DEFAULT_LIMIT,
                1
            ),
            10
        );

    const results =
        evaluations.slice(
            0,
            safeLimit
        );

    const highlights =
        buildComparisonHighlights(
            results
        );

    return {
        category: selectedCategory,

        candidateCount:
            loans.length,

        returnedCount:
            results.length,

        profile: {
            desiredAmount:
                profile.desiredAmount,

            preferredTenure:
                profile.preferredTenure,

            monthlyIncome:
                profile.monthlyIncome,

            existingMonthlyObligations:
                profile.existingMonthlyObligations,

            cibilScore:
                profile.cibilScore,

            collateralAvailable:
                profile.collateralAvailable
        },

        weights: WEIGHTS,

        highlights,

        results
    };
}

export {
    calculateEmi
};