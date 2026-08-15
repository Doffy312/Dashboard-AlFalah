import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import { TrendingUp } from 'lucide-react';

const LEGEND_ITEMS = [
  { key: 'total', label: 'Total Pequrban', color: '#10b981', bg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' },
  { key: 'sapi', label: 'Anggota Sapi', color: '#f59e0b', bg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400' },
  { key: 'kambing', label: 'Anggota Kambing', color: '#3b82f6', bg: 'bg-blue-500/10 text-blue-600 dark:text-blue-400' },
];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-surface/95 backdrop-blur-md border border-outline/50 p-3 rounded-xl shadow-xl text-xs space-y-1.5 z-30">
        <p className="font-bold text-on-surface border-b border-outline/30 pb-1 m-0">
          Tahun {label}
        </p>
        {payload.map((entry, idx) => (
          <div key={idx} className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-1.5" style={{ color: entry.color }}>
              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: entry.color }} />
              <span className="font-medium">{entry.name}:</span>
            </span>
            <span className="font-bold font-mono text-on-surface">
              {entry.value} Orang
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const QurbanGrowthChart = ({ data = [] }) => {
  const chartData = data.length > 0
    ? data
    : [
        { tahun: 2024, total: 14, sapi: 14, kambing: 0 },
        { tahun: 2025, total: 21, sapi: 14, kambing: 7 },
        { tahun: 2026, total: 28, sapi: 21, kambing: 7 },
      ];

  return (
    <div className="p-4 sm:p-6 rounded-2xl bg-surface border border-outline/50 shadow-sm flex flex-col gap-4">
      {/* Header & Responsive HTML Legend */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0">
            <TrendingUp size={20} />
          </div>
          <div>
            <h3 className="font-title-md font-bold text-on-surface dark:text-white m-0">
              Tren Pertumbuhan Pequrban
            </h3>
            <p className="text-xs text-on-surface-variant dark:text-white/60 m-0 mt-0.5">
              Perkembangan partisipasi jemaah berqurban dari tahun ke tahun
            </p>
          </div>
        </div>

        {/* Legend Badges */}
        <div className="flex flex-wrap items-center gap-2 text-xs pt-1 sm:pt-0">
          {LEGEND_ITEMS.map((item) => (
            <div
              key={item.key}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-outline/30 ${item.bg} font-medium`}
            >
              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
              <span>{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="h-[280px] w-full mt-1">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 15, right: 15, left: -15, bottom: 0 }}>
            <defs>
              <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="colorSapi" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="colorKambing" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.15} vertical={false} />
            <XAxis dataKey="tahun" stroke="#64748b" tickLine={false} axisLine={false} fontSize={12} dy={5} />
            <YAxis stroke="#64748b" tickLine={false} axisLine={false} allowDecimals={false} fontSize={12} dx={-5} />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="total"
              name="Total Pequrban"
              stroke="#10b981"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorTotal)"
            />
            <Area
              type="monotone"
              dataKey="sapi"
              name="Anggota Sapi"
              stroke="#f59e0b"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorSapi)"
            />
            <Area
              type="monotone"
              dataKey="kambing"
              name="Anggota Kambing"
              stroke="#3b82f6"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorKambing)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default QurbanGrowthChart;

