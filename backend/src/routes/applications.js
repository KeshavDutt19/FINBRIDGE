import express from 'express';
import { body, validationResult } from 'express-validator';
import Application from '../models/Application.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.post(
  '/',
  requireAuth,
  [body('type').isIn(['scholarship', 'loan']), body('targetId').isMongoId()],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
    const app = await Application.create({ ...req.body, user: req.user._id, status: 'Demo Application Saved' });
    res.status(201).json({
      application: app,
      nextStep: 'Continue on the official lender or scholarship portal. FinBridge has not submitted this to any bank or government portal.'
    });
  }
);

router.get('/', requireAuth, async (req, res) => {
  const applications = await Application.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.json({ applications });
});

export default router;
