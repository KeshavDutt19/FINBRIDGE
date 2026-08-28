const POSITIVE_WORDS = [
  "good",
  "great",
  "excellent",
  "smooth",
  "easy",
  "helpful",
  "fast",
  "quick",
  "approved",
  "satisfied",
  "happy",
  "supportive",
  "clear",
  "simple",
  "responsive",
  "efficient",
  "success",
  "successful",
];

const NEGATIVE_WORDS = [
  "bad",
  "worst",
  "poor",
  "slow",
  "delay",
  "delayed",
  "difficult",
  "problem",
  "problems",
  "issue",
  "issues",
  "rejected",
  "rejection",
  "confusing",
  "frustrating",
  "frustrated",
  "stuck",
  "waiting",
  "unresponsive",
  "refused",
  "refusal",
  "complaint",
];

const QUESTION_MARKERS = [
  "?",
];

const QUESTION_PHRASES = [
  "which bank",
  "should i",
  "can i",
  "can we",
  "does",
  "do they",
  "is it possible",
  "has anyone",
  "does anyone",
  "anyone know",
  "please help",
  "how can i",
  "what should",
  "what documents",
  "how much",
  "how long",
  "can i get",
  "can i take",
  "is there",
  "are there",
  "would",
];


/*
=========================================================
NORMALIZE
=========================================================
*/

function normalizeText(text = "") {
  return String(text)
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}


/*
=========================================================
CLASSIFY SENTIMENT
=========================================================
*/

export function classifySentiment(text = "") {
  const normalized =
    normalizeText(text);

  if (!normalized) {
    return "neutral";
  }

  /*
  Questions are neutral unless the wording
  clearly contains a personal positive/negative
  experience.

  This prevents:
  "Which bank has good service?"
  from becoming positive simply because
  it contains the word "good".
  */

  const isQuestion =
    QUESTION_MARKERS.some(
      (marker) =>
        normalized.includes(marker)
    ) ||
    QUESTION_PHRASES.some(
      (phrase) =>
        normalized.includes(phrase)
    );

  /*
  Count positive and negative signals.
  */

  let positiveScore = 0;
  let negativeScore = 0;

  for (
    const word of POSITIVE_WORDS
  ) {
    if (
      normalized.includes(word)
    ) {
      positiveScore += 1;
    }
  }

  for (
    const word of NEGATIVE_WORDS
  ) {
    if (
      normalized.includes(word)
    ) {
      negativeScore += 1;
    }
  }

  /*
  If it is a question and there is no strong
  negative/positive experience, treat it as neutral.
  */

  if (
    isQuestion &&
    positiveScore <= 1 &&
    negativeScore <= 1
  ) {
    return "neutral";
  }

  /*
  Strong negative evidence wins.
  */

  if (
    negativeScore >
    positiveScore
  ) {
    return "negative";
  }

  /*
  Strong positive evidence.
  */

  if (
    positiveScore >
    negativeScore
  ) {
    return "positive";
  }

  return "neutral";
}