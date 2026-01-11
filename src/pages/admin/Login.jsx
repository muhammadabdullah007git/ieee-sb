import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { AuthService } from '../../services/auth';
import { Mail, Lock, AlertCircle, Loader2, Info, Clock, AlertTriangle } from 'lucide-react';
import { isFirebaseInitialized } from '../../lib/firebase';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    // Check for session timeout
    const searchParams = new URLSearchParams(location.search);
    const isTimedOut = searchParams.get('reason') === 'session_timeout';

    if (!isFirebaseInitialized) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-(--bg-secondary) text-center p-6">
                <div className="p-4 rounded-full bg-yellow-100 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400 mb-4">
                    <AlertCircle size={48} />
                </div>
                <h1 className="text-2xl font-bold text-(--text-primary) mb-2">Firebase Not Configured</h1>
                <p className="text-(--text-secondary) max-w-md mb-6">
                    You need to configure your Firebase keys in <code className="bg-(--bg-primary) px-2 py-1 rounded text-sm border border-(--border-subtle)">src/lib/firebase.js</code> to log in.
                </p>
            </div>
        );
    }

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await AuthService.login(email, password);
            navigate('/admin/dashboard');
        } catch {
            setError('Invalid email or password. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-(--bg-secondary) flex items-center justify-center p-4">
            <div className="bg-(--bg-surface) p-8 rounded-2xl shadow-(--shadow-md) w-full max-w-md border border-(--border-subtle)">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-(--text-primary) mb-2">Welcome Back</h1>
                    <p className="text-(--text-secondary)">Sign in to access the admin dashboard</p>
                </div>

                {isTimedOut && (
                    <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg flex items-center gap-2 text-yellow-700 dark:text-yellow-400 text-sm">
                        <Clock size={18} />
                        Session timed out due to inactivity. Please sign in again.
                    </div>
                )}

                {error && (
                    <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-2 text-red-600 dark:text-red-400 text-sm">
                        <AlertCircle size={18} />
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin} className="space-y-6">
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
                                placeholder="admin@example.com"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-(--text-secondary)">Password</label>
                        <div className="relative">
                            <Lock size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-(--text-muted)" />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="w-full pl-10 pr-4 py-3 rounded-xl bg-(--bg-primary) border border-(--border-subtle) focus:ring-2 focus:ring-(--ieee-blue)/20 focus:border-(--ieee-blue) outline-hidden text-(--text-primary)"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    <div className="flex justify-end">
                        <Link to="/reset-password" className="text-sm text-(--ieee-blue) font-medium hover:underline">
                            Forgot Password?
                        </Link>
                    </div>

                    <button
                        type="submit"
                        className="w-full flex items-center justify-center gap-2 bg-(--ieee-blue) text-white font-bold py-3 rounded-xl transition-all hover:bg-(--ieee-dark-blue) hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-blue-500/20"
                        disabled={loading}
                    >
                        {loading ? <Loader2 className="animate-spin" /> : 'Sign In'}
                    </button>

                    <div className="text-center pt-4">
                        <p className="text-sm text-(--text-secondary)">
                            Don't have an account?{' '}
                            <Link to="/signup" className="text-(--ieee-blue) font-bold hover:underline">
                                Register Now
                            </Link>
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Login;
