import Input from '../Input';
import { AlertTriangle } from 'lucide-react';

// Form inputs grid for batch details, expiry date, pricing, and storage location
export default function BatchFormFields({ formData, onChange }) {
  // Check if chosen expiry date is in the past
  const isPastExpiry =
    formData.expiryDate &&
    new Date(formData.expiryDate).setHours(0, 0, 0, 0) < new Date().setHours(0, 0, 0, 0);

  return (
    <div className="space-y-4">
      {/* 2-Column: Batch & Qty */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Input
          id="batchNo"
          label="Batch Number"
          value={formData.batchNo}
          onChange={onChange}
          placeholder="e.g. BATCH-DL-26"
          required
        />
        <Input
          id="quantity"
          label="Quantity (Units)"
          type="number"
          min="0"
          value={formData.quantity}
          onChange={onChange}
          placeholder="e.g. 50"
          required
        />
      </div>

      {/* Expiry Date with Past Warning */}
      <div>
        <Input
          id="expiryDate"
          label="Expiry Date"
          type="date"
          value={formData.expiryDate}
          onChange={onChange}
          required
        />
        {isPastExpiry && (
          <p className="mt-1.5 text-xs text-status-warning flex items-center gap-1.5 font-medium">
            <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
            This batch is already expired. It will be logged as expired stock.
          </p>
        )}
      </div>

      {/* Financials: Purchase Price & MRP */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Input
          id="purchasePrice"
          label="Purchase Price (₹)"
          type="number"
          step="0.01"
          min="0"
          value={formData.purchasePrice}
          onChange={onChange}
          placeholder="e.g. 26.50"
        />
        <Input
          id="mrp"
          label="MRP (₹)"
          type="number"
          step="0.01"
          min="0"
          value={formData.mrp}
          onChange={onChange}
          placeholder="e.g. 34.00"
        />
      </div>

      {/* Position: Reorder level & Rack */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Input
          id="reorderLevel"
          label="Reorder Threshold"
          type="number"
          min="0"
          value={formData.reorderLevel}
          onChange={onChange}
          placeholder="Default 20"
        />
        <Input
          id="rack"
          label="Rack / Shelf Tag"
          value={formData.rack}
          onChange={onChange}
          placeholder="e.g. A1, B4"
        />
      </div>
    </div>
  );
}
