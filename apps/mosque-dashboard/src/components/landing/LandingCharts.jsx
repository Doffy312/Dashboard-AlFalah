import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line
} from 'recharts';
import { ArrowRight } from 'lucide-react';
import { formatCurrency } from '../../lib/utils';

/**
 * LandingCharts — lazy-loaded chart cards for the landing page.
 * By isolating recharts here, the ~412KB vendor-charts chunk is only
 * fetched when this component renders (after React.lazy resolves),
 * instead of being pulled into the initial LandingPage bundle.
 */
const LandingCharts = ({
  jemaahTrendData,
  recentCashflow,
  summary,
  formattedAllocation,
  formatCurrencyFn,
}) => {
  return (
    <>
      {/* Card 1: Jemaah */}
      <div className="bg-surface/70 backdrop-blur-xl border border-outline-variant p-6 rounded-3xl shadow-lg shadow-black/20 flex flex-col">
        <div className="mb-6">
          <h3 className="font-playfair text-2xl font-bold text-white mb-2">Pertumbuhan Jemaah</h3>
          <p className="text-sm text-on-surface-variant leading-relaxed">Ekspansi demografi komunitas menunjukkan tren positif setiap bulannya, menguatkan tali silaturahmi.</p>
        </div>
        <div className="h-48 mt-auto">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={jemaahTrendData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} />
              <YAxis hide domain={['dataMin - 10', 'dataMax + 10']} />
              <RechartsTooltip cursor={{stroke: '#4b5563'}} contentStyle={{backgroundColor: '#111a24', borderRadius: '12px', border: '1px solid #374151', color: '#fff'}} />
              <Line type="monotone" dataKey="total" stroke="#10b981" strokeWidth={4} dot={{r: 4, fill: '#111a24', strokeWidth: 2, stroke: '#10b981'}} activeDot={{r: 6}} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Card 2: Keuangan */}
      <div className="bg-surface/70 backdrop-blur-xl border border-outline-variant p-6 rounded-3xl shadow-lg shadow-black/20 flex flex-col">
        <div className="mb-6">
          <h3 className="font-playfair text-2xl font-bold text-white mb-2">Kesehatan Finansial</h3>
          <p className="text-sm text-on-surface-variant leading-relaxed mb-4">Pemantauan arus kas (pemasukan vs pengeluaran) bulan ini tercatat stabil dan dapat dipertanggungjawabkan.</p>
          <button className="bg-surface-variant text-emerald-400 border border-outline-variant hover:border-emerald-500/50 px-4 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2 w-fit">
            <ArrowRight size={14} className="rotate-90" /> Unduh Laporan PDF
          </button>
        </div>
        <div className="h-48 mt-auto">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={recentCashflow} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} />
              <RechartsTooltip formatter={(val) => formatCurrency(val)} cursor={{fill: '#1a2432'}} contentStyle={{backgroundColor: '#111a24', borderRadius: '12px', border: '1px solid #374151', color: '#fff'}} />
              <Bar dataKey="pemasukan" fill="#10b981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="pengeluaran" fill="#64748b" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Card 3: Program Kerja */}
      <div className="bg-surface/70 backdrop-blur-xl border border-outline-variant p-6 rounded-3xl shadow-lg shadow-black/20 flex flex-col">
        <div className="mb-6">
          <h3 className="font-playfair text-2xl font-bold text-white mb-2">Status Program Kerja</h3>
          <p className="text-sm text-on-surface-variant leading-relaxed">Berbagai agenda besar komunitas terus dikawal pelaksanaannya agar tepat sasaran.</p>
        </div>
        <div className="h-48 mt-auto flex items-center">
          <ResponsiveContainer width="50%" height="100%">
            <PieChart>
              <Pie data={[
                  {name: 'Selesai', value: summary?.programs?.selesai || 1},
                  {name: 'Berjalan', value: summary?.programs?.berjalan || 1},
                  {name: 'Direncanakan', value: summary?.programs?.direncanakan || 1}
                ]} innerRadius={40} outerRadius={70} paddingAngle={5} dataKey="value" stroke="none">
                <Cell fill="#10b981" />
                <Cell fill="#34d399" />
                <Cell fill="#475569" />
              </Pie>
              <RechartsTooltip contentStyle={{backgroundColor: '#111a24', borderRadius: '12px', border: '1px solid #374151', color: '#fff'}} />
            </PieChart>
          </ResponsiveContainer>
          <div className="w-1/2 flex flex-col gap-3 pl-4">
            <div className="flex items-center gap-2 text-sm"><div className="w-3 h-3 rounded-full bg-[#10b981]"></div> <span className="text-on-surface font-medium">Selesai</span></div>
            <div className="flex items-center gap-2 text-sm"><div className="w-3 h-3 rounded-full bg-[#34d399]"></div> <span className="text-on-surface font-medium">Berjalan</span></div>
            <div className="flex items-center gap-2 text-sm"><div className="w-3 h-3 rounded-full bg-[#475569]"></div> <span className="text-on-surface font-medium">Direncanakan</span></div>
          </div>
        </div>
      </div>

      {/* Card 4: Inventaris (no recharts, just progress bars) */}
      <div className="bg-surface/70 backdrop-blur-xl border border-outline-variant p-6 rounded-3xl shadow-lg shadow-black/20 flex flex-col">
        <div className="mb-6">
          <h3 className="font-playfair text-2xl font-bold text-white mb-2">Kondisi Inventaris & Aset</h3>
          <p className="text-sm text-on-surface-variant leading-relaxed">Pengecekan rutin dan pemeliharaan aset guna menjaga kenyamanan seluruh anggota komunitas.</p>
        </div>
        <div className="mt-auto space-y-5">
          <div>
            <div className="flex justify-between text-xs font-semibold text-on-surface-variant mb-2 uppercase tracking-wide">
              <span>Baik ({summary?.inventaris?.baik || 0})</span>
            </div>
            <div className="w-full bg-surface-variant rounded-full h-2.5 overflow-hidden">
              <div className="bg-emerald-500 h-2.5 rounded-full" style={{ width: '75%' }}></div>
            </div>
          </div>
          <div>
            <div className="flex justify-between text-xs font-semibold text-on-surface-variant mb-2 uppercase tracking-wide">
              <span>Perbaikan ({summary?.inventaris?.perbaikan || 0})</span>
            </div>
            <div className="w-full bg-surface-variant rounded-full h-2.5 overflow-hidden">
              <div className="bg-amber-500 h-2.5 rounded-full" style={{ width: '15%' }}></div>
            </div>
          </div>
          <div>
            <div className="flex justify-between text-xs font-semibold text-on-surface-variant mb-2 uppercase tracking-wide">
              <span>Rusak ({summary?.inventaris?.rusak || 0})</span>
            </div>
            <div className="w-full bg-surface-variant rounded-full h-2.5 overflow-hidden">
              <div className="bg-rose-500 h-2.5 rounded-full" style={{ width: '10%' }}></div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default LandingCharts;
