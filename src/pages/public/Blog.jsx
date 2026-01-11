import React from 'react';
import BlogList from '../../components/blog/BlogList';

const Blog = () => {
    return (
        <div className="min-h-screen bg-(--bg-secondary) py-12 transition-colors duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                <BlogList />
            </div>
        </div>
    );
};

export default Blog;
