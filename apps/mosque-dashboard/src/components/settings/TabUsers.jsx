import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
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
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    role: 'Pengurus',
    password: '',
    confirmPassword: '',
    directActivate: true,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [createdResultModal, setCreatedResultModal] = useState(null);
  const [editingUserId, setEditingUserId] = useState(null);
  const [actionMessage, setActionMessage] = useState(null);

  // Lock body scroll and handle Escape key when modals are open
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (isModalOpen) setIsModalOpen(false);
        if (createdResultModal) setCreatedResultModal(null);
      }
    };

    if (isModalOpen || createdResultModal) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.body.style.overflow = 'auto';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isModalOpen, createdResultModal]);

  const showMessage = (msg, type = 'success') => {
    setActionMessage({ text: msg, type });
    setTimeout(() => setActionMessage(null), 5000);
  };

  const copyToClipboard = async (text, successMsg = 'Tautan berhasil disalin ke papan klip!') => {
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        showMessage(successMsg);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        showMessage(successMsg);
      }
    } catch {
      showMessage('Gagal menyalin tautan otomatis. Silakan salin secara manual.', 'error');
    }
  };

  const handleAddUser = (e) => {
    e.preventDefault();
    if (newUser.directActivate) {
      if (!newUser.password || newUser.password.length < 8) {
        showMessage('Kata sandi minimal 8 karakter.', 'error');
        return;
      }
      if (newUser.password !== newUser.confirmPassword) {
        showMessage('Konfirmasi kata sandi tidak cocok.', 'error');
        return;
      }
    }

    const payload = {
      name: newUser.name.trim(),
      email: newUser.email.trim(),
      role: newUser.role,
      directActivate: !!newUser.directActivate,
      ...(newUser.directActivate ? { password: newUser.password } : {}),
    };

    createMutation.mutate(payload, {
      onSuccess: (result) => {
        setIsModalOpen(false);
        setNewUser({
          name: '',
          email: '',
          role: 'Pengurus',
          password: '',
          confirmPassword: '',
          directActivate: true,
        });

        if (result?.directActivated) {
          showMessage('Pengguna baru berhasil ditambahkan dan akun langsung aktif!');
        } else if (result?.verificationLink) {
          setCreatedResultModal(result);
          if (result.emailSent) {
            showMessage('Pengguna berhasil ditambahkan & email undangan telah dikirim.');
          } else {
            showMessage('Pengguna berhasil ditambahkan. Silakan salin tautan verifikasi di bawah ini.', 'error');
          }
        } else {
          showMessage('Pengguna baru berhasil ditambahkan!');
        }
      },
      onError: (err) => {
        showMessage(err.message || 'Gagal menambahkan pengguna.', 'error');
      }
    });
  };

  const handleCopyVerificationLink = (userItem) => {
    resendMutation.mutate(userItem.id, {
      onSuccess: (res) => {
        if (res?.verificationLink) {
          copyToClipboard(
            res.verificationLink,
            `Tautan verifikasi untuk ${userItem.email} berhasil disalin ke papan klip!`
          );
        } else {
          showMessage('Tautan verifikasi berhasil diperbarui.');
        }
      },
      onError: (err) => {
        showMessage(err.message || 'Gagal mengambil tautan verifikasi.', 'error');
      }
    });
  };

  const handleResendEmail = (userItem) => {
    resendMutation.mutate(userItem.id, {
      onSuccess: (res) => {
        if (res?.emailSent) {
          showMessage(`Email verifikasi berhasil dikirim ulang ke ${userItem.email}`);
        } else if (res?.verificationLink) {
          copyToClipboard(
            res.verificationLink,
            `Email belum terkirim via SMTP. Tautan verifikasi telah otomatis disalin ke papan klip!`
          );
        } else {
          showMessage(res?.message || 'Permintaan verifikasi berhasil diproses.');
        }
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
                <>
                  <button
                    className="flex items-center gap-1 text-primary hover:text-primary/80 bg-primary/10 hover:bg-primary/20 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors"
                    title="Salin Tautan Verifikasi"
                    onClick={() => handleCopyVerificationLink(user)}
                    disabled={resendMutation.isPending}
                  >
                    <span className="material-symbols-outlined text-[16px]">content_copy</span>
                    <span>Salin Link</span>
                  </button>
                  <button
                    className="flex items-center gap-1 text-amber-400 hover:text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors"
                    title="Kirim Ulang Email Verifikasi"
                    onClick={() => handleResendEmail(user)}
                    disabled={resendMutation.isPending}
                  >
                    <span className="material-symbols-outlined text-[16px]">forward_to_inbox</span>
                    <span>Kirim Email</span>
                  </button>
                </>
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
                    <>
                      <button
                        className="text-primary hover:text-primary/80 transition-colors p-1.5 rounded-lg hover:bg-primary/10 mr-1"
                        title="Salin Tautan Verifikasi"
                        onClick={() => handleCopyVerificationLink(user)}
                        disabled={resendMutation.isPending}
                      >
                        <span className="material-symbols-outlined text-[18px]">content_copy</span>
                      </button>
                      <button
                        className="text-amber-400 hover:text-amber-300 transition-colors p-1.5 rounded-lg hover:bg-amber-500/10 mr-1"
                        title="Kirim Ulang Email Verifikasi"
                        onClick={() => handleResendEmail(user)}
                        disabled={resendMutation.isPending}
                      >
                        <span className="material-symbols-outlined text-[18px]">forward_to_inbox</span>
                      </button>
                    </>
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
      {isModalOpen && createPortal(
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsModalOpen(false);
          }}
        >
          <div 
            className="w-full max-w-md my-auto flex flex-col rounded-2xl shadow-2xl border border-outline bg-surface overflow-hidden animate-in zoom-in-95 duration-200"
            style={{ maxHeight: 'min(calc(100dvh - 2rem), 660px)' }}
          >
            {/* Pinned Header */}
            <div className="flex justify-between items-center px-5 py-3.5 sm:py-4 border-b border-outline-variant/40 shrink-0 bg-surface">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-primary/15 text-primary flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[20px]">person_add</span>
                </div>
                <h3 className="text-title-md font-bold text-on-surface m-0">Tambah Pengguna Baru</h3>
              </div>
              <button 
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-on-surface-variant hover:text-primary p-1.5 rounded-lg hover:bg-surface-variant transition-colors"
                title="Tutup"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {/* Scrollable Form Body with min-h-0 for proper flexbox scrolling */}
            <form id="addUserForm" onSubmit={handleAddUser} className="flex-1 overflow-y-auto min-h-0 p-4 sm:p-5 space-y-3.5 overscroll-contain">
              <div className="flex flex-col gap-1">
                <label className="font-label-md text-on-surface font-medium text-xs">Nama Lengkap <span className="text-error">*</span></label>
                <input 
                  type="text" 
                  value={newUser.name}
                  onChange={e => setNewUser({...newUser, name: e.target.value})}
                  className="glass-input w-full px-3.5 py-2 rounded-xl text-on-surface font-body-md text-sm"
                  placeholder="Masukkan nama lengkap pengurus"
                  required
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="font-label-md text-on-surface font-medium text-xs">Email <span className="text-error">*</span></label>
                <input 
                  type="email" 
                  value={newUser.email}
                  onChange={e => setNewUser({...newUser, email: e.target.value})}
                  className="glass-input w-full px-3.5 py-2 rounded-xl text-on-surface font-body-md text-sm"
                  placeholder="email@contoh.com"
                  required
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="font-label-md text-on-surface font-medium text-xs">Peran (Role) <span className="text-error">*</span></label>
                <select 
                  value={newUser.role}
                  onChange={e => setNewUser({...newUser, role: e.target.value})}
                  className="glass-input w-full px-3.5 py-2 rounded-xl text-on-surface font-body-md text-sm appearance-none pr-10"
                  required
                >
                  {ROLES.map(role => (
                    <option key={role} value={role} className="bg-surface text-on-surface">{role}</option>
                  ))}
                </select>
              </div>

              {/* Direct Activate Checkbox Option */}
              <div className="pt-2 pb-0.5 border-t border-outline-variant/40">
                <label className="flex items-start gap-2.5 cursor-pointer p-2.5 rounded-xl bg-primary/5 hover:bg-primary/10 border border-primary/20 transition-all select-none">
                  <input
                    type="checkbox"
                    checked={newUser.directActivate}
                    onChange={(e) => setNewUser({ ...newUser, directActivate: e.target.checked })}
                    className="mt-0.5 w-4 h-4 rounded text-primary focus:ring-primary border-outline-variant shrink-0"
                  />
                  <div className="text-xs">
                    <span className="font-semibold text-on-surface block text-sm">
                      Langsung aktifkan akun & buat kata sandi sekarang
                    </span>
                    <span className="text-on-surface-variant block mt-0.5 leading-relaxed text-[11px]">
                      {newUser.directActivate
                        ? 'Akun langsung aktif tanpa harus menunggu verifikasi email. Cocok untuk pendaftaran cepat.'
                        : 'Pengguna akan menerima email/link verifikasi untuk mengatur kata sandinya sendiri.'}
                    </span>
                  </div>
                </label>
              </div>

              {/* Conditional Password Inputs */}
              {newUser.directActivate ? (
                <div className="space-y-2.5 p-3 rounded-xl bg-surface-variant/30 border border-outline-variant/50 animate-in fade-in duration-200">
                  <div className="flex flex-col gap-1">
                    <label className="font-label-md text-on-surface font-medium text-xs">
                      Kata Sandi Awal <span className="text-error">*</span>
                    </label>
                    <div className="relative">
                      <input 
                        type={showPassword ? 'text' : 'password'}
                        value={newUser.password}
                        onChange={e => setNewUser({...newUser, password: e.target.value})}
                        className="glass-input w-full px-3 py-2 rounded-lg text-on-surface font-body-md text-sm pr-10"
                        placeholder="Minimal 8 karakter"
                        required={newUser.directActivate}
                        minLength={8}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface p-1"
                      >
                        <span className="material-symbols-outlined text-[18px]">
                          {showPassword ? 'visibility_off' : 'visibility'}
                        </span>
                      </button>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="font-label-md text-on-surface font-medium text-xs">
                      Konfirmasi Kata Sandi <span className="text-error">*</span>
                    </label>
                    <input 
                      type={showPassword ? 'text' : 'password'}
                      value={newUser.confirmPassword}
                      onChange={e => setNewUser({...newUser, confirmPassword: e.target.value})}
                      className="glass-input w-full px-3 py-2 rounded-lg text-on-surface font-body-md text-sm"
                      placeholder="Ulangi kata sandi"
                      required={newUser.directActivate}
                      minLength={8}
                    />
                  </div>
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-primary/10 border border-primary/20 text-xs text-primary flex items-start gap-2.5 animate-in fade-in duration-200">
                  <span className="material-symbols-outlined text-[18px] shrink-0 mt-0.5">info</span>
                  <span className="leading-relaxed">Email undangan & link verifikasi akan otomatis dikirimkan. Anda juga dapat langsung menyalin tautan verifikasi setelah disimpan.</span>
                </div>
              )}
            </form>

            {/* Pinned Footer */}
            <div className="px-5 py-3 border-t border-outline-variant/40 bg-surface/95 backdrop-blur-md flex items-center justify-end gap-3 shrink-0">
              <button 
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 rounded-xl font-label-md bg-surface-variant hover:bg-surface-variant/80 text-on-surface text-sm transition-colors"
                disabled={createMutation.isPending}
              >
                Batal
              </button>
              <button 
                type="submit"
                form="addUserForm"
                className="px-4 py-2 rounded-xl font-label-md bg-primary hover:bg-primary/90 text-white text-sm transition-colors flex items-center gap-2 shadow-lg shadow-primary/20"
                disabled={createMutation.isPending}
              >
                {createMutation.isPending ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Menyimpan...</span>
                  </>
                ) : (
                  newUser.directActivate ? 'Tambah & Aktifkan Pengguna' : 'Tambah & Buat Tautan'
                )}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Verification Link Result Modal */}
      {createdResultModal && createPortal(
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200"
          onClick={(e) => {
            if (e.target === e.currentTarget) setCreatedResultModal(null);
          }}
        >
          <div 
            className="w-full max-w-lg my-auto flex flex-col rounded-2xl shadow-2xl border border-outline bg-surface overflow-hidden animate-in zoom-in-95 duration-200"
            style={{ maxHeight: 'min(calc(100dvh - 2rem), 600px)' }}
          >
            {/* Pinned Header */}
            <div className="flex items-center justify-between px-5 py-3.5 sm:py-4 border-b border-outline-variant/40 shrink-0 bg-surface">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-primary/20 text-primary flex items-center justify-center font-bold shrink-0">
                  <span className="material-symbols-outlined text-[20px]">mark_email_read</span>
                </div>
                <div>
                  <h3 className="text-title-md font-bold text-on-surface m-0">Tautan Verifikasi Akun</h3>
                  <p className="text-xs text-on-surface-variant m-0 mt-0.5">
                    Untuk: <strong>{createdResultModal.name}</strong> ({createdResultModal.email})
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setCreatedResultModal(null)}
                className="text-on-surface-variant hover:text-primary p-1.5 rounded-lg hover:bg-surface-variant transition-colors"
                title="Tutup"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {/* Scrollable Body with min-h-0 */}
            <div className="flex-1 overflow-y-auto min-h-0 p-4 sm:p-5 space-y-4 overscroll-contain">
              {createdResultModal.emailSent ? (
                <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2.5">
                  <span className="material-symbols-outlined text-[20px] shrink-0">check_circle</span>
                  <span>Email undangan & verifikasi telah berhasil dikirim ke alamat email pengurus.</span>
                </div>
              ) : (
                <div className="p-3.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 text-xs flex items-start gap-2.5">
                  <span className="material-symbols-outlined text-[20px] shrink-0 mt-0.5">warning</span>
                  <div>
                    <span className="font-semibold block text-amber-300">Email otomatis belum terkirim via SMTP.</span>
                    <span className="mt-0.5 block leading-relaxed">Anda dapat menyalin tautan di bawah ini dan membagikannya secara langsung kepada pengurus via WhatsApp / pesan pribadi.</span>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-xs font-semibold text-on-surface-variant block">Tautan Verifikasi Mandiri:</label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    readOnly
                    value={createdResultModal.verificationLink || ''}
                    className="glass-input flex-1 px-3 py-2.5 rounded-xl text-xs text-on-surface font-mono select-all"
                    onClick={(e) => e.target.select()}
                  />
                  <button
                    type="button"
                    onClick={() => copyToClipboard(createdResultModal.verificationLink, 'Tautan verifikasi disalin ke papan klip!')}
                    className="bg-primary hover:bg-primary/90 text-white px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 shrink-0 shadow-md shadow-primary/20"
                  >
                    <span className="material-symbols-outlined text-[16px]">content_copy</span>
                    <span>Salin</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Pinned Footer */}
            <div className="flex justify-end px-5 py-3 border-t border-outline-variant/40 bg-surface/95 backdrop-blur-md shrink-0">
              <button
                type="button"
                onClick={() => setCreatedResultModal(null)}
                className="px-5 py-2 rounded-xl font-label-md bg-surface-variant hover:bg-surface-variant/80 text-on-surface text-sm font-medium transition-colors"
              >
                Selesai
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default TabUsers;
