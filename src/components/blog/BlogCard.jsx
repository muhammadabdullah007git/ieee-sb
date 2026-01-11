import React from 'react';
import { User, Calendar, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getDirectDriveLink } from '../../lib/utils';

const BlogCard = ({ blog }) => {
    return (
        <div className="bg-(--bg-surface) rounded-2xl overflow-hidden shadow-(--shadow-sm) hover:shadow-(--shadow-md) transition-all border border-(--border-subtle) flex flex-col h-full group">
            <Link to={`/blog/${blog.id}`} className="h-56 overflow-hidden relative bg-(--bg-secondary) block">
                {blog.image ? (
                    <img
                        src={getDirectDriveLink(blog.image)}
                        alt={blog.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-(--text-muted)">
                        <span className="text-xs font-bold uppercase tracking-widest">No Image</span>
                    </div>
                )}
                <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                    {blog.tags && Array.isArray(blog.tags) ? (
                        blog.tags.slice(0, 2).map((tag, index) => (
                            <span key={index} className="bg-(--bg-primary)/90 backdrop-blur-sm px-3 py-1 rounded-lg text-xs font-bold shadow-md text-(--text-primary)">
                                {tag}
                            </span>
                        ))
                    ) : (
                        <span className="bg-(--bg-primary)/90 backdrop-blur-sm px-3 py-1 rounded-lg text-xs font-bold shadow-md text-(--text-primary)">
                            {blog.category || 'Blog'}
                        </span>
                    )}
                </div>
            </Link>

            <div className="p-6 flex-1 flex flex-col">
                <div className="flex items-center gap-4 text-sm text-(--text-secondary) mb-4">
                    <span className="flex items-center gap-1">
                        <Calendar size={14} /> {blog.date}
                    </span>
                    {blog.readTime && (
                        <span className="flex items-center gap-1">
                            <Clock size={14} /> {blog.readTime}
                        </span>
                    )}
                </div>

                <Link to={`/blog/${blog.id}`}>
                    <h3 className="text-xl font-bold text-(--text-primary) mb-3 group-hover:text-(--ieee-blue) transition-colors line-clamp-2">
                        {blog.title}
                    </h3>
                </Link>

                <p className="text-(--text-secondary) text-sm mb-6 line-clamp-3">
                    {/* Show excerpt if available, otherwise truncate content */}
                    {blog.excerpt || (blog.content ? blog.content.substring(0, 100).replace(/[#*`]/g, '') + '...' : 'No preview available.')}
                </p>

                <div className="mt-auto flex items-center justify-between pt-4 border-t border-(--border-subtle)">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-(--bg-secondary) flex items-center justify-center text-(--ieee-blue)">
                            <User size={14} />
                        </div>
                        <Link to={`/author/${blog.authorEmail || encodeURIComponent(blog.author)}`} className="text-sm font-medium text-(--text-secondary) hover:text-(--ieee-blue) transition-colors">
                            {blog.author}
                        </Link>
                    </div>
                    <Link
                        to={`/blog/${blog.id}`}
                        className="px-4 py-2 rounded-lg bg-(--ieee-blue) hover:bg-(--ieee-dark-blue) text-white text-sm font-medium transition-colors"
                    >
                        Read More
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default BlogCard;
