import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import NearbyBankOffers from '../components/NearbyBankOffers.jsx';
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
import MetricCard from '../components/cards/MetricCard.jsx';

import { useAuth } from '../context/AuthContext.jsx';
import { api, formatDate } from '../lib/api.js';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [scholarships, setScholarships] = useState([]);
  const [choice, setChoice] = useState('Scholarship');
  const [finder, setFinder] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api('/scholarships')
      .then((data) => {
        setScholarships(
          data.scholarships?.slice(0, 4) || []
        );
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
        (data.loans || [])
          .slice(0, 3)
          .map((loan, index) => ({
            loan,
            result: {
              score: 92 - index * 7,
              status: 'Informational match',
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

  const firstName =
    user?.name?.split(' ')[0] || 'there';

  return (
    <PageShell
      eyebrow="01 — Dashboard"
      title={`Welcome back, ${firstName}.`}
      subtitle="Your financial discovery workspace — recommendations, eligibility matches and important opportunities in one place."
    >

      {/* =====================================================
          TOP STATS
      ===================================================== */}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0 }}
        >
          <MetricCard
  title="Scholarship Matches"
  value={
    scholarships.length
      ? `${scholarships.length}+`
      : '—'
  }
  description="Opportunities matched to your profile"
  icon={GraduationCap}
  to="/scholarships"
/>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.06 }}
        >
          <MetricCard
            title="Loan Options"
            value="3"
            description="Categories available to compare"
            icon={Banknote}
            to="/loans"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.12 }}
        >
          <MetricCard
            title="Applications"
            value="1"
            description="Demo application records"
            icon={FileText}
            to="/apply/loan/demo"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.18 }}
        >
          <MetricCard
            title="Deadlines"
            value="3"
            description="Opportunities worth reviewing"
            icon={Bell}
            to="/scholarships"
          />
        </motion.div>

      </div>

      {/* =====================================================
          MAIN DASHBOARD
      ===================================================== */}

      <div className="mt-8 grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">

        {/* ===================================================
            SCHOLARSHIP MATCHES
        =================================================== */}

        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.5,
            delay: 0.1,
          }}
          className="
            relative
            overflow-hidden
            rounded-[2rem]
            border
            border-black/10
            bg-[#11110f]
            p-6
            text-white
            shadow-[0_20px_60px_rgba(0,0,0,0.14)]
            sm:p-8
          "
        >

          {/* Ambient glow */}

          <div
            className="
              pointer-events-none
              absolute
              -right-24
              -top-24
              h-72
              w-72
              rounded-full
              bg-[#d7ee82]/10
              blur-[90px]
            "
          />

          <div className="relative z-10">

            {/* Header */}

            <div
              className="
                flex
                flex-col
                justify-between
                gap-5
                sm:flex-row
                sm:items-start
              "
            >

              <div>

                <p
                  className="
                    text-[11px]
                    font-bold
                    uppercase
                    tracking-[0.2em]
                    text-white/35
                  "
                >
                  Your opportunities
                </p>

                <h2
                  className="
                    mt-3
                    text-3xl
                    font-medium
                    tracking-[-0.04em]
                    sm:text-4xl
                  "
                >
                  Top scholarship matches
                </h2>

                <p
                  className="
                    mt-3
                    max-w-xl
                    text-sm
                    leading-6
                    text-white/45
                  "
                >
                  Opportunities currently available based
                  on your profile and visible eligibility
                  criteria.
                </p>

              </div>

              <Link
                to="/scholarships"
                className="
                  inline-flex
                  items-center
                  gap-2
                  text-sm
                  font-semibold
                  text-[#d7ee82]
                  transition-all
                  duration-300
                  hover:translate-x-0.5
                  hover:text-white
                "
              >
                View all
                <ArrowRight size={16} />
              </Link>

            </div>

            {/* Scholarship list */}

            <div className="mt-8 space-y-3">

              {scholarships.length === 0 ? (

                <div
                  className="
                    rounded-2xl
                    border
                    border-white/10
                    bg-white/[0.04]
                    p-6
                    text-sm
                    text-white/45
                  "
                >
                  No scholarship opportunities were loaded
                  yet.
                </div>

              ) : (

                scholarships.map((scholarship, index) => (

                  <Link
                    key={scholarship._id}
                    to={`/scholarships/${scholarship._id}`}
                    className="
                      group
                      block
                      rounded-2xl
                      border
                      border-white/[0.08]
                      bg-white/[0.035]
                      p-5
                      transition-all
                      duration-300
                      ease-out
                      hover:-translate-y-0.5
                      hover:border-white/[0.16]
                      hover:bg-white/[0.06]
                      hover:shadow-lg
                      hover:shadow-black/20
                    "
                  >

                    <div
                      className="
                        flex
                        flex-col
                        gap-4
                        sm:flex-row
                        sm:items-start
                        sm:justify-between
                      "
                    >

                      <div className="min-w-0">

                        <div className="flex items-center gap-3">

                          <span
                            className="
                              text-xs
                              font-semibold
                              text-white/25
                            "
                          >
                            {String(index + 1).padStart(2, '0')}
                          </span>

                          <h3
                            className="
                              truncate
                              text-base
                              font-semibold
                            "
                          >
                            {scholarship.title}
                          </h3>

                        </div>

                        <p
                          className="
                            mt-2
                            line-clamp-2
                            text-sm
                            leading-6
                            text-white/45
                          "
                        >
                          {scholarship.benefits}
                        </p>

                      </div>

                      <div className="shrink-0">

                        <span
                          className="
                            inline-flex
                            rounded-full
                            border
                            border-white/[0.08]
                            bg-white/[0.05]
                            px-3
                            py-1.5
                            text-xs
                            font-semibold
                            text-white/65
                          "
                        >
                          Deadline{' '}
                          {formatDate(
                            scholarship.applicationDeadline
                          )}
                        </span>

                      </div>

                    </div>

                    <div
                      className="
                        mt-4
                        border-t
                        border-white/10
                        pt-4
                      "
                    >
                      <TrustNotice
                        {...scholarship}
                        label={scholarship.dataLabel}
                      />
                    </div>

                  </Link>

                ))

              )}

            </div>

          </div>

        </motion.section>

        {/* ===================================================
            SUPPORT FINDER
        =================================================== */}

        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.5,
            delay: 0.2,
          }}
          className="
            relative
            overflow-hidden
            rounded-[2rem]
            border
            border-black/[0.08]
            bg-white
            p-6
            shadow-[0_10px_35px_rgba(0,0,0,0.04)]
            sm:p-8
          "
        >

          <div className="flex items-start justify-between gap-4">

            <div>

              <p
                className="
                  text-[11px]
                  font-bold
                  uppercase
                  tracking-[0.2em]
                  text-black/35
                "
              >
                Intelligent matching
              </p>

              <h2
                className="
                  mt-3
                  flex
                  items-center
                  gap-2
                  text-2xl
                  font-semibold
                  tracking-[-0.03em]
                "
              >
                <Sparkles
                  size={20}
                  className="text-[#596d3f]"
                />

                Support Finder
              </h2>

            </div>

            <div
              className="
                flex
                h-11
                w-11
                shrink-0
                items-center
                justify-center
                rounded-xl
                border
                border-black/5
                bg-[#dcebd8]
                transition-transform
                duration-300
                hover:scale-105
              "
            >
              <Search
                size={20}
                className="text-[#375b32]"
              />
            </div>

          </div>

          <p
            className="
              mt-4
              text-sm
              leading-6
              text-black/50
            "
          >
            Select what you are looking for and let
            FinBridge identify relevant opportunities.
          </p>

          <div className="mt-6">

            <label
              className="
                mb-2
                block
                text-[11px]
                font-bold
                uppercase
                tracking-[0.12em]
                text-black/40
              "
            >
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
            className="
              btn-primary
              mt-4
              w-full
              transition-all
              duration-300
              hover:-translate-y-0.5
              disabled:cursor-not-allowed
              disabled:opacity-60
            "
            onClick={runFinder}
            disabled={loading}
          >
            {loading ? (
              <>
                <span
                  className="
                    h-4
                    w-4
                    animate-spin
                    rounded-full
                    border-2
                    border-white/30
                    border-t-white
                  "
                />

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

            {/* Initial state */}

            {finder === null && !loading && (

              <div
                className="
                  rounded-2xl
                  border
                  border-black/[0.05]
                  bg-[#f5f2ec]
                  p-5
                "
              >

                <div className="flex items-start gap-3">

                  <div
                    className="
                      rounded-xl
                      bg-white
                      p-2
                    "
                  >
                    <Search
                      size={17}
                      className="text-black/50"
                    />
                  </div>

                  <div>

                    <p className="text-sm font-semibold">
                      Ready to find your matches?
                    </p>

                    <p
                      className="
                        mt-1
                        text-xs
                        leading-5
                        text-black/45
                      "
                    >
                      Your results are informational and
                      based on visible profile criteria.
                    </p>

                  </div>

                </div>

              </div>

            )}

            {/* Loading */}

            {loading && (

              <div className="space-y-3">

                {[1, 2, 3].map((item) => (

                  <div
                    key={item}
                    className="
                      animate-pulse
                      rounded-2xl
                      bg-[#f5f2ec]
                      p-5
                    "
                  >

                    <div
                      className="
                        h-4
                        w-3/4
                        rounded
                        bg-black/10
                      "
                    />

                    <div
                      className="
                        mt-3
                        h-3
                        w-1/2
                        rounded
                        bg-black/5
                      "
                    />

                    <div
                      className="
                        mt-5
                        h-10
                        rounded-xl
                        bg-black/5
                      "
                    />

                  </div>

                ))}

              </div>

            )}

            {/* Error */}

            {finder?.length === 0 && !loading && (

              <div
                className="
                  rounded-2xl
                  border
                  border-red-200
                  bg-red-50
                  p-5
                "
              >

                <div className="flex items-start gap-3">

                  <AlertCircle
                    size={18}
                    className="mt-0.5 shrink-0 text-red-600"
                  />

                  <div>

                    <p
                      className="
                        text-sm
                        font-semibold
                        text-red-800
                      "
                    >
                      We couldn't load matches right now.
                    </p>

                    <p
                      className="
                        mt-1
                        text-xs
                        leading-5
                        text-red-700/70
                      "
                    >
                      Please try again in a moment.
                    </p>

                  </div>

                </div>

              </div>

            )}

            {/* Results */}

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
                      className="
                        group
                        rounded-2xl
                        border
                        border-black/[0.07]
                        bg-[#f9f7f2]
                        p-5
                        transition-all
                        duration-300
                        hover:-translate-y-0.5
                        hover:shadow-md
                      "
                    >

                      <div
                        className="
                          flex
                          items-start
                          justify-between
                          gap-4
                        "
                      >

                        <div className="min-w-0">

                          <p className="truncate text-sm font-semibold">
                            {title}
                          </p>

                          <p className="mt-1 text-xs text-black/45">
                            {item.result?.status ||
                              'Match found'}
                          </p>

                        </div>

                        <div
                          className="
                            shrink-0
                            rounded-full
                            bg-[#dcebd8]
                            px-3
                            py-1.5
                          "
                        >
                          <span
                            className="
                              text-xs
                              font-bold
                              text-[#375b32]
                            "
                          >
                            {item.result?.score ?? 0}% match
                          </span>
                        </div>

                      </div>

                      {index === 0 && (

                        <div
                          className="
                            mt-4
                            flex
                            items-start
                            gap-2
                            border-t
                            border-black/10
                            pt-4
                            text-xs
                            leading-5
                            text-black/45
                          "
                        >
                          <AlertCircle
                            size={14}
                            className="mt-0.5 shrink-0"
                          />

                          <span>
                            Verify eligibility and
                            application details on the
                            official source before applying.
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
<NearbyBankOffers />
      {/* =====================================================
          PROFILE SNAPSHOT
      ===================================================== */}

      <motion.section
        initial={{
          opacity: 0,
          y: 20,
        }}
        whileInView={{
          opacity: 1,
          y: 0,
        }}
        viewport={{
          once: true,
        }}
        className="
          mt-8
          rounded-[2rem]
          border
          border-black/[0.08]
          bg-[#e8e2d7]
          p-6
          shadow-[0_10px_35px_rgba(0,0,0,0.03)]
          sm:p-8
        "
      >

        <div
          className="
            grid
            gap-8
            lg:grid-cols-[0.7fr_1.3fr]
            lg:items-center
          "
        >

          <div>

            <p
              className="
                text-[11px]
                font-bold
                uppercase
                tracking-[0.2em]
                text-black/35
              "
            >
              Your financial profile
            </p>

            <h2
              className="
                mt-4
                text-3xl
                font-medium
                tracking-[-0.04em]
                sm:text-4xl
              "
            >
              Better profile,
              <br />
              better matches.
            </h2>

            <p
              className="
                mt-4
                max-w-md
                text-sm
                leading-6
                text-black/50
              "
            >
              Keep your profile accurate so FinBridge can
              surface more relevant financial opportunities.
            </p>

            <Link
              to="/profile"
              className="
                btn-secondary
                mt-6
                transition-all
                duration-300
                hover:-translate-y-0.5
              "
            >
              Update profile
              <ArrowRight size={16} />
            </Link>

          </div>

          <div className="grid gap-3 sm:grid-cols-3">

            {[
              [
                'Education',
                user?.profile?.education ||
                  'Not added',
              ],

              [
                'State',
                user?.profile?.state ||
                  'Not added',
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
                className="
                  rounded-2xl
                  border
                  border-black/[0.07]
                  bg-white
                  p-5
                  transition-all
                  duration-300
                  hover:-translate-y-0.5
                  hover:shadow-md
                "
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

      {/* =====================================================
          PREMIUM CTA
      ===================================================== */}

      <motion.section
        initial={{
          opacity: 0,
          y: 20,
        }}
        whileInView={{
          opacity: 1,
          y: 0,
        }}
        viewport={{
          once: true,
        }}
        className="
          group
          relative
          mt-8
          overflow-hidden
          rounded-[2rem]
          border
          border-[#11110f]
          bg-[#11110f]
          p-7
          text-white
          shadow-[0_25px_70px_rgba(0,0,0,0.15)]
          transition-all
          duration-500
          hover:-translate-y-1
          sm:p-9
        "
      >

        <div
          className="
            pointer-events-none
            absolute
            -right-20
            -top-20
            h-72
            w-72
            rounded-full
            bg-[#d7ee82]/15
            blur-[80px]
            transition
            duration-700
            group-hover:bg-[#d7ee82]/25
          "
        />

        <div
          className="
            pointer-events-none
            absolute
            -bottom-32
            left-1/3
            h-56
            w-56
            rounded-full
            bg-[#dcebd8]/10
            blur-[80px]
          "
        />

        <div className="relative z-10 max-w-2xl">

          <div className="flex items-center gap-2 text-[#d7ee82]">

            <Sparkles size={15} />

            <span
              className="
                text-[11px]
                font-bold
                uppercase
                tracking-[0.2em]
              "
            >
              Smart financial discovery
            </span>

          </div>

          <h2
            className="
              mt-5
              max-w-xl
              text-3xl
              font-semibold
              tracking-[-0.05em]
              sm:text-4xl
            "
          >
            Find the financial support that actually
            fits your profile.
          </h2>

          <p
            className="
              mt-4
              max-w-xl
              text-sm
              leading-7
              text-white/45
            "
          >
            Compare scholarships and loan options using
            the information already available in your
            FINBRIDGE profile.
          </p>

          <button
            onClick={() => navigate('/scholarships')}
            className="
              mt-8
              inline-flex
              items-center
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
          >
            Explore opportunities

            <ArrowRight
              size={16}
              className="
                transition-transform
                duration-300
                group-hover:translate-x-1
              "
            />
          </button>

        </div>

      </motion.section>

      {/* =====================================================
          TRUST FOOTER
      ===================================================== */}

      <div
        className="
          mt-8
          flex
          items-start
          gap-3
          rounded-2xl
          border
          border-black/[0.08]
          bg-white
          px-5
          py-4
          shadow-[0_8px_25px_rgba(0,0,0,0.03)]
        "
      >

        <div className="shrink-0 rounded-xl bg-[#dcebd8] p-2">

          <CheckCircle2
            size={17}
            className="text-[#375b32]"
          />

        </div>

        <p
          className="
            text-xs
            leading-5
            text-black/50
          "
        >
          FinBridge provides informational financial
          discovery and does not itself approve, sanction,
          or disburse loans or scholarships.
        </p>

      </div>

    </PageShell>
  );
}