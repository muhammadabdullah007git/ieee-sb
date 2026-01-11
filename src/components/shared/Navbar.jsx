import React, { useState, useEffect } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { Menu, X, ChevronRight } from 'lucide-react';
import { cn } from '../../lib/utils';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import ThemeToggle from './ThemeToggle';
import { useAdmin } from '../../context/AdminContext';
import { useToast } from '../../context/ToastContext';
import { AuthService } from '../../services/auth';
import { User, LogOut, LayoutDashboard, ChevronDown } from 'lucide-react';

const navItems = [
    { name: 'Home', path: '/' },
    { name: 'Paper', path: '/papers' },
    { name: 'Event', path: '/events' },
    { name: 'Blog', path: '/blog' },
    { name: 'Contact', path: '/contact' },
];

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);
    const { profile, openLoginModal } = useAdmin();
    const { showToast } = useToast();
    const navigate = useNavigate();

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleLogout = async () => {
        try {
            await AuthService.logout();
            showToast('Logged out successfully', 'success');
            setShowUserMenu(false);
            setIsOpen(false);
        } catch (error) {
            showToast('Failed to logout', 'error');
        }
    };

    return (
        <nav
            className={cn(
                'fixed top-0 w-full z-50 transition-all duration-300',
                scrolled
                    ? 'bg-(--bg-primary)/80 backdrop-blur-md border-b border-(--border-subtle) shadow-sm'
                    : 'bg-transparent'
            )}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <Link to="/" className="flex items-center gap-3 group">
                        <img
                            src="/logo.png"
                            alt="IEEE {'<NAME>'} SB Logo"
                            className="h-10 w-auto object-contain transition-opacity group-hover:opacity-80"
                            style={{
                                maskImage: 'url(/logo.png)',
                                WebkitMaskImage: 'url(/logo.png)',
                                maskSize: 'contain',
                                WebkitMaskSize: 'contain',
                                maskRepeat: 'no-repeat',
                                WebkitMaskRepeat: 'no-repeat',
                                background: 'var(--ieee-blue)',
                                display: 'block'
                            }}
                        />
                        <span className="text-2xl font-bold text-(--text-primary)">
                            IEEE <span className="text-(--ieee-blue)">{'<NAME>'}</span> SB
                        </span>
                    </Link>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center space-x-8">
                        {navItems.map((item) => (
                            <NavLink
                                key={item.name}
                                to={item.path}
                                className={({ isActive }) =>
                                    cn(
                                        'text-sm font-semibold transition-colors hover:text-(--ieee-blue)',
                                        isActive ? 'text-(--ieee-blue)' : 'text-(--text-secondary)'
                                    )
                                }
                            >
                                {item.name}
                            </NavLink>
                        ))}
                        {profile.uid ? (
                            <div className="relative">
                                <button
                                    onClick={() => setShowUserMenu(!showUserMenu)}
                                    className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-(--border-subtle) bg-(--bg-secondary)/50 hover:bg-(--bg-secondary) transition-all text-sm font-bold text-(--text-primary)"
                                >
                                    <div className="w-6 h-6 rounded-xl bg-(--ieee-blue)/10 flex items-center justify-center text-(--ieee-blue) overflow-hidden">
                                        {profile.photoURL ? (
                                            <img src={profile.photoURL} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            <User size={14} />
                                        )}
                                    </div>
                                    <span className="truncate max-w-[100px]">{profile.displayName}</span>
                                    <ChevronDown size={14} className={cn("transition-transform", showUserMenu ? "rotate-180" : "")} />
                                </button>

                                <AnimatePresence>
                                    {showUserMenu && (
                                        <>
                                            <div
                                                className="fixed inset-0 z-10"
                                                onClick={() => setShowUserMenu(false)}
                                            />
                                            <motion.div
                                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                                className="absolute right-0 mt-2 w-48 bg-(--bg-surface) border border-(--border-subtle) rounded-2xl shadow-xl z-20 overflow-hidden"
                                            >
                                                <div className="p-2 space-y-1">
                                                    <Link
                                                        to="/admin/dashboard"
                                                        onClick={() => setShowUserMenu(false)}
                                                        className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium hover:bg-(--bg-secondary) text-(--text-primary) transition-colors"
                                                    >
                                                        <LayoutDashboard size={16} />
                                                        Dashboard
                                                    </Link>
                                                    <button
                                                        onClick={handleLogout}
                                                        className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium hover:bg-red-50 dark:hover:bg-red-900/10 text-red-500 transition-colors text-left"
                                                    >
                                                        <LogOut size={16} />
                                                        Logout
                                                    </button>
                                                </div>
                                            </motion.div>
                                        </>
                                    )}
                                </AnimatePresence>
                            </div>
                        ) : (
                            <button
                                onClick={openLoginModal}
                                className="px-6 py-2 rounded-xl border-2 border-(--ieee-blue) text-(--ieee-blue) text-sm font-bold hover:bg-(--ieee-blue) hover:text-white transition-all"
                            >
                                MEMBER LOGIN
                            </button>
                        )}
                        <ThemeToggle />
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden flex items-center gap-4">
                        <ThemeToggle />
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="text-(--text-primary) hover:text-(--ieee-blue) transition-colors"
                        >
                            {isOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden bg-(--bg-primary) border-b border-(--border-subtle) transition-colors duration-300 overflow-hidden"
                    >
                        <div className="px-4 pt-2 pb-6 space-y-2">
                            {navItems.map((item) => (
                                <NavLink
                                    key={item.name}
                                    to={item.path}
                                    onClick={() => setIsOpen(false)}
                                    className={({ isActive }) =>
                                        cn(
                                            'block px-3 py-2 rounded-md text-base font-medium transition-colors',
                                            isActive
                                                ? 'bg-blue-50 dark:bg-(--bg-secondary) text-(--ieee-blue)'
                                                : 'text-(--text-secondary) hover:bg-(--bg-secondary)'
                                        )
                                    }
                                >
                                    {item.name}
                                </NavLink>
                            ))}
                            {profile.uid ? (
                                <div className="space-y-2 pt-2 border-t border-(--border-subtle)">
                                    <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-(--bg-secondary)/50 border border-(--border-subtle)">
                                        <div className="w-8 h-8 rounded-xl bg-(--ieee-blue)/10 flex items-center justify-center text-(--ieee-blue) overflow-hidden">
                                            {profile.photoURL ? (
                                                <img src={profile.photoURL} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                                <User size={18} />
                                            )}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-sm font-bold text-(--text-primary) truncate">{profile.displayName}</p>
                                            <p className="text-[10px] text-(--text-muted) truncate">{profile.role}</p>
                                        </div>
                                    </div>
                                    <Link
                                        to="/admin/dashboard"
                                        onClick={() => setIsOpen(false)}
                                        className="flex items-center gap-3 w-full px-4 py-3 rounded-xl bg-(--ieee-blue) text-white font-medium hover:bg-(--ieee-dark-blue) transition-colors"
                                    >
                                        <LayoutDashboard size={20} />
                                        Admin Dashboard
                                    </Link>
                                    <button
                                        onClick={handleLogout}
                                        className="flex items-center gap-3 w-full px-4 py-3 rounded-xl border border-red-500 text-red-500 font-medium hover:bg-red-500 hover:text-white transition-all"
                                    >
                                        <LogOut size={20} />
                                        Logout
                                    </button>
                                </div>
                            ) : (
                                <button
                                    onClick={() => {
                                        setIsOpen(false);
                                        openLoginModal();
                                    }}
                                    className="block w-full text-center mt-4 px-4 py-3 rounded-xl bg-(--ieee-blue) text-white font-medium hover:bg-(--ieee-dark-blue) transition-colors"
                                >
                                    Member Login
                                </button>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav >
    );
};

export default Navbar;
