import { useState, useMemo } from 'react';
import {
  useQurbanSummary,
  useQurbanYears,
  useQurbanGroups,
  useQurbanList,
  useCreateQurban,
  useUpdateQurban,
  useDeleteQurban,
  useCreateQurbanYear,
} from '../hooks/useQurban';
import { authClient } from '../lib/auth-client';
import QurbanGrowthChart from '../components/qurban/QurbanGrowthChart';
import QurbanGroupAccordion from '../components/qurban/QurbanGroupAccordion';
import QurbanForm from '../components/qurban/QurbanForm';
import QurbanDetailModal from '../components/qurban/QurbanDetailModal';
import ConfirmDialog from '../components/common/ConfirmDialog';

export default function QurbanPage() {
  const { data: session } = authClient.useSession();
  const canEdit = ['Ketua', 'Sekretaris', 'Bendahara', 'Pengurus'].includes(session?.user?.role);

  // Years & Selected Year Filter
  const { data: years = [] } = useQurbanYears();
  const [selectedYearId, setSelectedYearId] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [jenisHewanFilter, setJenisHewanFilter] = useState('');

  // Current active year object
  const activeYearObj = useMemo(() => {
    if (selectedYearId) return years.find((y) => y.id === selectedYearId);
    return years.find((y) => y.statusAktif) || years[0];
  }, [years, selectedYearId]);

  const currentYearNum = activeYearObj?.tahun || new Date().getFullYear();
  const currentYearId = activeYearObj?.id || '';

  // Data queries
  const { data: summaryStats = {} } = useQurbanSummary(currentYearNum);
  const { data: groups = [] } = useQurbanGroups(currentYearId);
  const { data: allPequrban = [] } = useQurbanList({
    qurbanTahunId: currentYearId,
    search: searchTerm,
    jenisHewan: jenisHewanFilter,
  });

  // Mutations
  const createMutation = useCreateQurban();
  const updateMutation = useUpdateQurban();
  const deleteMutation = useDeleteQurban();
  const createYearMutation = useCreateQurbanYear();

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingData, setEditingData] = useState(null);
  const [defaultGroupForForm, setDefaultGroupForForm] = useState(null);

  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [detailData, setDetailData] = useState(null);

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [dataToDelete, setDataToDelete] = useState(null);

  // Grouped datasets
  const ungroupedKambing = useMemo(() => {
    return allPequrban.filter((p) => p.jenisHewan === 'Kambing' || !p.qurbanKelompokId);
  }, [allPequrban]);

  // Filtered groups based on search term & animal type filter
  const filteredGroups = useMemo(() => {
    if (jenisHewanFilter === 'Kambing') return []; // Hide Cow groups when Kambing filter is active

    return groups
      .map((group) => {
        let members = group.members || [];
        if (searchTerm) {
          const term = searchTerm.toLowerCase();
          members = members.filter(
            (m) =>
              m.jemaahName?.toLowerCase().includes(term) ||
              m.jemaahPhone?.includes(term)
          );
        }
        return {
          ...group,
          members,
        };
      })
      .filter((group) => {
        if (searchTerm) return group.members.length > 0;
        return true;
      });
  }, [groups, jenisHewanFilter, searchTerm]);

  // Filtered Kambing / ungrouped list based on search term & animal type filter
  const filteredUngroupedKambing = useMemo(() => {
    if (jenisHewanFilter === 'Sapi') return []; // Hide Kambing list when Sapi filter is active

    return ungroupedKambing.filter((item) => {
      if (!searchTerm) return true;
      const term = searchTerm.toLowerCase();
      return (
        item.jemaahName?.toLowerCase().includes(term) ||
        item.jemaahPhone?.includes(term) ||
        item.catatan?.toLowerCase().includes(term)
      );
    });
  }, [ungroupedKambing, jenisHewanFilter, searchTerm]);

  // Handlers
  const handleEdit = (data) => {
    setEditingData(data);
    setDefaultGroupForForm(null);
    setIsFormOpen(true);
  };

  const handleDetail = (data) => {
    setDetailData(data);
    setIsDetailOpen(true);
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

  const handleAddMemberToGroup = (group) => {
    setEditingData(null);
    setDefaultGroupForForm(group);
    setIsFormOpen(true);
  };

  const handleSubmitForm = (formData) => {
    if (editingData) {
      updateMutation.mutate(
        { id: editingData.id, data: formData },
        {
          onSuccess: () => setIsFormOpen(false),
        }
      );
    } else {
      createMutation.mutate(formData, {
        onSuccess: () => setIsFormOpen(false),
      });
    }
  };

  const handleAddYearPrompt = () => {
    const nextYear = prompt('Masukkan Tahun Qurban Baru (contoh: 2027):', (currentYearNum + 1).toString());
    if (nextYear && !isNaN(Number(nextYear))) {
      createYearMutation.mutate({ tahun: Number(nextYear), statusAktif: true });
    }
  };

  const {
    totalPequrban = 0,
    totalSapi = 0,
    totalKambing = 0,
    totalKelompokSapi = 0,
  } = summaryStats;

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-on-surface flex items-center gap-2.5">
            <span className="material-symbols-outlined text-primary text-3xl">mosque</span>
            Manajemen Qurban
          </h1>
          <p className="text-xs sm:text-sm text-on-surface-variant mt-1">
            Pengelolaan data peserta, kelompok Sapi &amp; Kambing, serta grafik tren kepanitiaan Qurban.
          </p>
        </div>
        {canEdit && (
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              onClick={handleAddYearPrompt}
              className="px-3 py-2 rounded-xl bg-surface-variant/80 hover:bg-surface-variant text-on-surface border border-outline-variant text-xs font-semibold flex items-center gap-1.5 transition-all"
              title="Tambah Periode Tahun Qurban Baru"
            >
              <span className="material-symbols-outlined text-base">calendar_add_on</span>
              <span className="hidden sm:inline">+ Tahun Baru</span>
            </button>
            <button
              onClick={() => {
                setEditingData(null);
                setDefaultGroupForForm(null);
                setIsFormOpen(true);
              }}
              className="px-4 py-2.5 rounded-xl bg-primary text-slate-950 font-bold text-xs sm:text-sm hover:bg-primary/90 transition-all shadow-md shadow-primary/20 flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-xl">add</span>
              Tambah PeQurban
            </button>
          </div>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-surface border border-outline-variant rounded-2xl p-3.5 sm:p-5 flex flex-col justify-between shadow-sm">
          <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
            <div className="w-7 h-7 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-base sm:text-2xl">groups</span>
            </div>
            <div className="text-xs sm:text-sm text-on-surface-variant font-medium leading-tight">
              Total Pequrban ({currentYearNum})
            </div>
          </div>
          <div>
            <div className="text-lg sm:text-2xl font-bold text-on-surface">
              {totalPequrban}
            </div>
          </div>
        </div>

        <div className="bg-surface border border-outline-variant rounded-2xl p-3.5 sm:p-5 flex flex-col justify-between shadow-sm">
          <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
            <div className="w-7 h-7 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-base sm:text-2xl">pets</span>
            </div>
            <div className="text-xs sm:text-sm text-on-surface-variant font-medium leading-tight">
              Total Sapi Qurban
            </div>
          </div>
          <div>
            <div className="text-lg sm:text-2xl font-bold text-amber-400">
              {totalSapi} Ekor
            </div>
          </div>
        </div>

        <div className="bg-surface border border-outline-variant rounded-2xl p-3.5 sm:p-5 flex flex-col justify-between shadow-sm">
          <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
            <div className="w-7 h-7 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-blue-500/15 text-blue-400 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-base sm:text-2xl">cruelty_free</span>
            </div>
            <div className="text-xs sm:text-sm text-on-surface-variant font-medium leading-tight">
              Total Kambing / Domba
            </div>
          </div>
          <div>
            <div className="text-lg sm:text-2xl font-bold text-blue-400">
              {totalKambing} Ekor
            </div>
          </div>
        </div>

        <div className="bg-surface border border-outline-variant rounded-2xl p-3.5 sm:p-5 flex flex-col justify-between shadow-sm">
          <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
            <div className="w-7 h-7 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-purple-500/15 text-purple-400 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-base sm:text-2xl">stacks</span>
            </div>
            <div className="text-xs sm:text-sm text-on-surface-variant font-medium leading-tight">
              Kelompok Sapi
            </div>
          </div>
          <div>
            <div className="text-lg sm:text-2xl font-bold text-purple-400">
              {totalKelompokSapi} Kelompok
            </div>
          </div>
        </div>
      </div>

      {/* Chart Pertumbuhan */}
      <QurbanGrowthChart data={summaryStats.yearlyTrend || []} />

      {/* Filter & Search Bar */}
      <div className="bg-surface border border-outline-variant rounded-2xl p-4 space-y-3 sm:space-y-0 sm:flex sm:items-center sm:justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-xl">search</span>
          <input
            type="text"
            placeholder="Cari nama pequrban, no. HP..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-surface-variant/50 border border-outline-variant rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-on-surface placeholder:text-on-surface-variant outline-none focus:border-primary transition-all"
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {/* Year Selector */}
          <select
            value={selectedYearId || currentYearId}
            onChange={(e) => setSelectedYearId(e.target.value)}
            className="bg-surface-variant/50 border border-outline-variant rounded-xl px-3 py-2 text-xs font-semibold text-on-surface outline-none focus:border-primary cursor-pointer"
          >
            {years.map((y) => (
              <option key={y.id} value={y.id} className="bg-surface text-on-surface">
                Tahun {y.tahun} {y.statusAktif ? '(Aktif)' : ''}
              </option>
            ))}
          </select>

          {/* Animal Type Filter Pills */}
          <div className="flex items-center gap-1.5 bg-surface-variant/40 p-1 rounded-xl border border-outline-variant/40">
            {[
              { label: 'Semua', val: '' },
              { label: 'Sapi', val: 'Sapi' },
              { label: 'Kambing', val: 'Kambing' },
            ].map((opt) => (
              <button
                key={opt.val}
                onClick={() => setJenisHewanFilter(opt.val)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  jenisHewanFilter === opt.val
                    ? 'bg-primary text-slate-950 shadow-md font-bold'
                    : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-variant/80'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grouped Table Display (Accordion) */}
      <QurbanGroupAccordion
        groups={filteredGroups}
        ungroupedList={filteredUngroupedKambing}
        canEdit={canEdit}
        onEdit={handleEdit}
        onDelete={handleDeleteClick}
        onDetail={handleDetail}
        onAddMemberToGroup={handleAddMemberToGroup}
      />

      {/* Modals */}
      <QurbanForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleSubmitForm}
        initialData={editingData}
        defaultGroup={defaultGroupForForm}
      />

      <QurbanDetailModal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        data={detailData}
      />

      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={confirmDelete}
        title="Hapus Data PeQurban"
        message={`Apakah Anda yakin ingin menghapus data PeQurban dari "${dataToDelete?.jemaahName}"?`}
      />
    </div>
  );
}
