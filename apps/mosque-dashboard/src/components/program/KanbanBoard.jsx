import { formatCurrency } from '../../lib/utils';
import { Calendar, User, Edit2, Trash2, ArrowRight, Eye } from 'lucide-react';

const KanbanCard = ({ program, onEdit, onDelete, onStatusChange, onViewDetail, canEdit }) => {
  const getNextStatus = (current) => {
    if (current === 'Direncanakan') return 'Sedang Berjalan';
    if (current === 'Sedang Berjalan') return 'Selesai';
    return null;
  };

  const nextStatus = getNextStatus(program.status);

  return (
    <div className="bg-surface-variant border border-outline backdrop-blur-md rounded-xl p-md shadow-sm hover:shadow-md transition-all hover:-translate-y-1 group">
      <div className="flex justify-between items-start mb-sm">
        <h4 className="font-title-md text-title-md text-on-surface dark:text-white leading-tight m-0">{program.name}</h4>
        
        {canEdit && (
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {program.status === 'Selesai' && onViewDetail && (
              <button onClick={() => onViewDetail(program)} className="p-1 rounded bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 transition-colors" title="Lihat Detail">
                <Eye size={14} />
              </button>
            )}
            <button onClick={() => onEdit(program)} className="p-1 rounded bg-surface border border-outline hover:bg-surface-variant text-on-surface-variant transition-colors" title="Edit">
              <Edit2 size={14} />
            </button>
            <button onClick={() => onDelete(program)} className="p-1 rounded bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 transition-colors" title="Hapus">
              <Trash2 size={14} />
            </button>
          </div>
        )}
      </div>
      
      <p className="font-body-sm text-[12px] text-on-surface-variant/80 dark:text-white/60 mb-md line-clamp-2 leading-relaxed">
        {program.description}
      </p>

      <div className="space-y-2 mb-md">
        <div className="flex items-center gap-xs text-on-surface-variant dark:text-white/70 font-label-sm">
          <User size={14} className="text-primary" />
          <span>{program.pic}</span>
        </div>
        <div className="flex items-center gap-xs text-on-surface-variant dark:text-white/70 font-label-sm">
          <Calendar size={14} className="text-primary" />
          <span>{new Date(program.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
        </div>
      </div>

      <div className="flex items-center justify-between mt-auto pt-sm border-t border-white/20 dark:border-white/10">
        <span className="font-label-md text-primary dark:text-primary-fixed">{formatCurrency(program.budget)}</span>
        
        {canEdit && nextStatus && (
          <button 
            onClick={() => onStatusChange(program.id, nextStatus)}
            className="flex items-center gap-1 text-[11px] font-label-sm px-2 py-1 rounded bg-surface border border-outline hover:bg-primary hover:text-white text-on-surface-variant transition-colors"
            title={`Pindahkan ke ${nextStatus}`}
          >
            {nextStatus === 'Sedang Berjalan' ? 'Mulai' : 'Selesai'}
            <ArrowRight size={12} />
          </button>
        )}
      </div>
    </div>
  );
};

const KanbanBoard = ({ programs, onEdit, onDelete, onStatusChange, onViewDetail, canEdit }) => {
  const columns = [
    { title: 'Direncanakan', status: 'Direncanakan', colorClass: 'bg-blue-500/10 border-blue-500/20', textClass: 'text-blue-600 dark:text-blue-400' },
    { title: 'Sedang Berjalan', status: 'Sedang Berjalan', colorClass: 'bg-amber-500/10 border-amber-500/20', textClass: 'text-amber-600 dark:text-amber-400' },
    { title: 'Selesai', status: 'Selesai', colorClass: 'bg-emerald-500/10 border-emerald-500/20', textClass: 'text-emerald-600 dark:text-emerald-400' }
  ];

  return (
    <div className="flex flex-col lg:flex-row gap-lg w-full items-start">
      {columns.map(col => {
        const colPrograms = programs.filter(p => p.status === col.status);
        return (
          <div key={col.status} className={`flex-1 w-full min-h-[500px] rounded-2xl border ${col.colorClass} p-sm flex flex-col gap-sm`}>
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
                  canEdit={canEdit}
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
