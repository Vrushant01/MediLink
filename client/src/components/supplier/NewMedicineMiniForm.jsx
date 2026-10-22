import { useState } from 'react';
import Input from '../Input';
import Button from '../Button';
import api from '../../api/axios';
import { useToast } from '../../context/ToastContext';

// Collapsible mini form for registering formulations not present in the master drug list
export default function NewMedicineMiniForm({ onCreated, onCancel }) {
  const toast = useToast();
  const [formData, setFormData] = useState({
    name: '',
    genericName: '',
    category: 'Painkiller',
    strength: '',
    form: 'Tablet',
    manufacturer: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError('Brand name is required');
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      const res = await api.post('/medicines', formData);
      toast.success(`Registered ${formData.name} in master database`);
      onCreated(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create medicine');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-3.5 bg-paper rounded-[6px] border border-line space-y-3 text-xs">
      <div className="flex items-center justify-between pb-1.5 border-b border-line">
        <span className="text-[13px] font-sans font-medium text-ink">
          Register new formulation
        </span>
        <button type="button" onClick={onCancel} className="text-ink-soft hover:text-ink text-[12px] font-medium">
          Cancel
        </button>
      </div>

      {error && <p className="text-status-expired font-medium">{error}</p>}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <Input id="name" label="Brand Name" value={formData.name} onChange={handleChange} placeholder="e.g. Dolo 650" required />
        <Input id="genericName" label="Generic Name" value={formData.genericName} onChange={handleChange} placeholder="e.g. Paracetamol" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        <Input id="strength" label="Strength" value={formData.strength} onChange={handleChange} placeholder="e.g. 650mg" />
        <Input id="category" label="Category" value={formData.category} onChange={handleChange} placeholder="e.g. Painkiller" />
        <Input id="form" label="Form" value={formData.form} onChange={handleChange} placeholder="Tablet / Syrup" />
      </div>

      <div className="flex justify-end pt-1">
        <Button variant="accent" size="sm" type="button" onClick={handleSave} loading={submitting}>
          Save Formulation
        </Button>
      </div>
    </div>
  );
}
