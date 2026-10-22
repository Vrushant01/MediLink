import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

// Custom clean tooltip with white surface, 1px border, 6px radius, and Geist font
function CustomTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    const units = payload[0].payload.units;
    return (
      <div className="bg-surface border border-line rounded-[6px] shadow-panel p-2.5 text-xs font-sans">
        <p className="font-medium text-ink mb-0.5">{label}</p>
        <p className="text-ink-soft">
          <strong className="text-ink font-medium tabular-nums">{units}</strong> units expiring
        </p>
      </div>
    );
  }
  return null;
}

// Visualizes upcoming batch expirations over the next 6 calendar months
export default function ExpiryRunway({ batches = [] }) {
  // Generate 6 upcoming month buckets
  const now = new Date();
  const monthsData = [];

  for (let i = 0; i < 6; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
    const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const label = d.toLocaleString('en-US', { month: 'short', year: '2-digit' });
    monthsData.push({ monthKey, label, units: 0 });
  }

  // Aggregate non-expired batch quantities by expiry month
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  batches.forEach((b) => {
    if (!b.expiryDate) return;
    const expDate = new Date(b.expiryDate);
    if (expDate < today) return; // Exclude already expired items from future runway

    const bMonthKey = `${expDate.getFullYear()}-${String(expDate.getMonth() + 1).padStart(2, '0')}`;
    const bucket = monthsData.find((m) => m.monthKey === bMonthKey);
    if (bucket) {
      bucket.units += b.quantity || 0;
    }
  });

  // Calculate rounded max domain for sensible Y-axis (domain 0 to rounded max, 4 ticks)
  const maxUnits = Math.max(...monthsData.map((d) => d.units), 0);
  const roundedMax = maxUnits <= 10 ? 12 : Math.ceil(maxUnits / 10) * 10;

  // Custom bar renderer: shows a thin 2px baseline tick for 0 units instead of nothing
  const renderBarShape = (props) => {
    const { x, y, width, height, payload } = props;
    if (!payload || payload.units === 0) {
      return (
        <rect
          x={x}
          y={y - 2}
          width={width}
          height={2}
          rx={1}
          fill="#5B6B63"
          opacity={0.35}
        />
      );
    }
    return (
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        rx={4}
        fill="#0E4A38"
      />
    );
  };

  return (
    <div className="panel p-5 sm:p-6 bg-surface flex flex-col justify-between h-full min-w-0 overflow-hidden">
      <div className="flex items-baseline justify-between gap-4 mb-4">
        <div>
          <h2 className="panel-title">Expiry runway</h2>
          <p className="text-[13px] text-ink-soft mt-0.5">Forecasted batch expirations across next 6 months</p>
        </div>
        <span className="badge shrink-0">
          Next 6 mo
        </span>
      </div>

      <div className="flex-1 min-h-[260px] w-full min-w-0 flex flex-col justify-end">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={monthsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            {/* Faint dashed horizontal gridline only */}
            <CartesianGrid stroke="#E2DDD0" strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="label"
              stroke="#5B6B63"
              tickLine={false}
              axisLine={false}
              tick={{ fill: '#5B6B63', fontSize: 12, fontFamily: 'Geist, sans-serif' }}
            />
            <YAxis
              stroke="#5B6B63"
              tickLine={false}
              axisLine={false}
              allowDecimals={false}
              domain={[0, roundedMax]}
              tickCount={4}
              tick={{ fill: '#5B6B63', fontSize: 12, fontFamily: 'Geist, sans-serif' }}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: '#F5F2EB' }} />
            <Bar
              dataKey="units"
              fill="#0E4A38"
              radius={[4, 4, 0, 0]}
              maxBarSize={32}
              shape={renderBarShape}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
