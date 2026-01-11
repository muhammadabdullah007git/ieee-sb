import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FirestoreService } from '../../services/firestore';
import { Download, Printer, ExternalLink, CheckCircle, XCircle, ArrowLeft, Loader2 } from 'lucide-react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import CertificatePDFTemplate from '../../components/certificate/CertificatePDFTemplate';
import { PDFService } from '../../services/pdf';
import { useRef } from 'react';

const CertificateResult = () => {
    const { id } = useParams();
    const [certificate, setCertificate] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [generating, setGenerating] = useState(false);
    const certRef = useRef(null);

    useEffect(() => {
        const fetchCert = async () => {
            try {
                // Fetch document by ID directly since we used ID as doc key
                let data = await FirestoreService.getDocument('certificates', id);

                // Fallback: search by 'id' field if doc key doesn't match (for legacy)
                if (!data) {
                    const allCerts = await FirestoreService.getCollection('certificates');
                    data = allCerts.find(c => c.id === id);
                }

                if (data) {
                    setCertificate(data);
                } else {
                    setError(true);
                }
            } catch (err) {
                console.error(err);
                setError(true);
            } finally {
                setLoading(false);
            }
        };
        fetchCert();
    }, [id]);

    const handlePrint = () => {
        window.print();
    };

    const handleDownloadPDF = async () => {
        if (!certRef.current) return;
        setGenerating(true);
        try {
            const fileName = `IEEE_Certificate_${certificate.studentName.replace(/\s+/g, '_')}.pdf`;
            await PDFService.generateCertificate(certRef.current, fileName);
        } catch (error) {
            console.error(error);
            alert("Failed to generate PDF. Please try again.");
        } finally {
            setGenerating(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-(--bg-primary) transition-colors duration-300">
                <Loader2 className="animate-spin text-blue-600" size={48} />
            </div>
        );
    }

    if (error || !certificate) {
        return (
            <div className="min-h-[80vh] flex flex-col items-center justify-center text-center p-6">
                <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center mb-6">
                    <XCircle size={40} />
                </div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Certificate Not Found</h1>
                <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-md">The certificate ID <strong>{id}</strong> could not be verified. Please check the ID and try again.</p>
                <Link to="/certificate" className="text-blue-600 font-medium hover:underline flex items-center gap-2">
                    <ArrowLeft size={16} /> Back to Verification
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-(--bg-secondary) py-12 px-4 transition-colors duration-300">
            <div className="max-w-5xl mx-auto">
                <Link to="/certificate" className="inline-flex items-center gap-2 text-slate-500 hover:text-blue-600 mb-8 transition-colors">
                    <ArrowLeft size={16} /> Back to Search
                </Link>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Details Column */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-(--bg-surface) p-8 rounded-2xl shadow-(--shadow-md) h-fit border-t-4 border-t-(--ieee-blue) border border-(--border-subtle)"
                    >
                        <div className="flex items-center gap-3 text-emerald-600 dark:text-emerald-400 mb-6 bg-(--bg-secondary) p-3 rounded-lg w-fit">
                            <CheckCircle size={20} />
                            <span className="font-bold text-sm uppercase tracking-wider">Verified Authentic</span>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <h3 className="text-xs font-bold text-(--text-muted) uppercase tracking-wider mb-1">Certificate ID</h3>
                                <p className="text-xl font-mono font-bold text-(--text-primary)">{certificate.id}</p>
                            </div>

                            <div>
                                <h3 className="text-xs font-bold text-(--text-muted) uppercase tracking-wider mb-1">Recipient Name</h3>
                                <p className="text-2xl font-bold text-(--text-primary)">{certificate.studentName}</p>
                            </div>

                            <div>
                                <h3 className="text-xs font-bold text-(--text-muted) uppercase tracking-wider mb-1">Event / Achievement</h3>
                                <p className="text-xl font-medium text-(--text-primary)">{certificate.eventName}</p>
                            </div>

                            <div>
                                <h3 className="text-xs font-bold text-(--text-muted) uppercase tracking-wider mb-1">Issue Date</h3>
                                <p className="text-(--text-primary)">
                                    {new Date(certificate.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                                </p>
                            </div>
                        </div>

                        <div className="mt-8 pt-8 border-t border-slate-200 dark:border-slate-700 flex flex-col gap-3">
                            <button
                                onClick={handleDownloadPDF}
                                disabled={generating}
                                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition font-bold disabled:opacity-50"
                            >
                                {generating ? <Loader2 size={20} className="animate-spin" /> : <Download size={20} />}
                                Generate Official PDF
                            </button>
                            <button
                                onClick={handlePrint}
                                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-white rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 transition font-medium"
                            >
                                <Printer size={20} /> Print Certificate
                            </button>
                            <a
                                href={certificate.viewUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="w-full flex items-center justify-center gap-2 px-6 py-3 text-slate-500 hover:text-slate-900 dark:hover:text-white transition text-sm font-medium"
                            >
                                <ExternalLink size={16} /> Open in Google Drive
                            </a>
                        </div>
                    </motion.div>

                    {/* Preview Column */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="lg:col-span-2 bg-(--bg-secondary) rounded-2xl overflow-hidden shadow-inner flex flex-col relative border border-(--border-subtle)"
                    >
                        <div className="absolute top-4 right-4 z-10 bg-black/50 text-white text-xs px-2 py-1 rounded backdrop-blur max-lg:hidden">
                            Preview Mode
                        </div>
                        {/* Google Drive Preview Iframe */}
                        {/* We use the fileId to construct the preview URL */}
                        {certificate.fileId ? (
                            <iframe
                                src={`https://drive.google.com/file/d/${certificate.fileId}/preview`}
                                className="w-full h-[600px] lg:h-full bg-slate-100 dark:bg-slate-800 border-none"
                                title="Certificate Preview"
                                allow="autoplay"
                            ></iframe>
                        ) : (
                            <div className="flex-1 flex items-center justify-center text-slate-500">
                                No Preview Available
                            </div>
                        )}
                    </motion.div>
                </div>

                {/* Hidden Template for PDF Generation */}
                <div className="fixed top-[-9999px] left-[-9999px]">
                    <CertificatePDFTemplate
                        ref={certRef}
                        studentName={certificate.studentName}
                        eventName={certificate.eventName}
                        date={new Date(certificate.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                        refNo={certificate.id}
                    />
                </div>
            </div>
        </div>
    );
};

export default CertificateResult;
