import ExpiryBadge from '../ExpiryBadge';
import { formatINR } from '../../utils/format';

// Reusable ordered items ledger table with batch expiries, quantities, unit prices, and total
export default function OrderItemsTable({ items = [], totalAmount }) {
  return (
    <div className="space-y-3">
      <h4 className="text-[13px] font-sans font-medium text-ink-soft">
        Ordered Items ({items.length})
      </h4>
      <div className="divide-y divide-line border border-line rounded-[6px] overflow-hidden">
        {items.map((item, idx) => (
          <div key={idx} className="p-3 bg-surface hover:bg-paper/30 transition-colors">
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="font-medium text-ink text-[14px]">{item.medicine?.name}</span>
                <div className="text-[12px] text-ink-soft">
                  {item.medicine?.strength} • Batch: <span className="font-mono text-[12px] font-medium text-ink">{item.batchNo || '—'}</span>
                </div>
              </div>
              <span className="font-sans tabular-nums text-ink font-semibold text-[14px]">
                {formatINR((item.price || 0) * (item.quantity || 0))}
              </span>
            </div>
            <div className="mt-1.5 flex items-center justify-between">
              <ExpiryBadge expiryDate={item.expiryDate} />
              <span className="font-sans tabular-nums text-ink-soft text-[12px]">
                {item.quantity} x {formatINR(item.price)}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Total Amount Footer */}
      <div className="pt-3 border-t border-line flex items-center justify-between">
        <span className="text-[13px] font-sans font-medium text-ink-soft">Total Amount</span>
        <span className="font-sans tabular-nums text-[16px] font-semibold text-ink">
          {formatINR(totalAmount)}
        </span>
      </div>
    </div>
  );
}
