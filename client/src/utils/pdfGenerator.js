import { jsPDF } from 'jspdf';

/**
 * Generates a PDF Policy Document for a given policy
 * @param {Object} policyData - The policy data
 */
export const generatePolicyDocument = (policyData) => {
    const doc = new jsPDF();

    // Header / Branding
    doc.setFillColor(31, 56, 87); // Trust Navy
    doc.rect(0, 0, 210, 40, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont("helvetica", "bold");
    doc.text("FairLife", 20, 25);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("Insurance Certificate", 20, 32);

    // Document Info
    doc.setTextColor(100, 100, 100);
    doc.setFontSize(10);
    doc.text(`Policy No: ${policyData.policyNumber}`, 150, 20);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 150, 26);

    // Title
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("Term Life Insurance Policy", 20, 60);

    // Policy Details Table - using simple text layout for MVP stability vs autoTable
    let y = 80;
    const lineHeight = 10;

    const addRow = (label, value) => {
        doc.setFont("helvetica", "bold");
        doc.text(label, 20, y);
        doc.setFont("helvetica", "normal");
        doc.text(value, 80, y);
        y += lineHeight;
        doc.setDrawColor(220, 220, 220);
        doc.line(20, y - 6, 190, y - 6); // underline
    };

    addRow("Policyholder:", `${policyData.firstName} ${policyData.lastName}`);
    addRow("Date of Birth:", policyData.dob);
    addRow("Coverage Amount:", `EUR ${policyData.amount.toLocaleString()}`);
    addRow("Term Duration:", `${policyData.term} Years`);
    addRow("Monthly Premium:", `EUR ${policyData.premium}`);
    addRow("Start Date:", policyData.startDate);
    addRow("Beneficiaries:", "Legal Heirs (Default)");

    // Legal Footer
    y = 250;
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text("This document is a digital certificate of insurance.", 105, y, { align: "center" });
    doc.text("FairLife GmbH | Musterstraße 123, 10115 Berlin | Reg: HRB 123456", 105, y + 5, { align: "center" });
    doc.text("Authorized by BaFin (Federal Financial Supervisory Authority)", 105, y + 10, { align: "center" });

    doc.save(`FairLife_Policy_${policyData.policyNumber}.pdf`);
};
