import express from 'express';
import Scholarship from '../models/Scholarship.js';
import { requireAuth } from '../middleware/auth.js';
import { evaluateScholarshipEligibility } from '../services/eligibilityEngine.js';

const router = express.Router();

router.get('/', async (req, res) => {
  const { educationLevel, state, category, income, gender, disability, provider, deadline, sort = 'best' } = req.query;
  const filter = {};
  if (educationLevel) filter.educationLevels = { $in: [educationLevel, 'All'] };
  if (state) filter.states = { $in: [state, 'All'] };
  if (category) filter.eligibleCategories = { $in: [category, 'All'] };
  if (provider) filter.provider = new RegExp(provider, 'i');
  if (gender) filter.genderEligibility = { $in: [gender, 'Any'] };
  if (disability === 'true') filter.disabilityEligibility = { $in: ['Required', 'Any'] };
  if (income) filter.maxFamilyIncome = { $gte: Number(income) };
  if (deadline) filter.applicationDeadline = { $lte: new Date(deadline) };

  const sortMap = {
    deadline: { applicationDeadline: 1 },
    benefit: { amount: -1 },
    updated: { lastUpdated: -1 },
    best: { applicationDeadline: 1 }
  };
  const scholarships = await Scholarship.find(filter).sort(sortMap[sort] || sortMap.best);
  res.json({ scholarships });
});

router.get('/:id', async (req, res) => {
  const scholarship = await Scholarship.findById(req.params.id);
  if (!scholarship) return res.status(404).json({ message: 'Scholarship not found' });
  res.json({ scholarship });
});

router.post('/:id/check-eligibility', requireAuth, async (req, res) => {
  const scholarship = await Scholarship.findById(req.params.id);
  if (!scholarship) return res.status(404).json({ message: 'Scholarship not found' });
  const profile = Object.keys(req.body || {}).length ? req.body : req.user.profile;
  res.json({ result: evaluateScholarshipEligibility(profile, scholarship) });
});

export default router;
