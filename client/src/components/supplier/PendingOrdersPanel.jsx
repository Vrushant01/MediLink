import { useState } from 'react';
import { Link } from 'react-router-dom';
import Button from '../Button';
import EmptyState from '../EmptyState';
import RejectModal from './RejectModal';
import api from '../../api/axios';
import { useToast } from '../../context/ToastContext';
import { formatINR, timeAgo } from '../../utils/format';
import { ArrowRight } from 'lucide-react';

// Urgent dispatch triage panel highlighting placed orders pending supplier confirmation
export default function PendingOrdersPanel({ orders = [], onOrderHandled }) {
  const toast = useToast();
  const [rejectingOrder, setRejectingOrder] = useState(null);
  const [processingId, setProcessingId] = useState(null);

  const handleAccept = async (orderId) => {
    setProcessingId(orderId);
    try {
      await api.patch(`/orders/${orderId}/status`, { status: 'accepted' });
      toast.success('Order accepted! Stock deducted from catalog.');
      onOrderHandled?.();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to accept order');
    } finally {
      setProcessingId(null);
    }
  };

  const handleRejectConfirm = async (reason) => {
    if (!rejectingOrder) return;
    setProcessingId(rejectingOrder._id);
    try {
      await api.patch(`/orders/${rejectingOrder._id}/status`, { status: 'rejected', reason });
      toast.success('Order rejected and store notified.');
      setRejectingOrder(null);
      onOrderHandled?.();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reject order');
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="panel bg-surface p-6 flex flex-col justify-between h-full">
      <div>
        <div className="flex items-baseline justify-between pb-3 mb-3">
          <div>
            <h3 className="panel-title text-ink">Orders waiting for you</h3>
            <p className="caption text-ink-soft mt-0.5">New procurement requests needing immediate response</p>
          </div>
          <span className="font-sans tabular-nums text-[11px] px-2 py-0.5 rounded-[4px] bg-brand-soft text-brand font-medium">
            {orders.length} placed
          </span>
        </div>

        {orders.length === 0 ? (
          <EmptyState
            title="All caught up"
            description="No new orders. You are all caught up."
          />
        ) : (
          <div className="divide-y divide-line text-[14px]">
            {orders.map((order) => {
              const count = order.items?.length || 0;
              const countLabel = count === 1 ? '1 item' : `${count} items`;
              const isBusy = processingId === order._id;

              return (
                <div key={order._id} className="py-3.5 px-1 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-paper/30 transition-colors">
                  <div className="min-w-0">
                    <p className="font-medium text-ink truncate text-[14px]">
                      {order.store?.businessName || order.store?.name}
                    </p>
                    <p className="text-[12px] text-ink-soft">
                      {order.store?.city} • {timeAgo(order.createdAt)}
                    </p>
                  </div>

                  <div className="flex items-center gap-4 shrink-0 justify-between sm:justify-end">
                    <div className="text-right">
                      <p className="font-sans tabular-nums font-semibold text-ink text-[14px]">{formatINR(order.totalAmount)}</p>
                      <p className="text-[12px] font-sans tabular-nums text-ink-soft">{countLabel}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={isBusy}
                        onClick={() => setRejectingOrder(order)}
                        className="text-status-expired hover:bg-status-expired-bg/40"
                      >
                        Reject
                      </Button>
                      <Button
                        variant="accent"
                        size="sm"
                        disabled={isBusy}
                        loading={isBusy}
                        onClick={() => handleAccept(order._id)}
                      >
                        Accept
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="pt-3 mt-3 border-t border-line text-right">
        <Link
          to="/supplier/orders?status=placed"
          className="inline-flex items-center gap-1 text-xs text-brand hover:text-ink font-medium"
        >
          Open all orders <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <RejectModal
        isOpen={Boolean(rejectingOrder)}
        onClose={() => setRejectingOrder(null)}
        order={rejectingOrder}
        onConfirm={handleRejectConfirm}
        loading={Boolean(processingId)}
      />
    </div>
  );
}
