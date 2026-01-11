import React, { useEffect, useState } from 'react';
import BlogCard from './BlogCard';
import Pagination from '../shared/Pagination';
import PublicSearchBar from '../shared/PublicSearchBar';
import { FirestoreService } from '../../services/firestore';
import { Loader2 } from 'lucide-react';

const BlogList = () => {
    const [blogs, setBlogs] = useState([]);
    const [filteredBlogs, setFilteredBlogs] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    useEffect(() => {
        const fetchBlogs = async () => {
            try {
                let data = await FirestoreService.getCollection('blogs');
                if (!Array.isArray(data)) data = [];
                data.sort((a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date));
                setBlogs(data);
                setFilteredBlogs(data);
            } catch (error) {
                console.error("Error fetching blogs:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchBlogs();
    }, []);

    useEffect(() => {
        const query = searchQuery.toLowerCase().trim();
        if (!query) {
            setFilteredBlogs(blogs);
        } else {
            const filtered = blogs.filter(blog =>
                blog.title?.toLowerCase().includes(query) ||
                blog.author?.toLowerCase().includes(query) ||
                blog.category?.toLowerCase().includes(query) ||
                blog.tags?.some(tag => tag.toLowerCase().includes(query))
            );
            setFilteredBlogs(filtered);
        }
        setCurrentPage(1);
    }, [searchQuery, blogs]);

    if (loading) {
        return (
            <div className="flex justify-center py-12">
                <Loader2 className="animate-spin text-blue-600" size={32} />
            </div>
        );
    }

    // Pagination Logic
    const totalPages = Math.ceil(filteredBlogs.length / itemsPerPage);
    const currentBlogs = filteredBlogs.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    return (
        <div>
            <PublicSearchBar
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Search blogs by title, author, or tags..."
            />

            {filteredBlogs.length === 0 ? (
                <div className="text-center py-12">
                    <p className="text-(--text-muted)">{searchQuery ? "No blogs match your search." : "Will be added soon."}</p>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {currentBlogs.map((blog) => (
                            <BlogCard key={blog.id} blog={blog} />
                        ))}
                    </div>

                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                    />
                </>
            )}
        </div>
    );
};

export default BlogList;
