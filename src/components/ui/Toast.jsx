import React, { useEffect } from 'react';
import { CheckCircle, XCircle, Info, X, AlertCircle } from 'lucide-react';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';

const Toast = ({ message, type = 'success', onClose, duration = 5000 }) => {
    useEffect(() => {
        const timer = setTimeout(onClose, duration);
        return () => clearTimeout(timer);
    }, [onClose, duration]);

    const icons = {
        success: <CheckCircle className="text-emerald-500" size={20} />,
        error: <XCircle className="text-red-500" size={20} />,
        warning: <AlertCircle className="text-amber-500" size={20} />,
        info: <Info className="text-blue-500" size={20} />
    };

    const styles = {
        success: 'text-emerald-600 dark:text-emerald-400',
        error: 'text-red-600 dark:text-red-400',
        warning: 'text-amber-600 dark:text-amber-400',
        info: 'text-blue-600 dark:text-blue-400'
    };

    return (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-(--border-subtle) bg-(--bg-surface) shadow-xl shadow-black/5 backdrop-blur-md animate-in slide-in-from-right-full duration-300 min-w-[300px]">
            <div className={styles[type]}>
                {icons[type]}
            </div>
            <p className="text-sm font-medium text-(--text-primary) flex-1">{message}</p>
            <button
                type="button"
                onClick={(e) => {
                    e.stopPropagation();
                    onClose();
                }}
                className="text-(--text-muted) hover:text-(--text-primary) transition-colors p-1 hover:bg-(--bg-secondary) rounded-lg shrink-0"
                aria-label="Close notification"
            >
                <X size={14} />
            </button>
        </div>
    );
};

export default Toast;
