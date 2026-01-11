import React, { useState, useEffect, useRef } from 'react';
import { X, Copy, Check, Link as LinkIcon, Share2 } from 'lucide-react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '../../context/ToastContext';

const ShareModal = ({ isOpen, onClose, url }) => {
    const { showToast } = useToast();
    const [copied, setCopied] = useState(false);
    const modalOpenRef = useRef(false);

    useEffect(() => {
        if (isOpen && !modalOpenRef.current) {
            modalOpenRef.current = true;
            setCopied(false);
        } else if (!isOpen) {
            modalOpenRef.current = false;
        }
    }, [isOpen]);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            showToast("Link copied to clipboard", "success");
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy code: ', err);
            showToast("Failed to copy link", "error");
        }
    };

    if (!isOpen) return null;

    return createPortal(
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                {/* Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-black/40 backdrop-blur-xs"
                />

                {/* Modal */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 10 }}
                    className="relative w-full max-w-md bg-(--bg-surface) rounded-2xl shadow-2xl border border-(--border-subtle) overflow-hidden"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between px-6 py-4 border-b border-(--border-subtle)">
                        <div className="flex items-center gap-2 text-(--text-primary)">
                            <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500">
                                <Share2 size={20} />
                            </div>
                            <h3 className="font-bold text-lg">Share Content</h3>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 text-(--text-muted) hover:bg-(--bg-secondary) rounded-lg transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-6 space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-(--text-secondary)">Link to share</label>
                            <div className="flex items-center gap-2 p-3 bg-(--bg-secondary) rounded-xl border border-(--border-subtle)">
                                <LinkIcon size={18} className="text-(--text-muted) shrink-0" />
                                <input
                                    type="text"
                                    readOnly
                                    value={url}
                                    className="bg-transparent border-none outline-none text-sm text-(--text-primary) flex-1 truncate w-full"
                                    onClick={(e) => e.target.select()}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            {/* Placeholder for future social buttons if needed */}
                        </div>

                        <button
                            onClick={handleCopy}
                            className={`w-full py-3 px-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${copied
                                ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                                : "bg-(--ieee-blue) text-white hover:bg-(--ieee-dark-blue) shadow-md hover:shadow-lg hover:-translate-y-0.5"
                                }`}
                        >
                            {copied ? <Check size={18} /> : <Copy size={18} />}
                            {copied ? "Copied!" : "Copy Link"}
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>,
        document.body
    );
};

export default ShareModal;
