// Two-column authentication shell featuring editorial brand visual and CSS grid pharmacy ledger
export default function AuthShell({ children, isSticky = false, formMaxWidth = 'max-w-[400px]', rightPadding = 'p-6 sm:p-10 lg:p-12' }) {
  return (
    <div className="min-h-screen bg-paper flex flex-col md:grid md:grid-cols-[46%_54%] selection:bg-brand-soft selection:text-brand">
      {/* LEFT COLUMN: Editorial Brand Showcase (46% width) */}
      <div
        className={`bg-[#0B3327] text-paper p-8 lg:p-12 flex flex-col justify-between border-b md:border-b-0 md:border-r border-[#124536] ${
          isSticky ? 'md:sticky md:top-0 md:h-screen md:overflow-y-auto' : ''
        }`}
      >
        {/* Top: CSS Mark Logo */}
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-[5px] bg-accent relative flex items-center justify-center shrink-0">
            <div className="absolute w-3 h-0.5 bg-surface rounded-[1px]" />
            <div className="absolute w-0.5 h-3 bg-surface rounded-[1px]" />
          </div>
          <span className="font-display text-[22px] font-medium tracking-normal text-paper leading-none">
            MediLink
          </span>
        </div>

        {/* Middle: Headline & Subtitle */}
        <div className="my-10 md:my-auto max-w-lg">
          <h1 className="font-display text-4xl sm:text-5xl lg:text-[56px] leading-[1.12] text-paper font-medium mb-4 tracking-normal">
            Stock that never goes <span className="italic font-normal">stale</span>.
          </h1>
          <p className="text-paper/75 font-sans text-[18px] leading-relaxed max-w-[460px]">
            Track every batch, get warned before expiry, and reorder from
            verified suppliers in one place.
          </p>
        </div>

        {/* Bottom: Quiet Decorative Pharmacy Ledger (Real CSS Grid) */}
        <div className="border border-paper/12 rounded-[10px] bg-[#07241A] p-4 text-xs font-sans">
          {/* Grid Header */}
          <div className="grid grid-cols-[1fr_88px_auto] items-center gap-3 text-[11px] font-medium uppercase tracking-[0.04em] text-paper/50 pb-2 border-b border-paper/10">
            <span>Medicine</span>
            <span>Batch</span>
            <span className="text-right">Status</span>
          </div>

          {/* Rows */}
          <div className="divide-y divide-paper/5">
            <div className="grid grid-cols-[1fr_88px_auto] items-center gap-3 py-2 text-paper/90">
              <span className="font-medium truncate">Dolo 650 (650mg)</span>
              <span className="font-mono text-paper/60 text-[11px]">DL650-26</span>
              <span className="inline-flex items-center gap-1.5 h-[20px] px-2 rounded-[4px] text-[11px] font-sans font-medium bg-[#133A2B] text-[#93D7B6] border border-[#1E523E] justify-self-end">
                <span className="w-1.5 h-1.5 rounded-full bg-[#34D399]" />
                Safe
              </span>
            </div>

            <div className="grid grid-cols-[1fr_88px_auto] items-center gap-3 py-2 text-paper/90">
              <span className="font-medium truncate">Azithral 500 (500mg)</span>
              <span className="font-mono text-paper/60 text-[11px]">AZ500-25</span>
              <span className="inline-flex items-center gap-1.5 h-[20px] px-2 rounded-[4px] text-[11px] font-sans font-medium bg-[#36270E] text-[#FCD34D] border border-[#523C16] justify-self-end">
                <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B]" />
                30d left
              </span>
            </div>

            <div className="grid grid-cols-[1fr_88px_auto] items-center gap-3 py-2 text-paper/90">
              <span className="font-medium truncate">Pantocid 40 (40mg)</span>
              <span className="font-mono text-paper/60 text-[11px]">PC040-24</span>
              <span className="inline-flex items-center gap-1.5 h-[20px] px-2 rounded-[4px] text-[11px] font-sans font-medium bg-[#3B190E] text-[#FDBA74] border border-[#5C2716] justify-self-end">
                <span className="w-1.5 h-1.5 rounded-full bg-[#F97316]" />
                7d left
              </span>
            </div>

            <div className="grid grid-cols-[1fr_88px_auto] items-center gap-3 py-2 text-paper/90">
              <span className="font-medium truncate">Metformin 500 (500mg)</span>
              <span className="font-mono text-paper/60 text-[11px]">MF500-23</span>
              <span className="inline-flex items-center gap-1.5 h-[20px] px-2 rounded-[4px] text-[11px] font-sans font-medium bg-[#381112] text-[#FCA5A5] border border-[#571B1D] justify-self-end">
                <span className="w-1.5 h-1.5 rounded-full bg-[#EF4444]" />
                Expired
              </span>
            </div>
          </div>

          {/* Footer note */}
          <div className="mt-3 pt-2.5 border-t border-paper/10 text-[11px] font-sans text-paper/50">
            For licensed pharmacies and wholesalers in India.
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: Form Container (54% width) */}
      <div className={`${rightPadding} flex items-center justify-center min-h-screen`}>
        <div className={`w-full ${formMaxWidth}`}>{children}</div>
      </div>
    </div>
  );
}
