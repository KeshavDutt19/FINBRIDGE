import express from 'express';

import User from '../models/User.js';
import Scholarship from '../models/Scholarship.js';
import LoanProduct from '../models/LoanProduct.js';
import Application from '../models/Application.js';
import SyncLog from '../models/SyncLog.js';

import {
  requireAuth,
  requireAdmin
} from '../middleware/auth.js';

import {
  syncLoans,
  syncScholarships
} from '../services/ingestion/sync.js';

const router = express.Router();

router.use(
  requireAuth,
  requireAdmin
);

/*
 * ADMIN SUMMARY
 */
router.get('/stats', async (req, res) => {
  const [
    totalUsers,
    totalScholarships,
    totalLoanProducts,
    totalLoanApplications,
    lastScholarshipSync,
    lastLoanSync,
    failedSyncs
  ] = await Promise.all([
    User.countDocuments(),

    Scholarship.countDocuments(),

    LoanProduct.countDocuments(),

    Application.countDocuments({
      type: 'loan'
    }),

    SyncLog.findOne({
      type: 'scholarships'
    }).sort({ finishedAt: -1 }),

    SyncLog.findOne({
      type: 'loans'
    }).sort({ finishedAt: -1 }),

    SyncLog.find({
      status: {
        $in: ['partial', 'failed']
      }
    })
      .sort({ createdAt: -1 })
      .limit(10)
  ]);

  const [
    oldestScholarship,
    oldestLoan
  ] = await Promise.all([
    Scholarship.findOne().sort({
      lastUpdated: 1
    }),

    LoanProduct.findOne().sort({
      lastUpdated: 1
    })
  ]);

  res.json({
    totalUsers,
    totalScholarships,
    totalLoanProducts,
    totalLoanApplications,
    lastScholarshipSync,
    lastLoanSync,
    failedSyncs,

    dataFreshness: {
      oldestScholarship:
        oldestScholarship?.lastUpdated,

      oldestLoan:
        oldestLoan?.lastUpdated
    }
  });
});

/*
 * USER MANAGEMENT
 */
router.get('/users', async (req, res) => {
  const users = await User.find()
    .select('-passwordHash')
    .sort({ createdAt: -1 });

  res.json({
    users
  });
});

router.get('/users/:id', async (req, res) => {
  const user = await User.findById(req.params.id)
    .select('-passwordHash');

  if (!user) {
    return res.status(404).json({
      message: 'User not found'
    });
  }

  res.json({
    user
  });
});

router.put('/users/:id', async (req, res) => {
  const allowedFields = [
    'name',
    'email',
    'phone',
    'userType',
    'profile'
  ];

  const updates = {};

  for (const field of allowedFields) {
    if (req.body[field] !== undefined) {
      updates[field] = req.body[field];
    }
  }

  if (
    updates.userType &&
    ![
      'student',
      'parent',
      'professional',
      'admin'
    ].includes(updates.userType)
  ) {
    return res.status(400).json({
      message: 'Invalid user type'
    });
  }

  if (
    updates.email &&
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
      updates.email
    )
  ) {
    return res.status(400).json({
      message: 'Invalid email address'
    });
  }

  if (
    updates.email
  ) {
    updates.email =
      updates.email.toLowerCase().trim();
  }

  const user = await User.findByIdAndUpdate(
    req.params.id,
    updates,
    {
      new: true,
      runValidators: true
    }
  ).select('-passwordHash');

  if (!user) {
    return res.status(404).json({
      message: 'User not found'
    });
  }

  res.json({
    user
  });
});

/*
 * ANALYTICS
 */
router.get('/analytics', async (req, res) => {
  const [
    monthlyActiveUsers,
    monthlyLoans,
    loanStatus,
    popularLoanTypes,
    totalLoanAmount
  ] = await Promise.all([
    User.aggregate([
      {
        $match: {
          lastActiveAt: {
            $ne: null
          }
        }
      },
      {
        $group: {
          _id: {
            year: {
              $year: '$lastActiveAt'
            },
            month: {
              $month: '$lastActiveAt'
            }
          },
          users: {
            $sum: 1
          }
        }
      },
      {
        $sort: {
          '_id.year': 1,
          '_id.month': 1
        }
      }
    ]),

    Application.aggregate([
      {
        $match: {
          type: 'loan'
        }
      },
      {
        $group: {
          _id: {
            year: {
              $year: '$createdAt'
            },
            month: {
              $month: '$createdAt'
            }
          },
          loans: {
            $sum: 1
          }
        }
      },
      {
        $sort: {
          '_id.year': 1,
          '_id.month': 1
        }
      }
    ]),

    Application.aggregate([
      {
        $match: {
          type: 'loan'
        }
      },
      {
        $project: {
          normalizedStatus: {
            $switch: {
              branches: [
                {
                  case: {
                    $regexMatch: {
                      input: {
                        $toLower: {
                          $ifNull: [
                            '$status',
                            ''
                          ]
                        }
                      },
                      regex: 'approved'
                    }
                  },
                  then: 'approved'
                },
                {
                  case: {
                    $regexMatch: {
                      input: {
                        $toLower: {
                          $ifNull: [
                            '$status',
                            ''
                          ]
                        }
                      },
                      regex: 'default'
                    }
                  },
                  then: 'defaulted'
                }
              ],
              default: 'pending'
            }
          }
        }
      },
      {
        $group: {
          _id: '$normalizedStatus',
          count: {
            $sum: 1
          }
        }
      }
    ]),

    Application.aggregate([
      {
        $match: {
          type: 'loan'
        }
      },
      {
        $group: {
          _id: {
            $ifNull: [
              '$loan.loanType',
              'unknown'
            ]
          },
          count: {
            $sum: 1
          }
        }
      },
      {
        $sort: {
          count: -1
        }
      },
      {
        $limit: 6
      }
    ]),

    Application.aggregate([
      {
        $match: {
          type: 'loan'
        }
      },
      {
        $project: {
          amount: {
            $convert: {
              input: '$loan.desiredAmount',
              to: 'double',
              onError: 0,
              onNull: 0
            }
          }
        }
      },
      {
        $group: {
          _id: null,
          total: {
            $sum: '$amount'
          }
        }
      }
    ])
  ]);

  res.json({
    monthlyActiveUsers,
    monthlyLoans,

    loanStatus,

    popularLoanTypes,

    totalLoanAmount:
      totalLoanAmount[0]?.total || 0
  });
});

/*
 * EXISTING DATA SYNC
 */
router.post(
  '/sync-scholarships',
  async (req, res) => {
    res.json(
      await syncScholarships()
    );
  }
);

router.post(
  '/sync-loans',
  async (req, res) => {
    res.json(
      await syncLoans()
    );
  }
);

export default router;