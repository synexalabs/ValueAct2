const ExcelJS = require('exceljs');
const PDFDocument = require('pdfkit');
const logger = require('../utils/logger');

class ExportService {
    /**
     * Export calculation results to Excel
     */
    async exportToExcel(results, options = {}) {
        logger.info('Generating Excel export');
        const workbook = new ExcelJS.Workbook();
        workbook.creator = 'Valuact';
        workbook.created = new Date();

        // Summary sheet
        const summarySheet = workbook.addWorksheet('Summary');
        summarySheet.columns = [
            { header: 'Metric', key: 'metric', width: 30 },
            { header: 'Value', key: 'value', width: 20 }
        ];

        // Accommodate structure differences
        const agg = results.aggregate_results || results;

        summarySheet.addRow({ metric: 'Total CSM', value: agg.total_csm || agg.csm });
        summarySheet.addRow({ metric: 'Total FCF', value: agg.total_fcf || agg.fcf });
        summarySheet.addRow({ metric: 'Total Risk Adjustment', value: agg.total_risk_adjustment || agg.ra });
        summarySheet.addRow({ metric: 'Solvency Ratio', value: agg.solvency_ratio });

        // Detailed sheet
        if (results.policy_results && results.policy_results.length > 0) {
            const policySheet = workbook.addWorksheet('Detailed Results');
            const headers = Object.keys(results.policy_results[0]);
            policySheet.columns = headers.map(h => ({ header: h, key: h, width: 15 }));
            policySheet.addRows(results.policy_results);
        }

        // Generated Buffer
        const buffer = await workbook.xlsx.writeBuffer();
        return buffer;
    }

    /**
     * Export calculation results to PDF
     */
    async exportToPDF(results, options = {}) {
        logger.info('Generating PDF export');
        return new Promise((resolve, reject) => {
            const doc = new PDFDocument();
            const chunks = [];

            doc.on('data', chunk => chunks.push(chunk));
            doc.on('end', () => resolve(Buffer.concat(chunks)));
            doc.on('error', reject);

            // Header
            doc.fontSize(20).text('Valuact Calculation Report', { align: 'center' });
            doc.moveDown();
            doc.fontSize(10).text(`Generated: ${new Date().toLocaleString()}`, { align: 'right' });
            doc.moveDown(2);

            // Summary Section
            const agg = results.aggregate_results || results;

            doc.fontSize(14).text('Executive Summary', { underline: true });
            doc.moveDown();
            doc.fontSize(12);

            const addMetric = (label, value) => {
                doc.text(`${label}:`, { continued: true });
                doc.text(` ${value !== undefined ? value.toLocaleString() : 'N/A'}`, { align: 'right' });
            };

            addMetric('Total CSM', agg.total_csm || agg.csm);
            addMetric('Total FCF', agg.total_fcf || agg.fcf);
            addMetric('Total Risk Adjustment', agg.total_risk_adjustment || agg.ra);

            if (agg.solvency_ratio) {
                doc.moveDown();
                doc.fontSize(12).fillColor(agg.solvency_ratio > 1.5 ? 'green' : 'red');
                doc.text(`Solvency Ratio: ${(agg.solvency_ratio * 100).toFixed(1)}%`);
                doc.fillColor('black');
            }

            doc.moveDown(2);

            // Audit info
            doc.fontSize(14).text('Audit Information', { underline: true });
            doc.fontSize(10);
            doc.moveDown();

            if (results.audit_trail) {
                if (results.audit_trail.methodologyVersion) {
                    doc.text(`Methodology: ${results.audit_trail.methodologyVersion}`);
                }

                if (results.audit_trail.calculationSteps) {
                    doc.moveDown();
                    doc.text('Key Calculation Steps:');
                    results.audit_trail.calculationSteps.slice(0, 10).forEach((step, i) => {
                        doc.text(`${i + 1}. ${step.name}`);
                    });
                    if (results.audit_trail.calculationSteps.length > 10) {
                        doc.text('... (full steps in detailed audit log)');
                    }
                }
            } else {
                doc.text('No detailed audit trail available for this run.');
            }

            doc.end();
        });
    }
}

module.exports = new ExportService();
