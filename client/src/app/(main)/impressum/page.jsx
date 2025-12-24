'use client';

import React, { useState } from 'react';
import Reveal from '../../../components/common/Reveal';
import { Landmark, Mail, Fingerprint, ShieldAlert } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ImpressumPage() {
    const [language, setLanguage] = useState('en');

    return (
        <div className="space-y-12 pb-20">
            {/* Header with Language Switch */}
            <div className="flex justify-between items-start">
                <div className="mb-10">
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

                <div className="flex gap-2 p-1 bg-white rounded-xl border border-gray-100 shadow-sm">
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

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="prose prose-trust max-w-none"
            >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
                    <section className="bg-white border border-gray-100 p-10 rounded-[2.5rem] relative overflow-hidden group hover:border-trust-100 transition-all shadow-sm">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="h-10 w-10 bg-trust-50 rounded-xl flex items-center justify-center text-trust-900">
                                <Fingerprint size={20} />
                            </div>
                            <h2 className="text-[10px] font-black text-trust-900 uppercase tracking-[0.2em] m-0">{language === 'de' ? 'ANGABEN' : 'IDENTITY'}</h2>
                        </div>
                        <div className="text-sm text-gray-500 font-medium leading-relaxed">
                            <p className="font-black text-trust-900 mb-1">Zaur Guliyev</p>
                            <p className="m-0">Germany</p>
                        </div>
                    </section>

                    <section className="bg-white border border-gray-100 p-10 rounded-[2.5rem] relative overflow-hidden group hover:border-trust-100 transition-all shadow-sm">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="h-10 w-10 bg-trust-50 rounded-xl flex items-center justify-center text-trust-900">
                                <Mail size={20} />
                            </div>
                            <h2 className="text-[10px] font-black text-trust-900 uppercase tracking-[0.2em] m-0">{language === 'de' ? 'KONTAKT' : 'COMMUNICATION'}</h2>
                        </div>
                        <div className="text-sm text-gray-500 font-medium leading-relaxed">
                            <div className="flex items-center gap-2">
                                <Mail size={16} className="text-trust-900" />
                                <Reveal text="service@synexalabs.org" label="Show Email" />
                            </div>
                            <div className="mt-4 pt-4 border-t border-gray-50">
                                <p className="text-[10px] font-black text-trust-900 uppercase tracking-widest mb-1">VAT ID / USt-ID:</p>
                                <p className="m-0 text-trust-600 font-black">DE360921142</p>
                            </div>
                        </div>
                    </section>
                </div>

                <div className="grid grid-cols-1 gap-12 border-t border-gray-100 pt-12">
                    <section className="space-y-4">
                        <h3 className="text-xl font-heading font-black text-trust-950 uppercase tracking-tight">{language === 'de' ? 'Haftungsausschluss' : 'Disclaimer'}</h3>
                        <div className="text-sm text-gray-500 font-medium leading-relaxed space-y-4 bg-gray-50 p-8 rounded-3xl border border-gray-100">
                            <p>As a service provider, we occupy legal responsibility for proprietary content pursuant to § 7 Abs.1 TMG. Under the mandates of §§ 8 to 10 TMG, we are not obligated to monitor exogenous data feeds or investigative activities indicating illicit conduct.</p>
                            <p>Upon notification of specific jurisdictional violations, affected content nodes will be purged with immediate priority.</p>
                        </div>
                    </section>

                    <section className="space-y-4">
                        <h3 className="text-xl font-heading font-black text-trust-950 uppercase tracking-tight">{language === 'de' ? 'Urheberrecht' : 'Intellectual Property'}</h3>
                        <div className="text-sm text-gray-500 font-medium leading-relaxed bg-gray-50 p-8 rounded-3xl border border-gray-100">
                            <p>The operational framework and site-specific deployments are subject to German Copyright Law. Any unauthorized reproduction, processing, or distribution of these assets constitutes a violation of intellectual providence.</p>
                        </div>
                    </section>
                </div>
            </motion.div>

            {/* Support Callout */}
            <div className="p-10 bg-trust-950 text-white rounded-[2.5rem] flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden mt-12">
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
    );
}
