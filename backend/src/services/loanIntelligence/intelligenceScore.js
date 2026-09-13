/*
=========================================================
FINBRIDGE INTELLIGENCE SCORE ENGINE
=========================================================

Purpose:
Convert accepted CommunityEvidence records into
loan-level intelligence.

Outputs:
1. Community Experience Score
2. Community Risk Score
3. Evidence Strength
4. Confidence
5. Topic Breakdown

Important:
- Does NOT classify sentiment again.
- Does NOT classify topics again.
- Uses values already stored on CommunityEvidence.
- Uses evidenceWeight to give stronger evidence more influence.
- Accepts both 0-1 and 0-100 score formats.

=========================================================
*/

import mongoose from "mongoose";
import CommunityEvidence from "../../models/CommunityEvidence.js";


/*
=========================================================
CONFIGURATION
=========================================================
*/

/*
Community Experience weights
*/

const EXPERIENCE_WEIGHTS = {
  sentiment: 0.25,
  quality: 0.25,
  relevance: 0.20,
  freshness: 0.15,
  depth: 0.15,
};


/*
Risk contribution by topic.

Higher value = topic is more important when
evaluating borrower risk/problems.
*/

const TOPIC_RISK_WEIGHTS = {
  delay: 1.00,
  processing: 0.85,
  disbursement: 0.90,
  repayment: 0.95,
  approval: 0.80,
  sanction: 0.80,
  documents: 0.65,
  eligibility: 0.55,
  collateral: 0.60,
  margin: 0.55,
  interest_rate: 0.45,
  emi: 0.50,
  staff: 0.55,
  branch: 0.45,
  insurance: 0.45,
  course_eligibility: 0.55,
  general: 0.30,
  other: 0.25,
};


/*
Sentiment contribution to risk.

Negative evidence creates the strongest risk.
Neutral evidence can still reveal uncertainty.
Positive evidence contributes very little risk.
*/

const SENTIMENT_RISK = {
  negative: 1.00,
  neutral: 0.35,
  positive: 0.05,
};


/*
Experience depth.

These values are intentionally based on the
EXISTING experienceType field rather than creating
a second classifier.

Unknown values fall back to 0.50.
*/

const EXPERIENCE_DEPTH = {
  direct_experience: 1.00,
  borrower_experience: 1.00,
  personal_experience: 1.00,
  first_hand: 1.00,

  repayment_experience: 0.95,
  application_experience: 0.95,

  outcome: 0.90,
  result: 0.90,

  detailed_experience: 0.85,
  experience: 0.80,

  question: 0.35,
  inquiry: 0.35,

  general: 0.50,
  other: 0.40,
};


/*
=========================================================
HELPERS
=========================================================
*/


/*
Convert either:

0.84
or
84

into a consistent 0-1 value.
*/

function normalizeScore(value, fallback = 0) {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return fallback;
  }

  if (number > 1) {
    return Math.max(
      0,
      Math.min(number / 100, 1)
    );
  }

  return Math.max(
    0,
    Math.min(number, 1)
  );
}


/*
Round numbers for clean API responses.
*/

function round(value, decimals = 2) {
  return Number(
    Number(value || 0).toFixed(decimals)
  );
}


/*
Convert normalized 0-1 value to 0-100.
*/

function toScore(value) {
  return round(
    Math.max(0, Math.min(value, 1)) * 100
  );
}


/*
Safe weighted average.

Example:

score = 0.9
weight = 0.8

score contributes more than:

score = 0.4
weight = 0.2
*/

function weightedAverage(items) {
  let weightedSum = 0;
  let totalWeight = 0;

  for (const item of items) {
    const score = normalizeScore(item.score);
    const weight = normalizeScore(item.weight);

    if (weight <= 0) {
      continue;
    }

    weightedSum += score * weight;
    totalWeight += weight;
  }

  if (totalWeight === 0) {
    return 0;
  }

  return weightedSum / totalWeight;
}


/*
=========================================================
SENTIMENT SCORE
=========================================================
*/

