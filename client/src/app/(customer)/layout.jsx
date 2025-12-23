'use client';

import Link from 'next/link';
import { Shield, LogOut, User, FileText, Home } from 'lucide-react';
import { usePathname } from 'next/navigation';

export default function CustomerLayout({ children }) {
    const pathname = usePathname();

    const navItems = [
        { name: 'Overview', href: '/portal', icon: Home },
        { name: 'My Policies', href: '/portal/policies', icon: Shield },
        { name: 'Documents', href: '/portal/documents', icon: FileText },
        { name: 'Profile', href: '/portal/profile', icon: User },
    ];

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
            {/* Top Navigation */}
            <header className="bg-white shadow-sm z-30 sticky top-0">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex">
                            <div className="flex-shrink-0 flex items-center gap-2">
                                <div className="p-1.5 bg-gradient-to-br from-trust-600 to-trust-800 rounded-lg shadow-sm">
                                    <Shield className="h-5 w-5 text-white" />
                                </div>
                                <span className="font-heading font-bold text-xl text-trust-900 tracking-tight">
                                    FairLife <span className="text-trust-400 font-normal">Portal</span>
                                </span>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <span className="text-sm text-gray-500 hidden sm:block">Welcome, Max</span>
                            <button className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors">
                                <LogOut className="h-5 w-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Container */}
            <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Sidebar Navigation */}
                    <nav className="lg:col-span-2 space-y-1">
                        {navItems.map((item) => {
                            const isActive = pathname === item.href;
                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all ${isActive
                                            ? 'bg-trust-900 text-white shadow-md'
                                            : 'text-gray-600 hover:bg-white hover:shadow-sm'
                                        }`}
                                >
                                    <item.icon className="h-4 w-4" />
                                    {item.name}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Content Area */}
                    <main className="lg:col-span-10">
                        {children}
                    </main>
                </div>
            </div>
        </div>
    );
}
