const QUERY_TEMPLATES = [
  {
    key: "experience",
    template: "{bank} {loan} experience",
    priority: 1,
  },
  {
    key: "review",
    template: "{bank} {loan} review",
    priority: 1,
  },
  {
    key: "borrower_experience",
    template: "{bank} {loan} borrower experience",
    priority: 1,
  },
  {
    key: "student_experience",
    template: "{bank} {loan} student experience",
    priority: 1,
  },
  {
    key: "branch_experience",
    template: "{bank} {loan} branch experience",
    priority: 2,
  },
  {
    key: "processing",
    template: "{bank} {loan} processing time",
    priority: 2,
  },
  {
    key: "processing_experience",
    template: "{bank} {loan} processing experience",
    priority: 2,
  },
  {
    key: "interest",
    template: "{bank} {loan} interest rate experience",
    priority: 2,
  },
  {
    key: "sanction",
    template: "{bank} {loan} sanction experience",
    priority: 2,
  },
  {
    key: "approval",
    template: "{bank} {loan} approval experience",
    priority: 2,
  },
  {
    key: "disbursement",
    template: "{bank} {loan} disbursement experience",
    priority: 2,
  },
  {
    key: "documents",
    template: "{bank} {loan} documents",
    priority: 3,
  },
  {
    key: "collateral",
    template: "{bank} {loan} collateral",
    priority: 3,
  },
  {
    key: "insurance",
    template: "{bank} {loan} insurance",
    priority: 3,
  },
  {
    key: "margin",
    template: "{bank} {loan} margin money",
    priority: 3,
  },
  {
    key: "emi",
    template: "{bank} {loan} EMI experience",
    priority: 3,
  },
  {
    key: "repayment",
    template: "{bank} {loan} repayment experience",
    priority: 3,
  },
  {
    key: "moratorium",
    template: "{bank} {loan} moratorium experience",
    priority: 3,
  },
  {
    key: "delay",
    template: "{bank} {loan} delay",
    priority: 2,
  },
  {
    key: "problems",
    template: "{bank} {loan} problems",
    priority: 2,
  },
  {
    key: "negative_experience",
    template: "{bank} {loan} bad experience",
    priority: 2,
  },
  {
    key: "positive_experience",
    template: "{bank} {loan} good experience",
    priority: 3,
  },
  {
    key: "rejection",
    template: "{bank} {loan} rejected",
    priority: 3,
  },
];

function normalizeInput(value = "") {
  return String(value)
    .replace(/\s+/g, " ")
    .trim();
}

export function buildQueries({
  bank,
  category,
  loanName,
  maxQueries = 25,
} = {}) {
  const normalizedBank =
    normalizeInput(bank);

  const normalizedLoan =
    normalizeInput(
      loanName || category || ""
    );

  if (
    !normalizedBank ||
    !normalizedLoan
  ) {
    return [];
  }

  return QUERY_TEMPLATES
    .slice(0, maxQueries)
    .map((item) => ({
      query: item.template
        .replace(
          "{bank}",
          normalizedBank
        )
        .replace(
          "{loan}",
          normalizedLoan
        ),

      key: item.key,

      priority: item.priority,

      bank: normalizedBank,

      category: category || "",

      loanName: normalizedLoan,
    }));
}

/*
---------------------------------------------------------
SOURCE-SPECIFIC QUERIES

Important:
We DO NOT append "reddit", "youtube", "quora", etc.
to the actual search text.

The collector already knows which source it is searching.
---------------------------------------------------------
*/

export function buildSourceQueries({
  bank,
  category,
  loanName,
  source,
  maxQueries = 25,
} = {}) {
  const baseQueries =
    buildQueries({
      bank,
      category,
      loanName,
      maxQueries,
    });

  const normalizedSource =
    normalizeInput(source).toLowerCase();

  return baseQueries.map(
    (item) => ({
      ...item,

      source: normalizedSource,

      query: item.query,
    })
  );
}

export function buildAllSourceQueries({
  bank,
  category,
  loanName,
  maxQueriesPerSource = 25,
} = {}) {
  const sources = [
    "reddit",
    "youtube",
    "quora",
  ];

  const result = {};

  for (const source of sources) {
    result[source] =
      buildSourceQueries({
        bank,
        category,
        loanName,
        source,
        maxQueries:
          maxQueriesPerSource,
      });
  }

  return result;
}

export function getHighPriorityQueries({
  bank,
  category,
  loanName,
} = {}) {
  return buildQueries({
    bank,
    category,
    loanName,
    maxQueries:
      QUERY_TEMPLATES.length,
  }).filter(
    (item) =>
      item.priority <= 2
  );
}

export {
  QUERY_TEMPLATES,
};