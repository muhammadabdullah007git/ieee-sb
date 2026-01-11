import React from 'react';
import { Search, X } from 'lucide-react';
import { cn } from '../../lib/utils';

const PublicSearchBar = ({ value, onChange, placeholder = "Search...", className }) => {
    return (
        <div className={cn("relative max-w-2xl mx-auto mb-10 group", className)}>
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-(--text-muted) group-focus-within:text-(--ieee-blue) transition-colors">
                <Search size={20} />
            </div>
            <input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className={cn(
                    "w-full pl-12 pr-12 py-3.5 rounded-2xl bg-(--bg-primary) border border-(--border-subtle)",
                    "focus:outline-hidden focus:ring-4 focus:ring-(--ieee-blue)/10 focus:border-(--ieee-blue)",
                    "text-(--text-primary) placeholder:text-(--text-muted) transition-all shadow-sm",
                    "text-base font-medium"
                )}
            />
            {value && (
                <button
                    onClick={() => onChange('')}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-1.5 rounded-xl hover:bg-(--bg-secondary) text-(--text-muted) hover:text-(--text-primary) transition-all"
                >
                    <X size={18} />
                </button>
            )}
        </div>
    );
};

export default PublicSearchBar;
