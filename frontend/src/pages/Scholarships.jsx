import {
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  Filter,
  GraduationCap,
  ArrowRight,
} from 'lucide-react';

import { Link } from 'react-router-dom';

import PageShell from '../components/PageShell.jsx';
import TrustNotice from '../components/TrustNotice.jsx';

import { api, formatDate } from '../lib/api.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function Scholarships() {
  const { user } = useAuth();

  const [items, setItems] = useState([]);
  const [filters, setFilters] = useState({
    sort: 'best',
  });

  const [scores, setScores] = useState({});

  const query = useMemo(
    () =>
      new URLSearchParams(
        Object.entries(filters).filter(
          ([, value]) => value
        )
      ).toString(),
    [filters]
  );

  useEffect(() => {

    api(`/scholarships?${query}`)
      .then(async (data) => {

        setItems(data.scholarships || []);

        const pairs = await Promise.all(
          (data.scholarships || []).map(
            async (scholarship) => {

              const response = await api(
                `/scholarships/${scholarship._id}/check-eligibility`,
                {
                  method: 'POST',
                  body: JSON.stringify(
                    user?.profile || {}
                  ),
                }
              );

              return [
                scholarship._id,
                response.result,
              ];
            }
          )
        );

        setScores(
          Object.fromEntries(pairs)
        );

      })
      .catch(() => {
        setItems([]);
        setScores({});
      });

  }, [query, user]);

  return (
    <PageShell
      title="Scholarship Discovery"
      eyebrow="Education support"
      subtitle="Filter scholarships, inspect eligibility criteria and continue through official sources."
    >

      {/* Filters */}

      <section
        className="
          fb-card
          mb-6
          p-5
        "
      >

        <div className="flex items-center gap-2">

          <div
            className="
              flex
              h-10
              w-10
              items-center
              justify-center
              rounded-xl
              bg-[#dcebd8]
              text-[#375b32]
            "
          >
            <Filter size={18} />
          </div>

          <div>

            <h2 className="font-bold">
              Refine your search
            </h2>

            <p className="text-xs text-black/40">
              Adjust these filters to find more relevant opportunities.
            </p>

          </div>

        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-4">

          {[
            [
              'educationLevel',
              'Education',
              [
                'Undergraduate',
                'Postgraduate',
                'Diploma',
                'School',
              ],
            ],

            [
              'state',
              'State',
              ['All', 'Maharashtra'],
            ],

            [
              'category',
              'Category',
              ['All', 'SC', 'Minority'],
            ],

            [
              'gender',
              'Gender',
              ['Any', 'Female', 'Male'],
            ],

            [
              'sort',
              'Sort',
              [
                ['best', 'Best match'],
                ['deadline', 'Deadline soon'],
                ['updated', 'Recently updated'],
              ],
            ],
          ].map(([key, label, options]) => (

            <label
              className="
                text-[11px]
                font-bold
                uppercase
                tracking-[0.12em]
                text-black/40
              "
              key={key}
            >

              {label}

              <select
                className="field mt-2"
                value={filters[key] || ''}
                onChange={(event) =>
                  setFilters({
                    ...filters,
                    [key]: event.target.value,
                  })
                }
              >

                <option value="">
                  Any
                </option>

                {options.map((option) =>
                  Array.isArray(option) ? (
                    <option
                      value={option[0]}
                      key={option[0]}
                    >
                      {option[1]}
                    </option>
                  ) : (
                    <option
                      value={option}
                      key={option}
                    >
                      {option}
                    </option>
                  )
                )}

              </select>

            </label>

          ))}

          <label
            className="
              text-[11px]
              font-bold
              uppercase
              tracking-[0.12em]
              text-black/40
            "
          >
            Income

            <input
              className="field mt-2"
              type="number"
              placeholder="Annual income"
              onChange={(event) =>
                setFilters({
                  ...filters,
                  income: event.target.value,
                })
              }
            />

          </label>

          <label
            className="
              text-[11px]
              font-bold
              uppercase
              tracking-[0.12em]
              text-black/40
            "
          >
            Provider

            <input
              className="field mt-2"
              placeholder="NSP, AICTE..."
              onChange={(event) =>
                setFilters({
                  ...filters,
                  provider: event.target.value,
                })
              }
            />

          </label>

        </div>

      </section>

      {/* Scholarship cards */}

      <div className="grid gap-5 md:grid-cols-2">

        {items.map((scholarship) => {

          const score =
            scores[scholarship._id]?.score;

          return (
            <article
              key={scholarship._id}
              className="
                group
                relative
                overflow-hidden
                rounded-[1.75rem]
                border
                border-black/[0.08]
                bg-white
                p-6
                shadow-[0_10px_35px_rgba(0,0,0,0.04)]
                transition-all
                duration-300
                hover:-translate-y-1
                hover:border-black/[0.14]
                hover:shadow-[0_20px_50px_rgba(0,0,0,0.08)]
              "
            >

              <div className="
                flex
                items-start
                justify-between
                gap-4
              ">

                <div className="flex min-w-0 gap-3">

                  <div
                    className="
                      flex
                      h-12
                      w-12
                      shrink-0
                      items-center
                      justify-center
                      rounded-xl
                      bg-[#dcebd8]
                      text-[#375b32]
                    "
                  >
                    <GraduationCap size={23} />
                  </div>

                  <div className="min-w-0">

                    <p className="fb-eyebrow">
                      {scholarship.provider}
                    </p>

                    <h2 className="
                      mt-1
                      text-lg
                      font-bold
                      leading-6
                    ">
                      {scholarship.title}
                    </h2>

                    <p className="
                      mt-1
                      text-sm
                      text-black/45
                    ">
                      {scholarship.amount}
                    </p>

                  </div>

                </div>

                <span
                  className="
                    shrink-0
                    rounded-full
                    bg-[#f4f1ea]
                    px-3
                    py-1.5
                    text-xs
                    font-bold
                    text-[#375b32]
                  "
                >
                  {score ?? '--'}%
                </span>

              </div>

              <p
                className="
                  mt-5
                  line-clamp-3
                  text-sm
                  leading-6
                  text-black/50
                "
              >
                {scholarship.description}
              </p>

              <div className="
                mt-5
                grid
                grid-cols-2
                gap-3
              ">

                <div className="
                  rounded-xl
                  bg-[#f7f4ee]
                  p-4
                ">

                  <p className="text-[11px] font-bold uppercase tracking-wide text-black/35">
                    Deadline
                  </p>

                  <p className="mt-2 text-sm font-semibold">
                    {formatDate(
                      scholarship.applicationDeadline
                    )}
                  </p>

                </div>

                <div className="
                  rounded-xl
                  bg-[#f7f4ee]
                  p-4
                ">

                  <p className="text-[11px] font-bold uppercase tracking-wide text-black/35">
                    Status
                  </p>

                  <p className="mt-2 text-sm font-semibold">
                    {scholarship.status}
                  </p>

                </div>

              </div>

              <div className="mt-5">
                <TrustNotice
                  {...scholarship}
                  label={scholarship.dataLabel}
                />
              </div>

              <div className="
                mt-5
                flex
                flex-wrap
                gap-2
              ">

                <Link
                  className="btn-primary"
                  to={`/scholarships/${scholarship._id}`}
                >
                  View Details
                  <ArrowRight size={15} />
                </Link>

                <Link
                  className="btn-secondary"
                  to={`/scholarships/${scholarship._id}`}
                >
                  Check Eligibility
                </Link>

              </div>

            </article>
          );
        })}

      </div>

      {items.length === 0 && (

        <div
          className="
            mt-5
            rounded-[1.5rem]
            border
            border-dashed
            border-black/10
            bg-[#faf8f3]
            p-10
            text-center
          "
        >
          <GraduationCap
            className="mx-auto text-black/25"
            size={28}
          />

          <p className="mt-4 font-semibold">
            No scholarships found
          </p>

          <p className="mt-1 text-sm text-black/40">
            Try adjusting your filters.
          </p>

        </div>

      )}

    </PageShell>
  );
}