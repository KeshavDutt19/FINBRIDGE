import {
  ArrowRight,
} from 'lucide-react';

export default function ListCard({
  title,
  subtitle,
  meta,
  badge,
  icon: Icon,
  children,
  onClick,
}) {
  return (
    <div
      onClick={onClick}
      className={[
        `
          group
          rounded-2xl
          border
          border-black/[0.07]
          bg-white
          p-5
          shadow-[0_8px_28px_rgba(0,0,0,0.035)]
          transition-all
          duration-300
          ease-out
        `,
        onClick
          ? 'cursor-pointer hover:-translate-y-0.5 hover:border-black/[0.14] hover:shadow-[0_15px_40px_rgba(0,0,0,0.06)]'
          : '',
      ].join(' ')}
    >

      <div className="flex items-start gap-4">

        {Icon && (
          <div
            className="
              flex
              h-11
              w-11
              shrink-0
              items-center
              justify-center
              rounded-xl
              bg-[#f4f1ea]
              text-[#375b32]
              transition-transform
              duration-300
              group-hover:scale-105
            "
          >
            <Icon size={19} />
          </div>
        )}

        <div className="min-w-0 flex-1">

          <div className="flex items-start justify-between gap-4">

            <div className="min-w-0">

              <h3 className="truncate text-base font-semibold">
                {title}
              </h3>

              {subtitle && (
                <p className="mt-1 text-sm text-black/45">
                  {subtitle}
                </p>
              )}

            </div>

            {badge && (
              <div className="shrink-0">
                {badge}
              </div>
            )}

          </div>

          {meta && (
            <p className="mt-3 text-xs text-black/35">
              {meta}
            </p>
          )}

        </div>

        <ArrowRight
          size={16}
          className="
            mt-1
            shrink-0
            text-black/15
            transition-all
            duration-300
            group-hover:translate-x-1
            group-hover:text-black
          "
        />

      </div>

      {children && (
        <div className="mt-4">
          {children}
        </div>
      )}

    </div>
  );
}