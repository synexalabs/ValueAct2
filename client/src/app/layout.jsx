import './globals.css';
import { AuthProvider } from '../contexts/AuthContext';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';
import ErrorBoundary from '../components/ErrorBoundary';

export const metadata = {
    title: 'Valuact - Actuarial Intelligence',
    description: 'Actuarial valuation and analysis platform',
};

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <body className="min-h-screen bg-gray-50 flex flex-col">
                <ErrorBoundary>
                    <AuthProvider>
                        <div className="flex-1 flex flex-col">
                            <a
                                href="#main-content"
                                className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-blue-600 text-white px-4 py-2 rounded-lg z-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600"
                            >
                                Skip to main content
                            </a>

                            <Sidebar />

                            <main id="main-content" className="pt-4 lg:pl-64 pl-20 pr-4 sm:pr-6 lg:pr-8 pb-8 lg:ml-4 flex-1">
                                <div className="max-w-7xl mx-auto">
                                    {children}
                                </div>
                            </main>

                            <Footer />
                        </div>
                    </AuthProvider>
                </ErrorBoundary>
            </body>
        </html>
    );
}
