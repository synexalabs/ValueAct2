'use client';

import React, { useState } from 'react';
import { User, CreditCard, Shield, CheckCircle, AlertCircle, Upload, Smartphone } from 'lucide-react';
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
        <div className="max-w-4xl mx-auto space-y-8">
            <h1 className="text-3xl font-heading font-bold text-trust-900">Settings & Verification</h1>

            <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden min-h-[600px] flex flex-col md:flex-row">
                {/* Side Nav */}
                <div className="md:w-64 bg-gray-50 p-6 border-r border-gray-100 space-y-2">
                    {[
                        { id: 'identity', label: 'Identity Verification', icon: Shield },
                        { id: 'payment', label: 'Payment Methods', icon: CreditCard },
                        { id: 'personal', label: 'Personal Details', icon: User },
                    ].map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === item.id
                                    ? 'bg-white text-trust-900 shadow-sm border border-gray-200'
                                    : 'text-gray-500 hover:bg-gray-100'
                                }`}
                        >
                            <item.icon className="h-4 w-4" />
                            {item.label}
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div className="flex-1 p-8 md:p-12 relative">
                    <AnimatePresence mode="wait">
                        {activeTab === 'identity' && (
                            <motion.div
                                key="identity"
                                initial={{ opacity: 0, x: 10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -10 }}
                                className="space-y-6"
                            >
                                <div className="flex items-center gap-2 text-trust-900 font-bold text-xl mb-4">
                                    <Smartphone className="h-6 w-6" />
                                    <h2>ID Verification (Video Ident)</h2>
                                </div>

                                <p className="text-gray-600">To fully activate your policy, we need to verify your identity. This is required by BaFin regulations.</p>

                                {verificationStatus === 'pending' && (
                                    <div className="bg-orange-50 border border-orange-100 rounded-xl p-6 text-center space-y-4">
                                        <AlertCircle className="h-10 w-10 text-orange-500 mx-auto" />
                                        <div>
                                            <h3 className="font-bold text-orange-800">Identity Not Verified</h3>
                                            <p className="text-sm text-orange-600 mt-1">Please confirm your identity via Video-Ident.</p>
                                        </div>
                                        <button
                                            onClick={startVerification}
                                            className="px-6 py-3 bg-trust-900 text-white rounded-xl font-bold hover:bg-trust-800 transition-colors shadow-lg"
                                        >
                                            Start Video Ident with IDnow
                                        </button>
                                    </div>
                                )}

                                {verificationStatus === 'processing' && (
                                    <div className="bg-blue-50 border border-blue-100 rounded-xl p-6 text-center space-y-4">
                                        <div className="animate-spin h-10 w-10 border-4 border-blue-500 border-t-transparent rounded-full mx-auto" />
                                        <div>
                                            <h3 className="font-bold text-blue-800">Connecting to Agent...</h3>
                                            <p className="text-sm text-blue-600 mt-1">Simulating external verification provider...</p>
                                        </div>
                                    </div>
                                )}

                                {verificationStatus === 'verified' && (
                                    <div className="bg-green-50 border border-green-100 rounded-xl p-6 text-center space-y-4 animate-scale-in">
                                        <CheckCircle className="h-12 w-12 text-green-500 mx-auto" />
                                        <div>
                                            <h3 className="font-bold text-green-800">Verification Successful</h3>
                                            <p className="text-sm text-green-600 mt-1">Your identity has been confirmed. Thank you!</p>
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        )}

                        {activeTab === 'payment' && (
                            <motion.div
                                key="payment"
                                initial={{ opacity: 0, x: 10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -10 }}
                                className="space-y-6"
                            >
                                <h2 className="text-xl font-bold text-trust-900 mb-4">Payment Methods</h2>

                                <div className="p-6 border border-gray-200 rounded-2xl flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="bg-gray-100 p-2 rounded-lg">
                                            <div className="font-bold text-xs bg-white border px-1 rounded">SEPA</div>
                                        </div>
                                        <div>
                                            <div className="font-bold text-gray-900">DE89 **** **** **** 1234</div>
                                            <div className="text-sm text-gray-500">Sparkasse Berlin</div>
                                        </div>
                                    </div>
                                    <span className="text-xs bg-green-100 text-green-700 font-bold px-2 py-1 rounded">PRIMARY</span>
                                </div>

                                <button className="w-full py-4 border-2 border-dashed border-gray-200 rounded-2xl text-gray-400 font-medium hover:border-trust-300 hover:text-trust-600 transition-all flex items-center justify-center gap-2">
                                    <CreditCard className="h-5 w-5" />
                                    Add New Payment Method
                                </button>
                            </motion.div>
                        )}

                        {activeTab === 'personal' && (
                            <motion.div
                                key="personal"
                                initial={{ opacity: 0, x: 10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -10 }}
                            >
                                <h2 className="text-xl font-bold text-trust-900 mb-6">Personal Details</h2>
                                <div className="grid grid-cols-2 gap-6">
                                    {[
                                        { label: 'First Name', value: 'Max' },
                                        { label: 'Last Name', value: 'Mustermann' },
                                        { label: 'Email', value: 'max.mustermann@example.com' },
                                        { label: 'Phone', value: '+49 123 456789' },
                                        { label: 'Address', value: 'Musterstraße 1' },
                                        { label: 'City', value: '10115 Berlin' },
                                    ].map((field, i) => (
                                        <div key={i}>
                                            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">{field.label}</label>
                                            <input
                                                type="text"
                                                value={field.value}
                                                disabled
                                                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-700"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
