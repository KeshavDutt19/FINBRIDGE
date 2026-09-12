import { classifyTopic } from "./topicClassifier.js";
import { classifySentiment } from "./sentimentClassifier.js";

import {
  calculateEvidenceWeight,
  freshnessWeight,
  calculateQualityScore,
  classifyExperienceType,
} from "./youtubeCollector.js";

import { saveEvidenceBatch } from "./evidenceStore.js";
import { connectDB } from "../../db.js";

import {
  startCollectionSession,
  finishCollectionSession,
  failCollectionSession,
} from "./collectionSessionService.js";

import {
  getCachedSearch,
  saveSearchCache,
} from "./searchCacheService.js";

import { buildSourceQueries } from "./queryPlanner.js";

import Parser from "rss-parser";


/*
=========================================================
REDDIT COMMUNITY EVIDENCE COLLECTOR
=========================================================

Pipeline:

Query Planner
    ↓
Search Cache
    ↓
Reddit RSS
    ↓
Rate-limit handling
    ↓
Raw result cleanup
    ↓
Bank/category validation
    ↓
Spam / irrelevant filtering
    ↓
Topic classification
    ↓
Sentiment classification
    ↓
Experience classification
    ↓
Quality score
    ↓
Freshness score
    ↓
Evidence weight
    ↓
MongoDB deduplication
    ↓
CommunityEvidence

Collection Session:

Start session
    ↓
Run collection
    ↓
Save evidence
    ↓
Finish session
    OR
Fail session

=========================================================
*/


/*
=========================================================
CONFIGURATION
=========================================================
*/

const REDDIT_SEARCH_BASE =
  "https://www.reddit.com/search.rss";

const REQUEST_DELAY_MS =
  5000;

const RETRY_BASE_DELAY_MS =
  10000;

const MAX_REDDIT_429_RETRIES =
  3;

const MIN_RELEVANCE_SCORE =
  0.45;

const MAX_RESULTS_PER_QUERY =
  25;

const CACHE_TTL_HOURS =
  24;


/*
=========================================================
RSS PARSER
=========================================================
*/

const parser =
  new Parser({
    timeout: 15000,

    headers: {
      "User-Agent":
        "FinBridgeLoanIntelligence/1.0 (community research)",
    },
  });


/*
=========================================================
BANK ALIASES
=========================================================
*/

const BANK_ALIASES = {
  "bank of baroda": [
    "bank of baroda",
    "bankofbaroda",
    "baroda",
    "bob bank",
    "bob education loan",
  ],

  "state bank of india": [
    "state bank of india",
    "sbi",
    "sbi bank",
  ],

  "punjab national bank": [
    "punjab national bank",
    "pnb",
    "pnb bank",
  ],
};


/*
=========================================================
EDUCATION LOAN CONTEXT
=========================================================
*/

const STRONG_LOAN_CONTEXT_TERMS = [
  "education loan",
  "student loan",
  "education loans",
  "student loans",
  "study loan",
  "higher education loan",
  "study abroad loan",
  "loan for education",
  "loan for college",
  "loan for university",
  "loan for studies",
  "loan for abroad studies",
];


/*
=========================================================
EDUCATION TERMS
=========================================================
*/

const EDUCATION_TERMS = [
  "education",
  "student",
  "college",
  "university",
  "higher education",
  "study abroad",
  "abroad studies",
  "masters",
  "master's",
  "btech",
  "mbbs",
  "mba",
  "acca",
  "phd",
  "course",
  "degree",
];


/*
=========================================================
PRACTICAL LOAN TERMS
=========================================================
*/

const PRACTICAL_TERMS = [
  "interest",
  "interest rate",
  "roi",
  "processing",
  "processing fee",
  "sanction",
  "sanctioned",
  "approval",
  "approved",
  "rejected",
  "rejection",
  "disbursement",
  "disbursed",
  "collateral",
  "security",
  "guarantor",
  "co-applicant",
  "cosigner",
  "documents",
  "paperwork",
  "insurance",
  "margin",
  "emi",
  "repayment",
  "moratorium",
  "branch",
  "branch manager",
  "staff",
  "manager",
  "delay",
  "delayed",
];


/*
=========================================================
DIRECT EXPERIENCE TERMS
=========================================================
*/

