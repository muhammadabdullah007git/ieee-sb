import React from 'react';
import { User, Menu } from 'lucide-react';
import ThemeToggle from '../shared/ThemeToggle';
import { useAdmin } from '../../context/AdminContext';

const Header = ({ onMenuClick }) => {
    const { profile } = useAdmin();

    return (
        <header className="h-16 bg-(--bg-surface)/80 backdrop-blur-md border-b border-(--border-subtle) flex items-center justify-between px-4 md:px-6 sticky top-0 z-40">
            <button onClick={onMenuClick} className="md:hidden mr-4 text-(--text-secondary) hover:text-(--ieee-blue)">
                <Menu size={24} />
            </button>
            {/* Search Bar Removed */}
            <div className="flex-1"></div>

            <div className="flex items-center gap-4">
                <ThemeToggle />
                <div className="flex items-center gap-3 pl-4 border-l border-(--border-subtle)">
                    <div className="text-right hidden sm:block">
                        <div className="text-sm font-semibold text-(--text-primary)">{profile.displayName}</div>
                        <div className="text-xs text-(--text-muted)">{profile.role}</div>
                    </div>
                    <div className="w-9 h-9 rounded-lg bg-(--bg-secondary) border border-(--border-subtle) flex items-center justify-center text-(--ieee-blue) overflow-hidden shrink-0">
                        {profile.photoURL ? (
                            <img src={profile.photoURL} alt="" className="w-full h-full object-cover" />
                        ) : (
                            <User size={18} />
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
