import React, { useState, useEffect } from 'react';
import { useSettings } from '../../contexts/SettingsContext';

const TabProfile = ({ setHasUnsavedChanges, tabDataRef }) => {
  const { profile } = useSettings();
  
  const [formData, setFormData] = useState({ ...profile });

  // When context profile changes (e.g. cancel/reset), sync local state
  useEffect(() => {
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
          <div className="border-2 border-dashed border-outline-variant rounded-xl p-6 flex flex-col items-center justify-center text-center gap-3 hover:border-primary transition-colors cursor-pointer bg-surface-variant/30">
            <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden">
              <span className="material-symbols-outlined text-[40px] text-primary">image</span>
            </div>
            <div>
              <p className="text-body-sm font-bold text-white m-0">Klik untuk unggah</p>
              <p className="text-[11px] text-on-surface-variant m-0 mt-1">SVG, PNG, JPG (Maks. 2MB)</p>
            </div>
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
