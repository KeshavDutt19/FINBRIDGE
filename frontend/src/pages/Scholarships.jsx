import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Filter, GraduationCap } from 'lucide-react';
import PageShell from '../components/PageShell.jsx';
import TrustNotice from '../components/TrustNotice.jsx';
import { api, formatDate } from '../lib/api.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function Scholarships() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [filters, setFilters] = useState({ sort: 'best' });
  const [scores, setScores] = useState({});

  const query = useMemo(() => new URLSearchParams(Object.entries(filters).filter(([, v]) => v)).toString(), [filters]);

  useEffect(() => {
    api(`/scholarships?${query}`).then(async data => {
      setItems(data.scholarships);
      const pairs = await Promise.all(
        data.scholarships.map(async s => [s._id, (await api(`/scholarships/${s._id}/check-eligibility`, { method: 'POST', body: JSON.stringify(user.profile || {}) })).result])
      );
      setScores(Object.fromEntries(pairs));
    });
  }, [query]);

  return (
    <PageShell title="Scholarship Discovery" eyebrow="Education support" subtitle="Filter scholarships, inspect eligibility criteria and continue through official sources.">
      <div className="panel mb-5 grid gap-3 p-4 md:grid-cols-8">
        <div className="flex items-center gap-2 text-sm font-bold"><Filter size={16} /> Filters</div>
        {[
          ['educationLevel', 'Education', ['Undergraduate', 'Postgraduate', 'Diploma', 'School']],
          ['state', 'State', ['All', 'Maharashtra']],
          ['category', 'Category', ['All', 'SC', 'Minority']],
          ['gender', 'Gender', ['Any', 'Female', 'Male']],
          ['sort', 'Sort', [['best', 'Best match'], ['deadline', 'Deadline soon'], ['updated', 'Recently updated']]]
        ].map(([key, label, opts]) => (
          <label className="text-xs font-bold text-slate-500" key={key}>{label}
            <select className="field mt-1" value={filters[key] || ''} onChange={e => setFilters({ ...filters, [key]: e.target.value })}>
              <option value="">Any</option>
              {opts.map(o => Array.isArray(o) ? <option value={o[0]} key={o[0]}>{o[1]}</option> : <option value={o} key={o}>{o}</option>)}
            </select>
          </label>
        ))}
        <label className="text-xs font-bold text-slate-500">Income
          <input className="field mt-1" type="number" placeholder="Annual" onChange={e => setFilters({ ...filters, income: e.target.value })} />
        </label>
        <label className="text-xs font-bold text-slate-500">Provider
          <input className="field mt-1" placeholder="NSP, AICTE" onChange={e => setFilters({ ...filters, provider: e.target.value })} />
        </label>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {items.map(s => (
          <div className="panel p-5" key={s._id}>
            <div className="flex items-start gap-3">
              <div className="rounded-md bg-teal-50 p-3 text-mint"><GraduationCap /></div>
              <div className="min-w-0 flex-1">
                <h2 className="text-lg font-extrabold">{s.title}</h2>
                <p className="text-sm text-slate-600">{s.provider} · {s.amount}</p>
              </div>
              <span className="rounded-md bg-teal-50 px-2 py-1 text-xs font-bold text-mint">{scores[s._id]?.score || '--'}%</span>
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-600">{s.description}</p>
            <p className="mt-2 text-sm font-semibold text-copper">Deadline: {formatDate(s.applicationDeadline)} · Status: {s.status}</p>
            <div className="mt-3"><TrustNotice {...s} label={s.dataLabel} /></div>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link className="btn-primary" to={`/scholarships/${s._id}`}>View Details</Link>
              <Link className="btn-secondary" to={`/scholarships/${s._id}`}>Check Eligibility</Link>
            </div>
          </div>
        ))}
      </div>
    </PageShell>
  );
}
