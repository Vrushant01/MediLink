// Soft ink skeleton rows loader: ink at 6% opacity, 6px radius, slow 1.6s opacity pulse
export default function Skeleton({ rows = 4, className = '' }) {
  return (
    <div className={`space-y-3 ${className}`}>
      {Array.from({ length: rows }).map((_, index) => (
        <div
          key={index}
          className="h-12 bg-surface border border-line rounded-[6px] flex items-center px-4 gap-4 animate-[pulse_1.6s_ease-in-out_infinite]"
        >
          <div className="h-3.5 bg-ink/[0.06] rounded-[4px] w-1/4" />
          <div className="h-3.5 bg-ink/[0.06] rounded-[4px] w-1/3" />
          <div className="h-3.5 bg-ink/[0.06] rounded-[4px] w-1/6 ml-auto" />
        </div>
      ))}
    </div>
  );
}
