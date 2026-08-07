import { PackageOpen } from 'lucide-react';

const EmptyState = ({ title, description, actionText, onAction, icon }) => {
  return (
    <div className="w-full flex flex-col items-center justify-center py-2xl px-lg text-center bg-white/30 dark:bg-black/20 backdrop-blur-md rounded-2xl border border-white/20 dark:border-white/10">
      <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-lg border border-primary/20">
        {icon || <PackageOpen size={40} />}
      </div>
      <h3 className="text-title-md font-title-md text-on-surface dark:text-white mb-xs">
        {title}
      </h3>
      <p className="font-body-md text-on-surface-variant dark:text-white/60 max-w-md mb-xl">
        {description}
      </p>
      
      {actionText && onAction && (
        <button 
          onClick={onAction}
          className="py-2 px-6 rounded-full bg-primary text-on-primary font-label-md hover:bg-primary/90 transition-all shadow-md shadow-primary/20 active:scale-95 flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          {actionText}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
