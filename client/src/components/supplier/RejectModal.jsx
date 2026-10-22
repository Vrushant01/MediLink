import { useState } from 'react';
import Modal from '../Modal';
import Button from '../Button';
import Textarea from '../Textarea';
import { AlertCircle } from 'lucide-react';

const REASON_CHIPS = [
  'Out of stock',
  'Cannot deliver to this area',
  'Price has changed',
  'Other',
];

// Rejection prompt requiring an explicit business reason with predefined quick chips
export default function RejectModal({ isOpen, onClose, order, onConfirm, loading }) {
  const [reason, setReason] = useState('Out of stock');
  const [error, setError] = useState('');

  const handleChipClick = (chip) => {
    if (chip === 'Other') {
      setReason('');
    } else {
      setReason(chip);
    }
    setError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!reason.trim()) {
      setError('Please provide a reason for rejecting the order');
      return;
    }
    onConfirm(reason.trim());
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Reject Order #${order?._id?.slice(-6).toUpperCase()}`}
      maxWidth="max-w-md"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div className="p-3 bg-status-expired-bg/30 border border-[#F5C2BC] rounded-[6px] text-status-expired flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>The ordering store will be notified with your explanation.</span>
        </div>

        {error && <p className="text-status-expired font-medium">{error}</p>}

        {/* Quick Chips */}
        <div>
          <label className="block text-[13px] font-sans font-medium text-ink-soft mb-2">
            Reason for rejection
          </label>
          <div className="flex flex-wrap gap-1.5 mb-2">
            {REASON_CHIPS.map((chip) => {
              const active = reason === chip;
              return (
                <button
                  key={chip}
                  type="button"
                  onClick={() => handleChipClick(chip)}
                  className={`px-2.5 py-1 rounded-[4px] border text-xs font-sans transition-colors ${
                    active
                      ? 'border-status-expired bg-status-expired-bg text-status-expired font-medium'
                      : 'border-line bg-surface hover:bg-paper text-ink-soft'
                  }`}
                >
                  {chip}
                </button>
              );
            })}
          </div>

          <Textarea
            id="reject-reason"
            value={reason}
            onChange={(e) => {
              setReason(e.target.value);
              setError('');
            }}
            placeholder="Provide specific reason..."
            rows={3}
            required
          />
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t border-line">
          <Button variant="ghost" size="sm" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button variant="danger" size="sm" type="submit" loading={loading}>
            Reject Order
          </Button>
        </div>
      </form>
    </Modal>
  );
}
