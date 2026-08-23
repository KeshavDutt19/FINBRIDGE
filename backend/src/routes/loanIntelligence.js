import express from 'express';

import LoanInsight from '../models/LoanInsight.js';

import {
  requireAuth,
  requireAdmin
} from '../middleware/auth.js';

import {
  updateLoanInsight
} from '../services/loanIntelligence/updateInsights.js';

const router = express.Router();

/*
 * Public:
 * Get the latest pros/cons for a loan.
 */
router.get(
  '/:loanProductId/comparison',
  async (req, res) => {
    try {
      const insight =
        await LoanInsight.findOne({
          loanProductId:
            req.params.loanProductId
        }).lean();

      if (!insight) {
        return res.status(404).json({
          message:
            'Loan intelligence has not been generated yet.'
        });
      }

      res.json({
        insight
      });
    } catch (error) {
      res.status(500).json({
        message:
          'Failed to load loan comparison'
      });
    }
  }
);

/*
 * Admin:
 * Refresh one loan's analysis.
 */
router.post(
  '/:loanProductId/refresh',
  requireAuth,
  requireAdmin,
  async (req, res) => {
    try {
      const insight =
        await updateLoanInsight(
          req.params.loanProductId
        );

      res.json({
        insight
      });
    } catch (error) {
      res.status(500).json({
        message: error.message
      });
    }
  }
);

export default router;