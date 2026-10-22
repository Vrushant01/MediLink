import { useState, useEffect } from 'react';
import Button from '../Button';
import { Search, Plus } from 'lucide-react';

const CATEGORIES = [
  'All Categories',
  'Painkiller',
  'Antibiotic',
  'Antacid',
  'Diabetes',
  'Cardiovascular',
  'Nutritional',
  'Antiallergic',
  'Respiratory',
  'Antifungal',
  'Electrolyte',
  'Antiseptic',
];

// Top inventory control toolbar managing search, category, status tabs, sort, and switch toggle
export default function InventoryToolbar({
  search,
  category,
  status,
  lowStock,
  sort,
  summary,
  onSearchChange,
  onCategoryChange,
  onStatusChange,
  onLowStockChange,
  onSortChange,
  onAddBatch,
}) {
  const [localSearch, setLocalSearch] = useState(search);

  // Debounce search input by 300ms
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localSearch !== search) {
        onSearchChange(localSearch);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [localSearch, search, onSearchChange]);

  useEffect(() => {
    setLocalSearch(search);
  }, [search]);

  // Status segment counts
  const total = summary?.totalBatches || 0;
  const expired = summary?.expiredCount || 0;
  const critical = summary?.criticalCount || 0;
  const warning = summary?.warningCount || 0;
  const safe = Math.max(0, total - (expired + critical + warning));

  const segments = [
    { key: '', label: 'All', count: total },
    { key: 'expired', label: 'Expired', count: expired },
    { key: 'critical', label: 'Critical', count: critical },
    { key: 'warning', label: 'Warning', count: warning },
    { key: 'safe', label: 'Safe', count: safe },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Search input with lucide icon */}
        <div className="relative min-w-[260px] flex-1">
          <Search className="w-4 h-4 text-ink-soft absolute left-3.5 top-3.5" />
          <input
            type="text"
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            placeholder="Search medicine or generic name..."
            className="w-full h-[42px] pl-10 pr-3.5 rounded-[6px] border border-line bg-surface text-[14px] text-ink placeholder:text-ink-soft/60 focus:outline-none focus:border-brand focus:ring-4 focus:ring-brand-soft/60 transition-colors"
          />
        </div>

        {/* Category Select */}
        <select
          value={category}
          onChange={(e) => onCategoryChange(e.target.value)}
          className="h-[42px] px-3.5 rounded-[6px] border border-line bg-surface text-[14px] text-ink focus:outline-none focus:border-brand focus:ring-4 focus:ring-brand-soft/60 transition-colors"
        >
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat === 'All Categories' ? '' : cat}>
              {cat}
            </option>
          ))}
        </select>

        {/* Sort Select */}
        <select
          value={sort}
          onChange={(e) => onSortChange(e.target.value)}
          className="h-[42px] px-3.5 rounded-[6px] border border-line bg-surface text-[14px] text-ink focus:outline-none focus:border-brand focus:ring-4 focus:ring-brand-soft/60 transition-colors"
        >
          <option value="expiry">Soonest expiry</option>
          <option value="name">Name</option>
          <option value="quantity">Lowest quantity</option>
        </select>

        {/* Add Batch Button */}
        <Button variant="accent" onClick={onAddBatch}>
          <Plus className="w-4 h-4 mr-1.5" /> Add batch
        </Button>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
        {/* Status segmented control */}
        <div className="inline-flex rounded-[6px] border border-line p-1 bg-paper gap-1 text-[13px]">
          {segments.map((seg) => {
            const active = (status || '') === seg.key;
            return (
              <button
                key={seg.key}
                type="button"
                onClick={() => onStatusChange(seg.key)}
                className={`px-3 py-1.5 rounded-[4px] font-sans text-[13px] transition-colors duration-150 flex items-center gap-1.5 select-none ${
                  active
                    ? 'bg-ink text-surface font-medium shadow-none'
                    : 'text-ink-soft hover:text-ink hover:bg-surface/60'
                }`}
              >
                <span>{seg.label}</span>
                <span className={`text-[11px] font-sans tabular-nums px-1.5 py-0.5 rounded transition-colors duration-150 ${active ? 'bg-white/20 text-white font-medium' : 'bg-surface border border-line text-ink-soft'}`}>
                  {seg.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Low Stock Toggle Switch */}
        <label className="inline-flex items-center gap-2.5 cursor-pointer text-[13px] select-none group">
          <input
            type="checkbox"
            checked={Boolean(lowStock)}
            onChange={(e) => onLowStockChange(e.target.checked)}
            className="sr-only peer"
          />
          <div className="relative w-9 h-5 bg-line rounded-full transition-colors duration-150 peer-checked:bg-brand peer-focus:ring-2 peer-focus:ring-brand peer-focus:ring-offset-2 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-surface after:rounded-full after:h-4 after:w-4 after:transition-transform after:duration-150 peer-checked:after:translate-x-4"></div>
          <span className="font-medium text-ink group-hover:text-brand transition-colors">Low stock only</span>
        </label>
      </div>
    </div>
  );
}
