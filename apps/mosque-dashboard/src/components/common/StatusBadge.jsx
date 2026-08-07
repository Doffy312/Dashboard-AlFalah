
const StatusBadge = ({ type, text }) => {
  let bgColor = 'bg-gray-100 dark:bg-gray-800';
  let textColor = 'text-gray-800 dark:text-gray-200';
  let borderColor = 'border-gray-200 dark:border-gray-700';

  switch (type?.toLowerCase()) {
    case 'success':
    case 'pemasukan':
    case 'baik':
    case 'muzakki':
    case 'selesai':
      bgColor = 'bg-emerald-100 dark:bg-emerald-900/30';
      textColor = 'text-emerald-700 dark:text-emerald-400';
      borderColor = 'border-emerald-200 dark:border-emerald-800/50';
      break;
    case 'danger':
    case 'pengeluaran':
    case 'rusak berat':
      bgColor = 'bg-rose-100 dark:bg-rose-900/30';
      textColor = 'text-rose-700 dark:text-rose-400';
      borderColor = 'border-rose-200 dark:border-rose-800/50';
      break;
    case 'warning':
    case 'rusak ringan':
    case 'mustahik':
    case 'sedang berjalan':
      bgColor = 'bg-amber-100 dark:bg-amber-900/30';
      textColor = 'text-amber-700 dark:text-amber-400';
      borderColor = 'border-amber-200 dark:border-amber-800/50';
      break;
    case 'info':
    case 'umum':
    case 'direncanakan':
      bgColor = 'bg-blue-100 dark:bg-blue-900/30';
      textColor = 'text-blue-700 dark:text-blue-400';
      borderColor = 'border-blue-200 dark:border-blue-800/50';
      break;
    case 'purple':
    case 'yatim':
    case 'lansia':
      bgColor = 'bg-purple-100 dark:bg-purple-900/30';
      textColor = 'text-purple-700 dark:text-purple-400';
      borderColor = 'border-purple-200 dark:border-purple-800/50';
      break;
  }

  return (
    <span className={`px-2.5 py-1 rounded-full font-label-sm text-[11px] font-medium border ${bgColor} ${textColor} ${borderColor}`}>
      {text}
    </span>
  );
};

export default StatusBadge;
