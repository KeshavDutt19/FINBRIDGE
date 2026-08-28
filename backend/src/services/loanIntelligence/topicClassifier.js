/*
=========================================================
TOPIC CLASSIFIER
=========================================================

Designed for real-world community text including:

- English
- Hinglish
- Informal language
- Common spelling mistakes
- Student questions
- Short YouTube comments

=========================================================
*/

const TOPIC_KEYWORDS = {
  interest_rate: [
    "interest",
    "interest rate",
    "interest rates",
    "rate of interest",
    "roi",
    "floating rate",
    "fixed rate",
    "interest percentage",
  ],

  processing: [
    "processing",
    "processing fee",
    "processing time",
    "process",
    "loan process",
    "application process",
  ],

  branch: [
    "branch",
    "branch manager",
    "bank branch",
    "branch office",
    "chennai branch",
    "delhi branch",
    "visited the branch",
    "visit branch",
  ],

  insurance: [
    "insurance",
    "loan insurance",
    "life insurance",
    "insurance policy",
    "insurance charge",
  ],

  sanction: [
    "sanction",
    "sanctioned",
    "sanction letter",
    "loan sanction",
    "sanction process",
  ],

  disbursement: [
    "disbursement",
    "disbursed",
    "loan disbursed",
    "amount released",
    "funds released",
    "loan released",
  ],

  documents: [
    "document",
    "documents",
    "documentation",
    "paperwork",
    "income proof",
    "proof of income",
    "required documents",
    "papers required",
  ],

  collateral: [
    "collateral",
    "security",
    "security required",
    "property",
    "property security",
    "guarantor",
    "mortgage",
    "non collateral",
    "non-collateral",
    "without collateral",
  ],

  margin: [
    "margin",
    "margin money",
    "own contribution",
    "self contribution",
    "contribution",
  ],

  emi: [
    "emi",
    "monthly emi",
    "monthly installment",
    "installment",
    "monthly payment",
  ],

  repayment: [
    "repayment",
    "repay",
    "repaying",
    "prepayment",
    "part payment",
    "moratorium",
    "moratorium period",
  ],

  staff: [
    "staff",
    "bank staff",
    "employee",
    "bank employee",
    "manager",
    "customer service",
    "customer care",
  ],

  delay: [
    "delay",
    "delayed",
    "waiting",
    "waited",
    "took too long",
    "slow",
    "late",
    "weeks",
    "months",
  ],

  approval: [
    "approval",
    "approved",
    "rejected",
    "rejection",
    "loan approved",
    "loan rejected",
    "application rejected",
  ],

  eligibility: [
    "eligible",
    "eligibility",
    "can i get",
    "can i take",
    "is it possible",
    "do i qualify",
    "qualification",
    "qualify",
    "eligible for",
  ],

  course_eligibility: [
    "online degree",
    "online course",
    "distance education",
    "distance course",
    "acca",
    "mbbs",
    "pilot training",
    "abroad",
    "foreign university",
    "university",
    "college",
    "course",
  ],
};


/*
=========================================================
TEXT NORMALIZATION
=========================================================
*/

function normalizeText(text = "") {
  return String(text)
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s?₹.-]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}


/*
=========================================================
SIMPLE SPELLING NORMALIZATION
=========================================================

Handles common loan-related mistakes found in social
media comments.

=========================================================
*/

function normalizeCommonMistakes(text) {
  return text
    .replace(/\blone\b/g, "loan")
    .replace(/\bloans\b/g, "loan")
    .replace(/\bbroda\b/g, "baroda")
    .replace(/\bbaroda\b/g, "bank of baroda")
    .replace(/\binterset\b/g, "interest")
    .replace(/\bintrest\b/g, "interest")
    .replace(/\bproces\b/g, "process")
    .replace(/\bprocesing\b/g, "processing")
    .replace(/\bdissbursement\b/g, "disbursement")
    .replace(/\bsanctioned\b/g, "sanctioned");
}


/*
=========================================================
PREPARE TEXT
=========================================================
*/

function prepareText(text = "") {
  return normalizeCommonMistakes(
    normalizeText(text)
  );
}


/*
=========================================================
CLASSIFY SINGLE TOPIC
=========================================================
*/

export function classifyTopic(text = "") {
  const normalized =
    prepareText(text);

  if (!normalized) {
    return {
      topic: "other",
      matchCount: 0,
      matchedKeywords: [],
    };
  }

  let bestTopic = "other";
  let bestMatchCount = 0;
  let bestMatches = [];

  for (
    const [topic, keywords] of
    Object.entries(TOPIC_KEYWORDS)
  ) {
    const matches =
      keywords.filter((keyword) =>
        normalized.includes(
          keyword.toLowerCase()
        )
      );

    if (
      matches.length >
      bestMatchCount
    ) {
      bestTopic = topic;
      bestMatchCount =
        matches.length;
      bestMatches = matches;
    }
  }

  /*
  Questions about "can I get a loan",
  eligibility, or courses should not
  automatically become "other".
  */

  if (
    bestTopic === "other" &&
    (
      normalized.includes("loan") ||
      normalized.includes("education")
    )
  ) {
    bestTopic = "general";
  }

  return {
    topic: bestTopic,
    matchCount: bestMatchCount,
    matchedKeywords: bestMatches,
  };
}


/*
=========================================================
CLASSIFY MULTIPLE TOPICS
=========================================================
*/

export function classifyMultipleTopics(
  text = ""
) {
  const normalized =
    prepareText(text);

  if (!normalized) {
    return [];
  }

  const results = [];

  for (
    const [topic, keywords] of
    Object.entries(TOPIC_KEYWORDS)
  ) {
    const matches =
      keywords.filter((keyword) =>
        normalized.includes(
          keyword.toLowerCase()
        )
      );

    if (matches.length > 0) {
      results.push({
        topic,
        matchCount: matches.length,
        matchedKeywords: matches,
      });
    }
  }

  return results.sort(
    (a, b) =>
      b.matchCount -
      a.matchCount
  );
}


/*
=========================================================
EXPORT KEYWORDS
=========================================================
*/

export {
  TOPIC_KEYWORDS,
};