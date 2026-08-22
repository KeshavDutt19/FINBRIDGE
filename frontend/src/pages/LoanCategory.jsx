import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import PageShell from '../components/PageShell.jsx';
import TrustNotice from '../components/TrustNotice.jsx';
import { api, formatCurrency } from '../lib/api.js';

export default function LoanCategory() {
  const { category } = useParams();
  const [loans, setLoans] = useState([]);
  const [selected, setSelected] = useState([]);

  useEffect(() => {
    api(`/loans/${category}`).then(data => setLoans(data.loans));
  }, [category]);

  function toggle(id) {
    setSelected(current => (current.includes(id) ? current.filter(x => x !== id) : current.length < 3 ? [...current, id] : current));
  }

  const compare = loans.filter(l => selected.includes(l._id));

  return (
    <PageShell title={`${category[0].toUpperCase() + category.slice(1)} Loans`} eyebrow="Bank comparison" subtitle="Select up to 3 loan products and compare terms side by side.">
      <div className="overflow-x-auto panel">
        <table className="w-full min-w-[980px] text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500">
            <tr>{['Compare', 'Bank', 'Interest Rate', 'Maximum Loan', 'Maximum Tenure', 'Processing Fee', 'Subsidy/Concession', 'Collateral', 'Action'].map(h => <th className="px-4 py-3" key={h}>{h}</th>)}</tr>
          </thead>
          <tbody>
            {loans.map(loan => (
              <tr className="border-t border-slate-200" key={loan._id}>
                <td className="px-4 py-3"><input type="checkbox" checked={selected.includes(loan._id)} onChange={() => toggle(loan._id)} /></td>
                <td className="px-4 py-3 font-bold">{loan.bankName}<p className="text-xs font-medium text-slate-500">{loan.productName}</p></td>
                <td className="px-4 py-3">{loan.interestRate}</td>
                <td className="px-4 py-3">{formatCurrency(loan.loanAmountMax)}</td>
                <td className="px-4 py-3">{loan.tenureMax} months</td>
                <td className="px-4 py-3">{loan.processingFee}</td>
                <td className="px-4 py-3">{loan.subsidy}</td>
                <td className="px-4 py-3">{loan.collateralRequired}</td>
                <td className="px-4 py-3"><Link className="btn-primary" to={`/loans/${category}/${loan._id}`}>Details</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {compare.length > 0 && (
        <section className="mt-6 panel p-5">
          <h2 className="text-xl font-extrabold">Comparison table</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            {compare.map(loan => (
              <div className="rounded-md border border-slate-200 p-4" key={loan._id}>
                <h3 className="font-extrabold">{loan.bankName}</h3>
                <p className="text-sm text-slate-600">{loan.productName}</p>
                <dl className="mt-3 grid gap-2 text-sm">
                  <div><dt className="font-bold">Rate</dt><dd>{loan.interestRate}</dd></div>
                  <div><dt className="font-bold">Max loan</dt><dd>{formatCurrency(loan.loanAmountMax)}</dd></div>
                  <div><dt className="font-bold">Tenure</dt><dd>{loan.tenureMin}-{loan.tenureMax} months</dd></div>
                  <div><dt className="font-bold">Documents</dt><dd>{loan.documents.slice(0, 4).join(', ')}</dd></div>
                </dl>
                <div className="mt-3"><TrustNotice {...loan} label={loan.dataLabel} /></div>
              </div>
            ))}
          </div>
        </section>
      )}
    </PageShell>
  );
}
