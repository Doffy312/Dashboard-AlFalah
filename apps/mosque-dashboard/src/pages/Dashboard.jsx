import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useDashboardSummary, useCashflow, useAllocation, useRecentActivity, useUpcomingPrograms } from '../hooks/useDashboard';
import { formatCurrency } from '../lib/utils';

const Dashboard = () => {
  const navigate = useNavigate();
  const { data: summary } = useDashboardSummary();
  const { data: cashflow } = useCashflow(new Date().getFullYear());
  const { data: allocation } = useAllocation();
  const { data: recentActivity } = useRecentActivity();
  const { data: upcomingPrograms } = useUpcomingPrograms();

  // Safe defaults
  const saldo = summary?.finance?.saldoSaatIni ?? 0;
  const pemasukan = summary?.finance?.totalPemasukan ?? 0;
  const pengeluaran = summary?.finance?.totalPengeluaran ?? 0;
  const totalJemaah = summary?.jemaah?.total ?? 0;

  let maxVal = 50000000;
  if (cashflow) {
    const maxIn = Math.max(...(cashflow.income ?? [0]));
    const maxOut = Math.max(...(cashflow.expense ?? [0]));
    if (Math.max(maxIn, maxOut) > 0) {
      maxVal = Math.max(maxIn, maxOut) * 1.2;
    }
  }

  return (
    <div className="flex flex-col gap-6 text-on-surface">
      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* KPI 1: Saldo */}
        <div className="bg-[#111a24] rounded-2xl p-5 border border-[#1a2432] relative overflow-hidden flex flex-col justify-between h-[160px]">
          <div className="flex justify-between items-start z-10">
            <div>
              <p className="text-[11px] text-on-surface-variant font-bold tracking-wider uppercase mb-1">Saldo Total</p>
              <h3 className="text-2xl font-bold text-white">{formatCurrency(saldo)}</h3>
            </div>
            <div className="w-8 h-8 rounded-lg bg-primary/20 text-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">account_balance_wallet</span>
            </div>
          </div>
          <div className="flex-1 flex flex-col justify-end z-10 mt-2">
            {/* Mini Bar Chart */}
            <div className="h-10 flex items-end justify-between gap-1 opacity-80 mb-2">
              {[40, 50, 45, 60, 55, 70, 85].map((h, i) => (
                <div key={i} className="flex-1 bg-primary/80 rounded-t-sm" style={{ height: `${h}%` }}></div>
              ))}
            </div>
            <div className="flex items-center gap-1">
              <span className="material-symbols-outlined text-primary text-[14px]">trending_up</span>
              <span className="text-[11px] text-primary font-medium">keseluruhan</span>
            </div>
          </div>
        </div>

        {/* KPI 2: Pemasukan */}
        <div className="bg-[#111a24] rounded-2xl p-5 border border-[#1a2432] relative overflow-hidden flex flex-col justify-between h-[160px]">
          <div className="flex justify-between items-start z-10">
            <div>
              <p className="text-[11px] text-on-surface-variant font-bold tracking-wider uppercase mb-1">Pemasukan</p>
              <h3 className="text-2xl font-bold text-white">{formatCurrency(pemasukan)}</h3>
            </div>
            <div className="w-8 h-8 rounded-lg bg-primary/20 text-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">arrow_downward</span>
            </div>
          </div>
          <div className="flex-1 flex flex-col justify-end z-10 mt-2">
            {/* Mini Bar Chart */}
            <div className="h-10 flex items-end justify-between gap-1 opacity-80 mb-2">
              {[30, 45, 40, 55, 60, 75, 80].map((h, i) => (
                <div key={i} className="flex-1 bg-primary/80 rounded-t-sm" style={{ height: `${h}%` }}></div>
              ))}
            </div>
            <div className="flex items-center gap-1">
              <span className="material-symbols-outlined text-primary text-[14px]">trending_up</span>
              <span className="text-[11px] text-primary font-medium">keseluruhan</span>
            </div>
          </div>
        </div>

        {/* KPI 3: Pengeluaran */}
        <div className="bg-[#111a24] rounded-2xl p-5 border border-[#1a2432] relative overflow-hidden flex flex-col justify-between h-[160px]">
          <div className="flex justify-between items-start z-10">
            <div>
              <p className="text-[11px] text-on-surface-variant font-bold tracking-wider uppercase mb-1">Pengeluaran</p>
              <h3 className="text-2xl font-bold text-white">{formatCurrency(pengeluaran)}</h3>
            </div>
            <div className="w-8 h-8 rounded-lg bg-[#d97706]/20 text-[#d97706] flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">arrow_upward</span>
            </div>
          </div>
          <div className="flex-1 flex flex-col justify-end z-10 mt-2">
            {/* Mini Bar Chart */}
            <div className="h-10 flex items-end justify-between gap-1 opacity-80 mb-2">
              {[60, 50, 65, 45, 55, 40, 30].map((h, i) => (
                <div key={i} className="flex-1 bg-[#d97706]/80 rounded-t-sm" style={{ height: `${h}%` }}></div>
              ))}
            </div>
            <div className="flex items-center gap-1">
              <span className="material-symbols-outlined text-on-surface-variant text-[14px]">trending_down</span>
              <span className="text-[11px] text-on-surface-variant font-medium">keseluruhan</span>
            </div>
          </div>
        </div>

        {/* KPI 4: Jemaah */}
        <div className="bg-[#111a24] rounded-2xl p-5 border border-[#1a2432] relative overflow-hidden flex flex-col justify-between h-[160px]">
          <div className="flex justify-between items-start z-10">
            <div>
              <p className="text-[11px] text-on-surface-variant font-bold tracking-wider uppercase mb-1">Jemaah Terdaftar</p>
              <h3 className="text-2xl font-bold text-white">{totalJemaah}</h3>
            </div>
            <div className="w-8 h-8 rounded-lg bg-[#d97706]/20 text-[#d97706] flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">group</span>
            </div>
          </div>
          <div className="flex-1 flex flex-col justify-end z-10 mt-2">
            {/* Mini Bar Chart */}
            <div className="h-10 flex items-end justify-between gap-1 opacity-80 mb-2">
              {[20, 20, 30, 30, 40, 40, 55].map((h, i) => (
                <div key={i} className="flex-1 bg-[#d97706]/80 rounded-t-sm" style={{ height: `${h}%` }}></div>
              ))}
            </div>
            <div className="flex items-center gap-1">
              <span className="material-symbols-outlined text-[#d97706] text-[14px]">person_add</span>
              <span className="text-[11px] text-[#d97706] font-medium">terdaftar</span>
            </div>
          </div>
        </div>
      </div>

      {/* Middle Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Arus Kas Total Chart */}
        <div className="lg:col-span-2 bg-[#111a24] rounded-2xl p-6 border border-[#1a2432] flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-white">Arus Kas Total</h3>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-primary"></div>
                <span className="text-[12px] text-on-surface-variant">Pemasukan</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#f59e0b]"></div>
                <span className="text-[12px] text-on-surface-variant">Pengeluaran</span>
              </div>
            </div>
          </div>

          <div className="flex-1 relative mt-4 flex flex-col justify-end pb-6">
            {/* Horizontal Grid Lines */}
            <div className="absolute inset-0 flex flex-col justify-between pb-6">
              {[1, 0.8, 0.6, 0.4, 0.2, 0].map((ratio, i) => {
                const val = maxVal * ratio;
                let label = "0";
                if (val >= 1000000) label = `${(val / 1000000).toFixed(1).replace('.0', '')}M`;
                else if (val >= 1000) label = `${(val / 1000).toFixed(1).replace('.0', '')}K`;
                else if (val > 0) label = Math.round(val).toString();
                
                return (
                  <div key={i} className="flex items-center w-full">
                    <span className="w-8 text-right text-[10px] text-on-surface-variant font-mono">{label}</span>
                    <div className="ml-3 flex-1 border-t border-white/5 border-dashed"></div>
                  </div>
                );
              })}
            </div>

            {/* Bars - use cashflow data if available */}
            <div className="relative z-10 flex justify-between items-end h-[200px] pl-11 pr-2">
              {(cashflow?.months ?? ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des']).map((month, i) => {
                const inVal = cashflow?.income?.[i] ?? 0;
                const outVal = cashflow?.expense?.[i] ?? 0;
                const incomeH = Math.max((inVal / maxVal) * 100, 2);
                const expenseH = Math.max((outVal / maxVal) * 100, 2);
                return (
                  <div key={i} className="flex gap-1.5 items-end h-full group">
                    <div className="w-4 sm:w-6 bg-primary rounded-t-sm group-hover:brightness-125 transition-all" style={{ height: `${incomeH}%` }}></div>
                    <div className="w-4 sm:w-6 bg-[#f59e0b] rounded-t-sm group-hover:brightness-125 transition-all" style={{ height: `${expenseH}%` }}></div>
                  </div>
                );
              })}
            </div>

            {/* X-Axis Labels */}
            <div className="absolute bottom-0 left-0 right-0 flex justify-between pl-11 pr-2">
              {(cashflow?.months ?? ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des']).map((month, i, arr) => (
                <span key={i} className={`text-[11px] ${i === arr.length - 1 ? 'text-primary font-bold' : 'text-on-surface-variant'} truncate max-w-[20px] sm:max-w-none text-center`}>{month}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Program Mendatang */}
        <div className="bg-[#111a24] rounded-2xl p-6 border border-[#1a2432] flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-white">Program Mendatang</h3>
            <button className="text-on-surface-variant hover:text-white">
              <span className="material-symbols-outlined">more_horiz</span>
            </button>
          </div>

          <div className="flex flex-col gap-4 flex-1">
            {(upcomingPrograms ?? []).length > 0 ? (
              upcomingPrograms.slice(0, 3).map((prog, i) => {
                const d = new Date(prog.date);
                const colors = ['text-primary', 'text-[#f59e0b]', 'text-tertiary'];
                return (
                  <div key={prog.id ?? i} onClick={() => navigate('/dashboard/program-kerja')} className="flex items-center gap-4 bg-[#1a2432]/50 p-3 rounded-xl border border-white/5 hover:bg-[#1a2432] transition-colors cursor-pointer">
                    <div className="w-12 h-12 rounded-lg bg-[#1a2432] border border-white/10 flex flex-col items-center justify-center shrink-0">
                      <span className={`text-[14px] font-bold ${colors[i % 3]} leading-tight`}>{d.getDate()}</span>
                      <span className="text-[10px] text-on-surface-variant uppercase">{d.toLocaleDateString('id-ID', { month: 'short' })}</span>
                    </div>
                    <div className="flex-1">
                      <h4 className="text-[14px] font-semibold text-white mb-1">{prog.name}</h4>
                      <div className="flex items-center gap-1 text-[11px] text-on-surface-variant">
                        <span className="material-symbols-outlined text-[14px]">person</span> {prog.pic}
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <>
                <div className="flex items-center gap-4 bg-[#1a2432]/50 p-3 rounded-xl border border-white/5">
                  <div className="w-12 h-12 rounded-lg bg-[#1a2432] border border-white/10 flex flex-col items-center justify-center shrink-0">
                    <span className="text-[14px] font-bold text-primary leading-tight">-</span>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-[14px] font-semibold text-on-surface-variant">Menunggu data...</h4>
                  </div>
                </div>
              </>
            )}
          </div>

          <button onClick={() => navigate('/dashboard/program-kerja')} className="w-full mt-4 py-2.5 rounded-xl border border-[#1a2432] text-[13px] font-medium text-white hover:bg-[#1a2432] transition-colors">
            Lihat Semua Jadwal
          </button>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Alokasi Dana (Donut Chart) */}
        <div className="bg-[#111a24] rounded-2xl p-6 border border-[#1a2432] flex flex-col items-center">
          <div className="w-full flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-white">Alokasi Dana</h3>
          </div>
          
          {/* Simulated Donut Chart using CSS */}
          {(() => {
            const items = allocation ?? [
              { label: 'Operasional', percentage: 45 },
              { label: 'Pembangunan', percentage: 30 },
              { label: 'Santunan Yatim', percentage: 25 },
            ];
            const colors = ['#10b981', '#8b5cf6', '#f59e0b', '#ef4444', '#3b82f6'];
            let gradient = '';
            let cumulative = 0;
            items.forEach((item, i) => {
              const start = cumulative;
              cumulative += item.percentage;
              gradient += `${colors[i % colors.length]} ${start}% ${cumulative}%${i < items.length - 1 ? ', ' : ''}`;
            });

            return (
              <>
                <div className="relative w-40 h-40 rounded-full flex items-center justify-center my-4" style={{
                  background: `conic-gradient(${gradient})`
                }}>
                  <div className="absolute inset-2 rounded-full bg-[#111a24] flex flex-col items-center justify-center">
                    <span className="text-3xl font-bold text-white">100%</span>
                    <span className="text-[11px] text-on-surface-variant">Teralokasi</span>
                  </div>
                </div>

                <div className="w-full flex flex-col gap-3 mt-4">
                  {items.map((item, i) => (
                    <div key={i} className="flex justify-between items-center text-[13px]">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ background: colors[i % colors.length] }}></span>
                        <span className="text-on-surface-variant">{item.label}</span>
                      </div>
                      <span className="font-bold text-white">{item.percentage}%</span>
                    </div>
                  ))}
                </div>
              </>
            );
          })()}
        </div>

        {/* Aktivitas Terakhir */}
        <div className="lg:col-span-2 bg-[#111a24] rounded-2xl p-6 border border-[#1a2432] flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-white">Aktivitas Terakhir</h3>
            <span className="text-[11px] font-medium px-2 py-1 bg-primary/10 text-primary rounded-md">Terbaru</span>
          </div>

          <div className="flex flex-col flex-1 relative ml-2">
            {/* Timeline line */}
            <div className="absolute left-[9px] top-4 bottom-4 w-px bg-white/10"></div>

            {(recentActivity ?? []).length > 0 ? (
              recentActivity.slice(0, 3).map((item, i) => {
                const isLast = i === Math.min(recentActivity.length, 3) - 1;
                const dotColor = i % 2 === 0 ? 'border-primary' : 'border-[#f59e0b]';
                return (
                  <div key={item.id ?? i} className={`relative pl-8 ${!isLast ? 'pb-8' : ''}`}>
                    <div className={`absolute left-0 top-1 w-5 h-5 rounded-full bg-[#111a24] border-[4px] ${dotColor} flex items-center justify-center z-10`}></div>
                    <div className="flex justify-between items-start mb-1">
                      <h4 className="text-[14px] font-semibold text-white">{item.title ?? item.description}</h4>
                      <span className="text-[11px] text-on-surface-variant font-mono">{item.time ?? ''}</span>
                    </div>
                    <p className="text-[13px] text-on-surface-variant mb-3">{item.detail ?? item.description}</p>
                    {item.amount && (
                      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md ${item.type === 'Pemasukan' ? 'bg-primary/10 border border-primary/20 text-primary' : 'bg-[#f59e0b]/10 border border-[#f59e0b]/20 text-[#f59e0b]'} text-[11px] font-semibold`}>
                        <span className="material-symbols-outlined text-[14px]">{item.type === 'Pemasukan' ? 'add_circle' : 'remove_circle'}</span>
                        {formatCurrency(item.amount)}
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <>
                {/* Fallback static items */}
                <div className="relative pl-8 pb-8">
                  <div className="absolute left-0 top-1 w-5 h-5 rounded-full bg-[#111a24] border-[4px] border-primary flex items-center justify-center z-10"></div>
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="text-[14px] font-semibold text-white">Menunggu data aktivitas...</h4>
                  </div>
                  <p className="text-[13px] text-on-surface-variant mb-3">Hubungkan ke backend untuk melihat aktivitas terbaru.</p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

