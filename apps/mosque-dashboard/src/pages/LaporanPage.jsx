import React, { useState } from 'react';
import { useDashboardSummary, useCashflow, useAllocation } from '../hooks/useDashboard';
import { useProgramSummary } from '../hooks/usePrograms';
import { formatCurrency } from '../lib/utils';
import { transactionApi, programApi, jemaahApi } from '../lib/api';

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
        const transactions = await transactionApi.getAll({ limit: 1000 });
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
    const cashflowMonths = cashflow?.months ?? ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun'];
    
    // Find max value for scaling
    let maxVal = 50000000;
    if (cashflow) {
      const maxIn = Math.max(...(cashflow.income ?? [0]));
      const maxOut = Math.max(...(cashflow.expense ?? [0]));
      if (Math.max(maxIn, maxOut) > 0) {
        maxVal = Math.max(maxIn, maxOut) * 1.2;
      }
    }

    return (
      <div className="grid grid-cols-12 gap-gutter w-full">
        <div className="col-span-12 lg:col-span-8 glass-panel rounded-xl p-md flex flex-col h-[400px]">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="font-title-md text-[20px] font-semibold leading-[28px] text-on-surface">Perbandingan Pemasukan & Pengeluaran</h3>
              <p className="font-body-sm text-[14px] leading-[20px] text-outline">Tahun {new Date().getFullYear()}</p>
            </div>
          </div>
          
          <div className="flex-1 relative w-full h-full flex items-end justify-between px-4 pb-6 pt-4 border-l border-b border-outline-variant/30">
            {/* Y Axis Labels (Simulated scale) */}
            <div className="absolute left-[-40px] h-full flex flex-col justify-between text-xs text-outline font-label-md py-4">
              <span>{Math.round(maxVal / 1000000)}M</span>
              <span>{Math.round((maxVal * 0.75) / 1000000)}M</span>
              <span>{Math.round((maxVal * 0.5) / 1000000)}M</span>
              <span>{Math.round((maxVal * 0.25) / 1000000)}M</span>
              <span>0</span>
            </div>

            {/* Bars */}
            {cashflowMonths.map((month, i) => {
              const inVal = cashflow?.income?.[i] ?? 0;
              const outVal = cashflow?.expense?.[i] ?? 0;
              const inH = Math.max((inVal / maxVal) * 100, 2);
              const outH = Math.max((outVal / maxVal) * 100, 2);

              return (
                <div key={i} className="flex flex-col items-center gap-2 group cursor-pointer flex-1">
                  <div className="flex items-end gap-1 h-[200px] w-full justify-center">
                    <div className="w-2 sm:w-6 bg-secondary/80 rounded-t-sm group-hover:bg-secondary transition-colors relative" style={{ height: `${inH}%` }}>
                      <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-inverse-surface text-inverse-on-surface px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                        Pemasukan: {formatCurrency(inVal)}
                      </div>
                    </div>
                    <div className="w-2 sm:w-6 bg-error/70 rounded-t-sm group-hover:bg-error transition-colors relative" style={{ height: `${outH}%` }}>
                      <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-inverse-surface text-inverse-on-surface px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                        Pengeluaran: {formatCurrency(outVal)}
                      </div>
                    </div>
                  </div>
                  <span className="font-label-md text-[10px] sm:text-[12px] font-semibold leading-[16px] tracking-[0.05em] text-outline truncate">{month}</span>
                </div>
              );
            })}
          </div>
          
          <div className="flex justify-center gap-6 mt-4">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-secondary"></span>
              <span className="font-body-sm text-[14px] leading-[20px] text-on-surface-variant">Pemasukan</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-error/80"></span>
              <span className="font-body-sm text-[14px] leading-[20px] text-on-surface-variant">Pengeluaran</span>
            </div>
          </div>
        </div>

        <div className="col-span-12 lg:col-span-4 flex flex-col gap-gutter">
          <div className="glass-panel rounded-xl p-md flex-1 flex flex-col">
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
                        <span className="font-title-md text-[20px] font-semibold leading-[28px] text-on-surface font-bold">100%</span>
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
    const data = programSummary ?? { total: 0, Direncanakan: 0, "Sedang Berjalan": 0, Selesai: 0 };
    
    return (
      <div className="w-full glass-panel rounded-xl p-md flex flex-col">
        <h3 className="font-title-md text-[20px] font-semibold leading-[28px] text-on-surface mb-6">Analisis Program Kerja</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="p-4 rounded-xl bg-surface-variant border border-outline/30 flex flex-col items-center justify-center text-center">
            <span className="text-3xl font-bold text-white mb-1">{data.total}</span>
            <span className="text-xs text-on-surface-variant font-medium">Total Program</span>
          </div>
          <div className="p-4 rounded-xl bg-surface-variant border border-outline/30 flex flex-col items-center justify-center text-center">
            <span className="text-3xl font-bold text-amber-500 mb-1">{data.Direncanakan}</span>
            <span className="text-xs text-on-surface-variant font-medium">Direncanakan</span>
          </div>
          <div className="p-4 rounded-xl bg-surface-variant border border-outline/30 flex flex-col items-center justify-center text-center">
            <span className="text-3xl font-bold text-blue-500 mb-1">{data['Sedang Berjalan']}</span>
            <span className="text-xs text-on-surface-variant font-medium">Sedang Berjalan</span>
          </div>
          <div className="p-4 rounded-xl bg-surface-variant border border-outline/30 flex flex-col items-center justify-center text-center">
            <span className="text-3xl font-bold text-emerald-500 mb-1">{data.Selesai}</span>
            <span className="text-xs text-on-surface-variant font-medium">Selesai</span>
          </div>
        </div>

        <div className="flex-1 bg-surface-variant/50 rounded-xl p-6 border border-outline/20">
          <h4 className="text-sm font-semibold text-white mb-4">Informasi Tambahan</h4>
          <p className="text-sm text-on-surface-variant leading-relaxed">
            Dari total {data.total} program yang terdaftar, terdapat {data.Selesai} program yang telah berhasil diselesaikan. Fokus saat ini berada pada penyelesaian {data['Sedang Berjalan']} program yang sedang berjalan dan persiapan untuk {data.Direncanakan} program yang akan datang.
          </p>
        </div>
      </div>
    );
  };

  const renderExportLaporan = () => {
    return (
      <div className="w-full lg:w-1/2 glass-panel rounded-xl p-md">
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
              className="w-full rounded-lg bg-surface-variant border border-outline p-3 font-body-sm text-[14px] leading-[20px] text-on-surface outline-none focus:border-primary appearance-none cursor-pointer"
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
      <div className="flex flex-wrap gap-4 mb-8">
        <div className="glass-panel rounded-full px-6 py-2 flex items-center gap-3 shadow-sm border-outline/30">
          <span className="w-2 h-2 rounded-full bg-secondary"></span>
          <span className="font-label-md text-[12px] font-semibold leading-[16px] tracking-[0.05em] text-outline">Total Saldo Terkini:</span>
          <span className="font-title-md text-[20px] font-bold text-white">{formatCurrency(saldo)}</span>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex gap-2 mb-8 border-b border-outline-variant/30 pb-2 overflow-x-auto hide-scrollbar">
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
