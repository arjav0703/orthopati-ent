import exp from "constants";
import { jsPDF } from "jspdf";

function generatePDF(patient) {
  if (!patient) return;

  const pdf = new jsPDF("p", "mm", "a4");
  const margin = 10;
  let y = margin;

  // Title
  pdf.setFontSize(18);
  pdf.text("Patient Details", margin, y);
  y += 10;

  // Patient Information
  pdf.setFontSize(12);
  pdf.text(`Name: ${patient.name}`, margin, y);
  y += 7;
  pdf.text(`Age: ${patient.age}`, margin, y);
  y += 7;
  pdf.text(`Sex: ${patient.sex}`, margin, y);
  y += 7;
  if (patient.contact) {
    pdf.text(`Contact: ${patient.contact}`, margin, y);
    y += 7;
  }
  pdf.text(`Diagnosis: ${patient.diagnosis || "N/A"}`, margin, y);
  y += 7;
  pdf.text(`Notes: ${patient.notes || "N/A"}`, margin, y);
  y += 10;

  // Visits History
  if (patient.visits.length > 0) {
    pdf.setFontSize(14);
    pdf.text("Visits History", margin, y);
    y += 10;

    pdf.setFontSize(12);
    patient.visits.forEach((visit, index) => {
      pdf.text(`Visit ${index + 1}:`, margin, y);
      y += 7;
      pdf.text(`  Date: ${visit.date}`, margin, y);
      y += 7;
      pdf.text(`  Diagnosis: ${visit.diagnosis || "N/A"}`, margin, y);
      y += 7;
      pdf.text(`  Prescription: ${visit.prescription || "N/A"}`, margin, y);
      y += 7;
      pdf.text(`  Notes: ${visit.notes || "N/A"}`, margin, y);
      y += 10;

      // Add a new page if the content exceeds the page height
      if (y > pdf.internal.pageSize.getHeight() - margin) {
        pdf.addPage();
        y = margin;
      }
    });
  } else {
    pdf.text("No visits recorded.", margin, y);
  }

  // Save the PDF
  pdf.save(`${patient.name}-details.pdf`);
}

export default generatePDF;
