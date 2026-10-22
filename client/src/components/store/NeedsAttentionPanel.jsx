import { Link } from 'react-router-dom';
import ExpiryBadge from '../ExpiryBadge';
import EmptyState from '../EmptyState';
import { ArrowRight } from 'lucide-react';

// Left-side urgency panel highlighting expired and critical batches needing immediate store attention
export default function NeedsAttentionPanel({ batches = [] }) {
  // Separate expired and critical batches, sort critical by soonest days left
  const expired = batches.filter((b) => b.expiryStatus === 'expired');
  const critical = batches
    .filter((b) => b.expiryStatus === 'critical')
    .sort((a, b) => (a.daysLeft ?? 0) - (b.daysLeft ?? 0));

  const items = [...expired, ...critical].slice(0, 5);

  return (
    <div className="panel bg-surface p-5 sm:p-6 flex flex-col justify-between h-full min-w-0 overflow-hidden">
      <div>
        <div className="flex items-baseline justify-between gap-4 mb-4">
          <div>
            <h2 className="panel-title">Needs attention</h2>
            <p className="text-[13px] text-ink-soft mt-0.5">Batches requiring prompt clearance or write-off</p>
          </div>
          <span className="badge shrink-0">
            {items.length} urgent
          </span>
        </div>

        {items.length === 0 ? (
          <EmptyState
            title="Clean shelf status"
            description="Nothing is close to expiry. Good shelf discipline."
          />
        ) : (
          <div className="divide-y divide-line/70 border-t border-line/70">
            {items.map((item) => {
              const isExpired = item.expiryStatus === 'expired';
              const borderClass = isExpired ? 'border-l-status-expired bg-status-expired-bg/20' : 'border-l-status-critical bg-status-critical-bg/15';

              return (
                <div
                  key={item._id}
                  className={`grid grid-cols-[1fr_80px_110px_40px] items-center gap-3 py-2.5 px-3 border-l-[3px] ${borderClass} hover:bg-paper/60 transition-colors`}
                >
                  {/* Medicine Name, Strength, Batch & Rack */}
                  <div className="min-w-0 pr-1">
                    <div className="flex items-center truncate">
                      <span className="text-[14px] font-sans font-medium text-ink truncate">
                        {item.medicine?.name}
                      </span>
                      {item.medicine?.strength && (
                        <span className="text-[13px] text-ink-soft font-sans font-normal ml-1.5 shrink-0">
                          {item.medicine.strength}
                        </span>
                      )}
                    </div>
                    <div className="text-[12px] font-sans text-ink-soft truncate mt-0.5">
                      Batch <span className="font-mono text-ink-soft/90">{item.batchNo}</span>
                      {item.rack ? ` • Rack ${item.rack}` : ''}
                    </div>
                  </div>

                  {/* Units */}
                  <div className="text-right whitespace-nowrap">
                    <span className="text-[14px] font-sans font-medium tabular-nums text-ink">
                      {item.quantity}
                    </span>
                    <span className="text-[12px] font-sans text-ink-soft font-normal ml-1">
                      units
                    </span>
                  </div>

                  {/* Expiry Badge */}
                  <div className="flex justify-center">
                    <ExpiryBadge status={item.expiryStatus} daysLeft={item.daysLeft} />
                  </div>

                  {/* Quiet View Button */}
                  <div className="text-right">
                    <Link
                      to="/store/alerts"
                      className="text-[13px] font-sans text-ink-soft hover:text-ink font-medium hover:underline p-1"
                    >
                      View
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="pt-4 mt-4 border-t border-line text-right">
        <Link
          to="/store/alerts"
          className="inline-flex items-center gap-1.5 text-[13px] text-brand hover:underline font-medium"
        >
          See all alerts
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
