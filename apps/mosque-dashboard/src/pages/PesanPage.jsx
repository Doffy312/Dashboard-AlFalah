import { useState, useMemo } from 'react';
import { 
  useContactMessages, 
  useUpdateMessageStatus, 
  useDeleteMessage 
} from '../hooks/useContactMessages';

export default function PesanPage() {
  const { data: messages = [], isLoading, isError } = useContactMessages();
  const updateStatusMutation = useUpdateMessageStatus();
  const deleteMessageMutation = useDeleteMessage();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [deleteTargetId, setDeleteTargetId] = useState(null);

  // Filter Computation
  const filteredMessages = useMemo(() => {
    return messages.filter((msg) => {
      const matchStatus = statusFilter === 'ALL' || msg.status === statusFilter;
      const term = searchTerm.toLowerCase();
      const matchSearch = 
        !searchTerm ||
        msg.fullName?.toLowerCase().includes(term) ||
        msg.email?.toLowerCase().includes(term) ||
        msg.whatsapp?.toLowerCase().includes(term) ||
        msg.subject?.toLowerCase().includes(term) ||
        msg.message?.toLowerCase().includes(term);

      return matchStatus && matchSearch;
    });
  }, [messages, statusFilter, searchTerm]);

  // Statistics
  const stats = useMemo(() => {
    const total = messages.length;
    const baru = messages.filter((m) => m.status === 'Baru').length;
    const dibaca = messages.filter((m) => m.status === 'Dibaca').length;
    const selesai = messages.filter((m) => m.status === 'Selesai').length;
    return { total, baru, dibaca, selesai };
  }, [messages]);

  const handleOpenDetail = (msg) => {
    setSelectedMessage(msg);
    // If message is new, mark as read automatically when opened
    if (msg.status === 'Baru') {
      updateStatusMutation.mutate({ id: msg.id, status: 'Dibaca' });
    }
  };

  const handleStatusChange = (id, newStatus) => {
    updateStatusMutation.mutate({ id, status: newStatus }, {
      onSuccess: () => {
        if (selectedMessage && selectedMessage.id === id) {
          setSelectedMessage((prev) => prev ? { ...prev, status: newStatus } : null);
        }
      }
    });
  };

  const handleDeleteConfirm = () => {
    if (!deleteTargetId) return;
    deleteMessageMutation.mutate(deleteTargetId, {
      onSuccess: () => {
        if (selectedMessage && selectedMessage.id === deleteTargetId) {
          setSelectedMessage(null);
        }
        setDeleteTargetId(null);
      }
    });
  };

  const formatWAUrl = (whatsapp, name, subject) => {
    if (!whatsapp) return '#';
    let cleaned = whatsapp.replace(/\D/g, '');
    if (cleaned.startsWith('0')) {
      cleaned = '62' + cleaned.substring(1);
    }
    const text = encodeURIComponent(`Assalamu'alaikum Wr. Wb. Halo Sdr/i ${name}, menindaklanjuti pesan Anda di Portal Masjid Al-Falah mengenai *${subject}*...`);
    return `https://wa.me/${cleaned}?text=${text}`;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-on-surface flex items-center gap-2.5">
            <span className="material-symbols-outlined text-primary text-3xl">mark_email_unread</span>
            Pesan &amp; Masukan Jemaah
          </h1>
          <p className="text-xs sm:text-sm text-on-surface-variant mt-1">
            Kelola pesan masuk, pertanyaan, dan masukan jemaah dari portal landing page.
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-surface border border-outline-variant rounded-2xl p-3.5 sm:p-5 flex flex-col justify-between shadow-sm">
          <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
            <div className="w-7 h-7 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-base sm:text-2xl">mail</span>
            </div>
            <div className="text-xs sm:text-sm text-on-surface-variant font-medium leading-tight">Total Pesan</div>
          </div>
          <div>
            <div className="text-lg sm:text-2xl font-bold text-on-surface">{stats.total}</div>
          </div>
        </div>

        <div className="bg-surface border border-outline-variant rounded-2xl p-3.5 sm:p-5 flex flex-col justify-between shadow-sm">
          <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
            <div className="w-7 h-7 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-amber-500/15 text-amber-500 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-base sm:text-2xl">mark_email_unread</span>
            </div>
            <div className="text-xs sm:text-sm text-on-surface-variant font-medium leading-tight">Belum Dibaca (Baru)</div>
          </div>
          <div>
            <div className="text-lg sm:text-2xl font-bold text-amber-400">{stats.baru}</div>
          </div>
        </div>

        <div className="bg-surface border border-outline-variant rounded-2xl p-3.5 sm:p-5 flex flex-col justify-between shadow-sm">
          <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
            <div className="w-7 h-7 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-blue-500/15 text-blue-400 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-base sm:text-2xl">mark_email_read</span>
            </div>
            <div className="text-xs sm:text-sm text-on-surface-variant font-medium leading-tight">Sudah Dibaca</div>
          </div>
          <div>
            <div className="text-lg sm:text-2xl font-bold text-blue-400">{stats.dibaca}</div>
          </div>
        </div>

        <div className="bg-surface border border-outline-variant rounded-2xl p-3.5 sm:p-5 flex flex-col justify-between shadow-sm">
          <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
            <div className="w-7 h-7 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-base sm:text-2xl">task_alt</span>
            </div>
            <div className="text-xs sm:text-sm text-on-surface-variant font-medium leading-tight">Telah Selesai</div>
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
            placeholder="Cari pengirim, email, WhatsApp, subjek..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-surface-variant/50 border border-outline-variant rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-on-surface placeholder:text-on-surface-variant outline-none focus:border-primary transition-all"
          />
        </div>

        {/* Status Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 bg-surface-variant/40 p-1 rounded-xl border border-outline-variant/40 shrink-0">
          {[
            { label: 'Semua', value: 'ALL' },
            { label: 'Baru', value: 'Baru' },
            { label: 'Dibaca', value: 'Dibaca' },
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
      </div>

      {/* Data Table / List */}
      <div className="bg-surface border border-outline-variant rounded-2xl overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="p-8 text-center space-y-3">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-on-surface-variant">Memuat data pesan masuk...</p>
          </div>
        ) : isError ? (
          <div className="p-8 text-center text-error space-y-2">
            <span className="material-symbols-outlined text-3xl">error</span>
            <p className="text-sm font-semibold">Gagal memuat pesan jemaah.</p>
          </div>
        ) : filteredMessages.length === 0 ? (
          <div className="p-12 text-center text-on-surface-variant space-y-3">
            <span className="material-symbols-outlined text-4xl text-on-surface-variant/50">inbox</span>
            <p className="text-sm font-semibold text-on-surface">Tidak ada pesan ditemukan</p>
            <p className="text-xs max-w-sm mx-auto">
              {searchTerm || statusFilter !== 'ALL' 
                ? 'Coba sesuaikan kata kunci pencarian atau filter status Anda.' 
                : 'Belum ada pesan yang dikirimkan oleh jemaah melalui formulir landing page.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-outline-variant bg-surface-variant/30 text-[11px] uppercase tracking-wider text-on-surface-variant font-bold">
                  <th className="py-3.5 px-4 sm:px-6">Pengirim</th>
                  <th className="py-3.5 px-4">Subjek &amp; Pratinjau Pesan</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Tanggal Masuk</th>
                  <th className="py-3.5 px-4 sm:px-6 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/60 text-xs sm:text-sm">
                {filteredMessages.map((msg) => {
                  const isNew = msg.status === 'Baru';
                  return (
                    <tr 
                      key={msg.id} 
                      className={`hover:bg-surface-variant/40 transition-colors ${isNew ? 'bg-amber-500/5 font-medium' : ''}`}
                    >
                      {/* Pengirim */}
                      <td className="py-4 px-4 sm:px-6">
                        <div className="font-bold text-on-surface flex items-center gap-2">
                          {isNew && <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0 animate-pulse" />}
                          <span>{msg.fullName}</span>
                        </div>
                        <div className="text-[11px] text-on-surface-variant space-y-0.5 mt-0.5">
                          <div>{msg.email}</div>
                          <div className="font-mono text-emerald-400">{msg.whatsapp}</div>
                        </div>
                      </td>

                      {/* Subjek & Pesan */}
                      <td className="py-4 px-4 max-w-xs sm:max-w-md">
                        <div className="font-semibold text-primary truncate">{msg.subject}</div>
                        <div className="text-xs text-on-surface-variant line-clamp-2 mt-0.5 leading-relaxed">
                          {msg.message}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        {msg.status === 'Baru' && (
                          <span className="px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30 text-[11px] font-bold inline-flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                            Baru
                          </span>
                        )}
                        {msg.status === 'Dibaca' && (
                          <span className="px-2.5 py-1 rounded-full bg-blue-500/15 text-blue-400 border border-blue-500/30 text-[11px] font-bold">
                            Dibaca
                          </span>
                        )}
                        {msg.status === 'Selesai' && (
                          <span className="px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[11px] font-bold">
                            Selesai
                          </span>
                        )}
                      </td>

                      {/* Tanggal */}
                      <td className="py-4 px-4 text-xs text-on-surface-variant whitespace-nowrap">
                        {formatDate(msg.createdAt)}
                      </td>

                      {/* Aksi */}
                      <td className="py-4 px-4 sm:px-6 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenDetail(msg)}
                            className="px-3 py-1.5 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary font-bold text-xs flex items-center gap-1 transition-all"
                            title="Baca Pesan Lengkap"
                          >
                            <span className="material-symbols-outlined text-base">visibility</span>
                            <span>Detail</span>
                          </button>

                          <a
                            href={formatWAUrl(msg.whatsapp, msg.fullName, msg.subject)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-2.5 py-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 border border-emerald-500/30 text-xs font-bold transition-all flex items-center gap-1"
                            title="Balas via WhatsApp"
                          >
                            <span className="material-symbols-outlined text-base">chat</span>
                            <span className="hidden sm:inline">WA</span>
                          </a>

                          <button
                            onClick={() => setDeleteTargetId(msg.id)}
                            className="p-1.5 rounded-lg text-on-surface-variant hover:text-error hover:bg-error/10 transition-colors"
                            title="Hapus Pesan"
                          >
                            <span className="material-symbols-outlined text-lg">delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* DETAIL MODAL */}
      {selectedMessage && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-surface border border-outline-variant rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl animate-fade-in my-8">
            {/* Modal Header */}
            <div className="p-6 border-b border-outline-variant bg-surface-variant/30 flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2.5 py-0.5 rounded-full bg-primary/15 text-primary text-xs font-bold border border-primary/30">
                    {selectedMessage.subject}
                  </span>
                  <span className="text-xs text-on-surface-variant">
                    {formatDate(selectedMessage.createdAt)}
                  </span>
                </div>
                <h2 className="text-xl font-bold text-on-surface">{selectedMessage.fullName}</h2>
              </div>
              <button
                onClick={() => setSelectedMessage(null)}
                className="p-2 rounded-full text-on-surface-variant hover:text-on-surface hover:bg-surface-variant transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
              {/* Sender Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-surface-variant/40 border border-outline-variant/60">
                <div>
                  <span className="text-[11px] text-on-surface-variant block font-medium">Nama Lengkap</span>
                  <span className="text-xs sm:text-sm font-bold text-on-surface mt-0.5 block">{selectedMessage.fullName}</span>
                </div>
                <div>
                  <span className="text-[11px] text-on-surface-variant block font-medium">Email</span>
                  <a href={`mailto:${selectedMessage.email}`} className="text-xs sm:text-sm font-bold text-primary hover:underline mt-0.5 block truncate">
                    {selectedMessage.email}
                  </a>
                </div>
                <div>
                  <span className="text-[11px] text-on-surface-variant block font-medium">WhatsApp</span>
                  <a 
                    href={formatWAUrl(selectedMessage.whatsapp, selectedMessage.fullName, selectedMessage.subject)}
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-xs sm:text-sm font-bold text-emerald-400 hover:underline mt-0.5 block"
                  >
                    {selectedMessage.whatsapp} ↗
                  </a>
                </div>
              </div>

              {/* Message Content Body */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Isi Pesan / Masukan</span>
                <div className="p-5 rounded-2xl bg-surface-variant/20 border border-outline-variant/40 text-sm text-on-surface leading-relaxed whitespace-pre-wrap">
                  {selectedMessage.message}
                </div>
              </div>

              {/* Status Manager */}
              <div className="p-4 rounded-2xl bg-surface-variant/30 border border-outline-variant/50 space-y-2">
                <span className="text-xs font-bold text-on-surface-variant">Ubah Status Tindak Lanjut:</span>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleStatusChange(selectedMessage.id, 'Baru')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      selectedMessage.status === 'Baru'
                        ? 'bg-amber-500 text-slate-950 shadow-md'
                        : 'bg-surface border border-outline-variant text-on-surface-variant hover:text-on-surface'
                    }`}
                  >
                    Baru
                  </button>
                  <button
                    onClick={() => handleStatusChange(selectedMessage.id, 'Dibaca')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      selectedMessage.status === 'Dibaca'
                        ? 'bg-blue-500 text-white shadow-md'
                        : 'bg-surface border border-outline-variant text-on-surface-variant hover:text-on-surface'
                    }`}
                  >
                    Dibaca
                  </button>
                  <button
                    onClick={() => handleStatusChange(selectedMessage.id, 'Selesai')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      selectedMessage.status === 'Selesai'
                        ? 'bg-emerald-500 text-slate-950 shadow-md'
                        : 'bg-surface border border-outline-variant text-on-surface-variant hover:text-on-surface'
                    }`}
                  >
                    Selesai
                  </button>
                </div>
              </div>
            </div>

            {/* Modal Footer Actions */}
            <div className="p-6 border-t border-outline-variant bg-surface-variant/30 flex flex-wrap items-center justify-between gap-3">
              <button
                onClick={() => setDeleteTargetId(selectedMessage.id)}
                className="px-4 py-2 rounded-xl bg-error/15 text-error hover:bg-error/25 font-bold text-xs transition-all flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-base">delete</span>
                <span>Hapus Pesan</span>
              </button>

              <div className="flex items-center gap-2">
                <a
                  href={formatWAUrl(selectedMessage.whatsapp, selectedMessage.fullName, selectedMessage.subject)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs tracking-wide flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition-all"
                >
                  <span className="material-symbols-outlined text-lg">chat</span>
                  <span>Balas via WhatsApp</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE MODAL */}
      {deleteTargetId && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface border border-outline-variant rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl animate-scale-in">
            <div className="flex items-center gap-3 text-error">
              <div className="w-10 h-10 rounded-full bg-error/15 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined">warning</span>
              </div>
              <h3 className="text-lg font-bold text-on-surface">Konfirmasi Hapus</h3>
            </div>
            <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed">
              Apakah Anda yakin ingin menghapus pesan ini? Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setDeleteTargetId(null)}
                className="px-4 py-2 rounded-xl bg-surface-variant text-on-surface font-semibold text-xs hover:bg-surface-variant/80 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 rounded-xl bg-error text-white font-bold text-xs hover:bg-error/90 transition-colors shadow-md"
              >
                Hapus Sekarang
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
