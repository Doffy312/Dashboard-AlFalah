import { useState, useMemo } from 'react';
import { 
  useZiswafList, 
  useCreateZiswaf, 
  useUpdateZiswaf, 
  useDeleteZiswaf,
  useVerifyZiswaf,
  useRejectZiswaf
} from '../hooks/useZiswaf';
import { authClient } from '../lib/auth-client';
import ZiswafForm from '../components/ziswaf/ZiswafForm';
import ConfirmDialog from '../components/common/ConfirmDialog';
import { formatCurrency } from '../lib/utils';
import { useSettings } from '../contexts/SettingsContext';

export default function ZiswafPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('Semua');
  const [filterStatus, setFilterStatus] = useState('Semua');

  const { data: ziswaf = [], isLoading, isError } = useZiswafList({});
  
  const createMutation = useCreateZiswaf();
  const updateMutation = useUpdateZiswaf();
  const deleteMutation = useDeleteZiswaf();
  const verifyMutation = useVerifyZiswaf();
  const rejectMutation = useRejectZiswaf();

  const { data: session } = authClient.useSession();
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingData, setEditingData] = useState(null);
  
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [dataToDelete, setDataToDelete] = useState(null);

  const [isVerifyOpen, setIsVerifyOpen] = useState(false);
  const [dataToVerify, setDataToVerify] = useState(null);

  const [isRejectOpen, setIsRejectOpen] = useState(false);
  const [dataToReject, setDataToReject] = useState(null);

  const isKetua = session?.user?.role === 'Ketua';
  const canAdd = ['Ketua', 'Bendahara'].includes(session?.user?.role);
  const canVerify = ['Ketua', 'Bendahara'].includes(session?.user?.role);

  const filteredData = useMemo(() => {
    return ziswaf.filter(item => {
      const matchSearch = item.donorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchType = filterType === 'Semua' || item.type === filterType;
      
      let matchStatus = true;
      const itemStatus = item.status || 'verified';
      if (filterStatus === 'Perlu Verifikasi') {
        matchStatus = itemStatus === 'pending';
      } else if (filterStatus === 'Terverifikasi') {
        matchStatus = itemStatus === 'verified';
      } else if (filterStatus === 'Ditolak') {
        matchStatus = itemStatus === 'rejected';
      }

      return matchSearch && matchType && matchStatus;
    });
  }, [ziswaf, searchTerm, filterType, filterStatus]);

  // Statistics: Pisahkan transaksi terverifikasi (riil kas) vs pending (perlu cek bank)
  const stats = useMemo(() => {
    const verifiedItems = ziswaf.filter(i => (i.status || 'verified') === 'verified');
    const pendingItems = ziswaf.filter(i => i.status === 'pending');
    const rejectedItems = ziswaf.filter(i => i.status === 'rejected');

    const totalVerifiedCount = verifiedItems.length;
    const totalVerifiedAmount = verifiedItems.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
    
    const pendingCount = pendingItems.length;
    const pendingAmount = pendingItems.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);

    const zakatAmount = verifiedItems
      .filter(i => i.type === 'Zakat Fitrah' || i.type === 'Zakat Mal')
      .reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
    const infaqAmount = verifiedItems
      .filter(i => i.type === 'Infaq' || i.type === 'Sedekah')
      .reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
    const wakafAmount = verifiedItems
      .filter(i => i.type === 'Wakaf')
      .reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);

    return { 
      totalVerifiedCount, 
      totalVerifiedAmount, 
      pendingCount, 
      pendingAmount, 
      rejectedCount: rejectedItems.length,
      zakatAmount, 
      infaqAmount, 
      wakafAmount 
    };
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

  const handleVerifyClick = (data) => {
    setDataToVerify(data);
    setIsVerifyOpen(true);
  };

  const confirmVerify = () => {
    if (dataToVerify) {
      verifyMutation.mutate(dataToVerify.id, {
        onSuccess: () => {
          setIsVerifyOpen(false);
          setDataToVerify(null);
        }
      });
    }
  };

  const handleRejectClick = (data) => {
    setDataToReject(data);
    setIsRejectOpen(true);
  };

  const confirmReject = () => {
    if (dataToReject) {
      rejectMutation.mutate({ 
        id: dataToReject.id, 
        reason: 'Dana tidak ditemukan pada mutasi rekening bank' 
      }, {
        onSuccess: () => {
          setIsRejectOpen(false);
          setDataToReject(null);
        }
      });
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
  const statusTabs = [
    { label: 'Semua', value: 'Semua', count: ziswaf.length },
    { label: 'Perlu Verifikasi', value: 'Perlu Verifikasi', count: stats.pendingCount, alert: stats.pendingCount > 0 },
    { label: 'Terverifikasi', value: 'Terverifikasi', count: stats.totalVerifiedCount },
    { label: 'Ditolak', value: 'Ditolak', count: stats.rejectedCount }
  ];

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
            Pengelolaan transaksi Zakat, Infaq, Sedekah, dan Wakaf dengan verifikasi mutasi rekening riil.
          </p>
        </div>
        {canAdd && (
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
        {/* Total Masuk Kas */}
        <div className="bg-surface border border-outline-variant rounded-2xl p-3.5 sm:p-5 flex flex-col justify-between shadow-sm">
          <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
            <div className="w-7 h-7 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-base sm:text-2xl">account_balance_wallet</span>
            </div>
            <div>
              <div className="text-xs sm:text-sm text-on-surface-variant font-medium leading-tight">Total Masuk Kas</div>
              <div className="text-[10px] text-emerald-400 font-semibold mt-0.5">Terverifikasi Mutasi</div>
            </div>
          </div>
          <div>
            <div className="text-sm sm:text-lg font-bold text-emerald-400">{formatCurrency(stats.totalVerifiedAmount)}</div>
            <div className="text-[11px] text-on-surface-variant mt-0.5">{stats.totalVerifiedCount} transaksi</div>
          </div>
        </div>

        {/* Perlu Verifikasi (Pending) */}
        <div className={`bg-surface border rounded-2xl p-3.5 sm:p-5 flex flex-col justify-between shadow-sm transition-all ${
          stats.pendingCount > 0 ? 'border-amber-500/60 bg-amber-500/5' : 'border-outline-variant'
        }`}>
          <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
            <div className={`w-7 h-7 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl flex items-center justify-center shrink-0 ${
              stats.pendingCount > 0 ? 'bg-amber-500/20 text-amber-300 animate-pulse' : 'bg-amber-500/10 text-amber-400'
            }`}>
              <span className="material-symbols-outlined text-base sm:text-2xl">pending_actions</span>
            </div>
            <div>
              <div className="text-xs sm:text-sm text-on-surface-variant font-medium leading-tight">Perlu Verifikasi</div>
              <div className="text-[10px] text-amber-400 font-semibold mt-0.5">Menunggu Cek Bank</div>
            </div>
          </div>
          <div>
            <div className="text-sm sm:text-lg font-bold text-amber-300">{formatCurrency(stats.pendingAmount)}</div>
            <div className="text-[11px] text-on-surface-variant mt-0.5">
              {stats.pendingCount > 0 ? (
                <span className="text-amber-400 font-bold">{stats.pendingCount} donasi belum masuk kas</span>
              ) : (
                'Semua sudah diverifikasi'
              )}
            </div>
          </div>
        </div>

        {/* Total Zakat */}
        <div className="bg-surface border border-outline-variant rounded-2xl p-3.5 sm:p-5 flex flex-col justify-between shadow-sm">
          <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
            <div className="w-7 h-7 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-blue-500/15 text-blue-400 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-base sm:text-2xl">payments</span>
            </div>
            <div className="text-xs sm:text-sm text-on-surface-variant font-medium leading-tight">Zakat (Fitrah &amp; Mal)</div>
          </div>
          <div>
            <div className="text-sm sm:text-lg font-bold text-blue-400">{formatCurrency(stats.zakatAmount)}</div>
            <div className="text-[11px] text-on-surface-variant mt-0.5">Saldo riil di kas</div>
          </div>
        </div>

        {/* Infaq, Sedekah & Wakaf */}
        <div className="bg-surface border border-outline-variant rounded-2xl p-3.5 sm:p-5 flex flex-col justify-between shadow-sm">
          <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
            <div className="w-7 h-7 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-teal-500/15 text-teal-400 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-base sm:text-2xl">favorite</span>
            </div>
            <div className="text-xs sm:text-sm text-on-surface-variant font-medium leading-tight">Infaq &amp; Wakaf</div>
          </div>
          <div>
            <div className="text-sm sm:text-lg font-bold text-teal-300">{formatCurrency(stats.infaqAmount + stats.wakafAmount)}</div>
            <div className="text-[11px] text-on-surface-variant mt-0.5">Infaq {formatCurrency(stats.infaqAmount)}</div>
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
            <p className="text-xs font-bold text-primary uppercase tracking-wider">Rekening Resmi &amp; Merchant QRIS Donasi</p>
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
      <div className="bg-surface border border-outline-variant rounded-2xl p-4 space-y-4">
        
        {/* Status Filter Tabs (Internal Control Two-Step Verification) */}
        <div className="flex flex-wrap items-center gap-2 border-b border-outline-variant/60 pb-3">
          <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mr-1">Status Verifikasi:</span>
          {statusTabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setFilterStatus(tab.value)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                filterStatus === tab.value
                  ? 'bg-primary text-slate-950 shadow-md'
                  : 'bg-surface-variant/40 text-on-surface-variant hover:text-on-surface hover:bg-surface-variant'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                filterStatus === tab.value
                  ? 'bg-slate-950 text-primary'
                  : tab.alert
                  ? 'bg-amber-500 text-slate-950 font-extrabold'
                  : 'bg-surface-variant text-on-surface-variant'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search & Type Filters */}
        <div className="space-y-3 sm:space-y-0 sm:flex sm:items-center sm:justify-between gap-4">
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
              {searchTerm || filterType !== 'Semua' || filterStatus !== 'Semua'
                ? 'Coba sesuaikan kata kunci pencarian atau filter status/jenis donasi Anda.' 
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
                  <th className="py-3.5 px-4">Status Kas</th>
                  <th className="py-3.5 px-4">Keterangan</th>
                  <th className="py-3.5 px-4">Tanggal Transaksi</th>
                  {(canVerify || isKetua) && <th className="py-3.5 px-4 sm:px-6 text-right">Aksi</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/60 text-xs sm:text-sm">
                {filteredData.map((row) => {
                  const status = row.status || 'verified';
                  return (
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
                      <td className="py-4 px-4 whitespace-nowrap">
                        {status === 'pending' ? (
                          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold inline-flex items-center gap-1.5 bg-amber-500/15 text-amber-300 border border-amber-500/40 animate-pulse">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                            Perlu Verifikasi
                          </span>
                        ) : status === 'rejected' ? (
                          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold inline-flex items-center gap-1.5 bg-rose-500/15 text-rose-300 border border-rose-500/40">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                            Ditolak (Fiktif)
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold inline-flex items-center gap-1.5 bg-emerald-500/15 text-emerald-300 border border-emerald-500/40">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                            Terverifikasi Kas
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-4 text-xs text-on-surface-variant max-w-xs truncate">
                        {row.description || '-'}
                      </td>
                      <td className="py-4 px-4 text-xs text-on-surface-variant whitespace-nowrap">
                        {formatDate(row.date)}
                      </td>
                      {(canVerify || isKetua) && (
                        <td className="py-4 px-4 sm:px-6 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            
                            {/* Two-Step Verification: Tombol Ceklist (✓) dan Silang (✗) untuk status pending */}
                            {status === 'pending' && canVerify && (
                              <>
                                <button
                                  onClick={() => handleVerifyClick(row)}
                                  disabled={verifyMutation.isPending}
                                  className="px-2.5 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500 text-emerald-300 hover:text-slate-950 font-extrabold text-xs flex items-center gap-1 border border-emerald-500/40 transition-all shadow-sm active:scale-95"
                                  title="Verifikasi Mutasi Rekening & Masukkan ke Kas"
                                >
                                  <span className="material-symbols-outlined text-base font-black">check</span>
                                  <span className="hidden sm:inline">Verifikasi</span>
                                </button>
                                <button
                                  onClick={() => handleRejectClick(row)}
                                  disabled={rejectMutation.isPending}
                                  className="px-2.5 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500 text-rose-300 hover:text-white font-extrabold text-xs flex items-center gap-1 border border-rose-500/40 transition-all shadow-sm active:scale-95"
                                  title="Tolak Transaksi (Fiktif / Dana Tidak Ditemukan)"
                                >
                                  <span className="material-symbols-outlined text-base font-black">close</span>
                                  <span className="hidden sm:inline">Tolak</span>
                                </button>
                              </>
                            )}

                            {/* Tombol Edit & Hapus khusus Ketua */}
                            {isKetua && (
                              <>
                                <button
                                  onClick={() => handleEdit(row)}
                                  className="px-2.5 py-1.5 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary font-bold text-xs flex items-center gap-1 transition-all"
                                  title="Edit Transaksi"
                                >
                                  <span className="material-symbols-outlined text-base">edit</span>
                                </button>
                                <button
                                  onClick={() => handleDeleteClick(row)}
                                  className="px-2 py-1.5 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 text-rose-400 border border-rose-500/30 text-xs font-bold transition-all flex items-center gap-1"
                                  title="Hapus Transaksi"
                                >
                                  <span className="material-symbols-outlined text-base">delete</span>
                                </button>
                              </>
                            )}

                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })}
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

      {/* Dialog Verifikasi (Ceklist ✓) */}
      <ConfirmDialog 
        isOpen={isVerifyOpen}
        onClose={() => setIsVerifyOpen(false)}
        onConfirm={confirmVerify}
        title="Verifikasi Donasi Masuk ke Kas"
        message={
          `Pastikan dana donasi sebesar ${formatCurrency(dataToVerify?.amount || 0)} dari "${dataToVerify?.donorName}" telah benar-benar masuk pada mutasi rekening bank (${bankInfo.bankName}). Setelah diverifikasi, transaksi ini akan otomatis dibukukan resmi ke Kas Keuangan Utama sebagai Pemasukan. Lanjutkan verifikasi?`
        }
      />

      {/* Dialog Tolak (Silang ✗) */}
      <ConfirmDialog 
        isOpen={isRejectOpen}
        onClose={() => setIsRejectOpen(false)}
        onConfirm={confirmReject}
        title="Tolak Transaksi Donasi (Fiktif)"
        message={
          `Apakah Anda yakin ingin menolak transaksi dari "${dataToReject?.donorName}" sebesar ${formatCurrency(dataToReject?.amount || 0)}? Transaksi ini terindikasi fiktif / dana tidak ditemukan di mutasi rekening bank, dan TIDAK AKAN PERNAH dimasukkan ke Buku Kas Keuangan.`
        }
      />

      {/* Dialog Hapus Permanen */}
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
