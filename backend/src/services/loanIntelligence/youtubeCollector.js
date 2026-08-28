import { classifyTopic } from "./topicClassifier.js";
import { classifySentiment } from "./sentimentClassifier.js";

import {
  saveEvidenceBatch,
} from "./evidenceStore.js";

import {
  connectDB,
} from "../../db.js";

import {
  startCollectionSession,
  finishCollectionSession,
  failCollectionSession,
} from "./collectionSessionService.js";

import {
  getCachedSearch,
  saveSearchCache,
} from "./searchCacheService.js";


/*
=========================================================
YOUTUBE COMMUNITY EVIDENCE COLLECTOR
=========================================================

Supported collection modes:

1. Normal search
   YouTube search.list
   ↓
   video metadata
   ↓
   comments

2. Seeded video collection
   known video IDs
   ↓
   videos.list
   ↓
   comments.list

The seeded mode is particularly useful when
search.list quota is exhausted.

=========================================================
*/


/*
=========================================================
CONFIGURATION
=========================================================
*/

const YOUTUBE_API =
  "https://www.googleapis.com/youtube/v3";

const DEFAULT_MAX_VIDEOS =
  10;

const DEFAULT_MAX_COMMENTS_PER_VIDEO =
  30;

const MIN_VIDEO_RELEVANCE =
  0.30;

const MIN_COMMENT_RELEVANCE =
  0.30;

const CACHE_TTL_HOURS =
  24;


/*
=========================================================
GENERAL LOAN TERMS
=========================================================
*/

const LOAN_TERMS = [
  "loan",
  "loans",
  "emi",
  "interest",
  "interest rate",
  "processing fee",
  "processing",
  "sanction",
  "sanctioned",
  "approval",
  "approved",
  "rejected",
  "rejection",
  "disbursement",
  "disbursed",
  "repayment",
  "moratorium",
  "collateral",
  "security",
  "insurance",
  "margin",
  "documents",
  "paperwork",
  "branch",
  "branch manager",
  "bank manager",
  "staff",
  "delay",
  "delayed",
];


/*
=========================================================
EDUCATION TERMS
=========================================================
*/

const EDUCATION_TERMS = [
  "education loan",
  "student loan",
  "student loans",
  "education loans",
  "study loan",
  "study abroad",
  "higher education",
  "college",
  "university",
  "student",
  "tuition",
  "course",
  "degree",
  "masters",
  "master's",
  "mba",
  "btech",
  "mbbs",
  "phd",
];


/*
=========================================================
CAR TERMS
=========================================================
*/

const CAR_TERMS = [
  "car loan",
  "car loans",
  "auto loan",
  "vehicle loan",
  "vehicle loans",
  "car finance",
  "vehicle finance",
  "new car",
  "used car",
  "pre owned car",
  "pre-owned car",
  "automobile loan",
];


/*
=========================================================
HOME TERMS
=========================================================
*/

const HOME_TERMS = [
  "home loan",
  "home loans",
  "housing loan",
  "housing loans",
  "mortgage",
  "property loan",
  "home finance",
  "housing finance",
  "house loan",
  "home purchase",
];


/*
=========================================================
EXPERIENCE PHRASES
=========================================================
*/

const EXPERIENCE_PHRASES = [
  "i took",
  "i applied",
  "i got",
  "i received",
  "my loan",
  "my experience",
  "my branch",
  "i visited",
  "they asked me",
  "i was approved",
  "i was rejected",
  "my application",
  "we applied",
  "we took",
  "we received",
  "i am getting",
  "i am facing",
  "i faced",
  "they told me",
  "bank told me",
  "branch told me",
  "they required",
  "they asked",
  "i started repaying",
  "i am repaying",
  "i repaid",
];


/*
=========================================================
QUESTION PHRASES
=========================================================
*/

const QUESTION_PHRASES = [
  "which bank",
  "should i",
  "can i",
  "can we",
  "how can i",
  "does",
  "do they",
  "is it possible",
  "what documents",
  "what is the interest",
  "how long",
  "anyone know",
  "please suggest",
  "can i get",
  "can i take",
  "is there",
  "are there",
  "required above",
  "security required",
  "without collateral",
];


