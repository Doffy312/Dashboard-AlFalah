import React, { useState, useMemo } from 'react';
import { useJemaahList, useJemaahSummary, useCreateJemaah, useUpdateJemaah, useDeleteJemaah } from '../hooks/useJemaah';
import { authClient } from '../lib/auth-client';
import DataTable from '../components/common/DataTable';
import SearchFilter from '../components/common/SearchFilter';
import StatusBadge from '../components/common/StatusBadge';
import JemaahForm from '../components/jemaah/JemaahForm';
import ConfirmDialog from '../components/common/ConfirmDialog';
import { Users, Heart, Coins, Edit2, Trash2 } from 'lucide-react';

const JemaahPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('Semua');

  const { data: jemaah = [], isLoading } = useJemaahList({ search: searchTerm, category: filterCategory === 'Semua' ? '' : filterCategory });
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
    return jemaah.filter(j => {
      const matchSearch = j.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          j.phone.includes(searchTerm);
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
      updateMutation.mutate({ id: editingJemaah.id, data });
    } else {
      createMutation.mutate(data);
    }
    setIsFormOpen(false);
  };

  const columns = [
    { header: 'ID', accessor: 'id', width: '10%' },
    { header: 'Nama Lengkap', accessor: 'name', width: '20%' },
    { header: 'No. HP/WA', accessor: 'phone', width: '15%' },
    { header: 'Kategori', cell: (row) => <StatusBadge type={row.category} text={row.category} />, width: '15%' },
    { header: 'Alamat', accessor: 'address', width: '25%' },
    ...(canEdit ? [{
      header: 'Aksi',
      cell: (row) => (
        <div className="flex gap-2">
          <button onClick={() => handleEdit(row)} className="p-1.5 rounded-lg hover:bg-surface-variant text-on-surface-variant transition-colors">
            <Edit2 size={16} />
          </button>
          <button onClick={() => handleDeleteClick(row)} className="p-1.5 rounded-lg hover:bg-rose-500/20 text-rose-500 transition-colors">
            <Trash2 size={16} />
          </button>
        </div>
      ),
      width: '15%'
    }] : [])
  ];

  return (
    <div className="flex flex-col gap-xl">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-display-sm font-display-sm text-on-surface dark:text-white m-0">Database Jemaah</h1>
          <p className="font-body-md text-on-surface-variant dark:text-white/70 m-0 mt-xs">Pengelolaan profil dan kategori jemaah Masjid Al-Falah.</p>
        </div>
        {canEdit && (
          <button 
            onClick={() => {
              setEditingJemaah(null);
              setIsFormOpen(true);
            }}
            className="hidden sm:flex py-2 px-4 rounded-full bg-primary text-on-primary font-label-md hover:bg-primary/90 transition-all shadow-md shadow-primary/20 active:scale-95 items-center gap-2"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            Tambah Data Jemaah
          </button>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-md">
        <div className="p-lg rounded-2xl bg-surface-variant border border-outline backdrop-blur-md flex flex-col gap-sm">
          <div className="w-12 h-12 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center">
            <Users size={24} />
          </div>
          <p className="font-label-md text-on-surface-variant dark:text-white/70 m-0">Total Jemaah</p>
          <h2 className="text-headline-lg font-headline-lg text-on-surface dark:text-white m-0">
            {summaries.total}
          </h2>
        </div>
        <div className="p-lg rounded-2xl bg-surface-variant border border-outline backdrop-blur-md flex flex-col gap-sm">
          <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
            <Coins size={24} />
          </div>
          <p className="font-label-md text-on-surface-variant dark:text-white/70 m-0">Muzakki (Donatur)</p>
          <h2 className="text-headline-lg font-headline-lg text-emerald-500 m-0">
            {summaries.Muzakki}
          </h2>
        </div>
        <div className="p-lg rounded-2xl bg-surface-variant border border-outline backdrop-blur-md flex flex-col gap-sm">
          <div className="w-12 h-12 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center">
            <Heart size={24} />
          </div>
          <p className="font-label-md text-on-surface-variant dark:text-white/70 m-0">Mustahik & Fakir</p>
          <h2 className="text-headline-lg font-headline-lg text-amber-500 m-0">
            {summaries.Mustahik + (summaries.Fakir || 0)}
          </h2>
        </div>
        <div className="p-lg rounded-2xl bg-surface-variant border border-outline backdrop-blur-md flex flex-col gap-sm">
          <div className="w-12 h-12 rounded-full bg-purple-500/10 text-purple-500 flex items-center justify-center">
            <Users size={24} />
          </div>
          <p className="font-label-md text-on-surface-variant dark:text-white/70 m-0">Yatim & Lansia</p>
          <h2 className="text-headline-lg font-headline-lg text-purple-500 m-0">
            {summaries.Yatim + summaries.Lansia}
          </h2>
        </div>
      </div>

      <div className="flex flex-col gap-md">
        
        <SearchFilter 
          placeholder="Cari nama atau nomor HP..."
          value={searchTerm}
          onChange={setSearchTerm}
          filters={[
            {
              key: 'category',
              value: filterCategory,
              options: [
                { label: 'Semua Kategori', value: 'Semua' },
                { label: 'Muzakki', value: 'Muzakki' },
                { label: 'Mustahik', value: 'Mustahik' },
                { label: 'Fakir', value: 'Fakir' },
                { label: 'Yatim', value: 'Yatim' },
                { label: 'Lansia', value: 'Lansia' },
                { label: 'Umum', value: 'Umum' }
              ]
            }
          ]}
          onFilterChange={(key, val) => {
            if (key === 'category') setFilterCategory(val);
          }}
        />

        <DataTable columns={columns} data={filteredJemaah} emptyMessage="Tidak ada data jemaah yang cocok dengan filter Anda." />
      </div>

      <JemaahForm 
        isOpen={isFormOpen} 
        onClose={() => setIsFormOpen(false)} 
        onSubmit={handleSubmit}
        initialData={editingJemaah}
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
};

export default JemaahPage;
