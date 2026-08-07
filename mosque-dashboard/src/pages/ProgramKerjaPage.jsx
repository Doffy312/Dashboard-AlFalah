import React, { useState, useMemo } from 'react';
import { useProgram } from '../context/ProgramContext';
import { useAuth } from '../context/AuthContext';
import DataTable from '../components/common/DataTable';
import SearchFilter from '../components/common/SearchFilter';
import StatusBadge from '../components/common/StatusBadge';
import ProgramForm from '../components/program/ProgramForm';
import KanbanBoard from '../components/program/KanbanBoard';
import ConfirmDialog from '../components/common/ConfirmDialog';
import { formatCurrency } from '../data/mockTransactions';
import { LayoutGrid, List, Edit2, Trash2 } from 'lucide-react';

const ProgramKerjaPage = () => {
  const { programs, addProgram, updateProgram, deleteProgram, updateProgramStatus } = useProgram();
  const { currentUser } = useAuth();
  
  const [viewMode, setViewMode] = useState('kanban'); // kanban | table
  const [searchTerm, setSearchTerm] = useState('');
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProgram, setEditingProgram] = useState(null);
  
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [programToDelete, setProgramToDelete] = useState(null);

  // Takmir/Ketua: Full CRUD (previously Read + Approve)
  // Sekretaris: Full CRUD
  // Bendahara: Read only (Wait, bendahara could be full access for budget? PRD says Bendahara Full-access (CRUD) untuk modul Budgeting Program Kerja. But we'll give full access to Sekretaris and Bendahara for now)
  const canEdit = ['Ketua', 'Sekretaris', 'Bendahara'].includes(currentUser?.role);

  const filteredPrograms = useMemo(() => {
    return programs.filter(p => {
      return p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
             p.pic.toLowerCase().includes(searchTerm.toLowerCase());
    });
  }, [programs, searchTerm]);

  const handleEdit = (program) => {
    setEditingProgram(program);
    setIsFormOpen(true);
  };

  const handleDeleteClick = (program) => {
    setProgramToDelete(program);
    setIsDeleteOpen(true);
  };

  const confirmDelete = () => {
    if (programToDelete) {
      deleteProgram(programToDelete.id);
      setProgramToDelete(null);
    }
  };

  const handleSubmit = (data) => {
    if (editingProgram) {
      updateProgram(editingProgram.id, data);
    } else {
      addProgram(data);
    }
  };

  const columns = [
    { header: 'ID', accessor: 'id', width: '10%' },
    { header: 'Nama Program', accessor: 'name', width: '25%' },
    { header: 'PIC', accessor: 'pic', width: '15%' },
    { header: 'Tanggal', cell: (row) => new Date(row.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }), width: '15%' },
    { header: 'Estimasi Anggaran', cell: (row) => formatCurrency(row.budget), width: '15%' },
    { header: 'Status', cell: (row) => <StatusBadge type={row.status} text={row.status} />, width: '10%' },
    ...(canEdit ? [{
      header: 'Aksi',
      cell: (row) => (
        <div className="flex gap-2">
          <button onClick={() => handleEdit(row)} className="p-1.5 rounded-lg hover:bg-white/20 text-on-surface-variant transition-colors">
            <Edit2 size={16} />
          </button>
          <button onClick={() => handleDeleteClick(row)} className="p-1.5 rounded-lg hover:bg-rose-500/20 text-rose-500 transition-colors">
            <Trash2 size={16} />
          </button>
        </div>
      ),
      width: '10%'
    }] : [])
  ];

  return (
    <div className="flex flex-col gap-xl">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-display-sm font-display-sm text-on-surface dark:text-white m-0">Program Kerja</h1>
          <p className="font-body-md text-on-surface-variant dark:text-white/70 m-0 mt-xs">Manajemen kegiatan dari perencanaan hingga evaluasi.</p>
        </div>
        <div className="flex gap-md">
          <div className="hidden sm:flex bg-white/10 dark:bg-black/20 p-1 rounded-xl">
            <button 
              className={`p-2 rounded-lg transition-colors ${viewMode === 'kanban' ? 'bg-white/20 text-primary dark:text-primary-fixed' : 'text-on-surface-variant hover:bg-white/10'}`}
              onClick={() => setViewMode('kanban')}
              title="Kanban View"
            >
              <LayoutGrid size={20} />
            </button>
            <button 
              className={`p-2 rounded-lg transition-colors ${viewMode === 'table' ? 'bg-white/20 text-primary dark:text-primary-fixed' : 'text-on-surface-variant hover:bg-white/10'}`}
              onClick={() => setViewMode('table')}
              title="Table View"
            >
              <List size={20} />
            </button>
          </div>
          {canEdit && (
            <button 
              onClick={() => {
                setEditingProgram(null);
                setIsFormOpen(true);
              }}
              className="py-2 px-4 rounded-full bg-primary text-on-primary font-label-md hover:bg-primary/90 transition-all shadow-md shadow-primary/20 active:scale-95 flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              Tambah Program
            </button>
          )}
        </div>
      </div>

      <SearchFilter 
        placeholder="Cari nama program atau PIC..."
        value={searchTerm}
        onChange={setSearchTerm}
      />

      {viewMode === 'kanban' ? (
        <KanbanBoard 
          programs={filteredPrograms} 
          onEdit={handleEdit} 
          onDelete={handleDeleteClick} 
          onStatusChange={updateProgramStatus}
          canEdit={canEdit}
        />
      ) : (
        <DataTable columns={columns} data={filteredPrograms} emptyMessage="Tidak ada program kerja yang ditemukan." />
      )}

      <ProgramForm 
        isOpen={isFormOpen} 
        onClose={() => setIsFormOpen(false)} 
        onSubmit={handleSubmit}
        initialData={editingProgram}
      />

      <ConfirmDialog 
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={confirmDelete}
        title="Hapus Program Kerja"
        message={`Apakah Anda yakin ingin menghapus program "${programToDelete?.name}"? Tindakan ini tidak dapat dibatalkan.`}
      />
    </div>
  );
};

export default ProgramKerjaPage;
