'use client';

import { FileText, Download, ShieldCheck, Zap, FolderSearch, Clock } from 'lucide-react';
import { generatePolicyDocument } from '../../../../utils/pdfGenerator';
import { motion } from 'framer-motion';

export default function DocumentsPage() {
    // Mock Data
    const policies = [
        {
            id: 1,
            policyNumber: "FL-2024-8892",
            firstName: "Max",
            lastName: "Weber",
            dob: "1985-04-12",
            amount: 250000,
            term: 20,
            premium: 24.50,
            startDate: "2024-10-24",
            type: "Term Life Platinum"
        }
    ];

    const handleDownload = (policy) => {
        generatePolicyDocument(policy);
    };

    return (
        <div className="max-w-4xl mx-auto space-y-10 pb-20">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <div className="flex items-center gap-2 mb-3">
                        <FolderSearch className="h-4 w-4 text-trust-600 fill-trust-600" />
                        <span className="text-[10px] font-black text-trust-600 uppercase tracking-[0.3em]">Compliance Repository</span>
                    </div>
                    <h1 className="text-4xl font-heading font-black text-trust-900 tracking-tight leading-none">
                        Smart <span className="text-trust-600">Vault.</span>
                    </h1>
                    <p className="mt-4 text-gray-400 font-medium max-w-md">
                        Access and manage your certified legal documentation, policy certificates, and coverage records.
                    </p>
                </div>
            </div>

            {/* Active Documents Section */}
            <div className="bg-white rounded-[2.5rem] shadow-glass border border-gray-100 overflow-hidden relative p-8 md:p-12">
                <div className="absolute top-0 right-0 w-64 h-64 bg-trust-50/50 blur-[100px] rounded-full pointer-events-none" />

                <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-8 flex items-center gap-3">
                    <ShieldCheck className="h-4 w-4 text-trust-900" />
                    Certified Coverage Certificates
                </h2>

                <div className="grid gap-4 relative z-10">
                    {policies.map((policy) => (
                        <motion.div
                            key={policy.id}
                            whileHover={{ y: -2 }}
                            className="flex flex-col md:flex-row md:items-center justify-between p-6 bg-gray-50/50 rounded-2xl border border-gray-100 group transition-all"
                        >
                            <div className="flex items-center gap-6 mb-6 md:mb-0">
                                <div className="h-16 w-16 bg-white rounded-2xl border border-gray-100 flex items-center justify-center text-trust-900 shadow-sm group-hover:bg-trust-900 group-hover:text-white transition-all">
                                    <FileText className="h-8 w-8" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-[10px] font-black text-trust-600 uppercase tracking-widest">Type: {policy.type}</span>
                                        <div className="h-1 w-1 rounded-full bg-gray-300" />
                                        <span className="text-[10px] font-black text-growth-500 uppercase tracking-widest">Active</span>
                                    </div>
                                    <div className="text-lg font-black text-trust-900 font-heading tracking-tight leading-none mb-1">Coverage Certificate</div>
                                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">ID: {policy.policyNumber}</div>
                                </div>
                            </div>

                            <button
                                onClick={() => handleDownload(policy)}
                                className="group flex items-center justify-center gap-3 px-8 py-4 bg-trust-900 text-white rounded-xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-trust-950 transition-all shadow-xl shadow-trust-900/10 active:scale-95"
                            >
                                <Download className="h-4 w-4 text-growth-400 group-hover:translate-y-0.5 transition-transform" />
                                Secure Download (PDF)
                            </button>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Archive Section */}
            <div className="bg-gray-50/50 rounded-[2.5rem] border border-gray-100 p-8 md:p-12 relative overflow-hidden">
                <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-white/50 blur-[50px] rounded-full pointer-events-none" />

                <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-10 flex items-center gap-3">
                    <Clock className="h-4 w-4" />
                    Archive Repository
                </h2>

                <div className="flex flex-col items-center justify-center py-16 text-center space-y-4">
                    <div className="h-16 w-16 bg-white rounded-3xl flex items-center justify-center text-gray-200 border border-gray-100">
                        <FolderSearch size={24} />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Zero Historical Entries</p>
                        <p className="text-[9px] font-medium text-gray-300 uppercase tracking-widest mt-2 max-w-[200px] mx-auto leading-relaxed">System only displays records from the current fiscal period.</p>
                    </div>
                </div>
            </div>

            {/* Support Callout */}
            <div className="p-8 bg-trust-950 text-white rounded-[2.5rem] flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                    <Zap size={100} className="text-growth-400" />
                </div>
                <div className="relative z-10 text-center md:text-left">
                    <h3 className="text-xl font-heading font-black tracking-tight mb-2 uppercase">Missing a document?</h3>
                    <p className="text-trust-400 text-xs font-medium max-w-sm">Contact our premium support desk for direct access to offline archival records from 2010-2023.</p>
                </div>
                <button className="relative z-10 px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl font-black text-[10px] uppercase tracking-widest transition-all">
                    Reach Advisor
                </button>
            </div>
        </div>
    );
}
