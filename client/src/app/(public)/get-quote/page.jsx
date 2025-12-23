'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, DollarSign, Heart, Shield, Check, Calendar, ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import Navbar from '../../../components/Navbar';

export default function GetQuotePage() {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        birthDate: '',
        smoker: 'no',
        coverageAmount: 250000,
        duration: 20,
        healthConditions: []
    });

    const updateFormData = (key, value) => {
        setFormData(prev => ({ ...prev, [key]: value }));
    };

    const nextStep = () => setStep(prev => prev + 1);
    const prevStep = () => setStep(prev => prev - 1);

    // Calculate dummy premium based on inputs
    const baseRate = 5.0; // Base cost per month
    const coverageFactor = formData.coverageAmount / 100000;
    const smokerFactor = formData.smoker === 'yes' ? 1.5 : 1.0;
    const ageFactor = 1.0;

    const monthlyPremium = (baseRate * coverageFactor * smokerFactor * ageFactor).toFixed(2);

    const steps = [
        { id: 1, title: 'Profile', icon: User },
        { id: 2, title: 'Quantum', icon: DollarSign },
        { id: 3, title: 'Biology', icon: Heart },
        { id: 4, title: 'Synthesis', icon: Shield }
    ];

    const progress = (step / steps.length) * 100;

    return (
        <div className="min-h-screen bg-white font-sans relative overflow-hidden">
            <Navbar />

            {/* Background Decorative Elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-trust-50 rounded-full blur-[120px] opacity-60" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-growth-50 rounded-full blur-[120px] opacity-60" />
            </div>

            <div className="relative z-10 pt-32 pb-20 px-6 lg:px-8 max-w-4xl mx-auto">
                <header className="text-center mb-16">
                    <span className="text-[10px] font-black text-trust-600 uppercase tracking-[0.4em] mb-4 block">Coverage Engine v4.0</span>
                    <h1 className="text-5xl font-heading font-black text-trust-950 tracking-tighter leading-none">
                        Establish Your <span className="text-trust-600">Legacy.</span>
                    </h1>
                </header>

                {/* Progress Header */}
                <div className="mb-12">
                    <div className="flex justify-between mb-6 relative">
                        <div className="absolute top-4 left-0 w-full h-[1px] bg-gray-100 -z-10" />
                        {steps.map((s) => (
                            <div key={s.id} className="flex flex-col items-center flex-1">
                                <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 transition-all duration-500 ${s.id === step
                                    ? 'bg-trust-950 text-white shadow-xl shadow-trust-900/20 scale-110'
                                    : s.id < step
                                        ? 'bg-growth-500 text-white'
                                        : 'bg-white border border-gray-100 text-gray-300'
                                    }`}>
                                    {s.id < step ? <Check className="w-5 h-5" /> : <s.icon className="w-4 h-4" />}
                                </div>
                                <span className={`text-[9px] font-black uppercase tracking-widest ${s.id === step ? 'text-trust-950' : 'text-gray-300'}`}>
                                    {s.title}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Form Card */}
                <div className="bg-white/80 backdrop-blur-2xl rounded-[3rem] shadow-glass border border-white/50 overflow-hidden relative min-h-[500px]">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={step}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.4, ease: "circOut" }}
                            className="p-10 lg:p-16"
                        >
                            {step === 1 && (
                                <div className="space-y-10">
                                    <div className="space-y-4">
                                        <h2 className="text-3xl font-heading font-black text-trust-950 uppercase tracking-tight">Identity Parameters.</h2>
                                        <p className="text-gray-400 font-medium leading-relaxed">Input your core biometric data for the actuarial risk assessment.</p>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-2">
                                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Legal First Name</label>
                                            <input
                                                type="text"
                                                className="w-full px-6 py-4 rounded-2xl bg-gray-50/50 border border-gray-100 focus:border-trust-900 focus:ring-0 transition-all outline-none font-bold text-trust-900"
                                                placeholder="Max"
                                                value={formData.firstName}
                                                onChange={(e) => updateFormData('firstName', e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Legal Surname</label>
                                            <input
                                                type="text"
                                                className="w-full px-6 py-4 rounded-2xl bg-gray-50/50 border border-gray-100 focus:border-trust-900 focus:ring-0 transition-all outline-none font-bold text-trust-900"
                                                placeholder="Mustermann"
                                                value={formData.lastName}
                                                onChange={(e) => updateFormData('lastName', e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Registry Birth Date</label>
                                        <div className="relative">
                                            <Calendar className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-300" />
                                            <input
                                                type="date"
                                                className="w-full pl-16 pr-6 py-4 rounded-2xl bg-gray-50/50 border border-gray-100 focus:border-trust-900 focus:ring-0 transition-all outline-none font-bold text-trust-900"
                                                value={formData.birthDate}
                                                onChange={(e) => updateFormData('birthDate', e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Nicotine Usage Protocol</label>
                                        <div className="flex gap-4">
                                            {['no', 'yes'].map((option) => (
                                                <button
                                                    key={option}
                                                    onClick={() => updateFormData('smoker', option)}
                                                    className={`flex-1 py-5 rounded-2xl border font-black text-[10px] uppercase tracking-[0.2em] transition-all shadow-sm ${formData.smoker === option
                                                        ? 'border-trust-900 bg-trust-950 text-white'
                                                        : 'border-gray-100 hover:border-gray-200 text-gray-400'
                                                        }`}
                                                >
                                                    {option === 'no' ? 'Non-User' : 'Active User'}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {step === 2 && (
                                <div className="space-y-12">
                                    <div className="space-y-4">
                                        <h2 className="text-3xl font-heading font-black text-trust-950 uppercase tracking-tight">Quantum Allocation.</h2>
                                        <p className="text-gray-400 font-medium">Calibrate your asset protection and term duration.</p>
                                    </div>

                                    <div className="space-y-8">
                                        <div className="p-8 bg-gray-50/50 border border-gray-100 rounded-[2.5rem]">
                                            <div className="flex justify-between items-end mb-6">
                                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Asset Target</label>
                                                <span className="text-3xl font-heading font-black text-trust-950">€{formData.coverageAmount.toLocaleString()}</span>
                                            </div>
                                            <input
                                                type="range"
                                                min="50000"
                                                max="1000000"
                                                step="10000"
                                                value={formData.coverageAmount}
                                                onChange={(e) => updateFormData('coverageAmount', parseInt(e.target.value))}
                                                className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-trust-950"
                                            />
                                            <div className="flex justify-between text-[8px] font-bold text-gray-400 uppercase tracking-widest mt-4">
                                                <span>Minimum Protection</span>
                                                <span>Maximum Protection</span>
                                            </div>
                                        </div>

                                        <div className="p-8 bg-gray-50/50 border border-gray-100 rounded-[2.5rem]">
                                            <div className="flex justify-between items-end mb-6">
                                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Active Horizon</label>
                                                <span className="text-3xl font-heading font-black text-trust-950">{formData.duration} <span className="text-sm">Years</span></span>
                                            </div>
                                            <input
                                                type="range"
                                                min="5"
                                                max="40"
                                                step="1"
                                                value={formData.duration}
                                                onChange={(e) => updateFormData('duration', parseInt(e.target.value))}
                                                className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-trust-950"
                                            />
                                            <div className="flex justify-between text-[8px] font-bold text-gray-400 uppercase tracking-widest mt-4">
                                                <span>Agile Term</span>
                                                <span>Life Horizon</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {step === 3 && (
                                <div className="space-y-10">
                                    <div className="space-y-4">
                                        <h2 className="text-3xl font-heading font-black text-trust-950 uppercase tracking-tight">Biological Audit.</h2>
                                        <p className="text-gray-400 font-medium leading-relaxed">Brief diagnostic check to calibrate the Neural Architecture risk model.</p>
                                    </div>

                                    <div className="space-y-4">
                                        {[
                                            'Cardiovascular Integrity',
                                            'Oncology History',
                                            'Metabolic Balance',
                                            'Respiratory Function'
                                        ].map((condition, idx) => (
                                            <div key={idx} className="flex items-center justify-between p-6 bg-gray-50/30 border border-gray-100 rounded-2xl hover:border-trust-200 transition-all group">
                                                <span className="text-[10px] font-black text-trust-900 uppercase tracking-widest">{condition}</span>
                                                <div className="flex gap-3">
                                                    <button className="px-5 py-2 rounded-xl border border-gray-100 text-[9px] font-black uppercase tracking-widest bg-white hover:bg-trust-950 hover:text-white transition-all">Cleared</button>
                                                    <button className="px-5 py-2 rounded-xl border border-gray-100 text-[9px] font-black uppercase tracking-widest bg-white hover:bg-red-600 hover:text-white transition-all">Flagged</button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="p-6 bg-trust-50 rounded-2xl border border-trust-100 flex items-center gap-4">
                                        <div className="h-6 w-6 bg-trust-950 rounded-lg flex items-center justify-center">
                                            <Shield className="h-3 w-3 text-growth-400" />
                                        </div>
                                        <p className="text-[9px] font-bold text-trust-600 uppercase tracking-[0.2em]">Data encrypted via 256-bit SHA-3 protocol.</p>
                                    </div>
                                </div>
                            )}

                            {step === 4 && (
                                <div className="text-center space-y-12">
                                    <div className="inline-flex p-6 bg-growth-50 rounded-[2rem] text-growth-600 mb-4 border border-growth-100 shadow-sm relative animate-pulse">
                                        <Shield className="w-12 h-12" />
                                    </div>
                                    <div className="space-y-4">
                                        <h2 className="text-5xl font-heading font-black text-trust-950 tracking-tighter leading-none uppercase">Analysis <br /><span className="text-trust-600">Complete.</span></h2>
                                        <p className="text-lg text-gray-400 font-medium">Neural Architecture has generated your primary coverage node.</p>
                                    </div>

                                    <div className="relative group">
                                        <div className="absolute -inset-4 bg-gradient-to-tr from-trust-400/20 to-growth-400/20 rounded-[4rem] blur-[40px] opacity-50 group-hover:opacity-100 transition-opacity"></div>
                                        <div className="relative bg-trust-950 text-white p-12 rounded-[3rem] shadow-2xl overflow-hidden border border-white/10">
                                            <div className="absolute top-0 right-0 p-10 opacity-10">
                                                <Shield className="w-40 h-40" />
                                            </div>

                                            <div className="relative z-10 space-y-8 text-center">
                                                <div>
                                                    <p className="text-[10px] font-black text-trust-400 uppercase tracking-[0.4em] mb-4">Monthly Settlement</p>
                                                    <div className="flex items-baseline justify-center gap-2">
                                                        <span className="text-7xl font-heading font-black tracking-tighter">€{monthlyPremium}</span>
                                                        <span className="text-[10px] font-black text-trust-400 uppercase">/ Month</span>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-2 gap-8 py-8 border-y border-white/5">
                                                    <div>
                                                        <p className="text-[9px] font-black text-trust-400 uppercase tracking-[0.2em] mb-1">Face Value</p>
                                                        <p className="text-xl font-bold">€{formData.coverageAmount.toLocaleString()}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-[9px] font-black text-trust-400 uppercase tracking-[0.2em] mb-1">Term Active</p>
                                                        <p className="text-xl font-bold">{formData.duration} Years</p>
                                                    </div>
                                                </div>

                                                <button className="group w-full py-6 bg-white text-trust-950 rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] shadow-xl hover:bg-growth-400 hover:text-white transition-all transform hover:-translate-y-1 flex items-center justify-center gap-3">
                                                    Initialize Secure Activation
                                                    <ArrowRight size={16} className="text-trust-600 group-hover:text-white group-hover:translate-x-1 transition-all" />
                                                </button>

                                                <div className="flex items-center justify-center gap-3 text-[8px] font-bold text-trust-400 uppercase tracking-widest">
                                                    <Check size={12} className="text-growth-400" /> Instant Digital Issue
                                                    <span className="opacity-20">•</span>
                                                    <Check size={12} className="text-growth-400" /> BaFin Regulated
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                        Quote ID: QR-{Math.random().toString(36).substr(2, 6).toUpperCase()} • Active for 48h
                                    </p>
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>

                    {/* Navigation Buttons */}
                    {step < 4 && (
                        <div className="bg-gray-50/50 p-8 flex justify-between items-center border-t border-gray-100 px-10">
                            <button
                                onClick={prevStep}
                                disabled={step === 1}
                                className={`flex items-center px-8 py-4 font-black text-[10px] uppercase tracking-[0.2em] rounded-2xl transition-all ${step === 1 ? 'opacity-0 pointer-events-none' : 'text-gray-400 hover:text-trust-950 hover:bg-white border border-transparent hover:border-gray-100'
                                    }`}
                            >
                                <ChevronLeft className="w-4 h-4 mr-2" /> Previous Step
                            </button>

                            <button
                                onClick={nextStep}
                                className="group flex items-center px-10 py-5 bg-trust-950 text-white font-black text-[10px] uppercase tracking-[0.2em] rounded-2xl hover:bg-trust-900 shadow-xl shadow-trust-900/10 transition-all hover:-translate-y-0.5 active:scale-95"
                            >
                                {step === 3 ? 'Finalize Synthesis' : 'Next Parameter'} <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>
                    )}
                </div>

                <div className="mt-12 text-center">
                    <Link href="/" className="text-[10px] font-black text-gray-300 hover:text-trust-950 uppercase tracking-[0.3em] transition-colors">
                        Return to Architecture Overview
                    </Link>
                </div>
            </div>
        </div>
    );
}
