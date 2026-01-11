import React, { useState, useEffect } from 'react';
import { MapPin, Mail, Phone, Facebook, Linkedin, Loader2 } from 'lucide-react';
import { FirestoreService } from '../../services/firestore';

const ContactForm = () => {
    const [loading, setLoading] = useState(true);
    const [contactInfo, setContactInfo] = useState({
        heading: '',
        description: '',
        address: '',
        addressLink: '',
        email: '',
        phone: '',
        facebookUrl: '',
        linkedinUrl: '',
    });

    useEffect(() => {
        fetchContactInfo();
    }, []);

    const fetchContactInfo = async () => {
        try {
            const data = await FirestoreService.getDocument('settings', 'contact_info');
            if (data) {
                setContactInfo(data);
            }
        } catch (error) {
            console.error('Error fetching contact info:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="animate-spin text-(--ieee-blue)" size={40} />
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto space-y-12">
            {/* Contact Info Side */}
            <div className="text-center space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="space-y-4 px-4">
                    <h2 className="text-4xl md:text-5xl font-bold text-(--text-primary) mb-4">{contactInfo.heading}</h2>
                    <p className="text-(--text-secondary) leading-relaxed text-lg max-w-2xl mx-auto">
                        {contactInfo.description}
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-8 max-w-lg mx-auto text-left">
                    <div className="flex items-start gap-5 p-6 rounded-2xl bg-(--bg-surface) shadow-(--shadow-sm) border border-(--border-subtle) transition-all hover:shadow-(--shadow-md)">
                        <div className="w-14 h-14 rounded-2xl bg-blue-100 dark:bg-(--bg-secondary) flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
                            <MapPin size={28} />
                        </div>
                        <div>
                            <h3 className="font-bold text-lg text-(--text-primary)">Visit Us</h3>
                            <a
                                href={contactInfo.addressLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-(--text-secondary) text-sm mt-1 leading-relaxed hover:text-(--ieee-blue) transition-colors block whitespace-pre-line"
                            >
                                {contactInfo.address}
                            </a>
                        </div>
                    </div>

                    <div className="flex items-start gap-5 p-6 rounded-2xl bg-(--bg-surface) shadow-(--shadow-sm) border border-(--border-subtle) transition-all hover:shadow-(--shadow-md)">
                        <div className="w-14 h-14 rounded-2xl bg-blue-100 dark:bg-(--bg-secondary) flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
                            <Mail size={28} />
                        </div>
                        <div>
                            <h3 className="font-bold text-lg text-(--text-primary)">Email Us</h3>
                            <a
                                href={`mailto:${contactInfo.email}`}
                                className="text-(--text-secondary) text-sm mt-1 hover:text-(--ieee-blue) transition-colors block"
                            >
                                {contactInfo.email}
                            </a>
                        </div>
                    </div>

                    <div className="flex items-start gap-5 p-6 rounded-2xl bg-(--bg-surface) shadow-(--shadow-sm) border border-(--border-subtle) transition-all hover:shadow-(--shadow-md)">
                        <div className="w-14 h-14 rounded-2xl bg-blue-100 dark:bg-(--bg-secondary) flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
                            <Phone size={28} />
                        </div>
                        <div>
                            <h3 className="font-bold text-lg text-(--text-primary)">Call Us</h3>
                            <a
                                href={`tel:${contactInfo.phone.replace(/\s/g, '')}`}
                                className="text-(--text-secondary) text-sm mt-1 hover:text-(--ieee-blue) transition-colors block"
                            >
                                {contactInfo.phone}
                            </a>
                        </div>
                    </div>
                </div>

                <div className="pt-8 flex flex-col items-center gap-6">
                    <h4 className="font-semibold text-(--text-primary) uppercase tracking-widest text-sm">Follow Our Socials</h4>
                    <div className="flex gap-4">
                        <a
                            href={contactInfo.facebookUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-12 h-12 rounded-lg bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 transition-all hover:scale-110 shadow-lg shadow-blue-500/20"
                        >
                            <Facebook size={24} />
                        </a>
                        <a
                            href={contactInfo.linkedinUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-12 h-12 rounded-lg bg-blue-700 text-white flex items-center justify-center hover:bg-blue-800 transition-all hover:scale-110 shadow-lg shadow-blue-600/20"
                        >
                            <Linkedin size={24} />
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ContactForm;
