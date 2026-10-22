import { useState, useEffect } from 'react';
import Modal from '../Modal';
import Button from '../Button';
import Skeleton from '../Skeleton';
import useCart from '../../context/CartContext';
import { useToast } from '../../context/ToastContext';
import api from '../../api/axios';
import { buildRestockPlan } from '../../utils/restock';
import { formatINR } from '../../utils/format';
import { AlertCircle, ShoppingCart } from 'lucide-react';

// Automated inventory restock dialog proposing optimal wholesale suppliers and quantities
export default function RestockModal({ isOpen, onClose }) {
  const toast = useToast();
  const { addItem } = useCart();

  const [loading, setLoading] = useState(false);
  const [availableItems, setAvailableItems] = useState([]);
  const [unavailableItems, setUnavailableItems] = useState([]);

  // Fetch low stock items and compare offers across all suppliers
  useEffect(() => {
    if (!isOpen) return;

    const fetchPlan = async () => {
      setLoading(true);
      try {
        const alertsRes = await api.get('/inventory/alerts');
        const lowStock = alertsRes.data.lowStock || [];

        if (lowStock.length === 0) {
          setAvailableItems([]);
          setUnavailableItems([]);
          setLoading(false);
          return;
        }

        const comparePromises = lowStock.map((item) =>
          api.get(`/catalog/compare/${item.medicine._id}`).then((r) => r.data).catch(() => ({ offers: [] }))
        );
        const compareResults = await Promise.all(comparePromises);

        const { available, unavailable } = buildRestockPlan(lowStock, compareResults);
        setAvailableItems(available);
        setUnavailableItems(unavailable);
      } catch (err) {
        toast.error('Failed to generate restock recommendations');
      } finally {
        setLoading(false);
      }
    };

    fetchPlan();
  }, [isOpen]);

  const toggleSelect = (id) => {
    setAvailableItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, selected: !i.selected } : i))
    );
  };

  const handleAddSelected = () => {
    const selected = availableItems.filter((i) => i.selected);
    selected.forEach((item) => addItem(item));
    toast.success(`Added ${selected.length} restock items to cart`);
    onClose();
  };

  const selectedCount = availableItems.filter((i) => i.selected).length;
  const totalCost = availableItems
    .filter((i) => i.selected)
    .reduce((sum, i) => sum + i.cost, 0);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Suggested restock" maxWidth="max-w-2xl">
      <div className="space-y-4">
        {loading ? (
          <div className="space-y-3 py-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : availableItems.length === 0 && unavailableItems.length === 0 ? (
          <p className="text-xs text-ink-soft py-6 text-center">
            All medicines are currently stocked above their reorder thresholds.
          </p>
        ) : (
          <>
            {/* Available Restock Options */}
            {availableItems.length > 0 && (
              <div className="border border-line rounded-[6px] overflow-hidden">
                <table className="w-full text-left border-collapse text-[14px]">
                  <thead>
                    <tr className="border-b border-line bg-paper/60 text-ink-soft uppercase text-[12px] font-sans font-medium tracking-[0.04em] h-10">
                      <th className="py-2.5 px-3 w-8"></th>
                      <th className="py-2.5 px-3">Medicine</th>
                      <th className="py-2.5 px-3">Cheapest Supplier</th>
                      <th className="py-2.5 px-3 text-right">Order Qty</th>
                      <th className="py-2.5 px-3 text-right">Est. Cost</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {availableItems.map((item) => (
                      <tr key={item.id} className="hover:bg-paper/30 transition-colors h-14">
                        <td className="py-2.5 px-3">
                          <input
                            type="checkbox"
                            checked={item.selected}
                            onChange={() => toggleSelect(item.id)}
                            className="rounded border-line text-brand focus:ring-brand"
                          />
                        </td>
                        <td className="py-2.5 px-3">
                          <div className="font-medium text-ink text-[14px]">{item.medicineName}</div>
                          <span className="text-[12px] text-ink-soft">{item.strength}</span>
                        </td>
                        <td className="py-2.5 px-3">
                          <div className="text-ink text-[14px]">{item.supplierName}</div>
                          <span className="text-[12px] font-sans tabular-nums text-ink-soft">{formatINR(item.price)}/unit</span>
                        </td>
                        <td className="py-2.5 px-3 text-right font-sans tabular-nums font-medium text-ink text-[14px]">
                          {item.quantity}
                        </td>
                        <td className="py-2.5 px-3 text-right font-sans tabular-nums font-semibold text-ink text-[14px]">
                          {formatINR(item.cost)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Unavailable Items Section */}
            {unavailableItems.length > 0 && (
              <div className="p-3 bg-paper border border-line rounded-[6px] text-xs">
                <div className="flex items-center gap-1.5 text-status-warning font-medium mb-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>No supplier has this in stock:</span>
                </div>
                <div className="pl-5 space-y-0.5 text-ink-soft">
                  {unavailableItems.map((u) => (
                    <div key={u.medicineId}>
                      {u.medicineName} ({u.strength})
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Bar */}
            <div className="flex items-center justify-between pt-3 border-t border-line">
              <span className="font-sans tabular-nums text-[13px] text-ink-soft">
                Selected total: <strong className="text-ink font-semibold">{formatINR(totalCost)}</strong>
              </span>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={onClose}>
                  Cancel
                </Button>
                <Button
                  variant="accent"
                  size="sm"
                  onClick={handleAddSelected}
                  disabled={selectedCount === 0}
                >
                  <ShoppingCart className="w-3.5 h-3.5 mr-1" /> Add selected to cart ({selectedCount})
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}
