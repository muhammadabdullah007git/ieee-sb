import React, { useState, useEffect, useCallback } from 'react';
import { Mail, Send, Star, Inbox, Trash2, Search, Plus, X, Loader2, CheckCircle, Reply, Globe } from 'lucide-react';
import { FirestoreService } from '../../services/firestore';
import { GAS_API } from '../../services/gas';
import { useToast } from '../../context/ToastContext';

const ComposeModal = ({ isOpen, onClose, onSend }) => {
    const [formData, setFormData] = useState({ to: '', cc: '', bcc: '', subject: '', body: '' });
    const [attachments, setAttachments] = useState([]);
    const [loading, setLoading] = useState(false);
    const { showToast } = useToast();

    if (!isOpen) return null;

    const handleFileChange = async (e) => {
        const files = Array.from(e.target.files);
        const newAttachments = await Promise.all(files.map(async (file) => {
            return new Promise((resolve) => {
                const reader = new FileReader();
                reader.onload = () => resolve({
                    name: file.name,
                    mimeType: file.type,
                    data: reader.result.split(',')[1]
                });
                reader.readAsDataURL(file);
            });
        }));
        setAttachments(prev => [...prev, ...newAttachments]);
    };

    const removeAttachment = (index) => {
        setAttachments(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await onSend({ ...formData, attachments });
            showToast("Message sent successfully!", "success");
            setFormData({ to: '', cc: '', bcc: '', subject: '', body: '' });
            setAttachments([]);
            onClose();
        } catch (error) {
            showToast("Failed to send: " + error.message, "error");
        } finally {
            setLoading(false);
        }
    };

    const inputClasses = "w-full px-4 py-2.5 rounded-xl bg-(--bg-primary) border border-(--border-subtle) focus:ring-2 focus:ring-(--ieee-blue)/20 outline-none text-(--text-primary) transition-all shadow-sm";

    return (
        <div className="fixed inset-0 z-150 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-(--bg-surface) rounded-3xl shadow-lg border border-(--border-subtle) overflow-hidden flex flex-col h-[90vh] w-full max-w-2xl animate-in fade-in zoom-in duration-200">
                <div className="flex items-center gap-4 p-6 border-b border-(--border-subtle) bg-(--bg-secondary)/30">
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
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-(--ieee-blue)/10 text-(--ieee-blue) rounded-xl">
                            <Plus size={20} />
                        </div>
                        <h2 className="text-xl font-bold text-(--text-primary)">Compose Message</h2>
                    </div>
                </div>
                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
                    <div className="space-y-4">
                        <div className="space-y-1">
                            <label className="text-sm font-semibold text-(--text-secondary)">To <span className="text-[10px] font-normal opacity-50 ml-2">(Use commas for multiple addresses)</span></label>
                            <input
                                required
                                type="text"
                                value={formData.to}
                                onChange={(e) => setFormData({ ...formData, to: e.target.value })}
                                className={inputClasses}
                                placeholder="recipient1@example.com, recipient2@example.com"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-sm font-semibold text-(--text-secondary)">CC</label>
                                <input
                                    type="text"
                                    value={formData.cc}
                                    onChange={(e) => setFormData({ ...formData, cc: e.target.value })}
                                    className={inputClasses}
                                    placeholder="cc1@example.com, cc2@example.com"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-semibold text-(--text-secondary)">BCC</label>
                                <input
                                    type="text"
                                    value={formData.bcc}
                                    onChange={(e) => setFormData({ ...formData, bcc: e.target.value })}
                                    className={inputClasses}
                                    placeholder="bcc1@example.com, bcc2@example.com"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-semibold text-(--text-secondary)">Subject</label>
                        <input
                            required
                            type="text"
                            value={formData.subject}
                            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                            className={`${inputClasses} font-medium`}
                            placeholder="Email Subject"
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-sm font-semibold text-(--text-secondary)">Message Body <span className="text-xs font-normal opacity-50 ml-2">(HTML supported)</span></label>
                        <textarea
                            required
                            rows="10"
                            value={formData.body}
                            onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl bg-(--bg-primary) border border-(--border-subtle) focus:ring-2 focus:ring-(--ieee-blue)/20 outline-none text-(--text-primary) resize-none font-mono text-sm leading-relaxed"
                            placeholder="Write your email here... <p>HTML tags are allowed</p>"
                        ></textarea>
                    </div>

                    <div className="space-y-3">
                        <label className="text-sm font-semibold text-(--text-secondary) flex items-center gap-2">
                            Attachments <span className="px-1.5 py-0.5 bg-(--bg-secondary) rounded text-[10px]">{attachments.length}</span>
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {attachments.map((file, idx) => (
                                <div key={idx} className="flex items-center gap-2 px-3 py-1.5 bg-(--ieee-blue)/10 text-(--ieee-blue) rounded-lg text-xs border border-(--ieee-blue)/10 group animate-in zoom-in-95 duration-200">
                                    <Globe size={12} className="opacity-50" />
                                    <span className="max-w-[120px] truncate">{file.name}</span>
                                    <button type="button" onClick={() => removeAttachment(idx)} className="hover:text-red-500 transition-colors">
                                        <X size={14} />
                                    </button>
                                </div>
                            ))}
                            <label className="cursor-pointer flex items-center gap-2 px-4 py-1.5 bg-(--bg-secondary) hover:bg-(--bg-secondary)/80 text-(--text-secondary) rounded-lg text-xs border border-dashed border-(--border-subtle) transition-all">
                                <Plus size={14} /> Add Files
                                <input type="file" multiple className="hidden" onChange={handleFileChange} />
                            </label>
                        </div>
                    </div>
                </form>
                <div className="p-6 border-t border-(--border-subtle) flex justify-between items-center bg-(--bg-secondary)/30">
                    <button type="button" onClick={onClose} className="px-5 py-2.5 text-(--text-secondary) font-bold hover:text-(--text-primary) transition-colors">Cancel</button>
                    <button type="button" onClick={handleSubmit} disabled={loading} className="flex items-center gap-2 px-8 py-2.5 bg-(--ieee-blue) text-white rounded-xl hover:bg-(--ieee-dark-blue) transition-all font-bold disabled:opacity-50 shadow-lg shadow-(--ieee-blue)/20 active:scale-95">
                        {loading ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
                        Send
                    </button>
                </div>
            </div>
        </div>
    );
};

const MailCenter = () => {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedEmail, setSelectedEmail] = useState(null);
    const [isComposeOpen, setIsComposeOpen] = useState(false);
    const [replyMode, setReplyMode] = useState(false);
    const [replyBody, setReplyBody] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const { showToast, confirmAction } = useToast();

    const fetchMessages = useCallback(async () => {
        setLoading(true);
        try {
            // Fetch from Firestore (Contact Form)
            let processedFirestore = [];
            try {
                const firestoreMsgs = await FirestoreService.getCollection('messages');
                if (firestoreMsgs) {
                    processedFirestore = firestoreMsgs.map(m => ({
                        ...m,
                        type: 'contact',
                        from: `${m.name || 'Anonymous'} <${m.email || 'No email'}>`,
                        isGmail: false,
                        snippet: m.message || ''
                    }));
                }
            } catch (fsErr) {
                console.error("Firestore fetch failed:", fsErr);
                showToast("Could not load contact messages", "warning");
            }

            // Fetch from Gmail (via GAS)
            let gmailMsgs = [];
            try {
                const gmailResponse = await GAS_API.getInbox(50);
                if (gmailResponse && gmailResponse.messages) {
                    gmailMsgs = gmailResponse.messages;
                } else if (gmailResponse && Array.isArray(gmailResponse)) {
                    gmailMsgs = gmailResponse;
                }
            } catch (err) {
                console.error("Gmail fetch failed:", err);
                showToast("Gmail sync failed. Check GAS deployment.", "info");
            }

            // Combine and sort
            const combined = [...processedFirestore, ...gmailMsgs].sort((a, b) => {
                const dateA = a.timestamp ? new Date(a.timestamp) : new Date(0);
                const dateB = b.timestamp ? new Date(b.timestamp) : new Date(0);
                return dateB - dateA;
            });
            setMessages(combined);
        } catch (error) {
            console.error("Error fetching messages:", error);
            showToast("Failed to initialize inbox", "error");
        } finally {
            setLoading(false);
        }
    }, [showToast]);

    useEffect(() => {
        fetchMessages();
    }, [fetchMessages]);

    const handleSelectEmail = async (email) => {
        setSelectedEmail(email);
        setReplyMode(false);
        if (!email.isGmail && !email.read) {
            try {
                await FirestoreService.updateDocument('messages', email.id, { read: true });
                setMessages(prev => prev.map(m => m.id === email.id ? { ...m, read: true } : m));
            } catch (err) {
                console.error("Update read status failed:", err);
            }
        }
    };

    const handleSendEmail = async ({ to, subject, body, cc, bcc, attachments }) => {
        await GAS_API.sendEmail(to, subject, body, cc, bcc, attachments);
    };

    const handleSendReply = async () => {
        if (!replyBody.trim()) return;
        try {
            const recipient = selectedEmail.isGmail ? selectedEmail.from.match(/<(.+)>/)?.[1] || selectedEmail.from : selectedEmail.email;
            await GAS_API.sendEmail(recipient, `Re: ${selectedEmail.subject}`, replyBody);
            showToast("Reply sent successfully!", "success");
            setReplyMode(false);
            setReplyBody('');
        } catch {
            showToast("Failed to send reply", "error");
        }
    };

    const handleDelete = async (email) => {
        confirmAction({
            title: 'Delete Message',
            message: 'Are you sure you want to delete this message? This only removes it from this view for contact form submissions.',
            onConfirm: async () => {
                try {
                    if (!email.isGmail) {
                        await FirestoreService.deleteDocument('messages', email.id);
                        setMessages(prev => prev.filter(m => m.id !== email.id));
                        showToast("Message deleted", "success");
                    } else {
                        showToast("Gmail deletion is not supported in this view. Please use Gmail.", "info");
                    }
                    if (selectedEmail?.id === email.id) setSelectedEmail(null);
                } catch {
                    showToast("Delete failed", "error");
                }
            }
        });
    };

    const filteredMessages = messages.filter(m =>
        m.from?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.subject?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.snippet?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="h-[calc(100vh-8rem)] bg-(--bg-surface) rounded-2xl shadow-sm border border-(--border-subtle) flex overflow-hidden relative">
            {/* Sidebar List - Hidden on mobile if email selected */}
            <div className={`w-full md:w-80 border-r border-(--border-subtle) flex flex-col absolute md:relative inset-0 bg-(--bg-surface) z-10 transition-transform duration-300 ${selectedEmail ? '-translate-x-full md:translate-x-0' : 'translate-x-0'}`}>
                <div className="p-4 border-b border-(--border-subtle) space-y-4 bg-(--bg-secondary)/20">
                    <button
                        onClick={() => setIsComposeOpen(true)}
                        className="flex items-center justify-center bg-(--ieee-blue) text-white hover:bg-(--ieee-dark-blue) transition-colors shadow-lg md:shadow-none font-bold fixed bottom-6 right-6 z-100 w-14 h-14 rounded-2xl md:static md:w-full md:h-auto md:rounded-xl md:py-2.5 md:gap-2"
                    >
                        <Plus size={24} className="md:w-[18px] md:h-[18px]" />
                        <span className="hidden md:inline">Compose</span>
                    </button>
                    <div className="relative">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-(--text-muted)" />
                        <input
                            type="text"
                            placeholder="Search inboxes..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 bg-(--bg-primary) rounded-lg text-sm border border-(--border-subtle) outline-hidden focus:ring-2 focus:ring-(--ieee-blue)/20 text-(--text-primary)"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="animate-spin text-(--ieee-blue)" size={24} />
                        </div>
                    ) : filteredMessages.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-(--text-muted) bg-(--bg-surface) rounded-xl border border-dashed border-(--border-subtle)">
                            <FileText size={40} className="mb-4 opacity-20" />
                            <p>No messages in this folder</p>
                        </div>
                    ) : (
                        filteredMessages.map((msg) => (
                            <div
                                key={msg.id}
                                onClick={() => handleSelectEmail(msg)}
                                className={`p-4 rounded-xl cursor-pointer transition-all border ${selectedEmail?.id === msg.id
                                    ? 'bg-(--ieee-blue)/5 border-(--ieee-blue)/20'
                                    : msg.read
                                        ? 'bg-(--bg-secondary)/50 border-(--border-subtle) opacity-70'
                                        : 'bg-(--bg-surface) border-(--border-subtle) shadow-sm'
                                    }`}
                            >
                                <div className="flex justify-between items-start mb-1">
                                    <div className="flex flex-col truncate max-w-[150px]">
                                        <div className="flex items-center gap-2">
                                            <span className={`text-sm text-(--text-primary) truncate ${(!msg.isGmail && !msg.read) || (msg.isGmail && msg.unread) ? 'font-bold' : 'font-medium'}`}>
                                                {msg.name || msg.from.split(' <')[0]}
                                            </span>
                                            {msg.isGmail ? (
                                                <div className="p-1 rounded bg-red-500/10 text-red-500" title="Gmail Inbox">
                                                    <Mail size={10} />
                                                </div>
                                            ) : (
                                                <div className="p-1 rounded bg-(--ieee-blue)/10 text-(--ieee-blue)" title="Contact Form">
                                                    <Globe size={10} />
                                                </div>
                                            )}
                                        </div>
                                        <span className="text-[10px] text-(--text-muted) truncate font-medium opacity-70">
                                            {msg.email || msg.from.match(/<(.+)>/)?.[1] || msg.from}
                                        </span>
                                    </div>
                                    <span className="text-[10px] text-(--text-muted) bg-(--bg-secondary) px-1.5 py-0.5 rounded shrink-0">
                                        {new Date(msg.timestamp).toLocaleDateString()}
                                    </span>
                                </div>
                                <div className={`text-xs text-(--text-secondary) mb-1 truncate ${(!msg.isGmail && !msg.read) || (msg.isGmail && msg.unread) ? 'font-bold' : ''}`}>
                                    {msg.subject}
                                </div>
                                <div className="text-[10px] text-(--text-muted) truncate opacity-60">
                                    {msg.snippet}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Email View - Slide in on mobile */}
            <div className={`flex-1 flex flex-col absolute md:relative inset-0 z-20 bg-(--bg-surface) transition-transform duration-300 ${selectedEmail ? 'translate-x-0' : 'translate-x-full md:translate-x-0'}`}>
                {selectedEmail ? (
                    <>
                        <div className="p-4 md:p-6 border-b border-(--border-subtle) bg-(--bg-surface) flex justify-between items-start gap-4">
                            <div className="flex-1 flex items-start gap-3">
                                <button
                                    onClick={() => setSelectedEmail(null)}
                                    className="md:hidden p-2 -ml-2 text-(--text-muted) hover:text-(--text-primary)"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
                                </button>
                                <div>
                                    <h2 className="text-lg md:text-xl font-bold text-(--text-primary) mb-2 md:mb-3 line-clamp-2">{selectedEmail.subject}</h2>
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shadow-md ${selectedEmail.isGmail ? 'bg-linear-to-br from-red-500 to-orange-500' : 'bg-linear-to-br from-blue-500 to-cyan-500'}`}>
                                            {(selectedEmail.name || selectedEmail.from)[0].toUpperCase()}
                                        </div>
                                        <div>
                                            <div className="text-sm font-bold text-(--text-primary)">{selectedEmail.name || selectedEmail.from.split(' <')[0]}</div>
                                            <div className="text-xs text-(--text-muted) font-medium">{(selectedEmail.email || selectedEmail.from.match(/<(.+)>/)?.[1] || selectedEmail.from)}</div>
                                            <div className="text-[10px] text-(--text-muted) flex items-center gap-2 mt-1">
                                                {selectedEmail.isGmail ? 'via Gmail' : 'via Website Contact'}
                                                <span className="w-1 h-1 rounded-full bg-(--border-subtle)"></span>
                                                {new Date(selectedEmail.timestamp).toLocaleString()}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button className="p-2 text-(--text-muted) hover:text-yellow-500 transition-colors"><Star size={20} /></button>
                                    <button onClick={() => handleDelete(selectedEmail)} className="p-2 text-(--text-muted) hover:text-red-500 transition-colors"><Trash2 size={20} /></button>
                                </div>
                            </div>
                        </div> {/* Added missing closing div here */}

                        <div className="p-8 flex-1 overflow-y-auto text-(--text-primary) leading-relaxed bg-(--bg-surface) m-4 rounded-2xl shadow-sm border border-(--border-subtle)">
                            <div className="whitespace-pre-wrap text-sm sm:text-base">
                                {selectedEmail.isGmail ? selectedEmail.snippet + "..." : selectedEmail.message}
                                {selectedEmail.isGmail && (
                                    <div className="mt-4 p-4 bg-(--bg-secondary)/50 rounded-xl text-xs text-(--text-muted) italic">
                                        Note: This is a thread preview. For full conversation management, please visit your Gmail inbox.
                                    </div>
                                )}
                            </div>

                            {replyMode && (
                                <div className="mt-8 pt-8 border-t border-(--border-subtle) animate-in slide-in-from-bottom-4 duration-300">
                                    <div className="flex items-center gap-2 mb-4 text-sm text-(--text-secondary) font-medium">
                                        <Reply size={16} /> Replying to {selectedEmail.from}
                                    </div>
                                    <textarea
                                        className="w-full p-4 bg-(--bg-primary) border border-(--border-subtle) rounded-2xl focus:ring-2 focus:ring-(--ieee-blue)/20 outline-none text-(--text-primary) resize-none shadow-inner"
                                        rows="6"
                                        placeholder="Type your reply..."
                                        value={replyBody}
                                        onChange={(e) => setReplyBody(e.target.value)}
                                    ></textarea>
                                    <div className="mt-4 flex justify-between gap-3">
                                        <button type="button" onClick={() => setReplyMode(false)} className="px-4 py-2 text-(--text-muted) font-medium hover:text-(--text-primary)">Cancel</button>
                                        <button type="button" onClick={handleSendReply} className="px-6 py-2 bg-(--ieee-blue) text-white rounded-xl font-bold hover:bg-(--ieee-dark-blue) transition-all shadow-lg shadow-(--ieee-blue)/25 active:scale-95">Send Reply</button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {!replyMode && (
                            <div className="p-4 border-t border-(--border-subtle) bg-(--bg-surface)">
                                <div className="flex gap-4">
                                    <button
                                        onClick={() => setReplyMode(true)}
                                        className="px-6 py-3 bg-(--bg-secondary) text-(--text-primary) rounded-2xl text-sm font-bold hover:bg-(--bg-secondary)/80 transition-all flex items-center gap-2 active:scale-95"
                                    >
                                        <Reply size={18} /> Reply
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-(--text-muted)">
                        <div className="w-24 h-24 rounded-3xl bg-(--bg-secondary) flex items-center justify-center mb-6 shadow-inner">
                            <Inbox size={48} strokeWidth={1.5} />
                        </div>
                        <h3 className="text-lg font-bold text-(--text-primary)">Unified Inbox</h3>
                        <p className="text-sm mt-1 mb-8">Select a message to read or reply</p>
                        <div className="flex gap-4 opacity-50 grayscale hover:grayscale-0 transition-all">
                            <div className="flex items-center gap-2 px-3 py-1 bg-(--bg-surface) rounded-lg border border-(--border-subtle) shadow-sm">
                                <Mail size={14} className="text-red-500" /> <span className="text-xs font-medium">Gmail</span>
                            </div>
                            <div className="flex items-center gap-2 px-3 py-1 bg-(--bg-surface) rounded-lg border border-(--border-subtle) shadow-sm">
                                <Globe size={14} className="text-(--ieee-blue)" /> <span className="text-xs font-medium">Website</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <ComposeModal
                isOpen={isComposeOpen}
                onClose={() => setIsComposeOpen(false)}
                onSend={handleSendEmail}
            />
        </div>
    );
};

export default MailCenter;
