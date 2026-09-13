/*
=========================================================
FINBRIDGE LOAN ELIGIBILITY + PRODUCT FIT ENGINE
=========================================================

Purpose:
Evaluate how well a user's profile matches a LoanProduct.

Important:
This engine does NOT pretend that free-text lender rules
are fully machine-readable.

Each criterion is classified as:

PASS
FAIL
UNKNOWN

Reliable structured fields are evaluated deterministically.

Free-text lender criteria are treated as UNKNOWN unless
we can safely extract a concrete rule.

=========================================================
*/


/*
=========================================================
SCORING CONFIGURATION
=========================================================
*/

const WEIGHTS = {
  category: 30,
  amount: 25,
  tenure: 15,
  age: 10,
  loanType: 20,
};


/*
=========================================================
HELPERS
=========================================================
*/


function normalize(value = "") {
  return String(value)
    .toLowerCase()
    .trim();
}


function round(value) {
  return Number(
    Number(value || 0).toFixed(2)
  );
}


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


/*
Convert values such as:

education
Education Loan
EDUCATION

into a common category.
*/

function normalizeLoanCategory(
  value
) {
  const text =
    normalize(value);

  if (
    text.includes("education")
  ) {
    return "education";
  }

  if (
    text.includes("car") ||
    text.includes("vehicle")
  ) {
    return "car";
  }

  if (
    text.includes("home") ||
    text.includes("housing")
  ) {
    return "home";
  }

  return text;
}


/*
=========================================================
GENERIC RESULT OBJECT
=========================================================
*/

function criterionResult({
  name,
  status,
  score,
  reason,
}) {
  return {
    name,
    status,
    score,
    reason,
  };
}


/*
=========================================================
CATEGORY CHECK
=========================================================

Category is one of our strongest structured checks.

Example:

user.loanType = "education"
loan.category = "education"

=> PASS
*/

function checkCategory(
  profile,
  loan
) {
  const userCategory =
    normalizeLoanCategory(
      profile.loanType ||
      profile.category
    );

  const loanCategory =
    normalizeLoanCategory(
      loan.category
    );

  if (!userCategory) {
    return criterionResult({
      name: "category",
      status: "UNKNOWN",
      score: 0,
      reason:
        "User loan category/type was not provided.",
    });
  }

  if (!loanCategory) {
    return criterionResult({
      name: "category",
      status: "UNKNOWN",
      score: 0,
      reason:
        "Loan product category is missing.",
    });
  }

  if (
    userCategory ===
    loanCategory
  ) {
    return criterionResult({
      name: "category",
      status: "PASS",
      score: 100,
      reason:
        `Loan category matches: ${loanCategory}.`,
    });
  }

  return criterionResult({
    name: "category",
    status: "FAIL",
    score: 0,
    reason:
      `User requested ${userCategory}, but this product is ${loanCategory}.`,
  });
}


/*
=========================================================
LOAN TYPE CHECK
=========================================================

Kept separately because profile.loanType is explicitly
available in User.profile.

This becomes a second supporting signal.

If unavailable, we don't penalize it.
*/

function checkLoanType(
  profile,
  loan
) {
  const requested =
    normalizeLoanCategory(
      profile.loanType
    );

  const product =
    normalizeLoanCategory(
      loan.category
    );

  if (!requested) {
    return criterionResult({
      name: "loanType",
      status: "UNKNOWN",
      score: 0,
      reason:
        "User did not specify a loan type.",
    });
  }

  if (
    requested === product
  ) {
    return criterionResult({
      name: "loanType",
      status: "PASS",
      score: 100,
      reason:
        "Requested loan type matches the product.",
    });
  }

  return criterionResult({
    name: "loanType",
    status: "FAIL",
    score: 0,
    reason:
      "Requested loan type does not match the product.",
  });
}


/*
=========================================================
AMOUNT CHECK
=========================================================

LoanProduct contains:

loanAmountMin
loanAmountMax

User contains:

desiredAmount

This is one of the strongest deterministic checks.
*/

