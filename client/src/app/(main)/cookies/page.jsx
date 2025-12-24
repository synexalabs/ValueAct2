'use client';

import React, { useState } from 'react';
import { Cookie, CheckCircle, Eye, MousePointer2, Settings, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function CookiesPage() {
    const [language, setLanguage] = useState('en');

    return (
        <div className="space-y-12 pb-20">
            {/* Header */}
            <div className="flex justify-between items-start">
                <div className="mb-10">
                    <div className="flex items-center gap-3 mb-4">
                        <Cookie className="h-5 w-5 text-trust-900" />
                        <span className="text-[10px] font-black text-trust-600 uppercase tracking-[0.4em]">Protocol Node 04</span>
                    </div>
                    <h1 className="text-5xl lg:text-7xl font-heading font-black text-trust-950 tracking-tighter leading-none mb-6">
                        {language === 'de' ? 'Cookie-Richtlinie.' : 'Cookie Policy.'}
                    </h1>
                    <p className="text-xl text-gray-400 font-medium max-w-xl leading-relaxed">
                        {language === 'de'
                            ? 'Präzision in der Datenerfassung. Erfahren Sie, wie wir temporäre Knoten verwenden, um Ihre Sitzung zu optimieren.'
                            : 'Precision in data capture. Learn how we utilize session nodes to optimize your institutional experience.'}
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
                <div className="bg-white border border-gray-100 p-10 rounded-[2.5rem] mb-16 relative overflow-hidden shadow-sm">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="h-10 w-10 bg-trust-50 rounded-xl flex items-center justify-center text-trust-900">
                            <MousePointer2 size={20} />
                        </div>
                        <h2 className="text-[10px] font-black text-trust-900 uppercase tracking-[0.2em] m-0">{language === 'de' ? 'DEFINITION' : 'ARCHITECTURE'}</h2>
                    </div>
                    <p className="text-sm text-gray-500 font-medium leading-relaxed m-0">
                        {language === 'de'
                            ? 'Cookies sind binäre Signaturen, die in Ihrer lokalen Speicherumgebung residieren. Sie ermöglichen es unserer Engine, Ihre Authentifizierung zu verifizieren und Systempräferenzen über Sitzungsgrenzen hinweg zu persistieren.'
                            : 'Cookies are binary signatures residing within your local storage environment. They enable our engine to verify authentication states and persist system preferences across session boundaries.'}
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
                    <section className="bg-white border border-gray-100 p-8 rounded-3xl hover:border-trust-100 transition-all group shadow-sm">
                        <div className="flex items-center gap-3 mb-4">
                            <CheckCircle size={18} className="text-growth-500" />
                            <h3 className="text-xs font-black text-trust-950 uppercase m-0 tracking-widest">{language === 'de' ? 'Essentiell' : 'System Critical'}</h3>
                        </div>
                        <p className="text-xs text-gray-400 font-medium mb-4">Unverzichtbar für die Kernfunktionalität und kryptographische Sicherheit.</p>
                        <ul className="text-xs text-gray-500 font-bold space-y-2 list-none p-0">
                            <li className="flex items-center gap-2">• Session Tokens</li>
                            <li className="flex items-center gap-2">• XSRF Protection</li>
                            <li className="flex items-center gap-2">• UI State Persist</li>
                        </ul>
                    </section>

                    <section className="bg-white border border-gray-100 p-8 rounded-3xl hover:border-trust-100 transition-all group shadow-sm">
                        <div className="flex items-center gap-3 mb-4">
                            <Eye size={18} className="text-trust-500" />
                            <h3 className="text-xs font-black text-trust-950 uppercase m-0 tracking-widest">{language === 'de' ? 'Analyse' : 'Performance'}</h3>
                        </div>
                        <p className="text-xs text-gray-400 font-medium mb-4">Optimierung der Systemlast und proaktives Error-Logging.</p>
                        <ul className="text-xs text-gray-500 font-bold space-y-2 list-none p-0">
                            <li className="flex items-center gap-2">• Latency Metrics</li>
                            <li className="flex items-center gap-2">• Traffic Analytics</li>
                            <li className="flex items-center gap-2">• Error Trace Nodes</li>
                        </ul>
                    </section>
                </div>

                <div className="space-y-12 border-t border-gray-100 pt-12">
                    <section className="space-y-4">
                        <h3 className="text-xl font-heading font-black text-trust-950 uppercase tracking-tight">{language === 'de' ? 'Kontrolle' : 'Governance'}</h3>
                        <p className="text-sm text-gray-400 font-medium leading-relaxed">
                            {language === 'de'
                                ? 'Sie behalten die volle Souveränität über Ihren lokalen Speicher. Jedes moderne Terminal bietet Möglichkeiten zur selektiven Löschung oder globalen Blockierung dieser Signaturen.'
                                : 'You retain full sovereignty over your local storage. Every modern terminal provides interfaces for selective erasure or global blocking of these registry signatures.'}
                        </p>
                    </section>
                </div>
            </motion.div>

            {/* Support Callout */}
            <div className="p-10 bg-trust-950 text-white rounded-[2.5rem] flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden mt-12">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                    <AlertTriangle size={100} className="text-accent-400" />
                </div>
                <div className="relative z-10 text-center md:text-left">
                    <h3 className="text-xl font-heading font-black tracking-tight mb-2 uppercase">System Warning</h3>
                    <p className="text-trust-400 text-xs font-medium max-w-sm">Disabling system indicators may result in session instability or authentication failure.</p>
                </div>
                <button className="relative z-10 px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl font-black text-[10px] uppercase tracking-widest transition-all">
                    Reset Cache
                </button>
            </div>
        </div>
    );
}
