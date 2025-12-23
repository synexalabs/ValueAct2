'use client';

import React from 'react';
import Link from 'next/link';
import {
    Calculator,
    Shield,
    DollarSign,
    Heart,
    TrendingUp,
    BarChart3,
    FileText,
    Download,
    Database
} from 'lucide-react';
import { getCalculatorColors } from '../../../utils/designSystem';

const CalculatorHub = () => {
    const calculators = [
        {
            id: 'ifrs17',
            title: 'IFRS 17 Engine',
            description: 'Determine CSM, Risk Adjustment, and BEL for individual contracts using our core cloud logic.',
            icon: Calculator,
            color: 'trust',
            features: ['CSM Determination', 'Risk Adjustment Analysis', 'BEL Projections', 'Loss Component Tracking'],
            route: '/calculators/ifrs17'
        },
        {
            id: 'solvency',
            title: 'Solvency II Audit',
            description: 'Validate SCR, MCR, and capital ratios against regulatory benchmarks in real-time.',
            icon: Shield,
            color: 'growth',
            features: ['SCR Stress Testing', 'MCR Calibration', 'Solvency Ratio Audit', 'Pillar 1 Capital Check'],
            route: '/calculators/solvency'
        },
        {
            id: 'pricing',
            title: 'Premium Modeler',
            description: 'Calibrate premiums and profit margins with advanced sensitivity analysis for any product.',
            icon: DollarSign,
            color: 'accent',
            features: ['Premium Calibration', 'Profit Sensitivity', 'Expense Loading', 'Break-even Forecast'],
            route: '/calculators/pricing'
        },
        {
            id: 'mortality',
            title: 'Actuarial Tables',
            description: 'Access and compute with the latest German mortality tables and life expectancy curves.',
            icon: Heart,
            color: 'trust',
            features: ['DAV 2008 T/R Tables', 'Projected Life Expectancy', 'Annuity Present Value', 'Risk Assessment'],
            route: '/calculators/mortality'
        }
    ];

    return (
        <div className="space-y-12">
            {/* Header */}
            <div className="flex flex-col items-center text-center">
                <div className="px-4 py-1.5 bg-trust-50 text-trust-600 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] mb-4 border border-trust-100">
                    Precision Tools
                </div>
                <h1 className="text-4xl md:text-5xl font-heading font-bold text-trust-900 mb-4">Actuarial Sandbox</h1>
                <p className="max-w-2xl text-lg text-gray-400">
                    High-precision ad-hoc calculators for single-policy validation, scenario testing, and quick architectural review.
                </p>
            </div>

            {/* Batch Processing Notice */}
            <div className="relative group overflow-hidden bg-gradient-to-br from-trust-900 to-trust-950 rounded-[2.5rem] p-10 text-white shadow-2xl">
                <div className="absolute top-0 right-0 p-12 opacity-10 group-hover:scale-110 transition-transform duration-700">
                    <Database className="h-40 w-40" />
                </div>
                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="space-y-4 max-w-xl text-center md:text-left">
                        <h3 className="text-2xl font-heading font-bold">Scaling to Production?</h3>
                        <p className="text-white/70 leading-relaxed text-lg">
                            For bulk data processing, automated cloud valuations, and IFRS 17 batch runs,
                            leverage our unified Data Management infrastructure.
                        </p>
                    </div>
                    <Link
                        href="/data"
                        className="px-8 py-4 bg-growth-600 text-white rounded-2xl font-bold hover:bg-growth-500 transition-all shadow-lg shadow-growth-900/40 active:scale-95 flex items-center gap-2"
                    >
                        <Database className="h-5 w-5" />
                        Enter Data Hub
                    </Link>
                </div>
            </div>

            {/* Calculators Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {calculators.map((calc, idx) => {
                    const colors = {
                        trust: 'bg-trust-50 text-trust-600 border-trust-100',
                        growth: 'bg-growth-50 text-growth-600 border-growth-100',
                        accent: 'bg-accent-50 text-accent-700 border-accent-100'
                    };
                    const hoverColors = {
                        trust: 'hover:border-trust-300',
                        growth: 'hover:border-growth-300',
                        accent: 'hover:border-accent-300'
                    };

                    return (
                        <div
                            key={calc.id}
                            className={`group bg-white rounded-[2rem] border border-gray-100 p-8 shadow-sm hover:shadow-xl transition-all duration-500 ${hoverColors[calc.color]}`}
                        >
                            <div className="flex items-start justify-between mb-8">
                                <div className={`p-4 rounded-2xl ${colors[calc.color]} shadow-inner`}>
                                    <calc.icon className="h-8 w-8" />
                                </div>
                                <div className="text-[10px] font-bold text-gray-300 uppercase tracking-widest bg-gray-50 px-3 py-1 rounded-lg">
                                    V1.2 Tool
                                </div>
                            </div>

                            <h2 className="text-2xl font-heading font-bold text-trust-900 mb-3">{calc.title}</h2>
                            <p className="text-gray-400 text-sm leading-relaxed mb-8">
                                {calc.description}
                            </p>

                            <div className="space-y-3 mb-8">
                                {calc.features.map((feature, i) => (
                                    <div key={i} className="flex items-center gap-3">
                                        <div className={`h-1.5 w-1.5 rounded-full ${calc.color === 'trust' ? 'bg-trust-600' : calc.color === 'growth' ? 'bg-growth-600' : 'bg-accent-600'}`} />
                                        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">{feature}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="flex items-center gap-3">
                                <Link
                                    href={calc.route}
                                    className="flex-1 px-6 py-4 bg-trust-950 text-white rounded-2xl font-bold text-center hover:bg-trust-900 transition-all shadow-md active:scale-95"
                                >
                                    Activate Tool
                                </Link>
                                <button className="p-4 border border-gray-100 rounded-2xl text-gray-400 hover:text-trust-900 hover:bg-gray-50 transition-all">
                                    <Download className="h-5 w-5" />
                                </button>
                            </div>
                        </div>
                    )
                })}
            </div>

            {/* Professional Features Section */}
            <div className="rounded-[3rem] bg-gray-50/50 border border-gray-100 p-12 lg:p-16">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-heading font-bold text-trust-900 mb-4">Enterprise-Grade Architecture</h2>
                    <p className="text-gray-400">Our sandbox environment mirrors the precision of our enterprise batch processing engine.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                    {[
                        { icon: FileText, title: 'Session Persistence', desc: 'Auto-save your session variables and calculation history for auditing.', color: 'text-trust-600' },
                        { icon: Download, title: 'Multi-Format Export', desc: 'Generate executive PDFs or raw CSV exports for external verification.', color: 'text-growth-600' },
                        { icon: BarChart3, title: 'Comparative Logic', desc: 'Analyze results side-by-side with historical runs and industry benchmarks.', color: 'text-accent-600' }
                    ].map((feature, i) => (
                        <div key={i} className="flex flex-col items-center text-center group">
                            <div className="h-16 w-16 rounded-2xl bg-white shadow-sm flex items-center justify-center mb-6 border border-gray-100 group-hover:shadow-md transition-shadow">
                                <feature.icon className={`h-8 w-8 ${feature.color}`} />
                            </div>
                            <h3 className="text-lg font-bold text-trust-900 mb-2">{feature.title}</h3>
                            <p className="text-sm text-gray-400 leading-relaxed">{feature.desc}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Regulatory Alignment */}
            <div className="flex flex-col md:flex-row items-center gap-4 justify-center py-6">
                <div className="h-px bg-gray-100 flex-1" />
                <div className="flex items-center gap-6 opacity-40 hover:opacity-100 transition-opacity grayscale hover:grayscale-0">
                    <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">Aligned with:</div>
                    <div className="text-sm font-heading font-black text-trust-900">IFRS 17</div>
                    <div className="text-sm font-heading font-black text-trust-900">SOLVENCY II</div>
                    <div className="text-sm font-heading font-black text-trust-900">BaFin COMPLIANT</div>
                </div>
                <div className="h-px bg-gray-100 flex-1" />
            </div>
        </div>
    );
};

export default CalculatorHub;
