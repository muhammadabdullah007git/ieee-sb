import React, { useState, useEffect } from 'react';
import { MessageSquare, Send, Trash2, User, Loader2, Calendar } from 'lucide-react';
import { FirestoreService } from '../../services/firestore';
import { useAdmin } from '../../context/AdminContext';
import { useToast } from '../../context/ToastContext';
import { cn } from '../../lib/utils';

const CommentSection = ({ parentId }) => {
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [activeReplyId, setActiveReplyId] = useState(null); // Track which comment is being replied to

    // Use AdminContext for global auth state and login modal
    const { profile: userData, openLoginModal } = useAdmin();
    const currentUser = userData?.uid ? { uid: userData.uid } : null;

    const { showToast, confirmAction } = useToast();

    useEffect(() => {
        fetchComments();
    }, [parentId]);

    const fetchComments = async () => {
        try {
            const data = await FirestoreService.getComments(parentId);
            setComments(data);
        } catch (error) {
            console.error("Error fetching comments:", error);
        } finally {
            setLoading(false);
        }
    };

    const handlePostComment = async (content, replyToId = null) => {
        if (!content.trim()) return;
        if (!currentUser || !userData) {
            showToast("Please sign in to comment", "info");
            openLoginModal();
            return;
        }

        setSubmitting(true);
        try {
            await FirestoreService.addComment(parentId, content.trim(), {
                uid: currentUser.uid,
                displayName: userData.displayName,
                role: userData.role
            }, replyToId);

            if (!replyToId) setNewComment(''); // Clear main box
            setActiveReplyId(null); // Close inline box
            fetchComments();
            showToast(replyToId ? "Reply posted" : "Comment posted", "success");
        } catch (error) {
            showToast("Failed to post comment", "error");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (commentId) => {
        confirmAction({
            title: 'Delete Comment',
            message: 'Are you sure you want to delete this comment?',
            onConfirm: async () => {
                try {
                    await FirestoreService.deleteComment(commentId, currentUser.uid, userData?.role);
                    showToast("Comment deleted", "success");
                    fetchComments();
                } catch (error) {
                    showToast("Failed to delete comment", "error");
                }
            }
        });
    };

    // Group comments into threads
    const rootComments = comments.filter(c => !c.replyToId);

    // Inline Reply Form Component
    const InlineReplyForm = ({ replyToItem, onCancel }) => {
        const [replyContent, setReplyContent] = useState('');

        return (
            <div className="mt-4 ml-4 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="relative">
                    <textarea
                        value={replyContent}
                        onChange={(e) => setReplyContent(e.target.value)}
                        placeholder={`Reply to ${replyToItem.authorName}...`}
                        className="w-full px-4 py-3 rounded-xl bg-(--bg-primary) border border-(--border-subtle) focus:ring-2 focus:ring-(--ieee-blue)/20 outline-none text-(--text-primary) min-h-[80px] text-sm resize-none"
                        autoFocus
                    />
                </div>
                <div className="flex justify-end gap-3 mt-2">
                    <button
                        onClick={onCancel}
                        className="px-3 py-1.5 text-xs text-(--text-secondary) hover:text-(--text-primary) font-medium"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => handlePostComment(replyContent, replyToItem.id)}
                        disabled={submitting || !replyContent.trim()}
                        className="flex items-center gap-1.5 px-4 py-1.5 bg-(--ieee-blue) text-white rounded-lg hover:bg-(--ieee-dark-blue) transition-all text-xs font-bold shadow-md disabled:opacity-50"
                    >
                        {submitting ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                        Reply
                    </button>
                </div>
            </div>
        );
    };

    const CommentItem = ({ comment, depth = 0 }) => {
        const commentReplies = comments.filter(r => r.replyToId === comment.id);
        const maxDepth = 2; // Prevent infinite indentation squeeze on mobile
        const isReplying = activeReplyId === comment.id;

        return (
            <div className={cn(
                "group flex gap-3 md:gap-4 animate-in fade-in slide-in-from-left-2 duration-300",
                depth > 0 && "mt-4",
                depth > 0 ? (depth <= maxDepth ? "ml-8 md:ml-12" : "ml-3 md:ml-6 border-l-2 border-(--border-subtle) pl-3") : ""
            )}>
                <div className={cn(
                    "rounded-xl bg-(--bg-secondary) flex items-center justify-center text-(--text-secondary) font-bold shrink-0 border border-(--border-subtle)",
                    depth > 0 ? "w-8 h-8 text-xs" : "w-10 h-10"
                )}>
                    {comment.authorName?.charAt(0) || <User size={depth > 0 ? 16 : 20} />}
                </div>
                <div className="flex-1 space-y-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 flex-wrap min-w-0">
                            <span className={cn("font-bold text-(--text-primary) wrap-break-word truncate max-w-[120px] md:max-w-none", depth > 0 ? "text-sm" : "")}>{comment.authorName}</span>
                            <span className={cn(
                                "text-[10px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider shrink-0",
                                comment.authorRole === 'Admin'
                                    ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400"
                                    : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                            )}>
                                {comment.authorRole}
                            </span>
                            <span className="text-xs text-(--text-muted) flex items-center gap-1 shrink-0">
                                • <span className="hidden md:inline"><Calendar size={12} /></span> {new Date(comment.createdAt).toLocaleDateString()}
                            </span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                            <button
                                onClick={() => {
                                    if (!currentUser) openLoginModal();
                                    else setActiveReplyId(isReplying ? null : comment.id);
                                }}
                                className={cn(
                                    "text-xs font-bold px-2 py-1 transition-colors",
                                    isReplying ? "text-(--text-primary) bg-(--bg-secondary) rounded-lg" : "text-(--ieee-blue) hover:underline"
                                )}
                            >
                                {isReplying ? "Cancel" : "Reply"}
                            </button>
                            {(currentUser?.uid === comment.authorId || userData?.role === 'Admin' || userData?.role === 'Administrator') && (
                                <button
                                    onClick={() => handleDelete(comment.id)}
                                    className="p-1.5 text-(--text-muted) hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all md:opacity-0 group-hover:opacity-100"
                                    title="Delete Comment"
                                >
                                    <Trash2 size={16} />
                                </button>
                            )}
                        </div>
                    </div>
                    <p className={cn("text-(--text-secondary) leading-relaxed wrap-break-word", depth > 0 ? "text-sm" : "")}>
                        {comment.content}
                    </p>

                    {/* Inline Reply Form */}
                    {isReplying && (
                        <InlineReplyForm replyToItem={comment} onCancel={() => setActiveReplyId(null)} />
                    )}

                    {/* Render Replies to this comment */}
                    {commentReplies.length > 0 && (
                        <div className={cn("pt-2", depth >= maxDepth && "border-l-2 border-(--border-subtle) ml-1 pl-1 md:border-l-0 md:ml-0 md:pl-0")}>
                            {commentReplies.map(reply => (
                                <CommentItem key={reply.id} comment={reply} depth={depth + 1} />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="mt-12 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-3 border-b border-(--border-subtle) pb-4">
                <MessageSquare className="text-(--ieee-blue)" size={24} />
                <h2 className="text-xl font-bold text-(--text-primary)">
                    Discussion <span className="text-sm font-normal text-(--text-muted) ml-2">({comments.length})</span>
                </h2>
            </div>

            {/* Main Comment Form (New Thread) */}
            <div id="comment-form">
                <form onSubmit={(e) => { e.preventDefault(); handlePostComment(newComment); }} className="space-y-4 bg-(--bg-secondary)/10 p-4 rounded-2xl border border-(--border-subtle)">
                    <div className="flex items-center justify-between mb-2">
                        {currentUser ? (
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-xl bg-(--ieee-blue)/10 flex items-center justify-center text-(--ieee-blue) font-bold text-xs">
                                    {userData?.displayName?.charAt(0) || <User size={14} />}
                                </div>
                                <span className="text-sm font-bold text-(--text-primary)">{userData?.displayName}</span>
                                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-(--ieee-blue)/10 text-(--ieee-blue) font-bold uppercase">{userData?.role}</span>
                            </div>
                        ) : (
                            <div className="flex items-center gap-3 text-(--text-muted)">
                                <User size={16} />
                                <span className="text-sm">Posting as Guest (Please login)</span>
                            </div>
                        )}
                    </div>

                    <div className="relative">
                        <textarea
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            onFocus={() => !currentUser && openLoginModal()}
                            placeholder="Share your thoughts..."
                            className="w-full px-4 py-3 rounded-xl bg-(--bg-primary) border border-(--border-subtle) focus:ring-2 focus:ring-(--ieee-blue)/20 outline-none text-(--text-primary) min-h-[100px] resize-none transition-all"
                            required
                        />
                        {!currentUser && (
                            <div
                                className="absolute inset-0 bg-transparent cursor-pointer"
                                onClick={openLoginModal}
                                title="Click to sign in"
                            ></div>
                        )}
                    </div>

                    <div className="flex justify-end gap-3">
                        <button
                            type="submit"
                            disabled={submitting || !newComment.trim()}
                            className="flex items-center gap-2 px-6 py-2 bg-(--ieee-blue) text-white rounded-lg hover:bg-(--ieee-dark-blue) transition-all font-medium disabled:opacity-50 shadow-md hover:shadow-lg hover:-translate-y-0.5"
                        >
                            {submitting ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                            Post Comment
                        </button>
                    </div>
                </form>
            </div>

            {/* Comments List */}
            <div className="space-y-6">
                {loading ? (
                    <div className="flex justify-center py-10">
                        <Loader2 className="animate-spin text-(--ieee-blue)" size={32} />
                    </div>
                ) : comments.length === 0 ? (
                    <p className="text-center py-10 text-(--text-muted) italic">No comments yet. Be the first to start the conversation!</p>
                ) : (
                    rootComments.map((comment) => (
                        <CommentItem key={comment.id} comment={comment} />
                    ))
                )}
            </div>
        </div>
    );
};

export default CommentSection;
