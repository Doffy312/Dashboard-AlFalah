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
import QurbanSummaryCards from '../components/qurban/QurbanSummaryCards';
import QurbanGrowthChart from '../components/qurban/QurbanGrowthChart';
import QurbanGroupAccordion from '../components/qurban/QurbanGroupAccordion';
import QurbanForm from '../components/qurban/QurbanForm';
import QurbanDetailModal from '../components/qurban/QurbanDetailModal';
import ConfirmDialog from '../components/common/ConfirmDialog';
import SearchFilter from '../components/common/SearchFilter';
import { Plus, Calendar, Layers, Search, Filter, ChevronDown } from 'lucide-react';
import toast from 'react-hot-toast';

const QurbanPage = () => {
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

  return (
    <div className="flex flex-col gap-lg pb-xl">
      {/* ─── HEADER SECTION ───────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-md">
        <div>
          <h1 className="text-display-sm font-display-sm text-on-surface dark:text-white m-0 flex items-center gap-sm">
            <span className="material-symbols-outlined text-[32px] text-emerald-500">
              mosque
            </span>
            Manajemen Qurban
          </h1>
          <p className="font-body-md text-on-surface-variant dark:text-white/70 m-0 mt-xs">
            Pengelolaan data peserta, kelompok Sapi & Kambing, serta grafik tren kepanitiaan Qurban.
          </p>
        </div>

        <div className="flex items-center gap-sm w-full sm:w-auto">
          {canEdit && (
            <>
              <button
                onClick={handleAddYearPrompt}
                className="py-2 px-4 rounded-xl border border-outline bg-surface-variant hover:bg-surface text-on-surface font-label-md transition-all flex items-center gap-2"
                title="Tambah Periode Tahun Qurban Baru"
              >
                <Calendar size={16} /> + Tahun Baru
              </button>
              <button
                onClick={() => {
                  setEditingData(null);
                  setDefaultGroupForForm(null);
                  setIsFormOpen(true);
                }}
                className="flex-1 sm:flex-initial py-2.5 px-5 rounded-full bg-emerald-500 text-slate-950 font-bold font-label-md hover:bg-emerald-400 transition-all shadow-md shadow-emerald-500/20 active:scale-95 flex items-center justify-center gap-2"
              >
                <Plus size={18} /> Tambah PeQurban
              </button>
            </>
          )}
        </div>
      </div>

      {/* ─── SUMMARY CARDS ─────────────────────────────────────────────────── */}
      <QurbanSummaryCards summary={summaryStats} />

      {/* ─── CHART PERTUMBUHAN ────────────────────────────────────────────── */}
      <QurbanGrowthChart data={summaryStats.yearlyTrend || []} />

      {/* ─── FILTER & TOOLBAR PRESISE ─────────────────────────────────────── */}
      <div className="p-3.5 sm:p-4 rounded-2xl bg-surface border border-outline/50 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        
        {/* Left Side Filters: Periode Tahun & Jenis Hewan */}
        <div className="flex flex-wrap items-center gap-3">
          
          {/* Year selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-on-surface-variant dark:text-white/80 flex items-center gap-1.5 whitespace-nowrap">
              <Calendar className="w-4 h-4 text-emerald-500" /> Periode Tahun:
            </span>
            <div className="relative flex items-center">
              <select
                value={selectedYearId || currentYearId}
                onChange={(e) => setSelectedYearId(e.target.value)}
                className="h-9 appearance-none pl-3 pr-8 rounded-xl bg-surface-variant/80 border border-outline/60 text-on-surface dark:text-white text-xs font-semibold outline-none focus:border-emerald-500 cursor-pointer shadow-sm transition-all"
              >
                {years.map((y) => (
                  <option key={y.id} value={y.id} className="bg-slate-900 text-white p-2">
                    Tahun {y.tahun} {y.statusAktif ? '(Aktif)' : ''}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
          </div>

          {/* Animal Type Filter Pills */}
          <div className="flex items-center p-1 rounded-xl bg-surface-variant/80 border border-outline/60 h-9">
            {[
              { label: 'Semua Hewan', val: '' },
              { label: 'Sapi', val: 'Sapi' },
              { label: 'Kambing', val: 'Kambing' },
            ].map((opt) => {
              const isActive = jenisHewanFilter === opt.val;
              return (
                <button
                  key={opt.val}
                  onClick={() => setJenisHewanFilter(opt.val)}
                  className={`h-7 px-3 text-xs rounded-lg transition-all whitespace-nowrap flex items-center justify-center ${
                    isActive
                      ? 'bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/20'
                      : 'text-on-surface-variant dark:text-white/70 hover:text-white font-medium'
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>

        </div>

        {/* Right Side: Search Input */}
        <div className="relative w-full md:w-64 h-9 flex items-center">
          <Search className="w-4 h-4 absolute left-3 text-emerald-500 pointer-events-none" />
          <input
            type="text"
            placeholder="Cari nama pequrban..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-full pl-9 pr-3 rounded-xl bg-surface-variant/80 border border-outline/60 text-xs text-on-surface dark:text-white outline-none focus:border-emerald-500 placeholder:text-on-surface-variant/50 transition-all"
          />
        </div>

      </div>

      {/* ─── GROUPED TABLE DISPLAY (ACCORDION) ────────────────────────────── */}
      <QurbanGroupAccordion
        groups={filteredGroups}
        ungroupedList={filteredUngroupedKambing}
        canEdit={canEdit}
        onEdit={handleEdit}
        onDelete={handleDeleteClick}
        onDetail={handleDetail}
        onAddMemberToGroup={handleAddMemberToGroup}
      />

      {/* ─── MODALS ───────────────────────────────────────────────────────── */}
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
};

export default QurbanPage;
