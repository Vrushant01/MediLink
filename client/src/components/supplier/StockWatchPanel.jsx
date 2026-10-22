import { useState } from 'react';
import ExpiryBadge from '../ExpiryBadge';
import Button from '../Button';
import EmptyState from '../EmptyState';
import api from '../../api/axios';
import { useToast } from '../../context/ToastContext';
import { AlertTriangle, PackageCheck } from 'lucide-react';

// Priority alerts panel monitoring low catalog supplies and approaching batch expirations
export default function StockWatchPanel({ listings = [], onStockUpdated }) {
  const toast = useToast();
  const [stockInputs, setStockInputs] = useState({});
  const [savingId, setSavingId] = useState(null);

  const runningLow = listings.filter((l) => (l.stock ?? 0) < 20);
  const shortShelfLife = listings.filter(
    (l) => l.daysLeft !== null && l.daysLeft < 180
  );

  const handleStockSave = async (listingId) => {
    const raw = stockInputs[listingId];
    const newStock = parseInt(raw, 10);
    if (isNaN(newStock) || newStock < 0) return;

    setSavingId(listingId);
    try {
      await api.put(`/catalog/${listingId}`, { stock: newStock });
      toast.success('Stock quantity updated');
      onStockUpdated?.();
      setStockInputs((prev) => {
        const next = { ...prev };
        delete next[listingId];
        return next;
      });
    } catch (err) {
      toast.error('Failed to update stock');
    } finally {
      setSavingId(null);
    }
  };

  if (runningLow.length === 0 && shortShelfLife.length === 0) {
    return (
      <div className="panel bg-surface p-5">
        <EmptyState
          title="Catalog stock healthy"
          description="No listings are below 20 units or expiring within 180 days."
        />
      </div>
    );
  }

  return (
    <div className="panel bg-surface p-6 space-y-5">
      <h3 className="panel-title text-ink pb-2 border-b border-line">
        Stock to watch
      </h3>

      {/* 1. Running Low Group */}
      {runningLow.length > 0 && (
        <div className="space-y-2.5">
          <div className="flex items-center justify-between text-[13px] font-sans font-medium text-status-critical">
            <span>Running low (&lt; 20 units)</span>
            <span className="tabular-nums">{runningLow.length} items</span>
          </div>
          <div className="divide-y divide-line border border-line rounded-[6px] overflow-hidden text-[14px]">
            {runningLow.slice(0, 5).map((l) => (
              <div key={l._id} className="p-3 bg-surface flex items-center justify-between gap-3">
                <div className="min-w-0 pr-2">
                  <p className="font-medium text-ink truncate text-[14px]">{l.medicine?.name}</p>
                  <p className="text-[12px] font-sans text-ink-soft">
                    Current stock: <strong className="text-status-critical font-medium tabular-nums">{l.stock}</strong> units
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <input
                    type="number"
                    min="0"
                    placeholder="New qty"
                    value={stockInputs[l._id] ?? ''}
                    onChange={(e) =>
                      setStockInputs((prev) => ({ ...prev, [l._id]: e.target.value }))
                    }
                    className="w-20 h-9 px-2 border border-line rounded-[4px] font-sans tabular-nums text-[13px] text-ink focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand-soft"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-9 px-3 text-[13px]"
                    disabled={stockInputs[l._id] === undefined || savingId === l._id}
                    onClick={() => handleStockSave(l._id)}
                  >
                    Save
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. Short Shelf Life Group */}
      {shortShelfLife.length > 0 && (
        <div className="space-y-2.5">
          <div className="flex items-center justify-between text-[13px] font-sans font-medium text-status-warning">
            <span>Short shelf life (&lt; 180 days)</span>
            <span className="tabular-nums">{shortShelfLife.length} batches</span>
          </div>
          <div className="divide-y divide-line border border-line rounded-[6px] overflow-hidden text-[14px]">
            {shortShelfLife.slice(0, 5).map((l) => (
              <div key={l._id} className="p-3 bg-surface hover:bg-paper/30 transition-colors">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium text-ink truncate text-[14px]">{l.medicine?.name}</span>
                  <ExpiryBadge status={l.expiryStatus} daysLeft={l.daysLeft} />
                </div>
                <p className="caption text-ink-soft mt-1">
                  Stores avoid short-dated stock. Consider lowering the price.
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
