import { useState, useEffect } from 'react';
import Modal from '../Modal';
import Button from '../Button';
import MedicineSearchPicker from './MedicineSearchPicker';
import BatchFormFields from './BatchFormFields';
import api from '../../api/axios';
import { useToast } from '../../context/ToastContext';

// Modal for adding a new batch or editing an existing inventory batch
export default function BatchModal({ isOpen, onClose, batch = null, onSuccess }) {
  const toast = useToast();
  const isEditing = Boolean(batch);

  const [medicine, setMedicine] = useState(null);
  const [formData, setFormData] = useState({
    batchNo: '',
    quantity: '',
    expiryDate: '',
    purchasePrice: '',
    mrp: '',
    reorderLevel: '20',
    rack: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  // Prefill when editing
  useEffect(() => {
    if (batch) {
      setMedicine(batch.medicine);
      setFormData({
        batchNo: batch.batchNo || '',
        quantity: String(batch.quantity ?? ''),
        expiryDate: batch.expiryDate ? batch.expiryDate.split('T')[0] : '',
        purchasePrice: String(batch.purchasePrice ?? ''),
        mrp: String(batch.mrp ?? ''),
        reorderLevel: String(batch.reorderLevel ?? '20'),
        rack: batch.rack || '',
      });
    } else {
      setMedicine(null);
      setFormData({
        batchNo: '',
        quantity: '',
        expiryDate: '',
        purchasePrice: '',
        mrp: '',
        reorderLevel: '20',
        rack: '',
      });
    }
    setFormError('');
  }, [batch, isOpen]);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!isEditing && !medicine) {
      setFormError('Please select a medicine formulation from the master list');
      return;
    }

    const numQty = Number(formData.quantity);
    if (isNaN(numQty) || numQty < 0) {
      setFormError('Quantity cannot be negative');
      return;
    }

    const numPurchase = formData.purchasePrice !== '' ? Number(formData.purchasePrice) : undefined;
    const numMrp = formData.mrp !== '' ? Number(formData.mrp) : undefined;

    if (numPurchase !== undefined && numMrp !== undefined && numMrp < numPurchase) {
      setFormError('MRP cannot be lower than purchase price');
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        medicine: medicine?._id,
        batchNo: formData.batchNo,
        quantity: numQty,
        expiryDate: formData.expiryDate,
        purchasePrice: numPurchase,
        mrp: numMrp,
        reorderLevel: Number(formData.reorderLevel) || 20,
        rack: formData.rack,
      };

      if (isEditing) {
        await api.put(`/inventory/${batch._id}`, payload);
        toast.success(`Updated batch ${formData.batchNo}`);
      } else {
        const res = await api.post('/inventory', payload);
        if (res.data.isExpiredWarning) {
          toast.info(`Batch ${formData.batchNo} logged as expired stock`);
        } else {
          toast.success(res.data.message || 'Batch added to inventory');
        }
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
      title={isEditing ? `Edit Batch: ${batch?.batchNo}` : 'Add Inventory Batch'}
      maxWidth="max-w-xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {formError && (
          <div className="p-3 rounded-[6px] border border-[#F5C2BC] bg-status-expired-bg text-status-expired text-xs">
            {formError}
          </div>
        )}

        <MedicineSearchPicker
          medicine={medicine}
          onSelectMedicine={setMedicine}
          isEditing={isEditing}
        />

        <BatchFormFields formData={formData} onChange={handleChange} />

        <div className="flex justify-end gap-3 pt-3 border-t border-line">
          <Button variant="ghost" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button variant="accent" type="submit" loading={submitting}>
            {isEditing ? 'Save Changes' : 'Log Batch'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
