export default function AnalyticsCard({
  title,
  subtitle,
  action,
  children,
  dark = false,
}) {
  return (
    <section
      className={
        dark
          ? `
            relative overflow-hidden
            rounded-[1.75rem]
            border border-white/10
            bg-[#11110f]
            p-6 text-white
            shadow-[0_20px_60px_rgba(0,0,0,0.14)]
          `
          : `
            relative overflow-hidden
            rounded-[1.5rem]
            border border-black/[0.08]
            bg-white
            p-6
            shadow-[0_10px_35px_rgba(0,0,0,0.04)]
          `
      }
    >
      <div className="relative z-10 flex items-start justify-between gap-4">

        <div>
          <p
            className={
              dark
                ? 'text-[11px] font-bold uppercase tracking-[0.2em] text-white/35'
                : 'text-[11px] font-bold uppercase tracking-[0.2em] text-black/35'
            }
          >
            {title}
          </p>

          {subtitle && (
            <p
              className={
                dark
                  ? 'mt-2 text-sm leading-6 text-white/45'
                  : 'mt-2 text-sm leading-6 text-black/45'
              }
            >
              {subtitle}
            </p>
          )}
        </div>

        {action}
      </div>

      <div className="relative z-10 mt-6">
        {children}
      </div>
    </section>
  );
}