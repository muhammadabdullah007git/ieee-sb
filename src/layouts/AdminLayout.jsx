import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/admin/Sidebar';
import Header from '../components/admin/Header';

const AdminLayout = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <div className="min-h-screen flex bg-(--bg-secondary) text-(--text-primary) font-sans admin-compact">
            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
            <div className="flex-1 flex flex-col md:ml-60 min-w-0">
                <Header onMenuClick={() => setIsSidebarOpen(true)} />
                <main className="flex-1 p-3 md:p-6 overflow-y-auto overflow-x-hidden min-w-0">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
