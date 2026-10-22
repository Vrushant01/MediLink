import { useState } from 'react';
import Badge from '../Badge';
import Button from '../Button';
import Skeleton from '../Skeleton';
import EmptyState from '../EmptyState';
import { formatDate, timeAgo } from '../../utils/format';
import { Copy, Check } from 'lucide-react';

function CopyLicenseButton({ license }) {
  const [copied, setCopied] = useState(false);
  if (!license) return <span className="text-ink-soft">—</span>;

  const handleCopy = () => {
    navigator.clipboard.writeText(license);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="inline-flex items-center gap-1.5 font-mono text-[11px] text-ink">
      <span>{license}</span>
      <button
        type="button"
        onClick={handleCopy}
        aria-label="Copy drug license number"
        className="p-1 rounded text-ink-soft hover:text-ink hover:bg-paper transition-colors"
        title="Copy license"
      >
        {copied ? <Check className="w-3 h-3 text-status-safe" /> : <Copy className="w-3 h-3" />}
      </button>
    </div>
  );
}

// Admin user ledger table with license copy, role badges, and approval/rejection triggers
export default function AdminUsersTable({
  users = [],
  loading,
  isRefetching = false,
  currentTab,
  onApprove,
  onReject,
  onRemove,
  processingId,
}) {
  if (loading) {
    return (
      <div className="panel bg-surface overflow-x-auto min-h-[520px]">
        <table className="w-full text-left border-collapse text-xs table-fixed min-w-[760px]">
          <colgroup>
            <col className="w-[24%]" />
            <col className="w-[10%]" />
            <col className="w-[18%]" />
            <col className="w-[16%]" />
            <col className="w-[14%]" />
            <col className="w-[8%]" />
            <col className="w-[10%]" />
          </colgroup>
          <thead>
            <tr className="border-b border-line bg-paper/60 text-ink-soft uppercase text-[12px] font-sans font-medium tracking-[0.04em] h-10">
              <th className="py-2.5 px-4">Business</th>
              <th className="py-2.5 px-4">Role</th>
              <th className="py-2.5 px-4">Drug License</th>
              <th className="py-2.5 px-4">City & Phone</th>
              <th className="py-2.5 px-4">Registered</th>
              <th className="py-2.5 px-4">Status</th>
              <th className="py-2.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line/70">
            {Array.from({ length: 5 }).map((_, i) => (
              <tr key={i} className="h-16">
                <td className="py-3 px-4">
                  <div className="space-y-1.5">
                    <Skeleton className="h-4 w-36" />
                    <Skeleton className="h-3 w-24 opacity-60" />
                  </div>
                </td>
                <td className="py-3 px-4">
                  <Skeleton className="h-5 w-16 rounded-[6px]" />
                </td>
                <td className="py-3 px-4">
                  <Skeleton className="h-4 w-28" />
                </td>
                <td className="py-3 px-4">
                  <div className="space-y-1">
                    <Skeleton className="h-3.5 w-20" />
                    <Skeleton className="h-3 w-28 opacity-60" />
                  </div>
                </td>
                <td className="py-3 px-4">
                  <Skeleton className="h-4 w-20" />
                </td>
                <td className="py-3 px-4">
                  <Skeleton className="h-5 w-16 rounded-[6px]" />
                </td>
                <td className="py-3 px-4 text-right">
                  <Skeleton className="h-7 w-20 ml-auto rounded-[6px]" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (users.length === 0) {
    if (currentTab === 'pending') {
      return (
        <div className="panel bg-surface min-h-[520px] flex items-center justify-center p-8">
          <EmptyState
            title="No requests waiting"
            description="No requests waiting. New store and supplier sign-ups will appear here."
          />
        </div>
      );
    }
    return (
      <div className="panel bg-surface min-h-[520px] flex items-center justify-center p-8">
        <EmptyState
          title="No accounts found"
          description="Try adjusting your keyword search or role filter."
        />
      </div>
    );
  }

  return (
    <div className={`panel bg-surface overflow-x-auto min-h-[520px] flex flex-col justify-between transition-opacity duration-150 ${isRefetching ? 'opacity-60 pointer-events-none' : 'opacity-100'}`}>
      <table className="w-full text-left border-collapse text-xs table-fixed">
        <colgroup>
          <col className="w-[24%]" />
          <col className="w-[10%]" />
          <col className="w-[18%]" />
          <col className="w-[16%]" />
          <col className="w-[14%]" />
          <col className="w-[8%]" />
          <col className="w-[10%]" />
        </colgroup>
        <thead>
          <tr className="border-b border-line bg-paper/60 text-ink-soft uppercase text-[12px] font-sans font-medium tracking-[0.04em] h-10">
            <th className="py-2.5 px-4">Business</th>
            <th className="py-2.5 px-4">Role</th>
            <th className="py-2.5 px-4">Drug License</th>
            <th className="py-2.5 px-4">City & Phone</th>
            <th className="py-2.5 px-4">Registered</th>
            <th className="py-2.5 px-4">Status</th>
            <th className="py-2.5 px-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {users.map((user) => {
            const isAdmin = user.role === 'admin';
            const isProcessing = processingId === user._id;

            return (
              <tr key={user._id} className="hover:bg-paper/30 transition-colors h-14">
                <td className="py-3 px-4">
                  <div className="font-medium text-ink text-[14px]">{user.businessName || user.name}</div>
                  <div className="text-ink-soft text-[12px]">{user.name} • {user.email}</div>
                </td>
                <td className="py-3 px-4">
                  <Badge variant={user.role === 'supplier' ? 'brand' : user.role === 'store' ? 'info' : 'default'}>
                    {user.role}
                  </Badge>
                </td>
                <td className="py-3 px-4">
                  <CopyLicenseButton license={user.licenseNumber} />
                </td>
                <td className="py-3 px-4">
                  <div className="text-ink text-[13px]">{user.city || '—'}</div>
                  <div className="font-sans tabular-nums text-ink-soft text-[12px]">{user.phone || '—'}</div>
                </td>
                <td className="py-3 px-4">
                  <div className="font-sans tabular-nums text-ink text-[13px]">{formatDate(user.createdAt)}</div>
                  <div className="text-ink-soft text-[11px] font-sans tabular-nums">{timeAgo(user.createdAt)}</div>
                </td>
                <td className="py-3 px-4">
                  <Badge variant={user.approved ? 'success' : 'warning'}>
                    {user.approved ? 'Approved' : 'Pending'}
                  </Badge>
                </td>
                <td className="py-3 px-4 text-right">
                  {!isAdmin && (
                    <div className="inline-flex items-center gap-1.5 justify-end">
                      {!user.approved ? (
                        <>
                          <Button variant="accent" size="sm" onClick={() => onApprove(user)} disabled={isProcessing} loading={isProcessing}>
                            Approve
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => onReject(user)} disabled={isProcessing} className="text-status-expired hover:bg-status-expired-bg/40">
                            Reject
                          </Button>
                        </>
                      ) : (
                        <Button variant="ghost" size="sm" onClick={() => onRemove(user)} disabled={isProcessing} className="text-ink-soft hover:text-status-expired">
                          Remove account
                        </Button>
                      )}
                    </div>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
