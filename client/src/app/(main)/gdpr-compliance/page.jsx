'use client';

import React, { useState } from 'react';
import Reveal from '../../../components/common/Reveal';
import { Shield, CheckCircle, FileText, Users, Database, Zap, ArrowRight, ShieldCheck, Lock } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function GDPRCompliancePage() {
    const [language, setLanguage] = useState('en');

    const complianceFeatures = [
        {
            icon: Shield,
            title: language === 'de' ? 'Einwilligungs-Management' : 'Consent Management',
            description: language === 'de'
                ? 'Granulare Kontrolle über Datenerfassungsknoten mit Echtzeit-Widerrufslogik.'
                : 'Granular control over data capture nodes with real-time withdrawal logic.',
            status: 'active',
            details: language === 'de' ? [
                'Essentielle Knoten (Aktiv)',
                'Analytische Signale (Optional)',
                'Sofortiger Protokoll-Widerruf'
            ] : [
                'Essential Nodes (Active)',
                'Analytical Signals (Optional)',
                'Instant Protocol Withdrawal'
            ]
        },
        {
            icon: Database,
            title: language === 'de' ? 'Aufbewahrungs-Protokoll' : 'Retention Protocol',
            description: language === 'de'
                ? 'Automatisierte Bereinigungszyklen für inaktive Datensätze gemäß Art. 17 DSGVO.'
                : 'Automated purge cycles for inactive records pursuant to GDPR Art. 17.',
            status: 'active',
            details: language === 'de' ? [
                'Löschung auf Anforderung',
                'Maturation-basiertes Archiv',
                'Verschlüsselte Löschbestätigung'
            ] : [
                'On-Demand Erasure',
                'Maturation-based Archival',
                'Encrypted Purge Verification'
            ]
        },
        {
            icon: Users,
            title: language === 'de' ? 'Betroffenenrechte' : 'Subject Rights',
            description: language === 'de'
                ? 'Vollständige programmatische Implementierung aller EU-Datenschutzrechte.'
                : 'Full programmatic implementation of all EU data protection rights.',
            status: 'active',
            details: language === 'de' ? [
                'Auskunftsrecht (Art. 15)',
                'Berichtigungs-Hub (Art. 16)',
                'Portabilitäts-Export (Art. 20)'
            ] : [
                'Access Right (Art. 15)',
                'Rectification Hub (Art. 16)',
                'Portability Export (Art. 20)'
            ]
        }
    ];

    return (
        <div className="space-y-12 pb-20">
            {/* Header */}
            <div className="mb-20 text-center max-w-3xl mx-auto">
                <div className="inline-flex items-center gap-3 mb-6 px-4 py-2 bg-trust-50 rounded-full border border-trust-100">
                    <ShieldCheck className="h-4 w-4 text-trust-900" />
                    <span className="text-[10px] font-black text-trust-900 uppercase tracking-[0.3em]">EU Security Standard</span>
                </div>
                <h1 className="text-5xl lg:text-7xl font-heading font-black text-trust-950 tracking-tighter leading-none mb-8">
                    {language === 'de' ? 'Datenschutz.' : 'GDPR Integrity.'}
                </h1>
                <p className="text-xl text-gray-400 font-medium leading-relaxed">
                    Valuact operates with defensive data architecture. Every bit processed is governed by the highest European standards of institutional privacy.
                </p>

                <div className="flex justify-center gap-2 mt-8">
                    {['DE', 'EN'].map((lang) => (
                        <button
                            key={lang}
                            onClick={() => setLanguage(lang.toLowerCase())}
                            className={`px-4 py-2 rounded-lg text-[10px] font-black tracking-widest transition-all ${language === lang.toLowerCase()
                                ? 'bg-trust-950 text-white shadow-lg'
                                : 'bg-white border border-gray-100 text-gray-400 hover:text-trust-900'
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
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
                    {complianceFeatures.map((feature, idx) => (
                        <div key={idx} className="bg-white border border-gray-100 p-10 rounded-[2.5rem] group hover:shadow-2xl hover:shadow-trust-900/5 transition-all">
                            <div className="h-12 w-12 bg-trust-50 rounded-2xl shadow-sm border border-trust-50 flex items-center justify-center text-trust-950 mb-8 group-hover:scale-110 transition-transform">
                                <feature.icon size={24} />
                            </div>
                            <h3 className="text-[11px] font-black text-trust-950 uppercase tracking-[0.3em] mb-4">{feature.title}</h3>
                            <p className="text-xs text-gray-400 font-medium leading-relaxed mb-8">{feature.description}</p>
                            <ul className="space-y-3 p-0 list-none m-0">
                                {feature.details.map((detail, dIdx) => (
                                    <li key={dIdx} className="flex items-center gap-3 text-[10px] font-black text-trust-900 uppercase tracking-widest">
                                        <div className="h-1 w-1 bg-growth-500 rounded-full" />
                                        {detail}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                {/* Documentation Links */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 border-t border-gray-100 pt-20">
                    <section>
                        <h2 className="text-2xl font-heading font-black text-trust-950 uppercase tracking-tight mb-8">{language === 'de' ? 'Ressourcen' : 'Digital Assets'}</h2>
                        <div className="space-y-4">
                            {[
                                { label: 'Privacy Policy', path: '/privacy' },
                                { label: 'Terms of Service', path: '/terms' },
                                { label: 'Cookie Registry', path: '/cookies' }
                            ].map((link, i) => (
                                <Link key={i} href={link.path} className="flex items-center justify-between p-6 rounded-2xl bg-white border border-gray-100 hover:border-trust-100 group transition-all">
                                    <span className="text-sm font-black text-trust-950 uppercase tracking-tighter">{link.label}</span>
                                    <ArrowRight size={18} className="text-gray-300 group-hover:text-trust-900 group-hover:translate-x-1 transition-all" />
                                </Link>
                            ))}
                        </div>
                    </section>

                    <section className="bg-trust-950 rounded-[2.5rem] p-10 text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-10">
                            <Lock size={100} />
                        </div>
                        <div className="relative z-10">
                            <h3 className="text-xl font-heading font-black tracking-tight mb-4 uppercase">Direct Inquiry?</h3>
                            <p className="text-trust-400 text-xs font-medium leading-relaxed mb-8">For official GDPR data egress requests or jurisdictional audits, please contact our verified security portal.</p>
                            <div className="inline-block">
                                <Reveal text="service@synexalabs.org" label="Unlock Security Hub" className="bg-growth-500 hover:bg-growth-400 text-trust-950 px-8 py-4 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-growth-500/20" />
                            </div>
                        </div>
                    </section>
                </div>
            </motion.div>
        </div>
    );
}
