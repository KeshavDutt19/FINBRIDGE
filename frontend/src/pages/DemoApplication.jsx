import { useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { CheckCircle2, UploadCloud } from 'lucide-react';
import PageShell from '../components/PageShell.jsx';
import { api } from '../lib/api.js';
import { useAuth } from '../context/AuthContext.jsx';

const baseDocs = ['Identity proof', 'Address proof', 'Income proof', 'Bank statement'];

export default function DemoApplication() {
  const { type, id } = useParams();
  const [params] = useSearchParams();
  const category = params.get('category') || 'education';
  const { user } = useAuth();
  const [saved, setSaved] = useState(null);
  const [form, setForm] = useState({
    personal: { fullName: user?.name || '', phone: user?.phone || '', email: user?.email || '' },
    employment: {},
    loan: { loanType: category },
    educationLoan: {},
    homeLoan: {},
    carLoan: {}
  });

  const docs = [...baseDocs, ...(category === 'education' ? ['Academic documents', 'Admission letter'] : []), ...(category === 'home' ? ['Property documents'] : [])];

  function setSection(section, key, value) {
    setForm(current => ({ ...current, [section]: { ...current[section], [key]: value } }));
  }

  async function submit(e) {
    e.preventDefault();
    const payload = {
      ...form,
      type,
      targetId: id === 'demo' ? '000000000000000000000000' : id,
      documents: docs.map(name => ({ name, fileName: `${name}.pdf`, uploaded: true }))
    };
    const data = await api('/applications', { method: 'POST', body: JSON.stringify(payload) });
    setSaved(data);
  }

  if (saved) {
    return (
      <PageShell title="Demo Application Saved" eyebrow="Application demo" subtitle="FinBridge has saved this as a demo record only. It has not been sent to a bank or official portal.">
        <div className="panel max-w-2xl p-6">
          <CheckCircle2 className="mb-4 text-mint" size={42} />
          <p className="text-sm leading-6 text-slate-600">{saved.nextStep}</p>
          <div className="mt-5 flex flex-wrap gap-2">
            <Link className="btn-primary" to="/loans">Continue to official lender</Link>
            <Link className="btn-secondary" to="/dashboard">Back to dashboard</Link>
          </div>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell title="Demo Application Form" eyebrow="Hackathon sample" subtitle="This form stores only demo metadata and does not submit real applications, documents, KYC, Aadhaar or financial records.">
      <form onSubmit={submit} className="grid gap-5 lg:grid-cols-2">
        <section className="panel grid gap-3 p-5 md:grid-cols-2">
          <h2 className="text-xl font-extrabold md:col-span-2">Personal</h2>
          {['fullName', 'dateOfBirth', 'phone', 'email', 'address'].map(key => (
            <label className="text-sm font-semibold" key={key}>{key.replace(/([A-Z])/g, ' $1')}
              <input className="field mt-1" value={form.personal[key] || ''} onChange={e => setSection('personal', key, e.target.value)} />
            </label>
          ))}
        </section>
        <section className="panel grid gap-3 p-5 md:grid-cols-2">
          <h2 className="text-xl font-extrabold md:col-span-2">Employment and loan</h2>
          {['occupation', 'employer', 'monthlyIncome'].map(key => (
            <label className="text-sm font-semibold" key={key}>{key.replace(/([A-Z])/g, ' $1')}
              <input className="field mt-1" value={form.employment[key] || ''} onChange={e => setSection('employment', key, e.target.value)} />
            </label>
          ))}
          {['loanType', 'desiredAmount', 'preferredTenure'].map(key => (
            <label className="text-sm font-semibold" key={key}>{key.replace(/([A-Z])/g, ' $1')}
              <input className="field mt-1" value={form.loan[key] || ''} onChange={e => setSection('loan', key, e.target.value)} />
            </label>
          ))}
        </section>
        <section className="panel grid gap-3 p-5 md:grid-cols-2">
          <h2 className="text-xl font-extrabold md:col-span-2">Category details</h2>
          {category === 'education' && ['institution', 'course', 'admissionStatus'].map(key => (
            <label className="text-sm font-semibold" key={key}>{key}<input className="field mt-1" onChange={e => setSection('educationLoan', key, e.target.value)} /></label>
          ))}
          {category === 'home' && ['propertyValue', 'propertyLocation'].map(key => (
            <label className="text-sm font-semibold" key={key}>{key}<input className="field mt-1" onChange={e => setSection('homeLoan', key, e.target.value)} /></label>
          ))}
          {category === 'car' && ['vehicleType', 'estimatedVehiclePrice'].map(key => (
            <label className="text-sm font-semibold" key={key}>{key}<input className="field mt-1" onChange={e => setSection('carLoan', key, e.target.value)} /></label>
          ))}
        </section>
        <section className="panel p-5">
          <h2 className="text-xl font-extrabold">Documents checklist</h2>
          <div className="mt-3 grid gap-2">
            {docs.map(doc => (
              <div className="flex items-center justify-between rounded-md bg-slate-50 p-3 text-sm" key={doc}>
                <span>{doc}</span><span className="inline-flex items-center gap-1 font-bold text-mint"><UploadCloud size={15} /> Demo upload</span>
              </div>
            ))}
          </div>
          <p className="mt-4 text-xs font-semibold text-slate-500">Documents are represented by metadata only for this MVP.</p>
        </section>
        <button className="btn-primary lg:col-span-2">Save demo application</button>
      </form>
    </PageShell>
  );
}
