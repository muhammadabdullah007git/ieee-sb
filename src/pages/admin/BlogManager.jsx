import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, FileText, Loader2, User, X, Save, Eye, Edit3, ExternalLink, Upload, Trash, Image as ImageIcon } from 'lucide-react';
import { FirestoreService } from '../../services/firestore';
import { GAS_API } from '../../services/gas';
import { useToast } from '../../context/ToastContext';
import { useAdmin } from '../../context/AdminContext';
import { getDirectDriveLink } from '../../lib/utils';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypeHighlight from 'rehype-highlight';

const BlogModal = ({ blog, isOpen, onClose, onSave }) => {
    const { profile } = useAdmin();
    const [formData, setFormData] = useState({
        id: '', // Custom slug or auto-id
        title: '',
        tags: '', // Changed from category to tags (string for input)
        content: '',
        image: '',
        author: profile?.displayName || 'IEEE {'<NAME>'} SB',
        date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
    });
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [preview, setPreview] = useState(false);
    const { showToast } = useToast();

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        try {
            const result = await GAS_API.uploadFile(file, 'blogs');
            setFormData(prev => ({ ...prev, image: result.fileId }));
            showToast("Cover image uploaded successfully", "success");
        } catch (error) {
            console.error(error);
            showToast("Upload failed: " + error.message, "error");
        } finally {
            setUploading(false);
        }
    };

    useEffect(() => {
        if (isOpen) {
            setPreview(false);
            if (blog) {
                // Determine if we need to fetch content from Sheets
                const openBlog = async () => {
                    setLoading(true);
                    try {
                        // Handle legacy category or existing tags
                        let initialTags = '';
                        if (blog.tags && Array.isArray(blog.tags)) {
                            initialTags = blog.tags.join(', ');
                        } else if (blog.category) {
                            initialTags = blog.category;
                        }

                        setFormData({
                            ...blog,
                            content: blog.content || '',
                            tags: initialTags
                        });
                    } catch (e) {
                        console.error(e);
                    } finally {
                        setLoading(false);
                    }
                };
                openBlog();
            } else {
                setFormData({
                    id: '',
                    title: '',
                    tags: '',
                    content: '',
                    image: '',
                    author: profile?.displayName || 'IEEE {'<NAME>'} SB',
                    date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
                });
            }
        }
    }, [blog, isOpen, profile?.displayName]);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await onSave(formData, blog?.id);
            onClose();
        } catch (error) {
            console.error("Save failed:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-150 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-(--bg-surface) rounded-2xl shadow-xl w-full max-w-4xl h-[90vh] flex flex-col border border-(--border-subtle) animate-in fade-in zoom-in duration-200">
                <div className="flex items-center justify-between p-6 border-b border-(--border-subtle) bg-(--bg-secondary)/10">
                    <div className="flex items-center gap-4">
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                onClose();
                            }}
                            className="p-2 hover:bg-(--bg-secondary) rounded-lg transition-colors text-(--text-muted) hover:text-(--text-primary)"
                            aria-label="Close modal"
                        >
                            <X size={20} />
                        </button>
                        <h2 className="text-xl font-bold text-(--text-primary)">
                            {blog ? 'Edit Post' : 'Create New Post'}
                        </h2>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={() => setPreview(!preview)}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors font-medium border text-sm ${preview
                                ? 'bg-(--bg-secondary) border-(--border-subtle) text-(--text-primary)'
                                : 'bg-(--bg-surface) border-(--border-subtle) text-(--text-secondary) hover:text-(--text-primary)'
                                }`}
                        >
                            {preview ? <Edit3 size={16} /> : <Eye size={16} />}
                            {preview ? 'Edit' : 'Preview'}
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                    {loading && fetchingContent ? (
                        <div className="flex flex-col items-center justify-center h-full text-(--text-muted)">
                            <Loader2 className="animate-spin text-(--ieee-blue) mb-4" size={32} />
                            <p>Loading content...</p>
                        </div>
                    ) : (
                        !preview ? (
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-(--text-secondary)">Post Title</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        className="w-full px-4 py-2 rounded-lg bg-(--bg-primary) border border-(--border-subtle) focus:ring-2 focus:ring-(--ieee-blue)/20 outline-none text-(--text-primary) text-lg font-medium"
                                        placeholder="Enter a catchy title..."
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-(--text-secondary)">Custom URL Slug (ID)</label>
                                        <input
                                            type="text"
                                            value={formData.id}
                                            disabled={!!blog}
                                            onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                                            className="w-full px-4 py-2 rounded-lg bg-(--bg-primary) border border-(--border-subtle) focus:ring-2 focus:ring-(--ieee-blue)/20 outline-none text-(--text-primary) font-mono text-sm disabled:opacity-50"
                                            placeholder="Leave blank for auto-id"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-(--text-secondary)">Tags</label>
                                        <input
                                            type="text"
                                            value={formData.tags}
                                            onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                                            className="w-full px-4 py-2 rounded-lg bg-(--bg-primary) border border-(--border-subtle) focus:ring-2 focus:ring-(--ieee-blue)/20 outline-none text-(--text-primary)"
                                            placeholder="e.g. AI, Workshop, Achievement"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-(--text-secondary)">Cover Image</label>
                                    <div className="relative group">
                                        <input
                                            type="file"
                                            className="hidden"
                                            id="blog-cover-upload"
                                            accept="image/*"
                                            onChange={handleImageUpload}
                                            disabled={uploading}
                                        />
                                        {formData.image ? (
                                            <div className="relative h-48 rounded-2xl overflow-hidden border border-(--border-subtle) group shadow-sm transition-all hover:shadow-md">
                                                <img
                                                    src={getDirectDriveLink(formData.image)}
                                                    alt="Blog Cover Preview"
                                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                                />
                                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                                                    <label
                                                        htmlFor="blog-cover-upload"
                                                        className="p-3 bg-white text-black rounded-full cursor-pointer hover:bg-(--ieee-blue) hover:text-white transition-all transform hover:scale-110 shadow-lg"
                                                        title="Change Image"
                                                    >
                                                        <ImageIcon size={22} />
                                                    </label>
                                                    <button
                                                        type="button"
                                                        onClick={() => setFormData(prev => ({ ...prev, image: '' }))}
                                                        className="p-3 bg-white text-red-600 rounded-full hover:bg-red-600 hover:text-white transition-all transform hover:scale-110 shadow-lg"
                                                        title="Remove Image"
                                                    >
                                                        <Trash size={22} />
                                                    </button>
                                                </div>
                                                {uploading && (
                                                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center">
                                                        <Loader2 className="animate-spin text-white" size={36} />
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <label
                                                htmlFor="blog-cover-upload"
                                                className={`flex flex-col items-center justify-center h-48 border-2 border-dashed border-(--border-subtle) rounded-2xl cursor-pointer hover:border-(--ieee-blue) hover:bg-(--ieee-blue)/5 transition-all group ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                                            >
                                                {uploading ? (
                                                    <div className="flex flex-col items-center">
                                                        <Loader2 className="animate-spin text-(--ieee-blue) mb-3" size={36} />
                                                        <span className="text-sm font-medium text-(--text-muted)">Uploading to Drive...</span>
                                                    </div>
                                                ) : (
                                                    <div className="flex flex-col items-center">
                                                        <div className="p-4 bg-(--bg-secondary) rounded-2xl mb-3 group-hover:bg-(--ieee-blue)/10 text-(--text-muted) group-hover:text-(--ieee-blue) transition-all transform group-hover:-translate-y-1">
                                                            <Upload size={32} />
                                                        </div>
                                                        <span className="text-sm font-bold text-(--text-secondary) group-hover:text-(--ieee-blue)">Click to upload blog cover</span>
                                                        <span className="text-xs text-(--text-muted) mt-1 font-medium">JPG, PNG or WEBP (Max 5MB)</span>
                                                    </div>
                                                )}
                                            </label>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-2 flex-1 flex flex-col min-h-0">
                                    <div className="flex items-center justify-between">
                                        <label className="text-sm font-medium text-(--text-secondary)">Content</label>
                                        <span className="text-[10px] uppercase font-bold text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">MARKDOWN SUPPORTED</span>
                                    </div>
                                    <textarea
                                        required
                                        value={formData.content}
                                        onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                        className="w-full p-4 rounded-xl bg-(--bg-primary) border border-(--border-subtle) focus:ring-2 focus:ring-(--ieee-blue)/20 outline-none text-(--text-primary) resize-none font-mono text-sm leading-relaxed min-h-[500px]"
                                        placeholder="Start writing your story..."
                                    ></textarea>
                                </div>
                            </div>
                        ) : (
                            <div className="prose dark:prose-invert max-w-none overflow-y-auto h-full pr-2 custom-scrollbar">
                                {formData.image && (
                                    <img src={getDirectDriveLink(formData.image)} alt="Cover" className="w-full h-64 object-cover rounded-xl mb-8 border border-(--border-subtle)" />
                                )}
                                <h1 className="text-3xl font-bold mb-4 text-(--text-primary)">{formData.title || 'Untitled Post'}</h1>
                                <div className="flex gap-4 text-xs text-(--text-muted) mb-8 pb-4 border-b border-(--border-subtle)">
                                    <span>{formData.author}</span>
                                    <span>•</span>
                                    <span>{formData.date}</span>
                                </div>
                                <div className="markdown-body text-(--text-primary)">
                                    <ReactMarkdown
                                        remarkPlugins={[remarkGfm, remarkMath]}
                                        rehypePlugins={[rehypeKatex, rehypeHighlight]}
                                    >
                                        {formData.content || '_No content yet..._'}
                                    </ReactMarkdown>
                                </div>
                            </div>
                        )
                    )}
                </div>

                <div className="p-6 border-t border-(--border-subtle) flex items-center justify-between bg-(--bg-secondary)/5">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-6 py-2 rounded-lg border border-(--border-subtle) text-(--text-secondary) hover:bg-(--bg-secondary) transition-colors font-medium text-sm"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="flex items-center gap-2 px-8 py-2 bg-(--ieee-blue) text-white rounded-lg hover:bg-(--ieee-dark-blue) transition-colors font-medium disabled:opacity-50 text-sm shadow-sm"
                    >
                        {loading ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                        {blog ? 'Update Content' : 'Publish Now'}
                    </button>
                </div>
            </div>
        </div>
    );
};

