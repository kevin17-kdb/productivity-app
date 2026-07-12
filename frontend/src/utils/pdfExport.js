import jsPDF from "jspdf";

export function exportToPDF(title, content) {

    const pdf = new jsPDF();

    pdf.setFont("helvetica");

    pdf.setFontSize(22);

    pdf.text(title, 20, 20);

    pdf.setFontSize(12);

    const lines = pdf.splitTextToSize(content, 170);

    pdf.text(lines, 20, 35);

    pdf.save(`${title}.pdf`);

}