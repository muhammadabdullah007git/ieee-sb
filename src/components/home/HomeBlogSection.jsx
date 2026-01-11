import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FirestoreService } from '../../services/firestore';
import { ArrowRight, Calendar, User, FileText } from 'lucide-react';
import { motion } from 'framer-motion';
import { getDirectDriveLink } from '../../lib/utils';

const HomeBlogSection = () => {
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBlogs = async () => {
            try {
                const data = await FirestoreService.getCollection('blogs');
                // Sort by date descending (assuming simple string sort or parsing if dependent on format)
                // Since date is "MMM DD, YYYY", string sort might not work perfect but let's try to parse
                // Actually, let's just reverse distinct adds since ID is time based?
                // ID is mmhhddMMyy, which is roughly chronological if year is last. 
                // Let's rely on createdAt if available or just take the last 3 added (which usually come first in fetches if not sorted?)
                // Actually Firestore default order is ID/Doc ref.
                // Let's just slice first 3 for now, or sort by id descending (newest first).

                const sorted = data.sort((a, b) => {
                    // Try to parse ID if it is time based number string
                    if (a.id && b.id && !isNaN(a.id) && !isNaN(b.id)) {
                        return Number(b.id) - Number(a.id);
                    }
                    return 0;
                });

                setBlogs(sorted.slice(0, 3));
            } catch (error) {
                console.error("Error fetching home blogs:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchBlogs();
    }, []);

    if (loading) return null; // content pop-in is fine, or skeleton

    return (
        <section className="py-20 px-4 bg-(--bg-primary) relative overflow-hidden">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="max-w-7xl mx-auto"
            >
                <div className="flex flax-col md:flex-row items-center justify-between mb-12 gap-4">
                    <div>
                        <span className="text-(--ieee-blue) font-semibold tracking-wider text-sm uppercase">Insights & News</span>
                        <h2 className="text-3xl md:text-5xl font-bold text-(--text-primary) mt-2">
                            Latest Updates
                        </h2>
                    </div>
                    <Link to="/blog" className="hidden md:flex items-center gap-2 px-6 py-3 rounded-full bg-(--bg-surface) border border-(--border-subtle) text-(--text-primary) hover:border-(--ieee-blue) hover:text-(--ieee-blue) transition-all group">
                        View All Posts
                        <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {blogs.map((blog, idx) => (
                        <motion.div
                            key={blog.id}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: idx * 0.1 }}
                        >
                            <Link to={`/blog/${blog.id}`} className="group flex flex-col h-full">
                                <article className="relative bg-(--bg-surface) rounded-2xl overflow-hidden border border-(--border-subtle) shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300 flex flex-col h-full">
                                    <div className="h-48 overflow-hidden relative">
                                        {blog.image ? (
                                            <img src={getDirectDriveLink(blog.image)} alt={blog.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                        ) : (
                                            <div className="w-full h-full bg-(--bg-secondary) flex items-center justify-center text-(--text-muted)">
                                                <FileText size={48} opacity={0.5} />
                                            </div>
                                        )}
                                        <div className="absolute top-4 left-4">
                                            <span className="px-3 py-1 rounded-full bg-black/50 backdrop-blur text-white text-xs font-medium">
                                                {Array.isArray(blog.tags) ? blog.tags[0] : (blog.category || 'General')}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="p-6 flex flex-col flex-1">
                                        <div className="flex items-center gap-3 text-xs text-(--text-muted) mb-3">
                                            <span className="flex items-center gap-1"><Calendar size={12} /> {blog.date}</span>
                                            <span>•</span>
                                            <span className="flex items-center gap-1"><User size={12} /> {blog.author}</span>
                                        </div>
                                        <h3 className="text-xl font-bold text-(--text-primary) mb-3 line-clamp-2 leading-tight group-hover:text-(--ieee-blue) transition-colors">
                                            {blog.title}
                                        </h3>
                                        <p className="text-(--text-secondary) text-sm line-clamp-3 mb-4 flex-1">
                                            {blog.content ? blog.content.replace(/[#*`]/g, '').slice(0, 150) + '...' : 'Click to read more...'}
                                        </p>
                                        <div className="mt-auto pt-4 border-t border-(--border-subtle) flex items-center text-(--ieee-blue) text-sm font-medium">
                                            Read Article <ArrowRight size={16} className="ml-2 group-hover:bg-blue-50" />
                                        </div>
                                    </div>
                                </article>
                            </Link>
                        </motion.div>
                    ))}
                </div>

                <div className="mt-8 flex justify-center md:hidden">
                    <Link to="/blog" className="flex items-center gap-2 px-6 py-3 rounded-full bg-(--bg-surface) border border-(--border-subtle) text-(--text-primary) hover:border-(--ieee-blue) hover:text-(--ieee-blue) transition-all">
                        View All Posts <ArrowRight size={18} />
                    </Link>
                </div>
            </motion.div>
        </section>
    );
};

export default HomeBlogSection;
