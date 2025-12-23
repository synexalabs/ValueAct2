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
                <div className="absolute top-0 left-0 w-full h-[800px] bg-gradient-to-br from-trust-50 to-white -z-10 rounded-b-[4rem]" />

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <div className="animate-fade-in-up">
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-growth-50 text-growth-700 rounded-full text-sm font-semibold mb-6 border border-growth-100">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-growth-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-growth-500"></span>
                                </span>
                                #1 Rated for Digital Claims
                            </div>
                            <h1 className="text-5xl lg:text-7xl font-heading font-bold text-trust-950 leading-[1.1] mb-6">
                                Life Insurance, <br />
                                <span className="text-gradient-trust">Reimagined.</span>
                            </h1>
                            <p className="text-xl text-trust-600 mb-8 max-w-lg leading-relaxed">
                                Experience German engineering meets modern simplicity.
                                Get fully digital coverage in under 5 minutes. No paperwork, just peace of mind.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-4 mb-12">
                                <Link href="/get-quote" className="flex items-center justify-center px-8 py-4 bg-trust-600 text-white rounded-2xl font-bold text-lg hover:bg-trust-700 transition-all hover:-translate-y-1 shadow-warm hover:shadow-lg">
                                    Check Your Price
                                    <ArrowRight className="ml-2 h-5 w-5" />
                                </Link>
                                <button className="flex items-center justify-center px-8 py-4 bg-white text-trust-700 border border-trust-200 rounded-2xl font-bold text-lg hover:bg-trust-50 transition-all">
                                    How it Works
                                </button>
                            </div>

                            <div className="flex gap-8 text-sm font-medium text-trust-500">
                                <div className="flex items-center gap-2">
                                    <Check className="h-5 w-5 text-growth-500" />
                                    BaFin Regulated
                                </div>
                                <div className="flex items-center gap-2">
                                    <Check className="h-5 w-5 text-growth-500" />
                                    TÜV Certified
                                </div>
                                <div className="flex items-center gap-2">
                                    <Check className="h-5 w-5 text-growth-500" />
                                    Cancel Daily
                                </div>
                            </div>
                        </div>

                        {/* Calculator Widget */}
                        <div className="relative animate-scale-in" style={{ animationDelay: '0.2s' }}>
                            <div className="absolute -inset-4 bg-gradient-to-r from-trust-100 to-growth-100 rounded-[2.5rem] blur-2xl opacity-50"></div>
                            <div className="relative bg-white rounded-[2rem] p-8 shadow-glass border border-trust-100">
                                <div className="flex items-center justify-between mb-8">
                                    <h3 className="text-2xl font-heading font-bold text-trust-900">Quick Estimate</h3>
                                    <div className="p-2 bg-trust-50 rounded-full text-trust-600">
                                        <Zap className="h-5 w-5" />
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-semibold text-trust-700 mb-2">Age</label>
                                        <input
                                            type="range"
                                            min="18"
                                            max="65"
                                            value={age}
                                            onChange={(e) => setAge(parseInt(e.target.value))}
                                            className="w-full h-2 bg-trust-100 rounded-lg appearance-none cursor-pointer accent-trust-600"
                                        />
                                        <div className="mt-2 text-right font-bold text-trust-900">{age} Years</div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-trust-700 mb-2">Coverage Amount</label>
                                        <input
                                            type="range"
                                            min="50000"
                                            max="1000000"
                                            step="10000"
                                            value={amount}
                                            onChange={(e) => setAmount(parseInt(e.target.value))}
                                            className="w-full h-2 bg-trust-100 rounded-lg appearance-none cursor-pointer accent-trust-600"
                                        />
                                        <div className="mt-2 text-right font-bold text-trust-900">€{amount.toLocaleString()}</div>
                                    </div>

                                    <div className="pt-6 border-t border-trust-50">
                                        <div className="flex justify-between items-end mb-2">
                                            <span className="text-trust-500 font-medium">Monthly Premium</span>
                                            <span className="text-4xl font-bold text-trust-900">€{price}</span>
                                        </div>
                                        <p className="text-xs text-trust-400 text-right mb-6">*Sample calculation for non-smoker</p>

                                        <button className="w-full py-4 bg-trust-900 text-white rounded-xl font-bold text-lg hover:bg-trust-800 transition-colors shadow-lg">
                                            Lock in this Price
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Grid */}
            <section className="py-24 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <span className="text-growth-600 font-semibold tracking-wide uppercase">Why FairLife</span>
                        <h2 className="mt-3 text-4xl font-heading font-bold text-trust-950">Insurance that actually works for you</h2>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            {
                                icon: Shield,
                                title: "Full Digital Protection",
                                desc: "No paperwork, no fax machines. Manage everything from your phone."
                            },
                            {
                                icon: Heart,
                                title: "Human Support",
                                desc: "Real experts available 24/7 via chat or phone when you need them."
                            },
                            {
                                icon: Check,
                                title: "Daily Cancellation",
                                desc: "Stay because you want to, not because you have to. Flexible contracts."
                            }
                        ].map((feature, i) => (
                            <div key={i} className="p-8 rounded-3xl bg-trust-50/50 border border-trust-100 hover:bg-white hover:shadow-xl transition-all duration-300">
                                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm mb-6 text-trust-600">
                                    <feature.icon className="h-7 w-7" />
                                </div>
                                <h3 className="text-xl font-bold text-trust-900 mb-3">{feature.title}</h3>
                                <p className="text-trust-600 leading-relaxed">{feature.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}
