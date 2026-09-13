/*
=========================================================
FINBRIDGE RECOMMENDATION ENGINE
=========================================================

Purpose:
Rank loan products using:

1. Eligibility
2. Community Experience
3. Community Risk
4. Evidence Strength
5. Confidence

Important:
This engine does NOT perform text classification.

It consumes intelligence already calculated by:

intelligenceScore.js

=========================================================
*/


/*
=========================================================
CONFIGURATION
=========================================================
*/

/*
Recommendation weights.

Eligibility is treated separately as a hard gate.

Among eligible loans:

Loan/Product Fit       35%
Community Experience   25%
Community Risk         15%
Evidence Strength      15%
Confidence             10%
*/

const WEIGHTS = {
  productFit: 0.35,
  communityExperience: 0.25,
  communityRisk: 0.15,
  evidenceStrength: 0.15,
  confidence: 0.10,
};


/*
=========================================================
HELPERS
=========================================================
*/

function clamp(
  value,
  min = 0,
  max = 100
) {
  return Math.max(
    min,
    Math.min(
      Number(value) || 0,
      max
    )
  );
}


function round(value) {
  return Number(
    Number(value || 0).toFixed(2)
  );
}


/*
=========================================================
CONFIDENCE SCORE
=========================================================

High    = 100
Medium  = 70
Limited = 40

This prevents a poorly-supported loan from receiving
the same recommendation strength as a well-supported one.
*/

function confidenceScore(
  confidence
) {
  switch (
    String(confidence || "")
      .toLowerCase()
      .trim()
  ) {
    case "high":
      return 100;

    case "medium":
      return 70;

    case "limited":
      return 40;

    default:
      return 30;
  }
}


/*
=========================================================
COMMUNITY SCORE
=========================================================

Experience:
higher = better

Risk:
lower = better

Therefore risk is inverted:

Risk 0   → 100
Risk 100 → 0
*/

function calculateCommunityComponent(
  intelligence
) {
  const experience =
    clamp(
      intelligence?.scores
        ?.communityExperience
    );

  const risk =
    clamp(
      intelligence?.scores
        ?.communityRisk
    );

  const strength =
    clamp(
      intelligence?.scores
        ?.evidenceStrength
    );

  const confidence =
    confidenceScore(
      intelligence?.confidence
    );

  return {
    experience,
    risk,
    strength,
    confidence,
    riskAdjusted:
      100 - risk,
  };
}


/*
=========================================================
PRODUCT FIT
=========================================================

This is deliberately kept separate from community
intelligence.

The caller supplies a productFit score from the
existing eligibility / matching system.

Examples:

100 = excellent fit
80  = strong fit
60  = reasonable fit
40  = weak fit
0   = not eligible

=========================================================
*/

function normalizeProductFit(
  productFit
) {
  return clamp(
    productFit
  );
}


/*
=========================================================
RECOMMENDATION SCORE
=========================================================
*/

function calculateRecommendationScore({
  productFit,
  intelligence,
}) {
  const community =
    calculateCommunityComponent(
      intelligence
    );

  const fit =
    normalizeProductFit(
      productFit
    );

  const score =
    fit *
      WEIGHTS.productFit +

    community.experience *
      WEIGHTS.communityExperience +

    community.riskAdjusted *
      WEIGHTS.communityRisk +

    community.strength *
      WEIGHTS.evidenceStrength +

    community.confidence *
      WEIGHTS.confidence;

  return round(score);
}


/*
=========================================================
EXPLANATION GENERATOR
=========================================================

This is important for FinBridge.

The UI should be able to explain WHY a loan was
recommended instead of showing only a number.
*/

function generateReasons({
  productFit,
  intelligence,
}) {
  const reasons = [];

  const community =
    calculateCommunityComponent(
      intelligence
    );

  /*
  Product fit
  */

  if (productFit >= 85) {
    reasons.push(
      "Strong match with your eligibility and loan requirements."
    );
  } else if (productFit >= 70) {
    reasons.push(
      "Good match with your eligibility and loan requirements."
    );
  } else if (productFit >= 50) {
    reasons.push(
      "Moderate match with your requirements."
    );
  }


  /*
  Community experience
  */

  if (
    community.experience >= 75
  ) {
    reasons.push(
      "Borrower/community experience is strongly positive."
    );
  } else if (
    community.experience >= 60
  ) {
    reasons.push(
      "Community experience is generally positive."
    );
  }


  /*
  Community risk
  */

  if (
    community.risk <= 20
  ) {
    reasons.push(
      "Low community-reported risk signals."
    );
  } else if (
    community.risk <= 40
  ) {
    reasons.push(
      "Community-reported risk signals are moderate."
    );
  } else {
    reasons.push(
      "Community evidence contains notable risk signals."
    );
  }


  /*
  Evidence strength
  */

  if (
    community.strength >= 75
  ) {
    reasons.push(
      "Recommendation is supported by strong evidence."
    );
  } else if (
    community.strength >= 50
  ) {
    reasons.push(
      "Recommendation has moderate evidence support."
    );
  } else {
    reasons.push(
      "Evidence coverage is limited."
    );
  }


  /*
  Confidence
  */

  if (
    intelligence?.confidence === "High"
  ) {
    reasons.push(
      "High confidence in the available community evidence."
    );
  } else if (
    intelligence?.confidence === "Medium"
  ) {
    reasons.push(
      "Moderate confidence in the available community evidence."
    );
  } else {
    reasons.push(
      "Limited community evidence is available."
    );
  }

  return reasons;
}


