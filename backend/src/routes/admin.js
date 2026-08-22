import express from 'express';
import User from '../models/User.js';
import Scholarship from '../models/Scholarship.js';
import LoanProduct from '../models/LoanProduct.js';
import SyncLog from '../models/SyncLog.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import { syncLoans, syncScholarships } from '../services/ingestion/sync.js';

const router = express.Router();

router.use(requireAuth, requireAdmin);

router.get('/stats', async (req, res) => {
  const [totalUsers, totalScholarships, totalLoanProducts, lastScholarshipSync, lastLoanSync, failedSyncs] = await Promise.all([
    User.countDocuments(),
    Scholarship.countDocuments(),
    LoanProduct.countDocuments(),
    SyncLog.findOne({ type: 'scholarships' }).sort({ finishedAt: -1 }),
    SyncLog.findOne({ type: 'loans' }).sort({ finishedAt: -1 }),
    SyncLog.find({ status: { $in: ['partial', 'failed'] } }).sort({ createdAt: -1 }).limit(10)
  ]);
  const oldestScholarship = await Scholarship.findOne().sort({ lastUpdated: 1 });
  const oldestLoan = await LoanProduct.findOne().sort({ lastUpdated: 1 });
  res.json({
    totalUsers,
    totalScholarships,
    totalLoanProducts,
    lastScholarshipSync,
    lastLoanSync,
    failedSyncs,
    dataFreshness: {
      oldestScholarship: oldestScholarship?.lastUpdated,
      oldestLoan: oldestLoan?.lastUpdated
    }
  });
});

router.post('/sync-scholarships', async (req, res) => res.json(await syncScholarships()));
router.post('/sync-loans', async (req, res) => res.json(await syncLoans()));

export default router;
