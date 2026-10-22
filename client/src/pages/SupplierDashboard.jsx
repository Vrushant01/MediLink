import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useApi } from '../hooks/useApi';
import StatCard from '../components/StatCard';
import Skeleton from '../components/Skeleton';
import Button from '../components/Button';
import PendingOrdersPanel from '../components/supplier/PendingOrdersPanel';
import RevenueChart from '../components/supplier/RevenueChart';
import TopStoresPanel from '../components/supplier/TopStoresPanel';
import StockWatchPanel from '../components/supplier/StockWatchPanel';
import { usePageTitle } from '../hooks/usePageTitle';
import { formatINR } from '../utils/format';
import { Plus, RefreshCw, AlertCircle } from 'lucide-react';

// Supplier operations dashboard providing order triage, revenue metrics, and inventory health
export default function SupplierDashboard() {
  usePageTitle('Supplier Dashboard');
  const { user } = useAuth();

  // Load summary metrics, pending placed orders, and active catalog
  const { data: summary, loading: sumLoading, error: sumError, reload: reloadSum } = useApi('/orders/supplier-summary');
  const { data: placedOrdersData, loading: ordersLoading, error: ordersError, reload: reloadOrders } = useApi('/orders', { status: 'placed', limit: 5 });
  const { data: catalogData, loading: catLoading, error: catError, reload: reloadCat } = useApi('/catalog/mine', { limit: 200 });

  const loading = sumLoading || ordersLoading || catLoading;
  const hasError = sumError || ordersError || catError;

  const reloadAll = () => {
    reloadSum();
    reloadOrders();
    reloadCat();
  };

  const todayStr = new Date().toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  if (hasError) {
    return (
      <div className="panel p-8 text-center max-w-lg mx-auto my-12 bg-surface">
        <AlertCircle className="w-8 h-8 text-status-expired mx-auto mb-3" />
        <h3 className="text-lg font-serif text-ink mb-1">Failed to load supplier dashboard</h3>
        <p className="text-xs text-ink-soft mb-4">{sumError || ordersError || catError}</p>
        <Button variant="outline" size="sm" onClick={reloadAll}>
          <RefreshCw className="w-3.5 h-3.5 mr-1.5" /> Retry
        </Button>
      </div>
    );
  }

  const newOrdersCount = summary?.newOrders || 0;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-4 mb-2">
        <div>
          <p className="text-[13px] font-sans text-ink-soft mb-1">{todayStr}</p>
          <h1 className="page-title text-ink">
            {user?.businessName || user?.name || 'Wholesale Supplier'}
          </h1>
        </div>
        <Link to="/supplier/catalog?add=1">
          <Button variant="outline">
            <Plus className="w-4 h-4 mr-1.5" /> Add listing
          </Button>
        </Link>
      </div>

      {/* Four StatCards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {loading ? (
          <>
            <Skeleton className="h-28 rounded-[10px]" />
            <Skeleton className="h-28 rounded-[10px]" />
            <Skeleton className="h-28 rounded-[10px]" />
            <Skeleton className="h-28 rounded-[10px]" />
          </>
        ) : (
          <>
            <StatCard
              label="Needs your response"
              value={newOrdersCount}
              status={newOrdersCount > 0 ? 'accent' : undefined}
            />
            <StatCard label="In progress" value={summary?.inProgress || 0} />
            <StatCard label="Delivered" value={summary?.delivered || 0} />
            <StatCard label="Revenue" value={formatINR(summary?.totalRevenue || 0)} />
          </>
        )}
      </div>

      {/* Top 2 Columns: Orders Waiting for You (Left) & Revenue by Month (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7">
          {loading ? (
            <Skeleton className="h-80 rounded-[10px]" />
          ) : (
            <PendingOrdersPanel orders={placedOrdersData?.orders || []} onOrderHandled={reloadAll} />
          )}
        </div>

        <div className="lg:col-span-5">
          {loading ? (
            <Skeleton className="h-80 rounded-[10px]" />
          ) : (
            <RevenueChart data={summary?.revenueByMonth || []} />
          )}
        </div>
      </div>

      {/* Bottom 2 Columns: Top Stores & Stock to Watch */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {loading ? (
          <>
            <Skeleton className="h-72 rounded-[10px]" />
            <Skeleton className="h-72 rounded-[10px]" />
          </>
        ) : (
          <>
            <TopStoresPanel stores={summary?.topStores || []} />
            <StockWatchPanel listings={catalogData?.items || []} onStockUpdated={reloadAll} />
          </>
        )}
      </div>
    </div>
  );
}
