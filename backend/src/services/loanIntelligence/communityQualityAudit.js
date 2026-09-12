import "dotenv/config";
import mongoose from "mongoose";

import { connectDB } from "../../db.js";
import CommunityEvidence from "../../models/CommunityEvidence.js";
import LoanProduct from "../../models/LoanProduct.js";


/*
=========================================================
FINBRIDGE COMMUNITY QUALITY AUDIT
=========================================================

Purpose:

Validate stored community evidence before it is used
by the recommendation/intelligence engine.

Checks:

1. Required fields
2. Valid source
3. Correct bank
4. Correct loan category
5. Content quality
6. Relevance score
7. Quality score
8. Freshness score
9. Evidence weight
10. Duplicate source IDs

This service DOES NOT delete anything.

It only reports problems.

=========================================================
*/


const BANK_ALIASES = {

  "Bank of Baroda": [
    "bank of baroda",
    "baroda",
    "bob",
  ],

  "State Bank of India": [
    "state bank of india",
    "sbi",
  ],

  "Punjab National Bank": [
    "punjab national bank",
    "pnb",
  ],
};


const CATEGORY_TERMS = {

  education: [
    "education loan",
    "student loan",
    "student loans",
    "education loans",
    "study loan",
    "study abroad",
    "higher education",
    "student",
  ],

  car: [
    "car loan",
    "car loans",
    "vehicle loan",
    "vehicle loans",
    "auto loan",
    "car finance",
    "vehicle finance",
  ],

  home: [
    "home loan",
    "home loans",
    "housing loan",
    "housing loans",
    "mortgage",
    "home finance",
    "housing finance",
  ],
};


/*
=========================================================
TEXT HELPERS
=========================================================
*/

function normalize(
  value = ""
) {
  return String(value)
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}


function includesAny(
  text,
  terms
) {
  return terms.some(
    (term) =>
      text.includes(term)
  );
}


/*
=========================================================
BANK MATCH
=========================================================
*/

function hasBankMatch(
  evidence
) {

  const bank =
    String(
      evidence?.bankName ||
      evidence?.bank ||
      ""
    );

  const title =
    normalize(
      evidence?.title || ""
    );

  const content =
    normalize(
      evidence?.content || ""
    );

  const text =
    `${title} ${content}`;

  const aliases =
    BANK_ALIASES[
      bank
    ] || [
      normalize(bank),
    ];


  if (
    !bank ||
    aliases.length === 0
  ) {
    return false;
  }


  return aliases.some(
    (alias) =>
      alias &&
      text.includes(alias)
  );
}


/*
=========================================================
CATEGORY MATCH
=========================================================
*/

function hasCategoryMatch(
  evidence
) {

  const category =
    normalize(
      evidence?.category ||
      ""
    );


  const title =
    normalize(
      evidence?.title ||
      ""
    );


  const content =
    normalize(
      evidence?.content ||
      ""
    );


  const text =
    `${title} ${content}`;


  const terms =
    CATEGORY_TERMS[
      category
    ] || [];


  return terms.some(
    (term) =>
      text.includes(term)
  );
}


/*
=========================================================
VALIDATE ONE RECORD
=========================================================
*/

function validateEvidence(
  evidence
) {

  const problems = [];


  /*
  Required source fields.
  */

  if (
    !evidence?.loanProductId
  ) {
    problems.push(
      "missing_loanProductId"
    );
  }


  if (
    !evidence?.sourceType
  ) {
    problems.push(
      "missing_sourceType"
    );
  }


  if (
    !evidence?.sourceUrl
  ) {
    problems.push(
      "missing_sourceUrl"
    );
  }


  if (
    !evidence?.sourceId
  ) {
    problems.push(
      "missing_sourceId"
    );
  }


  if (
    !evidence?.content ||
    normalize(
      evidence.content
    ).length < 20
  ) {
    problems.push(
      "insufficient_content"
    );
  }


  /*
  Source validation.
  */

  if (
    ![
      "youtube",
      "reddit",
    ].includes(
      evidence.sourceType
    )
  ) {
    problems.push(
      "invalid_source"
    );
  }


  /*
  Score validation.
  */

  if (
    evidence.relevanceScore <
      0 ||
    evidence.relevanceScore >
      1
  ) {
    problems.push(
      "invalid_relevance_score"
    );
  }


  if (
    evidence.qualityScore <
      0 ||
    evidence.qualityScore >
      1
  ) {
    problems.push(
      "invalid_quality_score"
    );
  }


  if (
    evidence.freshnessWeight <
      0 ||
    evidence.freshnessWeight >
      1
  ) {
    problems.push(
      "invalid_freshness_score"
    );
  }


  if (
    evidence.evidenceWeight <
      0 ||
    evidence.evidenceWeight >
      1
  ) {
    problems.push(
      "invalid_evidence_weight"
    );
  }


  return {
    valid:
      problems.length === 0,

    problems,
  };
}


