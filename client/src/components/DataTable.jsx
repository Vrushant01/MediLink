// Ledger-style data table wrapper: 40px header with 12px Geist 500 uppercase 0.04em tracking, 1px line dividers, hover background paper at 60%
export default function DataTable({
  headers = [],
  children,
  empty = false,
  emptyMessage = 'No records found',
  className = '',
}) {
  return (
    <div className={`panel overflow-hidden bg-surface ${className}`}>
      <div className="overflow-x-auto w-full">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="h-10 border-b border-line bg-paper/40 table-header sticky top-0">
              {headers.map((h, i) => (
                <th
                  key={i}
                  className={`px-4 font-medium whitespace-nowrap ${
                    h.align === 'right' ? 'text-right' : 'text-left'
                  } ${h.className || ''}`}
                >
                  {h.label || h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-line text-sm font-sans text-ink">
            {empty ? (
              <tr>
                <td
                  colSpan={headers.length || 1}
                  className="py-12 text-center text-sm text-ink-soft italic font-sans"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              children
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
