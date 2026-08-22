import { motion } from 'framer-motion';

export default function PageShell({
  eyebrow,
  title,
  subtitle,
  children,
  actions,
}) {
  return (
    <main className="min-h-[calc(100vh-76px)] bg-[#f4f1ea] text-[#11110f]">
      <section className="mx-auto max-w-[1500px] px-5 py-12 sm:px-8 lg:px-12 lg:py-20">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.5,
            ease: [0.22, 1, 0.36, 1],
          }}
        >
          <div className="flex flex-col justify-between gap-8 border-b border-black/10 pb-10 md:flex-row md:items-end">
            <div>
              {eyebrow && (
                <p className="section-label">
                  {eyebrow}
                </p>
              )}

              <h1 className="editorial-title mt-5 max-w-5xl text-5xl sm:text-6xl lg:text-7xl">
                {title}
              </h1>

              {subtitle && (
                <p className="mt-6 max-w-2xl text-base leading-7 text-black/55 sm:text-lg">
                  {subtitle}
                </p>
              )}
            </div>

            {actions && (
              <div className="shrink-0">
                {actions}
              </div>
            )}
          </div>

          <div className="pt-12">
            {children}
          </div>
        </motion.div>
      </section>
    </main>
  );
}