import React, { useState, useEffect } from 'react';
import { Plus, Search, Trash2, Eye, FileText, Upload, Link as LinkIcon, Download, X, Save, Loader2 } from 'lucide-react';
import { FirestoreService } from '../../services/firestore';
import { GAS_API } from '../../services/gas';
import { useToast } from '../../context/ToastContext';

const CertificateModal = ({ isOpen, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        studentName: '',
        eventId: '',
        eventName: '',
        certificateId: '', // Custom ID or auto-generated
    });
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const { showToast } = useToast();

    // Reset form when modal opens/closes
    useEffect(() => {
        if (isOpen) {
            setFormData({ studentName: '', eventId: '', eventName: '', certificateId: '' });
            setFile(null);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleFileUpload = async () => {
        if (!file) return null;
        try {
            // GAS_API.uploadFile returns the data directly (e.g., { fileId, viewUrl, ... })
            // It throws an error if the status is not 'success'.
            const result = await GAS_API.uploadFile(file, 'certificates'); // Using 'certificates' folder for better organization
            return result;
        } catch (e) {
            console.error(e);
            showToast("File upload failed: " + e.message, "error");
            return null;
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setUploading(true);

        try {
            let driveData = null;
            if (file) {
                driveData = await handleFileUpload();
                if (!driveData) {
                    setUploading(false);
                    return;
                }
            }

            // Generate a simple ID if not provided (e.g., IEEE-YEAR-RANDOM)
            const id = formData.certificateId || `IEEE-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

            const certData = {
                ...formData,
                id: id,
                fileId: driveData?.fileId || '',
                viewUrl: driveData?.viewUrl || '',
                downloadUrl: driveData?.url || '',
                createdAt: new Date().toISOString()
            };

            await onSave(id, certData);
            onClose();

        } catch (error) {
            console.error(error);
            showToast('Failed to save certificate.', 'error');
        } finally {
            setUploading(false);
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
                        Issue New Certificate
                    </h2>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-(--text-secondary)">Student Name</label>
                            <input
                                required
                                type="text"
                                className="w-full px-4 py-2 rounded-lg bg-(--bg-primary) border border-(--border-subtle) focus:ring-2 focus:ring-(--ieee-blue)/20 outline-none text-(--text-primary)"
                                value={formData.studentName}
                                onChange={e => setFormData({ ...formData, studentName: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-(--text-secondary)">Event Name</label>
                            <input
                                required
                                type="text"
                                className="w-full px-4 py-2 rounded-lg bg-(--bg-primary) border border-(--border-subtle) focus:ring-2 focus:ring-(--ieee-blue)/20 outline-none text-(--text-primary)"
                                value={formData.eventName}
                                onChange={e => setFormData({ ...formData, eventName: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-(--text-secondary)">Custom ID (Optional)</label>
                            <input
                                type="text"
                                placeholder="Auto-generated if blank"
                                className="w-full px-4 py-2 rounded-lg bg-(--bg-primary) border border-(--border-subtle) focus:ring-2 focus:ring-(--ieee-blue)/20 outline-none text-(--text-primary)"
                                value={formData.certificateId}
                                onChange={e => setFormData({ ...formData, certificateId: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-(--text-secondary)">Certificate File (PDF/Image)</label>
                            <div className="relative">
                                <input
                                    required
                                    type="file"
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                    onChange={e => setFile(e.target.files[0])}
                                />
                                <div className="w-full px-4 py-2 rounded-lg bg-(--bg-primary) border border-dashed border-(--border-subtle) flex items-center gap-2 text-(--text-muted)">
                                    <Upload size={16} />
                                    <span className="truncate">{file ? file.name : 'Click to upload file'}</span>
                                </div>
                            </div>
                        </div>
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
                        onClick={handleSubmit}
                        disabled={uploading}
                        className="flex items-center gap-2 px-6 py-2 bg-(--ieee-blue) text-white rounded-lg hover:bg-(--ieee-dark-blue) transition-colors font-medium disabled:opacity-50"
                    >
                        {uploading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                        {uploading ? 'Processing...' : 'Issue Certificate'}
                    </button>
                </div>
            </div>
        </div>
    );
};

const CertificateManager = () => {
    const [certificates, setCertificates] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const { showToast, confirmAction } = useToast();
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        loadCertificates();
    }, []);

    const loadCertificates = async () => {
        const data = await FirestoreService.getCollection('certificates');
        setCertificates(data);
    };

    const handleSaveCertificate = async (id, certData) => {
        await FirestoreService.addDocumentWithId('certificates', id, certData);
        showToast('Certificate added successfully!', 'success');
        loadCertificates();
    };

    const handleDelete = async (id) => {
        confirmAction({
            title: 'Delete Certificate',
            message: 'Are you sure you want to delete this certificate? This action cannot be undone.',
            onConfirm: async () => {
                try {
                    await FirestoreService.deleteDocument('certificates', id);
                    loadCertificates();
                    showToast('Certificate deleted successfully', 'success');
                } catch {
                    showToast('Delete failed', 'error');
                }
            }
        });
    };

    const filteredCerts = certificates.filter(c =>
        c.studentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.id?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-(--text-primary)">Certificate Manager</h1>
                    <p className="text-(--text-secondary)">Issue and manage certificates.</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center justify-center bg-(--ieee-blue) text-white hover:bg-(--ieee-dark-blue) transition-colors shadow-lg md:shadow-none font-medium fixed bottom-6 right-6 z-100 w-14 h-14 rounded-2xl md:static md:w-auto md:h-auto md:rounded-lg md:px-4 md:py-2 md:gap-2"
                >
                    <Plus size={24} className="md:w-4 md:h-4" />
                    <span className="hidden md:inline text-sm">Issue Certificate</span>
                </button>
            </div>

            <div className="mb-4">
                <div className="relative max-w-sm">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-(--text-muted)" />
                    <input
                        type="text"
                        placeholder="Search certificates..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-(--bg-surface) rounded-lg border border-(--border-subtle) text-sm outline-hidden focus:ring-2 focus:ring-(--ieee-blue)/20 text-(--text-primary)"
                    />
                </div>
            </div>

            <div className="bg-(--bg-surface) rounded-2xl shadow-sm border border-(--border-subtle) overflow-hidden">
                {/* Desktop Table View */}
                <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-(--bg-secondary) border-b border-(--border-subtle)">
                                <th className="px-6 py-4 text-xs font-semibold text-(--text-muted) uppercase tracking-wider">ID</th>
                                <th className="px-6 py-4 text-xs font-semibold text-(--text-muted) uppercase tracking-wider">Student</th>
                                <th className="px-6 py-4 text-xs font-semibold text-(--text-muted) uppercase tracking-wider">Event</th>
                                <th className="px-6 py-4 text-xs font-semibold text-(--text-muted) uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-(--border-subtle)">
                            {filteredCerts.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="px-6 py-8 text-center text-(--text-muted)">
                                        No certificates found. Issue your first one!
                                    </td>
                                </tr>
                            ) : (
                                filteredCerts.map((cert) => (
                                    <tr key={cert.id} className="hover:bg-(--bg-secondary)/50 transition-colors">
                                        <td className="px-6 py-4 font-mono text-xs text-(--text-muted)">{cert.id}</td>
                                        <td className="px-6 py-4 font-medium text-(--text-primary)">{cert.studentName}</td>
                                        <td className="px-6 py-4 text-(--text-secondary)">{cert.eventName}</td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <a href={cert.viewUrl} target="_blank" rel="noreferrer" className="p-2 text-(--text-muted) hover:text-(--ieee-blue) transition-colors" title="View">
                                                    <Eye size={16} />
                                                </a>
                                                <a href={cert.downloadUrl} target="_blank" rel="noreferrer" className="p-2 text-(--text-muted) hover:text-emerald-600 transition-colors" title="Download">
                                                    <Download size={16} />
                                                </a>
                                                <button onClick={() => handleDelete(cert.id)} className="p-2 text-(--text-muted) hover:text-red-500 transition-colors" title="Delete">
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
                    {filteredCerts.length === 0 ? (
                        <div className="p-8 text-center text-(--text-muted)">
                            No certificates found. Issue your first one!
                        </div>
                    ) : (
                        filteredCerts.map((cert) => (
                            <div key={cert.id} className="p-4 flex flex-col gap-2">
                                <div className="flex justify-between items-start">
                                    <div className="min-w-0">
                                        <h3 className="font-medium text-(--text-primary) line-clamp-1">{cert.studentName}</h3>
                                        <div className="text-xs text-(--text-muted) font-mono mt-0.5">{cert.id}</div>
                                    </div>
                                    <div className="flex items-center gap-1 shrink-0">
                                        <a href={cert.viewUrl} target="_blank" rel="noreferrer" className="p-2 text-(--text-muted) hover:text-(--ieee-blue) transition-colors">
                                            <Eye size={18} />
                                        </a>
                                        <button onClick={() => handleDelete(cert.id)} className="p-2 text-(--text-muted) hover:text-red-500 transition-colors">
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between mt-1">
                                    <span className="text-sm text-(--text-secondary) truncate pr-4">{cert.eventName}</span>
                                    {cert.downloadUrl && (
                                        <a href={cert.downloadUrl} target="_blank" rel="noreferrer" className="text-xs font-medium text-emerald-500 hover:text-emerald-600 flex items-center gap-1">
                                            <Download size={12} /> Download
                                        </a>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            <CertificateModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveCertificate}
            />
        </div>
    );
};

export default CertificateManager;
