export function normalizeScholarship(item) {
  return {
    ...item,
    lastUpdated: item.lastUpdated ? new Date(item.lastUpdated) : new Date(),
    sourceName: item.sourceName || 'Manual/Demo Source',
    dataLabel: item.dataLabel || 'DEMO data - verify on official source'
  };
}

export function normalizeLoan(item) {
  return {
    ...item,
    lastUpdated: item.lastUpdated ? new Date(item.lastUpdated) : new Date(),
    sourceName: item.sourceName || 'Official lender website',
    disclaimer:
      item.disclaimer ||
      'Rates, eligibility criteria, deadlines and terms can change. Verify the information on the official source before applying.',
    dataLabel: item.dataLabel || 'DEMO data - verify current rate with official lender'
  };
}
