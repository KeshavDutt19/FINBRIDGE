export async function fetchBankLoanProducts() {
  return {
    sourceName: 'Official bank websites',
    available: false,
    reason:
      'Hackathon MVP does not scrape lender pages automatically. Seed products are demo comparisons and must be verified on official lender sites.',
    items: []
  };
}