function getSentimentScore(sentiment) {
  switch (
    String(sentiment || "")
      .toLowerCase()
      .trim()
  ) {
    case "positive":
      return 1.00;

    case "negative":
      return 0.00;

    case "neutral":
    default:
      return 0.50;
  }
}


/*
=========================================================
EXPERIENCE DEPTH SCORE
=========================================================
*/

function getExperienceDepth(experienceType) {
  const key =
    String(experienceType || "")
      .toLowerCase()
      .trim();

  return (
    EXPERIENCE_DEPTH[key] ??
    0.50
  );
}


/*
=========================================================
TOPIC RISK
=========================================================
*/

function getTopicRisk(topic) {
  const key =
    String(topic || "")
      .toLowerCase()
      .trim();

  return (
    TOPIC_RISK_WEIGHTS[key] ??
    0.25
  );
}


/*
=========================================================
SENTIMENT RISK
=========================================================
*/

function getSentimentRisk(sentiment) {
  const key =
    String(sentiment || "")
      .toLowerCase()
      .trim();

  return (
    SENTIMENT_RISK[key] ??
    0.35
  );
}


/*
=========================================================
EVIDENCE COVERAGE SCORE
=========================================================

We intentionally use diminishing returns.

1 record should not suddenly create high confidence.

47 records should be much stronger.

The score approaches 100 rather than growing
linearly forever.
*/

function calculateCoverageScore(count) {
  if (!count || count <= 0) {
    return 0;
  }

  return (
    1 -
    Math.exp(-count / 15)
  );
}


/*
=========================================================
SOURCE DIVERSITY SCORE
=========================================================

Two independent sources are substantially stronger
than one source.

Four+ sources reaches full diversity score.
*/

function calculateSourceDiversity(sourceCount) {
  if (!sourceCount || sourceCount <= 0) {
    return 0;
  }

  return Math.min(
    sourceCount / 4,
    1
  );
}


/*
=========================================================
COMMUNITY EXPERIENCE
=========================================================

Formula:

Sentiment          25%
Quality            25%
Relevance          20%
Freshness          15%
Experience Depth   15%

Each evidence item's influence is controlled by
evidenceWeight.
*/

function calculateCommunityExperience(
  evidence
) {
  if (!evidence.length) {
    return 0;
  }

  let totalContribution = 0;
  let totalWeight = 0;

  for (const item of evidence) {
    const evidenceWeight =
      normalizeScore(
        item.evidenceWeight,
        0
      );

    if (evidenceWeight <= 0) {
      continue;
    }

    const sentiment =
      getSentimentScore(
        item.sentiment
      );

    const quality =
      normalizeScore(
        item.qualityScore
      );

    const relevance =
      normalizeScore(
        item.relevanceScore
      );

    const freshness =
      normalizeScore(
        item.freshnessWeight
      );

    const depth =
      getExperienceDepth(
        item.experienceType
      );

    const itemScore =
      sentiment *
        EXPERIENCE_WEIGHTS.sentiment +

      quality *
        EXPERIENCE_WEIGHTS.quality +

      relevance *
        EXPERIENCE_WEIGHTS.relevance +

      freshness *
        EXPERIENCE_WEIGHTS.freshness +

      depth *
        EXPERIENCE_WEIGHTS.depth;

    totalContribution +=
      itemScore *
      evidenceWeight;

    totalWeight +=
      evidenceWeight;
  }

  if (totalWeight === 0) {
    return 0;
  }

  return toScore(
    totalContribution /
    totalWeight
  );
}


/*
=========================================================
COMMUNITY RISK
=========================================================

Risk is NOT just:

negative / total

because a negative comment about "delay" should
matter more than a generic negative comment.

Risk is based on:

sentiment severity
×
topic importance
×
evidence weight
*/

