import Skeleton from '../Skeleton';
import EmptyState from '../EmptyState';
import ProgressTrack from './ProgressTrack';
import { formatDate, formatINR } from '../../utils/format';

// Dense order history list rendering fixed-layout ledger rows with live lifecycle progress indicators
export default function OrdersList({ orders = [], loading, isRefetching = false, onSelectOrder }) {
  if (loading) {
    return (
      <div className="panel bg-surface divide-y divide-line overflow-hidden min-h-[520px]">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="p-4 flex items-center justify-between">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-5 w-44" />
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-5 w-16" />
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-5 w-32" />
          </div>
        ))}
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="panel bg-surface min-h-[520px] flex items-center justify-center p-8">
        <EmptyState
          title="No orders found"
          description="Orders matching this status filter will appear here once placed."
        />
      </div>
    );
  }

  return (
    <div className={`panel bg-surface overflow-x-auto min-h-[520px] flex flex-col justify-between transition-opacity duration-150 ${isRefetching ? 'opacity-60 pointer-events-none' : 'opacity-100'}`}>
      <table className="w-full text-left border-collapse text-xs min-w-[760px]">
        <thead>
          <tr className="border-b border-line bg-paper/60 text-ink-soft uppercase text-[12px] font-sans font-medium tracking-[0.04em] h-10">
            <th className="py-2.5 px-4 whitespace-nowrap">Order ID</th>
            <th className="py-2.5 px-4">Supplier</th>
            <th className="py-2.5 px-4 whitespace-nowrap">Date Placed</th>
            <th className="py-2.5 px-4 whitespace-nowrap">Items</th>
            <th className="py-2.5 px-4 text-right whitespace-nowrap pr-8">Total Amount</th>
            <th className="py-2.5 px-4 text-right whitespace-nowrap">Progress</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {orders.map((order) => {
            const shortId = `#${order._id.slice(-6).toUpperCase()}`;
            const count = order.items?.length || 0;
            const itemLabel = count === 1 ? '1 item' : `${count} items`;

            return (
              <tr
                key={order._id}
                onClick={() => onSelectOrder(order)}
                className="hover:bg-paper/40 transition-colors cursor-pointer h-14"
              >
                <td className="py-3 px-4 whitespace-nowrap">
                  <span className="font-mono font-medium text-[13px] text-ink">{shortId}</span>
                </td>
                <td className="py-3 px-4">
                  <p className="font-medium text-ink text-[14px] truncate">
                    {order.supplier?.businessName || order.supplier?.name}
                  </p>
                  <p className="text-[12px] text-ink-soft">{order.supplier?.city}</p>
                </td>
                <td className="py-3 px-4 font-sans tabular-nums text-[13px] text-ink-soft whitespace-nowrap">
                  {formatDate(order.createdAt)}
                </td>
                <td className="py-3 px-4 font-sans tabular-nums text-[13px] text-ink-soft whitespace-nowrap">
                  {itemLabel}
                </td>
                <td className="py-3 px-4 font-sans tabular-nums font-semibold text-[15px] text-ink text-right whitespace-nowrap pr-8">
                  {formatINR(order.totalAmount)}
                </td>
                <td className="py-3 px-4 text-right whitespace-nowrap">
                  <div className="flex justify-end items-center">
                    <ProgressTrack status={order.status} />
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
