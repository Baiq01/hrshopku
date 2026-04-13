import { createContext, useContext, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';

const ToastContext = createContext();

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 4000, options = {}) => {
    const id = Date.now() + Math.random();
    const toast = { id, message, type, duration, ...options };
    
    setToasts(prev => [...prev, toast]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const success = useCallback((message, duration) => addToast(message, 'success', duration), [addToast]);
  const error = useCallback((message, duration) => addToast(message, 'error', duration), [addToast]);
  const info = useCallback((message, duration) => addToast(message, 'info', duration), [addToast]);
  const warning = useCallback((message, duration) => addToast(message, 'warning', duration), [addToast]);
  const cart = useCallback((message, options = {}) => addToast(message, 'cart', 3000, options), [addToast]);

  return (
    <ToastContext.Provider value={{ success, error, info, warning, cart, addToast, removeToast }}>
      {children}
      {createPortal(<ToastContainer toasts={toasts} removeToast={removeToast} />, document.body)}
    </ToastContext.Provider>
  );
}

function ToastContainer({ toasts, removeToast }) {
  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-3 pointer-events-none">
      {toasts.map(toast => (
        <Toast key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
      ))}
    </div>
  );
}

function Toast({ toast, onClose }) {
  const { type, message, productName, productImage } = toast;

  const styles = {
    success: {
      bg: 'bg-gradient-to-r from-green-500 to-emerald-500',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
      ),
      ring: 'ring-green-200',
    },
    error: {
      bg: 'bg-gradient-to-r from-red-500 to-rose-500',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
        </svg>
      ),
      ring: 'ring-red-200',
    },
    warning: {
      bg: 'bg-gradient-to-r from-yellow-500 to-orange-500',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
      ),
      ring: 'ring-yellow-200',
    },
    info: {
      bg: 'bg-gradient-to-r from-blue-500 to-indigo-500',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
        </svg>
      ),
      ring: 'ring-blue-200',
    },
    cart: {
      bg: 'bg-gradient-to-r from-rose-500 to-pink-500',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
        </svg>
      ),
      ring: 'ring-rose-200',
    },
  };

  const style = styles[type] || styles.info;

  // Special cart toast with product image
  if (type === 'cart' && productImage) {
    return (
      <div
        className={`pointer-events-auto flex items-center gap-3 bg-white text-gray-800 px-4 py-3 rounded-xl shadow-2xl ring-2 ring-rose-200 backdrop-blur-sm transform transition-all duration-300 ease-out animate-slide-in-right min-w-[320px] max-w-md`}
      >
        <div className="flex-shrink-0 w-12 h-12 rounded-lg overflow-hidden bg-gray-100">
          <img src={productImage} alt={productName} className="w-full h-full object-cover" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 text-rose-500 mb-0.5">
            {style.icon}
            <span className="text-xs font-semibold uppercase">Ditambahkan ke keranjang</span>
          </div>
          <p className="text-sm font-medium truncate">{productName || message}</p>
        </div>
        <a href="/cart" className="flex-shrink-0 bg-rose-500 hover:bg-rose-600 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors">
          Lihat
        </a>
        <button
          onClick={onClose}
          className="flex-shrink-0 w-6 h-6 flex items-center justify-center hover:bg-gray-100 rounded-full transition-colors text-gray-400"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
    );
  }

  return (
    <div
      className={`pointer-events-auto flex items-center gap-3 ${style.bg} text-white px-5 py-3 rounded-xl shadow-2xl ring-2 ${style.ring} backdrop-blur-sm transform transition-all duration-300 ease-out animate-slide-in-right min-w-[300px] max-w-md`}
    >
      <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-white/20 rounded-full">
        {style.icon}
      </div>
      <p className="flex-1 text-sm font-medium">{message}</p>
      <button
        onClick={onClose}
        className="flex-shrink-0 w-6 h-6 flex items-center justify-center hover:bg-white/20 rounded-full transition-colors"
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </button>
    </div>
  );
}

// CSS Animation (add to index.css)
const style = document.createElement('style');
style.textContent = `
  @keyframes slide-in-right {
    from {
      transform: translateX(400px);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
  .animate-slide-in-right {
    animation: slide-in-right 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  }
`;
document.head.appendChild(style);