function checkAmount(
  profile,
  loan
) {
  const desired =
    Number(
      profile.desiredAmount
    );

  const minimum =
    Number(
      loan.loanAmountMin
    );

  const maximum =
    Number(
      loan.loanAmountMax
    );

  /*
  Missing user amount.
  */

  if (
    !Number.isFinite(
      desired
    )
  ) {
    return criterionResult({
      name: "amount",
      status: "UNKNOWN",
      score: 0,
      reason:
        "User desired loan amount was not provided.",
    });
  }


  /*
  Missing loan range.
  */

  if (
    !Number.isFinite(
      minimum
    ) &&
    !Number.isFinite(
      maximum
    )
  ) {
    return criterionResult({
      name: "amount",
      status: "UNKNOWN",
      score: 0,
      reason:
        "Loan amount range is not available.",
    });
  }


  /*
  Below minimum.
  */

  if (
    Number.isFinite(minimum) &&
    desired < minimum
  ) {
    return criterionResult({
      name: "amount",
      status: "FAIL",
      score: 0,
      reason:
        `Requested amount INR ${desired.toLocaleString("en-IN")} is below the product minimum of INR ${minimum.toLocaleString("en-IN")}.`,
    });
  }


  /*
  Above maximum.
  */

  if (
    Number.isFinite(maximum) &&
    desired > maximum
  ) {
    return criterionResult({
      name: "amount",
      status: "FAIL",
      score: 0,
      reason:
        `Requested amount INR ${desired.toLocaleString("en-IN")} exceeds the product maximum of INR ${maximum.toLocaleString("en-IN")}.`,
    });
  }


  /*
  Fits inside the range.
  */

  return criterionResult({
    name: "amount",
    status: "PASS",
    score: 100,
    reason:
      "Requested amount is within the product's stated range.",
  });
}


/*
=========================================================
TENURE CHECK
=========================================================

User:
preferredTenure

Loan:
tenureMin
tenureMax

Units are assumed to be months because the seed data
extracts preferred_tenure_range_months.
*/

function checkTenure(
  profile,
  loan
) {
  const requested =
    Number(
      profile.preferredTenure
    );

  const minimum =
    Number(
      loan.tenureMin
    );

  const maximum =
    Number(
      loan.tenureMax
    );


  if (
    !Number.isFinite(
      requested
    )
  ) {
    return criterionResult({
      name: "tenure",
      status: "UNKNOWN",
      score: 0,
      reason:
        "Preferred tenure was not provided.",
    });
  }


  if (
    !Number.isFinite(minimum) &&
    !Number.isFinite(maximum)
  ) {
    return criterionResult({
      name: "tenure",
      status: "UNKNOWN",
      score: 0,
      reason:
        "Loan tenure range is not available.",
    });
  }


  if (
    Number.isFinite(minimum) &&
    requested < minimum
  ) {
    return criterionResult({
      name: "tenure",
      status: "FAIL",
      score: 0,
      reason:
        `Requested tenure ${requested} months is below the product minimum of ${minimum} months.`,
    });
  }


  if (
    Number.isFinite(maximum) &&
    requested > maximum
  ) {
    return criterionResult({
      name: "tenure",
      status: "FAIL",
      score: 0,
      reason:
        `Requested tenure ${requested} months exceeds the product maximum of ${maximum} months.`,
    });
  }


  return criterionResult({
    name: "tenure",
    status: "PASS",
    score: 100,
    reason:
      "Preferred tenure is within the product's stated range.",
  });
}


/*
=========================================================
AGE CHECK
=========================================================

ageCriteria is currently free text.

We only evaluate it if we can safely extract a simple
numeric maximum/minimum.

Examples we can understand:

"Age 18-60"
"18 to 60 years"
"Minimum age 18"
"Maximum age 65"

Anything else becomes UNKNOWN.
*/

