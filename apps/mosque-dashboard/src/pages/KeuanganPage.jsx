import { useState, useMemo, Suspense, lazy } from 'react';
import { useTransactions, useTransactionSummary, useCreateTransaction, useUpdateTransaction, useDeleteTransaction } from '../hooks/useTransactions';
import { authClient } from '../lib/auth-client';
import TransactionForm from '../components/keuangan/TransactionForm';
import ConfirmDialog from '../components/common/ConfirmDialog';
import { formatCurrency } from '../lib/utils';

// Lazy-load the charts component — recharts (~400KB) only downloads
// when this page renders, not on initial app load.
const KeuanganCharts = lazy(() => import('../components/keuangan/KeuanganCharts'));

const KeuanganPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterDate, setFilterDate] = useState('');

  // Fetch full transactions list so KeuanganCharts always receives complete real-time data
  const { data: transactions = [] } = useTransactions();
  
  const { data: summaries = { saldoSaatIni: 0, pemasukanBulanIni: 0, pengeluaranBulanIni: 0, totalPemasukan: 0, totalPengeluaran: 0 } } = useTransactionSummary();
  
  const createMutation = useCreateTransaction();
  const updateMutation = useUpdateTransaction();
  const deleteMutation = useDeleteTransaction();

  const { data: session } = authClient.useSession();
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState(null);

  const isKetua = session?.user?.role === 'Ketua';
  const canAdd = ['Ketua', 'Bendahara'].includes(session?.user?.role);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Compute list of categories dynamically from transactions + standard defaults
  const availableCategories = useMemo(() => {
    const defaults = ['Infaq', 'Operasional', 'Wakaf', 'Pembangunan', 'Program Kerja', 'Zakat', 'Sosial', 'Kegiatan'];
    const customCats = (transactions || []).map(t => {
      if (!t.category) return '';
      const trimmed = t.category.trim();
      return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
    }).filter(Boolean);
    const uniqueSet = new Set([...defaults, ...customCats]);
    return Array.from(uniqueSet).sort((a, b) => a.localeCompare(b, 'id'));
  }, [transactions]);

  // Client-side filtering for the data table
  const filteredTransactions = useMemo(() => {
    return (transactions || []).filter(t => {
      const desc = (t.description || '').toLowerCase();
      const id = (t.id || '').toLowerCase();
      const search = searchTerm.toLowerCase();

      const matchSearch = searchTerm === '' || desc.includes(search) || id.includes(search);
      const matchCategory = filterCategory === '' || (t.category || '').toLowerCase() === filterCategory.toLowerCase();
      const matchDate = filterDate === '' || new Date(t.date).toISOString().includes(filterDate);
      
      return matchSearch && matchCategory && matchDate;
    });
  }, [transactions, searchTerm, filterCategory, filterDate]);

  // Reset to page 1 on filter changes
  const handleSearchChange = (val) => { setSearchTerm(val); setCurrentPage(1); };
  const handleCategoryChange = (val) => { setFilterCategory(val); setCurrentPage(1); };
  const handleDateChange = (val) => { setFilterDate(val); setCurrentPage(1); };

  // Pagination calculation
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage) || 1;
  const paginatedTransactions = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredTransactions.slice(start, start + itemsPerPage);
  }, [filteredTransactions, currentPage]);

  const startIndex = filteredTransactions.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0;
  const endIndex = Math.min(currentPage * itemsPerPage, filteredTransactions.length);

  const handleEdit = (transaction) => {
    setEditingTransaction(transaction);
    setIsFormOpen(true);
  };

  const handleDeleteClick = (transaction) => {
    setTransactionToDelete(transaction);
    setIsDeleteOpen(true);
  };

  const confirmDelete = () => {
    if (transactionToDelete) {
      deleteMutation.mutate(transactionToDelete.id);
      setTransactionToDelete(null);
      setIsDeleteOpen(false);
    }
  };

  const handleSubmit = (data) => {
    if (editingTransaction) {
      updateMutation.mutate({ id: editingTransaction.id, data });
    } else {
      createMutation.mutate(data);
    }
    setIsFormOpen(false);
  };

  // Helper for status colors based on category or type
  const getCategoryColor = (category) => {
    switch (category?.toLowerCase()) {
      case 'infaq': return 'bg-primary/10 text-primary';
      case 'operasional': return 'bg-slate-500/10 text-slate-700 dark:text-slate-300';
      case 'wakaf': return 'bg-tertiary/10 text-tertiary';
      case 'pembangunan': return 'bg-amber-500/10 text-amber-700 dark:text-amber-300';
      case 'program kerja': return 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-300';
      case 'zakat': return 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300';
      case 'sosial': return 'bg-cyan-500/10 text-cyan-700 dark:text-cyan-300';
      default: return 'bg-surface-variant text-on-surface-variant';
    }
  };

  return (
    <>
      {/* Summary Cards Bento Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-lg mb-lg">
        {/* Saldo Card */}
        <div className="glass-panel rounded-xl p-md flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-primary/10 rounded-full blur-xl group-hover:bg-primary/20 transition-all"></div>
          <div className="flex items-center justify-between mb-sm relative z-10">
            <span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Total Saldo</span>
            <span className="material-symbols-outlined text-primary bg-primary/10 p-xs rounded-full">account_balance_wallet</span>
          </div>
          <div className="font-headline-lg text-headline-lg text-on-surface relative z-10">{formatCurrency(summaries.saldoSaatIni)}</div>
          <div className="font-body-sm text-body-sm text-on-surface-variant mt-xs relative z-10">Per {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
        </div>

        {/* Pemasukan Card */}
        <div className="glass-panel rounded-xl p-md flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-emerald-500/10 rounded-full blur-xl group-hover:bg-emerald-500/20 transition-all"></div>
          <div className="flex items-center justify-between mb-sm relative z-10">
            <span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Pemasukan Bulan Ini</span>
            <span className="material-symbols-outlined text-emerald-600 bg-emerald-100 p-xs rounded-full">arrow_downward</span>
          </div>
          <div className="font-headline-lg text-headline-lg text-on-surface relative z-10">{formatCurrency(summaries.pemasukanBulanIni)}</div>
          <div className="font-body-sm text-body-sm text-emerald-600 mt-xs flex items-center gap-1 relative z-10">
            <span className="material-symbols-outlined text-[16px]">trending_up</span> Real-time ter-update
          </div>
        </div>

        {/* Pengeluaran Card */}
        <div className="glass-panel rounded-xl p-md flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-red-500/10 rounded-full blur-xl group-hover:bg-red-500/20 transition-all"></div>
          <div className="flex items-center justify-between mb-sm relative z-10">
            <span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Pengeluaran Bulan Ini</span>
            <span className="material-symbols-outlined text-red-600 bg-red-100 p-xs rounded-full">arrow_upward</span>
          </div>
          <div className="font-headline-lg text-headline-lg text-on-surface relative z-10">{formatCurrency(summaries.pengeluaranBulanIni)}</div>
          <div className="font-body-sm text-body-sm text-on-surface-variant mt-xs relative z-10">Bulan {new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}</div>
        </div>

        {/* Total Pemasukan Card */}
        <div className="glass-panel rounded-xl p-md flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-emerald-500/10 rounded-full blur-xl group-hover:bg-emerald-500/20 transition-all"></div>
          <div className="flex items-center justify-between mb-sm relative z-10">
            <span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Total Pemasukan</span>
            <span className="material-symbols-outlined text-emerald-600 bg-emerald-100 p-xs rounded-full">arrow_downward</span>
          </div>
          <div className="font-headline-lg text-headline-lg text-on-surface relative z-10">{formatCurrency(summaries.totalPemasukan)}</div>
          <div className="font-body-sm text-body-sm text-on-surface-variant mt-xs relative z-10">Secara Keseluruhan</div>
        </div>

        {/* Total Pengeluaran Card */}
        <div className="glass-panel rounded-xl p-md flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-red-500/10 rounded-full blur-xl group-hover:bg-red-500/20 transition-all"></div>
          <div className="flex items-center justify-between mb-sm relative z-10">
            <span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Total Pengeluaran</span>
            <span className="material-symbols-outlined text-red-600 bg-red-100 p-xs rounded-full">arrow_upward</span>
          </div>
          <div className="font-headline-lg text-headline-lg text-on-surface relative z-10">{formatCurrency(summaries.totalPengeluaran)}</div>
          <div className="font-body-sm text-body-sm text-on-surface-variant mt-xs relative z-10">Secara Keseluruhan</div>
        </div>
      </div>

      <Suspense fallback={
        <div className="glass-panel rounded-xl p-lg mb-lg animate-pulse" style={{ minHeight: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span className="text-on-surface-variant text-sm">Memuat grafik...</span>
        </div>
      }>
        <KeuanganCharts transactions={transactions} />
      </Suspense>

      {/* Action Bar & Filter */}
      <div className="glass-panel rounded-xl p-3 sm:p-sm mb-lg flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 sm:gap-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:flex md:flex-1 w-full gap-2 sm:gap-sm md:flex-nowrap">
          <div className="relative flex-1 min-w-0 sm:min-w-[200px] max-w-md col-span-1 sm:col-span-2 md:col-span-1">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
            <input 
              className="glass-input w-full pl-10 pr-4 py-2 rounded-lg font-body-sm text-body-sm text-on-surface placeholder:text-on-surface-variant" 
              placeholder="Cari transaksi..." 
              type="text"
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
            />
          </div>

          {/* Dynamic Categories Dropdown */}
          <select 
            className="glass-input px-3 py-2 rounded-lg font-body-sm text-body-sm text-on-surface appearance-none pr-10 min-w-0 sm:min-w-[150px]" 
            style={{ backgroundImage: `url("data:image/svg+xml;utf8,<svg fill='none' height='20' viewBox='0 0 20 20' width='20' xmlns='http://www.w3.org/2000/svg'><path d='M5 7.5L10 12.5L15 7.5' stroke='%236B7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5'/></svg>")`, backgroundPosition: 'right 8px center', backgroundRepeat: 'no-repeat' }}
            value={filterCategory}
            onChange={(e) => handleCategoryChange(e.target.value)}
          >
            <option value="">Semua Kategori</option>
            {availableCategories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          <select 
            className="glass-input px-3 py-2 rounded-lg font-body-sm text-body-sm text-on-surface appearance-none pr-10 min-w-0 sm:min-w-[130px]" 
            style={{ backgroundImage: `url("data:image/svg+xml;utf8,<svg fill='none' height='20' viewBox='0 0 20 20' width='20' xmlns='http://www.w3.org/2000/svg'><path d='M5 7.5L10 12.5L15 7.5' stroke='%236B7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5'/></svg>")`, backgroundPosition: 'right 8px center', backgroundRepeat: 'no-repeat' }}
            value={filterDate}
            onChange={(e) => handleDateChange(e.target.value)}
          >
            <option value="">Semua Waktu</option>
            {Array.from({ length: 12 }, (_, i) => {
              const d = new Date();
              d.setMonth(d.getMonth() - i);
              const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
              const label = d.toLocaleDateString('id-ID', { month: 'short', year: 'numeric' });
              return <option key={value} value={value}>{label}</option>;
            })}
          </select>

          {(searchTerm || filterCategory || filterDate) && (
            <button
              onClick={() => {
                setSearchTerm('');
                setFilterCategory('');
                setFilterDate('');
                setCurrentPage(1);
              }}
              className="px-3 py-2 text-xs text-on-surface-variant hover:text-primary transition-colors flex items-center gap-1 shrink-0"
              title="Reset Filter"
            >
              <span className="material-symbols-outlined text-[16px]">restart_alt</span> Reset
            </button>
          )}
        </div>

        {canAdd && (
          <button 
            onClick={() => {
              setEditingTransaction(null);
              setIsFormOpen(true);
            }}
            className="w-full md:w-auto bg-primary text-on-primary px-lg py-2 rounded-lg font-label-md text-label-md shadow-sm hover:shadow-md hover:bg-surface-tint transition-all flex items-center justify-center gap-xs whitespace-nowrap"
          >
            <span className="material-symbols-outlined text-sm">add</span>
            Tambah Transaksi
          </button>
        )}
      </div>

      {/* Data Table */}
      <div className="glass-panel rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="border-b border-outline bg-surface-variant">
                <th className="py-sm px-md font-label-md text-label-md text-on-surface-variant">Tanggal</th>
                <th className="py-sm px-md font-label-md text-label-md text-on-surface-variant">Deskripsi</th>
                <th className="py-sm px-md font-label-md text-label-md text-on-surface-variant">Kategori</th>
                <th className="py-sm px-md font-label-md text-label-md text-on-surface-variant text-right">Nominal</th>
                {isKetua && <th className="py-sm px-md font-label-md text-label-md text-on-surface-variant text-center">Aksi</th>}
              </tr>
            </thead>
            <tbody className="font-body-sm text-body-sm">
              {paginatedTransactions.length > 0 ? (
                paginatedTransactions.map(t => (
                  <tr key={t.id} className="border-b border-outline glass-row">
                    <td className="py-sm px-md text-on-surface">
                      {new Date(t.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="py-sm px-md text-on-surface font-medium">{t.description}</td>
                    <td className="py-sm px-md">
                      <span className={`px-2 py-1 rounded-md text-[11px] font-semibold tracking-wide ${getCategoryColor(t.category)}`}>
                        {t.category}
                      </span>
                    </td>
                    <td className={`py-sm px-md text-right font-semibold ${t.type === 'Pemasukan' ? 'text-emerald-600' : 'text-red-600'}`}>
                      {t.type === 'Pemasukan' ? '+' : '-'} {formatCurrency(t.amount)}
                    </td>
                    {isKetua && (
                      <td className="py-sm px-md text-center">
                        <div className="relative group inline-block">
                          <button className="text-on-surface-variant hover:text-primary transition-colors cursor-pointer focus:outline-none">
                            <span className="material-symbols-outlined text-sm">more_vert</span>
                          </button>
                          {/* Simple Dropdown for actions using group-hover */}
                          <div className="absolute right-0 top-full mt-1 w-32 bg-surface border border-outline shadow-lg rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-20 flex flex-col overflow-hidden">
                            <button onClick={() => handleEdit(t)} className="px-3 py-2 text-left hover:bg-surface-variant text-sm flex items-center gap-2 text-on-surface">
                              <span className="material-symbols-outlined text-[16px]">edit</span> Edit
                            </button>
                            <button onClick={() => handleDeleteClick(t)} className="px-3 py-2 text-left hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 text-sm flex items-center gap-2">
                              <span className="material-symbols-outlined text-[16px]">delete</span> Hapus
                            </button>
                          </div>
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={isKetua ? 5 : 4} className="py-md text-center text-on-surface-variant">
                    Tidak ada transaksi yang ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination active controls */}
        <div className="px-3 sm:px-md py-sm border-t border-outline flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0 bg-surface-variant">
          <span className="font-body-sm text-body-sm text-on-surface-variant text-xs sm:text-sm">
            Menampilkan {startIndex}-{endIndex} dari {filteredTransactions.length} transaksi
          </span>
          <div className="flex gap-2">
            <button 
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage <= 1}
              className="p-1.5 rounded-lg text-on-surface-variant hover:bg-surface-variant disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-sm">chevron_left</span>
            </button>
            <button 
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage >= totalPages}
              className="p-1.5 rounded-lg text-on-surface-variant hover:bg-surface-variant disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-sm">chevron_right</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile FAB for adding transaction */}
      {canAdd && (
        <button
          onClick={() => {
            setEditingTransaction(null);
            setIsFormOpen(true);
          }}
          className="mobile-fab md:hidden"
          aria-label="Tambah Transaksi"
        >
          <span className="material-symbols-outlined">add</span>
        </button>
      )}

      <TransactionForm 
        isOpen={isFormOpen} 
        onClose={() => setIsFormOpen(false)} 
        onSubmit={handleSubmit}
        initialData={editingTransaction}
      />

      <ConfirmDialog 
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={confirmDelete}
        title="Hapus Transaksi"
        message={`Apakah Anda yakin ingin menghapus transaksi ini? Tindakan ini tidak dapat dibatalkan.`}
      />
    </>
  );
};

export default KeuanganPage;
