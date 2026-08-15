import { useState, useMemo } from 'react';
import { useJadwalList, useCreateJadwal, useUpdateJadwal, useDeleteJadwal } from '../hooks/useJadwal';
import { authClient } from '../lib/auth-client';
import JadwalForm from '../components/jadwal/JadwalForm';
import ConfirmDialog from '../components/common/ConfirmDialog';

export default function JadwalPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('Semua');

  const { data: jadwal = [], isLoading, isError } = useJadwalList({});
  
  const createMutation = useCreateJadwal();
  const updateMutation = useUpdateJadwal();
  const deleteMutation = useDeleteJadwal();

  const { data: session } = authClient.useSession();
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingData, setEditingData] = useState(null);
  
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [dataToDelete, setDataToDelete] = useState(null);

  const canEdit = ['Ketua', 'Sekretaris'].includes(session?.user?.role);

  const filteredData = useMemo(() => {
    return jadwal.filter(item => {
      const matchSearch = item.personName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (item.topic && item.topic.toLowerCase().includes(searchTerm.toLowerCase())) ||
                          (item.contact && item.contact.includes(searchTerm));
      const matchRole = filterRole === 'Semua' || item.role === filterRole;
      return matchSearch && matchRole;
    });
  }, [jadwal, searchTerm, filterRole]);

  // Statistics
  const stats = useMemo(() => {
    const total = jadwal.length;
    const khotib = jadwal.filter(j => j.role === 'Khotib Jumat').length;
    const imam = jadwal.filter(j => j.role === 'Imam Rawatib').length;
    const lainnya = jadwal.filter(j => j.role === 'Muadzin' || j.role === 'Penceramah Kajian').length;
    return { total, khotib, imam, lainnya };
  }, [jadwal]);

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
      updateMutation.mutate({ id: editingData.id, data });
    } else {
      createMutation.mutate(data);
    }
    setIsFormOpen(false);
  };

  const roles = ['Semua', 'Khotib Jumat', 'Imam Rawatib', 'Muadzin', 'Penceramah Kajian'];

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
            <span className="material-symbols-outlined text-primary text-3xl">calendar_month</span>
            Jadwal Petugas
          </h1>
          <p className="text-xs sm:text-sm text-on-surface-variant mt-1">
            Pengelolaan jadwal Khotib, Imam, Muadzin, dan Penceramah Kajian.
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
            Tambah Jadwal
          </button>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-surface border border-outline-variant rounded-2xl p-3.5 sm:p-5 flex flex-col justify-between shadow-sm">
          <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
            <div className="w-7 h-7 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-base sm:text-2xl">event_note</span>
            </div>
            <div className="text-xs sm:text-sm text-on-surface-variant font-medium leading-tight">Total Jadwal</div>
          </div>
          <div>
            <div className="text-lg sm:text-2xl font-bold text-on-surface">{stats.total}</div>
          </div>
        </div>

        <div className="bg-surface border border-outline-variant rounded-2xl p-3.5 sm:p-5 flex flex-col justify-between shadow-sm">
          <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
            <div className="w-7 h-7 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-base sm:text-2xl">record_voice_over</span>
            </div>
            <div className="text-xs sm:text-sm text-on-surface-variant font-medium leading-tight">Khotib Jumat</div>
          </div>
          <div>
            <div className="text-lg sm:text-2xl font-bold text-amber-400">{stats.khotib}</div>
          </div>
        </div>

        <div className="bg-surface border border-outline-variant rounded-2xl p-3.5 sm:p-5 flex flex-col justify-between shadow-sm">
          <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
            <div className="w-7 h-7 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-blue-500/15 text-blue-400 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-base sm:text-2xl">person</span>
            </div>
            <div className="text-xs sm:text-sm text-on-surface-variant font-medium leading-tight">Imam Rawatib</div>
          </div>
          <div>
            <div className="text-lg sm:text-2xl font-bold text-blue-400">{stats.imam}</div>
          </div>
        </div>

        <div className="bg-surface border border-outline-variant rounded-2xl p-3.5 sm:p-5 flex flex-col justify-between shadow-sm">
          <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
            <div className="w-7 h-7 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-base sm:text-2xl">mic</span>
            </div>
            <div className="text-xs sm:text-sm text-on-surface-variant font-medium leading-tight">Muadzin &amp; Penceramah</div>
          </div>
          <div>
            <div className="text-lg sm:text-2xl font-bold text-emerald-400">{stats.lainnya}</div>
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
            placeholder="Cari nama petugas, topik, atau kontak..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-surface-variant/50 border border-outline-variant rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-on-surface placeholder:text-on-surface-variant outline-none focus:border-primary transition-all"
          />
        </div>

        {/* Role Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 bg-surface-variant/40 p-1 rounded-xl border border-outline-variant/40 shrink-0">
          {roles.map((role) => (
            <button
              key={role}
              onClick={() => setFilterRole(role)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                filterRole === role
                  ? 'bg-primary text-slate-950 shadow-md font-bold'
                  : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-variant/80'
              }`}
            >
              {role}
            </button>
          ))}
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-surface border border-outline-variant rounded-2xl overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="p-8 text-center space-y-3">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-on-surface-variant">Memuat data jadwal petugas...</p>
          </div>
        ) : isError ? (
          <div className="p-8 text-center text-error space-y-2">
            <span className="material-symbols-outlined text-3xl">error</span>
            <p className="text-sm font-semibold">Gagal memuat data jadwal.</p>
          </div>
        ) : filteredData.length === 0 ? (
          <div className="p-12 text-center text-on-surface-variant space-y-3">
            <span className="material-symbols-outlined text-4xl text-on-surface-variant/50">event_busy</span>
            <p className="text-sm font-semibold text-on-surface">Tidak ada data jadwal ditemukan</p>
            <p className="text-xs max-w-sm mx-auto">
              {searchTerm || filterRole !== 'Semua'
                ? 'Coba sesuaikan kata kunci pencarian atau filter peran Anda.' 
                : 'Belum ada data jadwal petugas yang terdaftar.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-outline-variant bg-surface-variant/30 text-[11px] uppercase tracking-wider text-on-surface-variant font-bold">
                  <th className="py-3.5 px-4 sm:px-6">Petugas</th>
                  <th className="py-3.5 px-4">Peran</th>
                  <th className="py-3.5 px-4">Tema / Topik</th>
                  <th className="py-3.5 px-4">Kontak</th>
                  <th className="py-3.5 px-4">Tanggal</th>
                  {canEdit && <th className="py-3.5 px-4 sm:px-6 text-right">Aksi</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/60 text-xs sm:text-sm">
                {filteredData.map((row) => (
                  <tr key={row.id} className="hover:bg-surface-variant/40 transition-colors">
                    <td className="py-4 px-4 sm:px-6 font-bold text-on-surface">
                      {row.personName}
                    </td>
                    <td className="py-4 px-4 whitespace-nowrap">
                      <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold inline-flex items-center gap-1 border ${
                        row.role === 'Khotib Jumat' 
                          ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                          : row.role === 'Imam Rawatib'
                          ? 'bg-blue-500/15 text-blue-400 border-blue-500/30'
                          : row.role === 'Muadzin'
                          ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                          : 'bg-purple-500/15 text-purple-400 border-purple-500/30'
                      }`}>
                        {row.role}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-xs text-on-surface-variant max-w-xs truncate">
                      {row.topic || '-'}
                    </td>
                    <td className="py-4 px-4 text-xs font-mono text-emerald-400">
                      {row.contact || '-'}
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
                            title="Edit Jadwal"
                          >
                            <span className="material-symbols-outlined text-base">edit</span>
                            <span>Edit</span>
                          </button>
                          <button
                            onClick={() => handleDeleteClick(row)}
                            className="px-2.5 py-1.5 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 text-rose-400 border border-rose-500/30 text-xs font-bold transition-all flex items-center gap-1"
                            title="Hapus Jadwal"
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

      <JadwalForm 
        isOpen={isFormOpen} 
        onClose={() => setIsFormOpen(false)} 
        onSubmit={handleSubmit}
        initialData={editingData}
      />

      <ConfirmDialog 
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={confirmDelete}
        title="Hapus Data Jadwal"
        message={`Yakin hapus jadwal untuk "${dataToDelete?.personName}"?`}
      />
    </div>
  );
}
