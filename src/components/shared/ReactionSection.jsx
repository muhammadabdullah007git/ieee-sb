import React, { useState, useEffect } from 'react';
import { ThumbsUp, ThumbsDown, Loader2 } from 'lucide-react';
import { FirestoreService } from '../../services/firestore';
import { useAdmin } from '../../context/AdminContext';
import { useToast } from '../../context/ToastContext';
import { cn } from '../../lib/utils';

const ReactionSection = ({ parentId }) => {
    const [reactionData, setReactionData] = useState({ likes: 0, dislikes: 0, userReaction: null });
    const [loading, setLoading] = useState(true);
    const [toggling, setToggling] = useState(false);

    // Use AdminContext
    const { profile, openLoginModal } = useAdmin();
    const currentUser = profile?.uid ? { uid: profile.uid } : null;

    const { showToast } = useToast();

    useEffect(() => {
        fetchReactions(currentUser?.uid || null);
    }, [parentId, currentUser?.uid]);

    const fetchReactions = async (uid) => {
        try {
            const data = await FirestoreService.getReactionData(parentId, uid);
            setReactionData(data);
        } catch (error) {
            console.error("Error fetching reactions:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleToggle = async (type) => {
        if (!currentUser) {
            openLoginModal();
            return;
        }

        setToggling(true);
        try {
            // Optimistic update
            const prevData = { ...reactionData };
            let newLikes = prevData.likes;
            let newDislikes = prevData.dislikes;
            let newUserReaction = prevData.userReaction;

            if (prevData.userReaction === type) {
                // Remove
                if (type === 'like') newLikes--;
                if (type === 'dislike') newDislikes--;
                newUserReaction = null;
            } else {
                // Add or Change
                if (prevData.userReaction === 'like') newLikes--;
                if (prevData.userReaction === 'dislike') newDislikes--;

                if (type === 'like') newLikes++;
                if (type === 'dislike') newDislikes++;
                newUserReaction = type;
            }

            setReactionData({ likes: newLikes, dislikes: newDislikes, userReaction: newUserReaction });

            await FirestoreService.toggleReaction(parentId, currentUser.uid, type);
            // Re-fetch to ensure sync after operation
            await fetchReactions(currentUser.uid);
        } catch (error) {
            showToast("Failed to update reaction", "error");
            // Revert on error (re-fetch)
            fetchReactions(currentUser.uid);
        } finally {
            setToggling(false);
        }
    };

    if (loading) return <div className="h-10 w-32 bg-(--bg-secondary) animate-pulse rounded-full"></div>;

    return (
        <div className="flex items-center gap-2">
            {/* Like Button */}
            <button
                onClick={() => handleToggle('like')}
                disabled={toggling}
                title={currentUser ? "Like" : "Sign in to like"}
                className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-l-lg transition-all duration-300 border backdrop-blur-sm shadow-sm",
                    reactionData.userReacted === 'like'
                        ? "bg-blue-500/10 border-blue-500/30 text-blue-500 ring-1 ring-blue-500/10 z-10"
                        : "bg-(--bg-secondary) border-(--border-subtle) text-(--text-secondary) hover:border-blue-500/30 hover:text-blue-500 hover:bg-blue-500/5",
                    !currentUser && "hover:bg-blue-500/5 hover:border-blue-500/30 hover:text-blue-500"
                )}
            >
                {toggling && reactionData.userReacted === 'like' ? (
                    <Loader2 size={18} className="animate-spin" />
                ) : (
                    <ThumbsUp
                        size={18}
                        className={cn("transition-transform duration-300", reactionData.userReacted === 'like' && "fill-current scale-110")}
                    />
                )}
                <span className="font-bold tabular-nums text-sm">{reactionData.likes}</span>
            </button>

            {/* Dislike Button */}
            <button
                onClick={() => handleToggle('dislike')}
                disabled={toggling}
                title={currentUser ? "Dislike" : "Sign in to dislike"}
                className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-r-lg transition-all duration-300 border-y border-r border-l-0 backdrop-blur-sm shadow-sm -ml-px",
                    reactionData.userReacted === 'dislike'
                        ? "bg-red-500/10 border-red-500/30 text-red-500 ring-1 ring-red-500/10 z-10"
                        : "bg-(--bg-secondary) border-(--border-subtle) text-(--text-secondary) hover:border-red-500/30 hover:text-red-500 hover:bg-red-500/5",
                    !currentUser && "hover:bg-blue-500/5 hover:border-blue-500/30 hover:text-blue-500"
                )}
            >
                {toggling && reactionData.userReacted === 'dislike' ? (
                    <Loader2 size={18} className="animate-spin" />
                ) : (
                    <ThumbsDown
                        size={18}
                        className={cn("transition-transform duration-300", reactionData.userReacted === 'dislike' && "fill-current scale-110")}
                    />
                )}
                <span className="font-bold tabular-nums text-sm">{reactionData.dislikes}</span>
            </button>
        </div>
    );
};

export default ReactionSection;
