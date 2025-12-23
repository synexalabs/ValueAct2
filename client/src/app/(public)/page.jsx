'use client';

import Navbar from '../../components/Navbar';
import { Shield, Zap, Heart, Check, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

export default function LandingPage() {
    const [age, setAge] = useState(30);
    const [amount, setAmount] = useState(250000);

    // Simple estimation logic
    const price = ((amount / 100000) * 2.5 * (1 + (age - 20) * 0.03)).toFixed(2);

    return (
        <div className="min-h-screen bg-white">
            <Navbar />

            {/* Hero Section */}
            <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-[1000px] bg-gradient-to-br from-trust-50/50 to-white -z-10 rounded-b-[5rem]" />
                <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-trust-100/20 blur-[120px] rounded-full -z-10" />

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid lg:grid-cols-2 gap-20 items-center">
                        <div className="animate-fade-in-up">
                            <div className="inline-flex items-center gap-3 px-5 py-2.5 bg-growth-50 text-growth-700 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-8 border border-growth-100 shadow-sm">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-growth-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-growth-500"></span>
                                </span>
                                #1 Rated Digital Claims 2024
                            </div>
                            <h1 className="text-6xl lg:text-8xl font-heading font-black text-trust-950 leading-[0.95] mb-8 tracking-tighter">
                                Life <span className="text-trust-600">Insurance</span> <br />
                                <span className="italic font-light">Reimagined.</span>
                            </h1>
                            <p className="text-xl text-gray-400 mb-10 max-w-lg leading-relaxed font-medium">
                                German engineering meets modern simplicity. Secure your legacy with a fully digital architecture in under 5 minutes.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-5 mb-14">
                                <Link href="/get-quote" className="group flex items-center justify-center px-10 py-5 bg-trust-950 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-trust-900 transition-all hover:-translate-y-1 shadow-2xl shadow-trust-900/20 active:scale-95">
                                    Calculate Coverage
                                    <ArrowRight size={18} className="ml-3 text-growth-400 group-hover:translate-x-1 transition-transform" />
                                </Link>
                                <button className="flex items-center justify-center px-10 py-5 bg-white text-trust-900 border border-gray-100 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-gray-50 transition-all shadow-sm active:scale-95">
                                    Core Architecture
                                </button>
                            </div>

                            <div className="flex flex-wrap gap-10 text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">
                                <div className="flex items-center gap-3">
                                    <div className="h-2 w-2 rounded-full bg-growth-500" />
                                    BaFin Regulated
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="h-2 w-2 rounded-full bg-growth-500" />
                                    TÜV Certified
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="h-2 w-2 rounded-full bg-growth-500" />
                                    Instant Liquidity
                                </div>
                            </div>
                        </div>

                        {/* Calculator Widget */}
                        <div className="relative animate-scale-in" style={{ animationDelay: '0.2s' }}>
                            <div className="absolute -inset-10 bg-gradient-to-tr from-trust-200/30 to-growth-200/30 rounded-[4rem] blur-[80px] opacity-40"></div>
                            <div className="relative bg-white/80 backdrop-blur-2xl rounded-[3rem] p-10 shadow-glass border border-white/50">
                                <div className="flex items-center justify-between mb-10">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-black text-trust-600 uppercase tracking-[0.3em] mb-1">Precision Quote</span>
                                        <h3 className="text-3xl font-heading font-black text-trust-950 tracking-tight">Quick Estimate.</h3>
                                    </div>
                                    <div className="h-12 w-12 bg-trust-950 rounded-2xl flex items-center justify-center text-growth-400 shadow-lg">
                                        <Zap size={24} className="fill-growth-400" />
                                    </div>
                                </div>

                                <div className="space-y-10">
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-end">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Target Age</label>
                                            <span className="text-lg font-black text-trust-900">{age} <span className="text-[10px] text-gray-400 ml-0.5">YRS</span></span>
                                        </div>
                                        <input
                                            type="range"
                                            min="18"
                                            max="65"
                                            value={age}
                                            onChange={(e) => setAge(parseInt(e.target.value))}
                                            className="w-full h-1.5 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-trust-950"
                                        />
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex justify-between items-end">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Coverage Target</label>
                                            <span className="text-lg font-black text-trust-900">€{amount.toLocaleString()}</span>
                                        </div>
                                        <input
                                            type="range"
                                            min="50000"
                                            max="1000000"
                                            step="10000"
                                            value={amount}
                                            onChange={(e) => setAmount(parseInt(e.target.value))}
                                            className="w-full h-1.5 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-trust-950"
                                        />
                                    </div>

                                    <div className="pt-8 border-t border-gray-100">
                                        <div className="flex justify-between items-center mb-10">
                                            <div className="flex flex-col">
                                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Monthly Settlement</span>
                                                <div className="flex items-baseline gap-1">
                                                    <span className="text-5xl font-heading font-black text-trust-950 tracking-tighter">€{price}</span>
                                                    <span className="text-[10px] font-bold text-gray-400 uppercase">/ Month</span>
                                                </div>
                                            </div>
                                        </div>

                                        <button className="w-full py-5 bg-trust-950 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-trust-900 transition-all shadow-2xl shadow-trust-900/20 active:scale-95">
                                            Finalize Verification
                                        </button>
                                        <p className="text-[8px] font-bold text-gray-400 text-center uppercase tracking-widest mt-6">
                                            *Calculated for non-smoker based on dynamic health parameters.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Grid */}
            <section className="py-32 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-3xl mx-auto mb-20">
                        <span className="text-[10px] font-black text-growth-600 uppercase tracking-[0.4em]">Core Foundations</span>
                        <h2 className="mt-4 text-5xl font-heading font-black text-trust-950 tracking-tight leading-[1.1]">The New Standard in <br />Financial Protection.</h2>
                    </div>

                    <div className="grid md:grid-cols-3 gap-12">
                        {[
                            {
                                icon: Shield,
                                title: "Neural Architecture",
                                desc: "Proprietary risk assessment engine for instantaneous, precise coverage allocation."
                            },
                            {
                                icon: Heart,
                                title: "Bespoke Guidance",
                                desc: "Elite advisors synchronized with your digital portfolio 24/7 for total visibility."
                            },
                            {
                                icon: Check,
                                title: "Infinite Flexibility",
                                desc: "Policies that breathe with your life. Daily liquidity options with zero lock-in."
                            }
                        ].map((feature, i) => (
                            <div key={i} className="p-10 rounded-[3rem] bg-gray-50/50 border border-gray-100 hover:bg-white hover:shadow-glass hover:-translate-y-2 transition-all duration-500 group">
                                <div className="w-16 h-16 bg-white rounded-[1.5rem] flex items-center justify-center shadow-sm mb-8 text-trust-900 group-hover:bg-trust-950 group-hover:text-white transition-all duration-500">
                                    <feature.icon size={32} />
                                </div>
                                <h3 className="text-xl font-black font-heading text-trust-900 mb-4 uppercase tracking-tight">{feature.title}</h3>
                                <p className="text-sm text-gray-500 font-medium leading-relaxed">{feature.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}