/*
=========================================================
PROMOTIONAL PHRASES
=========================================================
*/

const PROMOTIONAL_PHRASES = [
  "subscribe",
  "visit our website",
  "contact us",
  "call us",
  "dm us",
  "link in description",
  "apply now",
  "best deals",
  "limited offer",
  "our services",
  "our company",
  "discount code",
  "affiliate",
];


/*
=========================================================
BANK ALIASES
=========================================================
*/

const BANK_ALIASES = {
  "bank of baroda": [
    "bank of baroda",
    "bankofbaroda",
    "baroda bank",
    "baroda",
    "bob",
  ],

  "state bank of india": [
    "state bank of india",
    "state bank",
    "sbi",
  ],

  "punjab national bank": [
    "punjab national bank",
    "punjab national",
    "pnb",
  ],
};


/*
=========================================================
TEXT HELPERS
=========================================================
*/

function normalizeText(
  text = ""
) {
  return String(text)
    .replace(/\s+/g, " ")
    .trim();
}


function normalize(
  text = ""
) {
  return normalizeText(
    text
  ).toLowerCase();
}


function includesAny(
  text,
  terms
) {
  return terms.some(
    (term) =>
      text.includes(
        term
      )
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
CATEGORY TERMS
=========================================================
*/

function getCategoryTerms(
  category = ""
) {

  const normalized =
    normalize(category);


  if (
    normalized ===
    "education"
  ) {
    return EDUCATION_TERMS;
  }


  if (
    normalized ===
    "car"
  ) {
    return CAR_TERMS;
  }


  if (
    normalized ===
    "home"
  ) {
    return HOME_TERMS;
  }


  return [];
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
    BANK_ALIASES[
      normalizedBank
    ] || [
      normalizedBank,
    ];


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
  text,
  category
) {

  const terms =
    getCategoryTerms(
      category
    );


  return terms.some(
    (term) =>
      text.includes(term)
  );
}


/*
=========================================================
CALCULATE KEYWORD RELEVANCE
=========================================================
*/

function calculateKeywordRelevance(
  text,
  category
) {

  const normalized =
    normalize(text);


  const categoryTerms =
    getCategoryTerms(
      category
    );


  const categoryMatches =
    countMatches(
      normalized,
      categoryTerms
    );


  const loanMatches =
    countMatches(
      normalized,
      LOAN_TERMS
    );


  const total =
    Math.min(
      categoryMatches * 0.10,
      0.50
    ) +
    Math.min(
      loanMatches * 0.03,
      0.25
    );


  return Math.min(
    total,
    1
  );
}


/*
=========================================================
VIDEO RELEVANCE
=========================================================
*/

export function calculateVideoRelevance({
  title = "",
  description = "",
  bank = "",
  category = "",
} = {}) {

  const text =
    normalize(
      `${title} ${description}`
    );


  if (!text) {
    return 0;
  }


  let score = 0;


  /*
  Bank.
  */

  if (
    hasBankMatch(
      text,
      bank
    )
  ) {
    score += 0.35;
  }


  /*
  Category.
  */

  if (
    hasCategoryMatch(
      text,
      category
    )
  ) {
    score += 0.20;
  }


  /*
  Loan.
  */

  if (
    text.includes("loan")
  ) {
    score += 0.15;
  }


  /*
  Experience/review.
  */

  if (
    includesAny(
      text,
      [
        "experience",
        "review",
        "borrower",
        "customer",
        "process",
        "how to",
      ]
    )
  ) {
    score += 0.15;
  }


  /*
  Practical terms.
  */

  if (
    includesAny(
      text,
      [
        "interest",
        "emi",
        "approval",
        "sanction",
        "disbursement",
        "processing",
        "collateral",
      ]
    )
  ) {
    score += 0.15;
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
COMMENT RELEVANCE
=========================================================
*/

export function calculateCommentRelevance({
  content = "",
  bank = "",
  category = "",
} = {}) {

  const text =
    normalize(
      content
    );


  if (!text) {
    return 0;
  }


  let score = 0;


  /*
  Bank.
  */

  if (
    hasBankMatch(
      text,
      bank
    )
  ) {
    score += 0.25;
  }


  /*
  Correct product category.

  This is the important change:
  Car Loan and Home Loan comments now
  receive category relevance instead of
  being forced through education-loan logic.
  */

  if (
    hasCategoryMatch(
      text,
      category
    )
  ) {
    score += 0.30;
  }


  /*
  General loan context.
  */

  if (
    text.includes("loan")
  ) {
    score += 0.15;
  }


  /*
  Keyword relevance.
  */

  score +=
    calculateKeywordRelevance(
      text,
      category
    ) * 0.20;


  /*
  Personal experience.
  */

  if (
    includesAny(
      text,
      EXPERIENCE_PHRASES
    )
  ) {
    score += 0.15;
  }


  /*
  Question.
  */

  if (
    text.includes("?") ||
    includesAny(
      text,
      QUESTION_PHRASES
    )
  ) {
    score += 0.05;
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
EXPERIENCE CLASSIFICATION
=========================================================
*/

export function classifyExperienceType(
  text = ""
) {

  const normalized =
    normalize(text);


  if (!normalized) {
    return "general_discussion";
  }


  if (
    includesAny(
      normalized,
      PROMOTIONAL_PHRASES
    )
  ) {
    return "promotional";
  }


  if (
    includesAny(
      normalized,
      EXPERIENCE_PHRASES
    )
  ) {
    return "direct_experience";
  }


  if (
    normalized.includes("?") ||
    includesAny(
      normalized,
      QUESTION_PHRASES
    )
  ) {
    return "meaningful_question";
  }


  if (
    normalized.length >=
    250
  ) {
    return "detailed_discussion";
  }


  return "general_discussion";
}


/*
=========================================================
QUALITY SCORE
=========================================================
*/

export function calculateQualityScore({
  experienceType,
  content = "",
} = {}) {

  const baseScores = {
    direct_experience: 1.00,
    detailed_discussion: 0.85,
    meaningful_question: 0.65,
    general_discussion: 0.40,
    promotional: 0.20,
  };


  let score =
    baseScores[
      experienceType
    ] ?? 0.40;


  const text =
    normalize(content);


  if (
    /₹?\s?\d+(?:\.\d+)?\s?(lakh|lakhs|cr|crore|crores|k|thousand|million)/i.test(
      text
    )
  ) {
    score += 0.05;
  }


  if (
    /\b\d+\s*(day|days|week|weeks|month|months|year|years)\b/i.test(
      text
    )
  ) {
    score += 0.05;
  }


  if (
    includesAny(
      text,
      [
        "interest",
        "emi",
        "sanction",
        "disbursement",
        "processing",
        "collateral",
        "repayment",
      ]
    )
  ) {
    score += 0.05;
  }


  return Math.min(
    score,
    1
  );
}


/*
=========================================================
FRESHNESS
=========================================================
*/

export function freshnessWeight(
  publishedAt
) {

  if (!publishedAt) {
    return 0.70;
  }


  const timestamp =
    new Date(
      publishedAt
    ).getTime();


  if (
    Number.isNaN(
      timestamp
    )
  ) {
    return 0.70;
  }


  const ageDays =
    (
      Date.now() -
      timestamp
    ) /
    (
      1000 *
      60 *
      60 *
      24
    );


  if (
    ageDays <= 90
  ) {
    return 1.00;
  }


  if (
    ageDays <= 365
  ) {
    return 0.90;
  }


  if (
    ageDays <= 730
  ) {
    return 0.75;
  }


  if (
    ageDays <= 1460
  ) {
    return 0.55;
  }


  return 0.35;
}


/*
=========================================================
EVIDENCE WEIGHT
=========================================================
*/

export function calculateEvidenceWeight({
  qualityScore = 0,
  relevanceScore = 0,
  freshness = 0.7,
} = {}) {

  return Number(
    (
      qualityScore *
      relevanceScore *
      freshness
    ).toFixed(4)
  );
}


/*
=========================================================
SEARCH YOUTUBE VIDEOS
=========================================================
*/

export async function searchYouTubeVideos({
  apiKey,
  query,
  maxResults =
    DEFAULT_MAX_VIDEOS,
  publishedAfter,
} = {}) {

  if (!apiKey) {
    throw new Error(
      "YouTube API key is required"
    );
  }


  if (!query) {
    throw new Error(
      "YouTube search query is required"
    );
  }


  const cacheQuery =
    `youtube:video:${query}`;


  try {

    const cached =
      await getCachedSearch({
        source:
          "youtube",

        query:
          cacheQuery,
      });


    if (
      cached.found &&
      cached.fresh
    ) {

      console.log(
        `YouTube video cache hit: ${query}`
      );


      const cachedResponse =
        cached.cache?.results?.[0];


      if (
        cachedResponse
      ) {

        return {
          ...cachedResponse,
          _finbridgeCached: true,
        };
      }
    }

  } catch (error) {

    console.warn(
      "YouTube video cache lookup failed:",
      error?.message ||
        String(error)
    );
  }


  console.log(
    `YouTube video cache miss: ${query}`
  );


  const url =
    new URL(
      `${YOUTUBE_API}/search`
    );


  url.searchParams.set(
    "part",
    "snippet"
  );

  url.searchParams.set(
    "q",
    query
  );

  url.searchParams.set(
    "type",
    "video"
  );

  url.searchParams.set(
    "maxResults",
    String(
      Math.min(
        maxResults,
        50
      )
    )
  );


  if (publishedAfter) {

    url.searchParams.set(
      "publishedAfter",
      new Date(
        publishedAfter
      ).toISOString()
    );
  }


  url.searchParams.set(
    "key",
    apiKey
  );


  const response =
    await fetch(url);


  if (!response.ok) {

    const body =
      await response.text();


    throw new Error(
      `YouTube video search failed: ${response.status} ${body}`
    );
  }


  const data =
    await response.json();


  try {

    await saveSearchCache({
      source:
        "youtube",

      query:
        cacheQuery,

      results:
        [data],

      ttlHours:
        CACHE_TTL_HOURS,
    });

  } catch (error) {

    console.warn(
      "YouTube video cache save failed:",
      error?.message ||
        String(error)
    );
  }


  return {
    ...data,
    _finbridgeCached: false,
  };
}


/*
=========================================================
GET YOUTUBE VIDEO DETAILS
=========================================================

Uses videos.list rather than search.list.

This allows seeded video collection without consuming
YouTube search.list quota.

=========================================================
*/

export async function getYouTubeVideoDetails({
  apiKey,
  videoId,
} = {}) {

  if (!apiKey) {
    throw new Error(
      "YouTube API key is required"
    );
  }


  if (!videoId) {
    throw new Error(
      "YouTube videoId is required"
    );
  }


  const cacheQuery =
    `youtube:video-details:${videoId}`;


  try {

    const cached =
      await getCachedSearch({
        source:
          "youtube",

        query:
          cacheQuery,
      });


    if (
      cached.found &&
      cached.fresh
    ) {

      const response =
        cached.cache?.results?.[0];


      if (
        response
      ) {

        return {
          ...response,
          _finbridgeCached: true,
        };
      }
    }

  } catch (error) {

    console.warn(
      "YouTube video details cache lookup failed:",
      error?.message ||
        String(error)
    );
  }


  const url =
    new URL(
      `${YOUTUBE_API}/videos`
    );


  url.searchParams.set(
    "part",
    "snippet"
  );

  url.searchParams.set(
    "id",
    videoId
  );

  url.searchParams.set(
    "key",
    apiKey
  );


  const response =
    await fetch(url);


  if (!response.ok) {

    const body =
      await response.text();


    throw new Error(
      `YouTube video details failed: ${response.status} ${body}`
    );
  }


  const data =
    await response.json();


  try {

    await saveSearchCache({
      source:
        "youtube",

      query:
        cacheQuery,

      results:
        [data],

      ttlHours:
        CACHE_TTL_HOURS,
    });

  } catch (error) {

    console.warn(
      "YouTube video details cache save failed:",
      error?.message ||
        String(error)
    );
  }


  return {
    ...data,
    _finbridgeCached: false,
  };
}


/*
=========================================================
COMMENT SEARCH
=========================================================
*/

export async function searchYouTubeComments({
  apiKey,
  videoId,
  searchTerms,
  maxResults = 100,
} = {}) {

  if (!apiKey) {
    throw new Error(
      "YouTube API key is required"
    );
  }


  if (!videoId) {
    throw new Error(
      "YouTube videoId is required"
    );
  }


  const cacheTerms =
    searchTerms ||
    "all";


  const cacheQuery =
    `youtube:comments:${videoId}:${cacheTerms}`;


  try {

    const cached =
      await getCachedSearch({
        source:
          "youtube",

        query:
          cacheQuery,
      });


    if (
      cached.found &&
      cached.fresh
    ) {

      console.log(
        `YouTube comment cache hit: ${videoId}`
      );


      const cachedResponse =
        cached.cache?.results?.[0];


      if (
        cachedResponse
      ) {

        return {
          ...cachedResponse,
          _finbridgeCached: true,
        };
      }
    }

  } catch (error) {

    console.warn(
      "YouTube comment cache lookup failed:",
      error?.message ||
        String(error)
    );
  }


  console.log(
    `YouTube comment cache miss: ${videoId}`
  );


  const url =
    new URL(
      `${YOUTUBE_API}/commentThreads`
    );


  url.searchParams.set(
    "part",
    "snippet"
  );

  url.searchParams.set(
    "videoId",
    videoId
  );

  url.searchParams.set(
    "maxResults",
    String(
      Math.min(
        maxResults,
        100
      )
    )
  );

  url.searchParams.set(
    "textFormat",
    "plainText"
  );


  if (searchTerms) {

    url.searchParams.set(
      "searchTerms",
      searchTerms
    );
  }


  url.searchParams.set(
    "key",
    apiKey
  );


  const response =
    await fetch(url);


  if (!response.ok) {

    const body =
      await response.text();


    throw new Error(
      `YouTube comment API failed: ${response.status} ${body}`
    );
  }


  const data =
    await response.json();


  try {

    await saveSearchCache({
      source:
        "youtube",

      query:
        cacheQuery,

      results:
        [data],

      ttlHours:
        CACHE_TTL_HOURS,
    });

  } catch (error) {

    console.warn(
      "YouTube comment cache save failed:",
      error?.message ||
        String(error)
    );
  }


  return {
    ...data,
    _finbridgeCached: false,
  };
}


/*
=========================================================
EXTRACT COMMENTS
=========================================================
*/

export function extractComments(
  apiResponse
) {

  const items =
    apiResponse?.items;


  if (
    !Array.isArray(items)
  ) {
    return [];
  }


  return items
    .map(
      (item) => {

        const snippet =
          item
            ?.snippet
            ?.topLevelComment
            ?.snippet;


        if (!snippet) {
          return null;
        }


        return {

          sourceId:
            item?.id ||
            "",

          content:
            normalizeText(
              snippet.textDisplay ||
                snippet.textOriginal ||
                ""
            ),

          author:
            snippet.authorDisplayName ||
            "",

          publishedAt:
            snippet.publishedAt ||
            null,

          updatedAt:
            snippet.updatedAt ||
            null,

          likeCount:
            Number(
              snippet.likeCount ||
                0
            ),
        };
      }
    )
    .filter(Boolean);
}


/*
=========================================================
EXTRACT VIDEOS
=========================================================
*/

export function extractVideos(
  apiResponse,
  {
    bank = "",
    category = "",
  } = {}
) {

  const items =
    apiResponse?.items;


  if (
    !Array.isArray(items)
  ) {
    return [];
  }


  return items
    .map(
      (item) => {

        const videoId =
          item?.id?.videoId ||
          item?.id;


        const snippet =
          item?.snippet;


        if (
          !videoId ||
          !snippet
        ) {
          return null;
        }


        const title =
          normalizeText(
            snippet.title ||
              ""
          );


        const description =
          normalizeText(
            snippet.description ||
              ""
          );


        const relevanceScore =
          calculateVideoRelevance({
            title,
            description,
            bank,
            category,
          });


        return {

          id:
            videoId,

          title,

          description,

          channelTitle:
            snippet.channelTitle ||
            "",

          publishedAt:
            snippet.publishedAt ||
            null,

          url:
            `https://www.youtube.com/watch?v=${videoId}`,

          relevanceScore,
        };
      }
    )
    .filter(Boolean)
    .filter(
      (video) =>
        video.relevanceScore >=
        MIN_VIDEO_RELEVANCE
    )
    .sort(
      (a, b) =>
        b.relevanceScore -
        a.relevanceScore
    );
}


/*
=========================================================
CREATE EVIDENCE
=========================================================
*/

export function createYouTubeEvidence({
  loanProductId,
  bank,
  category,
  video,
  comment,
} = {}) {

  const content =
    normalizeText(
      comment?.content ||
        ""
    );


  const relevanceScore =
    calculateCommentRelevance({
      content,
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
      comment?.publishedAt
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
      "youtube",

    sourceUrl:
      video?.url ||
      (
        video?.id
          ? `https://www.youtube.com/watch?v=${video.id}`
          : ""
      ),

    sourceId:
      comment?.sourceId ||
      "",

    title:
      video?.title ||
      "",

    author:
      comment?.author ||
      "",

    content,

    rawText:
      content,

    publishedAt:
      comment?.publishedAt
        ? new Date(
            comment.publishedAt
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
        MIN_COMMENT_RELEVANCE &&
      experienceType !==
        "promotional",

    hash:
      "",
    
    videoRelevanceScore:
      video?.relevanceScore ||
      0,
  };
}


/*
=========================================================
SEEDED VIDEO COLLECTION
=========================================================

This is the important new function.

It never calls search.list.

=========================================================
*/

export async function collectSeededYouTubeEvidence({
  apiKey,
  loanProductId,
  bank,
  category,
  videoIds = [],
  maxCommentsPerVideo =
    DEFAULT_MAX_COMMENTS_PER_VIDEO,
} = {}) {

  if (!apiKey) {
    throw new Error(
      "YouTube API key is required"
    );
  }


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


  if (
    !Array.isArray(videoIds)
  ) {
    throw new Error(
      "videoIds must be an array"
    );
  }


  await connectDB();


  const session =
    await startCollectionSession({
      loanProductId,
      bank,
      category,
    });


  try {

    const evidence =
      [];

    const seenCommentIds =
      new Set();

    const seenVideoIds =
      new Set();

    const errors =
      [];


    let videosFound =
      0;

    let videosAccepted =
      0;

    let commentsFound =
      0;

    let commentsAccepted =
      0;

    let videoCacheHits =
      0;

    let videoNetworkQueries =
      0;

    let commentCacheHits =
      0;

    let commentNetworkQueries =
      0;


    /*
    -------------------------------------------------------
    UNIQUE VIDEO IDS
    -------------------------------------------------------
    */

    const uniqueVideoIds =
      [
        ...new Set(
          videoIds
            .map(
              (id) =>
                String(id || "")
                  .trim()
            )
            .filter(Boolean)
        ),
      ];


    /*
    -------------------------------------------------------
    PROCESS VIDEOS
    -------------------------------------------------------
    */

    for (
      const videoId of
      uniqueVideoIds
    ) {

      try {

        const response =
          await getYouTubeVideoDetails({
            apiKey,
            videoId,
          });


        if (
          response?._finbridgeCached
        ) {
          videoCacheHits +=
            1;
        } else {
          videoNetworkQueries +=
            1;
        }


        const rawVideo =
          response?.items?.[0];


        if (!rawVideo?.snippet) {
          continue;
        }


        videosFound +=
          1;


        const video =
          extractVideos(
            response,
            {
              bank,
              category,
            }
          )[0];


        if (!video) {
          continue;
        }


        if (
          seenVideoIds.has(
            video.id
          )
        ) {
          continue;
        }


        seenVideoIds.add(
          video.id
        );


        videosAccepted +=
          1;


        /*
        ---------------------------------------------------
        COMMENTS
        ---------------------------------------------------
        */

        const commentResponse =
          await searchYouTubeComments({
            apiKey,

            videoId:
              video.id,

            searchTerms:
              "loan",

            maxResults:
              maxCommentsPerVideo,
          });


        if (
          commentResponse?._finbridgeCached
        ) {
          commentCacheHits +=
            1;
        } else {
          commentNetworkQueries +=
            1;
        }


        const comments =
          extractComments(
            commentResponse
          );


        commentsFound +=
          comments.length;


        /*
        ---------------------------------------------------
        BUILD EVIDENCE
        ---------------------------------------------------
        */

        for (
          const comment of
          comments
        ) {

          if (
            !comment.content
          ) {
            continue;
          }


          if (
            comment.sourceId &&
            seenCommentIds.has(
              comment.sourceId
            )
          ) {
            continue;
          }


          if (
            comment.sourceId
          ) {

            seenCommentIds.add(
              comment.sourceId
            );
          }


          const item =
            createYouTubeEvidence({
              loanProductId,

              bank,

              category,

              video,

              comment,
            });


          if (
            !item.isAccepted
          ) {
            continue;
          }


          item.query =
            `seeded:${video.id}`;


          commentsAccepted +=
            1;


          evidence.push(
            item
          );
        }

      } catch (error) {

        errors.push({
          type:
            "seeded_video",

          videoId,

          error:
            error?.message ||
            String(error),
        });
      }
    }


    /*
    -------------------------------------------------------
    SAVE
    -------------------------------------------------------
    */

    const storageStats =
      await saveEvidenceBatch(
        evidence
      );


    /*
    -------------------------------------------------------
    SESSION
    -------------------------------------------------------
    */

    await finishCollectionSession({
      sessionId:
        session._id,

      status:
        "completed",

      queriesRun:
        uniqueVideoIds.length,

      resultsFound:
        videosFound +
        commentsFound,

      resultsAccepted:
        evidence.length,

      duplicatesRemoved:
        Math.max(
          commentsFound -
            evidence.length,
          0
        ),

      lowQualityRemoved:
        Math.max(
          commentsFound -
            commentsAccepted,
          0
        ),

      errorsCount:
        errors.length +
        storageStats.errors,

      redditResults:
        0,

      youtubeResults:
        evidence.length,

      notes:
        `Seeded YouTube collection. Video network queries: ${videoNetworkQueries}. Video cache hits: ${videoCacheHits}. Comment network queries: ${commentNetworkQueries}. Comment cache hits: ${commentCacheHits}.`,
    });


    return {

      evidence,

      videosFound,

      videosAccepted,

      commentsFound,

      commentsAccepted,

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

      videoCacheHits,

      videoNetworkQueries,

      commentCacheHits,

      commentNetworkQueries,

      sessionId:
        session._id,
    };

  } catch (error) {

    try {

      await failCollectionSession({
        sessionId:
          session._id,

        error,
      });

    } catch (sessionError) {

      console.error(
        "Failed to update YouTube collection session:",
        sessionError
      );
    }


    throw error;
  }
}


/*
=========================================================
NORMAL SEARCH COLLECTION
=========================================================
*/

export async function collectYouTubeEvidence({
  apiKey,
  loanProductId,
  bank,
  category,
  queries = [],
  maxVideosPerQuery =
    DEFAULT_MAX_VIDEOS,
  maxCommentsPerVideo =
    DEFAULT_MAX_COMMENTS_PER_VIDEO,
} = {}) {

  /*
  For the ordinary search-based mode, use the same
  proven pipeline as before.
  */

  if (!apiKey) {
    throw new Error(
      "YouTube API key is required"
    );
  }

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

  if (
    !Array.isArray(
      queries
    )
  ) {
    throw new Error(
      "queries must be an array"
    );
  }

  await connectDB();

  const session =
    await startCollectionSession({
      loanProductId,
      bank,
      category,
    });

  try {

    const evidence = [];
    const seenCommentIds = new Set();
    const seenVideoIds = new Set();
    const errors = [];

    let videosFound = 0;
    let videosAccepted = 0;
    let commentsFound = 0;
    let commentsAccepted = 0;

    let videoCacheHits = 0;
    let videoNetworkQueries = 0;
    let commentCacheHits = 0;
    let commentNetworkQueries = 0;

    let queriesRun = 0;


    for (
      const queryItem of
      queries
    ) {

      const query =
        typeof queryItem ===
          "string"
          ? queryItem
          : queryItem?.query;


      if (!query) {
        continue;
      }


      queriesRun += 1;


      try {

        const videoResponse =
          await searchYouTubeVideos({
            apiKey,
            query,
            maxResults:
              maxVideosPerQuery,
          });


        if (
          videoResponse?._finbridgeCached
        ) {
          videoCacheHits += 1;
        } else {
          videoNetworkQueries += 1;
        }


        const rawCount =
          Array.isArray(
            videoResponse?.items
          )
            ? videoResponse.items.length
            : 0;


        videosFound +=
          rawCount;


        const videos =
          extractVideos(
            videoResponse,
            {
              bank,
              category,
            }
          );


        for (
          const video of
          videos
        ) {

          if (
            seenVideoIds.has(
              video.id
            )
          ) {
            continue;
          }


          seenVideoIds.add(
            video.id
          );


          videosAccepted += 1;


          try {

            const commentResponse =
              await searchYouTubeComments({
                apiKey,

                videoId:
                  video.id,

                searchTerms:
                  "loan",

                maxResults:
                  maxCommentsPerVideo,
              });


            if (
              commentResponse?._finbridgeCached
            ) {
              commentCacheHits += 1;
            } else {
              commentNetworkQueries += 1;
            }


            const comments =
              extractComments(
                commentResponse
              );


            commentsFound +=
              comments.length;


            for (
              const comment of
              comments
            ) {

              if (
                !comment.content
              ) {
                continue;
              }


              if (
                comment.sourceId &&
                seenCommentIds.has(
                  comment.sourceId
                )
              ) {
                continue;
              }


              if (
                comment.sourceId
              ) {
                seenCommentIds.add(
                  comment.sourceId
                );
              }


              const item =
                createYouTubeEvidence({
                  loanProductId,
                  bank,
                  category,
                  video,
                  comment,
                });


              if (
                !item.isAccepted
              ) {
                continue;
              }


              item.query =
                query;


              commentsAccepted +=
                1;


              evidence.push(
                item
              );
            }

          } catch (error) {

            errors.push({
              type:
                "comments",

              videoId:
                video.id,

              query,

              error:
                error?.message ||
                String(error),
            });
          }
        }

      } catch (error) {

        errors.push({
          type:
            "search",

          query,

          status:
            /429/.test(
              error?.message ||
              ""
            )
              ? 429
              : null,

          error:
            error?.message ||
            String(error),
        });
      }
    }


    const storageStats =
      await saveEvidenceBatch(
        evidence
      );


    await finishCollectionSession({
      sessionId:
        session._id,

      status:
        "completed",

      queriesRun,

      resultsFound:
        videosFound +
        commentsFound,

      resultsAccepted:
        evidence.length,

      duplicatesRemoved:
        0,

      lowQualityRemoved:
        Math.max(
          commentsFound -
            commentsAccepted,
          0
        ),

      errorsCount:
        errors.length +
        storageStats.errors,

      redditResults:
        0,

      youtubeResults:
        evidence.length,

      notes:
        "YouTube community evidence collection",
    });


    return {

      evidence,

      queriesRun,

      videosFound,

      videosAccepted,

      commentsFound,

      commentsAccepted,

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

      videoCacheHits,

      videoNetworkQueries,

      commentCacheHits,

      commentNetworkQueries,

      sessionId:
        session._id,
    };

  } catch (error) {

    try {

      await failCollectionSession({
        sessionId:
          session._id,

        error,
      });

    } catch (sessionError) {

      console.error(
        "Failed to update YouTube collection session:",
        sessionError
      );
    }

    throw error;
  }
}