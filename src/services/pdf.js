import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export const PDFService = {
    async generateCertificate(element, fileName = "certificate.pdf") {
        if (!element) return;

        try {
            // Render the element to a canvas
            const canvas = await html2canvas(element, {
                scale: 2, // Higher resolution
                useCORS: true,
                logging: false,
                backgroundColor: '#ffffff'
            });

            const imgData = canvas.toDataURL('image/png');

            // Create PDF (Landscape A4)
            // A4 dimensions in mm: 297 x 210
            const pdf = new jsPDF({
                orientation: 'landscape',
                unit: 'mm',
                format: 'a4'
            });

            const imgProps = pdf.getImageProperties(imgData);
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(fileName);

            return true;
        } catch (error) {
            console.error("PDF Generation Error:", error);
            throw error;
        }
    }
};
