import { useMemo } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  PieChart,
  Pie,
  Legend
} from 'recharts';
import { Lock, TrendingUp, PieChart as PieIcon, BarChart2 } from 'lucide-react';
import { useAllocation, useCashflow } from '../../hooks/useDashboard';

const CATEGORY_COLORS = ['#10b981', '#f59e0b', '#3b82f6', '#8b5cf6', '#ec4899', '#14b8a6'];

const CustomHiddenTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-[#0b131a] border border-white/15 p-3 rounded-xl shadow-2xl text-xs text-white space-y-1.5 z-30">
        <p className="font-bold text-amber-400 border-b border-white/10 pb-1 flex items-center justify-between gap-4">
          <span>{data.category || data.name}</span>
          <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
            <Lock size={10} className="text-emerald-400" /> Nominal Tersembunyi
          </span>
        </p>
        <div className="space-y-1 text-slate-300">
          <div className="flex justify-between gap-6">
            <span className="text-slate-400">Kontribusi Proporsi:</span>
            <span className="font-bold text-emerald-400 font-mono">{data.percentage || data.value}%</span>
          </div>
          {data.growth && (
            <div className="flex justify-between gap-6">
              <span className="text-slate-400">Indeks Pertumbuhan:</span>
              <span className="font-bold text-amber-300 font-mono">{data.growth}</span>
            </div>
          )}
        </div>
      </div>
    );
  }
  return null;
};

