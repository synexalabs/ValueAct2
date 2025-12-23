import './globals.css';
import { AuthProvider } from '../contexts/AuthContext';
import ErrorBoundary from '../components/ErrorBoundary';

export const metadata = {
    title: 'FairLife - Insurance for the Future',
    description: 'Premiums that adapt to your life. Instant coverage, 100% digital.',
};

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <body className="min-h-screen bg-white flex flex-col font-sans">
                <ErrorBoundary>
                    <AuthProvider>
                        {children}
                    </AuthProvider>
                </ErrorBoundary>
            </body>
        </html>
    );
}
