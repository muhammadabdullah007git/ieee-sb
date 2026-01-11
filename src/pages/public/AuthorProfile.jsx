import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FirestoreService } from '../../services/firestore';
import BlogCard from '../../components/blog/BlogCard';
import PaperCard from '../../components/paper/PaperCard';
import { User, FileText, BookOpen, Loader2, ArrowLeft, Grid, List } from 'lucide-react';
import { cn } from '../../lib/utils';

const AuthorProfile = () => {
    const { authorName } = useParams();
    const decodedAuthorName = decodeURIComponent(authorName);

    const [blogs, setBlogs] = useState([]);
    const [papers, setPapers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [displayAuthorName, setDisplayAuthorName] = useState(decodedAuthorName);
    const [activeTab, setActiveTab] = useState('all'); // 'all', 'blogs', 'papers'

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // Fetch all blogs and papers
                // Note: Ideally we would have 'where' queries, but for now we filter client-side 
                // if the author field is a simple string in the DB and might vary slightly.
                // However, FirestoreService.getCollectionWhere can be used if exact match is expected.

                const [allBlogs, allPapers] = await Promise.all([
                    FirestoreService.getCollection('blogs'),
                    FirestoreService.getCollection('papers')
                ]);

                // Find author metadata if it's an email
                let authorDisplayName = decodedAuthorName;
                const isEmail = decodedAuthorName.includes('@');

                if (isEmail) {
                    const matchedUser = await FirestoreService.getCollectionWhere('users', 'email', '==', decodedAuthorName);
                    if (matchedUser.length > 0) {
                        authorDisplayName = matchedUser[0].displayName || matchedUser[0].name || decodedAuthorName;
                    }
                }

                // Filter by author email or name
                const authorBlogs = allBlogs.filter(b => {
                    if (isEmail) {
                        return b.authorEmail === decodedAuthorName || (b.author && b.author.toLowerCase() === authorDisplayName.toLowerCase());
                    }
                    return b.author && b.author.toLowerCase() === decodedAuthorName.toLowerCase();
                });

                const authorPapers = allPapers.filter(p => {
                    if (isEmail) {
                        return p.authorEmail === decodedAuthorName || (p.author && p.author.toLowerCase() === authorDisplayName.toLowerCase());
                    }
                    return p.author && p.author.toLowerCase() === decodedAuthorName.toLowerCase();
                });

                setDisplayAuthorName(authorDisplayName);
                setBlogs(authorBlogs);
                setPapers(authorPapers);
            } catch (error) {
                console.error("Error fetching author data:", error);
            } finally {
                setLoading(false);
            }
        };

        if (decodedAuthorName) {
            fetchData();
        }
    }, [decodedAuthorName]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-(--bg-primary)">
                <Loader2 className="animate-spin text-(--ieee-blue)" size={40} />
            </div>
        );
    }

    const totalWorks = blogs.length + papers.length;

    return (
        <div className="min-h-screen bg-(--bg-primary) pb-20 transition-colors duration-300">
            {/* Header */}
            <div className="relative bg-slate-900 py-20 px-4 mb-8">
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute inset-0 bg-linear-to-b from-transparent to-(--bg-primary)"></div>
                    <div className="absolute -top-[50%] -right-[10%] w-[50%] h-[150%] bg-blue-500/10 blur-[100px] rounded-full"></div>
                </div>

                <div className="relative max-w-5xl mx-auto flex flex-col items-center text-center">
                    <Link to="/" className="absolute top-0 left-0 text-white/60 hover:text-white flex items-center gap-2 transition-colors">
                        <ArrowLeft size={20} /> Home
                    </Link>

                    <div className="w-24 h-24 rounded-full bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white shadow-xl ring-4 ring-white/10 mb-6">
                        <User size={48} />
                    </div>

                    <h1 className="text-xl font-bold text-white mb-4">
                        {displayAuthorName}
                    </h1>

                    <div className="flex items-center gap-6 text-white/80">
                        <div className="flex items-center gap-2">
                            <BookOpen size={18} />
                            <span className="font-medium">{blogs.length} Blogs</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <FileText size={18} />
                            <span className="font-medium">{papers.length} Papers</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Tabs */}
            <div className="max-w-6xl mx-auto px-4">
                <div className="flex justify-center mb-8 border-b border-(--border-subtle)">
                    <button
                        onClick={() => setActiveTab('all')}
                        className={cn(
                            "px-6 py-3 font-medium transition-all relative",
                            activeTab === 'all'
                                ? "text-(--ieee-blue)"
                                : "text-(--text-secondary) hover:text-(--text-primary)"
                        )}
                    >
                        All Works ({totalWorks})
                        {activeTab === 'all' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-(--ieee-blue)"></span>}
                    </button>
                    <button
                        onClick={() => setActiveTab('blogs')}
                        className={cn(
                            "px-6 py-3 font-medium transition-all relative",
                            activeTab === 'blogs'
                                ? "text-(--ieee-blue)"
                                : "text-(--text-secondary) hover:text-(--text-primary)"
                        )}
                    >
                        Blogs ({blogs.length})
                        {activeTab === 'blogs' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-(--ieee-blue)"></span>}
                    </button>
                    <button
                        onClick={() => setActiveTab('papers')}
                        className={cn(
                            "px-6 py-3 font-medium transition-all relative",
                            activeTab === 'papers'
                                ? "text-(--ieee-blue)"
                                : "text-(--text-secondary) hover:text-(--text-primary)"
                        )}
                    >
                        Papers ({papers.length})
                        {activeTab === 'papers' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-(--ieee-blue)"></span>}
                    </button>
                </div>

                {/* Results */}
                <div className="space-y-12">
                    {/* Blogs Section */}
                    {(activeTab === 'all' || activeTab === 'blogs') && blogs.length > 0 && (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                            {activeTab === 'all' && (
                                <h2 className="text-2xl font-bold text-(--text-primary) mb-6 flex items-center gap-2">
                                    <BookOpen className="text-blue-500" /> Recent Blogs
                                </h2>
                            )}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {blogs.map(blog => (
                                    <BlogCard key={blog.id} blog={blog} />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Papers Section */}
                    {(activeTab === 'all' || activeTab === 'papers') && papers.length > 0 && (
                        <div className="animate-in fade-in slide-in-from-bottom-8 duration-500 delay-100">
                            {activeTab === 'all' && (
                                <h2 className="text-2xl font-bold text-(--text-primary) mb-6 flex items-center gap-2">
                                    <FileText className="text-purple-500" /> Research Papers
                                </h2>
                            )}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
                                {papers.map(paper => (
                                    <PaperCard key={paper.id} paper={paper} />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Empty State */}
                    {totalWorks === 0 && (
                        <div className="text-center py-20 text-(--text-muted)">
                            <User size={64} className="mx-auto mb-4 opacity-20" />
                            <h3 className="text-xl font-bold mb-2">No works found</h3>
                            <p>This author hasn't published any blogs or papers yet.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AuthorProfile;
