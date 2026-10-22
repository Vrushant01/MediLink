// KPI card panel featuring 13px Geist 500 label, 36px Fraunces tabular value, and optional status top border
export default function StatCard({
  label,
  value,
  hint,
  status,
  className = '',
}) {
  let topBorderClass = '';
  if (status === 'critical' || status === 'expiring') {
    topBorderClass = 'border-t-[3px] border-t-status-critical';
  } else if (status === 'warning') {
    topBorderClass = 'border-t-[3px] border-t-status-warning';
  } else if (status === 'reorder' || status === 'accent') {
    topBorderClass = 'border-t-[3px] border-t-accent';
  }

  return (
    <div
      className={`panel p-5 sm:p-6 flex flex-col justify-between transition-colors ${topBorderClass} ${className}`}
    >
      <span className="block text-[13px] font-sans font-medium text-ink-soft mb-2">
        {label}
      </span>

      <div className="stat-value my-1">
        {value}
      </div>

      {hint && (
        <p className="text-[12px] font-sans font-normal text-ink-soft mt-1.5">
          {hint}
        </p>
      )}
    </div>
  );
}
