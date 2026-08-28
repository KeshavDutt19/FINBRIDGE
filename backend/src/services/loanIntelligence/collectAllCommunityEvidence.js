import "dotenv/config";

import { connectDB } from "../../db.js";

import LoanProduct from "../../models/LoanProduct.js";
import CommunityEvidence from "../../models/CommunityEvidence.js";

import { searchReddit } from "./redditCollector.js";
import { collectYouTubeEvidence } from "./youtubeCollector.js";
import { buildSourceQueries } from "./queryPlanner.js";


/*
=========================================================
TARGET MATRIX
=========================================================
*/

const TARGET_BANKS = [
  "State Bank of India",
  "Bank of Baroda",
  "Punjab National Bank",
];

const TARGET_CATEGORIES = [
  "education",
  "car",
  "home",
];


/*
=========================================================
THRESHOLDS
=========================================================
*/

const MIN_REDDIT_EVIDENCE = 5;
const MIN_YOUTUBE_EVIDENCE = 5;


/*
=========================================================
QUERY LIMITS
=========================================================
*/

const REDDIT_MAX_QUERIES = 5;
const YOUTUBE_MAX_QUERIES = 5;

const YOUTUBE_MAX_VIDEOS_PER_QUERY = 2;
const YOUTUBE_MAX_COMMENTS_PER_VIDEO = 10;


/*
=========================================================
DELAY
=========================================================
*/

const PRODUCT_DELAY_MS = 4000;


/*
=========================================================
CLI
=========================================================
*/

function getArg(name, fallback = null) {

  const index =
    process.argv.indexOf(name);

  if (
    index === -1 ||
    index + 1 >= process.argv.length
  ) {
    return fallback;
  }

  return process.argv[index + 1];
}


function hasFlag(name) {
  return process.argv.includes(name);
}


const SOURCE =
  getArg("--source", "both");

const FILTER_BANK =
  getArg("--bank", null);

const FILTER_CATEGORY =
  getArg("--category", null);

const ONLY_MISSING =
  hasFlag("--only-missing");


if (
  !["reddit", "youtube", "both"].includes(
    SOURCE
  )
) {
  throw new Error(
    '--source must be "reddit", "youtube", or "both"'
  );
}


/*
=========================================================
HELPERS
=========================================================
*/

function sleep(ms) {
  return new Promise(
    (resolve) =>
      setTimeout(resolve, ms)
  );
}


function isRedditRateLimited(result) {
  return Boolean(
    result?.rateLimited
  );
}


function isYouTubeQuotaError(result) {

  const errors =
    Array.isArray(result?.errors)
      ? result.errors
      : [];

  return errors.some(
    (item) => {

      const text =
        JSON.stringify(item)
          .toLowerCase();

      return (
        text.includes("quota exceeded") ||
        text.includes("resource_exhausted") ||
        text.includes("search_list") ||
        (
          Number(item?.status) === 429 &&
          text.includes("youtube")
        )
      );
    }
  );
}


/*
=========================================================
EVIDENCE COUNTS
=========================================================
*/

async function getCounts(
  loanProductId
) {

  const reddit =
    await CommunityEvidence.countDocuments({
      loanProductId,
      sourceType: "reddit",
    });


  const youtube =
    await CommunityEvidence.countDocuments({
      loanProductId,
      sourceType: "youtube",
    });


  return {
    reddit,
    youtube,
  };
}


/*
=========================================================
CLEAN YOUTUBE QUERIES
=========================================================
*/

