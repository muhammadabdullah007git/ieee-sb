import React, { useState, useEffect, useRef } from 'react';
import { Plus, Edit, Trash2, FileText, Download, X, Save, Loader2, Link as LinkIcon, Upload, ExternalLink } from 'lucide-react';
import { FirestoreService } from '../../services/firestore';
import { GAS_API } from '../../services/gas';
import { useToast } from '../../context/ToastContext';
import { useAdmin } from '../../context/AdminContext';

const PaperModal = ({ paper, isOpen, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        id: '', // Custom ID
        title: '',
        author: '',
        email: '',
        department: '',
        designation: 'Student',
        doi: '',
        category: '',
        status: 'Published',
        downloadUrl: '',
        description: '',
        fileId: '',
        permission: 'Public' // 'Public' | 'Private'
    });
    const [selectedFile, setSelectedFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const fileInputRef = useRef(null);

    useEffect(() => {
        if (paper) {
            setFormData({
                ...paper,
                email: paper.email || '',
                department: paper.department || '',
                designation: paper.designation || 'Student',
                doi: paper.doi || '',
                permission: paper.permission || 'Public'
            });
        } else {
            setFormData({
                id: '',
                title: '',
                author: '',
                email: '',
                department: '',
                designation: 'Student',
                doi: '',
                category: '',
                status: 'Published',
                downloadUrl: '',
                description: '',
                fileId: '',
                permission: 'Public'
            });
        }
        setSelectedFile(null);
    }, [paper, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await onSave(formData, selectedFile);
            onClose();
        } catch (error) {
            console.error("Save failed:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-150 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-(--bg-surface) rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden border border-(--border-subtle) animate-in fade-in zoom-in duration-200">
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
                        {paper ? 'Edit Paper' : 'Add New Paper'}
                    </h2>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-(--text-secondary)">
                            Custom URL ID <span className="text-xs text-(--text-muted)">(Optional)</span>
                        </label>
                        <input
                            type="text"
                            value={formData.id || ''}
                            disabled={!!paper}
                            onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                            className="w-full px-4 py-2 rounded-lg bg-(--bg-primary) border border-(--border-subtle) focus:ring-2 focus:ring-(--ieee-blue)/20 outline-none text-(--text-primary) disabled:opacity-50 disabled:cursor-not-allowed"
                            placeholder="Leave blank for auto-generated ID"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-(--text-secondary)">Paper Title</label>
                        <input
                            type="text"
                            required
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            className="w-full px-4 py-2 rounded-lg bg-(--bg-primary) border border-(--border-subtle) focus:ring-2 focus:ring-(--ieee-blue)/20 outline-none text-(--text-primary)"
                            placeholder="e.g. Machine Learning Approaches..."
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-(--text-secondary)">Author Name</label>
                            <input
                                type="text"
                                required
                                value={formData.author}
                                onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                                className="w-full px-4 py-2 rounded-lg bg-(--bg-primary) border border-(--border-subtle) focus:ring-2 focus:ring-(--ieee-blue)/20 outline-none text-(--text-primary)"
                                placeholder="Author Name"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-(--text-secondary)">Email (Optional)</label>
                            <input
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="w-full px-4 py-2 rounded-lg bg-(--bg-primary) border border-(--border-subtle) focus:ring-2 focus:ring-(--ieee-blue)/20 outline-none text-(--text-primary)"
                                placeholder="author@example.com"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-(--text-secondary)">Designation</label>
                            <select
                                value={formData.designation}
                                onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                                className="w-full px-4 py-2 rounded-lg bg-(--bg-primary) border border-(--border-subtle) focus:ring-2 focus:ring-(--ieee-blue)/20 outline-none text-(--text-primary)"
                            >
                                <option value="Student">Student</option>
                                <option value="Faculty">Faculty</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-(--text-secondary)">Department</label>
                            <select
                                required
                                value={formData.department}
                                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                                className="w-full px-4 py-2 rounded-lg bg-(--bg-primary) border border-(--border-subtle) focus:ring-2 focus:ring-(--ieee-blue)/20 outline-none text-(--text-primary)"
                            >
                                <option value="">Select Department</option>
                                <option value="EEE">EEE</option>
                                <option value="CSE">CSE</option>
                                <option value="CE">CE</option>
                                <option value="Sc&Hum">Sc&Hum</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-(--text-secondary)">Status</label>
                            <select
                                value={formData.status}
                                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                className="w-full px-4 py-2 rounded-lg bg-(--bg-primary) border border-(--border-subtle) focus:ring-2 focus:ring-(--ieee-blue)/20 outline-none text-(--text-primary)"
                            >
                                <option value="Published">Published</option>
                                <option value="Under Review">Under Review</option>
                                <option value="Draft">Draft</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-(--text-secondary)">Category</label>
                            <input
                                type="text"
                                required
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                className="w-full px-4 py-2 rounded-lg bg-(--bg-primary) border border-(--border-subtle) focus:ring-2 focus:ring-(--ieee-blue)/20 outline-none text-(--text-primary)"
                                placeholder="e.g. AI/ML, IoT"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-(--text-secondary)">DOI</label>
                            <input
                                type="text"
                                value={formData.doi}
                                onChange={(e) => setFormData({ ...formData, doi: e.target.value })}
                                className="w-full px-4 py-2 rounded-lg bg-(--bg-primary) border border-(--border-subtle) focus:ring-2 focus:ring-(--ieee-blue)/20 outline-none text-(--text-primary)"
                                placeholder="e.g. 10.1109/..."
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-(--text-secondary)">Permission</label>
                            <select
                                value={formData.permission}
                                onChange={(e) => setFormData({ ...formData, permission: e.target.value })}
                                className="w-full px-4 py-2 rounded-lg bg-(--bg-primary) border border-(--border-subtle) focus:ring-2 focus:ring-(--ieee-blue)/20 outline-none text-(--text-primary)"
                            >
                                <option value="Public">Public (Read/Download)</option>
                                <option value="Private">Private (Ask Permission)</option>
                            </select>
                        </div>
                    </div>



                    <div className="space-y-2">
                        <label className="text-sm font-medium text-(--text-secondary)">PDF File (Google Drive hosting)</label>
                        <div className="flex flex-col gap-3">
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                className="cursor-pointer border-2 border-dashed border-(--border-subtle) hover:border-(--ieee-blue) rounded-xl p-4 transition-all group"
                            >
                                <div className="flex flex-col items-center justify-center gap-2 text-(--text-muted) group-hover:text-(--ieee-blue)">
                                    <Upload size={24} />
                                    <span className="text-sm font-medium">
                                        {selectedFile ? selectedFile.name : (formData.downloadUrl ? 'Paper already uploaded (Click to change)' : 'Click to upload PDF')}
                                    </span>
                                </div>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept=".pdf"
                                    className="hidden"
                                    onChange={(e) => setSelectedFile(e.target.files[0])}
                                />
                            </div>

                            <div className="relative">
                                <LinkIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-(--text-muted)" />
                                <input
                                    type="text"
                                    value={formData.downloadUrl}
                                    onChange={(e) => setFormData({ ...formData, downloadUrl: e.target.value })}
                                    className="w-full pl-10 pr-4 py-2 rounded-lg bg-(--bg-primary) border border-(--border-subtle) focus:ring-2 focus:ring-(--ieee-blue)/20 outline-none text-(--text-primary) text-sm"
                                    placeholder="Or paste external URL..."
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <label className="text-sm font-medium text-(--text-secondary)">Description / Abstract (Optional)</label>
                            <span className="text-[10px] uppercase font-bold text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">MARKDOWN SUPPORTED</span>
                        </div>
                        <textarea
                            rows="3"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="w-full px-4 py-2 rounded-lg bg-(--bg-primary) border border-(--border-subtle) focus:ring-2 focus:ring-(--ieee-blue)/20 outline-none text-(--text-primary) resize-none"
                            placeholder="Brief abstract..."
                        ></textarea>
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
                        Save Paper
                    </button>
                </div>
            </div>
        </div>
    );
};

const PaperManager = () => {
    const [papers, setPapers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedPaper, setSelectedPaper] = useState(null);
    const [showAll, setShowAll] = useState(false);
    const { showToast, confirmAction } = useToast();
    const { profile } = useAdmin();

    const fetchPapers = async () => {
        setLoading(true);
        try {
            const data = await FirestoreService.getCollection('papers');

            // Filter papers: Admin sees all (if showAll), others see only their own
            const userRole = profile?.role || 'Member';
            const isAdmin = userRole === 'Admin' || userRole === 'Administrator';

            if (isAdmin && showAll) {
                setPapers(data);
            } else {
                setPapers(data.filter(paper =>
                    paper.authorEmail === profile?.email ||
                    (!paper.authorEmail && paper.authorId === profile?.uid)
                ));
            }
        } catch (error) {
            console.error("Error fetching papers:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (profile?.uid) {
            fetchPapers();
        }
    }, [profile?.uid, showAll]);

    const handleSave = async (formData, file) => {
        try {
            let updatedData = {
                ...formData,
                authorId: profile?.uid, // Track creator
                authorEmail: profile?.email // Track creator email
            };

            // 1. If a new file is selected, upload to Drive via GAS
            if (file) {
                // Delete old file if updating and it has a fileId
                if (selectedPaper?.fileId) {
                    try {
                        await GAS_API.deleteFile(selectedPaper.fileId);
                    } catch (e) {
                        console.warn("Could not delete old file:", e);
                    }
                }

                const uploadResult = await GAS_API.uploadFile(file, 'papers');
                updatedData.downloadUrl = uploadResult.viewUrl;
                updatedData.fileId = uploadResult.fileId;
            }

            // 2. Save to Firestore
            if (selectedPaper) {
                const { id, ...updateData } = updatedData; // Exclude ID from update
                await FirestoreService.updateDocument('papers', selectedPaper.id, updateData);
                showToast("Paper record updated", "success");
            } else {
                if (updatedData.id && updatedData.id.trim() !== "") {
                    // Check if ID is unique
                    const existing = await FirestoreService.getDocument('papers', updatedData.id);
                    if (existing) {
                        showToast("Paper ID already exists. Please choose a unique one.", "error");
                        return;
                    }
                    await FirestoreService.addDocumentWithId('papers', updatedData.id, updatedData);
                } else {
                    await FirestoreService.addDocument('papers', updatedData);
                }
                showToast("Paper record added", "success");
            }
            await fetchPapers();
        } catch (error) {
            console.error("Save failed:", error);
            showToast(`Failed to save: ${error.message}`, "error");
            throw error;
        }
    };

    const handleDelete = async (id) => {
        const paperToDelete = papers.find(p => p.id === id);

        confirmAction({
            title: 'Delete Paper',
            message: 'Are you sure you want to delete this paper? The file will also be removed from Google Drive.',
            onConfirm: async () => {
                try {
                    // 1. Remove from Drive if fileId exists
                    if (paperToDelete?.fileId) {
                        try {
                            await GAS_API.deleteFile(paperToDelete.fileId);
                        } catch (e) {
                            console.warn("Drive deletion failed:", e);
                        }
                    }

                    // 2. Remove from Firestore with cascade cleanup
                    await FirestoreService.deleteDocumentWithCleanup('papers', id);
                    showToast("Paper deleted successfully", "success");
                    await fetchPapers();
                } catch (error) {
                    console.error("Delete failed:", error);
                    showToast("Failed to delete paper", "error");
                }
            }
        });
    };

    const openModal = (paper = null) => {
        setSelectedPaper(paper);
        setIsModalOpen(true);
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-xl md:text-2xl font-bold text-(--text-primary)">Paper Manager</h1>
                    <p className="text-xs md:text-sm text-(--text-secondary)">Manage research paper submissions and publications.</p>
                </div>
                <div className="flex items-center gap-3">
                    {(profile?.role === 'Admin' || profile?.role === 'Administrator') && (
                        <div className="mr-4 flex items-center gap-2 bg-(--bg-secondary)/50 px-3 py-1.5 rounded-lg border border-(--border-subtle)">
                            <span className="text-[10px] uppercase font-bold text-(--text-muted) tracking-wider">All Papers</span>
                            <button
                                onClick={() => setShowAll(!showAll)}
                                className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${showAll ? 'bg-(--ieee-blue)' : 'bg-gray-200 dark:bg-gray-700'
                                    }`}
                            >
                                <span
                                    className={`inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${showAll ? 'translate-x-5' : 'translate-x-0'
                                        }`}
                                />
                            </button>
                        </div>
                    )}
                    <button
                        onClick={() => openModal()}
                        className="flex items-center justify-center bg-(--ieee-blue) text-white hover:bg-(--ieee-dark-blue) transition-colors shadow-lg md:shadow-none font-medium fixed bottom-6 right-6 z-100 w-14 h-14 rounded-2xl md:static md:w-auto md:h-auto md:rounded-lg md:px-4 md:py-2 md:gap-2"
                    >
                        <Plus size={24} className="md:w-4 md:h-4" />
                        <span className="hidden md:inline text-sm">Add Paper</span>
                    </button>
                </div>
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
                                    <th className="px-4 py-3 text-[10px] md:text-xs font-semibold text-(--text-muted) uppercase tracking-wider">Title</th>
                                    <th className="px-4 py-3 text-[10px] md:text-xs font-semibold text-(--text-muted) uppercase tracking-wider">Author</th>
                                    <th className="px-4 py-3 text-[10px] md:text-xs font-semibold text-(--text-muted) uppercase tracking-wider">Category</th>
                                    <th className="px-4 py-3 text-[10px] md:text-xs font-semibold text-(--text-muted) uppercase tracking-wider">Status</th>
                                    <th className="px-4 py-3 text-[10px] md:text-xs font-semibold text-(--text-muted) uppercase tracking-wider text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-(--border-subtle)">
                                {papers.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-8 text-center text-(--text-muted)">
                                            No papers found. Add some research work!
                                        </td>
                                    </tr>
                                ) : (
                                    papers.map((paper) => (
                                        <tr key={paper.id} className="hover:bg-(--bg-secondary)/50 transition-colors">
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 bg-(--bg-secondary) rounded-lg text-(--ieee-blue)">
                                                        <FileText size={16} />
                                                    </div>
                                                    <div className="max-w-xs min-w-0">
                                                        <div className="font-semibold text-(--text-primary) text-sm truncate" title={paper.title}>{paper.title}</div>
                                                        {paper.doi && <div className="text-[10px] text-(--text-muted) truncate">{paper.doi}</div>}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-[10px] md:text-xs text-(--text-secondary)">
                                                <div className="font-semibold">{paper.author}</div>
                                                <div className="text-[9px] text-(--text-muted) truncate">
                                                    {paper.department} • {paper.designation}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className="inline-block px-1.5 py-0.5 bg-(--bg-secondary) rounded text-[9px] text-(--text-muted) border border-(--border-subtle)">
                                                    {paper.category}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-[10px]">
                                                <span className={`inline-flex items-center px-2 py-0.5 rounded-lg font-medium ${paper.status === 'Published'
                                                    ? 'bg-green-500/10 text-green-500'
                                                    : paper.status === 'Under Review'
                                                        ? 'bg-yellow-500/10 text-yellow-500'
                                                        : 'bg-(--bg-secondary) text-(--text-muted)'
                                                    }`}>
                                                    {paper.status}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    {paper.downloadUrl && (
                                                        <a
                                                            href={paper.downloadUrl}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="p-1.5 text-(--text-muted) hover:text-(--ieee-blue) transition-colors"
                                                            title="View/Download"
                                                        >
                                                            <Download size={14} />
                                                        </a>
                                                    )}
                                                    <a
                                                        href={`/paper/${paper.id}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="p-1.5 text-(--text-muted) hover:text-(--ieee-blue) transition-colors"
                                                        title="Open Public Page"
                                                    >
                                                        <ExternalLink size={14} />
                                                    </a>
                                                    <button
                                                        onClick={() => openModal(paper)}
                                                        className="p-1.5 text-(--text-muted) hover:text-(--ieee-blue) transition-colors"
                                                        title="Edit"
                                                    >
                                                        <Edit size={14} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(paper.id)}
                                                        className="p-1.5 text-(--text-muted) hover:text-red-500 transition-colors"
                                                        title="Delete"
                                                    >
                                                        <Trash2 size={14} />
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
                        {papers.length === 0 ? (
                            <div className="p-8 text-center text-(--text-muted)">
                                No papers found. Add some research work!
                            </div>
                        ) : (
                            papers.map((paper) => (
                                <div key={paper.id} className="p-3 flex flex-col gap-2">
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="flex items-start gap-2 min-w-0">
                                            <div className="p-1.5 bg-(--bg-secondary) rounded-lg text-(--ieee-blue) shrink-0 mt-0.5">
                                                <FileText size={16} />
                                            </div>
                                            <div className="min-w-0">
                                                <h3 className="font-semibold text-(--text-primary) text-sm truncate leading-tight">{paper.title}</h3>
                                                <div className="text-[10px] text-(--text-secondary) mt-0.5">{paper.author}</div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between pl-[32px]">
                                        <div className="flex items-center gap-2">
                                            <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-medium ${paper.status === 'Published'
                                                ? 'bg-green-500/10 text-green-500'
                                                : paper.status === 'Under Review'
                                                    ? 'bg-yellow-500/10 text-yellow-500'
                                                    : 'bg-(--bg-secondary) text-(--text-muted)'
                                                }`}>
                                                {paper.status}
                                            </span>
                                            <span className="text-[9px] text-(--text-muted) px-1.5 py-0.5 bg-(--bg-secondary) rounded border border-(--border-subtle)">{paper.category}</span>
                                        </div>

                                        <div className="flex items-center gap-1">
                                            {paper.downloadUrl && (
                                                <a
                                                    href={paper.downloadUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="p-1 text-(--text-muted) hover:text-(--ieee-blue) transition-colors"
                                                >
                                                    <Download size={14} />
                                                </a>
                                            )}
                                            <a
                                                href={`/paper/${paper.id}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="p-1 text-(--text-muted) hover:text-(--ieee-blue) transition-colors"
                                            >
                                                <ExternalLink size={14} />
                                            </a>
                                            <button
                                                onClick={() => openModal(paper)}
                                                className="p-1 text-(--text-muted) hover:text-(--ieee-blue) transition-colors"
                                            >
                                                <Edit size={14} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(paper.id)}
                                                className="p-1 text-(--text-muted) hover:text-red-500 transition-colors"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}

            <PaperModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                paper={selectedPaper}
                onSave={handleSave}
            />
        </div>
    );
};

export default PaperManager;
