import React, { useEffect, useState } from 'react';
import PaperCard from './PaperCard';
import Pagination from '../shared/Pagination';
import PublicSearchBar from '../shared/PublicSearchBar';
import { FirestoreService } from '../../services/firestore';
import { Loader2 } from 'lucide-react';

const PaperList = () => {
    const [papers, setPapers] = useState([]);
    const [filteredPapers, setFilteredPapers] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    useEffect(() => {
        const fetchPapers = async () => {
            try {
                const data = await FirestoreService.getCollection('papers');
                setPapers(data);
                setFilteredPapers(data);
            } catch (error) {
                console.error("Error fetching papers:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchPapers();
    }, []);

    useEffect(() => {
        const query = searchQuery.toLowerCase().trim();
        if (!query) {
            setFilteredPapers(papers);
        } else {
            const filtered = papers.filter(paper =>
                paper.title?.toLowerCase().includes(query) ||
                paper.authors?.toLowerCase().includes(query) ||
                paper.journal?.toLowerCase().includes(query) ||
                paper.abstract?.toLowerCase().includes(query)
            );
            setFilteredPapers(filtered);
        }
        setCurrentPage(1);
    }, [searchQuery, papers]);

    if (loading) {
        return (
            <div className="flex justify-center py-12">
                <Loader2 className="animate-spin text-blue-600" size={32} />
            </div>
        );
    }

    // Pagination Logic
    const totalPages = Math.ceil(filteredPapers.length / itemsPerPage);
    const currentPapers = filteredPapers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    return (
        <div>
            <PublicSearchBar
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Search papers by title, author, or journal..."
            />

            {filteredPapers.length === 0 ? (
                <div className="text-center py-12">
                    <p className="text-(--text-muted)">{searchQuery ? "No papers match your search." : "Will be added soon."}</p>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {currentPapers.map((paper) => (
                            <PaperCard key={paper.id} paper={paper} />
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

export default PaperList;
