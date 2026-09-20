export default function SkeletonScoreCard() {
  return (
    <div className="w-full max-w-2xl animate-pulse rounded-xl border border-hairline bg-surface overflow-hidden">
      <div className="flex items-center gap-4 border-b border-hairline p-6">
        <div className="h-16 w-16 rounded-lg bg-surface2" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-32 rounded bg-surface2" />
          <div className="h-3 w-20 rounded bg-surface2" />
        </div>
        <div className="space-y-2 text-right">
          <div className="ml-auto h-8 w-14 rounded bg-surface2" />
          <div className="ml-auto h-5 w-16 rounded bg-surface2" />
        </div>
      </div>
      <div className="space-y-4 p-6">
        <div className="h-3 w-64 rounded bg-surface2" />
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="h-3 w-32 rounded bg-surface2" />
            <div className="h-2 flex-1 rounded-full bg-surface2" />
            <div className="h-3 w-8 rounded bg-surface2" />
          </div>
        ))}
      </div>
    </div>
  );
}