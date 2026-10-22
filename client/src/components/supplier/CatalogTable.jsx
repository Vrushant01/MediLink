import ExpiryBadge from '../ExpiryBadge';
import Skeleton from '../Skeleton';
import EmptyState from '../EmptyState';
import InlineEditCell from './InlineEditCell';
import { formatINR, formatDate } from '../../utils/format';
import { MoreHorizontal, Edit2, Trash2 } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

function CatalogRowMenu({ onEdit, onDelete }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleOutside = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    if (open) document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [open]);

  return (
    <div className="relative inline-block text-left" ref={ref}>
      <button type="button" onClick={() => setOpen((p) => !p)} className="w-7 h-7 rounded border border-transparent hover:border-line hover:bg-paper flex items-center justify-center text-ink-soft hover:text-ink">
        <MoreHorizontal className="w-3.5 h-3.5" />
      </button>
      {open && (
        <div className="absolute right-0 mt-1 w-28 bg-surface border border-line rounded-[6px] shadow-soft z-20 py-1 text-xs divide-y divide-line">
          <button type="button" onClick={() => { setOpen(false); onEdit(); }} className="w-full text-left px-3 py-1.5 flex items-center gap-1.5 hover:bg-paper text-ink font-medium">
            <Edit2 className="w-3 h-3 text-ink-soft" /> Edit batch
          </button>
          <button type="button" onClick={() => { setOpen(false); onDelete(); }} className="w-full text-left px-3 py-1.5 flex items-center gap-1.5 text-status-expired hover:bg-status-expired-bg/40 font-medium">
            <Trash2 className="w-3 h-3" /> Delete
          </button>
        </div>
      )}
    </div>
  );
}

// Wholesale inventory catalog table supporting click-to-edit inline updates and batch management
export default function CatalogTable({
  items = [],
  loading,
  isRefetching = false,
  onInlineUpdate,
  onEditBatch,
  onDeleteBatch,
  isFiltered,
  onResetFilters,
  onAddListing,
}) {
  if (loading) {
    return (
      <div className="panel bg-surface overflow-x-auto min-h-[520px]">
        <table className="w-full text-left border-collapse text-xs table-fixed min-w-[760px]">
          <colgroup>
            <col className="w-[32%]" />
            <col className="w-[22%]" />
            <col className="w-[14%]" />
            <col className="w-[12%]" />
            <col className="w-[12%]" />
            <col className="w-[8%]" />
          </colgroup>
          <thead>
            <tr className="border-b border-line bg-paper/60 text-ink-soft uppercase text-[12px] font-sans font-medium tracking-[0.04em] h-10">
              <th className="py-2.5 px-4">Medicine</th>
              <th className="py-2.5 px-4">Batch & Expiry</th>
              <th className="py-2.5 px-4">Price per unit</th>
              <th className="py-2.5 px-4">Stock</th>
              <th className="py-2.5 px-4">Min Order</th>
              <th className="py-2.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line/70">
            {Array.from({ length: 6 }).map((_, i) => (
              <tr key={i} className="h-16">
                <td className="py-3 px-4">
                  <div className="space-y-1.5">
                    <Skeleton className="h-4 w-44" />
                    <Skeleton className="h-3 w-32 opacity-60" />
                  </div>
                </td>
                <td className="py-3 px-4">
                  <div className="space-y-1.5">
                    <Skeleton className="h-3.5 w-24" />
                    <Skeleton className="h-5 w-24 rounded-[6px]" />
                  </div>
                </td>
                <td className="py-3 px-4">
                  <Skeleton className="h-4 w-16" />
                </td>
                <td className="py-3 px-4">
                  <Skeleton className="h-4 w-12" />
                </td>
                <td className="py-3 px-4">
                  <Skeleton className="h-4 w-12" />
                </td>
                <td className="py-3 px-4 text-right">
                  <Skeleton className="h-7 w-7 ml-auto rounded-[6px]" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="panel bg-surface min-h-[520px] flex items-center justify-center p-8">
        <EmptyState
          title={isFiltered ? 'No matching listings' : 'No listings yet'}
          description={
            isFiltered
              ? 'Try adjusting your keyword search or segmented filter.'
              : 'Add your first medicine so stores can find it.'
          }
          actionLabel={isFiltered ? 'Clear filters' : 'Add listing'}
          onAction={isFiltered ? onResetFilters : onAddListing}
        />
      </div>
    );
  }

  return (
    <div className={`panel bg-surface overflow-x-auto min-h-[520px] flex flex-col justify-between transition-opacity duration-150 ${isRefetching ? 'opacity-60 pointer-events-none' : 'opacity-100'}`}>
      <table className="w-full text-left border-collapse text-xs table-fixed">
        <colgroup>
          <col className="w-[32%]" />
          <col className="w-[22%]" />
          <col className="w-[14%]" />
          <col className="w-[12%]" />
          <col className="w-[12%]" />
          <col className="w-[8%]" />
        </colgroup>
        <thead>
          <tr className="border-b border-line bg-paper/60 text-ink-soft uppercase text-[12px] font-sans font-medium tracking-[0.04em] h-10">
            <th className="py-2.5 px-4">Medicine</th>
            <th className="py-2.5 px-4">Batch & Expiry</th>
            <th className="py-2.5 px-4">Price per unit</th>
            <th className="py-2.5 px-4">Stock</th>
            <th className="py-2.5 px-4">Min Order</th>
            <th className="py-2.5 px-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {items.map((item) => (
            <tr key={item._id} className="hover:bg-paper/30 transition-colors h-14">
              <td className="py-3 px-4">
                <div className="font-medium text-ink text-[14px]">{item.medicine?.name}</div>
                <div className="text-ink-soft text-[12px]">
                  {item.medicine?.genericName} • {item.medicine?.strength}
                </div>
              </td>

              <td className="py-3 px-4">
                <div className="font-mono text-ink text-[13px] font-medium">{item.batchNo || '—'}</div>
                <ExpiryBadge status={item.expiryStatus} daysLeft={item.daysLeft} />
              </td>

              <td className="py-3 px-4 font-sans tabular-nums text-[14px]">
                <InlineEditCell
                  value={item.price}
                  min={0.01}
                  step="0.01"
                  format={(val) => formatINR(val)}
                  onSave={(newPrice) => onInlineUpdate(item._id, { price: newPrice })}
                />
              </td>

              <td className="py-3 px-4 font-sans tabular-nums text-[14px]">
                <InlineEditCell
                  value={item.stock}
                  min={0}
                  step="1"
                  showStockBadges
                  onSave={(newStock) => onInlineUpdate(item._id, { stock: newStock })}
                />
              </td>

              <td className="py-3 px-4 font-sans tabular-nums text-[14px]">
                <InlineEditCell value={item.minOrderQty} min={1} step="1" onSave={(newMoq) => onInlineUpdate(item._id, { minOrderQty: newMoq })} />
              </td>
              <td className="py-3 px-4 text-right">
                <CatalogRowMenu onEdit={() => onEditBatch(item)} onDelete={() => onDeleteBatch(item)} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
