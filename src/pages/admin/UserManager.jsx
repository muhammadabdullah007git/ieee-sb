import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Mail, Lock, UserPlus, Loader2, ShieldCheck, ShieldAlert, X, Save, Edit, Upload, Trash, Image as ImageIcon } from 'lucide-react';
import { FirestoreService } from '../../services/firestore';
import { AuthService } from '../../services/auth';
import { useToast } from '../../context/ToastContext';
import { GAS_API } from '../../services/gas';
import { getDirectDriveLink } from '../../lib/utils';

const UserModal = ({ isOpen, onClose, onSave, user }) => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        displayName: '',
        role: 'Member',
        photoURL: '',
        department: 'EEE',
        status: 'Student',
        studentId: '',
        designation: ''
    });
    const [uploading, setUploading] = useState(false);
    const { showToast } = useToast();

    useEffect(() => {
        if (isOpen) {
            if (user) {
                setFormData({
                    ...user,
                    password: '', // Don't show password on edit
                    photoURL: user.photoURL || '',
                    department: user.department || 'EEE',
                    status: (user.status || 'Student').charAt(0).toUpperCase() + (user.status || 'Student').slice(1).toLowerCase()
                });
            } else {
                setFormData({
                    email: '',
                    password: '',
                    displayName: '',
                    role: 'Member',
                    photoURL: '',
                    department: 'EEE',
                    status: 'Student',
                    studentId: '',
                    designation: ''
                });
            }
        }
    }, [isOpen, user]);
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        try {
            const result = await GAS_API.uploadFile(file, 'avatars');
            setFormData({ ...formData, photoURL: result.fileId });
            showToast("Profile picture uploaded", "success");
        } catch (error) {
            console.error("Upload failed:", error);
            showToast("Upload failed", "error");
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await onSave(formData);
            onClose();
        } catch (error) {
            console.error("Creation failed:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-150 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-(--bg-surface) rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-(--border-subtle) animate-in fade-in zoom-in duration-200">
                <div className="flex items-center gap-4 p-6 border-b border-(--border-subtle) bg-(--bg-secondary)/10">
                    <button
                        type="button"
                        onClick={onClose}
                        className="p-2 hover:bg-(--bg-secondary) rounded-lg transition-colors text-(--text-muted) hover:text-(--text-primary)"
                    >
                        <X size={20} />
                    </button>
                    <h2 className="text-xl font-bold text-(--text-primary)">Add New User</h2>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto custom-scrollbar">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-(--text-secondary)">Display Name</label>
                        <input
                            type="text"
                            required
                            value={formData.displayName}
                            onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                            className="w-full px-4 py-2.5 rounded-xl bg-(--bg-primary) border border-(--border-subtle) focus:ring-2 focus:ring-(--ieee-blue)/20 outline-none text-(--text-primary)"
                            placeholder="e.g. Abdullah"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-(--text-secondary)">Profile Photo</label>
                        <div className="relative group">
                            <input
                                type="file"
                                className="hidden"
                                id="user-photo-upload"
                                accept="image/*"
                                onChange={handleImageUpload}
                                disabled={uploading}
                            />
                            {formData.photoURL ? (
                                <div className="relative h-40 rounded-xl overflow-hidden border border-(--border-subtle) group">
                                    <img
                                        src={getDirectDriveLink(formData.photoURL)}
                                        alt="User Preview"
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                    />
                                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                                        <label
                                            htmlFor="user-photo-upload"
                                            className="p-3 bg-white text-black rounded-full cursor-pointer hover:bg-(--ieee-blue) hover:text-white transition-all transform hover:scale-110 shadow-lg"
                                            title="Change Photo"
                                        >
                                            <ImageIcon size={20} />
                                        </label>
                                        <button
                                            type="button"
                                            onClick={() => setFormData(prev => ({ ...prev, photoURL: '' }))}
                                            className="p-3 bg-white text-red-600 rounded-full hover:bg-red-600 hover:text-white transition-all transform hover:scale-110 shadow-lg"
                                            title="Remove Photo"
                                        >
                                            <Trash size={20} />
                                        </button>
                                    </div>
                                    {uploading && (
                                        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center">
                                            <Loader2 className="animate-spin text-white" size={32} />
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <label
                                    htmlFor="user-photo-upload"
                                    className={`flex flex-col items-center justify-center h-40 border-2 border-dashed border-(--border-subtle) rounded-xl cursor-pointer hover:border-(--ieee-blue) hover:bg-(--ieee-blue)/5 transition-all group ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                    {uploading ? (
                                        <Loader2 className="animate-spin text-(--ieee-blue) mb-2" size={32} />
                                    ) : (
                                        <div className="flex flex-col items-center">
                                            <div className="p-4 bg-(--bg-secondary) rounded-full mb-3 group-hover:bg-(--ieee-blue)/10 text-(--text-muted) group-hover:text-(--ieee-blue) transition-colors">
                                                <Upload size={28} />
                                            </div>
                                            <span className="text-sm font-bold text-(--text-secondary) group-hover:text-(--ieee-blue)">Click to upload profile photo</span>
                                            <span className="text-[10px] text-(--text-muted) mt-1 uppercase tracking-wider font-medium">Square Recommended</span>
                                        </div>
                                    )}
                                </label>
                            )}
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-(--text-secondary)">Email Address</label>
                        <input
                            type="email"
                            required
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="w-full px-4 py-2.5 rounded-xl bg-(--bg-primary) border border-(--border-subtle) focus:ring-2 focus:ring-(--ieee-blue)/20 outline-none text-(--text-primary)"
                            placeholder="admin@example.com"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-(--text-secondary)">Role</label>
                            <select
                                value={formData.role}
                                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                className="w-full px-4 py-2.5 rounded-xl bg-(--bg-primary) border border-(--border-subtle) focus:ring-2 focus:ring-(--ieee-blue)/20 outline-none text-(--text-primary)"
                            >
                                <option value="Admin">Admin</option>
                                <option value="Member">General User (Member)</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-(--text-secondary)">Initial Password</label>
                            <input
                                type="password"
                                required={!formData.id} // Only required for new users
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                className="w-full px-4 py-2.5 rounded-xl bg-(--bg-primary) border border-(--border-subtle) focus:ring-2 focus:ring-(--ieee-blue)/20 outline-none text-(--text-primary)"
                                placeholder={formData.id ? "(Leave blank to keep)" : "••••••••"}
                            />
                        </div>
                    </div>

                    {/* Extended Info */}
                    <div className="pt-4 border-t border-(--border-subtle)">
                        <h3 className="text-sm font-bold text-(--text-primary) mb-3">Professional Info</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-(--text-secondary)">Department</label>
                                <select
                                    value={formData.department || 'EEE'}
                                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                                    className="w-full px-4 py-2 rounded-xl bg-(--bg-primary) border border-(--border-subtle) focus:ring-2 focus:ring-(--ieee-blue)/20 outline-none text-(--text-primary)"
                                >
                                    {['EEE', 'CSE', 'CE', 'Sc&Hum', 'DBA', 'Law', 'English'].map(d => (
                                        <option key={d} value={d}>{d}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-(--text-secondary)">Status</label>
                                <select
                                    value={formData.status || 'Student'}
                                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                    className="w-full px-4 py-2 rounded-xl bg-(--bg-primary) border border-(--border-subtle) focus:ring-2 focus:ring-(--ieee-blue)/20 outline-none text-(--text-primary)"
                                >
                                    <option value="Student">Student</option>
                                    <option value="Teacher">Teacher</option>
                                </select>
                            </div>
                        </div>
                        <div className="mt-4 space-y-2">
                            <label className="text-sm font-medium text-(--text-secondary)">
                                {formData.status === 'Teacher' ? 'Designation' : 'Student ID'}
                            </label>
                            <input
                                type="text"
                                value={formData.status === 'Teacher' ? (formData.designation || '') : (formData.studentId || '')}
                                onChange={(e) => {
                                    if (formData.status === 'Teacher') {
                                        setFormData({ ...formData, designation: e.target.value, studentId: '' });
                                    } else {
                                        setFormData({ ...formData, studentId: e.target.value, designation: '' });
                                    }
                                }}
                                className="w-full px-4 py-2.5 rounded-xl bg-(--bg-primary) border border-(--border-subtle) focus:ring-2 focus:ring-(--ieee-blue)/20 outline-none text-(--text-primary)"
                                placeholder={formData.status === 'Teacher' ? "e.g. Assistant Professor" : "e.g. 1105001"}
                            />
                        </div>
                    </div>
                </form>

                <div className="p-6 border-t border-(--border-subtle) flex justify-between gap-3 bg-(--bg-secondary)/50">
                    <button onClick={onClose} className="px-4 py-2 text-(--text-secondary) font-medium">Cancel</button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="flex items-center gap-2 px-6 py-2 bg-(--ieee-blue) text-white rounded-lg hover:bg-(--ieee-dark-blue) transition-colors font-medium disabled:opacity-50"
                    >
                        {loading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                        Create User
                    </button>
                </div>
            </div>
        </div>
    );
};

const UserManager = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const { showToast, confirmAction } = useToast();

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const data = await FirestoreService.getCollection('users');
            setUsers(data);
        } catch (error) {
            console.error("Error fetching users:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleSaveUser = async (data) => {
        try {
            // Update Existing User
            if (data.id) {
                // Check email uniqueness if email changed
                if (data.email !== selectedUser.email) {
                    const existing = await FirestoreService.getCollectionWhere('users', 'email', '==', data.email);
                    if (existing.length > 0) {
                        showToast("Email address is already in use by another account.", "error");
                        return;
                    }
                }

                const updates = {
                    displayName: data.displayName,
                    email: data.email, // Allow email update
                    photoURL: data.photoURL,
                    role: data.role,
                    department: data.department,
                    status: data.status,
                    studentId: data.status === 'Student' ? (data.studentId || '') : null,
                    designation: data.status === 'Teacher' ? (data.designation || '') : null
                };

                await FirestoreService.updateDocument('users', data.id, updates);
                showToast("User updated successfully", "success");
            }
            // Create New User
            else {
                // Check if email already exists
                const existing = await FirestoreService.getCollectionWhere('users', 'email', '==', data.email);
                if (existing.length > 0) {
                    showToast("Email address is already in use.", "error");
                    return;
                }

                // 1. Create user in Firebase Auth using the secondary app trick
                const user = await AuthService.createSecondaryUser(data.email, data.password);

                // 2. Save metadata to Firestore 'users' collection
                const userData = {
                    email: data.email,
                    displayName: data.displayName,
                    photoURL: data.photoURL,
                    role: data.role,
                    department: data.department,
                    status: data.status,
                    studentId: data.status === 'Student' ? (data.studentId || '') : null,
                    designation: data.status === 'Teacher' ? (data.designation || '') : null,
                    createdAt: new Date().toISOString(),
                    uid: user.uid
                };

                await FirestoreService.addDocumentWithId('users', user.uid, userData);
                showToast(`New ${data.role} created successfully`, "success");
            }
            fetchUsers();
        } catch (error) {
            console.error(error);
            showToast(error.message || "Operation failed", "error");
            throw error;
        }
    };

    const handleDeleteUser = async (id, uid) => {
        confirmAction({
            title: 'Remove User Record',
            message: 'This will remove the account registration from this list. Note: Actual Auth deletion must be done from Firebase Console for security.',
            onConfirm: async () => {
                try {
                    await FirestoreService.deleteDocument('users', id);
                    showToast("User record removed", "success");
                    fetchUsers();
                } catch {
                    showToast("Failed to remove record", "error");
                }
            }
        });
    };

    return (
        <div className="max-w-5xl mx-auto">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-xl md:text-2xl font-bold text-(--text-primary)">Account Management</h1>
                    <p className="text-xs md:text-sm text-(--text-secondary)">Create and manage dashboard accounts and roles.</p>
                </div>
                <button
                    onClick={() => { setSelectedUser(null); setIsModalOpen(true); }}
                    className="flex items-center justify-center bg-(--ieee-blue) text-white hover:bg-(--ieee-dark-blue) transition-colors shadow-lg md:shadow-none font-medium fixed bottom-6 right-6 z-100 w-14 h-14 rounded-2xl md:static md:w-auto md:h-auto md:rounded-lg md:px-4 md:py-2 md:gap-2"
                >
                    <UserPlus size={24} className="md:w-4 md:h-4" />
                    <span className="hidden md:inline text-sm">New User</span>
                </button>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="animate-spin text-(--ieee-blue)" size={40} />
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {users.length === 0 ? (
                        <div className="col-span-2 text-center py-12 bg-(--bg-surface) rounded-2xl border border-dashed border-(--border-subtle) text-(--text-muted)">
                            No users registered yet.
                        </div>
                    ) : (
                        users.map((user) => (
                            <div key={user.id} className="group p-3 rounded-xl bg-(--bg-surface) border border-(--border-subtle) hover:bg-(--bg-secondary)/50 transition-colors flex items-center justify-between gap-3 min-w-0">
                                <div className="flex items-center gap-3 overflow-hidden">
                                    <div className="w-10 h-10 rounded-lg bg-(--ieee-blue)/10 flex items-center justify-center text-(--ieee-blue) font-bold relative shrink-0 overflow-hidden">
                                        {user.photoURL ? (
                                            <img src={getDirectDriveLink(user.photoURL)} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            user.displayName?.charAt(0) || <Mail size={18} />
                                        )}
                                        <div className={`absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full border-2 border-(--bg-surface) ${user.role === 'Admin' ? 'bg-purple-500' : 'bg-blue-500'}`} title={user.role}></div>
                                    </div>
                                    <div className="min-w-0">
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-bold text-(--text-primary) text-sm truncate">{user.displayName}</h3>
                                            <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${user.role === 'Admin' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'}`}>
                                                {user.role}
                                            </span>
                                        </div>
                                        <p className="text-xs text-(--text-muted) truncate">{user.email}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => { setSelectedUser(user); setIsModalOpen(true); }}
                                        className="p-1.5 text-(--text-muted) hover:text-(--ieee-blue) hover:bg-(--ieee-blue)/10 rounded-lg transition-colors"
                                        title="Edit User"
                                    >
                                        <Edit size={16} />
                                    </button>
                                    <button
                                        onClick={() => handleDeleteUser(user.id, user.uid)}
                                        className="p-1.5 text-(--text-muted) hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                                        title="Remove Record"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            <div className="mt-8 p-6 bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-900/30 rounded-2xl flex gap-4">
                <ShieldAlert className="text-yellow-600 dark:text-yellow-500 shrink-0" size={24} />
                <div>
                    <h4 className="font-bold text-yellow-800 dark:text-yellow-400">Security Note</h4>
                    <p className="text-sm text-yellow-700/80 dark:text-yellow-500/80">
                        User creation uses a secondary background session to preserve your current login. Newly created users will have dashboard access based on their assigned role.
                    </p>
                </div>
            </div>

            <UserModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveUser}
                user={selectedUser}
            />
        </div>
    );
};

export default UserManager;
