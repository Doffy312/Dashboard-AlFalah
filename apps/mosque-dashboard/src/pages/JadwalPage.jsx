import { useState, useMemo } from 'react';
import { useJadwalList, useCreateJadwal, useUpdateJadwal, useDeleteJadwal } from '../hooks/useJadwal';
import { authClient } from '../lib/auth-client';
import DataTable from '../components/common/DataTable';
import SearchFilter from '../components/common/SearchFilter';
import StatusBadge from '../components/common/StatusBadge';
import JadwalForm from '../components/jadwal/JadwalForm';
import ConfirmDialog from '../components/common/ConfirmDialog';
import { Edit2, Trash2 } from 'lucide-react';

const JadwalPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('Semua');

  const { data: jadwal = [] } = useJadwalList({});
  
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
      const matchSearch = item.personName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchRole = filterRole === 'Semua' || item.role === filterRole;
      return matchSearch && matchRole;
    });
  }, [jadwal, searchTerm, filterRole]);

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

  const columns = [
    { header: 'Tanggal', accessor: 'date', width: '15%' },
    { header: 'Petugas', accessor: 'personName', width: '25%' },
    { header: 'Peran', cell: (row) => <StatusBadge type={row.role === 'Khotib Jumat' ? 'Active' : 'Umum'} text={row.role} />, width: '15%' },
    { header: 'Kontak', accessor: 'contact', width: '15%' },
    { header: 'Tema / Topik', accessor: 'topic', width: '20%' },
    ...(canEdit ? [{
      header: 'Aksi',
      cell: (row) => (
        <div className="flex gap-2">
          <button onClick={() => handleEdit(row)} className="p-1.5 rounded-lg hover:bg-surface-variant text-on-surface-variant transition-colors"><Edit2 size={16} /></button>
          <button onClick={() => handleDeleteClick(row)} className="p-1.5 rounded-lg hover:bg-rose-500/20 text-rose-500 transition-colors"><Trash2 size={16} /></button>
        </div>
      ),
      width: '10%'
    }] : [])
  ];

  return (
    <div className="flex flex-col gap-xl">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-display-sm font-display-sm text-on-surface dark:text-white m-0">Jadwal Petugas</h1>
          <p className="font-body-md text-on-surface-variant dark:text-white/70 m-0 mt-xs">Pengelolaan jadwal Khotib, Imam, dan Muadzin.</p>
        </div>
        {canEdit && (
          <button onClick={() => { setEditingData(null); setIsFormOpen(true); }} className="hidden sm:flex py-2 px-4 rounded-full bg-primary text-on-primary font-label-md hover:bg-primary/90 transition-all shadow-md shadow-primary/20 active:scale-95 items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">add</span> Tambah Jadwal
          </button>
        )}
      </div>

      <div className="flex flex-col gap-md">
        <SearchFilter 
          placeholder="Cari nama petugas..." value={searchTerm} onChange={setSearchTerm}
          filters={[
            {
              key: 'role', value: filterRole,
              options: [
                { label: 'Semua Peran', value: 'Semua' },
                { label: 'Khotib Jumat', value: 'Khotib Jumat' },
                { label: 'Imam Rawatib', value: 'Imam Rawatib' },
                { label: 'Muadzin', value: 'Muadzin' },
                { label: 'Penceramah Kajian', value: 'Penceramah Kajian' },
              ]
            }
          ]}
          onFilterChange={(key, val) => { if (key === 'role') setFilterRole(val); }}
        />
        <DataTable columns={columns} data={filteredData} emptyMessage="Tidak ada data jadwal." />
      </div>

      {canEdit && (
        <button onClick={() => { setEditingData(null); setIsFormOpen(true); }} className="mobile-fab md:hidden" aria-label="Tambah Jadwal">
          <span className="material-symbols-outlined">add</span>
        </button>
      )}

      <JadwalForm isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} onSubmit={handleSubmit} initialData={editingData} />
      <ConfirmDialog isOpen={isDeleteOpen} onClose={() => setIsDeleteOpen(false)} onConfirm={confirmDelete} title="Hapus Data Jadwal" message={`Yakin hapus jadwal untuk "${dataToDelete?.personName}"?`} />
    </div>
  );
};

export default JadwalPage;
