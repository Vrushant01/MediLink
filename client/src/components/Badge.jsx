// Status badge pill for ledger statuses, SKUs, and batch metadata: 12px Geist 500, 22px high, 6px radius with 6px dot
export default function Badge({
  children,
  variant = 'neutral',
  showDot = true,
  className = '',
  ...props
}) {
  const variantStyles = {
    neutral: {
      wrap: 'bg-paper text-ink-soft border-line',
      dot: 'bg-ink-soft',
    },
    safe: {
      wrap: 'bg-status-safe-bg text-status-safe border-[#bce1c7]',
      dot: 'bg-status-safe',
    },
    warning: {
      wrap: 'bg-status-warning-bg text-status-warning border-[#f2de97]',
      dot: 'bg-status-warning',
    },
    critical: {
      wrap: 'bg-status-critical-bg text-status-critical border-[#f9cbad]',
      dot: 'bg-status-critical',
    },
    expired: {
      wrap: 'bg-status-expired-bg text-status-expired border-[#f5c2bc]',
      dot: 'bg-status-expired',
    },
    brand: {
      wrap: 'bg-brand-soft text-brand border-[#bfe0d1]',
      dot: 'bg-brand',
    },
  };

  const current = variantStyles[variant] || variantStyles.neutral;

  return (
    <span
      className={`inline-flex items-center gap-1.5 h-[22px] px-2 rounded-[6px] text-[12px] font-sans font-medium border select-none whitespace-nowrap shrink-0 ${current.wrap} ${className}`}
      {...props}
    >
      {showDot && <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${current.dot}`} />}
      <span className="whitespace-nowrap leading-none">{children}</span>
    </span>
  );
}
