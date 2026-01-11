import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Mail, Linkedin, Globe, MapPin, Phone } from 'lucide-react';
import { FirestoreService } from '../../services/firestore';

const Footer = () => {
    const logoSrc = "/logo.png";
    const [contactInfo, setContactInfo] = useState({
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
            console.error('Error fetching contact info for footer:', error);
        }
    };

    // Format address for footer (shorter version)
    const getShortAddress = () => {
        const lines = contactInfo.address.split('\n');
        return lines[lines.length - 1] || contactInfo.address;
    };

    return (
        <footer className="bg-(--ieee-dark-blue) text-slate-200 pt-16 pb-8 border-t border-slate-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
                    {/* Brand & About */}
                    <div className="space-y-4">
                        {logoSrc && (
                            <img
                                src={logoSrc}
                                alt="IEEE {'<NAME>'} SB Logo"
                                className="h-12 w-auto object-contain brightness-0 invert opacity-90"
                                style={{ display: 'block' }}
                            />
                        )}
                        <h3 className="text-2xl font-bold text-white">
                            IEEE {'<NAME>'} SB
                        </h3>
                        <p className="text-slate-400 text-sm leading-relaxed">
                            Empowering students through technology and innovation. Join us to shape the future of engineering.
                        </p>
                        <div className="flex space-x-4 pt-2">
                            <a href={contactInfo.facebookUrl} target="_blank" rel="noopener noreferrer" className="hover:text-blue-400 transition-colors">
                                <Facebook size={20} />
                            </a>
                            <a href="https://ieee.org" target="_blank" rel="noopener noreferrer" className="hover:text-blue-400 transition-colors">
                                <Globe size={20} />
                            </a>
                            <a href={contactInfo.linkedinUrl} target="_blank" rel="noopener noreferrer" className="hover:text-blue-400 transition-colors">
                                <Linkedin size={20} />
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="text-lg font-semibold text-white mb-6">Quick Links</h4>
                        <ul className="space-y-3">
                            <li><Link to="/papers" className="text-slate-400 hover:text-blue-400 transition-colors">Papers</Link></li>
                            <li><Link to="/events" className="text-slate-400 hover:text-blue-400 transition-colors">Events</Link></li>
                            <li><Link to="/blog" className="text-slate-400 hover:text-blue-400 transition-colors">Blog</Link></li>
                            <li><Link to="/contact" className="text-slate-400 hover:text-blue-400 transition-colors">Contact</Link></li>
                            <li><Link to="/certificate" className="text-slate-400 hover:text-blue-400 transition-colors">Certificate Verification</Link></li>
                        </ul>
                    </div>

                    {/* Resources */}
                    <div>
                        <h4 className="text-lg font-semibold text-white mb-6">Resources</h4>
                        <ul className="space-y-3">
                            <li><a href="https://ieee.org" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-blue-400 transition-colors">IEEE.org</a></li>
                            <li><a href="https://ieeexplore.ieee.org/" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-blue-400 transition-colors">IEEE Xplore</a></li>
                            <li><a href="https://spectrum.ieee.org/" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-blue-400 transition-colors">IEEE Spectrum</a></li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h4 className="text-lg font-semibold text-white mb-6">Contact</h4>
                        <ul className="space-y-4 text-sm text-slate-400">
                            <li className="flex items-start gap-3">
                                <MapPin size={18} className="mt-1 text-blue-400 shrink-0" />
                                <a
                                    href={contactInfo.addressLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="hover:text-white transition-colors"
                                >
                                    {getShortAddress()}
                                </a>
                            </li>
                            <li className="flex items-center gap-3">
                                <Mail size={18} className="text-blue-400 shrink-0" />
                                <a href={`mailto:${contactInfo.email}`} className="hover:text-white transition-colors">{contactInfo.email}</a>
                            </li>
                            <li className="flex items-center gap-3">
                                <Phone size={18} className="text-blue-400 shrink-0" />
                                <a href={`tel:${contactInfo.phone.replace(/\s/g, '')}`} className="hover:text-white transition-colors">{contactInfo.phone}</a>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="mt-16 pt-8 border-t border-white/10 text-center text-slate-500 text-sm">
                    <p>© {new Date().getFullYear()} IEEE {'<NAME>'} Student Branch. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
