// TODO:
// Replace the letterhead text with an actual logo or styled header if desired

import { jsPDF } from "jspdf";

function generatePDF(patient) {
  if (!patient) return;

  const pdf = new jsPDF("p", "mm", "a4");
  const margin = 15;
  let y = margin;

  const lineSpacing = 7;

  // Letterhead
  pdf.setFontSize(16);
  pdf.setFont("helvetica", "bold");
  pdf.text("Bone and Joint Clinic", margin, y);
  y += 6;
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(10);
  pdf.text("Hospital Road, Vidisha, M.P.", margin, y);
  y += 5;
  pdf.text("Phone: 464001-407011 || 464001-237011", margin, y);
  y += 10;

  // Divider
  pdf.setDrawColor(150);
  pdf.line(margin, y, 210 - margin, y);
  y += 10;

  // Title
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(18);
  pdf.text("Patient Details", margin, y);
  y += 10;

  // Patient Information
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(12);
  pdf.text(`Name: ${patient.name}`, margin, y);
  y += lineSpacing;
  pdf.text(`Age: ${patient.age}`, margin, y);
  y += lineSpacing;
  pdf.text(`Sex: ${patient.sex}`, margin, y);
  y += lineSpacing;
  if (patient.contact) {
    pdf.text(`Contact: ${patient.contact}`, margin, y);
    y += lineSpacing;
  }
  pdf.text(`Diagnosis: ${patient.diagnosis || "N/A"}`, margin, y);
  y += lineSpacing;
  pdf.text(`Notes: ${patient.notes || "N/A"}`, margin, y);
  y += 10;

  // Divider
  pdf.setDrawColor(200);
  pdf.line(margin, y, 210 - margin, y);
  y += 10;

  // Visits History
  if (patient.visits.length > 0) {
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(14);
    pdf.text("Visits History", margin, y);
    y += 10;

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(12);
    patient.visits.forEach((visit, index) => {
      pdf.text(`Visit ${index + 1}:`, margin, y);
      y += lineSpacing;
      pdf.text(`  Date: ${visit.date}`, margin, y);
      y += lineSpacing;
      pdf.text(`  Diagnosis: ${visit.diagnosis || "N/A"}`, margin, y);
      y += lineSpacing;
      pdf.text(`  Prescription: ${visit.prescription || "N/A"}`, margin, y);
      y += lineSpacing;
      pdf.text(`  Notes: ${visit.notes || "N/A"}`, margin, y);
      y += 10;

      if (y > pdf.internal.pageSize.getHeight() - margin) {
        pdf.addPage();
        y = margin;
      }
    });
  } else {
    pdf.setFont("helvetica", "italic");
    pdf.text("No visits recorded.", margin, y);
  }

  // Save the PDF
  pdf.save(`${patient.name}-details.pdf`);
}

export default generatePDF;
