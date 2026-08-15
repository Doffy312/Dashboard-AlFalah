import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const STATUS_ITEMS = [
  { key: 'selesai', label: 'Selesai', color: '#10b981', bgClass: 'bg-emerald-500', textClass: 'text-emerald-400' },
  { key: 'berjalan', label: 'Sedang Berjalan', color: '#3b82f6', bgClass: 'bg-blue-500', textClass: 'text-blue-400' },
  { key: 'direncanakan', label: 'Direncanakan', color: '#f59e0b', bgClass: 'bg-amber-500', textClass: 'text-amber-400' },
];

/**
 * LaporanCharts — lazy-loaded PieChart for the "Analisis Program" tab.
 * Separating recharts here means the ~412KB vendor-charts chunk is only
 * fetched when the user switches to the "Analisis Program" tab.
 */
const LaporanCharts = ({ programSummary }) => {
  const data = programSummary ?? { total: 0, direncanakan: 0, berjalan: 0, selesai: 0 };
  const total = data.total || ((data.selesai ?? 0) + (data.berjalan ?? 0) + (data.direncanakan ?? 0));

  const chartData = [
    { name: 'Direncanakan', value: data.direncanakan ?? 0, color: '#f59e0b' },
    { name: 'Sedang Berjalan', value: data.berjalan ?? 0, color: '#3b82f6' },
    { name: 'Selesai', value: data.selesai ?? 0, color: '#10b981' }
  ].filter(item => item.value > 0);

  const renderCustomLegend = (props) => {
    const { payload } = props;
    return (
      <div className="flex flex-wrap justify-center items-center gap-4 pt-2">
        {payload.map((entry, index) => (
          <div key={`item-${index}`} className="flex items-center gap-1.5 text-xs text-on-surface-variant font-medium">
            <span className="w-2.5 h-2.5 rounded-full inline-block shrink-0" style={{ backgroundColor: entry.color }} />
            <span>{entry.value}: <strong className="text-on-surface">{entry.payload.value}</strong></span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="w-full glass-panel rounded-xl p-4 sm:p-6 flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h3 className="font-title-md text-[20px] font-semibold leading-[28px] text-on-surface">Analisis Program Kerja</h3>
          <p className="text-xs text-on-surface-variant">Statistik dan rincian progres pelaksanaan program masjid</p>
        </div>
      </div>
      
      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-3.5 sm:p-4 rounded-xl bg-surface-variant/40 border border-outline/20 flex flex-col items-center justify-center text-center">
          <span className="text-2xl sm:text-3xl font-bold text-white mb-1">{total}</span>
          <span className="text-xs text-on-surface-variant font-medium">Total Program</span>
        </div>
        <div className="p-3.5 sm:p-4 rounded-xl bg-surface-variant/40 border border-outline/20 flex flex-col items-center justify-center text-center">
          <span className="text-2xl sm:text-3xl font-bold text-amber-500 mb-1">{data.direncanakan ?? 0}</span>
          <span className="text-xs text-on-surface-variant font-medium">Direncanakan</span>
        </div>
        <div className="p-3.5 sm:p-4 rounded-xl bg-surface-variant/40 border border-outline/20 flex flex-col items-center justify-center text-center">
          <span className="text-2xl sm:text-3xl font-bold text-blue-500 mb-1">{data.berjalan ?? 0}</span>
          <span className="text-xs text-on-surface-variant font-medium">Sedang Berjalan</span>
        </div>
        <div className="p-3.5 sm:p-4 rounded-xl bg-surface-variant/40 border border-outline/20 flex flex-col items-center justify-center text-center">
          <span className="text-2xl sm:text-3xl font-bold text-emerald-500 mb-1">{data.selesai ?? 0}</span>
          <span className="text-xs text-on-surface-variant font-medium">Selesai</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Chart Box */}
        <div className="lg:col-span-5 min-h-[280px] bg-surface-variant/30 rounded-xl border border-outline/20 p-4 flex flex-col justify-between">
          <h4 className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-2">Persentase Status Program</h4>
          {chartData.length > 0 ? (
            <div className="h-[220px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="45%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                    stroke="none"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{backgroundColor: '#1a2432', borderRadius: '12px', border: '1px solid #2a3644', color: '#fff', fontSize: '12px'}}
                    itemStyle={{color: '#fff'}}
                  />
                  <Legend content={renderCustomLegend} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-on-surface-variant text-sm py-8">
              <span className="material-symbols-outlined text-3xl mb-2 opacity-50">pie_chart</span>
              <span>Belum ada data program</span>
            </div>
          )}
        </div>

        {/* Detailed Breakdown & Formatted Summary Box */}
        <div className="lg:col-span-7 bg-surface-variant/40 rounded-xl p-5 sm:p-6 border border-outline/20 flex flex-col justify-between gap-5">
          <div>
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-outline/15">
              <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-lg">analytics</span>
                Rincian & Progres Status
              </h4>
              <span className="text-xs text-on-surface-variant font-medium">Progres Akumulatif</span>
            </div>

            {/* Progress Bar Rows */}
            <div className="flex flex-col gap-3.5">
              {STATUS_ITEMS.map((item) => {
                const count = data[item.key] ?? 0;
                const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
                return (
                  <div key={item.key} className="flex flex-col gap-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="flex items-center gap-2 font-medium text-on-surface">
                        <span className={`w-2 h-2 rounded-full ${item.bgClass}`}></span>
                        {item.label}
                      </span>
                      <span className="font-semibold text-on-surface">
                        {count} Program <span className="text-on-surface-variant text-[11px] font-normal">({percentage}%)</span>
                      </span>
                    </div>
                    <div className="w-full bg-surface-variant rounded-full h-2 overflow-hidden border border-outline/10">
                      <div 
                        className={`h-full ${item.bgClass} transition-all duration-500 rounded-full`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Clean Structured Insight Summary */}
          <div className="p-3.5 rounded-lg bg-surface-variant/60 border border-outline/20 flex gap-3 items-start">
            <span className="material-symbols-outlined text-primary text-xl mt-0.5 shrink-0">info</span>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              Dari total <strong className="text-white">{total}</strong> program yang terdaftar, sebanyak <strong className="text-emerald-400">{data.selesai ?? 0}</strong> program ({total > 0 ? Math.round(((data.selesai ?? 0) / total) * 100) : 0}%) telah berhasil diselesaikan. Saat ini terdapat <strong className="text-blue-400">{data.berjalan ?? 0}</strong> program aktif berjalan dan <strong className="text-amber-400">{data.direncanakan ?? 0}</strong> program dalam tahap perencanaan.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LaporanCharts;
