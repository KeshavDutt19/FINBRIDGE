export default function CardSkeleton() {
  return (
    <div className="animate-pulse rounded-[1.5rem] border border-black/[0.06] bg-white p-6">

      <div className="h-11 w-11 rounded-xl bg-black/5" />

      <div className="mt-7 h-10 w-24 rounded-lg bg-black/5" />

      <div className="mt-3 h-4 w-32 rounded bg-black/5" />

      <div className="mt-2 h-3 w-48 rounded bg-black/5" />

    </div>
  );
}