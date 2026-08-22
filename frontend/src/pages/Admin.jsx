import {
  useEffect,
  useState,
} from 'react';

import {
  AlertTriangle,
  Database,
  GraduationCap,
  RefreshCw,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react';

import PageShell from '../components/PageShell.jsx';

import {
  api,
  formatDate,
} from '../lib/api.js';

import MetricCard from '../components/cards/MetricCard.jsx';
import AnalyticsCard from '../components/cards/AnalyticsCard.jsx';

export default function Admin() {
  const [stats, setStats] =
    useState(null);

  const [message, setMessage] =
    useState('');

  const [loading, setLoading] =
    useState(true);

  async function load() {
    setLoading(true);

    try {
      const data =
        await api('/admin/stats');

      setStats(data);
      setMessage('');
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  }

  async function sync(type) {
    try {

      setMessage(
        `Syncing ${type}...`
      );

      const data =
        await api(
          `/admin/sync-${type}`,
          {
            method: 'POST',
            body: '{}',
          }
        );

      setMessage(
        `${type} sync complete: ${data.newCount} new, ${data.updatedCount} updated, ${data.failedSources.length} unavailable source(s).`
      );

      await load();

    } catch (error) {

      setMessage(
        error.message
      );

    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <PageShell
      title="Admin Dashboard"
      eyebrow="Data monitoring"
      subtitle="Monitor data freshness, source availability and normalized sync status."
      actions={
        <button
          className="btn-secondary"
          onClick={load}
        >
          <RefreshCw size={16} />
          Refresh Data
        </button>
      }
    >

      {message && (
        <div
          className="
            mb-6
            rounded-2xl
            border
            border-black/[0.08]
            bg-white
            p-4
            text-sm
            font-semibold
            shadow-[0_8px_25px_rgba(0,0,0,0.03)]
          "
        >
          {message}
        </div>
      )}

      {/* Stats */}

      <div
        className="
          grid
          gap-4
          sm:grid-cols-2
          lg:grid-cols-3
        "
      >

        <MetricCard
          title="Total Users"
          value={
            loading
              ? '—'
              : stats?.totalUsers ?? '--'
          }
          description="Registered platform accounts"
          icon={ShieldCheck}
          to="/admin"
          accent
        />

        <MetricCard
          title="Scholarships"
          value={
            loading
              ? '—'
              : stats?.totalScholarships ?? '--'
          }
          description="Scholarship records currently available"
          icon={GraduationCap}
          to="/admin"
        />

        <MetricCard
          title="Loan Products"
          value={
            loading
              ? '—'
              : stats?.totalLoanProducts ?? '--'
          }
          description="Normalized lender products"
          icon={Database}
          to="/admin"
        />

      </div>

      {/* Monitoring cards */}

      <div className="
        mt-6
        grid
        gap-5
        lg:grid-cols-3
      ">

        <AnalyticsCard
          title="Scholarship freshness"
          subtitle="Most recent sync and oldest available record"
        >

          <div className="grid gap-3">

            <div className="
              rounded-xl
              bg-[#f7f4ee]
              p-4
            ">

              <p className="text-[11px] font-bold uppercase tracking-wide text-black/35">
                Last sync
              </p>

              <p className="mt-2 text-sm font-semibold">
                {formatDate(
                  stats?.lastScholarshipSync?.finishedAt
                )}
              </p>

            </div>

            <div className="
              rounded-xl
              bg-[#f7f4ee]
              p-4
            ">

              <p className="text-[11px] font-bold uppercase tracking-wide text-black/35">
                Oldest record
              </p>

              <p className="mt-2 text-sm font-semibold">
                {formatDate(
                  stats?.dataFreshness?.oldestScholarship
                )}
              </p>

            </div>

          </div>

        </AnalyticsCard>

        <AnalyticsCard
          title="Loan data freshness"
          subtitle="Latest lender update and oldest product record"
        >

          <div className="grid gap-3">

            <div className="
              rounded-xl
              bg-[#f7f4ee]
              p-4
            ">

              <p className="text-[11px] font-bold uppercase tracking-wide text-black/35">
                Last update
              </p>

              <p className="mt-2 text-sm font-semibold">
                {formatDate(
                  stats?.lastLoanSync?.finishedAt
                )}
              </p>

            </div>

            <div className="
              rounded-xl
              bg-[#f7f4ee]
              p-4
            ">

              <p className="text-[11px] font-bold uppercase tracking-wide text-black/35">
                Oldest record
              </p>

              <p className="mt-2 text-sm font-semibold">
                {formatDate(
                  stats?.dataFreshness?.oldestLoan
                )}
              </p>

            </div>

          </div>

        </AnalyticsCard>

        <AnalyticsCard
          title="Failed sources"
          subtitle="Sources requiring attention"
        >

          <div
            className={`
              flex
              min-h-[150px]
              flex-col
              items-center
              justify-center
              rounded-xl
              p-5
              text-center
              ${
                stats?.failedSyncs?.length
                  ? 'bg-amber-50'
                  : 'bg-[#dcebd8]'
              }
            `}
          >

            {stats?.failedSyncs?.length ? (
              <>
                <AlertTriangle
                  size={25}
                  className="text-amber-600"
                />

                <p className="
                  mt-3
                  text-2xl
                  font-bold
                  text-amber-900
                ">
                  {stats.failedSyncs.length}
                </p>

                <p className="
                  mt-1
                  text-xs
                  text-amber-900/60
                ">
                  failed or partial syncs
                </p>
              </>
            ) : (
              <>
                <TrendingUp
                  size={25}
                  className="text-[#375b32]"
                />

                <p className="
                  mt-3
                  text-sm
                  font-semibold
                  text-[#375b32]
                ">
                  All monitored sources healthy
                </p>
              </>
            )}

          </div>

        </AnalyticsCard>

      </div>

      {/* Sync controls */}

      <section
        className="
          fb-card-dark
          mt-6
          p-6
        "
      >

        <div
          className="
            flex
            flex-col
            justify-between
            gap-5
            sm:flex-row
            sm:items-center
          "
        >

          <div>

            <p className="fb-eyebrow-dark">
              Data operations
            </p>

            <h2 className="
              mt-2
              text-2xl
              font-semibold
              tracking-[-0.03em]
            ">
              Manage source synchronization
            </h2>

            <p className="
              mt-2
              max-w-2xl
              text-sm
              leading-6
              text-white/45
            ">
              Refresh normalized scholarship and loan data
              without leaving the admin dashboard.
            </p>

          </div>

          <div
            className="
              flex
              flex-wrap
              gap-2
            "
          >

            <button
              className="
                inline-flex
                items-center
                gap-2
                rounded-full
                bg-[#d7ee82]
                px-4
                py-2.5
                text-sm
                font-bold
                text-[#11110f]
                transition
                hover:bg-white
              "
              onClick={() =>
                sync('scholarships')
              }
            >
              Sync scholarships
            </button>

            <button
              className="
                inline-flex
                items-center
                gap-2
                rounded-full
                border
                border-white/15
                bg-white/[0.05]
                px-4
                py-2.5
                text-sm
                font-semibold
                text-white
                transition
                hover:bg-white/[0.1]
              "
              onClick={() =>
                sync('loans')
              }
            >
              Sync loans
            </button>

          </div>

        </div>

      </section>

      {/* Failed sources */}

      <section className="fb-card mt-6 p-6">

        <div className="
          flex
          items-center
          justify-between
        ">

          <div>

            <p className="fb-eyebrow">
              Source health
            </p>

            <h2 className="
              mt-2
              text-2xl
              font-semibold
            ">
              Failed source logs
            </h2>

          </div>

          <AlertTriangle
            size={20}
            className={
              stats?.failedSyncs?.length
                ? 'text-amber-500'
                : 'text-black/20'
            }
          />

        </div>

        <div className="mt-5 grid gap-3">

          {(stats?.failedSyncs || []).length === 0 ? (

            <div
              className="
                rounded-xl
                border
                border-dashed
                border-black/10
                bg-[#faf8f3]
                p-6
                text-center
              "
            >
              <p className="font-semibold">
                No failed sync records
              </p>

              <p className="
                mt-1
                text-xs
                text-black/40
              ">
                Source monitoring looks healthy.
              </p>
            </div>

          ) : (

            stats.failedSyncs.map((log) => (

              <div
                key={log._id}
                className="
                  rounded-2xl
                  border
                  border-amber-200
                  bg-amber-50
                  p-5
                "
              >

                <div className="
                  flex
                  items-start
                  justify-between
                  gap-4
                ">

                  <div>

                    <p className="
                      font-bold
                      text-amber-900
                    ">
                      {log.type} · {log.status}
                    </p>

                    <p className="
                      mt-2
                      text-sm
                      leading-6
                      text-amber-900/70
                    ">
                      {log.failedSources
                        ?.map(
                          (source) =>
                            `${source.sourceName}: ${source.reason}`
                        )
                        .join('; ') ||
                        log.message}
                    </p>

                  </div>

                  <span className="
                    shrink-0
                    rounded-full
                    bg-white/60
                    px-3
                    py-1
                    text-[10px]
                    font-bold
                    uppercase
                    tracking-wide
                    text-amber-800
                  ">
                    attention
                  </span>

                </div>

              </div>

            ))
          )}

        </div>

      </section>

    </PageShell>
  );
}