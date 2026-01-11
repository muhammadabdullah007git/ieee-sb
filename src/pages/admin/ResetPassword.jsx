import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { AuthService } from '../../services/auth';
import { Mail, Lock, CheckCircle, AlertCircle, Loader2, ArrowRight } from 'lucide-react';

const ResetPassword = () => {
    const [email, setEmail] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // For Reset Mode
    const [pageMode, setPageMode] = useState('request'); // 'request' or 'reset'
    const [oobCode, setOobCode] = useState(null);
    const [verifyingCode, setVerifyingCode] = useState(false);

    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const query = new URLSearchParams(location.search);
        const mode = query.get('mode');
        const code = query.get('oobCode');

        if (mode === 'resetPassword' && code) {
            setPageMode('reset');
            setOobCode(code);
            verifyCode(code);
        }
    }, [location]);

    const verifyCode = async (code) => {
        setVerifyingCode(true);
        try {
            const email = await AuthService.verifyResetCode(code);
            setEmail(email); // Pre-fill email for confirmation
        } catch (err) {
            setError('Invalid or expired password reset link. Please request a new one.');
            setPageMode('request'); // Fallback to request mode
        } finally {
            setVerifyingCode(false);
        }
    };

    const handleRequestReset = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            await AuthService.resetPassword(email);
            setSuccess(`Password reset link sent to ${email}. Check your inbox!`);
        } catch (err) {
            setError(err.message || 'Failed to send reset email.');
        } finally {
            setLoading(false);
        }
    };

    const handleConfirmReset = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await AuthService.confirmReset(oobCode, newPassword);
            setSuccess("Password has been reset successfully! Redirecting to login...");
            setTimeout(() => navigate('/login'), 3000);
        } catch (err) {
            setError(err.message || 'Failed to reset password.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-(--bg-secondary) flex items-center justify-center p-4">
            <div className="bg-(--bg-surface) p-8 rounded-2xl shadow-(--shadow-md) w-full max-w-md border border-(--border-subtle)">

                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold text-(--text-primary) mb-2">
                        {pageMode === 'reset' ? 'Set New Password' : 'Reset Password'}
                    </h1>
                    <p className="text-(--text-secondary) text-sm">
                        {pageMode === 'reset'
                            ? 'Enter your new password below.'
                            : 'Enter your email to receive a reset link.'}
                    </p>
                </div>

                {/* Status Messages */}
                {error && (
                    <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-2 text-red-600 dark:text-red-400 text-sm">
                        <AlertCircle size={18} />
                        {error}
                    </div>
                )}

                {success && (
                    <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-center gap-2 text-green-600 dark:text-green-400 text-sm">
                        <CheckCircle size={18} />
                        {success}
                    </div>
                )}

                {/* REQUEST FORM */}
                {pageMode === 'request' && (
                    <form onSubmit={handleRequestReset} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-(--text-secondary)">Email Address</label>
                            <div className="relative">
                                <Mail size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-(--text-muted)" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-(--bg-primary) border border-(--border-subtle) focus:ring-2 focus:ring-(--ieee-blue)/20 focus:border-(--ieee-blue) outline-hidden text-(--text-primary)"
                                    placeholder="Enter your email"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="w-full flex items-center justify-center gap-2 bg-(--ieee-blue) text-white font-bold py-3 rounded-xl transition-all hover:bg-(--ieee-dark-blue) hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-blue-500/20"
                            disabled={loading || success}
                        >
                            {loading ? <Loader2 className="animate-spin" /> : 'Send Reset Link'}
                        </button>
                    </form>
                )}

                {/* RESET FORM */}
                {pageMode === 'reset' && (
                    <form onSubmit={handleConfirmReset} className="space-y-6">
                        {verifyingCode ? (
                            <div className="flex justify-center p-8">
                                <Loader2 className="animate-spin text-(--ieee-blue)" size={32} />
                            </div>
                        ) : (
                            <>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-(--text-secondary)">New Password</label>
                                    <div className="relative">
                                        <Lock size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-(--text-muted)" />
                                        <input
                                            type="password"
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            required
                                            minLength={6}
                                            className="w-full pl-10 pr-4 py-3 rounded-xl bg-(--bg-primary) border border-(--border-subtle) focus:ring-2 focus:ring-(--ieee-blue)/20 focus:border-(--ieee-blue) outline-hidden text-(--text-primary)"
                                            placeholder="••••••••"
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    className="w-full flex items-center justify-center gap-2 bg-(--ieee-blue) text-white font-bold py-3 rounded-xl transition-all hover:bg-(--ieee-dark-blue) hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-blue-500/20"
                                    disabled={loading || success}
                                >
                                    {loading ? <Loader2 className="animate-spin" /> : 'Reset Password'}
                                </button>
                            </>
                        )}
                    </form>
                )}

                <div className="text-center pt-8 border-t border-(--border-subtle) mt-6">
                    <Link to="/login" className="flex items-center justify-center gap-2 text-sm text-(--text-secondary) hover:text-(--ieee-blue) font-medium transition-colors">
                        <ArrowRight className="rotate-180" size={16} /> Back to Sign In
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;
