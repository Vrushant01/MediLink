import { Info } from 'lucide-react';

// Displays sequential FEFO allocation breakdown of upcoming batches for a sale
export default function FefoPreview({ plan = [] }) {
  if (!plan || plan.length === 0) return null;

  return (
    <div className="panel p-3.5 bg-brand-soft/20 border border-brand/20 rounded-[6px] text-xs">
      <div className="flex items-center gap-1.5 text-brand font-medium mb-1.5 text-[13px] font-sans">
        <Info className="w-3.5 h-3.5" />
        <span>FEFO allocation preview:</span>
      </div>
      <div className="space-y-1 text-ink pl-5">
        {plan.map((item, idx) => (
          <div key={item.batchNo} className="font-sans tabular-nums text-[12px]">
            {idx > 0 && <span className="text-ink-soft">then </span>}
            Batch <span className="font-mono font-medium">{item.batchNo}</span>: {item.taken} units{' '}
            <span className="text-ink-soft">
              ({item.days < 0 ? 'expired' : `expires in ${item.days} days`})
            </span>
          </div>
        ))}
      </div>
      <p className="mt-2 text-[10px] text-ink-soft border-t border-brand/10 pt-1.5">
        Earliest expiry is always sold first.
      </p>
    </div>
  );
}
