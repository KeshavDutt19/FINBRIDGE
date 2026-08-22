import { useEffect, useState } from 'react';

import {
  CheckCircle2,
  ExternalLink,
  XCircle,
} from 'lucide-react';

import {
  Link,
  useParams,
} from 'react-router-dom';

import PageShell from '../components/PageShell.jsx';
import TrustNotice from '../components/TrustNotice.jsx';

import {
  api,
  formatDate,
} from '../lib/api.js';

import { useAuth } from '../context/AuthContext.jsx';

export default function ScholarshipDetail() {
  const { id } = useParams();
  const { user } = useAuth();

  const [scholarship, setScholarship] =
    useState(null);

  const [result, setResult] =
    useState(null);

  useEffect(() => {

    api(`/scholarships/${id}`)
      .then((data) =>
        setScholarship(data.scholarship)
      );

    api(
      `/scholarships/${id}/check-eligibility`,
      {
        method: 'POST',
        body: JSON.stringify(
          user?.profile || {}
        ),
      }
    )
      .then((data) =>
        setResult(data.result)
      );

  }, [id, user]);

  if (!scholarship) {
    return (
      <PageShell title="Loading scholarship..." />
    );
  }

  const sections = [
    [
      'Benefits',
      [
        scholarship.benefits,
        scholarship.amount,
        scholarship.duration,
      ],
    ],

    [
      'Eligibility',
      scholarship.eligibilityRules,
    ],

    [
      'Required documents',
      scholarship.requiredDocuments,
    ],

    [
      'Application process',
      scholarship.applicationProcedure,
    ],

    [
      'Important dates',
      [
        `Start: ${formatDate(
          scholarship.applicationStartDate
        )}`,

        `Deadline: ${formatDate(
          scholarship.applicationDeadline
        )}`,
      ],
    ],

    [
      'Terms & conditions',
      [scholarship.termsAndConditions],
    ],
  ];

  return (
    <PageShell
      title={scholarship.title}
      eyebrow={scholarship.provider}
      subtitle={scholarship.description}
    >

      <div className="
        grid
        gap-6
        lg:grid-cols-[0.9fr_1.1fr]
      ">

        {/* Match panel */}

        <section
          className="
            fb-card-dark
            h-fit
            p-6
            lg:sticky
            lg:top-28
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
              FinBridge Match
            </p>

            <p className="
              mt-4
              text-6xl
              font-semibold
              tracking-[-0.06em]
              text-[#d7ee82]
            ">
              {result?.score ?? '--'}%
            </p>

            <p className="
              mt-2
              text-sm
              text-white/45
            ">
              Informational match score
            </p>

            <div className="
              mt-5
              inline-flex
              rounded-full
              bg-white/[0.07]
              px-3
              py-1.5
              text-xs
              font-semibold
              capitalize
            ">
              {result?.status || 'Calculating'}
            </div>

            <div className="mt-6 space-y-2">

              {result?.explanation?.map(
                (line) => (

                  <div
                    className="
                      flex
                      gap-3
                      rounded-xl
                      border
                      border-white/10
                      bg-white/[0.04]
                      p-4
                      text-sm
                      text-white/65
                    "
                    key={line.text}
                  >

                    {line.ok ? (
                      <CheckCircle2
                        className="shrink-0 text-[#d7ee82]"
                        size={18}
                      />
                    ) : (
                      <XCircle
                        className="shrink-0 text-red-400"
                        size={18}
                      />
                    )}

                    <span>
                      {line.text}
                    </span>

                  </div>
                )
              )}

            </div>

            <div className="mt-5">
              <TrustNotice
                {...scholarship}
                label={scholarship.dataLabel}
              />
            </div>

            <a
              className="
                mt-5
                inline-flex
                w-full
                items-center
                justify-center
                gap-2
                rounded-full
                bg-[#d7ee82]
                px-5
                py-3
                text-sm
                font-bold
                text-[#11110f]
                transition-all
                duration-300
                hover:-translate-y-0.5
                hover:bg-white
              "
              href={scholarship.officialUrl}
              target="_blank"
              rel="noreferrer"
            >
              Apply on Official Portal
              <ExternalLink size={16} />
            </a>

          </div>

        </section>

        {/* Detail cards */}

        <div className="grid gap-4">

          {sections.map(([title, rows]) => (

            <section
              className="fb-card p-6"
              key={title}
            >

              <div className="
                flex
                items-center
                justify-between
              ">

                <h2 className="text-lg font-bold">
                  {title}
                </h2>

                <div className="
                  h-2
                  w-2
                  rounded-full
                  bg-[#d7ee82]
                " />

              </div>

              <ul className="mt-4 grid gap-2">

                {(rows || [])
                  .filter(Boolean)
                  .map((row, index) => (

                    <li
                      key={`${title}-${index}`}
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
                        hover:bg-[#f2efe7]
                      "
                    >
                      {row}
                    </li>

                  ))}

              </ul>

            </section>

          ))}

          <Link
            className="btn-secondary mt-2 w-fit"
            to="/scholarships"
          >
            Back to scholarships
          </Link>

        </div>

      </div>

    </PageShell>
  );
}