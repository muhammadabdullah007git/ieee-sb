import React, { useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import { isFirebaseInitialized } from '../../lib/firebase';
import { FirestoreService } from '../../services/firestore';
import { AlertTriangle, Loader2 } from 'lucide-react';

const RequireAuth = () => {
    const [authenticated, setAuthenticated] = useState(null);
    const [userRole, setUserRole] = useState(null);
    const [loading, setLoading] = useState(true);
    const location = useLocation();

    useEffect(() => {
        if (!isFirebaseInitialized) {
            setLoading(false);
            return;
        }

        const auth = getAuth();
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                setAuthenticated(true);
                // Fetch role
                try {
                    const userData = await FirestoreService.getDocument('users', user.uid);
                    setUserRole(userData?.role || 'Admin');
                } catch (error) {
                    console.error("Error fetching role:", error);
                    setUserRole('Admin');
                }
            } else {
                setAuthenticated(false);
                setUserRole(null);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    useEffect(() => {
        if (!authenticated || !isFirebaseInitialized) return;

        const auth = getAuth();
        let timeoutId;

        const resetTimer = () => {
            if (timeoutId) clearTimeout(timeoutId);
            const timeoutMinutes = parseInt(import.meta.env.VITE_ADMIN_SESSION_TIMEOUT) || 30;
            const timeoutMs = timeoutMinutes * 60 * 1000;

            timeoutId = setTimeout(async () => {
                try {
                    // Set a flag in session storage before signing out to trigger the redirect with reason
                    sessionStorage.setItem('session_timeout', 'true');
                    await signOut(auth);
                    // The onAuthStateChanged will handle the redirect if sessionStorage is set
                    window.location.href = '/admin/login?reason=session_timeout';
                } catch (error) {
                    console.error("Error during session timeout logout:", error);
                }
            }, timeoutMs);
        };

        const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
        events.forEach(event => document.addEventListener(event, resetTimer));
        resetTimer();

        return () => {
            if (timeoutId) clearTimeout(timeoutId);
            events.forEach(event => document.removeEventListener(event, resetTimer));
        };
    }, [authenticated]);

    if (!isFirebaseInitialized) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-(--bg-secondary) text-center p-6">
                <div className="p-4 rounded-full bg-yellow-100 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400 mb-4">
                    <AlertTriangle size={48} />
                </div>
                <h1 className="text-2xl font-bold text-(--text-primary) mb-2">Firebase Not Configured</h1>
                <p className="text-(--text-secondary) max-w-md mb-6">
                    To access the Admin Dashboard, you need to configure your Firebase keys in <code className="bg-(--bg-primary) px-2 py-1 rounded text-sm border border-(--border-subtle)">src/lib/firebase.js</code>.
                </p>
                <a href="/" className="px-6 py-2.5 bg-(--ieee-blue) text-white rounded-lg hover:bg-(--ieee-dark-blue) transition-colors font-medium">Return Home</a>
            </div>
        );
    }

    if (loading) {
        // Loading state
        return <div className="min-h-screen flex items-center justify-center bg-(--bg-primary)">
            <Loader2 className="animate-spin h-12 w-12 text-(--ieee-blue)" />
        </div>;
    }

    if (!authenticated) {
        const isTimeout = sessionStorage.getItem('session_timeout') === 'true';
        if (isTimeout) sessionStorage.removeItem('session_timeout');
        return <Navigate to={isTimeout ? "/admin/login?reason=session_timeout" : "/admin/login"} replace />;
    }

    // Role-Based Route Protection
    if (userRole === 'Editor' || userRole === 'Member') {
        const restrictedPaths = ['/admin/panel', '/admin/events', '/admin/certificates', '/admin/mail', '/admin/users'];
        const isRestricted = restrictedPaths.some(path => location.pathname.startsWith(path));

        if (isRestricted) {
            return <Navigate to="/admin/dashboard" replace />;
        }
    }

    return <Outlet />;
};

export default RequireAuth;
