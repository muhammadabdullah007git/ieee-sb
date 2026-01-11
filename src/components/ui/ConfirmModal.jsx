import React from 'react';
import { AlertCircle, X } from 'lucide-react';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';

const ConfirmModal = ({ isOpen, title, message, onConfirm, onClose, confirmText = 'Confirm', cancelText = 'Cancel', type = 'danger' }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-(--bg-surface) rounded-2xl shadow-(--shadow-md) w-full max-w-md overflow-hidden border border-(--border-subtle) animate-in fade-in zoom-in duration-200">
                <div className="flex items-center gap-4 p-6 border-b border-(--border-subtle) bg-(--bg-secondary)/10">
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            onClose();
                        }}
                        className="p-2 hover:bg-(--bg-secondary) rounded-lg transition-colors text-(--text-muted) hover:text-(--text-primary)"
                        aria-label="Close modal"
                    >
                        <X size={20} />
                    </button>
                    <h3 className="text-xl font-bold text-(--text-primary)">{title}</h3>
                </div>

                <div className="p-6">
                    <div className="flex items-center gap-4 mb-4">
                        <div className={`p-3 rounded-xl ${type === 'danger' ? 'bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400' : 'bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'}`}>
                            <AlertCircle size={24} />
                        </div>
                        <h4 className="text-lg font-bold text-(--text-primary)">Confirm Action</h4>
                    </div>
                    <p className="text-(--text-secondary) leading-relaxed">{message}</p>
                </div>

                <div className="p-6 bg-(--bg-secondary) flex justify-between gap-3 border-t border-(--border-subtle)">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 text-(--text-secondary) font-medium hover:text-(--text-primary) transition-colors"
                    >
                        {cancelText}
                    </button>
                    <button
                        type="button"
                        onClick={onConfirm}
                        className={`px-6 py-2 rounded-xl text-white font-bold transition-all active:scale-95 shadow-lg ${type === 'danger'
                            ? 'bg-red-600 hover:bg-red-700 shadow-red-500/20'
                            : 'bg-(--ieee-blue) hover:bg-(--ieee-dark-blue) shadow-(--ieee-blue)/20'
                            }`}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmModal;
