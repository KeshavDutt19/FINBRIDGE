import { motion } from 'framer-motion';

export default function PageShell({ eyebrow, title, subtitle, children, actions }) {
  return (
    <section className="mx-auto max-w-7xl px-4 py-8">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
        <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            {eyebrow && <p className="mb-2 text-xs font-bold uppercase tracking-widest text-mint">{eyebrow}</p>}
            <h1 className="text-3xl font-extrabold tracking-tight md:text-4xl">{title}</h1>
            {subtitle && <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{subtitle}</p>}
          </div>
          {actions}
        </div>
        {children}
      </motion.div>
    </section>
  );
}
