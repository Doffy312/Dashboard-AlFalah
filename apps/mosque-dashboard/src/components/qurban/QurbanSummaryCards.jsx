import { Users, Layers } from 'lucide-react';

const QurbanSummaryCards = ({ summary = {} }) => {
  const {
    selectedYear = new Date().getFullYear(),
    totalPequrban = 0,
    totalSapi = 0,
    totalKambing = 0,
    totalKelompokSapi = 0,
  } = summary;

  const cards = [
    {
      title: `Total Pequrban (${selectedYear})`,
      value: `${totalPequrban} Orang`,
      subtitle: 'Tergabung dalam kepanitiaan tahun ini',
      icon: <Users className="w-6 h-6 text-emerald-500" />,
      bg: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400',
    },
    {
      title: 'Total Sapi Qurban',
      value: `${totalSapi} Ekor`,
      subtitle: `${totalKelompokSapi} Kelompok Sapi`,
      icon: (
        <span className="material-symbols-outlined text-[24px] text-amber-500">
          pets
        </span>
      ),
      bg: 'bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400',
    },
    {
      title: 'Total Kambing / Domba',
      value: `${totalKambing} Ekor`,
      subtitle: 'Qurban Perorangan',
      icon: (
        <span className="material-symbols-outlined text-[24px] text-blue-500">
          cruelty_free
        </span>
      ),
      bg: 'bg-blue-500/10 border-blue-500/20 text-blue-600 dark:text-blue-400',
    },
    {
      title: 'Kelompok Sapi Terbentuk',
      value: `${totalKelompokSapi} Kelompok`,
      subtitle: 'Kapasitas 7 Jemaah / Kelompok',
      icon: <Layers className="w-6 h-6 text-purple-500" />,
      bg: 'bg-purple-500/10 border-purple-500/20 text-purple-600 dark:text-purple-400',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {cards.map((card, idx) => (
        <div
          key={idx}
          className="p-3.5 sm:p-5 rounded-2xl bg-surface border border-outline/50 shadow-sm flex flex-col justify-between hover:shadow-md transition-all"
        >
          <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
            <div className={`p-1.5 sm:p-2.5 rounded-lg sm:rounded-xl border shrink-0 ${card.bg}`}>
              {card.icon}
            </div>
            <span className="text-xs sm:text-sm font-medium text-on-surface-variant dark:text-white/70 leading-tight">
              {card.title}
            </span>
          </div>
          <div>
            <h3 className="text-lg sm:text-2xl font-bold text-on-surface dark:text-white m-0">
              {card.value}
            </h3>
            <p className="text-xs text-on-surface-variant/70 dark:text-white/50 m-0 mt-1">
              {card.subtitle}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default QurbanSummaryCards;
