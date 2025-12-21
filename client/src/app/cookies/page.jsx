'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Cookie, Shield, Settings, Eye, CheckCircle, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function CookiesPage() {
    const [language, setLanguage] = useState('en');

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
                            <Cookie className="w-10 h-10 text-white" />
                        </motion.div>

                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.4 }}
                            className="text-4xl md:text-5xl font-bold mb-6"
                        >
                            {language === 'de' ? 'Cookie-Richtlinie' : 'Cookie Policy'}
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.6 }}
                            className="text-xl text-white/90 max-w-2xl mx-auto"
                        >
                            {language === 'de'
                                ? 'Erfahren Sie, wie Valuact Cookies verwendet, um Ihre Erfahrung zu verbessern und Ihre Privatsphäre zu schützen.'
                                : 'Learn about how Valuact uses cookies to enhance your experience and protect your privacy.'
                            }
                        </motion.p>
                    </motion.div>
                </div>
            </section>

            {/* Content Section */}
            <section className="py-16 bg-white flex-1">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="prose prose-lg max-w-none text-gray-700">

                        {/* What are Cookies */}
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                            className="mb-12"
                        >
                            <div className="flex items-center mb-6">
                                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mr-4 shadow-sm">
                                    <Cookie className="w-6 h-6 text-blue-600" />
                                </div>
                                <h2 className="text-3xl font-bold text-gray-900">
                                    {language === 'de' ? 'Was sind Cookies?' : 'What are Cookies?'}
                                </h2>
                            </div>
                            <p className="leading-relaxed mb-6">
                                {language === 'de'
                                    ? 'Cookies sind kleine Textdateien, die auf Ihrem Gerät gespeichert werden, wenn Sie unsere Website besuchen. Sie helfen uns, Ihnen eine bessere Erfahrung zu bieten, indem sie Ihre Präferenzen speichern und verstehen, wie Sie unsere Website nutzen.'
                                    : 'Cookies are small text files that are stored on your device when you visit our website. They help us provide you with a better experience by remembering your preferences and understanding how you use our site.'
                                }
                            </p>
                        </motion.div>

                        {/* Types of Cookies */}
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.4 }}
                            className="mb-12"
                        >
                            <div className="flex items-center mb-6">
                                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mr-4 shadow-sm">
                                    <Settings className="w-6 h-6 text-green-600" />
                                </div>
                                <h2 className="text-3xl font-bold text-gray-900">
                                    {language === 'de' ? 'Arten von Cookies, die wir verwenden' : 'Types of Cookies We Use'}
                                </h2>
                            </div>

                            <div className="grid md:grid-cols-2 gap-6">
                                {/* Essential Cookies */}
                                <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                                    <div className="flex items-center mb-4">
                                        <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                                        <h3 className="font-semibold text-gray-900">
                                            {language === 'de' ? 'Notwendige Cookies' : 'Essential Cookies'}
                                        </h3>
                                    </div>
                                    <p className="text-gray-600 text-sm mb-3">
                                        {language === 'de' ? 'Erforderlich für grundlegende Website-Funktionalität' : 'Required for basic website functionality'}
                                    </p>
                                    <ul className="text-gray-700 text-sm space-y-1">
                                        {language === 'de' ? (
                                            <>
                                                <li>• Authentifizierung und Anmeldesitzungen</li>
                                                <li>• Sicherheit und Betrugsprävention</li>
                                                <li>• Benutzereinstellungen und Präferenzen</li>
                                            </>
                                        ) : (
                                            <>
                                                <li>• Authentication and login sessions</li>
                                                <li>• Security and fraud prevention</li>
                                                <li>• User preferences and settings</li>
                                            </>
                                        )}
                                    </ul>
                                    <div className="mt-4 text-xs text-gray-500 italic">
                                        {language === 'de' ? 'Diese Cookies können nicht deaktiviert werden' : 'These cookies cannot be disabled'}
                                    </div>
                                </div>

                                {/* Analytics Cookies */}
                                <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                                    <div className="flex items-center mb-4">
                                        <Eye className="w-5 h-5 text-blue-600 mr-2" />
                                        <h3 className="font-semibold text-gray-900">
                                            {language === 'de' ? 'Analyse-Cookies' : 'Analytics Cookies'}
                                        </h3>
                                    </div>
                                    <p className="text-gray-600 text-sm mb-3">
                                        {language === 'de' ? 'Helfen uns, die Website-Nutzung zu verstehen' : 'Help us understand website usage'}
                                    </p>
                                    <ul className="text-gray-700 text-sm space-y-1">
                                        {language === 'de' ? (
                                            <>
                                                <li>• Seitenaufrufe und Benutzerverhalten</li>
                                                <li>• Performance-Metriken</li>
                                                <li>• Fehlerverfolgung und Debugging</li>
                                            </>
                                        ) : (
                                            <>
                                                <li>• Page views and user behavior</li>
                                                <li>• Performance metrics</li>
                                                <li>• Error tracking and debugging</li>
                                            </>
                                        )}
                                    </ul>
                                    <div className="mt-4 text-xs text-gray-500 italic">
                                        {language === 'de' ? 'Können in den Einstellungen deaktiviert werden' : 'Can be disabled in settings'}
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Cookie Management */}
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.6 }}
                            className="mb-12"
                        >
                            <div className="flex items-center mb-6">
                                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mr-4 shadow-sm">
                                    <Shield className="w-6 h-6 text-purple-600" />
                                </div>
                                <h2 className="text-3xl font-bold text-gray-900">
                                    {language === 'de' ? 'Verwaltung Ihrer Cookies' : 'Managing Your Cookies'}
                                </h2>
                            </div>

                            <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 mb-6">
                                <h3 className="font-semibold text-gray-900 mb-4 text-lg">
                                    {language === 'de' ? 'Browser-Einstellungen' : 'Browser Settings'}
                                </h3>
                                <p className="mb-4">
                                    {language === 'de'
                                        ? 'Sie können Cookies über Ihre Browser-Einstellungen kontrollieren. Die meisten Browser ermöglichen es Ihnen:'
                                        : 'You can control cookies through your browser settings. Most browsers allow you to:'
                                    }
                                </p>
                                <ul className="space-y-2">
                                    {language === 'de' ? (
                                        <>
                                            <li>• Vorhandene Cookies anzeigen und löschen</li>
                                            <li>• Cookies von bestimmten Websites blockieren</li>
                                            <li>• Drittanbieter-Cookies blockieren</li>
                                            <li>• Präferenzen für Cookie-Akzeptanz festlegen</li>
                                        </>
                                    ) : (
                                        <>
                                            <li>• View and delete existing cookies</li>
                                            <li>• Block cookies from specific websites</li>
                                            <li>• Block third-party cookies</li>
                                            <li>• Set preferences for cookie acceptance</li>
                                        </>
                                    )}
                                </ul>
                            </div>

                            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 shadow-sm">
                                <div className="flex items-start">
                                    <AlertTriangle className="w-5 h-5 text-yellow-600 mt-1 mr-3 flex-shrink-0" />
                                    <div>
                                        <h3 className="font-semibold text-yellow-900 mb-2">
                                            {language === 'de' ? 'Wichtiger Hinweis' : 'Important Notice'}
                                        </h3>
                                        <p className="text-yellow-800 text-sm leading-relaxed">
                                            {language === 'de'
                                                ? 'Das Deaktivieren von notwendigen Cookies kann Ihre Fähigkeit beeinträchtigen, bestimmte Funktionen von Valuact zu nutzen, einschließlich Anmeldung, Kontoverwaltung und Kernfunktionalität.'
                                                : 'Disabling essential cookies may affect your ability to use certain features of Valuact, including login, account management, and core functionality.'
                                            }
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>
        </div>
    );
}
