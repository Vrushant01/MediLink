import ExpiryBadge from '../ExpiryBadge';
import Badge from '../Badge';
import RowMenu from './RowMenu';
import Skeleton from '../Skeleton';
import EmptyState from '../EmptyState';
import { formatDate, formatINR } from '../../utils/format';

const getBorderColor = (status) => {
  switch (status) {
    case 'expired':
      return 'border-l-status-expired';
    case 'critical':
      return 'border-l-status-critical';
    case 'warning':
      return 'border-l-status-warning';
    case 'safe':
    default:
      return 'border-l-status-safe';
  }
};

// Main store inventory table rendering batches with expiry statuses, pricing, and contextual actions
export default function InventoryTable({
  items = [],
  loading,
  isRefetching = false,
  isFiltered,
  onResetFilters,
  onAddBatch,
  onSell,
  onEdit,
  onDelete,
}) {
  if (loading) {
    return (
      <div className="panel bg-surface overflow-x-auto min-h-[520px]">
        <table className="w-full text-left border-collapse text-xs table-fixed min-w-[760px]">
          <colgroup>
            <col className="w-[32%]" />
            <col className="w-[18%]" />
            <col className="w-[8%]" />
            <col className="w-[20%]" />
            <col className="w-[14%]" />
            <col className="w-[8%]" />
          </colgroup>
          <thead>
            <tr className="border-b border-line bg-paper/60 text-ink-soft uppercase font-sans text-[12px] font-medium tracking-[0.04em] h-10">
              <th className="py-2.5 px-4">Medicine</th>
              <th className="py-2.5 px-4">Batch & Rack</th>
              <th className="py-2.5 px-4 text-right">Qty</th>
              <th className="py-2.5 px-4">Expiry Date</th>
              <th className="py-2.5 px-4">Cost / MRP</th>
              <th className="py-2.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line/70">
            {Array.from({ length: 8 }).map((_, i) => (
              <tr key={i} className="h-16">
                <td className="py-3 px-4">
                  <div className="space-y-1.5">
                    <Skeleton className="h-4 w-44" />
                    <Skeleton className="h-3 w-28 opacity-60" />
                  </div>
                </td>
                <td className="py-3 px-4">
                  <div className="space-y-1">
                    <Skeleton className="h-3.5 w-24" />
                    <Skeleton className="h-3 w-16 opacity-60" />
                  </div>
                </td>
                <td className="py-3 px-4 text-right">
                  <Skeleton className="h-4 w-10 ml-auto" />
                </td>
                <td className="py-3 px-4">
                  <div className="space-y-1.5">
                    <Skeleton className="h-3.5 w-24" />
                    <Skeleton className="h-5 w-28 rounded-[6px]" />
                  </div>
                </td>
                <td className="py-3 px-4">
                  <div className="space-y-1">
                    <Skeleton className="h-3.5 w-16" />
                    <Skeleton className="h-3 w-20 opacity-60" />
                  </div>
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
    if (isFiltered) {
      return (
        <div className="panel bg-surface min-h-[520px] flex items-center justify-center p-8">
          <EmptyState
            title="No matching batches"
            description="Try adjusting your search keyword, category, or status filter."
            actionLabel="Clear filters"
            onAction={onResetFilters}
          />
        </div>
      );
    }
    return (
      <div className="panel bg-surface min-h-[520px] flex items-center justify-center p-8">
        <EmptyState
          title="Inventory is empty"
          description="Add your first medicine batch to start managing inventory and expiry tracking."
          actionLabel="Add your first batch"
          onAction={onAddBatch}
        />
      </div>
    );
  }

  return (
    <div className={`panel bg-surface overflow-x-auto min-h-[520px] flex flex-col justify-between transition-opacity duration-150 ${isRefetching ? 'opacity-60 pointer-events-none' : 'opacity-100'}`}>
      <table className="w-full text-left border-collapse text-xs table-fixed">
        <colgroup>
          <col className="w-[32%]" />
          <col className="w-[18%]" />
          <col className="w-[8%]" />
          <col className="w-[20%]" />
          <col className="w-[14%]" />
          <col className="w-[8%]" />
        </colgroup>
        <thead>
          <tr className="border-b border-line bg-paper/60 text-ink-soft uppercase font-sans text-[12px] font-medium tracking-[0.04em] h-10">
            <th className="py-2.5 px-4">Medicine</th>
            <th className="py-2.5 px-4">Batch & Rack</th>
            <th className="py-2.5 px-4 text-right">Qty</th>
            <th className="py-2.5 px-4">Expiry Date</th>
            <th className="py-2.5 px-4">Cost / MRP</th>
            <th className="py-2.5 px-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {items.map((item) => {
            const isExpired = item.expiryStatus === 'expired';
            const statusBorder = getBorderColor(item.expiryStatus);
            const rowBg = isExpired ? 'bg-status-expired-bg/30' : 'hover:bg-paper/60';

            return (
              <tr
                key={item._id}
                className={`transition-colors border-l-[3px] ${statusBorder} ${rowBg} row-fade-in`}
              >
                {/* 1. Medicine */}
                <td className="py-3 px-4">
                  <div className="font-medium text-ink text-sm">
                    {item.medicine?.name || 'Unnamed Medicine'}
                  </div>
                  <div className="text-ink-soft text-[11px] mt-0.5 font-sans">
                    {item.medicine?.genericName} • {item.medicine?.strength}
                  </div>
                </td>

                {/* 2. Batch */}
                <td className="py-3 px-4">
                  <span className="font-mono font-medium text-ink">{item.batchNo}</span>
                  <div className="text-[11px] font-sans text-ink-soft mt-0.5">
                    {item.rack ? `Rack ${item.rack}` : 'No rack'}
                  </div>
                </td>

                {/* 3. Qty */}
                <td className="py-3 px-4 text-right">
                  <span className="font-sans text-ink font-medium text-sm tabular-nums">{item.quantity}</span>
                  {item.isLowStock && (
                    <div className="mt-0.5">
                      <Badge variant="warning" size="sm">Low</Badge>
                    </div>
                  )}
                </td>

                {/* 4. Expiry */}
                <td className="py-3 px-4">
                  <div className="font-sans text-ink tabular-nums">{formatDate(item.expiryDate)}</div>
                  <div className="mt-1">
                    <ExpiryBadge expiryStatus={item.expiryStatus} daysLeft={item.daysLeft} />
                  </div>
                </td>

                {/* 5. Cost / MRP */}
                <td className="py-3 px-4 font-sans tabular-nums">
                  <div className="text-ink font-medium">{formatINR(item.purchasePrice || 0)}</div>
                  <div className="text-ink-soft text-[11px]">
                    MRP: {formatINR(item.mrp || 0)}
                  </div>
                </td>

                {/* 6. Actions */}
                <td className="py-3 px-4 text-right">
                  <RowMenu
                    onSell={() => onSell(item)}
                    onEdit={() => onEdit(item)}
                    onDelete={() => onDelete(item)}
                  />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
