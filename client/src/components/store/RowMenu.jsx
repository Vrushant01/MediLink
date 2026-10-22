import { useState, useRef, useEffect } from 'react';
import { MoreHorizontal, ShoppingCart, Edit2, Trash2 } from 'lucide-react';

// Contextual action popover for table rows providing Sell, Edit, and Delete actions
export default function RowMenu({ onSell, onEdit, onDelete }) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  return (
    <div className="relative inline-block text-left" ref={menuRef}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="w-8 h-8 rounded-[4px] border border-transparent hover:border-line hover:bg-paper flex items-center justify-center text-ink-soft hover:text-ink transition-colors"
        aria-label="Row actions"
      >
        <MoreHorizontal className="w-4 h-4" />
      </button>

      {open && (
        <div className="absolute right-0 mt-1 w-32 bg-surface border border-line rounded-[6px] shadow-soft z-20 py-1 text-xs animate-fade-in divide-y divide-line">
          <div>
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                onSell();
              }}
              className="w-full text-left px-3 py-2 flex items-center gap-2 text-ink hover:bg-paper transition-colors font-medium"
            >
              <ShoppingCart className="w-3.5 h-3.5 text-brand" />
              Sell
            </button>
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                onEdit();
              }}
              className="w-full text-left px-3 py-2 flex items-center gap-2 text-ink hover:bg-paper transition-colors font-medium"
            >
              <Edit2 className="w-3.5 h-3.5 text-ink-soft" />
              Edit
            </button>
          </div>
          <div>
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                onDelete();
              }}
              className="w-full text-left px-3 py-2 flex items-center gap-2 text-status-expired hover:bg-status-expired-bg/40 transition-colors font-medium"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Delete
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
