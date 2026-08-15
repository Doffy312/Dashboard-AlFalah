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
    <div className="flex flex-col gap-6 animate-in fade-in duration-300 relative h-full">
      {/* Toast Notification */}
      {actionMessage && (
        <div className={`p-4 rounded-xl flex items-center justify-between gap-3 text-sm font-medium ${
          actionMessage.type === 'success' ? 'bg-primary/20 text-primary border border-primary/30' : 'bg-error/20 text-error border border-error/30'
        }`}>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px]">
              {actionMessage.type === 'success' ? 'check_circle' : 'error'}
            </span>
            <span>{actionMessage.text}</span>
          </div>
          <button onClick={() => setActionMessage(null)} className="opacity-70 hover:opacity-100">
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>
      )}

      <div className="flex justify-between items-end border-b border-outline-variant pb-4 mb-2">
        <div>
          <h3 className="text-title-md font-bold text-white m-0">Manajemen Pengguna</h3>
          <p className="text-body-sm text-on-surface-variant m-0 mt-1">
            Kelola akses, peran, dan status verifikasi akun pengurus.
          </p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg font-label-md flex items-center gap-2 transition-colors shadow-lg shadow-primary/20"
        >
          <span className="material-symbols-outlined text-[18px]">person_add</span>
          Tambah Pengguna
        </button>
      </div>

      <div className="overflow-x-auto">
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
                <td className="py-3 px-4 text-white font-body-md">{user.name}</td>
                <td className="py-3 px-4 text-on-surface-variant text-sm">{user.email}</td>
                <td className="py-3 px-4">
                  {editingUserId === user.id ? (
                    <select
                      autoFocus
                      defaultValue={user.role}
                      onChange={(e) => handleRoleChange(user.id, e.target.value)}
                      onBlur={() => setEditingUserId(null)}
                      className="bg-surface text-white border border-outline-variant rounded px-2 py-1 text-sm focus:border-primary"
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
                      className="text-amber-400 hover:text-amber-300 transition-colors p-1 mr-1"
                      title="Kirim Ulang Email Verifikasi"
                      onClick={() => handleResendEmail(user)}
                      disabled={resendMutation.isPending}
                    >
                      <span className="material-symbols-outlined text-[18px]">forward_to_inbox</span>
                    </button>
                  )}
                  <button 
                    className="text-on-surface-variant hover:text-primary transition-colors p-1" 
                    title="Ubah Role"
                    onClick={() => setEditingUserId(user.id)}
                  >
                    <span className="material-symbols-outlined text-[18px]">edit</span>
                  </button>
                  <button 
                    className="text-on-surface-variant hover:text-error transition-colors p-1 ml-2" 
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="glass-panel p-6 w-full max-w-md animate-in zoom-in-95 duration-200 shadow-2xl border-outline">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-title-md font-bold text-white m-0">Tambah Pengguna Baru</h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-on-surface-variant hover:text-white"
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
                <label className="font-label-md text-white font-medium">Nama Lengkap <span className="text-error">*</span></label>
                <input 
                  type="text" 
                  value={newUser.name}
                  onChange={e => setNewUser({...newUser, name: e.target.value})}
                  className="glass-input w-full px-4 py-2.5 rounded-lg text-white font-body-md"
                  placeholder="Masukkan nama lengkap pengurus"
                  required
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="font-label-md text-white font-medium">Email <span className="text-error">*</span></label>
                <input 
                  type="email" 
                  value={newUser.email}
                  onChange={e => setNewUser({...newUser, email: e.target.value})}
                  className="glass-input w-full px-4 py-2.5 rounded-lg text-white font-body-md"
                  placeholder="email@contoh.com"
                  required
                />
              </div>
              <div className="flex flex-col gap-1.5 mb-2">
                <label className="font-label-md text-white font-medium">Peran (Role) <span className="text-error">*</span></label>
                <select 
                  value={newUser.role}
                  onChange={e => setNewUser({...newUser, role: e.target.value})}
                  className="glass-input w-full px-4 py-2.5 rounded-lg text-white font-body-md appearance-none pr-10"
                  required
                >
                  {ROLES.map(role => (
                    <option key={role} value={role} className="bg-surface text-white">{role}</option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-3 mt-4">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg font-label-md bg-surface-variant hover:bg-surface-variant/80 text-white transition-colors"
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
