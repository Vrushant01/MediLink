// Formats a number in Indian Rupees with correct digit grouping (e.g. ₹1,23,456.00)
export const formatINR = (amount) => {
  if (amount === undefined || amount === null || isNaN(amount)) {
    return '₹0.00';
  }
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(amount);
};

// Formats a date into a clean editorial format: "14 Mar 2027"
export const formatDate = (dateInput) => {
  if (!dateInput) return '—';
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return '—';

  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

// Returns a concise relative time string (e.g. "Just now", "5m ago", "2h ago", "3d ago")
export const timeAgo = (dateInput) => {
  if (!dateInput) return '';
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return '';

  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return 'Just now';
  const minutes = Math.floor(diffInSeconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  return `${months}mo ago`;
};

// Calculates whole days from today to the expiry date (negative if expired)
export const getDaysLeft = (expiryDate) => {
  if (!expiryDate) return 0;
  const target = new Date(expiryDate);
  if (isNaN(target.getTime())) return 0;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const exp = new Date(target);
  exp.setHours(0, 0, 0, 0);

  const diffMs = exp.getTime() - today.getTime();
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
};
