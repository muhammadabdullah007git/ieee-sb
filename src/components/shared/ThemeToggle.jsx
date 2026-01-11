import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';

const ThemeToggle = () => {
    const { theme, toggleTheme } = useTheme();

    return (
        <button
            onClick={toggleTheme}
            className="p-2.5 rounded-xl bg-(--bg-secondary) border border-(--border-subtle) text-(--text-primary) hover:bg-(--bg-primary) hover:border-(--ieee-blue)/30 transition-all duration-300 shadow-sm group active:scale-95 flex items-center justify-center overflow-hidden"
            aria-label="Toggle theme"
        >
            <div className="relative w-5 h-5 flex items-center justify-center transition-all duration-500 group-hover:rotate-12">
                {theme === 'light' ? (
                    <Moon size={20} className="text-blue-500 fill-blue-500/10 group-hover:text-blue-600 transition-colors" />
                ) : (
                    <Sun size={20} className="text-white fill-white/10 group-hover:text-slate-200 transition-colors" />
                )}
            </div>
        </button>
    );
};

export default ThemeToggle;
