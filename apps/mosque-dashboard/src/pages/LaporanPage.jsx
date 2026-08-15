import { useState, Suspense, lazy } from 'react';
import { useDashboardSummary, useCashflow, useAllocation } from '../hooks/useDashboard';
import { useProgramSummary } from '../hooks/usePrograms';
import { formatCurrency } from '../lib/utils';
import { transactionApi, programApi, jemaahApi } from '../lib/api';

// Lazy-load the recharts-based analysis component — recharts (~412KB) only
// downloads when the user switches to the "Analisis Program" tab.
const LaporanCharts = lazy(() => import('../components/laporan/LaporanCharts'));

const LaporanPage = () => {
  const [activeTab, setActiveTab] = useState('Grafik Keuangan');
  const [exportType, setExportType] = useState('Arus Kas');
  const [exportFormat, setExportFormat] = useState('csv');
  const [isExporting, setIsExporting] = useState(false);

  // Data fetching
  const { data: summary } = useDashboardSummary();
  const { data: cashflow } = useCashflow(new Date().getFullYear());
  const { data: allocation } = useAllocation();
  const { data: programSummary } = useProgramSummary();

  const saldo = summary?.finance?.saldoSaatIni ?? 0;
  
  // Tab classes
  const activeTabClass = "px-6 py-2 rounded-t-lg border-b-2 border-primary text-primary font-label-md text-[12px] font-semibold leading-[16px] tracking-[0.05em] bg-surface-variant backdrop-blur-sm transition-all";
  const inactiveTabClass = "px-6 py-2 rounded-t-lg border-b-2 border-transparent text-on-surface-variant hover:text-primary hover:bg-surface-variant font-label-md text-[12px] font-semibold leading-[16px] tracking-[0.05em] transition-all";

  // CSV Generator Utility
  const generateCSV = (data, filename) => {
    if (!data || !data.length) {
      alert("Tidak ada data untuk di-export.");
      return;
    }
    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(row => 
      Object.values(row).map(val => {
        const str = String(val ?? '');
        // Escape quotes and enclose in quotes if contains comma
        if (str.includes(',') || str.includes('"') || str.includes('\n')) {
          return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
      }).join(',')
    );
    const csvString = [headers, ...rows].join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `${filename}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      if (exportType === 'Arus Kas') {
        const result = await transactionApi.getAll({ limit: 1000 });
        const transactions = result?.data ?? result;
        const data = transactions.map(t => ({
          ID: t.id,
          Tanggal: t.date,
          Tipe: t.type,
          Kategori: t.category,
          Nominal: t.amount,
          Deskripsi: t.description
        }));
        generateCSV(data, 'laporan_arus_kas');
      } else if (exportType === 'Program Kerja') {
        const programs = await programApi.getAll({ limit: 1000 });
        const data = programs.map(p => ({
          ID: p.id,
          Nama_Program: p.name,
          PIC: p.pic,
          Anggaran: p.budget,
          Tanggal: p.date,
          Status: p.status,
          Deskripsi: p.description
        }));
        generateCSV(data, 'laporan_program_kerja');
      } else if (exportType === 'Statistik Jemaah') {
        const jemaah = await jemaahApi.getAll({ limit: 1000 });
        const data = jemaah.map(j => ({
          ID: j.id,
          Nama: j.name,
          Kategori: j.category,
          Telepon: j.phone,
          Alamat: j.address
        }));
        generateCSV(data, 'laporan_data_jemaah');
      }
    } catch (error) {
      console.error("Export failed:", error);
      alert("Gagal melakukan export data.");
    } finally {
      setIsExporting(false);
    }
  };

  const renderGrafikKeuangan = () => {
    const cashflowMonths = cashflow?.months ?? ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des'];
    
    // Base step size is 10 Juta (10,000,000)
    const BASE_STEP = 10000000; // 10 Juta
    const MAX_INTERVALS = 5; // Maksimal 5 interval tick agar teks tidak menumpuk di dalam box

    const maxIn = cashflow?.income?.length ? Math.max(...cashflow.income) : 0;
    const maxOut = cashflow?.expense?.length ? Math.max(...cashflow.expense) : 0;
    const peak = Math.max(maxIn, maxOut);

    // Langkah (step) dimulai dari 10 Juta.
    // Jika nilai grafik melebihi kapasitas box (peak / step > MAX_INTERVALS),
    // kelipatan langkah otomatis dilipatgandakan x2 (10 Juta -> 20 Juta -> 40 Juta -> 80 Juta...)
    let step = BASE_STEP;
    if (peak > 0) {
      while (Math.ceil(peak / step) > MAX_INTERVALS) {
        step *= 2;
      }
    }

    // Hitung batas atas skala (maxVal) sebagai kelipatan dari step yang dihasilkan (minimal 10 Juta)
    const maxVal = Math.max(step, Math.ceil(peak / step) * step);

    // Hasil tick nilai dari maxVal turun hingga 0
    const ticks = [];
    for (let val = maxVal; val >= 0; val -= step) {
      ticks.push(val);
    }

    const formatYLabel = (val) => {
      if (val === 0) return '0';
      const juta = val / 1000000;
      return `${juta} Juta`;
    };

    return (
      <div className="grid grid-cols-12 gap-4 sm:gap-gutter w-full">
        <div className="col-span-12 lg:col-span-8 glass-panel rounded-xl p-3 sm:p-md flex flex-col h-[380px] sm:h-[420px]">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="font-title-md text-[20px] font-semibold leading-[28px] text-on-surface">Perbandingan Pemasukan & Pengeluaran</h3>
              <p className="font-body-sm text-[14px] leading-[20px] text-on-surface-variant font-medium">Tahun {new Date().getFullYear()}</p>
            </div>
          </div>
          
          <div className="overflow-x-auto hide-scrollbar flex-1 flex flex-col">
            <div className="min-w-[640px] sm:min-w-full flex-1 relative w-full h-full flex items-end justify-between pl-16 sm:pl-20 pr-2 sm:pr-4 pb-6 pt-4">
              
              {/* Vertical Y-Axis Border Line */}
              <div className="absolute left-16 sm:left-20 top-4 bottom-6 border-l border-outline-variant/30 pointer-events-none z-10" />

              {/* Horizontal Grid Lines */}
              <div className="absolute top-4 bottom-6 left-16 sm:left-20 right-2 sm:right-4 pointer-events-none flex flex-col justify-between z-0">
                {ticks.map((_, i) => (
                  <div key={i} className="w-full border-b border-outline-variant/15 border-dashed" />
                ))}
              </div>

              {/* Y Axis Labels */}
              <div className="absolute left-1 sm:left-2 top-4 bottom-6 flex flex-col justify-between text-xs text-on-surface-variant font-semibold font-label-md pointer-events-none z-10">
                {ticks.map((val, i) => (
                  <span key={i} className="text-right w-12 sm:w-14 leading-none select-none">{formatYLabel(val)}</span>
                ))}
              </div>

              {/* Horizontal X-Axis Border Line */}
              <div className="absolute left-16 sm:left-20 right-2 sm:right-4 bottom-6 border-b border-outline-variant/30 pointer-events-none z-10" />

              {/* Bars */}
              {cashflowMonths.map((month, i, arr) => {
                const inVal = cashflow?.income?.[i] ?? 0;
                const outVal = cashflow?.expense?.[i] ?? 0;
                const inH = Math.max((inVal / maxVal) * 100, 2);
                const outH = Math.max((outVal / maxVal) * 100, 2);
                const currentYear = new Date().getFullYear();

                let tooltipPos = 'left-1/2 -translate-x-1/2';
                if (i <= 1) {
                  tooltipPos = 'left-0';
                } else if (i >= arr.length - 2) {
                  tooltipPos = 'right-0';
                }

                return (
                  <div key={i} className="flex flex-col items-center gap-2 group cursor-pointer flex-1 relative z-10">
                    {/* Column Hover Background Overlay */}
                    <div className="absolute inset-y-0 -top-2 -bottom-2 w-[90%] rounded-xl bg-white/[0.04] sm:bg-white/[0.05] opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-0" />

                    {/* Animated Hover Tooltip */}
                    <div className={`absolute top-1 ${tooltipPos} bg-[#111927]/95 backdrop-blur-md text-on-surface p-3 sm:p-3.5 rounded-xl text-xs opacity-0 group-hover:opacity-100 group-hover:translate-y-0 translate-y-2 scale-95 group-hover:scale-100 transition-all duration-200 ease-out whitespace-nowrap z-30 pointer-events-none flex flex-col gap-2 shadow-2xl border border-white/10 min-w-[175px]`}>
                      <div className="font-bold text-white text-[12px] border-b border-white/10 pb-1.5 flex items-center justify-between">
                        <span>{month} {currentYear}</span>
                      </div>
                      <div className="flex items-center justify-between gap-4 text-[12px]">
                        <span className="text-[#10b981] font-medium flex items-center gap-1.5">
                          Pemasukan:
                        </span>
                        <span className="text-[#10b981] font-bold font-mono">{formatCurrency(inVal)}</span>
                      </div>
                      <div className="flex items-center justify-between gap-4 text-[12px]">
                        <span className="text-[#ef4444] font-medium flex items-center gap-1.5">
                          Pengeluaran:
                        </span>
                        <span className="text-[#ef4444] font-bold font-mono">{formatCurrency(outVal)}</span>
                      </div>
                    </div>

                    <div className="flex items-end gap-1 h-[170px] sm:h-[200px] w-full justify-center relative z-10">
                      <div className="w-2 sm:w-6 bg-[#10b981] rounded-t-sm group-hover:brightness-125 group-hover:scale-y-[1.02] origin-bottom transition-all duration-200 shadow-sm" style={{ height: `${inH}%` }}></div>
                      <div className="w-2 sm:w-6 bg-[#ef4444] rounded-t-sm group-hover:brightness-125 group-hover:scale-y-[1.02] origin-bottom transition-all duration-200 shadow-sm" style={{ height: `${outH}%` }}></div>
                    </div>
                    <span className="font-label-md text-[10px] sm:text-[12px] font-semibold leading-[16px] tracking-[0.05em] text-on-surface-variant opacity-95 group-hover:text-white transition-colors truncate">{month}</span>
                  </div>
                );
              })}
            </div>
          </div>
          
          <div className="flex justify-center gap-6 mt-4">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-secondary"></span>
              <span className="font-body-sm text-[14px] leading-[20px] text-on-surface font-medium">Pemasukan</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-error/80"></span>
              <span className="font-body-sm text-[14px] leading-[20px] text-on-surface font-medium">Pengeluaran</span>
            </div>
          </div>
        </div>

        <div className="col-span-12 lg:col-span-4 flex flex-col gap-4 sm:gap-gutter">
          <div className="glass-panel rounded-xl p-3 sm:p-md flex-1 flex flex-col">
            <h3 className="font-title-md text-[20px] font-semibold leading-[28px] text-on-surface mb-4">Distribusi Pengeluaran</h3>
            
            {(() => {
              const items = allocation ?? [];
              const colors = ['#006c49', '#6b38d4', '#ba1a1a', '#6d7a77', '#f59e0b'];
              
              if (items.length === 0) {
                return (
                  <div className="flex-1 flex items-center justify-center text-on-surface-variant text-sm">
                    Belum ada data pengeluaran
                  </div>
                );
              }

              let gradient = '';
              let cumulative = 0;
              items.forEach((item, i) => {
                const start = cumulative;
                cumulative += item.percentage;
                gradient += `${colors[i % colors.length]} ${start}% ${cumulative}%${i < items.length - 1 ? ', ' : ''}`;
              });

              return (
                <>
                  <div className="flex-1 flex items-center justify-center relative my-4">
                    <div className="w-32 h-32 rounded-full relative" style={{ background: `conic-gradient(${gradient})` }}>
                      <div className="absolute inset-2 bg-surface/90 backdrop-blur-sm rounded-full flex items-center justify-center">
                        <span className="font-title-md text-[20px] font-bold leading-[28px] text-on-surface">100%</span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 flex flex-col gap-2">
                    {items.map((item, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full" style={{ background: colors[i % colors.length] }}></span>
                          <span className="font-body-sm text-[14px] leading-[20px] text-on-surface-variant">{item.label}</span>
                        </div>
                        <span className="font-label-md text-[12px] font-semibold leading-[16px] tracking-[0.05em] text-on-surface">{item.percentage}%</span>
                      </div>
                    ))}
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      </div>
    );
  };

  const renderAnalisisProgram = () => {
    return (
      <Suspense fallback={
        <div className="w-full flex items-center justify-center h-64">
          <div style={{
            width: '36px', height: '36px',
            border: '3px solid rgba(255,255,255,0.1)',
            borderTopColor: 'var(--primary, #10b981)',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
          }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      }>
        <LaporanCharts programSummary={programSummary} />
      </Suspense>
    );
  };

  const renderExportLaporan = () => {
    return (
      <div className="w-full lg:w-1/2 xl:w-1/3 glass-panel rounded-xl p-md">
        <h3 className="font-title-md text-[20px] font-semibold leading-[28px] text-on-surface mb-1 flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">download</span> Export Data
        </h3>
        <p className="font-body-sm text-[14px] leading-[20px] text-outline mb-6">Unduh data mentah menjadi format file Excel (CSV).</p>
        
        <form className="flex flex-col gap-5">
          <div>
            <label className="font-label-md text-[12px] font-semibold leading-[16px] tracking-[0.05em] text-on-surface-variant block mb-2">Jenis Laporan</label>
            <select 
              value={exportType}
              onChange={(e) => setExportType(e.target.value)}
              className="w-full rounded-lg bg-surface-variant border border-outline p-3 font-body-sm text-[14px] leading-[20px] text-on-surface outline-none focus:border-primary appearance-none cursor-pointer pr-10"
            >
              <option value="Arus Kas">Arus Kas (Pemasukan & Pengeluaran)</option>
              <option value="Program Kerja">Laporan Program Kerja</option>
              <option value="Statistik Jemaah">Statistik Data Jemaah</option>
            </select>
          </div>
          
          <div>
            <label className="font-label-md text-[12px] font-semibold leading-[16px] tracking-[0.05em] text-on-surface-variant block mb-2">Format File</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  checked={exportFormat === 'csv'}
                  onChange={() => setExportFormat('csv')}
                  className="text-primary focus:ring-primary w-4 h-4" 
                  name="format" 
                  type="radio" 
                  value="csv" 
                />
                <span className="font-body-sm text-[14px] leading-[20px] text-on-surface">Excel (.csv)</span>
              </label>
            </div>
          </div>

          <button 
            onClick={handleExport}
            disabled={isExporting}
            className="mt-4 w-full py-3 bg-primary text-on-primary rounded-xl font-label-md text-[14px] font-semibold shadow-md hover:shadow-lg hover:bg-primary/90 transition-all flex items-center justify-center gap-2 disabled:opacity-50" 
            type="button"
          >
            {isExporting ? (
              <span className="animate-pulse">Menyiapkan Unduhan...</span>
            ) : (
              <>
                <span className="material-symbols-outlined text-[18px]">file_download</span>
                Unduh File Laporan
              </>
            )}
          </button>
        </form>
      </div>
    );
  };

  return (
    <div className="flex flex-col">
      {/* Page Header */}
      <div className="mb-8 flex flex-col gap-2">
        <h2 className="font-headline-lg text-[32px] font-semibold leading-[40px] tracking-[-0.01em] text-on-surface">Analisis & Laporan</h2>
        <p className="font-body-md text-[16px] leading-[24px] text-on-surface-variant">Tinjauan komprehensif keuangan dan aktivitas jemaah.</p>
      </div>

      {/* Quick Stats */}
      <div className="flex flex-wrap gap-3 sm:gap-4 mb-6 sm:mb-8">
        <div className="glass-panel rounded-full px-4 sm:px-6 py-2 flex items-center gap-2 sm:gap-3 shadow-sm border-outline/30">
          <span className="w-2 h-2 rounded-full bg-secondary"></span>
          <span className="font-label-md text-[11px] sm:text-[12px] font-semibold leading-[16px] tracking-[0.05em] text-outline">Saldo Terkini:</span>
          <span className="font-title-md text-base sm:text-[20px] font-bold text-white">{formatCurrency(saldo)}</span>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex gap-2 mb-6 sm:mb-8 border-b border-outline-variant/30 pb-2 overflow-x-auto hide-scrollbar">
        <button 
          onClick={() => setActiveTab('Grafik Keuangan')}
          className={activeTab === 'Grafik Keuangan' ? activeTabClass : inactiveTabClass}
        >
          Grafik Keuangan
        </button>
        <button 
          onClick={() => setActiveTab('Analisis Program')}
          className={activeTab === 'Analisis Program' ? activeTabClass : inactiveTabClass}
        >
          Analisis Program
        </button>
        <button 
          onClick={() => setActiveTab('Export Laporan')}
          className={activeTab === 'Export Laporan' ? activeTabClass : inactiveTabClass}
        >
          Export Laporan
        </button>
      </div>

      {/* Tab Content Rendering */}
      <div className="w-full animate-in fade-in slide-in-from-bottom-2 duration-300">
        {activeTab === 'Grafik Keuangan' && renderGrafikKeuangan()}
        {activeTab === 'Analisis Program' && renderAnalisisProgram()}
        {activeTab === 'Export Laporan' && renderExportLaporan()}
      </div>

    </div>
  );
};

export default LaporanPage;
