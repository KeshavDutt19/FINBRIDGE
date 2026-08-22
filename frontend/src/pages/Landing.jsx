import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Banknote, CheckCircle2, GraduationCap, ShieldCheck } from 'lucide-react';

export default function Landing() {
  return (
    <>
      <section className="border-b border-slate-200 bg-[linear-gradient(135deg,#f6f8f7_0%,#e9f5f2_52%,#fff7ed_100%)]">
        <div className="mx-auto grid min-h-[78vh] max-w-7xl items-center gap-10 px-4 py-12 lg:grid-cols-[1.1fr_0.9fr]">
          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}>
            <div className="mb-4 inline-flex items-center gap-2 rounded-md border border-teal-200 bg-white px-3 py-2 text-xs font-bold uppercase tracking-widest text-mint">
              <ShieldCheck size={15} /> Transparent financial discovery
            </div>
            <h1 className="max-w-4xl text-5xl font-extrabold tracking-tight text-ink md:text-7xl">Find the Financial Support You Qualify For.</h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-650">
              Discover scholarships and compare loan options from trusted sources — all in one place.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link className="btn-primary px-5 py-3" to="/scholarships">Find Scholarships <ArrowRight size={18} /></Link>
              <Link className="btn-secondary px-5 py-3" to="/loans">Explore Loans <Banknote size={18} /></Link>
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="grid gap-4">
            <div className="panel p-5">
              <div className="mb-4 flex items-center gap-3">
                <div className="rounded-md bg-teal-50 p-3 text-mint"><GraduationCap /></div>
                <div>
                  <h2 className="text-xl font-bold">Scholarships</h2>
                  <p className="text-sm text-slate-600">Find scholarships based on academic, demographic and financial profile.</p>
                </div>
              </div>
              <div className="h-2 rounded-full bg-slate-100"><div className="h-2 w-4/5 rounded-full bg-mint" /></div>
            </div>
            <div className="panel p-5">
              <div className="mb-4 flex items-center gap-3">
                <div className="rounded-md bg-amber-50 p-3 text-copper"><Banknote /></div>
                <div>
                  <h2 className="text-xl font-bold">Loans</h2>
                  <p className="text-sm text-slate-600">Compare education, home and vehicle loan options in one place.</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center text-xs font-semibold text-slate-600">
                <span className="rounded-md bg-slate-50 p-3">Education</span>
                <span className="rounded-md bg-slate-50 p-3">Home</span>
                <span className="rounded-md bg-slate-50 p-3">Car</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-4 py-12">
        <h2 className="text-2xl font-extrabold">How it works</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-4">
          {['Create your profile', 'Tell us what you need', 'Discover matching options', 'Compare and apply through official sources'].map((item, index) => (
            <div className="panel p-5" key={item}>
              <CheckCircle2 className="mb-4 text-mint" />
              <p className="text-sm font-bold">{index + 1}. {item}</p>
            </div>
          ))}
        </div>
        <p className="mt-8 rounded-md border border-slate-200 bg-white p-4 text-sm text-slate-600">
          FinBridge is an information and discovery platform. It does not itself approve, sanction or disburse loans or scholarships.
        </p>
      </section>
    </>
  );
}
