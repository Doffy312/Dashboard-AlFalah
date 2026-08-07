import React from 'react';

const LaporanPage = () => {
  return (
    <div className="flex flex-col">
      {/* Page Header */}
      <div className="mb-8 flex flex-col gap-2">
        <h2 className="font-headline-lg text-[32px] font-semibold leading-[40px] tracking-[-0.01em] text-on-surface">Analisis & Laporan</h2>
        <p className="font-body-md text-[16px] leading-[24px] text-on-surface-variant">Tinjauan komprehensif keuangan dan aktivitas jemaah.</p>
      </div>

      {/* Quick Stats (Glass Pills) */}
      <div className="flex flex-wrap gap-4 mb-8">
        <div className="glass-panel rounded-full px-6 py-2 flex items-center gap-3">
          <span className="w-2 h-2 rounded-full bg-secondary"></span>
          <span className="font-label-md text-[12px] font-semibold leading-[16px] tracking-[0.05em] text-outline">Total Saldo:</span>
          <span className="font-title-md text-[20px] font-semibold leading-[28px] text-on-surface">Rp 125.450.000</span>
        </div>
        <div className="glass-panel rounded-full px-6 py-2 flex items-center gap-3">
          <span className="w-2 h-2 rounded-full bg-tertiary"></span>
          <span className="font-label-md text-[12px] font-semibold leading-[16px] tracking-[0.05em] text-outline">Pertumbuhan (Bulan ini):</span>
          <span className="font-title-md text-[20px] font-semibold leading-[28px] text-secondary flex items-center">
            <span className="material-symbols-outlined text-[16px] mr-1">trending_up</span> +12%
          </span>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex gap-2 mb-8 border-b border-outline-variant/30 pb-2">
        <button className="px-6 py-2 rounded-t-lg border-b-2 border-primary text-primary font-label-md text-[12px] font-semibold leading-[16px] tracking-[0.05em] bg-white/30 backdrop-blur-sm transition-all">
          Grafik Keuangan
        </button>
        <button className="px-6 py-2 rounded-t-lg border-b-2 border-transparent text-on-surface-variant hover:text-primary hover:bg-white/20 font-label-md text-[12px] font-semibold leading-[16px] tracking-[0.05em] transition-all">
          Analisis Program
        </button>
        <button className="px-6 py-2 rounded-t-lg border-b-2 border-transparent text-on-surface-variant hover:text-primary hover:bg-white/20 font-label-md text-[12px] font-semibold leading-[16px] tracking-[0.05em] transition-all">
          Export Laporan
        </button>
      </div>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-12 gap-gutter">
        {/* Main Chart: Monthly Comparison (Spans 8 columns) */}
        <div className="col-span-12 lg:col-span-8 glass-panel rounded-xl p-md flex flex-col h-[400px]">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="font-title-md text-[20px] font-semibold leading-[28px] text-on-surface">Perbandingan Pemasukan & Pengeluaran</h3>
              <p className="font-body-sm text-[14px] leading-[20px] text-outline">Data 6 bulan terakhir</p>
            </div>
            <button className="text-primary hover:bg-primary/10 p-2 rounded-lg transition-colors">
              <span className="material-symbols-outlined">more_horiz</span>
            </button>
          </div>

          {/* Mock Bar Chart using SVG */}
          <div className="flex-1 relative w-full h-full flex items-end justify-between px-4 pb-6 pt-4 border-l border-b border-outline-variant/30">
            {/* Y Axis Labels */}
            <div className="absolute left-[-40px] h-full flex flex-col justify-between text-xs text-outline font-label-md py-4">
              <span>40M</span>
              <span>30M</span>
              <span>20M</span>
              <span>10M</span>
              <span>0</span>
            </div>

            {/* Bars */}
            {[
              { month: 'Jan', inH: '60%', outH: '40%' },
              { month: 'Feb', inH: '75%', outH: '30%' },
              { month: 'Mar', inH: '90%', outH: '50%' },
              { month: 'Apr', inH: '65%', outH: '80%' },
              { month: 'Mei', inH: '85%', outH: '45%' },
              { month: 'Jun', inH: '100%', outH: '60%', tooltip: 'Rp 35.000.000' }
            ].map((item, idx) => (
              <div key={idx} className="flex flex-col items-center gap-2 group cursor-pointer">
                <div className="flex items-end gap-1 h-[200px]">
                  <div className={`w-8 bg-secondary/80 rounded-t-sm group-hover:bg-secondary transition-colors relative`} style={{ height: item.inH }}>
                    {item.tooltip && (
                      <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-inverse-surface text-inverse-on-surface px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        {item.tooltip}
                      </div>
                    )}
                  </div>
                  <div className={`w-8 bg-error/70 rounded-t-sm group-hover:bg-error transition-colors`} style={{ height: item.outH }}></div>
                </div>
                <span className="font-label-md text-[12px] font-semibold leading-[16px] tracking-[0.05em] text-outline">{item.month}</span>
              </div>
            ))}
          </div>

          {/* Legend */}
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

        {/* Side Cards Container (Spans 4 columns) */}
        <div className="col-span-12 lg:col-span-4 flex flex-col gap-gutter">
          {/* Pie Chart: Expense Distribution */}
          <div className="glass-panel rounded-xl p-md flex-1 flex flex-col">
            <h3 className="font-title-md text-[20px] font-semibold leading-[28px] text-on-surface mb-4">Distribusi Pengeluaran</h3>
            <div className="flex-1 flex items-center justify-center relative">
              {/* CSS Donut Chart Simulation */}
              <div className="w-32 h-32 rounded-full relative" style={{ background: 'conic-gradient(#006c49 0% 45%, #6b38d4 45% 75%, #ba1a1a 75% 90%, #6d7a77 90% 100%)' }}>
                <div className="absolute inset-2 bg-surface/90 backdrop-blur-sm rounded-full flex items-center justify-center">
                  <span className="font-title-md text-[20px] font-semibold leading-[28px] text-on-surface font-bold">100%</span>
                </div>
              </div>
            </div>
            {/* Legend */}
            <div className="mt-4 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-secondary"></span>
                  <span className="font-body-sm text-[14px] leading-[20px] text-on-surface-variant">Operasional</span>
                </div>
                <span className="font-label-md text-[12px] font-semibold leading-[16px] tracking-[0.05em] text-on-surface">45%</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-tertiary"></span>
                  <span className="font-body-sm text-[14px] leading-[20px] text-on-surface-variant">Program Kajian</span>
                </div>
                <span className="font-label-md text-[12px] font-semibold leading-[16px] tracking-[0.05em] text-on-surface">30%</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-error"></span>
                  <span className="font-body-sm text-[14px] leading-[20px] text-on-surface-variant">Bantuan Sosial</span>
                </div>
                <span className="font-label-md text-[12px] font-semibold leading-[16px] tracking-[0.05em] text-on-surface">15%</span>
              </div>
            </div>
          </div>

          {/* Export Panel */}
          <div className="glass-panel rounded-xl p-md">
            <h3 className="font-title-md text-[20px] font-semibold leading-[28px] text-on-surface mb-1 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">download</span> Export Data
            </h3>
            <p className="font-body-sm text-[14px] leading-[20px] text-outline mb-4">Unduh laporan dalam format yang dibutuhkan.</p>
            <form className="flex flex-col gap-4">
              <div>
                <label className="font-label-md text-[12px] font-semibold leading-[16px] tracking-[0.05em] text-on-surface-variant block mb-1">Jenis Laporan</label>
                <select className="w-full rounded-lg glass-input p-2 font-body-sm text-[14px] leading-[20px] text-on-surface border-none focus:ring-2 focus:ring-primary focus:outline-none">
                  <option>Arus Kas (Pemasukan & Pengeluaran)</option>
                  <option>Laporan Program Kerja</option>
                  <option>Statistik Jemaah</option>
                </select>
              </div>
              <div>
                <label className="font-label-md text-[12px] font-semibold leading-[16px] tracking-[0.05em] text-on-surface-variant block mb-1">Rentang Waktu</label>
                <select className="w-full rounded-lg glass-input p-2 font-body-sm text-[14px] leading-[20px] text-on-surface border-none focus:ring-2 focus:ring-primary focus:outline-none">
                  <option>Bulan Ini (Juni 2024)</option>
                  <option>Bulan Lalu (Mei 2024)</option>
                  <option>Tahun Ini (2024)</option>
                  <option>Kustom...</option>
                </select>
              </div>
              <div>
                <label className="font-label-md text-[12px] font-semibold leading-[16px] tracking-[0.05em] text-on-surface-variant block mb-1">Format File</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input defaultChecked className="text-primary focus:ring-primary" name="format" type="radio" value="pdf" />
                    <span className="font-body-sm text-[14px] leading-[20px]">PDF</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input className="text-primary focus:ring-primary" name="format" type="radio" value="excel" />
                    <span className="font-body-sm text-[14px] leading-[20px]">Excel (.xlsx)</span>
                  </label>
                </div>
              </div>
              <button className="mt-2 w-full py-2 bg-primary text-on-primary rounded-lg font-label-md text-[12px] font-semibold leading-[16px] tracking-[0.05em] shadow-md hover:shadow-lg hover:bg-surface-tint transition-all flex items-center justify-center gap-2" type="button">
                Unduh Laporan
              </button>
            </form>
          </div>
        </div>

        {/* Full Width Bottom Section: Cumulative Balance Line Chart */}
        <div className="col-span-12 glass-panel rounded-xl p-md mt-4">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-title-md text-[20px] font-semibold leading-[28px] text-on-surface">Akumulasi Saldo Kas</h3>
            <span className="bg-primary-container/20 text-primary font-label-md text-[12px] font-semibold leading-[16px] tracking-[0.05em] px-3 py-1 rounded-full border border-primary/20">Tahun 2024</span>
          </div>
          <div className="w-full h-[250px] relative mt-4">
            {/* Simple SVG Line Chart representation */}
            <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 1000 200">
              {/* Grid lines */}
              <line opacity="0.3" stroke="#bcc9c6" strokeDasharray="4" strokeWidth="1" x1="0" x2="1000" y1="50" y2="50"></line>
              <line opacity="0.3" stroke="#bcc9c6" strokeDasharray="4" strokeWidth="1" x1="0" x2="1000" y1="100" y2="100"></line>
              <line opacity="0.3" stroke="#bcc9c6" strokeDasharray="4" strokeWidth="1" x1="0" x2="1000" y1="150" y2="150"></line>
              
              {/* Area Fill */}
              <path d="M0,180 L100,160 L200,140 L300,150 L400,110 L500,90 L600,100 L700,60 L800,40 L900,50 L1000,20 L1000,200 L0,200 Z" fill="url(#gradientPrimary)" opacity="0.1"></path>
              
              {/* Line */}
              <path d="M0,180 L100,160 L200,140 L300,150 L400,110 L500,90 L600,100 L700,60 L800,40 L900,50 L1000,20" fill="none" stroke="#00685f" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3"></path>
              
              {/* Data Points */}
              <circle cx="100" cy="160" fill="#ffffff" r="4" stroke="#00685f" strokeWidth="2"></circle>
              <circle cx="300" cy="150" fill="#ffffff" r="4" stroke="#00685f" strokeWidth="2"></circle>
              <circle cx="500" cy="90" fill="#ffffff" r="4" stroke="#00685f" strokeWidth="2"></circle>
              <circle cx="700" cy="60" fill="#ffffff" r="4" stroke="#00685f" strokeWidth="2"></circle>
              <circle cx="900" cy="50" fill="#ffffff" r="4" stroke="#00685f" strokeWidth="2"></circle>
              <circle className="animate-pulse" cx="1000" cy="20" fill="#00685f" r="6"></circle>
              
              {/* Defs for gradient */}
              <defs>
                <linearGradient id="gradientPrimary" x1="0%" x2="0%" y1="0%" y2="100%">
                  <stop offset="0%" stopColor="#00685f" stopOpacity="1"></stop>
                  <stop offset="100%" stopColor="#00685f" stopOpacity="0"></stop>
                </linearGradient>
              </defs>
            </svg>
            
            {/* X Axis Labels (Simulated) */}
            <div className="flex justify-between w-full mt-2 text-xs text-outline font-label-md px-2">
              <span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>Mei</span><span>Jun</span>
              <span>Jul</span><span>Ags</span><span>Sep</span><span>Okt</span><span>Nov</span><span>Des</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LaporanPage;
