import React from 'react';
import EventList from '../../components/event/EventList';

const Event = () => {
    return (
        <div className="min-h-screen bg-(--bg-secondary) py-12 transition-colors duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                <EventList />
            </div>
        </div>
    );
};

export default Event;

