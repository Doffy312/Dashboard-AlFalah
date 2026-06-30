import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Moon, ArrowRight, Wallet, Users } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend
} from 'recharts';
import { useDashboardSummary, useCashflow, useAllocation, useUpcomingPrograms } from '../hooks/useDashboard';
import { useRealtimeSync } from '../hooks/useRealtimeSync';
import { formatCurrency } from '../lib/utils';

// Demographic mock data removed

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444'];
const ALLOC_COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6'];

const LandingPage = () => {
  const navigate = useNavigate();
  
  // Enable realtime sync for landing page
  useRealtimeSync();

  const { data: summary } = useDashboardSummary();
  const { data: cashflowRaw } = useCashflow(new Date().getFullYear());
  const { data: allocation } = useAllocation();
  const { data: upcomingPrograms } = useUpcomingPrograms();

  const totalJemaah = summary?.jemaah?.total ?? 0;
  
  const jemaahCategories = summary?.jemaah ? [
    { name: 'Muzakki', value: summary.jemaah.Muzakki || 0 },
    { name: 'Mustahik', value: summary.jemaah.Mustahik || 0 },
    { name: 'Umum', value: summary.jemaah.Umum || 0 },
    { name: 'Lansia', value: summary.jemaah.Lansia || 0 },
    { name: 'Yatim', value: summary.jemaah.Yatim || 0 },
    { name: 'Fakir', value: summary.jemaah.Fakir || 0 },
  ].filter(c => c.value > 0) : [];
  const saldo = summary?.finance?.saldoSaatIni ?? 0;
  const pemasukan = summary?.finance?.pemasukanBulanIni ?? 0;
  const pengeluaran = summary?.finance?.pengeluaranBulanIni ?? 0;

  // Map cashflow to last 6 months for chart
  const currentMonth = new Date().getMonth();
  const cashflow = cashflowRaw?.slice(Math.max(0, currentMonth - 5), currentMonth + 1) || [];

  return (
    <div className="min-h-screen bg-[#0b131a] text-white font-sans selection:bg-emerald-500/30 selection:text-emerald-200 overflow-x-hidden">
      {/* Navbar */}
      <nav className="flex justify-between items-center px-6 lg:px-16 py-6 absolute top-0 left-0 right-0 z-50">
        <div className="flex items-center gap-3">
          <div className="bg-emerald-500 w-10 h-10 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/30">
            <Moon size={24} color="#fff" />
          </div>
          <span className="font-bold text-xl text-white tracking-tight">Al-Falah</span>
        </div>
        <button 
          className="bg-[#111a24]/80 backdrop-blur-md text-emerald-500 border border-emerald-500/30 hover:border-emerald-500/80 hover:bg-[#1a2432] px-5 py-2.5 rounded-full font-semibold transition-all flex items-center gap-2 shadow-sm" 
          onClick={() => navigate('/login')}
        >
          Masuk Dasbor <ArrowRight size={16} />
        </button>
      </nav>

      {/* Hero Section */}
      <main className="pt-32 pb-20 px-6 lg:px-16 flex flex-col justify-center items-center text-center relative">
        {/* Glow Spheres */}
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-emerald-500/20 rounded-full blur-[120px] -z-10 translate-x-[-20%] translate-y-[-20%] pointer-events-none"></div>
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-blue-500/10 rounded-full blur-[100px] -z-10 translate-x-[20%] translate-y-[20%] pointer-events-none"></div>
        
        <div className="max-w-4xl mx-auto flex flex-col items-center">
          <div className="bg-emerald-500/10 text-emerald-500 px-5 py-2 rounded-full text-sm font-semibold mb-8 border border-emerald-500/20 shadow-sm flex items-center gap-2">
            Portal Transparansi Publik <span className="text-base">🕌</span>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-7xl font-extrabold text-white leading-[1.1] mb-8 tracking-tight">
            Transparansi & Akuntabilitas <br className="hidden md:block"/> 
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-emerald-200">Masjid Al-Falah Oruna</span>
          </h1>
          <p className="text-lg lg:text-xl text-gray-400 leading-relaxed mb-10 max-w-2xl">
            Menyajikan data jemaah, keuangan, dan program kerja secara terbuka demi kemaslahatan bersama dan menjaga amanah umat.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <button 
              className="bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-4 rounded-full font-semibold text-lg transition-all shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2"
              onClick={() => {
                document.getElementById('data-keuangan')?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              Lihat Laporan Lengkap <ArrowRight size={20} />
            </button>
            <button 
              className="bg-[#111a24] hover:bg-[#1a2432] text-emerald-500 border border-[#1a2432] px-8 py-4 rounded-full font-semibold text-lg transition-all shadow-sm flex items-center justify-center gap-2"
              onClick={() => {
                alert("Fitur Infak sedang dalam pengembangan. Silakan hubungi Takmir Masjid.");
              }}
            >
              <Wallet size={20} /> Salurkan Infak
            </button>
          </div>
        </div>
      </main>

      {/* SECTION 1: DATABASE JEMAAH */}
      <section id="data-jemaah" className="py-20 px-6 lg:px-16 bg-[#0f161e] border-y border-[#1a2432]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white mb-4">Demografi & Data Jemaah</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Memahami persebaran jemaah untuk program dakwah dan sosial yang lebih tepat sasaran.
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="bg-[#111a24] p-8 rounded-3xl shadow-sm border border-[#1a2432] flex flex-col justify-center items-center text-center hover:border-emerald-500/50 transition-colors">
              <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-2xl flex items-center justify-center mb-6">
                <Users size={32} />
              </div>
              <h3 className="text-5xl font-black text-white mb-2">{totalJemaah.toLocaleString()}</h3>
              <p className="text-gray-400 font-medium">Total Jemaah Terdata</p>
            </div>
            
            <div className="bg-[#111a24] p-8 rounded-3xl shadow-sm border border-[#1a2432] lg:col-span-2 hover:border-emerald-500/50 transition-colors">
              <h3 className="text-lg font-bold text-white mb-6">Distribusi Kategori Jemaah</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={jemaahCategories} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1a2432" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 14}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 14}} />
                    <RechartsTooltip cursor={{fill: '#1a2432'}} contentStyle={{backgroundColor: '#0b131a', borderRadius: '12px', border: '1px solid #1a2432', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.5)', color: '#fff'}} />
                    <Bar dataKey="value" fill="#10b981" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-[#111a24] p-8 rounded-3xl shadow-sm border border-[#1a2432] lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-8 items-center hover:border-emerald-500/50 transition-colors">
              <div>
                <h3 className="text-lg font-bold text-white mb-2">Proporsi Kategori Jemaah</h3>
                <p className="text-gray-400 mb-6">Distribusi persentase jemaah berdasarkan kategori status sosial dan ekonomi.</p>
                <div className="space-y-3">
                  {jemaahCategories.map((entry, index) => (
                    <div key={index} className="flex items-center justify-between p-3 rounded-xl hover:bg-[#1a2432] transition-colors border border-transparent hover:border-[#2a3644]">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                        <span className="text-gray-300 font-medium">{entry.name}</span>
                      </div>
                      <span className="text-white font-bold">{entry.value} Jemaah</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={jemaahCategories}
                      innerRadius={0}
                      outerRadius={100}
                      paddingAngle={2}
                      dataKey="value"
                      stroke="none"
                    >
                      {jemaahCategories.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip contentStyle={{backgroundColor: '#0b131a', borderRadius: '12px', border: '1px solid #1a2432', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.5)', color: '#fff'}} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: KEUANGAN */}
      <section id="data-keuangan" className="py-20 px-6 lg:px-16">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white mb-4">Laporan Keuangan Real-Time</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Komitmen kami dalam mengelola dana umat dengan jujur, transparan, dan dapat dipertanggungjawabkan.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-[#111a24] p-8 rounded-3xl border border-[#1a2432] shadow-sm flex flex-col justify-center">
              <div className="flex justify-between items-start mb-2">
                <p className="text-gray-400 font-bold uppercase tracking-wider text-xs">Saldo Total</p>
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <Wallet size={16} />
                </div>
              </div>
              <h3 className="text-3xl lg:text-4xl font-bold text-white">{formatCurrency(saldo)}</h3>
            </div>
            
            <div className="bg-[#111a24] p-8 rounded-3xl border border-[#1a2432] shadow-sm flex flex-col justify-center">
              <div className="flex justify-between items-start mb-2">
                <p className="text-gray-400 font-bold uppercase tracking-wider text-xs">Pemasukan Bulan Ini</p>
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <ArrowRight size={16} className="-rotate-90" />
                </div>
              </div>
              <h3 className="text-3xl lg:text-4xl font-bold text-emerald-500">{formatCurrency(pemasukan)}</h3>
            </div>
            
            <div className="bg-[#111a24] p-8 rounded-3xl border border-[#1a2432] shadow-sm flex flex-col justify-center">
              <div className="flex justify-between items-start mb-2">
                <p className="text-gray-400 font-bold uppercase tracking-wider text-xs">Pengeluaran Bulan Ini</p>
                <div className="w-8 h-8 rounded-lg bg-[#d97706]/20 text-[#d97706] flex items-center justify-center">
                  <ArrowRight size={16} className="rotate-90" />
                </div>
              </div>
              <h3 className="text-3xl lg:text-4xl font-bold text-[#d97706]">{formatCurrency(pengeluaran)}</h3>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-[#111a24] p-8 rounded-3xl shadow-sm border border-[#1a2432] hover:border-emerald-500/50 transition-colors">
              <h3 className="text-lg font-bold text-white mb-6">Tren Pemasukan vs Pengeluaran</h3>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={cashflow} margin={{ top: 5, right: 10, bottom: 5, left: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1a2432" />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#9ca3af'}} />
                    <YAxis hide />
                    <RechartsTooltip cursor={{stroke: '#1a2432', strokeWidth: 2}} contentStyle={{backgroundColor: '#0b131a', borderRadius: '12px', border: '1px solid #1a2432', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.5)', color: '#fff'}} />
                    <Legend iconType="circle" wrapperStyle={{paddingTop: '20px'}} />
                    <Line type="monotone" dataKey="pemasukan" name="Pemasukan" stroke="#10b981" strokeWidth={3} dot={{r: 4, fill: '#0b131a'}} activeDot={{r: 6}} />
                    <Line type="monotone" dataKey="pengeluaran" name="Pengeluaran" stroke="#d97706" strokeWidth={3} dot={{r: 4, fill: '#0b131a'}} activeDot={{r: 6}} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-[#111a24] p-8 rounded-3xl shadow-sm border border-[#1a2432] flex flex-col hover:border-emerald-500/50 transition-colors">
              <h3 className="text-lg font-bold text-white mb-6">Alokasi Pengeluaran Dana</h3>
              <div className="h-56 mb-6">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={allocation}
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={5}
                      dataKey="amount"
                      nameKey="category"
                      stroke="none"
                    >
                      {allocation?.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={ALLOC_COLORS[index % ALLOC_COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip formatter={(value) => formatCurrency(value)} contentStyle={{backgroundColor: '#0b131a', borderRadius: '12px', border: '1px solid #1a2432', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.5)', color: '#fff'}} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-auto">
                {allocation?.map((entry, index) => (
                  <div key={index} className="flex items-center gap-3 p-2 rounded-lg hover:bg-[#1a2432] transition-colors">
                    <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: ALLOC_COLORS[index % ALLOC_COLORS.length] }}></div>
                    <span className="text-sm font-medium text-gray-300 truncate">{entry.category}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: PROGRAM KERJA */}
      <section className="py-20 px-6 lg:px-16 bg-[#0f161e] border-t border-[#1a2432]">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white mb-4">Progres Program Kerja & Pembangunan</h2>
            <p className="text-gray-400">
              Pantau langsung agenda yang sedang berjalan dan tingkat penyelesaiannya.
            </p>
          </div>

          <div className="space-y-6">
            {/* Realtime upcoming programs */}
            {upcomingPrograms && upcomingPrograms.length > 0 ? (
              upcomingPrograms.map((program, idx) => {
                const progress = program.status === 'Selesai' ? 100 : program.status === 'Sedang Berjalan' ? 50 : 15;
                return (
                  <div key={idx} className="bg-[#111a24] p-6 rounded-2xl shadow-sm border border-[#1a2432] hover:border-emerald-500/50 transition-colors">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="font-bold text-white text-lg">{program.name}</h4>
                      <span className="text-sm font-bold text-emerald-400 bg-emerald-500/10 px-4 py-1.5 rounded-full border border-emerald-500/20">{program.status}</span>
                    </div>
                    <div className="w-full bg-[#1a2432] rounded-full h-4 overflow-hidden">
                      <div 
                        className="bg-emerald-500 h-full rounded-full transition-all duration-1000 ease-out relative overflow-hidden"
                        style={{ width: `${progress}%` }}
                      >
                        <div className="absolute inset-0 bg-white/20" style={{ backgroundImage: 'linear-gradient(45deg, rgba(255,255,255,.15) 25%, transparent 25%, transparent 50%, rgba(255,255,255,.15) 50%, rgba(255,255,255,.15) 75%, transparent 75%, transparent)', backgroundSize: '1rem 1rem' }}></div>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="bg-[#111a24] p-8 rounded-2xl shadow-sm border border-[#1a2432] text-center">
                <p className="text-gray-400">Belum ada program kerja yang berjalan atau direncanakan saat ini.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#0b131a] text-gray-400 py-12 px-6 lg:px-16 border-t border-[#1a2432]">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-center border-b border-[#1a2432] pb-8 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-emerald-500 w-10 h-10 rounded-xl flex items-center justify-center">
                <Moon size={24} color="#fff" />
              </div>
              <span className="font-bold text-2xl text-white tracking-tight">Al-Falah</span>
            </div>
            <p className="max-w-md leading-relaxed text-gray-400">
              Jl. Raya Oruna No. 123, Kecamatan Damai, Kota Sejahtera 12345. <br/>
              Informasi lebih lanjut silakan hubungi takmir masjid.
            </p>
          </div>
          <div className="flex gap-4 md:justify-end">
            <div className="w-12 h-12 rounded-full bg-[#111a24] flex items-center justify-center hover:bg-emerald-500 hover:text-white cursor-pointer transition-all border border-[#1a2432]">
              <span className="sr-only">Facebook</span>
              <svg fill="currentColor" viewBox="0 0 24 24" className="w-5 h-5"><path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd"></path></svg>
            </div>
            <div className="w-12 h-12 rounded-full bg-[#111a24] flex items-center justify-center hover:bg-emerald-500 hover:text-white cursor-pointer transition-all border border-[#1a2432]">
              <span className="sr-only">Instagram</span>
              <svg fill="currentColor" viewBox="0 0 24 24" className="w-5 h-5"><path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd"></path></svg>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center text-sm gap-4">
          <p>© 2026 Portal Transparansi Masjid Al-Falah Oruna. All rights reserved.</p>
          <p className="text-gray-500 font-medium">
            * Data jemaah ditampilkan secara anonim (agregat) demi menjaga privasi dan keamanan bersama.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
