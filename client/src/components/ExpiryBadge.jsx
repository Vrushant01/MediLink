import Badge from './Badge';

// Renders an expiry status badge with formatted relative days and semantic status colors
export default function ExpiryBadge({ expiryStatus, daysLeft, className = '' }) {
  let label = 'Safe';
  let variant = 'safe';

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
  } else if (expiryStatus) {
    variant = expiryStatus;
    label = expiryStatus.charAt(0).toUpperCase() + expiryStatus.slice(1);
  }

  return (
    <Badge variant={variant} className={className}>
      {label}
    </Badge>
  );
}
