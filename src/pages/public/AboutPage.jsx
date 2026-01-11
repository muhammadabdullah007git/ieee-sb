import React from 'react';
import About from '../../components/home/About';

const AboutPage = () => {
    return (
        <div className="pt-20">
            <About />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center text-(--text-secondary)">
                <p>More information about our branch history and committee members will be updated here soon.</p>
            </div>
        </div>
    );
};

export default AboutPage;
