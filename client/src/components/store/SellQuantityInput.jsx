import { Plus, Minus } from 'lucide-react';

// Numeric stepper input for selecting quantity to sell with boundary checks
export default function SellQuantityInput({ quantity, totalSellable, submitting, onIncrement, onDecrement, onChange }) {
  return (
    <div>
      <label className="block text-[13px] font-sans font-medium text-ink-soft mb-1.5">
        Quantity to dispense
      </label>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onDecrement}
          disabled={quantity <= 1 || submitting}
          className="w-11 h-11 rounded-[6px] border border-line bg-surface hover:bg-paper active:bg-[#EAE4D8] flex items-center justify-center text-ink disabled:opacity-40"
          aria-label="Decrease quantity"
        >
          <Minus className="w-4 h-4" />
        </button>
        <input
          type="number"
          min="1"
          max={totalSellable}
          value={quantity}
          onChange={onChange}
          disabled={submitting}
          className="flex-1 h-11 rounded-[6px] border border-line bg-surface text-center font-sans tabular-nums text-lg font-medium text-ink focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent"
        />
        <button
          type="button"
          onClick={onIncrement}
          disabled={quantity >= totalSellable || submitting}
          className="w-11 h-11 rounded-[6px] border border-line bg-surface hover:bg-paper active:bg-[#EAE4D8] flex items-center justify-center text-ink disabled:opacity-40"
          aria-label="Increase quantity"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
