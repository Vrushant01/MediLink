import { formatDate } from '../../utils/format';
import { CheckCircle2, Clock, Truck, PackageCheck, AlertCircle } from 'lucide-react';

const STATUS_CONFIG = [
  { key: 'placed', label: 'Order Placed', icon: Clock },
  { key: 'accepted', label: 'Accepted by Supplier', icon: CheckCircle2 },
  { key: 'dispatched', label: 'Dispatched for Delivery', icon: Truck },
  { key: 'delivered', label: 'Delivered', icon: PackageCheck },
];

// Clean vertical order lifecycle timeline illustrating progression through fulfillment stages
export default function OrderTimeline({ status, createdAt, updatedAt, note, isRejected }) {
  if (isRejected) {
    return (
      <div className="space-y-2">
        <h4 className="text-[13px] font-sans font-medium text-ink-soft">
          Fulfillment Status
        </h4>
        <div className="p-3 rounded-[6px] bg-status-expired-bg/40 border border-[#F5C2BC] text-status-expired space-y-1">
          <div className="flex items-center gap-1.5 font-medium text-[13px]">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>Order Rejected</span>
          </div>
          {note && <p className="text-[12px] text-ink font-sans">{note}</p>}
        </div>
      </div>
    );
  }

  const steps = ['placed', 'accepted', 'dispatched', 'delivered'];
  const currentIndex = steps.indexOf(status);

  return (
    <div className="space-y-3">
      <h4 className="text-[13px] font-sans font-medium text-ink-soft">
        Fulfillment Timeline
      </h4>

      <div className="space-y-3 pl-1">
        {STATUS_CONFIG.map((cfg, idx) => {
          const isDone = idx <= currentIndex;
          const isCurrent = idx === currentIndex;
          const Icon = cfg.icon;

          return (
            <div key={cfg.key} className="flex items-start gap-3">
              <div className="flex flex-col items-center">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${
                    isDone
                      ? 'bg-brand text-surface'
                      : 'border border-line bg-paper text-ink-soft/40'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                </div>
                {idx < STATUS_CONFIG.length - 1 && (
                  <div
                    className={`w-0.5 h-6 transition-colors ${
                      idx < currentIndex ? 'bg-brand' : 'bg-line'
                    }`}
                  />
                )}
              </div>

              <div className="pt-0.5 min-w-0">
                <p
                  className={`text-[13px] ${
                    isCurrent
                      ? 'font-medium text-ink'
                      : isDone
                      ? 'text-ink-soft font-medium'
                      : 'text-ink-soft/50'
                  }`}
                >
                  {cfg.label}
                </p>
                {isCurrent && (
                  <p className="text-[11px] font-sans tabular-nums text-ink-soft">
                    {cfg.key === 'placed' ? formatDate(createdAt) : formatDate(updatedAt || createdAt)}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {note && (
        <div className="p-2.5 rounded-[6px] bg-paper text-[12px] text-ink border border-line">
          <span className="text-[12px] font-sans font-medium text-ink-soft block mb-0.5">Note:</span>
          {note}
        </div>
      )}
    </div>
  );
}
