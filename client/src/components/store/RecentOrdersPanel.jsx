import { Link, useNavigate } from 'react-router-dom';
import Badge from '../Badge';
import { formatINR } from '../../utils/format';
import { ArrowRight } from 'lucide-react';

// Maps order statuses to Badge variants
const getStatusVariant = (status) => {
  switch (status) {
    case 'delivered':
      return 'safe';
    case 'accepted':
    case 'dispatched':
      return 'brand';
    case 'rejected':
      return 'expired';
    case 'placed':
    default:
      return 'warning';
  }
};

// Panel showing the most recent orders with clickable rows redirecting to /store/orders
export default function RecentOrdersPanel({ orders = [] }) {
  const navigate = useNavigate();
  const recentOrders = orders.slice(0, 4);

  return (
    <div className="panel bg-surface p-5 sm:p-6 min-w-0 overflow-hidden h-full flex flex-col justify-between">
      <div>
        <div className="flex items-baseline justify-between gap-4 mb-4">
          <div>
            <h2 className="panel-title">Recent orders</h2>
            <p className="text-[13px] text-ink-soft mt-0.5">Latest procurement activity with suppliers</p>
          </div>
          <Link
            to="/store/orders"
            className="text-[13px] text-brand hover:underline font-medium inline-flex items-center gap-1 shrink-0"
          >
            View all
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <p className="text-xs text-ink-soft py-6 text-center font-sans">No orders placed yet.</p>
        ) : (
          <div className="divide-y divide-line/70 border-t border-line/70">
            {recentOrders.map((order) => (
              <div
                key={order._id}
                onClick={() => navigate('/store/orders')}
                className="py-3 px-2 flex items-center justify-between hover:bg-paper/60 transition-colors cursor-pointer rounded-[4px]"
              >
                <div className="min-w-0 pr-3">
                  <p className="text-[14px] font-sans font-medium text-ink truncate leading-tight">
                    {order.supplier?.businessName || order.supplier?.name || 'Wholesale Supplier'}
                  </p>
                  <p className="text-[12px] text-ink-soft font-sans mt-0.5">
                    Order <span className="font-mono text-ink-soft/90">#{order._id.slice(-6).toUpperCase()}</span> • {order.items?.length || 1} items
                  </p>
                </div>

                <div className="flex items-center gap-2.5 shrink-0">
                  <span className="text-[14px] font-sans font-medium tabular-nums text-ink">
                    {formatINR(order.totalAmount)}
                  </span>
                  <Badge variant={getStatusVariant(order.status)}>
                    {order.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
