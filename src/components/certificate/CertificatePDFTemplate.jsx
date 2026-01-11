import React, { forwardRef } from 'react';

const CertificatePDFTemplate = forwardRef(({ studentName, eventName, date, refNo }, ref) => {
    return (
        <div
            ref={ref}
            id="certificate-template"
            className="w-[1123px] h-[794px] bg-white relative flex items-center justify-center overflow-hidden border-8 border-(--ieee-blue)"
            style={{
                fontFamily: "'Outfit', sans-serif",
                // Landscape A4 pixels at 96 DPI: 1123 x 794
                // We use standard vanilla CSS for high-fidelity capture
            }}
        >
            {/* Background Decor */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none overflow-hidden">
                <div className="absolute -top-20 -left-20 w-80 h-80 rounded-full bg-(--ieee-blue)"></div>
                <div className="absolute -bottom-20 -right-20 w-96 h-96 rounded-full bg-(--ieee-blue)"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border-(--ieee-blue) rounded-full" style={{ borderWidth: '40px' }}></div>
            </div>

            {/* Inner Border */}
            <div className="absolute inset-6 border-2 border-(--ieee-blue)/20 rounded-sm"></div>

            {/* Content Container */}
            <div className="relative z-10 w-full h-full flex flex-col items-center justify-between py-20 px-32 text-center">

                {/* Header */}
                <div className="flex flex-col items-center">
                    <img src="/logo.png" alt="IEEE Logo" className="w-56 mb-10 h-auto" />
                    <h2 className="text-(--ieee-blue) text-sm font-black tracking-[0.3em] uppercase mb-4">
                        IEEE {'<NAME>'} Student Branch
                    </h2>
                    <div className="w-40 h-[2px] bg-(--ieee-blue)/30 mb-8"></div>
                </div>

                {/* Main Text */}
                <div className="flex-1 flex flex-col items-center justify-center">
                    <h1 className="text-5xl font-black text-(--ieee-dark-blue) mb-12 tracking-tight">
                        CERTIFICATE OF ACHIEVEMENT
                    </h1>

                    <p className="text-xl text-slate-500 font-medium mb-10 italic">
                        This is to certify that
                    </p>

                    <h2 className="text-6xl font-black text-(--ieee-blue) mb-10 tracking-wide border-b-4 border-(--ieee-blue)/10 pb-4 min-w-[500px]">
                        {studentName || "Participant Name"}
                    </h2>

                    <p className="text-xl text-slate-600 leading-relaxed max-w-2xl px-12">
                        has successfully completed and participated in the workshop titled
                        <span className="block mt-4 text-2xl font-bold text-slate-900">
                            "{eventName || "Event Name"}"
                        </span>
                    </p>
                </div>

                {/* Footer / Signatures */}
                <div className="w-full flex items-end justify-between mt-12 pb-4">
                    <div className="flex flex-col items-start gap-1">
                        <div className="w-48 border-b-2 border-slate-900 mb-2"></div>
                        <p className="text-sm font-bold text-slate-900">Branch Counselor</p>
                        <p className="text-[10px] text-slate-500 uppercase tracking-widest">IEEE {'<NAME>'} SB</p>
                    </div>

                    <div className="flex flex-col items-center gap-1">
                        <p className="text-[10px] font-mono text-slate-400 mb-2">REF NO: {refNo || "N/A"}</p>
                        <p className="text-xs font-bold text-slate-900">{date || "January 01, 2026"}</p>
                        <p className="text-[10px] text-slate-500 uppercase tracking-widest">Date of Issue</p>
                    </div>

                    <div className="flex flex-col items-end gap-1">
                        <div className="w-48 border-b-2 border-slate-900 mb-2"></div>
                        <p className="text-sm font-bold text-slate-900">Branch Chair</p>
                        <p className="text-[10px] text-slate-500 uppercase tracking-widest">IEEE {'<NAME>'} SB</p>
                    </div>
                </div>
            </div>
        </div>
    );
});

export default CertificatePDFTemplate;
