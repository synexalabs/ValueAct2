'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileText, CheckCircle2, AlertCircle, Cpu, ShieldCheck, Zap, ArrowRight } from 'lucide-react';

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
        <div className="max-w-4xl mx-auto space-y-10 pb-20">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <div className="flex items-center gap-2 mb-3">
                        <Zap className="h-4 w-4 text-trust-600 fill-trust-600" />
                        <span className="text-[10px] font-black text-trust-600 uppercase tracking-[0.3em]">High Precision Engine</span>
                    </div>
                    <h1 className="text-4xl font-heading font-black text-trust-900 tracking-tight leading-none">
                        Digital <span className="text-trust-600">Claims.</span>
                    </h1>
                    <p className="mt-4 text-gray-400 font-medium max-w-md">
                        Our AI-assisted claims processing ensures your request is handled with speed, transparency, and empathy.
                    </p>
                </div>
            </div>

            <div className="bg-white rounded-[2.5rem] shadow-glass border border-gray-100 overflow-hidden relative">
                {/* Decorative background */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-trust-50/50 blur-[100px] rounded-full pointer-events-none" />

                <AnimatePresence mode="wait">
                    {step === 1 && (
                        <motion.div
                            key="step1"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="p-12 text-center"
                        >
                            <div className="w-24 h-24 bg-trust-950 text-white rounded-[2.5rem] flex items-center justify-center mx-auto shadow-2xl shadow-trust-900/20 mb-10 group-hover:scale-105 transition-transform">
                                <Upload className="h-10 w-10 text-growth-400" />
                            </div>

                            <div className="max-w-md mx-auto mb-10">
                                <h2 className="text-2xl font-black text-trust-900 mb-3 uppercase tracking-tight font-heading">Initiate Submission</h2>
                                <p className="text-gray-400 font-medium leading-relaxed">
                                    Please upload the primary documentation (e.g. Death Certificate, official ID) to begin our automated verification sequence.
                                </p>
                            </div>

                            <label className="inline-flex items-center gap-4 px-10 py-5 bg-trust-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-trust-950 transition-all cursor-pointer shadow-xl shadow-trust-900/10 hover:-translate-y-1 mx-auto active:scale-95 group">
                                <FileText className="h-5 w-5 text-growth-400" />
                                Select Verification Files
                                <input type="file" multiple className="hidden" onChange={handleFileUpload} />
                            </label>

                            <div className="mt-12 flex items-center justify-center gap-8 grayscale opacity-40">
                                <div className="flex items-center gap-2">
                                    <ShieldCheck size={16} />
                                    <span className="text-[9px] font-black uppercase tracking-widest">256-bit AES</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Cpu size={16} />
                                    <span className="text-[9px] font-black uppercase tracking-widest">Neural Scan</span>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {step === 2 && (
                        <motion.div
                            key="step2"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="p-10 space-y-10"
                        >
                            <div className="flex items-center justify-between">
                                <h2 className="text-2xl font-black text-trust-900 uppercase tracking-tight font-heading">Package Ready</h2>
                                <button onClick={() => setStep(1)} className="text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-red-500 transition-colors">Clear All</button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {files.map((file, i) => (
                                    <div key={i} className="flex items-center justify-between p-5 bg-gray-50/50 border border-gray-100 rounded-2xl group hover:border-trust-200 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className="h-10 w-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-trust-900">
                                                <FileText className="h-5 w-5" />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-xs font-bold text-trust-900 truncate max-w-[120px]">{file.name}</span>
                                                <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                                            </div>
                                        </div>
                                        <CheckCircle2 className="h-4 w-4 text-growth-500" />
                                    </div>
                                ))}
                            </div>

                            <div className="bg-trust-950 text-white p-10 rounded-[3rem] relative overflow-hidden shadow-2xl">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-growth-400/10 blur-[80px] rounded-full pointer-events-none" />

                                {isAnalyzing ? (
                                    <div className="space-y-8 relative z-10">
                                        <div className="flex items-center gap-4">
                                            <div className="animate-spin h-6 w-6 border-2 border-growth-400 border-t-transparent rounded-full" />
                                            <h3 className="text-xl font-heading font-black tracking-tight">AI Neural Analysis Active...</h3>
                                        </div>
                                        <div className="space-y-3">
                                            <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                                                <motion.div
                                                    className="h-full bg-gradient-to-r from-growth-600 to-growth-400 shadow-[0_0_15px_rgba(74,222,128,0.5)]"
                                                    initial={{ width: 0 }}
                                                    animate={{ width: '100%' }}
                                                    transition={{ duration: 4 }}
                                                />
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-[9px] font-black text-trust-400 uppercase tracking-[0.2em]">Context Extraction</span>
                                                <span className="text-[9px] font-black text-growth-400 uppercase tracking-[0.2em]">Sequence 04/05</span>
                                            </div>
                                        </div>
                                        <p className="text-trust-400 text-xs italic font-medium">Validating document authenticity and cross-referencing policy FL-99120-X...</p>
                                    </div>
                                ) : (
                                    <div className="space-y-8 relative z-10 text-center md:text-left">
                                        <div className="flex flex-col md:flex-row items-center gap-6">
                                            <div className="h-16 w-16 bg-white/5 border border-white/10 rounded-3xl flex items-center justify-center">
                                                <Cpu className="h-8 w-8 text-growth-400" />
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="text-2xl font-heading font-black tracking-tight mb-2">Accelerate Processing</h3>
                                                <p className="text-trust-300 text-sm font-medium leading-relaxed">
                                                    Deploy our proprietary AI to instantly extract data points and bypass manual triage.
                                                </p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={startAIAnalysis}
                                            className="w-full py-5 bg-white text-trust-950 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-growth-400 hover:text-white transition-all shadow-xl shadow-growth-900/10 active:scale-95"
                                        >
                                            Deploy Neural Processor
                                        </button>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}

                    {step === 3 && (
                        <motion.div
                            key="step3"
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="p-10 space-y-10"
                        >
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-growth-50 text-growth-900 rounded-[2rem] border border-growth-100">
                                <div className="flex items-center gap-4">
                                    <div className="h-12 w-12 bg-growth-100 rounded-2xl flex items-center justify-center text-growth-600">
                                        <ShieldCheck className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <h3 className="font-black font-heading text-lg tracking-tight uppercase">Analysis Validated</h3>
                                        <p className="text-[10px] font-bold uppercase tracking-widest opacity-60">Neural Confidence Rating: {(analysisResult.confidence * 100).toFixed(0)}%</p>
                                    </div>
                                </div>
                                <div className="px-4 py-2 bg-white rounded-xl shadow-sm border border-growth-200 text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                                    <div className="h-1.5 w-1.5 rounded-full bg-growth-500 animate-pulse" />
                                    No Discrepancies Found
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                <div className="space-y-6">
                                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] px-1">Extracted Datapoints</h4>
                                    <div className="space-y-2">
                                        {[
                                            { label: 'Claim Category', value: analysisResult.extractedData.claimType },
                                            { label: 'Linked Policy', value: analysisResult.extractedData.policyMatch },
                                            { label: 'Artifact Identified', value: analysisResult.extractedData.documentType },
                                            { label: 'Event Incident Date', value: analysisResult.extractedData.dateOfEvent },
                                        ].map((item, i) => (
                                            <div key={i} className="flex justify-between items-center p-4 bg-gray-50 border border-gray-100 rounded-xl">
                                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{item.label}</span>
                                                <span className="text-xs font-black text-trust-900">{item.value}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="bg-trust-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden flex flex-col justify-between">
                                    <div className="absolute top-0 right-0 p-8 opacity-10">
                                        <CheckCircle2 size={80} />
                                    </div>
                                    <div className="relative z-10">
                                        <h4 className="text-lg font-black font-heading tracking-tight mb-3">Confirm Accuracy?</h4>
                                        <p className="text-trust-300 text-xs font-medium leading-relaxed mb-10">
                                            The extracted data is matches our core records. Confirming will transmit this claim for immediate disbursement review.
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3 relative z-10">
                                        <button className="py-4 bg-white/10 hover:bg-white/20 border border-white/10 text-white rounded-xl font-black text-[10px] uppercase tracking-widest transition-all">
                                            Manual Edit
                                        </button>
                                        <button
                                            onClick={() => setStep(4)}
                                            className="py-4 bg-growth-400 hover:bg-growth-500 text-trust-900 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all shadow-xl shadow-growth-900/10"
                                        >
                                            Submit Claim
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {step === 4 && (
                        <motion.div
                            key="step4"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="p-16 text-center space-y-10"
                        >
                            <div className="relative inline-block">
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: "spring", damping: 12 }}
                                    className="w-28 h-28 bg-growth-100 text-growth-600 rounded-full flex items-center justify-center mx-auto shadow-inner border-8 border-white"
                                >
                                    <CheckCircle2 className="h-14 w-14" />
                                </motion.div>
                                <div className="absolute -top-4 -right-4 h-10 w-10 bg-trust-900 rounded-2xl flex items-center justify-center text-white shadow-lg animate-bounce">
                                    <Zap size={20} className="text-growth-400" />
                                </div>
                            </div>

                            <div className="max-w-md mx-auto">
                                <h2 className="text-4xl font-black text-trust-900 mb-4 tracking-tight font-heading">Transmission Successful</h2>
                                <p className="text-gray-400 font-medium leading-relaxed">
                                    Reference <span className="text-trust-900 font-bold">CLM-2024-XJF92</span> initiated.
                                    Disbursement verification is currently in priority triage. Expect an update within 4-6 business hours.
                                </p>
                            </div>

                            <div className="pt-10 border-t border-gray-100">
                                <button onClick={() => setStep(1)} className="group flex items-center gap-3 px-8 py-4 bg-trust-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-trust-950 transition-all mx-auto shadow-xl shadow-trust-900/10">
                                    Portal Overview
                                    <ArrowRight size={16} className="text-growth-400 group-hover:translate-x-1 transition-transform" />
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
