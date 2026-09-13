import "dotenv/config";

import mongoose from "mongoose";
import { connectDB } from "../../db.js";
import {
  calculateAllIntelligenceScores,
} from "./intelligenceScore.js";

async function main() {
  try {
    /*
    -------------------------------------------------------
    CONNECT USING FINBRIDGE'S EXISTING DB CONNECTION
    -------------------------------------------------------
    */

    await connectDB();

    console.log(
      "\n============================================"
    );

    console.log(
      "FINBRIDGE INTELLIGENCE SCORE ENGINE"
    );

    console.log(
      "============================================\n"
    );

    /*
    -------------------------------------------------------
    CALCULATE INTELLIGENCE FOR ALL LOANS
    -------------------------------------------------------
    */

    const results =
      await calculateAllIntelligenceScores();

    /*
    -------------------------------------------------------
    DISPLAY RESULTS
    -------------------------------------------------------
    */

    if (!results.length) {
      console.log(
        "No accepted community evidence found."
      );

      return;
    }

    for (
      const result of results
    ) {
      console.log(
        JSON.stringify(
          result,
          null,
          2
        )
      );

      console.log(
        "\n--------------------------------------------\n"
      );
    }

    console.log(
      `Processed ${results.length} loan products.`
    );

  } catch (error) {
    console.error(
      "\nINTELLIGENCE ENGINE ERROR:"
    );

    console.error(
      error
    );

    process.exitCode = 1;

  } finally {
    /*
    -------------------------------------------------------
    CLOSE MONGOOSE CONNECTION
    -------------------------------------------------------
    */

    if (
      mongoose.connection.readyState !== 0
    ) {
      await mongoose.connection.close();
    }
  }
}

main();