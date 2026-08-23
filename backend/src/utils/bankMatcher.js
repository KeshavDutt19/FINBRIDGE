const BANK_ALIASES = {
  hdfc: ['hdfc', 'hdfc bank', 'hdfc bank limited'],
  sbi: ['sbi', 'state bank of india'],
  icici: ['icici', 'icici bank', 'icici bank limited'],
  axis: ['axis', 'axis bank'],
  pnb: ['pnb', 'punjab national bank'],
  bob: ['bob', 'bank of baroda'],
  canara: ['canara', 'canara bank'],
  kotak: ['kotak', 'kotak mahindra', 'kotak mahindra bank'],
  indusind: ['indusind', 'indusind bank'],
  union: ['union bank', 'union bank of india'],
  idbi: ['idbi', 'idbi bank'],
  boi: ['bank of india'],
};

export function normalizeBankName(name = '') {
  const value = name
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  for (const [canonical, aliases] of Object.entries(BANK_ALIASES)) {
    if (
      aliases.some(
        (alias) => value === alias || value.includes(alias)
      )
    ) {
      return canonical;
    }
  }

  return value;
}

export function banksMatch(a, b) {
  if (!a || !b) return false;

  return normalizeBankName(a) === normalizeBankName(b);
}

export function getCanonicalBankName(name = '') {
  const normalized = normalizeBankName(name);

  const canonicalNames = {
    hdfc: 'HDFC Bank',
    sbi: 'State Bank of India',
    icici: 'ICICI Bank',
    axis: 'Axis Bank',
    pnb: 'Punjab National Bank',
    bob: 'Bank of Baroda',
    canara: 'Canara Bank',
    kotak: 'Kotak Mahindra Bank',
    indusind: 'IndusInd Bank',
    union: 'Union Bank of India',
    idbi: 'IDBI Bank',
    boi: 'Bank of India',
  };

  return canonicalNames[normalized] || name;
}