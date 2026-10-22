// Step progression indicator tracking purchase order lifecycle from placed to delivered
export default function ProgressTrack({ status }) {
  const steps = ['placed', 'accepted', 'dispatched', 'delivered'];
  const isRejected = status === 'rejected';

  if (isRejected) {
    return (
      <div className="flex items-center gap-1.5 text-xs font-sans">
        <span className="w-2.5 h-2.5 rounded-full bg-status-expired shrink-0" />
        <span className="w-8 h-0.5 bg-status-expired" />
        <span className="px-1.5 py-0.5 rounded bg-status-expired-bg text-status-expired font-medium text-[11px] font-sans">
          Rejected
        </span>
      </div>
    );
  }

  const currentIndex = steps.indexOf(status);

  return (
    <div className="inline-flex items-center gap-1 text-xs select-none whitespace-nowrap">
      {steps.map((step, idx) => {
        const isComplete = idx < currentIndex;
        const isCurrent = idx === currentIndex;

        return (
          <div key={step} className="flex items-center shrink-0">
            {/* Step Node */}
            <div
              className={`w-2.5 h-2.5 rounded-full flex items-center justify-center transition-colors shrink-0 ${
                isComplete || isCurrent
                  ? 'bg-brand ring-2 ring-brand-soft'
                  : 'border border-line bg-surface'
              }`}
              title={`Stage: ${step}`}
            />

            {/* Connecting Line */}
            {idx < steps.length - 1 && (
              <div
                className={`w-4 sm:w-5 h-0.5 transition-colors shrink-0 ${
                  idx < currentIndex ? 'bg-brand' : 'bg-line'
                }`}
              />
            )}
          </div>
        );
      })}
      <span className="ml-2 font-sans text-[12px] font-medium text-ink capitalize shrink-0">
        {status}
      </span>
    </div>
  );
}
