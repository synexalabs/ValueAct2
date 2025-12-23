'use client';

import React, { useState } from 'react';
import { BookOpen, Calculator, Shield, DollarSign, Heart, TrendingUp, ChevronDown, ChevronRight, Zap, ArrowRight, Binary } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Methodology = () => {
    const [expandedSections, setExpandedSections] = useState({
        ifrs17: true,
        solvency: false,
        pricing: false,
        mortality: false
    });

    const toggleSection = (section) => {
        setExpandedSections(prev => ({
            ...prev,
            [section]: !prev[section]
        }));
    };

    const methodologySections = [
        {
            id: 'ifrs17',
            title: 'IFRS 17 Methodology',
            icon: Calculator,
            color: 'trust',
            description: 'Institutional framework for Contractual Service Margin (CSM), Risk Adjustment, and Loss component valuation.',
            subsections: [
                {
                    title: 'Contractual Service Margin (CSM)',
                    content: `The CSM represents the unearned profit in an insurance contract. It is calculated as:

CSM = Fulfilment Cash Flows - Risk Adjustment - Loss Component

Where:
- Fulfilment Cash Flows = Expected Premiums - Expected Benefits - Expected Expenses
- Risk Adjustment = Compensation for non-financial risk
- Loss Component = Recognition of onerous contracts

The CSM is released over the service period in proportion to the services provided.`
                },
                {
                    title: 'Risk Adjustment',
                    content: `Risk Adjustment compensates for the non-financial risk inherent in insurance contracts. It is calculated using:

Risk Adjustment = Σ(Probability × Risk-free Value × Risk Factor)

Where:
- Probability = Likelihood of each scenario
- Risk-free Value = Present value of cash flows
- Risk Factor = Risk adjustment factor for each scenario`
                }
            ]
        },
        {
            id: 'solvency',
            title: 'Solvency II Methodology',
            icon: Shield,
            color: 'growth',
            description: 'Capital adequacy protocols including SCR, MCR, and risk-weighted buffer computations.',
            subsections: [
                {
                    title: 'Solvency Capital Requirement (SCR)',
                    content: `The SCR represents the capital needed to ensure a 99.5% confidence level of survival over one year.

SCR = √(Σ Σ ρij × SCRi × SCRj)

Where:
- SCRi = Capital requirement for risk module i
- ρij = Correlation coefficient between risk modules i and j

Risk modules include: Market Risk, Life Risk, Health Risk, Non-life Risk, Credit Risk, Operational Risk.`
                }
            ]
        },
        {
            id: 'pricing',
            title: 'Pricing Methodology',
            icon: DollarSign,
            color: 'accent',
            description: 'Premium calculation engine based on equivalence principles and dynamic profit testing.',
            subsections: [
                {
                    title: 'Premium Calculation',
                    content: `Premiums are calculated using the equivalence principle:

Premium = Present Value of Benefits + Present Value of Expenses + Profit Loading

Where:
- Present Value of Benefits = Σ(Benefits × Discount Factor)
- Present Value of Expenses = Σ(Expenses × Discount Factor)
- Profit Loading = Required profit margin`
                }
            ]
        }
    ];

    return (
        <div className="min-h-screen bg-white font-sans selection:bg-trust-100 selection:text-trust-900">
            {/* Hero Section */}
            <div className="relative py-24 px-6 border-b border-gray-100 overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-trust-50/50 blur-[120px] rounded-full -mr-48 -mt-24 pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-growth-50/30 blur-[100px] rounded-full -ml-32 -mb-16 pointer-events-none" />

                <div className="max-w-7xl mx-auto relative z-10">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="h-1px w-10 bg-trust-900" />
                        <span className="text-[10px] font-black text-trust-600 uppercase tracking-[0.4em]">Actuarial Node 01</span>
                    </div>
                    <h1 className="text-6xl lg:text-8xl font-heading font-black text-trust-950 tracking-tighter leading-none mb-8">
                        The Science of <span className="text-gray-300">Trust.</span>
                    </h1>
                    <p className="text-xl text-gray-400 font-medium max-w-2xl leading-relaxed">
                        Explore the mathematical foundations of our platform. We combine IFRS 17 rigor with Solvency II precision to deliver institutional-grade insurance services.
                    </p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-20">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
                    {/* Main Content */}
                    <div className="lg:col-span-8 space-y-8">
                        {methodologySections.map((section) => {
                            const isExpanded = expandedSections[section.id];

                            return (
                                <motion.div
                                    key={section.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    className={`group border border-gray-100 rounded-[2.5rem] overflow-hidden transition-all duration-500 ${isExpanded ? 'bg-white shadow-2xl shadow-gray-200/50' : 'bg-gray-50/50 hover:bg-white hover:shadow-xl hover:shadow-gray-200/30'}`}
                                >
                                    <button
                                        onClick={() => toggleSection(section.id)}
                                        className="w-full p-10 text-left relative"
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex gap-6">
                                                <div className={`p-4 rounded-2xl bg-white shadow-sm border border-gray-100 transition-transform group-hover:scale-110 ${isExpanded ? 'scale-110 ring-4 ring-trust-50' : ''}`}>
                                                    <section.icon size={28} className="text-trust-900" />
                                                </div>
                                                <div className="max-w-md">
                                                    <h2 className="text-[11px] font-black text-trust-900 uppercase tracking-[0.3em] mb-2">{section.title}</h2>
                                                    <p className="text-gray-400 text-sm font-medium leading-relaxed">{section.description}</p>
                                                </div>
                                            </div>
                                            <div className={`mt-2 p-2 rounded-full border border-gray-100 transition-all ${isExpanded ? 'rotate-180 bg-trust-950 text-white' : 'text-gray-400'}`}>
                                                <ChevronDown size={20} />
                                            </div>
                                        </div>
                                    </button>

                                    <AnimatePresence>
                                        {isExpanded && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                                            >
                                                <div className="px-10 pb-10 space-y-6">
                                                    {section.subsections.map((sub, idx) => (
                                                        <div key={idx} className="p-8 bg-gray-50 rounded-3xl border border-gray-100 group/sub">
                                                            <div className="flex items-center gap-3 mb-4">
                                                                <Binary size={16} className="text-growth-500" />
                                                                <h3 className="text-sm font-black text-trust-950 uppercase tracking-widest">{sub.title}</h3>
                                                            </div>
                                                            <pre className="text-xs font-mono text-gray-500 bg-white p-6 rounded-2xl border border-gray-100 whitespace-pre-wrap leading-relaxed shadow-inner">
                                                                {sub.content}
                                                            </pre>
                                                        </div>
                                                    ))}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </motion.div>
                            );
                        })}
                    </div>

                    {/* Sidebar Resources */}
                    <div className="lg:col-span-4 space-y-10">
                        <section>
                            <div className="flex items-center gap-3 mb-6">
                                <Zap size={18} className="text-trust-900" />
                                <h3 className="text-sm font-black text-trust-900 uppercase tracking-[0.2em]">Quick Resources</h3>
                            </div>
                            <div className="space-y-4">
                                {[
                                    { label: 'IFRS 17 Standards', tag: 'Official' },
                                    { label: 'Solvency II Handbook', tag: 'Regulatory' },
                                    { label: 'Actuarial Ethics 2024', tag: 'Legal' }
                                ].map((item, i) => (
                                    <button key={i} className="w-full flex items-center justify-between p-5 rounded-2xl bg-white border border-gray-100 hover:border-trust-200 hover:shadow-lg hover:shadow-trust-900/5 transition-all group">
                                        <div className="flex flex-col items-start">
                                            <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-1">{item.tag}</span>
                                            <span className="text-xs font-black text-trust-950 uppercase tracking-tighter">{item.label}</span>
                                        </div>
                                        <ArrowRight size={16} className="text-gray-300 group-hover:text-trust-900 group-hover:translate-x-1 transition-all" />
                                    </button>
                                ))}
                            </div>
                        </section>

                        <section className="p-8 bg-trust-950 rounded-[2.5rem] text-white relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-6 opacity-10">
                                <TrendingUp size={80} />
                            </div>
                            <div className="relative z-10">
                                <h3 className="text-xl font-heading font-black tracking-tight mb-4 uppercase">Verification?</h3>
                                <p className="text-trust-400 text-xs font-medium leading-relaxed mb-6">Our algorithms are audited annually by external actuarial firms to ensure 100% compliance with EU directives.</p>
                                <button className="w-full py-4 bg-growth-500 hover:bg-growth-400 text-trust-950 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all shadow-lg shadow-growth-500/20">
                                    Download Audit Report
                                </button>
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Methodology;
