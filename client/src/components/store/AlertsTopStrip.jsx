import { formatINR } from '../../utils/format';

// Compact top strip displaying 4 core alert metrics separated by 1px dividers
export default function AlertsTopStrip({ summary }) {
  const expiredCount = summary?.expiredCount || 0;
  const expiring90Days = (summary?.criticalCount || 0) + (summary?.warningCount || 0);
  const lowStockCount = summary?.lowStockCount || 0;
  const valueAtRisk = summary?.valueAtRisk || 0;

  const stats = [
    { label: 'Expired', value: expiredCount, isDanger: expiredCount > 0 },
    { label: 'Expiring in 90 days', value: expiring90Days, isWarning: expiring90Days > 0 },
    { label: 'Below reorder level', value: lowStockCount, isWarning: lowStockCount > 0 },
    { label: 'Value at risk', value: formatINR(valueAtRisk), isMono: true },
  ];

  return (
    <div className="panel bg-surface grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-line">
      {stats.map((stat, i) => (
        <div key={i} className="p-5 flex flex-col justify-between">
          <span className="text-[13px] font-sans font-medium text-ink-soft mb-1.5">{stat.label}</span>
          <span
            className={`text-[32px] font-display font-medium tracking-[-0.01em] tabular-nums leading-none ${
              stat.isDanger
                ? 'text-status-expired font-semibold'
                : stat.isWarning
                ? 'text-status-critical font-medium'
                : 'text-ink'
            }`}
          >
            {stat.value}
          </span>
        </div>
      ))}
    </div>
  );
}
