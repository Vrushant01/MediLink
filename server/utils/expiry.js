// Expiry threshold constants in days
export const CRITICAL_DAYS = 30;
export const WARNING_DAYS = 90;

// Calculates whole days remaining until expiry compared against start of current day
export const getDaysLeft = (expiryDate) => {
  if (!expiryDate) return 0;

  // Normalize today to start of day (midnight)
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Normalize expiry date to start of day
  const target = new Date(expiryDate);
  target.setHours(0, 0, 0, 0);

  const diffInMilliseconds = target.getTime() - today.getTime();
  const millisecondsPerDay = 1000 * 60 * 60 * 24;

  return Math.round(diffInMilliseconds / millisecondsPerDay);
};

// Determines expiry status category based on days remaining
export const getExpiryStatus = (expiryDate) => {
  const days = getDaysLeft(expiryDate);

  if (days < 0) {
    return 'expired';
  }
  if (days <= CRITICAL_DAYS) {
    return 'critical';
  }
  if (days <= WARNING_DAYS) {
    return 'warning';
  }
  return 'safe';
};