function extractAgeRange(
  text = ""
) {
  const normalized =
    normalize(text);

  if (!normalized) {
    return null;
  }

  /*
  Range:

  18-60
  18 to 60
  18 years to 60 years
  */

  const rangeMatch =
    normalized.match(
      /(\d{2})\s*(?:-|to)\s*(\d{2})/
    );

  if (rangeMatch) {
    return {
      min: Number(
        rangeMatch[1]
      ),

      max: Number(
        rangeMatch[2]
      ),
    };
  }


  /*
  Minimum age
  */

  const minimumMatch =
    normalized.match(
      /(?:minimum|min|above)\s*(?:age)?\s*(\d{2})/
    );

  if (minimumMatch) {
    return {
      min: Number(
        minimumMatch[1]
      ),
      max: undefined,
    };
  }


  /*
  Maximum age
  */

  const maximumMatch =
    normalized.match(
      /(?:maximum|max|below|up to)\s*(?:age)?\s*(\d{2})/
    );

  if (maximumMatch) {
    return {
      min: undefined,
      max: Number(
        maximumMatch[1]
      ),
    };
  }


  return null;
}


function checkAge(
  profile,
  loan
) {
  const age =
    Number(
      profile.age
    );

  const criteria =
    extractAgeRange(
      loan.ageCriteria
    );

  if (
    !Number.isFinite(age)
  ) {
    return criterionResult({
      name: "age",
      status: "UNKNOWN",
      score: 0,
      reason:
        "User age was not provided.",
    });
  }

  if (!criteria) {
    return criterionResult({
      name: "age",
      status: "UNKNOWN",
      score: 0,
      reason:
        "Loan age criteria cannot be safely interpreted from the stored text.",
    });
  }


  if (
    Number.isFinite(
      criteria.min
    ) &&
    age < criteria.min
  ) {
    return criterionResult({
      name: "age",
      status: "FAIL",
      score: 0,
      reason:
        `User age ${age} is below the product minimum age of ${criteria.min}.`,
    });
  }


  if (
    Number.isFinite(
      criteria.max
    ) &&
    age > criteria.max
  ) {
    return criterionResult({
      name: "age",
      status: "FAIL",
      score: 0,
      reason:
        `User age ${age} exceeds the product maximum age of ${criteria.max}.`,
    });
  }


  return criterionResult({
    name: "age",
    status: "PASS",
    score: 100,
    reason:
      "User age satisfies the interpreted age criteria.",
  });
}


/*
=========================================================
TEXT CRITERIA
=========================================================

We deliberately do NOT turn free-text:

"See official lender eligibility criteria"

into a PASS.

For now these are surfaced as UNKNOWN.

This keeps the engine honest.
*/

function getUnknownTextCriteria(
  loan
) {
  const criteria = [];

  if (
    loan.eligibility
  ) {
    criteria.push({
      field: "eligibility",
      value:
        loan.eligibility,
    });
  }

  if (
    loan.incomeCriteria
  ) {
    criteria.push({
      field: "incomeCriteria",
      value:
        loan.incomeCriteria,
    });
  }

  if (
    loan.collateralRequired
  ) {
    criteria.push({
      field: "collateralRequired",
      value:
        loan.collateralRequired,
    });
  }

  return criteria;
}


/*
=========================================================
PRODUCT FIT
=========================================================

Only criteria that we can evaluate reliably contribute
to the score.

UNKNOWN criteria do not automatically reduce the score.

This avoids punishing products merely because the current
dataset doesn't contain machine-readable rules.
*/

function calculateProductFit({
  category,
  loanType,
  amount,
  tenure,
  age,
}) {
  const checks = {
    category,
    loanType,
    amount,
    tenure,
    age,
  };


  let weightedScore = 0;
  let activeWeight = 0;


  for (
    const [key, result]
    of Object.entries(checks)
  ) {
    if (
      result.status === "UNKNOWN"
    ) {
      continue;
    }

    const weight =
      WEIGHTS[key];

    weightedScore +=
      result.score *
      weight;

    activeWeight +=
      weight;
  }


  /*
  If nothing was evaluated,
  we cannot claim fit.
  */

  if (
    activeWeight === 0
  ) {
    return 0;
  }


  /*
  Re-normalize based only on
  known criteria.

  This is important because
  unknown fields shouldn't
  artificially decrease fit.
  */

  return round(
    weightedScore /
    activeWeight
  );
}


