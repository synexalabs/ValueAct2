'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, ChevronRight, ChevronLeft, Check, Heart, User, DollarSign, Calendar } from 'lucide-react';
import Navbar from '../../../components/Navbar';
import Link from 'next/link';

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
    // Simple age factor approximation (assuming 30 as base)
    const ageFactor = 1.0;

    const monthlyPremium = (baseRate * coverageFactor * smokerFactor * ageFactor).toFixed(2);

    const steps = [
        { id: 1, title: 'About You', icon: User },
        { id: 2, title: 'Coverage', icon: DollarSign },
        { id: 3, title: 'Health', icon: Heart },
        { id: 4, title: 'Your Quote', icon: Shield }
    ];

    const progress = (step / steps.length) * 100;

    return (
        <div className="min-h-screen bg-trust-50 font-sans">
            <Navbar />

            <div className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto">
                {/* Progress Header */}
                <div className="mb-8">
                    <div className="flex justify-between mb-2">
                        {steps.map((s) => (
                            <div key={s.id} className={`flex flex-col items-center flex-1 ${s.id === step ? 'text-trust-800 font-bold' : 'text-trust-300'}`}>
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 transition-all ${s.id === step ? 'bg-trust-600 text-white shadow-lg scale-110' :
                                        s.id < step ? 'bg-growth-500 text-white' : 'bg-white border text-trust-300'
                                    }`}>
                                    {s.id < step ? <Check className="w-5 h-5" /> : <s.icon className="w-4 h-4" />}
                                </div>
                                <span className="text-xs hidden sm:block">{s.title}</span>
                            </div>
                        ))}
                    </div>
                    <div className="h-2 bg-trust-200 rounded-full overflow-hidden">
                        <motion.div
                            className="h-full bg-trust-600"
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 0.5 }}
                        />
                    </div>
                </div>

                {/* Form Card */}
                <div className="bg-white rounded-[2rem] shadow-warm border border-trust-100 overflow-hidden relative min-h-[500px]">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={step}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.3 }}
                            className="p-8 sm:p-12"
                        >
                            {step === 1 && (
                                <div className="space-y-6">
                                    <h2 className="text-3xl font-heading font-bold text-trust-900">Let's get to know you.</h2>
                                    <p className="text-trust-600">We need a few details to calculate your personalized rate.</p>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-semibold text-trust-700 mb-2">First Name</label>
                                            <input
                                                type="text"
                                                className="w-full px-4 py-3 rounded-xl border border-trust-200 focus:ring-2 focus:ring-trust-500 focus:border-trust-500 transition-all outline-none"
                                                placeholder="Max"
                                                value={formData.firstName}
                                                onChange={(e) => updateFormData('firstName', e.target.value)}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-trust-700 mb-2">Last Name</label>
                                            <input
                                                type="text"
                                                className="w-full px-4 py-3 rounded-xl border border-trust-200 focus:ring-2 focus:ring-trust-500 focus:border-trust-500 transition-all outline-none"
                                                placeholder="Mustermann"
                                                value={formData.lastName}
                                                onChange={(e) => updateFormData('lastName', e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-trust-700 mb-2">Date of Birth</label>
                                        <input
                                            type="date"
                                            className="w-full px-4 py-3 rounded-xl border border-trust-200 focus:ring-2 focus:ring-trust-500 focus:border-trust-500 transition-all outline-none"
                                            value={formData.birthDate}
                                            onChange={(e) => updateFormData('birthDate', e.target.value)}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-trust-700 mb-4">Do you smoke?</label>
                                        <div className="flex gap-4">
                                            {['yes', 'no'].map((option) => (
                                                <button
                                                    key={option}
                                                    onClick={() => updateFormData('smoker', option)}
                                                    className={`flex-1 py-4 rounded-xl border-2 font-semibold transition-all ${formData.smoker === option
                                                            ? 'border-trust-600 bg-trust-50 text-trust-700'
                                                            : 'border-trust-100 hover:border-trust-300 text-trust-400'
                                                        }`}
                                                >
                                                    {option === 'yes' ? 'Yes' : 'No'}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {step === 2 && (
                                <div className="space-y-8">
                                    <h2 className="text-3xl font-heading font-bold text-trust-900">Customize your coverage.</h2>

                                    <div>
                                        <div className="flex justify-between mb-4">
                                            <label className="font-semibold text-trust-700">Coverage Amount</label>
                                            <span className="text-2xl font-bold text-trust-900">€{formData.coverageAmount.toLocaleString()}</span>
                                        </div>
                                        <input
                                            type="range"
                                            min="50000"
                                            max="1000000"
                                            step="10000"
                                            value={formData.coverageAmount}
                                            onChange={(e) => updateFormData('coverageAmount', parseInt(e.target.value))}
                                            className="w-full h-3 bg-trust-100 rounded-lg appearance-none cursor-pointer accent-trust-600"
                                        />
                                        <div className="flex justify-between text-xs text-trust-400 mt-2">
                                            <span>€50k</span>
                                            <span>€1M</span>
                                        </div>
                                    </div>

                                    <div>
                                        <div className="flex justify-between mb-4">
                                            <label className="font-semibold text-trust-700">Duration (Years)</label>
                                            <span className="text-2xl font-bold text-trust-900">{formData.duration} Years</span>
                                        </div>
                                        <input
                                            type="range"
                                            min="5"
                                            max="40"
                                            step="1"
                                            value={formData.duration}
                                            onChange={(e) => updateFormData('duration', parseInt(e.target.value))}
                                            className="w-full h-3 bg-trust-100 rounded-lg appearance-none cursor-pointer accent-trust-600"
                                        />
                                        <div className="flex justify-between text-xs text-trust-400 mt-2">
                                            <span>5 Years</span>
                                            <span>40 Years</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {step === 3 && (
                                <div className="space-y-6">
                                    <h2 className="text-3xl font-heading font-bold text-trust-900">Just checking.</h2>
                                    <p className="text-trust-600">Have you been diagnosed with or treated for any of the following in the last 5 years?</p>

                                    <div className="space-y-3">
                                        {[
                                            'Heart disease or stroke',
                                            'Cancer or tumor',
                                            'Diabetes',
                                            'Respiratory disease (e.g. Asthma)'
                                        ].map((condition, idx) => (
                                            <div key={idx} className="flex items-center justify-between p-4 border border-trust-100 rounded-xl hover:bg-trust-50 transition-colors cursor-pointer group">
                                                <span className="font-medium text-trust-800">{condition}</span>
                                                <div className="flex gap-2">
                                                    <button className="px-4 py-1 rounded-lg border border-trust-200 text-sm font-medium text-trust-500 hover:bg-trust-600 hover:text-white transition-colors">No</button>
                                                    <button className="px-4 py-1 rounded-lg border border-trust-200 text-sm font-medium text-trust-500 hover:bg-trust-600 hover:text-white transition-colors">Yes</button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <p className="text-xs text-trust-400 italic">*This is a simplified demo health check.</p>
                                </div>
                            )}

                            {step === 4 && (
                                <div className="text-center space-y-8">
                                    <div className="inline-flex p-4 bg-growth-100 rounded-full text-growth-600 mb-4">
                                        <Shield className="w-12 h-12" />
                                    </div>
                                    <h2 className="text-4xl font-heading font-bold text-trust-900">Great news, {formData.firstName}!</h2>
                                    <p className="text-xl text-trust-600">You are eligible for instant coverage.</p>

                                    <div className="bg-trust-900 text-white p-8 rounded-3xl shadow-xl transform scale-105">
                                        <div className="text-trust-200 font-medium mb-1">Your Monthly Premium</div>
                                        <div className="text-5xl font-bold mb-6">€{monthlyPremium}</div>

                                        <div className="flex justify-between text-sm opacity-80 border-t border-white/20 pt-4 mb-8">
                                            <div>Coverage: €{formData.coverageAmount.toLocaleString()}</div>
                                            <div>Term: {formData.duration} Years</div>
                                        </div>

                                        <button className="w-full py-4 bg-growth-500 hover:bg-growth-600 text-white rounded-xl font-bold text-lg shadow-lg transition-all transform hover:-translate-y-1">
                                            Activate Coverage Now
                                        </button>
                                        <p className="text-xs text-white/50 mt-4">30-day money-back guarantee. Cancel anytime.</p>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>

                    {/* Navigation Buttons */}
                    {step < 4 && (
                        <div className="bg-trust-50 p-6 flex justify-between items-center border-t border-trust-100">
                            <button
                                onClick={prevStep}
                                disabled={step === 1}
                                className={`flex items-center px-6 py-3 font-semibold rounded-xl transition-all ${step === 1 ? 'opacity-0 pointer-events-none' : 'text-trust-600 hover:bg-white hover:shadow-sm'
                                    }`}
                            >
                                <ChevronLeft className="w-5 h-5 mr-1" /> Back
                            </button>

                            <button
                                onClick={nextStep}
                                className="flex items-center px-8 py-3 bg-trust-600 text-white font-bold rounded-xl hover:bg-trust-700 shadow-md transition-all hover:-translate-y-0.5"
                            >
                                {step === 3 ? 'See My Price' : 'Next'} <ChevronRight className="w-5 h-5 ml-1" />
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
