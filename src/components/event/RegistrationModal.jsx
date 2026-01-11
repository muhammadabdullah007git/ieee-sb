import React, { useState } from 'react';
import { X, User, Mail, School, Hash, Loader2, CheckCircle2 } from 'lucide-react';
import { GAS_API } from '../../services/gas';

const RegistrationModal = ({ event, isOpen, onClose }) => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        studentId: '',
        department: '',
        transactionId: ''
    });
    const [status, setStatus] = useState('idle'); // idle, loading, success, error
    const [message, setMessage] = useState('');

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus('loading');
        try {
            const result = await GAS_API.registerEvent({
                ...formData,
                eventName: event.title,
                eventDate: event.date
            });

            if (result.status === 'success') {
                setStatus('success');
                setMessage('Registration successful! Check your email for confirmation.');
            } else {
                throw new Error(result.message || 'Registration failed');
            }
        } catch (error) {
            console.error("Registration error:", error);
            setStatus('error');
            setMessage(error.message || 'Failed to register. Please try again.');
        }
    };

    if (status === 'success') {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-colors duration-300">
                <div className="bg-(--bg-surface) rounded-2xl p-8 max-w-sm w-full text-center shadow-(--shadow-md) border border-(--border-subtle) animate-in zoom-in duration-300">
                    <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6 text-green-600">
                        <CheckCircle2 size={40} />
                    </div>
                    <h2 className="text-2xl font-bold text-(--text-primary) mb-2">Success!</h2>
                    <p className="text-(--text-secondary) mb-8">{message}</p>
                    <button
                        type="button"
                        onClick={onClose}
                        className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/25"
                    >
                        Great, thanks!
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-colors duration-300">
            <div className="bg-(--bg-surface) rounded-2xl shadow-(--shadow-md) w-full max-w-md overflow-hidden border border-(--border-subtle) animate-in fade-in zoom-in duration-200">
                <div className="relative h-32 bg-blue-600 overflow-hidden">
                    <div className="absolute inset-0 bg-linear-to-br from-blue-600 to-blue-800 opacity-90"></div>
                    <div className="absolute inset-0 pattern-dots opacity-20"></div>
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            onClose();
                        }}
                        className="absolute top-4 left-4 p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors z-10"
                        aria-label="Close modal"
                    >
                        <X size={20} />
                    </button>
                    <div className="absolute bottom-6 left-6 text-white">
                        <h2 className="text-2xl font-bold leading-none mb-1">Event Registration</h2>
                        <p className="text-blue-100 text-sm">{event.title}</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {status === 'error' && (
                        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm">
                            {message}
                        </div>
                    )}

                    <div className="space-y-4 max-h-[60vh] overflow-y-auto px-1">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-(--text-muted) uppercase tracking-wider px-1">Full Name</label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-(--text-muted)" size={18} />
                                <input
                                    required
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-(--bg-secondary) border border-(--border-subtle) focus:ring-2 focus:ring-blue-500 outline-hidden text-(--text-primary) transition-all shadow-xs"
                                    placeholder="Enter your name"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-(--text-muted) uppercase tracking-wider px-1">Academic Email</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-(--text-muted)" size={18} />
                                <input
                                    required
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-(--bg-secondary) border border-(--border-subtle) focus:ring-2 focus:ring-blue-500 outline-hidden text-(--text-primary) transition-all shadow-xs"
                                    placeholder="e.g. 2102001@baiust.ac.bd"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-(--text-muted) uppercase tracking-wider px-1">Student ID</label>
                                <div className="relative">
                                    <Hash className="absolute left-3 top-1/2 -translate-y-1/2 text-(--text-muted)" size={18} />
                                    <input
                                        required
                                        type="text"
                                        value={formData.studentId}
                                        onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                                        className="w-full pl-10 pr-4 py-3 rounded-xl bg-(--bg-secondary) border border-(--border-subtle) focus:ring-2 focus:ring-blue-500 outline-hidden text-(--text-primary) transition-all shadow-xs"
                                        placeholder="2102001"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-(--text-muted) uppercase tracking-wider px-1">Department</label>
                                <div className="relative">
                                    <School className="absolute left-3 top-1/2 -translate-y-1/2 text-(--text-muted)" size={18} />
                                    <select
                                        required
                                        value={formData.department}
                                        onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                                        className="w-full pl-10 pr-4 py-3 rounded-xl bg-(--bg-secondary) border border-(--border-subtle) focus:ring-2 focus:ring-blue-500 outline-hidden text-(--text-primary) appearance-none transition-all shadow-xs"
                                    >
                                        <option value="">Select</option>
                                        <option value="EEE">EEE</option>
                                        <option value="CSE">CSE</option>
                                        <option value="CE">CE</option>
                                        <option value="ME">ME</option>
                                        <option value="BBA">BBA</option>
                                        <option value="English">English</option>
                                        <option value="Law">Law</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-(--text-muted) uppercase tracking-wider px-1">Transaction ID (Bkash/Nagad)</label>
                            <input
                                required
                                type="text"
                                value={formData.transactionId}
                                onChange={(e) => setFormData({ ...formData, transactionId: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl bg-(--bg-secondary) border border-(--border-subtle) focus:ring-2 focus:ring-blue-500 outline-hidden text-(--text-primary) transition-all shadow-xs"
                                placeholder="e.g. AB1234CD"
                            />
                            <p className="text-[10px] text-(--text-muted) px-1 italic">* Registration fee: {event.fee || 'Free'} (Send to +880123456789)</p>
                        </div>
                    </div>

                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={status === 'loading'}
                            className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/25 disabled:opacity-50 active:scale-[0.98]"
                        >
                            {status === 'loading' ? (
                                <>
                                    <Loader2 className="animate-spin" size={20} />
                                    Processing...
                                </>
                            ) : (
                                'Complete Registration'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default RegistrationModal;
