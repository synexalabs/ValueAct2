'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Landmark, Mail, Fingerprint, ShieldAlert, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ImpressumPage() {
    const [language, setLanguage] = useState('en');

    return (
        <div className="min-h-screen bg-white flex flex-col font-sans selection:bg-trust-100 selection:text-trust-900">
            {/* Top Navigation */}
            <nav className="bg-white/70 backdrop-blur-md border-b border-gray-100 z-50 sticky top-0">
                <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
                    <Link href="/" className="flex items-center gap-3 group">
                        <div className="h-10 w-10 bg-trust-950 rounded-2xl flex items-center justify-center shadow-lg shadow-trust-900/10 group-hover:scale-105 transition-transform overflow-hidden relative">
                            <div className="absolute inset-0 bg-gradient-to-br from-trust-600/20 to-transparent" />
                            <ArrowLeft className="h-5 w-5 text-white relative z-10" />
                        </div>
                        <span className="text-[10px] font-black text-trust-900 uppercase tracking-[0.3em]">
                            {language === 'de' ? 'Zurück' : 'Return Home'}
                        </span>
                    </Link>

                    <div className="flex gap-2 p-1 bg-gray-50 rounded-xl border border-gray-100">
                        {['DE', 'EN'].map((lang) => (
                            <button
                                key={lang}
                                onClick={() => setLanguage(lang.toLowerCase())}
                                className={`px-4 py-2 rounded-lg text-[10px] font-black tracking-widest transition-all ${language === lang.toLowerCase()
                                        ? 'bg-trust-950 text-white shadow-lg'
                                        : 'text-gray-400 hover:text-trust-900'
                                    }`}
                            >
                                {lang}
                            </button>
                        ))}
                    </div>
                </div>
            </nav>

            <div className="flex-1 max-w-4xl mx-auto px-6 py-20 w-full relative">
                {/* Background Decor */}
                <div className="absolute top-20 right-0 w-64 h-64 bg-trust-50/50 blur-[100px] rounded-full pointer-events-none -z-10" />

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    {/* Header */}
                    <div className="mb-16">
                        <div className="flex items-center gap-3 mb-4">
                            <Landmark className="h-5 w-5 text-trust-900" />
                            <span className="text-[10px] font-black text-trust-600 uppercase tracking-[0.4em]">Corporate Registry</span>
                        </div>
                        <h1 className="text-5xl lg:text-7xl font-heading font-black text-trust-950 tracking-tighter leading-none mb-6">
                            {language === 'de' ? 'Impressum.' : 'Legal Notice.'}
                        </h1>
                        <p className="text-xl text-gray-400 font-medium max-w-xl leading-relaxed">
                            Official registry data according to § 5 TMG. Institutional transparency for global trustees.
                        </p>
                    </div>

                    <div className="prose prose-trust max-w-none">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
                            <section className="bg-gray-50/50 border border-gray-100 p-10 rounded-[2.5rem] relative overflow-hidden group hover:border-trust-100 transition-all">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="h-10 w-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-trust-900">
                                        <Fingerprint size={20} />
                                    </div>
                                    <h2 className="text-[10px] font-black text-trust-900 uppercase tracking-[0.2em] m-0">{language === 'de' ? 'ANGABEN' : 'IDENTITY'}</h2>
                                </div>
                                <div className="text-sm text-gray-500 font-medium leading-relaxed">
                                    <p className="font-black text-trust-900 mb-1">Zaur Guliyev</p>
                                    <p className="m-0">Wilhelm Liebknecht-Straße 4</p>
                                    <p className="m-0">28329 Bremen</p>
                                    <p className="m-0">Germany</p>
                                </div>
                            </section>

                            <section className="bg-gray-50/50 border border-gray-100 p-10 rounded-[2.5rem] relative overflow-hidden group hover:border-trust-100 transition-all">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="h-10 w-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-trust-900">
                                        <Mail size={20} />
                                    </div>
                                    <h2 className="text-[10px] font-black text-trust-900 uppercase tracking-[0.2em] m-0">{language === 'de' ? 'KONTAKT' : 'COMMUNICATION'}</h2>
                                </div>
                                <div className="text-sm text-gray-500 font-medium leading-relaxed">
                                    <p className="m-0">service@synexalabs.com</p>
                                    <div className="mt-4 pt-4 border-t border-gray-100">
                                        <p className="text-[10px] font-black text-trust-900 uppercase tracking-widest mb-1">VAT ID / USt-ID:</p>
                                        <p className="m-0 text-trust-600 font-black">DE360921142</p>
                                    </div>
                                </div>
                            </section>
                        </div>

                        <div className="space-y-12 border-t border-gray-100 pt-12">
                            <section className="space-y-4">
                                <h3 className="text-xl font-heading font-black text-trust-950 uppercase tracking-tight">{language === 'de' ? 'Haftungsausschluss' : 'Disclaimer'}</h3>
                                <div className="text-sm text-gray-400 font-medium leading-relaxed space-y-4">
                                    <p>As a service provider, we occupy legal responsibility for proprietary content pursuant to § 7 Abs.1 TMG. Under the mandates of §§ 8 to 10 TMG, we are not obligated to monitor exogenous data feeds or investigative activities indicating illicit conduct.</p>
                                    <p>Upon notification of specific jurisdictional violations, affected content nodes will be purged with immediate priority.</p>
                                </div>
                            </section>

                            <section className="space-y-4">
                                <h3 className="text-xl font-heading font-black text-trust-950 uppercase tracking-tight">{language === 'de' ? 'Urheberrecht' : 'Intellectual Property'}</h3>
                                <div className="text-sm text-gray-400 font-medium leading-relaxed">
                                    <p>The operational framework and site-specific deployments are subject to German Copyright Law. Any unauthorized reproduction, processing, or distribution of these assets constitutes a violation of intellectual providence.</p>
                                </div>
                            </section>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Support Callout */}
            <div className="max-w-4xl mx-auto px-6 pb-20 w-full">
                <div className="p-10 bg-trust-950 text-white rounded-[2.5rem] flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-10">
                        <ShieldAlert size={100} className="text-growth-400" />
                    </div>
                    <div className="relative z-10 text-center md:text-left">
                        <h3 className="text-xl font-heading font-black tracking-tight mb-2 uppercase">Official Inquiry?</h3>
                        <p className="text-trust-400 text-xs font-medium max-w-sm">Direct legal correspondence or jurisdictional requests to our verified communication channel.</p>
                    </div>
                    <button className="relative z-10 px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl font-black text-[10px] uppercase tracking-widest transition-all">
                        Direct Ledger
                    </button>
                </div>
            </div>
        </div>
    );
}
