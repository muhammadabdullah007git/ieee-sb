import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FirestoreService } from '../../services/firestore';
import { Loader2, ArrowLeft, AlertCircle, ExternalLink, Lock, Users, ArrowRight } from 'lucide-react';
import { getDirectDriveLink } from '../../lib/utils';
import { useAdmin } from '../../context/AdminContext';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypeHighlight from 'rehype-highlight';

const EventDetail = () => {
    const { id } = useParams();
    const { profile } = useAdmin();
    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [permission, setPermission] = useState(null); // null: checking, true: granted, false: denied
    const [guestEmail, setGuestEmail] = useState('');
    const [accessError, setAccessError] = useState('');
    const [gasConfig, setGasConfig] = useState(null);
    const containerRef = useRef(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [eventData, configData] = await Promise.all([
                    FirestoreService.getDocument('events', id),
                    FirestoreService.getGasConfig()
                ]);

                if (eventData) {
                    setEvent(eventData);
                } else {
                    setError('Event not found');
                }

                if (configData) {
                    setGasConfig(configData);
                }
            } catch (err) {
                console.error("Error fetching data:", err);
                setError('Failed to load event details');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id]);

    useEffect(() => {
        // Only trigger code injection if it's NOT a Google Form event type (i.e. 'custom' or legacy)
        if (event && (event.type === 'custom' || !event.type) && event.customCode && containerRef.current) {
            // Clear existing content
            containerRef.current.innerHTML = '';

            // Create a temporary element to parse the HTML
            const parser = new DOMParser();
            const doc = parser.parseFromString(event.customCode, 'text/html');

            // Extract and inject non-script elements
            const fragments = document.createDocumentFragment();
            Array.from(doc.body.childNodes).forEach(node => {
                if (node.tagName !== 'SCRIPT') {
                    fragments.appendChild(node.cloneNode(true));
                }
            });
            Array.from(doc.head.childNodes).forEach(node => {
                if (node.tagName !== 'SCRIPT') {
                    fragments.appendChild(node.cloneNode(true));
                }
            });

            containerRef.current.appendChild(fragments);

            // Extract and execute scripts
            const scripts = Array.from(doc.querySelectorAll('script'));
            scripts.forEach(oldScript => {
                const newScript = document.createElement('script');
                Array.from(oldScript.attributes).forEach(attr => {
                    newScript.setAttribute(attr.name, attr.value);
                });
                newScript.appendChild(document.createTextNode(oldScript.innerHTML));
                document.body.appendChild(newScript);

                // Cleanup script tag on unmount if needed, but usually scripts are global
            });
        }
    }, [event]);

    // Permission Check Effect
    useEffect(() => {
        if (!event) return;

        if (event.visibility === 'private') {
            const allowed = Array.isArray(event.allowedEmails) ? event.allowedEmails : [];
            // Check logged in user
            if (profile?.email && allowed.includes(profile.email.toLowerCase())) {
                setPermission(true);
            } else {
                setPermission(false);
            }
        } else {
            // Public or undefined (legacy)
            setPermission(true);
        }
    }, [event, profile]);

    const handleGuestAccess = (e) => {
        e.preventDefault();
        if (!guestEmail) return;

        const email = guestEmail.trim().toLowerCase();
        const allowed = Array.isArray(event.allowedEmails) ? event.allowedEmails : [];

        if (allowed.includes(email)) {
            setPermission(true);
            setAccessError('');
        } else {
            setAccessError('Access denied. This email is not on the guest list.');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-(--bg-primary)">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-12 h-12 text-(--ieee-blue) animate-spin" />
                    <p className="text-(--text-secondary) font-medium animate-pulse">Loading experience...</p>
                </div>
            </div>
        );
    }

    if (error || !event) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-(--bg-primary) p-4">
                <div className="max-w-md w-full text-center space-y-6 animate-in fade-in zoom-in duration-300">
                    <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto text-red-500">
                        <AlertCircle size={40} />
                    </div>
                    <h1 className="text-3xl font-bold text-(--text-primary)">Oops!</h1>
                    <p className="text-(--text-secondary)">{error || 'The event you are looking for might have moved or been deleted.'}</p>
                    <Link
                        to="/events"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-(--ieee-blue) text-white rounded-xl font-bold hover:bg-(--ieee-dark-blue) transition-all active:scale-95"
                    >
                        <ArrowLeft size={18} />
                        Back to Events
                    </Link>
                </div>
            </div>
        );
    }

    // Access Gate UI
    if (permission === false) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-(--bg-primary) p-4">
                <div className="bg-(--bg-surface) rounded-2xl shadow-xl w-full max-w-md p-8 border border-(--border-subtle) animate-in fade-in zoom-in duration-300">
                    <div className="text-center space-y-4">
                        <div className="w-16 h-16 bg-(--ieee-blue)/10 rounded-full flex items-center justify-center mx-auto text-(--ieee-blue)">
                            <Lock size={32} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-(--text-primary)">Private Event</h2>
                            <p className="text-(--text-secondary) mt-1">This event is visible to invited guests only.</p>
                        </div>

                        <form onSubmit={handleGuestAccess} className="pt-4 space-y-4 text-left">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-(--text-secondary)">Enter your email to verify access</label>
                                <input
                                    type="email"
                                    required
                                    value={guestEmail}
                                    onChange={(e) => setGuestEmail(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl bg-(--bg-primary) border border-(--border-subtle) focus:ring-2 focus:ring-(--ieee-blue)/20 outline-none text-(--text-primary)"
                                    placeholder="name@example.com"
                                />
                                {accessError && <p className="text-sm text-red-500 font-medium animate-in slide-in-from-top-1">{accessError}</p>}
                            </div>
                            <button
                                type="submit"
                                className="w-full bg-(--ieee-blue) text-white py-3 rounded-xl font-bold hover:bg-(--ieee-dark-blue) transition-colors flex items-center justify-center gap-2"
                            >
                                Verify Email <ArrowRight size={18} />
                            </button>
                        </form>

                        <div className="pt-4 border-t border-(--border-subtle)">
                            <Link to="/events" className="text-sm text-(--text-muted) hover:text-(--text-primary) transition-colors inline-flex items-center gap-1">
                                <ArrowLeft size={14} /> Back to Events
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Helper for status auto-detection
    const getComputedStatus = (event) => {
        if (!event.startDate || !event.endDate) return event.status || 'Upcoming';
        const today = new Date().toISOString().split('T')[0];
        if (today > event.endDate) return 'Closed';
        if (today < event.startDate) return 'Upcoming';
        return 'Ongoing';
    };

    const ensureAbsoluteUrl = (url) => {
        if (!url) return '';
        if (url.startsWith('http://') || url.startsWith('https://')) return url;
        return `https://${url}`;
    };

    const status = getComputedStatus(event);

    // Configured / Structured Event Template
    if (event.type === 'configured' || event.type === 'google_form') {
        return (
            <div className="min-h-screen bg-(--bg-primary) pb-20">
                {/* Hero / Banner Area */}
                <div className="relative h-[40vh] md:h-[60vh] w-full bg-slate-900">
                    {event.image ? (
                        <img
                            src={getDirectDriveLink(event.image)}
                            alt={event.title}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-(--ieee-blue)/20">
                            <span className="text-4xl font-bold text-(--ieee-blue)/40">EVENT BANNER</span>
                        </div>
                    )}
                    <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/40 to-transparent"></div>

                    <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-12 max-w-5xl mx-auto w-full">
                        <Link to="/events" className="absolute top-6 left-6 md:left-12 inline-flex items-center gap-2 text-white/80 hover:text-white transition-colors font-medium bg-black/30 backdrop-blur-md px-4 py-2 rounded-full">
                            <ArrowLeft size={18} /> Back to Events
                        </Link>

                        <div className="space-y-4 animate-in slide-in-from-bottom-8 duration-700">
                            <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${status === 'Upcoming' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                                status === 'Closed' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                                    'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                                }`}>
                                {status}
                            </span>
                            <h1 className="text-4xl md:text-6xl font-black text-white leading-tight drop-shadow-xl">{event.title}</h1>
                            {event.startDate && event.endDate && (
                                <p className="text-white/80 font-medium">
                                    {new Date(event.startDate).toLocaleDateString()} - {new Date(event.endDate).toLocaleDateString()}
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                <div className="max-w-4xl mx-auto px-6 -mt-10 relative z-10">
                    {/* Content Box */}
                    <div className="bg-(--bg-surface) rounded-2xl shadow-xl border border-(--border-subtle) p-8 md:p-10 space-y-8">
                        {/* Video / Stream Player */}
                        {(event.videoUrl || (event.visibility === 'private' && (event.gasVideoUrl || gasConfig?.gas_url_video))) && (
                            <div className="w-full aspect-video bg-black rounded-xl overflow-hidden shadow-lg mb-8">
                                <iframe
                                    src={(() => {
                                        const url = event.videoUrl || (event.visibility === 'private' ? (event.gasVideoUrl || gasConfig?.gas_url_video) : '');
                                        // Simple YouTube Embed Logic
                                        if (url && (url.includes('youtube.com/watch?v=') || url.includes('youtu.be/'))) {
                                            const videoId = url.split('v=')[1].split('&')[0];
                                            return `https://www.youtube.com/embed/${videoId}`;
                                        } else if (url.includes('youtu.be/')) {
                                            const videoId = url.split('youtu.be/')[1].split('?')[0];
                                            return `https://www.youtube.com/embed/${videoId}`;
                                        }
                                        return url;
                                    })()}
                                    title="Event Video"
                                    className="w-full h-full"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                ></iframe>
                            </div>
                        )}

                        {/* Event Info (Markdown) */}
                        <div className="markdown-body transition-colors duration-300 text-(--text-primary)">
                            <ReactMarkdown
                                remarkPlugins={[remarkGfm, remarkMath]}
                                rehypePlugins={[rehypeKatex, rehypeHighlight]}
                                components={{
                                    // Override default element styling if needed
                                    p: ({ node, ...props }) => <p className="mb-4 leading-relaxed text-lg" {...props} />,
                                    h1: ({ node, ...props }) => <h1 className="text-3xl font-bold mb-4 mt-8" {...props} />,
                                    h2: ({ node, ...props }) => <h2 className="text-2xl font-bold mb-3 mt-6" {...props} />,
                                    ul: ({ node, ...props }) => <ul className="list-disc pl-6 mb-4 space-y-2" {...props} />,
                                    li: ({ node, ...props }) => <li className="pl-1" {...props} />,
                                }}
                            >
                                {event.info || '_No additional information provided._'}
                            </ReactMarkdown>
                        </div>

                        {/* Registration Section */}
                        <div className="pt-8 border-t border-(--border-subtle)">
                            {status === 'Closed' ? (
                                <div className="bg-red-500/10 rounded-xl p-8 border border-red-500/20 text-center">
                                    <h3 className="text-xl font-bold text-red-500 mb-2">Registration Closed</h3>
                                    <p className="text-(--text-secondary)">This event has ended and is no longer accepting responses.</p>
                                </div>
                            ) : (
                                <div className="bg-(--bg-secondary)/30 rounded-xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 border border-(--border-subtle)">
                                    <div>
                                        <h3 className="text-xl font-bold text-(--text-primary) mb-2">Ready to participate?</h3>
                                        <p className="text-(--text-secondary)">Ready to proceed? Click below to start.</p>
                                    </div>
                                    {(event.actionUrl || event.googleFormUrl) && (
                                        <a
                                            href={ensureAbsoluteUrl(event.actionUrl || event.googleFormUrl)}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-white shadow-lg transition-all active:scale-95 text-lg bg-(--ieee-blue) hover:bg-(--ieee-dark-blue) shadow-(--ieee-blue)/20"
                                        >
                                            Start
                                            <ExternalLink size={20} />
                                        </a>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Default / Custom Code Injection Fallback
    return (
        <div className="min-h-screen bg-(--bg-primary)">
            {status === 'Closed' && (
                <div className="max-w-4xl mx-auto pt-6 px-4 z-50 relative">
                    <div className="bg-red-500/10 rounded-xl p-6 border border-red-500/20 text-center animate-in slide-in-from-top-4 fade-in duration-500">
                        <h3 className="text-xl font-bold text-red-500 mb-2">Event Closed</h3>
                        <p className="text-(--text-secondary)">This event has ended.</p>
                    </div>
                </div>
            )}

            {/* The container where custom code will be injected */}
            <div ref={containerRef} className="custom-event-container w-full min-h-screen" />

            {/* Hidden fallback/info for SEO or if injection fails */}
            <h1 className="sr-only">{event.title}</h1>
        </div>
    );
};

export default EventDetail;
