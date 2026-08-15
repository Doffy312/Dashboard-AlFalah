import { useSettings } from '../../contexts/SettingsContext';

const LandingFooter = ({ orgName: customOrgName, logo: customLogo }) => {
  const { profile } = useSettings();
  const year = new Date().getFullYear();

  const orgName = customOrgName || profile?.orgName || 'Masjid Al-Falah';
  const logo = customLogo || profile?.logo;

  return (
    <footer className="border-t border-white/5 py-16 sm:py-24 bg-[#0b0f10]/30 lp-reveal">
      <div className="max-w-[1200px] mx-auto px-6 sm:px-8 flex flex-col items-center gap-8 sm:gap-12">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#adc6ff]/10 rounded-lg flex items-center justify-center lp-border overflow-hidden shrink-0">
            {logo ? (
              <img src={logo} alt={orgName} className="w-full h-full object-cover" />
            ) : (
              <span className="material-symbols-outlined text-[#adc6ff]">mosque</span>
            )}
          </div>
          <span className="text-xl sm:text-2xl font-bold tracking-tight text-[#e0e3e5]">
            {orgName}
          </span>
        </div>

        {/* Links */}
        <div className="flex flex-wrap justify-center gap-x-8 sm:gap-x-12 gap-y-4 sm:gap-y-6 text-sm uppercase tracking-[0.15em] text-[#c2c6d6]">
          <button onClick={(e) => e.preventDefault()} className="hover:text-[#adc6ff] transition-colors cursor-pointer">
            Kebijakan Privasi
          </button>
          <button onClick={(e) => e.preventDefault()} className="hover:text-[#adc6ff] transition-colors cursor-pointer">
            Syarat &amp; Ketentuan
          </button>
          <button onClick={(e) => e.preventDefault()} className="hover:text-[#adc6ff] transition-colors cursor-pointer">
            Pusat Bantuan
          </button>
        </div>

        {/* Copyright */}
        <p className="text-[#c2c6d6]/40 text-[13px] text-center">
          © {year} {orgName}. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default LandingFooter;