/*
=========================================================
AUDIT
=========================================================
*/

export async function runCommunityQualityAudit({
  loanProductId,
  bankName,
  category,
} = {}) {

  await connectDB();


  const query = {};


  if (
    loanProductId
  ) {
    query.loanProductId =
      loanProductId;
  }


  const evidence =
    await CommunityEvidence
      .find(query)
      .lean();


  const summary = {

    total:
      evidence.length,

    valid:
      0,

    invalid:
      0,

    invalidBank:
      0,

    invalidCategory:
      0,

    insufficientContent:
      0,

    invalidScores:
      0,

    invalidSource:
      0,

    duplicates:
      0,

  };


  const issues = [];


  /*
  -------------------------------------------------------
  DUPLICATE SOURCE TRACKING
  -------------------------------------------------------
  */

  const sourceMap =
    new Map();


  for (
    const item of
    evidence
  ) {

    const sourceKey =
      `${item.sourceType}:${item.sourceId}`;


    if (
      sourceMap.has(
        sourceKey
      )
    ) {

      summary.duplicates += 1;

    } else {

      sourceMap.set(
        sourceKey,
        true
      );
    }


    /*
    -----------------------------------------------------
    OPTIONAL BANK/CATEGORY FILTER
    -----------------------------------------------------
    */

    if (
      bankName &&
      !hasBankMatch({
        ...item,
        bankName,
      })
    ) {

      summary.invalidBank += 1;

      issues.push({
        evidenceId:
          item._id,

        type:
          "invalid_bank_match",

        sourceId:
          item.sourceId,

        title:
          item.title,
      });

      continue;
    }


    if (
      category &&
      !hasCategoryMatch({
        ...item,
        category,
      })
    ) {

      summary.invalidCategory +=
        1;

      issues.push({
        evidenceId:
          item._id,

        type:
          "invalid_category_match",

        sourceId:
          item.sourceId,

        title:
          item.title,
      });

      continue;
    }


    const validation =
      validateEvidence(
        item
      );


    if (
      validation.valid
    ) {

      summary.valid += 1;

    } else {

      summary.invalid += 1;


      if (
        validation.problems.includes(
          "insufficient_content"
        )
      ) {
        summary.insufficientContent +=
          1;
      }


      if (
        validation.problems.some(
          (problem) =>
            problem.includes(
              "score"
            )
        )
      ) {
        summary.invalidScores +=
          1;
      }


      if (
        validation.problems.includes(
          "invalid_source"
        )
      ) {
        summary.invalidSource +=
          1;
      }


      issues.push({
        evidenceId:
          item._id,

        type:
          "invalid_record",

        problems:
          validation.problems,

        sourceId:
          item.sourceId,

        title:
          item.title,
      });
    }
  }


  return {
    summary,
    issues,
  };
}


/*
=========================================================
CLI
=========================================================
*/

async function main() {

  const result =
    await runCommunityQualityAudit();


  console.log(
    "\n================================================="
  );

  console.log(
    "FINBRIDGE COMMUNITY QUALITY AUDIT"
  );

  console.log(
    "=================================================\n"
  );


  console.log(
    JSON.stringify(
      result.summary,
      null,
      2
    )
  );


  console.log(
    "\nISSUES:"
  );


  console.log(
    JSON.stringify(
      result.issues.slice(
        0,
        50
      ),
      null,
      2
    )
  );


  process.exit(0);
}


main()
  .catch(
    (error) => {

      console.error(
        error?.stack ||
          error?.message ||
          String(error)
      );

      process.exit(1);
    }
  );