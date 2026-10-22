import { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useApi } from '../../hooks/useApi';
import api from '../../api/axios';
import { useToast } from '../../context/ToastContext';
import InventoryToolbar from '../../components/store/InventoryToolbar';
import InventoryTable from '../../components/store/InventoryTable';
import BatchModal from '../../components/store/BatchModal';
import SellModal from '../../components/store/SellModal';
import ConfirmDialog from '../../components/ConfirmDialog';
import Button from '../../components/Button';
import { usePageTitle } from '../../hooks/usePageTitle';

// Main store inventory management page with persistent URL state, FEFO sales, and batch logging
export default function Inventory() {
  usePageTitle('Inventory');
  const toast = useToast();
  const [searchParams, setSearchParams] = useSearchParams();

  // Extract query filters from URL search params
  const search = searchParams.get('search') || '';
  const category = searchParams.get('category') || '';
  const status = searchParams.get('status') || '';
  const lowStock = searchParams.get('lowStock') === 'true';
  const sort = searchParams.get('sort') || 'expiry';
  const page = parseInt(searchParams.get('page') || '1', 10);

  // Helper to cleanly update query string without losing other active filters
  const updateQuery = (updates) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, val]) => {
      if (val === '' || val === null || val === undefined || val === false) {
        next.delete(key);
      } else {
        next.set(key, String(val));
      }
    });
    setSearchParams(next);
  };

  // Active query parameters for API request
  const queryParams = useMemo(() => ({
    search: search || undefined,
    category: category || undefined,
    status: status || undefined,
    lowStock: lowStock ? 'true' : undefined,
    sort,
    page,
    limit: 20,
  }), [search, category, status, lowStock, sort, page]);

  // Load summary for counts and inventory items
  const { data: summary, reload: reloadSummary } = useApi('/inventory/summary');
  const { data: invData, loading, isRefetching, reload: reloadList } = useApi('/inventory', queryParams);
  // Also fetch all batches for full cross-batch FEFO preview simulation in SellModal
  const { data: allBatchesData, reload: reloadAllBatches } = useApi('/inventory', { limit: 200 });

  // Modal dialog states
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingBatch, setEditingBatch] = useState(null);
  const [sellingBatch, setSellingBatch] = useState(null);
  const [deletingBatch, setDeletingBatch] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const reloadAll = () => {
    reloadList();
    reloadSummary();
    reloadAllBatches();
  };

  const handleDelete = async () => {
    if (!deletingBatch) return;
    setDeleteLoading(true);
    try {
      await api.delete(`/inventory/${deletingBatch._id}`);
      toast.success(`Removed batch ${deletingBatch.batchNo}`);
      setDeletingBatch(null);
      reloadAll();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to remove batch');
    } finally {
      setDeleteLoading(false);
    }
  };

  const isFiltered = Boolean(search || category || status || lowStock);
  const items = invData?.items || [];
  const total = invData?.total || 0;
  const pages = invData?.pages || 1;
  const startIdx = total === 0 ? 0 : (page - 1) * 20 + 1;
  const endIdx = Math.min(page * 20, total);

  return (
    <div className="space-y-5 max-w-7xl mx-auto">
      <InventoryToolbar
        search={search}
        category={category}
        status={status}
        lowStock={lowStock}
        sort={sort}
        summary={summary}
        onSearchChange={(val) => updateQuery({ search: val, page: 1 })}
        onCategoryChange={(val) => updateQuery({ category: val, page: 1 })}
        onStatusChange={(val) => updateQuery({ status: val, page: 1 })}
        onLowStockChange={(val) => updateQuery({ lowStock: val, page: 1 })}
        onSortChange={(val) => updateQuery({ sort: val, page: 1 })}
        onAddBatch={() => setIsAddOpen(true)}
      />

      <InventoryTable
        items={items}
        loading={loading}
        isRefetching={isRefetching}
        isFiltered={isFiltered}
        onResetFilters={() => setSearchParams({})}
        onAddBatch={() => setIsAddOpen(true)}
        onSell={(item) => setSellingBatch(item)}
        onEdit={(item) => setEditingBatch(item)}
        onDelete={(item) => setDeletingBatch(item)}
      />

      {/* Pagination Row */}
      {total > 0 && (
        <div className="flex items-center justify-between px-2 py-3 border-t border-line text-[13px] font-sans">
          <span className="text-ink-soft tabular-nums">
            Showing <strong className="text-ink font-medium">{startIdx}</strong> to <strong className="text-ink font-medium">{endIdx}</strong> of <strong className="text-ink font-medium">{total}</strong> batches
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1 || loading}
              onClick={() => updateQuery({ page: page - 1 })}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= pages || loading}
              onClick={() => updateQuery({ page: page + 1 })}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Modals */}
      <BatchModal
        isOpen={isAddOpen || Boolean(editingBatch)}
        onClose={() => {
          setIsAddOpen(false);
          setEditingBatch(null);
        }}
        batch={editingBatch}
        onSuccess={reloadAll}
      />

      {sellingBatch && (
        <SellModal
          isOpen={Boolean(sellingBatch)}
          onClose={() => setSellingBatch(null)}
          medicine={sellingBatch.medicine}
          batches={allBatchesData?.items || items}
          onSuccess={reloadAll}
        />
      )}

      <ConfirmDialog
        isOpen={Boolean(deletingBatch)}
        onClose={() => setDeletingBatch(null)}
        onConfirm={handleDelete}
        title="Delete Batch"
        message={`Are you sure you want to delete batch ${deletingBatch?.batchNo}? This will remove ${deletingBatch?.quantity} units from inventory.`}
        confirmText="Delete Batch"
        confirmVariant="danger"
        loading={deleteLoading}
      />
    </div>
  );
}