/*
=========================================================
SINGLE LOAN RECOMMENDATION
=========================================================
*/

export function scoreLoanRecommendation({
  loan,
  productFit = 0,
  intelligence,
}) {
  if (!loan) {
    throw new Error(
      "loan is required"
    );
  }

  if (!intelligence) {
    throw new Error(
      "intelligence is required"
    );
  }


  /*
  Eligibility gate.

  A loan that the user cannot obtain should not
  compete with eligible loans.
  */

  const eligible =
    productFit > 0;


  if (!eligible) {
    return {
      loanProductId:
        loan._id ||
        loan.loanProductId,

      name:
        loan.name ||
        loan.productName ||
        "Unknown Loan",

      eligible: false,

      recommendationScore: 0,

      productFit: 0,

      intelligence: {
        communityExperience:
          intelligence.scores
            ?.communityExperience || 0,

        communityRisk:
          intelligence.scores
            ?.communityRisk || 0,

        evidenceStrength:
          intelligence.scores
            ?.evidenceStrength || 0,

        confidence:
          intelligence.confidence ||
          "Limited",
      },

      reasons: [
        "Loan does not currently match the user's eligibility requirements.",
      ],
    };
  }


  /*
  Calculate recommendation score.
  */

  const recommendationScore =
    calculateRecommendationScore({
      productFit,
      intelligence,
    });


  /*
  Build explanation.
  */

  const reasons =
    generateReasons({
      productFit,
      intelligence,
    });


  /*
  Final recommendation object.
  */

  return {
    loanProductId:
      loan._id ||
      loan.loanProductId,

    name:
      loan.name ||
      loan.productName ||
      "Unknown Loan",

    bank:
      loan.bank ||
      loan.bankName ||
      loan.provider ||
      null,

    category:
      loan.category ||
      loan.loanType ||
      null,

    eligible: true,

    recommendationScore,

    productFit:
      round(productFit),

    intelligence: {
      communityExperience:
        round(
          intelligence.scores
            ?.communityExperience
        ),

      communityRisk:
        round(
          intelligence.scores
            ?.communityRisk
        ),

      evidenceStrength:
        round(
          intelligence.scores
            ?.evidenceStrength
        ),

      confidence:
        intelligence.confidence ||
        "Limited",

      evidenceCount:
        intelligence.evidenceCount ||
        0,

      sourceDiversity:
        intelligence.sourceDiversity ||
        0,
    },

    reasons,
  };
}


/*
=========================================================
RANK LOANS
=========================================================
*/

export function rankLoans({
  loans = [],
  intelligenceResults = [],
  productFits = {},
}) {
  const intelligenceMap =
    new Map();

  /*
  Convert intelligence array into
  quick lookup map.
  */

  for (
    const intelligence
    of intelligenceResults
  ) {
    const id =
      String(
        intelligence.loanProductId
      );

    intelligenceMap.set(
      id,
      intelligence
    );
  }


  const ranked = [];


  /*
  Score every loan.
  */

  for (
    const loan
    of loans
  ) {
    const loanId =
      String(
        loan._id ||
        loan.loanProductId
      );

    const intelligence =
      intelligenceMap.get(
        loanId
      );

    /*
    If there is no community intelligence,
    create a safe fallback.
    */

    if (!intelligence) {
      continue;
    }


    /*
    Product fit should be supplied by the
    existing eligibility engine.
    */

    const productFit =
      Number(
        productFits[loanId] || 0
      );


    const recommendation =
      scoreLoanRecommendation({
        loan,
        productFit,
        intelligence,
      });


    ranked.push(
      recommendation
    );
  }


  /*
  Highest score first.
  */

  ranked.sort(
    (a, b) =>
      b.recommendationScore -
      a.recommendationScore
  );


  /*
  Add ranking position.
  */

  return ranked.map(
    (item, index) => ({
      rank: index + 1,
      ...item,
    })
  );
}


/*
=========================================================
EXPORT WEIGHTS
=========================================================
*/

export {
  WEIGHTS,
};