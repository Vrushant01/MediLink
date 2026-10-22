import Button from '../Button';
import { formatINR } from '../../utils/format';
import { ShieldCheck, ShoppingBag } from 'lucide-react';

// Desktop sticky summary panel calculating aggregate procurement totals and triggering batched checkout
export default function CartSummaryPanel({
  supplierCount,
  itemCount,
  grandTotal,
  submitting,
  onPlaceOrder,
}) {
  const btnLabel =
    supplierCount > 1 ? `Place ${supplierCount} orders` : 'Place order';

  return (
    <div className="panel bg-surface p-6 space-y-5 sticky top-24">
      <h3 className="panel-title text-ink pb-3 border-b border-line">
        Order summary
      </h3>

      <div className="space-y-2.5 text-[14px]">
        <div className="flex items-center justify-between text-ink-soft">
          <span>Suppliers:</span>
          <span className="font-sans tabular-nums text-ink font-medium">{supplierCount}</span>
        </div>
        <div className="flex items-center justify-between text-ink-soft">
          <span>Total items:</span>
          <span className="font-sans tabular-nums text-ink font-medium">{itemCount} units</span>
        </div>
      </div>

      <div className="pt-3 border-t border-line flex items-center justify-between">
        <span className="text-[14px] font-sans font-medium text-ink-soft">
          Grand total:
        </span>
        <span className="font-display font-medium text-[26px] text-ink tabular-nums">
          {formatINR(grandTotal)}
        </span>
      </div>

      <div className="pt-2 space-y-2">
        <Button
          variant="accent"
          size="lg"
          className="w-full justify-center"
          loading={submitting}
          disabled={supplierCount === 0 || submitting}
          onClick={onPlaceOrder}
        >
          <ShoppingBag className="w-4 h-4 mr-2" />
          {btnLabel}
        </Button>
        <p className="text-[11px] text-ink-soft text-center">
          Each supplier receives a separate order.
        </p>
      </div>

      <div className="pt-3 border-t border-line text-[11px] text-ink-soft flex items-center gap-1.5 justify-center">
        <ShieldCheck className="w-3.5 h-3.5 text-brand" />
        <span>Verified drug license B2B trade</span>
      </div>
    </div>
  );
}
