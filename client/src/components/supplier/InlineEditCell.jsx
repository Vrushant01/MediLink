import { useState, useRef, useEffect } from 'react';
import Badge from '../Badge';
import { Check } from 'lucide-react';

// Click-to-edit table cell supporting inline numeric updates with Enter/blur saving and Escape cancellation
export default function InlineEditCell({
  value,
  min = 0,
  step = '1',
  format,
  onSave,
  showStockBadges = false,
}) {
  const [editing, setEditing] = useState(false);
  const [tempVal, setTempVal] = useState(value);
  const [savedTick, setSavedTick] = useState(false);
  const [saving, setSaving] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    setTempVal(value);
  }, [value]);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing]);

  const handleCommit = async () => {
    if (!editing) return;
    const num = Number(tempVal);

    if (isNaN(num) || num < min) {
      setTempVal(value);
      setEditing(false);
      return;
    }

    if (num === Number(value)) {
      setEditing(false);
      return;
    }

    setSaving(true);
    try {
      await onSave(num);
      setEditing(false);
      setSavedTick(true);
      setTimeout(() => setSavedTick(false), 1500);
    } catch (err) {
      setTempVal(value);
      setEditing(false);
    } finally {
      setSaving(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleCommit();
    } else if (e.key === 'Escape') {
      setTempVal(value);
      setEditing(false);
    }
  };

  const numVal = Number(value);

  return (
    <div className="relative inline-flex items-center gap-1.5 font-sans tabular-nums text-[14px] select-none">
      {editing ? (
        <input
          ref={inputRef}
          type="number"
          min={min}
          step={step}
          value={tempVal}
          onChange={(e) => setTempVal(e.target.value)}
          onBlur={handleCommit}
          onKeyDown={handleKeyDown}
          disabled={saving}
          className="w-20 h-7 px-1.5 font-sans tabular-nums text-[13px] font-medium text-ink bg-surface border border-brand rounded-[4px] focus:outline-none ring-1 ring-brand"
        />
      ) : (
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="text-left font-sans tabular-nums font-medium hover:bg-paper px-1.5 py-0.5 rounded-[4px] border border-transparent hover:border-line transition-colors flex items-center gap-1"
          title="Click to edit value"
        >
          <span>{format ? format(value) : value}</span>
          {savedTick && <Check className="w-3.5 h-3.5 text-status-safe stroke-[2.5]" />}
        </button>
      )}

      {/* Low stock and Sold out indicators */}
      {showStockBadges && !editing && (
        <>
          {numVal === 0 && (
            <span className="px-1.5 py-0.5 rounded-[4px] text-[11px] font-sans font-medium bg-status-expired-bg text-status-expired border border-[#F5C2BC]">
              Sold out
            </span>
          )}
          {numVal > 0 && numVal < 20 && (
            <Badge variant="warning" size="sm">
              Low
            </Badge>
          )}
        </>
      )}
    </div>
  );
}
