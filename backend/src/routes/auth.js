import express from 'express';
import bcrypt from 'bcryptjs';
import { body, validationResult } from 'express-validator';

import User from '../models/User.js';
import {
  requireAuth,
  signToken,
} from '../middleware/auth.js';

const router = express.Router();

function handleValidation(req, res, next) {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: 'Validation failed',
      errors: errors.array(),
    });
  }

  next();
}

async function authenticate(req, res, expectedRole) {
  const user = await User.findOne({
    email: req.body.email,
  });

  if (!user) {
    return res.status(401).json({
      message: 'Invalid credentials',
    });
  }

  const passwordOk = await bcrypt.compare(
    req.body.password,
    user.passwordHash
  );

  if (!passwordOk) {
    return res.status(401).json({
      message: 'Invalid credentials',
    });
  }

  /*
   * USER PORTAL
   * Admin accounts cannot log in through the user portal.
   */
  if (
    expectedRole === 'user' &&
    user.userType === 'admin'
  ) {
    return res.status(403).json({
      message:
        'This account must use the Admin Portal.',
    });
  }

  /*
   * ADMIN PORTAL
   * Only admin accounts can log in here.
   */
  if (
    expectedRole === 'admin' &&
    user.userType !== 'admin'
  ) {
    return res.status(403).json({
      message: 'Admin access required.',
    });
  }

  user.lastActiveAt = new Date();
  await user.save();

  return res.json({
    token: signToken(user),
    user: user.toSafeJSON(),
  });
}

/*
 * USER REGISTRATION
 *
 * Public registration can NEVER create
 * an admin account.
 */
router.post(
  '/register',
  [
    body('name')
      .trim()
      .isLength({ min: 2 }),

    body('email')
      .isEmail()
      .normalizeEmail(),

    body('password')
      .isLength({ min: 8 }),

    body('phone')
      .trim()
      .isLength({ min: 8 }),

    body('userType')
      .optional()
      .isIn([
        'student',
        'parent',
        'professional',
      ]),
  ],
  handleValidation,
  async (req, res) => {
    try {
      const existing = await User.findOne({
        email: req.body.email,
      });

      if (existing) {
        return res.status(409).json({
          message: 'Email already registered',
        });
      }

      const passwordHash = await bcrypt.hash(
        req.body.password,
        12
      );

      const user = await User.create({
        name: req.body.name,
        email: req.body.email,
        passwordHash,
        phone: req.body.phone,
        userType:
          req.body.userType || 'student',
        profile: req.body.profile || {},
        lastActiveAt: new Date(),
      });

      return res.status(201).json({
        token: signToken(user),
        user: user.toSafeJSON(),
      });
    } catch (error) {
      console.error(
        'Registration error:',
        error
      );

      return res.status(500).json({
        message: 'Registration failed',
      });
    }
  }
);

/*
 * USER LOGIN
 */
router.post(
  '/login/user',
  [
    body('email')
      .isEmail()
      .normalizeEmail(),

    body('password').notEmpty(),
  ],
  handleValidation,
  async (req, res) => {
    try {
      return await authenticate(
        req,
        res,
        'user'
      );
    } catch (error) {
      console.error(
        'User login error:',
        error
      );

      return res.status(500).json({
        message: 'Login failed',
      });
    }
  }
);

/*
 * ADMIN LOGIN
 */
router.post(
  '/login/admin',
  [
    body('email')
      .isEmail()
      .normalizeEmail(),

    body('password').notEmpty(),
  ],
  handleValidation,
  async (req, res) => {
    try {
      return await authenticate(
        req,
        res,
        'admin'
      );
    } catch (error) {
      console.error(
        'Admin login error:',
        error
      );

      return res.status(500).json({
        message: 'Login failed',
      });
    }
  }
);

/*
 * Backward-compatible login.
 *
 * Existing /auth/login calls are treated
 * as USER login.
 */
router.post(
  '/login',
  [
    body('email')
      .isEmail()
      .normalizeEmail(),

    body('password').notEmpty(),
  ],
  handleValidation,
  async (req, res) => {
    try {
      return await authenticate(
        req,
        res,
        'user'
      );
    } catch (error) {
      console.error(
        'Login error:',
        error
      );

      return res.status(500).json({
        message: 'Login failed',
      });
    }
  }
);

/*
 * CURRENT USER
 */
router.get(
  '/me',
  requireAuth,
  async (req, res) => {
    req.user.lastActiveAt = new Date();

    await req.user.save();

    return res.json({
      user: req.user.toSafeJSON(),
    });
  }
);

/*
 * UPDATE PROFILE
 */
router.put(
  '/profile',
  requireAuth,
  async (req, res) => {
    try {
      req.user.profile = {
        ...(
          req.user.profile?.toObject?.() || {}
        ),
        ...req.body,
      };

      req.user.lastActiveAt = new Date();

      await req.user.save();

      return res.json({
        user: req.user.toSafeJSON(),
      });
    } catch (error) {
      console.error(
        'Profile update error:',
        error
      );

      return res.status(500).json({
        message: 'Profile update failed',
      });
    }
  }
);

export default router;