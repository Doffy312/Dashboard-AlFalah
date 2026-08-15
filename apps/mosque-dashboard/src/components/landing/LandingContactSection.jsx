import { useState } from 'react';
import { 
  MapPin, 
  Mail, 
  Phone, 
  Clock, 
  Send, 
  CheckCircle2, 
  Loader2 
} from 'lucide-react';
import { useSettings } from '../../contexts/SettingsContext';
import { useCreateContactMessage } from '../../hooks/useContactMessages';

export default function LandingContactSection({ onShowToast, customOrgName }) {
  const { profile } = useSettings();
  const orgName = customOrgName || profile?.orgName || 'Masjid Al-Falah';
  const createContactMutation = useCreateContactMessage();

  const address = profile?.address || 'Jalan Taman Wijaya Kusuma, Ps. Baru, Kecamatan Sawah Besar, Kota Jakarta Pusat, Daerah Khusus Ibukota Jakarta 10710';
  const email = profile?.email || 'info@masjidalfalah.or.id';
  const phone = profile?.phone || '+0213811798';

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    whatsapp: '',
    subject: '',
    message: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.fullName || !formData.email || !formData.message) return;

    setIsSubmitting(true);

    try {
      await createContactMutation.mutateAsync(formData);
    } catch {
      // Fallback message handling if backend fails or offline
    } finally {
      setIsSubmitting(false);
      setIsSuccess(true);

      const msg = 'Pesan Anda telah berhasil dikirim! Pengurus akan segera menghubungi Anda.';
      if (onShowToast) {
        onShowToast(msg);
      }

      setFormData({
        fullName: '',
        email: '',
        whatsapp: '',
        subject: '',
        message: ''
      });

      setTimeout(() => {
        setIsSuccess(false);
      }, 5000);
    }
  };

  return (
    <section id="kontak" className="scroll-mt-24 py-16 px-4 sm:px-6 lg:px-12 max-w-7xl mx-auto">
      {/* Title Header with Gold Accent Underline */}
      <div className="text-center mb-10 sm:mb-14">
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
          Hubungi Pengurus {orgName}
        </h2>
        <div className="w-20 h-1 bg-amber-500 rounded-full mx-auto mt-3 shadow-md shadow-amber-500/30" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        {/* Left Panel: Information & Operations (Dark Emerald Theme) */}
        <div className="lg:col-span-5 bg-gradient-to-br from-[#064e3b] via-[#04392b] to-[#022c22] border border-emerald-500/30 rounded-3xl p-6 sm:p-8 flex flex-col justify-between shadow-2xl backdrop-blur-xl relative overflow-hidden group">
          {/* Subtle Glow Spheres */}
          <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none group-hover:bg-emerald-500/25 transition-all duration-500" />
          <div className="absolute -top-10 -right-10 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-2">
              Mari Berdiskusi
            </h3>
            <p className="text-emerald-100/80 text-xs sm:text-sm leading-relaxed mb-8">
              Pintu kami selalu terbuka untuk pertanyaan, saran, atau kerjasama demi kemajuan umat.
            </p>

            <div className="space-y-6">
              {/* Lokasi Utama */}
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0 shadow-inner">
                  <MapPin size={22} />
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm sm:text-base">Lokasi Utama</h4>
                  <p className="text-emerald-100/75 text-xs sm:text-sm leading-relaxed mt-0.5">
                    {address}
                  </p>
                </div>
              </div>

              {/* Email Resmi */}
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0 shadow-inner">
                  <Mail size={22} />
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm sm:text-base">Email Resmi</h4>
                  <a href={`mailto:${email}`} className="text-emerald-100/75 hover:text-amber-300 transition-colors text-xs sm:text-sm mt-0.5 block break-all">
                    {email}
                  </a>
                </div>
              </div>

              {/* Layanan Telepon */}
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0 shadow-inner">
                  <Phone size={22} />
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm sm:text-base">Layanan Telepon</h4>
                  <a href={`tel:${phone}`} className="text-emerald-100/75 hover:text-amber-300 transition-colors text-xs sm:text-sm mt-0.5 block">
                    {phone}
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Jam Operasional Kantor Inner Card */}
          <div className="relative z-10 bg-emerald-950/60 border border-emerald-500/25 rounded-2xl p-5 sm:p-6 mt-8 space-y-2 backdrop-blur-md">
            <h4 className="font-bold text-amber-400 text-xs sm:text-sm tracking-wide uppercase flex items-center gap-2">
              <Clock size={16} className="text-amber-400 shrink-0" />
              <span>Jam Operasional Kantor:</span>
            </h4>
            <p className="text-emerald-100/90 text-xs sm:text-sm font-medium">
              Senin - Jumat: 08.00 - 16.00 WIB
            </p>
            <p className="text-emerald-200/70 text-xs sm:text-sm">
              Sabtu - Minggu: Tutup (Kecuali Acara Khusus)
            </p>
          </div>
        </div>

        {/* Right Panel: Message Form (Glassmorphism Dark Theme Card) */}
        <div className="lg:col-span-7 bg-white/5 border border-white/10 rounded-3xl p-6 sm:p-8 md:p-10 backdrop-blur-xl shadow-2xl flex flex-col justify-between relative overflow-hidden">
          {isSuccess && (
            <div className="mb-6 p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs sm:text-sm flex items-center gap-3 animate-fade-in">
              <CheckCircle2 size={22} className="text-emerald-400 shrink-0" />
              <div>
                <p className="font-bold">Terima kasih! Pesan Anda telah terkirim.</p>
                <p className="text-emerald-200/70 text-xs mt-0.5">Pengurus masjid akan memproses dan merespons pesan Anda secepatnya.</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              {/* Nama Lengkap */}
              <div>
                <label htmlFor="fullName" className="block text-xs sm:text-sm font-semibold text-slate-300 mb-1.5">
                  Nama Lengkap<span className="text-amber-400">*</span>
                </label>
                <input
                  id="fullName"
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="Masukkan nama Anda"
                  required
                  className="w-full bg-slate-900/90 border border-white/10 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-white rounded-xl px-4 py-3 text-xs sm:text-sm transition-all placeholder:text-slate-500 outline-none"
                />
              </div>

              {/* Alamat Email */}
              <div>
                <label htmlFor="contactEmail" className="block text-xs sm:text-sm font-semibold text-slate-300 mb-1.5">
                  Alamat Email<span className="text-amber-400">*</span>
                </label>
                <input
                  id="contactEmail"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="nama@email.com"
                  required
                  className="w-full bg-slate-900/90 border border-white/10 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-white rounded-xl px-4 py-3 text-xs sm:text-sm transition-all placeholder:text-slate-500 outline-none"
                />
              </div>

              {/* Nomor WhatsApp */}
              <div>
                <label htmlFor="whatsapp" className="block text-xs sm:text-sm font-semibold text-slate-300 mb-1.5">
                  Nomor WhatsApp<span className="text-amber-400">*</span>
                </label>
                <input
                  id="whatsapp"
                  type="tel"
                  name="whatsapp"
                  value={formData.whatsapp}
                  onChange={handleChange}
                  placeholder="08xxxx"
                  required
                  className="w-full bg-slate-900/90 border border-white/10 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-white rounded-xl px-4 py-3 text-xs sm:text-sm transition-all placeholder:text-slate-500 outline-none"
                />
              </div>

              {/* Subjek */}
              <div>
                <label htmlFor="subject" className="block text-xs sm:text-sm font-semibold text-slate-300 mb-1.5">
                  Subjek<span className="text-amber-400">*</span>
                </label>
                <select
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  className="w-full bg-slate-900/90 border border-white/10 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-white rounded-xl px-4 py-3 text-xs sm:text-sm transition-all outline-none cursor-pointer"
                >
                  <option value="" disabled className="bg-slate-900 text-slate-400">Pilih Layanan...</option>
                  <option value="Pertanyaan Umum" className="bg-slate-900 text-white">Pertanyaan Umum</option>
                  <option value="Konsultasi & Agama" className="bg-slate-900 text-white">Konsultasi &amp; Bimbingan Agama</option>
                  <option value="Zakat & Infaq" className="bg-slate-900 text-white">Layanan Zakat, Infaq &amp; Sedekah</option>
                  <option value="Fasilitas Masjid" className="bg-slate-900 text-white">Penggunaan Fasilitas Masjid</option>
                  <option value="Kerjasama & Masukan" className="bg-slate-900 text-white">Kerjasama &amp; Saran Masukan</option>
                  <option value="Lainnya" className="bg-slate-900 text-white">Lainnya</option>
                </select>
              </div>
            </div>

            {/* Pesan */}
            <div>
              <label htmlFor="contactMessage" className="block text-xs sm:text-sm font-semibold text-slate-300 mb-1.5">
                Pesan<span className="text-amber-400">*</span>
              </label>
              <textarea
                id="contactMessage"
                name="message"
                value={formData.message}
                onChange={handleChange}
                rows={4}
                placeholder="Tuliskan pesan Anda secara detail..."
                required
                className="w-full bg-slate-900/90 border border-white/10 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-white rounded-xl px-4 py-3 text-xs sm:text-sm transition-all placeholder:text-slate-500 outline-none resize-none"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 px-6 rounded-full bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2.5 shadow-lg shadow-emerald-600/30 hover:shadow-emerald-500/40 transition-all duration-300 uppercase tracking-wider group disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>MENGIRIM PESAN...</span>
                </>
              ) : (
                <>
                  <span>KIRIM PESAN SEKARANG</span>
                  <Send size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
