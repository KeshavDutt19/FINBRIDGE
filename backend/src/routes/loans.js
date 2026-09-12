import express from 'express';
import LoanProduct from '../models/LoanProduct.js';

import {
  generateLoanRecommendations,
} from '../services/loanIntelligence/loanRecommendationService.js';
import {
  compareLoans,
} from '../services/comparison/comparisonEngine.js';

const router = express.Router();

// ==================================================
// ADVANCED LOAN COMPARISON
// ==================================================

router.post('/compare', async (req, res, next) => {
  try {
    const {
      profile,
      category = null,
      
      limit = 5,
    } = req.body;

    if (
      !profile ||
      typeof profile !== 'object'
    ) {
      return res.status(400).json({
        success: false,
        message:
          'profile is required and must be an object.',
      });
    }

    const result =
      await compareLoans({
        profile,
        category,
        limit: Number(limit),
      });

    return res.json({
      success: true,
      ...result,

      disclaimer:
        'Comparison scores are FinBridge demo recommendations based on available product data. They are not credit approval or sanction decisions. Interest rates and lender terms can vary by borrower and scheme.'
    });

  } catch (error) {
    next(error);
  }
});


// ==================================================
// GET ALL LOANS
// ==================================================

router.get('/', async (req, res, next) => {
  try {
    const loans = await LoanProduct
      .find()
      .sort({
        category: 1,
        bankName: 1,
      });

    res.json({ loans });
  } catch (error) {
    next(error);
  }
});


// ==================================================
// GET LOANS BY CATEGORY
// ==================================================

router.get('/:category', async (req, res, next) => {
  try {
    const loans = await LoanProduct
      .find({
        category: req.params.category,
      })
      .sort({
        bankName: 1,
      });

    res.json({ loans });
  } catch (error) {
    next(error);
  }
});


// ==================================================
// GET SINGLE LOAN
// ==================================================

router.get('/:category/:id', async (req, res, next) => {
  try {
    const loan = await LoanProduct.findOne({
      _id: req.params.id,
      category: req.params.category,
    });

    if (!loan) {
      return res.status(404).json({
        message: 'Loan product not found',
      });
    }

    res.json({ loan });
  } catch (error) {
    next(error);
  }
});


// ==================================================
// POST PERSONALIZED LOAN RECOMMENDATIONS
// ==================================================

router.post('/recommendations', async (req, res, next) => {
  try {
    const {
      profile,
      category = null,
      limit = 10,
    } = req.body;


    // ------------------------------------------------
    // VALIDATE PROFILE
    // ------------------------------------------------

    if (!profile || typeof profile !== 'object') {
      return res.status(400).json({
        message: 'profile is required and must be an object.',
      });
    }


    // ------------------------------------------------
    // GENERATE RECOMMENDATIONS
    // ------------------------------------------------

    const result =
      await generateLoanRecommendations({
        profile,
        category,
        limit: Number(limit),
      });


    // ------------------------------------------------
    // RESPONSE
    // ------------------------------------------------

    res.json({
      success: true,
      ...result,
    });

  } catch (error) {
    next(error);
  }
});


export default router;