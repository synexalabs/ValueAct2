'use client';

import Link from 'next/link';
import { Shield, Menu, X } from 'lucide-react';
import { useState } from 'react';

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <nav className="fixed w-full z-50 transition-all duration-300 bg-white/80 backdrop-blur-md border-b border-white/20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-20 items-center">
                    <div className="flex-shrink-0 flex items-center gap-2">
                        <div className="p-2 bg-gradient-to-br from-trust-600 to-trust-800 rounded-lg shadow-lg">
                            <Shield className="h-6 w-6 text-white" />
                        </div>
                        <span className="font-heading font-bold text-2xl text-trust-900 tracking-tight">
                            FairLife
                        </span>
                    </div>

                    <div className="hidden md:flex items-center space-x-8">
                        <Link href="/products" className="text-trust-700 hover:text-trust-900 font-medium transition-colors">
                            Products
                        </Link>
                        <Link href="/about" className="text-trust-700 hover:text-trust-900 font-medium transition-colors">
                            About Us
                        </Link>
                        <Link href="/claims" className="text-trust-700 hover:text-trust-900 font-medium transition-colors">
                            Claims
                        </Link>
                        <Link href="/login" className="text-trust-700 hover:text-trust-900 font-medium transition-colors">
                            Login
                        </Link>
                        <Link
                            href="/get-quote"
                            className="bg-trust-600 text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-trust-700 transition-all shadow-warm hover:shadow-lg transform hover:-translate-y-0.5"
                        >
                            Get a Quote
                        </Link>
                    </div>

                    <div className="md:hidden flex items-center">
                        <button onClick={() => setIsOpen(!isOpen)} className="text-trust-800 focus:outline-none">
                            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {isOpen && (
                <div className="md:hidden bg-white border-t border-gray-100 absolute w-full shadow-lg">
                    <div className="px-4 pt-2 pb-6 space-y-2">
                        <Link href="/products" className="block px-3 py-2 text-trust-700 font-medium rounded-lg hover:bg-trust-50">Products</Link>
                        <Link href="/about" className="block px-3 py-2 text-trust-700 font-medium rounded-lg hover:bg-trust-50">About Us</Link>
                        <Link href="/claims" className="block px-3 py-2 text-trust-700 font-medium rounded-lg hover:bg-trust-50">Claims</Link>
                        <Link href="/login" className="block px-3 py-2 text-trust-700 font-medium rounded-lg hover:bg-trust-50">Login</Link>
                        <div className="pt-4">
                            <Link href="/get-quote" className="block w-full text-center bg-trust-600 text-white px-4 py-3 rounded-xl font-semibold">
                                Get a Quote
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
