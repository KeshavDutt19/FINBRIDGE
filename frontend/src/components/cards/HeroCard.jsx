import { ArrowRight, Sparkles } from 'lucide-react';

export default function HeroCard({
  eyebrow = 'FINBRIDGE',
  title,
  description,
  buttonText,
  onClick,
}) {
  return (
    <section
      className="
        group
        relative
        overflow-hidden
        rounded-[2rem]
        border border-[#11110f]
        bg-[#11110f]
        p-7
        text-white
        shadow-[0_25px_70px_rgba(0,0,0,0.15)]
        transition-all duration-500
        hover:-translate-y-1
        sm:p-9
      "
    >
      <div
        className="
          pointer-events-none
          absolute
          -right-20
          -top-20
          h-72
          w-72
          rounded-full
          bg-[#d7ee82]/15
          blur-[80px]
          transition duration-700
          group-hover:bg-[#d7ee82]/25
        "
      />

      <div
        className="
          pointer-events-none
          absolute
          -bottom-32
          left-1/3
          h-56
          w-56
          rounded-full
          bg-[#dcebd8]/10
          blur-[80px]
        "
      />

      <div className="relative z-10 max-w-2xl">

        <div className="flex items-center gap-2 text-[#d7ee82]">
          <Sparkles size={15} />

          <span className="text-[11px] font-bold uppercase tracking-[0.2em]">
            {eyebrow}
          </span>
        </div>

        <h2
          className="
            mt-5
            max-w-xl
            text-3xl
            font-semibold
            tracking-[-0.05em]
            sm:text-4xl
          "
        >
          {title}
        </h2>

        <p className="mt-4 max-w-xl text-sm leading-7 text-white/45">
          {description}
        </p>

        <button
          onClick={onClick}
          className="
            mt-8
            inline-flex
            items-center
            gap-2
            rounded-full
            bg-[#d7ee82]
            px-5 py-3
            text-sm font-bold
            text-[#11110f]
            transition-all duration-300
            hover:-translate-y-0.5
            hover:bg-white
          "
        >
          {buttonText}

          <ArrowRight
            size={16}
            className="
              transition-transform duration-300
              group-hover:translate-x-1
            "
          />
        </button>

      </div>
    </section>
  );
}