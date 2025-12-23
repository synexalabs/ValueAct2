'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Shield, CheckCircle2, Calendar, TrendingUp, ShieldCheck, Zap, ArrowRight, Activity } from 'lucide-react';

export default function PoliciesPage() {
    const policies = [
        {
            id: 'FL-2024-8892',
            name: 'Term Life Platinum',
            status: 'Active',
            coverage: '€250,000',
            premium: '€24.50',
            nextPayment: '2024-11-24',
            progress: 85,
            color: 'trust'
        },
        {
            id: 'FL-2024-9120',
            name: 'Critical Illness Pro',
            status: 'Under Review',
            coverage: '€50,000',
            premium: '€18.10',
            nextPayment: 'Pending',
            progress: 20,
            color: 'growth'
        }
    ];

    return (
        <div className="max-w-4xl mx-auto space-y-10 pb-20">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <div className="flex items-center gap-2 mb-3">
                        <Activity className="h-4 w-4 text-trust-600 fill-trust-600" />
                        <span className="text-[10px] font-black text-trust-600 uppercase tracking-[0.3em]">Protection Portfolio</span>
                    </div>
                    <h1 className="text-4xl font-heading font-black text-trust-900 tracking-tight leading-none">
                        Active <span className="text-trust-600">Assets.</span>
                    </h1>
                    <p className="mt-4 text-gray-400 font-medium max-w-md">
                        Review your diversified protection layers, coverage boundaries, and active premium schedules.
                    </p>
                </div>
            </div>

            {/* Policy Grid */}
            <div className="grid gap-8">
                {policies.map((policy, i) => (
                    <motion.div
                        key={policy.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="bg-white rounded-[2.5rem] shadow-glass border border-gray-100 overflow-hidden relative group hover:border-trust-200 transition-all p-8 md:p-12"
                    >
                        <div className="absolute top-0 right-0 w-64 h-64 bg-trust-50/50 blur-[100px] rounded-full pointer-events-none -z-10" />

                        <div className="flex flex-col md:flex-row justify-between gap-8 mb-10">
                            <div className="space-y-4">
                                <div className="flex items-center gap-4">
                                    <div className={`h-14 w-14 rounded-2xl flex items-center justify-center shadow-lg transition-transform group-hover:scale-105 ${policy.status === 'Active' ? 'bg-trust-950 text-white' : 'bg-gray-100 text-gray-400'
                                        }`}>
                                        <Shield className="h-7 w-7" />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{policy.id}</span>
                                            <div className="h-1 w-1 rounded-full bg-gray-300" />
                                            <span className={`text-[10px] font-black uppercase tracking-widest ${policy.status === 'Active' ? 'text-growth-500' : 'text-accent-500'
                                                }`}>
                                                {policy.status}
                                            </span>
                                        </div>
                                        <h2 className="text-2xl font-black font-heading tracking-tight text-trust-900 uppercase">{policy.name}</h2>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-8 md:gap-12">
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">Total Value</p>
                                    <p className="text-2xl font-black font-heading text-trust-950 tracking-tight">{policy.coverage}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">Monthly Fee</p>
                                    <p className="text-2xl font-black font-heading text-trust-950 tracking-tight">{policy.premium}</p>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center pt-8 border-t border-gray-100">
                            <div className="flex items-center gap-3">
                                <div className="h-8 w-8 bg-gray-100 rounded-xl flex items-center justify-center text-gray-400">
                                    <Calendar size={16} />
                                </div>
                                <div>
                                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Next Settlement</p>
                                    <p className="text-xs font-bold text-trust-900">{policy.nextPayment}</p>
                                </div>
                            </div>

                            <div className="flex-1 space-y-2">
                                <div className="flex justify-between items-end mb-1">
                                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Growth Maturation</p>
                                    <p className="text-[10px] font-black text-trust-900">{policy.progress}%</p>
                                </div>
                                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${policy.progress}%` }}
                                        className="h-full bg-trust-900 rounded-full"
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end">
                                <button className="flex items-center gap-2 group/btn">
                                    <span className="text-[10px] font-black text-trust-950 uppercase tracking-widest group-hover/btn:mr-2 transition-all">Details</span>
                                    <ArrowRight size={14} className="text-growth-400" />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Expansion Card */}
            <div className="bg-trust-950 text-white rounded-[2.5rem] p-12 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-10">
                <div className="absolute top-0 right-0 p-8 opacity-[0.05]">
                    <ShieldCheck size={160} />
                </div>
                <div className="relative z-10 space-y-4 text-center md:text-left">
                    <div className="h-12 w-12 bg-growth-400/20 rounded-2xl flex items-center justify-center text-growth-400">
                        <TrendingUp size={24} />
                    </div>
                    <h3 className="text-3xl font-black font-heading tracking-tight uppercase leading-none">Enhance Your Layer.</h3>
                    <p className="text-trust-300 text-sm font-medium max-w-sm">
                        Our algorithm identifies a 12% protection gap in your current portfolio. Add a custom layer to secure full peace of mind.
                    </p>
                </div>
                <button className="relative z-10 px-10 py-5 bg-white text-trust-950 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-growth-400 hover:text-white transition-all shadow-xl shadow-growth-900/20 active:scale-95">
                    Consult Expansion Hub
                </button>
            </div>
        </div>
    );
}
