import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import {
    LayoutDashboard,
    FileText,
    Users,
    Calendar,
    BookOpen,
    Mail,
    MessageSquare,
    Settings,
    LogOut,
    Award,
    User
} from 'lucide-react';
import { getAuth, signOut } from 'firebase/auth';
import { FirestoreService } from '../../services/firestore';
import { useToast } from '../../context/ToastContext';
import { cn } from '../../lib/utils';
import { useAdmin } from '../../context/AdminContext';

const sidebarItems = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Blog Manager', path: '/admin/blogs', icon: FileText },
    { name: 'Panel Manager', path: '/admin/panel', icon: Users },
    { name: 'Manage Users', path: '/admin/users', icon: Users },
    { name: 'Event Manager', path: '/admin/events', icon: Calendar },
    { name: 'Paper Manager', path: '/admin/papers', icon: BookOpen },
    { name: 'Certificates', path: '/admin/certificates', icon: Award },
    { name: 'Mail Center', path: '/admin/mail', icon: Mail },
    { name: 'Contact', path: '/admin/contact', icon: MessageSquare },
    { name: 'Settings', path: '/admin/settings', icon: Settings },
];

const Sidebar = ({ isOpen, onClose }) => {
    const { profile } = useAdmin();
    const { confirmAction, showToast } = useToast();

    const filteredItems = sidebarItems.filter(item => {
        const role = profile.role || 'Member';
        const isAdmin = role === 'Admin' || role === 'Administrator';
        if (isAdmin) return true;

        const isEditor = role === 'Editor';
        const isMember = role === 'Member';

        // Allowed items for partial roles
        const allowedForPartial = ['Dashboard', 'Blog Manager', 'Paper Manager', 'Settings'];

        if (isEditor || isMember) {
            return allowedForPartial.includes(item.name);
        }

        return false;
    });

    const handleSignOut = () => {
        confirmAction({
            title: 'Sign Out',
            message: 'Are you sure you want to sign out?',
            onConfirm: async () => {
                const auth = getAuth();
                try {
                    await signOut(auth);
                    showToast('Signed out successfully', 'success');
                } catch (error) {
                    console.error('Sign out failed:', error);
                    showToast('Failed to sign out', 'error');
                }
            }
        });
    };

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm"
                    onClick={onClose}
                />
            )}

            <aside className={`
                fixed top-0 bottom-0 left-0 bg-(--bg-surface) border-r border-(--border-subtle) 
                text-(--text-secondary) flex flex-col z-50 transition-transform duration-300 w-60
                ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
            `}>
                <div className="h-16 flex items-center justify-between px-6 border-b border-(--border-subtle)">
                    <Link to="/" className="text-sm font-extrabold text-(--ieee-blue) flex flex-col leading-tight">
                        <span>IEEE {'<NAME>'} SB</span>
                        <span className="text-[10px] text-(--text-muted) font-medium uppercase tracking-widest mt-0.5">Administrator</span>
                    </Link>
                    {/* Close button for mobile */}
                    <button onClick={onClose} className="md:hidden text-(--text-muted) hover:text-(--text-primary)">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                    </button>
                </div>

                <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
                    {filteredItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            onClick={() => onClose && onClose()} // Close sidebar on mobile nav click
                            className={({ isActive }) =>
                                cn(
                                    'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group',
                                    isActive
                                        ? 'bg-(--ieee-blue) text-white shadow-lg shadow-(--ieee-blue)/20'
                                        : 'hover:bg-(--bg-secondary) text-(--text-secondary) hover:text-(--text-primary)'
                                )
                            }
                        >
                            {({ isActive }) => (
                                <>
                                    <item.icon size={18} className={cn(isActive ? "text-white" : "text-(--text-muted) group-hover:text-(--ieee-blue)")} />
                                    {item.name}
                                </>
                            )}
                        </NavLink>
                    ))}
                </nav>

                <div className="p-4 border-t border-(--border-subtle) mt-auto bg-(--bg-secondary)/10">
                    <button
                        onClick={handleSignOut}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-500 hover:bg-red-500/10 w-full transition-colors"
                    >
                        <LogOut size={18} />
                        Sign Out
                    </button>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
