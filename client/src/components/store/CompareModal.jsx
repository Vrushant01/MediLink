import { useState } from 'react';
import Modal from '../Modal';
import Button from '../Button';
import Badge from '../Badge';
import ExpiryBadge from '../ExpiryBadge';
import Skeleton from '../Skeleton';
import QuantityStepper from './QuantityStepper';
import useCart from '../../context/CartContext';
import { formatINR } from '../../utils/format';
import { Check, ShoppingBag } from 'lucide-react';

// Modal comparing competitor pricing and batch shelf lives for a given formulation
export default function CompareModal({ isOpen, onClose, medicine, offers = [], loading }) {
  const { items, addItem, updateQuantity } = useCart();
  const [quantities, setQuantities] = useState({});

  if (!medicine) return null;

  // Calculate price gap between cheapest and second cheapest offer
  const priceGap =
    offers.length >= 2 && offers[1].price > offers[0].price
      ? offers[1].price - offers[0].price
      : 0;

  const handleQtyChange = (catalogId, qty) => {
    setQuantities((prev) => ({ ...prev, [catalogId]: qty }));
    const inCart = items.find((i) => i.catalogId === catalogId);
    if (inCart) {
      updateQuantity(catalogId, qty);
    }
  };

  const handleAdd = (offer) => {
    const qty = quantities[offer._id] || offer.minOrderQty || 1;
    addItem({
      catalogId: offer._id,
      medicineId: medicine._id,
      medicineName: medicine.name,
      genericName: medicine.genericName,
      strength: medicine.strength,
      supplierId: offer.supplier._id,
      supplierName: offer.supplier.businessName || offer.supplier.name,
      supplierCity: offer.supplier.city,
      price: offer.price,
      quantity: qty,
      minOrderQty: offer.minOrderQty || 1,
      stock: offer.stock,
      expiryDate: offer.expiryDate,
      batchNo: offer.batchNo,
      daysLeft: offer.daysLeft,
      expiryStatus: offer.expiryStatus,
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`${medicine.name}: price by supplier`}
      maxWidth="max-w-2xl"
    >
      <div className="space-y-4">
        {/* Price Gap Notice */}
        {priceGap > 0 && !loading && (
          <div className="p-3 bg-brand-soft/30 border border-brand/20 rounded-[6px] text-[13px] flex items-center justify-between text-brand font-sans tabular-nums">
            <span className="font-medium">Price advantage:</span>
            <strong>{formatINR(priceGap)} per unit cheaper than next supplier</strong>
          </div>
        )}

        {/* Content Table */}
        {loading ? (
          <div className="space-y-3">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : offers.length === 0 ? (
          <p className="text-xs text-ink-soft text-center py-6">
            No active supplier listings found for this medicine.
          </p>
        ) : (
          <div className="border border-line rounded-[6px] overflow-hidden">
            <table className="w-full text-left border-collapse text-[14px]">
              <thead>
                <tr className="border-b border-line bg-paper/60 text-ink-soft uppercase text-[12px] font-sans font-medium tracking-[0.04em] h-10">
                  <th className="py-2.5 px-3">Supplier</th>
                  <th className="py-2.5 px-3 text-right">Price</th>
                  <th className="py-2.5 px-3 text-right">Stock (MOQ)</th>
                  <th className="py-2.5 px-3">Batch & Expiry</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {offers.map((offer, idx) => {
                  const isLowest = idx === 0;
                  const inCartItem = items.find((i) => i.catalogId === offer._id);
                  const selectedQty = inCartItem?.quantity || quantities[offer._id] || offer.minOrderQty || 1;

                  return (
                    <tr
                      key={offer._id}
                      className={isLowest ? 'bg-status-safe-bg/30' : 'hover:bg-paper/30'}
                    >
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-1.5">
                          <span className="font-medium text-ink text-[14px]">
                            {offer.supplier?.businessName || offer.supplier?.name}
                          </span>
                          {isLowest && (
                            <Badge variant="success" size="sm">
                              Lowest price
                            </Badge>
                          )}
                        </div>
                        <span className="text-[12px] text-ink-soft">{offer.supplier?.city}</span>
                      </td>

                      <td className="py-3 px-3 text-right font-sans tabular-nums font-semibold text-[14px] text-ink">
                        {formatINR(offer.price)}
                      </td>

                      <td className="py-3 px-3 text-right font-sans tabular-nums text-ink text-[13px]">
                        {offer.stock}{' '}
                        <span className="text-ink-soft text-[11px]">(MOQ {offer.minOrderQty})</span>
                      </td>

                      <td className="py-3 px-3">
                        <div className="font-mono text-[13px] text-ink font-medium">{offer.batchNo || '—'}</div>
                        <ExpiryBadge status={offer.expiryStatus} daysLeft={offer.daysLeft} />
                      </td>

                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <QuantityStepper
                            value={selectedQty}
                            min={offer.minOrderQty || 1}
                            max={offer.stock}
                            onChange={(val) => handleQtyChange(offer._id, val)}
                          />
                          <Button
                            variant={inCartItem ? 'outline' : 'accent'}
                            size="sm"
                            onClick={() => handleAdd(offer)}
                            className="h-7 text-xs px-2.5"
                          >
                            {inCartItem ? (
                              <>
                                <Check className="w-3 h-3 mr-1 text-brand" /> In cart
                              </>
                            ) : (
                              'Add'
                            )}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <div className="flex justify-end pt-2">
          <Button variant="ghost" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
}
