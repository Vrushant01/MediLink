import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { formatINR } from '../../utils/format';

// Tooltip formatting spend in INR with white surface, 1px border, 6px radius, and Geist font
function SpendTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-surface border border-line rounded-[6px] shadow-panel p-2.5 text-xs font-sans">
        <p className="font-medium text-ink mb-0.5">{label}</p>
        <p className="text-ink-soft">
          Purchasing spend:{' '}
          <strong className="text-ink font-medium tabular-nums">{formatINR(payload[0].value)}</strong>
        </p>
      </div>
    );
  }
  return null;
}

// 6-month historical B2B spend bar chart
export default function SpendByMonthChart({ data = [] }) {
  const total = data.reduce((sum, item) => sum + (item.amount || 0), 0);

  return (
    <div className="panel bg-surface p-5 sm:p-6 min-w-0 overflow-hidden h-full flex flex-col justify-between">
      <div className="flex items-baseline justify-between gap-4 mb-4">
        <div className="min-w-0">
          <h2 className="panel-title truncate">Spend by month</h2>
          <p className="text-[13px] text-ink-soft mt-0.5 truncate">Historical purchasing spend across past 6 months</p>
        </div>
        <div className="text-right shrink-0">
          <span className="text-[11px] font-sans font-medium uppercase tracking-[0.04em] text-ink-soft block">
            6-Mo Total
          </span>
          <span className="text-[14px] font-sans font-medium tabular-nums text-ink leading-tight block mt-0.5">
            {formatINR(total)}
          </span>
        </div>
      </div>

      <div className="h-64 w-full min-w-0 flex-1 flex flex-col justify-end">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid stroke="#E2DDD0" strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="month"
              stroke="#5B6B63"
              tickLine={false}
              axisLine={false}
              tick={{ fill: '#5B6B63', fontSize: 12, fontFamily: 'Geist, sans-serif' }}
            />
            <YAxis
              stroke="#5B6B63"
              tickLine={false}
              axisLine={false}
              tick={{ fill: '#5B6B63', fontSize: 12, fontFamily: 'Geist, sans-serif' }}
              tickFormatter={(v) => (v >= 1000 ? `₹${(v / 1000).toFixed(0)}k` : `₹${v}`)}
            />
            <Tooltip content={<SpendTooltip />} cursor={{ fill: '#F5F2EB' }} />
            <Bar dataKey="amount" fill="#0E4A38" radius={[4, 4, 0, 0]} maxBarSize={36} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
