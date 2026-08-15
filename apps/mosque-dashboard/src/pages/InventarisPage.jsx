import { useState, useMemo } from 'react';
import { useInventarisList, useInventarisSummary, useCreateInventaris, useUpdateInventaris, useDeleteInventaris } from '../hooks/useInventaris';
import { authClient } from '../lib/auth-client';
import DataTable from '../components/common/DataTable';
import SearchFilter from '../components/common/SearchFilter';
import StatusBadge from '../components/common/StatusBadge';
import InventarisForm from '../components/inventaris/InventarisForm';
import ConfirmDialog from '../components/common/ConfirmDialog';
import { Box, CheckCircle2, AlertTriangle, AlertOctagon, Edit2, Trash2 } from 'lucide-react';

const InventarisPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCondition, setFilterCondition] = useState('Semua');
  const [filterLocation, setFilterLocation] = useState('Semua');

  const { data: inventaris = [] } = useInventarisList({ search: searchTerm, condition: filterCondition === 'Semua' ? '' : filterCondition, location: filterLocation === 'Semua' ? '' : filterLocation });
  const { data: summaries = { total: 0, Baik: 0, 'Rusak Ringan': 0, 'Rusak Berat': 0 } } = useInventarisSummary();
  
  const createMutation = useCreateInventaris();
  const updateMutation = useUpdateInventaris();
  const deleteMutation = useDeleteInventaris();

  const { data: session } = authClient.useSession();
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingInventaris, setEditingInventaris] = useState(null);
  
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [inventarisToDelete, setInventarisToDelete] = useState(null);

  const canEdit = ['Ketua', 'Sekretaris', 'Bendahara'].includes(session?.user?.role);

  const filteredInventaris = useMemo(() => {
    return inventaris.filter(i => {
      const matchSearch = i.name.toLowerCase().includes(searchTerm.toLowerCase());
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

  const columns = [
    { header: 'ID', accessor: 'id', width: '10%' },
    { header: 'Nama Barang', accessor: 'name', width: '25%' },
    { header: 'Jml', accessor: 'quantity', width: '5%' },
    { header: 'Kondisi', cell: (row) => <StatusBadge type={row.condition} text={row.condition} />, width: '15%' },
    { header: 'Lokasi', accessor: 'location', width: '15%' },
    { header: 'Tanggal', cell: (row) => new Date(row.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }), width: '15%' },
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
          <h1 className="text-display-sm font-display-sm text-on-surface dark:text-white m-0">Inventaris Masjid</h1>
          <p className="font-body-md text-on-surface-variant dark:text-white/70 m-0 mt-xs">Pendataan dan pemantauan aset serta inventaris.</p>
        </div>
        {canEdit && (
          <button 
            onClick={() => {
              setEditingInventaris(null);
              setIsFormOpen(true);
            }}
            className="hidden sm:flex py-2 px-4 rounded-full bg-primary text-on-primary font-label-md hover:bg-primary/90 transition-all shadow-md shadow-primary/20 active:scale-95 items-center gap-2"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            Tambah Barang
          </button>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-md">
        <div className="p-lg rounded-2xl bg-surface-variant border border-outline backdrop-blur-md flex flex-col gap-sm">
          <div className="w-12 h-12 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center">
            <Box size={24} />
          </div>
          <p className="font-label-md text-on-surface-variant dark:text-white/70 m-0">Total Item (Jenis)</p>
          <h2 className="text-headline-lg font-headline-lg text-on-surface dark:text-white m-0">
            {summaries.total}
          </h2>
        </div>
        <div className="p-lg rounded-2xl bg-surface-variant border border-outline backdrop-blur-md flex flex-col gap-sm">
          <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
            <CheckCircle2 size={24} />
          </div>
          <p className="font-label-md text-on-surface-variant dark:text-white/70 m-0">Kondisi Baik</p>
          <h2 className="text-headline-lg font-headline-lg text-emerald-500 m-0">
            {summaries['Baik']}
          </h2>
        </div>
        <div className="p-lg rounded-2xl bg-surface-variant border border-outline backdrop-blur-md flex flex-col gap-sm">
          <div className="w-12 h-12 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center">
            <AlertTriangle size={24} />
          </div>
          <p className="font-label-md text-on-surface-variant dark:text-white/70 m-0">Rusak Ringan</p>
          <h2 className="text-headline-lg font-headline-lg text-amber-500 m-0">
            {summaries['Rusak Ringan']}
          </h2>
        </div>
        <div className="p-lg rounded-2xl bg-surface-variant border border-outline backdrop-blur-md flex flex-col gap-sm">
          <div className="w-12 h-12 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center">
            <AlertOctagon size={24} />
          </div>
          <p className="font-label-md text-on-surface-variant dark:text-white/70 m-0">Rusak Berat</p>
          <h2 className="text-headline-lg font-headline-lg text-rose-500 m-0">
            {summaries['Rusak Berat']}
          </h2>
        </div>
      </div>

      <div className="flex flex-col gap-md">
        <SearchFilter 
          placeholder="Cari nama barang..."
          value={searchTerm}
          onChange={setSearchTerm}
          filters={[
            {
              key: 'condition',
              value: filterCondition,
              options: [
                { label: 'Semua Kondisi', value: 'Semua' },
                { label: 'Baik', value: 'Baik' },
                { label: 'Rusak Ringan', value: 'Rusak Ringan' },
                { label: 'Rusak Berat', value: 'Rusak Berat' }
              ]
            },
            {
              key: 'location',
              value: filterLocation,
              options: [
                { label: 'Semua Lokasi', value: 'Semua' },
                { label: 'Ruang Utama', value: 'Ruang Utama' },
                { label: 'Selaser', value: 'Selaser' },
                { label: 'Tempat Wudu', value: 'Tempat Wudu' },
                { label: 'Gudang', value: 'Gudang' },
                { label: 'Halaman', value: 'Halaman' },
                { label: 'Lainnya', value: 'Lainnya' }
              ]
            }
          ]}
          onFilterChange={(key, val) => {
            if (key === 'condition') setFilterCondition(val);
            if (key === 'location') setFilterLocation(val);
          }}
        />

        <DataTable columns={columns} data={filteredInventaris} emptyMessage="Tidak ada inventaris yang cocok dengan filter Anda." />
      </div>

      {/* Mobile FAB */}
      {canEdit && (
        <button
          onClick={() => {
            setEditingInventaris(null);
            setIsFormOpen(true);
          }}
          className="mobile-fab md:hidden"
          aria-label="Tambah Barang"
        >
          <span className="material-symbols-outlined">add</span>
        </button>
      )}

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
};

export default InventarisPage;
