import Skeleton from './Skeleton';

// High-end page-level skeleton matching MediLink layout (header line + stat cards + table rows)
export default function PageSkeleton() {
  return (
    <div className="space-y-6 page-fade-in">
      {/* Page Header placeholder */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-line/70">
        <div className="space-y-2">
          <Skeleton className="h-8 w-56 rounded-[6px]" />
          <Skeleton className="h-4 w-72" />
        </div>
        <Skeleton className="h-10 w-32 rounded-[6px]" />
      </div>

      {/* Overview Stat Cards placeholder */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="panel bg-surface p-5 sm:p-6 flex flex-col justify-between h-28"
          >
            <Skeleton className="h-3.5 w-24" />
            <Skeleton className="h-7 w-28" />
            <Skeleton className="h-3 w-16 opacity-60" />
          </div>
        ))}
      </div>

      {/* Main Table / Content Panel placeholder */}
      <div className="panel bg-surface p-5 sm:p-6 space-y-4 min-h-[400px]">
        <div className="flex items-center justify-between pb-3 border-b border-line/70">
          <Skeleton className="h-4 w-36" />
          <Skeleton className="h-8 w-48 rounded-[6px]" />
        </div>
        <div className="divide-y divide-line/60">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="py-3.5 flex items-center justify-between gap-4"
            >
              <div className="space-y-1.5 flex-1">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-3 w-1/4 opacity-60" />
              </div>
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-6 w-24 rounded-full" />
              <Skeleton className="h-8 w-16 rounded-[6px]" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
