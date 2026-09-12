import "dotenv/config";

import { connectDB } from "../../db.js";

import LoanProduct from "../../models/LoanProduct.js";
import CommunityEvidence from "../../models/CommunityEvidence.js";


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

const MIN_REDDIT_EVIDENCE = 5;
const MIN_YOUTUBE_EVIDENCE = 5;


async function main() {

  await connectDB();

  const products =
    await LoanProduct.find()
      .select(
        "_id bankName category productName"
      )
      .lean();


  const targetProducts =
    products.filter(
      (product) =>
        TARGET_BANKS.includes(
          product.bankName
        ) &&
        TARGET_CATEGORIES.includes(
          product.category
        )
    );


  console.log(
    "\n========================================================="
  );

  console.log(
    "FINBRIDGE COMMUNITY DATA GAP AUDIT"
  );

  console.log(
    "=========================================================\n"
  );


  const audit = [];


  for (
    const bank of TARGET_BANKS
  ) {

    for (
      const category of TARGET_CATEGORIES
    ) {

      const product =
        targetProducts.find(
          (item) =>
            item.bankName === bank &&
            item.category === category
        );


      if (!product) {

        audit.push({
          bank,
          category,
          status:
            "MISSING_PRODUCT",
        });

        continue;
      }


      const loanProductId =
        product._id.toString();


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


      const redditNeeded =
        Math.max(
          MIN_REDDIT_EVIDENCE -
            reddit,
          0
        );


      const youtubeNeeded =
        Math.max(
          MIN_YOUTUBE_EVIDENCE -
            youtube,
          0
        );


      let status =
        "COMPLETE";


      if (
        redditNeeded > 0 &&
        youtubeNeeded > 0
      ) {
        status =
          "BOTH_REQUIRED";

      } else if (
        redditNeeded > 0
      ) {
        status =
          "REDDIT_REQUIRED";

      } else if (
        youtubeNeeded > 0
      ) {
        status =
          "YOUTUBE_REQUIRED";
      }


      audit.push({
        bank,
        category,

        productName:
          product.productName,

        loanProductId,

        reddit,
        youtube,

        redditNeeded,
        youtubeNeeded,

        status,
      });
    }
  }


  console.log(
    JSON.stringify(
      audit,
      null,
      2
    )
  );


  console.log("\n=========================================================");

  console.log(
    "ACTION QUEUE"
  );

  console.log(
    "=========================================================\n"
  );


  for (
    const item of audit
  ) {

    if (
      item.status ===
      "COMPLETE"
    ) {
      continue;
    }


    if (
      item.status ===
      "MISSING_PRODUCT"
    ) {

      console.log(
        `PRODUCT MISSING → ${item.bank} | ${item.category}`
      );

      continue;
    }


    console.log(
      `${item.status} → ${item.bank} | ${item.category} | Reddit +${item.redditNeeded} | YouTube +${item.youtubeNeeded}`
    );
  }


  const complete =
    audit.filter(
      (x) =>
        x.status === "COMPLETE"
    ).length;


  console.log("\n=========================================================");

  console.log(
    `COMPLETE: ${complete}/${audit.length}`
  );

  console.log(
    "=========================================================\n"
  );
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