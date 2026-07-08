import React, { useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, 
  PieChart, Pie, Cell 
} from 'recharts';
import { formatCurrency } from '../../lib/utils';
import { format, parseISO } from 'date-fns';
import { id } from 'date-fns/locale';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4'];

const KeuanganCharts = ({ transactions }) => {
  const chartData = useMemo(() => {
    // 1. Process Monthly Data
    const monthlyDataMap = new Map();
    
    // 2. Process Category Data
    const incomeByCategory = new Map();
    const expenseByCategory = new Map();

    transactions.forEach(t => {
      // Ensure date is processed correctly
      let dateObj;
      try {
        dateObj = typeof t.date === 'string' ? parseISO(t.date) : new Date(t.date);
      } catch (e) {
        dateObj = new Date(t.date);
      }

      if (isNaN(dateObj.getTime())) return; // Skip invalid dates

      const monthKey = format(dateObj, 'yyyy-MM');
      const monthLabel = format(dateObj, 'MMM yyyy', { locale: id });
      
      // Initialize month if not exist
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
      const category = t.category || 'Lainnya';

      if (t.type === 'Pemasukan') {
        monthData.Pemasukan += amount;
        incomeByCategory.set(category, (incomeByCategory.get(category) || 0) + amount);
      } else if (t.type === 'Pengeluaran') {
        monthData.Pengeluaran += amount;
        expenseByCategory.set(category, (expenseByCategory.get(category) || 0) + amount);
      }
    });

    // Sort monthly data chronologically
    const monthlyTrend = Array.from(monthlyDataMap.values()).sort((a, b) => a.monthKey.localeCompare(b.monthKey));
    
    // Format category data for Pie charts
    const incomePie = Array.from(incomeByCategory.entries()).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
    const expensePie = Array.from(expenseByCategory.entries()).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);

    return { monthlyTrend, incomePie, expensePie };
  }, [transactions]);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-surface border border-outline p-sm rounded-lg shadow-lg">
          <p className="font-label-md text-on-surface mb-2">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="font-body-sm flex justify-between gap-md" style={{ color: entry.color }}>
              <span>{entry.name}:</span>
              <span className="font-semibold">{formatCurrency(entry.value)}</span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const CustomPieTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-surface border border-outline p-sm rounded-lg shadow-lg">
          <p className="font-body-sm text-on-surface flex justify-between gap-md">
            <span>{payload[0].name}:</span>
            <span className="font-semibold" style={{ color: payload[0].payload.fill }}>
              {formatCurrency(payload[0].value)}
            </span>
          </p>
        </div>
      );
    }
    return null;
  };

  if (!transactions || transactions.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col gap-lg mb-lg">
      <div className="glass-panel p-md rounded-xl">
        <h3 className="font-label-lg text-on-surface mb-md">Tren Kas Bulanan</h3>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData.monthlyTrend} margin={{ top: 10, right: 10, left: 20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
              <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickMargin={10} />
              <YAxis 
                stroke="#94a3b8" 
                fontSize={12} 
                tickFormatter={(value) => `Rp ${value / 1000000}M`}
                width={80}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
              <Legend wrapperStyle={{ paddingTop: '20px' }} />
              <Bar dataKey="Pemasukan" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={50} />
              <Bar dataKey="Pengeluaran" fill="#ef4444" radius={[4, 4, 0, 0]} maxBarSize={50} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
        <div className="glass-panel p-md rounded-xl">
          <h3 className="font-label-lg text-on-surface mb-md">Pemasukan Berdasarkan Kategori</h3>
          <div className="h-[250px] w-full flex items-center justify-center">
            {chartData.incomePie.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData.incomePie}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {chartData.incomePie.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomPieTooltip />} />
                  <Legend layout="vertical" verticalAlign="middle" align="right" />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-on-surface-variant text-sm">Tidak ada data pemasukan</div>
            )}
          </div>
        </div>

        <div className="glass-panel p-md rounded-xl">
          <h3 className="font-label-lg text-on-surface mb-md">Pengeluaran Berdasarkan Kategori</h3>
          <div className="h-[250px] w-full flex items-center justify-center">
            {chartData.expensePie.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData.expensePie}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {chartData.expensePie.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomPieTooltip />} />
                  <Legend layout="vertical" verticalAlign="middle" align="right" />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-on-surface-variant text-sm">Tidak ada data pengeluaran</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default KeuanganCharts;
