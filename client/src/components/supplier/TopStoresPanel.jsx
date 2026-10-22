import { formatINR } from '../../utils/format';

// Ranked listing of top-ordering pharmacy clients with proportional volume progress indicator
export default function TopStoresPanel({ stores = [] }) {
  const topList = stores.slice(0, 5);
  const maxSpend = Math.max(1, ...topList.map((s) => s.totalSpent || 0));

  return (
    <div className="panel bg-surface p-6 space-y-4">
      <div className="flex items-baseline justify-between pb-2 border-b border-line">
        <h3 className="panel-title text-ink">Top purchasing stores</h3>
        <span className="caption text-ink-soft">By total volume</span>
      </div>

      {topList.length === 0 ? (
        <p className="caption text-ink-soft text-center py-6">
          No store order history recorded yet.
        </p>
      ) : (
        <div className="space-y-2.5">
          {topList.map((store, idx) => {
            const pct = Math.min(100, Math.round(((store.totalSpent || 0) / maxSpend) * 100));

            return (
              <div
                key={store.storeId || idx}
                className="relative p-3 rounded-[6px] border border-line overflow-hidden text-[14px] bg-surface"
              >
                {/* Thin proportional bar behind each row */}
                <div
                  style={{ width: `${pct}%` }}
                  className="absolute inset-y-0 left-0 bg-brand-soft/30 transition-all duration-300"
                />

                <div className="relative flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="font-sans tabular-nums text-xs font-semibold text-brand w-5">
                      #{idx + 1}
                    </span>
                    <div className="truncate">
                      <p className="font-medium text-ink truncate text-[14px]">
                        {store.businessName}
                      </p>
                      <p className="text-[12px] text-ink-soft">{store.city || 'Gujarat'}</p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <p className="font-sans tabular-nums font-semibold text-ink text-[14px]">{formatINR(store.totalSpent)}</p>
                    <p className="text-[12px] font-sans tabular-nums text-ink-soft">{store.ordersCount} orders</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
