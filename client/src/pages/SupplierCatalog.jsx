import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useApi } from '../hooks/useApi';
import api from '../api/axios';
import { useToast } from '../context/ToastContext';
import CatalogTable from '../components/supplier/CatalogTable';
import ListingModal from '../components/supplier/ListingModal';
import ConfirmDialog from '../components/ConfirmDialog';
import Button from '../components/Button';
import downloadCsv from '../utils/csv';
import { usePageTitle } from '../hooks/usePageTitle';
import { formatDate, formatINR } from '../utils/format';
import { Search, Plus, Download, RefreshCw, AlertCircle } from 'lucide-react';

import PageHeader from '../components/PageHeader';

// Supplier wholesale catalog management page with inline editing, batch modals, and filtering
export default function SupplierCatalog() {
  usePageTitle('My Catalog');
  const toast = useToast();
  const [searchParams, setSearchParams] = useSearchParams();

  const search = searchParams.get('search') || '';
  const filter = searchParams.get('filter') || 'all';
  const sort = searchParams.get('sort') || 'name';
  const page = parseInt(searchParams.get('page') || '1', 10);
  const shouldAdd = searchParams.get('add') === '1';

  const [localSearch, setLocalSearch] = useState(search);
  const [modalListing, setModalListing] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deletingListing, setDeletingListing] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (shouldAdd) {
      setIsModalOpen(true);
      setModalListing(null);
      const next = new URLSearchParams(searchParams);
      next.delete('add');
      setSearchParams(next, { replace: true });
    }
  }, [shouldAdd, searchParams, setSearchParams]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (localSearch !== search) updateQuery({ search: localSearch, page: 1 });
    }, 300);
    return () => clearTimeout(timer);
  }, [localSearch, search]);

  const updateQuery = (updates) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([k, v]) => {
      if (!v || v === 'all') next.delete(k);
      else next.set(k, String(v));
    });
    setSearchParams(next);
  };

  const { data, loading, isRefetching, error, reload } = useApi('/catalog/mine', { search: search || undefined, limit: 100 });
  const rawItems = data?.items || [];

  // Filter and sort items client-side for immediate responsive feedback
  const processedItems = useMemo(() => {
    let items = [...rawItems];
    if (filter === 'lowstock') items = items.filter((i) => (i.stock ?? 0) < 20);
    else if (filter === 'shortexpiry') items = items.filter((i) => i.daysLeft !== null && i.daysLeft >= 0 && i.daysLeft < 180);
    else if (filter === 'expired') items = items.filter((i) => i.daysLeft !== null && i.daysLeft < 0);

    if (sort === 'stock') items.sort((a, b) => (a.stock ?? 0) - (b.stock ?? 0));
    else if (sort === 'expiry') items.sort((a, b) => (new Date(a.expiryDate || 0) - new Date(b.expiryDate || 0)));
    else items.sort((a, b) => (a.medicine?.name || '').localeCompare(b.medicine?.name || ''));

    return items;
  }, [rawItems, filter, sort]);

  const handleInlineUpdate = async (id, fields) => {
    try {
      await api.put(`/catalog/${id}`, fields);
      toast.success('Listing updated');
      reload();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update field');
      throw err;
    }
  };

  const handleDelete = async () => {
    if (!deletingListing) return;
    setDeleting(true);
    try {
      await api.delete(`/catalog/${deletingListing._id}`);
      toast.success('Listing removed');
      setDeletingListing(null);
      reload();
    } catch (err) {
      toast.error('Failed to remove listing');
    } finally {
      setDeleting(false);
    }
  };

  const handleExportCsv = () => {
    const rows = processedItems.map((i) => ({
      'Medicine Name': i.medicine?.name || '',
      'Generic Name': i.medicine?.genericName || '',
      'Batch No': i.batchNo || '',
      'Expiry Date': formatDate(i.expiryDate),
      'Wholesale Price': i.price,
      'Stock (Units)': i.stock,
      'Min Order Qty': i.minOrderQty,
    }));
    downloadCsv('supplier_catalog_export', rows);
  };

  const segments = [
    { id: 'all', label: 'All' },
    { id: 'lowstock', label: 'Low stock' },
    { id: 'shortexpiry', label: 'Short shelf life' },
    { id: 'expired', label: 'Expired' },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-4">
        <PageHeader
          title="My Catalog"
          description="Wholesale listings and active inventory displayed to licensed pharmacies."
        />
        <div className="flex items-center gap-2.5 shrink-0">
          <Button variant="ghost" onClick={handleExportCsv} disabled={processedItems.length === 0}>
            <Download className="w-4 h-4 mr-1.5" /> Download CSV
          </Button>
          <Button variant="accent" onClick={() => { setModalListing(null); setIsModalOpen(true); }}>
            <Plus className="w-4 h-4 mr-1.5" /> Add listing
          </Button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="relative min-w-[240px] flex-1">
          <Search className="w-4 h-4 text-ink-soft absolute left-3.5 top-3.5" />
          <input
            type="text"
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            placeholder="Search medicine in catalog..."
            className="w-full h-[42px] pl-10 pr-3.5 rounded-[6px] border border-line bg-surface text-[14px] text-ink placeholder:text-ink-soft/60 focus:outline-none focus:border-brand focus:ring-4 focus:ring-brand-soft/60 transition-colors"
          />
        </div>

        <div className="inline-flex rounded-[6px] border border-line p-1 bg-paper gap-1 text-[13px]">
          {segments.map((seg) => (
            <button
              key={seg.id}
              type="button"
              onClick={() => updateQuery({ filter: seg.id })}
              className={`px-3 py-1.5 rounded-[4px] font-sans text-[13px] transition-colors duration-150 select-none ${
                filter === seg.id ? 'bg-ink text-surface font-medium' : 'text-ink-soft hover:text-ink'
              }`}
            >
              {seg.label}
            </button>
          ))}
        </div>

        <select
          value={sort}
          onChange={(e) => updateQuery({ sort: e.target.value })}
          className="h-[42px] px-3.5 rounded-[6px] border border-line bg-surface text-[14px] text-ink focus:outline-none focus:border-brand focus:ring-4 focus:ring-brand-soft/60 transition-colors"
        >
          <option value="name">Name</option>
          <option value="stock">Lowest stock</option>
          <option value="expiry">Soonest expiry</option>
        </select>
      </div>

      <CatalogTable items={processedItems} loading={loading} isRefetching={isRefetching} onInlineUpdate={handleInlineUpdate} onEditBatch={(item) => { setModalListing(item); setIsModalOpen(true); }} onDeleteBatch={setDeletingListing} isFiltered={filter !== 'all' || Boolean(search)} onResetFilters={() => setSearchParams({})} onAddListing={() => { setModalListing(null); setIsModalOpen(true); }} />

      <ListingModal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); setModalListing(null); }} listing={modalListing} onSuccess={reload} />
      <ConfirmDialog isOpen={Boolean(deletingListing)} onClose={() => setDeletingListing(null)} onConfirm={handleDelete} title="Delete Catalog Listing" message={`Remove ${deletingListing?.medicine?.name} from your wholesale catalog? Stores will no longer be able to order this item.`} confirmText="Delete Listing" confirmVariant="danger" loading={deleting} />
    </div>
  );
}
