import { useState, useEffect } from 'react';
import Modal from '../Modal';
import Button from '../Button';
import Input from '../Input';
import MedicineSearchPicker from '../store/MedicineSearchPicker';
import NewMedicineMiniForm from './NewMedicineMiniForm';
import api from '../../api/axios';
import { useToast } from '../../context/ToastContext';
import { getDaysLeft } from '../../utils/format';
import { AlertTriangle, Plus } from 'lucide-react';

// Modal dialog for creating or updating wholesale catalog inventory listings
export default function ListingModal({ isOpen, onClose, listing = null, onSuccess }) {
  const toast = useToast();
  const isEditing = Boolean(listing);

  const [medicine, setMedicine] = useState(null);
  const [showNewMed, setShowNewMed] = useState(false);
  const [formData, setFormData] = useState({
    price: '',
    stock: '',
    minOrderQty: '10',
    batchNo: '',
    expiryDate: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    if (listing) {
      setMedicine(listing.medicine);
      setFormData({
        price: String(listing.price ?? ''),
        stock: String(listing.stock ?? ''),
        minOrderQty: String(listing.minOrderQty ?? '10'),
        batchNo: listing.batchNo || '',
        expiryDate: listing.expiryDate ? listing.expiryDate.split('T')[0] : '',
      });
    } else {
      setMedicine(null);
      setFormData({ price: '', stock: '', minOrderQty: '10', batchNo: '', expiryDate: '' });
    }
    setShowNewMed(false);
    setFormError('');
  }, [listing, isOpen]);

  const daysLeft = formData.expiryDate ? getDaysLeft(formData.expiryDate) : null;
  const isPast = daysLeft !== null && daysLeft < 0;
  const isShortShelfLife = daysLeft !== null && daysLeft >= 0 && daysLeft < 180;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!isEditing && !medicine) {
      setFormError('Please select a medicine formulation from the catalog');
      return;
    }
    if (isPast) {
      setFormError('Expiry date cannot be in the past. Expired listings are banned.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        medicine: medicine?._id,
        price: Number(formData.price),
        stock: Number(formData.stock),
        minOrderQty: Number(formData.minOrderQty) || 1,
        batchNo: formData.batchNo || undefined,
        expiryDate: formData.expiryDate || undefined,
      };

      if (isEditing) {
        await api.put(`/catalog/${listing._id}`, payload);
        toast.success(`Updated listing for ${medicine?.name}`);
      } else {
        await api.post('/catalog', payload);
        toast.success(`Added ${medicine?.name} to wholesale catalog`);
      }
      onSuccess();
      onClose();
    } catch (err) {
      setFormError(err.response?.data?.message || err.message || 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? `Edit Listing: ${medicine?.name}` : 'Add Catalog Listing'}
      maxWidth="max-w-lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {formError && (
          <div className="p-3 rounded-[6px] border border-[#F5C2BC] bg-status-expired-bg text-status-expired text-xs">
            {formError}
          </div>
        )}

        {/* Medicine Picker / Mini Form */}
        {!isEditing && (
          <div>
            {!showNewMed ? (
              <>
                <MedicineSearchPicker medicine={medicine} onSelectMedicine={setMedicine} isEditing={false} />
                <button
                  type="button"
                  onClick={() => setShowNewMed(true)}
                  className="mt-1.5 text-xs text-brand hover:underline font-medium inline-flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" /> Medicine not in the list?
                </button>
              </>
            ) : (
              <NewMedicineMiniForm
                onCreated={(m) => {
                  setMedicine(m);
                  setShowNewMed(false);
                }}
                onCancel={() => setShowNewMed(false)}
              />
            )}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input id="price" label="Wholesale Price (₹)" type="number" step="0.01" min="0.01" value={formData.price} onChange={(e) => setFormData((p) => ({ ...p, price: e.target.value }))} placeholder="e.g. 26.50" required />
          <Input id="stock" label="Stock Available (Units)" type="number" min="0" value={formData.stock} onChange={(e) => setFormData((p) => ({ ...p, stock: e.target.value }))} placeholder="e.g. 500" required />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input id="minOrderQty" label="Minimum Order Qty (MOQ)" type="number" min="1" value={formData.minOrderQty} onChange={(e) => setFormData((p) => ({ ...p, minOrderQty: e.target.value }))} placeholder="Default 10" required />
          <Input id="batchNo" label="Batch Number" value={formData.batchNo} onChange={(e) => setFormData((p) => ({ ...p, batchNo: e.target.value }))} placeholder="e.g. SH-DL-09" />
        </div>

        <div>
          <Input id="expiryDate" label="Batch Expiry Date" type="date" value={formData.expiryDate} onChange={(e) => setFormData((p) => ({ ...p, expiryDate: e.target.value }))} />
          {isShortShelfLife && (
            <p className="mt-1.5 text-xs text-status-warning flex items-center gap-1 font-medium">
              <AlertTriangle className="w-3.5 h-3.5" /> Short-dated stock sells slower. Stores see this warning.
            </p>
          )}
        </div>

        <div className="flex justify-end gap-3 pt-3 border-t border-line">
          <Button variant="ghost" onClick={onClose} disabled={submitting}>Cancel</Button>
          <Button variant="accent" type="submit" loading={submitting}>{isEditing ? 'Save Changes' : 'Publish Listing'}</Button>
        </div>
      </form>
    </Modal>
  );
}
