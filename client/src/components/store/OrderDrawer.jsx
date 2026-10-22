import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import Badge from '../Badge';
import Button from '../Button';
import OrderItemsTable from '../orders/OrderItemsTable';
import useCart from '../../context/CartContext';
import { useToast } from '../../context/ToastContext';
import api from '../../api/axios';
import { formatDate } from '../../utils/format';
import { X, RefreshCw, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';

const getStatusVariant = (s) => {
  if (s === 'delivered') return 'success';
  if (s === 'accepted' || s === 'dispatched') return 'info';
  if (s === 'rejected') return 'error';
  return 'warning';
};

// Slide-out right panel showing comprehensive order timeline and reorder dispatch
export default function OrderDrawer({ order, onClose }) {
  const toast = useToast();
  const { addItem } = useCart();
  const [reordering, setReordering] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };

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

  const handleReorder = async () => {
    setReordering(true);
    const added = [];
    const skipped = [];

    try {
      const res = await api.get('/catalog/browse', {
        params: { supplierId: order.supplier?._id, limit: 100 },
      });
      const activeListings = res.data.items || [];

      order.items?.forEach((item) => {
        const medId = item.medicine?._id || item.medicine;
        const match = activeListings.find(
          (l) => (l.medicine?._id || l.medicine) === medId && l.stock > 0
        );

        if (match) {
          addItem({
            catalogId: match._id,
            medicineId: medId,
            medicineName: item.medicine?.name || match.medicine?.name,
            genericName: item.medicine?.genericName || match.medicine?.genericName,
            strength: item.medicine?.strength || match.medicine?.strength,
            supplierId: order.supplier?._id,
            supplierName: order.supplier?.businessName || order.supplier?.name,
            supplierCity: order.supplier?.city,
            price: match.price,
            quantity: Math.min(match.stock, Math.max(match.minOrderQty, item.quantity)),
            minOrderQty: match.minOrderQty || 1,
            stock: match.stock,
            expiryDate: match.expiryDate,
            batchNo: match.batchNo,
            daysLeft: match.daysLeft,
            expiryStatus: match.expiryStatus,
          });
          added.push(item.medicine?.name || 'Medicine');
        } else {
          skipped.push(item.medicine?.name || 'Medicine');
        }
      });

      if (added.length > 0) toast.success(`Added ${added.length} items to your cart`);
      if (skipped.length > 0) toast.warning(`Skipped unavailable: ${skipped.join(', ')}`);
    } catch (err) {
      toast.error('Failed to verify item availability for reorder');
    } finally {
      setReordering(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-50 overflow-hidden" data-portal="drawer">
      <div className="fixed inset-0 bg-ink/40 transition-opacity" onClick={onClose} />
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-[440px] bg-surface border-l border-line shadow-modal flex flex-col justify-between overflow-y-auto animate-fade-in text-xs">
          <div>
            <div className="p-5 border-b border-line flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-mono text-base font-bold text-ink">{shortId}</span>
                <Badge variant={getStatusVariant(order.status)}>{order.status}</Badge>
              </div>
              <button onClick={onClose} aria-label="Close order drawer" className="p-1 rounded text-ink-soft hover:text-ink">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 border-b border-line space-y-3">
              <div>
                <p className="panel-title text-ink">
                  {order.supplier?.businessName || order.supplier?.name}
                </p>
                <p className="text-ink-soft text-[13px] mt-0.5">
                  {order.supplier?.city} {order.supplier?.phone ? `• ${order.supplier.phone}` : ''}
                </p>
                <p className="font-sans tabular-nums text-[12px] text-ink-soft mt-1">Placed on {formatDate(order.createdAt)}</p>
              </div>

              {order.status === 'delivered' && (
                <div className="p-3 rounded-[6px] bg-status-safe-bg/40 border border-[#C5E5CE] text-status-safe">
                  <div className="flex items-center gap-1.5 font-medium">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>These batches were added to your inventory.</span>
                  </div>
                  <Link to="/store/inventory" className="mt-2 inline-flex items-center gap-1 text-xs text-ink font-medium hover:underline">
                    View inventory <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              )}

              {(order.status === 'placed' || order.status === 'accepted') && (
                <p className="text-ink-soft italic">Waiting for the supplier</p>
              )}

              {order.status === 'rejected' && (
                <div className="p-3 rounded-[6px] bg-status-expired-bg/40 border border-[#F5C2BC] text-status-expired space-y-1">
                  <div className="flex items-center gap-1.5 font-medium">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                    <span>Order Rejected by Supplier</span>
                  </div>
                  <p className="text-[11px] text-ink">{order.note || 'No rejection reason specified.'}</p>
                </div>
              )}
            </div>

            <div className="p-6">
              <OrderItemsTable items={order.items || []} totalAmount={order.totalAmount} />
              {order.note && order.status !== 'rejected' && (
                <div className="mt-3.5 p-3 rounded-[6px] bg-paper text-[12px] text-ink border border-line">
                  <span className="text-[12px] font-sans font-medium text-ink-soft block mb-0.5">Note:</span>
                  {order.note}
                </div>
              )}
            </div>
          </div>

          <div className="p-4 border-t border-line bg-paper/50 flex items-center justify-between gap-3">
            <Button variant="ghost" size="sm" onClick={onClose}>Close</Button>
            <Button variant="accent" size="sm" onClick={handleReorder} loading={reordering}>
              <RefreshCw className="w-3.5 h-3.5 mr-1" /> Reorder these items
            </Button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
