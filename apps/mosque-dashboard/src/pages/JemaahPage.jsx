import { useState, useMemo } from 'react';
import { useJemaahList, useJemaahSummary, useCreateJemaah, useUpdateJemaah, useDeleteJemaah } from '../hooks/useJemaah';
import { authClient } from '../lib/auth-client';
import JemaahForm from '../components/jemaah/JemaahForm';
import ConfirmDialog from '../components/common/ConfirmDialog';

export default function JemaahPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('Semua');

  const { data: jemaah = [], isLoading, isError } = useJemaahList({ 
    search: searchTerm, 
    category: filterCategory === 'Semua' ? '' : filterCategory 
  });
  const { data: summaries = { total: 0, Muzakki: 0, Mustahik: 0, Yatim: 0, Lansia: 0, Umum: 0, Fakir: 0 } } = useJemaahSummary();
  
  const createMutation = useCreateJemaah();
  const updateMutation = useUpdateJemaah();
  const deleteMutation = useDeleteJemaah();

  const { data: session } = authClient.useSession();
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingJemaah, setEditingJemaah] = useState(null);
  
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [jemaahToDelete, setJemaahToDelete] = useState(null);

  const canEdit = ['Ketua', 'Sekretaris'].includes(session?.user?.role);

  const filteredJemaah = useMemo(() => {
    if (!Array.isArray(jemaah)) return [];
    return jemaah.filter(j => {
      if (!j) return false;
      const nameStr = (j.name || '').toLowerCase();
      const phoneStr = j.phone || '';
      const addressStr = (j.address || '').toLowerCase();
      const searchStr = searchTerm.toLowerCase();
      const matchSearch = nameStr.includes(searchStr) || phoneStr.includes(searchTerm) || addressStr.includes(searchStr);
      const matchCategory = filterCategory === 'Semua' || j.category === filterCategory;
      return matchSearch && matchCategory;
    });
  }, [jemaah, searchTerm, filterCategory]);

  const handleEdit = (data) => {
    setEditingJemaah(data);
    setIsFormOpen(true);
  };

  const handleDeleteClick = (data) => {
    setJemaahToDelete(data);
    setIsDeleteOpen(true);
  };

  const confirmDelete = () => {
    if (jemaahToDelete) {
      deleteMutation.mutate(jemaahToDelete.id);
      setJemaahToDelete(null);
      setIsDeleteOpen(false);
    }
  };

  const handleSubmit = (data) => {
    if (editingJemaah) {
      updateMutation.mutate(
        { id: editingJemaah.id, data },
        { onSuccess: () => setIsFormOpen(false) }
      );
    } else {
      createMutation.mutate(data, {
        onSuccess: () => setIsFormOpen(false),
      });
    }
  };

  const categories = ['Semua', 'Muzakki', 'Mustahik', 'Fakir', 'Yatim', 'Lansia', 'Umum'];

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-on-surface flex items-center gap-2.5">
            <span className="material-symbols-outlined text-primary text-3xl">groups</span>
            Database Jemaah
          </h1>
          <p className="text-xs sm:text-sm text-on-surface-variant mt-1">
            Pengelolaan profil, kategori, dan pendataan jemaah Masjid Al-Falah.
          </p>
        </div>
        {canEdit && (
          <button 
            onClick={() => {
              setEditingJemaah(null);
              setIsFormOpen(true);
            }}
            className="px-4 py-2.5 rounded-xl bg-primary text-slate-950 font-bold text-xs sm:text-sm hover:bg-primary/90 transition-all shadow-md shadow-primary/20 flex items-center gap-2 shrink-0 self-start sm:self-auto"
          >
            <span className="material-symbols-outlined text-xl">add</span>
            Tambah Data Jemaah
          </button>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-surface border border-outline-variant rounded-2xl p-3.5 sm:p-5 flex flex-col justify-between shadow-sm">
          <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
            <div className="w-7 h-7 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-base sm:text-2xl">groups</span>
            </div>
            <div className="text-xs sm:text-sm text-on-surface-variant font-medium leading-tight">Total Jemaah</div>
          </div>
          <div>
            <div className="text-lg sm:text-2xl font-bold text-on-surface">{summaries.total}</div>
          </div>
        </div>

        <div className="bg-surface border border-outline-variant rounded-2xl p-3.5 sm:p-5 flex flex-col justify-between shadow-sm">
          <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
            <div className="w-7 h-7 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-base sm:text-2xl">payments</span>
            </div>
            <div className="text-xs sm:text-sm text-on-surface-variant font-medium leading-tight">Muzakki (Donatur)</div>
          </div>
          <div>
            <div className="text-lg sm:text-2xl font-bold text-emerald-400">{summaries.Muzakki}</div>
          </div>
        </div>

        <div className="bg-surface border border-outline-variant rounded-2xl p-3.5 sm:p-5 flex flex-col justify-between shadow-sm">
          <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
            <div className="w-7 h-7 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-base sm:text-2xl">favorite</span>
            </div>
            <div className="text-xs sm:text-sm text-on-surface-variant font-medium leading-tight">Mustahik &amp; Fakir</div>
          </div>
          <div>
            <div className="text-lg sm:text-2xl font-bold text-amber-400">{summaries.Mustahik + (summaries.Fakir || 0)}</div>
          </div>
        </div>

        <div className="bg-surface border border-outline-variant rounded-2xl p-3.5 sm:p-5 flex flex-col justify-between shadow-sm">
          <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
            <div className="w-7 h-7 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-purple-500/15 text-purple-400 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-base sm:text-2xl">child_care</span>
            </div>
            <div className="text-xs sm:text-sm text-on-surface-variant font-medium leading-tight">Yatim &amp; Lansia</div>
          </div>
          <div>
            <div className="text-lg sm:text-2xl font-bold text-purple-400">{summaries.Yatim + summaries.Lansia}</div>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-surface border border-outline-variant rounded-2xl p-4 space-y-3 sm:space-y-0 sm:flex sm:items-center sm:justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-xl">search</span>
          <input
            type="text"
            placeholder="Cari nama, nomor HP, atau alamat..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-surface-variant/50 border border-outline-variant rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-on-surface placeholder:text-on-surface-variant outline-none focus:border-primary transition-all"
          />
        </div>

        {/* Status Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 bg-surface-variant/40 p-1 rounded-xl border border-outline-variant/40 shrink-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                filterCategory === cat
                  ? 'bg-primary text-slate-950 shadow-md font-bold'
                  : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-variant/80'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-surface border border-outline-variant rounded-2xl overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="p-8 text-center space-y-3">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-on-surface-variant">Memuat data jemaah...</p>
          </div>
        ) : isError ? (
          <div className="p-8 text-center text-error space-y-2">
            <span className="material-symbols-outlined text-3xl">error</span>
            <p className="text-sm font-semibold">Gagal memuat data jemaah.</p>
          </div>
        ) : filteredJemaah.length === 0 ? (
          <div className="p-12 text-center text-on-surface-variant space-y-3">
            <span className="material-symbols-outlined text-4xl text-on-surface-variant/50">person_search</span>
            <p className="text-sm font-semibold text-on-surface">Tidak ada data jemaah ditemukan</p>
            <p className="text-xs max-w-sm mx-auto">
              {searchTerm || filterCategory !== 'Semua' 
                ? 'Coba sesuaikan kata kunci pencarian atau filter kategori Anda.' 
                : 'Belum ada data jemaah yang terdaftar.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-outline-variant bg-surface-variant/30 text-[11px] uppercase tracking-wider text-on-surface-variant font-bold">
                  <th className="py-3.5 px-4 sm:px-6">Nama Lengkap</th>
                  <th className="py-3.5 px-4">No. HP / WhatsApp</th>
                  <th className="py-3.5 px-4">Kategori</th>
                  <th className="py-3.5 px-4">Alamat</th>
                  {canEdit && <th className="py-3.5 px-4 sm:px-6 text-right">Aksi</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/60 text-xs sm:text-sm">
                {filteredJemaah.map((row) => (
                  <tr key={row.id} className="hover:bg-surface-variant/40 transition-colors">
                    <td className="py-4 px-4 sm:px-6 font-bold text-on-surface">
                      {row.name}
                    </td>
                    <td className="py-4 px-4 text-xs font-mono text-emerald-400">
                      {row.phone || '-'}
                    </td>
                    <td className="py-4 px-4 whitespace-nowrap">
                      <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold inline-flex items-center gap-1 border ${
                        row.category === 'Muzakki' 
                          ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                          : row.category === 'Mustahik' || row.category === 'Fakir'
                          ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                          : row.category === 'Yatim' || row.category === 'Lansia'
                          ? 'bg-purple-500/15 text-purple-400 border-purple-500/30'
                          : 'bg-blue-500/15 text-blue-400 border-blue-500/30'
                      }`}>
                        {row.category}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-xs text-on-surface-variant max-w-xs truncate">
                      {row.address || '-'}
                    </td>
                    {canEdit && (
                      <td className="py-4 px-4 sm:px-6 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleEdit(row)}
                            className="px-3 py-1.5 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary font-bold text-xs flex items-center gap-1 transition-all"
                            title="Edit Data"
                          >
                            <span className="material-symbols-outlined text-base">edit</span>
                            <span>Edit</span>
                          </button>
                          <button
                            onClick={() => handleDeleteClick(row)}
                            className="px-2.5 py-1.5 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 text-rose-400 border border-rose-500/30 text-xs font-bold transition-all flex items-center gap-1"
                            title="Hapus Data"
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

      <JemaahForm 
        isOpen={isFormOpen} 
        onClose={() => setIsFormOpen(false)} 
        onSubmit={handleSubmit}
        initialData={editingJemaah}
        isPending={createMutation.isPending || updateMutation.isPending}
      />

      <ConfirmDialog 
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={confirmDelete}
        title="Hapus Data Jemaah"
        message={`Apakah Anda yakin ingin menghapus data "${jemaahToDelete?.name}"? Tindakan ini tidak dapat dibatalkan.`}
      />
    </div>
  );
}
