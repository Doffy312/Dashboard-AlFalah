import { useState, useMemo } from 'react';
import { usePrograms, useCreateProgram, useUpdateProgram, useDeleteProgram, useUpdateProgramStatus, useCompleteProgram } from '../hooks/usePrograms';
import { authClient } from '../lib/auth-client';
import ProgramForm from '../components/program/ProgramForm';
import KanbanBoard from '../components/program/KanbanBoard';
import ConfirmDialog from '../components/common/ConfirmDialog';
import ProgramCompletionModal from '../components/program/ProgramCompletionModal';
import ProgramDetailModal from '../components/program/ProgramDetailModal';
import { formatCurrency } from '../lib/utils';

export default function ProgramKerjaPage() {
  const [viewMode, setViewMode] = useState('kanban'); // kanban | table
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const { data: programs = [], isLoading, isError } = usePrograms({ search: searchTerm });
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

  const canEdit = ['Ketua', 'Sekretaris'].includes(session?.user?.role);

  const filteredPrograms = useMemo(() => {
    return programs.filter(p => {
      const matchSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          p.pic.toLowerCase().includes(searchTerm.toLowerCase());
      const matchStatus = statusFilter === 'ALL' || p.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [programs, searchTerm, statusFilter]);

  const stats = useMemo(() => {
    const total = programs.length;
    const perencanaan = programs.filter(p => p.status === 'Direncanakan').length;
    const berjalan = programs.filter(p => p.status === 'Sedang Berjalan').length;
    const selesai = programs.filter(p => p.status === 'Selesai').length;
    return { total, perencanaan, berjalan, selesai };
  }, [programs]);

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
            <span className="material-symbols-outlined text-primary text-3xl">task</span>
            Program Kerja
          </h1>
          <p className="text-xs sm:text-sm text-on-surface-variant mt-1">
            Manajemen kegiatan takmir dari tahap perencanaan, pelaksanaan, hingga evaluasi.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <a
            href="http://localhost:3000/api/programs/feed.ics"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-2 rounded-xl bg-surface-variant/80 hover:bg-surface-variant text-on-surface border border-outline-variant text-xs font-semibold flex items-center gap-1.5 transition-all"
            title="Subscribe Kalender via Ponsel"
          >
            <span className="material-symbols-outlined text-base">calendar_add_on</span>
            <span className="hidden sm:inline">Subscribe Kalender</span>
          </a>
          {canEdit && (
            <button 
              onClick={() => {
                setEditingProgram(null);
                setIsFormOpen(true);
              }}
              className="px-4 py-2.5 rounded-xl bg-primary text-slate-950 font-bold text-xs sm:text-sm hover:bg-primary/90 transition-all shadow-md shadow-primary/20 flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-xl">add</span>
              Tambah Program
            </button>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-surface border border-outline-variant rounded-2xl p-3.5 sm:p-5 flex flex-col justify-between shadow-sm">
          <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
            <div className="w-7 h-7 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-base sm:text-2xl">assignment</span>
            </div>
            <div className="text-xs sm:text-sm text-on-surface-variant font-medium leading-tight">Total Program</div>
          </div>
          <div>
            <div className="text-lg sm:text-2xl font-bold text-on-surface">{stats.total}</div>
          </div>
        </div>

        <div className="bg-surface border border-outline-variant rounded-2xl p-3.5 sm:p-5 flex flex-col justify-between shadow-sm">
          <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
            <div className="w-7 h-7 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-base sm:text-2xl">pending_actions</span>
            </div>
            <div className="text-xs sm:text-sm text-on-surface-variant font-medium leading-tight">Perencanaan</div>
          </div>
          <div>
            <div className="text-lg sm:text-2xl font-bold text-amber-400">{stats.perencanaan}</div>
          </div>
        </div>

        <div className="bg-surface border border-outline-variant rounded-2xl p-3.5 sm:p-5 flex flex-col justify-between shadow-sm">
          <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
            <div className="w-7 h-7 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-blue-500/15 text-blue-400 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-base sm:text-2xl">autorenew</span>
            </div>
            <div className="text-xs sm:text-sm text-on-surface-variant font-medium leading-tight">Sedang Berjalan</div>
          </div>
          <div>
            <div className="text-lg sm:text-2xl font-bold text-blue-400">{stats.berjalan}</div>
          </div>
        </div>

        <div className="bg-surface border border-outline-variant rounded-2xl p-3.5 sm:p-5 flex flex-col justify-between shadow-sm">
          <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
            <div className="w-7 h-7 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-base sm:text-2xl">task_alt</span>
            </div>
            <div className="text-xs sm:text-sm text-on-surface-variant font-medium leading-tight">Selesai</div>
          </div>
          <div>
            <div className="text-lg sm:text-2xl font-bold text-emerald-400">{stats.selesai}</div>
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
            placeholder="Cari nama program kerja, PIC..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-surface-variant/50 border border-outline-variant rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-on-surface placeholder:text-on-surface-variant outline-none focus:border-primary transition-all"
          />
        </div>

        {/* View Switcher & Status Filter Pills */}
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <div className="flex items-center gap-1.5 bg-surface-variant/40 p-1 rounded-xl border border-outline-variant/40">
            {[
              { label: 'Semua', value: 'ALL' },
              { label: 'Perencanaan', value: 'Direncanakan' },
              { label: 'Berjalan', value: 'Sedang Berjalan' },
              { label: 'Selesai', value: 'Selesai' },
            ].map((tab) => (
              <button
                key={tab.value}
                onClick={() => setStatusFilter(tab.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  statusFilter === tab.value
                    ? 'bg-primary text-slate-950 shadow-md font-bold'
                    : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-variant/80'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1 bg-surface-variant/40 p-1 rounded-xl border border-outline-variant/40">
            <button 
              onClick={() => setViewMode('kanban')}
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === 'kanban' 
                  ? 'bg-primary text-slate-950 shadow-md font-bold' 
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
              title="Tampilan Kanban"
            >
              <span className="material-symbols-outlined text-lg">view_kanban</span>
            </button>
            <button 
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === 'table' 
                  ? 'bg-primary text-slate-950 shadow-md font-bold' 
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
              title="Tampilan Tabel"
            >
              <span className="material-symbols-outlined text-lg">table_rows</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
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
        <div className="bg-surface border border-outline-variant rounded-2xl overflow-hidden shadow-sm">
          {isLoading ? (
            <div className="p-8 text-center space-y-3">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs text-on-surface-variant">Memuat data program kerja...</p>
            </div>
          ) : isError ? (
            <div className="p-8 text-center text-error space-y-2">
              <span className="material-symbols-outlined text-3xl">error</span>
              <p className="text-sm font-semibold">Gagal memuat program kerja.</p>
            </div>
          ) : filteredPrograms.length === 0 ? (
            <div className="p-12 text-center text-on-surface-variant space-y-3">
              <span className="material-symbols-outlined text-4xl text-on-surface-variant/50">event_busy</span>
              <p className="text-sm font-semibold text-on-surface">Tidak ada program kerja ditemukan</p>
              <p className="text-xs max-w-sm mx-auto">
                {searchTerm || statusFilter !== 'ALL'
                  ? 'Coba sesuaikan kata kunci pencarian atau filter status Anda.' 
                  : 'Belum ada program kerja yang terdaftar.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-outline-variant bg-surface-variant/30 text-[11px] uppercase tracking-wider text-on-surface-variant font-bold">
                    <th className="py-3.5 px-4 sm:px-6">Nama Program</th>
                    <th className="py-3.5 px-4">PIC / Penanggung Jawab</th>
                    <th className="py-3.5 px-4">Tanggal Target</th>
                    <th className="py-3.5 px-4">Estimasi Anggaran</th>
                    <th className="py-3.5 px-4">Status</th>
                    {canEdit && <th className="py-3.5 px-4 sm:px-6 text-right">Aksi</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/60 text-xs sm:text-sm">
                  {filteredPrograms.map((row) => (
                    <tr key={row.id} className="hover:bg-surface-variant/40 transition-colors">
                      <td className="py-4 px-4 sm:px-6 font-bold text-on-surface">
                        {row.name}
                      </td>
                      <td className="py-4 px-4 font-medium text-on-surface">
                        {row.pic || '-'}
                      </td>
                      <td className="py-4 px-4 text-xs text-on-surface-variant whitespace-nowrap">
                        {formatDate(row.date)}
                      </td>
                      <td className="py-4 px-4 font-mono text-emerald-400 font-semibold whitespace-nowrap">
                        {formatCurrency(row.budget)}
                      </td>
                      <td className="py-4 px-4 whitespace-nowrap">
                        <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold inline-flex items-center gap-1 border ${
                          row.status === 'Selesai' 
                            ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                            : row.status === 'Sedang Berjalan'
                            ? 'bg-blue-500/15 text-blue-400 border-blue-500/30'
                            : 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                        }`}>
                          {row.status}
                        </span>
                      </td>
                      {canEdit && (
                        <td className="py-4 px-4 sm:px-6 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            {row.status === 'Selesai' && (
                              <button
                                onClick={() => handleViewDetail(row)}
                                className="px-3 py-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 font-bold text-xs flex items-center gap-1 transition-all"
                                title="Lihat Detail"
                              >
                                <span className="material-symbols-outlined text-base">visibility</span>
                                <span>Detail</span>
                              </button>
                            )}
                            {row.status === 'Sedang Berjalan' && (
                              <button
                                onClick={() => handleStatusChange(row.id, 'Selesai')}
                                className="px-3 py-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 font-bold text-xs flex items-center gap-1 transition-all"
                                title="Selesaikan Program"
                              >
                                <span className="material-symbols-outlined text-base">check_circle</span>
                                <span>Selesai</span>
                              </button>
                            )}
                            <button
                              onClick={() => handleEdit(row)}
                              className="px-3 py-1.5 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary font-bold text-xs flex items-center gap-1 transition-all"
                              title="Edit Program"
                            >
                              <span className="material-symbols-outlined text-base">edit</span>
                            </button>
                            <button
                              onClick={() => handleDeleteClick(row)}
                              className="px-2.5 py-1.5 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 text-rose-400 border border-rose-500/30 text-xs font-bold transition-all flex items-center gap-1"
                              title="Hapus Program"
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
}
