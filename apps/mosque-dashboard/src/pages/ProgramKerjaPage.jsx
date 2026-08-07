import { useState, useMemo } from 'react';
import { usePrograms, useCreateProgram, useUpdateProgram, useDeleteProgram, useUpdateProgramStatus, useCompleteProgram } from '../hooks/usePrograms';
import { authClient } from '../lib/auth-client';
import DataTable from '../components/common/DataTable';
import SearchFilter from '../components/common/SearchFilter';
import StatusBadge from '../components/common/StatusBadge';
import ProgramForm from '../components/program/ProgramForm';
import KanbanBoard from '../components/program/KanbanBoard';
import ConfirmDialog from '../components/common/ConfirmDialog';
import ProgramCompletionModal from '../components/program/ProgramCompletionModal';
import ProgramDetailModal from '../components/program/ProgramDetailModal';
import { formatCurrency } from '../lib/utils';
import { LayoutGrid, List, Edit2, Trash2, CheckCircle, Eye, CalendarPlus } from 'lucide-react';

const ProgramKerjaPage = () => {
  const [viewMode, setViewMode] = useState('kanban'); // kanban | table
  const [searchTerm, setSearchTerm] = useState('');

  const { data: programs = [] } = usePrograms({ search: searchTerm });
  const createMutation = useCreateProgram();
  const updateMutation = useUpdateProgram();
  const deleteMutation = useDeleteProgram();
  const statusMutation = useUpdateProgramStatus();
  const completeMutation = useCompleteProgram();

  const { data: session } = authClient.useSession();
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProgram, setEditingProgram] = useState(null);
  
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [programToDelete, setProgramToDelete] = useState(null);

  const [isCompletionOpen, setIsCompletionOpen] = useState(false);
  const [programToComplete, setProgramToComplete] = useState(null);

  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [programToView, setProgramToView] = useState(null);

  // Takmir/Ketua: Full CRUD (previously Read + Approve)
  // Sekretaris: Full CRUD
  // Bendahara: Read only
  const canEdit = ['Ketua', 'Sekretaris'].includes(session?.user?.role);

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
      deleteMutation.mutate(programToDelete.id);
      setProgramToDelete(null);
      setIsDeleteOpen(false);
    }
  };

  const handleSubmit = (data) => {
    if (editingProgram) {
      updateMutation.mutate({ id: editingProgram.id, data });
    } else {
      createMutation.mutate(data);
    }
    setIsFormOpen(false);
  };
  
  const handleStatusChange = (id, status) => {
    if (status === 'Selesai') {
      const p = programs.find(p => p.id === id);
      setProgramToComplete(p);
      setIsCompletionOpen(true);
    } else {
      statusMutation.mutate({ id, status });
    }
  };

  const handleCompleteProgram = async (formData) => {
    if (programToComplete) {
      await completeMutation.mutateAsync({ id: programToComplete.id, formData });
      setProgramToComplete(null);
    }
  };

  const handleViewDetail = (program) => {
    setProgramToView(program);
    setIsDetailOpen(true);
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
          {row.status === 'Selesai' && (
            <button onClick={() => handleViewDetail(row)} className="p-1.5 rounded-lg hover:bg-emerald-500/20 text-emerald-500 transition-colors" title="Lihat Detail">
              <Eye size={16} />
            </button>
          )}
          {row.status === 'Sedang Berjalan' && (
            <button onClick={() => handleStatusChange(row.id, 'Selesai')} className="p-1.5 rounded-lg hover:bg-emerald-500/20 text-emerald-500 transition-colors" title="Selesaikan Program">
              <CheckCircle size={16} />
            </button>
          )}
          <button onClick={() => handleEdit(row)} className="p-1.5 rounded-lg hover:bg-surface-variant text-on-surface-variant transition-colors">
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-display-sm font-display-sm text-on-surface dark:text-white m-0">Program Kerja</h1>
          <p className="font-body-md text-on-surface-variant dark:text-white/70 m-0 mt-xs">Manajemen kegiatan dari perencanaan hingga evaluasi.</p>
        </div>
        <div className="flex gap-md">
          <div className="hidden sm:flex bg-surface-variant p-1 rounded-xl">
            <button 
              className={`p-2 rounded-lg transition-colors ${viewMode === 'kanban' ? 'bg-primary/20 text-primary' : 'text-on-surface-variant hover:bg-surface-variant'}`}
              onClick={() => setViewMode('kanban')}
              title="Kanban View"
            >
              <LayoutGrid size={20} />
            </button>
            <button 
              className={`p-2 rounded-lg transition-colors ${viewMode === 'table' ? 'bg-primary/20 text-primary' : 'text-on-surface-variant hover:bg-surface-variant'}`}
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
              className="hidden sm:flex py-2 px-4 rounded-full bg-primary text-on-primary font-label-md hover:bg-primary/90 transition-all shadow-md shadow-primary/20 active:scale-95 items-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              Tambah Program
            </button>
          )}
          <a
            href="http://localhost:3000/api/programs/feed.ics"
            target="_blank"
            rel="noopener noreferrer"
            className="py-2 px-4 rounded-full bg-surface-variant text-on-surface-variant font-label-md hover:bg-surface transition-all flex items-center gap-2 border border-outline"
            title="Subscribe Kalender via Ponsel"
          >
            <CalendarPlus size={18} />
            Subscribe
          </a>
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
          onStatusChange={handleStatusChange}
          onViewDetail={handleViewDetail}
          canEdit={canEdit}
        />
      ) : (
        <DataTable columns={columns} data={filteredPrograms} emptyMessage="Tidak ada program kerja yang ditemukan." />
      )}

      {/* Mobile FAB */}
      {canEdit && (
        <button
          onClick={() => {
            setEditingProgram(null);
            setIsFormOpen(true);
          }}
          className="mobile-fab md:hidden"
          aria-label="Tambah Program"
        >
          <span className="material-symbols-outlined">add</span>
        </button>
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

      <ProgramCompletionModal 
        isOpen={isCompletionOpen}
        onClose={() => {
          setIsCompletionOpen(false);
          setProgramToComplete(null);
        }}
        onSubmit={handleCompleteProgram}
        program={programToComplete}
      />

      <ProgramDetailModal 
        isOpen={isDetailOpen}
        onClose={() => {
          setIsDetailOpen(false);
          setProgramToView(null);
        }}
        program={programToView}
      />
    </div>
  );
};

export default ProgramKerjaPage;
