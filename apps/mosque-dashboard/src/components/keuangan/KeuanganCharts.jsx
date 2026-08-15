import { useState, useEffect, useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, 
  PieChart, Pie, Cell 
} from 'recharts';
import { formatCurrency } from '../../lib/utils';
import { format, parseISO } from 'date-fns';
import { id } from 'date-fns/locale';

// Dynamic vibrant color palette for flexible categories
const COLORS = [
  '#10b981', // Emerald
  '#3b82f6', // Blue
  '#f59e0b', // Amber
  '#8b5cf6', // Violet
  '#ec4899', // Pink
  '#06b6d4', // Cyan
  '#f97316', // Orange
  '#14b8a6', // Teal
  '#a855f7', // Purple
  '#6366f1', // Indigo
  '#84cc16', // Lime
  '#e11d48', // Rose
  '#0284c7', // Sky
  '#d97706', // Amber-dark
];

const getCategoryColor = (name, index) => {
  if (!name) return COLORS[index % COLORS.length];
  // Simple hash for consistent color mapping by category name
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const colorIndex = Math.abs(hash) % COLORS.length;
  return COLORS[colorIndex];
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-surface/95 backdrop-blur-md border border-outline p-2.5 sm:p-sm rounded-lg shadow-xl text-xs z-30">
        <p className="font-label-md text-on-surface mb-1.5 border-b border-outline/30 pb-1 font-semibold">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} className="font-body-sm flex items-center justify-between gap-3 my-0.5" style={{ color: entry.color }}>
            <span>{entry.name}:</span>
            <span className="font-semibold font-mono">{formatCurrency(entry.value)}</span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const CustomPieTooltip = ({ active, payload, totalSum }) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    const percentage = totalSum > 0 ? ((data.value / totalSum) * 100).toFixed(1) : '0';
    return (
      <div className="bg-surface/95 backdrop-blur-md border border-outline p-2.5 sm:p-sm rounded-lg shadow-xl text-xs z-30">
        <div className="flex items-center gap-2 mb-1">
          <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: data.payload.fill || data.color }}></span>
          <span className="font-label-md text-on-surface font-semibold truncate">{data.name}</span>
        </div>
        <div className="font-body-sm text-on-surface flex justify-between gap-md my-0.5">
          <span className="text-on-surface-variant">Nominal:</span>
          <span className="font-semibold font-mono">{formatCurrency(data.value)}</span>
        </div>
        <div className="font-body-sm text-on-surface flex justify-between gap-md my-0.5">
          <span className="text-on-surface-variant">Porsi:</span>
          <span className="font-semibold text-primary font-mono">{percentage}%</span>
        </div>
      </div>
    );
  }
  return null;
};

