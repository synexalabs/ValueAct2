'use client';

import React, { useState } from 'react';
import Reveal from '../../../components/common/Reveal';
import { ShieldCheck, Globe, Lock, Zap, Shield } from 'lucide-react';
import { motion } from 'framer-motion';

export default function PrivacyPage() {
    const [language, setLanguage] = useState('en');

    return (
        <div className="space-y-12 pb-20">
            {/* Header */}
            <div className="flex justify-between items-start">
                <div className="mb-10">
                    <div className="flex items-center gap-3 mb-4">
                        <ShieldCheck className="h-5 w-5 text-trust-900" />
                        <span className="text-[10px] font-black text-trust-600 uppercase tracking-[0.4em]">Compliance Registry</span>
                    </div>
                    <h1 className="text-5xl lg:text-7xl font-heading font-black text-trust-950 tracking-tighter leading-none mb-6">
                        {language === 'de' ? 'Datenschutz.' : 'Privacy.'}
                    </h1>
                    <p className="text-xl text-gray-400 font-medium max-w-xl leading-relaxed">
                        How we handle your most sensitive assets. Our commitment to 256-bit encryption and GDPR excellence.
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
                <div className="space-y-12">
                    {language === 'de' ? (
                        <>
                            <section className="bg-white border border-gray-100 p-10 rounded-[2.5rem] relative overflow-hidden group hover:border-trust-100 transition-all shadow-sm">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="h-10 w-10 bg-trust-50 rounded-xl flex items-center justify-center text-trust-900">
                                        <Globe size={20} />
                                    </div>
                                    <h2 className="text-[10px] font-black text-trust-900 uppercase tracking-[0.2em] m-0">1. Verantwortlicher</h2>
                                </div>
                                <div className="text-sm text-gray-500 font-medium leading-relaxed">
                                    <p className="font-black text-trust-900 mb-1">Zaur Guliyev</p>
                                    <p className="m-0">Deutschland</p>
                                    <p className="mt-4 font-black text-trust-900 mb-1">Kontakt:</p>
                                    <div className="flex items-center gap-2">
                                        <span>E-Mail:</span>
                                        <Reveal text="service@synexalabs.org" label="E-Mail anzeigen" />
                                    </div>
                                </div>
                            </section>

                            <section className="space-y-6">
                                <div className="flex items-center gap-4 mb-8">
                                    <div className="h-10 w-10 bg-trust-50 rounded-xl flex items-center justify-center text-trust-900">
                                        <Lock size={20} />
                                    </div>
                                    <h2 className="text-2xl font-black font-heading tracking-tight text-trust-950 m-0 uppercase">2. DATENERHEBUNG</h2>
                                </div>
                                <p className="text-sm text-gray-500 font-medium leading-relaxed">
                                    Wir verarbeiten personenbezogene Daten mit höchster Präzision, wenn Sie unsere Website besuchen oder unsere Dienste nutzen.
                                </p>
                                <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 list-none p-0">
                                    {['Website-Besuch', 'Nutzerkonto', 'KI-Kalkulationen', 'Zahlungsvorgänge'].map(item => (
                                        <li key={item} className="flex items-center gap-3 text-[10px] font-black text-trust-900 uppercase tracking-widest bg-gray-50 p-4 rounded-xl border border-gray-100">
                                            <Zap size={14} className="text-growth-400 fill-growth-400" />
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </section>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-10 border-t border-gray-100 text-sm text-gray-400 font-medium leading-relaxed">
                                <div className="bg-gray-50 p-8 rounded-3xl border border-gray-100">
                                    <h3 className="text-trust-900 font-black uppercase tracking-widest text-[11px] mb-3">3. Zwecke</h3>
                                    <p>Bereitstellung des SaaS-Dienstes, versicherungsmathematische Berechnungen und Vertragsdurchführung.</p>
                                </div>
                                <div className="bg-gray-50 p-8 rounded-3xl border border-gray-100">
                                    <h3 className="text-trust-900 font-black uppercase tracking-widest text-[11px] mb-3">4. Speicherdauer</h3>
                                    <p>Wir speichern Daten nur so lange, wie es für die genannten Zwecke erforderlich ist oder gesetzliche Aufbewahrungspflichten bestehen.</p>
                                </div>
                            </div>
                        </>
                    ) : (
                        <>
                            <section className="bg-white border border-gray-100 p-10 rounded-[2.5rem] relative overflow-hidden group hover:border-trust-100 transition-all shadow-sm">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="h-10 w-10 bg-trust-50 rounded-xl flex items-center justify-center text-trust-900">
                                        <Globe size={20} />
                                    </div>
                                    <h2 className="text-[10px] font-black text-trust-900 uppercase tracking-[0.2em] m-0">1. Data Controller</h2>
                                </div>
                                <div className="text-sm text-gray-500 font-medium leading-relaxed">
                                    <p className="font-black text-trust-900 mb-1">Zaur Guliyev</p>
                                    <p className="m-0">Germany</p>
                                    <p className="mt-4 font-black text-trust-900 mb-1">Contact:</p>
                                    <div className="flex items-center gap-2">
                                        <span>E-Mail:</span>
                                        <Reveal text="service@synexalabs.org" label="Show Email" />
                                    </div>
                                </div>
                            </section>

                            <section className="space-y-6">
                                <div className="flex items-center gap-4 mb-8">
                                    <div className="h-10 w-10 bg-trust-50 rounded-xl flex items-center justify-center text-trust-900">
                                        <Lock size={20} />
                                    </div>
                                    <h2 className="text-2xl font-black font-heading tracking-tight text-trust-950 m-0 uppercase">2. Data Collection</h2>
                                </div>
                                <p className="text-sm text-gray-500 font-medium leading-relaxed">
                                    We process personal data with institutional-grade precision when you visit our portal or utilize our computational services.
                                </p>
                                <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 list-none p-0">
                                    {['Platform Access', 'Account Registry', 'AI Risk Analysis', 'Financial Clearing'].map(item => (
                                        <li key={item} className="flex items-center gap-3 text-[10px] font-black text-trust-900 uppercase tracking-widest bg-gray-50 p-4 rounded-xl border border-gray-100">
                                            <Zap size={14} className="text-growth-400 fill-growth-400" />
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </section>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-10 border-t border-gray-100 text-sm text-gray-400 font-medium leading-relaxed">
                                <div className="bg-gray-50 p-8 rounded-3xl border border-gray-100">
                                    <h3 className="text-trust-900 font-black uppercase tracking-widest text-[11px] mb-3">3. Purposes</h3>
                                    <p>Provision of SaaS infrastructure, actuarial computations, and contractual fulfillment.</p>
                                </div>
                                <div className="bg-gray-50 p-8 rounded-3xl border border-gray-100">
                                    <h3 className="text-trust-900 font-black uppercase tracking-widest text-[11px] mb-3">4. Retention</h3>
                                    <p>Data is stored only for the duration required for the finalized purpose or as mandated by legal compliance protocols.</p>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </motion.div>

            {/* Support Callout */}
            <div className="p-10 bg-trust-950 text-white rounded-[2.5rem] flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden mt-12">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                    <Shield size={100} className="text-growth-400" />
                </div>
                <div className="relative z-10 text-center md:text-left">
                    <h3 className="text-xl font-heading font-black tracking-tight mb-2 uppercase">Request Data Audit?</h3>
                    <p className="text-trust-400 text-xs font-medium max-w-sm">Contact our compliance node to receive a full transcript of your processed personal identifiers.</p>
                </div>
                <button className="relative z-10 px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl font-black text-[10px] uppercase tracking-widest transition-all">
                    Execute Audit
                </button>
            </div>
        </div>
    );
}
