import { useEffect, useState } from 'react';
import { Building2, ExternalLink } from 'lucide-react';
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

  useEffect(() => {
    api(`/loans/${category}/${bankId}`)
      .then((data) => setLoan(data.loan))
      .catch(() => setLoan(null));
  }, [category, bankId]);

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

  return (
    <PageShell
      title={loan.productName}
      eyebrow={loan.bankName}
      subtitle={loan.description}
    >

      <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">

        {/* Main summary */}

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

            <span className="
              rounded-full
              bg-[#dcebd8]
              px-3
              py-1.5
              text-xs
              font-bold
              text-[#375b32]
            ">
              {category}
            </span>

          </div>

          <h2 className="mt-7 text-2xl font-bold tracking-[-0.03em]">
            {loan.bankName}
          </h2>

          <p className="mt-1 text-sm text-black/45">
            {loan.productName}
          </p>

          <div className="mt-7 grid gap-3">

            {[
              ['Interest rate', loan.interestRate],

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

                <p className="text-[11px] font-bold uppercase tracking-wide text-black/35">
                  {label}
                </p>

                <p className="mt-2 text-sm font-semibold">
                  {value}
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
            className="
              btn-primary
              mt-5
              w-full
            "
            href={loan.officialUrl}
            target="_blank"
            rel="noreferrer"
          >
            Apply on Official Website
            <ExternalLink size={16} />
          </a>

          <Link
            className="
              btn-secondary
              mt-2
              w-full
            "
            to={`/apply/loan/${loan._id}?category=${category}`}
          >
            Start Demo Application
          </Link>

        </aside>

        {/* Detail cards */}

        <div className="grid gap-4">

          {sections.map(([title, rows]) => (

            <section
              className="
                fb-card
                p-6
              "
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