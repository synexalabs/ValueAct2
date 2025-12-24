import './globals.css';
import { AuthProvider } from '../contexts/AuthContext';
import ErrorBoundary from '../components/ErrorBoundary';

export const metadata = {
    title: 'Valuact - Institutional Actuarial Analytics',
    description: 'Enterprise-grade IFRS 17 and Solvency II actuarial platform. Precision calculations, regulatory compliance, and advanced risk analytics.',
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
