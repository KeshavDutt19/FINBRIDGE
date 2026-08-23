import * as cheerio from 'cheerio';

const SEARCH_URL = 'https://html.duckduckgo.com/html/';

function cleanText(value = '') {
  return String(value)
    .replace(/\s+/g, ' ')
    .trim();
}

function buildQuery({ bank, category }) {
  return (
    `site:quora.com "${bank}" "${category} loan" ` +
    '(experience OR review OR processing OR approval OR collateral OR fees)'
  );
}

export async function searchQuora({ bank, category }) {
  const query = buildQuery({ bank, category });

  try {
    const response = await fetch(
      `${SEARCH_URL}?q=${encodeURIComponent(query)}`,
      {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/151 Safari/537.36',
          Accept:
            'text/html,application/xhtml+xml'
        }
      }
    );

    if (!response.ok) {
      return [];
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    const results = [];

    $('.result').each((_, element) => {
      const title = cleanText(
        $(element)
          .find('.result__title')
          .text()
      );

      const url =
        $(element)
          .find('.result__title a')
          .attr('href') || '';

      const snippet = cleanText(
        $(element)
          .find('.result__snippet')
          .text()
      );

      if (
        title &&
        url &&
        /quora\.com/i.test(url)
      ) {
        results.push({
          source: 'quora',
          title,
          url,
          snippet: snippet.slice(0, 700),
          publishedAt: null
        });
      }
    });

    return results.slice(0, 12);
  } catch {
    return [];
  }
}