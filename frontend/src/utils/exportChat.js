import jsPDF from "jspdf";

export function exportChatPDF(messages) {

    const doc = new jsPDF();

    let y = 20;

    doc.setFontSize(18);

    doc.text("StudyMate AI Chat", 15, y);

    y += 15;

    messages.forEach((msg) => {

        const sender =

            msg.sender === "user"

                ? "You"

                : "StudyMate AI";

        const lines = doc.splitTextToSize(

            `${sender}: ${msg.text}`,

            170

        );

        if (y > 260) {

            doc.addPage();

            y = 20;

        }

        doc.setFontSize(12);

        doc.text(lines, 15, y);

        y += lines.length * 7 + 8;

    });

    doc.save("StudyMateChat.pdf");

}