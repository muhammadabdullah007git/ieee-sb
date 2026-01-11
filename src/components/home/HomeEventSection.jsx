import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FirestoreService } from '../../services/firestore';
import { ArrowRight, MapPin, Clock, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';
import { getDirectDriveLink } from '../../lib/utils';

const HomeEventSection = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const data = await FirestoreService.getCollection('events');

                // Filter for upcoming events
                const now = new Date();
                now.setHours(0, 0, 0, 0); // Start of today

                const upcoming = data.filter(event => {
                    const eventDate = new Date(event.date); // "Nov 20, 2024" parses correctly
                    return eventDate >= now;
                });

                // Sort by date ascending (soonest first)
                upcoming.sort((a, b) => new Date(a.date) - new Date(b.date));

                setEvents(upcoming.slice(0, 3));
            } catch (error) {
                console.error("Error fetching home events:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchEvents();
    }, []);

    if (loading) return null;
    if (events.length === 0) return null; // Hide section if no upcoming events

    return (
        <section className="py-20 px-4 bg-(--bg-secondary)/30 relative">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="max-w-7xl mx-auto"
            >
                <div className="flex flax-col md:flex-row items-center justify-between mb-12 gap-4">
                    <div>
                        <span className="text-(--ieee-blue) font-semibold tracking-wider text-sm uppercase">Mark Your Calendar</span>
                        <h2 className="text-3xl md:text-5xl font-bold text-(--text-primary) mt-2">
                            Upcoming Events
                        </h2>
                    </div>
                    <Link to="/events" className="hidden md:flex items-center gap-2 px-6 py-3 rounded-full bg-(--bg-surface) border border-(--border-subtle) text-(--text-primary) hover:border-(--ieee-blue) hover:text-(--ieee-blue) transition-all group">
                        See All Events
                        <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {events.map((event, idx) => {
                        const dateObj = new Date(event.date);
                        const month = dateObj.toLocaleString('default', { month: 'short' });
                        const day = dateObj.getDate();

                        return (
                            <motion.div
                                key={event.id}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: idx * 0.1 }}
                            >
                                <Link to={`/event/${event.id}`} className="group relative bg-(--bg-surface) rounded-2xl overflow-hidden border border-(--border-subtle) shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300 flex flex-col">
                                    <div className="h-48 overflow-hidden relative">
                                        {event.image ? (
                                            <img src={getDirectDriveLink(event.image)} alt={event.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                        ) : (
                                            <div className="w-full h-full bg-(--bg-secondary) flex items-center justify-center text-(--text-muted)">
                                                <Calendar size={48} opacity={0.5} />
                                            </div>
                                        )}
                                        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md rounded-xl p-2 text-center min-w-[60px] shadow-lg">
                                            <div className="text-xs font-bold text-red-500 uppercase tracking-widest">{month}</div>
                                            <div className="text-2xl font-black text-gray-900">{day}</div>
                                        </div>
                                    </div>

                                    <div className="p-6 flex flex-col flex-1">
                                        <h3 className="text-xl font-bold text-(--text-primary) mb-3 line-clamp-2 leading-tight group-hover:text-(--ieee-blue) transition-colors">
                                            {event.title}
                                        </h3>

                                        <div className="space-y-2 mb-6">
                                            <div className="flex items-center gap-2 text-sm text-(--text-secondary)">
                                                <Clock size={16} className="text-(--ieee-blue)" />
                                                <span>{event.time || 'TBA'}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm text-(--text-secondary)">
                                                <MapPin size={16} className="text-(--ieee-blue)" />
                                                <span className="truncate">{event.location || 'TBA'}</span>
                                            </div>
                                        </div>

                                        <div className="mt-auto">
                                            <span className="w-full block py-3 text-center rounded-lg bg-(--bg-secondary) text-(--text-primary) font-semibold group-hover:bg-(--ieee-blue) group-hover:text-white transition-colors">
                                                Event Details
                                            </span>
                                        </div>
                                    </div>
                                </Link>
                            </motion.div>
                        );
                    })}
                </div>

                <div className="mt-8 flex justify-center md:hidden">
                    <Link to="/events" className="flex items-center gap-2 px-6 py-3 rounded-full bg-(--bg-surface) border border-(--border-subtle) text-(--text-primary) hover:border-(--ieee-blue) hover:text-(--ieee-blue) transition-all">
                        See All Events <ArrowRight size={18} />
                    </Link>
                </div>
            </motion.div>
        </section>
    );
};

export default HomeEventSection;
