import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useApi } from '../../hooks/useApi';
import OrdersTopStrip from '../../components/store/OrdersTopStrip';
import OrdersList from '../../components/store/OrdersList';
import OrderDrawer from '../../components/store/OrderDrawer';
import Button from '../../components/Button';
import { usePageTitle } from '../../hooks/usePageTitle';
import { RefreshCw, AlertCircle } from 'lucide-react';

import PageHeader from '../../components/PageHeader';

// Store purchase orders dashboard with status tabs, lifecycle tracks, auto-polling, and drawer details
export default function Orders() {
  usePageTitle('My Orders');
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedOrder, setSelectedOrder] = useState(null);

  const status = searchParams.get('status') || '';
  const page = parseInt(searchParams.get('page') || '1', 10);

  const queryParams = useMemo(() => ({
    status: status || undefined,
    page,
    limit: 15,
  }), [status, page]);

  // Load orders and store summary metrics
  const { data: ordersData, loading, isRefetching, error, reload: reloadOrders } = useApi('/orders', queryParams);
  const { data: summary, loading: summaryLoading, reload: reloadSummary } = useApi('/orders/store-summary');

  // 60-second periodic poll so status changes made by suppliers update dynamically
  useEffect(() => {
    const timer = setInterval(() => {
      reloadOrders();
      reloadSummary();
    }, 60000);
    return () => clearInterval(timer);
  }, [reloadOrders, reloadSummary]);

  const updateStatus = (nextStatus) => {
    const next = new URLSearchParams(searchParams);
    if (!nextStatus) {
      next.delete('status');
    } else {
      next.set('status', nextStatus);
    }
    next.set('page', '1');
    setSearchParams(next);
  };

  const updatePage = (nextPage) => {
    const next = new URLSearchParams(searchParams);
    next.set('page', String(nextPage));
    setSearchParams(next);
  };

  const tabs = [
    { id: '', label: 'All' },
    { id: 'placed', label: 'Placed' },
    { id: 'accepted', label: 'Accepted' },
    { id: 'dispatched', label: 'Dispatched' },
    { id: 'delivered', label: 'Delivered' },
    { id: 'rejected', label: 'Rejected' },
  ];

  const orders = ordersData?.orders || [];
  const total = ordersData?.total || 0;
  const pages = ordersData?.pages || 1;
  const startIdx = total === 0 ? 0 : (page - 1) * 15 + 1;
  const endIdx = Math.min(page * 15, total);

  if (error) {
    return (
      <div className="panel p-8 text-center max-w-lg mx-auto my-12 bg-surface">
        <AlertCircle className="w-8 h-8 text-status-expired mx-auto mb-3" />
        <h3 className="panel-title text-ink mb-1">Failed to load purchase orders</h3>
        <p className="caption text-ink-soft mb-4">{error}</p>
        <Button variant="outline" size="sm" onClick={() => { reloadOrders(); reloadSummary(); }}>
          <RefreshCw className="w-3.5 h-3.5 mr-1.5" /> Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Title */}
      <PageHeader
        title="Purchase Orders"
        description="Monitor procurement statuses, track consignments, and inspect invoice breakdowns."
      />

      {/* Top Strip */}
      <OrdersTopStrip summary={summary} loading={summaryLoading} />

      {/* Underline Tabs */}
      <div className="border-b border-line flex items-center gap-6 overflow-x-auto">
        {tabs.map((tab) => {
          const isActive = status === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => updateStatus(tab.id)}
              className={`pb-3 text-[14px] font-medium border-b-2 transition-colors whitespace-nowrap ${
                isActive ? 'border-brand text-brand' : 'border-transparent text-ink-soft hover:text-ink'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Orders List */}
      <OrdersList
        orders={orders}
        loading={loading}
        isRefetching={isRefetching}
        onSelectOrder={(ord) => setSelectedOrder(ord)}
      />

      {/* Pagination */}
      {total > 0 && (
        <div className="flex items-center justify-between px-2 py-3 border-t border-line text-[13px] font-sans">
          <span className="text-ink-soft tabular-nums">
            Showing <strong className="text-ink font-medium">{startIdx}</strong> to <strong className="text-ink font-medium">{endIdx}</strong> of <strong className="text-ink font-medium">{total}</strong> orders
          </span>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled={page <= 1 || loading} onClick={() => updatePage(page - 1)}>
              Previous
            </Button>
            <Button variant="outline" size="sm" disabled={page >= pages || loading} onClick={() => updatePage(page + 1)}>
              Next
            </Button>
          </div>
        </div>
      )}

      {selectedOrder && (
        <OrderDrawer order={selectedOrder} onClose={() => setSelectedOrder(null)} />
      )}
    </div>
  );
}
