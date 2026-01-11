import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
    return twMerge(clsx(inputs));
}

export function getDirectDriveLink(url) {
    if (!url) return '';
    if (typeof url !== 'string') return url;

    // Fast return if already a direct link
    if (url.includes('lh3.googleusercontent.com') || url.includes('drive.google.com/uc')) {
        return url;
    }

    // Match file ID from various Drive URL formats
    // /d/ID/view, /d/ID, ?id=ID, etc.
    const match = url.match(/(?:\/d\/|id=)([-\w]{25,})/);
    if (match && match[1]) {
        return `https://drive.google.com/thumbnail?id=${match[1]}&sz=w1000`;
    }

    // If it looks like a raw ID (no special characters except - and _ and length >= 25)
    if (/^[-\w]{25,}$/.test(url)) {
        return `https://drive.google.com/thumbnail?id=${url}&sz=w1000`;
    }

    return url;
}
