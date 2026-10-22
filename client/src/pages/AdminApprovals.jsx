import { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useApi } from '../hooks/useApi';
import api from '../api/axios';
import { useToast } from '../context/ToastContext';
import StatCard from '../components/StatCard';
import Button from '../components/Button';
import Input from '../components/Input';
import Select from '../components/Select';
import ConfirmDialog from '../components/ConfirmDialog';
import AdminOrdersChart from '../components/admin/AdminOrdersChart';
import AdminUsersTable from '../components/admin/AdminUsersTable';
import { usePageTitle } from '../hooks/usePageTitle';
import { formatINR } from '../utils/format';

import PageHeader from '../components/PageHeader';

// Admin control center for pharmacy verifications, account approvals, and platform health metrics
export default function AdminApprovals() {
  usePageTitle('Admin Approvals');
  const toast = useToast();
  const [searchParams, setSearchParams] = useSearchParams();

  const tab = searchParams.get('tab') || 'pending';
  const role = searchParams.get('role') || 'all';
  const search = searchParams.get('search') || '';
  const page = parseInt(searchParams.get('page') || '1', 10);

  const queryParams = useMemo(() => ({
    approved: tab === 'all' ? undefined : tab === 'pending' ? 'false' : 'true',
    role: role === 'all' ? undefined : role,
    search: search.trim() || undefined,
    page,
    limit: 15,
  }), [tab, role, search, page]);

  const { data: stats, reload: reloadStats } = useApi('/admin/stats');
  const { data: usersData, loading, isRefetching, reload: reloadUsers } = useApi('/admin/users', queryParams);

  const [processingId, setProcessingId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const reloadAll = () => { reloadStats(); reloadUsers(); };

  const updateFilter = (key, val) => {
    const next = new URLSearchParams(searchParams);
    if (val && val !== 'all') next.set(key, val);
    else next.delete(key);
    next.set('page', '1');
    setSearchParams(next);
  };

  const handleApprove = async (user) => {
    setProcessingId(user._id);
    try {
      await api.patch(`/admin/users/${user._id}/approve`);
      toast.success(`Approved ${user.businessName || user.name}`);
      reloadAll();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to approve account');
    } finally { setProcessingId(null); }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setProcessingId(deleteTarget._id);
    try {
      await api.delete(`/admin/users/${deleteTarget._id}`);
      toast.success(`Removed ${deleteTarget.businessName || deleteTarget.name}`);
      setDeleteTarget(null);
      reloadAll();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to remove account');
    } finally { setProcessingId(null); }
  };

  const users = usersData?.users || [];
  const total = usersData?.total || 0;
  const pages = usersData?.pages || 1;
  const pendingCount = stats?.pendingApprovals || 0;

  const tabs = [
    { id: 'pending', label: 'Pending', count: pendingCount },
    { id: 'approved', label: 'Approved', count: stats ? (stats.totalStores + stats.totalSuppliers - pendingCount) : undefined },
    { id: 'all', label: 'All', count: stats ? (stats.totalStores + stats.totalSuppliers) : undefined },
  ];

  return (
    <div className="space-y-8">
      <PageHeader
        title="Admin"
        description="Pharmacy verifications, account approvals, and platform health metrics."
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Waiting for approval"
          value={pendingCount}
          status={pendingCount > 0 ? 'accent' : undefined}
          hint="Requires drug license verification"
        />
        <StatCard label="Stores" value={stats?.totalStores ?? 0} hint="Approved medical shops" />
        <StatCard label="Suppliers" value={stats?.totalSuppliers ?? 0} hint="Active pharmaceutical distributors" />
        <StatCard label="Platform volume" value={formatINR(stats?.platformVolume ?? 0)} hint="Delivered wholesale transactions" />
      </div>

      {/* Orders Bar Chart */}
      <AdminOrdersChart data={stats?.ordersByMonth || []} />

      {/* Underline Tabs */}
      <div className="border-b border-line flex items-center gap-6 overflow-x-auto">
        {tabs.map((t) => {
          const isActive = tab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => updateFilter('tab', t.id)}
              className={`pb-3 text-[14px] font-medium flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${
                isActive ? 'border-brand text-brand' : 'border-transparent text-ink-soft hover:text-ink'
              }`}
            >
              <span>{t.label}</span>
              {t.count !== undefined && (
                <span
                  className={`text-[11px] font-sans tabular-nums px-1.5 py-0.5 rounded font-medium ${
                    isActive ? 'bg-brand/10 text-brand' : 'bg-paper text-ink-soft'
                  }`}
                >
                  {t.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Search & Role Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="w-full sm:w-72">
          <Input placeholder="Search business or email..." value={search} onChange={(e) => updateFilter('search', e.target.value)} />
        </div>
        <div className="w-full sm:w-48">
          <Select value={role} onChange={(e) => updateFilter('role', e.target.value)} options={[{ value: 'all', label: 'All Roles' }, { value: 'store', label: 'Store Only' }, { value: 'supplier', label: 'Supplier Only' }]} />
        </div>
      </div>

      {/* Users Ledger Table */}
      <AdminUsersTable users={users} loading={loading} isRefetching={isRefetching} currentTab={tab} onApprove={handleApprove} onReject={setDeleteTarget} onRemove={setDeleteTarget} processingId={processingId} />

      {/* Pagination */}
      {total > 0 && (
        <div className="flex items-center justify-between px-2 py-3 border-t border-line text-[13px] font-sans">
          <span className="text-ink-soft tabular-nums">Showing <strong className="text-ink font-medium">{users.length}</strong> of <strong className="text-ink font-medium">{total}</strong> accounts</span>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled={page <= 1 || loading} onClick={() => updateFilter('page', String(page - 1))}>Previous</Button>
            <Button variant="outline" size="sm" disabled={page >= pages || loading} onClick={() => updateFilter('page', String(page + 1))}>Next</Button>
          </div>
        </div>
      )}

      {/* Delete / Reject Account ConfirmDialog */}
      <ConfirmDialog isOpen={Boolean(deleteTarget)} onClose={() => setDeleteTarget(null)} onConfirm={handleDeleteConfirm} title="Remove Account Request" message="This removes the account and its request. This cannot be undone." confirmText="Remove Account" confirmVariant="danger" loading={Boolean(processingId)} />
    </div>
  );
}