/*
=========================================================
FINAL ELIGIBILITY DECISION
=========================================================

Hard failures:

category mismatch
loan type mismatch
amount outside range
tenure outside range
age outside interpretable range

UNKNOWN does not equal FAIL.
*/

function determineEligibility(
  checks
) {
  const hardFailures =
    Object.values(
      checks
    ).filter(
      (item) =>
        item.status ===
        "FAIL"
    );

  if (
    hardFailures.length > 0
  ) {
    return false;
  }

  return true;
}


/*
=========================================================
MAIN FUNCTION
=========================================================
*/

export function evaluateLoanEligibility({
  profile = {},
  loan,
} = {}) {
  if (!loan) {
    throw new Error(
      "loan is required"
    );
  }


  /*
  Run deterministic checks.
  */

  const category =
    checkCategory(
      profile,
      loan
    );

  const loanType =
    checkLoanType(
      profile,
      loan
    );

  const amount =
    checkAmount(
      profile,
      loan
    );

  const tenure =
    checkTenure(
      profile,
      loan
    );

  const age =
    checkAge(
      profile,
      loan
    );


  const checks = {
    category,
    loanType,
    amount,
    tenure,
    age,
  };


  /*
  Determine final status.
  */

  const eligible =
    determineEligibility(
      checks
    );


  /*
  Calculate product fit.
  */

  const productFit =
    calculateProductFit({
      category,
      loanType,
      amount,
      tenure,
      age,
    });


  /*
  Convert checks into human-readable
  matched / failed / unknown arrays.
  */

  const matchedCriteria = [];

  const failedCriteria = [];

  const unknownCriteria = [];


  for (
    const result
    of Object.values(
      checks
    )
  ) {
    if (
      result.status ===
      "PASS"
    ) {
      matchedCriteria.push(
        result.reason
      );
    }

    if (
      result.status ===
      "FAIL"
    ) {
      failedCriteria.push(
        result.reason
      );
    }

    if (
      result.status ===
      "UNKNOWN"
    ) {
      unknownCriteria.push(
        result.reason
      );
    }
  }


  /*
  Free-text rules that still need
  lender-specific interpretation.
  */

  const textCriteria =
    getUnknownTextCriteria(
      loan
    );


  /*
  Build final response.
  */

  return {
    loanProductId:
      loan._id ||
      loan.loanProductId,

    bankName:
      loan.bankName ||
      null,

    productName:
      loan.productName ||
      null,

    category:
      loan.category ||
      null,

    eligible,

    productFit:

      /*
      Never let an ineligible
      product have a positive fit
      that can accidentally be
      recommended.
      */

      eligible
        ? clamp(
            productFit
          )
        : 0,

    checks,

    matchedCriteria,

    failedCriteria,

    unknownCriteria,

    lenderTextCriteria:
      textCriteria,

    summary: {
      passed:
        matchedCriteria.length,

      failed:
        failedCriteria.length,

      unknown:
        unknownCriteria.length +
        textCriteria.length,
    },
  };
}


/*
=========================================================
BATCH EVALUATION
=========================================================
*/

export function evaluateLoans({
  profile = {},
  loans = [],
} = {}) {
  if (
    !Array.isArray(loans)
  ) {
    throw new Error(
      "loans must be an array"
    );
  }


  return loans.map(
    (loan) =>
      evaluateLoanEligibility({
        profile,
        loan,
      })
  );
}


/*
=========================================================
FILTER ELIGIBLE LOANS
=========================================================
*/

export function getEligibleLoans({
  profile = {},
  loans = [],
} = {}) {
  return evaluateLoans({
    profile,
    loans,
  }).filter(
    (result) =>
      result.eligible
  );
}


/*
=========================================================
EXPORT CONFIGURATION
=========================================================
*/

export {
  WEIGHTS,
};