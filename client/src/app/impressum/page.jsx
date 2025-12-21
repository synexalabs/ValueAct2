'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function ImpressumPage() {
    const [language, setLanguage] = useState('en');

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Navigation */}
            <nav className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <Link href="/" className="flex items-center space-x-2">
                            <ArrowLeft className="w-5 h-5 text-gray-600" />
                            <span className="text-lg font-semibold text-gray-900">
                                {language === 'de' ? 'Zurück zur Startseite' : 'Back to Homepage'}
                            </span>
                        </Link>

                        {/* Language Switcher */}
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

            {/* Main Content */}
            <div className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="bg-white rounded-lg shadow-sm p-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-8">
                        {language === 'de' ? 'Impressum' : 'Legal Notice'}
                    </h1>

                    <div className="prose prose-gray max-w-none text-gray-700">
                        {language === 'de' ? (
                            <>
                                <h2 className="text-xl font-semibold text-gray-900 mb-4">Angaben gemäß § 5 TMG</h2>

                                <div className="mb-6">
                                    <p className="mb-2"><strong>Zaur Guliyev</strong></p>
                                    <p className="mb-1">
                                        Wilhelm Liebknecht-Straße 4<br />
                                        28329 Bremen<br />
                                        Deutschland
                                    </p>
                                </div>

                                <div className="mb-6">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Kontakt:</h3>
                                    <p className="mb-1">E-Mail: service@synexalabs.com</p>
                                </div>

                                <div className="mb-6">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Umsatzsteuer-ID:</h3>
                                    <p className="mb-1">Umsatzsteuer-Identifikationsnummer gemäß § 27 a Umsatzsteuergesetz:</p>
                                    <p className="mb-1">DE360921142</p>
                                </div>

                                <div className="mb-6">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV:</h3>
                                    <p className="mb-2">Zaur Guliyev</p>
                                    <p className="mb-1">
                                        Wilhelm Liebknecht-Straße 4<br />
                                        28329 Bremen<br />
                                        Deutschland
                                    </p>
                                </div>

                                <div className="mb-6">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Streitschlichtung</h3>
                                    <p className="mb-2">Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit:
                                        <a href="https://ec.europa.eu/consumers/odr/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-500 ml-1">
                                            https://ec.europa.eu/consumers/odr/
                                        </a>
                                    </p>
                                    <p className="mb-2">Unsere E-Mail-Adresse finden Sie oben im Impressum.</p>
                                    <p className="mb-2">Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.</p>
                                </div>

                                <div className="mb-6">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Haftung für Inhalte</h3>
                                    <p className="mb-2">Als Diensteanbieter sind wir gemäß § 7 Abs.1 TMG für eigene Inhalte auf diesen Seiten nach den allgemeinen Gesetzen verantwortlich. Nach §§ 8 bis 10 TMG sind wir als Diensteanbieter jedoch nicht unter der Verpflichtung, übermittelte oder gespeicherte fremde Informationen zu überwachen oder nach Umständen zu forschen, die auf eine rechtswidrige Tätigkeit hinweisen.</p>
                                    <p className="mb-2">Verpflichtungen zur Entfernung oder Sperrung der Nutzung von Informationen nach den allgemeinen Gesetzen bleiben unberührt. Eine diesbezügliche Haftung ist jedoch erst ab dem Zeitpunkt der Kenntnis einer konkreten Rechtsverletzung möglich. Bei Bekanntwerden von entsprechenden Rechtsverletzungen werden wir diese Inhalte umgehend entfernen.</p>
                                </div>

                                <div className="mb-6">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Haftung für Links</h3>
                                    <p className="mb-2">Unser Angebot enthält Links zu externen Websites Dritter, auf deren Inhalte wir keinen Einfluss haben. Deshalb können wir für diese fremden Inhalte auch keine Gewähr übernehmen. Für die Inhalte der verlinkten Seiten ist stets der jeweilige Anbieter oder Betreiber der Seiten verantwortlich. Die verlinkten Seiten wurden zum Zeitpunkt der Verlinkung auf mögliche Rechtsverstöße überprüft. Rechtswidrige Inhalte waren zum Zeitpunkt der Verlinkung nicht erkennbar.</p>
                                    <p className="mb-2">Eine permanente inhaltliche Kontrolle der verlinkten Seiten ist jedoch ohne konkrete Anhaltspunkte einer Rechtsverletzung nicht zumutbar. Bei Bekanntwerden von Rechtsverletzungen werden wir derartige Links umgehend entfernen.</p>
                                </div>

                                <div className="mb-6">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Urheberrecht</h3>
                                    <p className="mb-2">Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen dem deutschen Urheberrecht. Die Vervielfältigung, Bearbeitung, Verbreitung und jede Art der Verwertung außerhalb der Grenzen des Urheberrechtes bedürfen der schriftlichen Zustimmung des jeweiligen Autors bzw. Erstellers. Downloads und Kopien dieser Seite sind nur für den privaten, nicht kommerziellen Gebrauch gestattet.</p>
                                    <p className="mb-2">Soweit die Inhalte auf dieser Seite nicht vom Betreiber erstellt wurden, werden die Urheberrechte Dritter beachtet. Insbesondere werden Inhalte Dritter als solche gekennzeichnet. Sollten Sie trotzdem auf eine Urheberrechtsverletzung aufmerksam werden, bitten wir um einen entsprechenden Hinweis. Bei Bekanntwerden von Rechtsverletzungen werden wir derartige Inhalte umgehend entfernen.</p>
                                </div>

                                <div className="mb-6">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Datenschutz</h3>
                                    <p className="mb-2">Die Nutzung unserer Webseite ist in der Regel ohne Angabe personenbezogener Daten möglich. Soweit auf unseren Seiten personenbezogene Daten (beispielsweise Name, Anschrift oder eMail-Adressen) erhoben werden, erfolgt dies, soweit möglich, stets auf freiwilliger Basis. Diese Daten werden ohne Ihre ausdrückliche Zustimmung nicht an Dritte weitergegeben.</p>
                                    <p className="mb-2">Wir weisen darauf hin, dass die Datenübertragung im Internet (z.B. bei der Kommunikation per E-Mail) Sicherheitslücken aufweisen kann. Ein lückenloser Schutz der Daten vor dem Zugriff durch Dritte ist nicht möglich.</p>
                                    <p className="mb-2">Der Nutzung von im Rahmen der Impressumspflicht veröffentlichten Kontaktdaten durch Dritte zur Übersendung von nicht ausdrücklich angeforderter Werbung und Informationsmaterialien wird hiermit ausdrücklich widersprochen. Die Betreiber der Seiten behalten sich ausdrücklich rechtliche Schritte im Falle der unverlangten Zusendung von Werbeinformationen, etwa durch Spam-Mails, vor.</p>
                                </div>
                            </>
                        ) : (
                            <>
                                <h2 className="text-xl font-semibold text-gray-900 mb-4">Information according to § 5 TMG</h2>

                                <div className="mb-6">
                                    <p className="mb-2"><strong>Zaur Guliyev</strong></p>
                                    <p className="mb-1">
                                        Wilhelm Liebknecht-Straße 4<br />
                                        28329 Bremen<br />
                                        Germany
                                    </p>
                                </div>

                                <div className="mb-6">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Contact:</h3>
                                    <p className="mb-1">E-Mail: service@synexalabs.com</p>
                                </div>

                                <div className="mb-6">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">VAT ID:</h3>
                                    <p className="mb-1">VAT identification number according to § 27 a of the VAT Act:</p>
                                    <p className="mb-1">DE360921142</p>
                                </div>

                                <div className="mb-6">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Responsible for content according to § 55 Abs. 2 RStV:</h3>
                                    <p className="mb-2">Zaur Guliyev</p>
                                    <p className="mb-1">
                                        Wilhelm Liebknecht-Straße 4<br />
                                        28329 Bremen<br />
                                        Germany
                                    </p>
                                </div>

                                <div className="mb-6">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Dispute Resolution</h3>
                                    <p className="mb-2">The European Commission provides a platform for online dispute resolution (OS):
                                        <a href="https://ec.europa.eu/consumers/odr/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-500 ml-1">
                                            https://ec.europa.eu/consumers/odr/
                                        </a>
                                    </p>
                                    <p className="mb-2">You can find our e-mail address above in the legal notice.</p>
                                    <p className="mb-2">We are not willing or obliged to participate in dispute resolution procedures before a consumer arbitration board.</p>
                                </div>

                                <div className="mb-6">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Liability for Contents</h3>
                                    <p className="mb-2">As service providers, we are liable for our own content of these websites according to § 7 Abs.1 TMG (German Telemedia Act) and general laws. However, according to §§ 8 to 10 TMG, we as service providers are not under obligation to permanently monitor submitted or stored information or to search for evidences that indicate illegal activities.</p>
                                    <p className="mb-2">Legal obligations to removing or blocking the use of information under the general laws remain unaffected. However, a liability in this regard is only possible from the point in time at which the infringement becomes known. As soon as an infringement of the law becomes known, we will remove this content immediately.</p>
                                </div>

                                <div className="mb-6">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Liability for Links</h3>
                                    <p className="mb-2">Our offer contains links to external websites of third parties, on whose contents we have no influence. Therefore, we cannot assume any liability for these external contents. The respective provider or operator of the pages is always responsible for the contents of the linked pages. The linked pages were checked for possible legal violations at the time of linking. Illegal contents were not recognizable at the time of linking.</p>
                                    <p className="mb-2">However, a permanent control of the contents of the linked pages is not reasonable without concrete evidence of a violation of law. Upon notification of violations, we will remove such links immediately.</p>
                                </div>

                                <div className="mb-6">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Copyright</h3>
                                    <p className="mb-2">The contents and works created by the site operators on these pages are subject to German copyright law. The reproduction, processing, distribution and any kind of exploitation outside the scope of the copyright require the written consent of the respective author or creator. Downloads and copies of this site are only permitted for private, non-commercial use.</p>
                                    <p className="mb-2">Insofar as the content on this site was not created by the operator, the copyrights of third parties are respected. In particular, third-party content is identified as such. Should you nevertheless become aware of a copyright infringement, we ask for a corresponding notice. Upon notification of violations, we will remove such content immediately.</p>
                                </div>

                                <div className="mb-6">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Privacy</h3>
                                    <p className="mb-2">The use of our website is usually possible without providing personal data. Insofar as personal data (such as name, address or e-mail addresses) is collected on our pages, this is always done, as far as possible, on a voluntary basis. This data will not be passed on to third parties without your express consent.</p>
                                    <p className="mb-2">We point out that data transmission on the Internet (e.g. when communicating by e-mail) can have security gaps. A complete protection of data against access by third parties is not possible.</p>
                                    <p className="mb-2">The use of contact data published within the framework of the imprint obligation by third parties for the purpose of sending unsolicited advertising and information material is hereby expressly contradicted. The operators of the pages expressly reserve the right to take legal action in the event of unsolicited advertising information, such as spam e-mails.</p>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
