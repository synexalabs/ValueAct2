'use client';

import { Shield, Download, AlertCircle, Clock, CheckCircle2, ArrowUpRight, Zap, Target } from 'lucide-react';
import { motion } from 'framer-motion';

export default function CustomerDashboard() {
    return (
        <div className="space-y-10">
            {/* Elegant Welcome Hero */}
            <header className="relative py-8">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <div className="flex items-center gap-2 mb-3">
                            <Zap className="h-4 w-4 text-growth-500 fill-growth-500" />
                            <span className="text-[10px] font-black text-trust-600 uppercase tracking-[0.3em]">Live Protection Active</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-heading font-black text-trust-900 tracking-tight leading-none">
                            Welcome back, <span className="text-trust-600">Max.</span>
                        </h1>
                        <p className="mt-4 text-gray-400 font-medium max-w-md">
                            Your financial legacy is being managed with precision and care. Here is your current coverage status.
                        </p>
                    </div>
                    <div className="flex gap-4">
                        <div className="px-6 py-4 bg-gray-50 rounded-[2rem] border border-gray-100">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Coverage</p>
                            <p className="text-xl font-heading font-black text-trust-900">€750,000</p>
                        </div>
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* Main Policy Card - Takes 2 columns on XL */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="xl:col-span-2 group relative bg-trust-900 rounded-[3rem] p-10 overflow-hidden shadow-2xl shadow-trust-900/20"
                >
                    {/* Decorative Elements */}
                    <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-growth-400/20 to-transparent rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-trust-600/10 rounded-full blur-[80px] pointer-events-none" />

                    <div className="relative z-10 h-full flex flex-col">
                        <div className="flex justify-between items-start mb-12">
                            <div className="h-14 w-14 bg-white/10 backdrop-blur-xl border border-white/10 rounded-2xl flex items-center justify-center">
                                <Shield className="h-7 w-7 text-growth-400" />
                            </div>
                            <div className="flex items-center gap-2 px-4 py-1.5 bg-growth-500/10 border border-growth-500/20 rounded-full">
                                <span className="h-1.5 w-1.5 rounded-full bg-growth-400" />
                                <span className="text-[10px] font-black text-growth-400 uppercase tracking-widest">Master Policy</span>
                            </div>
                        </div>

                        <div className="flex-1">
                            <h2 className="text-4xl font-heading font-black text-white tracking-tight mb-2">Term Life Platinum</h2>
                            <p className="text-trust-300 font-medium">Policy ID: FL-99120-X</p>

                            <div className="mt-10 grid grid-cols-2 sm:grid-cols-3 gap-8">
                                <div>
                                    <p className="text-[10px] font-bold text-trust-400 uppercase tracking-widest mb-1">Face Value</p>
                                    <p className="text-2xl font-bold text-white">€500,000</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-trust-400 uppercase tracking-widest mb-1">Monthly Premium</p>
                                    <p className="text-2xl font-bold text-white">€34.20</p>
                                </div>
                                <div className="hidden sm:block">
                                    <p className="text-[10px] font-bold text-trust-400 uppercase tracking-widest mb-1">Loyalty Bonus</p>
                                    <p className="text-2xl font-bold text-growth-400">+ €5,200</p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-12 flex flex-wrap gap-4 pt-8 border-t border-white/10">
                            <button className="px-6 py-3 bg-white text-trust-900 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-growth-400 hover:text-white transition-all transform hover:-translate-y-1">
                                Download Certificate
                            </button>
                            <button className="px-6 py-3 bg-white/10 text-white rounded-xl font-black text-[10px] uppercase tracking-widest border border-white/10 hover:bg-white/20 transition-all">
                                View Full Details
                            </button>
                        </div>
                    </div>
                </motion.div>

                {/* Vertical actions on XL */}
                <div className="flex flex-col gap-6">
                    {/* Urgency Alert */}
                    <div className="bg-red-50 border border-red-100 rounded-[2.5rem] p-8 relative overflow-hidden group hover:scale-[1.02] transition-transform cursor-pointer">
                        <div className="absolute top-0 right-0 p-6 opacity-[0.05] group-hover:scale-125 transition-transform duration-500">
                            <AlertCircle size={80} className="text-red-900" />
                        </div>
                        <div className="h-10 w-10 bg-red-100 rounded-xl flex items-center justify-center mb-6">
                            <AlertCircle className="h-5 w-5 text-red-600" />
                        </div>
                        <h4 className="text-lg font-black text-red-950 leading-tight">Verification Needed</h4>
                        <p className="mt-2 text-sm text-red-700/70 font-medium">Your secondary ID document expired last week.</p>
                        <button className="mt-6 flex items-center gap-2 text-xs font-black text-red-600 uppercase tracking-widest hover:translate-x-1 transition-transform">
                            Update Now <ArrowUpRight size={14} />
                        </button>
                    </div>

                    {/* Quick Access Documents */}
                    <div className="bg-white border border-gray-100 rounded-[2.5rem] p-8 shadow-sm group hover:shadow-xl hover:shadow-trust-900/5 transition-all cursor-pointer">
                        <div className="h-10 w-10 bg-gray-50 group-hover:bg-trust-900 group-hover:text-white rounded-xl flex items-center justify-center mb-6 transition-colors">
                            <Download className="h-5 w-5" />
                        </div>
                        <h4 className="text-lg font-black text-trust-900 leading-tight">Smart Vault</h4>
                        <p className="mt-2 text-sm text-gray-400 font-medium">Access your tax statements and receipts.</p>
                        <div className="mt-6 h-1 w-full bg-gray-50 rounded-full overflow-hidden">
                            <div className="h-full bg-trust-900 w-[65%]" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Section: Activity and Targets */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 pt-6">
                <div className="lg:col-span-2">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-2xl font-heading font-black text-trust-900 uppercase tracking-tight">Timeline</h3>
                        <button className="text-[10px] font-black text-trust-600 uppercase tracking-widest hover:underline">Full History</button>
                    </div>

                    <div className="space-y-4">
                        {[
                            { title: "Premium Payment Success", meta: "Monthly recurring • €34.20", date: "Oct 12, 2024", icon: CheckCircle2, color: "text-growth-500", bg: "bg-growth-50" },
                            { title: "Smart Claim Initiated", meta: "ID: CL-2291 • Surgical benefit", date: "Oct 09, 2024", icon: Zap, color: "text-trust-600", bg: "bg-trust-50" },
                            { title: "New Document Added", meta: "Annual Statement 2023", date: "Sep 28, 2024", icon: Clock, color: "text-gray-400", bg: "bg-gray-50" }
                        ].map((item, i) => (
                            <motion.div
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.1 }}
                                key={i}
                                className="flex items-center gap-5 p-5 bg-white border border-gray-50 rounded-[1.5rem] hover:border-gray-200 hover:shadow-sm transition-all group"
                            >
                                <div className={`h-12 w-12 rounded-2xl ${item.bg} ${item.color} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
                                    <item.icon size={22} />
                                </div>
                                <div className="flex-1">
                                    <p className="font-bold text-trust-900 leading-none mb-1">{item.title}</p>
                                    <p className="text-xs text-gray-400 font-medium">{item.meta}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">{item.date}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>

                <div className="bg-gray-50 rounded-[3rem] p-8 border border-gray-100 h-fit">
                    <div className="flex items-center gap-3 mb-8">
                        <Target className="h-5 w-5 text-trust-900" />
                        <h3 className="text-[10px] font-black text-trust-900 uppercase tracking-[0.2em]">Goal Projection</h3>
                    </div>

                    <div className="text-center mb-8">
                        <p className="text-4xl font-heading font-black text-trust-900">€1.2M</p>
                        <p className="text-xs text-gray-400 font-medium mt-1">Projected payout in 2045</p>
                    </div>

                    <div className="space-y-6">
                        <div className="space-y-2">
                            <div className="flex justify-between text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                <span>Current Fund</span>
                                <span className="text-trust-900">42%</span>
                            </div>
                            <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                                <div className="h-full bg-growth-500 w-[42%]" />
                            </div>
                        </div>

                        <div className="p-4 bg-white rounded-2xl border border-gray-100">
                            <p className="text-[10px] font-bold text-trust-600 uppercase tracking-widest mb-1">Advisor Tip</p>
                            <p className="text-xs text-gray-500 font-medium leading-relaxed">
                                Increasing your premium by <span className="text-trust-900 font-bold">€5/mo</span> could reach your goal 3 years earlier.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
