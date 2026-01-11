import React, { useEffect, useState } from 'react';
import DashboardStats from '../../components/admin/DashboardStats';
import EngagementCharts from '../../components/admin/EngagementCharts';
import { FirestoreService } from '../../services/firestore';
import { Loader2, TrendingUp, MessageSquare, Heart, FileText, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const data = await FirestoreService.getAnalyticsData();
                setAnalytics(data);
            } catch (error) {
                console.error("Error loading analytics:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchAnalytics();
    }, []);

    return (
        <div className="pb-8">
            <div className="mb-6">
                <h1 className="text-xl md:text-2xl font-bold text-(--text-primary)">Dashboard Overview</h1>
                <p className="text-xs md:text-sm text-(--text-secondary)">Welcome back, here's what's happening today.</p>
            </div>

            <DashboardStats />

            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="animate-spin text-(--ieee-blue)" size={40} />
                </div>
            ) : (
                analytics && (
                    <div className="space-y-8 animate-in fade-in duration-500">
                        <EngagementCharts data={analytics} />

                        {/* Leaderboard Section */}
                        <div className="bg-(--bg-surface) rounded-xl border border-(--border-subtle) shadow-sm overflow-hidden">
                            <div className="p-4 md:p-5 border-b border-(--border-subtle) flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <TrendingUp className="text-green-500" size={18} />
                                    <h3 className="text-sm font-bold text-(--text-primary)">Top Content</h3>
                                </div>
                                <span className="text-[10px] text-(--text-muted) uppercase tracking-wider font-bold">Sort: Engagement</span>
                            </div>
                            <div className="divide-y divide-(--border-subtle)">
                                {analytics.topContent.length === 0 ? (
                                    <div className="p-12 text-center text-(--text-muted) italic">
                                        No engagement activity recorded yet.
                                    </div>
                                ) : (
                                    analytics.topContent.map((item) => (
                                        <div key={item.id} className="p-3 md:p-4 hover:bg-(--bg-secondary)/50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 group">
                                            <div className="flex items-center gap-3 flex-1 min-w-0">
                                                <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${item.type === 'Blog' ? 'bg-blue-100 text-blue-600' : 'bg-emerald-100 text-emerald-600'
                                                    }`}>
                                                    {item.type === 'Blog' ? <MessageSquare size={16} /> : <FileText size={16} />}
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <h4 className="font-bold text-(--text-primary) text-xs md:text-sm truncate group-hover:text-(--ieee-blue) transition-colors">{item.title}</h4>
                                                    <p className="text-[9px] text-(--text-muted) uppercase font-bold tracking-widest">{item.type}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between sm:justify-end gap-5 text-xs font-medium shrink-0">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex items-center gap-1.5 text-red-500">
                                                        <Heart size={12} className="fill-current" />
                                                        <span>{item.reactions}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1.5 text-purple-500">
                                                        <MessageSquare size={12} />
                                                        <span>{item.comments}</span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 text-right font-bold text-(--text-primary)">
                                                        {item.engagement}
                                                    </div>
                                                    <Link
                                                        to={item.type === 'Blog' ? `/blog/${item.id}` : `/papers/${item.id}`}
                                                        className="p-2 hover:bg-(--bg-primary) rounded-lg transition-colors text-(--text-muted) hover:text-(--ieee-blue)"
                                                    >
                                                        <ChevronRight size={18} />
                                                    </Link>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                )
            )}
        </div>
    );
};

export default Dashboard;