const EXPERIENCE_TERMS = [
  "i took",
  "i applied",
  "i had applied",
  "i got",
  "my loan",
  "my application",
  "my experience",
  "we applied",
  "we took",
  "they approved",
  "they rejected",
  "they sanctioned",
  "the branch",
  "the bank told me",
  "the bank asked me",
  "the bank said",
  "got approved",
  "got rejected",
  "got sanctioned",
  "was approved",
  "was rejected",
  "was sanctioned",
  "i faced",
  "i am facing",
  "i received",
  "they required",
  "i started repaying",
  "i am repaying",
  "i repaid",
];


/*
=========================================================
QUESTION TERMS
=========================================================
*/

const QUESTION_TERMS = [
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
];


/*
=========================================================
SPAM / UNRELATED TERMS
=========================================================
*/

const SPAM_TERMS = [
  "examheroes",
  "telegram",
  "discord",
  "whatsapp:",
  "take my exam",
  "take my test",
  "cheat",
  "bypass proctoring",
  "proxy exam",
  "pay someone",
  "subscribe",
  "visit our website",
  "contact us",
  "link in bio",
  "link in description",
  "promo",
  "affiliate",
  "discount code",
];


/*
=========================================================
UNRELATED TITLE TERMS
=========================================================
*/

const UNRELATED_TITLE_TERMS = [
  "credit card",
  "credit cards",
  "aws certification",
  "aws certified",
  "exam",
  "cheating",
  "proctoring",
  "loan apps",
  "loan app",
  "personal loan apps",
  "cash loan apps",
  "rbi approved loan apps",
  "private loan services",
];


/*
=========================================================
UNRELATED CONTENT TERMS
=========================================================
*/

const UNRELATED_CONTENT_TERMS = [
  "examheroes",
  "take my exam",
  "take my test",
  "aws certification",
  "credit card portfolio",
  "credit card points",
  "credit card rewards",
  "loan app",
  "loan apps",
  "cash advance",
  "payday loan",
  "personal loan app",
];


/*
=========================================================
TEXT HELPERS
=========================================================
*/

function cleanText(value = "") {
  return String(value)
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}


