import React, { useState, useEffect } from 'react';

const MOCK_USERS = [
  { id: 1, name: 'Ahmad Ketua', email: 'ketua@alfalah.id', role: 'Super Admin' },
  { id: 2, name: 'Budi Bendahara', email: 'bendahara@alfalah.id', role: 'Bendahara' },
  { id: 3, name: 'Cici Sekretaris', email: 'sekretaris@alfalah.id', role: 'Sekretaris' },
];

const ROLES = ['Super Admin', 'Bendahara', 'Sekretaris', 'Logistik'];

const TabUsers = ({ setHasUnsavedChanges, tabDataRef }) => {
  // Users tab doesn't persist to localStorage settings, so return null from ref
  useEffect(() => {
    if (tabDataRef) {
      tabDataRef.current = () => null;
    }
  }, [tabDataRef]);
  const [users, setUsers] = useState(MOCK_USERS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: 'Bendahara' });

  const handleAddUser = (e) => {
    e.preventDefault();
    setUsers([...users, { ...newUser, id: Date.now() }]);
    setHasUnsavedChanges(true);
    setIsModalOpen(false);
    setNewUser({ name: '', email: '', password: '', role: 'Bendahara' });
  };

  const handleDelete = (id) => {
    if (window.confirm('Yakin ingin menghapus pengguna ini?')) {
      setUsers(users.filter(u => u.id !== id));
      setHasUnsavedChanges(true);
    }
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-300 relative h-full">
      <div className="flex justify-between items-end border-b border-outline-variant pb-4 mb-2">
        <div>
          <h3 className="text-title-md font-bold text-white m-0">Manajemen Pengguna</h3>
          <p className="text-body-sm text-on-surface-variant m-0 mt-1">
            Kelola akses dan peran pengguna dalam sistem.
          </p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg font-label-md flex items-center gap-2 transition-colors"
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
              <th className="py-3 px-4 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id} className="border-b border-outline-variant/50 glass-row">
                <td className="py-3 px-4 text-white font-body-md">{user.name}</td>
                <td className="py-3 px-4 text-on-surface-variant text-sm">{user.email}</td>
                <td className="py-3 px-4">
                  <span className={`px-3 py-1 rounded-full text-[11px] font-bold ${
                    user.role === 'Super Admin' ? 'bg-error/20 text-error' :
                    user.role === 'Bendahara' ? 'bg-[#d97706]/20 text-[#d97706]' :
                    'bg-primary/20 text-primary'
                  }`}>
                    {user.role}
                  </span>
                </td>
                <td className="py-3 px-4 text-right">
                  <button className="text-on-surface-variant hover:text-primary transition-colors p-1" title="Edit">
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
            {users.length === 0 && (
              <tr>
                <td colSpan="4" className="text-center py-8 text-on-surface-variant">Tidak ada data pengguna.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add User Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="glass-panel p-6 w-full max-w-md animate-in zoom-in-95 duration-200 shadow-2xl border-outline">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-title-md font-bold text-white m-0">Tambah Pengguna Baru</h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-on-surface-variant hover:text-white"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleAddUser} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="font-label-md text-white">Nama Lengkap <span className="text-error">*</span></label>
                <input 
                  type="text" 
                  value={newUser.name}
                  onChange={e => setNewUser({...newUser, name: e.target.value})}
                  className="glass-input w-full px-4 py-2.5 rounded-lg text-white font-body-md"
                  placeholder="Masukkan nama lengkap"
                  required
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="font-label-md text-white">Email <span className="text-error">*</span></label>
                <input 
                  type="email" 
                  value={newUser.email}
                  onChange={e => setNewUser({...newUser, email: e.target.value})}
                  className="glass-input w-full px-4 py-2.5 rounded-lg text-white font-body-md"
                  placeholder="email@contoh.com"
                  required
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="font-label-md text-white">Kata Sandi <span className="text-error">*</span></label>
                <input 
                  type="password" 
                  value={newUser.password}
                  onChange={e => setNewUser({...newUser, password: e.target.value})}
                  className="glass-input w-full px-4 py-2.5 rounded-lg text-white font-body-md"
                  placeholder="Minimal 8 karakter"
                  required
                  minLength={8}
                />
              </div>
              <div className="flex flex-col gap-1.5 mb-2">
                <label className="font-label-md text-white">Peran (Role) <span className="text-error">*</span></label>
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
                >
                  Batal
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 rounded-lg font-label-md bg-primary hover:bg-primary/90 text-white transition-colors"
                >
                  Simpan
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
