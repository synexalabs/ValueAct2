'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function TermsPage() {
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

            <div className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="bg-white rounded-lg shadow-sm p-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-8">
                        {language === 'de' ? 'Allgemeine Geschäftsbedingungen' : 'Terms and Conditions'}
                    </h1>

                    <div className="prose prose-gray max-w-none text-gray-700">
                        {language === 'de' ? (
                            <>
                                <div className="mb-6">
                                    <h2 className="text-xl font-semibold text-gray-900 mb-4">§ 1 Geltungsbereich</h2>
                                    <p className="mb-2">
                                        Diese Allgemeinen Geschäftsbedingungen (AGB) gelten für die Nutzung der Valuact-Plattform (im Folgenden "Dienst") von Zaur Guliyev, Wilhelm Liebknecht-Straße 4, 28329 Bremen.
                                    </p>
                                    <p className="mb-2">
                                        Mit der Nutzung des Dienstes erkennen Sie diese AGB als verbindlich an. Sollten einzelne Bestimmungen unwirksam sein, bleibt die Wirksamkeit der übrigen Bestimmungen unberührt.
                                    </p>
                                </div>

                                <div className="mb-6">
                                    <h2 className="text-xl font-semibold text-gray-900 mb-4">§ 2 Leistungsbeschreibung</h2>
                                    <p className="mb-2">
                                        Valuact ist eine SaaS-Plattform für versicherungsmathematische Berechnungen und Analysen. Der Dienst umfasst:
                                    </p>
                                    <ul className="list-disc list-inside mb-2 ml-4">
                                        <li>IFRS 17 Berechnungen (CSM, Risk Adjustment, BEL)</li>
                                        <li>Solvency II Berechnungen (SCR, MCR, Solvency Ratio)</li>
                                        <li>Pricing und Produktentwicklung</li>
                                        <li>Sterbetafeln und Mortalitätsberechnungen</li>
                                    </ul>
                                </div>

                                <div className="mb-6">
                                    <h2 className="text-xl font-semibold text-gray-900 mb-4">§ 3 Registrierung und Nutzerkonto</h2>
                                    <p className="mb-2">Für die Nutzung des Dienstes ist eine Registrierung erforderlich. Sie verpflichten sich:</p>
                                    <ul className="list-disc list-inside mb-2 ml-4">
                                        <li>Wahrheitsgemäße und vollständige Angaben zu machen</li>
                                        <li>Ihre Zugangsdaten vertraulich zu behandeln</li>
                                        <li>Unverzüglich über Missbrauch zu informieren</li>
                                        <li>Nur ein Nutzerkonto pro Person zu führen</li>
                                    </ul>
                                </div>

                                <div className="mb-6">
                                    <h2 className="text-xl font-semibold text-gray-900 mb-4">§ 4 Nutzungsbedingungen</h2>
                                    <p className="mb-2">Sie verpflichten sich, den Dienst nur für rechtmäßige Zwecke zu nutzen und:</p>
                                    <ul className="list-disc list-inside mb-2 ml-4">
                                        <li>Keine rechtswidrigen, beleidigenden oder diskriminierenden Inhalte hochzuladen</li>
                                        <li>Keine Urheberrechte oder andere Rechte Dritter zu verletzen</li>
                                        <li>Keine Malware oder schädliche Software zu verwenden</li>
                                        <li>Den Dienst nicht zu missbrauchen oder zu manipulieren</li>
                                    </ul>
                                </div>

                                <div className="mb-6">
                                    <h2 className="text-xl font-semibold text-gray-900 mb-4">§ 5 Zahlungsbedingungen</h2>
                                    <p className="mb-2">Die Nutzung des Dienstes erfolgt auf Basis der gewählten Tarife. Zahlungen sind:</p>
                                    <ul className="list-disc list-inside mb-2 ml-4">
                                        <li>Vorab zu leisten (bei monatlichen/jährlichen Abonnements)</li>
                                        <li>Nicht erstattungsfähig</li>
                                        <li>In Euro (EUR) zu entrichten</li>
                                    </ul>
                                </div>

                                <div className="mb-6">
                                    <h2 className="text-xl font-semibold text-gray-900 mb-4">§ 6 Haftung und Gewährleistung</h2>
                                    <p className="mb-2">Wir haften nur für Vorsatz und grobe Fahrlässigkeit. Die Haftung ist ausgeschlossen für:</p>
                                    <ul className="list-disc list-inside mb-2 ml-4">
                                        <li>Leichte Fahrlässigkeit (außer bei Verletzung wesentlicher Vertragspflichten)</li>
                                        <li>Schäden durch höhere Gewalt</li>
                                        <li>Berechnungsergebnisse, die auf fehlerhaften Eingabedaten basieren</li>
                                        <li>KI-generierte Beratungen (siehe separate Haftungsklausel)</li>
                                    </ul>
                                </div>

                                <div className="mb-6">
                                    <h2 className="text-xl font-semibold text-gray-900 mb-4">§ 7 Datenschutz</h2>
                                    <p className="mb-2">
                                        Die Verarbeitung personenbezogener Daten erfolgt gemäß unserer Datenschutzerklärung, die Bestandteil dieser AGB ist.
                                    </p>
                                </div>

                                <div className="mb-6">
                                    <h2 className="text-xl font-semibold text-gray-900 mb-4">§ 8 Schlussbestimmungen</h2>
                                    <p className="mb-2">Es gilt deutsches Recht. Gerichtsstand ist Bremen.</p>
                                    <p className="mb-2">
                                        <strong>Kontakt:</strong><br />
                                        Zaur Guliyev<br />
                                        Wilhelm Liebknecht-Straße 4<br />
                                        28329 Bremen<br />
                                        E-Mail: service@synexalabs.com
                                    </p>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="mb-6">
                                    <h2 className="text-xl font-semibold text-gray-900 mb-4">§ 1 Scope of Application</h2>
                                    <p className="mb-2">
                                        These Terms and Conditions (T&C) apply to the use of the Valuact platform (hereinafter "Service") by Zaur Guliyev, Wilhelm Liebknecht-Straße 4, 28329 Bremen.
                                    </p>
                                    <p className="mb-2">
                                        By using the service, you acknowledge these T&C as binding. Should individual provisions be invalid, the validity of the remaining provisions remains unaffected.
                                    </p>
                                </div>

                                <div className="mb-6">
                                    <h2 className="text-xl font-semibold text-gray-900 mb-4">§ 2 Service Description</h2>
                                    <p className="mb-2">
                                        Valuact is a SaaS platform for actuarial calculations and analysis. The service includes:
                                    </p>
                                    <ul className="list-disc list-inside mb-2 ml-4">
                                        <li>IFRS 17 calculations (CSM, Risk Adjustment, BEL)</li>
                                        <li>Solvency II calculations (SCR, MCR, Solvency Ratio)</li>
                                        <li>Pricing and product development</li>
                                        <li>Mortality tables and mortality calculations</li>
                                    </ul>
                                </div>

                                <div className="mb-6">
                                    <h2 className="text-xl font-semibold text-gray-900 mb-4">§ 3 Registration and User Account</h2>
                                    <p className="mb-2">Registration is required to use the service. You undertake to:</p>
                                    <ul className="list-disc list-inside mb-2 ml-4">
                                        <li>Provide truthful and complete information</li>
                                        <li>Treat your access data confidentially</li>
                                        <li>Inform us immediately of any misuse</li>
                                        <li>Maintain only one user account per person</li>
                                    </ul>
                                </div>

                                <div className="mb-6">
                                    <h2 className="text-xl font-semibold text-gray-900 mb-4">§ 4 Terms of Use</h2>
                                    <p className="mb-2">You undertake to use the service only for lawful purposes and:</p>
                                    <ul className="list-disc list-inside mb-2 ml-4">
                                        <li>Not upload illegal, offensive or discriminatory content</li>
                                        <li>Not violate copyrights or other third-party rights</li>
                                        <li>Not use malware or harmful software</li>
                                        <li>Not abuse or manipulate the service</li>
                                    </ul>
                                </div>

                                <div className="mb-6">
                                    <h2 className="text-xl font-semibold text-gray-900 mb-4">§ 5 Payment Terms</h2>
                                    <p className="mb-2">Use of the service is based on the selected tariffs. Payments are:</p>
                                    <ul className="list-disc list-inside mb-2 ml-4">
                                        <li>To be made in advance (for monthly/annual subscriptions)</li>
                                        <li>Non-refundable</li>
                                        <li>To be made in Euro (EUR)</li>
                                    </ul>
                                </div>

                                <div className="mb-6">
                                    <h2 className="text-xl font-semibold text-gray-900 mb-4">§ 6 Liability and Warranty</h2>
                                    <p className="mb-2">We are only liable for intent and gross negligence. Liability is excluded for:</p>
                                    <ul className="list-disc list-inside mb-2 ml-4">
                                        <li>Simple negligence (except for breach of essential contractual obligations)</li>
                                        <li>Damages due to force majeure</li>
                                        <li>Calculation results based on incorrect input data</li>
                                        <li>AI-generated advice (see separate liability clause)</li>
                                    </ul>
                                </div>

                                <div className="mb-6">
                                    <h2 className="text-xl font-semibold text-gray-900 mb-4">§ 7 Data Protection</h2>
                                    <p className="mb-2">
                                        The processing of personal data is carried out in accordance with our privacy policy, which is part of these T&C.
                                    </p>
                                </div>

                                <div className="mb-6">
                                    <h2 className="text-xl font-semibold text-gray-900 mb-4">§ 8 Final Provisions</h2>
                                    <p className="mb-2">German law applies. Place of jurisdiction is Bremen.</p>
                                    <p className="mb-2">
                                        <strong>Contact:</strong><br />
                                        Zaur Guliyev<br />
                                        Wilhelm Liebknecht-Straße 4<br />
                                        28329 Bremen<br />
                                        E-Mail: service@synexalabs.com
                                    </p>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
