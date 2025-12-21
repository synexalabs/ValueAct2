'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Shield, CheckCircle, FileText, Users, Database } from 'lucide-react';
import { motion } from 'framer-motion';

export default function GDPRCompliancePage() {
    const [language, setLanguage] = useState('en');

    const complianceFeatures = [
        {
            icon: Shield,
            title: language === 'de' ? 'Cookie-Einwilligungsverwaltung' : 'Cookie Consent Management',
            description: language === 'de'
                ? 'Granulare Cookie-Einwilligung mit Akzeptieren/Ablehnen-Optionen'
                : 'Granular cookie consent with accept/reject options',
            status: 'implemented',
            details: language === 'de' ? [
                'Notwendige Cookies (immer aktiv)',
                'Analyse-Cookies (optional)',
                'Einfacher Widerrufsmechanismus'
            ] : [
                'Essential cookies (always active)',
                'Analytics cookies (optional)',
                'Easy withdrawal mechanism'
            ]
        },
        {
            icon: Database,
            title: language === 'de' ? 'Datenaufbewahrungsrichtlinien' : 'Data Retention Policies',
            description: language === 'de'
                ? 'Aufbewahrungsfristen und Löschrichtlinien für personenbezogene Daten'
                : 'Retention periods and deletion policies for personal data',
            status: 'implemented',
            details: language === 'de' ? [
                'Benutzerkonten: Auf Anfrage gelöscht',
                'Berechnungsergebnisse: Bis zur Löschung durch Nutzer',
                'Daten werden auf Anfrage gemäß DSGVO Art. 17 gelöscht'
            ] : [
                'User accounts: Deleted on request',
                'Calculation results: Until deleted by user',
                'Data deleted on request per GDPR Art. 17'
            ]
        },
        {
            icon: Users,
            title: language === 'de' ? 'Benutzerrechte-Implementierung' : 'User Rights Implementation',
            description: language === 'de'
                ? 'Vollständige Implementierung der DSGVO-Betroffenenrechte'
                : 'Full implementation of GDPR data subject rights',
            status: 'implemented',
            details: language === 'de' ? [
                'Recht auf Auskunft (Art. 15)',
                'Recht auf Berichtigung (Art. 16)',
                'Recht auf Löschung (Art. 17)',
                'Recht auf Datenübertragbarkeit (Art. 20)'
            ] : [
                'Right to access (Art. 15)',
                'Right to rectification (Art. 16)',
                'Right to erasure (Art. 17)',
                'Right to data portability (Art. 20)'
            ]
        }
    ];

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <nav className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <Link href="/" className="flex items-center space-x-2">
                            <ArrowLeft className="w-5 h-5 text-gray-600" />
                            <span className="text-lg font-semibold text-gray-900">
                                {language === 'de' ? 'Zurück zur Startseite' : 'Back to Homepage'}
                            </span>
                        </Link>

                        <div className="flex space-x-2">
                            <button
                                onClick={() => setLanguage('de')}
                                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${language === 'de'
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                DE
                            </button>
                            <button
                                onClick={() => setLanguage('en')}
                                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${language === 'en'
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                EN
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative py-20 bg-gradient-to-br from-blue-600 via-indigo-600 to-blue-700 overflow-hidden">
                <div className="absolute inset-0">
                    <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500/30 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-500/30 rounded-full blur-3xl"></div>
                </div>

                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="text-center text-white"
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                            className="inline-flex items-center justify-center w-20 h-20 bg-white/20 rounded-2xl mb-6 shadow-xl"
                        >
                            <Shield className="w-10 h-10 text-white" />
                        </motion.div>

                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.4 }}
                            className="text-4xl md:text-5xl font-bold mb-6"
                        >
                            {language === 'de' ? 'DSGVO-Konformität' : 'GDPR Compliance'}
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.6 }}
                            className="text-xl text-white/90 max-w-2xl mx-auto mb-8"
                        >
                            {language === 'de'
                                ? 'Valuact ist vollständig konform mit der Datenschutz-Grundverordnung (DSGVO) und implementiert umfassende Datenschutzmaßnahmen.'
                                : 'Valuact is fully compliant with the General Data Protection Regulation (GDPR) and implements comprehensive privacy protection measures.'
                            }
                        </motion.p>
                    </motion.div>
                </div>
            </section>

            {/* Compliance Overview */}
            <section className="py-16 bg-gray-50 flex-1">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">
                            {language === 'de' ? 'Konformitäts-Features' : 'Compliance Features'}
                        </h2>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                            {language === 'de'
                                ? 'Unser umfassendes DSGVO-Konformitäts-Framework stellt sicher, dass Ihre Daten nach den höchsten europäischen Standards geschützt werden.'
                                : 'Our comprehensive GDPR compliance framework ensures your data is protected according to the highest European standards.'
                            }
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {complianceFeatures.map((feature, index) => {
                            const Icon = feature.icon;
                            return (
                                <motion.div
                                    key={feature.title}
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.8, delay: index * 0.1 }}
                                    className="bg-white rounded-xl p-6 shadow-md border border-gray-100 hover:shadow-lg transition-shadow"
                                >
                                    <div className="flex items-center mb-4">
                                        <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mr-4 shadow-sm">
                                            <Icon className="w-6 h-6 text-blue-600" />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-gray-900">{feature.title}</h3>
                                            <div className="flex items-center mt-1">
                                                <CheckCircle className="w-4 h-4 text-green-600 mr-1" />
                                                <span className="text-sm text-green-600 font-medium capitalize">
                                                    {feature.status}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <p className="text-gray-600 mb-4 text-sm leading-relaxed">{feature.description}</p>

                                    <ul className="space-y-2">
                                        {feature.details.map((detail, detailIndex) => (
                                            <li key={detailIndex} className="flex items-start text-sm text-gray-700">
                                                <CheckCircle className="w-3 h-3 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                                                {detail}
                                            </li>
                                        ))}
                                    </ul>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Legal Documentation */}
            <section className="py-16 bg-white">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">
                            {language === 'de' ? 'Rechtliche Dokumentation' : 'Legal Documentation'}
                        </h2>
                        <p className="text-xl text-gray-600">
                            {language === 'de'
                                ? 'Vollständige Transparenz durch umfassende rechtliche Dokumentation.'
                                : 'Complete transparency through comprehensive legal documentation.'
                            }
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8 }}
                            className="bg-white rounded-xl p-6 shadow-md border border-gray-100 hover:border-blue-200 transition-colors"
                        >
                            <div className="flex items-center mb-4">
                                <FileText className="w-8 h-8 text-blue-600 mr-3" />
                                <h3 className="text-xl font-semibold text-gray-900">
                                    {language === 'de' ? 'Datenschutzerklärung' : 'Privacy Policy'}
                                </h3>
                            </div>
                            <p className="text-gray-600 mb-4 text-sm leading-relaxed">
                                {language === 'de'
                                    ? 'Umfassende Datenschutzerklärung, die alle Datenverarbeitungsaktivitäten, Rechtsgrundlagen und Ihre Rechte abdeckt.'
                                    : 'Comprehensive privacy policy covering all data processing activities, legal bases, and your rights.'
                                }
                            </p>
                            <Link
                                href="/privacy"
                                className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium text-sm"
                            >
                                {language === 'de' ? 'Datenschutzerklärung lesen' : 'Read Privacy Policy'}
                                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </Link>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: 30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                            className="bg-white rounded-xl p-6 shadow-md border border-gray-100 hover:border-orange-200 transition-colors"
                        >
                            <div className="flex items-center mb-4">
                                <Shield className="w-8 h-8 text-orange-600 mr-3" />
                                <h3 className="text-xl font-semibold text-gray-900">
                                    {language === 'de' ? 'Cookie-Richtlinie' : 'Cookie Policy'}
                                </h3>
                            </div>
                            <p className="text-gray-600 mb-4 text-sm leading-relaxed">
                                {language === 'de'
                                    ? 'Detaillierte Informationen über Cookie-Nutzung, Typen und Ihre Möglichkeit, Cookie-Präferenzen zu kontrollieren.'
                                    : 'Detailed information about cookie usage, types, and your ability to control cookie preferences.'
                                }
                            </p>
                            <Link
                                href="/cookies"
                                className="inline-flex items-center text-orange-600 hover:text-orange-700 font-medium text-sm"
                            >
                                {language === 'de' ? 'Cookie-Richtlinie lesen' : 'Read Cookie Policy'}
                                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </Link>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Contact Information */}
            <section className="py-16 bg-gray-50">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">
                        {language === 'de' ? 'Fragen zum Datenschutz?' : 'Questions About Privacy?'}
                    </h2>
                    <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                        {language === 'de'
                            ? 'Wir sind verpflichtet zu Transparenz und dem Schutz Ihrer Privatsphäre. Kontaktieren Sie uns, wenn Sie Fragen zu unseren Datenpraktiken haben.'
                            : 'We\'re committed to transparency and protecting your privacy. Contact us if you have any questions about our data practices.'
                        }
                    </p>

                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-8 max-w-lg mx-auto shadow-sm">
                        <h3 className="text-xl font-semibold text-gray-900 mb-4">
                            {language === 'de' ? 'Datenschutz-Kontakt' : 'Data Protection Contact'}
                        </h3>
                        <div className="text-gray-700 space-y-2">
                            <p>
                                <strong>{language === 'de' ? 'Allgemeiner Support:' : 'General Support:'}</strong>{' '}
                                <a href="mailto:service@synexalabs.com" className="text-blue-600 hover:text-blue-700 underline decoration-blue-200 underline-offset-4 font-medium transition-colors">
                                    service@synexalabs.com
                                </a>
                            </p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