function calculateCommunityRisk(
  evidence
) {
  if (!evidence.length) {
    return 0;
  }

  let weightedRisk = 0;
  let totalWeight = 0;

  for (const item of evidence) {
    const evidenceWeight =
      normalizeScore(
        item.evidenceWeight,
        0
      );

    if (evidenceWeight <= 0) {
      continue;
    }

    const sentimentRisk =
      getSentimentRisk(
        item.sentiment
      );

    const topicRisk =
      getTopicRisk(
        item.topic
      );

    const risk =
      sentimentRisk *
      topicRisk;

    weightedRisk +=
      risk *
      evidenceWeight;

    totalWeight +=
      evidenceWeight;
  }

  if (totalWeight === 0) {
    return 0;
  }

  return toScore(
    weightedRisk /
    totalWeight
  );
}


/*
=========================================================
EVIDENCE STRENGTH
=========================================================

Components:

Evidence Coverage    30%
Quality               20%
Relevance             15%
Freshness             15%
Experience Depth      10%
Source Diversity     10%
*/

function calculateEvidenceStrength(
  evidence,
  sourceCount
) {
  if (!evidence.length) {
    return 0;
  }

  const coverage =
    calculateCoverageScore(
      evidence.length
    );

  const quality =
    weightedAverage(
      evidence.map((item) => ({
        score: item.qualityScore,
        weight: item.evidenceWeight,
      }))
    );

  const relevance =
    weightedAverage(
      evidence.map((item) => ({
        score: item.relevanceScore,
        weight: item.evidenceWeight,
      }))
    );

  const freshness =
    weightedAverage(
      evidence.map((item) => ({
        score: item.freshnessWeight,
        weight: item.evidenceWeight,
      }))
    );

  const depth =
    weightedAverage(
      evidence.map((item) => ({
        score:
          getExperienceDepth(
            item.experienceType
          ),
        weight:
          item.evidenceWeight,
      }))
    );

  const diversity =
    calculateSourceDiversity(
      sourceCount
    );

  const strength =
    coverage * 0.30 +
    quality * 0.20 +
    relevance * 0.15 +
    freshness * 0.15 +
    depth * 0.10 +
    diversity * 0.10;

  return toScore(strength);
}


/*
=========================================================
CONFIDENCE
=========================================================
*/

function calculateConfidence({
  evidenceCount,
  sourceCount,
  evidenceStrength,
}) {
  /*
  High confidence:
  substantial evidence + source diversity
  */

  if (
    evidenceCount >= 20 &&
    sourceCount >= 2 &&
    evidenceStrength >= 70
  ) {
    return "High";
  }

  /*
  Medium confidence:
  reasonable amount of useful evidence
  */

  if (
    evidenceCount >= 6 &&
    sourceCount >= 1 &&
    evidenceStrength >= 50
  ) {
    return "Medium";
  }

  /*
  Anything below the above thresholds should
  not be presented as reliable intelligence.
  */

  return "Limited";
}


/*
=========================================================
TOPIC BREAKDOWN
=========================================================

We keep:

count
weighted volume
average evidence weight
negative signals
positive signals
risk score
*/

function calculateTopicBreakdown(
  evidence
) {
  const topics = {};

  for (const item of evidence) {
    const topic =
      item.topic ||
      "other";

    if (!topics[topic]) {
      topics[topic] = {
        count: 0,
        weightedVolume: 0,
        negativeCount: 0,
        neutralCount: 0,
        positiveCount: 0,
        riskContribution: 0,
      };
    }

    const weight =
      normalizeScore(
        item.evidenceWeight,
        0
      );

    const sentiment =
      String(
        item.sentiment || ""
      )
        .toLowerCase()
        .trim();

    topics[topic].count += 1;

    topics[topic].weightedVolume +=
      weight;

    topics[topic].riskContribution +=
      weight *
      getTopicRisk(topic) *
      getSentimentRisk(
        sentiment
      );

    if (sentiment === "negative") {
      topics[topic].negativeCount += 1;
    } else if (
      sentiment === "positive"
    ) {
      topics[topic].positiveCount += 1;
    } else {
      topics[topic].neutralCount += 1;
    }
  }

  /*
  Convert normalized values into
  UI-friendly scores.
  */

  for (const topic of Object.keys(topics)) {
    const item =
      topics[topic];

    item.weightedVolume =
      round(
        item.weightedVolume,
        4
      );

    item.riskScore =
      toScore(
        item.count > 0
          ? item.riskContribution /
            item.count
          : 0
      );

    delete item.riskContribution;
  }

  return topics;
}


