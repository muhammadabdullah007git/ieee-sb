import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Calendar, MapPin, X, Save, Loader2, Image as ImageIcon, Info, Link as LinkIcon, FileText, HelpCircle, Users, Clock, Trash, ExternalLink, Upload } from 'lucide-react';
import { FirestoreService } from '../../services/firestore';
import { GAS_API } from '../../services/gas';
import { useToast } from '../../context/ToastContext';
import { getDirectDriveLink } from '../../lib/utils';

const EventModal = ({ event, isOpen, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        id: '',
        title: '',
        startDate: '',
        endDate: '',
        type: 'custom', // 'custom' | 'configured'
        actionUrl: '',
        info: '',
        formId: '', // Legacy/Optional
        customCode: '',
        image: '', // Keeping for card thumbnail & banner
        visibility: 'public',
        allowedEmails: '',
        galleryFolderId: ''
    });
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const { showToast } = useToast();

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        try {
            const result = await GAS_API.uploadFile(file, 'events');
            setFormData(prev => ({ ...prev, image: result.fileId }));
            showToast("Cover image uploaded successfully", "success");
        } catch (error) {
            console.error(error);
            showToast("Upload failed: " + error.message, "error");
        } finally {
            setUploading(false);
        }
    };

    useEffect(() => {
        if (event) {
            setFormData({
                id: event.id || '',
                title: event.title || '',
                startDate: event.startDate || '',
                endDate: event.endDate || '',
                type: event.type || 'custom',
                actionUrl: event.actionUrl || event.googleFormUrl || '', // Fallback for migration
                info: event.info || '',
                formId: event.formId || '',
                customCode: event.customCode || '',
                image: event.image || '',
                visibility: event.visibility || 'public',
                allowedEmails: Array.isArray(event.allowedEmails) ? event.allowedEmails.join(', ') : (event.allowedEmails || ''),
                galleryFolderId: event.galleryFolderId || ''
            });
        } else {
            setFormData({
                id: '',
                title: '',
                startDate: '',
                endDate: '',
                type: 'custom', // Default
                actionUrl: '',
                info: '',
                formId: '',
                customCode: '',
                image: '',
                visibility: 'public',
                allowedEmails: '',
                galleryFolderId: ''
            });
        }
    }, [event, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Process allowedEmails into array
            const processedData = {
                ...formData,
                allowedEmails: formData.visibility === 'private'
                    ? formData.allowedEmails.split(/[\n,]+/).map(e => e.trim().toLowerCase()).filter(e => e)
                    : []
            };

            await onSave(processedData);
            onClose();
        } catch (error) {
            console.error("Save failed:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-150 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-(--bg-surface) rounded-2xl shadow-xl w-full max-w-4xl h-[90vh] flex flex-col border border-(--border-subtle) animate-in fade-in zoom-in duration-200">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-(--border-subtle) bg-(--bg-secondary)/10">
                    <div className="flex items-center gap-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="p-2 hover:bg-(--bg-secondary) rounded-lg transition-colors text-(--text-muted) hover:text-(--text-primary)"
                            aria-label="Close modal"
                        >
                            <X size={20} />
                        </button>
                        <div>
                            <h2 className="text-xl font-bold text-(--text-primary)">
                                {event ? 'Edit Event' : 'Create New Event'}
                            </h2>
                            <p className="text-xs text-(--text-muted)">Configure your custom landing page</p>
                        </div>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Event Name & ID */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2 md:col-span-2">
                                <label className="text-sm font-medium text-(--text-secondary)">Event Name</label>
                                <input
                                    required
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full px-4 py-2 rounded-lg bg-(--bg-primary) border border-(--border-subtle) focus:ring-2 focus:ring-(--ieee-blue)/20 outline-none text-(--text-primary) text-lg font-medium"
                                    placeholder="e.g. IEEE Xtreme 18.0"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-(--text-secondary)">Event ID (URL)</label>
                                <input
                                    required
                                    value={formData.id}
                                    onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                                    className="w-full px-4 py-2 rounded-lg bg-(--bg-primary) border border-(--border-subtle) focus:ring-2 focus:ring-(--ieee-blue)/20 outline-none text-(--text-primary) font-mono text-sm"
                                    placeholder="xtreme-18"
                                    disabled={!!event}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2 col-span-1">
                                <label className="text-sm font-medium text-(--text-secondary)">Form ID / URL</label>
                                <input
                                    value={formData.formId}
                                    onChange={(e) => setFormData({ ...formData, formId: e.target.value })}
                                    className="w-full px-4 py-2 rounded-lg bg-(--bg-primary) border border-(--border-subtle) focus:ring-2 focus:ring-(--ieee-blue)/20 outline-none text-(--text-primary) font-mono text-sm"
                                    placeholder="Optional ID"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-(--text-secondary)">Start Date</label>
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-2.5 text-(--text-muted)" size={16} />
                                    <input
                                        type="text"
                                        required
                                        value={formData.startDate}
                                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                        className="w-full pl-10 pr-4 py-2 rounded-lg bg-(--bg-primary) border border-(--border-subtle) focus:ring-2 focus:ring-(--ieee-blue)/20 outline-none text-(--text-primary)"
                                        placeholder="YYYY-MM-DD"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-(--text-secondary)">End Date</label>
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-2.5 text-(--text-muted)" size={16} />
                                    <input
                                        type="text"
                                        required
                                        value={formData.endDate}
                                        onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                        className="w-full pl-10 pr-4 py-2 rounded-lg bg-(--bg-primary) border border-(--border-subtle) focus:ring-2 focus:ring-(--ieee-blue)/20 outline-none text-(--text-primary)"
                                        placeholder="YYYY-MM-DD"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Centered Image Upload */}
                        <div className="flex justify-center py-2">
                            <div className="w-full max-w-xl space-y-2">
                                <label className="text-sm font-medium text-(--text-secondary) block text-center">Event Cover Image</label>
                                <div className="relative group">
                                    <input
                                        type="file"
                                        className="hidden"
                                        id="event-cover-upload"
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                        disabled={uploading}
                                    />
                                    {formData.image ? (
                                        <div className="relative h-48 rounded-2xl overflow-hidden border border-(--border-subtle) group shadow-inner bg-(--bg-primary)">
                                            <img
                                                src={getDirectDriveLink(formData.image)}
                                                alt="Event Cover Preview"
                                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                            />
                                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                                                <label
                                                    htmlFor="event-cover-upload"
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
                                            htmlFor="event-cover-upload"
                                            className={`flex flex-col items-center justify-center h-48 border-2 border-dashed border-(--border-subtle) rounded-2xl cursor-pointer hover:border-(--ieee-blue) hover:bg-(--ieee-blue)/5 transition-all group ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        >
                                            {uploading ? (
                                                <Loader2 className="animate-spin text-(--ieee-blue) mb-2" size={32} />
                                            ) : (
                                                <div className="flex flex-col items-center text-center p-6">
                                                    <div className="p-4 bg-(--bg-secondary)/50 rounded-2xl mb-3 group-hover:bg-(--ieee-blue)/10 text-(--text-muted) group-hover:text-(--ieee-blue) transition-colors border border-transparent group-hover:border-(--ieee-blue)/20">
                                                        <Upload size={32} />
                                                    </div>
                                                    <span className="text-sm font-bold text-(--text-secondary) group-hover:text-(--ieee-blue)">Click to upload cover image</span>
                                                    <p className="text-[10px] text-(--text-muted) mt-1 uppercase tracking-wider font-medium">Recommended: 1200 x 630 pixels</p>
                                                </div>
                                            )}
                                        </label>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Visibility & Permissions */}
                        <div className="space-y-4 p-4 bg-(--bg-secondary)/20 rounded-xl border border-(--border-subtle)">
                            <div className="flex items-center gap-2">
                                <Users size={18} className="text-(--text-muted)" />
                                <h3 className="text-sm font-bold text-(--text-primary)">Visibility & Access</h3>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-(--text-secondary)">Who can see this event?</label>
                                    <select
                                        value={formData.visibility}
                                        onChange={(e) => setFormData({ ...formData, visibility: e.target.value })}
                                        className="w-full px-4 py-2 rounded-lg bg-(--bg-primary) border border-(--border-subtle) focus:ring-2 focus:ring-(--ieee-blue)/20 outline-none text-(--text-primary)"
                                    >
                                        <option value="public">Public (Everyone)</option>
                                        <option value="private">Private (Restricted)</option>
                                    </select>
                                </div>
                            </div>

                            {formData.visibility === 'private' && (
                                <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-(--text-secondary)">Allowed Emails</label>
                                        <p className="text-xs text-(--text-muted)">Enter email addresses separated by commas or new lines.</p>
                                        <textarea
                                            value={formData.allowedEmails}
                                            onChange={(e) => setFormData({ ...formData, allowedEmails: e.target.value })}
                                            className="w-full px-4 py-3 rounded-lg bg-(--bg-primary) border border-(--border-subtle) focus:ring-2 focus:ring-(--ieee-blue)/20 outline-none text-(--text-primary) font-mono text-xs"
                                            placeholder="student1@baiust.edu.bd, student2@baiust.edu.bd"
                                            rows={4}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-(--text-secondary)">GAS Private Video URL (Optional)</label>
                                        <p className="text-xs text-(--text-muted)">Link to a GAS web app or protected stream for private viewing.</p>
                                        <input
                                            value={formData.gasVideoUrl || ''}
                                            onChange={(e) => setFormData({ ...formData, gasVideoUrl: e.target.value })}
                                            className="w-full px-4 py-2 rounded-lg bg-(--bg-primary) border border-(--border-subtle) focus:ring-2 focus:ring-(--ieee-blue)/20 outline-none text-(--text-primary)"
                                            placeholder="https://script.google.com/macros/s/..."
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Media Gallery Info */}
                        <div className="space-y-4 p-4 bg-purple-500/5 rounded-xl border border-purple-500/10">
                            <div className="flex items-center gap-2">
                                <ImageIcon size={18} className="text-purple-400" />
                                <h3 className="text-sm font-bold text-(--text-primary)">Media Gallery</h3>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-(--text-secondary)">Google Drive Folder ID (Photos)</label>
                                <p className="text-[10px] text-(--text-muted)">Link a Google Drive folder containing photos for this event's gallery.</p>
                                <input
                                    value={formData.galleryFolderId}
                                    onChange={(e) => setFormData({ ...formData, galleryFolderId: e.target.value })}
                                    className="w-full px-4 py-2 rounded-lg bg-(--bg-primary) border border-(--border-subtle) focus:ring-2 focus:ring-purple-500/20 outline-none text-(--text-primary) font-mono text-sm"
                                    placeholder="Enter folder ID (e.g. 1aBC...)"
                                />
                            </div>
                        </div>

                        {/* Type Selection */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-(--text-secondary)">Event Type</label>
                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, type: 'custom' })}
                                    className={`px-4 py-3 rounded-xl border font-bold text-sm transition-all ${formData.type === 'custom'
                                        ? 'bg-(--ieee-blue)/10 border-(--ieee-blue) text-(--ieee-blue)'
                                        : 'bg-(--bg-primary) border-(--border-subtle) text-(--text-secondary) hover:border-(--ieee-blue)/50'
                                        }`}
                                >
                                    Custom Code
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, type: 'configured' })}
                                    className={`px-4 py-3 rounded-xl border font-bold text-sm transition-all ${formData.type === 'configured'
                                        ? 'bg-(--ieee-blue)/10 border-(--ieee-blue) text-(--ieee-blue)'
                                        : 'bg-(--bg-primary) border-(--border-subtle) text-(--text-secondary) hover:border-(--ieee-blue)/50'
                                        }`}
                                >
                                    Configured Event
                                </button>
                            </div>
                        </div>

                        {/* Conditional Fields */}
                        {
                            formData.type === 'configured' ? (
                                <div className="space-y-4 flex-1 flex flex-col min-h-0">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-(--text-secondary)">Action URL (Form/Registration)</label>
                                        <input
                                            value={formData.actionUrl}
                                            onChange={(e) => setFormData({ ...formData, actionUrl: e.target.value })}
                                            className="w-full px-4 py-2 rounded-lg bg-(--bg-primary) border border-(--border-subtle) focus:ring-2 focus:ring-(--ieee-blue)/20 outline-none text-(--text-primary)"
                                            placeholder="https://docs.google.com/forms/..."
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-(--text-secondary)">Video / Live Stream URL (Optional)</label>
                                        <input
                                            value={formData.videoUrl || ''}
                                            onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                                            className="w-full px-4 py-2 rounded-lg bg-(--bg-primary) border border-(--border-subtle) focus:ring-2 focus:ring-(--ieee-blue)/20 outline-none text-(--text-primary)"
                                            placeholder="https://youtube.com/watch?v=... or DropBox/Drive/GAS link"
                                        />
                                    </div>
                                    <div className="space-y-2 flex-1 flex flex-col min-h-0">
                                        <div className="flex items-center justify-between">
                                            <label className="text-sm font-medium text-(--text-secondary)">Event Info (Markdown)</label>
                                            <span className="text-[10px] uppercase font-bold text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">MARKDOWN SUPPORTED</span>
                                        </div>
                                        <textarea
                                            value={formData.info}
                                            onChange={(e) => setFormData({ ...formData, info: e.target.value })}
                                            className="w-full px-4 py-3 rounded-xl bg-(--bg-primary) border border-(--border-subtle) focus:border-(--ieee-blue) outline-none transition-all text-sm resize-none custom-scrollbar min-h-[300px]"
                                            placeholder="# Event Description\n\nProvide all the details here..."
                                        />
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-4 flex-1 flex flex-col min-h-0">
                                    <details className="bg-blue-500/5 border border-blue-500/10 rounded-lg group">
                                        <summary className="p-3 text-xs font-bold text-blue-400 cursor-pointer flex items-center justify-between hover:bg-blue-500/10 transition-colors select-none">
                                            <span>Show Developer Guide (GAS Integration)</span>
                                            <span className="transform group-open:rotate-180 transition-transform">▼</span>
                                        </summary>
                                        <div className="p-4 text-xs font-mono text-slate-400 border-t border-blue-500/10 bg-slate-950/50 overflow-x-auto max-h-[200px] overflow-y-auto custom-scrollbar">
                                            <p className="mb-2 text-slate-300 font-sans">To send data to the backend, use the following payload structure:</p>
                                            <pre className="text-green-400 whitespace-pre-wrap">
                                                {`const payload = {
  action: "register_event",
  payload: {
    eventTitle: "Event Name",
    userName: "Student Name",
    userEmail: "student@email.com",
    userDetails: {
       ...allOtherFormData,
       segment: "Event Segment",
       timestamp: new Date()
    }
  }
};

await fetch("YOUR_GAS_DEPLOYMENT_URL", {
  method: 'POST',
  mode: 'no-cors', // Important for GAS
  body: JSON.stringify(payload),
  headers: { "Content-Type": "text/plain;charset=utf-8" }
});`}
                                            </pre>
                                        </div>
                                    </details>

                                    <div className="space-y-2 flex-1 flex flex-col min-h-0">
                                        <div className="flex items-center justify-between">
                                            <label className="text-sm font-medium text-(--text-secondary)">Custom HTML + CSS + JS</label>
                                            <span className="text-[10px] uppercase font-extrabold text-(--ieee-blue) bg-(--ieee-blue)/10 px-2 py-0.5 rounded tracking-wider">CORE INJECTION</span>
                                        </div>
                                        <textarea
                                            value={formData.customCode}
                                            onChange={(e) => setFormData({ ...formData, customCode: e.target.value })}
                                            className="w-full px-4 py-3 rounded-xl bg-gray-950 border border-gray-800 focus:border-(--ieee-blue) outline-none transition-all font-mono text-sm text-green-400 resize-none custom-scrollbar min-h-[400px]"
                                            placeholder={`<!-- Put your HTML here -->\n<div class="my-event">...</div>\n\n<style>\n  .my-event { ... }\n</style>\n\n<script>\n  console.log('Event loaded');\n</script>`}
                                        />
                                    </div>
                                </div>
                            )
                        }
                    </form >
                </div >

                {/* Footer */}
                < div className="p-6 border-t border-(--border-subtle) bg-(--bg-surface) flex justify-between gap-3" >
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-6 py-2.5 rounded-xl font-bold border border-(--border-subtle) hover:bg-(--bg-secondary) transition-all text-(--text-secondary)"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="px-8 py-2.5 rounded-xl font-bold bg-(--ieee-blue) text-white shadow-lg shadow-(--ieee-blue)/20 hover:bg-(--ieee-dark-blue) transition-all active:scale-95 disabled:opacity-50"
                    >
                        {loading ? <Loader2 size={20} className="animate-spin" /> : (event ? 'Update Event' : 'Create Event')}
                    </button>
                </div >
            </div >
        </div >
    );
};

const EventManager = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const { showToast, confirmAction } = useToast();

    const getComputedStatus = (event) => {
        if (!event.startDate || !event.endDate) return event.status || 'Upcoming';
        const today = new Date().toISOString().split('T')[0];
        if (today > event.endDate) return 'Closed';
        if (today < event.startDate) return 'Upcoming';
        return 'Ongoing';
    };

    const fetchEvents = async () => {
        setLoading(true);
        try {
            const data = await FirestoreService.getCollection('events');
            setEvents(data);
        } catch (error) {
            console.error("Error fetching events:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEvents();
    }, []);

    const handleSave = async (formData) => {
        try {
            if (selectedEvent) {
                // Remove ID from formData update to prevent overwriting doc ID field if it exists in data
                const { id, ...updateData } = formData;
                await FirestoreService.updateDocument('events', selectedEvent.id, updateData);
                showToast("Event updated successfully", "success");
            } else {
                if (formData.id && formData.id.trim() !== "") {
                    // Check if ID is unique
                    const existing = await FirestoreService.getDocument('events', formData.id);
                    if (existing) {
                        showToast("Event ID already exists. Please choose a unique one.", "error");
                        return;
                    }
                    await FirestoreService.addDocumentWithId('events', formData.id, formData);
                } else {
                    await FirestoreService.addDocument('events', formData);
                }
                showToast("Event created successfully", "success");
            }
            await fetchEvents();
        } catch (e) {
            console.error(e);
            showToast("Failed to save event.", "error");
        }
    };

    const handleDelete = async (id) => {
        confirmAction({
            title: 'Delete Event',
            message: 'Are you sure you want to delete this event? This action cannot be undone.',
            onConfirm: async () => {
                try {
                    await FirestoreService.deleteDocumentWithCleanup('events', id);
                    showToast("Event deleted successfully", "success");
                    await fetchEvents();
                } catch (error) {
                    console.error("Delete failed:", error);
                    showToast(`Failed to delete: ${error.message}`, "error");
                }
            }
        });
    };

    const openModal = (event = null) => {
        setSelectedEvent(event);
        setIsModalOpen(true);
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-xl md:text-2xl font-bold text-(--text-primary)">Event Manager</h1>
                    <p className="text-xs md:text-sm text-(--text-secondary)">Schedule and manage branch events.</p>
                </div>
                <button
                    onClick={() => openModal()}
                    className="flex items-center justify-center bg-(--ieee-blue) text-white hover:bg-(--ieee-dark-blue) transition-colors shadow-lg md:shadow-none font-medium fixed bottom-6 right-6 z-100 w-14 h-14 rounded-2xl md:static md:w-auto md:h-auto md:rounded-lg md:px-4 md:py-2 md:gap-2"
                >
                    <Plus size={24} className="md:w-4 md:h-4" />
                    <span className="hidden md:inline text-sm">Create Event</span>
                </button>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="animate-spin text-(--ieee-blue)" size={40} />
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {events.length === 0 ? (
                        <div className="text-center py-12 bg-(--bg-surface) rounded-xl border border-dashed border-(--border-subtle)">
                            <p className="text-(--text-muted)">No events found. Create your first event!</p>
                        </div>
                    ) : (
                        events.map((event) => (
                            <div key={event.id} className="bg-(--bg-surface) p-3 md:p-4 rounded-xl border border-(--border-subtle) flex flex-col md:flex-row md:items-center justify-between gap-3 hover:shadow-sm transition-shadow">
                                <div className="flex items-start md:items-center gap-3 md:gap-5">
                                    <div className="w-12 h-12 md:w-14 md:h-14 rounded-lg bg-(--bg-secondary) flex items-center justify-center text-(--ieee-blue) overflow-hidden shrink-0 border border-(--border-subtle)">
                                        {event.image ? (
                                            <img src={getDirectDriveLink(event.image)} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            <LinkIcon size={20} />
                                        )}
                                    </div>

                                    <div>
                                        <h3 className="text-sm md:text-base font-bold text-(--text-primary) mb-0.5 line-clamp-1">{event.title}</h3>
                                        <div className="flex flex-wrap items-center gap-2 md:gap-3 text-[10px] md:text-xs text-(--text-muted)">
                                            <span className="font-mono text-(--ieee-blue) opacity-80">id: {event.id}</span>
                                            {(() => {
                                                const status = getComputedStatus(event);
                                                return (
                                                    <span className={`px-1.5 py-0.5 rounded-lg font-bold ${status === 'Upcoming' ? 'bg-green-500/10 text-green-500' :
                                                        status === 'Closed' ? 'bg-red-500/10 text-red-500' :
                                                            'bg-(--ieee-blue)/10 text-(--ieee-blue)'
                                                        }`}>
                                                        {status}
                                                    </span>
                                                );
                                            })()}
                                            {event.formId && <span className="opacity-60">form: {event.formId}</span>}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-end gap-2 border-t border-(--border-subtle) pt-3 md:pt-0 md:border-0">
                                    <a
                                        href={`/event/${event.id}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-2 text-(--text-muted) hover:text-(--ieee-blue) transition-colors"
                                        title="Open Public Page"
                                    >
                                        <ExternalLink size={18} />
                                    </a>
                                    <button
                                        onClick={() => openModal(event)}
                                        className="p-2 text-(--text-muted) hover:text-(--ieee-blue) transition-colors"
                                    >
                                        <Edit size={18} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(event.id)}
                                        className="p-2 text-(--text-muted) hover:text-red-500 transition-colors"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            <EventModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                event={selectedEvent}
                onSave={handleSave}
            />
        </div>
    );
};

export default EventManager;
