import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useCart from '../../context/CartContext';
import { useToast } from '../../context/ToastContext';
import api from '../../api/axios';
import PageHeader from '../../components/PageHeader';
import EmptyState from '../../components/EmptyState';
import CartSupplierPanel from '../../components/store/CartSupplierPanel';
import CartSummaryPanel from '../../components/store/CartSummaryPanel';
import { usePageTitle } from '../../hooks/usePageTitle';

// Store purchase order cart page handling multi-supplier grouping, checkout sequencing, and validation
export default function Cart() {
  usePageTitle('Cart');
  const navigate = useNavigate();
  const toast = useToast();
  const {
    items,
    itemCount,
    grandTotal,
    groupedBySupplier,
    updateQuantity,
    removeItem,
    clearSupplier,
  } = useCart();

  const [notes, setNotes] = useState({});
  const [supplierErrors, setSupplierErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const handleNoteChange = (supplierId, val) => {
    setNotes((prev) => ({ ...prev, [supplierId]: val }));
  };

  const handlePlaceOrders = async () => {
    if (groupedBySupplier.length === 0) return;

    setSubmitting(true);
    setSupplierErrors({});

    let successCount = 0;
    const allWarnings = [];

    // Send order to each supplier sequentially
    for (const group of groupedBySupplier) {
      try {
        const payload = {
          supplierId: group.supplierId,
          items: group.items.map((i) => ({
            catalogId: i.catalogId,
            quantity: i.quantity,
          })),
          note: notes[group.supplierId] || undefined,
        };

        const res = await api.post('/orders', payload);
        successCount++;
        clearSupplier(group.supplierId);

        if (res.data?.warnings && res.data.warnings.length > 0) {
          allWarnings.push(...res.data.warnings);
        }
      } catch (err) {
        const msg = err.response?.data?.message || err.message || 'Order placement failed';
        setSupplierErrors((prev) => ({ ...prev, [group.supplierId]: msg }));
      }
    }

    setSubmitting(false);

    if (successCount > 0) {
      const orderWord = successCount === 1 ? 'order' : 'orders';
      toast.success(`Successfully placed ${successCount} wholesale ${orderWord}!`);

      if (allWarnings.length > 0) {
        toast.warning(allWarnings[0]);
      }

      // Navigate to orders page if all or partial orders succeeded
      navigate('/store/orders');
    } else {
      toast.error('Unable to place orders. Please resolve supplier errors below.');
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto py-8">
        <EmptyState
          title="Your cart is empty"
          description="Browse wholesale medicine catalogs from verified suppliers to start an order."
          actionLabel="Browse medicines"
          onAction={() => navigate('/store/browse')}
        />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <PageHeader
        title="Purchase Cart"
        description="Review your order lines grouped by wholesale supplier before dispatch."
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Side: Supplier Order Groups */}
        <div className="lg:col-span-8 space-y-6">
          {groupedBySupplier.map((group) => (
            <CartSupplierPanel
              key={group.supplierId}
              supplierGroup={group}
              note={notes[group.supplierId] || ''}
              onNoteChange={(val) => handleNoteChange(group.supplierId, val)}
              error={supplierErrors[group.supplierId] || ''}
              onUpdateQty={updateQuantity}
              onRemoveItem={removeItem}
            />
          ))}
        </div>

        {/* Right Side: Sticky Checkout Summary */}
        <div className="lg:col-span-4">
          <CartSummaryPanel
            supplierCount={groupedBySupplier.length}
            itemCount={itemCount}
            grandTotal={grandTotal}
            submitting={submitting}
            onPlaceOrder={handlePlaceOrders}
          />
        </div>
      </div>
    </div>
  );
}
