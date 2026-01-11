import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FirestoreService } from '../../services/firestore';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { User, FileText, Download, ArrowLeft, Loader2, Calendar, Share2 } from 'lucide-react';
import ReactionSection from '../../components/shared/ReactionSection';
import CommentSection from '../../components/shared/CommentSection';
import ShareModal from '../../components/shared/ShareModal';

const PaperDetail = () => {
    const { id } = useParams();
    const [paper, setPaper] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);

    useEffect(() => {
        const fetchPaper = async () => {
            try {
                const data = await FirestoreService.getDocument('papers', id);
                setPaper(data);
            } catch (error) {
                console.error("Error fetching paper:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchPaper();
    }, [id]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-(--bg-primary)">
                <Loader2 className="animate-spin text-(--ieee-blue)" size={40} />
            </div>
        );
    }

    if (!paper) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <p className="text-(--text-muted) text-lg">Paper not found.</p>
                <Link to="/papers" className="text-(--ieee-blue) hover:underline">
                    Back to Papers
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-(--bg-primary) py-12 px-4">
            <ShareModal
                isOpen={isShareModalOpen}
                onClose={() => setIsShareModalOpen(false)}
                title={paper?.title}
                url={window.location.href}
            />
            <div className="max-w-4xl mx-auto">
                <Link to="/papers" className="inline-flex items-center gap-2 text-(--text-secondary) hover:text-(--ieee-blue) mb-8 transition-colors">
                    <ArrowLeft size={20} /> Back to Papers
                </Link>

                <div className="bg-(--bg-surface) rounded-2xl p-8 md:p-12 shadow-sm border border-(--border-subtle) animate-in fade-in zoom-in duration-300">
                    {/* Header */}
                    <div className="mb-8 border-b border-(--border-subtle) pb-8">
                        <div className="flex items-center gap-3 mb-4">
                            <span className="px-3 py-1 rounded-full bg-(--ieee-blue)/10 text-(--ieee-blue) text-sm font-medium">
                                {paper.category}
                            </span>
                            <span className="text-(--text-muted) flex items-center gap-1 text-sm">
                                <Calendar size={14} /> {paper.date || 'Unknown Date'}
                            </span>
                        </div>
                        <h1 className="text-3xl md:text-4xl font-bold text-(--text-primary) mb-6 leading-tight">
                            {paper.title}
                        </h1>

                        <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-2 text-(--text-secondary)">
                                <User size={18} className="text-(--ieee-blue)" />
                                <Link to={`/author/${encodeURIComponent(paper.author)}`} className="font-medium text-lg hover:underline hover:text-(--ieee-blue) transition-colors">
                                    {paper.author}
                                </Link>
                            </div>
                            <div className="pl-7 text-sm text-(--text-muted)">
                                {paper.department} • {paper.designation}
                            </div>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="space-y-8">
                        {paper.doi && (
                            <div className="bg-(--bg-secondary)/50 p-4 rounded-xl border border-(--border-subtle) flex items-start gap-3">
                                <FileText className="text-(--text-muted) mt-1" size={20} />
                                <div>
                                    <h3 className="text-sm font-bold text-(--text-primary) mb-1">DOI / Reference</h3>
                                    <p className="text-sm font-mono text-(--text-secondary) break-all">{paper.doi}</p>
                                </div>
                            </div>
                        )}

                        <div>
                            <h2 className="text-xl font-bold text-(--text-primary) mb-4">Abstract</h2>
                            <div className="prose prose-invert max-w-none text-(--text-secondary) leading-relaxed text-lg">
                                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                    {paper.description || paper.abstract || 'No abstract available.'}
                                </ReactMarkdown>
                            </div>
                        </div>

                        {paper.downloadUrl ? (
                            <div className="pt-8 mt-8 border-t border-(--border-subtle) flex justify-center">
                                {(!paper.permission || paper.permission === 'Public') ? (
                                    <a
                                        href={paper.downloadUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-3 px-8 py-4 bg-(--ieee-blue) text-white rounded-xl font-bold hover:bg-(--ieee-dark-blue) transition-all shadow-lg hover:shadow-xl hover:-translate-y-1"
                                    >
                                        <Download size={20} />
                                        Read Full Paper
                                    </a>
                                ) : (
                                    <a
                                        href={`mailto:sb.ieee@baiust.edu.bd?subject=Requesting Access to: ${paper.title}&body=Dear Admin,%0D%0A%0D%0AI would like to request access to the research paper titled "${paper.title}".`}
                                        className="flex items-center gap-3 px-8 py-4 bg-gray-600 text-white rounded-xl font-bold hover:bg-gray-700 transition-all shadow-lg hover:shadow-xl hover:-translate-y-1"
                                    >
                                        <FileText size={20} />
                                        Ask for Permission
                                    </a>
                                )}
                            </div>
                        ) : (
                            <div className="pt-8 mt-8 border-t border-(--border-subtle) text-center text-(--text-muted)">
                                Full text not available online.
                            </div>
                        )}
                    </div>
                </div>

                {/* Interactions */}
                <div className="mt-8 bg-(--bg-surface) rounded-2xl p-8 shadow-sm border border-(--border-subtle) animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="flex items-center justify-between border-b border-(--border-subtle) pb-6 mb-6">
                        <ReactionSection parentId={id} />
                        <button
                            onClick={() => setIsShareModalOpen(true)}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-(--bg-secondary) border border-(--border-subtle) text-(--text-secondary) hover:text-(--ieee-blue) hover:border-(--ieee-blue)/30 transition-all font-medium"
                        >
                            <Share2 size={18} />
                            Share
                        </button>
                    </div>
                    <CommentSection parentId={id} />
                </div>
            </div>
        </div>
    );
};

export default PaperDetail;
