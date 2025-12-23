'use client';

import Link from 'next/link';
import { Shield, LogOut, User, FileText, Home, Activity, CheckCircle2, Zap } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';

export default function CustomerLayout({ children }) {
    const pathname = usePathname();

    const navItems = [
        { name: 'Overview', href: '/portal', icon: Home },
        { name: 'Policies', href: '/portal/policies', icon: Shield },
        { name: 'Claims', href: '/portal/claims', icon: Activity },
        { name: 'Documents', href: '/portal/documents', icon: FileText },
        { name: 'Profile', href: '/portal/profile', icon: User },
    ];

    return (
        <div className="min-h-screen bg-white flex flex-col font-sans selection:bg-trust-100 selection:text-trust-900">
            {/* Top Navigation */}
            <header className="bg-white/70 backdrop-blur-md border-b border-gray-100 z-40 sticky top-0">
                <div className="max-w-[1400px] mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/portal" className="flex items-center gap-2.5 group">
                            <div className="h-10 w-10 bg-trust-950 rounded-2xl flex items-center justify-center shadow-lg shadow-trust-900/10 group-hover:scale-105 transition-transform overflow-hidden relative">
                                <div className="absolute inset-0 bg-gradient-to-br from-trust-600/20 to-transparent" />
                                <Shield className="h-5 w-5 text-white relative z-10" />
                            </div>
                            <div className="flex flex-col">
                                <span className="font-heading font-black text-lg text-trust-900 leading-tight tracking-tight flex items-center gap-1.5">
                                    FairLife <Zap size={14} className="text-growth-400 fill-growth-400" />
                                </span>
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] leading-none">
                                    Trust Services
                                </span>
                            </div>
                        </Link>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="hidden md:flex items-center gap-3 px-4 py-2 bg-gray-50 border border-gray-100 rounded-2xl">
                            <div className="h-2 w-2 rounded-full bg-growth-500 animate-pulse" />
                            <span className="text-xs font-bold text-trust-900">System Secure</span>
                        </div>

                        <div className="flex items-center gap-3 border-l border-gray-100 pl-6">
                            <div className="text-right hidden sm:block">
                                <p className="text-sm font-bold text-trust-900 leading-none">Max Weber</p>
                                <p className="text-[10px] font-medium text-gray-400 mt-1">Policy ID: FL-99212</p>
                            </div>
                            <button className="h-10 w-10 flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all">
                                <LogOut className="h-5 w-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content Layout */}
            <div className="flex-1 max-w-[1400px] mx-auto w-full px-6 py-10 relative">
                {/* Background Decor */}
                <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-trust-50/30 blur-[100px] rounded-full pointer-events-none -z-10" />

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                    {/* Sidebar Navigation */}
                    <aside className="lg:col-span-3 xl:col-span-2">
                        <nav className="space-y-2 sticky top-30">
                            {navItems.map((item) => {
                                const isActive = pathname === item.href;
                                return (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        className={`group flex items-center gap-3 px-5 py-3.5 text-sm font-bold rounded-2xl transition-all active:scale-95 ${isActive
                                            ? 'bg-trust-900 text-white shadow-xl shadow-trust-900/10'
                                            : 'text-gray-500 hover:bg-gray-50 hover:text-trust-900'
                                            }`}
                                    >
                                        <item.icon className={`h-4.5 w-4.5 transition-colors ${isActive ? 'text-growth-400' : 'text-gray-400 group-hover:text-trust-900'}`} />
                                        {item.name}
                                    </Link>
                                );
                            })}
                        </nav>

                        {/* Sidebar Badge */}
                        <div className="mt-10 p-5 bg-gradient-to-br from-trust-900 to-trust-950 rounded-[2rem] text-white relative overflow-hidden shadow-2xl">
                            <div className="absolute top-0 right-0 p-4 opacity-10">
                                <CheckCircle2 size={60} />
                            </div>
                            <h4 className="text-xs font-black uppercase tracking-[0.2em] mb-2 text-trust-200">Membership</h4>
                            <p className="font-heading text-lg font-bold">Premium Tier</p>
                            <div className="mt-4 pt-4 border-t border-white/10">
                                <button className="text-[10px] font-black uppercase tracking-widest text-growth-400 hover:text-white transition-colors">
                                    View Benefits →
                                </button>
                            </div>
                        </div>
                    </aside>

                    {/* Main Content Area */}
                    <main className="lg:col-span-9 xl:col-span-10">
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4 }}
                        >
                            {children}
                        </motion.div>
                    </main>
                </div>
            </div>

            {/* Simple Footer */}
            <footer className="border-t border-gray-100 py-8">
                <div className="max-w-[1400px] mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                        © 2024 Valuact Premium Trust • Authorized Financial Provider
                    </p>
                    <div className="flex gap-6">
                        <a href="#" className="text-[10px] font-bold text-gray-400 uppercase tracking-widest hover:text-trust-900 transition-colors">Emergency Support</a>
                        <a href="#" className="text-[10px] font-bold text-gray-400 uppercase tracking-widest hover:text-trust-900 transition-colors">Legal Disclosure</a>
                    </div>
                </div>
            </footer>
        </div>
    );
}
