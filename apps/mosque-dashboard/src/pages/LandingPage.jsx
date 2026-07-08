import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Wallet, Users, Activity, FileText, CheckCircle, ShieldCheck } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend
} from 'recharts';
import { useDashboardSummary, useCashflow, useAllocation, useCompletedPrograms } from '../hooks/useDashboard';
import { useRealtimeSync } from '../hooks/useRealtimeSync';
import { formatCurrency } from '../lib/utils';

const COLORS = ['#047857', '#10b981', '#34d399', '#6ee7b7'];

// Counter animation component with slight simulation bumping
const AnimatedCounter = ({ value, isCurrency = false, simulateBump = false }) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    // Initial animation
    let startTimestamp = null;
    const duration = 2000;
    const initialValue = value || 0;
    
    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setDisplayValue(Math.floor(easeProgress * initialValue));
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    window.requestAnimationFrame(step);
  }, [value]);

  // Simulated live bumping as requested
  useEffect(() => {
    if (!simulateBump || !value) return;
    const interval = setInterval(() => {
      setDisplayValue(prev => {
        // Bump by a small random amount to feel live
        const bump = isCurrency ? Math.floor(Math.random() * 50000) : Math.floor(Math.random() * 3);
        return prev + bump;
      });
    }, 4500);
    return () => clearInterval(interval);
  }, [simulateBump, value, isCurrency]);

  return (
    <span>
      {isCurrency ? formatCurrency(displayValue) : displayValue.toLocaleString()}
    </span>
  );
};

