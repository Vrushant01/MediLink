import { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useApi } from '../../hooks/useApi';
import api from '../../api/axios';
import BrowseToolbar from '../../components/store/BrowseToolbar';
import BrowseTable from '../../components/store/BrowseTable';
import SuppliersTab from '../../components/store/SuppliersTab';
import CompareModal from '../../components/store/CompareModal';
import RestockModal from '../../components/store/RestockModal';
import Button from '../../components/Button';
import { usePageTitle } from '../../hooks/usePageTitle';
import { RefreshCw, AlertCircle } from 'lucide-react';

import PageHeader from '../../components/PageHeader';

// Store catalog browsing page providing wholesale price comparisons and direct procurement
export default function Browse() {
  usePageTitle('Browse Suppliers');
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState('medicines');

  // URL Query Parameters
  const search = searchParams.get('search') || '';
  const category = searchParams.get('category') || '';
  const supplierId = searchParams.get('supplierId') || '';
  const sort = searchParams.get('sort') || 'price';
  const page = parseInt(searchParams.get('page') || '1', 10);

  const updateQuery = (updates) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, val]) => {
      if (!val) {
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
    supplierId: supplierId || undefined,
    sort,
    page,
    limit: 20,
  }), [search, category, supplierId, sort, page]);

  // Load catalog listings and suppliers list
  const { data: catalogData, loading, isRefetching, error, reload } = useApi('/catalog/browse', queryParams);
  const { data: suppliersList, loading: suppliersLoading } = useApi('/catalog/suppliers');

  // Modals state
  const [comparingMed, setComparingMed] = useState(null);
  const [compareOffers, setCompareOffers] = useState([]);
  const [compareLoading, setCompareLoading] = useState(false);
  const [isRestockOpen, setIsRestockOpen] = useState(false);

  const handleOpenCompare = async (med) => {
    setComparingMed(med);
    setCompareLoading(true);
    try {
      const res = await api.get(`/catalog/compare/${med._id}`);
      setCompareOffers(res.data.offers || []);
    } catch (err) {
      setCompareOffers([]);
    } finally {
      setCompareLoading(false);
    }
  };

  const handleSelectSupplierFromTab = (sId) => {
    updateQuery({ supplierId: sId, page: 1 });
    setActiveTab('medicines');
  };

  const isFiltered = Boolean(search || category || supplierId);
  const items = catalogData?.items || [];
  const total = catalogData?.total || 0;
  const pages = catalogData?.pages || 1;
  const startIdx = total === 0 ? 0 : (page - 1) * 20 + 1;
  const endIdx = Math.min(page * 20, total);

  if (error) {
    return (
      <div className="panel p-8 text-center max-w-lg mx-auto my-12 bg-surface">
        <AlertCircle className="w-8 h-8 text-status-expired mx-auto mb-3" />
        <h3 className="panel-title text-ink mb-1">Failed to load supplier catalog</h3>
        <p className="caption text-ink-soft mb-4">{error}</p>
        <Button variant="outline" size="sm" onClick={reload}>
          <RefreshCw className="w-3.5 h-3.5 mr-1.5" /> Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <PageHeader
        title="Browse Suppliers"
        description="Verified wholesalers with live inventory, transparent pricing, and batch expiry."
      />

      {/* Underline Tabs */}
      <div className="border-b border-line flex items-center gap-6">
        <button
          onClick={() => setActiveTab('medicines')}
          className={`pb-3 text-[14px] font-medium border-b-2 transition-colors ${
            activeTab === 'medicines' ? 'border-brand text-brand' : 'border-transparent text-ink-soft hover:text-ink'
          }`}
        >
          Medicines
        </button>
        <button
          onClick={() => setActiveTab('suppliers')}
          className={`pb-3 text-[14px] font-medium border-b-2 transition-colors ${
            activeTab === 'suppliers' ? 'border-brand text-brand' : 'border-transparent text-ink-soft hover:text-ink'
          }`}
        >
          Suppliers
        </button>
      </div>

      {activeTab === 'medicines' ? (
        <div className="space-y-4">
          <BrowseToolbar
            search={search}
            category={category}
            supplierId={supplierId}
            sort={sort}
            suppliers={suppliersList || []}
            onSearchChange={(val) => updateQuery({ search: val, page: 1 })}
            onCategoryChange={(val) => updateQuery({ category: val, page: 1 })}
            onSupplierChange={(val) => updateQuery({ supplierId: val, page: 1 })}
            onSortChange={(val) => updateQuery({ sort: val, page: 1 })}
            onOpenRestock={() => setIsRestockOpen(true)}
          />

          <BrowseTable
            items={items}
            loading={loading}
            isRefetching={isRefetching}
            onCompare={handleOpenCompare}
            isFiltered={isFiltered}
            onResetFilters={() => setSearchParams({})}
          />

          {/* Pagination Row */}
          {total > 0 && (
            <div className="flex items-center justify-between px-2 py-3 border-t border-line text-[13px] font-sans">
              <span className="text-ink-soft tabular-nums">
                Showing <strong className="text-ink font-medium">{startIdx}</strong> to <strong className="text-ink font-medium">{endIdx}</strong> of <strong className="text-ink font-medium">{total}</strong> listings
              </span>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" disabled={page <= 1 || loading} onClick={() => updateQuery({ page: page - 1 })}>
                  Previous
                </Button>
                <Button variant="outline" size="sm" disabled={page >= pages || loading} onClick={() => updateQuery({ page: page + 1 })}>
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <SuppliersTab suppliers={suppliersList || []} loading={suppliersLoading} onSelectSupplier={handleSelectSupplierFromTab} />
      )}

      {comparingMed && (
        <CompareModal isOpen={Boolean(comparingMed)} onClose={() => setComparingMed(null)} medicine={comparingMed} offers={compareOffers} loading={compareLoading} />
      )}

      <RestockModal isOpen={isRestockOpen} onClose={() => setIsRestockOpen(false)} />
    </div>
  );
}
