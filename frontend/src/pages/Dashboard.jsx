import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertCircle,
  ArrowRight,
  Banknote,
  Bell,
  CheckCircle2,
  FileText,
  GraduationCap,
  Search,
  Sparkles,
} from 'lucide-react';
import { motion } from 'framer-motion';

import PageShell from '../components/PageShell.jsx';
import TrustNotice from '../components/TrustNotice.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { api, formatDate } from '../lib/api.js';

export default function Dashboard() {
  const { user } = useAuth();

  const [scholarships, setScholarships] = useState([]);
  const [choice, setChoice] = useState('Scholarship');
  const [finder, setFinder] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api('/scholarships')
      .then((data) => {
        setScholarships(data.scholarships?.slice(0, 4) || []);
      })
      .catch(() => {
        setScholarships([]);
      });
  }, []);

  async function runFinder() {
    try {
      setLoading(true);
      setFinder(null);

      if (choice === 'Scholarship') {
        if (!scholarships.length) {
          setFinder([]);
          return;
        }

        const profile = user?.profile || {};

        const results = await Promise.all(
          scholarships.slice(0, 3).map(async (scholarship) => {
            const response = await api(
              `/scholarships/${scholarship._id}/check-eligibility`,
              {
                method: 'POST',
                body: JSON.stringify(profile),
              }
            );

            return {
              scholarship,
              result: response.result,
            };
          })
        );

        setFinder(results);
        return;
      }

      let category = 'car';

      if (choice === 'Education Loan') {
        category = 'education';
      } else if (choice === 'Home Loan') {
        category = 'home';
      }

      const data = await api(`/loans/${category}`);

      setFinder(
        (data.loans || []).slice(0, 3).map((loan, index) => ({
          loan,
          result: {
            score: 92 - index * 7,
            status: 'informational match',
          },
        }))
      );
    } catch (error) {
      console.error('Support Finder error:', error);
      setFinder([]);
    } finally {
      setLoading(false);
    }
  }

  const firstName = user?.name?.split(' ')[0] || 'there';

  return (
    <PageShell
      eyebrow="01 — Dashboard"
      title={`Welcome back, ${firstName}.`}
      subtitle="Your financial discovery workspace — recommendations, eligibility matches and important opportunities in one place."
    >
      {/* TOP STATS */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          {
            title: 'Scholarship Matches',
            value: scholarships.length
              ? `${scholarships.length}+`
              : '—',
            text: 'Opportunities matched to your profile',
            icon: GraduationCap,
            to: '/scholarships',
          },
          {
            title: 'Loan Options',
            value: '3',
            text: 'Categories available to compare',
            icon: Banknote,
            to: '/loans',
          },
          {
            title: 'Applications',
            value: '1',
            text: 'Demo application records',
            icon: FileText,
            to: '/apply/loan/demo',
          },
          {
            title: 'Deadlines',
            value: '3',
            text: 'Opportunities worth reviewing',
            icon: Bell,
            to: '/scholarships',
          },
        ].map(
          ({
            title,
            value,
            text,
            icon: Icon,
            to,
          }) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45 }}
            >
              <Link
                to={to}
                className="group block h-full rounded-[1.5rem] border border-black/10 bg-white p-6 transition duration-300 hover:-translate-y-1 hover:shadow-[0_20px_50px_rgba(0,0,0,0.08)]"
              >
                <div className="flex items-start justify-between">
                  <div className="rounded-2xl bg-[#f4f1ea] p-3">
                    <Icon
                      size={21}
                      className="text-[#11110f]"
                    />
                  </div>

                  <ArrowRight
                    size={18}
                    className="text-black/25 transition-transform group-hover:translate-x-1 group-hover:text-black"
                  />
                </div>

                <p className="mt-7 text-4xl font-medium tracking-[-0.05em]">
                  {value}
                </p>

                <h2 className="mt-2 text-sm font-semibold">
                  {title}
                </h2>

                <p className="mt-1 text-sm leading-6 text-black/45">
                  {text}
                </p>
              </Link>
            </motion.div>
          )
        )}
      </div>

      {/* MAIN DASHBOARD */}
      <div className="mt-8 grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">

        {/* SCHOLARSHIP MATCHES */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="rounded-[2rem] border border-black/10 bg-[#11110f] p-6 text-white sm:p-8"
        >
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-start">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/35">
                Your opportunities
              </p>

              <h2 className="mt-3 text-3xl font-medium tracking-[-0.04em] sm:text-4xl">
                Top scholarship matches
              </h2>

              <p className="mt-3 max-w-xl text-sm leading-6 text-white/45">
                Opportunities currently available based on your profile and
                visible eligibility criteria.
              </p>
            </div>

            <Link
              to="/scholarships"
              className="inline-flex items-center gap-2 text-sm font-semibold text-[#d7ee82] transition hover:text-white"
            >
              View all
              <ArrowRight size={16} />
            </Link>
          </div>

          <div className="mt-8 space-y-3">
            {scholarships.length === 0 ? (
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 text-sm text-white/45">
                No scholarship opportunities were loaded yet.
              </div>
            ) : (
              scholarships.map((scholarship, index) => (
                <Link
                  key={scholarship._id}
                  to={`/scholarships/${scholarship._id}`}
                  className="group block rounded-2xl border border-white/10 bg-white/[0.035] p-5 transition duration-300 hover:bg-white/[0.07]"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-semibold text-white/25">
                          0{index + 1}
                        </span>

                        <h3 className="truncate text-base font-semibold">
                          {scholarship.title}
                        </h3>
                      </div>

                      <p className="mt-2 line-clamp-2 text-sm leading-6 text-white/45">
                        {scholarship.benefits}
                      </p>
                    </div>

                    <div className="shrink-0">
                      <span className="rounded-full bg-white/[0.06] px-3 py-1.5 text-xs font-semibold text-white/60">
                        Deadline {formatDate(scholarship.applicationDeadline)}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 border-t border-white/10 pt-4">
                    <TrustNotice
                      {...scholarship}
                      label={scholarship.dataLabel}
                    />
                  </div>
                </Link>
              ))
            )}
          </div>
        </motion.section>

        {/* SUPPORT FINDER */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="rounded-[2rem] border border-black/10 bg-white p-6 sm:p-8"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-black/35">
                Intelligent matching
              </p>

              <h2 className="mt-3 flex items-center gap-2 text-2xl font-semibold tracking-[-0.03em]">
                <Sparkles
                  size={20}
                  className="text-[#596d3f]"
                />
                Support Finder
              </h2>
            </div>

            <div className="rounded-2xl bg-[#dcebd8] p-3">
              <Search
                size={20}
                className="text-[#375b32]"
              />
            </div>
          </div>

          <p className="mt-4 text-sm leading-6 text-black/50">
            Select what you are looking for and let FinBridge identify
            relevant opportunities.
          </p>

          <div className="mt-6">
            <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-black/40">
              Financial support type
            </label>

            <select
              className="field"
              value={choice}
              onChange={(event) => {
                setChoice(event.target.value);
                setFinder(null);
              }}
            >
              <option>Scholarship</option>
              <option>Education Loan</option>
              <option>Home Loan</option>
              <option>Car Loan</option>
            </select>
          </div>

          <button
            className="btn-primary mt-4 w-full"
            onClick={runFinder}
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                Analyzing...
              </>
            ) : (
              <>
                Find matches
                <ArrowRight size={16} />
              </>
            )}
          </button>

          <div className="mt-6">
            {finder === null && !loading && (
              <div className="rounded-2xl bg-[#f5f2ec] p-5">
                <div className="flex items-start gap-3">
                  <div className="rounded-xl bg-white p-2">
                    <Search
                      size={17}
                      className="text-black/50"
                    />
                  </div>

                  <div>
                    <p className="text-sm font-semibold">
                      Ready to find your matches?
                    </p>

                    <p className="mt-1 text-xs leading-5 text-black/45">
                      Your results are informational and based on visible
                      profile criteria.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {loading && (
              <div className="space-y-3">
                {[1, 2, 3].map((item) => (
                  <div
                    key={item}
                    className="animate-pulse rounded-2xl bg-[#f5f2ec] p-5"
                  >
                    <div className="h-4 w-3/4 rounded bg-black/10" />
                    <div className="mt-3 h-3 w-1/2 rounded bg-black/5" />
                    <div className="mt-5 h-10 rounded-xl bg-black/5" />
                  </div>
                ))}
              </div>
            )}

            {finder?.length === 0 && !loading && (
              <div className="rounded-2xl border border-red-200 bg-red-50 p-5">
                <p className="text-sm font-semibold text-red-800">
                  We couldn't load matches right now.
                </p>

                <p className="mt-1 text-xs leading-5 text-red-700/70">
                  Please try again in a moment.
                </p>
              </div>
            )}

            {finder?.length > 0 && !loading && (
              <div className="space-y-3">
                {finder.map((item, index) => {
                  const title =
                    item.scholarship?.title ||
                    item.loan?.productName ||
                    'Financial opportunity';

                  return (
                    <motion.div
                      key={
                        item.scholarship?._id ||
                        item.loan?._id ||
                        index
                      }
                      initial={{
                        opacity: 0,
                        y: 10,
                      }}
                      animate={{
                        opacity: 1,
                        y: 0,
                      }}
                      transition={{
                        delay: index * 0.08,
                      }}
                      className="rounded-2xl border border-black/10 bg-[#f9f7f2] p-5"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-sm font-semibold">
                            {title}
                          </p>

                          <p className="mt-1 text-xs text-black/45">
                            {item.result?.status || 'Match found'}
                          </p>
                        </div>

                        <div className="rounded-full bg-[#dcebd8] px-3 py-1.5">
                          <span className="text-xs font-bold text-[#375b32]">
                            {item.result?.score ?? 0}% match
                          </span>
                        </div>
                      </div>

                      {index === 0 && (
                        <div className="mt-4 flex items-start gap-2 border-t border-black/10 pt-4 text-xs leading-5 text-black/45">
                          <AlertCircle
                            size={14}
                            className="mt-0.5 shrink-0"
                          />

                          <span>
                            Verify eligibility and application details on
                            the official source before applying.
                          </span>
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </motion.section>
      </div>

      {/* PROFILE SNAPSHOT */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mt-8 rounded-[2rem] border border-black/10 bg-[#e8e2d7] p-6 sm:p-8"
      >
        <div className="grid gap-8 lg:grid-cols-[0.7fr_1.3fr] lg:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-black/35">
              Your financial profile
            </p>

            <h2 className="mt-4 text-3xl font-medium tracking-[-0.04em] sm:text-4xl">
              Better profile,
              <br />
              better matches.
            </h2>

            <p className="mt-4 max-w-md text-sm leading-6 text-black/50">
              Keep your profile accurate so FinBridge can surface more
              relevant financial opportunities.
            </p>

            <Link
              to="/profile"
              className="btn-secondary mt-6"
            >
              Update profile
              <ArrowRight size={16} />
            </Link>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            {[
              [
                'Education',
                user?.profile?.education || 'Not added',
              ],
              [
                'State',
                user?.profile?.state || 'Not added',
              ],
              [
                'Annual income',
                user?.profile?.annualIncome
                  ? `₹${Number(
                      user.profile.annualIncome
                    ).toLocaleString('en-IN')}`
                  : 'Not added',
              ],
            ].map(([label, value]) => (
              <div
                key={label}
                className="rounded-2xl border border-black/10 bg-white p-5"
              >
                <p className="text-xs text-black/40">
                  {label}
                </p>

                <p className="mt-3 text-sm font-semibold">
                  {value}
                </p>
              </div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* TRUST FOOTER */}
      <div className="mt-8 flex items-center gap-3 rounded-2xl border border-black/10 bg-white px-5 py-4">
        <div className="rounded-xl bg-[#dcebd8] p-2">
          <CheckCircle2
            size={17}
            className="text-[#375b32]"
          />
        </div>

        <p className="text-xs leading-5 text-black/50">
          FinBridge provides informational financial discovery and does not
          itself approve, sanction, or disburse loans or scholarships.
        </p>
      </div>
    </PageShell>
  );
}