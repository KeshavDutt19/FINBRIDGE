import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowDown,
  ArrowRight,
  Banknote,
  Check,
  GraduationCap,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

const fadeUp = {
  hidden: {
    opacity: 0,
    y: 30,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.7,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

export default function Landing() {
  return (
    <main className="overflow-hidden bg-[#f4f1ea] text-[#11110f]">

      {/* =====================================================
          HERO
      ====================================================== */}
      <section className="relative min-h-[92vh] overflow-hidden border-b border-black/10">

        {/* subtle background shape */}
        <div className="pointer-events-none absolute -right-40 -top-40 h-[520px] w-[520px] rounded-full bg-[#d9e8d8]" />

        <div className="pointer-events-none absolute bottom-[-180px] left-[-150px] h-[420px] w-[420px] rounded-full bg-[#ead7c4]" />

        <div className="relative mx-auto max-w-[1500px] px-5 pb-12 pt-8 sm:px-8 lg:px-12">

          {/* Top navigation */}
          <header className="flex items-center justify-between border-b border-black/10 pb-6">

            <Link
              to="/"
              className="text-xl font-black tracking-[-0.05em]"
            >
              FINBRIDGE
            </Link>

            <nav className="hidden items-center gap-8 text-sm font-medium text-black/60 md:flex">
              <Link
                to="/scholarships"
                className="transition hover:text-black"
              >
                Scholarships
              </Link>

              <Link
                to="/loans"
                className="transition hover:text-black"
              >
                Loans
              </Link>

              <a
                href="#how-it-works"
                className="transition hover:text-black"
              >
                How it works
              </a>
            </nav>

            <div className="flex items-center gap-3">
              <Link
                to="/login"
                className="hidden text-sm font-medium text-black/60 transition hover:text-black sm:block"
              >
                Log in
              </Link>

              <Link
                to="/register"
                className="rounded-full bg-[#11110f] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-black/80"
              >
                Get started
              </Link>
            </div>
          </header>

          {/* Hero content */}
          <div className="grid min-h-[calc(92vh-100px)] items-center gap-14 py-16 lg:grid-cols-[1.05fr_0.95fr] lg:py-20">

            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              className="relative z-10"
            >
              {/* small eyebrow */}
              <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-black/60 backdrop-blur-sm">
                <ShieldCheck size={14} />
                Transparent financial discovery
              </div>

              <h1 className="max-w-5xl text-[3.6rem] font-medium leading-[0.92] tracking-[-0.055em] sm:text-[4.8rem] md:text-[6rem] lg:text-[7rem]">
                Financial support
                <br />
                <span className="font-serif italic">
                  without the search.
                </span>
              </h1>

              <p className="mt-8 max-w-2xl text-base leading-7 text-black/60 sm:text-lg">
                FinBridge helps students and borrowers discover scholarships,
                compare loans, and find financial opportunities that actually
                fit their profile.
              </p>

              <div className="mt-9 flex flex-wrap items-center gap-3">
                <Link
                  to="/scholarships"
                  className="group inline-flex items-center gap-3 rounded-full bg-[#11110f] px-6 py-3.5 text-sm font-semibold text-white transition hover:translate-y-[-1px] hover:bg-black"
                >
                  Find my options
                  <ArrowRight
                    size={17}
                    className="transition-transform group-hover:translate-x-1"
                  />
                </Link>

                <Link
                  to="/loans"
                  className="inline-flex items-center gap-3 rounded-full border border-black/15 bg-white/50 px-6 py-3.5 text-sm font-semibold transition hover:bg-white"
                >
                  Explore loans
                </Link>
              </div>

              <div className="mt-10 flex items-center gap-3 text-xs text-black/45">
                <div className="flex -space-x-2">
                  <div className="h-8 w-8 rounded-full border-2 border-[#f4f1ea] bg-[#c7d7c4]" />
                  <div className="h-8 w-8 rounded-full border-2 border-[#f4f1ea] bg-[#dec6ae]" />
                  <div className="h-8 w-8 rounded-full border-2 border-[#f4f1ea] bg-[#b8c4d6]" />
                </div>

                <span>
                  Built to simplify financial discovery.
                </span>
              </div>
            </motion.div>

            {/* Hero product visual */}
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{
                duration: 0.9,
                delay: 0.15,
              }}
              className="relative"
            >
              <div className="relative mx-auto max-w-xl">

                {/* background card */}
                <div className="absolute -right-5 -top-5 h-full w-full rounded-[2rem] border border-black/10 bg-[#ded8cd]" />

                {/* main product card */}
                <div className="relative rounded-[2rem] border border-black/10 bg-white p-6 shadow-[0_30px_90px_rgba(0,0,0,0.12)] sm:p-8">

                  <div className="flex items-center justify-between border-b border-black/10 pb-5">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-black/40">
                        Your FinBridge match
                      </p>

                      <h2 className="mt-2 text-xl font-semibold">
                        Financial profile
                      </h2>
                    </div>

                    <div className="rounded-full bg-[#dcebd8] px-3 py-1.5 text-xs font-semibold text-[#375b32]">
                      Verified
                    </div>
                  </div>

                  <div className="mt-7 grid grid-cols-2 gap-3">

                    <div className="rounded-2xl bg-[#f5f2ec] p-4">
                      <p className="text-xs text-black/40">
                        Income
                      </p>

                      <p className="mt-2 text-lg font-semibold">
                        ₹4.5L
                      </p>
                    </div>

                    <div className="rounded-2xl bg-[#f5f2ec] p-4">
                      <p className="text-xs text-black/40">
                        Education
                      </p>

                      <p className="mt-2 text-lg font-semibold">
                        B.Tech
                      </p>
                    </div>

                    <div className="rounded-2xl bg-[#f5f2ec] p-4">
                      <p className="text-xs text-black/40">
                        Location
                      </p>

                      <p className="mt-2 text-lg font-semibold">
                        Delhi
                      </p>
                    </div>

                    <div className="rounded-2xl bg-[#f5f2ec] p-4">
                      <p className="text-xs text-black/40">
                        Status
                      </p>

                      <p className="mt-2 text-lg font-semibold">
                        Eligible
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 rounded-2xl bg-[#11110f] p-5 text-white">

                    <div className="flex items-end justify-between">
                      <div>
                        <p className="text-xs uppercase tracking-[0.15em] text-white/50">
                          Match score
                        </p>

                        <p className="mt-2 text-5xl font-medium tracking-[-0.05em]">
                          94%
                        </p>
                      </div>

                      <Sparkles className="text-[#d7ee82]" />
                    </div>

                    <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/10">
                      <div className="h-full w-[94%] rounded-full bg-[#d7ee82]" />
                    </div>

                    <p className="mt-4 text-sm leading-6 text-white/55">
                      Strong compatibility across scholarships and loan
                      opportunities.
                    </p>
                  </div>

                  <div className="mt-5 flex items-center gap-3 text-xs text-black/45">
                    <ShieldCheck size={15} />
                    Data sourced from verified financial providers
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-black/40">
            <ArrowDown size={14} />
            Scroll to explore
          </div>
        </div>
      </section>

      {/* =====================================================
          DISCOVERY
      ====================================================== */}
      <section className="bg-[#11110f] px-5 py-24 text-[#f4f1ea] sm:px-8 lg:px-12 lg:py-32">
        <div className="mx-auto max-w-[1500px]">

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={fadeUp}
          >
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/40">
              01 — Discover
            </p>

            <h2 className="mt-5 max-w-4xl text-5xl font-medium leading-[0.95] tracking-[-0.05em] sm:text-6xl lg:text-8xl">
              Opportunities built
              <br />
              around your future.
            </h2>
          </motion.div>

          <div className="mt-20 grid gap-px overflow-hidden rounded-[2rem] border border-white/10 bg-white/10 lg:grid-cols-2">

            <Link
              to="/scholarships"
              className="group bg-[#151513] p-8 transition hover:bg-[#1a1a18] sm:p-12"
            >
              <div className="flex items-start justify-between">
                <div className="rounded-full border border-white/10 p-3">
                  <GraduationCap size={22} />
                </div>

                <ArrowRight
                  className="transition-transform group-hover:translate-x-2"
                  size={22}
                />
              </div>

              <div className="mt-28">
                <p className="text-sm text-white/40">
                  Scholarships
                </p>

                <p className="mt-4 text-5xl font-medium tracking-[-0.04em]">
                  128+
                </p>

                <p className="mt-4 max-w-md text-sm leading-6 text-white/50">
                  Discover opportunities based on academic, demographic,
                  geographic and financial eligibility.
                </p>
              </div>
            </Link>

            <Link
              to="/loans"
              className="group bg-[#191916] p-8 transition hover:bg-[#1e1e1a] sm:p-12"
            >
              <div className="flex items-start justify-between">
                <div className="rounded-full border border-white/10 p-3">
                  <Banknote size={22} />
                </div>

                <ArrowRight
                  className="transition-transform group-hover:translate-x-2"
                  size={22}
                />
              </div>

              <div className="mt-28">
                <p className="text-sm text-white/40">
                  Loans
                </p>

                <p className="mt-4 text-5xl font-medium tracking-[-0.04em]">
                  24
                </p>

                <p className="mt-4 max-w-md text-sm leading-6 text-white/50">
                  Compare financial products across education, home,
                  vehicle and other borrowing needs.
                </p>
              </div>
            </Link>

          </div>
        </div>
      </section>

      {/* =====================================================
          PROFILE MATCH
      ====================================================== */}
      <section className="bg-[#f4f1ea] px-5 py-24 sm:px-8 lg:px-12 lg:py-32">
        <div className="mx-auto max-w-[1500px]">

          <div className="grid gap-16 lg:grid-cols-[0.8fr_1.2fr]">

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-100px' }}
              variants={fadeUp}
            >
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-black/40">
                02 — Match
              </p>

              <h2 className="mt-6 max-w-xl text-5xl font-medium leading-[0.95] tracking-[-0.05em] sm:text-6xl lg:text-7xl">
                Tell us
                <br />
                what fits
                <br />
                <span className="font-serif italic">
                  you.
                </span>
              </h2>

              <p className="mt-7 max-w-md text-base leading-7 text-black/55">
                FinBridge analyzes your profile against eligibility rules
                and surfaces opportunities that make sense for you.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.7 }}
              className="rounded-[2rem] border border-black/10 bg-white p-6 shadow-[0_30px_80px_rgba(0,0,0,0.08)] sm:p-8"
            >
              <div className="flex items-center justify-between border-b border-black/10 pb-5">
                <div>
                  <p className="text-xs uppercase tracking-[0.15em] text-black/40">
                    Eligibility engine
                  </p>

                  <h3 className="mt-2 text-xl font-semibold">
                    Your profile
                  </h3>
                </div>

                <div className="h-3 w-3 animate-pulse rounded-full bg-[#5f8f57]" />
              </div>

              <div className="mt-7 grid gap-3 sm:grid-cols-2">

                {[
                  ['Annual income', '₹4,50,000'],
                  ['Education', 'B.Tech'],
                  ['Location', 'Delhi'],
                  ['Student', 'Yes'],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className="rounded-2xl bg-[#f5f2ec] p-5"
                  >
                    <p className="text-xs text-black/40">
                      {label}
                    </p>

                    <p className="mt-2 font-semibold">
                      {value}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-6 flex flex-col gap-5 rounded-2xl bg-[#dcebd8] p-6 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#45613f]">
                    Recommended
                  </p>

                  <p className="mt-2 text-2xl font-semibold text-[#20301d]">
                    12 opportunities
                  </p>

                  <p className="mt-1 text-sm text-[#53674e]">
                    Strong matches found for this profile.
                  </p>
                </div>

                <Link
                  to="/scholarships"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-[#20301d] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#182315]"
                >
                  See matches
                  <ArrowRight size={16} />
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* =====================================================
          HOW IT WORKS
      ====================================================== */}
      <section
        id="how-it-works"
        className="border-t border-black/10 bg-[#e8e2d7] px-5 py-24 sm:px-8 lg:px-12 lg:py-32"
      >
        <div className="mx-auto max-w-[1500px]">

          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-black/40">
            03 — The FinBridge way
          </p>

          <div className="mt-16 grid gap-10 border-t border-black/10 lg:grid-cols-4">

            {[
              'Create your profile',
              'Tell us what you need',
              'Discover matching options',
              'Compare and apply',
            ].map((item, index) => (
              <motion.div
                key={item}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{
                  duration: 0.6,
                  delay: index * 0.08,
                }}
                className="border-b border-black/10 pt-8 lg:border-b-0 lg:border-r lg:pr-8"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-black/35">
                    0{index + 1}
                  </span>

                  <Check size={17} className="text-black/40" />
                </div>

                <h3 className="mt-10 text-2xl font-medium tracking-[-0.03em]">
                  {item}
                </h3>
              </motion.div>
            ))}

          </div>
        </div>
      </section>

      {/* =====================================================
          FINAL CTA
      ====================================================== */}
      <section className="bg-[#11110f] px-5 py-28 text-[#f4f1ea] sm:px-8 lg:px-12 lg:py-40">
        <div className="mx-auto max-w-[1200px] text-center">

          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/35">
            Start exploring
          </p>

          <h2 className="mt-6 text-5xl font-medium leading-[0.95] tracking-[-0.05em] sm:text-6xl lg:text-8xl">
            Financial opportunity
            <br />
            should be easier
            <br />
            <span className="font-serif italic">
              to find.
            </span>
          </h2>

          <div className="mt-10">
            <Link
              to="/scholarships"
              className="group inline-flex items-center gap-3 rounded-full bg-[#f4f1ea] px-7 py-4 text-sm font-semibold text-[#11110f] transition hover:bg-white"
            >
              Explore FinBridge
              <ArrowRight
                size={17}
                className="transition-transform group-hover:translate-x-1"
              />
            </Link>
          </div>

          <p className="mx-auto mt-8 max-w-xl text-sm leading-6 text-white/35">
            FinBridge is an information and discovery platform. It does not
            itself approve, sanction, or disburse loans or scholarships.
          </p>
        </div>
      </section>

    </main>
  );
}