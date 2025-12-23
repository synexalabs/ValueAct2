'use client';

import React, { useState } from 'react';
import { User, CreditCard, Shield, CheckCircle2, AlertCircle, Smartphone, ShieldCheck, Zap, ArrowRight, Settings } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ProfilePage() {
    const [verificationStatus, setVerificationStatus] = useState('pending'); // 'pending', 'processing', 'verified'
    const [activeTab, setActiveTab] = useState('identity');

    const startVerification = () => {
        setVerificationStatus('processing');
        // Simulate IDnow API delay
        setTimeout(() => {
            setVerificationStatus('verified');
        }, 3000);
    };

    return (
        <div className="max-w-4xl mx-auto space-y-10 pb-20">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <div className="flex items-center gap-2 mb-3">
                        <Settings className="h-4 w-4 text-trust-600 fill-trust-600" />
                        <span className="text-[10px] font-black text-trust-600 uppercase tracking-[0.3em]">Compliance & Identity</span>
                    </div>
                    <h1 className="text-4xl font-heading font-black text-trust-900 tracking-tight leading-none">
                        Secure <span className="text-trust-600">Settings.</span>
                    </h1>
                    <p className="mt-4 text-gray-400 font-medium max-w-md">
                        Manage your secure identity, payment credentials, and personal protection parameters.
                    </p>
                </div>
            </div>

            <div className="bg-white rounded-[2.5rem] shadow-glass border border-gray-100 overflow-hidden min-h-[600px] flex flex-col md:flex-row relative">
                {/* Decorative Background */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-trust-50/50 blur-[100px] rounded-full pointer-events-none" />

                {/* Side Navigation - Premium Layout */}
                <div className="md:w-72 bg-gray-50/50 p-8 border-r border-gray-100 space-y-3 relative z-10">
                    <p className="px-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Account Nodes</p>
                    {[
                        { id: 'identity', label: 'Identity Verification', icon: ShieldCheck },
                        { id: 'payment', label: 'Payment Channels', icon: CreditCard },
                        { id: 'personal', label: 'Registry Details', icon: User },
                    ].map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 ${activeTab === item.id
                                ? 'bg-trust-900 text-white shadow-xl shadow-trust-900/10'
                                : 'text-gray-500 hover:bg-white hover:text-trust-900'
                                }`}
                        >
                            <item.icon className={`h-4.5 w-4.5 ${activeTab === item.id ? 'text-growth-400' : ''}`} />
                            {item.label}
                        </button>
                    ))}

                    <div className="mt-12 p-6 bg-white rounded-[2rem] border border-gray-100 shadow-sm">
                        <div className="h-8 w-8 bg-growth-50 rounded-xl flex items-center justify-center text-growth-600 mb-4">
                            <Zap size={16} />
                        </div>
                        <h4 className="text-[10px] font-black text-trust-900 uppercase tracking-widest leading-tight">Advanced Guard</h4>
                        <p className="mt-2 text-[9px] font-medium text-gray-400 leading-relaxed uppercase tracking-widest">Biometric override active for this terminal.</p>
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 p-8 md:p-12 relative z-10">
                    <AnimatePresence mode="wait">
                        {activeTab === 'identity' && (
                            <motion.div
                                key="identity"
                                initial={{ opacity: 0, x: 10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -10 }}
                                className="space-y-10"
                            >
                                <div className="space-y-4">
                                    <div className="h-14 w-14 bg-trust-900 text-growth-400 rounded-2xl flex items-center justify-center shadow-lg shadow-trust-900/20 mb-6">
                                        <Smartphone className="h-7 w-7" />
                                    </div>
                                    <h2 className="text-3xl font-heading font-black text-trust-900 tracking-tight uppercase">Video-Ident Authentication</h2>
                                    <p className="text-gray-400 font-medium leading-relaxed max-w-lg">
                                        To finalize your coverage activation under BaFin regulatory standards, a secure video verification is required. This process typically takes 3-5 minutes.
                                    </p>
                                </div>

                                {verificationStatus === 'pending' && (
                                    <div className="bg-accent-50/30 border border-accent-100 rounded-[2.5rem] p-10 text-center space-y-8 relative overflow-hidden group">
                                        <div className="absolute top-0 right-0 p-8 opacity-[0.05] group-hover:scale-125 transition-transform duration-500">
                                            <Shield size={100} className="text-accent-900" />
                                        </div>

                                        <div className="relative z-10">
                                            <div className="h-16 w-16 bg-white rounded-3xl flex items-center justify-center mx-auto shadow-sm mb-6">
                                                <AlertCircle className="h-8 w-8 text-accent-600" />
                                            </div>
                                            <h3 className="text-xl font-heading font-black text-trust-900 uppercase tracking-tight">Identity Pending</h3>
                                            <p className="text-gray-500 font-medium mt-2 max-w-xs mx-auto">Click below to initialize the secure tunnel with IDnow.</p>
                                        </div>

                                        <button
                                            onClick={startVerification}
                                            className="group relative z-10 px-10 py-5 bg-trust-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-trust-950 transition-all shadow-2xl shadow-trust-900/20 active:scale-95 flex items-center gap-3 mx-auto"
                                        >
                                            Initialize Video Tunnel
                                            <ArrowRight size={16} className="text-growth-400 group-hover:translate-x-1 transition-transform" />
                                        </button>
                                    </div>
                                )}

                                {verificationStatus === 'processing' && (
                                    <div className="bg-trust-950 rounded-[2.5rem] p-12 text-center space-y-10 relative overflow-hidden">
                                        <div className="absolute inset-0 bg-gradient-to-br from-trust-900 to-transparent opacity-50" />
                                        <div className="relative z-10">
                                            <div className="animate-spin h-20 w-20 border-4 border-growth-400 border-t-transparent rounded-full mx-auto mb-8 shadow-[0_0_30px_rgba(74,222,128,0.3)]" />
                                            <h3 className="text-2xl font-heading font-black text-white tracking-tight uppercase">Connecting Secure Node...</h3>
                                            <p className="text-trust-400 font-bold text-[10px] uppercase tracking-[0.3em] mt-2">Simulating RSA Handshake</p>
                                        </div>
                                    </div>
                                )}

                                {verificationStatus === 'verified' && (
                                    <motion.div
                                        initial={{ scale: 0.95, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        className="bg-growth-50 border border-growth-100 rounded-[2.5rem] p-12 text-center space-y-8"
                                    >
                                        <div className="h-20 w-20 bg-white rounded-full flex items-center justify-center mx-auto shadow-xl shadow-growth-900/10 border-4 border-growth-100">
                                            <CheckCircle2 className="h-10 w-10 text-growth-500" />
                                        </div>
                                        <div>
                                            <h3 className="text-3xl font-heading font-black text-trust-900 uppercase tracking-tight">Access Verified</h3>
                                            <p className="text-growth-700/60 font-bold text-[10px] uppercase tracking-[0.2em] mt-2">Compliance Record: GR-VO-2024-81</p>
                                        </div>
                                        <div className="inline-flex items-center gap-2 px-6 py-2 bg-white rounded-full text-[10px] font-black text-trust-900 uppercase tracking-widest shadow-sm">
                                            Account Fully Activated
                                        </div>
                                    </motion.div>
                                )}
                            </motion.div>
                        )}

                        {activeTab === 'payment' && (
                            <motion.div
                                key="payment"
                                initial={{ opacity: 0, x: 10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -10 }}
                                className="space-y-10"
                            >
                                <div className="space-y-4">
                                    <h2 className="text-3xl font-heading font-black text-trust-900 tracking-tight uppercase">Payment Channels</h2>
                                    <p className="text-gray-400 font-medium leading-relaxed">
                                        Active direct debit and recurring settlement methods.
                                    </p>
                                </div>

                                <div className="p-8 bg-white border border-gray-100 rounded-[2rem] flex items-center justify-between group hover:border-trust-200 transition-all shadow-sm">
                                    <div className="flex items-center gap-6">
                                        <div className="h-14 w-14 bg-gray-50 rounded-2xl flex items-center justify-center border border-gray-100 group-hover:bg-trust-900 group-hover:text-white transition-colors">
                                            <span className="font-black text-[10px] uppercase">SEPA</span>
                                        </div>
                                        <div>
                                            <p className="text-xs font-black text-trust-900 uppercase tracking-widest">DE89 •••• •••• •••• 1234</p>
                                            <p className="text-[10px] font-medium text-gray-400 mt-1 uppercase tracking-widest">Sparkasse Berlin • Authorized</p>
                                        </div>
                                    </div>
                                    <div className="px-5 py-2 bg-growth-50 text-growth-600 rounded-xl text-[10px] font-black uppercase tracking-widest border border-growth-100">
                                        Primary
                                    </div>
                                </div>

                                <button className="w-full py-6 border-2 border-dashed border-gray-100 rounded-[2rem] text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] hover:border-trust-300 hover:text-trust-600 hover:bg-trust-50/30 transition-all flex items-center justify-center gap-4 group">
                                    <CreditCard className="h-5 w-5 group-hover:scale-110 transition-transform" />
                                    Assign Secondary Channel
                                </button>
                            </motion.div>
                        )}

                        {activeTab === 'personal' && (
                            <motion.div
                                key="personal"
                                initial={{ opacity: 0, x: 10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -10 }}
                                className="space-y-10"
                            >
                                <div className="space-y-4">
                                    <h2 className="text-3xl font-heading font-black text-trust-900 tracking-tight uppercase">Registry Details</h2>
                                    <p className="text-gray-400 font-medium leading-relaxed">
                                        Official policyholder index data. Edits require compliance review.
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                                    {[
                                        { label: 'Primary First Name', value: 'Max' },
                                        { label: 'Register Surname', value: 'Weber' },
                                        { label: 'Digital Mailbox', value: 'max.weber@fairlife.de' },
                                        { label: 'Secure Terminal ID', value: '+49 176 •••• ••88' },
                                        { label: 'Registered Residence', value: 'Pariser Pl. 2, 10117 Berlin' },
                                        { label: 'Legal Domicile', value: 'Germany' },
                                    ].map((field, i) => (
                                        <div key={i} className="space-y-2">
                                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] px-1">{field.label}</label>
                                            <div className="w-full px-6 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl text-xs font-bold text-trust-900 shadow-inner">
                                                {field.value}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="p-6 bg-trust-50 rounded-2xl border border-trust-100 flex items-center gap-4">
                                    <AlertCircle size={20} className="text-trust-600" />
                                    <p className="text-[10px] font-black text-trust-600 uppercase tracking-widest leading-relaxed">
                                        Contact support to modify core registry data (requires KYC re-validation).
                                    </p>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
