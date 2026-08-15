import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { TrendingUp } from 'lucide-react';

const QurbanGrowthChart = ({ data = [] }) => {
  const chartData = data.length > 0
    ? data
    : [
        { tahun: 2024, total: 14, sapi: 14, kambing: 0 },
        { tahun: 2025, total: 21, sapi: 14, kambing: 7 },
        { tahun: 2026, total: 28, sapi: 21, kambing: 7 },
      ];

  return (
    <div className="p-lg rounded-2xl bg-surface border border-outline/50 shadow-sm flex flex-col gap-md">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-sm">
          <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <TrendingUp size={20} />
          </div>
          <div>
            <h3 className="font-title-md font-bold text-on-surface dark:text-white m-0">
              Tren Pertumbuhan Pequrban
            </h3>
            <p className="text-xs text-on-surface-variant dark:text-white/60 m-0">
              Perkembangan partisipasi jemaah berqurban dari tahun ke tahun
            </p>
          </div>
        </div>
      </div>

      <div className="h-[280px] w-full mt-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
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
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.3} />
            <XAxis dataKey="tahun" stroke="#64748b" tickLine={false} />
            <YAxis stroke="#64748b" tickLine={false} allowDecimals={false} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'var(--surface-color, #1e293b)',
                borderColor: 'var(--outline-color, #334155)',
                borderRadius: '12px',
                color: '#fff',
                boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
              }}
            />
            <Legend verticalAlign="top" height={36} />
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