/*
=========================================================
SOURCE BREAKDOWN
=========================================================
*/

function calculateSourceBreakdown(
  evidence
) {
  const sources = {};

  for (const item of evidence) {
    const source =
      item.sourceType ||
      "unknown";

    sources[source] =
      (sources[source] || 0) + 1;
  }

  return sources;
}


/*
=========================================================
MAIN INTELLIGENCE ENGINE
=========================================================
*/

export async function calculateIntelligenceScore({
  loanProductId,
} = {}) {
  if (!loanProductId) {
    throw new Error(
      "loanProductId is required"
    );
  }

  /*
  Validate ObjectId.
  */

  if (
    !mongoose.Types.ObjectId.isValid(
      loanProductId
    )
  ) {
    throw new Error(
      `Invalid loanProductId: ${loanProductId}`
    );
  }

  const loanObjectId =
    new mongoose.Types.ObjectId(
      loanProductId
    );

  /*
  Only accepted evidence enters
  intelligence scoring.
  */

  const evidence =
    await CommunityEvidence.find({
      loanProductId:
        loanObjectId,

      isAccepted:
        true,
    })
      .select(
        [
          "sourceType",
          "sourceUrl",
          "title",
          "content",
          "topic",
          "sentiment",
          "experienceType",
          "relevanceScore",
          "qualityScore",
          "freshnessWeight",
          "evidenceWeight",
          "publishedAt",
        ].join(" ")
      )
      .lean();

  /*
  Empty dataset.
  */

  if (!evidence.length) {
    return {
      loanProductId,

      scores: {
        communityExperience: 0,
        communityRisk: 0,
        evidenceStrength: 0,
      },

      confidence: "Limited",

      evidenceCount: 0,

      sourceDiversity: 0,

      sources: {},

      topics: {},

      methodology: {
        experienceWeights:
          EXPERIENCE_WEIGHTS,
        scoreVersion:
          "1.0.0",
      },
    };
  }

  /*
  SOURCE DATA
  */

  const sources =
    calculateSourceBreakdown(
      evidence
    );

  const sourceCount =
    Object.keys(sources).length;

  /*
  MAIN SCORES
  */

  const communityExperience =
    calculateCommunityExperience(
      evidence
    );

  const communityRisk =
    calculateCommunityRisk(
      evidence
    );

  const evidenceStrength =
    calculateEvidenceStrength(
      evidence,
      sourceCount
    );

  /*
  CONFIDENCE
  */

  const confidence =
    calculateConfidence({
      evidenceCount:
        evidence.length,

      sourceCount,

      evidenceStrength,
    });

  /*
  TOPICS
  */

  const topics =
    calculateTopicBreakdown(
      evidence
    );

  /*
  FINAL RESULT
  */

  return {
    loanProductId,

    scores: {
      communityExperience,
      communityRisk,
      evidenceStrength,
    },

    confidence,

    evidenceCount:
      evidence.length,

    sourceDiversity:
      sourceCount,

    sources,

    topics,

    methodology: {
      experienceWeights:
        EXPERIENCE_WEIGHTS,

      scoreVersion:
        "1.0.0",
    },
  };
}


/*
=========================================================
CALCULATE FOR MULTIPLE LOANS
=========================================================

Useful later for the recommendation engine.
*/

export async function calculateAllIntelligenceScores() {
  const loanProductIds =
    await CommunityEvidence.distinct(
      "loanProductId",
      {
        isAccepted: true,
      }
    );

  const results = [];

  for (
    const loanProductId
    of loanProductIds
  ) {
    const result =
      await calculateIntelligenceScore({
        loanProductId:
          loanProductId.toString(),
      });

    results.push(result);
  }

  return results;
}