import CollectionSession from "../../models/CollectionSession.js";

/*
=========================================================
COLLECTION SESSION SERVICE
=========================================================

Creates and updates a record for every community
collection run.

This gives the Admin dashboard measurable statistics:

- queries run
- results found
- accepted evidence
- duplicates
- errors
- Reddit results
- YouTube results
=========================================================
*/


/*
---------------------------------------------------------
START SESSION
---------------------------------------------------------
*/

export async function startCollectionSession({
  loanProductId,
  bank,
  category,
} = {}) {
  if (!loanProductId) {
    throw new Error(
      "loanProductId is required"
    );
  }

  if (!bank) {
    throw new Error(
      "bank is required"
    );
  }

  if (!category) {
    throw new Error(
      "category is required"
    );
  }

  return CollectionSession.create({
    loanProductId,
    bank,
    category,

    startedAt: new Date(),

    status: "running",
  });
}


/*
---------------------------------------------------------
FINISH SESSION
---------------------------------------------------------
*/

export async function finishCollectionSession({
  sessionId,
  status = "completed",

  queriesRun = 0,
  resultsFound = 0,
  resultsAccepted = 0,

  duplicatesRemoved = 0,
  lowQualityRemoved = 0,
  errorsCount = 0,

  redditResults = 0,
  youtubeResults = 0,

  notes = "",
} = {}) {
  if (!sessionId) {
    throw new Error(
      "sessionId is required"
    );
  }

  return CollectionSession.findByIdAndUpdate(
    sessionId,
    {
      $set: {
        finishedAt: new Date(),

        status,

        queriesRun,
        resultsFound,
        resultsAccepted,

        duplicatesRemoved,
        lowQualityRemoved,
        errorsCount,

        redditResults,
        youtubeResults,

        notes,
      },
    },
    {
      new: true,
    }
  );
}


/*
---------------------------------------------------------
MARK SESSION FAILED
---------------------------------------------------------
*/

export async function failCollectionSession({
  sessionId,
  error,
} = {}) {
  if (!sessionId) {
    throw new Error(
      "sessionId is required"
    );
  }

  return CollectionSession.findByIdAndUpdate(
    sessionId,
    {
      $set: {
        finishedAt: new Date(),

        status: "failed",

        errorsCount: 1,

        notes:
          error?.message ||
          String(error || "Unknown error"),
      },
    },
    {
      new: true,
    }
  );
}