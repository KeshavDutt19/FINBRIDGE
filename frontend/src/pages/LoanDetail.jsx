import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Building2, ExternalLink } from 'lucide-react';
import PageShell from '../components/PageShell.jsx';
import TrustNotice from '../components/TrustNotice.jsx';
import { api, formatCurrency } from '../lib/api.js';

export default function LoanDetail() {
  const { category, bankId } = useParams();
  const [loan, setLoan] = useState(null);

  useEffect(() => {
    api(`/loans/${category}/${bankId}`).then(data => setLoan(data.loan));
  }, [category, bankId]);

  if (!loan) return <PageShell title="Loading loan..." />;

  return (
    <PageShell title={loan.productName} eyebrow={loan.bankName} subtitle={loan.description}>
      <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
        <aside className="panel p-5">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-md bg-slate-100"><Building2 className="text-mint" size={34} /></div>
          <dl className="grid gap-3 text-sm">
            <div><dt className="font-bold">Interest rate</dt><dd>{loan.interestRate}</dd></div>
            <div><dt className="font-bold">Loan amount</dt><dd>{formatCurrency(loan.loanAmountMin)} - {formatCurrency(loan.loanAmountMax)}</dd></div>
            <div><dt className="font-bold">Tenure</dt><dd>{loan.tenureMin}-{loan.tenureMax} months</dd></div>
            <div><dt className="font-bold">Processing fee</dt><dd>{loan.processingFee}</dd></div>
            <div><dt className="font-bold">Collateral</dt><dd>{loan.collateralRequired}</dd></div>
          </dl>
          <div className="mt-4"><TrustNotice {...loan} label={loan.dataLabel} /></div>
          <a className="btn-primary mt-4 w-full" href={loan.officialUrl} target="_blank" rel="noreferrer">Apply on Official Website <ExternalLink size={16} /></a>
          <Link className="btn-secondary mt-2 w-full" to={`/apply/loan/${loan._id}?category=${category}`}>Start Demo Application</Link>
        </aside>
        <div className="grid gap-4">
          {[
            ['Eligibility', [loan.eligibility, loan.ageCriteria, loan.incomeCriteria]],
            ['Required documents', loan.documents],
            ['Subsidy/concession information', [loan.subsidy, loan.subsidyDetails, ...(loan.specialBenefits || [])]],
            ['Repayment information', [loan.repaymentInfo]],
            ['Application procedure', loan.applicationProcedure],
            ['Terms and disclaimer', [loan.disclaimer]]
          ].map(([title, rows]) => (
            <section className="panel p-5" key={title}>
              <h2 className="font-extrabold">{title}</h2>
              <ul className="mt-3 grid gap-2 text-sm text-slate-600">
                {(rows || []).filter(Boolean).map(row => <li className="rounded-md bg-slate-50 p-3" key={row}>{row}</li>)}
              </ul>
            </section>
          ))}
        </div>
      </div>
    </PageShell>
  );
}
