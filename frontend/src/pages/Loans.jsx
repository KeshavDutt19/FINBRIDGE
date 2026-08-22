import { Link } from 'react-router-dom';
import { Banknote, Car, GraduationCap, Home } from 'lucide-react';
import PageShell from '../components/PageShell.jsx';

const categories = [
  ['Education Loan', 'education', GraduationCap, 'Compare banks for tuition, living expenses and course-related funding.'],
  ['Home Loan', 'home', Home, 'Review mortgage tenure, collateral and official lender terms.'],
  ['Car Loan', 'car', Car, 'Compare vehicle finance options with official source links.']
];

export default function Loans() {
  return (
    <PageShell title="Loan Categories" eyebrow="Financing options" subtitle="Choose a category and compare lender products. All rate fields are demo unless verified on the official lender website.">
      <div className="grid gap-5 md:grid-cols-3">
        {categories.map(([name, slug, Icon, text]) => (
          <Link className="panel p-6 transition hover:-translate-y-0.5 hover:border-mint" to={`/loans/${slug}`} key={slug}>
            <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-md bg-amber-50 text-copper"><Icon size={30} /></div>
            <h2 className="text-2xl font-extrabold">{name}</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">{text}</p>
            <p className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-mint"><Banknote size={16} /> Compare providers</p>
          </Link>
        ))}
      </div>
    </PageShell>
  );
}
