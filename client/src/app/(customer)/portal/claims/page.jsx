'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileText, CheckCircle, AlertCircle, Search, Cpu, Send, ShieldCheck } from 'lucide-react';

export default function ClaimsPage() {
    const [step, setStep] = useState(1);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisResult, setAnalysisResult] = useState(null);
    const [files, setFiles] = useState([]);

    const handleFileUpload = (e) => {
        const uploadedFiles = Array.from(e.target.files);
        setFiles(uploadedFiles);
        setStep(2);
    };

    const startAIAnalysis = () => {
        setIsAnalyzing(true);
        // Simulate AI analysis delay
        setTimeout(() => {
            setAnalysisResult({
                status: 'success',
                confidence: 0.98,
                extractedData: {
                    claimType: 'Life Insurance / Death Benefit',
                    policyMatch: 'FL-2024-8892 (Max Mustermann)',
                    documentType: 'Death Certificate',
                    dateOfEvent: '2024-12-15',
                    location: 'Berlin, Germany'
                }
            });
            setIsAnalyzing(false);
            setStep(3);
        }, 4000);
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-20">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-heading font-bold text-trust-900">Digital Claims</h1>
                    <p className="text-gray-500 mt-2">Submit and track your claims with AI-assisted processing.</p>
                </div>
                <div className="flex gap-2 text-xs font-bold uppercase tracking-wider text-trust-400 bg-white px-4 py-2 rounded-full border border-gray-100 shadow-sm">
                    <Cpu className="h-3.5 w-3.5" />
                    AI Assisted Processing Active
                </div>
            </div>

            <div className="bg-white rounded-[2rem] shadow-glass border border-gray-100 overflow-hidden min-h-[500px] flex flex-col">
                <AnimatePresence mode="wait">
                    {step === 1 && (
                        <motion.div
                            key="step1"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="p-12 text-center space-y-8 flex-1 flex flex-col justify-center"
                        >
                            <div className="w-24 h-24 bg-trust-50 text-trust-600 rounded-3xl flex items-center justify-center mx-auto shadow-inner">
                                <Upload className="h-10 w-10" />
                            </div>
                            <div className="max-w-md mx-auto">
                                <h2 className="text-2xl font-bold text-trust-900 mb-2">Upload Documents</h2>
                                <p className="text-gray-500">Please upload the required documents (e.g. Death Certificate, ID of beneficiary) to start the claim process.</p>
                            </div>

                            <label className="inline-flex items-center gap-3 px-8 py-4 bg-trust-600 text-white rounded-2xl font-bold text-lg hover:bg-trust-700 transition-all cursor-pointer shadow-warm mx-auto">
                                <FileText className="h-5 w-5" />
                                Select Files
                                <input type="file" multiple className="hidden" onChange={handleFileUpload} />
                            </label>
                            <p className="text-xs text-gray-400">Supported formats: PDF, JPG, PNG (Max 10MB per file)</p>
                        </motion.div>
                    )}

                    {step === 2 && (
                        <motion.div
                            key="step2"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="p-12 space-y-8 flex-1"
                        >
                            <h2 className="text-2xl font-bold text-trust-900">Documents Received</h2>

                            <div className="space-y-3">
                                {files.map((file, i) => (
                                    <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                                        <div className="flex items-center gap-3">
                                            <FileText className="h-5 w-5 text-trust-500" />
                                            <span className="font-medium text-gray-700">{file.name}</span>
                                        </div>
                                        <span className="text-xs font-bold text-gray-400">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                                    </div>
                                ))}
                            </div>

                            <div className="bg-trust-900 text-white p-8 rounded-3xl relative overflow-hidden">
                                {isAnalyzing ? (
                                    <div className="space-y-6 relative z-10">
                                        <div className="flex items-center gap-3">
                                            <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                                            <span className="font-bold text-lg">AI is analyzing documents...</span>
                                        </div>
                                        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                            <motion.div
                                                className="h-full bg-growth-400"
                                                initial={{ width: 0 }}
                                                animate={{ width: '100%' }}
                                                transition={{ duration: 4 }}
                                            />
                                        </div>
                                        <p className="text-trust-300 text-sm italic">Extracting dates, names, and validating signatures...</p>
                                    </div>
                                ) : (
                                    <div className="space-y-6 relative z-10">
                                        <div className="flex items-center gap-3">
                                            <Cpu className="h-6 w-6 text-growth-400" />
                                            <h3 className="text-xl font-bold">Speed up your claim</h3>
                                        </div>
                                        <p className="text-trust-200">Our AI will instantly extract data from your documents to pre-fill your application and speed up the payout.</p>
                                        <button
                                            onClick={startAIAnalysis}
                                            className="w-full py-4 bg-white text-trust-900 rounded-xl font-bold text-lg hover:bg-trust-50 transition-colors shadow-lg"
                                        >
                                            Start AI Processing
                                        </button>
                                    </div>
                                )}
                                <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/5 rounded-full blur-2xl" />
                            </div>
                        </motion.div>
                    )}

                    {step === 3 && (
                        <motion.div
                            key="step3"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="p-12 space-y-8 flex-1"
                        >
                            <div className="flex items-center gap-4 p-4 bg-growth-50 text-growth-700 rounded-2xl border border-growth-100">
                                <ShieldCheck className="h-8 w-8" />
                                <div>
                                    <h3 className="font-bold text-lg">AI Analysis Complete</h3>
                                    <p className="text-sm opacity-90">Verification confidence: {(analysisResult.confidence * 100).toFixed(0)}%</p>
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <h4 className="font-bold text-gray-400 uppercase text-xs tracking-wider">Extracted Data</h4>
                                    <div className="space-y-3">
                                        {[
                                            { label: 'Claim Type', value: analysisResult.extractedData.claimType },
                                            { label: 'Policy Match', value: analysisResult.extractedData.policyMatch },
                                            { label: 'Document', value: analysisResult.extractedData.documentType },
                                            { label: 'Event Date', value: analysisResult.extractedData.dateOfEvent },
                                        ].map((item, i) => (
                                            <div key={i} className="flex justify-between border-b border-gray-100 pb-2">
                                                <span className="text-sm text-gray-500">{item.label}</span>
                                                <span className="text-sm font-bold text-trust-900">{item.value}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 space-y-4">
                                    <h4 className="font-bold text-trust-900">Is this information correct?</h4>
                                    <p className="text-sm text-gray-500 leading-relaxed">Please review the extracted data. Confirming will move your claim to final human review.</p>
                                    <div className="flex gap-3">
                                        <button className="flex-1 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl font-bold text-sm hover:bg-gray-50">Edit</button>
                                        <button
                                            onClick={() => setStep(4)}
                                            className="flex-1 py-3 bg-trust-600 text-white rounded-xl font-bold text-sm hover:bg-trust-700 shadow-md"
                                        >
                                            Confirm & Submit
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {step === 4 && (
                        <motion.div
                            key="step4"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="p-12 text-center space-y-8 flex-1 flex flex-col justify-center"
                        >
                            <div className="w-24 h-24 bg-growth-100 text-growth-600 rounded-full flex items-center justify-center mx-auto shadow-inner border-4 border-white animate-bounce-short">
                                <CheckCircle className="h-12 w-12" />
                            </div>
                            <div className="max-w-md mx-auto">
                                <h2 className="text-3xl font-bold text-trust-900 mb-4">Claim Submitted!</h2>
                                <p className="text-gray-500 leading-relaxed">
                                    Your claim has been successfully submitted and verified by our AI.
                                    A claims manager will review the final details within 24 hours.
                                </p>
                            </div>

                            <div className="bg-trust-50 rounded-2xl p-6 inline-block mx-auto border border-trust-100">
                                <div className="text-xs font-bold text-trust-400 uppercase mb-1">Claim Reference</div>
                                <div className="text-xl font-mono font-bold text-trust-900">CLM-2024-XJF92</div>
                            </div>

                            <button className="text-trust-600 font-bold hover:text-trust-800 transition-colors">
                                View Status Dashboard &rarr;
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
