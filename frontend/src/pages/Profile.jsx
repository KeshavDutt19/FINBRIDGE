import { useState } from 'react';
import PageShell from '../components/PageShell.jsx';
import { useAuth } from '../context/AuthContext.jsx';

const fields = [
  ['age', 'Age', 'number'], ['state', 'State'], ['city', 'City'], ['gender', 'Gender'], ['category', 'Category'],
  ['educationLevel', 'Current education level'], ['course', 'Course'], ['institution', 'Institution'],
  ['academicScore', 'Academic percentage/CGPA', 'number'], ['yearOfStudy', 'Year of study'],
  ['annualFamilyIncome', 'Annual family income', 'number'], ['employmentStatus', 'Employment status'],
  ['loanType', 'Loan type'], ['desiredAmount', 'Desired amount', 'number'], ['preferredTenure', 'Preferred tenure in months', 'number']
];

export default function Profile() {
  const { user, updateProfile } = useAuth();
  const [profile, setProfile] = useState({ disabilityStatus: false, ...(user?.profile || {}) });
  const [saved, setSaved] = useState(false);

  async function submit(e) {
    e.preventDefault();
    await updateProfile(profile);
    setSaved(true);
  }

  return (
    <PageShell title="Profile" eyebrow="Eligibility inputs" subtitle="This profile powers scholarship match explanations and loan preference shortcuts. Avoid storing sensitive IDs or document contents.">
      <form onSubmit={submit} className="panel grid gap-4 p-6 md:grid-cols-3">
        {fields.map(([key, label, type = 'text']) => (
          <label className="text-sm font-semibold" key={key}>{label}
            <input className="field mt-1" type={type} value={profile[key] || ''} onChange={e => setProfile({ ...profile, [key]: type === 'number' ? Number(e.target.value) : e.target.value })} />
          </label>
        ))}
        <label className="flex items-center gap-3 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-semibold">
          <input type="checkbox" checked={Boolean(profile.disabilityStatus)} onChange={e => setProfile({ ...profile, disabilityStatus: e.target.checked })} />
          Disability status
        </label>
        <button className="btn-primary md:col-span-3">Save profile</button>
        {saved && <p className="text-sm font-bold text-mint md:col-span-3">Profile saved.</p>}
      </form>
    </PageShell>
  );
}
