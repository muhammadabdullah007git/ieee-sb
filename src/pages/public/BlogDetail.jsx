import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypeHighlight from 'rehype-highlight';
import { User, Calendar, Clock, ArrowLeft, Loader2, Share2 } from 'lucide-react';
import { FirestoreService } from '../../services/firestore';
import { GAS_API } from '../../services/gas';
import ReactionSection from '../../components/shared/ReactionSection';
import CommentSection from '../../components/shared/CommentSection';
import ShareModal from '../../components/shared/ShareModal';
import { getDirectDriveLink } from '../../lib/utils';

const BlogDetail = () => {
    const { id } = useParams();
    const [blog, setBlog] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);

    useEffect(() => {
        const fetchBlog = async () => {
            try {
                const data = await FirestoreService.getDocument('blogs', id);
                setBlog(data || null);
            } catch (error) {
                console.error("Error fetching blog:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchBlog();
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-(--bg-primary) transition-colors duration-300">
                <Loader2 className="animate-spin text-blue-600" size={40} />
            </div>
        );
    }

    if (!blog) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-(--bg-primary) text-center p-6 transition-colors duration-300">
                <h1 className="text-2xl font-bold text-(--text-primary) mb-4">Blog Post Not Found</h1>
                <Link to="/blog" className="text-blue-600 hover:underline flex items-center gap-2">
                    <ArrowLeft size={18} /> Back to Blog
                </Link>
            </div>
        );
    }

    return (
        <article className="min-h-screen bg-(--bg-primary) pb-20 transition-colors duration-300">
            <ShareModal
                isOpen={isShareModalOpen}
                onClose={() => setIsShareModalOpen(false)}
                title={blog?.title}
                url={window.location.href}
            />
            {/* Header / Hero Area */}
            <div className="relative h-[40vh] md:h-[60vh] w-full mb-12 bg-slate-900">
                {blog.image ? (
                    <img
                        src={getDirectDriveLink(blog.image)}
                        alt={blog.title}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-500 bg-(--bg-secondary)">
                        <span className="text-sm font-bold uppercase tracking-widest">No Cover Image</span>
                    </div>
                )}
                <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/40 to-transparent"></div>
                <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12 max-w-7xl mx-auto">
                    <Link to="/blog" className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-6 transition-colors font-medium">
                        <ArrowLeft size={18} /> Back to Blog
                    </Link>
                    <div className="flex flex-wrap gap-2 mb-4">
                        {blog.tags && Array.isArray(blog.tags) ? (
                            blog.tags.map((tag, index) => (
                                <span key={index} className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-wider backdrop-blur-md border border-blue-500/30">
                                    {tag}
                                </span>
                            ))
                        ) : (
                            <span className="text-blue-400 font-bold uppercase tracking-wider text-sm">
                                {blog.category}
                            </span>
                        )}
                    </div>
                    <h1 className="text-3xl md:text-5xl font-extrabold text-white mb-6 leading-tight max-w-4xl">
                        {blog.title}
                    </h1>
                    <div className="flex flex-wrap items-center gap-6 text-white/70 text-sm md:text-base">
                        <span className="flex items-center gap-2">
                            <User size={18} />
                            <Link to={`/author/${encodeURIComponent(blog.author)}`} className="hover:underline hover:text-white transition-colors">
                                {blog.author}
                            </Link>
                        </span>
                        <span className="flex items-center gap-2">
                            <Calendar size={18} /> {blog.date}
                        </span>
                        {blog.readTime && (
                            <span className="flex items-center gap-2">
                                <Clock size={18} /> {blog.readTime}
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* Content Area */}
            <div className="max-w-4xl mx-auto px-6">
                <div className="markdown-body transition-colors duration-300 text-(--text-primary)">
                    <ReactMarkdown
                        remarkPlugins={[remarkGfm, remarkMath]}
                        rehypePlugins={[rehypeKatex, rehypeHighlight]}
                    >
                        {blog.content}
                    </ReactMarkdown>
                </div>

                {/* Interaction Bars */}
                <div className="mt-12 py-6 border-y border-(--border-subtle) flex items-center justify-between">
                    <ReactionSection parentId={id} />
                    <button
                        onClick={() => setIsShareModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-(--bg-secondary) border border-(--border-subtle) text-(--text-secondary) hover:text-(--ieee-blue) hover:border-(--ieee-blue)/30 transition-all font-medium"
                    >
                        <Share2 size={18} />
                        Share
                    </button>
                </div>

                {/* Discussion Section */}
                <CommentSection parentId={id} />

                <div className="mt-16 pt-8 border-t border-(--border-subtle) flex justify-between items-center transition-colors duration-300">
                    <div className="flex items-center gap-4">
                        <Link to={`/author/${encodeURIComponent(blog.author)}`} className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-(--bg-surface) flex items-center justify-center text-blue-600 dark:text-blue-400 hover:ring-2 hover:ring-blue-500/20 transition-all">
                            <User size={24} />
                        </Link>
                        <div>
                            <p className="font-bold text-(--text-primary)">
                                <Link to={`/author/${encodeURIComponent(blog.author)}`} className="hover:underline hover:text-(--ieee-blue) transition-colors">
                                    {blog.author}
                                </Link>
                            </p>
                            <p className="text-xs text-(--text-muted) uppercase tracking-widest font-semibold">Author</p>
                        </div>
                    </div>
                    <button
                        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                        className="p-3 bg-(--bg-secondary) hover:bg-(--bg-primary) border border-(--border-subtle) rounded-xl transition-all text-(--text-secondary) hover:text-(--ieee-blue) shadow-sm"
                    >
                        Scroll to Top
                    </button>
                </div>
            </div>
        </article>
    );
};

export default BlogDetail;
