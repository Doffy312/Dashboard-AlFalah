import { useState } from 'react';
import StatusBadge from '../common/StatusBadge';
import { ChevronDown, ChevronUp, Edit2, Trash2, Eye, UserPlus, Users } from 'lucide-react';

const QurbanGroupAccordion = ({
  groups = [],
  ungroupedList = [],
  canEdit = false,
  onEdit,
  onDelete,
  onDetail,
  onAddMemberToGroup,
}) => {
  const [openGroups, setOpenGroups] = useState({});

  const toggleGroup = (groupId) => {
    setOpenGroups((prev) => ({
      ...prev,
      [groupId]: prev[groupId] !== undefined ? !prev[groupId] : false, // Default open all if undefined
    }));
  };

  const isGroupOpen = (groupId) => {
    return openGroups[groupId] !== false; // Default true
  };

  return (
    <div className="flex flex-col gap-md">
      {/* ─── KELOMPOK SAPI SECTION ───────────────────────────────────────── */}
      {groups.map((group) => {
        const count = group.memberCount || 0;
        const maxCap = group.jenisHewan === 'Sapi' ? 7 : 1;
        const isFull = group.isFull || (group.jenisHewan === 'Sapi' && count >= 7);
        const percentage = Math.min(100, Math.round((count / maxCap) * 100));
        const isOpen = isGroupOpen(group.id);

        return (
          <div
            key={group.id}
            className="rounded-2xl bg-surface border border-outline/50 shadow-sm overflow-hidden transition-all hover:border-outline"
          >
            {/* Header Accordion */}
            <div
              onClick={() => toggleGroup(group.id)}
              className="p-md sm:p-lg bg-surface-variant/40 hover:bg-surface-variant/80 cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-md transition-colors"
            >
              <div className="flex items-center gap-md">
                <div className="p-3 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                  <span className="material-symbols-outlined text-[24px]">pets</span>
                </div>
                <div>
                  <div className="flex items-center gap-sm">
                    <h3 className="font-title-md font-bold text-on-surface dark:text-white m-0">
                      {group.namaKelompok}
                    </h3>
                    <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-300">
                      {group.jenisHewan}
                    </span>
                  </div>
                  <p className="text-xs text-on-surface-variant dark:text-white/60 m-0 mt-1 flex items-center gap-2">
                    <span>{count} / {maxCap} Anggota terdaftar</span>
                    {isFull && (
                      <span className="px-2 py-0.2 text-[10px] uppercase font-bold rounded bg-rose-500/20 text-rose-600 dark:text-rose-400">
                        PENUH (MAX 7)
                      </span>
                    )}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-md w-full sm:w-auto justify-between sm:justify-end">
                {/* Progress bar */}
                <div className="flex flex-col gap-1 w-32 sm:w-40">
                  <div className="flex justify-between text-[11px] font-medium text-on-surface-variant dark:text-white/70">
                    <span>Kapasitas</span>
                    <span>{count}/7 ({percentage}%)</span>
                  </div>
                  <div className="w-full bg-surface-variant dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 rounded-full ${
                        isFull
                          ? 'bg-rose-500'
                          : count >= 5
                          ? 'bg-amber-500'
                          : 'bg-emerald-500'
                      }`}
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>

                {canEdit && !isFull && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onAddMemberToGroup(group);
                    }}
                    className="py-1.5 px-3 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary font-label-sm transition-all flex items-center gap-1.5"
                    title="Tambah Pequrban ke Kelompok Ini"
                  >
                    <UserPlus size={14} />
                    <span className="hidden md:inline">Tambah</span>
                  </button>
                )}

                <div className="p-1 rounded-lg text-on-surface-variant">
                  {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </div>
              </div>
            </div>

            {/* Accordion Content Table */}
            {isOpen && (
              <div className="p-md sm:p-lg border-t border-outline/30">
                {group.members && group.members.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-outline/30 text-xs font-semibold text-on-surface-variant dark:text-white/60 uppercase">
                          <th className="py-sm px-md w-12">No</th>
                          <th className="py-sm px-md">Nama PeQurban</th>
                          <th className="py-sm px-md">No. HP</th>
                          <th className="py-sm px-md">Status</th>
                          <th className="py-sm px-md">Catatan</th>
                          <th className="py-sm px-md text-right">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-outline/20 text-sm">
                        {group.members.map((member, idx) => (
                          <tr
                            key={member.id}
                            className="hover:bg-surface-variant/30 transition-colors"
                          >
                            <td className="py-md px-md font-medium text-on-surface-variant dark:text-white/70">
                              {idx + 1}
                            </td>
                            <td className="py-md px-md">
                              <span className="font-semibold text-on-surface dark:text-white">
                                {member.jemaahName}
                              </span>
                            </td>
                            <td className="py-md px-md text-on-surface-variant dark:text-white/70">
                              {member.jemaahPhone || '-'}
                            </td>
                            <td className="py-md px-md">
                              <StatusBadge
                                type={
                                  member.status === 'Lunas'
                                    ? 'Active'
                                    : member.status === 'Selesai'
                                    ? 'Success'
                                    : 'Pending'
                                }
                                text={member.status}
                              />
                            </td>
                            <td className="py-md px-md text-on-surface-variant dark:text-white/70 max-w-[200px] truncate">
                              {member.catatan || '-'}
                            </td>
                            <td className="py-md px-md text-right">
                              <div className="flex items-center justify-end gap-1">
                                <button
                                  onClick={() => onDetail(member)}
                                  className="p-1.5 rounded-lg hover:bg-surface-variant text-on-surface-variant hover:text-primary transition-colors"
                                  title="Detail Pequrban"
                                >
                                  <Eye size={16} />
                                </button>
                                {canEdit && (
                                  <>
                                    <button
                                      onClick={() => onEdit(member)}
                                      className="p-1.5 rounded-lg hover:bg-surface-variant text-on-surface-variant hover:text-primary transition-colors"
                                      title="Edit Data"
                                    >
                                      <Edit2 size={16} />
                                    </button>
                                    <button
                                      onClick={() => onDelete(member)}
                                      className="p-1.5 rounded-lg hover:bg-rose-500/20 text-rose-500 transition-colors"
                                      title="Hapus Data"
                                    >
                                      <Trash2 size={16} />
                                    </button>
                                  </>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="py-lg text-center text-on-surface-variant dark:text-white/50 text-sm">
                    Belum ada anggota pequrban di kelompok ini.
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}

      {/* ─── KAMBING / PERORANGAN SECTION ──────────────────────────────────── */}
      {ungroupedList.length > 0 && (
        <div className="rounded-2xl bg-surface border border-outline/50 shadow-sm overflow-hidden mt-md">
          <div className="p-md sm:p-lg bg-blue-500/10 flex items-center justify-between border-b border-outline/30">
            <div className="flex items-center gap-md">
              <div className="p-3 rounded-xl bg-blue-500/20 text-blue-600 dark:text-blue-400">
                <span className="material-symbols-outlined text-[24px]">cruelty_free</span>
              </div>
              <div>
                <h3 className="font-title-md font-bold text-on-surface dark:text-white m-0">
                  Qurban Kambing / Domba (Perorangan)
                </h3>
                <p className="text-xs text-on-surface-variant dark:text-white/60 m-0 mt-0.5">
                  Total {ungroupedList.length} Ekor Kambing/Domba terdaftar
                </p>
              </div>
            </div>
          </div>

          <div className="p-md sm:p-lg overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-outline/30 text-xs font-semibold text-on-surface-variant dark:text-white/60 uppercase">
                  <th className="py-sm px-md w-12">No</th>
                  <th className="py-sm px-md">Nama PeQurban</th>
                  <th className="py-sm px-md">Jenis Hewan</th>
                  <th className="py-sm px-md">Status</th>
                  <th className="py-sm px-md">Catatan</th>
                  <th className="py-sm px-md text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline/20 text-sm">
                {ungroupedList.map((item, idx) => (
                  <tr
                    key={item.id}
                    className="hover:bg-surface-variant/30 transition-colors"
                  >
                    <td className="py-md px-md font-medium text-on-surface-variant dark:text-white/70">
                      {idx + 1}
                    </td>
                    <td className="py-md px-md font-semibold text-on-surface dark:text-white">
                      {item.jemaahName}
                    </td>
                    <td className="py-md px-md">
                      <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-blue-500/20 text-blue-700 dark:text-blue-300">
                        {item.jenisHewan}
                      </span>
                    </td>
                    <td className="py-md px-md">
                      <StatusBadge
                        type={
                          item.status === 'Lunas'
                            ? 'Active'
                            : item.status === 'Selesai'
                            ? 'Success'
                            : 'Pending'
                        }
                        text={item.status}
                      />
                    </td>
                    <td className="py-md px-md text-on-surface-variant dark:text-white/70 max-w-[200px] truncate">
                      {item.catatan || '-'}
                    </td>
                    <td className="py-md px-md text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => onDetail(item)}
                          className="p-1.5 rounded-lg hover:bg-surface-variant text-on-surface-variant hover:text-primary transition-colors"
                          title="Detail Pequrban"
                        >
                          <Eye size={16} />
                        </button>
                        {canEdit && (
                          <>
                            <button
                              onClick={() => onEdit(item)}
                              className="p-1.5 rounded-lg hover:bg-surface-variant text-on-surface-variant hover:text-primary transition-colors"
                              title="Edit Data"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button
                              onClick={() => onDelete(item)}
                              className="p-1.5 rounded-lg hover:bg-rose-500/20 text-rose-500 transition-colors"
                              title="Hapus Data"
                            >
                              <Trash2 size={16} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {groups.length === 0 && ungroupedList.length === 0 && (
        <div className="py-xl text-center p-xl rounded-2xl bg-surface border border-outline/50 flex flex-col items-center justify-center gap-sm">
          <div className="p-4 rounded-full bg-surface-variant text-on-surface-variant/50">
            <Users size={32} />
          </div>
          <h4 className="font-title-md font-bold text-on-surface dark:text-white m-0">
            Belum Ada Data Pequrban
          </h4>
          <p className="text-sm text-on-surface-variant dark:text-white/60 m-0 max-w-md">
            Belum ada jemaah yang terdaftar sebagai pequrban untuk tahun ini. Klik tombol Tambah PeQurban di atas untuk mendaftarkan jemaah.
          </p>
        </div>
      )}
    </div>
  );
};

export default QurbanGroupAccordion;