function normalize(value = "") {
  return cleanText(value)
    .toLowerCase()
    .replace(
      /[^\p{L}\p{N}\s₹%?.'-]/gu,
      " "
    )
    .replace(/\s+/g, " ")
    .trim();
}


function sleep(ms) {
  return new Promise(
    (resolve) =>
      setTimeout(resolve, ms)
  );
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


function countMatches(
  text,
  terms
) {
  return terms.reduce(
    (count, term) =>
      count +
      (
        text.includes(term)
          ? 1
          : 0
      ),
    0
  );
}


/*
=========================================================
BANK ALIAS HELPER
=========================================================
*/

function getBankAliases(
  bank = ""
) {
  const normalizedBank =
    normalize(bank);

  return (
    BANK_ALIASES[
      normalizedBank
    ] || [
      normalizedBank,
    ]
  );
}


/*
=========================================================
BANK MATCH
=========================================================
*/

function hasBankMatch(
  text,
  bank
) {
  const normalizedBank =
    normalize(bank);

  if (!normalizedBank) {
    return false;
  }

  const aliases =
    getBankAliases(bank);

  for (
    const alias of aliases
  ) {
    if (
      alias &&
      text.includes(alias)
    ) {
      return true;
    }
  }


  /*
  Explicit abbreviations.
  */

  if (
    normalizedBank ===
      "bank of baroda" &&
    (
      text.includes("bob") ||
      text.includes("baroda")
    )
  ) {
    return true;
  }


  if (
    normalizedBank ===
      "state bank of india" &&
    text.includes("sbi")
  ) {
    return true;
  }


  if (
    normalizedBank ===
      "punjab national bank" &&
    text.includes("pnb")
  ) {
    return true;
  }


  return false;
}


/*
=========================================================
CATEGORY MATCH
=========================================================
*/

function hasCategoryMatch(
  text,
  category
) {
  const normalizedCategory =
    normalize(category);

  if (!normalizedCategory) {
    return false;
  }


  if (
    normalizedCategory ===
    "education"
  ) {
    const hasLoan =
      text.includes("loan") ||
      text.includes("loans");

    const hasEducation =
      text.includes("education") ||
      text.includes("student") ||
      text.includes("study abroad") ||
      text.includes("higher education") ||
      text.includes("college") ||
      text.includes("university") ||
      text.includes("course") ||
      text.includes("degree");

    return (
      hasLoan &&
      hasEducation
    );
  }


  return (
    text.includes(
      `${normalizedCategory} loan`
    ) ||
    (
      text.includes(
        normalizedCategory
      ) &&
      text.includes("loan")
    )
  );
}


/*
=========================================================
STRONG LOAN CONTEXT
=========================================================
*/

function hasStrongLoanContext(
  text,
  category
) {
  const normalizedCategory =
    normalize(category);

  if (
    normalizedCategory ===
    "education"
  ) {
    return STRONG_LOAN_CONTEXT_TERMS.some(
      (term) =>
        text.includes(term)
    );
  }

  return text.includes(
    `${normalizedCategory} loan`
  );
}


/*
=========================================================
UNRELATED CONTENT
=========================================================
*/

function hasObviousUnrelatedContent({
  title = "",
  snippet = "",
} = {}) {
  const normalizedTitle =
    normalize(title);

  const normalizedSnippet =
    normalize(snippet);


  if (
    includesAny(
      normalizedTitle,
      UNRELATED_TITLE_TERMS
    )
  ) {
    return true;
  }


  if (
    includesAny(
      normalizedSnippet,
      UNRELATED_CONTENT_TERMS
    )
  ) {
    return true;
  }


  return false;
}


/*
=========================================================
SUBREDDIT / LANDING PAGE DETECTION
=========================================================
*/

function isSubredditLandingPage(
  item = {}
) {
  const url =
    String(
      item.url || ""
    ).toLowerCase();

  const title =
    String(
      item.title || ""
    ).toLowerCase();


  if (
    /reddit\.com\/r\/[^/]+\/?$/.test(
      url
    )
  ) {
    return true;
  }


  if (
    title.startsWith("/r/") ||
    title.includes("reddit's hub") ||
    title.includes("subreddit")
  ) {
    return true;
  }


  return false;
}


/*
=========================================================
SPAM / IRRELEVANCE
=========================================================
*/

function isSpamOrIrrelevant(
  text,
  item = {}
) {
  if (!text) {
    return true;
  }


  if (
    isSubredditLandingPage(
      item
    )
  ) {
    return true;
  }


  if (
    includesAny(
      text,
      SPAM_TERMS
    )
  ) {
    return true;
  }


  if (
    hasObviousUnrelatedContent({
      title:
        item.title || "",
      snippet:
        item.snippet || "",
    })
  ) {
    return true;
  }


  if (
    text.length < 35 &&
    !text.includes("?")
  ) {
    return true;
  }


  return false;
}


/*
=========================================================
RELEVANCE SCORE
=========================================================
*/

export function calculateRedditRelevance({
  title = "",
  snippet = "",
  bank = "",
  category = "",
} = {}) {

  const text =
    normalize(
      `${title} ${snippet}`
    );


  if (!text) {
    return 0;
  }


  /*
  Correct bank required.
  */

  if (
    !hasBankMatch(
      text,
      bank
    )
  ) {
    return 0;
  }


  /*
  Correct loan category required.
  */

  if (
    !hasCategoryMatch(
      text,
      category
    )
  ) {
    return 0;
  }


  /*
  Strong education-loan context.
  */

  if (
    !hasStrongLoanContext(
      text,
      category
    )
  ) {
    return 0;
  }


  /*
  Obvious irrelevant content.
  */

  if (
    hasObviousUnrelatedContent({
      title,
      snippet,
    })
  ) {
    return 0;
  }


  let score =
    0.45;


  /*
  Bank signal.
  */

  score +=
    0.15;


  /*
  Category signal.
  */

  score +=
    0.15;


  /*
  Practical loan details.
  */

  const practicalMatches =
    countMatches(
      text,
      PRACTICAL_TERMS
    );


  score += Math.min(
    practicalMatches *
      0.025,
    0.10
  );


  /*
  Personal experience.
  */

  if (
    includesAny(
      text,
      EXPERIENCE_TERMS
    )
  ) {
    score +=
      0.08;
  }


  /*
  Question.
  */

  if (
    text.includes("?") ||
    includesAny(
      text,
      QUESTION_TERMS
    )
  ) {
    score +=
      0.05;
  }


  return Number(
    Math.min(
      score,
      1
    ).toFixed(4)
  );
}


/*
=========================================================
FETCH REDDIT RSS
=========================================================
*/

async function fetchFeed(
  url,
  attempt = 1
) {

  try {

    const feed =
      await parser.parseURL(
        url
      );


    return {
      items:
        (feed.items || [])
          .map((item) => ({
            sourceType:
              "reddit",

            title:
              cleanText(
                item.title || ""
              ),

            url:
              item.link || "",

            snippet:
              cleanText(
                item.contentSnippet ||
                  item.content ||
                  item.summary ||
                  ""
              ).slice(
                0,
                3000
              ),

            publishedAt:
              item.isoDate ||
              item.pubDate ||
              null,

            sourceId:
              item.guid ||
              item.id ||
              item.link ||
              "",

            subreddit:
              item.categories?.[0] ||
              "",

            author:
              item.creator ||
              item.author ||
              "",
          })),

      error:
        null,
    };

  } catch (error) {

    /*
    -----------------------------------------------------
    DETECT STATUS
    -----------------------------------------------------
    */

    const rawMessage =
      error?.message ||
      String(error);


    const detectedStatus =
      error?.statusCode ??
      error?.status ??
      (
        /\b429\b/.test(
          rawMessage
        )
          ? 429
          : null
      );


    const isRateLimited =
      detectedStatus ===
      429;


    /*
    -----------------------------------------------------
    REDDIT RATE LIMIT
    -----------------------------------------------------
    */

    if (
      isRateLimited
    ) {

      /*
      Retry while attempts remain.
      */

      if (
        attempt <
        MAX_REDDIT_429_RETRIES
      ) {

        const delay =
          RETRY_BASE_DELAY_MS *
          Math.pow(
            2,
            attempt - 1
          );


        console.warn(
          `Reddit rate limited. Retry ${attempt}/${MAX_REDDIT_429_RETRIES - 1} in ${delay}ms...`
        );


        await sleep(
          delay
        );


        return fetchFeed(
          url,
          attempt + 1
        );
      }


      /*
      Retries exhausted.
      */

      return {
        items: [],

        error: {
          status: 429,

          message:
            "Reddit rate limit persisted after maximum retries.",

          rateLimited:
            true,

          retriesExhausted:
            true,
        },
      };
    }


    /*
    -----------------------------------------------------
    OTHER ERROR
    -----------------------------------------------------
    */

    return {
      items: [],

      error: {
        status:
          detectedStatus,

        message:
          rawMessage,

        rateLimited:
          false,

        retriesExhausted:
          false,
      },
    };
  }
}


/*
=========================================================
DEDUPLICATION
=========================================================
*/

function deduplicate(
  items
) {

  const seenIds =
    new Set();

  const seenUrls =
    new Set();

  const seenContent =
    new Set();


  return items.filter(
    (item) => {

      const id =
        normalize(
          item.sourceId
        );

      const url =
        normalize(
          item.url
        );

      const content =
        normalize(
          item.snippet
        );


      if (
        id &&
        seenIds.has(id)
      ) {
        return false;
      }


      if (
        url &&
        seenUrls.has(url)
      ) {
        return false;
      }


      if (
        content.length > 80 &&
        seenContent.has(
          content
        )
      ) {
        return false;
      }


      if (id) {
        seenIds.add(
          id
        );
      }


      if (url) {
        seenUrls.add(
          url
        );
      }


      if (
        content.length > 80
      ) {
        seenContent.add(
          content
        );
      }


      return true;
    }
  );
}


/*
=========================================================
CREATE REDDIT EVIDENCE
=========================================================
*/

function createRedditEvidence({
  loanProductId,
  bank,
  category,
  item,
} = {}) {

  const content =
    cleanText(
      item.snippet || ""
    );


  const relevanceScore =
    calculateRedditRelevance({
      title:
        item.title,

      snippet:
        item.snippet,

      bank,

      category,
    });


  const experienceType =
    classifyExperienceType(
      content
    );


  const qualityScore =
    calculateQualityScore({
      experienceType,

      content,
    });


  const freshness =
    freshnessWeight(
      item.publishedAt
    );


  const evidenceWeight =
    calculateEvidenceWeight({
      qualityScore,

      relevanceScore,

      freshness,
    });


  const topicResult =
    classifyTopic(
      content
    );


  return {
    loanProductId,

    sourceType:
      "reddit",

    sourceUrl:
      item.url,

    sourceId:
      item.sourceId,

    title:
      item.title,

    author:
      item.author || "",

    content,

    rawText:
      content,

    publishedAt:
      item.publishedAt
        ? new Date(
            item.publishedAt
          )
        : null,

    collectedAt:
      new Date(),

    topic:
      topicResult?.topic ||
      "other",

    sentiment:
      classifySentiment(
        content
      ),

    experienceType,

    relevanceScore,

    qualityScore,

    freshnessWeight:
      freshness,

    evidenceWeight,

    extractedClaims:
      [],

    isAccepted:
      relevanceScore >=
        MIN_RELEVANCE_SCORE &&
      !isSpamOrIrrelevant(
        normalize(
          content
        ),
        item
      ),

    hash: "",

    subreddit:
      item.subreddit || "",

    query:
      item.query || "",
  };
}


/*
=========================================================
BUILD REDDIT QUERIES
=========================================================
*/

function buildRedditQueries({
  bank,
  category,
  maxQueries = 9,
} = {}) {

  const loanName =
    category === "education"
      ? "Education Loan"
      : `${category} Loan`;


  const planned =
    buildSourceQueries({
      bank,

      category,

      loanName,

      source:
        "reddit",

      maxQueries,
    });


  return planned.map(
    (item) => ({
      ...item,

      query:
        String(
          item.query || ""
        )
          .replace(
            /\s+reddit$/i,
            ""
          )
          .trim(),
    })
  );
}


/*
=========================================================
MAIN REDDIT COLLECTION
=========================================================
*/

export async function searchReddit({
  bank,
  category,
  loanProductId,
  maxQueries = 9,
  saveToDatabase = true,
} = {}) {

  /*
  -----------------------------------------------
  VALIDATION
  -----------------------------------------------
  */

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


  if (
    saveToDatabase &&
    !loanProductId
  ) {
    throw new Error(
      "loanProductId is required when saveToDatabase is true"
    );
  }


  /*
  -----------------------------------------------
  CONNECT DATABASE
  -----------------------------------------------
  */

  if (saveToDatabase) {
    await connectDB();
  }


  /*
  -----------------------------------------------
  START COLLECTION SESSION
  -----------------------------------------------
  */

  let session =
    null;


  if (
    saveToDatabase &&
    loanProductId
  ) {

    session =
      await startCollectionSession({
        loanProductId,

        bank,

        category,
      });
  }


  try {

    /*
    ---------------------------------------------
    BUILD QUERIES
    ---------------------------------------------
    */

    const queryObjects =
      buildRedditQueries({
        bank,

        category,

        maxQueries,
      });


    /*
    ---------------------------------------------
    COLLECTION STATE
    ---------------------------------------------
    */

    const allResults =
      [];

    const errors =
      [];

    let queriesRun =
      0;

    let networkQueries =
      0;

    let cacheHits =
      0;

    let rateLimited =
      false;


    /*
    ---------------------------------------------
    RUN QUERIES
    ---------------------------------------------
    */

    for (
      const queryObject of
      queryObjects
    ) {

      const query =
        queryObject.query;


      if (!query) {
        continue;
      }


      queriesRun +=
        1;


      /*
      -------------------------------------------
      CACHE CHECK
      -------------------------------------------
      */

      let cached;

      try {

        cached =
          await getCachedSearch({
            source:
              "reddit",

            query,
          });

      } catch (cacheError) {

        /*
        Cache failure should not kill the
        entire collection. We can fall back
        to the external source.
        */

        console.warn(
          `Reddit cache lookup failed for "${query}":`,
          cacheError?.message ||
            String(cacheError)
        );

        cached = {
          found:
            false,

          fresh:
            false,

          cache:
            null,
        };
      }


      /*
      -------------------------------------------
      FRESH CACHE HIT
      -------------------------------------------
      */

      if (
        cached.found &&
        cached.fresh
      ) {

        cacheHits +=
          1;


        console.log(
          `Reddit cache hit: ${query}`
        );


        const cachedResults =
          Array.isArray(
            cached.cache?.results
          )
            ? cached.cache.results
            : [];


        for (
          const item of
          cachedResults
        ) {

          allResults.push({
            ...item,

            query,
          });
        }


        /*
        No network request.
        No Reddit delay required.
        */

        continue;
      }


      /*
      -------------------------------------------
      CACHE MISS / EXPIRED
      -------------------------------------------
      */

      console.log(
        `Reddit cache miss: ${query}`
      );


      networkQueries +=
        1;


      const url =
        `${REDDIT_SEARCH_BASE}?q=${encodeURIComponent(
          query
        )}&sort=relevance&t=all`;


      /*
      -------------------------------------------
      FETCH REDDIT
      -------------------------------------------
      */

      const result =
        await fetchFeed(
          url
        );


      /*
      -------------------------------------------
      HANDLE ERROR
      -------------------------------------------
      */

      if (
        result.error
      ) {

        errors.push({
          type:
            "search",

          query,

          ...result.error,
        });


        /*
        Stop immediately if Reddit is
        actively rate limiting us.
        */

        if (
          result.error.rateLimited
        ) {

          rateLimited =
            true;


          console.warn(
            "Reddit rate limit detected. Stopping current collection run."
          );


          break;
        }
      }


      /*
      -------------------------------------------
      CACHE SUCCESSFUL REQUEST
      -------------------------------------------
      */

      if (
        !result.error
      ) {

        try {

          await saveSearchCache({
            source:
              "reddit",

            query,

            results:
              result.items.slice(
                0,
                MAX_RESULTS_PER_QUERY
              ),

            ttlHours:
              CACHE_TTL_HOURS,
          });

        } catch (cacheError) {

          /*
          Cache storage failure should
          not invalidate the evidence we
          successfully collected.
          */

          console.warn(
            `Failed to cache Reddit query "${query}":`,
            cacheError?.message ||
              String(cacheError)
          );
        }
      }


      /*
      -------------------------------------------
      ADD RESULTS
      -------------------------------------------
      */

      for (
        const item of
        result.items.slice(
          0,
          MAX_RESULTS_PER_QUERY
        )
      ) {

        allResults.push({
          ...item,

          query,
        });
      }


      /*
      -------------------------------------------
      DELAY NETWORK REQUESTS
      -------------------------------------------
      */

      await sleep(
        REQUEST_DELAY_MS
      );
    }


    /*
    ---------------------------------------------
    RAW DEDUPLICATION
    ---------------------------------------------
    */

    const unique =
      deduplicate(
        allResults
      );


    /*
    ---------------------------------------------
    CREATE EVIDENCE
    ---------------------------------------------
    */

    const allEvidence =
      unique.map(
        (item) =>
          createRedditEvidence({
            loanProductId,

            bank,

            category,

            item,
          })
      );


    /*
    ---------------------------------------------
    ACCEPTED EVIDENCE
    ---------------------------------------------
    */

    const evidence =
      allEvidence
        .filter(
          (item) =>
            item.isAccepted
        )
        .sort(
          (a, b) =>
            b.evidenceWeight -
            a.evidenceWeight
        );


    /*
    ---------------------------------------------
    REJECTED RESULTS
    ---------------------------------------------
    */

    const rejectedResults =
      Math.max(
        unique.length -
          evidence.length,

        0
      );


    /*
    ---------------------------------------------
    DATABASE STORAGE
    ---------------------------------------------
    */

    let storageStats = {
      total:
        evidence.length,

      inserted:
        0,

      duplicates:
        0,

      skipped:
        0,

      errors:
        0,

      results:
        [],
    };


    if (
      saveToDatabase &&
      loanProductId &&
      evidence.length > 0
    ) {

      storageStats =
        await saveEvidenceBatch(
          evidence
        );
    }


    /*
    ---------------------------------------------
    FINISH COLLECTION SESSION
    ---------------------------------------------
    */

    if (session) {

      await finishCollectionSession({
        sessionId:
          session._id,

        status:
          "completed",

        queriesRun,

        resultsFound:
          allResults.length,

        resultsAccepted:
          evidence.length,

        duplicatesRemoved:
          Math.max(
            allResults.length -
              unique.length,

            0
          ),

        lowQualityRemoved:
          rejectedResults,

        errorsCount:
          errors.length +
          storageStats.errors,

        redditResults:
          evidence.length,

        youtubeResults:
          0,

        notes:
          rateLimited
            ? "Reddit collection stopped because of rate limiting."
            : `Reddit community evidence collection. Network queries: ${networkQueries}. Cache hits: ${cacheHits}.`,
      });
    }


    /*
    ---------------------------------------------
    FINAL RESULT
    ---------------------------------------------
    */

    return {
      evidence,

      queriesRun,

      networkQueries,

      cacheHits,

      rawResults:
        allResults.length,

      uniqueResults:
        unique.length,

      acceptedResults:
        evidence.length,

      inserted:
        storageStats.inserted,

      duplicates:
        storageStats.duplicates,

      skipped:
        storageStats.skipped,

      storageErrors:
        storageStats.errors,

      storageResults:
        storageStats.results,

      errors,

      rateLimited,

      sessionId:
        session?._id || null,
    };


  } catch (error) {

    /*
    ---------------------------------------------
    FAIL COLLECTION SESSION
    ---------------------------------------------
    */

    if (session) {

      try {

        await failCollectionSession({
          sessionId:
            session._id,

          error,
        });

      } catch (sessionError) {

        console.error(
          "Failed to update collection session:",
          sessionError
        );
      }
    }


    throw error;
  }
}