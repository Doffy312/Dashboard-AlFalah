import React from 'react';

const Dashboard = () => {
  return (
    <>
      {/* Page Header */}
      <div className="mb-lg">
        <h2 className="font-headline-lg text-headline-lg text-on-surface mb-xs">Selamat Datang Kembali, Bendahara</h2>
        <p className="font-body-md text-body-md text-on-surface-variant">Ringkasan aktivitas dan metrik terkini Masjid Al-Falah.</p>
      </div>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter">
        
        {/* KPI Cards Row (Spans full width, internal grid) */}
        <div className="col-span-1 md:col-span-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-sm">
          
          {/* KPI 1: Saldo */}
          <div className="glass-panel p-md flex flex-col justify-between h-[140px] relative overflow-hidden transition-transform hover:-translate-y-1">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-primary/5 rounded-full blur-xl pointer-events-none"></div>
            <div className="flex justify-between items-start">
              <p className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Total Saldo</p>
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <span className="material-symbols-outlined text-[20px]">account_balance_wallet</span>
              </div>
            </div>
            <div>
              <h3 className="font-display-lg text-[32px] leading-tight text-on-surface mb-xs">Rp125.5jt</h3>
              <div className="flex items-center gap-xs">
                <span className="inline-flex items-center text-[11px] font-bold text-secondary bg-secondary/10 px-2 py-0.5 rounded-full">
                  <span className="material-symbols-outlined text-[14px] mr-1">trending_up</span> +12.5%
                </span>
                <span className="text-[12px] text-on-surface-variant">bulan ini</span>
              </div>
            </div>
          </div>

          {/* KPI 2: Jemaah */}
          <div className="glass-panel p-md flex flex-col justify-between h-[140px] relative overflow-hidden transition-transform hover:-translate-y-1">
            <div className="flex justify-between items-start">
              <p className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Total Jemaah</p>
              <div className="w-8 h-8 rounded-full bg-tertiary/10 flex items-center justify-center text-tertiary">
                <span className="material-symbols-outlined text-[20px]">group</span>
              </div>
            </div>
            <div>
              <h3 className="font-display-lg text-[32px] leading-tight text-on-surface mb-xs">1,248</h3>
              <div className="flex items-center gap-xs">
                <span className="inline-flex items-center text-[11px] font-bold text-secondary bg-secondary/10 px-2 py-0.5 rounded-full">
                  <span className="material-symbols-outlined text-[14px] mr-1">trending_up</span> +5.2%
                </span>
                <span className="text-[12px] text-on-surface-variant">bulan ini</span>
              </div>
            </div>
          </div>

          {/* KPI 3: Aset */}
          <div className="glass-panel p-md flex flex-col justify-between h-[140px] relative overflow-hidden transition-transform hover:-translate-y-1">
            <div className="flex justify-between items-start">
              <p className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Inventaris Aset</p>
              <div className="w-8 h-8 rounded-full bg-[#f59e0b]/10 flex items-center justify-center text-[#d97706]">
                <span className="material-symbols-outlined text-[20px]">inventory_2</span>
              </div>
            </div>
            <div>
              <h3 className="font-display-lg text-[32px] leading-tight text-on-surface mb-xs">432 <span className="text-body-md text-on-surface-variant">Item</span></h3>
              <div className="flex items-center gap-xs">
                <span className="inline-flex items-center text-[11px] font-bold text-secondary bg-secondary/10 px-2 py-0.5 rounded-full">
                  <span className="material-symbols-outlined text-[14px] mr-1">trending_up</span> +1.1%
                </span>
                <span className="text-[12px] text-on-surface-variant">bulan ini</span>
              </div>
            </div>
          </div>

          {/* KPI 4: Program */}
          <div className="glass-panel p-md flex flex-col justify-between h-[140px] relative overflow-hidden transition-transform hover:-translate-y-1">
            <div className="flex justify-between items-start">
              <p className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Program Aktif</p>
              <div className="w-8 h-8 rounded-full bg-error/10 flex items-center justify-center text-error">
                <span className="material-symbols-outlined text-[20px]">event_note</span>
              </div>
            </div>
            <div>
              <h3 className="font-display-lg text-[32px] leading-tight text-on-surface mb-xs">3</h3>
              <div className="flex items-center gap-xs">
                <span className="inline-flex items-center text-[11px] font-bold text-error bg-error/10 px-2 py-0.5 rounded-full">
                  <span className="material-symbols-outlined text-[14px] mr-1">trending_down</span> -1
                </span>
                <span className="text-[12px] text-on-surface-variant">bulan ini</span>
              </div>
            </div>
          </div>

        </div>

        {/* Main Chart Area (Spans 8 columns on desktop) */}
        <div className="col-span-1 md:col-span-8 glass-panel p-md flex flex-col min-h-[400px]">
          <div className="flex justify-between items-center mb-lg">
            <div>
              <h3 className="font-title-md text-title-md text-on-surface">Arus Kas Keuangan</h3>
              <p className="font-body-sm text-body-sm text-on-surface-variant">Pemasukan vs Pengeluaran (6 Bulan Terakhir)</p>
            </div>
            <div className="flex items-center gap-sm">
              <div className="flex items-center gap-xs">
                <span className="w-3 h-3 rounded-full bg-primary"></span>
                <span className="font-label-md text-[11px] text-on-surface-variant">Pemasukan</span>
              </div>
              <div className="flex items-center gap-xs">
                <span className="w-3 h-3 rounded-full bg-error opacity-80"></span>
                <span className="font-label-md text-[11px] text-on-surface-variant">Pengeluaran</span>
              </div>
            </div>
          </div>

          {/* Simulated Bar Chart Canvas */}
          <div className="flex-1 w-full flex items-end gap-md relative border-b border-outline-variant/30 pb-xs mt-xl px-sm">
            {/* Y-Axis Grid Lines */}
            <div className="absolute w-full border-t border-outline-variant/20 top-0 left-0"></div>
            <div className="absolute w-full border-t border-outline-variant/20 top-[25%] left-0"></div>
            <div className="absolute w-full border-t border-outline-variant/20 top-[50%] left-0"></div>
            <div className="absolute w-full border-t border-outline-variant/20 top-[75%] left-0"></div>

            {/* Jan */}
            <div className="flex-1 flex justify-center items-end gap-1 h-full z-10 group">
              <div className="w-full max-w-[32px] h-[60%] bar-in transition-all group-hover:opacity-90"></div>
              <div className="w-full max-w-[32px] h-[40%] bar-out transition-all group-hover:opacity-90"></div>
            </div>

            {/* Feb */}
            <div className="flex-1 flex justify-center items-end gap-1 h-full z-10 group">
              <div className="w-full max-w-[32px] h-[75%] bar-in transition-all group-hover:opacity-90"></div>
              <div className="w-full max-w-[32px] h-[50%] bar-out transition-all group-hover:opacity-90"></div>
            </div>

            {/* Mar */}
            <div className="flex-1 flex justify-center items-end gap-1 h-full z-10 group">
              <div className="w-full max-w-[32px] h-[45%] bar-in transition-all group-hover:opacity-90"></div>
              <div className="w-full max-w-[32px] h-[80%] bar-out transition-all group-hover:opacity-90"></div>
            </div>

            {/* Apr */}
            <div className="flex-1 flex justify-center items-end gap-1 h-full z-10 group">
              <div className="w-full max-w-[32px] h-[85%] bar-in transition-all group-hover:opacity-90"></div>
              <div className="w-full max-w-[32px] h-[60%] bar-out transition-all group-hover:opacity-90"></div>
            </div>

            {/* May */}
            <div className="flex-1 flex justify-center items-end gap-1 h-full z-10 group">
              <div className="w-full max-w-[32px] h-[95%] bar-in transition-all group-hover:opacity-90"></div>
              <div className="w-full max-w-[32px] h-[70%] bar-out transition-all group-hover:opacity-90"></div>
            </div>

            {/* Jun */}
            <div className="flex-1 flex justify-center items-end gap-1 h-full z-10 group relative">
              <div className="w-full max-w-[32px] h-[100%] bar-in transition-all group-hover:opacity-90"></div>
              <div className="w-full max-w-[32px] h-[45%] bar-out transition-all group-hover:opacity-90"></div>
              
              {/* Tooltip on current month */}
              <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-inverse-surface text-inverse-on-surface px-2 py-1 rounded text-[10px] whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                In: 125.5jt | Out: 45.2jt
              </div>
            </div>
          </div>

          {/* X-Axis Labels */}
          <div className="w-full flex justify-between items-center px-sm mt-sm">
            <span className="flex-1 text-center font-label-md text-[11px] text-on-surface-variant">Jan</span>
            <span className="flex-1 text-center font-label-md text-[11px] text-on-surface-variant">Feb</span>
            <span className="flex-1 text-center font-label-md text-[11px] text-on-surface-variant">Mar</span>
            <span className="flex-1 text-center font-label-md text-[11px] text-on-surface-variant">Apr</span>
            <span className="flex-1 text-center font-label-md text-[11px] text-on-surface-variant">Mei</span>
            <span className="flex-1 text-center font-label-md text-[11px] text-on-surface-variant text-primary font-bold">Jun</span>
          </div>
        </div>

        {/* Sidebar Widgets (Spans 4 columns on desktop) */}
        <div className="col-span-1 md:col-span-4 flex flex-col gap-sm">
          
          {/* Mini Religious Calendar */}
          <div className="glass-panel p-md">
            <div className="flex justify-between items-center mb-sm">
              <h3 className="font-title-md text-title-md text-on-surface">Kalender Hijriah</h3>
              <span className="font-label-md text-[11px] text-primary bg-primary/10 px-2 py-1 rounded-full">Dzulhijjah 1447</span>
            </div>
            
            <div className="flex items-center justify-between mb-sm">
              <button className="w-8 h-8 flex items-center justify-center rounded hover:bg-white/50 text-on-surface-variant"><span className="material-symbols-outlined text-[18px]">chevron_left</span></button>
              <span className="font-label-md text-label-md">Juni 2026</span>
              <button className="w-8 h-8 flex items-center justify-center rounded hover:bg-white/50 text-on-surface-variant"><span className="material-symbols-outlined text-[18px]">chevron_right</span></button>
            </div>
            
            {/* Mini Calendar Grid */}
            <div className="grid grid-cols-7 gap-1 text-center mb-2">
              <div className="text-[10px] font-bold text-error">M</div>
              <div className="text-[10px] font-bold text-on-surface-variant">S</div>
              <div className="text-[10px] font-bold text-on-surface-variant">S</div>
              <div className="text-[10px] font-bold text-on-surface-variant">R</div>
              <div className="text-[10px] font-bold text-on-surface-variant">K</div>
              <div className="text-[10px] font-bold text-primary">J</div>
              <div className="text-[10px] font-bold text-on-surface-variant">S</div>
            </div>
            
            <div className="grid grid-cols-7 gap-1 text-center">
              <div className="text-[12px] p-1 text-on-surface-variant/30">31</div>
              <div className="text-[12px] p-1 text-on-surface hover:bg-white/50 rounded cursor-pointer transition-colors">1</div>
              <div className="text-[12px] p-1 text-on-surface hover:bg-white/50 rounded cursor-pointer transition-colors">2</div>
              <div className="text-[12px] p-1 text-on-surface hover:bg-white/50 rounded cursor-pointer transition-colors">3</div>
              <div className="text-[12px] p-1 text-on-surface hover:bg-white/50 rounded cursor-pointer transition-colors">4</div>
              <div className="text-[12px] p-1 text-on-surface hover:bg-white/50 rounded cursor-pointer transition-colors font-bold text-primary bg-primary/5">5</div>
              <div className="text-[12px] p-1 text-on-surface hover:bg-white/50 rounded cursor-pointer transition-colors">6</div>
              
              <div className="text-[12px] p-1 text-on-surface hover:bg-white/50 rounded cursor-pointer transition-colors text-error">7</div>
              <div className="text-[12px] p-1 text-on-surface hover:bg-white/50 rounded cursor-pointer transition-colors">8</div>
              <div className="text-[12px] p-1 text-on-surface hover:bg-white/50 rounded cursor-pointer transition-colors">9</div>
              
              {/* Today Indicator */}
              <div className="text-[12px] p-1 bg-primary text-on-primary rounded-full cursor-pointer shadow-sm relative">10
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-white rounded-full"></span>
              </div>
              
              <div className="text-[12px] p-1 text-on-surface hover:bg-white/50 rounded cursor-pointer transition-colors">11</div>
              <div className="text-[12px] p-1 text-on-surface hover:bg-white/50 rounded cursor-pointer transition-colors font-bold text-primary bg-primary/5">12</div>
              <div className="text-[12px] p-1 text-on-surface hover:bg-white/50 rounded cursor-pointer transition-colors">13</div>
              
              <div className="text-[12px] p-1 text-on-surface hover:bg-white/50 rounded cursor-pointer transition-colors text-error">14</div>
              <div className="text-[12px] p-1 text-on-surface hover:bg-white/50 rounded cursor-pointer transition-colors">15</div>
            </div>
          </div>

          {/* Recent Activity List */}
          <div className="glass-panel p-md flex-1">
            <div className="flex justify-between items-center mb-md">
              <h3 className="font-title-md text-title-md text-on-surface">Aktivitas Terkini</h3>
              <a className="font-label-md text-[12px] text-primary hover:underline underline-offset-2" href="#">Lihat Semua</a>
            </div>
            
            <div className="flex flex-col gap-sm">
              {/* Activity Item 1 (Income) */}
              <div className="flex items-start gap-sm p-xs rounded-lg hover:bg-white/40 transition-colors">
                <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center text-secondary shrink-0 mt-1">
                  <span className="material-symbols-outlined text-[20px]">arrow_downward</span>
                </div>
                <div>
                  <p className="font-label-md text-[13px] text-on-surface m-0">Infaq Jumat</p>
                  <p className="font-body-sm text-[11px] text-on-surface-variant m-0 mb-1">Pemasukan Kotak Amal (Minggu 2)</p>
                  <span className="font-bold text-[12px] text-secondary">+ Rp 4.500.000</span>
                </div>
                <span className="text-[10px] text-on-surface-variant ml-auto whitespace-nowrap">2 Jam lalu</span>
              </div>
              
              <div className="w-full h-px bg-white/40"></div>
              
              {/* Activity Item 2 (Expense) */}
              <div className="flex items-start gap-sm p-xs rounded-lg hover:bg-white/40 transition-colors">
                <div className="w-10 h-10 rounded-full bg-error/10 flex items-center justify-center text-error shrink-0 mt-1">
                  <span className="material-symbols-outlined text-[20px]">electric_bolt</span>
                </div>
                <div>
                  <p className="font-label-md text-[13px] text-on-surface m-0">Tagihan Listrik PLN</p>
                  <p className="font-body-sm text-[11px] text-on-surface-variant m-0 mb-1">Pengeluaran Rutin Bulanan</p>
                  <span className="font-bold text-[12px] text-error">- Rp 1.250.000</span>
                </div>
                <span className="text-[10px] text-on-surface-variant ml-auto whitespace-nowrap">Kemarin</span>
              </div>
              
              <div className="w-full h-px bg-white/40"></div>
              
              {/* Activity Item 3 (Expense - Asset) */}
              <div className="flex items-start gap-sm p-xs rounded-lg hover:bg-white/40 transition-colors">
                <div className="w-10 h-10 rounded-full bg-error/10 flex items-center justify-center text-error shrink-0 mt-1">
                  <span className="material-symbols-outlined text-[20px]">speaker</span>
                </div>
                <div>
                  <p className="font-label-md text-[13px] text-on-surface m-0">Perbaikan Sound System</p>
                  <p className="font-body-sm text-[11px] text-on-surface-variant m-0 mb-1">Maintenance Inventaris Masjid</p>
                  <span className="font-bold text-[12px] text-error">- Rp 850.000</span>
                </div>
                <span className="text-[10px] text-on-surface-variant ml-auto whitespace-nowrap">3 Hari lalu</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;
