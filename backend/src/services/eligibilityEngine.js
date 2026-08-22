function includesAny(ruleValues = [], userValue) {
  if (!ruleValues.length || ruleValues.includes('All') || ruleValues.includes('Any')) return true;
  return Boolean(userValue && ruleValues.map(String).map(v => v.toLowerCase()).includes(String(userValue).toLowerCase()));
}

export function evaluateScholarshipEligibility(profile = {}, scholarship) {
  const checks = [];
  const add = (passed, label, weight = 1, blocking = false) => checks.push({ passed, label, weight, blocking });

  add(includesAny(scholarship.educationLevels, profile.educationLevel), 'Your education level matches the stated criteria.', 2, true);
  add(includesAny(scholarship.states, profile.state), 'Your state is included or the scholarship is national.', 1, false);
  add(includesAny(scholarship.eligibleCategories, profile.category), 'Your category matches the eligibility criteria.', 1, false);

  if (scholarship.genderEligibility && scholarship.genderEligibility !== 'Any') {
    add(String(profile.gender || '').toLowerCase() === scholarship.genderEligibility.toLowerCase(), `Gender criteria: ${scholarship.genderEligibility}.`, 1, true);
  }
  if (scholarship.disabilityEligibility === 'Required') {
    add(Boolean(profile.disabilityStatus), 'Disability status is required for this scholarship.', 1, true);
  }
  if (Number.isFinite(scholarship.minPercentage)) {
    add(Number(profile.academicScore || 0) >= scholarship.minPercentage, `Minimum academic score is ${scholarship.minPercentage}%; your profile says ${profile.academicScore || 'not provided'}%.`, 2, true);
  }
  if (Number.isFinite(scholarship.maxFamilyIncome)) {
    add(Number(profile.annualFamilyIncome || Infinity) <= scholarship.maxFamilyIncome, `Family income limit is INR ${scholarship.maxFamilyIncome.toLocaleString('en-IN')}.`, 2, true);
  }
  if (Number.isFinite(scholarship.ageLimit)) {
    add(Number(profile.age || Infinity) <= scholarship.ageLimit, `Age limit is ${scholarship.ageLimit} years.`, 1, true);
  }

  const total = checks.reduce((sum, c) => sum + c.weight, 0) || 1;
  const earned = checks.filter(c => c.passed).reduce((sum, c) => sum + c.weight, 0);
  const score = Math.round((earned / total) * 100);
  const blockingMiss = checks.some(c => c.blocking && !c.passed);
  let status = 'needs verification';
  if (score >= 85 && !blockingMiss) status = 'eligible';
  else if (score >= 60) status = 'likely eligible';
  else status = 'not eligible';

  return {
    status,
    score,
    explanation: checks.map(c => ({ ok: c.passed, text: c.label }))
  };
}
