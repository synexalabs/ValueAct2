import './globals.css';
import { AuthProvider } from '../contexts/AuthContext';
import { LanguageProvider } from '../contexts/LanguageContext';
import ErrorBoundary from '../components/ErrorBoundary';

export const metadata = {
    title: 'ValueAct Rechner — IFRS 17 & Solvency II für Aktuare',
    description: 'Kostenloser IFRS 17 und Solvency II Rechner für deutsche Versicherungsmathematiker. CSM-, SCR- und MCR-Berechnungen mit DAV-Sterbetafeln und EIOPA-Zinskurve.',
};

const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'ValueAct Rechner',
    applicationCategory: 'FinanceApplication',
    description: 'Online-Rechner für IFRS 17 und Solvency II mit DAV-Sterbetafeln und EIOPA-Zinskurve',
    operatingSystem: 'Web',
    inLanguage: 'de',
    offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'EUR',
    },
};

export default function RootLayout({ children }) {
    return (
        <html lang="de">
            <head>
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
                />
            </head>
            <body className="min-h-screen bg-white flex flex-col font-sans">
                <ErrorBoundary>
                    <LanguageProvider>
                        <AuthProvider>
                            {children}
                        </AuthProvider>
                    </LanguageProvider>
                </ErrorBoundary>
            </body>
        </html>
    );
}
