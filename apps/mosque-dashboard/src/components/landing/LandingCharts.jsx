import {
  ResponsiveContainer,
  BarChart,
  Bar,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  Tooltip
} from 'recharts';

const COLORS = ['#047857', '#10b981', '#34d399', '#6ee7b7'];

const CustomTooltip = ({ active, payload, label, formatCurrencyFn }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-surface border border-outline-variant p-3 rounded-xl shadow-2xl text-xs text-white space-y-1 z-30">
        <p className="font-bold text-emerald-400 mb-1 border-b border-outline-variant pb-1">{label}</p>
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
              <span className="text-on-surface-variant">{entry.name}:</span>
            </span>
            <span className="font-mono font-semibold text-white">
              {formatCurrencyFn ? formatCurrencyFn(entry.value) : entry.value}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const LandingCharts = ({ jemaahTrendData = [], recentCashflow = [], summary = {}, formattedAllocation = [], formatCurrencyFn }) => {
  return (
    <>
      {/* 1. Jemaah Trend Chart */}
      <div className="bg-surface/60 backdrop-blur-md border border-outline-variant p-6 rounded-2xl shadow-lg shadow-black/20 flex flex-col justify-between">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-playfair text-lg font-bold text-white">Pertumbuhan Jemaah</h3>
          <span className="text-xs text-emerald-400 font-semibold bg-emerald-900/30 px-2.5 py-1 rounded-full border border-emerald-500/20">+12% Bulan Ini</span>
        </div>
        <div className="h-44 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={jemaahTrendData}>
              <defs>
                <linearGradient id="jemaahGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="total" name="Jemaah" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#jemaahGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 2. Cashflow Inflow vs Outflow */}
      <div className="bg-surface/60 backdrop-blur-md border border-outline-variant p-6 rounded-2xl shadow-lg shadow-black/20 flex flex-col justify-between">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-playfair text-lg font-bold text-white">Arus Kas (6 Bulan)</h3>
          <span className="text-xs text-on-surface-variant">Real-Time Data</span>
        </div>
        <div className="h-44 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={recentCashflow}>
              <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip content={<CustomTooltip formatCurrencyFn={formatCurrencyFn} />} />
              <Bar dataKey="pemasukan" name="Pemasukan" fill="#10b981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="pengeluaran" name="Pengeluaran" fill="#ef4444" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 3. Program Status Breakdown */}
      <div className="bg-surface/60 backdrop-blur-md border border-outline-variant p-6 rounded-2xl shadow-lg shadow-black/20 flex flex-col justify-between">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-playfair text-lg font-bold text-white">Status Program Kerja</h3>
          <span className="text-xs text-emerald-400 font-semibold">{summary?.programs?.total || 0} Total</span>
        </div>
        <div className="h-44 w-full flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={[
                  { name: 'Selesai', value: summary?.programs?.selesai || 0 },
                  { name: 'Sedang Berjalan', value: summary?.programs?.berjalan || 0 },
                  { name: 'Direncanakan', value: summary?.programs?.direncanakan || 0 },
                ]}
                cx="50%"
                cy="50%"
                innerRadius={35}
                outerRadius={65}
                paddingAngle={4}
                dataKey="value"
              >
                <Cell fill="#10b981" />
                <Cell fill="#3b82f6" />
                <Cell fill="#f59e0b" />
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 4. Financial Allocation */}
      <div className="bg-surface/60 backdrop-blur-md border border-outline-variant p-6 rounded-2xl shadow-lg shadow-black/20 flex flex-col justify-between">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-playfair text-lg font-bold text-white">Alokasi Anggaran</h3>
          <span className="text-xs text-on-surface-variant">Kategori Utama</span>
        </div>
        <div className="h-44 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={formattedAllocation.length > 0 ? formattedAllocation : [
                  { category: 'Operasional', amount: 40 },
                  { category: 'Pembangunan', amount: 30 },
                  { category: 'Sosial', amount: 20 },
                  { category: 'Pendidikan', amount: 10 },
                ]}
                cx="50%"
                cy="50%"
                outerRadius={60}
                dataKey="amount"
                nameKey="category"
              >
                {COLORS.map((color, idx) => (
                  <Cell key={idx} fill={color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </>
  );
};

export default LandingCharts;
