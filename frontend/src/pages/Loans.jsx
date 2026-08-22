import {
  Banknote,
  Car,
  GraduationCap,
  Home,
  ShieldCheck,
} from 'lucide-react';

import PageShell from '../components/PageShell.jsx';
import FeatureCard from '../components/cards/FeatureCard.jsx';

const categories = [
  [
    'Education Loan',
    'education',
    GraduationCap,
    'Compare options for tuition, living expenses and course-related funding.',
  ],

  [
    'Home Loan',
    'home',
    Home,
    'Review tenure, financing amounts, collateral and official lender terms.',
  ],

  [
    'Car Loan',
    'car',
    Car,
    'Compare vehicle financing options and inspect lender requirements.',
  ],
];

export default function Loans() {
  return (
    <PageShell
      title="Loan Categories"
      eyebrow="Financing options"
      subtitle="Choose a category and compare lender products. All rate fields are informational unless verified on the official lender website."
    >

      <div className="grid gap-5 md:grid-cols-3">

        {categories.map(
          ([name, slug, Icon, description], index) => (
           <FeatureCard
  key={slug}
  title={name}
  description={description}
  icon={Icon}
  to={`/loans/${slug}`}
  eyebrow={`0${index + 1} — Financing`}
/>
          )
        )}

      </div>

      <div
        className="
          mt-8
          flex
          items-start
          gap-3
          rounded-2xl
          border
          border-black/[0.08]
          bg-[#e8e2d7]
          p-5
        "
      >

        <div
          className="
            flex
            h-10
            w-10
            shrink-0
            items-center
            justify-center
            rounded-xl
            bg-white
          "
        >
          <ShieldCheck
            size={18}
            className="text-[#375b32]"
          />
        </div>

        <div>

          <p className="text-sm font-semibold">
            Compare before deciding
          </p>

          <p className="mt-1 text-xs leading-5 text-black/50">
            FinBridge helps you discover and compare products.
            Always confirm rates, eligibility, fees and terms with
            the official lender.
          </p>

        </div>

      </div>

    </PageShell>
  );
}