import { useMemo } from 'react';
import { formatCurrency } from '../../lib/utils';
import { Calendar, User, Edit2, Trash2, ArrowRight, Eye } from 'lucide-react';
import { useSettings } from '../../contexts/SettingsContext';

const getColumnColorConfig = (status = '') => {
  const s = status.toLowerCase();
  if (s === 'direncanakan') {
    return { colorClass: 'bg-blue-500/10 border-blue-500/20', textClass: 'text-blue-600 dark:text-blue-400' };
  }
  if (s === 'sedang berjalan' || s === 'berjalan') {
    return { colorClass: 'bg-amber-500/10 border-amber-500/20', textClass: 'text-amber-600 dark:text-amber-400' };
  }
  if (s === 'selesai') {
    return { colorClass: 'bg-emerald-500/10 border-emerald-500/20', textClass: 'text-emerald-600 dark:text-emerald-400' };
  }
  if (s === 'dibatalkan') {
    return { colorClass: 'bg-rose-500/10 border-rose-500/20', textClass: 'text-rose-600 dark:text-rose-400' };
  }
  if (s === 'ditunda') {
    return { colorClass: 'bg-orange-500/10 border-orange-500/20', textClass: 'text-orange-600 dark:text-orange-400' };
  }
  return { colorClass: 'bg-purple-500/10 border-purple-500/20', textClass: 'text-purple-600 dark:text-purple-400' };
};

const KanbanCard = ({ program, onEdit, onDelete, onStatusChange, onViewDetail, isKetua, canStatusChange, canEdit, columns = [] }) => {
  const getNextStatus = (current) => {
    const currentIndex = columns.findIndex(c => c.status === current);
    if (currentIndex >= 0 && currentIndex < columns.length - 1) {
      return columns[currentIndex + 1].status;
    }
    return null;
  };

  const nextStatus = getNextStatus(program.status);
  const isDateModified = Boolean(
    program.originalDate &&
    program.date &&
    program.originalDate.split('T')[0] !== program.date.split('T')[0]
  );

  const showEditDelete = isKetua ?? canEdit;
  const showStatusButton = canStatusChange ?? isKetua ?? canEdit;

  const getActionLabel = (next) => {
    if (next === 'Sedang Berjalan' || next === 'Berjalan') return 'Mulai';
    if (next === 'Selesai') return 'Selesai';
    return next;
  };

  return (
    <div className="bg-surface-variant border border-outline backdrop-blur-md rounded-xl p-4 shadow-sm hover:shadow-md transition-all hover:-translate-y-1 group">
      <div className="flex justify-between items-start gap-2 mb-2">
        <h4 className="text-sm font-semibold text-on-surface dark:text-white leading-snug m-0">{program.name}</h4>
        
        <div className="flex gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity shrink-0">
          {program.status === 'Selesai' && onViewDetail && (
            <button onClick={() => onViewDetail(program)} className="p-1 rounded bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 transition-colors" title="Lihat Detail">
              <Eye size={14} />
            </button>
          )}
          {showEditDelete && (
            <>
              <button onClick={() => onEdit(program)} className="p-1 rounded bg-surface border border-outline hover:bg-surface-variant text-on-surface-variant transition-colors" title="Edit">
                <Edit2 size={14} />
              </button>
              <button onClick={() => onDelete(program)} className="p-1 rounded bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 transition-colors" title="Hapus">
                <Trash2 size={14} />
              </button>
            </>
          )}
        </div>
      </div>
      
      <p className="text-[12px] text-on-surface-variant/80 dark:text-white/60 mb-3 line-clamp-2 leading-relaxed">
        {program.description}
      </p>

      <div className="space-y-1.5 mb-3">
        <div className="flex items-center gap-1.5 text-on-surface-variant dark:text-white/70 text-[12px]">
          <User size={13} className="text-primary shrink-0" />
          <span>{program.pic}</span>
        </div>
        <div className="flex items-center flex-wrap gap-1.5 text-on-surface-variant dark:text-white/70 text-[12px]">
          <div className="flex items-center gap-1.5">
            <Calendar size={13} className="text-primary shrink-0" />
            <span>{new Date(program.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
          </div>
          {isDateModified && (
            <span 
              className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30"
              title={`Jadwal awal: ${new Date(program.originalDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}`}
            >
              (Diubah)
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between mt-auto pt-sm border-t border-white/20 dark:border-white/10">
        <span className="font-label-md text-primary dark:text-primary-fixed">{formatCurrency(program.budget)}</span>
        
        {showStatusButton && nextStatus && (
          <button 
            onClick={() => onStatusChange(program.id, nextStatus)}
            className="flex items-center gap-1 text-[11px] font-label-sm px-2 py-1 rounded bg-surface border border-outline hover:bg-primary hover:text-white text-on-surface-variant transition-colors"
            title={`Pindahkan ke ${nextStatus}`}
          >
            {getActionLabel(nextStatus)}
            <ArrowRight size={12} />
          </button>
        )}
      </div>
    </div>
  );
};

const KanbanBoard = ({ programs, onEdit, onDelete, onStatusChange, onViewDetail, isKetua, canStatusChange, canEdit }) => {
  const { customData } = useSettings();

  const columns = useMemo(() => {
    const configured = customData?.prokerStatus || [];
    const fallback = ['Direncanakan', 'Sedang Berjalan', 'Selesai', 'Dibatalkan'];
    // Use configured statuses as primary source; fallback only if nothing is configured
    const baseList = configured.length > 0 ? [...configured] : [...fallback];

    // Auto-detect any program statuses not yet in the list to prevent data loss
    const programStatuses = programs.map(p => p.status).filter(Boolean);
    const allStatuses = Array.from(new Set([...baseList, ...programStatuses]));

    return allStatuses.map(status => ({
      title: status,
      status: status,
      ...getColumnColorConfig(status)
    }));
  }, [customData?.prokerStatus, programs]);

  return (
    <div className="flex flex-col lg:flex-row gap-lg w-full items-start overflow-x-auto pb-4">
      {columns.map(col => {
        const colPrograms = programs.filter(p => p.status === col.status);
        return (
          <div key={col.status} className={`flex-1 min-w-[280px] w-full min-h-[200px] lg:min-h-[500px] rounded-2xl border ${col.colorClass} p-sm flex flex-col gap-sm`}>
            <div className="px-sm py-xs flex justify-between items-center border-b border-inherit mb-xs">
              <h3 className={`font-label-lg font-bold m-0 ${col.textClass}`}>{col.title}</h3>
              <span className={`px-2 py-0.5 rounded-full text-[12px] font-bold bg-surface border border-outline ${col.textClass}`}>
                {colPrograms.length}
              </span>
            </div>
            
            <div className="flex flex-col gap-sm overflow-y-auto max-h-[600px] pr-1 styled-scrollbar">
              {colPrograms.map(program => (
                <KanbanCard 
                  key={program.id} 
                  program={program} 
                  onEdit={onEdit} 
                  onDelete={onDelete} 
                  onStatusChange={onStatusChange} 
                  onViewDetail={onViewDetail}
                  isKetua={isKetua}
                  canStatusChange={canStatusChange}
                  canEdit={canEdit}
                  columns={columns}
                />
              ))}
              {colPrograms.length === 0 && (
                <div className="py-xl text-center border-2 border-dashed border-outline rounded-xl text-on-surface-variant/50">
                  <p className="font-body-sm m-0">Kosong</p>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default KanbanBoard;
