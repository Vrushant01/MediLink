import Button from '../Button';
import Skeleton from '../Skeleton';
import EmptyState from '../EmptyState';
import { Phone, MapPin, Package } from 'lucide-react';

// Grid of verified wholesale suppliers with medicine counts and direct catalog filtering
export default function SuppliersTab({ suppliers = [], loading, onSelectSupplier }) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="panel bg-surface p-5 flex flex-col justify-between h-[190px]">
            <div>
              <Skeleton className="h-5 w-48" />
              <div className="mt-3.5 space-y-2">
                <Skeleton className="h-3.5 w-28" />
                <Skeleton className="h-3.5 w-36" />
              </div>
            </div>
            <div className="pt-3 border-t border-line/70 flex items-center justify-between">
              <Skeleton className="h-3.5 w-28" />
              <Skeleton className="h-7 w-28 rounded-[6px]" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (suppliers.length === 0) {
    return (
      <EmptyState
        title="No approved suppliers"
        description="There are currently no verified wholesale suppliers available."
      />
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {suppliers.map((s) => (
        <div
          key={s._id}
          className="panel bg-surface p-5 flex flex-col justify-between hover:border-ink-soft/40 transition-colors"
        >
          <div>
            <h3 className="panel-title text-ink">
              {s.businessName || s.name}
            </h3>

            <div className="mt-3 space-y-1.5 text-[13px] text-ink-soft">
              {s.city && (
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 shrink-0" />
                  <span>{s.city}</span>
                </div>
              )}
              {s.phone && (
                <div className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 shrink-0" />
                  <span className="font-sans tabular-nums">{s.phone}</span>
                </div>
              )}
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-line flex items-center justify-between">
            <span className="font-sans tabular-nums text-[13px] text-ink-soft">
              In stock: <strong className="text-ink font-medium">{s.itemsCount || 0}</strong> medicines
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onSelectSupplier(s._id)}
            >
              View medicines
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