function buildCleanYouTubeQueries({
  bank,
  category,
}) {

  const loanName =
    category === "education"
      ? "Education Loan"
      : category === "car"
        ? "Car Loan"
        : "Home Loan";


  const planned =
    buildSourceQueries({
      bank,
      category,
      loanName,
      source: "youtube",
      maxQueries:
        YOUTUBE_MAX_QUERIES,
    });


  const seen =
    new Set();

  const queries = [];


  for (
    const item of planned
  ) {

    let query =
      String(
        item?.query || ""
      )
        .replace(/\s+/g, " ")
        .trim();


    query =
      query.replace(
        /\s+youtube$/i,
        ""
      ).trim();


    /*
    Prevent:

    PNB PNB Car Loan experience
    */

    const duplicatedBank =
      `${bank} ${bank}`;


    if (
      query
        .toLowerCase()
        .startsWith(
          duplicatedBank.toLowerCase()
        )
    ) {

      query =
        query.substring(
          bank.length
        ).trim();

      query =
        `${bank} ${query}`;
    }


    const key =
      query.toLowerCase();


    if (
      !query ||
      seen.has(key)
    ) {
      continue;
    }


    seen.add(key);

    queries.push({
      query,
      key:
        item?.key || "",
      priority:
        item?.priority || null,
    });


    if (
      queries.length >=
      YOUTUBE_MAX_QUERIES
    ) {
      break;
    }
  }


  return queries;
}


/*
=========================================================
SELECT PRODUCTS
=========================================================
*/

async function getTargetProducts() {

  const products =
    await LoanProduct.find()
      .select(
        "_id bankName category productName"
      )
      .lean();


  return products
    .filter(
      (product) => {

        if (
          !TARGET_BANKS.includes(
            product.bankName
          )
        ) {
          return false;
        }


        if (
          !TARGET_CATEGORIES.includes(
            product.category
          )
        ) {
          return false;
        }


        if (
          FILTER_BANK &&
          product.bankName !==
            FILTER_BANK
        ) {
          return false;
        }


        if (
          FILTER_CATEGORY &&
          product.category !==
            FILTER_CATEGORY
        ) {
          return false;
        }


        return true;
      }
    )
    .sort(
      (a, b) =>
        (
          `${a.bankName}-${a.category}`
        ).localeCompare(
          `${b.bankName}-${b.category}`
        )
    );
}


/*
=========================================================
MAIN
=========================================================
*/

