import React, { useState, useEffect } from 'react';
import { Users, FileText, Calendar, MessageSquare } from 'lucide-react';
import { FirestoreService } from '../../services/firestore';
import { Link } from 'react-router-dom';

const Stats = () => {
    const [counts, setCounts] = useState({
        members: '0',
        papers: '0',
        events: '0',
        blogs: '0'
    });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                // Fetch collection lengths for events, papers, blogs, and panel members
                const [events, papers, blogs, panels] = await Promise.all([
                    FirestoreService.getCollection('events'),
                    FirestoreService.getCollection('papers'),
                    FirestoreService.getCollection('blogs'),
                    FirestoreService.getCollection('panel')
                ]);

                setCounts({
                    members: panels.length.toString(),
                    papers: papers.length.toString(),
                    events: events.length.toString(),
                    blogs: blogs.length.toString()
                });
            } catch (e) {
                console.error("Failed to load stats", e);
            }
        };
        fetchStats();
    }, []);

    const stats = [
        { label: 'Active Members', value: counts.members, icon: Users, path: '/' },
        { label: 'Research Papers', value: counts.papers, icon: FileText, path: '/papers' },
        { label: 'Events Hosted', value: counts.events, icon: Calendar, path: '/events' },
        { label: 'Blog Posts', value: counts.blogs, icon: MessageSquare, path: '/blog' },
    ];

    return (
        <section className="py-16 bg-(--bg-secondary) transition-colors duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                    {stats.map((stat) => (
                        <Link
                            key={stat.label}
                            to={stat.path}
                            className="group block text-center p-8 rounded-3xl bg-(--bg-surface) shadow-(--shadow-sm) border border-(--border-subtle) hover:shadow-(--shadow-md) hover:border-blue-500/30 transition-all duration-300 transform hover:-translate-y-1"
                        >
                            <div className="flex justify-center mb-6">
                                <div className="p-4 rounded-2xl bg-(--bg-secondary) text-(--ieee-blue) group-hover:bg-(--ieee-blue) group-hover:text-white transition-colors duration-300">
                                    <stat.icon size={32} />
                                </div>
                            </div>
                            <div className="text-4xl font-extrabold text-(--text-primary) mb-2">
                                {stat.value}
                            </div>
                            <div className="text-xs font-bold text-(--text-muted) uppercase tracking-widest group-hover:text-(--ieee-blue) transition-colors">
                                {stat.label}
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Stats;
