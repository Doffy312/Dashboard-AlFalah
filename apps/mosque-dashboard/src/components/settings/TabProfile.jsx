import { useState, useEffect, useRef } from 'react';
import { useSettings } from '../../contexts/SettingsContext';

const TabProfile = ({ setHasUnsavedChanges, tabDataRef }) => {
  const { profile } = useSettings();
  
  const [formData, setFormData] = useState({ ...profile });
  const fileInputRef = useRef(null);

  // When context profile changes (e.g. cancel/reset), sync local state
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFormData({ ...profile });
  }, [profile]);

  // Expose current form data to parent via ref
  useEffect(() => {
    if (tabDataRef) {
      tabDataRef.current = () => formData;
    }
  }, [formData, tabDataRef]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setHasUnsavedChanges(true);
  };

  const handleMissionChange = (index, value) => {
    const missionArray = Array.isArray(formData.mission) ? [...formData.mission] : [];
    missionArray[index] = value;
    setFormData(prev => ({ ...prev, mission: missionArray }));
    setHasUnsavedChanges(true);
  };

  const handleAddMission = () => {
    const missionArray = Array.isArray(formData.mission) ? [...formData.mission] : [];
    missionArray.push('');
    setFormData(prev => ({ ...prev, mission: missionArray }));
    setHasUnsavedChanges(true);
  };

  const handleRemoveMission = (index) => {
    const missionArray = Array.isArray(formData.mission) ? [...formData.mission] : [];
    missionArray.splice(index, 1);
    setFormData(prev => ({ ...prev, mission: missionArray }));
    setHasUnsavedChanges(true);
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert('Ukuran file logo terlalu besar. Maksimal 2MB.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData(prev => ({ ...prev, logo: reader.result }));
      setHasUnsavedChanges(true);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveLogo = (e) => {
    e.stopPropagation();
    setFormData(prev => ({ ...prev, logo: '' }));
    if (fileInputRef.current) fileInputRef.current.value = '';
    setHasUnsavedChanges(true);
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-300">
      <div className="border-b border-outline-variant pb-4 mb-2">
        <h3 className="text-title-md font-bold text-white m-0">Profil Organisasi</h3>
        <p className="text-body-sm text-on-surface-variant m-0 mt-1">
          Informasi ini akan ditampilkan pada Landing Page dan header laporan.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Logo Upload Section */}
        <div className="col-span-1 flex flex-col gap-4">
          <label className="font-label-md text-white">Logo Organisasi</label>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleLogoUpload} 
            accept="image/png, image/jpeg, image/svg+xml, image/webp" 
            className="hidden" 
          />
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-outline-variant rounded-xl p-6 flex flex-col items-center justify-center text-center gap-3 hover:border-primary transition-colors cursor-pointer bg-surface-variant/30 relative group"
          >
            <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden border border-primary/30 shrink-0">
              {formData.logo ? (
                <img src={formData.logo} alt="Logo Organisasi" className="w-full h-full object-cover" />
              ) : (
                <span className="material-symbols-outlined text-[40px] text-primary">image</span>
              )}
            </div>
            <div>
              <p className="text-body-sm font-bold text-white m-0">
                {formData.logo ? 'Klik untuk mengganti logo' : 'Klik untuk unggah logo'}
              </p>
              <p className="text-[11px] text-on-surface-variant m-0 mt-1">SVG, PNG, JPG (Maks. 2MB)</p>
            </div>
            {formData.logo && (
              <button
                type="button"
                onClick={handleRemoveLogo}
                className="mt-1 px-3 py-1 bg-error/20 hover:bg-error/30 text-error border border-error/30 rounded-lg text-xs font-medium transition-colors flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-[14px]">delete</span>
                Hapus Logo
              </button>
            )}
          </div>
        </div>

        {/* Form Fields Section */}
        <div className="col-span-1 lg:col-span-2 flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <label className="font-label-md text-white">Nama Organisasi <span className="text-error">*</span></label>
            <input 
              type="text" 
              name="orgName"
              value={formData.orgName}
              onChange={handleChange}
              className="glass-input w-full px-4 py-2.5 rounded-lg text-white font-body-md"
              placeholder="Masukkan nama organisasi"
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="font-label-md text-white">Deskripsi Singkat</label>
            <textarea 
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className="glass-input w-full px-4 py-2.5 rounded-lg text-white font-body-md resize-none"
              placeholder="Tuliskan deskripsi singkat..."
            />
          </div>

          {/* Visi & Misi Section */}
          <div className="pt-4 border-t border-outline-variant flex flex-col gap-5">
            <h4 className="font-label-lg font-bold text-white m-0 flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-amber-400">auto_awesome</span>
              Visi &amp; Misi Masjid (Ditampilkan di Landing Page)
            </h4>

            <div className="flex flex-col gap-1.5">
              <label className="font-label-md text-white">Visi Masjid</label>
              <textarea 
                name="vision"
                value={formData.vision || ''}
                onChange={handleChange}
                rows={3}
                className="glass-input w-full px-4 py-2.5 rounded-lg text-white font-body-md resize-none"
                placeholder="Masukkan visi utama masjid..."
              />
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <label className="font-label-md text-white">Misi Pelayanan</label>
                <button
                  type="button"
                  onClick={handleAddMission}
                  className="px-3 py-1 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">add</span>
                  Tambah Poin Misi
                </button>
              </div>

              {(Array.isArray(formData.mission) ? formData.mission : []).map((item, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-2 rounded-lg shrink-0">
                    {idx + 1}
                  </span>
                  <input
                    type="text"
                    value={item}
                    onChange={(e) => handleMissionChange(idx, e.target.value)}
                    placeholder={`Masukkan poin misi ke-${idx + 1}...`}
                    className="glass-input flex-1 px-4 py-2 rounded-lg text-white font-body-md text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveMission(idx)}
                    className="p-2 bg-error/15 hover:bg-error/25 text-error border border-error/30 rounded-lg transition-colors cursor-pointer shrink-0"
                    title="Hapus poin misi"
                  >
                    <span className="material-symbols-outlined text-[18px]">delete</span>
                  </button>
                </div>
              ))}
              {(!Array.isArray(formData.mission) || formData.mission.length === 0) && (
                <p className="text-body-sm text-on-surface-variant italic m-0">Belum ada poin misi. Klik "Tambah Poin Misi" untuk membuat.</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="flex flex-col gap-1.5">
              <label className="font-label-md text-white">Nomor Telepon</label>
              <input 
                type="tel" 
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="glass-input w-full px-4 py-2.5 rounded-lg text-white font-body-md"
                placeholder="08..."
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="font-label-md text-white">Email</label>
              <input 
                type="email" 
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="glass-input w-full px-4 py-2.5 rounded-lg text-white font-body-md"
                placeholder="email@contoh.com"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="font-label-md text-white">Alamat Lengkap</label>
            <textarea 
              name="address"
              value={formData.address}
              onChange={handleChange}
              rows={2}
              className="glass-input w-full px-4 py-2.5 rounded-lg text-white font-body-md resize-none"
              placeholder="Alamat lengkap masjid..."
            />
          </div>

          <div className="pt-4 border-t border-outline-variant">
            <h4 className="font-label-lg font-bold text-white mb-1 flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-primary">location_on</span>
              Koordinat GPS Masjid (Peta Landing Page)
            </h4>
            <p className="text-body-sm text-on-surface-variant mb-3">
              Titik koordinat latitude dan longitude ini digunakan sebagai pusat lokasi peta sebaran jemaah pada landing page.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="font-label-md text-white">Latitude (Lintang)</label>
                <input 
                  type="number"
                  step="any"
                  name="lat"
                  value={formData.lat ?? ''}
                  onChange={handleChange}
                  className="glass-input w-full px-4 py-2.5 rounded-lg text-white font-body-md"
                  placeholder="-6.91746"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="font-label-md text-white">Longitude (Bujur)</label>
                <input 
                  type="number"
                  step="any"
                  name="lng"
                  value={formData.lng ?? ''}
                  onChange={handleChange}
                  className="glass-input w-full px-4 py-2.5 rounded-lg text-white font-body-md"
                  placeholder="107.61912"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-outline-variant">
            <h4 className="font-label-lg font-bold text-white mb-4">Media Sosial</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="font-label-md text-on-surface-variant flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px]">camera_alt</span> Instagram
                </label>
                <input 
                  type="text" 
                  name="ig"
                  value={formData.ig}
                  onChange={handleChange}
                  className="glass-input w-full px-4 py-2 rounded-lg text-white text-sm"
                  placeholder="@username"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="font-label-md text-on-surface-variant flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px]">public</span> Facebook
                </label>
                <input 
                  type="text" 
                  name="fb"
                  value={formData.fb}
                  onChange={handleChange}
                  className="glass-input w-full px-4 py-2 rounded-lg text-white text-sm"
                  placeholder="Nama Halaman"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="font-label-md text-on-surface-variant flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px]">play_circle</span> YouTube
                </label>
                <input 
                  type="text" 
                  name="yt"
                  value={formData.yt}
                  onChange={handleChange}
                  className="glass-input w-full px-4 py-2 rounded-lg text-white text-sm"
                  placeholder="Nama Channel"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TabProfile;
