import Badge from './Badge';

// Renders an expiry status badge with formatted relative days and semantic status colors
export default function ExpiryBadge({ expiryStatus, status, daysLeft, className = '' }) {
  let label = 'Safe';
  let variant = 'safe';
  const effectiveStatus = expiryStatus || status;

  if (daysLeft !== undefined && daysLeft !== null) {
    if (daysLeft < 0) {
      label = `Expired ${Math.abs(daysLeft)}d ago`;
      variant = 'expired';
    } else if (daysLeft <= 30) {
      label = `${daysLeft} days left`;
      variant = 'critical';
    } else if (daysLeft <= 90) {
      label = `${daysLeft} days left`;
      variant = 'warning';
    } else {
      label = 'Safe';
      variant = 'safe';
    }
  } else if (effectiveStatus) {
    variant = effectiveStatus;
    label = effectiveStatus.charAt(0).toUpperCase() + effectiveStatus.slice(1);
  }

  return (
    <Badge variant={variant} className={className}>
      {label}
    </Badge>
  );
}
