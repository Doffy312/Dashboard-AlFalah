import { useState, useEffect, useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend
} from 'recharts';
import { formatCurrency } from '../../lib/utils';

/**
 * AnimatedCounter — animates a number from 0 to `value` with an easeOutExpo curve.
 */
/**
 * AnimatedCounter — animates a number from 0 to `value` with an easeOutExpo curve.
 */
const AnimatedCounter = ({ value, isCurrency = false }) => {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const target = Number(value) || 0;
    if (target === 0) { setDisplay(0); return; }

    let animationFrameId = null;
    let start = null;
    const duration = 1200;

    const step = (ts) => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setDisplay(Math.floor(eased * target));
      if (progress < 1) {
        animationFrameId = requestAnimationFrame(step);
      }
    };

    animationFrameId = requestAnimationFrame(step);

    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [value]);

  return <span>{isCurrency ? formatCurrency(display) : display.toLocaleString('id-ID')}</span>;
};

/**
 * CustomTooltip for Recharts in dark theme
 */
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#101415] border border-[#424754] p-3 rounded-xl shadow-2xl text-xs text-white space-y-1 z-30">
        <p className="font-bold text-[#adc6ff] mb-1.5 border-b border-[#323537] pb-1">{label}</p>
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
              <span className="text-[#c2c6d6]">{entry.name}:</span>
            </span>
            <span className="font-mono font-semibold text-white">{formatCurrency(entry.value)}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

/**
 * LandingFinanceSection — Financial stats and dynamic Recharts bar chart.
 */
