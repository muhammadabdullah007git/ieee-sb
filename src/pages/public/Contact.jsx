import React from 'react';
import ContactForm from '../../components/contact/ContactForm';

const Contact = () => {
    return (
        <div className="min-h-screen bg-(--bg-secondary) py-12 lg:py-20 transition-colors duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <ContactForm />
            </div>
        </div>
    );
};

export default Contact;

