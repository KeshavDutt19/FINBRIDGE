import { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  BarChart3,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Gauge,
  IndianRupee,
  ShieldCheck,
  Sparkles,
  Trophy,
  WalletCards,
} from 'lucide-react';
import { Link, useParams } from 'react-router-dom';

import PageShell from '../components/PageShell.jsx';
import TrustNotice from '../components/TrustNotice.jsx';

import { api, formatCurrency } from '../lib/api.js';

const DEFAULT_PROFILE = {
  desiredAmount: 1000000,
  preferredTenure: 60,
  monthlyIncome: 100000,
  existingMonthlyObligations: 0,
  cibilScore: 750,
  collateralAvailable: false,
  borrowerType: 'individual',
  studyDestination: 'India',
  isFemale: false,
};

function titleCase(value = '') {
  return value
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function formatNumber(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return '—';

  return number.toLocaleString('en-IN', {
    maximumFractionDigits: 2,
  });
}

function formatPercentage(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return '—';
  return `${number.toFixed(2)}%`;
}

function recommendationClasses(recommendation) {
  switch (recommendation) {
    case 'strong_match':
      return 'bg-[#dcebd8] text-[#31572c]';

    case 'good_match':
      return 'bg-[#e9f3da] text-[#466b2f]';

    case 'possible_match':
      return 'bg-[#f3eee1] text-[#756033]';

    default:
      return 'bg-[#f6dddd] text-[#8a3838]';
  }
}

function verificationLabel(status) {
  if (!status) return 'Not verified';

  return status
    .replaceAll('_', ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function rateLabel(result) {
  const startingRate = result?.rateDetails?.startingRate;

  if (Number.isFinite(Number(startingRate))) {
    return `${Number(startingRate).toFixed(2)}% p.a. starting`;
  }

  return result?.interestRate || 'Rate not listed';
}

function HighlightCard({ icon: Icon, eyebrow, title, value, description }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-white/35">
            {eyebrow}
          </p>

          <h3 className="mt-2 text-lg font-bold text-white">
            {title}
          </h3>
        </div>

        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#d7ee82]/10">
          <Icon size={19} className="text-[#d7ee82]" />
        </div>
      </div>

      <p className="mt-5 text-2xl font-bold tracking-[-0.03em] text-white">
        {value}
      </p>

      <p className="mt-2 text-xs leading-5 text-white/45">
        {description}
      </p>
    </div>
  );
}

function ResultCard({ result, rank }) {
  const verificationStatus =
    result?.verification?.overallStatus ||
    result?.verification?.status ||
    'unverified';

  const strongEnough = Number(result?.score) > 35;

  return (
    <article
      className={[
        'rounded-[1.5rem] border p-6 transition-all duration-300',
        rank === 1 && strongEnough
          ? 'border-[#d7ee82]/30 bg-[#d7ee82]/[0.06] shadow-[0_15px_45px_rgba(215,238,130,0.07)]'
          : 'border-white/10 bg-white/[0.04]',
        'hover:bg-white/[0.06]',
      ].join(' ')}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">

        <div className="flex items-start gap-4">

          <div
            className={[
              'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-sm font-black',
              rank === 1
                ? 'bg-[#d7ee82] text-[#11110f]'
                : 'bg-white/10 text-white',
            ].join(' ')}
          >
            #{rank}
          </div>

          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-white/35">
              {result.category}
            </p>

            <h3 className="mt-1 text-xl font-bold text-white">
              {result.bankName}
            </h3>

            <p className="mt-1 text-sm text-white/45">
              {result.productName}
            </p>
          </div>

        </div>

        <div className="flex items-center gap-2">
          <span
            className={[
              'rounded-full px-3 py-1.5 text-xs font-bold',
              recommendationClasses(result.recommendation),
            ].join(' ')}
          >
            {titleCase(result.recommendation)}
          </span>

          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-bold text-white/80">
            {Number(result.score || 0).toFixed(1)}/100
          </span>
        </div>

      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">

        <div className="rounded-xl bg-white/[0.04] p-4">
          <p className="text-[11px] font-bold uppercase tracking-wide text-white/30">
            Starting rate
          </p>

          <p className="mt-2 text-lg font-bold text-white">
            {rateLabel(result)}
          </p>
        </div>

        <div className="rounded-xl bg-white/[0.04] p-4">
          <p className="text-[11px] font-bold uppercase tracking-wide text-white/30">
            Estimated EMI
          </p>

          <p className="mt-2 text-lg font-bold text-white">
            {result.estimatedEmi
              ? formatCurrency(result.estimatedEmi)
              : 'Not calculable'}
          </p>
        </div>

        <div className="rounded-xl bg-white/[0.04] p-4">
          <p className="text-[11px] font-bold uppercase tracking-wide text-white/30">
            Estimated DTI
          </p>

          <p className="mt-2 text-lg font-bold text-white">
            {result.estimatedDti != null
              ? formatPercentage(result.estimatedDti)
              : 'Not calculable'}
          </p>
        </div>

        <div className="rounded-xl bg-white/[0.04] p-4">
          <p className="text-[11px] font-bold uppercase tracking-wide text-white/30">
            Verification
          </p>

          <div className="mt-2 flex items-center gap-2">
            <ShieldCheck size={16} className="text-[#d7ee82]" />

            <span className="text-sm font-semibold text-white">
              {verificationLabel(verificationStatus)}
            </span>
          </div>

          {result?.verification?.verificationScore != null && (
            <p className="mt-1 text-xs text-white/35">
              Confidence score: {result.verification.verificationScore}/100
            </p>
          )}
        </div>

      </div>

      {result.componentScores && (
        <div className="mt-5">
          <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-white/30">
            Score breakdown
          </p>

          <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">

            {Object.entries(result.componentScores)
              .filter(([, value]) => Number.isFinite(Number(value)))
              .map(([key, value]) => (
                <div
                  key={key}
                  className="rounded-xl border border-white/8 bg-white/[0.025] px-3 py-3"
                >
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-white/30">
                    {titleCase(key)}
                  </p>

                  <p className="mt-1 text-sm font-bold text-white">
                    {Number(value).toFixed(1)}
                  </p>
                </div>
              ))}
          </div>
        </div>
      )}

      {(result.reasons?.length > 0 || result.warnings?.length > 0) && (
        <div className="mt-5 grid gap-4 lg:grid-cols-2">

          {result.reasons?.length > 0 && (
            <div className="rounded-xl border border-[#d7ee82]/10 bg-[#d7ee82]/[0.035] p-4">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-[#d7ee82]" />

                <p className="text-sm font-bold text-white">
                  Why this matched
                </p>
              </div>

              <ul className="mt-3 space-y-2">
                {result.reasons.slice(0, 4).map((reason, index) => (
                  <li
                    key={`${reason}-${index}`}
                    className="text-sm leading-5 text-white/55"
                  >
                    • {reason}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {result.warnings?.length > 0 && (
            <div className="rounded-xl border border-[#ffbf69]/10 bg-[#ffbf69]/[0.035] p-4">
              <div className="flex items-center gap-2">
                <AlertTriangle size={16} className="text-[#ffbf69]" />

                <p className="text-sm font-bold text-white">
                  Important notes
                </p>
              </div>

              <ul className="mt-3 space-y-2">
                {result.warnings.slice(0, 4).map((warning, index) => (
                  <li
                    key={`${warning}-${index}`}
                    className="text-sm leading-5 text-white/55"
                  >
                    • {warning}
                  </li>
                ))}
              </ul>
            </div>
          )}

        </div>
      )}

      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

        <div className="flex items-center gap-2 text-xs text-white/35">
          <Clock3 size={14} />

          <span>
            Comparison uses available lender data and indicative rates.
          </span>
        </div>

        <Link
          to={`/loans/${result.category}/${result.loanId}`}
          className="
            inline-flex
            items-center
            justify-center
            gap-2
            rounded-full
            bg-white
            px-5
            py-2.5
            text-sm
            font-semibold
            text-[#11110f]
            transition-all
            duration-300
            hover:-translate-y-0.5
          "
        >
          View details
          <ChevronRight size={16} />
        </Link>

      </div>
    </article>
  );
}

export default function LoanCategory() {
  const { category } = useParams();

  const [loans, setLoans] = useState([]);

  const [profile, setProfile] = useState({
    ...DEFAULT_PROFILE,
  });

  const [comparison, setComparison] = useState(null);
  const [comparing, setComparing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api(`/loans/${category}`)
      .then((data) => setLoans(data.loans || []))
      .catch(() => setLoans([]));

    // Clear results when the category changes.
    setComparison(null);
    setError('');
  }, [category]);

  const categoryTitle = useMemo(
    () =>
      category
        ? `${category[0].toUpperCase()}${category.slice(1)} Loans`
        : 'Loans',
    [category]
  );

  function updateProfile(field, value) {
    setProfile((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function runComparison(event) {
    event.preventDefault();

    setComparing(true);
    setError('');

    try {
      const body = {
        category,

        profile: {
          category,

          desiredAmount: Number(profile.desiredAmount),
          preferredTenure: Number(profile.preferredTenure),
          monthlyIncome: Number(profile.monthlyIncome),
          existingMonthlyObligations: Number(
            profile.existingMonthlyObligations
          ),
          cibilScore: Number(profile.cibilScore),

          collateralAvailable: Boolean(profile.collateralAvailable),

          borrowerType: profile.borrowerType,

          ...(category === 'education'
            ? {
                studyDestination: profile.studyDestination,
              }
            : {}),

          isFemale: Boolean(profile.isFemale),
        },

        limit: 3,
      };

      const data = await api('/loans/compare', {
        method: 'POST',
        body: JSON.stringify(body),
      });

      setComparison(data);
    } catch (err) {
      setComparison(null);
      setError(
        err?.message ||
          'Unable to compare loans right now. Please try again.'
      );
    } finally {
      setComparing(false);
    }
  }

  const results = comparison?.results || [];
  const highlights = comparison?.highlights || null;

  const topScore = Number(results?.[0]?.score);

  const noStrongMatch =
    results.length > 0 &&
    Number.isFinite(topScore) &&
    topScore <= 35;

  return (
    <PageShell
      title={categoryTitle}
      eyebrow="Personalized bank comparison"
      subtitle="Compare lender products using your amount, tenure, income, obligations, CIBIL score and eligibility profile."
    >

      {/* Existing product cards */}

      <section className="grid gap-5 lg:grid-cols-2 xl:grid-cols-3">

        {loans.map((loan) => (

          <article
            key={loan._id}
            className="
              group
              relative
              rounded-[1.5rem]
              border
              border-black/[0.08]
              bg-white
              p-6
              shadow-[0_10px_35px_rgba(0,0,0,0.04)]
              transition-all
              duration-300
              hover:-translate-y-1
              hover:border-black/[0.14]
            "
          >

            <div className="flex items-start justify-between gap-4">

              <div>

                <p className="fb-eyebrow">
                  {loan.category || category}
                </p>

                <h2 className="mt-2 text-xl font-bold tracking-[-0.025em]">
                  {loan.bankName}
                </h2>

                <p className="mt-1 text-sm text-black/45">
                  {loan.productName}
                </p>

              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f4f1ea]">
                <IndianRupee
                  size={18}
                  className="text-[#375b32]"
                />
              </div>

            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">

              <div className="rounded-xl bg-[#f7f4ee] p-4">
                <p className="text-[11px] font-bold uppercase tracking-wide text-black/35">
                  Interest
                </p>

                <p className="mt-2 text-lg font-bold">
                  {loan.rateDetails?.startingRate
                    ? `${loan.rateDetails.startingRate}% starting`
                    : loan.interestRate || 'Not listed'}
                </p>
              </div>

              <div className="rounded-xl bg-[#f7f4ee] p-4">
                <p className="text-[11px] font-bold uppercase tracking-wide text-black/35">
                  Max loan
                </p>

                <p className="mt-2 text-lg font-bold">
                  {formatCurrency(loan.loanAmountMax)}
                </p>
              </div>

            </div>

            <div className="mt-3 grid grid-cols-2 gap-3">

              <div className="rounded-xl border border-black/[0.06] p-4">
                <p className="text-[11px] font-bold uppercase tracking-wide text-black/35">
                  Tenure
                </p>

                <p className="mt-2 text-sm font-semibold">
                  {loan.tenureMin != null && loan.tenureMax != null
                    ? `${loan.tenureMin}–${loan.tenureMax} months`
                    : 'Varies'}
                </p>
              </div>

              <div className="rounded-xl border border-black/[0.06] p-4">
                <p className="text-[11px] font-bold uppercase tracking-wide text-black/35">
                  Processing
                </p>

                <p className="mt-2 text-sm font-semibold">
                  {loan.processingFee || 'Not listed'}
                </p>
              </div>

            </div>

            <div className="mt-5">
              <TrustNotice
                {...loan}
                label={loan.dataLabel}
              />
            </div>

            <Link
              to={`/loans/${category}/${loan._id}`}
              className="
                mt-5
                inline-flex
                w-full
                items-center
                justify-center
                gap-2
                rounded-full
                bg-[#11110f]
                px-4
                py-3
                text-sm
                font-semibold
                text-white
                transition-all
                duration-300
                hover:-translate-y-0.5
                hover:bg-black
              "
            >
              View details
              <ChevronRight size={16} />
            </Link>

          </article>
        ))}

      </section>

      {/* Personalized comparison form */}

      <section
        className="
          relative
          mt-8
          overflow-hidden
          rounded-[1.75rem]
          border
          border-black/[0.08]
          bg-[#f3f0e8]
          p-6
          sm:p-8
        "
      >

        <div className="pointer-events-none absolute -right-20 -top-20 h-60 w-60 rounded-full bg-[#d7ee82]/30 blur-[80px]" />

        <div className="relative">

          <div className="flex items-start gap-4">

            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#11110f] text-[#d7ee82]">
              <Sparkles size={21} />
            </div>

            <div>
              <p className="fb-eyebrow">
                Personalized ranking
              </p>

              <h2 className="mt-2 text-3xl font-semibold tracking-[-0.04em]">
                Find the best match for you
              </h2>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-black/50">
                FinBridge scores available loans using affordability,
                rate competitiveness, tenure fit, collateral compatibility,
                credit fit and source confidence.
              </p>
            </div>

          </div>

          <form
            onSubmit={runComparison}
            className="mt-7 grid gap-4 md:grid-cols-2 lg:grid-cols-4"
          >

            <label className="text-sm font-semibold">
              Desired amount
              <input
                type="number"
                min="0"
                className="field mt-1"
                value={profile.desiredAmount}
                onChange={(event) =>
                  updateProfile('desiredAmount', event.target.value)
                }
                required
              />
            </label>

            <label className="text-sm font-semibold">
              Preferred tenure
              <input
                type="number"
                min="1"
                className="field mt-1"
                value={profile.preferredTenure}
                onChange={(event) =>
                  updateProfile('preferredTenure', event.target.value)
                }
                required
              />
            </label>

            <label className="text-sm font-semibold">
              Monthly income
              <input
                type="number"
                min="0"
                className="field mt-1"
                value={profile.monthlyIncome}
                onChange={(event) =>
                  updateProfile('monthlyIncome', event.target.value)
                }
                required
              />
            </label>

            <label className="text-sm font-semibold">
              Existing obligations
              <input
                type="number"
                min="0"
                className="field mt-1"
                value={profile.existingMonthlyObligations}
                onChange={(event) =>
                  updateProfile(
                    'existingMonthlyObligations',
                    event.target.value
                  )
                }
              />
            </label>

            <label className="text-sm font-semibold">
              CIBIL score
              <input
                type="number"
                min="300"
                max="900"
                className="field mt-1"
                value={profile.cibilScore}
                onChange={(event) =>
                  updateProfile('cibilScore', event.target.value)
                }
              />
            </label>

            <label className="text-sm font-semibold">
              Borrower type
              <select
                className="field mt-1"
                value={profile.borrowerType}
                onChange={(event) =>
                  updateProfile('borrowerType', event.target.value)
                }
              >
                <option value="individual">Individual</option>
                <option value="co-applicant">Co-applicant</option>
                <option value="business">Business</option>
              </select>
            </label>

            <label className="text-sm font-semibold">
              Collateral available
              <select
                className="field mt-1"
                value={String(profile.collateralAvailable)}
                onChange={(event) =>
                  updateProfile(
                    'collateralAvailable',
                    event.target.value === 'true'
                  )
                }
              >
                <option value="false">No</option>
                <option value="true">Yes</option>
              </select>
            </label>

            {category === 'education' ? (
              <label className="text-sm font-semibold">
                Study destination
                <select
                  className="field mt-1"
                  value={profile.studyDestination}
                  onChange={(event) =>
                    updateProfile(
                      'studyDestination',
                      event.target.value
                    )
                  }
                >
                  <option value="India">India</option>
                  <option value="Abroad">Abroad</option>
                </select>
              </label>
            ) : (
              <label className="text-sm font-semibold">
                Applicant preference
                <select
                  className="field mt-1"
                  value={String(profile.isFemale)}
                  onChange={(event) =>
                    updateProfile(
                      'isFemale',
                      event.target.value === 'true'
                    )
                  }
                >
                  <option value="false">Standard</option>
                  <option value="true">Female applicant</option>
                </select>
              </label>
            )}

            <div className="md:col-span-2 lg:col-span-4">
              <button
                type="submit"
                disabled={comparing}
                className="
                  inline-flex
                  w-full
                  items-center
                  justify-center
                  gap-2
                  rounded-full
                  bg-[#11110f]
                  px-6
                  py-3.5
                  text-sm
                  font-semibold
                  text-white
                  transition-all
                  duration-300
                  hover:-translate-y-0.5
                  hover:bg-black
                  disabled:cursor-not-allowed
                  disabled:opacity-60
                "
              >
                {comparing ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Comparing loans...
                  </>
                ) : (
                  <>
                    <BarChart3 size={17} />
                    Compare loans for me
                  </>
                )}
              </button>
            </div>

          </form>

          <p className="mt-4 text-xs leading-5 text-black/40">
            This is a personalized screening tool, not a loan approval,
            sanction or guaranteed lender quote.
          </p>

        </div>

      </section>

      {error && (
        <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-800">
          <div className="flex items-start gap-3">
            <AlertTriangle
              size={18}
              className="mt-0.5 shrink-0"
            />

            <div>
              <p className="font-bold">
                Comparison failed
              </p>

              <p className="mt-1">
                {error}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Personalized results */}

      {comparison && results.length > 0 && (
        <section
          className="
            relative
            mt-8
            overflow-hidden
            rounded-[1.75rem]
            bg-[#11110f]
            p-6
            text-white
            sm:p-8
          "
        >

          <div className="pointer-events-none absolute -left-20 -top-20 h-60 w-60 rounded-full bg-[#d7ee82]/10 blur-[80px]" />
          <div className="pointer-events-none absolute -bottom-24 -right-20 h-72 w-72 rounded-full bg-[#8aa6ff]/10 blur-[90px]" />

          <div className="relative z-10">

            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">

              <div>
                <p className="fb-eyebrow-dark">
                  Personalized results
                </p>

                <h2 className="mt-2 text-3xl font-semibold tracking-[-0.04em]">
                  Your loan matches
                </h2>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-white/45">
                  Ranked using your profile and the currently available
                  lender data for this category.
                </p>
              </div>

              <div className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-xs font-semibold text-white/55">
                {comparison.returnedCount || results.length} products compared
              </div>

            </div>

            {noStrongMatch ? (
              <div className="mt-7 rounded-2xl border border-[#ffbf69]/15 bg-[#ffbf69]/[0.05] p-5">

                <div className="flex items-start gap-3">

                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#ffbf69]/10">
                    <AlertTriangle
                      size={19}
                      className="text-[#ffbf69]"
                    />
                  </div>

                  <div>
                    <h3 className="font-bold text-white">
                      No strong match found
                    </h3>

                    <p className="mt-1 text-sm leading-6 text-white/50">
                      All available products are currently below the
                      strong-match threshold for this profile. Consider
                      adjusting the loan amount, tenure, income profile
                      or adding an eligible co-applicant.
                    </p>

                    {results[0]?.estimatedDti != null && (
                      <p className="mt-3 text-sm font-semibold text-[#ffbf69]">
                        Current estimated DTI:{' '}
                        {formatPercentage(results[0].estimatedDti)}
                      </p>
                    )}
                  </div>

                </div>

              </div>
            ) : null}

            {/* Highlights */}

            {highlights && (
              <div className="mt-7 grid gap-4 md:grid-cols-3">

                {!noStrongMatch && highlights.bestOverall && (
                  <HighlightCard
                    icon={Trophy}
                    eyebrow="Personalized winner"
                    title={highlights.bestOverall.productName}
                    value={`${Number(
                      highlights.bestOverall.score || 0
                    ).toFixed(1)}/100`}
                    description={
                      highlights.bestOverall.reason ||
                      'Highest personalized comparison score.'
                    }
                  />
                )}

                {highlights.lowestStartingRate && (
                  <HighlightCard
                    icon={WalletCards}
                    eyebrow="Lowest starting rate"
                    title={highlights.lowestStartingRate.productName}
                    value={`${Number(
                      highlights.lowestStartingRate.startingRate
                    ).toFixed(2)}%`}
                    description={
                      highlights.lowestStartingRate.reason ||
                      'Lowest available starting rate among compared products.'
                    }
                  />
                )}

                {highlights.bestAffordability && (
                  <HighlightCard
                    icon={Gauge}
                    eyebrow="Best affordability"
                    title={highlights.bestAffordability.productName}
                    value={
                      highlights.bestAffordability.estimatedDti != null
                        ? `${Number(
                            highlights.bestAffordability.estimatedDti
                          ).toFixed(2)}% DTI`
                        : 'Not calculable'
                    }
                    description={
                      highlights.bestAffordability.reason ||
                      'Lowest estimated debt-to-income ratio.'
                    }
                  />
                )}

                {noStrongMatch && !highlights.bestOverall && (
                  <HighlightCard
                    icon={BarChart3}
                    eyebrow="Screening result"
                    title="No strong match"
                    value="35 or below"
                    description="Available products reached the comparison score floor for this profile."
                  />
                )}

              </div>
            )}

            {/* Ranked results */}

            <div className="mt-8 space-y-4">

              {results.map((result, index) => (
                <ResultCard
                  key={result.loanId}
                  result={result}
                  rank={index + 1}
                />
              ))}

            </div>

            {/* Disclaimer */}

            <div className="mt-7 flex items-start gap-3 rounded-2xl border border-white/8 bg-white/[0.025] p-4">

              <AlertTriangle
                size={17}
                className="mt-0.5 shrink-0 text-white/35"
              />

              <p className="text-xs leading-5 text-white/40">
                {comparison.disclaimer ||
                  'Rates, fees, eligibility criteria and EMI estimates are indicative. Verify current lender conditions directly with the bank before applying.'}
              </p>

            </div>

          </div>

        </section>
      )}

    </PageShell>
  );
}