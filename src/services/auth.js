import { initializeApp } from 'firebase/app';
import { auth, firebaseConfig } from '../lib/firebase';
import { signInWithEmailAndPassword, signOut, onAuthStateChanged, reauthenticateWithCredential, EmailAuthProvider, updatePassword, createUserWithEmailAndPassword, getAuth, updateProfile, sendPasswordResetEmail, confirmPasswordReset, verifyPasswordResetCode } from 'firebase/auth';

export const AuthService = {
    login: async (email, password) => {
        return await signInWithEmailAndPassword(auth, email, password);
    },

    logout: async () => {
        return await signOut(auth);
    },

    resetPassword: async (email) => {
        return await sendPasswordResetEmail(auth, email);
    },

    verifyResetCode: async (code) => {
        return await verifyPasswordResetCode(auth, code);
    },

    confirmReset: async (code, newPassword) => {
        return await confirmPasswordReset(auth, code, newPassword);
    },

    subscribe: (callback) => {
        return onAuthStateChanged(auth, callback);
    },

    updateAdminPassword: async (currentPassword, newPassword) => {
        const user = auth.currentUser;
        if (!user) throw new Error("No user logged in");

        const credential = EmailAuthProvider.credential(user.email, currentPassword);

        // Re-authenticate user before sensitive operation
        await reauthenticateWithCredential(user, credential);

        // Update password
        return await updatePassword(user, newPassword);
    },

    updateAdminProfile: async (displayName) => {
        const user = auth.currentUser;
        if (!user) throw new Error("No user logged in");
        return await updateProfile(user, { displayName });
    },

    updateAdminAvatar: async (photoURL) => {
        const user = auth.currentUser;
        if (!user) throw new Error("No user logged in");
        return await updateProfile(user, { photoURL });
    },

    createSecondaryUser: async (email, password) => {
        // Create a temporary secondary app to avoid signing out the current admin
        const secondaryApp = initializeApp(firebaseConfig, 'Secondary');
        const secondaryAuth = getAuth(secondaryApp);

        try {
            const userCredential = await createUserWithEmailAndPassword(secondaryAuth, email, password);
            // Immediately sign out from the secondary app
            await signOut(secondaryAuth);
            // Clean up the secondary app
            await secondaryApp.delete();
            return userCredential.user;
        } catch (error) {
            await secondaryApp.delete();
            throw error;
        }
    }
};
