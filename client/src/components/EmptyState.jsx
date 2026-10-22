// Calm dashed empty state container: 1px dashed border, 10px radius, Geist 15px 600 title, one ink-soft sentence, one action
export default function EmptyState({
  title = 'No items found',
  description,
  action,
  className = '',
}) {
  return (
    <div
      className={`border border-dashed border-line rounded-[10px] p-8 sm:p-10 text-center flex flex-col items-center justify-center bg-paper/20 ${className}`}
    >
      <h3 className="text-[15px] font-sans font-semibold text-ink">{title}</h3>
      {description && (
        <p className="text-[13px] text-ink-soft max-w-md mt-1 mb-4 leading-normal">
          {description}
        </p>
      )}
      {action && <div className="mt-1">{action}</div>}
    </div>
  );
}