const LandingFinanceSection = ({ summary, cashflowData }) => {
  const saldo = summary?.finance?.saldoSaatIni ?? 0;
  const pemasukan = summary?.finance?.totalPemasukan ?? 0;
  const pengeluaran = summary?.finance?.totalPengeluaran ?? 0;

  const currentMonthIdx = new Date().getMonth();
  const prevMonthIdx = (currentMonthIdx - 1 + 12) % 12;

  // Process chart data from cashflowData
  const chartData = useMemo(() => {
    const months = cashflowData?.months || ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des'];
    const incomes = cashflowData?.income || new Array(12).fill(0);
    const expenses = cashflowData?.expense || new Array(12).fill(0);

    // Build array for the last 6 months (or up to current month)
    const result = [];
    const numMonths = 6;
    for (let i = numMonths - 1; i >= 0; i--) {
      const idx = (currentMonthIdx - i + 12) % 12;
      result.push({
        name: months[idx],
        Pemasukan: incomes[idx] || 0,
        Pengeluaran: expenses[idx] || 0,
      });
    }
    return result;
  }, [cashflowData, currentMonthIdx]);

  // Calculate real trend percentage
  const incomes = cashflowData?.income || [];
  const currentIncome = incomes[currentMonthIdx] || 0;
  const prevIncome = incomes[prevMonthIdx] || 0;

  const formattedTrend = useMemo(() => {
    if (prevIncome > 0) {
      const pct = (((currentIncome - prevIncome) / prevIncome) * 100).toFixed(1);
      return Number(pct) >= 0 ? `+${pct}%` : `${pct}%`;
    }
    return currentIncome > 0 ? '+100%' : '0%';
  }, [currentIncome, prevIncome]);

  return (
    <section id="laporan" className="mb-[140px]">
      {/* Section Title */}
      <div className="flex flex-col items-center text-center mb-16 sm:mb-20 lp-reveal">
        <h2 className="text-3xl sm:text-4xl font-bold mb-4 tracking-tight text-[#e0e3e5]">
          Laporan Keuangan Digital
        </h2>
        <div className="w-12 h-0.5 bg-[#adc6ff] rounded-full" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Stats Column */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          {/* Total Kas */}
          <div className="lp-glass p-6 sm:p-8 rounded-3xl lp-border lp-reveal">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[11px] uppercase tracking-[0.2em] text-[#c2c6d6]">
                Total Kas saat Ini
              </span>
              <span className="material-symbols-outlined text-[#adc6ff] text-xl">
                account_balance
              </span>
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-[#e0e3e5]">
              <AnimatedCounter value={saldo} isCurrency />
            </div>
            <div className="mt-4 flex items-center gap-2 text-xs text-emerald-400 font-medium">
              <span className="material-symbols-outlined text-sm">verified</span>
              Terverifikasi Real-time
            </div>
          </div>

          {/* Total Pemasukan */}
          <div className="lp-glass p-6 sm:p-8 rounded-3xl lp-border lp-reveal lp-delay-1">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[11px] uppercase tracking-[0.2em] text-[#c2c6d6]">
                Total Pemasukan
              </span>
              <span className="material-symbols-outlined text-[#adc6ff] text-xl">
                volunteer_activism
              </span>
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-[#e0e3e5]">
              <AnimatedCounter value={pemasukan} isCurrency />
            </div>
            <div className="mt-4 flex items-center gap-2 text-xs text-emerald-400 font-medium">
              <span className="material-symbols-outlined text-sm">trending_up</span>
              {formattedTrend} dari bulan lalu
            </div>
          </div>

          {/* Total Penyaluran */}
          <div className="lp-glass p-6 sm:p-8 rounded-3xl lp-border lp-reveal lp-delay-2">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[11px] uppercase tracking-[0.2em] text-[#c2c6d6]">
                Total Pengeluaran / Penyaluran
              </span>
              <span className="material-symbols-outlined text-[#adc6ff] text-xl">
                payments
              </span>
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-[#e0e3e5]">
              <AnimatedCounter value={pengeluaran} isCurrency />
            </div>
            <div className="mt-4 flex items-center gap-2 text-xs text-[#c2c6d6] font-medium">
              <span className="material-symbols-outlined text-sm">info</span>
              Sesuai alokasi program &amp; operasional
            </div>
          </div>
        </div>

        {/* Recharts Chart Column */}
        <div className="lg:col-span-8 lp-glass p-6 sm:p-8 rounded-3xl lp-border relative overflow-hidden flex flex-col lp-reveal lp-delay-3">
          {/* Chart Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
            <div>
              <h3 className="text-xl font-semibold text-[#e0e3e5]">Tren Arus Kas (Pemasukan vs Pengeluaran)</h3>
              <p className="text-xs text-[#c2c6d6] mt-1">Grafik keuangan 6 bulan terakhir dari database</p>
            </div>
            <div className="flex items-center gap-2 text-xs text-[#adc6ff] bg-[#adc6ff]/10 px-3 py-1.5 rounded-full lp-border font-medium">
              <span className="material-symbols-outlined text-sm">sync</span>
              Real-time
            </div>
          </div>

          {/* Recharts BarChart Container */}
          <div className="w-full h-[320px] sm:h-[360px] pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#323537" vertical={false} />
                <XAxis
                  dataKey="name"
                  stroke="#c2c6d6"
                  fontSize={12}
                  tickLine={false}
                  axisLine={{ stroke: '#323537' }}
                />
                <YAxis
                  stroke="#c2c6d6"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) => {
                    if (val >= 1000000000) return `${(val / 1000000000).toFixed(1)}B`;
                    if (val >= 1000000) return `${(val / 1000000).toFixed(0)}M`;
                    if (val >= 1000) return `${(val / 1000).toFixed(0)}k`;
                    return val;
                  }}
                  width={50}
                />
                <RechartsTooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                <Legend
                  wrapperStyle={{ paddingTop: '16px', fontSize: '12px', color: '#c2c6d6' }}
                  iconType="circle"
                />
                <Bar
                  dataKey="Pemasukan"
                  name="Pemasukan (Inflow)"
                  fill="#adc6ff"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={40}
                />
                <Bar
                  dataKey="Pengeluaran"
                  name="Pengeluaran (Outflow)"
                  fill="#f43f5e"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={40}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LandingFinanceSection;
