import Button from '../Button';
import EmptyState from '../EmptyState';
import { formatDate, formatINR } from '../../utils/format';
import downloadCsv from '../../utils/csv';
import { AlertCircle, Download } from 'lucide-react';

// Tab presenting expired inventory batches with write-off capability and CSV download
export default function ExpiredTab({ items = [], onWriteOff }) {
  const handleExport = () => {
    const rows = items.map((b) => ({
      'Medicine Name': b.medicine?.name || '',
      'Generic Name': b.medicine?.genericName || '',
      'Batch Number': b.batchNo || '',
      'Rack / Shelf': b.rack || 'Unassigned',
      'Quantity': b.quantity || 0,
      'Expiry Date': formatDate(b.expiryDate),
      'Days Ago': Math.abs(b.daysLeft ?? 0),
      'Unit Cost': b.purchasePrice || 0,
      'Value (INR)': (b.quantity || 0) * (b.purchasePrice || 0),
    }));
    downloadCsv('expired_batches_report', rows);
  };

  if (items.length === 0) {
    return (
      <EmptyState
        title="Zero expired batches"
        description="No expired stock found. Your shelves are fully compliant."
      />
    );
  }

  return (
    <div className="space-y-4">
      {/* Calm warning box */}
      <div className="p-3.5 rounded-[6px] border border-[#F5C2BC] bg-status-expired-bg/40 text-status-expired text-xs flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>Expired medicines must not be sold. Return them to the supplier or dispose of them as per regulations.</span>
        </div>
        <Button variant="ghost" size="sm" onClick={handleExport} className="shrink-0 text-status-expired hover:bg-status-expired-bg">
          <Download className="w-3.5 h-3.5 mr-1" /> Download CSV
        </Button>
      </div>

      <div className="panel bg-surface overflow-x-auto">
        <table className="w-full text-left border-collapse text-[14px]">
          <thead>
            <tr className="border-b border-line bg-paper/60 text-ink-soft uppercase text-[12px] font-sans font-medium tracking-[0.04em] h-10">
              <th className="py-2.5 px-4">Medicine</th>
              <th className="py-2.5 px-4">Batch & Rack</th>
              <th className="py-2.5 px-4 text-right">Qty</th>
              <th className="py-2.5 px-4">Expired Date</th>
              <th className="py-2.5 px-4">Days Ago</th>
              <th className="py-2.5 px-4 text-right">Value</th>
              <th className="py-2.5 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {items.map((b) => {
              const val = (b.quantity || 0) * (b.purchasePrice || 0);
              const daysAgo = Math.abs(b.daysLeft ?? 0);

              return (
                <tr key={b._id} className="hover:bg-status-expired-bg/20 transition-colors h-14">
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
                  <td className="py-3 px-4 font-sans tabular-nums text-status-expired">
                    {formatDate(b.expiryDate)}
                  </td>
                  <td className="py-3 px-4 font-sans tabular-nums text-ink-soft">
                    {daysAgo} days ago
                  </td>
                  <td className="py-3 px-4 font-sans tabular-nums text-right text-ink font-medium">
                    {formatINR(val)}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onWriteOff(b)}
                      className="text-status-expired border-status-expired/30 hover:bg-status-expired-bg"
                    >
                      Write off
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
