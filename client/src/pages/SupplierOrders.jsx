import { useState, useEffect, useRef, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useApi } from '../hooks/useApi';
import api from '../api/axios';
import { useToast } from '../context/ToastContext';
import SupplierOrdersList from '../components/supplier/SupplierOrdersList';
import SupplierOrderDrawer from '../components/supplier/SupplierOrderDrawer';
import RejectModal from '../components/supplier/RejectModal';
import Button from '../components/Button';
import { usePageTitle } from '../hooks/usePageTitle';
import { RefreshCw, AlertCircle } from 'lucide-react';

import PageHeader from '../components/PageHeader';

// Supplier order management portal with 30s background polling, new order highlights, and execution drawer
export default function SupplierOrders() {
  usePageTitle('Incoming Orders');
  const toast = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const status = searchParams.get('status') || 'placed';
  const page = parseInt(searchParams.get('page') || '1', 10);

  const queryParams = useMemo(() => ({ status: status === 'all' ? undefined : status, page, limit: 15 }), [status, page]);
  const { data: ordersData, loading, reload: reloadOrders } = useApi('/orders', queryParams);
  const { data: summary, reload: reloadSummary } = useApi('/orders/supplier-summary');
  const { data: catalogData, reload: reloadCatalog } = useApi('/catalog/mine', { limit: 200 });

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [rejectingOrder, setRejectingOrder] = useState(null);
  const [processingId, setProcessingId] = useState(null);
  const [newOrderIds, setNewOrderIds] = useState(new Set());
  const prevOrderIdsRef = useRef(null);

  // Poll orders list every 30 seconds
  useEffect(() => {
    const timer = setInterval(() => { reloadOrders(); reloadSummary(); }, 30000);
    return () => clearInterval(timer);
  }, [reloadOrders, reloadSummary]);

  // Detect newly arrived orders and highlight them for 2 seconds
  useEffect(() => {
    const currentOrders = ordersData?.orders || [];
    const currentIds = currentOrders.map((o) => o._id);
    if (prevOrderIdsRef.current !== null) {
      const addedIds = currentIds.filter((id) => !prevOrderIdsRef.current.includes(id));
      if (addedIds.length > 0) {
        setNewOrderIds(new Set(addedIds));
        const clearTimer = setTimeout(() => setNewOrderIds(new Set()), 2000);
        return () => clearTimeout(clearTimer);
      }
    }
    prevOrderIdsRef.current = currentIds;
  }, [ordersData]);

  const updateStatus = (nextStatus) => {
    const next = new URLSearchParams(searchParams);
    next.set('status', nextStatus);
    next.set('page', '1');
    setSearchParams(next);
  };

  const reloadAll = () => { reloadOrders(); reloadSummary(); reloadCatalog(); };

  const handleAcceptOrder = async (order) => {
    setProcessingId(order._id);
    try {
      await api.patch(`/orders/${order._id}/status`, { status: 'accepted' });
      toast.success(`Accepted order #${order._id.slice(-6).toUpperCase()}`);
      reloadAll();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to accept order');
    } finally { setProcessingId(null); }
  };

  const handleRejectConfirm = async (reason) => {
    if (!rejectingOrder) return;
    setProcessingId(rejectingOrder._id);
    try {
      await api.patch(`/orders/${rejectingOrder._id}/status`, { status: 'rejected', reason });
      toast.success(`Rejected order #${rejectingOrder._id.slice(-6).toUpperCase()}`);
      setRejectingOrder(null);
      reloadAll();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reject order');
    } finally { setProcessingId(null); }
  };

  const orders = ordersData?.orders || [];
  const total = ordersData?.total || 0;
  const pages = ordersData?.pages || 1;
  const startIdx = total === 0 ? 0 : (page - 1) * 15 + 1;
  const endIdx = Math.min(page * 15, total);

  const tabs = [
    { id: 'placed', label: 'New', count: summary?.newOrders },
    { id: 'accepted', label: 'Accepted' },
    { id: 'dispatched', label: 'Dispatched' },
    { id: 'delivered', label: 'Delivered', count: summary?.delivered },
    { id: 'rejected', label: 'Rejected' },
    { id: 'all', label: 'All' },
  ];

  return (
    <div className="space-y-8">
      <PageHeader
        title="Incoming Orders"
        description="Review store orders, execute wholesale shipments, and issue invoices."
      />

      {/* Underline Tabs */}
      <div className="border-b border-line flex items-center gap-6 overflow-x-auto">
        {tabs.map((tab) => {
          const isActive = status === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => updateStatus(tab.id)}
              className={`pb-3 text-[14px] font-medium flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${
                isActive ? 'border-brand text-brand' : 'border-transparent text-ink-soft hover:text-ink'
              }`}
            >
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span
                  className={`text-[11px] font-sans tabular-nums px-1.5 py-0.5 rounded font-medium ${
                    isActive ? 'bg-brand/10 text-brand' : 'bg-paper text-ink-soft'
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Orders List */}
      <SupplierOrdersList orders={orders} loading={loading} newOrderIds={newOrderIds} onSelectOrder={setSelectedOrder} onAcceptOrder={handleAcceptOrder} onRejectOrder={setRejectingOrder} isProcessingId={processingId} />

      {/* Pagination */}
      {total > 0 && (
        <div className="flex items-center justify-between px-2 py-3 border-t border-line text-[13px] font-sans">
          <span className="text-ink-soft tabular-nums">
            Showing <strong className="text-ink font-medium">{startIdx}</strong> to <strong className="text-ink font-medium">{endIdx}</strong> of <strong className="text-ink font-medium">{total}</strong> orders
          </span>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled={page <= 1 || loading} onClick={() => setSearchParams((p) => { p.set('page', String(page - 1)); return p; })}>Previous</Button>
            <Button variant="outline" size="sm" disabled={page >= pages || loading} onClick={() => setSearchParams((p) => { p.set('page', String(page + 1)); return p; })}>Next</Button>
          </div>
        </div>
      )}

      {selectedOrder && <SupplierOrderDrawer order={selectedOrder} onClose={() => setSelectedOrder(null)} catalogListings={catalogData?.items || []} onOrderUpdated={reloadAll} />}
      <RejectModal isOpen={Boolean(rejectingOrder)} onClose={() => setRejectingOrder(null)} order={rejectingOrder} onConfirm={handleRejectConfirm} loading={Boolean(processingId)} />
    </div>
  );
}
