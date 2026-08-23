import Parser from 'rss-parser';

const parser = new Parser({
  timeout: 15000,
  headers: {
    'User-Agent':
      'FinBridgeLoanInsights/1.0 community-research'
  }
});

function cleanText(value = '') {
  return String(value)
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function normalize(value = '') {
  return String(value)
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function relevanceScore({
  title,
  snippet,
  bank,
  category
}) {
  const text = normalize(
    `${title} ${snippet}`
  );

  const bankTerms = normalize(bank)
    .split(' ')
    .filter(Boolean);

  const categoryTerms = normalize(category)
    .split(' ')
    .filter(Boolean);

  let score = 0;

  // Bank must be mentioned.
  const bankMatches = bankTerms.filter(
    (word) => text.includes(word)
  ).length;

  if (bankMatches === bankTerms.length) {
    score += 5;
  } else if (bankMatches > 0) {
    score += 2;
  }

  // Loan category.
  if (
    text.includes(category) ||
    text.includes(`${category} loan`) ||
    text.includes('education loan')
  ) {
    score += 4;
  }

  // Experience/review signals.
  const experienceWords = [
    'experience',
    'review',
    'applied',
    'apply',
    'loan',
    'approval',
    'approved',
    'rejected',
    'sanction',
    'processing',
    'branch',
    'disbursement',
    'collateral',
    'interest',
    'fee',
    'fees',
    'customer service',
    'documentation',
    'documents',
    'moratorium',
    'repayment'
  ];

  score += experienceWords.filter(
    (word) => text.includes(word)
  ).length;

  // Remove obvious irrelevant subreddit/community pages.
  const badPatterns = [
    'community',
    'subreddit',
    'welcome to',
    'ask anything',
    'mega thread',
    'monthly thread'
  ];

  for (const pattern of badPatterns) {
    if (text.includes(pattern)) {
      score -= 5;
    }
  }

  return score;
}

function isUsefulResult({
  title,
  snippet,
  bank,
  category
}) {
  const score = relevanceScore({
    title,
    snippet,
    bank,
    category
  });

  return score >= 8;
}

async function fetchFeed(url) {
  try {
    const feed = await parser.parseURL(url);

    return (feed.items || []).map((item) => ({
      source: 'reddit',
      title: cleanText(item.title),
      url: item.link || '',
      snippet: cleanText(
        item.contentSnippet ||
          item.content ||
          item.summary ||
          ''
      ).slice(0, 700),
      publishedAt:
        item.isoDate ||
        item.pubDate ||
        null,
      subreddit:
        item.categories?.[0] || null
    }));
  } catch {
    return [];
  }
}

export async function searchReddit({
  bank,
  category
}) {
  const queries = [
    `"${bank}" "${category} loan" experience`,
    `"${bank}" "${category} loan" review`,
    `"${bank}" "${category} loan" processing`,
    `"${bank}" "${category} loan" approval`,
    `"${bank}" "${category} loan" collateral`
  ];

  const collected = [];

  for (const query of queries) {
    const encoded =
      encodeURIComponent(query);

    const url =
      `https://www.reddit.com/search.rss?q=${encoded}&sort=new&t=year`;

    const results = await fetchFeed(url);

    collected.push(...results);

    // Avoid hitting Reddit excessively.
    await new Promise((resolve) =>
      setTimeout(resolve, 1200)
    );
  }

  const seen = new Set();

  const filtered = collected
    .filter((item) =>
      isUsefulResult({
        title: item.title,
        snippet: item.snippet,
        bank,
        category
      })
    )
    .filter((item) => {
      if (!item.url || seen.has(item.url)) {
        return false;
      }

      seen.add(item.url);
      return true;
    })
    .map((item) => ({
      ...item,
      relevanceScore: relevanceScore({
        title: item.title,
        snippet: item.snippet,
        bank,
        category
      })
    }))
    .sort(
      (a, b) =>
        b.relevanceScore -
        a.relevanceScore
    );

  return filtered.slice(0, 15);
}