import { useState, useMemo } from 'react';
import { useZiswafList, useCreateZiswaf, useUpdateZiswaf, useDeleteZiswaf } from '../hooks/useZiswaf';
import { authClient } from '../lib/auth-client';
import ZiswafForm from '../components/ziswaf/ZiswafForm';
import ConfirmDialog from '../components/common/ConfirmDialog';
import { formatCurrency } from '../lib/utils';
import { useSettings } from '../contexts/SettingsContext';

export default function ZiswafPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('Semua');

  const { data: ziswaf = [], isLoading, isError } = useZiswafList({});
  
  const createMutation = useCreateZiswaf();
  const updateMutation = useUpdateZiswaf();
  const deleteMutation = useDeleteZiswaf();

  const { data: session } = authClient.useSession();
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingData, setEditingData] = useState(null);
  
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [dataToDelete, setDataToDelete] = useState(null);

  const canEdit = ['Ketua', 'Bendahara'].includes(session?.user?.role);

  const filteredData = useMemo(() => {
    return ziswaf.filter(item => {
      const matchSearch = item.donorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchType = filterType === 'Semua' || item.type === filterType;
      return matchSearch && matchType;
    });
  }, [ziswaf, searchTerm, filterType]);

  // Statistics
  const stats = useMemo(() => {
    const totalCount = ziswaf.length;
    const totalAmount = ziswaf.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
    const zakatAmount = ziswaf
      .filter(i => i.type === 'Zakat Fitrah' || i.type === 'Zakat Mal')
      .reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
    const infaqAmount = ziswaf
      .filter(i => i.type === 'Infaq' || i.type === 'Sedekah')
      .reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
    const wakafAmount = ziswaf
      .filter(i => i.type === 'Wakaf')
      .reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);

    return { totalCount, totalAmount, zakatAmount, infaqAmount, wakafAmount };
  }, [ziswaf]);

  const handleEdit = (data) => {
    setEditingData(data);
    setIsFormOpen(true);
  };

  const handleDeleteClick = (data) => {
    setDataToDelete(data);
    setIsDeleteOpen(true);
  };

  const confirmDelete = () => {
    if (dataToDelete) {
      deleteMutation.mutate(dataToDelete.id);
      setDataToDelete(null);
      setIsDeleteOpen(false);
    }
  };

  const handleSubmit = (data) => {
    if (editingData) {
      updateMutation.mutate(
        { id: editingData.id, data },
        { onSuccess: () => setIsFormOpen(false) }
      );
    } else {
      createMutation.mutate(data, {
        onSuccess: () => setIsFormOpen(false),
      });
    }
  };

  const { finance } = useSettings();
  const bankInfo = finance?.bankInfo || { bankName: 'BSI', accountNumber: '7123456789', accountHolder: 'Masjid Al-Falah' };

  const types = ['Semua', 'Zakat Fitrah', 'Zakat Mal', 'Infaq', 'Sedekah', 'Wakaf'];

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-on-surface flex items-center gap-2.5">
            <span className="material-symbols-outlined text-primary text-3xl">volunteer_activism</span>
            Penerimaan ZISWAF
          </h1>
          <p className="text-xs sm:text-sm text-on-surface-variant mt-1">
            Pengelolaan transaksi Zakat, Infaq, Sedekah, dan Wakaf Masjid Al-Falah.
          </p>
        </div>
        {canEdit && (
          <button 
            onClick={() => {
              setEditingData(null);
              setIsFormOpen(true);
            }}
            className="px-4 py-2.5 rounded-xl bg-primary text-slate-950 font-bold text-xs sm:text-sm hover:bg-primary/90 transition-all shadow-md shadow-primary/20 flex items-center gap-2 shrink-0 self-start sm:self-auto"
          >
            <span className="material-symbols-outlined text-xl">add</span>
            Tambah Penerimaan
          </button>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-surface border border-outline-variant rounded-2xl p-3.5 sm:p-5 flex flex-col justify-between shadow-sm">
          <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
            <div className="w-7 h-7 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-base sm:text-2xl">account_balance_wallet</span>
            </div>
            <div className="text-xs sm:text-sm text-on-surface-variant font-medium leading-tight">Total Penerimaan</div>
          </div>
          <div>
            <div className="text-sm sm:text-lg font-bold text-on-surface">{formatCurrency(stats.totalAmount)}</div>
          </div>
        </div>

        <div className="bg-surface border border-outline-variant rounded-2xl p-3.5 sm:p-5 flex flex-col justify-between shadow-sm">
          <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
            <div className="w-7 h-7 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-base sm:text-2xl">payments</span>
            </div>
            <div className="text-xs sm:text-sm text-on-surface-variant font-medium leading-tight">Total Zakat</div>
          </div>
          <div>
            <div className="text-sm sm:text-lg font-bold text-amber-400">{formatCurrency(stats.zakatAmount)}</div>
          </div>
        </div>

        <div className="bg-surface border border-outline-variant rounded-2xl p-3.5 sm:p-5 flex flex-col justify-between shadow-sm">
          <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
            <div className="w-7 h-7 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-blue-500/15 text-blue-400 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-base sm:text-2xl">favorite</span>
            </div>
            <div className="text-xs sm:text-sm text-on-surface-variant font-medium leading-tight">Infaq &amp; Sedekah</div>
          </div>
          <div>
            <div className="text-sm sm:text-lg font-bold text-blue-400">{formatCurrency(stats.infaqAmount)}</div>
          </div>
        </div>

        <div className="bg-surface border border-outline-variant rounded-2xl p-3.5 sm:p-5 flex flex-col justify-between shadow-sm">
          <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
            <div className="w-7 h-7 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-base sm:text-2xl">foundation</span>
            </div>
            <div className="text-xs sm:text-sm text-on-surface-variant font-medium leading-tight">Wakaf</div>
          </div>
          <div>
            <div className="text-sm sm:text-lg font-bold text-emerald-400">{formatCurrency(stats.wakafAmount)}</div>
          </div>
        </div>
      </div>

      {/* Bank Account Info Card */}
      <div className="bg-surface border border-outline-variant rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm bg-gradient-to-r from-primary/5 to-transparent">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-primary/15 text-primary flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-2xl">account_balance</span>
          </div>
          <div>
            <p className="text-xs font-bold text-primary uppercase tracking-wider">Rekening Transfer Donasi</p>
            <p className="text-sm sm:text-base font-bold text-on-surface mt-0.5">
              {bankInfo.bankName} - <span className="font-mono text-emerald-400">{bankInfo.accountNumber}</span> a.n. {bankInfo.accountHolder}
            </p>
          </div>
        </div>
        <button 
          onClick={() => {
            navigator.clipboard.writeText(`${bankInfo.bankName} ${bankInfo.accountNumber} a.n ${bankInfo.accountHolder}`);
            alert('Informasi rekening berhasil disalin!');
          }}
          className="px-3.5 py-2 rounded-xl bg-surface-variant/80 hover:bg-surface-variant text-on-surface text-xs font-semibold flex items-center gap-1.5 border border-outline-variant transition-all shrink-0"
        >
          <span className="material-symbols-outlined text-base">content_copy</span>
          Salin Rekening
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-surface border border-outline-variant rounded-2xl p-4 space-y-3 sm:space-y-0 sm:flex sm:items-center sm:justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-xl">search</span>
          <input
            type="text"
            placeholder="Cari nama donatur, keterangan..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-surface-variant/50 border border-outline-variant rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-on-surface placeholder:text-on-surface-variant outline-none focus:border-primary transition-all"
          />
        </div>

        {/* Type Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 bg-surface-variant/40 p-1 rounded-xl border border-outline-variant/40 shrink-0">
          {types.map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                filterType === type
                  ? 'bg-primary text-slate-950 shadow-md font-bold'
                  : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-variant/80'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-surface border border-outline-variant rounded-2xl overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="p-8 text-center space-y-3">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-on-surface-variant">Memuat data ZISWAF...</p>
          </div>
        ) : isError ? (
          <div className="p-8 text-center text-error space-y-2">
            <span className="material-symbols-outlined text-3xl">error</span>
            <p className="text-sm font-semibold">Gagal memuat data ZISWAF.</p>
          </div>
        ) : filteredData.length === 0 ? (
          <div className="p-12 text-center text-on-surface-variant space-y-3">
            <span className="material-symbols-outlined text-4xl text-on-surface-variant/50">volunteer_activism</span>
            <p className="text-sm font-semibold text-on-surface">Tidak ada transaksi ZISWAF ditemukan</p>
            <p className="text-xs max-w-sm mx-auto">
              {searchTerm || filterType !== 'Semua'
                ? 'Coba sesuaikan kata kunci pencarian atau filter jenis donasi Anda.' 
                : 'Belum ada transaksi ZISWAF yang terdaftar.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-outline-variant bg-surface-variant/30 text-[11px] uppercase tracking-wider text-on-surface-variant font-bold">
                  <th className="py-3.5 px-4 sm:px-6">Donatur</th>
                  <th className="py-3.5 px-4">Jenis Donasi</th>
                  <th className="py-3.5 px-4">Nominal</th>
                  <th className="py-3.5 px-4">Keterangan</th>
                  <th className="py-3.5 px-4">Tanggal Transaksi</th>
                  {canEdit && <th className="py-3.5 px-4 sm:px-6 text-right">Aksi</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/60 text-xs sm:text-sm">
                {filteredData.map((row) => (
                  <tr key={row.id} className="hover:bg-surface-variant/40 transition-colors">
                    <td className="py-4 px-4 sm:px-6 font-bold text-on-surface">
                      {row.donorName}
                    </td>
                    <td className="py-4 px-4 whitespace-nowrap">
                      <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold inline-flex items-center gap-1 border ${
                        row.type === 'Zakat Fitrah' || row.type === 'Zakat Mal'
                          ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                          : row.type === 'Wakaf'
                          ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                          : 'bg-blue-500/15 text-blue-400 border-blue-500/30'
                      }`}>
                        {row.type}
                      </span>
                    </td>
                    <td className="py-4 px-4 font-mono font-bold text-emerald-400 text-sm whitespace-nowrap">
                      {formatCurrency(row.amount)}
                    </td>
                    <td className="py-4 px-4 text-xs text-on-surface-variant max-w-xs truncate">
                      {row.description || '-'}
                    </td>
                    <td className="py-4 px-4 text-xs text-on-surface-variant whitespace-nowrap">
                      {formatDate(row.date)}
                    </td>
                    {canEdit && (
                      <td className="py-4 px-4 sm:px-6 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleEdit(row)}
                            className="px-3 py-1.5 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary font-bold text-xs flex items-center gap-1 transition-all"
                            title="Edit Transaksi"
                          >
                            <span className="material-symbols-outlined text-base">edit</span>
                            <span>Edit</span>
                          </button>
                          <button
                            onClick={() => handleDeleteClick(row)}
                            className="px-2.5 py-1.5 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 text-rose-400 border border-rose-500/30 text-xs font-bold transition-all flex items-center gap-1"
                            title="Hapus Transaksi"
                          >
                            <span className="material-symbols-outlined text-base">delete</span>
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ZiswafForm 
        isOpen={isFormOpen} 
        onClose={() => setIsFormOpen(false)} 
        onSubmit={handleSubmit}
        initialData={editingData}
      />

      <ConfirmDialog 
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={confirmDelete}
        title="Hapus Data ZISWAF"
        message={`Apakah Anda yakin ingin menghapus penerimaan dari "${dataToDelete?.donorName}"? Tindakan ini tidak dapat dibatalkan.`}
      />
    </div>
  );
}
