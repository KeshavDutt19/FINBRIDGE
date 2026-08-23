import LoanProduct from '../../models/LoanProduct.js';
import LoanInsight from '../../models/LoanInsight.js';

import {
  searchCommunitySources
} from './communitySearch.js';

import {
  generateProsCons
} from './prosConsEngine.js';

function pick(obj, keys) {
  for (const key of keys) {
    if (
      obj?.[key] !== undefined &&
      obj?.[key] !== null &&
      obj?.[key] !== ''
    ) {
      return obj[key];
    }
  }

  return '';
}

function describeLoan(loan) {
  return {
    bank: String(
      pick(loan, [
        'bankName',
        'bank',
        'provider'
      ]) || 'Unknown Bank'
    ),

    category: String(
      pick(loan, [
        'category',
        'loanCategory'
      ]) || 'Loan'
    ),

    loanName: String(
      pick(loan, [
        'productName',
        'name',
        'title'
      ]) || 'Loan product'
    )
  };
}

export async function updateLoanInsight(
  loanProductId
) {
  const loan =
    await LoanProduct.findById(
      loanProductId
    );

  if (!loan) {
    throw new Error(
      'Loan product not found'
    );
  }

  const {
    bank,
    category,
    loanName
  } = describeLoan(loan);

  const sources =
    await searchCommunitySources({
      bank,
      category
    });

  const analysis =
    generateProsCons({
      sources
    });

  const insight =
    await LoanInsight.findOneAndUpdate(
      {
        loanProductId: loan._id
      },

      {
        loanProductId: loan._id,
        bank,
        category,
        loanName,

        pros: analysis.pros,
        cons: analysis.cons,
        conclusion:
          analysis.conclusion,

        confidence:
          analysis.confidence,

        communityStats:
          analysis.communityStats,

        themes:
          analysis.themes,

        sources,

        generatedAt: new Date(),

        expiresAt:
          new Date(
            Date.now() +
              1000 * 60 * 60 * 24
          )
      },

      {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true
      }
    );

  return insight;
}

export async function updateAllLoanInsights({
  limit = 20
} = {}) {
  const loans =
    await LoanProduct.find()
      .limit(limit);

  const results = [];

  for (const loan of loans) {
    try {
      const insight =
        await updateLoanInsight(
          loan._id
        );

      results.push({
        loanProductId:
          loan._id,

        bank:
          loan.bankName,

        category:
          loan.category,

        ok: true,

        confidence:
          insight.confidence
      });
    } catch (error) {
      results.push({
        loanProductId:
          loan._id,

        bank:
          loan.bankName,

        category:
          loan.category,

        ok: false,

        error: error.message
      });
    }
  }

  return results;
}