import { useNavigate } from 'react-router-dom';
import Button from '../Button';
import EmptyState from '../EmptyState';
import downloadCsv from '../../utils/csv';
import { Download, Search } from 'lucide-react';

// Tab presenting low-stock formulations below reorder levels with stock meters and direct catalog search
export default function LowStockTab({ items = [] }) {
  const navigate = useNavigate();

  const handleExport = () => {
    const rows = items.map((item) => ({
      'Medicine Name': item.medicine?.name || '',
      'Generic Name': item.medicine?.genericName || '',
      'Current Stock': item.quantity || 0,
      'Reorder Threshold': item.reorderLevel || 20,
      'Suggested Order Qty': item.suggestedReorderQty || 0,
      'Rack': item.rack || 'Unassigned',
    }));
    downloadCsv('low_stock_report', rows);
  };

  if (items.length === 0) {
    return (
      <EmptyState
        title="Stock levels healthy"
        description="All medicines are currently above reorder thresholds."
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button variant="ghost" size="sm" onClick={handleExport}>
          <Download className="w-3.5 h-3.5 mr-1" /> Download CSV
        </Button>
      </div>

      <div className="panel bg-surface overflow-x-auto">
        <table className="w-full text-left border-collapse text-[14px]">
          <thead>
            <tr className="border-b border-line bg-paper/60 text-ink-soft uppercase text-[12px] font-sans font-medium tracking-[0.04em] h-10">
              <th className="py-2.5 px-4">Medicine</th>
              <th className="py-2.5 px-4 text-right">Current Stock</th>
              <th className="py-2.5 px-4 text-right">Reorder Level</th>
              <th className="py-2.5 px-4 min-w-[140px]">Stock vs Reorder</th>
              <th className="py-2.5 px-4 text-right">Suggested Order</th>
              <th className="py-2.5 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {items.map((item) => {
              const current = item.quantity || 0;
              const target = item.reorderLevel || 20;
              const ratioPct = Math.min(100, Math.round((current / target) * 100));

              return (
                <tr key={item.medicine?._id} className="hover:bg-paper/40 transition-colors h-14">
                  <td className="py-3 px-4">
                    <span className="font-medium text-ink">{item.medicine?.name}</span>
                    <div className="text-[12px] text-ink-soft">
                      {item.medicine?.genericName} • {item.medicine?.strength}
                    </div>
                  </td>

                  <td className="py-3 px-4 font-sans tabular-nums text-right font-medium text-status-critical">
                    {current}
                  </td>

                  <td className="py-3 px-4 font-sans tabular-nums text-right text-ink-soft">
                    {target}
                  </td>

                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      {/* 6px bar showing current vs reorder level */}
                      <div className="flex-1 h-1.5 bg-paper rounded-full overflow-hidden border border-line">
                        <div
                          style={{ width: `${ratioPct}%` }}
                          className={`h-full ${
                            ratioPct < 30 ? 'bg-status-expired' : 'bg-status-warning'
                          }`}
                        />
                      </div>
                      <span className="font-sans tabular-nums text-[12px] text-ink-soft w-10 text-right">
                        {ratioPct}%
                      </span>
                    </div>
                  </td>

                  <td className="py-3 px-4 font-sans tabular-nums text-right font-medium text-ink">
                    +{item.suggestedReorderQty}
                  </td>

                  <td className="py-3 px-4 text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigate(`/store/browse?search=${encodeURIComponent(item.medicine?.name || '')}`)}
                      className="text-brand hover:text-ink font-medium"
                    >
                      <Search className="w-3.5 h-3.5 mr-1" /> Find suppliers
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
