const GOOGLE_URL =
  'https://www.googleapis.com/customsearch/v1';

async function googleSearch(query, options = {}) {
  const apiKey =
    process.env.GOOGLE_SEARCH_API_KEY;

  const searchEngineId =
    process.env.GOOGLE_SEARCH_ENGINE_ID;

  if (!apiKey || !searchEngineId) {
    throw new Error(
      'Google Search API credentials are not configured'
    );
  }

  const params = new URLSearchParams({
    key: apiKey,
    cx: searchEngineId,
    q: query,
    num: String(options.num || 5)
  });

  const response = await fetch(
    `${GOOGLE_URL}?${params.toString()}`
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data?.error?.message ||
        'Google Search request failed'
    );
  }

  return (data.items || []).map((item) => ({
    title: item.title || '',
    url: item.link || '',
    snippet: item.snippet || ''
  }));
}

export default googleSearch;