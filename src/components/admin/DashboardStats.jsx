import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, FileText, Calendar, MessageSquare, Loader2, Heart, MessageCircle } from 'lucide-react';
import { FirestoreService } from '../../services/firestore';
import { cn } from '../../lib/utils';

// eslint-disable-next-line no-unused-vars
const StatCard = ({ title, value, change, icon: IconComponent, loading, to }) => {
    const content = (
        <div className="bg-(--bg-surface) p-4 md:p-5 rounded-xl shadow-(--shadow-sm) border border-(--border-subtle) transition-all hover:shadow-(--shadow-md) group h-full">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-xs font-semibold text-(--text-secondary) uppercase tracking-wider">{title}</p>
                    {loading ? (
                        <div className="mt-2 h-7 w-16 bg-(--bg-secondary) animate-pulse rounded-lg" />
                    ) : (
                        <p className="text-xl md:text-2xl font-bold text-(--text-primary) mt-0.5">{value}</p>
                    )}
                </div>
                <div className="p-2.5 rounded-lg bg-(--bg-secondary) text-(--ieee-blue) group-hover:bg-(--ieee-blue) group-hover:text-white transition-all duration-300">
                    <IconComponent size={18} />
                </div>
            </div>
            {!loading && (
                <div className="mt-3 flex items-center text-[10px] md:text-xs">
                    <span className="text-green-500 font-bold">{change}</span>
                    <span className="text-(--text-muted) ml-1.5">vs last month</span>
                </div>
            )}
        </div>
    );

    if (to && !loading) {
        return <Link to={to} className="block">{content}</Link>;
    }

    return content;
};

const DashboardStats = () => {
    const [stats, setStats] = useState({
        members: 0,
        events: 0,
        papers: 0,
        blogs: 0,
        reactions: 0,
        comments: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            setLoading(true);
            try {
                const [panels, events, analytics] = await Promise.all([
                    FirestoreService.getCollection('panel'),
                    FirestoreService.getCollection('events'),
                    FirestoreService.getAnalyticsData()
                ]);

                setStats({
                    members: panels.length,
                    events: events.length,
                    papers: analytics.totals.papers,
                    blogs: analytics.totals.blogs,
                    reactions: analytics.totals.reactions,
                    comments: analytics.totals.comments
                });
            } catch (error) {
                console.error("Error fetching dashboard stats:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <StatCard
                title="Total Members"
                value={stats.members}
                change="+0%"
                icon={Users}
                loading={loading}
                to="/admin/panel"
            />
            <StatCard
                title="Active Events"
                value={stats.events}
                change="+0"
                icon={Calendar}
                loading={loading}
                to="/admin/events"
            />
            <StatCard
                title="Papers"
                value={stats.papers}
                change="+0"
                icon={FileText}
                loading={loading}
                to="/admin/papers"
            />
            <StatCard
                title="Blogs"
                value={stats.blogs}
                change="+0"
                icon={MessageSquare}
                loading={loading}
                to="/admin/blogs"
            />
            <StatCard
                title="Reactions"
                value={stats.reactions}
                change="+0"
                icon={Heart}
                loading={loading}
            />
            <StatCard
                title="Comments"
                value={stats.comments}
                change="+0"
                icon={MessageCircle}
                loading={loading}
            />
        </div>
    );
};

export default DashboardStats;
