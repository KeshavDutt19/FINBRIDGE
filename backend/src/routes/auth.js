import express from 'express';
import bcrypt from 'bcryptjs';
import { body, validationResult } from 'express-validator';
import User from '../models/User.js';
import { requireAuth, signToken } from '../middleware/auth.js';

const router = express.Router();

function handleValidation(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
  next();
}

router.post(
  '/register',
  [
    body('name').trim().isLength({ min: 2 }),
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 8 }),
    body('phone').trim().isLength({ min: 8 }),
    body('userType').optional().isIn(['student', 'parent', 'professional', 'admin'])
  ],
  handleValidation,
  async (req, res) => {
    const existing = await User.findOne({ email: req.body.email });
    if (existing) return res.status(409).json({ message: 'Email already registered' });
    const passwordHash = await bcrypt.hash(req.body.password, 12);
    const user = await User.create({ ...req.body, passwordHash });
    res.status(201).json({ token: signToken(user), user: user.toSafeJSON() });
  }
);

router.post('/login', [body('email').isEmail().normalizeEmail(), body('password').notEmpty()], handleValidation, async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) return res.status(401).json({ message: 'Invalid credentials' });
  const ok = await bcrypt.compare(req.body.password, user.passwordHash);
  if (!ok) return res.status(401).json({ message: 'Invalid credentials' });
  res.json({ token: signToken(user), user: user.toSafeJSON() });
});

router.get('/me', requireAuth, (req, res) => res.json({ user: req.user.toSafeJSON() }));

router.put('/profile', requireAuth, async (req, res) => {
  req.user.profile = { ...req.user.profile?.toObject?.(), ...req.body };
  await req.user.save();
  res.json({ user: req.user.toSafeJSON() });
});

export default router;