async function main() {

  console.log(
    "\nFinBridge Community Evidence Collector"
  );

  console.log(
    "========================================"
  );

  console.log(
    `Source: ${SOURCE}`
  );

  console.log(
    `Only missing: ${ONLY_MISSING}`
  );


  if (FILTER_BANK) {
    console.log(
      `Bank: ${FILTER_BANK}`
    );
  }

  if (FILTER_CATEGORY) {
    console.log(
      `Category: ${FILTER_CATEGORY}`
    );
  }


  /*
  ---------------------------------------------------------
  DATABASE
  ---------------------------------------------------------
  */

  await connectDB();


  /*
  ---------------------------------------------------------
  YOUTUBE KEY
  ---------------------------------------------------------
  */

  if (
    SOURCE === "youtube" ||
    SOURCE === "both"
  ) {

    if (
      !process.env.YOUTUBE_API_KEY
    ) {
      throw new Error(
        "YOUTUBE_API_KEY is missing from .env"
      );
    }
  }


  /*
  ---------------------------------------------------------
  PRODUCTS
  ---------------------------------------------------------
  */

  const allProducts =
    await getTargetProducts();


  /*
  ---------------------------------------------------------
  BUILD GAP QUEUE
  ---------------------------------------------------------
  */

  const queue = [];


  for (
    const product of
    allProducts
  ) {

    const counts =
      await getCounts(
        product._id
      );


    const needsReddit =
      counts.reddit <
      MIN_REDDIT_EVIDENCE;


    const needsYouTube =
      counts.youtube <
      MIN_YOUTUBE_EVIDENCE;


    let selected = false;


    if (
      SOURCE === "reddit"
    ) {

      selected =
        ONLY_MISSING
          ? needsReddit
          : true;

    } else if (
      SOURCE === "youtube"
    ) {

      selected =
        ONLY_MISSING
          ? needsYouTube
          : true;

    } else {

      selected =
        ONLY_MISSING
          ? (
              needsReddit ||
              needsYouTube
            )
          : true;
    }


    if (selected) {

      queue.push({
        product,
        counts,
        needsReddit,
        needsYouTube,
      });
    }
  }


  console.log(
    `\nProducts selected: ${queue.length}`
  );


  if (
    queue.length === 0
  ) {

    console.log(
      "\nNothing needs collection for the selected source."
    );

    return;
  }


  /*
  ---------------------------------------------------------
  DISPLAY QUEUE
  ---------------------------------------------------------
  */

  console.log(
    "\nCOLLECTION QUEUE:"
  );


  for (
    const item of queue
  ) {

    console.log(
      `${item.product.bankName} | ${item.product.category} | Reddit:${item.counts.reddit} | YouTube:${item.counts.youtube}`
    );
  }


  /*
  ---------------------------------------------------------
  GLOBAL STATE
  ---------------------------------------------------------
  */

  let redditEnabled =
    true;

  let youtubeEnabled =
    true;


  /*
  ---------------------------------------------------------
  PROCESS QUEUE
  ---------------------------------------------------------
  */

  const results = [];


  for (
    let i = 0;
    i < queue.length;
    i += 1
  ) {

    const {
      product,
      counts,
    } =
      queue[i];


    const bank =
      product.bankName;

    const category =
      product.category;

    const loanProductId =
      product._id.toString();


    console.log("\n");
    console.log(
      `######## ${i + 1}/${queue.length} ########`
    );

    console.log(
      `${bank} | ${category} | ${product.productName}`
    );

    console.log(
      `Current → Reddit:${counts.reddit} | YouTube:${counts.youtube}`
    );


    /*
    =======================================================
    REDDIT
    =======================================================
    */

    let redditResult = null;


    const needsReddit =
      counts.reddit <
      MIN_REDDIT_EVIDENCE;


    if (
      SOURCE === "youtube"
    ) {

      redditResult = {
        skipped: true,
        reason: "source_not_selected",
      };

    } else if (
      !needsReddit &&
      ONLY_MISSING
    ) {

      redditResult = {
        skipped: true,
        reason: "threshold_reached",
      };

    } else if (
      !redditEnabled
    ) {

      redditResult = {
        skipped: true,
        reason: "reddit_rate_limited",
      };

    } else {

      try {

        redditResult =
          await searchReddit({
            bank,
            category,
            loanProductId,
            maxQueries:
              REDDIT_MAX_QUERIES,
            saveToDatabase:
              true,
          });


        console.log(
          "\nREDDIT RESULT:"
        );

        console.log(
          JSON.stringify(
            {
              accepted:
                redditResult.acceptedResults,

              inserted:
                redditResult.inserted,

              duplicates:
                redditResult.duplicates,

              storageErrors:
                redditResult.storageErrors,

              rateLimited:
                redditResult.rateLimited,

              errors:
                redditResult.errors,
            },
            null,
            2
          )
        );

      } catch (error) {

        redditResult = {
          failed: true,
          error:
            error?.message ||
            String(error),
        };


        console.error(
          "Reddit failed:",
          redditResult.error
        );
      }
    }


    /*
    Stop Reddit after confirmed rate limit.
    */

    if (
      isRedditRateLimited(
        redditResult
      )
    ) {

      redditEnabled =
        false;

      console.warn(
        "\nReddit rate limit detected. Reddit collection paused for this run."
      );
    }


    /*
    =======================================================
    YOUTUBE
    =======================================================
    */

    let youtubeResult = null;


    const needsYouTube =
      counts.youtube <
      MIN_YOUTUBE_EVIDENCE;


    if (
      SOURCE === "reddit"
    ) {

      youtubeResult = {
        skipped: true,
        reason: "source_not_selected",
      };

    } else if (
      !needsYouTube &&
      ONLY_MISSING
    ) {

      youtubeResult = {
        skipped: true,
        reason: "threshold_reached",
      };

    } else if (
      !youtubeEnabled
    ) {

      youtubeResult = {
        skipped: true,
        reason: "youtube_quota_exhausted",
      };

    } else {

      try {

        const queries =
          buildCleanYouTubeQueries({
            bank,
            category,
          });


        console.log(
          "\nYOUTUBE QUERIES:"
        );

        console.log(
          queries.map(
            (q) =>
              q.query
          )
        );


        youtubeResult =
          await collectYouTubeEvidence({
            apiKey:
              process.env.YOUTUBE_API_KEY,

            loanProductId,

            bank,

            category,

            queries,

            maxVideosPerQuery:
              YOUTUBE_MAX_VIDEOS_PER_QUERY,

            maxCommentsPerVideo:
              YOUTUBE_MAX_COMMENTS_PER_VIDEO,
          });


        console.log(
          "\nYOUTUBE RESULT:"
        );

        console.log(
          JSON.stringify(
            {
              commentsAccepted:
                youtubeResult.commentsAccepted,

              inserted:
                youtubeResult.inserted,

              duplicates:
                youtubeResult.duplicates,

              storageErrors:
                youtubeResult.storageErrors,

              videoCacheHits:
                youtubeResult.videoCacheHits,

              videoNetworkQueries:
                youtubeResult.videoNetworkQueries,

              commentCacheHits:
                youtubeResult.commentCacheHits,

              commentNetworkQueries:
                youtubeResult.commentNetworkQueries,

              errors:
                youtubeResult.errors,
            },
            null,
            2
          )
        );

      } catch (error) {

        youtubeResult = {
          failed: true,
          error:
            error?.message ||
            String(error),
        };


        console.error(
          "YouTube failed:",
          youtubeResult.error
        );
      }
    }


    /*
    Stop YouTube after quota exhaustion.
    */

    if (
      isYouTubeQuotaError(
        youtubeResult
      )
    ) {

      youtubeEnabled =
        false;

      console.warn(
        "\nYouTube search quota exhausted. YouTube collection paused for this run."
      );
    }


    results.push({
      bank,
      category,
      productName:
        product.productName,
      loanProductId,

      reddit:
        redditResult,

      youtube:
        youtubeResult,
    });


    /*
    -------------------------------------------------------
    DELAY
    -------------------------------------------------------
    */

    if (
      i <
      queue.length - 1
    ) {

      await sleep(
        PRODUCT_DELAY_MS
      );
    }
  }


  /*
  =========================================================
  FINAL AUDIT
  =========================================================
  */

  console.log("\n");
  console.log(
    "========================================================="
  );

  console.log(
    "FINAL GAP AUDIT"
  );

  console.log(
    "========================================================="
  );


  const audit = [];


  for (
    const product of
    allProducts
  ) {

    const id =
      product._id.toString();


    const reddit =
      await CommunityEvidence.countDocuments({
        loanProductId: id,
        sourceType:
          "reddit",
      });


    const youtube =
      await CommunityEvidence.countDocuments({
        loanProductId: id,
        sourceType:
          "youtube",
      });


    const redditComplete =
      reddit >=
      MIN_REDDIT_EVIDENCE;


    const youtubeComplete =
      youtube >=
      MIN_YOUTUBE_EVIDENCE;


    audit.push({
      bank:
        product.bankName,

      category:
        product.category,

      productName:
        product.productName,

      loanProductId:
        id,

      reddit,

      youtube,

      status:
        redditComplete &&
        youtubeComplete
          ? "COMPLETE"
          : redditComplete
            ? "YOUTUBE_REQUIRED"
            : youtubeComplete
              ? "REDDIT_REQUIRED"
              : "BOTH_REQUIRED",
    });
  }


  console.log(
    JSON.stringify(
      audit,
      null,
      2
    )
  );


  const complete =
    audit.filter(
      (item) =>
        item.status ===
        "COMPLETE"
    ).length;


  console.log(
    `\nCOMPLETE: ${complete}/${audit.length}`
  );


  console.log(
    `Reddit available for run: ${redditEnabled}`
  );

  console.log(
    `YouTube available for run: ${youtubeEnabled}`
  );


  console.log(
    "\nCollection finished."
  );
}


main()
  .catch(
    (error) => {

      console.error(
        "\nFATAL ERROR:"
      );

      console.error(
        error?.stack ||
          error?.message ||
          String(error)
      );

      process.exit(1);
    }
  );