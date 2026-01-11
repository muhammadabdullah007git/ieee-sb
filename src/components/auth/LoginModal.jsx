import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthService } from '../../services/auth';
import { useAdmin } from '../../context/AdminContext';
import { Lock, Mail, AlertCircle, X, Loader2, User, BookOpen, Briefcase, GraduationCap } from 'lucide-react';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth } from '../../lib/firebase';
import { FirestoreService } from '../../services/firestore';

const LoginModal = () => {
    const { isLoginModalOpen, closeLoginModal } = useAdmin();
    // const navigate = useNavigate(); // Not needed if we keep user in context/modal

    // Mode State
    const [isSignup, setIsSignup] = useState(false);
    const [isForgotPassword, setIsForgotPassword] = useState(false);

    // Form States
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [department, setDepartment] = useState('EEE');
    const [status, setStatus] = useState('Student');
    const [studentId, setStudentId] = useState('');
    const [designation, setDesignation] = useState('');

    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    const departments = ['EEE', 'CSE', 'CE', 'Sc&Hum', 'DBA', 'Law', 'English'];

    if (!isLoginModalOpen) return null;

    const resetForm = () => {
        setEmail('');
        setPassword('');
        setName('');
        setDepartment('EEE');
        setStatus('Student');
        setStudentId('');
        setDesignation('');
        setError('');
        setSuccessMessage('');
        setLoading(false);
    };

    const handleClose = () => {
        closeLoginModal();
        setIsSignup(false);
        setIsForgotPassword(false);
        resetForm();
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await AuthService.login(email, password);
            handleClose();
        } catch {
            setError('Invalid email or password. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordReset = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMessage('');
        setLoading(true);

        try {
            await AuthService.resetPassword(email);
            setSuccessMessage("Password reset email sent! Check your inbox.");
        } catch (err) {
            console.error(err);
            if (err.code === 'auth/user-not-found') {
                setError("No user found with this email.");
            } else {
                setError("Failed to send reset email. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleSignup = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // 1. Create User in Auth
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // 2. Update Auth Profile
            await updateProfile(user, {
                displayName: name
            });

            // 3. Store Extended Data in Firestore
            const userData = {
                uid: user.uid,
                email: email,
                displayName: name,
                role: 'Member', // Default role
                department: department,
                status: status,
                createdAt: new Date().toISOString()
            };

            if (status === 'Student') {
                userData.studentId = studentId;
            } else {
                userData.designation = designation;
            }

            await FirestoreService.addDocumentWithId('users', user.uid, userData);

            // Auto login happens by default with Firebase create user
            handleClose();
        } catch (err) {
            console.error(err);
            setError(err.message || "Failed to create account.");
        } finally {
            setLoading(false);
        }
    };

    // Helper title text
    let modalTitle = 'Sign In';
    if (isSignup) modalTitle = 'Create Account';
    if (isForgotPassword) modalTitle = 'Reset Password';

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
            <div className="bg-(--bg-surface) w-full max-w-md rounded-2xl shadow-2xl border border-(--border-subtle) animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
                <div className="relative p-6 border-b border-(--border-subtle) flex items-center justify-between bg-(--bg-secondary)/10 shrink-0">
                    <h2 className="text-xl font-bold text-(--text-primary)">
                        {modalTitle}
                    </h2>
                    <button
                        onClick={handleClose}
                        className="p-1.5 rounded-full hover:bg-(--bg-secondary) text-(--text-muted) hover:text-(--text-primary) transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto custom-scrollbar">
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-2 text-red-600 dark:text-red-400 text-sm">
                            <AlertCircle size={18} />
                            {error}
                        </div>
                    )}

                    {successMessage && (
                        <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-center gap-2 text-green-600 dark:text-green-400 text-sm">
                            <AlertCircle size={18} />
                            {successMessage}
                        </div>
                    )}

                    <form onSubmit={
                        isForgotPassword ? handlePasswordReset :
                            isSignup ? handleSignup :
                                handleLogin
                    } className="space-y-4">

                        {isSignup && !isForgotPassword && (
                            <div className="space-y-4 animate-in slide-in-from-right-4 fade-in duration-300">
                                {/* Name */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-(--text-secondary)">Full Name</label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 text-(--text-muted)" size={18} />
                                        <input
                                            type="text"
                                            required
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-(--bg-primary) border border-(--border-subtle) focus:ring-2 focus:ring-(--ieee-blue)/20 outline-none text-(--text-primary)"
                                            placeholder="John Doe"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Email */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-(--text-secondary)">Email Address</label>
                            <div className="relative">
                                <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-(--text-muted)" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-(--bg-primary) border border-(--border-subtle) focus:ring-2 focus:ring-(--ieee-blue)/20 focus:border-(--ieee-blue) outline-hidden text-(--text-primary)"
                                    placeholder="your@email.com"
                                />
                            </div>
                        </div>

                        {/* Password */}
                        {!isForgotPassword && (
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <label className="text-sm font-medium text-(--text-secondary)">Password</label>
                                    {!isSignup && (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setIsForgotPassword(true);
                                                setError('');
                                                setSuccessMessage('');
                                            }}
                                            className="text-xs text-(--ieee-blue) font-bold hover:underline"
                                        >
                                            Forgot Password?
                                        </button>
                                    )}
                                </div>
                                <div className="relative">
                                    <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-(--text-muted)" />
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-(--bg-primary) border border-(--border-subtle) focus:ring-2 focus:ring-(--ieee-blue)/20 focus:border-(--ieee-blue) outline-hidden text-(--text-primary)"
                                        placeholder="••••••••"
                                        minLength={6}
                                    />
                                </div>
                            </div>
                        )}

                        {isSignup && !isForgotPassword && (
                            <div className="space-y-4 animate-in slide-in-from-right-4 fade-in duration-300 pt-2">
                                {/* Department & Status Row */}
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-(--text-secondary)">Department</label>
                                        <div className="relative">
                                            <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 text-(--text-muted)" size={16} />
                                            <select
                                                value={department}
                                                onChange={(e) => setDepartment(e.target.value)}
                                                className="w-full pl-9 pr-2 py-2.5 rounded-xl bg-(--bg-primary) border border-(--border-subtle) focus:ring-2 focus:ring-(--ieee-blue)/20 outline-none text-(--text-primary) text-sm appearance-none"
                                            >
                                                {departments.map(dept => (
                                                    <option key={dept} value={dept}>{dept}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-(--text-secondary)">Status</label>
                                        <div className="relative">
                                            <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 text-(--text-muted)" size={16} />
                                            <select
                                                value={status}
                                                onChange={(e) => setStatus(e.target.value)}
                                                className="w-full pl-9 pr-2 py-2.5 rounded-xl bg-(--bg-primary) border border-(--border-subtle) focus:ring-2 focus:ring-(--ieee-blue)/20 outline-none text-(--text-primary) text-sm appearance-none"
                                            >
                                                <option value="Student">Student</option>
                                                <option value="Teacher">Teacher</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                {/* Conditional Fields */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-(--text-secondary)">
                                        {status === 'Student' ? 'Student ID' : 'Designation'}
                                    </label>
                                    <div className="relative">
                                        <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 text-(--text-muted)" size={18} />
                                        <input
                                            type="text"
                                            required
                                            value={status === 'Student' ? studentId : designation}
                                            onChange={(e) => {
                                                if (status === 'Student') setStudentId(e.target.value);
                                                else setDesignation(e.target.value);
                                            }}
                                            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-(--bg-primary) border border-(--border-subtle) focus:ring-2 focus:ring-(--ieee-blue)/20 outline-none text-(--text-primary)"
                                            placeholder={status === 'Student' ? 'e.g. 1105001' : 'e.g. Professor'}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 rounded-xl bg-(--ieee-blue) hover:bg-(--ieee-dark-blue) text-white font-bold transition-all shadow-lg shadow-(--ieee-blue)/20 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2 mt-6"
                        >
                            {loading ? (
                                <>
                                    <Loader2 size={20} className="animate-spin" />
                                    {isForgotPassword ? 'Sending...' : (isSignup ? 'Creating Account...' : 'Signing in...')}
                                </>
                            ) : (
                                isForgotPassword ? 'Send Reset Link' : (isSignup ? 'Create Account' : 'Sign In')
                            )}
                        </button>
                    </form>

                    <div className="mt-6 text-center text-sm text-(--text-secondary)">
                        {isForgotPassword ? (
                            <>
                                Remember your password?{' '}
                                <button
                                    onClick={() => {
                                        setIsForgotPassword(false);
                                        setError('');
                                        setSuccessMessage('');
                                    }}
                                    className="font-bold text-(--ieee-blue) hover:underline"
                                >
                                    Back to Login
                                </button>
                            </>
                        ) : (
                            <>
                                {isSignup ? 'Already have an account? ' : "Don't have an account? "}
                                <button
                                    onClick={() => {
                                        setIsSignup(!isSignup);
                                        setError('');
                                    }}
                                    className="font-bold text-(--ieee-blue) hover:underline"
                                >
                                    {isSignup ? 'Sign In' : 'Register Now'}
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div >
    );
};

export default LoginModal;
