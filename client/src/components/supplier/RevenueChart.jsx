import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { formatINR } from '../../utils/format';

function RevenueTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-surface border border-line rounded-[6px] shadow-panel p-2.5 text-xs font-sans">
        <p className="text-ink-soft mb-1 font-medium">{label}</p>
        <p className="font-sans tabular-nums font-medium text-brand text-sm">
          {formatINR(payload[0].value)}
        </p>
      </div>
    );
  }
  return null;
}

// 6-month historical B2B revenue bar chart
export default function RevenueChart({ data = [] }) {
  const total = data.reduce((sum, item) => sum + (item.amount || 0), 0);

  return (
    <div className="panel bg-surface p-6 h-full flex flex-col justify-between min-w-0 overflow-hidden">
      <div className="flex items-baseline justify-between gap-4 mb-4">
        <div className="min-w-0">
          <h3 className="panel-title text-ink truncate">Revenue by month</h3>
          <p className="caption text-ink-soft truncate mt-0.5">Delivered order turnover across past 6 months</p>
        </div>
        <div className="text-right shrink-0">
          <span className="text-[12px] font-sans font-medium text-ink-soft block">6-Mo Revenue</span>
          <span className="font-sans tabular-nums text-[15px] font-semibold text-ink">{formatINR(total)}</span>
        </div>
      </div>

      <div className="h-64 w-full min-w-0 flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 8, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid stroke="#E2DDD0" strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="month"
              stroke="#5B6B63"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tick={{ fill: '#5B6B63', fontSize: 12, fontFamily: 'Geist, sans-serif' }}
            />
            <YAxis
              stroke="#5B6B63"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickCount={4}
              tick={{ fill: '#5B6B63', fontSize: 12, fontFamily: 'Geist, sans-serif' }}
              tickFormatter={(v) => (v >= 1000 ? `₹${(v / 1000).toFixed(0)}k` : `₹${v}`)}
            />
            <Tooltip content={<RevenueTooltip />} cursor={{ fill: '#F5F2EB' }} />
            <Bar dataKey="amount" fill="#0E4A38" radius={[4, 4, 0, 0]} maxBarSize={36} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
