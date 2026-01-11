import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/shared/Navbar';
import Footer from '../components/shared/Footer';

const MainLayout = () => {
    return (
        <div className="min-h-screen flex flex-col bg-(--bg-primary) text-(--text-primary) font-sans transition-colors duration-300">
            <Navbar />
            <main className="flex-1 pt-16">
                <Outlet />
            </main>
            <Footer />
        </div>
    );
};

export default MainLayout;
