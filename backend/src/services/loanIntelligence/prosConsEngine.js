const THEMES = [
  {
    key: 'processing',
    label: 'Processing speed',
    positive: [
      'approved quickly',
      'approval quickly',
      'processed quickly',
      'processing was fast',
      'fast processing',
      'quick processing',
      'sanctioned quickly',
      'sanction quickly'
    ],
    negative: [
      'slow processing',
      'processing delay',
      'processing delayed',
      'took a month',
      'took months',
      'took weeks',
      'delay in processing',
      'delayed approval',
      'sanction delayed',
      'approval delayed'
    ]
  },
  {
    key: 'interest',
    label: 'Interest and repayment cost',
    positive: [
      'low interest',
      'lower interest',
      'low rate',
      'lower rate',
      'competitive rate',
      'competitive interest',
      'reasonable interest',
      'reasonable rate'
    ],
    negative: [
      'high interest',
      'higher interest',
      'high rate',
      'higher rate',
      'interest problem',
      'interest calculation',
      'interest issue',
      'interest charged',
      'interest burden',
      'interest payable'
    ]
  },
  {
    key: 'collateral',
    label: 'Collateral requirements',
    positive: [
      'without collateral',
      'no collateral',
      'collateral free',
      'collateral-free',
      'without security',
      'no security',
      'got without collateral'
    ],
    negative: [
      'collateral required',
      'property required',
      'security required',
      'mortgage required',
      'collateral issue',
      'collateral problem'
    ]
  },
  {
    key: 'documentation',
    label: 'Documentation',
    positive: [
      'easy documentation',
      'simple documentation',
      'easy documents',
      'simple documents',
      'less paperwork',
      'easy process'
    ],
    negative: [
      'too many documents',
      'many documents',
      'lots of documents',
      'too much paperwork',
      'documentation problem',
      'documentation issues',
      'paperwork problem',
      'paperwork issues'
    ]
  },
  {
    key: 'customerService',
    label: 'Customer service',
    positive: [
      'helpful staff',
      'helpful branch',
      'good service',
      'great service',
      'supportive staff',
      'cooperative staff',
      'responsive branch',
      'responsive staff'
    ],
    negative: [
      'bad service',
      'poor service',
      'unresponsive',
      'no response',
      'not responding',
      'rude staff',
      'not helpful',
      'unsupportive'
    ]
  },
  {
    key: 'approval',
    label: 'Approval experience',
    positive: [
      'got approved',
      'loan approved',
      'approved my loan',
      'approval received',
      'sanctioned',
      'loan sanctioned',
      'successfully approved'
    ],
    negative: [
      'loan rejected',
      'application rejected',
      'got rejected',
      'not approved',
      'rejected my application',
      'sanction rejected'
    ]
  },
  {
    key: 'disbursement',
    label: 'Disbursement',
    positive: [
      'disbursed quickly',
      'smooth disbursement',
      'disbursement was smooth',
      'funds released',
      'money was released',
      'received funds'
    ],
    negative: [
      'disbursement delay',
      'disbursement delayed',
      'money not released',
      'funds delayed',
      'disbursement problem',
      'disbursement issue'
    ]
  },
  {
    key: 'fees',
    label: 'Fees and charges',
    positive: [
      'low processing fee',
      'low fees',
      'no processing fee',
      'nil processing fee',
      'reasonable fees'
    ],
    negative: [
      'high processing fee',
      'high fees',
      'hidden charges',
      'extra charges',
      'unexpected charges',
      'unexpected fee',
      'additional charges'
    ]
  },
  {
    key: 'moratorium',
    label: 'Moratorium experience',
    positive: [
      'moratorium helped',
      'moratorium was useful',
      'good moratorium',
      'flexible moratorium'
    ],
    negative: [
      'moratorium interest',
      'moratorium issue',
      'moratorium problem',
      'interest during moratorium',
      'moratorium period issue'
    ]
  }
];

const DIRECT_EXPERIENCE_PATTERNS = [
  'i took',
  'i have taken',
  'i applied',
  'i had applied',
  'my loan',
  'my education loan',
  'my application',
  'my experience',
  'we applied',
  'we took',
  'they approved',
  'they rejected',
  'they sanctioned',
  'i got approved',
  'i got rejected',
  'i got sanctioned',
  'the bank approved',
  'the bank rejected',
  'the branch',
  'the bank told me'
];

const QUESTION_PATTERNS = [
  'which bank',
  'should i',
  'can i',
  'will they',
  'does anyone',
  'has anyone',
  'anyone know',
  'please help',
  'how can i',
  'what should'
];

