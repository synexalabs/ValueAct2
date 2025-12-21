'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function PrivacyPage() {
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
                        {language === 'de' ? 'Datenschutzerklärung' : 'Privacy Policy'}
                    </h1>

                    <div className="prose prose-gray max-w-none text-gray-700">
                        {language === 'de' ? (
                            <>
                                <div className="mb-6">
                                    <h2 className="text-xl font-semibold text-gray-900 mb-4">1. Verantwortlicher</h2>
                                    <p className="mb-2">
                                        <strong>Zaur Guliyev</strong><br />
                                        Deutschland
                                    </p>
                                    <p className="mb-2">
                                        <strong>Kontakt:</strong><br />
                                        E-Mail: service@synexalabs.com
                                    </p>
                                </div>

                                <div className="mb-6">
                                    <h2 className="text-xl font-semibold text-gray-900 mb-4">2. Erhebung und Speicherung personenbezogener Daten</h2>
                                    <p className="mb-2">Wir verarbeiten personenbezogene Daten, wenn Sie:</p>
                                    <ul className="list-disc list-inside mb-2 ml-4">
                                        <li>unsere Website besuchen</li>
                                        <li>ein Nutzerkonto anlegen</li>
                                        <li>den Dienst nutzen (z. B. Kalkulationen durchführen, Daten hochladen)</li>
                                        <li>eine Zahlung vornehmen</li>
                                        <li>uns kontaktieren</li>
                                    </ul>

                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Verarbeitete Datenarten:</h3>
                                    <ul className="list-disc list-inside mb-2 ml-4">
                                        <li>Bestandsdaten (Name, E-Mail, Login-Daten)</li>
                                        <li>Zahlungsdaten (über Stripe/PayPal)</li>
                                        <li>Inhaltsdaten (z. B. hochgeladene Daten, Berechnungsergebnisse)</li>
                                        <li>Nutzungsdaten (Logfiles, IP-Adresse, Browsertyp, Zugriffsdaten)</li>
                                    </ul>
                                </div>

                                <div className="mb-6">
                                    <h2 className="text-xl font-semibold text-gray-900 mb-4">3. Zwecke der Datenverarbeitung</h2>
                                    <p className="mb-2">Wir verarbeiten Ihre Daten zu folgenden Zwecken:</p>
                                    <ul className="list-disc list-inside mb-2 ml-4">
                                        <li>Bereitstellung des SaaS-Dienstes</li>
                                        <li>Durchführung von versicherungsmathematischen Berechnungen</li>
                                        <li>Vertragsdurchführung und Abrechnung</li>
                                        <li>Kundenkommunikation</li>
                                        <li>Verbesserung und Sicherheit des Angebots</li>
                                    </ul>
                                </div>

                                <div className="mb-6">
                                    <h2 className="text-xl font-semibold text-gray-900 mb-4">4. Rechtsgrundlagen</h2>
                                    <p className="mb-2">Die Verarbeitung erfolgt gemäß Art. 6 Abs. 1 DSGVO:</p>
                                    <ul className="list-disc list-inside mb-2 ml-4">
                                        <li><strong>lit. b:</strong> Vertragserfüllung (Nutzung unseres Dienstes)</li>
                                        <li><strong>lit. a:</strong> Einwilligung (z. B. Newsletter)</li>
                                        <li><strong>lit. f:</strong> berechtigtes Interesse (Optimierung, Sicherheit)</li>
                                        <li><strong>lit. c:</strong> rechtliche Verpflichtung (z. B. Steuerrecht)</li>
                                    </ul>
                                </div>

                                <div className="mb-6">
                                    <h2 className="text-xl font-semibold text-gray-900 mb-4">5. Einsatz von Drittanbietern</h2>

                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">a) Hosting & Backend</h3>
                                    <p className="mb-2">
                                        Unser Dienst nutzt Firebase (Google Cloud, USA/EU) zur Bereitstellung von Hosting, Datenbanken, Authentifizierung und Speicherung. Anbieter: Google Ireland Limited, Gordon House, Barrow Street, Dublin 4, Irland.
                                    </p>
                                    <p className="mb-2">
                                        Es kann zu einer Übermittlung in die USA kommen. Google ist nach dem EU-U.S. Data Privacy Framework zertifiziert.
                                    </p>

                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">b) KI-Dienste</h3>
                                    <p className="mb-2">
                                        Für KI-gestützte Beratung und Analyse setzen wir Google Gemini (USA) ein. Daten können an Google Gemini übermittelt und verarbeitet werden.
                                    </p>

                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">c) Webanalyse</h3>
                                    <p className="mb-2">
                                        Wir können Google Analytics zur Reichweitenmessung nutzen, wenn Sie Ihre Einwilligung erteilen. IP-Adressen werden dabei anonymisiert gespeichert. Die Nutzung erfolgt nur mit Ihrer ausdrücklichen Zustimmung über unser Cookie-Banner.
                                    </p>
                                </div>

                                <div className="mb-6">
                                    <h2 className="text-xl font-semibold text-gray-900 mb-4">6. Speicherdauer</h2>
                                    <p className="mb-2">
                                        Wir speichern personenbezogene Daten nur so lange, wie es für die genannten Zwecke erforderlich ist oder wie es gesetzliche Aufbewahrungspflichten verlangen.
                                    </p>
                                    <p className="mb-2">
                                        Sie haben jederzeit das Recht auf Löschung Ihrer Daten gemäß DSGVO Art. 17. Kontaktieren Sie uns unter service@synexalabs.com, um Ihre Daten löschen zu lassen.
                                    </p>
                                </div>

                                <div className="mb-6">
                                    <h2 className="text-xl font-semibold text-gray-900 mb-4">7. Ihre Rechte</h2>
                                    <p className="mb-2">Sie haben gemäß DSGVO folgende Rechte:</p>
                                    <ul className="list-disc list-inside mb-2 ml-4">
                                        <li>Auskunft über Ihre gespeicherten Daten (Art. 15 DSGVO)</li>
                                        <li>Berichtigung (Art. 16 DSGVO)</li>
                                        <li>Löschung („Recht auf Vergessenwerden", Art. 17 DSGVO)</li>
                                        <li>Einschränkung der Verarbeitung (Art. 18 DSGVO)</li>
                                        <li>Datenübertragbarkeit (Art. 20 DSGVO)</li>
                                        <li>Widerspruch gegen Verarbeitung (Art. 21 DSGVO)</li>
                                    </ul>
                                    <p className="mb-2">
                                        Bitte wenden Sie sich hierzu an service@synexalabs.com
                                    </p>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="mb-6">
                                    <h2 className="text-xl font-semibold text-gray-900 mb-4">1. Data Controller</h2>
                                    <p className="mb-2">
                                        <strong>Zaur Guliyev</strong><br />
                                        Germany
                                    </p>
                                    <p className="mb-2">
                                        <strong>Contact:</strong><br />
                                        E-Mail: service@synexalabs.com
                                    </p>
                                </div>

                                <div className="mb-6">
                                    <h2 className="text-xl font-semibold text-gray-900 mb-4">2. Collection and Storage of Personal Data</h2>
                                    <p className="mb-2">We process personal data when you:</p>
                                    <ul className="list-disc list-inside mb-2 ml-4">
                                        <li>visit our website</li>
                                        <li>create a user account</li>
                                        <li>use the service (e.g., perform calculations, upload data)</li>
                                        <li>make a payment</li>
                                        <li>contact us</li>
                                    </ul>

                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Types of Data Processed:</h3>
                                    <ul className="list-disc list-inside mb-2 ml-4">
                                        <li>Master data (name, email, login data)</li>
                                        <li>Payment data (via Stripe/PayPal)</li>
                                        <li>Content data (e.g., uploaded data, calculation results)</li>
                                        <li>Usage data (log files, IP address, browser type, access data)</li>
                                    </ul>
                                </div>

                                <div className="mb-6">
                                    <h2 className="text-xl font-semibold text-gray-900 mb-4">3. Purposes of Data Processing</h2>
                                    <p className="mb-2">We process your data for the following purposes:</p>
                                    <ul className="list-disc list-inside mb-2 ml-4">
                                        <li>Provision of the SaaS service</li>
                                        <li>Performance of actuarial calculations</li>
                                        <li>Contract execution and billing</li>
                                        <li>Customer communication</li>
                                        <li>Improvement and security of the service</li>
                                    </ul>
                                </div>

                                <div className="mb-6">
                                    <h2 className="text-xl font-semibold text-gray-900 mb-4">4. Legal Bases</h2>
                                    <p className="mb-2">Processing is carried out in accordance with Art. 6 para. 1 GDPR:</p>
                                    <ul className="list-disc list-inside mb-2 ml-4">
                                        <li><strong>lit. b:</strong> Contract fulfillment (use of our service)</li>
                                        <li><strong>lit. a:</strong> Consent (e.g., newsletter)</li>
                                        <li><strong>lit. f:</strong> legitimate interest (optimization, security)</li>
                                        <li><strong>lit. c:</strong> legal obligation (e.g., tax law)</li>
                                    </ul>
                                </div>

                                <div className="mb-6">
                                    <h2 className="text-xl font-semibold text-gray-900 mb-4">5. Use of Third-Party Providers</h2>

                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">a) Hosting & Backend</h3>
                                    <p className="mb-2">
                                        Our service uses Firebase (Google Cloud, USA/EU) to provide hosting, databases, authentication, and storage. Provider: Google Ireland Limited, Gordon House, Barrow Street, Dublin 4, Ireland.
                                    </p>
                                    <p className="mb-2">
                                        Data may be transferred to the USA. Google is certified under the EU-U.S. Data Privacy Framework.
                                    </p>

                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">b) AI Services</h3>
                                    <p className="mb-2">
                                        For AI-powered assistance and analysis, we use Google Gemini (USA). Data may be transmitted to and processed by Google Gemini.
                                    </p>

                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">c) Web Analytics</h3>
                                    <p className="mb-2">
                                        We may use Google Analytics for reach measurement if you provide consent. IP addresses are stored in anonymized form. Usage only occurs with your explicit consent via our cookie banner.
                                    </p>
                                </div>

                                <div className="mb-6">
                                    <h2 className="text-xl font-semibold text-gray-900 mb-4">6. Storage Duration</h2>
                                    <p className="mb-2">
                                        We store personal data only as long as it is necessary for the stated purposes or as required by legal retention obligations.
                                    </p>
                                    <p className="mb-2">
                                        You have the right to erasure of your data at any time under GDPR Article 17. Contact us at service@synexalabs.com to have your data deleted.
                                    </p>
                                </div>

                                <div className="mb-6">
                                    <h2 className="text-xl font-semibold text-gray-900 mb-4">7. Your Rights</h2>
                                    <p className="mb-2">You have the following rights under GDPR:</p>
                                    <ul className="list-disc list-inside mb-2 ml-4">
                                        <li>Access to your stored data (Art. 15 GDPR)</li>
                                        <li>Rectification (Art. 16 GDPR)</li>
                                        <li>Erasure ("Right to be forgotten", Art. 17 GDPR)</li>
                                        <li>Restriction of processing (Art. 18 GDPR)</li>
                                        <li>Data portability (Art. 20 GDPR)</li>
                                        <li>Objection to processing (Art. 21 GDPR)</li>
                                    </ul>
                                    <p className="mb-2">
                                        Please contact us at service@synexalabs.com for this purpose.
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
