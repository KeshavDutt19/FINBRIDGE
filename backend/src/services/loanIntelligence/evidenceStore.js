import crypto from "crypto";
import CommunityEvidence from "../../models/CommunityEvidence.js";

/*
=========================================================
EVIDENCE STORE
=========================================================

Responsibilities:

1. Normalize evidence
2. Generate a stable hash
3. Prevent duplicates
4. Save accepted evidence
5. Return useful statistics
=========================================================
*/


/*
---------------------------------------------------------
NORMALIZE TEXT
---------------------------------------------------------
*/

function normalizeText(text = "") {
  return String(text)
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}


/*
---------------------------------------------------------
CREATE HASH
---------------------------------------------------------

For YouTube:

sourceType + sourceId

For example:

youtube:Ugxxxx

This makes the YouTube comment ID the unique identity
of the evidence.
---------------------------------------------------------
*/

export function createEvidenceHash({
  sourceType = "",
  sourceId = "",
  sourceUrl = "",
  content = "",
} = {}) {
  const normalizedSourceType =
    normalizeText(sourceType);

  const normalizedSourceId =
    normalizeText(sourceId);

  const normalizedSourceUrl =
    normalizeText(sourceUrl);

  const normalizedContent =
    normalizeText(content);

  let identity;

  if (
    normalizedSourceType &&
    normalizedSourceId
  ) {
    identity =
      `${normalizedSourceType}:${normalizedSourceId}`;
  } else {
    identity =
      `${normalizedSourceType}:${normalizedSourceUrl}:${normalizedContent}`;
  }

  return crypto
    .createHash("sha256")
    .update(identity)
    .digest("hex");
}


/*
---------------------------------------------------------
PREPARE EVIDENCE
---------------------------------------------------------
*/

export function prepareEvidence(
  evidence
) {
  if (
    !evidence ||
    typeof evidence !== "object"
  ) {
    throw new Error(
      "Invalid evidence object"
    );
  }

  const content =
    normalizeText(
      evidence.content || ""
    );

  if (!content) {
    throw new Error(
      "Evidence content is empty"
    );
  }

  if (!evidence.loanProductId) {
    throw new Error(
      "loanProductId is required"
    );
  }

  if (!evidence.sourceType) {
    throw new Error(
      "sourceType is required"
    );
  }

  if (!evidence.sourceUrl) {
    throw new Error(
      "sourceUrl is required"
    );
  }

  const hash =
    createEvidenceHash({
      sourceType:
        evidence.sourceType,

      sourceId:
        evidence.sourceId || "",

      sourceUrl:
        evidence.sourceUrl,

      content,
    });

  return {
    loanProductId:
      evidence.loanProductId,

    sourceType:
      evidence.sourceType,

    sourceUrl:
      evidence.sourceUrl,

    sourceId:
      evidence.sourceId || "",

    title:
      evidence.title || "",

    author:
      evidence.author || "",

    content,

    rawText:
      evidence.rawText || content,

    publishedAt:
      evidence.publishedAt
        ? new Date(evidence.publishedAt)
        : null,

    collectedAt:
      evidence.collectedAt
        ? new Date(evidence.collectedAt)
        : new Date(),

    topic:
      evidence.topic || "other",

    sentiment:
      evidence.sentiment || "neutral",

    experienceType:
      evidence.experienceType ||
      "general_discussion",

    relevanceScore:
      Number(
        evidence.relevanceScore || 0
      ),

    qualityScore:
      Number(
        evidence.qualityScore || 0
      ),

    freshnessWeight:
      Number(
        evidence.freshnessWeight ?? 0.7
      ),

    evidenceWeight:
      Number(
        evidence.evidenceWeight || 0
      ),

    extractedClaims:
      Array.isArray(
        evidence.extractedClaims
      )
        ? evidence.extractedClaims
        : [],

    isAccepted:
      Boolean(
        evidence.isAccepted
      ),

    hash,
  };
}


/*
---------------------------------------------------------
SAVE ONE EVIDENCE RECORD
---------------------------------------------------------
*/

export async function saveEvidence(
  evidence
) {
  const prepared =
    prepareEvidence(evidence);

  /*
  Don't store rejected evidence.
  */

  if (!prepared.isAccepted) {
    return {
      inserted: false,
      duplicate: false,
      skipped: true,
      reason: "not_accepted",
      hash: prepared.hash,
    };
  }

  /*
  Check whether this exact evidence already exists.
  */

  const existing =
    await CommunityEvidence.findOne({
      hash: prepared.hash,
    }).lean();

  if (existing) {
    return {
      inserted: false,
      duplicate: true,
      skipped: false,
      hash: prepared.hash,
      evidence: existing,
    };
  }

  /*
  Create the actual MongoDB record.
  */

  const created =
    await CommunityEvidence.create(
      prepared
    );

  return {
    inserted: true,
    duplicate: false,
    skipped: false,
    hash: prepared.hash,
    evidence: created.toObject(),
  };
}


/*
---------------------------------------------------------
SAVE MANY EVIDENCE RECORDS
---------------------------------------------------------
*/

export async function saveEvidenceBatch(
  evidenceList = []
) {
  if (!Array.isArray(evidenceList)) {
    throw new Error(
      "evidenceList must be an array"
    );
  }

  const stats = {
    total: evidenceList.length,
    inserted: 0,
    duplicates: 0,
    skipped: 0,
    errors: 0,
    results: [],
  };

  for (
    const evidence of evidenceList
  ) {
    try {
      const result =
        await saveEvidence(
          evidence
        );

      stats.results.push(
        result
      );

      if (result.inserted) {
        stats.inserted += 1;
      }

      if (result.duplicate) {
        stats.duplicates += 1;
      }

      if (result.skipped) {
        stats.skipped += 1;
      }
    } catch (error) {
      stats.errors += 1;

      stats.results.push({
        inserted: false,
        duplicate: false,
        skipped: false,
        error:
          error?.message ||
          String(error),
        errorName:
          error?.name || null,
        errorCode:
          error?.code || null,
      });
    }
  }

  return stats;
}