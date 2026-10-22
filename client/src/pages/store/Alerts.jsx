import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useApi } from '../../hooks/useApi';
import api from '../../api/axios';
import { useToast } from '../../context/ToastContext';
import { usePageTitle } from '../../hooks/usePageTitle';
import AlertsTopStrip from '../../components/store/AlertsTopStrip';
import ExpiredTab from '../../components/store/ExpiredTab';
import ExpiringSoonTab from '../../components/store/ExpiringSoonTab';
import LowStockTab from '../../components/store/LowStockTab';
import SellModal from '../../components/store/SellModal';
import ConfirmDialog from '../../components/ConfirmDialog';
import Skeleton from '../../components/Skeleton';
import Button from '../../components/Button';
import { AlertCircle, RefreshCw } from 'lucide-react';

import PageHeader from '../../components/PageHeader';

// Store alerts page managing expired batches, near-expiry clearance, and low-stock reordering
export default function Alerts() {
  usePageTitle('Expiry Alerts');
  const toast = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'expired';

  const setActiveTab = (tab) => {
    const next = new URLSearchParams(searchParams);
    next.set('tab', tab);
    setSearchParams(next);
  };

  const { data: alerts, loading: alertsLoading, error: alertsError, reload: reloadAlerts } = useApi('/inventory/alerts');
  const { data: summary, loading: sumLoading, error: sumError, reload: reloadSummary } = useApi('/inventory/summary');
  const { data: allBatchesData, reload: reloadBatches } = useApi('/inventory', { limit: 200 });

  const loading = alertsLoading || sumLoading;
  const hasError = alertsError || sumError;

  const [sellingBatch, setSellingBatch] = useState(null);
  const [writeOffBatch, setWriteOffBatch] = useState(null);
  const [writeOffLoading, setWriteOffLoading] = useState(false);

  const reloadAll = () => { reloadAlerts(); reloadSummary(); reloadBatches(); };

  const handleWriteOff = async () => {
    if (!writeOffBatch) return;
    setWriteOffLoading(true);
    try {
      await api.delete(`/inventory/${writeOffBatch._id}`);
      toast.success(`Wrote off batch ${writeOffBatch.batchNo} (${writeOffBatch.quantity} units removed)`);
      setWriteOffBatch(null);
      reloadAll();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to write off batch');
    } finally {
      setWriteOffLoading(false);
    }
  };

  const expiredList = alerts?.expired || [];
  const expiringList = alerts?.expiringSoon || [];
  const lowStockList = alerts?.lowStock || [];

  const tabs = [
    { id: 'expired', label: 'Expired', count: expiredList.length },
    { id: 'expiring', label: 'Expiring soon', count: expiringList.length },
    { id: 'lowstock', label: 'Low stock', count: lowStockList.length },
  ];

  if (hasError) {
    return (
      <div className="panel p-8 text-center max-w-lg mx-auto my-12 bg-surface">
        <AlertCircle className="w-8 h-8 text-status-expired mx-auto mb-3" />
        <h3 className="panel-title text-ink mb-1">Failed to load inventory alerts</h3>
        <p className="caption text-ink-soft mb-4">{alertsError || sumError}</p>
        <Button variant="outline" size="sm" onClick={reloadAll}>
          <RefreshCw className="w-3.5 h-3.5 mr-1.5" /> Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Expiry & Stock Alerts"
        description="Review batches requiring write-off, rapid sale, or catalog replenishment."
      />

      {loading ? <Skeleton className="h-24 rounded-[10px]" /> : <AlertsTopStrip summary={summary} />}

      {/* Underline Tabs */}
      <div className="border-b border-line flex items-center gap-6">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-3 text-[14px] font-medium flex items-center gap-2 border-b-2 transition-colors ${
                isActive ? 'border-brand text-brand' : 'border-transparent text-ink-soft hover:text-ink'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[11px] font-sans tabular-nums px-1.5 py-0.5 rounded font-medium ${
                  isActive ? 'bg-brand/10 text-brand' : 'bg-paper text-ink-soft'
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Tab Panels */}
      {loading ? (
        <Skeleton className="h-64 rounded-[10px]" />
      ) : (
        <>
          {activeTab === 'expired' && <ExpiredTab items={expiredList} onWriteOff={(b) => setWriteOffBatch(b)} />}
          {activeTab === 'expiring' && <ExpiringSoonTab items={expiringList} onSell={(b) => setSellingBatch(b)} />}
          {activeTab === 'lowstock' && <LowStockTab items={lowStockList} />}
        </>
      )}

      {sellingBatch && (
        <SellModal isOpen={Boolean(sellingBatch)} onClose={() => setSellingBatch(null)} medicine={sellingBatch.medicine} batches={allBatchesData?.items || []} onSuccess={reloadAll} />
      )}

      <ConfirmDialog isOpen={Boolean(writeOffBatch)} onClose={() => setWriteOffBatch(null)} onConfirm={handleWriteOff} title="Write Off Expired Stock" message={`Are you sure you want to write off batch ${writeOffBatch?.batchNo}? This permanently removes ${writeOffBatch?.quantity} units.`} confirmText="Write Off Batch" confirmVariant="danger" loading={writeOffLoading} />
    </div>
  );
}
