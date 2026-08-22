import { ArrowRight } from 'lucide-react';

export default function MetricCard({
  title,
  value,
  description,
  icon: Icon,
  to,
  accent = false,
}) {
  return (
    <a
      href={to}
      className={[
        'group relative block h-full overflow-hidden rounded-[1.5rem]',
        'border border-black/[0.08] bg-white',
        'p-6',
        'shadow-[0_10px_35px_rgba(0,0,0,0.04)]',
        'transition-all duration-300 ease-out',
        'hover:-translate-y-1',
        'hover:border-black/[0.14]',
        'hover:shadow-[0_20px_50px_rgba(0,0,0,0.08)]',
        accent
          ? 'before:pointer-events-none before:absolute before:inset-0 before:bg-[radial-gradient(circle_at_top_right,rgba(215,238,130,0.22),transparent_42%)]'
          : '',
      ].join(' ')}
    >
      <div className="relative z-10">

        <div className="flex items-start justify-between gap-4">

          <div
            className="
              flex h-11 w-11 shrink-0
              items-center justify-center
              rounded-xl
              border border-black/[0.05]
              bg-[#f4f1ea]
              text-[#375b32]
              transition-transform duration-300
              group-hover:scale-105
            "
          >
            <Icon size={20} strokeWidth={1.8} />
          </div>

          <div
            className="
              flex h-9 w-9 items-center justify-center
              rounded-full
              border border-black/[0.06]
              text-black/20
              transition-all duration-300
              group-hover:translate-x-1
              group-hover:text-black
            "
          >
            <ArrowRight size={16} />
          </div>

        </div>

        <p className="mt-7 text-4xl font-semibold tracking-[-0.06em]">
          {value}
        </p>

        <h3 className="mt-2 text-sm font-semibold">
          {title}
        </h3>

        <p className="mt-1 max-w-[250px] text-sm leading-6 text-black/45">
          {description}
        </p>

      </div>

      {accent && (
        <div
          className="
            pointer-events-none
            absolute
            -right-16
            -top-16
            h-40
            w-40
            rounded-full
            bg-[#d7ee82]/20
            blur-3xl
            transition duration-500
            group-hover:opacity-100
          "
        />
      )}
    </a>
  );
}