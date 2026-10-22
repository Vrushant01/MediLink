import ProgressTrack from '../store/ProgressTrack';
import Skeleton from '../Skeleton';
import EmptyState from '../EmptyState';
import Button from '../Button';
import { formatINR, timeAgo } from '../../utils/format';

// Wholesale order ledger list rendering lifecycle tracking and instant placed order triage
export default function SupplierOrdersList({
  orders = [],
  loading,
  newOrderIds = new Set(),
  onSelectOrder,
  onAcceptOrder,
  onRejectOrder,
  isProcessingId,
}) {
  if (loading) {
    return (
      <div className="panel bg-surface divide-y divide-line overflow-hidden">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="p-4 flex items-center justify-between">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-5 w-44" />
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-5 w-16" />
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-5 w-28" />
          </div>
        ))}
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <EmptyState
        title="No orders found"
        description="Orders matching this tab filter will appear here."
      />
    );
  }

  return (
    <div className="panel bg-surface divide-y divide-line overflow-hidden">
      {orders.map((order) => {
        const shortId = `#${order._id.slice(-6).toUpperCase()}`;
        const count = order.items?.length || 0;
        const countLabel = count === 1 ? '1 item' : `${count} items`;
        const isNew = newOrderIds.has(order._id);
        const isPlaced = order.status === 'placed';

        return (
          <div
            key={order._id}
            onClick={() => onSelectOrder(order)}
            className={`p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 transition-colors duration-1000 cursor-pointer text-xs ${
              isNew ? 'bg-brand-soft/50 animate-pulse' : 'hover:bg-paper/40'
            }`}
          >
            {/* Store & ID */}
            <div className="flex items-center gap-4 min-w-[220px]">
              <span className="font-mono font-medium text-[13px] text-ink">{shortId}</span>
              <div>
                <p className="font-medium text-ink text-[14px]">
                  {order.store?.businessName || order.store?.name}
                </p>
                <p className="text-[12px] text-ink-soft">{order.store?.city}</p>
              </div>
            </div>

            {/* Meta & Stage */}
            <div className="flex items-center gap-4 sm:gap-6 justify-between md:justify-end flex-1">
              <span className="font-sans tabular-nums text-ink-soft text-[12px]">{timeAgo(order.createdAt)}</span>
              <span className="font-sans tabular-nums text-[13px] text-ink-soft">{countLabel}</span>
              <span className="font-sans tabular-nums font-semibold text-[15px] text-ink min-w-[80px] text-right">
                {formatINR(order.totalAmount)}
              </span>

              {/* Direct Accept / Reject for placed orders */}
              {isPlaced ? (
                <div
                  className="flex items-center gap-1.5 shrink-0"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs px-2 text-status-expired hover:bg-status-expired-bg/40"
                    disabled={isProcessingId === order._id}
                    onClick={() => onRejectOrder(order)}
                  >
                    Reject
                  </Button>
                  <Button
                    variant="accent"
                    size="sm"
                    className="h-7 text-xs px-2"
                    disabled={isProcessingId === order._id}
                    loading={isProcessingId === order._id}
                    onClick={() => onAcceptOrder(order)}
                  >
                    Accept
                  </Button>
                </div>
              ) : (
                <div className="min-w-[150px] flex justify-end">
                  <ProgressTrack status={order.status} />
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
