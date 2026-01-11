import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Award, ShieldCheck } from 'lucide-react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';

const CertificateVerification = () => {
    const [certId, setCertId] = useState('');
    const navigate = useNavigate();

    const handleSearch = (e) => {
        e.preventDefault();
        if (certId.trim()) {
            navigate(`/cirt/${certId.trim()}`);
        }
    };

    return (
        <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 bg-(--bg-primary) transition-colors duration-300">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-xl text-center"
            >
                <div className="mx-auto w-20 h-20 bg-blue-100 dark:bg-(--bg-secondary) rounded-full flex items-center justify-center mb-8 text-blue-600 dark:text-blue-400">
                    <Award size={40} />
                </div>

                <h1 className="text-3xl md:text-4xl font-bold text-(--text-primary) mb-4">
                    Verify Certificate
                </h1>
                <p className="text-(--text-secondary) mb-8 text-lg">
                    Enter the uniquely generated certificate ID to verify its authenticity and view details.
                </p>

                <form onSubmit={handleSearch} className="relative max-w-lg mx-auto">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-(--text-muted)" size={24} />
                        <input
                            type="text"
                            value={certId}
                            onChange={(e) => setCertId(e.target.value)}
                            placeholder="Enter Certificate ID (e.g., IEEE-2024-1234)"
                            className="w-full pl-14 pr-32 py-4 rounded-2xl bg-(--bg-surface) border border-(--border-subtle) focus:border-(--ieee-blue) focus:ring-4 focus:ring-(--ieee-blue)/10 outline-hidden text-lg text-(--text-primary) transition-all shadow-(--shadow-md) dark:shadow-none"
                        />
                        <button
                            type="submit"
                            className="absolute right-2 top-2 bottom-2 px-6 bg-(--ieee-blue) hover:bg-(--ieee-dark-blue) text-white font-bold rounded-xl transition-colors"
                        >
                            Verify
                        </button>
                    </div>
                </form>

                <div className="mt-12 flex items-center justify-center gap-2 text-(--text-muted) text-sm">
                    <ShieldCheck size={16} className="text-emerald-500" />
                    <span>Secured by IEEE {'<NAME>'} Student Branch</span>
                </div>
            </motion.div>
        </div>
    );
};

export default CertificateVerification;
