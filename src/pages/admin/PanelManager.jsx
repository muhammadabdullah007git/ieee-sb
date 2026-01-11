import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, X, Save, Loader2, User, Image as ImageIcon, Upload, Trash } from 'lucide-react';
import { FirestoreService } from '../../services/firestore';
import { GAS_API } from '../../services/gas';
import { useToast } from '../../context/ToastContext';
import { getDirectDriveLink } from '../../lib/utils';

const MemberModal = ({ member, isOpen, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        name: '',
        role: '',
        department: '',
        email: '',
        image: '',
        batch: '',
        status: 'Active'
    });
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const { showToast } = useToast();

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        try {
            const result = await GAS_API.uploadFile(file, 'avatars');
            setFormData(prev => ({ ...prev, image: result.fileId }));
            showToast("Profile picture uploaded successfully", "success");
        } catch (error) {
            console.error(error);
            showToast("Upload failed: " + error.message, "error");
        } finally {
            setUploading(false);
        }
    };

    useEffect(() => {
        if (member) {
            setFormData({
                ...member,
                image: member.image || '',
                batch: member.batch || ''
            });
        } else {
            setFormData({
                name: '',
                role: '',
                department: '',
                email: '',
                image: '',
                batch: '',
                status: 'Active'
            });
        }
    }, [member, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await onSave(formData);
            onClose();
        } catch (error) {
            console.error("Save failed:", error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-150 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-(--bg-surface) rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden border border-(--border-subtle) animate-in fade-in zoom-in duration-200">
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
                    <h2 className="text-xl font-bold text-(--text-primary)">
                        {member ? 'Edit Member' : 'Add New Member'}
                    </h2>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto custom-scrollbar">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-(--text-secondary)">Full Name</label>
                        <input
                            type="text"
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full px-4 py-2 rounded-lg bg-(--bg-primary) border border-(--border-subtle) focus:ring-2 focus:ring-(--ieee-blue)/20 outline-hidden text-(--text-primary)"
                            placeholder="Md. Al Amin"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-(--text-secondary)">Role</label>
                            <input
                                type="text"
                                required
                                value={formData.role}
                                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                className="w-full px-4 py-2 rounded-lg bg-(--bg-primary) border border-(--border-subtle) focus:ring-2 focus:ring-(--ieee-blue)/20 outline-hidden text-(--text-primary)"
                                placeholder="e.g. Chairperson"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-(--text-secondary)">Department</label>
                            <input
                                type="text"
                                required
                                value={formData.department}
                                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                                className="w-full px-4 py-2 rounded-lg bg-(--bg-primary) border border-(--border-subtle) focus:ring-2 focus:ring-(--ieee-blue)/20 outline-hidden text-(--text-primary)"
                                placeholder="e.g. CSE"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-(--text-secondary)">Batch</label>
                            <input
                                type="text"
                                value={formData.batch}
                                onChange={(e) => setFormData({ ...formData, batch: e.target.value })}
                                className="w-full px-4 py-2 rounded-lg bg-(--bg-primary) border border-(--border-subtle) focus:ring-2 focus:ring-(--ieee-blue)/20 outline-hidden text-(--text-primary)"
                                placeholder="e.g. 10th"
                            />
                        </div>
                        <div className="space-y-2 col-span-2">
                            <label className="text-sm font-medium text-(--text-secondary)">Profile Picture</label>
                            <div className="relative group">
                                <input
                                    type="file"
                                    className="hidden"
                                    id="panel-member-upload"
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                    disabled={uploading}
                                />
                                {formData.image ? (
                                    <div className="relative h-40 rounded-xl overflow-hidden border border-(--border-subtle) group">
                                        <img
                                            src={getDirectDriveLink(formData.image)}
                                            alt="Member Preview"
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                        />
                                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                                            <label
                                                htmlFor="panel-member-upload"
                                                className="p-3 bg-white text-black rounded-full cursor-pointer hover:bg-(--ieee-blue) hover:text-white transition-all transform hover:scale-110 shadow-lg"
                                                title="Change Image"
                                            >
                                                <ImageIcon size={20} />
                                            </label>
                                            <button
                                                type="button"
                                                onClick={() => setFormData(prev => ({ ...prev, image: '' }))}
                                                className="p-3 bg-white text-red-600 rounded-full hover:bg-red-600 hover:text-white transition-all transform hover:scale-110 shadow-lg"
                                                title="Remove Image"
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
                                        htmlFor="panel-member-upload"
                                        className={`flex flex-col items-center justify-center h-40 border-2 border-dashed border-(--border-subtle) rounded-xl cursor-pointer hover:border-(--ieee-blue) hover:bg-(--ieee-blue)/5 transition-all group ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    >
                                        {uploading ? (
                                            <Loader2 className="animate-spin text-(--ieee-blue) mb-2" size={32} />
                                        ) : (
                                            <div className="flex flex-col items-center">
                                                <div className="p-4 bg-(--bg-secondary) rounded-full mb-3 group-hover:bg-(--ieee-blue)/10 text-(--text-muted) group-hover:text-(--ieee-blue) transition-colors">
                                                    <Upload size={28} />
                                                </div>
                                                <span className="text-sm font-bold text-(--text-secondary) group-hover:text-(--ieee-blue)">Click to upload photo</span>
                                                <span className="text-[10px] text-(--text-muted) mt-1 uppercase tracking-wider font-medium">Square Recommended</span>
                                            </div>
                                        )}
                                    </label>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-(--text-secondary)">Email Address</label>
                        <input
                            type="email"
                            required
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="w-full px-4 py-2 rounded-lg bg-(--bg-primary) border border-(--border-subtle) focus:ring-2 focus:ring-(--ieee-blue)/20 outline-hidden text-(--text-primary)"
                            placeholder="amin@baiust.edu.bd"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-(--text-secondary)">Status</label>
                        <select
                            value={formData.status}
                            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                            className="w-full px-4 py-2 rounded-lg bg-(--bg-primary) border border-(--border-subtle) focus:ring-2 focus:ring-(--ieee-blue)/20 outline-hidden text-(--text-primary)"
                        >
                            <option value="Active">Active</option>
                            <option value="On Leave">On Leave</option>
                            <option value="Inactive">Inactive</option>
                        </select>
                    </div>
                </form>

                <div className="p-6 border-t border-(--border-subtle) flex justify-between gap-3 bg-(--bg-secondary)/50">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 text-(--text-secondary) font-medium hover:text-(--text-primary) transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={loading}
                        className="flex items-center gap-2 px-6 py-2 bg-(--ieee-blue) text-white rounded-lg hover:bg-(--ieee-dark-blue) transition-colors font-medium disabled:opacity-50"
                    >
                        {loading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                        Save Member
                    </button>
                </div>
            </div>
        </div>
    );
};

const PanelManager = () => {
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedMember, setSelectedMember] = useState(null);
    const { showToast, confirmAction } = useToast();

    const fetchMembers = async () => {
        setLoading(true);
        try {
            const data = await FirestoreService.getCollection('panel');
            setMembers(data);
        } catch (error) {
            console.error("Error fetching panel members:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMembers();
    }, []);

    const handleSave = async (formData) => {
        try {
            if (selectedMember) {
                await FirestoreService.updateDocument('panel', selectedMember.id, formData);
                showToast("Panel member updated", "success");
            } else {
                await FirestoreService.addDocument('panel', formData);
                showToast("Panel member added", "success");
            }
            await fetchMembers();
        } catch {
            showToast("Failed to save member", "error");
        }
    };

    const handleDelete = async (id) => {
        confirmAction({
            title: 'Remove Member',
            message: 'Are you sure you want to remove this member from the panel?',
            onConfirm: async () => {
                try {
                    await FirestoreService.deleteDocument('panel', id);
                    showToast("Member removed successfully", "success");
                    await fetchMembers();
                } catch {
                    showToast("Failed to remove member", "error");
                }
            }
        });
    };

    const openModal = (member = null) => {
        setSelectedMember(member);
        setIsModalOpen(true);
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-(--text-primary)">Panel Manager</h1>
                    <p className="text-(--text-secondary)">Manage executive committee members and roles.</p>
                </div>
                <button
                    onClick={() => openModal()}
                    className="flex items-center justify-center bg-(--ieee-blue) text-white hover:bg-(--ieee-dark-blue) transition-colors shadow-lg md:shadow-none font-medium fixed bottom-6 right-6 z-100 w-14 h-14 rounded-2xl md:static md:w-auto md:h-auto md:rounded-lg md:px-4 md:py-2 md:gap-2"
                >
                    <Plus size={24} className="md:w-4 md:h-4" />
                    <span className="hidden md:inline text-sm">Add Member</span>
                </button>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="animate-spin text-(--ieee-blue)" size={40} />
                </div>
            ) : (
                <div className="bg-(--bg-surface) rounded-2xl shadow-sm border border-(--border-subtle) overflow-hidden">
                    {/* Desktop Table View */}
                    <div className="hidden md:block overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-(--bg-secondary) border-b border-(--border-subtle)">
                                    <th className="px-6 py-4 text-xs font-semibold text-(--text-muted) uppercase tracking-wider">Name</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-(--text-muted) uppercase tracking-wider">Role</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-(--text-muted) uppercase tracking-wider">Department</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-(--text-muted) uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-(--text-muted) uppercase tracking-wider text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-(--border-subtle)">
                                {members.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-8 text-center text-(--text-muted)">
                                            No panel members found. Add some team members!
                                        </td>
                                    </tr>
                                ) : (
                                    members.map((member) => (
                                        <tr key={member.id} className="hover:bg-(--bg-secondary)/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-(--bg-secondary) flex items-center justify-center text-(--text-muted) overflow-hidden">
                                                        {member.image ? (
                                                            <img src={getDirectDriveLink(member.image)} alt={member.name} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <User size={20} />
                                                        )}
                                                    </div>
                                                    <div>
                                                        <div className="font-medium text-(--text-primary)">{member.name}</div>
                                                        <div className="text-sm text-(--text-muted)">{member.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-(--text-secondary)">
                                                <span className="inline-block px-2 py-1 rounded-md bg-(--ieee-blue)/10 text-(--ieee-blue) text-xs font-medium">
                                                    {member.role}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-(--text-secondary)">
                                                {member.department}
                                                {member.batch && <span className="block text-xs text-(--text-muted)">Batch: {member.batch}</span>}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-medium ${member.status === 'Active'
                                                    ? 'bg-green-500/10 text-green-500'
                                                    : member.status === 'On Leave'
                                                        ? 'bg-yellow-500/10 text-yellow-500'
                                                        : 'bg-(--bg-secondary) text-(--text-muted)'
                                                    }`}>
                                                    {member.status || 'Active'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => openModal(member)}
                                                        className="p-2 text-(--text-muted) hover:text-(--ieee-blue) transition-colors"
                                                    >
                                                        <Edit size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(member.id)}
                                                        className="p-2 text-(--text-muted) hover:text-red-500 transition-colors"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile Compact View */}
                    <div className="md:hidden divide-y divide-(--border-subtle)">
                        {members.length === 0 ? (
                            <div className="p-8 text-center text-(--text-muted)">
                                No panel members found. Add some team members!
                            </div>
                        ) : (
                            members.map((member) => (
                                <div key={member.id} className="p-4 flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-(--bg-secondary) flex items-center justify-center text-(--text-muted) overflow-hidden shrink-0">
                                        {member.image ? (
                                            <img src={member.image} alt={member.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <User size={20} />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start">
                                            <h3 className="font-medium text-(--text-primary) line-clamp-1">{member.name}</h3>
                                        </div>
                                        <div className="text-xs text-(--ieee-blue) font-medium mb-0.5">{member.role}</div>
                                        <div className="flex items-center gap-2 text-xs text-(--text-muted)">
                                            <span>{member.department}</span>
                                            <span>•</span>
                                            <span className={member.status === 'Active' ? 'text-green-500' : 'text-yellow-500'}>{member.status}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <button
                                            onClick={() => openModal(member)}
                                            className="p-2 text-(--text-muted) hover:text-(--ieee-blue) transition-colors"
                                        >
                                            <Edit size={18} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(member.id)}
                                            className="p-2 text-(--text-muted) hover:text-red-500 transition-colors"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}

            <MemberModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                member={selectedMember}
                onSave={handleSave}
            />
        </div>
    );
};

export default PanelManager;
