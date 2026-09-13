import "dotenv/config";
import mongoose from "mongoose";

import { connectDB } from "../../db.js";

import {
  generateLoanRecommendations,
} from "./loanRecommendationService.js";


const testProfile = {
  age: 20,
  state: "Delhi",
  city: "Delhi",
  gender: "Male",
  category: "General",
  educationLevel: "Undergraduate",
  course: "B.Tech Computer Science",
  institution: "Example University",
  academicScore: 85,
  yearOfStudy: "2nd Year",
  annualFamilyIncome: 600000,
  employmentStatus: "Student",

  loanType: "education",
  desiredAmount: 800000,
  preferredTenure: 120,
};


async function main() {

  try {

    await connectDB();

    console.log(
      "\n================================================="
    );

    console.log(
      "FINBRIDGE COMPLETE LOAN RECOMMENDATION ENGINE"
    );

    console.log(
      "=================================================\n"
    );


    console.log("USER PROFILE:");

    console.log(
      JSON.stringify(
        testProfile,
        null,
        2
      )
    );


    const result =
      await generateLoanRecommendations({
        profile: testProfile,
        limit: 10,
      });


    console.log(
      "\n================================================="
    );

    console.log("RECOMMENDATION SUMMARY");

    console.log(
      "=================================================\n"
    );


    console.log(
      `Total loans considered: ${result.totalLoansConsidered}`
    );

    console.log(
      `Eligible loans: ${result.eligibleLoanCount}`
    );

    console.log(
      `Recommendations returned: ${result.recommendations.length}`
    );


    console.log(
      "\n================================================="
    );

    console.log("FINAL LOAN RANKING");

    console.log(
      "=================================================\n"
    );


    if (!result.recommendations.length) {

      console.log(
        "No eligible loan recommendations found."
      );

    } else {

      result.recommendations.forEach(
        (loan) => {

          console.log(
            `${loan.rank}. ${loan.bankName} | ${loan.productName}`
          );

          console.log(
            `   Recommendation Score: ${loan.recommendationScore}`
          );

          console.log(
            `   Product Fit: ${loan.productFit}`
          );

          console.log(
            `   Community Experience: ${loan.communityExperience}`
          );

          console.log(
            `   Community Risk: ${loan.communityRisk}`
          );

          console.log(
            `   Evidence Strength: ${loan.evidenceStrength}`
          );

          console.log(
            `   Confidence: ${loan.confidence}`
          );

          console.log(
            "   Reasons:"
          );

          for (const reason of loan.explanations) {

            console.log(
              `      - ${reason}`
            );
          }

          if (loan.matchedCriteria.length) {

            console.log(
              "   Matched:"
            );

            for (const item of loan.matchedCriteria) {

              console.log(
                `      ✓ ${item}`
              );
            }
          }

          if (loan.unknownCriteria.length) {

            console.log(
              "   Unknown:"
            );

            for (const item of loan.unknownCriteria) {

              console.log(
                `      ? ${item}`
              );
            }
          }

          console.log("");
        }
      );
    }


    console.log(
      "\n================================================="
    );

    console.log("RAW RECOMMENDATION RESULT");

    console.log(
      "=================================================\n"
    );

    console.log(
      JSON.stringify(
        result.recommendations,
        null,
        2
      )
    );


  } catch (error) {

    console.error(
      "\nLOAN RECOMMENDATION ERROR:"
    );

    console.error(error);

    process.exitCode = 1;

  } finally {

    if (
      mongoose.connection.readyState !== 0
    ) {

      await mongoose.connection.close();

    }

  }

}


main();