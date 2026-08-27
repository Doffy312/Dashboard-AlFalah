import { useState, useMemo } from 'react';
import { useInventarisList, useInventarisSummary, useCreateInventaris, useUpdateInventaris, useDeleteInventaris } from '../hooks/useInventaris';
import { authClient } from '../lib/auth-client';
import InventarisForm from '../components/inventaris/InventarisForm';
import ConfirmDialog from '../components/common/ConfirmDialog';

export default function InventarisPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCondition, setFilterCondition] = useState('Semua');
  const [filterLocation, setFilterLocation] = useState('Semua');

  const { data: inventaris = [], isLoading, isError } = useInventarisList({ 
    search: searchTerm, 
    condition: filterCondition === 'Semua' ? '' : filterCondition, 
    location: filterLocation === 'Semua' ? '' : filterLocation 
  });
  const { data: summaries = { total: 0, Baik: 0, 'Rusak Ringan': 0, 'Rusak Berat': 0 } } = useInventarisSummary();
  
  const createMutation = useCreateInventaris();
  const updateMutation = useUpdateInventaris();
  const deleteMutation = useDeleteInventaris();

  const { data: session } = authClient.useSession();
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingInventaris, setEditingInventaris] = useState(null);
  
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [inventarisToDelete, setInventarisToDelete] = useState(null);

  const isKetua = session?.user?.role === 'Ketua';
  const canAdd = ['Ketua', 'Sekretaris', 'Bendahara'].includes(session?.user?.role);

  const filteredInventaris = useMemo(() => {
    return inventaris.filter(i => {
      const matchSearch = i.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (i.location && i.location.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchCondition = filterCondition === 'Semua' || i.condition === filterCondition;
      const matchLocation = filterLocation === 'Semua' || i.location === filterLocation;
      return matchSearch && matchCondition && matchLocation;
    });
  }, [inventaris, searchTerm, filterCondition, filterLocation]);

  const handleEdit = (data) => {
    setEditingInventaris(data);
    setIsFormOpen(true);
  };

  const handleDeleteClick = (data) => {
    setInventarisToDelete(data);
    setIsDeleteOpen(true);
  };

  const confirmDelete = () => {
    if (inventarisToDelete) {
      deleteMutation.mutate(inventarisToDelete.id);
      setInventarisToDelete(null);
      setIsDeleteOpen(false);
    }
  };

  const handleSubmit = (data) => {
    if (editingInventaris) {
      updateMutation.mutate({ id: editingInventaris.id, data });
    } else {
      createMutation.mutate(data);
    }
    setIsFormOpen(false);
  };

  const conditions = ['Semua', 'Baik', 'Rusak Ringan', 'Rusak Berat'];
  const locations = ['Semua', 'Ruang Utama', 'Selaser', 'Tempat Wudu', 'Gudang', 'Halaman', 'Lainnya'];

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
            <span className="material-symbols-outlined text-primary text-3xl">inventory_2</span>
            Inventaris Masjid
          </h1>
          <p className="text-xs sm:text-sm text-on-surface-variant mt-1">
            Pendataan, pengelolaan, dan pemantauan kondisi aset inventaris.
          </p>
        </div>
        {canAdd && (
          <button 
            onClick={() => {
              setEditingInventaris(null);
              setIsFormOpen(true);
            }}
            className="px-4 py-2.5 rounded-xl bg-primary text-slate-950 font-bold text-xs sm:text-sm hover:bg-primary/90 transition-all shadow-md shadow-primary/20 flex items-center gap-2 shrink-0 self-start sm:self-auto"
          >
            <span className="material-symbols-outlined text-xl">add</span>
            Tambah Barang
          </button>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-surface border border-outline-variant rounded-2xl p-3.5 sm:p-5 flex flex-col justify-between shadow-sm">
          <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
            <div className="w-7 h-7 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-base sm:text-2xl">inventory</span>
            </div>
            <div className="text-xs sm:text-sm text-on-surface-variant font-medium leading-tight">Total Item</div>
          </div>
          <div>
            <div className="text-lg sm:text-2xl font-bold text-on-surface">{summaries.total}</div>
          </div>
        </div>

        <div className="bg-surface border border-outline-variant rounded-2xl p-3.5 sm:p-5 flex flex-col justify-between shadow-sm">
          <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
            <div className="w-7 h-7 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-base sm:text-2xl">check_circle</span>
            </div>
            <div className="text-xs sm:text-sm text-on-surface-variant font-medium leading-tight">Kondisi Baik</div>
          </div>
          <div>
            <div className="text-lg sm:text-2xl font-bold text-emerald-400">{summaries['Baik']}</div>
          </div>
        </div>

        <div className="bg-surface border border-outline-variant rounded-2xl p-3.5 sm:p-5 flex flex-col justify-between shadow-sm">
          <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
            <div className="w-7 h-7 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-base sm:text-2xl">warning</span>
            </div>
            <div className="text-xs sm:text-sm text-on-surface-variant font-medium leading-tight">Rusak Ringan</div>
          </div>
          <div>
            <div className="text-lg sm:text-2xl font-bold text-amber-400">{summaries['Rusak Ringan']}</div>
          </div>
        </div>

        <div className="bg-surface border border-outline-variant rounded-2xl p-3.5 sm:p-5 flex flex-col justify-between shadow-sm">
          <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
            <div className="w-7 h-7 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-rose-500/15 text-rose-400 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-base sm:text-2xl">report</span>
            </div>
            <div className="text-xs sm:text-sm text-on-surface-variant font-medium leading-tight">Rusak Berat</div>
          </div>
          <div>
            <div className="text-lg sm:text-2xl font-bold text-rose-400">{summaries['Rusak Berat']}</div>
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
            placeholder="Cari nama barang, lokasi..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-surface-variant/50 border border-outline-variant rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-on-surface placeholder:text-on-surface-variant outline-none focus:border-primary transition-all"
          />
        </div>

        {/* Condition Filter Tabs & Location Dropdown */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <div className="flex flex-wrap items-center gap-1.5 bg-surface-variant/40 p-1 rounded-xl border border-outline-variant/40">
            {conditions.map((cond) => (
              <button
                key={cond}
                onClick={() => setFilterCondition(cond)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  filterCondition === cond
                    ? 'bg-primary text-slate-950 shadow-md font-bold'
                    : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-variant/80'
                }`}
              >
                {cond}
              </button>
            ))}
          </div>

          <select
            value={filterLocation}
            onChange={(e) => setFilterLocation(e.target.value)}
            className="bg-surface-variant/50 border border-outline-variant rounded-xl px-3 py-2 text-xs font-semibold text-on-surface outline-none focus:border-primary cursor-pointer"
          >
            {locations.map((loc) => (
              <option key={loc} value={loc} className="bg-surface text-on-surface">
                {loc === 'Semua' ? 'Semua Lokasi' : loc}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-surface border border-outline-variant rounded-2xl overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="p-8 text-center space-y-3">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-on-surface-variant">Memuat data inventaris...</p>
          </div>
        ) : isError ? (
          <div className="p-8 text-center text-error space-y-2">
            <span className="material-symbols-outlined text-3xl">error</span>
            <p className="text-sm font-semibold">Gagal memuat data inventaris.</p>
          </div>
        ) : filteredInventaris.length === 0 ? (
          <div className="p-12 text-center text-on-surface-variant space-y-3">
            <span className="material-symbols-outlined text-4xl text-on-surface-variant/50">inventory_2</span>
            <p className="text-sm font-semibold text-on-surface">Tidak ada data barang ditemukan</p>
            <p className="text-xs max-w-sm mx-auto">
              {searchTerm || filterCondition !== 'Semua' || filterLocation !== 'Semua'
                ? 'Coba sesuaikan kata kunci pencarian atau filter Anda.' 
                : 'Belum ada data barang inventaris yang terdaftar.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-outline-variant bg-surface-variant/30 text-[11px] uppercase tracking-wider text-on-surface-variant font-bold">
                  <th className="py-3.5 px-4 sm:px-6">Nama Barang</th>
                  <th className="py-3.5 px-4">Jumlah</th>
                  <th className="py-3.5 px-4">Kondisi</th>
                  <th className="py-3.5 px-4">Lokasi</th>
                  <th className="py-3.5 px-4">Tanggal Input</th>
                  {isKetua && <th className="py-3.5 px-4 sm:px-6 text-right">Aksi</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/60 text-xs sm:text-sm">
                {filteredInventaris.map((row) => (
                  <tr key={row.id} className="hover:bg-surface-variant/40 transition-colors">
                    <td className="py-4 px-4 sm:px-6 font-bold text-on-surface">
                      {row.name}
                    </td>
                    <td className="py-4 px-4 font-mono font-bold text-primary">
                      {row.quantity}
                    </td>
                    <td className="py-4 px-4 whitespace-nowrap">
                      <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold inline-flex items-center gap-1 border ${
                        row.condition === 'Baik' 
                          ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                          : row.condition === 'Rusak Ringan'
                          ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                          : 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                      }`}>
                        {row.condition}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-xs text-on-surface-variant">
                      {row.location || '-'}
                    </td>
                    <td className="py-4 px-4 text-xs text-on-surface-variant whitespace-nowrap">
                      {formatDate(row.date)}
                    </td>
                    {isKetua && (
                      <td className="py-4 px-4 sm:px-6 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleEdit(row)}
                            className="px-3 py-1.5 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary font-bold text-xs flex items-center gap-1 transition-all"
                            title="Edit Barang"
                          >
                            <span className="material-symbols-outlined text-base">edit</span>
                            <span>Edit</span>
                          </button>
                          <button
                            onClick={() => handleDeleteClick(row)}
                            className="px-2.5 py-1.5 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 text-rose-400 border border-rose-500/30 text-xs font-bold transition-all flex items-center gap-1"
                            title="Hapus Barang"
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

      <InventarisForm 
        isOpen={isFormOpen} 
        onClose={() => setIsFormOpen(false)} 
        onSubmit={handleSubmit}
        initialData={editingInventaris}
      />

      <ConfirmDialog 
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={confirmDelete}
        title="Hapus Inventaris"
        message={`Apakah Anda yakin ingin menghapus "${inventarisToDelete?.name}"? Tindakan ini tidak dapat dibatalkan.`}
      />
    </div>
  );
}
