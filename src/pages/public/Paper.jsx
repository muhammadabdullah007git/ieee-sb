import React from 'react';
import PaperList from '../../components/paper/PaperList';

const Paper = () => {
    return (
        <div className="min-h-screen bg-(--bg-secondary) py-12 transition-colors duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                <PaperList />
            </div>
        </div>
    );
};

export default Paper;

