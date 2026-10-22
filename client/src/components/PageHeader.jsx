// Header block for top of pages featuring Fraunces 32px title, description, and action buttons
export default function PageHeader({
  title,
  description,
  actions,
  className = '',
}) {
  return (
    <div
      className={`pb-6 border-b border-line mb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4 ${className}`}
    >
      <div>
        <h1 className="page-title">
          {title}
        </h1>
        {description && (
          <p className="text-[14px] leading-[22px] text-ink-soft font-sans mt-2">
            {description}
          </p>
        )}
      </div>

      {actions && (
        <div className="flex items-center gap-3 shrink-0">
          {actions}
        </div>
      )}
    </div>
  );
}
