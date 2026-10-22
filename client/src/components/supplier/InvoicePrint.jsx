import { formatDate, formatINR } from '../../utils/format';

// Formal printable wholesale invoice template activated exclusively during browser print media
export default function InvoicePrint({ order, supplier }) {
  if (!order) return null;

  const shortId = order._id?.slice(-6).toUpperCase();

  return (
    <div id="printable-invoice" className="hidden print:block text-ink bg-white font-sans text-xs p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-start border-b-2 border-ink pb-6 mb-6">
        <div>
          <h1 className="text-2xl font-display font-medium text-ink mb-1">
            {supplier?.businessName || supplier?.name || 'Wholesale Supplier'}
          </h1>
          <p className="text-ink-soft">{supplier?.address || supplier?.city || 'Gujarat, India'}</p>
          <p className="text-ink-soft mt-0.5">
            DL No: <strong className="font-mono">{supplier?.licenseNumber || 'GJ-VAD-2024-W12'}</strong>
          </p>
          {supplier?.phone && <p className="font-sans tabular-nums text-ink-soft">Phone: {supplier.phone}</p>}
        </div>

        <div className="text-right">
          <h2 className="text-xl font-display font-semibold tracking-wider text-ink">
            INVOICE
          </h2>
          <p className="font-mono text-sm mt-1 font-semibold text-ink">INV-{shortId}</p>
          <p className="font-sans tabular-nums text-ink-soft mt-0.5">Date: {formatDate(order.createdAt)}</p>
          <p className="text-ink-soft">Status: {order.status?.toUpperCase()}</p>
        </div>
      </div>

      {/* Bill To Info */}
      <div className="grid grid-cols-2 gap-8 border-b border-line pb-6 mb-6">
        <div>
          <span className="text-[12px] font-sans font-medium text-ink-soft block mb-1">
            Billed To (Purchaser):
          </span>
          <p className="font-semibold text-sm text-ink">{order.store?.businessName || order.store?.name || 'Medical Store'}</p>
          <p className="text-ink-soft mt-0.5">{order.store?.address || order.store?.city || 'Gujarat'}</p>
          <p className="text-ink-soft mt-0.5">
            DL No: <strong className="font-mono">{order.store?.licenseNumber || 'GJ-AHM-2023-R89'}</strong>
          </p>
        </div>
        <div>
          <span className="text-[12px] font-sans font-medium text-ink-soft block mb-1">
            Dispatch Details:
          </span>
          <p className="text-ink">Terms: B2B Wholesale Supply</p>
          <p className="text-ink-soft mt-0.5">Consignment Tag: #ORD-{shortId}</p>
        </div>
      </div>

      {/* Items Table */}
      <table className="w-full text-left border-collapse text-xs mb-6">
        <thead>
          <tr className="border-b-2 border-ink text-[11px] font-sans font-semibold uppercase tracking-[0.04em] text-ink">
            <th className="py-2">#</th>
            <th className="py-2">Medicine Formulation</th>
            <th className="py-2">Batch No</th>
            <th className="py-2">Expiry</th>
            <th className="py-2 text-right">Qty</th>
            <th className="py-2 text-right">Unit Price</th>
            <th className="py-2 text-right">Amount</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {order.items?.map((item, idx) => (
            <tr key={idx} className="py-2">
              <td className="py-2 font-sans tabular-nums text-ink-soft">{idx + 1}</td>
              <td className="py-2 font-medium">
                {item.medicine?.name}{' '}
                <span className="text-ink-soft text-[10px]">({item.medicine?.strength})</span>
              </td>
              <td className="py-2 font-mono">{item.batchNo || '—'}</td>
              <td className="py-2 font-sans tabular-nums">{formatDate(item.expiryDate)}</td>
              <td className="py-2 font-sans tabular-nums text-right font-medium">{item.quantity}</td>
              <td className="py-2 font-sans tabular-nums text-right">{formatINR(item.price)}</td>
              <td className="py-2 font-sans tabular-nums text-right font-semibold">
                {formatINR((item.price || 0) * (item.quantity || 0))}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Total Box */}
      <div className="flex justify-end border-t-2 border-ink pt-4 mb-8">
        <div className="w-64 space-y-2 text-xs">
          <div className="flex justify-between font-sans tabular-nums">
            <span className="text-ink-soft">Subtotal:</span>
            <span>{formatINR(order.totalAmount)}</span>
          </div>
          <div className="flex justify-between font-sans tabular-nums text-base font-bold border-t border-line pt-2">
            <span>Invoice Total:</span>
            <span>{formatINR(order.totalAmount)}</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-line pt-4 text-center text-[10px] text-ink-soft">
        <p className="font-medium text-ink mb-1">Goods once sold must be checked at delivery.</p>
        <p>This is a computer-generated invoice for pharmaceutical distribution under MediLink B2B platform.</p>
      </div>
    </div>
  );
}
