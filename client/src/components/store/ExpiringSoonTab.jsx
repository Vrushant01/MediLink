import Button from '../Button';
import ExpiryBadge from '../ExpiryBadge';
import EmptyState from '../EmptyState';
import { formatDate, formatINR } from '../../utils/format';
import downloadCsv from '../../utils/csv';
import { Download, ShoppingCart } from 'lucide-react';

// Tab presenting near-expiry batches categorized by urgency brackets with fast FEFO sales triggering
export default function ExpiringSoonTab({ items = [], onSell }) {
  const handleExport = () => {
    const rows = items.map((b) => ({
      'Medicine Name': b.medicine?.name || '',
      'Generic Name': b.medicine?.genericName || '',
      'Batch Number': b.batchNo || '',
      'Rack / Shelf': b.rack || 'Unassigned',
      'Quantity': b.quantity || 0,
      'Expiry Date': formatDate(b.expiryDate),
      'Days Left': b.daysLeft ?? 0,
      'Status': b.expiryStatus,
      'Value (INR)': (b.quantity || 0) * (b.purchasePrice || 0),
    }));
    downloadCsv('expiring_batches_report', rows);
  };

  if (items.length === 0) {
    return (
      <EmptyState
        title="No batches expiring soon"
        description="No batches expiring within the next 90 days. Shelf runway is clear."
      />
    );
  }

  // Segment batches into three standard urgency tiers
  const within7 = items.filter((b) => (b.daysLeft ?? 0) <= 7);
  const within30 = items.filter((b) => (b.daysLeft ?? 0) > 7 && (b.daysLeft ?? 0) <= 30);
  const within90 = items.filter((b) => (b.daysLeft ?? 0) > 30 && (b.daysLeft ?? 0) <= 90);

  const groups = [
    { title: 'Within 7 days', items: within7, badgeColor: 'text-status-critical bg-status-critical-bg' },
    { title: '8 to 30 days', items: within30, badgeColor: 'text-status-critical bg-status-critical-bg' },
    { title: '31 to 90 days', items: within90, badgeColor: 'text-status-warning bg-status-warning-bg' },
  ].filter((g) => g.items.length > 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button variant="ghost" size="sm" onClick={handleExport}>
          <Download className="w-3.5 h-3.5 mr-1" /> Download CSV
        </Button>
      </div>

      {groups.map((group) => (
        <div key={group.title} className="panel bg-surface overflow-hidden">
          <div className="px-5 py-3.5 bg-paper/60 border-b border-line flex items-center justify-between">
            <h3 className="font-display font-medium text-[16px] text-ink">{group.title}</h3>
            <span className={`text-[11px] font-sans tabular-nums px-2 py-0.5 rounded-[4px] font-medium ${group.badgeColor}`}>
              {group.items.length} batches
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-[14px]">
              <thead>
                <tr className="border-b border-line bg-paper/60 text-ink-soft uppercase text-[12px] font-sans font-medium tracking-[0.04em] h-10">
                  <th className="py-2.5 px-4">Medicine</th>
                  <th className="py-2.5 px-4">Batch & Rack</th>
                  <th className="py-2.5 px-4 text-right">Qty</th>
                  <th className="py-2.5 px-4">Expiry Date</th>
                  <th className="py-2.5 px-4 text-right">Value</th>
                  <th className="py-2.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {group.items.map((b) => {
                  const val = (b.quantity || 0) * (b.purchasePrice || 0);
                  return (
                    <tr key={b._id} className="hover:bg-paper/40 transition-colors h-14">
                      <td className="py-3 px-4">
                        <span className="font-medium text-ink">{b.medicine?.name}</span>
                        <div className="text-[12px] text-ink-soft">{b.medicine?.strength}</div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-mono text-ink font-medium text-[13px]">{b.batchNo}</span>
                        <div className="text-[12px] text-ink-soft">{b.rack ? `Rack ${b.rack}` : '-'}</div>
                      </td>
                      <td className="py-3 px-4 font-sans tabular-nums text-right text-ink font-medium">
                        {b.quantity}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-sans tabular-nums text-ink text-[13px]">{formatDate(b.expiryDate)}</div>
                        <ExpiryBadge status={b.expiryStatus} daysLeft={b.daysLeft} />
                      </td>
                      <td className="py-3 px-4 font-sans tabular-nums text-right text-ink font-medium">
                        {formatINR(val)}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Button
                          variant="accent"
                          size="sm"
                          onClick={() => onSell(b)}
                        >
                          <ShoppingCart className="w-3.5 h-3.5 mr-1.5" /> Sell now
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
}
