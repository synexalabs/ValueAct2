/**
 * Export Button Component
 * Provides functionality to export calculations to CSV, PDF, and print
 */

import React from 'react';
import { Download, FileText, Printer, Copy, Check } from 'lucide-react';
import jsPDF from 'jspdf';
import { useReactToPrint } from 'react-to-print';
import { formatCSV, formatCurrency, formatNumber } from '../utils/formatters';

const ExportButton = ({ 
  data, 
  title = 'Calculation Results', 
  filename = 'calculation_results',
  showCSV = true,
  showPDF = true,
  showPrint = true,
  showCopy = true,
  className = ''
}) => {
  const [copied, setCopied] = React.useState(false);
  const printRef = React.useRef();

  // Export to CSV
  const exportToCSV = () => {
    if (!data || data.length === 0) {
      alert('No data to export');
      return;
    }

    const columns = Object.keys(data[0]);
    const csvContent = formatCSV(data, columns);
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export to PDF
  const exportToPDF = () => {
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(16);
    doc.text(title, 20, 20);
    
    // Add date
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 30);
    
    // Add data table
    if (data && data.length > 0) {
      const columns = Object.keys(data[0]);
      const tableData = data.map(row => 
        columns.map(col => {
          const value = row[col];
          if (typeof value === 'number') {
            if (col.toLowerCase().includes('currency') || col.toLowerCase().includes('amount')) {
              return formatCurrency(value);
            } else if (col.toLowerCase().includes('percent') || col.toLowerCase().includes('ratio')) {
              return `${formatNumber(value, 2)}%`;
            } else {
              return formatNumber(value, 2);
            }
          }
          return String(value);
        })
      );
      
      // Simple table implementation
      let y = 50;
      const cellHeight = 7;
      const colWidth = 30;
      
      // Headers
      doc.setFontSize(12);
      columns.forEach((col, index) => {
        doc.text(col, 20 + (index * colWidth), y);
      });
      
      y += cellHeight;
      
      // Data rows
      doc.setFontSize(10);
      tableData.forEach(row => {
        row.forEach((cell, index) => {
          doc.text(cell, 20 + (index * colWidth), y);
        });
        y += cellHeight;
        
        // Add new page if needed
        if (y > 280) {
          doc.addPage();
          y = 20;
        }
      });
    }
    
    doc.save(`${filename}.pdf`);
  };

  // Copy to clipboard
  const copyToClipboard = async () => {
    if (!data || data.length === 0) {
      alert('No data to copy');
      return;
    }

    const columns = Object.keys(data[0]);
    const csvContent = formatCSV(data, columns);
    
    try {
      await navigator.clipboard.writeText(csvContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
      alert('Failed to copy to clipboard');
    }
  };

  // Print functionality
  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    documentTitle: title,
    pageStyle: `
      @page {
        size: A4;
        margin: 1in;
      }
      @media print {
        body { font-family: Arial, sans-serif; }
        .print-header { font-size: 18px; font-weight: bold; margin-bottom: 20px; }
        .print-table { width: 100%; border-collapse: collapse; }
        .print-table th, .print-table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        .print-table th { background-color: #f2f2f2; }
      }
    `
  });

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {showCSV && (
        <button
          onClick={exportToCSV}
          className="flex items-center space-x-2 px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm"
        >
          <Download className="h-4 w-4" />
          <span>CSV</span>
        </button>
      )}
      
      {showPDF && (
        <button
          onClick={exportToPDF}
          className="flex items-center space-x-2 px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm"
        >
          <FileText className="h-4 w-4" />
          <span>PDF</span>
        </button>
      )}
      
      {showPrint && (
        <button
          onClick={handlePrint}
          className="flex items-center space-x-2 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
        >
          <Printer className="h-4 w-4" />
          <span>Print</span>
        </button>
      )}
      
      {showCopy && (
        <button
          onClick={copyToClipboard}
          className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors text-sm ${
            copied 
              ? 'bg-green-500 text-white' 
              : 'bg-gray-500 text-white hover:bg-gray-600'
          }`}
        >
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          <span>{copied ? 'Copied!' : 'Copy'}</span>
        </button>
      )}
      
      {/* Hidden print content */}
      <div style={{ display: 'none' }}>
        <div ref={printRef}>
          <div className="print-header">{title}</div>
          <div>Generated on: {new Date().toLocaleDateString()}</div>
          {data && data.length > 0 && (
            <table className="print-table">
              <thead>
                <tr>
                  {Object.keys(data[0]).map(col => (
                    <th key={col}>{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.map((row, index) => (
                  <tr key={index}>
                    {Object.values(row).map((value, cellIndex) => (
                      <td key={cellIndex}>
                        {typeof value === 'number' ? formatNumber(value, 2) : String(value)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExportButton;
