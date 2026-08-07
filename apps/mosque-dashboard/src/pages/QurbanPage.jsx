import { useState, useMemo } from 'react';
import { useQurbanList, useCreateQurban, useUpdateQurban, useDeleteQurban } from '../hooks/useQurban';
import { authClient } from '../lib/auth-client';
import DataTable from '../components/common/DataTable';
import SearchFilter from '../components/common/SearchFilter';
import StatusBadge from '../components/common/StatusBadge';
import QurbanForm from '../components/qurban/QurbanForm';
import ConfirmDialog from '../components/common/ConfirmDialog';
import { Edit2, Trash2 } from 'lucide-react';

const QurbanPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterYear, setFilterYear] = useState(new Date().getFullYear().toString());

  const { data: qurban = [] } = useQurbanList({});
  
  const createMutation = useCreateQurban();
  const updateMutation = useUpdateQurban();
  const deleteMutation = useDeleteQurban();

  const { data: session } = authClient.useSession();
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingData, setEditingData] = useState(null);
  
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [dataToDelete, setDataToDelete] = useState(null);

  const canEdit = ['Ketua', 'Sekretaris'].includes(session?.user?.role);

  const filteredData = useMemo(() => {
    return qurban.filter(item => {
      const matchSearch = item.participantName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchYear = filterYear === '' || item.year.toString() === filterYear;
      return matchSearch && matchYear;
    });
  }, [qurban, searchTerm, filterYear]);

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
    { header: 'Tahun', accessor: 'year', width: '10%' },
    { header: 'Nama Pekurban', accessor: 'participantName', width: '30%' },
    { header: 'Hewan', accessor: 'animalType', width: '15%' },
    { header: 'Status', cell: (row) => <StatusBadge type={row.status === 'Lunas' ? 'Active' : 'Pending'} text={row.status} />, width: '15%' },
    { header: 'Catatan', accessor: 'notes', width: '20%' },
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
          <h1 className="text-display-sm font-display-sm text-on-surface dark:text-white m-0">Kepanitiaan Qurban</h1>
          <p className="font-body-md text-on-surface-variant dark:text-white/70 m-0 mt-xs">Pengelolaan data peserta dan hewan Qurban.</p>
        </div>
        {canEdit && (
          <button onClick={() => { setEditingData(null); setIsFormOpen(true); }} className="hidden sm:flex py-2 px-4 rounded-full bg-primary text-on-primary font-label-md hover:bg-primary/90 transition-all shadow-md shadow-primary/20 active:scale-95 items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">add</span> Tambah Peserta
          </button>
        )}
      </div>

      <div className="flex flex-col gap-md">
        <SearchFilter 
          placeholder="Cari nama pekurban..." value={searchTerm} onChange={setSearchTerm}
          filters={[
            {
              key: 'year', value: filterYear,
              options: [
                { label: 'Semua Tahun', value: '' },
                ...Array.from(new Set(qurban.map(q => q.year.toString()))).map(y => ({ label: `Tahun ${y}`, value: y }))
              ]
            }
          ]}
          onFilterChange={(key, val) => { if (key === 'year') setFilterYear(val); }}
        />
        <DataTable columns={columns} data={filteredData} emptyMessage="Tidak ada data Qurban." />
      </div>

      {canEdit && (
        <button onClick={() => { setEditingData(null); setIsFormOpen(true); }} className="mobile-fab md:hidden" aria-label="Tambah Peserta">
          <span className="material-symbols-outlined">add</span>
        </button>
      )}

      <QurbanForm isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} onSubmit={handleSubmit} initialData={editingData} />
      <ConfirmDialog isOpen={isDeleteOpen} onClose={() => setIsDeleteOpen(false)} onConfirm={confirmDelete} title="Hapus Data Qurban" message={`Yakin hapus data Qurban dari "${dataToDelete?.participantName}"?`} />
    </div>
  );
};

export default QurbanPage;
