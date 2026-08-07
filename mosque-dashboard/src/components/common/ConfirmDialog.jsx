import React from 'react';
import Modal from './Modal';
import { AlertTriangle } from 'lucide-react';

const ConfirmDialog = ({ isOpen, onClose, onConfirm, title, message, confirmText = "Hapus", cancelText = "Batal", isDanger = true }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="flex flex-col items-center text-center p-sm">
        <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-md ${isDanger ? 'bg-rose-100/50 dark:bg-rose-900/30 text-rose-500' : 'bg-amber-100/50 dark:bg-amber-900/30 text-amber-500'}`}>
          <AlertTriangle size={32} />
        </div>
        <p className="font-body-md text-on-surface-variant dark:text-white/80 mb-xl">
          {message}
        </p>
        
        <div className="flex gap-sm w-full">
          <button 
            onClick={onClose}
            className="flex-1 py-[10px] rounded-xl border border-white/20 dark:border-white/10 bg-white/10 hover:bg-white/20 text-on-surface dark:text-white font-label-md transition-colors"
          >
            {cancelText}
          </button>
          <button 
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`flex-1 py-[10px] rounded-xl font-label-md text-white transition-all shadow-md active:scale-95 ${isDanger ? 'bg-rose-500 hover:bg-rose-600 shadow-rose-500/20' : 'bg-primary hover:bg-primary/90 shadow-primary/20'}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmDialog;
