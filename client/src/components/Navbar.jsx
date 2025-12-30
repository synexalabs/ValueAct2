'use client';

import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);

    const navLinks = [
        { label: 'Methodology', path: '/methodology' },
        { label: 'Calculators', path: '/calculators' }
    ];

    return (
        <nav className="fixed w-full z-50 bg-white/90 backdrop-blur-sm border-b border-gray-100">
            <div className="max-w-6xl mx-auto px-6">
                <div className="flex justify-between h-16 items-center">
                    <Link href="/" className="flex items-center gap-2.5">
                        <div className="w-8 h-8 bg-trust-950 rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-sm">V</span>
                        </div>
                        <span className="font-semibold text-xl text-trust-950">
                            Valuact
                        </span>
                    </Link>

                    <div className="hidden md:flex items-center gap-8">
                        {navLinks.map((link, i) => (
                            <Link
                                key={i}
                                href={link.path}
                                className="text-sm text-gray-600 hover:text-trust-950 transition-colors"
                            >
                                {link.label}
                            </Link>
                        ))}
                        <Link
                            href="/dashboard"
                            className="bg-trust-950 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-trust-900 transition-colors"
                        >
                            Open Platform
                        </Link>
                    </div>

                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="md:hidden text-trust-900 p-2"
                        aria-label="Toggle menu"
                    >
                        {isOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            {isOpen && (
                <div className="md:hidden bg-white border-t border-gray-100 absolute w-full shadow-lg py-6 px-6">
                    <div className="flex flex-col gap-4">
                        {navLinks.map((link, i) => (
                            <Link
                                key={i}
                                href={link.path}
                                onClick={() => setIsOpen(false)}
                                className="text-base text-trust-950 font-medium py-2"
                            >
                                {link.label}
                            </Link>
                        ))}
                        <Link
                            href="/dashboard"
                            onClick={() => setIsOpen(false)}
                            className="bg-trust-950 text-white px-5 py-3 rounded-lg text-sm font-medium text-center mt-2"
                        >
                            Open Platform
                        </Link>
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