const LandingPage = () => {
  const navigate = useNavigate();
  useRealtimeSync();

  const { data: summary } = useDashboardSummary();
  const { data: cashflowRaw } = useCashflow(new Date().getFullYear());
  const { data: allocation } = useAllocation();
  const { data: completedPrograms } = useCompletedPrograms();

  const [currentTime, setCurrentTime] = useState(new Date());
  
  // Realtime clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formattedCashflow = (cashflowRaw && Array.isArray(cashflowRaw.months)) 
    ? cashflowRaw.months.map((m, i) => ({
        month: m,
        pemasukan: cashflowRaw.income?.[i] || 0,
        pengeluaran: cashflowRaw.expense?.[i] || 0
      })) 
    : [];

  const currentMonth = new Date().getMonth();
  const recentCashflow = formattedCashflow.slice(Math.max(0, currentMonth - 5), currentMonth + 1);

  const formattedAllocation = (allocation && Array.isArray(allocation)) 
    ? allocation.map(a => ({
        category: a.label,
        amount: a.percentage
      })) 
    : [];

  const totalJemaah = summary?.jemaah?.total ?? 0;
  const saldo = summary?.finance?.saldoSaatIni ?? 0;
  
  const jemaahTrendData = [
    { month: 'Jan', total: Math.max(0, totalJemaah - 50) },
    { month: 'Feb', total: Math.max(0, totalJemaah - 40) },
    { month: 'Mar', total: Math.max(0, totalJemaah - 25) },
    { month: 'Apr', total: Math.max(0, totalJemaah - 10) },
    { month: 'Mei', total: totalJemaah },
  ];

  // Live Activity Log Simulation
  const [logs, setLogs] = useState([
    { id: '1', type: 'Keuangan', icon: <Wallet size={16} className="text-emerald-deep" />, text: "Infak Jumat masuk sebesar Rp 2.500.000", time: "5 menit yang lalu", color: "bg-emerald-900/40 border border-emerald-500/20" },
    { id: '2', type: 'Program Kerja', icon: <CheckCircle size={16} className="text-blue-500" />, text: "Agenda 'Santunan Anak Yatim' diubah menjadi Selesai", time: "1 jam yang lalu", color: "bg-blue-900/40 border border-blue-500/20" },
    { id: '3', type: 'Inventaris', icon: <FileText size={16} className="text-amber-500" />, text: "Pemeliharaan AC Ruang Utama telah dicatat", time: "3 jam yang lalu", color: "bg-amber-900/40 border border-amber-500/20" },
  ]);

  useEffect(() => {
    const newLogs = [
      { type: 'Jemaah', icon: <Users size={16} className="text-purple-500" />, text: "Data Jemaah baru telah diverifikasi oleh pengurus", time: "Baru saja", color: "bg-purple-900/40 border border-purple-500/20" },
      { type: 'Keuangan', icon: <Wallet size={16} className="text-emerald-deep" />, text: "Donasi pembangunan dari Hamba Allah Rp 1.000.000", time: "Baru saja", color: "bg-emerald-900/40 border border-emerald-500/20" },
      { type: 'Program Kerja', icon: <CheckCircle size={16} className="text-blue-500" />, text: "Rapat pengurus bulanan selesai dilaksanakan", time: "Baru saja", color: "bg-blue-900/40 border border-blue-500/20" }
    ];
    let counter = 0;
    
    const interval = setInterval(() => {
      if(counter < newLogs.length) {
        const logToAdd = { ...newLogs[counter], id: Date.now().toString() };
        setLogs(prev => [logToAdd, ...prev.slice(0, 2)]); // Keep exactly 3 items
        counter++;
      } else {
        counter = 0; // loop simulation
      }
    }, 8000); // add a new log every 8 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-background text-on-surface font-body relative overflow-x-hidden">
      {/* Subtle Grid Pattern for Dark Theme */}
      <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
      
      {/* 1. FLOATING NAVIGATION BAR */}
      <nav className="fixed top-6 left-1/2 -translate-x-1/2 w-[90%] max-w-7xl z-50 bg-surface/70 backdrop-blur-xl border border-outline-variant shadow-lg shadow-black/20 rounded-full px-6 py-4 flex justify-between items-center transition-all">
        <div className="flex items-center gap-3">
          <div className="bg-emerald-deep w-10 h-10 rounded-full flex items-center justify-center shadow-lg shadow-emerald-deep/20">
            <span className="text-white font-playfair font-bold text-xl italic">S</span>
          </div>
          <span className="font-playfair font-bold text-xl text-white tracking-tight hidden sm:block">Sistem Terpadu Komunitas</span>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="hidden lg:flex flex-col items-end">
            <div className="flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
              <span className="text-xs font-semibold text-emerald-400 tracking-wider uppercase">Sistem Sinkron: Real-Time</span>
            </div>
            <span className="text-[10px] text-on-surface-variant">Last Updated: {currentTime.toLocaleTimeString()}</span>
          </div>
          
          <button 
            className="bg-emerald-deep text-white hover:bg-emerald-800 px-6 py-2.5 rounded-full font-semibold transition-all shadow-md shadow-emerald-deep/20 flex items-center gap-2 border border-emerald-700"
            onClick={() => navigate('/login')}
          >
            Masuk Dasbor <ArrowRight size={16} />
          </button>
        </div>
      </nav>

      <div className="relative z-10 pt-36 pb-20 px-6 lg:px-16 max-w-7xl mx-auto flex flex-col items-center">
        
        {/* 2. HERO SECTION & ACCUMULATED TRANSPARENCY TICKER */}
        <div className="text-center max-w-4xl mb-16">
          <h1 className="font-playfair text-5xl md:text-6xl lg:text-7xl font-extrabold text-white leading-[1.1] mb-6 tracking-tight">
            Amanah, Terbuka, <br className="hidden md:block"/> 
            dan <span className="text-emerald-500">Terintegrasi</span>
          </h1>
          <p className="text-lg md:text-xl text-on-surface-variant leading-relaxed max-w-2xl mx-auto">
            Menampilkan data kepengurusan secara real-time demi mewujudkan tata kelola organisasi komunitas yang transparan dan akuntabel.
          </p>
        </div>

        {/* 4-Column Dynamic Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full mb-24">
          <div className="bg-surface/60 backdrop-blur-md border border-outline-variant p-6 rounded-2xl shadow-lg shadow-black/20 hover:border-emerald-500/30 transition-all group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-deep/10 rounded-bl-full -z-10 group-hover:scale-110 transition-transform"></div>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-surface-variant text-emerald-400 rounded-xl flex items-center justify-center border border-outline-variant">
                <Users size={24} />
              </div>
              <p className="text-sm font-semibold text-on-surface-variant uppercase tracking-wide">Total Jemaah Aktif</p>
            </div>
            <h3 className="text-4xl font-playfair font-bold text-white">
              <AnimatedCounter value={totalJemaah} simulateBump={true} />
            </h3>
          </div>

          <div className="bg-surface/60 backdrop-blur-md border border-outline-variant p-6 rounded-2xl shadow-lg shadow-black/20 hover:border-emerald-500/30 transition-all group relative overflow-hidden">
             <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-deep/10 rounded-bl-full -z-10 group-hover:scale-110 transition-transform"></div>
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-surface-variant text-emerald-400 rounded-xl flex items-center justify-center border border-outline-variant">
                  <Wallet size={24} />
                </div>
                <p className="text-sm font-semibold text-on-surface-variant uppercase tracking-wide">Saldo Kas</p>
              </div>
              <div className="flex items-center gap-1 bg-emerald-900/30 text-emerald-400 text-[10px] font-bold px-2 py-1 rounded-full border border-emerald-500/20">
                <ShieldCheck size={12} /> Verified
              </div>
            </div>
            <h3 className="text-3xl font-playfair font-bold text-white truncate">
              <AnimatedCounter value={saldo} isCurrency={true} simulateBump={true} />
            </h3>
          </div>

          <div className="bg-surface/60 backdrop-blur-md border border-outline-variant p-6 rounded-2xl shadow-lg shadow-black/20 hover:border-emerald-500/30 transition-all group relative overflow-hidden">
             <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-deep/10 rounded-bl-full -z-10 group-hover:scale-110 transition-transform"></div>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-surface-variant text-emerald-400 rounded-xl flex items-center justify-center border border-outline-variant">
                <CheckCircle size={24} />
              </div>
              <p className="text-sm font-semibold text-on-surface-variant uppercase tracking-wide">Program Selesai</p>
            </div>
            <h3 className="text-4xl font-playfair font-bold text-white">
              <AnimatedCounter value={summary?.programs?.selesai || 0} /> <span className="text-xl text-on-surface-variant">/ <AnimatedCounter value={summary?.programs?.total || 0} /></span>
            </h3>
          </div>

          <div className="bg-surface/60 backdrop-blur-md border border-outline-variant p-6 rounded-2xl shadow-lg shadow-black/20 hover:border-emerald-500/30 transition-all group relative overflow-hidden">
             <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-deep/10 rounded-bl-full -z-10 group-hover:scale-110 transition-transform"></div>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-surface-variant text-emerald-400 rounded-xl flex items-center justify-center border border-outline-variant">
                <FileText size={24} />
              </div>
              <p className="text-sm font-semibold text-on-surface-variant uppercase tracking-wide">Total Aset</p>
            </div>
            <h3 className="text-4xl font-playfair font-bold text-white">
              <AnimatedCounter value={summary?.inventaris?.total || 0} /> <span className="text-xl text-on-surface-variant">Item</span>
            </h3>
          </div>
        </div>

        {/* 3. INTERACTIVE DATA NARRATIVE & ANALYTICS GRID & 4. LIVE ACTIVITY LOG */}
        <div className="w-full flex flex-col xl:flex-row gap-8">
          
          {/* Analytics Grid (2x2) */}
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6">
            
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

            {/* Card 4: Inventaris */}
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
            
          </div>

          {/* 4. LIVE ACTIVITY & TRANSPARENCY LOG */}
          <div className="w-full xl:w-96 shrink-0 bg-surface/80 backdrop-blur-xl border border-outline-variant shadow-lg shadow-black/20 rounded-3xl p-6 flex flex-col relative overflow-hidden">
             <div className="absolute -top-10 -right-10 w-40 h-40 bg-emerald-deep/10 rounded-full blur-2xl pointer-events-none"></div>
             
             <div className="flex items-center justify-between mb-8 border-b border-outline-variant pb-4">
                <h3 className="font-playfair text-xl font-bold text-white flex items-center gap-2">
                  <Activity size={20} className="text-emerald-400" /> Log Transparansi
                </h3>
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
             </div>

             <div className="flex flex-col gap-6 flex-1 overflow-hidden">
                {logs.map((log, i) => (
                  <div key={log.id} className="flex gap-4 group animate-in fade-in slide-in-from-bottom-2 duration-500">
                    <div className="flex flex-col items-center">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${log.color} group-hover:scale-110 transition-transform`}>
                        {log.icon}
                      </div>
                      {i !== logs.length - 1 && <div className="w-0.5 h-full bg-outline-variant mt-2"></div>}
                    </div>
                    <div className="pb-4">
                      <p className="text-xs font-bold text-emerald-400 mb-1 uppercase tracking-wider">{log.type}</p>
                      <p className="text-sm text-white font-medium leading-snug mb-1">{log.text}</p>
                      <p className="text-xs text-on-surface-variant">{log.time}</p>
                    </div>
                  </div>
                ))}
             </div>
             
             <button className="w-full mt-6 py-3 rounded-xl bg-surface-variant text-white text-sm font-semibold hover:bg-outline-variant transition-colors border border-outline-variant">
               Lihat Seluruh Aktivitas
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
