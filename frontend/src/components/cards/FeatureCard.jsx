import {
  ArrowRight,
} from 'lucide-react';

import { Link } from 'react-router-dom';

export default function FeatureCard({
  title,
  description,
  icon: Icon,
  to,
  eyebrow,
  accent = false,
}) {
  return (
    <Link
      to={to}
      className="
        group
        relative
        block
        overflow-hidden
        rounded-[1.75rem]
        border
        border-black/[0.08]
        bg-white
        p-7
        shadow-[0_10px_35px_rgba(0,0,0,0.04)]
        transition-all
        duration-300
        ease-out
        hover:-translate-y-1
        hover:border-black/[0.14]
        hover:shadow-[0_20px_55px_rgba(0,0,0,0.08)]
      "
    >


      <div className="relative z-10">

        <div className="flex items-start justify-between gap-4">

          <div
            className="
              flex
              h-14
              w-14
              items-center
              justify-center
              rounded-2xl
              border
              border-black/[0.05]
              bg-[#f4f1ea]
              text-[#375b32]
              transition-transform
              duration-300
              group-hover:scale-105
            "
          >
            <Icon size={28} strokeWidth={1.7} />
          </div>

          <div
            className="
              flex
              h-9
              w-9
              items-center
              justify-center
              rounded-full
              border
              border-black/[0.06]
              text-black/20
              transition-all
              duration-300
              group-hover:translate-x-1
              group-hover:text-black
            "
          >
            <ArrowRight size={16} />
          </div>

        </div>

        {eyebrow && (
          <p className="mt-7 fb-eyebrow">
            {eyebrow}
          </p>
        )}

        <h2
          className="
            mt-2
            text-2xl
            font-semibold
            tracking-[-0.035em]
          "
        >
          {title}
        </h2>

        <p
          className="
            mt-3
            text-sm
            leading-7
            text-black/45
          "
        >
          {description}
        </p>

        <div
          className="
            mt-7
            inline-flex
            items-center
            gap-2
            text-sm
            font-semibold
            text-[#375b32]
          "
        >
          Compare options
          <ArrowRight
            size={15}
            className="
              transition-transform
              duration-300
              group-hover:translate-x-1
            "
          />
        </div>

      </div>

    </Link>
  );
}