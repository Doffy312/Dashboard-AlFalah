import { useSettings } from '../../contexts/SettingsContext';

const LandingFooter = ({ orgName: customOrgName }) => {
  const { profile } = useSettings();
  const year = new Date().getFullYear();

  const orgName = customOrgName || profile?.orgName || 'Masjid Al-Falah Oruna';

  return (
    <footer className="border-t border-white/10 py-6 px-4 sm:px-6 lg:px-8 bg-slate-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto flex items-center justify-center text-center">
        <p className="text-xs sm:text-sm text-slate-400 font-medium tracking-wide">
          © {year} Dashboard Takmir {orgName}. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default LandingFooter;

