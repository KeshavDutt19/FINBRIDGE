import { useEffect, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import PageShell from '../components/PageShell.jsx';
import { api, formatDate } from '../lib/api.js';

export default function Admin() {
  const [stats, setStats] = useState(null);
  const [message, setMessage] = useState('');

  async function load() {
    const data = await api('/admin/stats');
    setStats(data);
  }

  async function sync(type) {
    setMessage(`Syncing ${type}...`);
    const data = await api(`/admin/sync-${type}`, { method: 'POST', body: '{}' });
    setMessage(`${type} sync complete: ${data.newCount} new, ${data.updatedCount} updated, ${data.failedSources.length} unavailable source(s).`);
    await load();
  }

  useEffect(() => {
    load().catch(err => setMessage(err.message));
  }, []);

  return (
    <PageShell
      title="Admin Dashboard"
      eyebrow="Data monitoring"
      subtitle="Monitor data freshness, source availability and normalized sync status."
      actions={<button className="btn-secondary" onClick={load}><RefreshCw size={16} /> Refresh Data</button>}
    >
      {message && <p className="mb-4 rounded-md border border-slate-200 bg-white p-3 text-sm font-semibold">{message}</p>}
      <div className="grid gap-4 md:grid-cols-6">
        {[
          ['Total users', stats?.totalUsers],
          ['Total scholarships', stats?.totalScholarships],
          ['Total loan products', stats?.totalLoanProducts],
          ['Last scholarship sync', formatDate(stats?.lastScholarshipSync?.finishedAt)],
          ['Last loan update', formatDate(stats?.lastLoanSync?.finishedAt)],
          ['Failed syncs', stats?.failedSyncs?.length || 0]
        ].map(([label, value]) => (
          <div className="panel p-4" key={label}>
            <p className="text-xs font-bold uppercase text-slate-500">{label}</p>
            <p className="mt-2 text-xl font-extrabold">{value ?? '--'}</p>
          </div>
        ))}
      </div>
      <div className="mt-6 flex flex-wrap gap-2">
        <button className="btn-primary" onClick={() => sync('scholarships')}>Sync Scholarships</button>
        <button className="btn-primary" onClick={() => sync('loans')}>Sync Loans</button>
        <button className="btn-secondary" onClick={load}>View Failed Sources</button>
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <section className="panel p-5">
          <h2 className="font-extrabold">Scholarships</h2>
          <p className="mt-2 text-sm text-slate-600">Oldest verified record: {formatDate(stats?.dataFreshness?.oldestScholarship)}</p>
        </section>
        <section className="panel p-5">
          <h2 className="font-extrabold">Loan Products</h2>
          <p className="mt-2 text-sm text-slate-600">Oldest verified record: {formatDate(stats?.dataFreshness?.oldestLoan)}</p>
        </section>
        <section className="panel p-5">
          <h2 className="font-extrabold">Sources</h2>
          <div className="mt-3 grid gap-2 text-sm">
            {(stats?.failedSyncs || []).map(log => (
              <div className="rounded-md bg-amber-50 p-3 text-amber-900" key={log._id}>
                <p className="font-bold">{log.type} · {log.status}</p>
                <p>{log.failedSources?.map(s => `${s.sourceName}: ${s.reason}`).join('; ') || log.message}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </PageShell>
  );
}
