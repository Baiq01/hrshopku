import { createContext, useContext, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';

const ConfirmContext = createContext();

export function useConfirm() {
  const context = useContext(ConfirmContext);
  if (!context) {
    throw new Error('useConfirm must be used within ConfirmProvider');
  }
  return context;
}

export function ConfirmProvider({ children }) {
  const [confirmState, setConfirmState] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: null,
    onCancel: null,
    confirmText: 'Ya',
    cancelText: 'Batal',
    type: 'warning', // warning, danger, info
  });

  const confirm = useCallback(
    ({ 
      title = 'Konfirmasi', 
      message, 
      confirmText = 'Ya', 
      cancelText = 'Batal',
      type = 'warning'
    }) => {
      return new Promise((resolve) => {
        setConfirmState({
          isOpen: true,
          title,
          message,
          confirmText,
          cancelText,
          type,
          onConfirm: () => {
            setConfirmState(prev => ({ ...prev, isOpen: false }));
            resolve(true);
          },
          onCancel: () => {
            setConfirmState(prev => ({ ...prev, isOpen: false }));
            resolve(false);
          },
        });
      });
    },
    []
  );

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      {createPortal(<ConfirmDialog {...confirmState} />, document.body)}
    </ConfirmContext.Provider>
  );
}

function ConfirmDialog({ isOpen, title, message, confirmText, cancelText, type, onConfirm, onCancel }) {
  if (!isOpen) return null;

  const typeStyles = {
    warning: {
      icon: '⚠️',
      confirmBg: 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600',
      iconBg: 'bg-yellow-100',
      iconText: 'text-yellow-600',
    },
    danger: {
      icon: '🗑️',
      confirmBg: 'bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600',
      iconBg: 'bg-red-100',
      iconText: 'text-red-600',
    },
    info: {
      icon: 'ℹ️',
      confirmBg: 'bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600',
      iconBg: 'bg-blue-100',
      iconText: 'text-blue-600',
    },
  };

  const style = typeStyles[type] || typeStyles.warning;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-[10000] p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full transform transition-all animate-scale-in">
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className={`flex-shrink-0 w-12 h-12 ${style.iconBg} rounded-full flex items-center justify-center text-2xl`}>
              {style.icon}
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
              <p className="text-sm text-gray-600">{message}</p>
            </div>
          </div>
        </div>

        <div className="px-6 pb-6 flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all font-semibold"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 py-3 ${style.confirmBg} text-white rounded-lg transition-all shadow-md hover:shadow-lg font-semibold`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

// Add animations to head
const style = document.createElement('style');
style.textContent = `
  @keyframes fade-in {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  @keyframes scale-in {
    from {
      transform: scale(0.9);
      opacity: 0;
    }
    to {
      transform: scale(1);
      opacity: 1;
    }
  }
  .animate-fade-in {
    animation: fade-in 0.2s ease-out;
  }
  .animate-scale-in {
    animation: scale-in 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  }
`;
if (!document.getElementById('confirm-dialog-styles')) {
  style.id = 'confirm-dialog-styles';
  document.head.appendChild(style);
}
