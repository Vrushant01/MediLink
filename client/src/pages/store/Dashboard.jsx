import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApi } from '../../hooks/useApi';
import StatCard from '../../components/StatCard';
import Skeleton from '../../components/Skeleton';
import Button from '../../components/Button';
import BatchModal from '../../components/store/BatchModal';
import ShelfHealthBar from '../../components/store/ShelfHealthBar';
import ExpiryRunway from '../../components/store/ExpiryRunway';
import NeedsAttentionPanel from '../../components/store/NeedsAttentionPanel';
import RecentOrdersPanel from '../../components/store/RecentOrdersPanel';
import SpendByMonthChart from '../../components/store/SpendByMonthChart';
import { usePageTitle } from '../../hooks/usePageTitle';
import { formatINR } from '../../utils/format';
import { Plus, AlertCircle, RefreshCw } from 'lucide-react';

// Store Owner Operations Dashboard providing overview of inventory, expiries, and B2B orders
export default function Dashboard() {
  usePageTitle('Dashboard');
  const { user } = useAuth();
  const [isAddBatchOpen, setIsAddBatchOpen] = useState(false);

  // Load primary data feeds via unified useApi hook
  const { data: summary, loading: summaryLoading, error: summaryError, reload: reloadSummary } = useApi('/inventory/summary');
  const { data: invData, loading: invLoading, error: invError, reload: reloadInv } = useApi('/inventory', { limit: 200 });
  const { data: storeSummary, loading: orderSumLoading, error: orderSumError, reload: reloadOrderSum } = useApi('/orders/store-summary');
  const { data: ordersData, loading: ordersLoading, error: ordersError, reload: reloadOrders } = useApi('/orders', { limit: 4 });

  const loading = summaryLoading || invLoading || orderSumLoading || ordersLoading;
  const hasError = summaryError || invError || orderSumError || ordersError;

  const reloadAll = () => {
    reloadSummary();
    reloadInv();
    reloadOrderSum();
    reloadOrders();
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
        <h3 className="text-lg font-serif text-ink mb-1">Failed to load dashboard data</h3>
        <p className="text-xs text-ink-soft mb-4">{summaryError || invError || orderSumError || ordersError}</p>
        <Button variant="outline" size="sm" onClick={reloadAll}>
          <RefreshCw className="w-3.5 h-3.5 mr-1.5" /> Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* a) Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 border-b border-line pb-6">
        <div>
          <p className="text-[13px] font-sans text-ink-soft mb-1">{todayStr}</p>
          <h1 className="page-title">
            {user?.businessName || user?.name || 'Medical Store'}
          </h1>
        </div>
        <Button variant="accent" onClick={() => setIsAddBatchOpen(true)}>
          <Plus className="w-4 h-4 mr-1.5" /> Add batch
        </Button>
      </div>

      {/* b) Four StatCards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {loading ? (
          <>
            <Skeleton className="h-28 rounded-[10px]" />
            <Skeleton className="h-28 rounded-[10px]" />
            <Skeleton className="h-28 rounded-[10px]" />
            <Skeleton className="h-28 rounded-[10px]" />
          </>
        ) : (
          <>
            <StatCard label="Stock value" value={formatINR(summary?.stockValue || 0)} />
            <StatCard label="Units on shelf" value={(summary?.totalUnits || 0).toLocaleString('en-IN')} />
            <StatCard
              label="Expiring within 30 days"
              value={summary?.criticalCount || 0}
              status="expiring"
              hint={summary?.valueAtRisk ? `${formatINR(summary.valueAtRisk)} at risk` : undefined}
            />
            <StatCard
              label="Below reorder level"
              value={summary?.lowStockCount || 0}
              status="reorder"
            />
          </>
        )}
      </div>

      {/* c) Shelf health stacked bar panel */}
      {loading ? (
        <Skeleton className="h-32 rounded-[10px]" />
      ) : (
        <ShelfHealthBar batches={invData?.items || []} />
      )}

      {/* d) Two columns: Left (Needs Attention) and Right (Expiry Runway) - Equal height via items-stretch */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        <div className="lg:col-span-7 min-w-0 overflow-hidden flex flex-col">
          {loading ? (
            <Skeleton className="h-96 rounded-[10px]" />
          ) : (
            <NeedsAttentionPanel batches={invData?.items || []} />
          )}
        </div>

        <div className="lg:col-span-5 min-w-0 overflow-hidden flex flex-col">
          {loading ? (
            <Skeleton className="h-96 rounded-[10px]" />
          ) : (
            <ExpiryRunway batches={invData?.items || []} />
          )}
        </div>
      </div>

      {/* e) Bottom Section: Spend by month and Recent orders in grid */}
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_380px] gap-6 items-stretch">
        <div className="min-w-0 overflow-hidden flex flex-col">
          {loading ? (
            <Skeleton className="h-72 rounded-[10px]" />
          ) : (
            <SpendByMonthChart data={storeSummary?.spendByMonth || []} />
          )}
        </div>

        <div className="min-w-0 overflow-hidden flex flex-col">
          {loading ? (
            <Skeleton className="h-72 rounded-[10px]" />
          ) : (
            <RecentOrdersPanel orders={ordersData?.orders || []} />
          )}
        </div>
      </div>

      {/* Batch Creation Modal */}
      <BatchModal
        isOpen={isAddBatchOpen}
        onClose={() => setIsAddBatchOpen(false)}
        onSuccess={reloadAll}
      />
    </div>
  );
}
