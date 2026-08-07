import React, { useState, useMemo } from 'react';
import { useKeuangan } from '../context/KeuanganContext';
import { useAuth } from '../context/AuthContext';
import TransactionForm from '../components/keuangan/TransactionForm';
import ConfirmDialog from '../components/common/ConfirmDialog';
import { formatCurrency } from '../data/mockTransactions';

const KeuanganPage = () => {
  const { transactions, summaries, addTransaction, updateTransaction, deleteTransaction } = useKeuangan();
  const { currentUser } = useAuth();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterDate, setFilterDate] = useState('');
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState(null);

  const canEdit = ['Ketua', 'Bendahara'].includes(currentUser?.role);

  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      const matchSearch = t.description.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          t.id.toLowerCase().includes(searchTerm.toLowerCase());
      const matchCategory = filterCategory === '' || t.category.toLowerCase() === filterCategory.toLowerCase();
      // Simple date filter for demo purposes (assuming format allows)
      const matchDate = filterDate === '' || new Date(t.date).toISOString().includes(filterDate);
      return matchSearch && matchCategory && matchDate;
    });
  }, [transactions, searchTerm, filterCategory, filterDate]);

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
      deleteTransaction(transactionToDelete.id);
      setTransactionToDelete(null);
    }
  };

  const handleSubmit = (data) => {
    if (editingTransaction) {
      updateTransaction(editingTransaction.id, data);
    } else {
      addTransaction(data);
    }
    setIsFormOpen(false);
  };

  // Helper for status colors based on category or type
  const getCategoryColor = (category) => {
    switch (category?.toLowerCase()) {
      case 'infaq': return 'bg-primary/10 text-primary';
      case 'operasional': return 'bg-slate-500/10 text-slate-700';
      case 'wakaf': return 'bg-tertiary/10 text-tertiary';
      case 'pembangunan': return 'bg-amber-500/10 text-amber-700';
      default: return 'bg-surface-variant text-on-surface-variant';
    }
  };

  return (
    <>
      {/* Summary Cards Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-lg mb-lg">
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
            <span className="material-symbols-outlined text-[16px]">trending_up</span> +12% dari bulan lalu
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
          <div className="font-body-sm text-body-sm text-on-surface-variant mt-xs relative z-10">Sebagian besar: Operasional</div>
        </div>
      </div>

      {/* Action Bar & Filter */}
      <div className="glass-panel rounded-xl p-sm mb-lg flex flex-col md:flex-row items-center justify-between gap-sm">
        <div className="flex flex-1 w-full gap-sm">
          <div className="relative flex-1 max-w-md">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
            <input 
              className="glass-input w-full pl-10 pr-4 py-2 rounded-lg font-body-sm text-body-sm text-on-surface placeholder:text-on-surface-variant" 
              placeholder="Cari transaksi..." 
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select 
            className="glass-input px-3 py-2 rounded-lg font-body-sm text-body-sm text-on-surface appearance-none pr-8" 
            style={{ backgroundImage: `url("data:image/svg+xml;utf8,<svg fill='none' height='20' viewBox='0 0 20 20' width='20' xmlns='http://www.w3.org/2000/svg'><path d='M5 7.5L10 12.5L15 7.5' stroke='%236B7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5'/></svg>")`, backgroundPosition: 'right 8px center', backgroundRepeat: 'no-repeat' }}
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
          >
            <option value="">Semua Kategori</option>
            <option value="infaq">Infaq</option>
            <option value="operasional">Operasional</option>
            <option value="wakaf">Wakaf</option>
            <option value="pembangunan">Pembangunan</option>
          </select>
          <select 
            className="glass-input px-3 py-2 rounded-lg font-body-sm text-body-sm text-on-surface appearance-none pr-8" 
            style={{ backgroundImage: `url("data:image/svg+xml;utf8,<svg fill='none' height='20' viewBox='0 0 20 20' width='20' xmlns='http://www.w3.org/2000/svg'><path d='M5 7.5L10 12.5L15 7.5' stroke='%236B7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5'/></svg>")`, backgroundPosition: 'right 8px center', backgroundRepeat: 'no-repeat' }}
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
          >
            <option value="">Semua Waktu</option>
            <option value="2024-10">Okt 2024</option>
            <option value="2024-09">Sep 2024</option>
            <option value="2024-08">Agt 2024</option>
          </select>
        </div>
        {canEdit && (
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
              <tr className="border-b border-white/40 bg-surface-variant/30">
                <th className="py-sm px-md font-label-md text-label-md text-on-surface-variant">Tanggal</th>
                <th className="py-sm px-md font-label-md text-label-md text-on-surface-variant">Deskripsi</th>
                <th className="py-sm px-md font-label-md text-label-md text-on-surface-variant">Kategori</th>
                <th className="py-sm px-md font-label-md text-label-md text-on-surface-variant text-right">Nominal</th>
                {canEdit && <th className="py-sm px-md font-label-md text-label-md text-on-surface-variant text-center">Aksi</th>}
              </tr>
            </thead>
            <tbody className="font-body-sm text-body-sm">
              {filteredTransactions.length > 0 ? (
                filteredTransactions.map(t => (
                  <tr key={t.id} className="border-b border-white/20 glass-row">
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
                    {canEdit && (
                      <td className="py-sm px-md text-center">
                        <div className="relative group inline-block">
                          <button className="text-on-surface-variant hover:text-primary transition-colors cursor-pointer focus:outline-none">
                            <span className="material-symbols-outlined text-sm">more_vert</span>
                          </button>
                          {/* Simple Dropdown for actions using group-hover */}
                          <div className="absolute right-0 top-full mt-1 w-32 bg-white dark:bg-surface border border-white/40 shadow-lg rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-20 flex flex-col overflow-hidden">
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
                  <td colSpan={canEdit ? 5 : 4} className="py-md text-center text-on-surface-variant">
                    Tidak ada transaksi yang ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination simple */}
        <div className="px-md py-sm border-t border-white/40 flex items-center justify-between bg-surface-variant/10">
          <span className="font-body-sm text-body-sm text-on-surface-variant">
            Menampilkan {filteredTransactions.length > 0 ? 1 : 0}-{Math.min(5, filteredTransactions.length)} dari {filteredTransactions.length} transaksi
          </span>
          <div className="flex gap-2">
            <button className="p-1 rounded text-on-surface-variant hover:bg-white/50 disabled:opacity-50" disabled>
              <span className="material-symbols-outlined text-sm">chevron_left</span>
            </button>
            <button className="p-1 rounded text-on-surface-variant hover:bg-white/50 disabled:opacity-50" disabled={filteredTransactions.length <= 5}>
              <span className="material-symbols-outlined text-sm">chevron_right</span>
            </button>
          </div>
        </div>
      </div>

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
