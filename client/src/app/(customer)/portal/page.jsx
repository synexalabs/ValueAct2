'use client';

import { Shield, Download, AlertCircle, Clock, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function CustomerDashboard() {
    return (
        <div className="space-y-8">
            {/* Welcome Section */}
            <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-trust-50 to-growth-50 rounded-bl-[100%] -z-10" />
                <h1 className="text-3xl font-heading font-bold text-trust-900 mb-2">Good afternoon, Max</h1>
                <p className="text-gray-500">Here is what's happening with your protection.</p>
            </div>

            {/* Active Policies */}
            <div className="grid md:grid-cols-2 gap-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-trust-900 text-white rounded-3xl p-6 shadow-xl relative overflow-hidden group"
                >
                    <div className="absolute top-0 right-0 p-32 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-white/10 transition-colors" />

                    <div className="relative z-10">
                        <div className="flex justify-between items-start mb-8">
                            <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-md">
                                <Shield className="h-6 w-6 text-growth-400" />
                            </div>
                            <span className="bg-green-500/20 text-green-300 text-xs font-bold px-3 py-1 rounded-full border border-green-500/30">ACTIVE</span>
                        </div>

                        <h3 className="text-lg text-trust-200 mb-1">Term Life Premium</h3>
                        <div className="text-3xl font-bold mb-6">€250,000</div>

                        <div className="flex justify-between items-end border-t border-white/10 pt-4">
                            <div>
                                <div className="text-xs text-trust-400 mb-1">Next Payment</div>
                                <div className="font-semibold">Oct 24, 2025</div>
                            </div>
                            <div className="text-right">
                                <div className="text-xs text-trust-400 mb-1">Monthly</div>
                                <div className="font-semibold">€24.50</div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Quick Actions / Notifications */}
                <div className="space-y-6">
                    <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex items-start gap-4 hover:shadow-md transition-shadow cursor-pointer">
                        <div className="p-3 bg-red-50 text-red-600 rounded-xl">
                            <AlertCircle className="h-5 w-5" />
                        </div>
                        <div>
                            <h4 className="font-bold text-gray-900">Action Required</h4>
                            <p className="text-sm text-gray-500 mt-1">Please verify your ID to finalize your account setup.</p>
                            <button className="mt-3 text-sm font-semibold text-red-600 hover:text-red-700">Verify Identity &rarr;</button>
                        </div>
                    </div>

                    <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex items-start gap-4 hover:shadow-md transition-shadow cursor-pointer">
                        <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                            <Download className="h-5 w-5" />
                        </div>
                        <div>
                            <h4 className="font-bold text-gray-900">Policy Documents</h4>
                            <p className="text-sm text-gray-500 mt-1">Download your insurance certificate and terms.</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Activity */}
            <div>
                <h3 className="font-heading font-bold text-xl text-gray-900 mb-6">Recent Activity</h3>
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    {[
                        { title: "Policy Activated", date: "Today, 10:23 AM", icon: CheckCircle, color: "text-green-500", bg: "bg-green-50" },
                        { title: "Application Submitted", date: "Yesterday", icon: Clock, color: "text-blue-500", bg: "bg-blue-50" },
                    ].map((item, i) => (
                        <div key={i} className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors border-b last:border-0 border-gray-50">
                            <div className={`p-2 rounded-full ${item.bg} ${item.color}`}>
                                <item.icon className="h-5 w-5" />
                            </div>
                            <div className="flex-1">
                                <div className="font-semibold text-gray-900">{item.title}</div>
                                <div className="text-xs text-gray-500">{item.date}</div>
                            </div>
                            <button className="text-sm text-gray-400 font-medium hover:text-trust-600">View</button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