const BlogManager = () => {
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedBlog, setSelectedBlog] = useState(null);
    const [showAll, setShowAll] = useState(false);
    const { profile } = useAdmin();
    const { showToast, confirmAction } = useToast();

    const fetchBlogs = async () => {
        setLoading(true);
        try {
            const data = await FirestoreService.getCollection('blogs');

            // Filter blogs: Admin sees all (if showAll), others see only their own
            const userRole = profile?.role || 'Member';
            const isAdmin = userRole === 'Admin' || userRole === 'Administrator';

            if (isAdmin && showAll) {
                setBlogs(data);
            } else {
                setBlogs(data.filter(blog =>
                    blog.authorEmail === profile?.email ||
                    (!blog.authorEmail && blog.authorId === profile?.uid)
                ));
            }
        } catch (error) {
            console.error("Error fetching blogs:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (profile?.uid) {
            fetchBlogs();
        }
    }, [profile?.uid, showAll]);

    const handleSave = async (formData, blogId) => {
        try {
            // 1. Prepare Data
            const tagsArray = formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag !== '');
            const blogData = {
                title: formData.title,
                tags: tagsArray, // Save as array
                category: tagsArray[0] || 'General', // Fallback for old code relying on category
                image: formData.image,
                author: formData.author,
                authorId: profile?.uid, // Track creator
                authorEmail: profile?.email, // Track creator email
                date: formData.date,
                content: formData.content
            };

            // 2. Determine ID and check uniqueness if new
            let finalId = blogId;
            if (!finalId) {
                if (formData.id && formData.id.trim() !== "") {
                    finalId = formData.id.trim();
                } else {
                    const now = new Date();
                    const mm = String(now.getMinutes()).padStart(2, '0');
                    const hh = String(now.getHours()).padStart(2, '0');
                    const dd = String(now.getDate()).padStart(2, '0');
                    const MM = String(now.getMonth() + 1).padStart(2, '0');
                    const yy = String(now.getFullYear()).slice(-2);
                    finalId = `${mm}${hh}${dd}${MM}${yy}`;
                }

                // Check if ID is unique
                const existing = await FirestoreService.getDocument('blogs', finalId);
                if (existing) {
                    showToast("Blog ID already exists. Please choose a unique slug.", "error");
                    return;
                }

                await FirestoreService.addDocumentWithId('blogs', finalId, {
                    ...blogData,
                    createdAt: new Date().toISOString()
                });
            } else {
                await FirestoreService.updateDocument('blogs', finalId, blogData);
            }

            // Removed GAS_API calls (Moving away from Sheet storage for Blogs)

            showToast(blogId ? "Post updated!" : "Post published!", "success");
            await fetchBlogs();
        } catch (error) {
            console.error("Publish failed:", error);
            showToast("Failed to publish post", "error");
            throw error;
        }
    };

    const handleDelete = async (id) => {
        confirmAction({
            title: 'Delete Blog Post',
            message: 'Are you sure you want to delete this blog post? It will be removed from both the database and the spreadsheet content.',
            onConfirm: async () => {
                try {
                    // 1. Delete from Firestore with cascade cleanup
                    await FirestoreService.deleteDocumentWithCleanup('blogs', id);

                    // Removed GAS_API.deleteBlogContent call

                    showToast("Blog post deleted", "success");
                    await fetchBlogs();
                } catch (error) {
                    console.error("Delete failed:", error);
                    showToast("Failed to delete post", "error");
                }
            }
        });
    };

    const openModal = (blog = null) => {
        setSelectedBlog(blog);
        setIsModalOpen(true);
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-xl md:text-2xl font-bold text-(--text-primary)">Blog Manager</h1>
                    <p className="text-xs md:text-sm text-(--text-secondary)">Manage and publish your research or event stories.</p>
                </div>
                <div className="flex items-center gap-3">
                    {(profile?.role === 'Admin' || profile?.role === 'Administrator') && (
                        <div className="mr-4 flex items-center gap-2 bg-(--bg-secondary)/50 px-3 py-1.5 rounded-lg border border-(--border-subtle)">
                            <span className="text-[10px] uppercase font-bold text-(--text-muted) tracking-wider">All Posts</span>
                            <button
                                onClick={() => setShowAll(!showAll)}
                                className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${showAll ? 'bg-(--ieee-blue)' : 'bg-gray-200 dark:bg-gray-700'
                                    }`}
                            >
                                <span
                                    className={`inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${showAll ? 'translate-x-5' : 'translate-x-0'
                                        }`}
                                />
                            </button>
                        </div>
                    )}
                    <button
                        onClick={() => openModal()}
                        className="flex items-center justify-center bg-(--ieee-blue) text-white hover:bg-(--ieee-dark-blue) transition-colors shadow-lg md:shadow-none font-medium fixed bottom-6 right-6 z-100 w-14 h-14 rounded-2xl md:static md:w-auto md:h-auto md:rounded-lg md:px-4 md:py-2 md:gap-2"
                    >
                        <Plus size={24} className="md:w-4 md:h-4" />
                        <span className="hidden md:inline text-sm">New Post</span>
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="animate-spin text-(--ieee-blue)" size={40} />
                </div>
            ) : (
                <div className="bg-(--bg-surface) rounded-2xl shadow-sm border border-(--border-subtle) overflow-hidden">
                    {/* Desktop Table View */}
                    <div className="hidden md:block overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-(--bg-secondary) border-b border-(--border-subtle)">
                                    <th className="px-4 py-3 text-[10px] md:text-xs font-semibold text-(--text-muted) uppercase tracking-wider">Post</th>
                                    <th className="px-4 py-3 text-[10px] md:text-xs font-semibold text-(--text-muted) uppercase tracking-wider">Tags</th>
                                    <th className="px-4 py-3 text-[10px] md:text-xs font-semibold text-(--text-muted) uppercase tracking-wider">Details</th>
                                    <th className="px-4 py-3 text-[10px] md:text-xs font-semibold text-(--text-muted) uppercase tracking-wider text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-(--border-subtle)">
                                {blogs.length === 0 ? (
                                    <tr>
                                        <td colSpan="4" className="px-6 py-8 text-center text-(--text-muted)">
                                            No blog posts found. Share your first story!
                                        </td>
                                    </tr>
                                ) : (
                                    blogs.map((blog) => (
                                        <tr key={blog.id} className="hover:bg-(--bg-secondary)/50 transition-colors">
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-lg bg-(--bg-secondary) flex items-center justify-center text-(--ieee-blue) overflow-hidden shrink-0">
                                                        {blog.image ? (
                                                            <img src={getDirectDriveLink(blog.image)} alt="" className="w-full h-full object-cover" />
                                                        ) : (
                                                            <FileText size={18} />
                                                        )}
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <div className="font-semibold text-(--text-primary) text-sm truncate max-w-xs">{blog.title}</div>
                                                        <div className="text-[10px] text-(--text-muted)">{blog.date || 'No Date'}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex flex-wrap gap-1">
                                                    {blog.tags && Array.isArray(blog.tags) ? (
                                                        blog.tags.slice(0, 2).map((tag, i) => (
                                                            <span key={i} className="inline-block px-1.5 py-0.5 rounded text-[9px] font-medium bg-(--bg-secondary) text-(--text-secondary) border border-(--border-subtle)">
                                                                {tag}
                                                            </span>
                                                        ))
                                                    ) : (
                                                        <span className="inline-block px-1.5 py-0.5 rounded text-[9px] font-medium bg-(--bg-secondary) text-(--text-secondary) border border-(--border-subtle)">
                                                            {blog.category}
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex flex-col gap-1 text-[10px] text-(--text-muted)">
                                                    <span className="flex items-center gap-1 truncate"><User size={10} /> {blog.author || 'Admin'}</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    <a
                                                        href={`/blog/${blog.id}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="p-1.5 text-(--text-muted) hover:text-(--ieee-blue) transition-colors"
                                                        title="Open Public Page"
                                                    >
                                                        <ExternalLink size={14} />
                                                    </a>
                                                    <button
                                                        onClick={() => openModal(blog)}
                                                        className="p-1.5 text-(--text-muted) hover:text-(--ieee-blue) transition-colors"
                                                        title="Edit Post"
                                                    >
                                                        <Edit size={14} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(blog.id)}
                                                        className="p-1.5 text-(--text-muted) hover:text-red-500 transition-colors"
                                                        title="Delete Post"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile Compact View */}
                    <div className="md:hidden divide-y divide-(--border-subtle)">
                        {blogs.length === 0 ? (
                            <div className="p-8 text-center text-(--text-muted)">
                                No blog posts found. Share your first story!
                            </div>
                        ) : (
                            blogs.map((blog) => (
                                <div key={blog.id} className="p-3 flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-(--bg-secondary) flex items-center justify-center text-(--ieee-blue) overflow-hidden shrink-0">
                                        {blog.image ? (
                                            <img src={getDirectDriveLink(blog.image)} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            <FileText size={18} />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-semibold text-(--text-primary) text-sm truncate">{blog.title}</h3>
                                        <div className="flex items-center gap-2 text-[10px] text-(--text-muted) mt-0.5">
                                            <span>{blog.date}</span>
                                            <span>•</span>
                                            <span className="truncate max-w-[80px]">{blog.author || 'Admin'}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <a
                                            href={`/blog/${blog.id}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="p-1.5 text-(--text-muted) hover:text-(--ieee-blue) transition-colors"
                                        >
                                            <ExternalLink size={16} />
                                        </a>
                                        <button
                                            onClick={() => openModal(blog)}
                                            className="p-1.5 text-(--text-muted) hover:text-(--ieee-blue) transition-colors"
                                        >
                                            <Edit size={16} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(blog.id)}
                                            className="p-1.5 text-(--text-muted) hover:text-red-500 transition-colors"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}

            <BlogModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                blog={selectedBlog}
                onSave={handleSave}
            />
        </div>
    );
};

export default BlogManager;
