function normalize(text = '') {
  return String(text)
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

const DIRECT = [
  'i took',
  'i applied',
  'my loan',
  'my education loan',
  'my application',
  'my experience',
  'we applied',
  'we took',
  'i got approved',
  'i got rejected',
  'my loan was approved'
];

const QUESTION = [
  'which bank',
  'should i',
  'can i',
  'has anyone',
  'does anyone',
  'please help',
  'what should i'
];

const PROMOTIONAL = [
  'built a tool',
  'free tool',
  'our service',
  'contact us',
  'visit our website',
  'best platform',
  'we provide'
];

export function scoreEvidence({
  title = '',
  text = '',
  bank = '',
  category = ''
}) {
  const content =
    normalize(`${title} ${text}`);

  let score = 0;

  const bankName =
    normalize(bank);

  if (
    bankName &&
    content.includes(bankName)
  ) {
    score += 15;
  }

  const categoryName =
    normalize(category);

  if (
    content.includes(
      `${categoryName} loan`
    )
  ) {
    score += 12;
  }

  const directCount =
    DIRECT.filter((term) =>
      content.includes(term)
    ).length;

  if (directCount >= 2) {
    score += 35;
  } else if (directCount === 1) {
    score += 20;
  }

  const questionCount =
    QUESTION.filter((term) =>
      content.includes(term)
    ).length;

  if (questionCount > 0) {
    score += 5;
    score -= questionCount * 2;
  }

  const promotionalCount =
    PROMOTIONAL.filter((term) =>
      content.includes(term)
    ).length;

  score -=
    promotionalCount * 15;

  /*
   * Discussion with concrete numbers
   * is usually more useful.
   */
  if (/\₹?\s?\d/.test(content)) {
    score += 5;
  }

  if (
    /\b\d+\s*(day|days|week|weeks|month|months)\b/
      .test(content)
  ) {
    score += 8;
  }

  return Math.max(
    0,
    Math.min(score, 100)
  );
}