import React, { useState, useEffect } from 'react';
import { FirestoreService } from '../../services/firestore';
import { useToast } from '../../context/ToastContext';
import { Save, MapPin, Mail, Phone, Facebook, Linkedin, Loader2 } from 'lucide-react';

const ContactManager = () => {
    const { showToast } = useToast();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
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

    const handleSave = async () => {
        setSaving(true);
        try {
            await FirestoreService.setDocument('settings', 'contact_info', contactInfo);
            showToast('Contact information updated successfully!', 'success');
        } catch (error) {
            console.error('Error saving contact info:', error);
            showToast('Failed to update contact information', 'error');
        } finally {
            setSaving(false);
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
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-(--text-primary)">Contact Page Manager</h1>
                    <p className="text-(--text-secondary) mt-2">Manage contact information displayed on the public contact page</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 px-6 py-3 bg-(--ieee-blue) text-white rounded-xl hover:bg-(--ieee-dark-blue) transition-colors font-bold disabled:opacity-50"
                >
                    {saving ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
                    {saving ? 'Saving...' : 'Save Changes'}
                </button>
            </div>

            {/* Page Content */}
            <div className="bg-(--bg-surface) rounded-2xl border border-(--border-subtle) p-8 space-y-6">
                <div className="space-y-4">
                    <h3 className="text-lg font-bold text-(--text-primary)">Page Header</h3>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-(--text-secondary)">Heading</label>
                        <input
                            type="text"
                            value={contactInfo.heading}
                            onChange={(e) => setContactInfo({ ...contactInfo, heading: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl bg-(--bg-primary) border border-(--border-subtle) focus:ring-2 focus:ring-(--ieee-blue)/20 outline-none text-(--text-primary)"
                            placeholder="Get in Touch"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-(--text-secondary)">Description</label>
                        <textarea
                            value={contactInfo.description}
                            onChange={(e) => setContactInfo({ ...contactInfo, description: e.target.value })}
                            rows={3}
                            className="w-full px-4 py-3 rounded-xl bg-(--bg-primary) border border-(--border-subtle) focus:ring-2 focus:ring-(--ieee-blue)/20 outline-none text-(--text-primary) resize-none"
                            placeholder="Enter page description..."
                        />
                    </div>
                </div>
            </div>

            {/* Contact Details */}
            <div className="bg-(--bg-surface) rounded-2xl border border-(--border-subtle) p-8 space-y-6">
                <h3 className="text-lg font-bold text-(--text-primary)">Contact Information</h3>

                {/* Address */}
                <div className="space-y-4 p-4 bg-(--bg-primary) rounded-xl">
                    <div className="flex items-center gap-2 text-(--ieee-blue)">
                        <MapPin size={20} />
                        <h4 className="font-bold">Address</h4>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-(--text-secondary)">Address Text</label>
                        <textarea
                            value={contactInfo.address}
                            onChange={(e) => setContactInfo({ ...contactInfo, address: e.target.value })}
                            rows={2}
                            className="w-full px-4 py-3 rounded-lg bg-(--bg-surface) border border-(--border-subtle) focus:ring-2 focus:ring-(--ieee-blue)/20 outline-none text-(--text-primary) resize-none"
                            placeholder="Enter address..."
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-(--text-secondary)">Google Maps Link</label>
                        <input
                            type="url"
                            value={contactInfo.addressLink}
                            onChange={(e) => setContactInfo({ ...contactInfo, addressLink: e.target.value })}
                            className="w-full px-4 py-3 rounded-lg bg-(--bg-surface) border border-(--border-subtle) focus:ring-2 focus:ring-(--ieee-blue)/20 outline-none text-(--text-primary)"
                            placeholder="https://maps.app.goo.gl/..."
                        />
                    </div>
                </div>

                {/* Email */}
                <div className="space-y-4 p-4 bg-(--bg-primary) rounded-xl">
                    <div className="flex items-center gap-2 text-(--ieee-blue)">
                        <Mail size={20} />
                        <h4 className="font-bold">Email</h4>
                    </div>
                    <div className="space-y-2">
                        <input
                            type="email"
                            value={contactInfo.email}
                            onChange={(e) => setContactInfo({ ...contactInfo, email: e.target.value })}
                            className="w-full px-4 py-3 rounded-lg bg-(--bg-surface) border border-(--border-subtle) focus:ring-2 focus:ring-(--ieee-blue)/20 outline-none text-(--text-primary)"
                            placeholder="email@example.com"
                        />
                    </div>
                </div>

                {/* Phone */}
                <div className="space-y-4 p-4 bg-(--bg-primary) rounded-xl">
                    <div className="flex items-center gap-2 text-(--ieee-blue)">
                        <Phone size={20} />
                        <h4 className="font-bold">Phone</h4>
                    </div>
                    <div className="space-y-2">
                        <input
                            type="tel"
                            value={contactInfo.phone}
                            onChange={(e) => setContactInfo({ ...contactInfo, phone: e.target.value })}
                            className="w-full px-4 py-3 rounded-lg bg-(--bg-surface) border border-(--border-subtle) focus:ring-2 focus:ring-(--ieee-blue)/20 outline-none text-(--text-primary)"
                            placeholder="+880 1234 567890"
                        />
                    </div>
                </div>
            </div>

            {/* Social Links */}
            <div className="bg-(--bg-surface) rounded-2xl border border-(--border-subtle) p-8 space-y-6">
                <h3 className="text-lg font-bold text-(--text-primary)">Social Media Links</h3>

                {/* Facebook */}
                <div className="space-y-4 p-4 bg-(--bg-primary) rounded-xl">
                    <div className="flex items-center gap-2 text-blue-600">
                        <Facebook size={20} />
                        <h4 className="font-bold">Facebook</h4>
                    </div>
                    <div className="space-y-2">
                        <input
                            type="url"
                            value={contactInfo.facebookUrl}
                            onChange={(e) => setContactInfo({ ...contactInfo, facebookUrl: e.target.value })}
                            className="w-full px-4 py-3 rounded-lg bg-(--bg-surface) border border-(--border-subtle) focus:ring-2 focus:ring-(--ieee-blue)/20 outline-none text-(--text-primary)"
                            placeholder="https://www.facebook.com/..."
                        />
                    </div>
                </div>

                {/* LinkedIn */}
                <div className="space-y-4 p-4 bg-(--bg-primary) rounded-xl">
                    <div className="flex items-center gap-2 text-blue-700">
                        <Linkedin size={20} />
                        <h4 className="font-bold">LinkedIn</h4>
                    </div>
                    <div className="space-y-2">
                        <input
                            type="url"
                            value={contactInfo.linkedinUrl}
                            onChange={(e) => setContactInfo({ ...contactInfo, linkedinUrl: e.target.value })}
                            className="w-full px-4 py-3 rounded-lg bg-(--bg-surface) border border-(--border-subtle) focus:ring-2 focus:ring-(--ieee-blue)/20 outline-none text-(--text-primary)"
                            placeholder="https://www.linkedin.com/company/..."
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ContactManager;
