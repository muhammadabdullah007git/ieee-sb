import React, { useEffect, useState } from 'react';
import EventCard from './EventCard';
import RegistrationModal from './RegistrationModal';
import Pagination from '../shared/Pagination';
import PublicSearchBar from '../shared/PublicSearchBar';
import { FirestoreService } from '../../services/firestore';
import { Loader2, Calendar as CalendarIcon, LayoutGrid } from 'lucide-react';
import EventCalendar from './EventCalendar';

const EventList = () => {
    const [events, setEvents] = useState([]);
    const [filteredEvents, setFilteredEvents] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [viewMode, setViewMode] = useState('list'); // 'list' or 'calendar'
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const data = await FirestoreService.getCollection('events');
                setEvents(data);
                setFilteredEvents(data);
            } catch (error) {
                console.error("Error fetching events:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchEvents();
    }, []);

    useEffect(() => {
        const query = searchQuery.toLowerCase().trim();
        if (!query) {
            setFilteredEvents(events);
        } else {
            const filtered = events.filter(event =>
                event.title?.toLowerCase().includes(query) ||
                event.description?.toLowerCase().includes(query) ||
                event.location?.toLowerCase().includes(query) ||
                event.category?.toLowerCase().includes(query)
            );
            setFilteredEvents(filtered);
        }
        setCurrentPage(1);
    }, [searchQuery, events]);

    const handleRegister = (event) => {
        setSelectedEvent(event);
        setIsModalOpen(true);
    };

    if (loading) {
        return (
            <div className="flex justify-center py-12">
                <Loader2 className="animate-spin text-blue-600" size={32} />
            </div>
        );
    }

    // Pagination Logic
    const totalPages = Math.ceil(filteredEvents.length / itemsPerPage);
    const currentEvents = filteredEvents.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    return (
        <>
            {/* Search Bar - Centered */}
            <div className="mb-6">
                <PublicSearchBar
                    value={searchQuery}
                    onChange={setSearchQuery}
                    placeholder="Search events by title, location, or sparks..."
                    className="max-w-2xl mx-auto mb-0"
                />
            </div>

            {/* View Toggle - Right Aligned */}
            <div className="flex justify-end mb-8">
                <div className="flex bg-(--bg-primary) p-1 rounded-xl border border-(--border-subtle) shadow-sm">
                    <button
                        onClick={() => setViewMode('list')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${viewMode === 'list'
                            ? 'bg-(--ieee-blue) text-white shadow-md'
                            : 'text-(--text-secondary) hover:bg-(--bg-secondary)'
                            }`}
                    >
                        <LayoutGrid size={18} />
                        List View
                    </button>
                    <button
                        onClick={() => setViewMode('calendar')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${viewMode === 'calendar'
                            ? 'bg-(--ieee-blue) text-white shadow-md'
                            : 'text-(--text-secondary) hover:bg-(--bg-secondary)'
                            }`}
                    >
                        <CalendarIcon size={18} />
                        Calendar
                    </button>
                </div>
            </div>

            {filteredEvents.length === 0 ? (
                <div className="text-center py-12">
                    <p className="text-(--text-muted)">{searchQuery ? "No events match your search." : "Will be added soon."}</p>
                </div>
            ) : viewMode === 'list' ? (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {currentEvents.map((event) => (
                            <EventCard key={event.id} event={event} onRegister={handleRegister} />
                        ))}
                    </div>

                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                    />
                </>
            ) : (
                <div className="max-w-4xl mx-auto">
                    <EventCalendar
                        events={filteredEvents}
                        onEventClick={(event) => {
                            setSelectedEvent(event);
                            setIsModalOpen(true);
                        }}
                    />
                </div>
            )}

            <RegistrationModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                event={selectedEvent}
            />
        </>
    );
};

export default EventList;
