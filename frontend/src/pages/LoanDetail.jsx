import { useEffect, useState } from 'react';
import {
  Building2,
  ExternalLink,
  MessageCircle,
  ShieldCheck,
  ThumbsDown,
  ThumbsUp,
} from 'lucide-react';
import { Link, useParams } from 'react-router-dom';

import PageShell from '../components/PageShell.jsx';
import TrustNotice from '../components/TrustNotice.jsx';
import {
  api,
  formatCurrency,
} from '../lib/api.js';

export default function LoanDetail() {
  const { category, bankId } = useParams();

  const [loan, setLoan] = useState(null);
  const [insight, setInsight] = useState(null);
  const [insightLoading, setInsightLoading] =
    useState(true);
  const [insightError, setInsightError] =
    useState('');

  useEffect(() => {
    let cancelled = false;

    async function loadLoan() {
      try {
        const data = await api(
          `/loans/${category}/${bankId}`
        );

        if (!cancelled) {
          setLoan(data.loan);
        }
      } catch {
        if (!cancelled) {
          setLoan(null);
        }
      }
    }

    loadLoan();

    return () => {
      cancelled = true;
    };
  }, [category, bankId]);

  useEffect(() => {
    if (!loan?._id) {
      return;
    }

    let cancelled = false;

    async function loadInsight() {
      setInsightLoading(true);
      setInsightError('');

      try {
        const data = await api(
          `/loan-intelligence/${loan._id}/comparison`
        );

        if (!cancelled) {
          setInsight(data.insight);
        }
      } catch (error) {
        if (!cancelled) {
          setInsight(null);
          setInsightError(
            error?.message ||
              'Community analysis is not available yet.'
          );
        }
      } finally {
        if (!cancelled) {
          setInsightLoading(false);
        }
      }
    }

    loadInsight();

    return () => {
      cancelled = true;
    };
  }, [loan?._id]);

  if (!loan) {
    return (
      <PageShell title="Loading loan..." />
    );
  }

  const sections = [
    [
      'Eligibility',
      [
        loan.eligibility,
        loan.ageCriteria,
        loan.incomeCriteria,
      ],
    ],

    [
      'Required documents',
      loan.documents,
    ],

    [
      'Subsidy & concession',
      [
        loan.subsidy,
        loan.subsidyDetails,
        ...(loan.specialBenefits || []),
      ],
    ],

    [
      'Repayment information',
      [loan.repaymentInfo],
    ],

    [
      'Application procedure',
      loan.applicationProcedure,
    ],

    [
      'Terms & disclaimer',
      [loan.disclaimer],
    ],
  ];

  const confidence =
    Number(insight?.confidence || 0);

  const confidenceLabel =
    confidence >= 75
      ? 'Strong evidence'
      : confidence >= 50
        ? 'Moderate evidence'
        : confidence > 0
          ? 'Limited evidence'
          : 'Not available';

  const tone = insight?.tone || 'mixed';

  return (
    <PageShell
      title={loan.productName}
      eyebrow={loan.bankName}
      subtitle={loan.description}
    >
      <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">

        {/* =====================================================
            LEFT — LOAN SUMMARY
        ====================================================== */}

        <aside
          className="
            fb-card
            h-fit
            p-6
            lg:sticky
            lg:top-28
          "
        >
          <div className="flex items-start justify-between">
            <div
              className="
                flex
                h-16
                w-16
                items-center
                justify-center
                rounded-2xl
                bg-[#f4f1ea]
                text-[#375b32]
              "
            >
              <Building2 size={34} />
            </div>

            <span
              className="
                rounded-full
                bg-[#dcebd8]
                px-3
                py-1.5
                text-xs
                font-bold
                text-[#375b32]
              "
            >
              {category}
            </span>
          </div>

          <h2
            className="
              mt-7
              text-2xl
              font-bold
              tracking-[-0.03em]
            "
          >
            {loan.bankName}
          </h2>

          <p className="mt-1 text-sm text-black/45">
            {loan.productName}
          </p>

          <div className="mt-7 grid gap-3">
            {[
              [
                'Interest rate',
                loan.interestRate,
              ],

              [
                'Loan amount',
                `${formatCurrency(
                  loan.loanAmountMin
                )} – ${formatCurrency(
                  loan.loanAmountMax
                )}`,
              ],

              [
                'Tenure',
                `${loan.tenureMin}–${loan.tenureMax} months`,
              ],

              [
                'Processing fee',
                loan.processingFee,
              ],

              [
                'Collateral',
                loan.collateralRequired,
              ],
            ].map(([label, value]) => (
              <div
                key={label}
                className="
                  rounded-xl
                  border
                  border-black/[0.06]
                  bg-[#faf9f6]
                  p-4
                "
              >
                <p
                  className="
                    text-[11px]
                    font-bold
                    uppercase
                    tracking-wide
                    text-black/35
                  "
                >
                  {label}
                </p>

                <p className="mt-2 text-sm font-semibold">
                  {value || 'Not listed'}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-5">
            <TrustNotice
              {...loan}
              label={loan.dataLabel}
            />
          </div>

          <a
            className="btn-primary mt-5 w-full"
            href={loan.officialUrl}
            target="_blank"
            rel="noreferrer"
          >
            Apply on Official Website
            <ExternalLink size={16} />
          </a>

          <Link
            className="btn-secondary mt-2 w-full"
            to={`/apply/loan/${loan._id}?category=${category}`}
          >
            Start Demo Application
          </Link>
        </aside>

        {/* =====================================================
            RIGHT — DETAILS + COMMUNITY INTELLIGENCE
        ====================================================== */}

        <div className="grid gap-4">

          {/* =================================================
              COMMUNITY INTELLIGENCE
          ================================================== */}

          <section
            className="
              overflow-hidden
              rounded-[2rem]
              border
              border-black/10
              bg-[#11110f]
              p-6
              text-white
              shadow-[0_24px_70px_rgba(0,0,0,0.10)]
              sm:p-7
            "
          >
            <div
              className="
                flex
                flex-col
                gap-5
                sm:flex-row
                sm:items-start
                sm:justify-between
              "
            >
              <div>
                <div
                  className="
                    inline-flex
                    items-center
                    gap-2
                    rounded-full
                    border
                    border-white/10
                    bg-white/[0.05]
                    px-3
                    py-1.5
                    text-[11px]
                    font-semibold
                    uppercase
                    tracking-[0.14em]
                    text-white/45
                  "
                >
                  <MessageCircle size={13} />
                  Community intelligence
                </div>

                <h2
                  className="
                    mt-4
                    text-2xl
                    font-medium
                    tracking-[-0.04em]
                    sm:text-3xl
                  "
                >
                  What borrowers are saying
                </h2>

                <p
                  className="
                    mt-2
                    max-w-2xl
                    text-sm
                    leading-6
                    text-white/45
                  "
                >
                  FinBridge analyzes accessible Reddit and
                  Quora discussions to identify recurring
                  borrower experiences. These are community
                  signals, not official lender terms.
                </p>
              </div>

              <div
                className="
                  flex
                  shrink-0
                  items-center
                  gap-2
                  rounded-2xl
                  bg-white/[0.06]
                  px-4
                  py-3
                "
              >
                <ShieldCheck
                  size={17}
                  className="text-[#d7ee82]"
                />

                <div>
                  <p className="text-xs font-semibold">
                    {confidenceLabel}
                  </p>

                  <p className="mt-0.5 text-[11px] text-white/35">
                    {confidence
                      ? `${confidence}% confidence`
                      : 'Awaiting analysis'}
                  </p>
                </div>
              </div>
            </div>

            {insightLoading && (
              <div className="mt-7 grid gap-3 md:grid-cols-2">
                {[1, 2].map((item) => (
                  <div
                    key={item}
                    className="
                      animate-pulse
                      rounded-2xl
                      border
                      border-white/10
                      bg-white/[0.04]
                      p-5
                    "
                  >
                    <div className="h-4 w-1/3 rounded bg-white/10" />
                    <div className="mt-4 h-3 w-full rounded bg-white/5" />
                    <div className="mt-2 h-3 w-5/6 rounded bg-white/5" />
                    <div className="mt-2 h-3 w-2/3 rounded bg-white/5" />
                  </div>
                ))}
              </div>
            )}

            {!insightLoading && insight && (
              <>
                {/* PROS / CONS */}

                <div className="mt-7 grid gap-4 md:grid-cols-2">

                  {/* PROS */}

                  <div
                    className="
                      rounded-2xl
                      border
                      border-[#a9c890]/20
                      bg-[#a9c890]/[0.08]
                      p-5
                    "
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="
                          flex
                          h-9
                          w-9
                          items-center
                          justify-center
                          rounded-xl
                          bg-[#a9c890]/15
                        "
                      >
                        <ThumbsUp
                          size={17}
                          className="text-[#d7ee82]"
                        />
                      </div>

                      <div>
                        <p className="text-sm font-semibold">
                          Community positives
                        </p>

                        <p className="text-[11px] text-white/35">
                          Recurring positive signals
                        </p>
                      </div>
                    </div>

                    <div className="mt-5 space-y-2">
                      {(insight.pros || []).length >
                      0 ? (
                        insight.pros.map(
                          (item, index) => (
                            <div
                              key={`pro-${index}`}
                              className="
                                rounded-xl
                                border
                                border-white/10
                                bg-white/[0.04]
                                p-3.5
                                text-sm
                                leading-6
                                text-white/70
                              "
                            >
                              <div className="flex gap-3">
                                <span className="mt-1 text-[#d7ee82]">
                                  ✓
                                </span>

                                <span>
                                  {item}
                                </span>
                              </div>
                            </div>
                          )
                        )
                      ) : (
                        <p className="text-sm text-white/40">
                          No strong positive signal was
                          found in the accessible discussions.
                        </p>
                      )}
                    </div>
                  </div>

                  {/* CONS */}

                  <div
                    className="
                      rounded-2xl
                      border
                      border-[#d8a277]/20
                      bg-[#d8a277]/[0.07]
                      p-5
                    "
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="
                          flex
                          h-9
                          w-9
                          items-center
                          justify-center
                          rounded-xl
                          bg-[#d8a277]/15
                        "
                      >
                        <ThumbsDown
                          size={17}
                          className="text-[#f0b98e]"
                        />
                      </div>

                      <div>
                        <p className="text-sm font-semibold">
                          Community concerns
                        </p>

                        <p className="text-[11px] text-white/35">
                          Recurring negative signals
                        </p>
                      </div>
                    </div>

                    <div className="mt-5 space-y-2">
                      {(insight.cons || []).length >
                      0 ? (
                        insight.cons.map(
                          (item, index) => (
                            <div
                              key={`con-${index}`}
                              className="
                                rounded-xl
                                border
                                border-white/10
                                bg-white/[0.04]
                                p-3.5
                                text-sm
                                leading-6
                                text-white/70
                              "
                            >
                              <div className="flex gap-3">
                                <span className="mt-1 text-[#f0b98e]">
                                  !
                                </span>

                                <span>
                                  {item}
                                </span>
                              </div>
                            </div>
                          )
                        )
                      ) : (
                        <p className="text-sm text-white/40">
                          No strong recurring concern was
                          found in the accessible discussions.
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* CONCLUSION */}

                <div
                  className="
                    mt-4
                    rounded-2xl
                    border
                    border-white/10
                    bg-white/[0.045]
                    p-5
                  "
                >
                  <div className="flex items-start gap-3">
                    <div
                      className="
                        mt-0.5
                        flex
                        h-9
                        w-9
                        shrink-0
                        items-center
                        justify-center
                        rounded-xl
                        bg-[#dcebd8]
                      "
                    >
                      <MessageCircle
                        size={17}
                        className="text-[#375b32]"
                      />
                    </div>

                    <div>
                      <p
                        className="
                          text-sm
                          font-semibold
                        "
                      >
                        FinBridge community conclusion
                      </p>

                      <p
                        className="
                          mt-2
                          text-sm
                          leading-7
                          text-white/60
                        "
                      >
                        {insight.conclusion ||
                          'There is not enough accessible community evidence to form a conclusion yet.'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* SOURCE STATS */}

                <div
                  className="
                    mt-4
                    flex
                    flex-wrap
                    items-center
                    gap-2
                    text-[11px]
                    text-white/40
                  "
                >
                  <span className="rounded-full bg-white/[0.05] px-3 py-1.5">
                    Reddit:{' '}
                    {insight.communityStats?.reddit ||
                      0}
                  </span>

                  <span className="rounded-full bg-white/[0.05] px-3 py-1.5">
                    Quora:{' '}
                    {insight.communityStats?.quora ||
                      0}
                  </span>

                  <span className="rounded-full bg-white/[0.05] px-3 py-1.5">
                    Direct experiences:{' '}
                    {insight.communityStats
                      ?.directExperiences || 0}
                  </span>

                  <span className="rounded-full bg-white/[0.05] px-3 py-1.5">
                    Tone:{' '}
                    {insight.tone || 'mixed'}
                  </span>

                  <span className="rounded-full bg-white/[0.05] px-3 py-1.5">
                    Updated{' '}
                    {insight.generatedAt
                      ? new Intl.DateTimeFormat(
                          'en-IN',
                          {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          }
                        ).format(
                          new Date(
                            insight.generatedAt
                          )
                        )
                      : 'recently'}
                  </span>
                </div>

                <p className="mt-4 text-[11px] leading-5 text-white/25">
                  Community analysis is based on accessible
                  online discussions and should not be treated
                  as a guarantee of lender performance or terms.
                  Always verify current loan conditions with the
                  official lender.
                </p>
              </>
            )}

            {!insightLoading &&
              !insight &&
              insightError && (
                <div
                  className="
                    mt-7
                    rounded-2xl
                    border
                    border-white/10
                    bg-white/[0.04]
                    p-5
                  "
                >
                  <p className="text-sm font-semibold">
                    Community analysis is not available yet.
                  </p>

                  <p className="mt-2 text-xs leading-5 text-white/40">
                    Generate the community analysis from the
                    FinBridge backend first. Once a result is
                    stored, it will automatically appear here.
                  </p>
                </div>
              )}
          </section>

          {/* =================================================
              EXISTING LOAN DETAILS
          ================================================== */}

          {sections.map(([title, rows]) => (
            <section
              className="fb-card p-6"
              key={title}
            >
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold">
                  {title}
                </h2>

                <div className="h-2 w-2 rounded-full bg-[#d7ee82]" />
              </div>

              <ul className="mt-4 grid gap-2">
                {(rows || [])
                  .filter(Boolean)
                  .map((row, index) => (
                    <li
                      className="
                        rounded-xl
                        border
                        border-black/[0.05]
                        bg-[#f8f6f1]
                        p-4
                        text-sm
                        leading-6
                        text-black/60
                        transition-all
                        duration-300
                        hover:bg-[#f3f0e8]
                      "
                      key={`${title}-${index}`}
                    >
                      {row}
                    </li>
                  ))}
              </ul>
            </section>
          ))}

          <Link
            className="
              btn-secondary
              mt-2
              w-fit
            "
            to={`/loans/${category}`}
          >
            Back to comparison
          </Link>
        </div>
      </div>
    </PageShell>
  );
}