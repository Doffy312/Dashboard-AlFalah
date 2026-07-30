import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const COLORS = ['#f59e0b', '#3b82f6', '#10b981'];

/**
 * LaporanCharts — lazy-loaded PieChart for the "Analisis Program" tab.
 * Separating recharts here means the ~412KB vendor-charts chunk is only
 * fetched when the user switches to the "Analisis Program" tab.
 */
const LaporanCharts = ({ programSummary }) => {
  const data = programSummary ?? { total: 0, direncanakan: 0, berjalan: 0, selesai: 0 };
  
  const chartData = [
    { name: 'Direncanakan', value: data.direncanakan ?? 0 },
    { name: 'Sedang Berjalan', value: data.berjalan ?? 0 },
    { name: 'Selesai', value: data.selesai ?? 0 }
  ].filter(item => item.value > 0);

  return (
    <div className="w-full glass-panel rounded-xl p-md flex flex-col">
      <h3 className="font-title-md text-[20px] font-semibold leading-[28px] text-on-surface mb-6">Analisis Program Kerja</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="p-4 rounded-xl bg-surface-variant border border-outline/30 flex flex-col items-center justify-center text-center">
          <span className="text-3xl font-bold text-white mb-1">{data.total}</span>
          <span className="text-xs text-on-surface-variant font-medium">Total Program</span>
        </div>
        <div className="p-4 rounded-xl bg-surface-variant border border-outline/30 flex flex-col items-center justify-center text-center">
          <span className="text-3xl font-bold text-amber-500 mb-1">{data.direncanakan ?? 0}</span>
          <span className="text-xs text-on-surface-variant font-medium">Direncanakan</span>
        </div>
        <div className="p-4 rounded-xl bg-surface-variant border border-outline/30 flex flex-col items-center justify-center text-center">
          <span className="text-3xl font-bold text-blue-500 mb-1">{data.berjalan ?? 0}</span>
          <span className="text-xs text-on-surface-variant font-medium">Sedang Berjalan</span>
        </div>
        <div className="p-4 rounded-xl bg-surface-variant border border-outline/30 flex flex-col items-center justify-center text-center">
          <span className="text-3xl font-bold text-emerald-500 mb-1">{data.selesai ?? 0}</span>
          <span className="text-xs text-on-surface-variant font-medium">Selesai</span>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1 h-[250px] bg-surface-variant/30 rounded-xl border border-outline/20 p-4">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={5}
                dataKey="value"
                stroke="none"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{backgroundColor: '#1a2432', borderRadius: '12px', border: '1px solid #2a3644', color: '#fff'}}
                itemStyle={{color: '#fff'}}
              />
              <Legend verticalAlign="bottom" height={36} iconType="circle" />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="flex-1 bg-surface-variant/50 rounded-xl p-6 border border-outline/20 flex flex-col justify-center">
          <h4 className="text-sm font-semibold text-white mb-4">Informasi Tambahan</h4>
          <p className="text-sm text-on-surface-variant leading-relaxed">
            Dari total <span className="text-white font-bold">{data.total}</span> program yang terdaftar, terdapat <span className="text-emerald-500 font-bold">{data.selesai ?? 0}</span> program yang telah berhasil diselesaikan. Fokus saat ini berada pada penyelesaian <span className="text-blue-500 font-bold">{data.berjalan ?? 0}</span> program yang sedang berjalan dan persiapan untuk <span className="text-amber-500 font-bold">{data.direncanakan ?? 0}</span> program yang akan datang.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LaporanCharts;
