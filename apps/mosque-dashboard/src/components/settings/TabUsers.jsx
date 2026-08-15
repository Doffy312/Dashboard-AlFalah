import { useState, useEffect } from 'react';
import { useUsers, useCreateUser, useDeleteUser, useUpdateUserRole, useResendVerification } from '../../hooks/useUsers';

const ROLES = ['Ketua', 'Sekretaris', 'Bendahara', 'Pengurus'];

const TabUsers = ({ tabDataRef }) => {
  // Users tab doesn't persist to localStorage settings, so return null from ref
  useEffect(() => {
    if (tabDataRef) {
      tabDataRef.current = () => null;
    }
  }, [tabDataRef]);

  const { data: users = [], isLoading } = useUsers();
  const createMutation = useCreateUser();
  const deleteMutation = useDeleteUser();
  const updateRoleMutation = useUpdateUserRole();
  const resendMutation = useResendVerification();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: 'Pengurus' });
  const [editingUserId, setEditingUserId] = useState(null);
  const [actionMessage, setActionMessage] = useState(null);

  const showMessage = (msg, type = 'success') => {
    setActionMessage({ text: msg, type });
    setTimeout(() => setActionMessage(null), 4000);
  };

  const handleAddUser = (e) => {
    e.preventDefault();
    createMutation.mutate(newUser, {
      onSuccess: () => {
        setIsModalOpen(false);
        setNewUser({ name: '', email: '', password: '', role: 'Pengurus' });
        showMessage('Pengguna baru berhasil ditambahkan! Email undangan & verifikasi telah dikirim.');
      },
      onError: (err) => {
        showMessage(err.message || 'Gagal menambahkan pengguna.', 'error');
      }
    });
  };

  const handleResendEmail = (userItem) => {
    resendMutation.mutate(userItem.id, {
      onSuccess: () => {
        showMessage(`Email verifikasi berhasil dikirim ulang ke ${userItem.email}`);
      },
      onError: (err) => {
        showMessage(err.message || 'Gagal mengirim ulang email verifikasi.', 'error');
      }
    });
  };

  const handleDelete = (id) => {
    if (window.confirm('Yakin ingin menghapus pengguna ini? Tindakan ini tidak dapat dibatalkan.')) {
      deleteMutation.mutate(id, {
        onSuccess: () => showMessage('Pengguna berhasil dihapus.'),
        onError: (err) => showMessage(err.message || 'Gagal menghapus pengguna.', 'error')
      });
    }
  };

  const handleRoleChange = (id, newRole) => {
    updateRoleMutation.mutate({ id, role: newRole }, {
      onSuccess: () => showMessage('Peran pengguna berhasil diperbarui.'),
      onError: (err) => showMessage(err.message || 'Gagal memperbarui peran.', 'error')
    });
    setEditingUserId(null);
  };

  return (
    <div className="flex flex-col gap-5 animate-in fade-in duration-300 relative h-full">
      {/* Toast Notification */}
      {actionMessage && (
        <div className={`p-3.5 sm:p-4 rounded-xl flex items-center justify-between gap-3 text-xs sm:text-sm font-medium ${
          actionMessage.type === 'success' ? 'bg-primary/20 text-primary border border-primary/30' : 'bg-error/20 text-error border border-error/30'
        }`}>
          <div className="flex items-center gap-2 min-w-0">
            <span className="material-symbols-outlined text-[20px] shrink-0">
              {actionMessage.type === 'success' ? 'check_circle' : 'error'}
            </span>
            <span className="break-words">{actionMessage.text}</span>
          </div>
          <button onClick={() => setActionMessage(null)} className="opacity-70 hover:opacity-100 p-1 shrink-0">
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>
      )}

      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-outline-variant pb-4 mb-1">
        <div>
          <h3 className="text-title-md font-bold text-on-surface m-0">Manajemen Pengguna</h3>
          <p className="text-body-sm text-on-surface-variant m-0 mt-1">
            Kelola akses, peran, dan status verifikasi akun pengurus.
          </p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-primary hover:bg-primary/90 text-white px-4 py-2.5 rounded-xl font-label-md flex items-center justify-center gap-2 transition-all shadow-lg shadow-primary/20 shrink-0 w-full sm:w-auto"
        >
          <span className="material-symbols-outlined text-[18px]">person_add</span>
          Tambah Pengguna
        </button>
      </div>

      {/* Mobile View: Dedicated Responsive Cards (< md breakpoint) */}
      <div className="block md:hidden space-y-3">
        {isLoading ? (
          <div className="text-center py-8 text-on-surface-variant text-sm">
            Memuat data pengguna...
          </div>
        ) : users.map(user => (
          <div key={user.id} className="p-4 rounded-xl glass-panel border border-outline-variant/60 space-y-3 shadow-sm">
            {/* Top Row: Avatar Initials, Name & Role Badge */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-full bg-primary/15 text-primary flex items-center justify-center font-bold text-sm shrink-0">
                  {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="min-w-0">
                  <h4 className="font-bold text-on-surface text-sm sm:text-base m-0 truncate">{user.name}</h4>
                  <p className="text-xs text-on-surface-variant flex items-center gap-1 mt-0.5 break-all">
                    <span className="material-symbols-outlined text-[13px] shrink-0">mail</span>
                    <span className="truncate">{user.email}</span>
                  </p>
                </div>
              </div>

              {editingUserId === user.id ? (
                <select
                  autoFocus
                  value={user.role}
                  onChange={(e) => handleRoleChange(user.id, e.target.value)}
                  onBlur={() => setEditingUserId(null)}
                  className="bg-surface text-on-surface border border-outline-variant rounded-lg px-2 py-1 text-xs focus:border-primary shrink-0"
                >
                  {ROLES.map(r => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              ) : (
                <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold shrink-0 ${
                  user.role === 'Ketua' ? 'bg-error/20 text-error' :
                  user.role === 'Bendahara' ? 'bg-[#d97706]/20 text-[#d97706]' :
                  'bg-primary/20 text-primary'
                }`}>
                  {user.role}
                </span>
              )}
            </div>

            {/* Middle Row: Verification Status */}
            <div className="flex items-center justify-between text-xs pt-2 border-t border-outline-variant/30">
              <span className="text-on-surface-variant font-medium">Status Verifikasi:</span>
              {user.emailVerified ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  <span className="material-symbols-outlined text-[13px]">verified</span>
                  Terverifikasi
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
                  <span className="material-symbols-outlined text-[13px]">pending_actions</span>
                  Belum Verifikasi
                </span>
              )}
            </div>

            {/* Bottom Row: Mobile Touch Action Buttons */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-outline-variant/30">
              {!user.emailVerified && (
                <button
                  className="flex items-center gap-1 text-amber-400 hover:text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors"
                  title="Kirim Ulang Email Verifikasi"
                  onClick={() => handleResendEmail(user)}
                  disabled={resendMutation.isPending}
                >
                  <span className="material-symbols-outlined text-[16px]">forward_to_inbox</span>
                  <span>Verifikasi</span>
                </button>
              )}
              <button 
                className="flex items-center gap-1 text-on-surface-variant hover:text-primary bg-surface-variant/40 hover:bg-surface-variant/80 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors"
                title="Ubah Role"
                onClick={() => setEditingUserId(user.id)}
              >
                <span className="material-symbols-outlined text-[16px]">edit</span>
                <span>Peran</span>
              </button>
              <button 
                className="flex items-center gap-1 text-error/80 hover:text-error bg-error/10 hover:bg-error/20 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors"
                title="Hapus Pengguna"
                onClick={() => handleDelete(user.id)}
              >
                <span className="material-symbols-outlined text-[16px]">delete</span>
                <span>Hapus</span>
              </button>
            </div>
          </div>
        ))}
        {!isLoading && users.length === 0 && (
          <div className="text-center py-8 text-on-surface-variant text-sm">
            Tidak ada data pengguna.
          </div>
        )}
      </div>

      {/* Desktop View: Full Data Table (>= md breakpoint) */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-outline-variant text-on-surface-variant font-label-md">
              <th className="py-3 px-4">Nama Lengkap</th>
              <th className="py-3 px-4">Email</th>
              <th className="py-3 px-4">Peran (Role)</th>
              <th className="py-3 px-4">Status Verifikasi</th>
              <th className="py-3 px-4 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan="5" className="text-center py-8 text-on-surface-variant">Memuat data pengguna...</td>
              </tr>
            ) : users.map(user => (
              <tr key={user.id} className="border-b border-outline-variant/50 glass-row">
                <td className="py-3 px-4 text-on-surface font-body-md font-medium">{user.name}</td>
                <td className="py-3 px-4 text-on-surface-variant text-sm">{user.email}</td>
                <td className="py-3 px-4">
                  {editingUserId === user.id ? (
                    <select
                      autoFocus
                      value={user.role}
                      onChange={(e) => handleRoleChange(user.id, e.target.value)}
                      onBlur={() => setEditingUserId(null)}
                      className="bg-surface text-on-surface border border-outline-variant rounded px-2 py-1 text-sm focus:border-primary"
                    >
                      {ROLES.map(r => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </select>
                  ) : (
                    <span className={`px-3 py-1 rounded-full text-[11px] font-bold ${
                      user.role === 'Ketua' ? 'bg-error/20 text-error' :
                      user.role === 'Bendahara' ? 'bg-[#d97706]/20 text-[#d97706]' :
                      'bg-primary/20 text-primary'
                    }`}>
                      {user.role}
                    </span>
                  )}
                </td>
                <td className="py-3 px-4">
                  {user.emailVerified ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                      <span className="material-symbols-outlined text-[14px]">verified</span>
                      Terverifikasi
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
                      <span className="material-symbols-outlined text-[14px]">pending_actions</span>
                      Belum Verifikasi
                    </span>
                  )}
                </td>
                <td className="py-3 px-4 text-right">
                  {!user.emailVerified && (
                    <button
                      className="text-amber-400 hover:text-amber-300 transition-colors p-1.5 rounded-lg hover:bg-amber-500/10 mr-1"
                      title="Kirim Ulang Email Verifikasi"
                      onClick={() => handleResendEmail(user)}
                      disabled={resendMutation.isPending}
                    >
                      <span className="material-symbols-outlined text-[18px]">forward_to_inbox</span>
                    </button>
                  )}
                  <button 
                    className="text-on-surface-variant hover:text-primary transition-colors p-1.5 rounded-lg hover:bg-surface-variant" 
                    title="Ubah Role"
                    onClick={() => setEditingUserId(user.id)}
                  >
                    <span className="material-symbols-outlined text-[18px]">edit</span>
                  </button>
                  <button 
                    className="text-on-surface-variant hover:text-error transition-colors p-1.5 rounded-lg hover:bg-error/10 ml-1" 
                    title="Hapus"
                    onClick={() => handleDelete(user.id)}
                  >
                    <span className="material-symbols-outlined text-[18px]">delete</span>
                  </button>
                </td>
              </tr>
            ))}
            {!isLoading && users.length === 0 && (
              <tr>
                <td colSpan="5" className="text-center py-8 text-on-surface-variant">Tidak ada data pengguna.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add User Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="glass-panel p-4 sm:p-6 w-[calc(100%-2rem)] max-w-md max-h-[90vh] overflow-y-auto rounded-2xl animate-in zoom-in-95 duration-200 shadow-2xl border border-outline bg-surface">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-title-md font-bold text-on-surface m-0">Tambah Pengguna Baru</h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-on-surface-variant hover:text-primary p-1 rounded-lg hover:bg-surface-variant"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="p-3 mb-4 rounded-lg bg-primary/10 border border-primary/20 text-xs text-primary flex items-start gap-2">
              <span className="material-symbols-outlined text-[18px] shrink-0">info</span>
              <span>Email undangan & link verifikasi akan otomatis dikirimkan. Pengguna akan mengatur kata sandi sendiri melalui link tersebut.</span>
            </div>

            <form onSubmit={handleAddUser} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="font-label-md text-on-surface font-medium">Nama Lengkap <span className="text-error">*</span></label>
                <input 
                  type="text" 
                  value={newUser.name}
                  onChange={e => setNewUser({...newUser, name: e.target.value})}
                  className="glass-input w-full px-4 py-2.5 rounded-lg text-on-surface font-body-md"
                  placeholder="Masukkan nama lengkap pengurus"
                  required
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="font-label-md text-on-surface font-medium">Email <span className="text-error">*</span></label>
                <input 
                  type="email" 
                  value={newUser.email}
                  onChange={e => setNewUser({...newUser, email: e.target.value})}
                  className="glass-input w-full px-4 py-2.5 rounded-lg text-on-surface font-body-md"
                  placeholder="email@contoh.com"
                  required
                />
              </div>
              <div className="flex flex-col gap-1.5 mb-2">
                <label className="font-label-md text-on-surface font-medium">Peran (Role) <span className="text-error">*</span></label>
                <select 
                  value={newUser.role}
                  onChange={e => setNewUser({...newUser, role: e.target.value})}
                  className="glass-input w-full px-4 py-2.5 rounded-lg text-on-surface font-body-md appearance-none pr-10"
                  required
                >
                  {ROLES.map(role => (
                    <option key={role} value={role} className="bg-surface text-on-surface">{role}</option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-3 mt-4">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg font-label-md bg-surface-variant hover:bg-surface-variant/80 text-on-surface transition-colors"
                  disabled={createMutation.isPending}
                >
                  Batal
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 rounded-lg font-label-md bg-primary hover:bg-primary/90 text-white transition-colors flex items-center gap-2 shadow-lg shadow-primary/20"
                  disabled={createMutation.isPending}
                >
                  {createMutation.isPending ? 'Menyimpan & Mengirim Email...' : 'Tambah & Kirim Undangan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TabUsers;
