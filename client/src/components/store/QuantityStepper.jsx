import { Plus, Minus } from 'lucide-react';

// Compact quantity stepper component with strict boundary clamping between MOQ and available stock
export default function QuantityStepper({
  value,
  min = 1,
  max = 9999,
  onChange,
  disabled = false,
  size = 'sm',
}) {
  const currentVal = Number(value) || min;

  const handleDecrement = (e) => {
    e.stopPropagation();
    if (currentVal > min) {
      onChange(Math.max(min, currentVal - 1));
    }
  };

  const handleIncrement = (e) => {
    e.stopPropagation();
    if (currentVal < max) {
      onChange(Math.min(max, currentVal + 1));
    }
  };

  const handleInputChange = (e) => {
    const raw = parseInt(e.target.value, 10);
    if (isNaN(raw)) {
      onChange(min);
    } else {
      const clamped = Math.max(min, Math.min(raw, max));
      onChange(clamped);
    }
  };

  const isSm = size === 'sm';
  const btnSize = isSm ? 'w-6 h-6' : 'w-8 h-8';
  const inputHeight = isSm ? 'h-6 text-xs w-12' : 'h-8 text-sm w-16';

  return (
    <div
      className="inline-flex items-center rounded-[6px] border border-line bg-surface p-0.5 select-none"
      onClick={(e) => e.stopPropagation()}
    >
      <button
        type="button"
        onClick={handleDecrement}
        disabled={disabled || currentVal <= min}
        className={`${btnSize} flex items-center justify-center rounded-[4px] text-ink-soft hover:text-ink hover:bg-paper active:bg-[#ECE7DA] disabled:opacity-30 disabled:pointer-events-none transition-colors`}
        aria-label="Decrease quantity"
      >
        <Minus className="w-3 h-3 stroke-[2]" />
      </button>

      <input
        type="number"
        min={min}
        max={max}
        value={currentVal}
        onChange={handleInputChange}
        disabled={disabled}
        className={`${inputHeight} font-sans tabular-nums text-center font-medium text-ink bg-transparent focus:outline-none`}
      />

      <button
        type="button"
        onClick={handleIncrement}
        disabled={disabled || currentVal >= max}
        className={`${btnSize} flex items-center justify-center rounded-[4px] text-ink-soft hover:text-ink hover:bg-paper active:bg-[#ECE7DA] disabled:opacity-30 disabled:pointer-events-none transition-colors`}
        aria-label="Increase quantity"
      >
        <Plus className="w-3 h-3 stroke-[2]" />
      </button>
    </div>
  );
}
