import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Badge from '../Badge';
import Button from '../Button';
import ConfirmDialog from '../ConfirmDialog';
import OrderItemsTable from '../orders/OrderItemsTable';
import StockImpactPanel from './StockImpactPanel';
import RejectModal from './RejectModal';
import InvoicePrint from './InvoicePrint';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { formatDate } from '../../utils/format';
import { X, Printer, CheckCircle2, AlertCircle } from 'lucide-react';

const getStatusVariant = (s) => (s === 'delivered' ? 'success' : s === 'accepted' || s === 'dispatched' ? 'info' : s === 'rejected' ? 'error' : 'warning');

// Supplier order processing drawer with stock impact calculation, stage progression, and invoicing
export default function SupplierOrderDrawer({ order, onClose, catalogListings = [], onOrderUpdated }) {
  const { user } = useAuth();
  const toast = useToast();
  const [hasShortage, setHasShortage] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [deliveredConfirmOpen, setDeliveredConfirmOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => { if (e.key === 'Escape') onClose(); };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      const remaining = document.querySelectorAll('[role="dialog"], [data-portal="drawer"]');
      if (remaining.length <= 1) {
        document.body.style.overflow = '';
      }
    };
  }, [onClose]);

  if (!order) return null;
  const shortId = `#${order._id.slice(-6).toUpperCase()}`;

  const handleUpdateStatus = async (status, reason) => {
    setSubmitting(true);
    setError('');
    try {
      await api.patch(`/orders/${order._id}/status`, { status, reason });
      toast.success(`Order #${shortId} marked as ${status}`);
      onOrderUpdated?.();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Status update failed');
    } finally {
      setSubmitting(false);
      setRejectModalOpen(false);
      setDeliveredConfirmOpen(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-50 overflow-hidden" data-portal="drawer">
      <div className="fixed inset-0 bg-ink/40 transition-opacity" onClick={onClose} />
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-[440px] bg-surface border-l border-line shadow-modal flex flex-col justify-between overflow-y-auto animate-fade-in text-xs">
          <div>
            {/* Header */}
            <div className="p-5 border-b border-line flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-mono text-base font-bold text-ink">{shortId}</span>
                <Badge variant={getStatusVariant(order.status)}>{order.status}</Badge>
              </div>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="sm" onClick={() => window.print()} className="h-7 px-2 text-xs">
                  <Printer className="w-3.5 h-3.5 mr-1" /> Print invoice
                </Button>
                <button onClick={onClose} aria-label="Close order drawer" className="p-1 rounded text-ink-soft hover:text-ink">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {error && (
              <div className="m-4 p-3 bg-status-expired-bg border border-[#F5C2BC] rounded-[6px] text-status-expired flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Purchaser Info */}
            <div className="p-6 border-b border-line space-y-1">
              <p className="panel-title text-ink">{order.store?.businessName || order.store?.name}</p>
              <p className="text-ink-soft text-[13px]">{order.store?.city} {order.store?.phone ? `• ${order.store.phone}` : ''}</p>
              <p className="font-sans tabular-nums text-[12px] text-ink-soft">Placed: {formatDate(order.createdAt)}</p>
              {order.note && (
                <div className="mt-2.5 p-3 bg-paper rounded-[6px] border border-line text-[12px] text-ink">
                  <span className="text-[12px] font-sans font-medium text-ink-soft block mb-0.5">Store Note:</span>
                  {order.note}
                </div>
              )}
            </div>

            {/* Stock Impact Preview for Placed Orders */}
            {order.status === 'placed' && (
              <div className="p-5 border-b border-line">
                <StockImpactPanel items={order.items || []} catalogListings={catalogListings} onImpactCalculated={setHasShortage} />
              </div>
            )}

            {/* Ordered Items */}
            <div className="p-5">
              <OrderItemsTable items={order.items || []} totalAmount={order.totalAmount} />
            </div>
          </div>

          {/* Action Bar */}
          <div className="p-4 border-t border-line bg-paper/50 flex items-center justify-between gap-2">
            {order.status === 'placed' && (
              <>
                <Button variant="outline" size="sm" onClick={() => setRejectModalOpen(true)} disabled={submitting}>
                  Reject
                </Button>
                <Button variant="accent" size="sm" onClick={() => handleUpdateStatus('accepted')} disabled={hasShortage || submitting} loading={submitting}>
                  Accept order
                </Button>
              </>
            )}
            {order.status === 'accepted' && (
              <Button variant="accent" size="sm" className="w-full justify-center" onClick={() => handleUpdateStatus('dispatched')} loading={submitting}>
                Mark as dispatched
              </Button>
            )}
            {order.status === 'dispatched' && (
              <Button variant="accent" size="sm" className="w-full justify-center" onClick={() => setDeliveredConfirmOpen(true)} loading={submitting}>
                Mark as delivered
              </Button>
            )}
            {(order.status === 'delivered' || order.status === 'rejected') && (
              <p className="text-ink-soft italic w-full text-center">
                {order.status === 'delivered' ? 'Order delivered and stock credited to store.' : 'Order was rejected.'}
              </p>
            )}
          </div>
        </div>
      </div>

      <RejectModal isOpen={rejectModalOpen} onClose={() => setRejectModalOpen(false)} order={order} onConfirm={(reason) => handleUpdateStatus('rejected', reason)} loading={submitting} />
      <ConfirmDialog isOpen={deliveredConfirmOpen} onClose={() => setDeliveredConfirmOpen(false)} onConfirm={() => handleUpdateStatus('delivered')} title="Confirm Order Delivery" message="The store's inventory will be updated with these batches. Confirm this consignment has reached the medical store." confirmText="Confirm Delivered" confirmVariant="primary" loading={submitting} />
      <InvoicePrint order={order} supplier={user} />
    </div>,
    document.body
  );
}
