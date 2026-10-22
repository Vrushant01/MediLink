// Calm page-level skeleton matching MediLink layout (header line + stat cards + table rows)
export default function PageSkeleton() {
  return (
    <div className="space-y-6">
      {/* Page Header placeholder */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-line">
        <div className="space-y-2">
          <div className="h-8 w-56 bg-ink/[0.06] rounded-[6px] animate-[pulse_1.6s_ease-in-out_infinite]" />
          <div className="h-4 w-40 bg-ink/[0.04] rounded-[4px] animate-[pulse_1.6s_ease-in-out_infinite]" />
        </div>
        <div className="h-10 w-28 bg-ink/[0.06] rounded-[6px] animate-[pulse_1.6s_ease-in-out_infinite]" />
      </div>

      {/* Overview Stat Cards placeholder */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-28 panel p-5 sm:p-6 flex flex-col justify-between animate-[pulse_1.6s_ease-in-out_infinite]"
          >
            <div className="h-3 w-20 bg-ink/[0.06] rounded-[4px]" />
            <div className="h-8 w-24 bg-ink/[0.08] rounded-[4px]" />
            <div className="h-3 w-16 bg-ink/[0.04] rounded-[4px]" />
          </div>
        ))}
      </div>

      {/* Main Table / Content Panel placeholder */}
      <div className="panel p-5 sm:p-6 space-y-4 min-h-[400px]">
        <div className="flex items-center justify-between pb-3 border-b border-line">
          <div className="h-4 w-32 bg-ink/[0.06] rounded-[4px] animate-[pulse_1.6s_ease-in-out_infinite]" />
          <div className="h-4 w-24 bg-ink/[0.04] rounded-[4px] animate-[pulse_1.6s_ease-in-out_infinite]" />
        </div>
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="h-12 bg-paper/40 border border-line rounded-[6px] flex items-center px-4 gap-4 animate-[pulse_1.6s_ease-in-out_infinite]"
          >
            <div className="h-3.5 bg-ink/[0.06] rounded-[4px] w-1/4" />
            <div className="h-3.5 bg-ink/[0.06] rounded-[4px] w-1/3" />
            <div className="h-3.5 bg-ink/[0.06] rounded-[4px] w-1/6 ml-auto" />
          </div>
        ))}
      </div>
    </div>
  );
}
