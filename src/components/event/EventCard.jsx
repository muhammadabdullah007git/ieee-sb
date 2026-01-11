import React from 'react';
import { Calendar, MapPin, Clock, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getDirectDriveLink } from '../../lib/utils';

const EventCard = ({ event }) => {
    return (
        <Link
            to={`/event/${event.id}`}
            className="group relative bg-(--bg-surface) rounded-2xl overflow-hidden shadow-(--shadow-sm) hover:shadow-(--shadow-xl) transition-all border border-(--border-subtle) flex flex-col h-[300px]"
        >
            {/* Image Thumbnail */}
            <div className="absolute inset-0 z-0">
                {event.image ? (
                    <img
                        src={getDirectDriveLink(event.image)}
                        alt={event.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                ) : (
                    <div className="w-full h-full bg-linear-to-br from-(--ieee-blue)/10 to-(--ieee-dark-blue)/5 flex items-center justify-center">
                        <span className="text-4xl font-bold text-(--ieee-blue)/20 font-mono">IEEE</span>
                    </div>
                )}
                {/* Overlay */}
                <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent transition-opacity opacity-80 group-hover:opacity-90" />
            </div>

            {/* Content */}
            <div className="relative z-10 p-6 mt-auto flex flex-col gap-2">
                <div className="flex items-center justify-between">
                    <span className={`px-2 py-0.5 rounded-lg text-[10px] uppercase font-bold tracking-wider ${event.status === 'Upcoming' ? 'bg-green-500 text-white' :
                        event.status === 'Past' ? 'bg-red-500 text-white' :
                            'bg-blue-500 text-white'
                        }`}>
                        {event.status}
                    </span>
                </div>

                <h3 className="text-xl font-bold text-white group-hover:text-(--ieee-blue) transition-colors line-clamp-2">
                    {event.title}
                </h3>

                <div className="flex items-center gap-2 text-white/60 text-sm font-medium pt-2 border-t border-white/10 opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0">
                    <span>View Event Details</span>
                    <ArrowRight size={16} />
                </div>
            </div>
        </Link>
    );
};

export default EventCard;
