import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, ArrowUpRight } from 'lucide-react';

// Live deduction simulation illustrating stock changes prior to accepting an order
export default function StockImpactPanel({ items = [], catalogListings = [], onImpactCalculated }) {
  let hasShortage = false;

  const deductions = items.map((item) => {
    const medId = item.medicine?._id || item.medicine;
    const listing = catalogListings.find(
      (l) => (l.medicine?._id || l.medicine) === medId
    );

    const currentStock = listing ? listing.stock : 0;
    const orderedQty = item.quantity || 0;
    const remainingStock = currentStock - orderedQty;
    const isShort = remainingStock < 0;

    if (isShort) hasShortage = true;

    return {
      medicineName: item.medicine?.name || 'Medicine',
      strength: item.medicine?.strength || '',
      orderedQty,
      currentStock,
      remainingStock,
      isShort,
    };
  });

  useEffect(() => {
    onImpactCalculated?.(hasShortage);
  }, [hasShortage, onImpactCalculated]);

  return (
    <div className="panel p-3.5 bg-paper/60 border border-line space-y-2.5 text-xs">
      <div className="flex items-center justify-between pb-1.5 border-b border-line">
        <span className="text-[13px] font-sans font-medium text-ink">
          Stock impact preview
        </span>
        <span className="caption text-ink-soft">Simulation on accept</span>
      </div>

      <div className="divide-y divide-line">
        {deductions.map((d, i) => (
          <div
            key={i}
            className={`py-2 px-1 flex items-center justify-between transition-colors ${
              d.isShort ? 'text-status-expired bg-status-expired-bg/40 rounded' : 'text-ink'
            }`}
          >
            <div>
              <p className="font-medium text-[13px]">
                {d.medicineName} <span className="text-ink-soft text-[11px]">({d.strength})</span>
              </p>
              {d.isShort && (
                <span className="text-[11px] font-sans font-medium text-status-expired">
                  Not enough stock
                </span>
              )}
            </div>

            <div className="text-right font-sans tabular-nums text-[12px]">
              <div>
                Ordered: <strong className="font-semibold">{d.orderedQty}</strong> • Available: <strong className="font-semibold">{d.currentStock}</strong>
              </div>
              <div className={d.isShort ? 'text-status-expired font-medium' : 'text-ink-soft'}>
                After accept: {d.remainingStock} units
              </div>
            </div>
          </div>
        ))}
      </div>

      {hasShortage && (
        <div className="pt-2 border-t border-line text-status-expired flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[11px]">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>Update your stock first, or reject this order.</span>
          </div>
          <Link
            to="/supplier/catalog"
            className="text-[11px] font-medium text-brand hover:underline inline-flex items-center"
          >
            Go to catalog <ArrowUpRight className="w-3 h-3" />
          </Link>
        </div>
      )}
    </div>
  );
}
