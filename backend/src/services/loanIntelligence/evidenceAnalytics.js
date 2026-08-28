import mongoose from "mongoose";
import CommunityEvidence from "../../models/CommunityEvidence.js";


/*
=========================================================
EVIDENCE ANALYTICS
=========================================================

Aggregates accepted community evidence for one loan.

Important:
Aggregation pipelines require an actual MongoDB
ObjectId. Mongoose does not reliably cast the string
inside $match for us.

=========================================================
*/


export async function getEvidenceAnalytics({
  loanProductId,
} = {}) {
  if (!loanProductId) {
    throw new Error(
      "loanProductId is required"
    );
  }


  /*
  -------------------------------------------------------
  CONVERT STRING ID -> MONGODB OBJECTID
  -------------------------------------------------------
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
  -------------------------------------------------------
  COMMON MATCH FILTER
  -------------------------------------------------------
  */

  const filter = {
    loanProductId:
      loanObjectId,

    isAccepted:
      true,
  };


  /*
  -------------------------------------------------------
  RUN ANALYTICS
  -------------------------------------------------------
  */

  const [
    totalEvidence,

    sourceBreakdown,

    experienceBreakdown,

    sentimentBreakdown,

    topicBreakdown,

    weightedEvidence,

    recentEvidence,
  ] = await Promise.all([
    /*
    TOTAL
    */

    CommunityEvidence.countDocuments(
      {
        loanProductId:
          loanObjectId,

        isAccepted:
          true,
      }
    ),


    /*
    SOURCE
    */

    CommunityEvidence.aggregate([
      {
        $match: filter,
      },

      {
        $group: {
          _id:
            "$sourceType",

          count: {
            $sum: 1,
          },
        },
      },

      {
        $sort: {
          count: -1,
        },
      },
    ]),


    /*
    EXPERIENCE TYPE
    */

    CommunityEvidence.aggregate([
      {
        $match: filter,
      },

      {
        $group: {
          _id:
            "$experienceType",

          count: {
            $sum: 1,
          },
        },
      },

      {
        $sort: {
          count: -1,
        },
      },
    ]),


    /*
    SENTIMENT
    */

    CommunityEvidence.aggregate([
      {
        $match: filter,
      },

      {
        $group: {
          _id:
            "$sentiment",

          count: {
            $sum: 1,
          },
        },
      },

      {
        $sort: {
          count: -1,
        },
      },
    ]),


    /*
    TOPICS
    */

    CommunityEvidence.aggregate([
      {
        $match: filter,
      },

      {
        $group: {
          _id:
            "$topic",

          count: {
            $sum: 1,
          },

          averageWeight: {
            $avg:
              "$evidenceWeight",
          },
        },
      },

      {
        $sort: {
          count: -1,
        },
      },
    ]),


    /*
    WEIGHTED SUMMARY
    */

    CommunityEvidence.aggregate([
      {
        $match: filter,
      },

      {
        $group: {
          _id: null,

          averageRelevance: {
            $avg:
              "$relevanceScore",
          },

          averageQuality: {
            $avg:
              "$qualityScore",
          },

          averageFreshness: {
            $avg:
              "$freshnessWeight",
          },

          averageEvidenceWeight: {
            $avg:
              "$evidenceWeight",
          },

          totalEvidenceWeight: {
            $sum:
              "$evidenceWeight",
          },
        },
      },
    ]),


    /*
    RECENT EVIDENCE
    */

    CommunityEvidence.find({
      loanProductId:
        loanObjectId,

      isAccepted:
        true,
    })
      .sort({
        publishedAt: -1,
      })
      .limit(10)
      .select(
        "sourceType sourceUrl title author content topic sentiment experienceType relevanceScore qualityScore freshnessWeight evidenceWeight publishedAt"
      )
      .lean(),
  ]);


  /*
  -------------------------------------------------------
  CONVERT SOURCE BREAKDOWN
  -------------------------------------------------------
  */

  const sources = {};

  for (
    const item of sourceBreakdown
  ) {
    if (item._id) {
      sources[item._id] =
        item.count;
    }
  }


  /*
  -------------------------------------------------------
  EXPERIENCE BREAKDOWN
  -------------------------------------------------------
  */

  const experiences = {};

  for (
    const item of experienceBreakdown
  ) {
    if (item._id) {
      experiences[item._id] =
        item.count;
    }
  }


  /*
  -------------------------------------------------------
  SENTIMENT BREAKDOWN
  -------------------------------------------------------
  */

  const sentiments = {};

  for (
    const item of sentimentBreakdown
  ) {
    if (item._id) {
      sentiments[item._id] =
        item.count;
    }
  }


  /*
  -------------------------------------------------------
  TOPIC BREAKDOWN
  -------------------------------------------------------
  */

  const topics = {};

  for (
    const item of topicBreakdown
  ) {
    if (item._id) {
      topics[item._id] = {
        count:
          item.count,

        averageWeight:
          Number(
            (
              item.averageWeight ||
              0
            ).toFixed(4)
          ),
      };
    }
  }


  /*
  -------------------------------------------------------
  WEIGHTED SUMMARY
  -------------------------------------------------------
  */

  const weighted =
    weightedEvidence[0] || {
      averageRelevance: 0,
      averageQuality: 0,
      averageFreshness: 0,
      averageEvidenceWeight: 0,
      totalEvidenceWeight: 0,
    };


  /*
  -------------------------------------------------------
  FINAL RESPONSE
  -------------------------------------------------------
  */

  return {
    loanProductId,

    totalEvidence,

    sources,

    experiences,

    sentiments,

    topics,

    weighted: {
      averageRelevance:
        Number(
          (
            weighted.averageRelevance ||
            0
          ).toFixed(4)
        ),

      averageQuality:
        Number(
          (
            weighted.averageQuality ||
            0
          ).toFixed(4)
        ),

      averageFreshness:
        Number(
          (
            weighted.averageFreshness ||
            0
          ).toFixed(4)
        ),

      averageEvidenceWeight:
        Number(
          (
            weighted.averageEvidenceWeight ||
            0
          ).toFixed(4)
        ),

      totalEvidenceWeight:
        Number(
          (
            weighted.totalEvidenceWeight ||
            0
          ).toFixed(4)
        ),
    },

    recentEvidence,
  };
}