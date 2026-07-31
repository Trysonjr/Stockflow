import React, { createContext, useState, useContext } from 'react';
import { CheckCircle, XCircle } from 'lucide-react';

const ToastContext = createContext();
export const useToast = () => useContext(ToastContext);

export const ToastProvider = ({ children }) => {
    const [toast, setToast] = useState(null);

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        // Automatically hide the toast after 3 seconds
        setTimeout(() => setToast(null), 3000);
    };

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            {/* Toast UI */}
            {toast && (
                <div className="fixed bottom-6 right-6 z-[100] transition-all duration-300 transform">
                    <div className={`flex items-center gap-3 p-4 rounded-xl shadow-2xl border ${toast.type === 'success' ? 'bg-white dark:bg-gray-800 border-green-200 dark:border-green-900' : 'bg-white dark:bg-gray-800 border-red-200 dark:border-red-900'}`}>
                        {toast.type === 'success' ? <CheckCircle className="text-green-500" size={24} /> : <XCircle className="text-red-500" size={24} />}
                        <p className="font-medium text-gray-800 dark:text-white">{toast.message}</p>
                    </div>
                </div>
            )}
        </ToastContext.Provider>
    );
};