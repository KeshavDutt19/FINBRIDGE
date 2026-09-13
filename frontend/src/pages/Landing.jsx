import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Banknote,
  CheckCircle2,
  GraduationCap,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function Landing() {
  return (
    <main className="min-h-screen bg-[#f4f1ea] text-[#11110f]">

      {/* =====================================================
          NAVBAR
      ====================================================== */}

      <header className="sticky top-0 z-50 border-b border-black/10 bg-[#f4f1ea]/85 backdrop-blur-xl">
        <div className="mx-auto flex h-[76px] max-w-[1500px] items-center justify-between px-5 sm:px-8 lg:px-12">

          {/* BRAND */}

          <Link
            to="/"
            className="group flex items-center gap-3"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#11110f] text-xs font-bold text-white transition group-hover:scale-105">
              FB
            </span>

            <span className="text-lg font-bold tracking-[-0.04em]">
              FINBRIDGE
            </span>
          </Link>

          {/* NAV ACTIONS */}

          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              to="/login/user"
              className="hidden text-sm font-medium text-black/60 transition hover:text-black sm:block"
            >
              User Login
            </Link>

            <Link
              to="/login/admin"
              className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/60 px-4 py-2.5 text-sm font-semibold transition hover:bg-white"
            >
              <ShieldCheck size={15} />
              <span className="hidden sm:inline">
                Admin Portal
              </span>
              <span className="sm:hidden">
                Admin
              </span>
            </Link>

            <Link
              to="/register"
              className="rounded-full bg-[#11110f] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-black/80"
            >
              Get started
            </Link>
          </div>
        </div>
      </header>

      {/* =====================================================
          HERO
      ====================================================== */}

      <section className="mx-auto max-w-[1500px] px-5 pb-16 pt-16 sm:px-8 sm:pb-24 sm:pt-20 lg:px-12 lg:pb-32 lg:pt-28">
        <div className="grid items-center gap-12 lg:grid-cols-[1.15fr_0.85fr]">

          {/* HERO COPY */}

          <motion.div
            initial={{
              opacity: 0,
              y: 24,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.6,
            }}
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/60 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-black/50">
              <Sparkles size={14} />
              Financial discovery, simplified
            </div>

            <h1 className="mt-7 max-w-5xl text-5xl font-medium leading-[0.95] tracking-[-0.06em] sm:text-6xl lg:text-8xl">
              Find the financial support that fits your future.
            </h1>

            <p className="mt-7 max-w-2xl text-base leading-7 text-black/55 sm:text-lg">
              FinBridge helps students, families and professionals discover
              scholarships, compare loan opportunities and understand their
              eligibility from one secure workspace.
            </p>

            <div className="mt-9 flex flex-wrap gap-3">
              <Link
                to="/register"
                className="inline-flex items-center gap-2 rounded-full bg-[#11110f] px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-black/80"
              >
                Get started
                <ArrowRight size={16} />
              </Link>

              <Link
                to="/login/user"
                className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-6 py-3.5 text-sm font-semibold transition hover:bg-[#faf9f6]"
              >
                User Login
              </Link>
            </div>

            <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-3 text-xs font-medium text-black/45">
              <span className="flex items-center gap-2">
                <CheckCircle2 size={15} className="text-[#375b32]" />
                Informational matching
              </span>

              <span className="flex items-center gap-2">
                <CheckCircle2 size={15} className="text-[#375b32]" />
                Official-source verification
              </span>

              <span className="flex items-center gap-2">
                <CheckCircle2 size={15} className="text-[#375b32]" />
                Secure account access
              </span>
            </div>
          </motion.div>

          {/* HERO CARD */}

          <motion.div
            initial={{
              opacity: 0,
              scale: 0.97,
              y: 24,
            }}
            animate={{
              opacity: 1,
              scale: 1,
              y: 0,
            }}
            transition={{
              duration: 0.6,
              delay: 0.12,
            }}
            className="relative"
          >
            <div className="rounded-[2.5rem] border border-black/10 bg-[#11110f] p-6 text-white shadow-[0_30px_100px_rgba(0,0,0,0.12)] sm:p-8">

              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/35">
                    FinBridge workspace
                  </p>

                  <h2 className="mt-3 text-3xl font-medium tracking-[-0.04em] sm:text-4xl">
                    One place for better financial decisions.
                  </h2>
                </div>

                <div className="rounded-2xl bg-[#dcebd8] p-3 text-[#375b32]">
                  <Sparkles size={20} />
                </div>
              </div>

              <div className="mt-8 grid gap-3">
                <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
                  <div className="flex items-start gap-4">
                    <div className="rounded-2xl bg-white/[0.07] p-3">
                      <GraduationCap size={20} />
                    </div>

                    <div>
                      <p className="text-sm font-semibold">
                        Scholarship discovery
                      </p>

                      <p className="mt-1 text-xs leading-5 text-white/45">
                        Discover opportunities and understand your
                        informational eligibility match.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
                  <div className="flex items-start gap-4">
                    <div className="rounded-2xl bg-white/[0.07] p-3">
                      <Banknote size={20} />
                    </div>

                    <div>
                      <p className="text-sm font-semibold">
                        Loan comparison
                      </p>

                      <p className="mt-1 text-xs leading-5 text-white/45">
                        Explore available loan products and compare
                        relevant options.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
                  <div className="flex items-start gap-4">
                    <div className="rounded-2xl bg-white/[0.07] p-3">
                      <ShieldCheck size={20} />
                    </div>

                    <div>
                      <p className="text-sm font-semibold">
                        Separate secure portals
                      </p>

                      <p className="mt-1 text-xs leading-5 text-white/45">
                        Standard users and administrators have distinct
                        authentication and access controls.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* =====================================================
          FEATURE STRIP
      ====================================================== */}

      <section className="border-y border-black/10 bg-white/50">
        <div className="mx-auto grid max-w-[1500px] gap-px bg-black/10 md:grid-cols-3">
          <div className="bg-[#f4f1ea] p-8 lg:p-10">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-black/35">
              01
            </p>

            <h3 className="mt-4 text-2xl font-medium tracking-[-0.04em]">
              Discover
            </h3>

            <p className="mt-3 text-sm leading-6 text-black/50">
              Browse scholarships and financial products in one place.
            </p>
          </div>

          <div className="bg-[#f4f1ea] p-8 lg:p-10">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-black/35">
              02
            </p>

            <h3 className="mt-4 text-2xl font-medium tracking-[-0.04em]">
              Match
            </h3>

            <p className="mt-3 text-sm leading-6 text-black/50">
              Use visible profile criteria to understand your potential
              eligibility.
            </p>
          </div>

          <div className="bg-[#f4f1ea] p-8 lg:p-10">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-black/35">
              03
            </p>

            <h3 className="mt-4 text-2xl font-medium tracking-[-0.04em]">
              Verify
            </h3>

            <p className="mt-3 text-sm leading-6 text-black/50">
              Continue through official sources before submitting an
              application.
            </p>
          </div>
        </div>
      </section>

      {/* =====================================================
          PORTAL SECTION
      ====================================================== */}

      <section className="mx-auto max-w-[1500px] px-5 py-16 sm:px-8 sm:py-24 lg:px-12">
        <div className="rounded-[2.5rem] bg-[#e8e2d7] p-6 sm:p-10 lg:p-14">
          <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-black/35">
                Choose your portal
              </p>

              <h2 className="mt-4 text-4xl font-medium tracking-[-0.05em] sm:text-5xl">
                One platform.
                <br />
                Two secure experiences.
              </h2>

              <p className="mt-5 max-w-md text-sm leading-6 text-black/50">
                Users and administrators enter FinBridge through separate
                authentication portals designed around their specific needs.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">

              {/* USER PORTAL */}

              <Link
                to="/login/user"
                className="group rounded-[2rem] border border-black/10 bg-white p-6 transition duration-300 hover:-translate-y-1 hover:shadow-[0_20px_50px_rgba(0,0,0,0.08)]"
              >
                <div className="flex items-start justify-between">
                  <div className="rounded-2xl bg-[#f4f1ea] p-3">
                    <GraduationCap size={21} />
                  </div>

                  <ArrowRight
                    size={18}
                    className="text-black/25 transition-transform group-hover:translate-x-1 group-hover:text-black"
                  />
                </div>

                <h3 className="mt-7 text-2xl font-semibold tracking-[-0.03em]">
                  User Portal
                </h3>

                <p className="mt-2 text-sm leading-6 text-black/50">
                  Scholarships, loans, eligibility matching and your personal
                  financial profile.
                </p>

                <span className="mt-6 inline-flex text-sm font-semibold text-[#375b32]">
                  Login as user
                </span>
              </Link>

              {/* ADMIN PORTAL */}

              <Link
                to="/login/admin"
                className="group rounded-[2rem] border border-black/10 bg-[#11110f] p-6 text-white transition duration-300 hover:-translate-y-1 hover:shadow-[0_20px_50px_rgba(0,0,0,0.15)]"
              >
                <div className="flex items-start justify-between">
                  <div className="rounded-2xl bg-white/[0.08] p-3">
                    <ShieldCheck size={21} />
                  </div>

                  <ArrowRight
                    size={18}
                    className="text-white/30 transition-transform group-hover:translate-x-1 group-hover:text-white"
                  />
                </div>

                <h3 className="mt-7 text-2xl font-semibold tracking-[-0.03em]">
                  Admin Portal
                </h3>

                <p className="mt-2 text-sm leading-6 text-white/45">
                  User management, financial analytics, platform monitoring
                  and administrative controls.
                </p>

                <span className="mt-6 inline-flex text-sm font-semibold text-[#d7ee82]">
                  Login as admin
                </span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          FOOTER
      ====================================================== */}

      <footer className="border-t border-black/10">
        <div className="mx-auto flex max-w-[1500px] flex-col gap-4 px-5 py-8 sm:px-8 md:flex-row md:items-center md:justify-between lg:px-12">
          <div>
            <p className="font-bold tracking-[-0.03em]">
              FINBRIDGE
            </p>

            <p className="mt-1 text-xs text-black/40">
              Informational financial discovery and matching platform.
            </p>
          </div>

          <p className="text-xs text-black/40">
            FinBridge does not itself approve, sanction or disburse loans or
            scholarships.
          </p>
        </div>
      </footer>
    </main>
  );
}
