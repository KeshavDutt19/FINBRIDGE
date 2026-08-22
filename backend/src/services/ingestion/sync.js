import Scholarship from '../../models/Scholarship.js';
import LoanProduct from '../../models/LoanProduct.js';
import SyncLog from '../../models/SyncLog.js';
import { fetchNspScholarships } from './sources/scholarships/nsp.js';
import { fetchBankLoanProducts } from './sources/loans/bankExample.js';
import { normalizeScholarship, normalizeLoan } from './normalize.js';
import { scholarshipSeed, loanSeed } from '../../data/seedData.js';

async function upsertMany(Model, items, keyFields) {
  let newCount = 0;
  let updatedCount = 0;
  for (const item of items) {
    const filter = Object.fromEntries(keyFields.map(key => [key, item[key]]));
    const existing = await Model.findOne(filter);
    await Model.updateOne(filter, { $set: item }, { upsert: true });
    existing ? updatedCount++ : newCount++;
  }
  return { newCount, updatedCount };
}

export async function syncScholarships() {
  const startedAt = new Date();
  const failedSources = [];
  const source = await fetchNspScholarships();
  if (!source.available) failedSources.push({ sourceName: source.sourceName, reason: source.reason });
  const liveItems = source.items || [];
  const items = [...liveItems, ...scholarshipSeed].map(normalizeScholarship);
  const result = await upsertMany(Scholarship, items, ['title', 'provider']);
  const log = await SyncLog.create({
    type: 'scholarships',
    status: failedSources.length ? 'partial' : 'success',
    ...result,
    failedSources,
    startedAt,
    finishedAt: new Date(),
    message: 'Scholarship sync completed using normalized adapter pipeline.'
  });
  return { ...result, failedSources, log };
}

export async function syncLoans() {
  const startedAt = new Date();
  const failedSources = [];
  const source = await fetchBankLoanProducts();
  if (!source.available) failedSources.push({ sourceName: source.sourceName, reason: source.reason });
  const liveItems = source.items || [];
  const items = [...liveItems, ...loanSeed].map(normalizeLoan);
  const result = await upsertMany(LoanProduct, items, ['bankName', 'category', 'productName']);
  const log = await SyncLog.create({
    type: 'loans',
    status: failedSources.length ? 'partial' : 'success',
    ...result,
    failedSources,
    startedAt,
    finishedAt: new Date(),
    message: 'Loan sync completed using normalized adapter pipeline.'
  });
  return { ...result, failedSources, log };
}
