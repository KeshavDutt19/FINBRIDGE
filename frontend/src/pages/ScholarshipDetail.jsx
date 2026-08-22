import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { CheckCircle2, ExternalLink, XCircle } from 'lucide-react';
import PageShell from '../components/PageShell.jsx';
import TrustNotice from '../components/TrustNotice.jsx';
import { api, formatDate } from '../lib/api.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function ScholarshipDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [scholarship, setScholarship] = useState(null);
  const [result, setResult] = useState(null);

  useEffect(() => {
    api(`/scholarships/${id}`).then(data => setScholarship(data.scholarship));
    api(`/scholarships/${id}/check-eligibility`, { method: 'POST', body: JSON.stringify(user.profile || {}) }).then(data => setResult(data.result));
  }, [id]);

  if (!scholarship) return <PageShell title="Loading scholarship..." />;

  return (
    <PageShell title={scholarship.title} eyebrow={scholarship.provider} subtitle={scholarship.description}>
      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="panel p-5">
          <h2 className="text-xl font-extrabold">Why you may qualify</h2>
          <p className="mt-2 text-3xl font-extrabold text-mint">{result?.score || '--'}% <span className="text-sm text-slate-500">FinBridge Match Score - informational only</span></p>
          <p className="mt-1 text-sm font-bold capitalize">{result?.status}</p>
          <div className="mt-4 grid gap-2">
            {result?.explanation?.map(line => (
              <div className="flex gap-2 rounded-md bg-slate-50 p-3 text-sm" key={line.text}>
                {line.ok ? <CheckCircle2 className="shrink-0 text-mint" size={18} /> : <XCircle className="shrink-0 text-red-500" size={18} />}
                <span>{line.text}</span>
              </div>
            ))}
          </div>
          <div className="mt-4"><TrustNotice {...scholarship} label={scholarship.dataLabel} /></div>
          <a className="btn-primary mt-4 w-full" href={scholarship.officialUrl} target="_blank" rel="noreferrer">Apply on Official Portal <ExternalLink size={16} /></a>
        </div>
        <div className="grid gap-4">
          {[
            ['Benefits', [scholarship.benefits, scholarship.amount, scholarship.duration]],
            ['Eligibility', scholarship.eligibilityRules],
            ['Required documents', scholarship.requiredDocuments],
            ['Application process', scholarship.applicationProcedure],
            ['Important dates', [`Start: ${formatDate(scholarship.applicationStartDate)}`, `Deadline: ${formatDate(scholarship.applicationDeadline)}`]],
            ['Terms & conditions', [scholarship.termsAndConditions]]
          ].map(([title, rows]) => (
            <section className="panel p-5" key={title}>
              <h2 className="font-extrabold">{title}</h2>
              <ul className="mt-3 grid gap-2 text-sm text-slate-600">
                {(rows || []).filter(Boolean).map(row => <li className="rounded-md bg-slate-50 p-3" key={row}>{row}</li>)}
              </ul>
            </section>
          ))}
          <Link className="btn-secondary" to="/scholarships">Back to scholarships</Link>
        </div>
      </div>
    </PageShell>
  );
}
