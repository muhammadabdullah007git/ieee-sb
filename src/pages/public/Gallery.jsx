import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FirestoreService } from '../../services/firestore';
import { GAS_API } from '../../services/gas';
import {
    Image as ImageIcon,
    ArrowLeft,
    Loader2,
    ExternalLink,
    LayoutGrid,
    Calendar,
    ChevronLeft,
    ChevronRight,
    X
} from 'lucide-react';
import { getDirectDriveLink } from '../../lib/utils';

const Gallery = () => {
    const { id } = useParams();
    const [events, setEvents] = useState([]);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [photos, setPhotos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [photosLoading, setPhotosLoading] = useState(false);
    const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(null);

    // Fetch all events that have a gallery
    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const data = await FirestoreService.getCollection('events');
                const galleryEvents = data.filter(e => e.galleryFolderId);
                setEvents(galleryEvents);

                if (id) {
                    const event = data.find(e => e.id === id);
                    if (event && event.galleryFolderId) {
                        setSelectedEvent(event);
                        fetchPhotos(event.galleryFolderId);
                    }
                }
            } catch (error) {
                console.error("Error fetching gallery events:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchEvents();
    }, [id]);

    const fetchPhotos = async (folderId) => {
        setPhotosLoading(true);
        try {
            // We use the GAS API to list files in the folder
            const result = await GAS_API.listFiles(folderId);
            setPhotos(result?.files || []);
        } catch (error) {
            console.error("Error fetching photos:", error);
            setPhotos([]);
        } finally {
            setPhotosLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-(--bg-secondary) flex items-center justify-center">
                <Loader2 className="animate-spin text-(--ieee-blue)" size={48} />
            </div>
        );
    }

    // Detail View (Single Event Gallery)
    if (id && selectedEvent) {
        return (
            <div className="min-h-screen bg-(--bg-secondary) py-12 px-4 transition-colors duration-300">
                <div className="max-w-7xl mx-auto">
                    {/* Breadcrumbs / Header */}
                    <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 animate-in fade-in slide-in-from-left-4 duration-500">
                        <div>
                            <Link to="/gallery" className="inline-flex items-center gap-2 text-sm text-(--text-secondary) hover:text-(--ieee-blue) transition-colors mb-4 group">
                                <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" />
                                Back to Media Center
                            </Link>
                            <h1 className="text-3xl font-bold text-(--text-primary) flex items-center gap-3">
                                <ImageIcon className="text-(--ieee-blue)" />
                                {selectedEvent.title} Gallery
                            </h1>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="px-3 py-1 bg-(--ieee-blue)/10 text-(--ieee-blue) border border-(--ieee-blue)/20 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                                <Calendar size={14} />
                                {selectedEvent.startDate}
                            </span>
                        </div>
                    </div>

                    {/* Photos Grid */}
                    {photosLoading ? (
                        <div className="flex flex-col items-center justify-center py-24 space-y-4">
                            <Loader2 className="animate-spin text-(--ieee-blue)" size={40} />
                            <p className="text-(--text-secondary) text-sm animate-pulse">Fetching memories from Google Drive...</p>
                        </div>
                    ) : photos.length === 0 ? (
                        <div className="bg-(--bg-surface) rounded-2xl border border-dashed border-(--border-subtle) p-24 text-center">
                            <ImageIcon className="mx-auto text-(--text-muted) mb-4" size={48} />
                            <h3 className="text-xl font-bold text-(--text-primary) mb-2">No photos found yet</h3>
                            <p className="text-(--text-secondary)">Check back soon for event highlights!</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 animate-in fade-in zoom-in-95 duration-500">
                            {photos.map((photo, index) => (
                                <div
                                    key={photo.id}
                                    onClick={() => setSelectedPhotoIndex(index)}
                                    className="aspect-square bg-(--bg-surface) rounded-xl border border-(--border-subtle) overflow-hidden group cursor-pointer hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300"
                                >
                                    <img
                                        src={getDirectDriveLink(photo.id)}
                                        alt={photo.name}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                        loading="lazy"
                                    />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                                        <LayoutGrid className="text-white" size={24} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Lightbox */}
                {selectedPhotoIndex !== null && (
                    <div className="fixed inset-0 z-200 bg-black/95 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300">
                        <button
                            className="absolute top-6 right-6 p-3 text-white/70 hover:text-white transition-colors"
                            onClick={() => setSelectedPhotoIndex(null)}
                        >
                            <X size={32} />
                        </button>

                        <button
                            className="absolute left-6 top-1/2 -translate-y-1/2 p-4 text-white/50 hover:text-white transition-all hover:scale-125 disabled:opacity-20"
                            onClick={() => setSelectedPhotoIndex(prev => prev - 1)}
                            disabled={selectedPhotoIndex === 0}
                        >
                            <ChevronLeft size={48} />
                        </button>

                        <div className="max-w-5xl w-full h-full flex flex-col items-center justify-center p-4">
                            <img
                                src={getDirectDriveLink(photos[selectedPhotoIndex].id)}
                                alt={photos[selectedPhotoIndex].name}
                                className="max-w-full max-h-[85vh] object-contain shadow-2xl rounded-lg animate-in zoom-in-90 duration-300"
                            />
                            <div className="mt-6 text-center text-white">
                                <p className="text-lg font-medium">{photos[selectedPhotoIndex].name}</p>
                                <p className="text-sm text-gray-400 mt-1">{selectedPhotoIndex + 1} of {photos.length}</p>
                            </div>
                        </div>

                        <button
                            className="absolute right-6 top-1/2 -translate-y-1/2 p-4 text-white/50 hover:text-white transition-all hover:scale-125 disabled:opacity-20"
                            onClick={() => setSelectedPhotoIndex(prev => prev + 1)}
                            disabled={selectedPhotoIndex === photos.length - 1}
                        >
                            <ChevronRight size={48} />
                        </button>
                    </div>
                )}
            </div>
        );
    }

    // List View (All Galleries)
    return (
        <div className="min-h-screen bg-(--bg-secondary) py-12 px-4 transition-colors duration-300">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-16 animate-in fade-in slide-in-from-top-4 duration-700">
                    <h1 className="text-4xl md:text-5xl font-black text-(--text-primary) mb-4">
                        Media <span className="text-(--ieee-blue)">Center</span>
                    </h1>
                    <p className="text-(--text-secondary) max-w-2xl mx-auto text-lg">
                        Relive the best moments from IEEE {'<NAME>'} Student Branch events and workshops.
                    </p>
                </div>

                {events.length === 0 ? (
                    <div className="bg-(--bg-surface) rounded-3xl border border-(--border-subtle) p-24 text-center max-w-4xl mx-auto">
                        <ImageIcon className="mx-auto text-(--text-muted) mb-6" size={64} />
                        <h2 className="text-2xl font-bold text-(--text-primary) mb-3">The gallery is currently being curated</h2>
                        <p className="text-(--text-secondary)">We're gathering all the photos. Come back soon to see the highlights!</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        {events.map((event) => (
                            <Link
                                to={`/gallery/${event.id}`}
                                key={event.id}
                                className="bg-(--bg-surface) rounded-3xl border border-(--border-subtle) overflow-hidden group hover:shadow-2xl hover:shadow-blue-500/10 hover:-translate-y-1 transition-all duration-300"
                            >
                                <div className="relative h-56 overflow-hidden">
                                    <img
                                        src={getDirectDriveLink(event.image)}
                                        alt={event.title}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                    />
                                    <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent opacity-60"></div>
                                    <div className="absolute bottom-4 left-4 right-4">
                                        <div className="flex items-center gap-2 text-white/90 text-xs font-bold uppercase tracking-widest mb-1">
                                            <Calendar size={14} />
                                            {event.startDate}
                                        </div>
                                        <h3 className="text-white text-xl font-bold line-clamp-2">{event.title}</h3>
                                    </div>
                                    <div className="absolute top-4 right-4 p-2 bg-white/20 backdrop-blur-md rounded-full text-white transform scale-0 group-hover:scale-100 transition-transform duration-300">
                                        <ExternalLink size={20} />
                                    </div>
                                </div>
                                <div className="p-6">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-(--text-secondary) flex items-center gap-2 font-medium">
                                            <LayoutGrid size={16} />
                                            View Collection
                                        </span>
                                        <div className="w-8 h-8 rounded-full bg-(--ieee-blue)/10 flex items-center justify-center text-(--ieee-blue) group-hover:bg-(--ieee-blue) group-hover:text-white transition-colors">
                                            <ChevronRight size={18} />
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Gallery;
