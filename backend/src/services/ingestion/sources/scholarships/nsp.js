export async function fetchNspScholarships() {
  return {
    sourceName: 'National Scholarship Portal',
    available: false,
    reason:
      'Automated live retrieval is disabled for the MVP. FinBridge uses curated demo data and links users to the official portal.',
    items: []
  };
}
