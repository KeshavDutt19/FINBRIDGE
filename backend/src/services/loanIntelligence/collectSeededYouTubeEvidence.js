import "dotenv/config";

import { connectDB } from "../../db.js";

import LoanProduct from "../../models/LoanProduct.js";
import CommunityEvidence from "../../models/CommunityEvidence.js";

import {
  collectSeededYouTubeEvidence,
} from "./youtubeCollector.js";

import {
  SEEDED_YOUTUBE_VIDEOS,
} from "./seedYoutubeVideos.js";


const MIN_YOUTUBE_EVIDENCE = 5;


/*
=========================================================
TARGET BANKS
=========================================================
*/

const BANKS = [
  "State Bank of India",
  "Bank of Baroda",
  "Punjab National Bank",
];


const CATEGORIES = [
  "education",
  "car",
  "home",
];


function getKey(
  bank,
  category
) {
  return `${bank}|${category}`;
}


async function getCount(
  loanProductId
) {

  return CommunityEvidence.countDocuments({
    loanProductId,
    sourceType:
      "youtube",
  });
}


async function main() {

  await connectDB();


  console.log(
    "\n==============================================="
  );

  console.log(
    "FINBRIDGE SEEDED YOUTUBE COLLECTION"
  );

  console.log(
    "===============================================\n"
  );


  const products =
    await LoanProduct.find()
      .select(
        "_id bankName category productName"
      )
      .lean();


  const targets =
    products.filter(
      (product) =>
        BANKS.includes(
          product.bankName
        ) &&
        CATEGORIES.includes(
          product.category
        )
    );


  for (
    const product of
    targets
  ) {

    const loanProductId =
      product._id.toString();


    const current =
      await getCount(
        loanProductId
      );


    const needed =
      Math.max(
        MIN_YOUTUBE_EVIDENCE -
          current,
        0
      );


    console.log(
      "\n-----------------------------------------------"
    );


    console.log(
      `${product.bankName} | ${product.category}`
    );


    console.log(
      `Product: ${product.productName}`
    );


    console.log(
      `Current YouTube evidence: ${current}`
    );


    console.log(
      `Additional evidence needed: ${needed}`
    );


    if (
      needed === 0
    ) {

      console.log(
        "Already complete. Skipping."
      );

      continue;
    }


    const key =
      getKey(
        product.bankName,
        product.category
      );


    const videoIds =
      SEEDED_YOUTUBE_VIDEOS[
        key
      ] || [];


    if (
      videoIds.length === 0
    ) {

      console.log(
        "No seeded videos available. Skipping."
      );

      continue;
    }


    console.log(
      "Seed video IDs:",
      videoIds
    );


    try {

      const result =
        await collectSeededYouTubeEvidence({
          apiKey:
            process.env.YOUTUBE_API_KEY,

          loanProductId,

          bank:
            product.bankName,

          category:
            product.category,

          videoIds,

          maxCommentsPerVideo:
            20,
        });


      console.log(
        "\nRESULT:"
      );


      console.log(
        JSON.stringify(
          {
            videosFound:
              result.videosFound,

            videosAccepted:
              result.videosAccepted,

            commentsFound:
              result.commentsFound,

            commentsAccepted:
              result.commentsAccepted,

            inserted:
              result.inserted,

            duplicates:
              result.duplicates,

            storageErrors:
              result.storageErrors,

            videoCacheHits:
              result.videoCacheHits,

            videoNetworkQueries:
              result.videoNetworkQueries,

            commentCacheHits:
              result.commentCacheHits,

            commentNetworkQueries:
              result.commentNetworkQueries,

            errors:
              result.errors,
          },
          null,
          2
        )
      );

    } catch (error) {

      console.error(
        "Seeded collection failed:",
        error?.message ||
          String(error)
      );
    }
  }


  /*
  =======================================================
  FINAL AUDIT
  =======================================================
  */

  console.log(
    "\n\n==============================================="
  );

  console.log(
    "FINAL YOUTUBE AUDIT"
  );

  console.log(
    "===============================================\n"
  );


  const audit = [];


  for (
    const product of
    targets
  ) {

    const youtube =
      await getCount(
        product._id
      );


    audit.push({
      bank:
        product.bankName,

      category:
        product.category,

      productName:
        product.productName,

      loanProductId:
        product._id.toString(),

      youtube,

      required:
        MIN_YOUTUBE_EVIDENCE,

      status:
        youtube >=
        MIN_YOUTUBE_EVIDENCE
          ? "COMPLETE"
          : "NEEDS_MORE",
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
      (x) =>
        x.status ===
        "COMPLETE"
    ).length;


  console.log(
    `\nYOUTUBE COMPLETE: ${complete}/${audit.length}`
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