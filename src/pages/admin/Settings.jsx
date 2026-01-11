import React, { useState, useEffect } from 'react';
import { Save, User, Lock, Globe, Server, CheckCircle, AlertTriangle, Loader2 } from 'lucide-react';
import { FirestoreService } from '../../services/firestore';
import { GAS_API } from '../../services/gas';
import { AuthService } from '../../services/auth';
import { auth } from '../../lib/firebase';
import { useToast } from '../../context/ToastContext';
import { useAdmin } from '../../context/AdminContext';

const Settings = () => {
    const [activeTab, setActiveTab] = useState('profile');
    const [gasConfig, setGasConfig] = useState({
        gas_url_features: '',
        gas_url_mail: '',
        gas_url_video: '',
        folder_id_events: '',
        folder_id_papers: '',
        folder_id_certificates: '',
        folder_id_avatars: '',
        folder_id_blogs: '',
        folder_id_panel: ''
    });
    const [displayName, setDisplayName] = useState('');
    const [department, setDepartment] = useState('');
    const [status, setStatus] = useState('Student');
    const [studentId, setStudentId] = useState('');
    const [designation, setDesignation] = useState('');

    const [passwordData, setPasswordData] = useState({
        current: '',
        new: '',
        confirm: ''
    });
    const [saving, setSaving] = useState(false);
    const [updatingPassword, setUpdatingPassword] = useState(false);
    const [updatingProfile, setUpdatingProfile] = useState(false);
    const { showToast } = useToast();
    const { profile, updateProfile } = useAdmin();

    useEffect(() => {
        // Load config on mount
        const loadConfig = async () => {
            const config = await FirestoreService.getGasConfig();
            setGasConfig({
                gas_url_features: config.gas_url_features || config.gas_url || '',
                gas_url_mail: config.gas_url_mail || '',
                gas_url_video: config.gas_url_video || '',
                folder_id_events: config.folder_id_events || '',
                folder_id_papers: config.folder_id_papers || '',
                folder_id_certificates: config.folder_id_certificates || '',
                folder_id_avatars: config.folder_id_avatars || '',
                folder_id_blogs: config.folder_id_blogs || '',
                folder_id_panel: config.folder_id_panel || ''
            });
        };
        loadConfig();
    }, []);

    // Load initial values from profile
    useEffect(() => {
        if (profile.uid) {
            setDisplayName(profile.displayName || '');
            setDepartment(profile.department || '');
            // Normalize status to Title Case to match Select options
            const rawStatus = (profile.status || 'Student').trim();
            const normalizedStatus = rawStatus.charAt(0).toUpperCase() + rawStatus.slice(1).toLowerCase();
            setStatus(normalizedStatus);

            setStudentId(profile.studentId || '');
            setDesignation(profile.designation || '');
        }
    }, [profile]);

    const handleSaveGasConfig = async () => {
        setSaving(true);
        try {
            await FirestoreService.updateDocument('config', 'general', gasConfig);
            showToast('Configuration updated successfully!', 'success');
        } catch {
            try {
                await FirestoreService.addDocumentWithId('config', 'general', gasConfig);
                showToast('Configuration saved successfully!', 'success');
            } catch {
                showToast('Failed to save configuration.', 'error');
            }
        } finally {
            setSaving(false);
        }
    };

    const extractFolderId = (input) => {
        if (!input) return '';
        // Check if input looks like a URL
        if (input.includes('drive.google.com')) {
            // Match /folders/ID
            const match = input.match(/folders\/([-\w]+)/);
            if (match && match[1]) {
                return match[1];
            }
        }
        return input; // Assume it's already an ID if no URL pattern matches
    };

    const handleConfigChange = (field, value) => {
        if (field.startsWith('folder_id')) {
            const extractedId = extractFolderId(value);
            setGasConfig(prev => ({ ...prev, [field]: extractedId }));
            if (extractedId !== value) {
                showToast("Extracted Folder ID from URL", "info");
            }
        } else {
            setGasConfig(prev => ({ ...prev, [field]: value }));
        }
    };

    const handleUpdatePassword = async (e) => {
        e.preventDefault();

        if (passwordData.new !== passwordData.confirm) {
            showToast("New passwords do not match", "error");
            return;
        }

        if (passwordData.new.length < 6) {
            showToast("Password must be at least 6 characters", "error");
            return;
        }

        setUpdatingPassword(true);
        try {
            await AuthService.updateAdminPassword(passwordData.current, passwordData.new);
            showToast("Password updated successfully", "success");
            setPasswordData({ current: '', new: '', confirm: '' });
        } catch (error) {
            console.error(error);
            let message = "Failed to update password";
            if (error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
                message = "Incorrect current password";
            }
            showToast(message, "error");
        } finally {
            setUpdatingPassword(false);
        }
    };


    const handleAvatarUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validation
        if (!file.type.startsWith('image/')) {
            showToast("Please select an image file", "error");
            return;
        }

        if (file.size > 2 * 1024 * 1024) {
            showToast("Avatar must be less than 2MB", "error");
            return;
        }

        setUpdatingProfile(true);
        try {
            // 1. Upload to GAS
            const result = await GAS_API.uploadFile(file, 'avatars');
            const photoURL = `https://lh3.googleusercontent.com/d/${result.fileId}`;

            // 2. Update Firebase Auth Profile
            await AuthService.updateAdminAvatar(photoURL);

            // 3. Sync with Firestore 'users' collection
            const user = AuthService.getCurrentUser?.() || AuthService.auth?.currentUser;
            if (user) {
                await FirestoreService.updateDocument('users', user.uid, {
                    photoURL: photoURL
                });
            }

            // 4. Update Global Context
            updateProfile({ photoURL });

            showToast("Avatar updated successfully", "success");
        } catch (error) {
            console.error(error);
            showToast(error.message || "Failed to upload avatar", "error");
        } finally {
            setUpdatingProfile(false);
        }
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        if (!displayName.trim()) {
            showToast("Name cannot be empty", "error");
            return;
        }

        setUpdatingProfile(true);
        try {
            // 1. Update Firebase Auth Profile
            await AuthService.updateAdminProfile(displayName);

            // 2. Sync with Firestore 'users' collection
            const uid = profile.uid || AuthService.getCurrentUser?.()?.uid || AuthService.auth?.currentUser?.uid;

            if (!uid) {
                throw new Error("User ID not found. Please refresh and try again.");
            }

            try {
                await FirestoreService.updateDocument('users', uid, {
                    displayName: displayName,
                    department,
                    status: status.trim(),
                    studentId: status === 'Student' ? studentId : null,
                    designation: status === 'Teacher' ? designation : null
                });
            } catch (error) {
                // If document is missing, create it (Upsert)
                if (error.code === 'not-found' || error.message.includes('No document to update')) {
                    console.warn("User document missing. Recreating...");
                    const currentUser = auth.currentUser;

                    await FirestoreService.addDocumentWithId('users', uid, {
                        email: currentUser?.email || profile.email,
                        displayName: displayName,
                        photoURL: profile.photoURL,
                        role: profile.role || 'Admin', // Default to existing role or Admin
                        department,
                        status: status.trim(),
                        studentId: status === 'Student' ? studentId : null,
                        designation: status === 'Teacher' ? designation : null,
                        createdAt: new Date().toISOString(),
                        uid: uid
                    });
                } else {
                    throw error;
                }
            }

            // 3. Update Global Context
            updateProfile({
                displayName,
                department,
                status,
                studentId: status === 'Student' ? studentId : null,
                designation: status === 'Teacher' ? designation : null
            });

            showToast("Profile updated successfully", "success");
        } catch (error) {
            console.error(error);
            showToast("Failed to update profile", "error");
        } finally {
            setUpdatingProfile(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold text-(--text-primary) mb-8">Settings</h1>

            <div className="flex flex-col md:grid md:grid-cols-4 gap-6 md:gap-8">
                {/* Sidebar Nav */}
                <div className="flex md:flex-col overflow-x-auto md:overflow-visible gap-2 md:gap-1 pb-2 md:pb-0 scrollbar-hide">
                    {[
                        { id: 'profile', label: 'Profile', icon: User },
                        { id: 'security', label: 'Security', icon: Lock },
                        (profile.role === 'Admin' || profile.role === 'Administrator') && { id: 'gas', label: 'GAS', icon: Server },
                    ].filter(Boolean).map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={`flex items-center gap-2 md:gap-3 px-4 py-2 md:py-3 rounded-xl text-sm font-medium transition-colors whitespace-nowrap shrink-0 ${activeTab === item.id
                                ? 'bg-(--ieee-blue)/10 text-(--ieee-blue)'
                                : 'bg-(--bg-surface) text-(--text-muted) hover:text-(--text-primary) border border-(--border-subtle) md:border-transparent'
                                }`}
                        >
                            <item.icon size={16} className="md:w-[18px] md:h-[18px]" />
                            {item.label}
                        </button>
                    ))}
                </div>

                {/* Content Area */}
                <div className="md:col-span-3 bg-(--bg-surface) rounded-2xl shadow-sm border border-(--border-subtle) p-8">
                    {activeTab === 'profile' && (
                        <div className="space-y-6">
                            <h2 className="text-xl font-bold text-(--text-primary)">Profile Information</h2>
                            <p className="text-(--text-secondary)">Update your profile details here.</p>

                            {/* Avatar Section */}
                            <div className="space-y-4">
                                <div className="flex flex-col items-center gap-4 p-6 bg-(--bg-secondary)/20 rounded-2xl border border-(--border-subtle)">
                                    <div className="relative group">
                                        <div className="w-24 h-24 rounded-2xl overflow-hidden border-2 border-(--ieee-blue) bg-(--bg-primary) flex items-center justify-center relative">
                                            {profile?.photoURL ? (
                                                <img src={profile.photoURL} alt="Avatar" className="w-full h-full object-cover" />
                                            ) : (
                                                <User size={40} className="text-(--text-muted)" />
                                            )}
                                            {updatingProfile && (
                                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                                    <Loader2 size={24} className="text-white animate-spin" />
                                                </div>
                                            )}
                                        </div>
                                        <label className="absolute -bottom-1 -right-1 p-2 bg-(--ieee-blue) text-white rounded-lg cursor-pointer hover:bg-(--ieee-dark-blue) transition-colors shadow-lg shadow-(--ieee-blue)/20">
                                            <Save size={14} />
                                            <input type="file" className="hidden" accept="image/*" onChange={handleAvatarUpload} disabled={updatingProfile} />
                                        </label>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-sm font-bold text-(--text-primary)">Custom Avatar</p>
                                        <p className="text-xs text-(--text-muted)">JPG, PNG or GIF. Max 2MB.</p>
                                    </div>
                                </div>

                            </div>

                            <form onSubmit={handleUpdateProfile} className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-(--text-secondary)">Display Name</label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 text-(--text-muted)" size={18} />
                                        <input
                                            type="text"
                                            required
                                            value={displayName}
                                            onChange={(e) => setDisplayName(e.target.value)}
                                            className="w-full pl-10 pr-4 py-2 rounded-lg bg-(--bg-primary) border border-(--border-subtle) focus:ring-2 focus:ring-(--ieee-blue)/20 outline-none text-(--text-primary)"
                                            placeholder="Your name"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-(--text-secondary)">Department</label>
                                        <select
                                            value={department}
                                            onChange={(e) => setDepartment(e.target.value)}
                                            className="w-full px-4 py-2 rounded-lg bg-(--bg-primary) border border-(--border-subtle) focus:ring-2 focus:ring-(--ieee-blue)/20 outline-none text-(--text-primary)"
                                        >
                                            {['EEE', 'CSE', 'CE', 'Sc&Hum', 'DBA', 'Law', 'English'].map(d => (
                                                <option key={d} value={d}>{d}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-(--text-secondary)">Status</label>
                                        <select
                                            value={status}
                                            onChange={(e) => setStatus(e.target.value)}
                                            className="w-full px-4 py-2 rounded-lg bg-(--bg-primary) border border-(--border-subtle) focus:ring-2 focus:ring-(--ieee-blue)/20 outline-none text-(--text-primary)"
                                        >
                                            <option value="Student">Student</option>
                                            <option value="Teacher">Teacher</option>
                                        </select>
                                    </div>
                                </div>

                                {status === 'Student' && (
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-(--text-secondary)">Student ID</label>
                                        <input
                                            type="text"
                                            value={studentId}
                                            onChange={(e) => setStudentId(e.target.value)}
                                            className="w-full px-4 py-2 rounded-lg bg-(--bg-primary) border border-(--border-subtle) focus:ring-2 focus:ring-(--ieee-blue)/20 outline-none text-(--text-primary)"
                                            placeholder="e.g., 200101001"
                                        />
                                    </div>
                                )}

                                {status === 'Teacher' && (
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-(--text-secondary)">Designation</label>
                                        <input
                                            type="text"
                                            value={designation}
                                            onChange={(e) => setDesignation(e.target.value)}
                                            className="w-full px-4 py-2 rounded-lg bg-(--bg-primary) border border-(--border-subtle) focus:ring-2 focus:ring-(--ieee-blue)/20 outline-none text-(--text-primary)"
                                            placeholder="e.g., Lecturer, Assistant Professor"
                                        />
                                    </div>
                                )}

                                <div className="pt-4 border-t border-(--border-subtle) flex justify-end">
                                    <button
                                        type="submit"
                                        disabled={updatingProfile}
                                        className="flex items-center gap-2 px-6 py-2 bg-(--ieee-blue) text-white rounded-lg hover:bg-(--ieee-dark-blue) transition-colors font-medium disabled:opacity-50"
                                    >
                                        {updatingProfile ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                                        {updatingProfile ? 'Saving...' : 'Save Profile'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {activeTab === 'security' && (
                        <div className="space-y-6">
                            <h2 className="text-xl font-bold text-(--text-primary)">Security Settings</h2>
                            <p className="text-(--text-secondary)">Manage your account security and password.</p>

                            <form onSubmit={handleUpdatePassword} className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-(--text-secondary)">Current Password</label>
                                    <input
                                        type="password"
                                        required
                                        value={passwordData.current}
                                        onChange={(e) => setPasswordData({ ...passwordData, current: e.target.value })}
                                        className="w-full px-4 py-2 rounded-lg bg-(--bg-primary) border border-(--border-subtle) focus:ring-2 focus:ring-(--ieee-blue)/20 outline-none text-(--text-primary)"
                                        placeholder="••••••••"
                                    />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-(--text-secondary)">New Password</label>
                                        <input
                                            type="password"
                                            required
                                            value={passwordData.new}
                                            onChange={(e) => setPasswordData({ ...passwordData, new: e.target.value })}
                                            className="w-full px-4 py-2 rounded-lg bg-(--bg-primary) border border-(--border-subtle) focus:ring-2 focus:ring-(--ieee-blue)/20 outline-none text-(--text-primary)"
                                            placeholder="••••••••"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-(--text-secondary)">Confirm New Password</label>
                                        <input
                                            type="password"
                                            required
                                            value={passwordData.confirm}
                                            onChange={(e) => setPasswordData({ ...passwordData, confirm: e.target.value })}
                                            className="w-full px-4 py-2 rounded-lg bg-(--bg-primary) border border-(--border-subtle) focus:ring-2 focus:ring-(--ieee-blue)/20 outline-none text-(--text-primary)"
                                            placeholder="••••••••"
                                        />
                                    </div>
                                </div>
                                <div className="pt-4 border-t border-(--border-subtle) flex justify-end">
                                    <button
                                        type="submit"
                                        disabled={updatingPassword}
                                        className="flex items-center gap-2 px-6 py-2 bg-(--ieee-blue) text-white rounded-lg hover:bg-(--ieee-dark-blue) transition-colors font-medium disabled:opacity-50"
                                    >
                                        {updatingPassword ? <Save size={18} className="animate-spin" /> : <Save size={18} />}
                                        {updatingPassword ? 'Updating...' : 'Update Password'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {activeTab === 'gas' && (profile.role === 'Admin' || profile.role === 'Administrator') && (
                        <div className="space-y-6">
                            <h2 className="text-xl font-bold text-(--text-primary)">Google Apps Script Configuration</h2>
                            <p className="text-sm text-(--text-secondary)">
                                Configure separate backend URLs for core features and Gmail services to bypass authorization limits and CORS restrictions.
                            </p>

                            <div className="grid grid-cols-1 gap-6">
                                <div className="space-y-2 p-6 bg-(--bg-secondary)/30 rounded-2xl border border-(--border-subtle)">
                                    <div className="flex items-center gap-2 text-(--text-primary) font-bold mb-1">
                                        <Globe size={18} className="text-(--ieee-blue)" />
                                        Core Features URL
                                    </div>
                                    <p className="text-xs text-(--text-muted) mb-2">Handles registrations, file uploads, and certificate management.</p>
                                    <input
                                        type="url"
                                        value={gasConfig.gas_url_features}
                                        onChange={(e) => setGasConfig({ ...gasConfig, gas_url_features: e.target.value })}
                                        className="w-full px-4 py-2 rounded-xl bg-(--bg-primary) border border-(--border-subtle) focus:ring-2 focus:ring-(--ieee-blue)/20 outline-none text-(--text-primary) font-mono text-sm shadow-sm"
                                        placeholder="https://script.google.com/macros/s/..."
                                    />
                                </div>

                                <div className="space-y-2 p-6 bg-(--bg-secondary)/30 rounded-2xl border border-(--border-subtle)">
                                    <div className="flex items-center gap-2 text-(--text-primary) font-bold mb-1">
                                        <Server size={18} className="text-purple-500" />
                                        Gmail Service URL
                                    </div>
                                    <p className="text-xs text-(--text-muted) mb-2">Dedicated service for Gmail synchronization and email communications.</p>
                                    <input
                                        type="url"
                                        value={gasConfig.gas_url_mail}
                                        onChange={(e) => setGasConfig({ ...gasConfig, gas_url_mail: e.target.value })}
                                        className="w-full px-4 py-2 rounded-xl bg-(--bg-primary) border border-(--border-subtle) focus:ring-2 focus:ring-(--ieee-blue)/20 outline-none text-(--text-primary) font-mono text-sm shadow-sm"
                                        placeholder="https://script.google.com/macros/s/..."
                                    />
                                </div>

                                <div className="space-y-2 p-6 bg-(--bg-secondary)/30 rounded-2xl border border-(--border-subtle)">
                                    <div className="flex items-center gap-2 text-(--text-primary) font-bold mb-1">
                                        <Server size={18} className="text-red-500" />
                                        Private Video Player URL
                                    </div>
                                    <p className="text-xs text-(--text-muted) mb-2">GAS Web App URL for playing private videos or streams.</p>
                                    <input
                                        type="url"
                                        value={gasConfig.gas_url_video}
                                        onChange={(e) => setGasConfig({ ...gasConfig, gas_url_video: e.target.value })}
                                        className="w-full px-4 py-2 rounded-xl bg-(--bg-primary) border border-(--border-subtle) focus:ring-2 focus:ring-(--ieee-blue)/20 outline-none text-(--text-primary) font-mono text-sm shadow-sm"
                                        placeholder="https://script.google.com/macros/s/..."
                                    />
                                </div>

                                <div className="space-y-4 p-6 bg-(--bg-secondary)/30 rounded-2xl border border-(--border-subtle)">
                                    <h3 className="text-base font-bold text-(--text-primary) flex items-center gap-2">
                                        <Server size={18} className="text-green-500" />
                                        Drive Folder IDs
                                    </h3>
                                    <p className="text-xs text-(--text-muted)">IDs of the Google Drive folders where files will be stored.</p>

                                    <div className="space-y-2">
                                        <label className="text-xs font-medium text-(--text-secondary)">Events Folder ID</label>
                                        <input
                                            type="text"
                                            value={gasConfig.folder_id_events}
                                            onChange={(e) => handleConfigChange('folder_id_events', e.target.value)}
                                            className="w-full px-4 py-2 rounded-lg bg-(--bg-primary) border border-(--border-subtle) focus:ring-2 focus:ring-(--ieee-blue)/20 outline-none text-(--text-primary) font-mono text-xs"
                                            placeholder="ID or Link (https://drive.google.com/...)"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-medium text-(--text-secondary)">Papers Folder ID</label>
                                        <input
                                            type="text"
                                            value={gasConfig.folder_id_papers}
                                            onChange={(e) => handleConfigChange('folder_id_papers', e.target.value)}
                                            className="w-full px-4 py-2 rounded-lg bg-(--bg-primary) border border-(--border-subtle) focus:ring-2 focus:ring-(--ieee-blue)/20 outline-none text-(--text-primary) font-mono text-xs"
                                            placeholder="ID or Link..."
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-medium text-(--text-secondary)">Certificates Folder ID</label>
                                        <input
                                            type="text"
                                            value={gasConfig.folder_id_certificates}
                                            onChange={(e) => handleConfigChange('folder_id_certificates', e.target.value)}
                                            className="w-full px-4 py-2 rounded-lg bg-(--bg-primary) border border-(--border-subtle) focus:ring-2 focus:ring-(--ieee-blue)/20 outline-none text-(--text-primary) font-mono text-xs"
                                            placeholder="ID or Link..."
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-medium text-(--text-secondary)">Avatars Folder ID</label>
                                        <input
                                            type="text"
                                            value={gasConfig.folder_id_avatars}
                                            onChange={(e) => handleConfigChange('folder_id_avatars', e.target.value)}
                                            className="w-full px-4 py-2 rounded-lg bg-(--bg-primary) border border-(--border-subtle) focus:ring-2 focus:ring-(--ieee-blue)/20 outline-none text-(--text-primary) font-mono text-xs"
                                            placeholder="ID or Link..."
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-medium text-(--text-secondary)">Blogs Folder ID</label>
                                        <input
                                            type="text"
                                            value={gasConfig.folder_id_blogs}
                                            onChange={(e) => handleConfigChange('folder_id_blogs', e.target.value)}
                                            className="w-full px-4 py-2 rounded-lg bg-(--bg-primary) border border-(--border-subtle) focus:ring-2 focus:ring-(--ieee-blue)/20 outline-none text-(--text-primary) font-mono text-xs"
                                            placeholder="ID or Link..."
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-medium text-(--text-secondary)">Panel Folder ID</label>
                                        <input
                                            type="text"
                                            value={gasConfig.folder_id_panel}
                                            onChange={(e) => handleConfigChange('folder_id_panel', e.target.value)}
                                            className="w-full px-4 py-2 rounded-lg bg-(--bg-primary) border border-(--border-subtle) focus:ring-2 focus:ring-(--ieee-blue)/20 outline-none text-(--text-primary) font-mono text-xs"
                                            placeholder="ID or Link..."
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-(--border-subtle) flex justify-end">
                                <button
                                    onClick={handleSaveGasConfig}
                                    disabled={saving}
                                    className="flex items-center gap-2 px-8 py-3 bg-(--ieee-blue) text-white rounded-xl hover:bg-(--ieee-dark-blue) transition-all font-bold disabled:opacity-50 shadow-lg shadow-(--ieee-blue)/20 active:scale-95"
                                >
                                    <Save size={18} /> {saving ? 'Saving...' : 'Save Configuration'}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Add other tabs placeholders if needed */}
                    {(activeTab !== 'profile' && activeTab !== 'security' && activeTab !== 'gas') && (
                        <div className="flex flex-col items-center justify-center h-64 text-(--text-muted)">
                            <p>This section is under construction.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Settings;
