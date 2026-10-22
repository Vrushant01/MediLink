import { useState, useEffect } from 'react';
import Button from '../Button';
import { Search, Sparkles } from 'lucide-react';

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

// Controls toolbar for supplier catalog filtering by search keyword, category, supplier, and sort
export default function BrowseToolbar({
  search,
  category,
  supplierId,
  sort,
  suppliers = [],
  onSearchChange,
  onCategoryChange,
  onSupplierChange,
  onSortChange,
  onOpenRestock,
}) {
  const [localSearch, setLocalSearch] = useState(search);

  // Debounce search by 300ms
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

  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      {/* Search Input */}
      <div className="relative min-w-[240px] flex-1">
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

      {/* Supplier Select */}
      <select
        value={supplierId}
        onChange={(e) => onSupplierChange(e.target.value)}
        className="h-[42px] px-3.5 rounded-[6px] border border-line bg-surface text-[14px] text-ink focus:outline-none focus:border-brand focus:ring-4 focus:ring-brand-soft/60 transition-colors"
      >
        <option value="">All Suppliers</option>
        {suppliers.map((s) => (
          <option key={s._id} value={s._id}>
            {s.businessName || s.name}
          </option>
        ))}
      </select>

      {/* Sort Select */}
      <select
        value={sort}
        onChange={(e) => onSortChange(e.target.value)}
        className="h-[42px] px-3.5 rounded-[6px] border border-line bg-surface text-[14px] text-ink focus:outline-none focus:border-brand focus:ring-4 focus:ring-brand-soft/60 transition-colors"
      >
        <option value="price">Lowest price</option>
        <option value="expiry">Longest shelf life</option>
        <option value="name">Name</option>
      </select>

      {/* Restock Helper Button */}
      <Button variant="outline" onClick={onOpenRestock} className="gap-2 text-[14px] text-brand border-brand/30 hover:bg-brand-soft/30">
        <Sparkles className="w-4 h-4" /> Restock low items
      </Button>
    </div>
  );
}
