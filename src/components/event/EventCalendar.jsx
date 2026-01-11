import React, { useState } from 'react';
import {
    format,
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    eachDayOfInterval,
    isSameMonth,
    isSameDay,
    addMonths,
    subMonths,
    parseISO,
    isToday
} from 'date-fns';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Info } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
    return twMerge(clsx(inputs));
}

const EventCalendar = ({ events, onEventClick }) => {
    const [currentMonth, setCurrentMonth] = useState(new Date());

    const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
    const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const calendarDays = eachDayOfInterval({
        start: startDate,
        end: endDate,
    });

    const getEventsForDay = (day) => {
        return events.filter(event => {
            if (!event.date) return false;
            try {
                // Assuming event.date is a string like "2026-02-15" or ISO
                return isSameDay(parseISO(event.date), day);
            } catch (e) {
                return false;
            }
        });
    };

    return (
        <div className="bg-(--bg-surface) rounded-2xl shadow-(--shadow-sm) border border-(--border-subtle) overflow-hidden transition-all duration-300">
            {/* Calendar Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-(--border-subtle) bg-(--bg-primary)/30">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-(--ieee-blue)/10 rounded-lg text-(--ieee-blue)">
                        <CalendarIcon size={20} />
                    </div>
                    <h2 className="text-xl font-bold text-(--text-primary)">
                        {format(currentMonth, 'MMMM yyyy')}
                    </h2>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={prevMonth}
                        className="p-2 hover:bg-(--bg-secondary) rounded-lg text-(--text-secondary) transition-colors"
                    >
                        <ChevronLeft size={20} />
                    </button>
                    <button
                        onClick={() => setCurrentMonth(new Date())}
                        className="px-3 py-1 text-sm font-medium text-(--ieee-blue) hover:bg-(--ieee-blue)/10 rounded-lg transition-colors"
                    >
                        Today
                    </button>
                    <button
                        onClick={nextMonth}
                        className="p-2 hover:bg-(--bg-secondary) rounded-lg text-(--text-secondary) transition-colors"
                    >
                        <ChevronRight size={20} />
                    </button>
                </div>
            </div>

            {/* Days of Week */}
            <div className="grid grid-cols-7 border-b border-(--border-subtle) bg-(--bg-primary)/10">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                    <div key={day} className="py-3 text-center text-xs font-bold text-(--text-muted) uppercase tracking-wider">
                        {day}
                    </div>
                ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7">
                {calendarDays.map((day, idx) => {
                    const dayEvents = getEventsForDay(day);
                    const isSelectedMonth = isSameMonth(day, monthStart);

                    return (
                        <div
                            key={day.toString()}
                            className={cn(
                                "min-h-[100px] p-2 border-b border-r border-(--border-subtle) transition-colors relative",
                                !isSelectedMonth && "bg-(--bg-secondary)/50",
                                isToday(day) && "bg-(--ieee-blue)/5"
                            )}
                        >
                            <div className="flex justify-between items-start mb-1">
                                <span className={cn(
                                    "text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full",
                                    !isSelectedMonth ? "text-(--text-muted)" : "text-(--text-primary)",
                                    isToday(day) && "bg-(--ieee-blue) text-white font-bold"
                                )}>
                                    {format(day, 'd')}
                                </span>
                            </div>

                            <div className="space-y-1 overflow-y-auto max-h-[80px] custom-scrollbar">
                                {dayEvents.map(event => (
                                    <button
                                        key={event.id}
                                        onClick={() => onEventClick(event)}
                                        className="w-full text-left px-2 py-1 text-[10px] leading-tight font-medium rounded-md bg-(--ieee-blue)/10 text-(--ieee-blue) hover:bg-(--ieee-blue) hover:text-white transition-all line-clamp-1 border border-(--ieee-blue)/20 shadow-xs"
                                        title={event.title}
                                    >
                                        {event.title}
                                    </button>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Legend / Footer */}
            <div className="px-6 py-3 bg-(--bg-secondary)/10 text-[10px] text-(--text-muted) flex items-center gap-4">
                <div className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-(--ieee-blue)"></span>
                    <span>Events Scheduled</span>
                </div>
                <div className="flex items-center gap-1">
                    <Info size={12} />
                    <span>Click an event for details</span>
                </div>
            </div>
        </div>
    );
};

export default EventCalendar;
