import LoanProduct from "../../models/LoanProduct.js";

import {
  evaluateLoanEligibility,
} from "./loanEligibilityEngine.js";

import {
  calculateAllIntelligenceScores,
} from "./intelligenceScore.js";

import {
  rankLoans,
} from "./recommendationEngine.js";


export async function generateLoanRecommendations({
  profile,
  category = null,
  limit = 10,
}) {

  // --------------------------------------------------
  // 1. LOAD LOAN PRODUCTS
  // --------------------------------------------------

  const filter = {};

  if (category) {
    filter.category = category;
  }

  const loans = await LoanProduct
    .find(filter)
    .sort({
      category: 1,
      bankName: 1,
    })
    .lean();


  if (!loans.length) {
    return {
      profile,
      totalLoansConsidered: 0,
      eligibleLoanCount: 0,
      recommendations: [],
    };
  }


  // --------------------------------------------------
  // 2. CHECK ELIGIBILITY
  // --------------------------------------------------

  const eligibilityResults = loans.map((loan) =>
    evaluateLoanEligibility({
      profile,
      loan,
    })
  );


  const eligibleLoans = eligibilityResults.filter(
    (item) => item.eligible
  );


  // --------------------------------------------------
  // 3. RETURN EARLY IF NOTHING IS ELIGIBLE
  // --------------------------------------------------

  if (!eligibleLoans.length) {
    return {
      profile,
      totalLoansConsidered: loans.length,
      eligibleLoanCount: 0,
      recommendations: [],
      eligibilityResults,
    };
  }


  // --------------------------------------------------
  // 4. CREATE ELIGIBILITY LOOKUP
  // --------------------------------------------------

  const eligibilityMap = new Map();

  for (const item of eligibilityResults) {
    eligibilityMap.set(
      String(item.loanProductId),
      item
    );
  }


  // --------------------------------------------------
  // 5. GET ELIGIBLE LOAN IDS
  // --------------------------------------------------

  const eligibleLoanIds = new Set(
    eligibleLoans.map(
      (item) => String(item.loanProductId)
    )
  );


  // --------------------------------------------------
  // 6. LOAD COMMUNITY INTELLIGENCE
  // --------------------------------------------------

  const intelligenceResults =
    await calculateAllIntelligenceScores();


  // --------------------------------------------------
  // 7. KEEP ONLY ELIGIBLE LOAN INTELLIGENCE
  // --------------------------------------------------

  const eligibleIntelligence =
    intelligenceResults.filter(
      (item) =>
        eligibleLoanIds.has(
          String(item.loanProductId)
        )
    );


  // --------------------------------------------------
  // 8. CREATE PRODUCT FIT MAP
  // --------------------------------------------------

  const productFits = {};

  for (const item of eligibleLoans) {
    productFits[String(item.loanProductId)] =
      item.productFit;
  }


  // --------------------------------------------------
  // 9. GET ELIGIBLE LOAN DOCUMENTS
  // --------------------------------------------------

  const eligibleLoanDocuments =
    loans.filter((loan) =>
      eligibleLoanIds.has(
        String(loan._id)
      )
    );


  // --------------------------------------------------
  // 10. RANK LOANS
  // --------------------------------------------------

  const ranked = rankLoans({
    loans: eligibleLoanDocuments,
    intelligenceResults: eligibleIntelligence,
    productFits,
  });


  // --------------------------------------------------
  // 11. ADD ELIGIBILITY DETAILS
  // --------------------------------------------------

  const recommendations = ranked
  .slice(0, limit)
  .map((recommendation) => {

    const loanId =
      String(recommendation.loanProductId);

    const eligibility =
      eligibilityMap.get(loanId);

    return {
      rank:
        recommendation.rank,

      loanProductId:
        recommendation.loanProductId,

      bankName:
        recommendation.bank,

      productName:
        recommendation.name,

      category:
        recommendation.category,

      recommendationScore:
        recommendation.recommendationScore,

      eligible:
        recommendation.eligible,

      productFit:
        recommendation.productFit,

      communityExperience:
        recommendation.intelligence?.communityExperience ?? null,

      communityRisk:
        recommendation.intelligence?.communityRisk ?? null,

      evidenceStrength:
        recommendation.intelligence?.evidenceStrength ?? null,

      confidence:
        recommendation.intelligence?.confidence ?? "Limited",

      evidenceCount:
        recommendation.intelligence?.evidenceCount ?? 0,

      sourceDiversity:
        recommendation.intelligence?.sourceDiversity ?? 0,

      explanations:
        recommendation.reasons ?? [],

      matchedCriteria:
        eligibility?.matchedCriteria ?? [],

      failedCriteria:
        eligibility?.failedCriteria ?? [],

      unknownCriteria:
        eligibility?.unknownCriteria ?? [],
    };
  });


  // --------------------------------------------------
  // 12. FINAL RESPONSE
  // --------------------------------------------------

  return {
    profile,

    totalLoansConsidered:
      loans.length,

    eligibleLoanCount:
      eligibleLoans.length,

    recommendations,

    eligibilityResults,
  };
}