import React from 'react';
import { ExternalLink, Calendar, User, FileText, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const PaperCard = ({ paper }) => {
    return (
        <div className="bg-(--bg-surface) rounded-2xl p-6 shadow-(--shadow-sm) hover:shadow-(--shadow-md) transition-all border border-(--border-subtle) flex flex-col h-full group">
            <div className="flex-1">
                <div className="flex items-center gap-2 mb-3">
                    <span className="px-3 py-1 rounded-lg bg-(--bg-secondary) text-(--ieee-blue) text-xs font-medium border border-(--border-subtle)">
                        {paper.category}
                    </span>
                    <span className="text-(--text-muted) text-xs flex items-center gap-1">
                        <Calendar size={12} /> {paper.date}
                    </span>
                </div>

                <Link to={`/paper/${paper.id}`}>
                    <h3 className="text-xl font-bold text-(--text-primary) mb-3 line-clamp-2 group-hover:text-(--ieee-blue) transition-colors">
                        {paper.title}
                    </h3>
                </Link>

                {paper.doi && (
                    <div className="flex items-center gap-1 text-xs text-(--text-muted) mb-3 font-mono bg-(--bg-secondary)/50 px-2 py-1 rounded w-fit">
                        <FileText size={10} />
                        <span className="truncate max-w-[200px]">{paper.doi}</span>
                    </div>
                )}

                <p className="text-(--text-secondary) text-sm mb-4 line-clamp-3">
                    {paper.description || paper.abstract}
                </p>

                <div className="flex flex-col gap-1 mb-4 text-sm text-(--text-muted)">
                    <div className="flex items-center gap-2">
                        <User size={14} className="shrink-0" />
                        <Link
                            to={`/author/${paper.authorEmail || encodeURIComponent(paper.author || paper.authors || '')}`}
                            className="truncate font-medium hover:text-(--ieee-blue) transition-colors"
                        >
                            {paper.author || paper.authors}
                        </Link>
                    </div>
                    {(paper.department || paper.designation) && (
                        <div className="pl-6 text-xs text-(--text-secondary)">
                            {[paper.department, paper.designation].filter(Boolean).join(' • ')}
                        </div>
                    )}
                </div>
            </div>

            <div className="pt-4 border-t border-(--border-subtle) mt-auto flex justify-between items-center">
                <Link
                    to={`/paper/${paper.id}`}
                    className="inline-flex items-center gap-2 text-(--text-primary) font-medium hover:text-(--ieee-blue) text-sm transition-colors"
                >
                    View Details <ArrowRight size={14} />
                </Link>
                {paper.downloadUrl && (
                    <a
                        href={paper.downloadUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-(--text-muted) hover:text-(--ieee-blue) text-xs"
                    >
                        Ext. Link <ExternalLink size={12} />
                    </a>
                )}
            </div>
        </div>
    );
};

export default PaperCard;
