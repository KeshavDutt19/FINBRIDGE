import {
  scoreLoanRecommendation,
  rankLoans,
} from "./recommendationEngine.js";


/*
=========================================================
TEST DATA
=========================================================
*/

const testLoan = {
  _id: "loan-001",
  name: "SBI Education Loan",
  bank: "State Bank of India",
  category: "Education Loan",
};


/*
This represents the output from intelligenceScore.js.
*/

const testIntelligence = {
  loanProductId: "loan-001",

  scores: {
    communityExperience: 82,
    communityRisk: 18,
    evidenceStrength: 86,
  },

  confidence: "High",

  evidenceCount: 47,

  sourceDiversity: 2,

  sources: {
    youtube: 32,
    reddit: 15,
  },

  topics: {
    processing: {
      count: 10,
      weightedVolume: 7.2,
      negativeCount: 2,
      neutralCount: 4,
      positiveCount: 4,
      riskScore: 18,
    },

    repayment: {
      count: 7,
      weightedVolume: 5.4,
      negativeCount: 1,
      neutralCount: 3,
      positiveCount: 3,
      riskScore: 14,
    },
  },
};


/*
=========================================================
TEST 1
SINGLE LOAN
=========================================================
*/

console.log(
  "\n============================================"
);

console.log(
  "TEST 1 — SINGLE LOAN RECOMMENDATION"
);

console.log(
  "============================================\n"
);


const recommendation =
  scoreLoanRecommendation({
    loan: testLoan,

    productFit: 95,

    intelligence:
      testIntelligence,
  });


console.log(
  JSON.stringify(
    recommendation,
    null,
    2
  )
);


/*
=========================================================
TEST 2
MULTIPLE LOANS
=========================================================
*/

console.log(
  "\n============================================"
);

console.log(
  "TEST 2 — LOAN RANKING"
);

console.log(
  "============================================\n"
);


const loans = [
  {
    _id: "loan-001",
    name: "SBI Education Loan",
    bank: "State Bank of India",
    category: "Education Loan",
  },

  {
    _id: "loan-002",
    name: "Bank of Baroda Education Loan",
    bank: "Bank of Baroda",
    category: "Education Loan",
  },

  {
    _id: "loan-003",
    name: "PNB Education Loan",
    bank: "Punjab National Bank",
    category: "Education Loan",
  },
];


const intelligenceResults = [
  {
    loanProductId: "loan-001",

    scores: {
      communityExperience: 82,
      communityRisk: 18,
      evidenceStrength: 86,
    },

    confidence: "High",

    evidenceCount: 47,

    sourceDiversity: 2,
  },

  {
    loanProductId: "loan-002",

    scores: {
      communityExperience: 74,
      communityRisk: 27,
      evidenceStrength: 79,
    },

    confidence: "High",

    evidenceCount: 35,

    sourceDiversity: 2,
  },

  {
    loanProductId: "loan-003",

    scores: {
      communityExperience: 68,
      communityRisk: 35,
      evidenceStrength: 65,
    },

    confidence: "Medium",

    evidenceCount: 18,

    sourceDiversity: 2,
  },
];


/*
Product fit comes from the EXISTING eligibility /
matching system.

For this test, we are manually supplying values.
*/

const productFits = {
  "loan-001": 95,
  "loan-002": 88,
  "loan-003": 80,
};


const ranked =
  rankLoans({
    loans,

    intelligenceResults,

    productFits,
  });


console.log(
  JSON.stringify(
    ranked,
    null,
    2
  )
);


/*
=========================================================
SIMPLE SUMMARY
=========================================================
*/

console.log(
  "\n============================================"
);

console.log(
  "RANKING SUMMARY"
);

console.log(
  "============================================\n"
);


for (
  const loan
  of ranked
) {
  console.log(
    `${loan.rank}. ${loan.name}`
  );

  console.log(
    `   Recommendation Score: ${loan.recommendationScore}`
  );

  console.log(
    `   Product Fit: ${loan.productFit}`
  );

  console.log(
    `   Community Experience: ${loan.intelligence.communityExperience}`
  );

  console.log(
    `   Community Risk: ${loan.intelligence.communityRisk}`
  );

  console.log(
    `   Evidence Strength: ${loan.intelligence.evidenceStrength}`
  );

  console.log(
    `   Confidence: ${loan.intelligence.confidence}`
  );

  console.log();
}

/*
=========================================================
TEST 3
INELIGIBLE LOAN
=========================================================
*/

console.log(
  "\n============================================"
);

console.log(
  "TEST 3 — INELIGIBLE LOAN"
);

console.log(
  "============================================\n"
);

const ineligible =
  scoreLoanRecommendation({
    loan: testLoan,

    productFit: 0,

    intelligence:
      testIntelligence,
  });

console.log(
  JSON.stringify(
    ineligible,
    null,
    2
  )
);