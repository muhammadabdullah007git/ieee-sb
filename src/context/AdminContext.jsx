import React, { createContext, useContext, useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { FirestoreService } from '../services/firestore';
import { getDirectDriveLink } from '../lib/utils';

const AdminContext = createContext();

export const AdminProvider = ({ children }) => {
    const [profile, setProfile] = useState({
        displayName: 'Admin User',
        email: null,
        role: 'Admin',
        uid: null,
        photoURL: null,
        department: null,
        status: null,
        studentId: null,
        designation: null
    });
    const [loading, setLoading] = useState(true);

    const refreshProfile = async (user) => {
        if (!user) {
            setProfile({ displayName: 'Admin User', role: 'Admin', uid: null });
            setLoading(false);
            return;
        }

        try {
            const userData = await FirestoreService.getDocument('users', user.uid);
            setProfile({
                displayName: user.displayName || userData?.displayName || 'Admin User',
                email: user.email || userData?.email || null,
                role: userData?.role || 'Admin',
                uid: user.uid,
                photoURL: getDirectDriveLink(user.photoURL || userData?.photoURL || null),
                department: userData?.department || null,
                status: userData?.status ? (userData.status.trim().charAt(0).toUpperCase() + userData.status.trim().slice(1).toLowerCase()) : null,
                studentId: userData?.studentId || null,
                designation: userData?.designation || null
            });
        } catch (error) {
            console.error("Error fetching admin profile:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const auth = getAuth();
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            refreshProfile(user);
        });
        return () => unsubscribe();
    }, []);

    const updateProfile = (newData) => {
        if (newData.photoURL) {
            newData.photoURL = getDirectDriveLink(newData.photoURL);
        }
        setProfile(prev => ({ ...prev, ...newData }));
    };

    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

    const openLoginModal = () => setIsLoginModalOpen(true);
    const closeLoginModal = () => setIsLoginModalOpen(false);

    return (
        <AdminContext.Provider value={{
            profile,
            updateProfile,
            refreshProfile,
            loading,
            isLoginModalOpen,
            openLoginModal,
            closeLoginModal
        }}>
            {children}
        </AdminContext.Provider>
    );
};

export const useAdmin = () => {
    const context = useContext(AdminContext);
    if (!context) {
        throw new Error('useAdmin must be used within an AdminProvider');
    }
    return context;
};
