'use client';

import Link from 'next/link';
import { Calculator, Menu, X, ArrowRight } from 'lucide-react';
import { useState } from 'react';

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);

    const navLinks = [
        { label: 'Methodology', path: '/methodology' },
        { label: 'Calculators', path: '/calculators' }
    ];

    return (
        <nav className="fixed w-full z-50 bg-white/70 backdrop-blur-md border-b border-gray-100">
            <div className="max-w-7xl mx-auto px-6 lg:px-10">
                <div className="flex justify-between h-20 items-center">
                    <div className="flex-shrink-0 flex items-center gap-3 group">
                        <Link href="/" className="flex items-center gap-3">
                            <div className="p-2.5 bg-trust-950 rounded-xl shadow-lg group-hover:scale-105 transition-transform">
                                <Calculator className="h-5 w-5 text-white" />
                            </div>
                            <span className="font-heading font-black text-2xl text-trust-950 tracking-tighter">
                                Valuact<span className="text-trust-600">.</span>
                            </span>
                        </Link>
                    </div>

                    <div className="hidden md:flex items-center space-x-10">
                        {navLinks.map((link, i) => (
                            <Link
                                key={i}
                                href={link.path}
                                className="text-[10px] font-black text-gray-400 hover:text-trust-950 uppercase tracking-[0.2em] transition-colors"
                            >
                                {link.label}
                            </Link>
                        ))}
                        <Link
                            href="/dashboard"
                            className="group flex items-center gap-2 bg-trust-950 text-white px-8 py-3.5 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-trust-900 transition-all shadow-xl shadow-trust-900/10 hover:-translate-y-0.5"
                        >
                            Launch Platform
                            <ArrowRight size={14} className="text-growth-400 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>

                    <div className="md:hidden flex items-center">
                        <button onClick={() => setIsOpen(!isOpen)} className="text-trust-900 p-2">
                            {isOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isOpen && (
                <div className="md:hidden bg-white/95 backdrop-blur-xl border-t border-gray-100 absolute w-full shadow-2xl py-10 px-6 animate-in slide-in-from-top duration-300">
                    <div className="flex flex-col space-y-6">
                        {navLinks.map((link, i) => (
                            <Link
                                key={i}
                                href={link.path}
                                onClick={() => setIsOpen(false)}
                                className="text-sm font-black text-trust-950 uppercase tracking-[0.2em]"
                            >
                                {link.label}
                            </Link>
                        ))}
                        <Link
                            href="/dashboard"
                            onClick={() => setIsOpen(false)}
                            className="flex items-center justify-between w-full bg-trust-950 text-white px-6 py-5 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em]"
                        >
                            Launch Platform
                            <ArrowRight size={18} className="text-growth-400" />
                        </Link>
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