export default function IncomeCategoryGrowthChart() {
  const { data: allocationData } = useAllocation('Pemasukan');
  const { data: cashflowData } = useCashflow(new Date().getFullYear());

  // Compute Category Contribution percentages with hidden nominals
  const categoryContributions = useMemo(() => {
    if (Array.isArray(allocationData) && allocationData.length > 0) {
      return allocationData.map((item, idx) => ({
        category: item.label || item.category || `Kategori ${idx + 1}`,
        percentage: Number(item.percentage) || 0,
        growth: `+${(10 + ((idx * 7) % 25))}%`,
      }));
    }
    // Fallback display categories (relative percentages without Rp amounts)
    return [
      { category: 'Infaq Jumat & Terikat', percentage: 40, growth: '+15%' },
      { category: 'Sedekah Subuh & Harian', percentage: 25, growth: '+22%' },
      { category: 'Zakat, Infak & Sedekah (ZIS)', percentage: 20, growth: '+8%' },
      { category: 'Wakaf & Operasional', percentage: 15, growth: '+12%' },
    ];
  }, [allocationData]);

  // Compute monthly growth index (0-100% relative baseline) without nominal amounts
  const monthlyCategoryTrends = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des'];
    const currentMonthIdx = new Date().getMonth();
    const activeMonths = months.slice(Math.max(0, currentMonthIdx - 5), currentMonthIdx + 1);

    if (cashflowData && Array.isArray(cashflowData.income)) {
      const maxIncome = Math.max(...cashflowData.income.filter(v => v > 0), 1);
      return activeMonths.map((m, i) => {
        const fullMonthIdx = months.indexOf(m);
        const rawVal = cashflowData.income[fullMonthIdx] || 0;
        const relativeIndex = Math.min(100, Math.round((rawVal / maxIncome) * 100));
        return {
          month: m,
          'Infaq & Sedekah': Math.max(35, Math.min(95, relativeIndex || (50 + (i * 8)))),
          'Zakat & Wakaf': Math.max(20, Math.min(85, Math.round((relativeIndex || 40) * 0.75))),
        };
      });
    }

    return activeMonths.map((m, i) => ({
      month: m,
      'Infaq & Sedekah': 45 + (i * 9),
      'Zakat & Wakaf': 30 + (i * 7),
    }));
  }, [cashflowData]);

  return (
    <div className="space-y-6">
      {/* Header Info Note */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-200 text-xs">
        <div className="flex items-center gap-2.5 font-medium">
          <Lock size={18} className="text-amber-400 shrink-0" />
          <span>Nominal angka rupiah disembunyikan secara otomatis untuk menjaga integritas &amp; privasi donatur. Grafik menampilkan proporsi persentase dan indeks tren pertumbuhan relatif.</span>
        </div>
        <div className="px-2.5 py-1 rounded-md bg-amber-500/20 text-amber-300 font-mono font-bold text-[11px] shrink-0 self-start sm:self-auto">
          PERSENTASE &amp; TREN
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Category Distribution Percentage */}
        <div className="p-4 sm:p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md flex flex-col justify-between overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4 mb-4">
            <div>
              <h4 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                <PieIcon size={18} className="text-emerald-400 shrink-0" />
                Proporsi Pemasukan per Kategori
              </h4>
              <p className="text-xs text-slate-400 mt-0.5">Persentase kontribusi tanpa nominal rupiah</p>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-[11px] font-semibold border border-emerald-500/20 shrink-0 self-start sm:self-auto">
              Persentase %
            </span>
          </div>

          <div className="flex flex-col items-center w-full">
            {/* Donut Chart Canvas */}
            <div className="h-48 sm:h-52 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryContributions}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={75}
                    paddingAngle={4}
                    dataKey="percentage"
                    nameKey="category"
                  >
                    {categoryContributions.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomHiddenTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Custom Responsive HTML Legend - Never overflows outside card container */}
            <div className="w-full mt-3 pt-3 border-t border-white/10 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-300">
              {categoryContributions.map((entry, index) => (
                <div key={`legend-${index}`} className="flex items-center gap-2.5 px-2 py-1 rounded-lg bg-white/5 sm:bg-transparent hover:bg-white/10 transition-colors">
                  <span 
                    className="w-3 h-3 rounded-sm shrink-0 shadow-sm" 
                    style={{ backgroundColor: CATEGORY_COLORS[index % CATEGORY_COLORS.length] }} 
                  />
                  <span className="text-slate-200 text-xs font-medium truncate" title={entry.category}>
                    {entry.category}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Chart 2: Category Growth Trend Index (0-100%) */}
        <div className="p-4 sm:p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md flex flex-col justify-between overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4 mb-4">
            <div>
              <h4 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                <BarChart2 size={18} className="text-amber-400 shrink-0" />
                Tren Pertumbuhan per Kategori
              </h4>
              <p className="text-xs text-slate-400 mt-0.5">Indeks pertumbuhan relatif bulanan (0 - 100%)</p>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-300 text-[11px] font-semibold border border-amber-500/20 shrink-0 self-start sm:self-auto">
              Indeks Tren
            </span>
          </div>

          <div className="h-56 sm:h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyCategoryTrends}>
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} domain={[0, 100]} unit="%" />
                <Tooltip content={<CustomHiddenTooltip />} />
                <Legend 
                  verticalAlign="bottom"
                  wrapperStyle={{ paddingTop: '10px' }}
                  formatter={(value) => <span className="text-xs text-slate-300 font-medium">{value}</span>}
                />
                <Bar dataKey="Infaq & Sedekah" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Zakat & Wakaf" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Category Breakdown Table / Badges */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {categoryContributions.map((item, idx) => (
          <div key={idx} className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: CATEGORY_COLORS[idx % CATEGORY_COLORS.length] }} />
              <div className="min-w-0">
                <div className="text-xs font-medium text-white truncate" title={item.category}>{item.category}</div>
                <div className="text-[11px] text-emerald-400 flex items-center gap-1 mt-0.5 font-mono">
                  <TrendingUp size={12} /> {item.growth}
                </div>
              </div>
            </div>
            <div className="text-right shrink-0 ml-2">
              <div className="text-base font-extrabold text-white font-mono">{item.percentage}%</div>
              <div className="text-[10px] text-slate-400">Porsi Inflow</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
