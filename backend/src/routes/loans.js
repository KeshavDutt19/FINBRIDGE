import express from 'express';
import LoanProduct from '../models/LoanProduct.js';

const router = express.Router();

router.get('/', async (req, res) => {
  const loans = await LoanProduct.find().sort({ category: 1, bankName: 1 });
  res.json({ loans });
});

router.get('/:category', async (req, res) => {
  const loans = await LoanProduct.find({ category: req.params.category }).sort({ bankName: 1 });
  res.json({ loans });
});

router.get('/:category/:id', async (req, res) => {
  const loan = await LoanProduct.findOne({ _id: req.params.id, category: req.params.category });
  if (!loan) return res.status(404).json({ message: 'Loan product not found' });
  res.json({ loan });
});

export default router;
