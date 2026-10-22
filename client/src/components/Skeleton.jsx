// Clean, modern Skeleton component with smooth shimmer wave matching MediLink aesthetic
export default function Skeleton({ className = '', rows, ...props }) {
  if (rows && rows > 1) {
    return (
      <div className={`space-y-2.5 ${className}`}>
        {Array.from({ length: rows }).map((_, i) => (
          <div
            key={i}
            className="h-4 skeleton-shimmer rounded-[4px]"
            style={{ width: `${Math.max(45, 100 - (i % 3) * 18)}%` }}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className={`skeleton-shimmer rounded-[4px] shrink-0 ${className}`}
      {...props}
    />
  );
}
