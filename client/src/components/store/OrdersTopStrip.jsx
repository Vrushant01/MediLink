import { formatINR } from '../../utils/format';

// 4-panel metric strip showing order statistics and cumulative spend
export default function OrdersTopStrip({ summary }) {
  const stats = [
    { label: 'Orders placed', value: summary?.ordersPlaced || 0 },
    { label: 'In transit', value: summary?.ordersInTransit || 0 },
    { label: 'Delivered', value: summary?.ordersDelivered || 0 },
    { label: 'Total spent', value: formatINR(summary?.totalSpent || 0), isMono: true },
  ];

  return (
    <div className="panel bg-surface grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-line">
      {stats.map((stat, i) => (
        <div key={i} className="p-5 flex flex-col justify-between">
          <span className="text-[13px] font-sans font-medium text-ink-soft mb-1.5">{stat.label}</span>
          <span className="text-[32px] font-display font-medium text-ink tracking-[-0.01em] tabular-nums leading-none">
            {stat.value}
          </span>
        </div>
      ))}
    </div>
  );
}
