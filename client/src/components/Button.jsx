// Reusable button component: 40px high (36px small), 14px Geist 500, 6px radius, 8px gap, 2px brand focus ring
export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  className = '',
  type = 'button',
  onClick,
  ...props
}) {
  const baseStyles =
    'inline-flex items-center justify-center font-sans font-medium text-[14px] rounded-[6px] transition-colors duration-150 ease-out select-none cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 disabled:opacity-40 disabled:cursor-not-allowed';

  const sizeStyles = {
    sm: 'text-xs px-3 h-9 gap-2',
    md: 'text-sm px-4 h-10 gap-2',
    lg: 'text-base px-5 h-11 gap-2.5',
  };

  const variantStyles = {
    // Solid ink with paper text
    primary: 'bg-ink text-paper hover:bg-[#20362c] active:bg-[#0c1813] border border-ink',
    // Vermilion for single key action
    accent: 'bg-accent text-surface hover:bg-[#cc4922] active:bg-[#b83e1a] border border-accent',
    // Ghost with subtle 1px line border and white surface
    ghost: 'bg-surface text-ink hover:bg-paper/60 active:bg-paper border border-line',
    outline: 'bg-surface text-ink hover:bg-paper/60 active:bg-paper border border-line',
    // Calm danger alert
    danger: 'bg-status-expired-bg text-status-expired hover:bg-[#F7D2CD] border border-[#F5C2BC]',
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`${baseStyles} ${sizeStyles[size] || sizeStyles.md} ${
        variantStyles[variant] || variantStyles.primary
      } ${className}`}
      {...props}
    >
      {loading ? 'Please wait...' : children}
    </button>
  );
}
