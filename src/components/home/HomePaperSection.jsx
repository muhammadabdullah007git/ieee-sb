import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FirestoreService } from '../../services/firestore';
import { ArrowRight, BookOpen, User, GraduationCap, Building2 } from 'lucide-react';
import { motion } from 'framer-motion';

const HomePaperSection = () => {
    const [papers, setPapers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPapers = async () => {
            try {
                // Fetch papers and sort by date descending
                const data = await FirestoreService.getCollection('papers');

                // Papers often have a 'date' field. If ID is mmhhddMMyy, that's also useful.
                const sorted = data.sort((a, b) => {
                    if (a.id && b.id && !isNaN(a.id) && !isNaN(b.id)) {
                        return Number(b.id) - Number(a.id);
                    }
                    return 0;
                });

                setPapers(sorted.slice(0, 3));
            } catch (error) {
                console.error("Error fetching home papers:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchPapers();
    }, []);

    if (loading) return null;
    if (papers.length === 0) return null;

    return (
        <section className="py-20 px-4 bg-(--bg-primary) relative overflow-hidden">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="max-w-7xl mx-auto"
            >
                <div className="flex flex-col md:flex-row items-center justify-between mb-12 gap-4">
                    <div>
                        <span className="text-(--ieee-blue) font-semibold tracking-wider text-sm uppercase">Research & Publications</span>
                        <h2 className="text-3xl md:text-5xl font-bold text-(--text-primary) mt-2">
                            Featured Papers
                        </h2>
                    </div>
                    <Link to="/papers" className="hidden md:flex items-center gap-2 px-6 py-3 rounded-full bg-(--bg-surface) border border-(--border-subtle) text-(--text-primary) hover:border-(--ieee-blue) hover:text-(--ieee-blue) transition-all group">
                        Browse Full Archive
                        <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {papers.map((paper, idx) => (
                        <motion.div
                            key={paper.id}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: idx * 0.1 }}
                        >
                            <Link to={`/paper/${paper.id}`} className="group flex flex-col h-full">
                                <article className="bg-(--bg-surface) p-8 rounded-2xl border border-(--border-subtle) shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300 flex flex-col h-full relative cursor-pointer">
                                    <div className="absolute top-0 left-0 w-1 h-0 group-hover:h-full bg-(--ieee-blue) transition-all duration-300 rounded-l-2xl"></div>

                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="w-12 h-12 rounded-xl bg-(--ieee-blue)/5 flex items-center justify-center text-(--ieee-blue)">
                                            <BookOpen size={24} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="text-xs font-bold text-(--ieee-blue) uppercase tracking-wider truncate mb-1">{paper.category}</div>
                                            <div className="text-[10px] text-(--text-muted) flex items-center gap-1">
                                                <GraduationCap size={10} /> {paper.designation}
                                            </div>
                                        </div>
                                    </div>

                                    <h3 className="text-lg font-bold text-(--text-primary) mb-4 line-clamp-3 leading-snug group-hover:text-(--ieee-blue) transition-colors">
                                        {paper.title}
                                    </h3>

                                    <div className="space-y-3 mb-8">
                                        <div className="flex items-center gap-2 text-sm text-(--text-secondary)">
                                            <User size={14} className="text-(--text-muted)" />
                                            <span className="truncate">{paper.author}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-(--text-secondary)">
                                            <Building2 size={14} className="text-(--text-muted)" />
                                            <span className="truncate">{paper.department}</span>
                                        </div>
                                    </div>

                                    <div className="mt-auto pt-4 border-t border-(--border-subtle) flex items-center justify-between text-sm">
                                        <span className="text-(--text-muted)">{paper.date || 'Archives'}</span>
                                        <span className="flex items-center gap-1 font-bold text-(--ieee-blue)">
                                            Learn More <ArrowRight size={14} />
                                        </span>
                                    </div>
                                </article>
                            </Link>
                        </motion.div>
                    ))}
                </div>

                <div className="mt-10 flex justify-center md:hidden">
                    <Link to="/papers" className="flex items-center gap-2 px-6 py-3 rounded-full bg-(--bg-surface) border border-(--border-subtle) text-(--text-primary) hover:border-(--ieee-blue) hover:text-(--ieee-blue) transition-all">
                        Browse Full Archive <ArrowRight size={18} />
                    </Link>
                </div>
            </motion.div>
        </section>
    );
};

export default HomePaperSection;
