import { db } from '../lib/firebase';
import { collection, doc, getDoc, getDocs, setDoc, addDoc, updateDoc, deleteDoc, query, where } from 'firebase/firestore';

export const FirestoreService = {
    // --- Config ---
    async getGasConfig() {
        try {
            const docRef = doc(db, 'config', 'general');
            const snapshot = await getDoc(docRef);
            return snapshot.exists() ? snapshot.data() : {};
        } catch (e) {
            console.error("Error fetching GAS Config:", e);
            return {};
        }
    },

    // --- Collection Helpers ---
    async getCollection(colName) {
        try {
            const q = query(collection(db, colName));
            const snapshot = await getDocs(q);
            return snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
        } catch (e) {
            console.error(`Error fetching ${colName}:`, e);
            return [];
        }
    },

    async getDocument(colName, id) {
        try {
            const docRef = doc(db, colName, id);
            const snapshot = await getDoc(docRef);
            return snapshot.exists() ? { ...snapshot.data(), id: snapshot.id } : null;
        } catch (e) {
            console.error(`Error fetching ${colName}/${id}:`, e);
            return null;
        }
    },

    async getCollectionWhere(colName, field, operator, value) {
        try {
            const q = query(collection(db, colName), where(field, operator, value));
            const snapshot = await getDocs(q);
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (e) {
            console.error(`Error fetching ${colName} where ${field} ${operator} ${value}:`, e);
            return [];
        }
    },

    async addDocument(colName, data) {
        try {
            const docRef = await addDoc(collection(db, colName), data);
            return docRef.id;
        } catch (e) {
            console.error(`Error adding to ${colName}:`, e);
            throw e;
        }
    },

    async addDocumentWithId(colName, id, data) {
        try {
            const docRef = doc(db, colName, id);
            await setDoc(docRef, data);
        } catch (e) {
            console.error(`Error adding to ${colName}/${id}:`, e);
            throw e;
        }
    },

    async updateDocument(colName, id, data) {
        try {
            const docRef = doc(db, colName, id);
            await updateDoc(docRef, data);
        } catch (e) {
            console.error(`Error updating ${colName}/${id}:`, e);
            throw e;
        }
    },

    async deleteDocument(colName, id) {
        try {
            const docRef = doc(db, colName, id);
            await deleteDoc(docRef);
        } catch (e) {
            console.error(`Error deleting ${colName}/${id}:`, e);
            throw e;
        }
    },

    async deleteDocumentWithCleanup(colName, id) {
        try {
            // 1. Delete associated comments
            const commentsQ = query(collection(db, 'comments'), where('parentId', '==', id));
            const commentsSnapshot = await getDocs(commentsQ);
            const deleteCommentsPromises = commentsSnapshot.docs.map(doc => deleteDoc(doc.ref));
            await Promise.all(deleteCommentsPromises);

            // 2. Delete associated reactions
            const reactionsQ = query(collection(db, 'reactions'), where('parentId', '==', id));
            const reactionsSnapshot = await getDocs(reactionsQ);
            const deleteReactionsPromises = reactionsSnapshot.docs.map(doc => deleteDoc(doc.ref));
            await Promise.all(deleteReactionsPromises);

            // 3. Delete the main document
            const docRef = doc(db, colName, id);
            await deleteDoc(docRef);

            console.log(`Cascade deleted post: ${colName}/${id}`);
        } catch (e) {
            console.error(`Error deleting ${colName}/${id} with cleanup:`, e);
            throw e;
        }
    },

    // --- Interactions (Comments & Reactions) ---
    async addComment(parentId, content, user, replyToId = null) {
        try {
            return await this.addDocument('comments', {
                parentId,
                replyToId,
                content,
                authorId: user.uid,
                authorName: user.displayName || 'Anonymous',
                createdAt: new Date().toISOString(),
                authorRole: user.role || 'Member'
            });
        } catch (e) {
            console.error("Error adding comment:", e);
            throw e;
        }
    },

    async getComments(parentId) {
        try {
            const q = query(
                collection(db, 'comments'),
                where('parentId', '==', parentId)
            );
            const snapshot = await getDocs(q);
            return snapshot.docs
                .map(doc => ({ ...doc.data(), id: doc.id }))
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        } catch (e) {
            console.error("Error fetching comments:", e);
            return [];
        }
    },

    async deleteComment(commentId, userId, userRole) {
        try {
            const comment = await this.getDocument('comments', commentId);
            if (comment && (comment.authorId === userId || userRole === 'Admin' || userRole === 'Administrator')) {
                await this.deleteDocument('comments', commentId);
            } else {
                throw new Error("Unauthorized to delete this comment");
            }
        } catch (e) {
            console.error("Error deleting comment:", e);
            throw e;
        }
    },

    async toggleReaction(parentId, userId, type) {
        try {
            const q = query(
                collection(db, 'reactions'),
                where('parentId', '==', parentId),
                where('userId', '==', userId)
            );
            const snapshot = await getDocs(q);

            if (snapshot.empty) {
                // Add new reaction
                await this.addDocument('reactions', {
                    parentId,
                    userId,
                    type,
                    createdAt: new Date().toISOString()
                });
                return { action: 'added', type };
            } else {
                const docId = snapshot.docs[0].id;
                const currentType = snapshot.docs[0].data().type;

                if (currentType === type) {
                    // Remove same reaction
                    await this.deleteDocument('reactions', docId);
                    return { action: 'removed', type };
                } else {
                    // Change reaction type
                    await this.updateDocument('reactions', docId, { type });
                    return { action: 'changed', type };
                }
            }
        } catch (e) {
            console.error("Error toggling reaction:", e);
            throw e;
        }
    },

    async getReactionData(parentId, userId) {
        try {
            const q = query(
                collection(db, 'reactions'),
                where('parentId', '==', parentId)
            );
            const snapshot = await getDocs(q);

            let likes = 0;
            let dislikes = 0;
            let userReaction = null;

            snapshot.docs.forEach(doc => {
                const data = doc.data();
                if (data.type === 'like') likes++;
                if (data.type === 'dislike') dislikes++;
                if (userId && data.userId === userId) {
                    userReaction = data.type;
                }
            });

            return { likes, dislikes, userReaction };
        } catch (e) {
            console.error("Error getting reactions:", e);
            return { likes: 0, dislikes: 0, userReaction: null };
        }
    },

    async getAnalyticsData() {
        try {
            const [blogs, papers, comments, reactions] = await Promise.all([
                this.getCollection('blogs'),
                this.getCollection('papers'),
                this.getCollection('comments'),
                this.getCollection('reactions')
            ]);

            // Total counts
            const totals = {
                blogs: blogs.length,
                papers: papers.length,
                comments: comments.length,
                reactions: reactions.length
            };

            // Process temporal data (last 7 days)
            const last7Days = [...Array(7)].map((_, i) => {
                const d = new Date();
                d.setDate(d.getDate() - (6 - i));
                return d.toISOString().split('T')[0];
            });

            const engagementData = last7Days.map(date => {
                const dayComments = comments.filter(c => c.createdAt.startsWith(date)).length;
                const dayReactions = reactions.filter(r => r.createdAt.startsWith(date)).length;
                return {
                    date,
                    comments: dayComments,
                    reactions: dayReactions,
                    total: dayComments + dayReactions
                };
            });

            // Top performing content (Top 5)
            // Combine all items and calculate engagement score
            const contentPool = [
                ...blogs.map(b => ({ ...b, type: 'Blog' })),
                ...papers.map(p => ({ ...p, type: 'Paper' }))
            ];

            const topContent = contentPool.map(item => {
                const itemComments = comments.filter(c => c.parentId === item.id).length;
                const itemReactions = reactions.filter(r => r.parentId === item.id).length;
                return {
                    id: item.id,
                    title: item.title,
                    type: item.type,
                    engagement: itemComments + itemReactions,
                    comments: itemComments,
                    reactions: itemReactions
                };
            })
                .sort((a, b) => b.engagement - a.engagement)
                .slice(0, 5);

            return { totals, engagementData, topContent };
        } catch (error) {
            console.error("Error fetching analytics data:", error);
            throw error;
        }
    }
};
