import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth } from '../../lib/firebase';
import { FirestoreService } from '../../services/firestore';
import { useAdmin } from '../../context/AdminContext';
import { Mail, Lock, User, BookOpen, Briefcase, GraduationCap, Loader2, ArrowRight, ShieldCheck } from 'lucide-react';

const Signup = () => {
    const navigate = useNavigate();
    const { refreshProfile, updateProfile } = useAdmin();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        department: 'EEE', // Default
        status: 'Student', // Default
        studentId: '',
        designation: ''
    });
    const [error, setError] = useState('');

    const departments = ['EEE', 'CSE', 'CE', 'Sc&Hum', 'DBA', 'Law', 'English'];

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // 0. Check if email already exists in Firestore (manual check)
            const existingUsers = await FirestoreService.getCollectionWhere('users', 'email', '==', formData.email);
            if (existingUsers.length > 0) {
                setError("An account with this email already exists.");
                setLoading(false);
                return;
            }

            // 1. Create User in Auth
            const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
            const user = userCredential.user;

            // 2. Update Auth Profile
            await updateProfile(user, {
                displayName: formData.name
            });

            // Force reload to ensure local auth object has the display name
            await user.reload();
            const updatedUser = auth.currentUser;

            // 3. Store Extended Data in Firestore
            const userData = {
                uid: user.uid,
                email: formData.email,
                displayName: formData.name,
                role: 'Member', // Explicit Default
                department: formData.department,
                status: formData.status.trim(),
                studentId: formData.status === 'Student' ? formData.studentId : null,
                designation: formData.status === 'Teacher' ? formData.designation : null,
                createdAt: new Date().toISOString()
            };

            // Send Welcome Email (Non-blocking)
            GAS_API.sendWelcomeEmail(formData.email, formData.name).catch(console.error);

            await FirestoreService.addDocumentWithId('users', user.uid, userData);

            // 4. Update the context immediately with known data (priming) to avoid race conditions
            updateProfile({
                ...userData,
                displayName: user.displayName || formData.name, // Ensure display name is present
                photoURL: user.photoURL // Ensure photoURL is synchronized (even if null)
            });
            // Also call refresh in background to double check, but don't await it to block nav
            refreshProfile(updatedUser);

            navigate('/admin'); // Redirect to dashboard/home after signup
        } catch (err) {
            console.error(err);
            setError(err.message || "Failed to create account.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-(--bg-primary) flex items-center justify-center p-4">
            <div className="w-full max-w-lg bg-(--bg-surface) rounded-2xl shadow-xl border border-(--border-subtle) overflow-hidden animate-in fade-in zoom-in duration-300">
                <div className="p-8 border-b border-(--border-subtle) bg-(--bg-secondary)/10 text-center">
                    <h1 className="text-2xl font-bold text-(--text-primary) mb-2">Join IEEE {'<NAME>'} SB</h1>
                    <p className="text-(--text-secondary) text-sm">Create your account to connect and collaborate.</p>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-5">
                    {error && (
                        <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-600 rounded-lg text-sm text-center font-medium">
                            {error}
                        </div>
                    )}

                    <div className="space-y-4">
                        {/* Name & Email */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-(--text-secondary)">Full Name</label>
                            <div className="relative">
                                <User className="absolute left-3 top-3 text-(--text-muted)" size={18} />
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-(--bg-primary) border border-(--border-subtle) focus:ring-2 focus:ring-(--ieee-blue)/20 outline-none text-(--text-primary)"
                                    placeholder="John Doe"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-(--text-secondary)">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-3 text-(--text-muted)" size={18} />
                                <input
                                    type="email"
                                    required
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-(--bg-primary) border border-(--border-subtle) focus:ring-2 focus:ring-(--ieee-blue)/20 outline-none text-(--text-primary)"
                                    placeholder="john@example.com"
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-(--text-secondary)">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-3 text-(--text-muted)" size={18} />
                                <input
                                    type="password"
                                    required
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-(--bg-primary) border border-(--border-subtle) focus:ring-2 focus:ring-(--ieee-blue)/20 outline-none text-(--text-primary)"
                                    placeholder="••••••••"
                                    minLength={6}
                                />
                            </div>
                        </div>

                        {/* Department & Status */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-(--text-secondary)">Department</label>
                                <div className="relative">
                                    <BookOpen className="absolute left-3 top-3 text-(--text-muted)" size={18} />
                                    <select
                                        value={formData.department}
                                        onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-(--bg-primary) border border-(--border-subtle) focus:ring-2 focus:ring-(--ieee-blue)/20 outline-none text-(--text-primary) appearance-none"
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
                                    <Briefcase className="absolute left-3 top-3 text-(--text-muted)" size={18} />
                                    <select
                                        value={formData.status}
                                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-(--bg-primary) border border-(--border-subtle) focus:ring-2 focus:ring-(--ieee-blue)/20 outline-none text-(--text-primary) appearance-none"
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
                                {formData.status === 'Student' ? 'Student ID' : 'Designation'}
                            </label>
                            <div className="relative">
                                <GraduationCap className="absolute left-3 top-3 text-(--text-muted)" size={18} />
                                <input
                                    type="text"
                                    required
                                    value={formData.status === 'Student' ? formData.studentId : formData.designation}
                                    onChange={(e) => {
                                        if (formData.status === 'Student') {
                                            setFormData({ ...formData, studentId: e.target.value });
                                        } else {
                                            setFormData({ ...formData, designation: e.target.value });
                                        }
                                    }}
                                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-(--bg-primary) border border-(--border-subtle) focus:ring-2 focus:ring-(--ieee-blue)/20 outline-none text-(--text-primary)"
                                    placeholder={formData.status === 'Student' ? 'e.g. 1105001' : 'e.g. Professor'}
                                />
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full flex items-center justify-center gap-2 py-3 bg-(--ieee-blue) text-white rounded-xl hover:bg-(--ieee-dark-blue) transition-all font-bold shadow-lg hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0"
                    >
                        {loading ? <Loader2 className="animate-spin" /> : <>Create Account <ArrowRight size={18} /></>}
                    </button>

                    <div className="text-center pt-4 border-t border-(--border-subtle)">
                        <p className="text-sm text-(--text-secondary)">
                            Already have an account?{' '}
                            <Link to="/login" className="text-(--ieee-blue) font-bold hover:underline">
                                Sign In
                            </Link>
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Signup;
