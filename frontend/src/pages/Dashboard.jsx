import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, Banknote, Bell, FileText, GraduationCap, Search } from 'lucide-react';
import PageShell from '../components/PageShell.jsx';
import TrustNotice from '../components/TrustNotice.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { api, formatDate } from '../lib/api.js';

export default function Dashboard() {
  const { user } = useAuth();
  const [scholarships, setScholarships] = useState([]);
  const [choice, setChoice] = useState('Scholarship');
  const [finder, setFinder] = useState(null);

  useEffect(() => {
    api('/scholarships').then(data => setScholarships(data.scholarships.slice(0, 4))).catch(() => {});
  }, []);

  async function runFinder() {
    if (choice === 'Scholarship' && scholarships[0]) {
      const results = await Promise.all(
        scholarships.slice(0, 3).map(async s => ({ scholarship: s, result: (await api(`/scholarships/${s._id}/check-eligibility`, { method: 'POST', body: JSON.stringify(user.profile || {}) })).result }))
      );
      setFinder(results);
    } else {
      const category = choice.toLowerCase().split(' ')[0];
      const data = await api(`/loans/${category === 'education' ? 'education' : category === 'home' ? 'home' : 'car'}`);
      setFinder(data.loans.slice(0, 3).map((loan, index) => ({ loan, result: { score: 92 - index * 7, status: 'informational match' } })));
    }
  }

  return (
    <PageShell title={`Welcome back, ${user?.name}`} eyebrow="Dashboard" subtitle="Your top scholarship matches, financing options, saved demo applications and deadline alerts.">
      <div className="grid gap-4 md:grid-cols-4">
        {[
          ['Scholarship Matches', 'Review fit and explanations', GraduationCap, '/scholarships'],
          ['Loan Options', 'Compare lenders by category', Banknote, '/loans'],
          ['Applications', 'Demo application records', FileText, '/apply/loan/demo'],
          ['Important Deadlines', '3 deadlines need review', Bell, '/scholarships']
        ].map(([title, text, Icon, to]) => (
          <Link to={to} className="panel p-5 transition hover:-translate-y-0.5 hover:border-mint" key={title}>
            <Icon className="mb-4 text-mint" />
            <h2 className="font-bold">{title}</h2>
            <p className="mt-1 text-sm text-slate-600">{text}</p>
          </Link>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="panel p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-extrabold">Your top scholarship matches</h2>
            <Link className="text-sm font-bold text-mint" to="/scholarships">View all</Link>
          </div>
          <div className="grid gap-3">
            {scholarships.map(s => (
              <Link className="rounded-md border border-slate-200 p-4 hover:border-mint" to={`/scholarships/${s._id}`} key={s._id}>
                <div className="flex flex-wrap justify-between gap-2">
                  <h3 className="font-bold">{s.title}</h3>
                  <span className="text-sm font-semibold text-copper">Deadline {formatDate(s.applicationDeadline)}</span>
                </div>
                <p className="mt-1 text-sm text-slate-600">{s.benefits}</p>
                <TrustNotice {...s} label={s.dataLabel} />
              </Link>
            ))}
          </div>
        </div>
        <div className="panel p-5">
          <h2 className="flex items-center gap-2 text-xl font-extrabold"><Search className="text-mint" /> Financial Support Finder</h2>
          <p className="mt-2 text-sm text-slate-600">FinBridge Match Score is informational only and based on visible profile criteria.</p>
          <select className="field mt-4" value={choice} onChange={e => setChoice(e.target.value)}>
            <option>Scholarship</option><option>Education Loan</option><option>Home Loan</option><option>Car Loan</option>
          </select>
          <button className="btn-primary mt-3 w-full" onClick={runFinder}>Find matches</button>
          <div className="mt-4 grid gap-3">
            {finder?.map((item, index) => (
              <div className="rounded-md border border-slate-200 p-3" key={item.scholarship?._id || item.loan?._id}>
                <p className="font-bold">{item.scholarship?.title || item.loan?.productName}</p>
                <p className="text-sm font-semibold text-mint">{item.result.score}% Match · {item.result.status}</p>
                {index === 0 && <p className="mt-1 flex gap-2 text-xs text-slate-600"><AlertCircle size={14} /> Verify on official source before applying.</p>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </PageShell>
  );
}
