import { formatINR } from '../../utils/format';

// Horizontal stacked progress bar illustrating the monetary distribution of stock across expiry risk categories
export default function ShelfHealthBar({ batches = [] }) {
  // Aggregate stock values across the 4 statuses
  let safeValue = 0;
  let warningValue = 0;
  let criticalValue = 0;
  let expiredValue = 0;

  batches.forEach((b) => {
    const qty = b.quantity || 0;
    const price = b.purchasePrice || 0;
    const val = qty * price;

    if (b.expiryStatus === 'expired') {
      expiredValue += val;
    } else if (b.expiryStatus === 'critical') {
      criticalValue += val;
    } else if (b.expiryStatus === 'warning') {
      warningValue += val;
    } else {
      safeValue += val;
    }
  });

  const totalValue = safeValue + warningValue + criticalValue + expiredValue;

  // Compute percentages
  const safePct = totalValue > 0 ? (safeValue / totalValue) * 100 : 100;
  const warningPct = totalValue > 0 ? (warningValue / totalValue) * 100 : 0;
  const criticalPct = totalValue > 0 ? (criticalValue / totalValue) * 100 : 0;
  const expiredPct = totalValue > 0 ? (expiredValue / totalValue) * 100 : 0;

  const segments = [
    { label: 'Safe (>90d)', color: 'bg-status-safe', dot: 'bg-status-safe', val: safeValue, pct: safePct },
    { label: 'Warning (31-90d)', color: 'bg-status-warning', dot: 'bg-status-warning', val: warningValue, pct: warningPct },
    { label: 'Critical (0-30d)', color: 'bg-status-critical', dot: 'bg-status-critical', val: criticalValue, pct: criticalPct },
    { label: 'Expired', color: 'bg-status-expired', dot: 'bg-status-expired', val: expiredValue, pct: expiredPct },
  ];

  return (
    <div className="panel p-5 sm:p-6 bg-surface">
      <div className="flex items-baseline justify-between gap-4 mb-4">
        <div>
          <h3 className="panel-title">Shelf health</h3>
          <p className="text-[13px] text-ink-soft mt-0.5">Inventory value distributed by remaining shelf life</p>
        </div>
        <div className="text-right shrink-0">
          <span className="text-[12px] font-sans text-ink-soft">
            Total value:{' '}
            <strong className="text-ink font-medium tabular-nums text-sm">{formatINR(totalValue)}</strong>
          </span>
        </div>
      </div>

      {/* 12px high stacked bar with 2px gap and 6px outer radius */}
      <div className="h-3 w-full rounded-[6px] overflow-hidden flex gap-0.5 bg-paper/60 p-0.5 border border-line">
        {totalValue === 0 ? (
          <div className="w-full h-full bg-ink/[0.06] rounded-[4px]" />
        ) : (
          <>
            {safePct > 0 && (
              <div
                style={{ width: `${safePct}%` }}
                className="h-full bg-status-safe rounded-[3px] transition-all duration-300"
                title={`Safe: ${formatINR(safeValue)} (${safePct.toFixed(1)}%)`}
              />
            )}
            {warningPct > 0 && (
              <div
                style={{ width: `${warningPct}%` }}
                className="h-full bg-status-warning rounded-[3px] transition-all duration-300"
                title={`Warning: ${formatINR(warningValue)} (${warningPct.toFixed(1)}%)`}
              />
            )}
            {criticalPct > 0 && (
              <div
                style={{ width: `${criticalPct}%` }}
                className="h-full bg-status-critical rounded-[3px] transition-all duration-300"
                title={`Critical: ${formatINR(criticalValue)} (${criticalPct.toFixed(1)}%)`}
              />
            )}
            {expiredPct > 0 && (
              <div
                style={{ width: `${expiredPct}%` }}
                className="h-full bg-status-expired rounded-[3px] transition-all duration-300"
                title={`Expired: ${formatINR(expiredValue)} (${expiredPct.toFixed(1)}%)`}
              />
            )}
          </>
        )}
      </div>

      {/* Legend in a 4-column grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-5 pt-4 border-t border-line">
        {segments.map((seg, i) => (
          <div key={i} className="flex flex-col">
            <div className="flex items-center gap-1.5 mb-1">
              <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${seg.dot}`} />
              <span className="text-[13px] font-sans font-medium text-ink">{seg.label}</span>
            </div>
            <div className="text-[14px] font-sans font-medium tabular-nums text-ink pl-3">
              {formatINR(seg.val)}
              <span className="text-[12px] font-sans text-ink-soft font-normal ml-1.5">
                ({seg.pct.toFixed(0)}%)
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