const CategoryBreakdownList = ({ data, totalSum }) => {
  if (!data || data.length === 0) return null;

  return (
    <div className="mt-sm pt-sm border-t border-outline/30 flex flex-col gap-xs max-h-[160px] overflow-y-auto hide-scrollbar">
      {data.map((item, idx) => {
        const percentage = totalSum > 0 ? ((item.value / totalSum) * 100).toFixed(1) : '0';
        return (
          <div key={idx} className="flex items-center justify-between py-1 px-1.5 rounded-lg hover:bg-surface-variant/50 transition-colors text-xs">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }}></span>
              <span className="text-on-surface font-medium truncate" title={item.name}>{item.name}</span>
            </div>
            <div className="flex items-center gap-2 shrink-0 ml-2">
              <span className="text-on-surface-variant font-mono text-[11px]">{percentage}%</span>
              <span className="text-on-surface font-semibold font-mono">{formatCurrency(item.value)}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

const KeuanganCharts = ({ transactions }) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const chartData = useMemo(() => {
    const monthlyDataMap = new Map();
    const incomeByCategory = new Map();
    const expenseByCategory = new Map();

    let totalIncomeSum = 0;
    let totalExpenseSum = 0;

    (transactions || []).forEach(t => {
      let dateObj;
      try {
        dateObj = typeof t.date === 'string' ? parseISO(t.date) : new Date(t.date);
      } catch {
        dateObj = new Date(t.date);
      }

      if (isNaN(dateObj.getTime())) return;

      const monthKey = format(dateObj, 'yyyy-MM');
      const monthLabel = format(dateObj, 'MMM yyyy', { locale: id });
      
      if (!monthlyDataMap.has(monthKey)) {
        monthlyDataMap.set(monthKey, {
          monthKey,
          name: monthLabel,
          Pemasukan: 0,
          Pengeluaran: 0
        });
      }

      const monthData = monthlyDataMap.get(monthKey);
      const amount = Number(t.amount) || 0;

      // Normalize category (trim & proper capital case)
      let rawCat = (t.category || 'Lainnya').trim();
      const category = rawCat ? (rawCat.charAt(0).toUpperCase() + rawCat.slice(1)) : 'Lainnya';

      if (t.type === 'Pemasukan') {
        monthData.Pemasukan += amount;
        incomeByCategory.set(category, (incomeByCategory.get(category) || 0) + amount);
        totalIncomeSum += amount;
      } else if (t.type === 'Pengeluaran') {
        monthData.Pengeluaran += amount;
        expenseByCategory.set(category, (expenseByCategory.get(category) || 0) + amount);
        totalExpenseSum += amount;
      }
    });

    const monthlyTrend = Array.from(monthlyDataMap.values()).sort((a, b) => a.monthKey.localeCompare(b.monthKey));
    
    // Calculate dynamic Y-axis step scale (Base 10 Juta, doubles to 20 Juta, 40 Juta... if peak exceeds box height)
    let peak = 0;
    monthlyTrend.forEach(item => {
      if (item.Pemasukan > peak) peak = item.Pemasukan;
      if (item.Pengeluaran > peak) peak = item.Pengeluaran;
    });

    const BASE_STEP = 10000000; // 10 Juta base step
    const MAX_INTERVALS = 5; // Maximum 5 ticks in box

    let step = BASE_STEP;
    if (peak > 0) {
      while (Math.ceil(peak / step) > MAX_INTERVALS) {
        step *= 2;
      }
    }

    const maxVal = Math.max(step, Math.ceil(peak / step) * step);

    const yTicks = [];
    for (let val = 0; val <= maxVal; val += step) {
      yTicks.push(val);
    }

    const incomePie = Array.from(incomeByCategory.entries())
      .map(([name, value], idx) => ({ 
        name, 
        value,
        color: getCategoryColor(name, idx)
      }))
      .sort((a, b) => b.value - a.value);

    const expensePie = Array.from(expenseByCategory.entries())
      .map(([name, value], idx) => ({ 
        name, 
        value,
        color: getCategoryColor(name, idx)
      }))
      .sort((a, b) => b.value - a.value);

    return { monthlyTrend, incomePie, expensePie, totalIncomeSum, totalExpenseSum, yTicks, maxVal };
  }, [transactions]);

  if (!transactions || transactions.length === 0) {
    return (
      <div className="glass-panel p-md rounded-xl mb-lg text-center text-on-surface-variant text-sm">
        Belum ada data transaksi untuk menampilkan grafik.
      </div>
    );
  }

  // Calculate dynamic minimum width if there are many months on mobile
  const minChartWidth = isMobile && chartData.monthlyTrend.length > 4
    ? Math.max(340, chartData.monthlyTrend.length * 75)
    : '100%';

  return (
    <div className="flex flex-col gap-md sm:gap-lg mb-lg">
      {/* Monthly Cashflow Bar Chart */}
      <div className="glass-panel p-3.5 sm:p-md rounded-xl overflow-hidden">
        <div className="flex items-center justify-between mb-sm sm:mb-md">
          <h3 className="font-label-lg sm:text-base font-semibold text-on-surface">Tren Kas Bulanan</h3>
          <span className="text-[11px] sm:text-xs font-normal text-on-surface-variant bg-surface-variant/40 px-2 py-0.5 rounded-md border border-outline/20">
            Real-time Data
          </span>
        </div>

        {/* Scrollable Container for Mobile to Prevent Clipping */}
        <div className="w-full overflow-x-auto hide-scrollbar">
          <div className="h-[280px] sm:h-[320px]" style={{ width: minChartWidth, minWidth: isMobile && chartData.monthlyTrend.length > 4 ? '340px' : '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                data={chartData.monthlyTrend} 
                margin={isMobile ? { top: 10, right: 10, left: -10, bottom: 0 } : { top: 10, right: 15, left: 10, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  stroke="#94a3b8" 
                  fontSize={isMobile ? 11 : 12} 
                  tickMargin={8}
                  interval={0}
                />
                <YAxis 
                  stroke="#94a3b8" 
                  fontSize={isMobile ? 10 : 12} 
                  domain={[0, chartData.maxVal || 10000000]}
                  ticks={chartData.yTicks || [0, 10000000]}
                  tickFormatter={(value) => {
                    if (value === 0) return '0';
                    if (value >= 1000000000) {
                      const miliar = value / 1000000000;
                      const numStr = Number.isInteger(miliar) ? miliar : miliar.toFixed(1);
                      return isMobile ? `${numStr}M` : `${numStr} Miliar`;
                    }
                    if (value >= 1000000) {
                      const juta = value / 1000000;
                      const numStr = Number.isInteger(juta) ? juta : juta.toFixed(1);
                      return isMobile ? `${numStr}Jt` : `${numStr} Juta`;
                    }
                    if (value >= 1000) {
                      const ribu = value / 1000;
                      const numStr = Number.isInteger(ribu) ? ribu : ribu.toFixed(0);
                      return isMobile ? `${numStr}rb` : `${numStr} Ribu`;
                    }
                    return `${value}`;
                  }}
                  width={isMobile ? 50 : 75}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
                <Legend 
                  wrapperStyle={{ paddingTop: isMobile ? '10px' : '18px', fontSize: isMobile ? '11px' : '12px' }} 
                />
                <Bar dataKey="Pemasukan" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={45} />
                <Bar dataKey="Pengeluaran" fill="#ef4444" radius={[4, 4, 0, 0]} maxBarSize={45} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Category Pie Charts Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-md sm:gap-lg">
        {/* Income by Category */}
        <div className="glass-panel p-3.5 sm:p-md rounded-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-sm">
              <h3 className="font-label-lg sm:text-base font-semibold text-on-surface">Pemasukan Berdasarkan Kategori</h3>
              <span className="text-[11px] sm:text-xs font-semibold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                {chartData.incomePie.length} Kategori
              </span>
            </div>
            <div className="h-[200px] sm:h-[220px] w-full flex items-center justify-center relative">
              {chartData.incomePie.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData.incomePie}
                      cx="50%"
                      cy="50%"
                      innerRadius={isMobile ? 40 : 55}
                      outerRadius={isMobile ? 70 : 85}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {chartData.incomePie.map((entry, index) => (
                        <Cell key={`income-cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomPieTooltip totalSum={chartData.totalIncomeSum} />} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-on-surface-variant text-xs sm:text-sm">Tidak ada data pemasukan</div>
              )}
            </div>
          </div>
          <CategoryBreakdownList data={chartData.incomePie} totalSum={chartData.totalIncomeSum} />
        </div>

        {/* Expense by Category */}
        <div className="glass-panel p-3.5 sm:p-md rounded-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-sm">
              <h3 className="font-label-lg sm:text-base font-semibold text-on-surface">Pengeluaran Berdasarkan Kategori</h3>
              <span className="text-[11px] sm:text-xs font-semibold text-rose-500 bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/20">
                {chartData.expensePie.length > 0 ? `${chartData.expensePie.length} Kategori` : '0 Kategori'}
              </span>
            </div>
            <div className="h-[200px] sm:h-[220px] w-full flex items-center justify-center relative">
              {chartData.expensePie.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData.expensePie}
                      cx="50%"
                      cy="50%"
                      innerRadius={isMobile ? 40 : 55}
                      outerRadius={isMobile ? 70 : 85}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {chartData.expensePie.map((entry, index) => (
                        <Cell key={`expense-cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomPieTooltip totalSum={chartData.totalExpenseSum} />} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-on-surface-variant text-xs sm:text-sm">Tidak ada data pengeluaran</div>
              )}
            </div>
          </div>
          <CategoryBreakdownList data={chartData.expensePie} totalSum={chartData.totalExpenseSum} />
        </div>
      </div>
    </div>
  );
};

export default KeuanganCharts;

