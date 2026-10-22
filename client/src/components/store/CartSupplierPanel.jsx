import ExpiryBadge from '../ExpiryBadge';
import QuantityStepper from './QuantityStepper';
import Textarea from '../Textarea';
import { formatINR } from '../../utils/format';
import { Trash2, AlertCircle } from 'lucide-react';

// Supplier order group panel displaying draft order lines, live stock clamps, notes, and supplier subtotals
export default function CartSupplierPanel({
  supplierGroup,
  note = '',
  onNoteChange,
  error = '',
  onUpdateQty,
  onRemoveItem,
}) {
  const { supplierName, supplierCity, items = [], subtotal = 0 } = supplierGroup;

  return (
    <div className="panel bg-surface p-5 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-line">
        <div>
          <h2 className="panel-title text-[18px] text-ink">{supplierName}</h2>
          <span className="caption text-ink-soft">{supplierCity || 'Wholesale Supplier'}</span>
        </div>
        <div className="text-right">
          <span className="text-[13px] font-sans font-medium text-ink-soft block">Supplier Subtotal</span>
          <span className="font-sans tabular-nums text-[16px] font-semibold text-ink">
            {formatINR(subtotal)}
          </span>
        </div>
      </div>

      {/* Server error message box if order placement failed */}
      {error && (
        <div className="p-3 rounded-[6px] border border-[#F5C2BC] bg-status-expired-bg/40 text-status-expired text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Table of items */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-[14px]">
          <thead>
            <tr className="border-b border-line bg-paper/60 text-ink-soft uppercase text-[12px] font-sans font-medium tracking-[0.04em] h-10">
              <th className="py-2.5 px-3">Medicine</th>
              <th className="py-2.5 px-3">Batch & Expiry</th>
              <th className="py-2.5 px-3 text-right">Price</th>
              <th className="py-2.5 px-3 text-center">Quantity</th>
              <th className="py-2.5 px-3 text-right">Line Total</th>
              <th className="py-2.5 px-3 text-right w-10"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {items.map((item) => {
              const lineTotal = (item.price || 0) * (item.quantity || 0);
              const monthsLeft = item.daysLeft !== null ? Math.max(1, Math.round(item.daysLeft / 30)) : null;
              const isShortShelfLife = item.daysLeft !== null && item.daysLeft < 180;

              return (
                <tr key={item.catalogId} className="hover:bg-paper/30 transition-colors h-14">
                  <td className="py-3 px-3">
                    <div className="font-medium text-ink text-[14px]">{item.medicineName}</div>
                    <div className="text-[12px] text-ink-soft">
                      {item.genericName} • {item.strength}
                    </div>
                  </td>

                  <td className="py-3 px-3">
                    <div className="font-mono text-[13px] text-ink font-medium">{item.batchNo || '—'}</div>
                    <div className="mt-0.5 flex items-center gap-1.5 flex-wrap">
                      <ExpiryBadge status={item.expiryStatus} daysLeft={item.daysLeft} />
                      {isShortShelfLife && (
                        <span className="text-[11px] font-sans text-status-warning bg-status-warning-bg px-1.5 py-0.5 rounded-[4px] font-medium">
                          Only {monthsLeft} months of shelf life
                        </span>
                      )}
                    </div>
                  </td>

                  <td className="py-3 px-3 text-right font-sans tabular-nums text-ink text-[14px]">
                    {formatINR(item.price)}
                  </td>

                  <td className="py-3 px-3 text-center">
                    <div className="inline-block">
                      <QuantityStepper
                        value={item.quantity}
                        min={item.minOrderQty || 1}
                        max={item.stock}
                        onChange={(qty) => onUpdateQty(item.catalogId, qty)}
                      />
                      <div className="text-[11px] font-sans tabular-nums text-ink-soft mt-0.5">
                        Max {item.stock}
                      </div>
                    </div>
                  </td>

                  <td className="py-3 px-3 text-right font-sans tabular-nums font-semibold text-ink text-[14px]">
                    {formatINR(lineTotal)}
                  </td>

                  <td className="py-3 px-3 text-right">
                    <button
                      type="button"
                      onClick={() => onRemoveItem(item.catalogId)}
                      className="text-ink-soft hover:text-status-expired p-1.5 rounded transition-colors"
                      title="Remove item"
                      aria-label="Remove item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Supplier Note Input */}
      <div>
        <Textarea
          id={`note-${supplierGroup.supplierId}`}
          label="Note for this supplier (optional)"
          value={note}
          onChange={(e) => onNoteChange(e.target.value)}
          placeholder="e.g. Urgent delivery required by Friday; call store manager on dispatch"
          rows={2}
        />
      </div>
    </div>
  );
}
