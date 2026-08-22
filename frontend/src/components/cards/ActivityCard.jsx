import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  FileText,
} from 'lucide-react';

const statusMap = {
  success: {
    label: 'Completed',
    className: 'bg-[#dcebd8] text-[#375b32]',
    icon: CheckCircle2,
  },

  pending: {
    label: 'Pending',
    className: 'bg-[#fff4d8] text-[#8b6a18]',
    icon: Clock3,
  },

  default: {
    label: 'Activity',
    className: 'bg-black/5 text-black/50',
    icon: FileText,
  },
};

export default function ActivityCard({
  title,
  subtitle,
  date,
  status = 'default',
  to = '#',
}) {
  const config = statusMap[status] || statusMap.default;

  const StatusIcon = config.icon;

  return (
    <a
      href={to}
      className="
        group
        flex items-center gap-4
        rounded-2xl
        border border-black/[0.07]
        bg-white
        p-4
        transition-all duration-300 ease-out
        hover:-translate-y-0.5
        hover:border-black/[0.14]
        hover:shadow-[0_15px_35px_rgba(0,0,0,0.06)]
      "
    >
      <div
        className="
          flex h-11 w-11 shrink-0
          items-center justify-center
          rounded-xl
          bg-[#f4f1ea]
        "
      >
        <StatusIcon
          size={18}
          className="text-[#375b32]"
        />
      </div>

      <div className="min-w-0 flex-1">

        <p className="truncate text-sm font-semibold">
          {title}
        </p>

        <p className="mt-1 truncate text-xs text-black/40">
          {subtitle}
        </p>

        <p className="mt-2 text-[11px] font-medium text-black/30">
          {date}
        </p>

      </div>

      <div className="flex items-center gap-3">

        <span
          className={[
            'rounded-full px-2.5 py-1 text-[10px] font-bold',
            config.className,
          ].join(' ')}
        >
          {config.label}
        </span>

        <ArrowRight
          size={15}
          className="
            text-black/20
            transition-all duration-300
            group-hover:translate-x-1
            group-hover:text-black
          "
        />

      </div>
    </a>
  );
}