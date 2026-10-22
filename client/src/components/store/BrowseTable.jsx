import { useState } from 'react';
import ExpiryBadge from '../ExpiryBadge';
import Skeleton from '../Skeleton';
import EmptyState from '../EmptyState';
import QuantityStepper from './QuantityStepper';
import useCart from '../../context/CartContext';
import { formatINR } from '../../utils/format';
import { Check, Layers } from 'lucide-react';

// Dense catalog listing table displaying supplier offers, expiry runway, and quick addition controls
export default function BrowseTable({
  items = [],
  loading,
  isRefetching = false,
  onCompare,
  isFiltered,
  onResetFilters,
}) {
  const { items: cartItems, addItem, updateQuantity } = useCart();
  const [localQuantities, setLocalQuantities] = useState({});

  if (loading) {
    return (
      <div className="panel bg-surface divide-y divide-line overflow-hidden min-h-[520px]">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="p-4 flex items-center justify-between">
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-5 w-16" />
            <Skeleton className="h-5 w-16" />
            <Skeleton className="h-7 w-28" />
          </div>
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="panel bg-surface min-h-[520px] flex items-center justify-center p-8">
        <EmptyState
          title="No listings match your search"
          description="Try adjusting your keyword, category, or supplier filter."
          actionLabel={isFiltered ? 'Clear filters' : undefined}
          onAction={onResetFilters}
        />
      </div>
    );
  }

  const handleQtyChange = (item, qty) => {
    setLocalQuantities((prev) => ({ ...prev, [item._id]: qty }));
    const inCart = cartItems.find((c) => c.catalogId === item._id);
    if (inCart) {
      updateQuantity(item._id, qty);
    }
  };

  const handleAddToCart = (item) => {
    const qty = localQuantities[item._id] || item.minOrderQty || 1;
    addItem({
      catalogId: item._id,
      medicineId: item.medicine?._id,
      medicineName: item.medicine?.name,
      genericName: item.medicine?.genericName,
      strength: item.medicine?.strength,
      supplierId: item.supplier?._id,
      supplierName: item.supplier?.businessName || item.supplier?.name,
      supplierCity: item.supplier?.city,
      price: item.price,
      quantity: qty,
      minOrderQty: item.minOrderQty || 1,
      stock: item.stock,
      expiryDate: item.expiryDate,
      batchNo: item.batchNo,
      daysLeft: item.daysLeft,
      expiryStatus: item.expiryStatus,
    });
  };

  return (
    <div className={`panel bg-surface overflow-x-auto min-h-[520px] flex flex-col justify-between transition-opacity duration-150 ${isRefetching ? 'opacity-60 pointer-events-none' : 'opacity-100'}`}>
      <table className="w-full text-left border-collapse text-xs table-fixed">
        <colgroup>
          <col className="w-[30%]" />
          <col className="w-[20%]" />
          <col className="w-[20%]" />
          <col className="w-[12%]" />
          <col className="w-[8%]" />
          <col className="w-[10%]" />
        </colgroup>
        <thead>
          <tr className="border-b border-line bg-paper/60 text-ink-soft uppercase text-[12px] font-sans font-medium tracking-[0.04em] h-10">
            <th className="py-2.5 px-4">Medicine</th>
            <th className="py-2.5 px-4">Supplier</th>
            <th className="py-2.5 px-4">Batch & Expiry</th>
            <th className="py-2.5 px-4 text-right">Price per unit</th>
            <th className="py-2.5 px-4 text-right">In stock</th>
            <th className="py-2.5 px-4 text-right">Add</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {items.map((item) => {
            const inCartItem = cartItems.find((c) => c.catalogId === item._id);
            const qty = inCartItem?.quantity || localQuantities[item._id] || item.minOrderQty || 1;
            const isShortShelfLife = item.daysLeft !== null && item.daysLeft < 180;

            return (
              <tr key={item._id} className="hover:bg-paper/30 transition-colors h-16">
                {/* 1. Medicine */}
                <td className="py-3 px-4">
                  <div className="font-medium text-ink text-[14px]">
                    {item.medicine?.name}
                  </div>
                  <div className="text-ink-soft text-[12px]">
                    {item.medicine?.genericName} • {item.medicine?.strength}
                  </div>
                  <button
                    type="button"
                    onClick={() => onCompare(item.medicine)}
                    className="text-[12px] text-brand hover:underline flex items-center gap-1 mt-1 font-medium"
                  >
                    <Layers className="w-3.5 h-3.5" /> Compare prices
                  </button>
                </td>

                {/* 2. Supplier */}
                <td className="py-3 px-4">
                  <div className="font-medium text-ink text-[14px]">
                    {item.supplier?.businessName || item.supplier?.name}
                  </div>
                  <div className="text-[12px] text-ink-soft">{item.supplier?.city}</div>
                </td>

                {/* 3. Batch and Expiry */}
                <td className="py-3 px-4">
                  <div className="font-mono text-ink text-[13px] font-medium">{item.batchNo || '—'}</div>
                  <div className="mt-1 flex items-center gap-1.5 flex-wrap">
                    <ExpiryBadge status={item.expiryStatus} daysLeft={item.daysLeft} />
                    {isShortShelfLife && (
                      <span className="text-[11px] font-sans px-1.5 py-0.5 rounded-[4px] bg-status-warning-bg text-status-warning font-medium">
                        Short shelf life
                      </span>
                    )}
                  </div>
                </td>

                {/* 4. Price & MOQ */}
                <td className="py-3 px-4 text-right">
                  <span className="font-sans tabular-nums font-semibold text-[15px] text-ink">
                    {formatINR(item.price)}
                  </span>
                  <div className="text-[12px] font-sans tabular-nums text-ink-soft">
                    MOQ {item.minOrderQty}
                  </div>
                </td>

                {/* 5. In stock */}
                <td className="py-3 px-4 text-right font-sans tabular-nums font-medium text-ink text-[14px]">
                  {item.stock}
                </td>

                {/* 6. Stepper & Add */}
                <td className="py-3 px-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <QuantityStepper
                      value={qty}
                      min={item.minOrderQty || 1}
                      max={item.stock}
                      onChange={(newQty) => handleQtyChange(item, newQty)}
                    />
                    <button
                      type="button"
                      onClick={() => handleAddToCart(item)}
                      className={`h-9 px-3 rounded-[6px] text-[13px] font-medium border transition-colors flex items-center gap-1.5 ${
                        inCartItem
                          ? 'border-brand/30 bg-brand-soft/40 text-brand'
                          : 'border-line bg-surface hover:bg-paper text-ink'
                      }`}
                    >
                      {inCartItem ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-brand" /> In cart
                        </>
                      ) : (
                        'Add'
                      )}
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
