import { searchReddit } from './redditCollector.js';
import { searchQuora } from './quoraCollector.js';

export async function searchCommunitySources({
  bank,
  category
}) {
  const [redditResult, quoraResult] =
    await Promise.allSettled([
      searchReddit({
        bank,
        category
      }),

      searchQuora({
        bank,
        category
      })
    ]);

  const reddit =
    redditResult.status === 'fulfilled'
      ? redditResult.value
      : [];

  const quora =
    quoraResult.status === 'fulfilled'
      ? quoraResult.value
      : [];

  return [
    ...reddit,
    ...quora
  ];
}