// Form text input field with associated label, optional hint, and validation states
export default function Input({
  id,
  label,
  hint,
  error,
  type = 'text',
  className = '',
  required = false,
  showOptional = true,
  ...props
}) {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-[13px] font-sans font-medium text-ink-soft mb-1.5"
        >
          {label}
          {required ? (
            <span className="text-ink-soft ml-0.5" title="Required">*</span>
          ) : showOptional ? (
            <span className="text-ink-soft/60 font-normal text-xs ml-1">Optional</span>
          ) : null}
        </label>
      )}

      <input
        id={inputId}
        type={type}
        required={required}
        className={`w-full h-[42px] rounded-[6px] border bg-surface px-3 text-[14px] font-sans text-ink placeholder:text-ink-soft/60 transition-colors duration-150 ease-out focus:outline-none focus:border-brand focus:ring-4 focus:ring-brand-soft/60 ${
          error ? 'border-status-expired ring-1 ring-status-expired' : 'border-line'
        } ${className}`}
        {...props}
      />

      {hint && !error && <p className="mt-1 text-xs text-ink-soft">{hint}</p>}
      {error && <p className="mt-1 text-xs text-status-expired font-medium">{error}</p>}
    </div>
  );
}
