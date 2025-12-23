'use client';

import { FileText, Download, Shield } from 'lucide-react';
import { generatePolicyDocument } from '../../../../utils/pdfGenerator';

export default function DocumentsPage() {
    // Mock Data
    const policies = [
        {
            id: 1,
            policyNumber: "FL-2024-8892",
            firstName: "Max",
            lastName: "Mustermann",
            dob: "1985-04-12",
            amount: 250000,
            term: 20,
            premium: 24.50,
            startDate: "2024-10-24",
            type: "Term Life Insurance"
        }
    ];

    const handleDownload = (policy) => {
        generatePolicyDocument(policy);
    };

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-heading font-bold text-trust-900">My Documents</h1>

            <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100">
                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <Shield className="h-5 w-5 text-trust-600" />
                    Active Policies
                </h2>

                <div className="space-y-4">
                    {policies.map((policy) => (
                        <div key={policy.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100 hover:bg-white hover:shadow-md transition-all">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-white rounded-lg border border-gray-200 text-trust-600">
                                    <FileText className="h-6 w-6" />
                                </div>
                                <div>
                                    <div className="font-bold text-gray-900">{policy.type}</div>
                                    <div className="text-sm text-gray-500">Policy No: {policy.policyNumber}</div>
                                </div>
                            </div>

                            <button
                                onClick={() => handleDownload(policy)}
                                className="flex items-center gap-2 px-4 py-2 bg-trust-100 text-trust-700 rounded-lg hover:bg-trust-200 transition-colors font-semibold"
                            >
                                <Download className="h-4 w-4" />
                                Download PDF
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100">
                <h2 className="text-xl font-bold text-gray-900 mb-6 text-gray-400">Archived Documents</h2>
                <div className="text-center py-8 text-gray-400">
                    No archived documents found.
                </div>
            </div>
        </div>
    );
}