const GENERIC_PATTERNS = [
  'community',
  'welcome to',
  'ask anything',
  'monthly thread',
  'megathread',
  'subreddit'
];

function normalize(value = '') {
  return String(value)
    .toLowerCase()
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[^\w\s₹%.-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function containsAny(text, patterns) {
  return patterns.some((pattern) =>
    text.includes(pattern)
  );
}

function countMatches(text, patterns) {
  return patterns.reduce(
    (count, pattern) =>
      count + (text.includes(pattern) ? 1 : 0),
    0
  );
}

function classifySource(source) {
  const text = normalize(
    `${source.title || ''} ${source.snippet || ''}`
  );

  if (containsAny(text, GENERIC_PATTERNS)) {
    return {
      type: 'generic',
      weight: 0.25
    };
  }

  if (
    containsAny(
      text,
      DIRECT_EXPERIENCE_PATTERNS
    )
  ) {
    return {
      type: 'direct_experience',
      weight: 1
    };
  }

  if (
    containsAny(text, QUESTION_PATTERNS)
  ) {
    return {
      type: 'question',
      weight: 0.35
    };
  }

  return {
    type: 'discussion',
    weight: 0.55
  };
}

function analyseThemes(sources) {
  const themes = {};

  for (const theme of THEMES) {
    themes[theme.key] = {
      key: theme.key,
      label: theme.label,
      positiveScore: 0,
      negativeScore: 0,
      positiveMentions: 0,
      negativeMentions: 0,
      directPositive: 0,
      directNegative: 0,
      totalMentions: 0
    };
  }

  for (const source of sources) {
    const text = normalize(
      `${source.title || ''} ${source.snippet || ''}`
    );

    const sourceType = classifySource(source);

    for (const theme of THEMES) {
      const positiveMatches = countMatches(
        text,
        theme.positive
      );

      const negativeMatches = countMatches(
        text,
        theme.negative
      );

      if (!positiveMatches && !negativeMatches) {
        continue;
      }

      themes[theme.key].positiveScore +=
        positiveMatches * sourceType.weight;

      themes[theme.key].negativeScore +=
        negativeMatches * sourceType.weight;

      themes[theme.key].positiveMentions +=
        positiveMatches;

      themes[theme.key].negativeMentions +=
        negativeMatches;

      themes[theme.key].totalMentions +=
        positiveMatches + negativeMatches;

      if (
        sourceType.type ===
        'direct_experience'
      ) {
        themes[theme.key].directPositive +=
          positiveMatches;

        themes[theme.key].directNegative +=
          negativeMatches;
      }
    }
  }

  return Object.values(themes);
}

function buildPros(themes) {
  return themes
    .filter(
      (theme) =>
        theme.positiveScore > 0 &&
        theme.positiveScore >
          theme.negativeScore
    )
    .sort(
      (a, b) =>
        b.positiveScore - a.positiveScore
    )
    .slice(0, 5)
    .map((theme) => ({
      theme: theme.key,
      text:
        `${theme.label} receives positive ` +
        `mentions in community discussions.`,
      mentions: theme.positiveMentions,
      directExperiences:
        theme.directPositive,
      strength: Number(
        theme.positiveScore.toFixed(2)
      )
    }));
}

function buildCons(themes) {
  return themes
    .filter(
      (theme) =>
        theme.negativeScore > 0 &&
        theme.negativeScore >
          theme.positiveScore
    )
    .sort(
      (a, b) =>
        b.negativeScore - a.negativeScore
    )
    .slice(0, 5)
    .map((theme) => ({
      theme: theme.key,
      text:
        `${theme.label} is a recurring ` +
        `concern in community discussions.`,
      mentions: theme.negativeMentions,
      directExperiences:
        theme.directNegative,
      strength: Number(
        theme.negativeScore.toFixed(2)
      )
    }));
}

function calculateConfidence({
  sourceCount,
  directExperienceCount,
  pros,
  cons
}) {
  let score = 20;

  score += Math.min(
    sourceCount * 4,
    28
  );

  score += Math.min(
    directExperienceCount * 7,
    28
  );

  score += Math.min(
    (pros.length + cons.length) * 4,
    20
  );

  return Math.min(
    Math.round(score),
    95
  );
}

function buildConclusion({
  sources,
  themes,
  pros,
  cons
}) {
  const redditCount =
    sources.filter(
      (source) =>
        source.source === 'reddit'
    ).length;

  const quoraCount =
    sources.filter(
      (source) =>
        source.source === 'quora'
    ).length;

  const totalSources = sources.length;

  if (!totalSources) {
    return {
      text:
        'There is not enough accessible community evidence to form a reliable borrower-experience conclusion.',
      tone: 'insufficient',
      confidence: 10
    };
  }

  const totalPositive =
    themes.reduce(
      (sum, theme) =>
        sum + theme.positiveScore,
      0
    );

  const totalNegative =
    themes.reduce(
      (sum, theme) =>
        sum + theme.negativeScore,
      0
    );

  const directExperienceCount =
    sources.filter(
      (source) =>
        classifySource(source).type ===
        'direct_experience'
    ).length;

  const total =
    totalPositive + totalNegative;

  let tone = 'mixed';

  if (total > 0) {
    const positiveRatio =
      totalPositive / total;

    if (positiveRatio >= 0.65) {
      tone = 'positive';
    } else if (positiveRatio <= 0.35) {
      tone = 'negative';
    }
  }

  let opening;

  if (tone === 'positive') {
    opening =
      'Community discussions lean positive overall.';
  } else if (tone === 'negative') {
    opening =
      'Community discussions contain more negative signals than positive ones.';
  } else {
    opening =
      'Community feedback is mixed.';
  }

  const importantThemes = themes
    .filter(
      (theme) =>
        theme.totalMentions > 0
    )
    .sort(
      (a, b) =>
        b.totalMentions -
        a.totalMentions
    )
    .slice(0, 3);

  const themeSentence =
    importantThemes.length
      ? `The most discussed areas are ${importantThemes
          .map((theme) =>
            theme.label.toLowerCase()
          )
          .join(', ')}.`
      : '';

  let caution;

  if (cons.length && pros.length) {
    caution =
      'Experiences vary by borrower, branch, loan amount and circumstances, so community reports should be treated as signals rather than guarantees.';
  } else if (cons.length) {
    caution =
      'The recurring concerns are worth checking directly with the lender before applying, especially for time-sensitive applications.';
  } else {
    caution =
      'Positive community reports do not guarantee the same experience for every borrower.';
  }

  const sourceParts = [];

  if (redditCount) {
    sourceParts.push(
      `${redditCount} Reddit source${
        redditCount === 1 ? '' : 's'
      }`
    );
  }

  if (quoraCount) {
    sourceParts.push(
      `${quoraCount} Quora source${
        quoraCount === 1 ? '' : 's'
      }`
    );
  }

  const sourceSentence =
    sourceParts.length
      ? sourceParts.join(' and ')
      : `${totalSources} community source${
          totalSources === 1 ? '' : 's'
        }`;

  const directSentence =
    directExperienceCount
      ? ` ${directExperienceCount} of these are classified as direct borrower experiences.`
      : ' Most available material is discussion or question-based rather than first-hand experience.';

  return {
    text:
      `${opening} ${themeSentence} ` +
      `This analysis uses ${sourceSentence}.` +
      `${directSentence} ${caution}`,

    tone,

    confidence: calculateConfidence({
      sourceCount: totalSources,
      directExperienceCount,
      pros,
      cons
    })
  };
}

export function generateProsCons({
  sources = []
}) {
  const cleanedSources = sources
    .filter(
      (source) =>
        source &&
        (source.title || source.snippet)
    )
    .map((source) => ({
      ...source,
      title: String(source.title || ''),
      snippet: String(source.snippet || '')
    }));

  const themes =
    analyseThemes(cleanedSources);

  const pros = buildPros(themes);
  const cons = buildCons(themes);

  const conclusion = buildConclusion({
    sources: cleanedSources,
    themes,
    pros,
    cons
  });

  const filteredThemes = themes
    .filter(
      (theme) =>
        theme.totalMentions > 0
    )
    .map((theme) => ({
      key: theme.key,
      label: theme.label,
      positive: theme.positiveMentions,
      negative: theme.negativeMentions,
      directPositive: theme.directPositive,
      directNegative: theme.directNegative,
      mentions: theme.totalMentions
    }));

  return {
    pros: pros.map(
      (item) => item.text
    ),

    cons: cons.map(
      (item) => item.text
    ),

    conclusion: conclusion.text,

    confidence: conclusion.confidence,

    tone: conclusion.tone,

    communityStats: {
      totalSources: cleanedSources.length,

      reddit: cleanedSources.filter(
        (source) =>
          source.source === 'reddit'
      ).length,

      quora: cleanedSources.filter(
        (source) =>
          source.source === 'quora'
      ).length,

      directExperiences: cleanedSources.filter(
        (source) =>
          classifySource(source).type ===
          'direct_experience'
      ).length,

      positiveSignals: themes.reduce(
        (sum, theme) =>
          sum + theme.positiveMentions,
        0
      ),

      negativeSignals: themes.reduce(
        (sum, theme) =>
          sum + theme.negativeMentions,
        0
      )
    },

    themes: filteredThemes
  };
}