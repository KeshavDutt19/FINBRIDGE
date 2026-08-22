import { useEffect, useState } from 'react';
import { Check, ChevronRight } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';

import PageShell from '../components/PageShell.jsx';
import TrustNotice from '../components/TrustNotice.jsx';

import { api, formatCurrency } from '../lib/api.js';

export default function LoanCategory() {
  const { category } = useParams();

  const [loans, setLoans] = useState([]);
  const [selected, setSelected] = useState([]);

  useEffect(() => {
    api(`/loans/${category}`)
      .then((data) => setLoans(data.loans || []))
      .catch(() => setLoans([]));
  }, [category]);

  function toggle(id) {
    setSelected((current) =>
      current.includes(id)
        ? current.filter((x) => x !== id)
        : current.length < 3
          ? [...current, id]
          : current
    );
  }

  const compare = loans.filter((loan) =>
    selected.includes(loan._id)
  );

  return (
    <PageShell
      title={`${category[0].toUpperCase() + category.slice(1)} Loans`}
      eyebrow="Bank comparison"
      subtitle="Select up to three loan products and compare their terms side by side."
    >

      {/* Product cards */}

      <div className="grid gap-5 lg:grid-cols-2 xl:grid-cols-3">

        {loans.map((loan) => {

          const isSelected =
            selected.includes(loan._id);

          return (
            <article
              key={loan._id}
              className={[
                `
                  group
                  relative
                  rounded-[1.5rem]
                  border
                  bg-white
                  p-6
                  shadow-[0_10px_35px_rgba(0,0,0,0.04)]
                  transition-all
                  duration-300
                  hover:-translate-y-1
                `,
                isSelected
                  ? 'border-[#375b32] ring-4 ring-[#dcebd8]'
                  : 'border-black/[0.08] hover:border-black/[0.14]',
              ].join(' ')}
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

                <label
                  className="
                    flex
                    h-10
                    w-10
                    cursor-pointer
                    items-center
                    justify-center
                    rounded-xl
                    border
                    border-black/10
                    bg-[#f4f1ea]
                  "
                >
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={isSelected}
                    onChange={() => toggle(loan._id)}
                  />

                  {isSelected ? (
                    <Check
                      size={18}
                      className="text-[#375b32]"
                    />
                  ) : (
                    <span className="h-4 w-4 rounded-md border border-black/20" />
                  )}
                </label>

              </div>

              <div className="mt-6 grid grid-cols-2 gap-3">

                <div className="rounded-xl bg-[#f7f4ee] p-4">

                  <p className="text-[11px] font-bold uppercase tracking-wide text-black/35">
                    Interest
                  </p>

                  <p className="mt-2 text-lg font-bold">
                    {loan.interestRate}
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
                    {loan.tenureMin}–{loan.tenureMax} months
                  </p>

                </div>

                <div className="rounded-xl border border-black/[0.06] p-4">

                  <p className="text-[11px] font-bold uppercase tracking-wide text-black/35">
                    Processing
                  </p>

                  <p className="mt-2 text-sm font-semibold">
                    {loan.processingFee}
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
          );
        })}

      </div>

      {/* Comparison */}

      {compare.length > 0 && (

        <section
          className="
            fb-card-dark
            mt-8
            p-6
            sm:p-8
          "
        >

          <div
            className="
              pointer-events-none
              absolute
              -right-20
              -top-20
              h-60
              w-60
              rounded-full
              bg-[#d7ee82]/10
              blur-[80px]
            "
          />

          <div className="relative z-10">

            <p className="fb-eyebrow-dark">
              Side-by-side
            </p>

            <h2 className="mt-2 text-3xl font-semibold tracking-[-0.04em]">
              Comparison
            </h2>

            <p className="mt-2 text-sm text-white/45">
              You can compare up to three products.
            </p>

            <div className="mt-7 grid gap-4 md:grid-cols-3">

              {compare.map((loan) => (

                <div
                  key={loan._id}
                  className="
                    rounded-2xl
                    border
                    border-white/10
                    bg-white/[0.04]
                    p-5
                    transition-all
                    duration-300
                    hover:bg-white/[0.06]
                  "
                >

                  <h3 className="text-lg font-bold">
                    {loan.bankName}
                  </h3>

                  <p className="mt-1 text-sm text-white/45">
                    {loan.productName}
                  </p>

                  <dl className="mt-5 space-y-3">

                    <div>
                      <dt className="text-xs text-white/35">
                        Rate
                      </dt>

                      <dd className="mt-1 font-semibold">
                        {loan.interestRate}
                      </dd>
                    </div>

                    <div>
                      <dt className="text-xs text-white/35">
                        Maximum loan
                      </dt>

                      <dd className="mt-1 font-semibold">
                        {formatCurrency(loan.loanAmountMax)}
                      </dd>
                    </div>

                    <div>
                      <dt className="text-xs text-white/35">
                        Tenure
                      </dt>

                      <dd className="mt-1 font-semibold">
                        {loan.tenureMin}–{loan.tenureMax} months
                      </dd>
                    </div>

                    <div>
                      <dt className="text-xs text-white/35">
                        Documents
                      </dt>

                      <dd className="mt-1 text-sm text-white/60">
                        {(loan.documents || [])
                          .slice(0, 4)
                          .join(', ')}
                      </dd>
                    </div>

                  </dl>

                  <div className="mt-5">
                    <TrustNotice
                      {...loan}
                      label={loan.dataLabel}
                    />
                  </div>

                </div>
              ))}

            </div>

          </div>

        </section>
      )}

    </PageShell>
  );
}