import "dotenv/config";

import mongoose from "mongoose";

import { connectDB } from "../../db.js";

import LoanProduct from "../../models/LoanProduct.js";

import {
  evaluateLoanEligibility,
} from "./loanEligibilityEngine.js";


/*
=========================================================
TEST PROFILE
=========================================================

This matches the structure of User.profile.

Change these values to test different scenarios.
=========================================================
*/

const testProfile = {
  age: 20,

  state: "Delhi",

  city: "Delhi",

  gender: "Male",

  category: "General",

  educationLevel:
    "Undergraduate",

  course:
    "B.Tech Computer Science",

  institution:
    "Example University",

  academicScore: 85,

  yearOfStudy:
    "2nd Year",

  annualFamilyIncome:
    600000,

  employmentStatus:
    "Student",

  loanType:
    "education",

  desiredAmount:
    800000,

  preferredTenure:
    120,
};


/*
=========================================================
MAIN
=========================================================
*/

async function main() {
  try {
    /*
    Connect to MongoDB using the
    existing FinBridge DB layer.
    */

    await connectDB();


    console.log(
      "\n============================================"
    );

    console.log(
      "FINBRIDGE LOAN ELIGIBILITY ENGINE"
    );

    console.log(
      "============================================\n"
    );


    console.log(
      "TEST USER PROFILE:"
    );

    console.log(
      JSON.stringify(
        testProfile,
        null,
        2
      )
    );


    /*
    -------------------------------------------------------
    LOAD REAL LOANS
    -------------------------------------------------------
    */

    const loans =
      await LoanProduct.find()
        .sort({
          category: 1,
          bankName: 1,
        })
        .lean();


    console.log(
      `\nLoaded ${loans.length} loan products.\n`
    );


    if (!loans.length) {
      console.log(
        "No loan products found."
      );

      return;
    }


    /*
    -------------------------------------------------------
    EVALUATE EVERY LOAN
    -------------------------------------------------------
    */

    const results = [];


    for (
      const loan
      of loans
    ) {
      const result =
        evaluateLoanEligibility({
          profile:
            testProfile,

          loan,
        });


      results.push(
        result
      );
    }


    /*
    -------------------------------------------------------
    PRINT DETAILED RESULTS
    -------------------------------------------------------
    */

    for (
      const result
      of results
    ) {
      console.log(
        "\n--------------------------------------------"
      );

      console.log(
        `${result.bankName} | ${result.productName}`
      );

      console.log(
        `Category: ${result.category}`
      );

      console.log(
        `Eligible: ${result.eligible}`
      );

      console.log(
        `Product Fit: ${result.productFit}`
      );


      console.log(
        "\nMatched:"
      );

      for (
        const item
        of result.matchedCriteria
      ) {
        console.log(
          `  ✓ ${item}`
        );
      }


      console.log(
        "\nFailed:"
      );

      if (
        result.failedCriteria.length === 0
      ) {
        console.log(
          "  None"
        );
      } else {
        for (
          const item
          of result.failedCriteria
        ) {
          console.log(
            `  ✗ ${item}`
          );
        }
      }


      console.log(
        "\nUnknown:"
      );

      if (
        result.unknownCriteria.length === 0
      ) {
        console.log(
          "  None"
        );
      } else {
        for (
          const item
          of result.unknownCriteria
        ) {
          console.log(
            `  ? ${item}`
          );
        }
      }
    }


    /*
    -------------------------------------------------------
    SUMMARY
    -------------------------------------------------------
    */

    const eligible =
      results.filter(
        (item) =>
          item.eligible
      );


    console.log(
      "\n============================================"
    );

    console.log(
      "ELIGIBILITY SUMMARY"
    );

    console.log(
      "============================================\n"
    );


    console.log(
      `Total loans: ${results.length}`
    );

    console.log(
      `Eligible loans: ${eligible.length}`
    );

    console.log(
      `Ineligible loans: ${
        results.length -
        eligible.length
      }`
    );


    console.log(
      "\nEligible loan ranking by Product Fit:"
    );


    eligible
      .sort(
        (a, b) =>
          b.productFit -
          a.productFit
      )
      .forEach(
        (item, index) => {
          console.log(
            `${index + 1}. ${
              item.bankName
            } | ${
              item.productName
            } | Fit: ${
              item.productFit
            }`
          );
        }
      );


  } catch (error) {
    console.error(
      "\nLOAN ELIGIBILITY ERROR:"
    );

    console.error(
      error
    );

    process.exitCode = 1;

  } finally {
    if (
      mongoose.connection
        .readyState !== 0
    ) {
      await mongoose.connection.close();
    }
  }
}


main();