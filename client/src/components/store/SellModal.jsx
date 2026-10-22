import { useState, useMemo } from 'react';
import Modal from '../Modal';
import Button from '../Button';
import FefoPreview from './FefoPreview';
import SellQuantityInput from './SellQuantityInput';
import api from '../../api/axios';
import { useToast } from '../../context/ToastContext';
import { getDaysLeft } from '../../utils/format';

// Fast sales modal calculating FEFO stock depletion preview in real-time
export default function SellModal({ isOpen, onClose, medicine, batches = [], onSuccess }) {
  const toast = useToast();
  const [quantity, setQuantity] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const medId = medicine?._id ? medicine._id.toString() : medicine?.toString();

  // Filter non-expired active batches of this medicine and sort earliest expiry first
  const activeBatches = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return batches
      .filter((b) => {
        const bMedId = b.medicine?._id ? b.medicine._id.toString() : b.medicine?.toString();
        const exp = new Date(b.expiryDate);
        return bMedId === medId && b.quantity > 0 && exp >= today;
      })
      .sort((a, b) => new Date(a.expiryDate) - new Date(b.expiryDate));
  }, [batches, medId]);

  const totalSellable = useMemo(() => {
    return activeBatches.reduce((sum, b) => sum + (b.quantity || 0), 0);
  }, [activeBatches]);

  // Simulate FEFO deduction preview
  const fefoPlan = useMemo(() => {
    const qtyToSell = Number(quantity);
    if (!qtyToSell || qtyToSell <= 0 || activeBatches.length === 0) return [];

    let remaining = qtyToSell;
    const plan = [];

    for (const b of activeBatches) {
      if (remaining <= 0) break;
      const take = Math.min(b.quantity, remaining);
      const days = b.daysLeft ?? getDaysLeft?.(b.expiryDate) ?? 0;
      plan.push({ batchNo: b.batchNo, taken: take, days });
      remaining -= take;
    }
    return plan;
  }, [quantity, activeBatches]);

  const handleIncrement = () => {
    if (quantity < totalSellable) {
      setQuantity((q) => Number(q) + 1);
      setError('');
    }
  };

  const handleDecrement = () => {
    if (quantity > 1) {
      setQuantity((q) => Number(q) - 1);
      setError('');
    }
  };

  const handleQuantityChange = (e) => {
    const val = parseInt(e.target.value, 10);
    if (isNaN(val)) {
      setQuantity('');
    } else {
      setQuantity(Math.max(1, val));
      if (val > totalSellable) {
        setError(`Cannot exceed total sellable stock of ${totalSellable} units.`);
      } else {
        setError('');
      }
    }
  };

  const handleSell = async (e) => {
    e.preventDefault();
    const sellQty = Number(quantity);

    if (!sellQty || sellQty <= 0) {
      setError('Please enter a valid quantity');
      return;
    }
    if (sellQty > totalSellable) {
      setError(`Requested quantity exceeds total sellable stock (${totalSellable})`);
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const res = await api.post('/inventory/sell', {
        medicineId: medId,
        quantity: sellQty,
      });

      const deductions = res.data.deductions || [];
      const summaryText = deductions.map((d) => `${d.batchNo}: ${d.taken} units`).join(', ');

      toast.success(`Sold ${sellQty} units (${summaryText})`);
      if (res.data.lowStockAlertTriggered) {
        toast.info('Stock has fallen below reorder threshold.');
      }

      onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Sale deduction failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Sell: ${medicine?.name || ''}`} maxWidth="max-w-md">
      <form onSubmit={handleSell} className="space-y-4">
        <div className="panel p-3.5 bg-paper/60 border border-line flex items-center justify-between text-xs">
          <div>
            <p className="font-medium text-ink text-sm">{medicine?.name}</p>
            <p className="text-ink-soft">{medicine?.genericName} • {medicine?.strength}</p>
          </div>
          <div className="text-right">
            <span className="text-[12px] font-sans font-medium text-ink-soft block">Sellable units</span>
            <span className="font-sans tabular-nums text-[16px] font-semibold text-ink">{totalSellable}</span>
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-[6px] border border-[#F5C2BC] bg-status-expired-bg text-status-expired text-xs leading-relaxed">
            {error}
          </div>
        )}

        <SellQuantityInput
          quantity={quantity}
          totalSellable={totalSellable}
          submitting={submitting}
          onIncrement={handleIncrement}
          onDecrement={handleDecrement}
          onChange={handleQuantityChange}
        />

        <FefoPreview plan={fefoPlan} />

        <div className="flex justify-end gap-3 pt-3 border-t border-line">
          <Button variant="ghost" onClick={onClose} disabled={submitting}>Cancel</Button>
          <Button variant="accent" type="submit" loading={submitting} disabled={totalSellable === 0 || Number(quantity) > totalSellable}>
            Confirm Sale
          </Button>
        </div>
      </form>
    </Modal>
  );
}
