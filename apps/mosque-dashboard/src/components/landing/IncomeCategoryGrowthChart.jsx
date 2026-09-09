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
import { Lock, TrendingUp, PieChart as PieIcon, BarChart2, Inbox } from 'lucide-react';
import { useAllocation, useCategoryTrends } from '../../hooks/useDashboard';

const CATEGORY_COLORS = ['#10b981', '#f59e0b', '#3b82f6', '#8b5cf6', '#ec4899', '#14b8a6'];

const CustomHiddenTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const categoryName = data.category || data.name || payload[0].name;
    const value = data.percentage ?? payload[0].value ?? 0;

    return (
      <div className="bg-[#0b131a] border border-white/15 p-3 rounded-xl shadow-2xl text-xs text-white space-y-1.5 z-30">
        <p className="font-bold text-amber-400 border-b border-white/10 pb-1 flex items-center justify-between gap-4">
          <span>{categoryName}</span>
          <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
            <Lock size={10} className="text-emerald-400" /> Nominal Tersembunyi
          </span>
        </p>
        <div className="space-y-1 text-slate-300">
          <div className="flex justify-between gap-6">
            <span className="text-slate-400">Porsi / Indeks:</span>
            <span className="font-bold text-emerald-400 font-mono">{value}%</span>
          </div>
          {data.growth && (
            <div className="flex justify-between gap-6">
              <span className="text-slate-400">Pertumbuhan:</span>
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
  const currentYear = new Date().getFullYear();
  const CHART_QUERY_OPTIONS = { staleTime: 10_000, refetchInterval: 60_000 };

  const { data: allocationData, isLoading: isLoadingAlloc } = useAllocation('Pemasukan', CHART_QUERY_OPTIONS);
  const { data: trendsRawData, isLoading: isLoadingTrends } = useCategoryTrends('Pemasukan', currentYear, CHART_QUERY_OPTIONS);

  const hasData = Array.isArray(allocationData) && allocationData.length > 0;

  // Real category contributions computed directly from database
  const categoryContributions = useMemo(() => {
    if (!Array.isArray(allocationData) || allocationData.length === 0) return [];
    return allocationData.map((item) => ({
      category: item.label,
      percentage: Number(item.percentage) || 0,
      total: Number(item.total) || 0,
    }));
  }, [allocationData]);

  // Unique categories for the trends chart
  const activeCategories = useMemo(() => {
    if (!Array.isArray(trendsRawData) || trendsRawData.length === 0) {
      return categoryContributions.map(c => c.category).slice(0, 4);
    }
    const set = new Set();
    trendsRawData.forEach(d => {
      if (d.category) set.add(d.category);
    });
    return Array.from(set).slice(0, 4);
  }, [trendsRawData, categoryContributions]);

  // Compute monthly trends per category from actual database transactions
  const monthlyCategoryTrends = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des'];
    const currentMonthIdx = new Date().getMonth();
    const activeMonths = months.slice(Math.max(0, currentMonthIdx - 5), currentMonthIdx + 1);

    if (!Array.isArray(trendsRawData) || trendsRawData.length === 0) {
      return [];
    }

    // Find maximum monthly total to calculate relative 0-100% scale
    const maxVal = trendsRawData.reduce((max, item) => Math.max(max, Number(item.total) || 0), 1);

    return activeMonths.map((m) => {
      const monthNumberStr = String(months.indexOf(m) + 1).padStart(2, '0');
      const row = { month: m };

      activeCategories.forEach((cat) => {
        const match = trendsRawData.find(d => d.month === monthNumberStr && d.category === cat);
        const amount = match ? Number(match.total) : 0;
        row[cat] = Math.round((amount / maxVal) * 100);
      });

      return row;
    });
  }, [trendsRawData, activeCategories]);

  // Calculate real month-over-month growth for category badges
  const categoryGrowthMap = useMemo(() => {
    if (!Array.isArray(trendsRawData) || trendsRawData.length === 0) return {};
    const months = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];
    const currentMonthNum = new Date().getMonth() + 1;
    const curMonthStr = String(currentMonthNum).padStart(2, '0');
    const prevMonthStr = String(currentMonthNum > 1 ? currentMonthNum - 1 : 12).padStart(2, '0');

    const result = {};
    activeCategories.forEach(cat => {
      const cur = Number(trendsRawData.find(d => d.month === curMonthStr && d.category === cat)?.total || 0);
      const prev = Number(trendsRawData.find(d => d.month === prevMonthStr && d.category === cat)?.total || 0);

      if (prev > 0) {
        const pct = Math.round(((cur - prev) / prev) * 100);
        result[cat] = pct >= 0 ? `+${pct}%` : `${pct}%`;
      } else if (cur > 0) {
        result[cat] = '+100%';
      } else {
        result[cat] = '0%';
      }
    });

    return result;
  }, [trendsRawData, activeCategories]);

  // Loading state
  if (isLoadingAlloc || isLoadingTrends) {
    return (
      <div className="p-8 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md flex flex-col items-center justify-center min-h-[260px] space-y-3 animate-pulse">
        <div className="w-10 h-10 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
        <p className="text-xs text-slate-400 font-mono">Memuat data grafik dari database...</p>
      </div>
    );
  }

  // Graceful empty state when no transactions exist in the database
  if (!hasData) {
    return (
      <div className="space-y-6">
        {/* Header Note */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-200 text-xs">
          <div className="flex items-center gap-2.5 font-medium">
            <Lock size={18} className="text-amber-400 shrink-0" />
            <span>Nominal angka rupiah disembunyikan secara otomatis untuk menjaga privasi donatur. Menampilkan proporsi persentase dan indeks tren real-time.</span>
          </div>
          <div className="px-2.5 py-1 rounded-md bg-amber-500/20 text-amber-300 font-mono font-bold text-[11px] shrink-0 self-start sm:self-auto">
            REAL-TIME DATA
          </div>
        </div>

        {/* Empty State Banner */}
        <div className="p-8 sm:p-12 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md text-center flex flex-col items-center justify-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Inbox size={28} />
          </div>
          <div className="space-y-1.5 max-w-md">
            <h4 className="text-base sm:text-lg font-bold text-white">Belum Ada Transaksi Pemasukan</h4>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Data transaksi pemasukan di database saat ini masih kosong. Grafik proporsi dan tren pertumbuhan akan terupdate otomatis begitu transaksi pemasukan baru dicatat.
            </p>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-emerald-400 font-mono bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/20">
            <TrendingUp size={12} /> Menunggu pencatatan transaksi kas
          </div>
        </div>
      </div>
    );
  }

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
              <p className="text-xs text-slate-400 mt-0.5">Persentase kontribusi riil tanpa nominal rupiah</p>
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

            {/* Custom Responsive Legend */}
            <div className="w-full mt-3 pt-3 border-t border-white/10 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-300">
              {categoryContributions.map((entry, index) => (
                <div key={`legend-${index}`} className="flex items-center gap-2.5 px-2 py-1 rounded-lg bg-white/5 sm:bg-transparent hover:bg-white/10 transition-colors">
                  <span 
                    className="w-3 h-3 rounded-sm shrink-0 shadow-sm" 
                    style={{ backgroundColor: CATEGORY_COLORS[index % CATEGORY_COLORS.length] }} 
                  />
                  <span className="text-slate-200 text-xs font-medium truncate" title={entry.category}>
                    {entry.category} ({entry.percentage}%)
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
              <p className="text-xs text-slate-400 mt-0.5">Indeks pertumbuhan relatif bulanan dari database (0 - 100%)</p>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-300 text-[11px] font-semibold border border-amber-500/20 shrink-0 self-start sm:self-auto">
              Indeks Tren
            </span>
          </div>

          <div className="h-56 sm:h-64 w-full">
            {monthlyCategoryTrends.length > 0 ? (
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
                  {activeCategories.map((cat, idx) => (
                    <Bar 
                      key={cat} 
                      dataKey={cat} 
                      fill={CATEGORY_COLORS[idx % CATEGORY_COLORS.length]} 
                      radius={[4, 4, 0, 0]} 
                    />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 text-xs">
                <span>Belum ada tren bulanan yang tercatat</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Category Breakdown Table / Badges */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {categoryContributions.map((item, idx) => {
          const growth = categoryGrowthMap[item.category] || '0%';
          return (
            <div key={idx} className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: CATEGORY_COLORS[idx % CATEGORY_COLORS.length] }} />
                <div className="min-w-0">
                  <div className="text-xs font-medium text-white truncate" title={item.category}>{item.category}</div>
                  <div className="text-[11px] text-emerald-400 flex items-center gap-1 mt-0.5 font-mono">
                    <TrendingUp size={12} /> {growth}
                  </div>
                </div>
              </div>
              <div className="text-right shrink-0 ml-2">
                <div className="text-base font-extrabold text-white font-mono">{item.percentage}%</div>
                <div className="text-[10px] text-slate-400">Porsi Inflow</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
