'use client';

import React, { useState, useEffect } from 'react';
import {
    LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { TrendingUp, Shield, Activity, DollarSign, AlertTriangle } from 'lucide-react';
import { data } from '../../../utils/api';
import { formatCurrency, formatPercentage } from '../../../utils/formatters';

// MOCK DATA FOR DEMONSTRATION
const MOCK_PROJECTION_DATA = [
    { year: 2024, csm: 1000000, ra: 200000, bel: 5000000 },
    { year: 2025, csm: 950000, ra: 190000, bel: 4800000 },
    { year: 2026, csm: 900000, ra: 180000, bel: 4600000 },
    { year: 2027, csm: 850000, ra: 170000, bel: 4400000 },
    { year: 2028, csm: 800000, ra: 160000, bel: 4200000 },
];

const MOCK_RISK_COMPOSITION = [
    { name: 'Mortality Risk', value: 450000 },
    { name: 'Lapse Risk', value: 300000 },
    { name: 'Expense Risk', value: 150000 },
    { name: 'Market Risk', value: 200000 },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

export default function AnalyticsDashboard() {
    const [loading, setLoading] = useState(true);
    const [dashboardData, setDashboardData] = useState({
        kpis: {
            totalCSM: 1000000,
            solvencyRatio: 1.85,
            totalFCF: 5200000,
            portfolioSize: 1542
        },
        projections: MOCK_PROJECTION_DATA,
        riskComposition: MOCK_RISK_COMPOSITION
    });

    useEffect(() => {
        const timer = setTimeout(() => setLoading(false), 1000);
        return () => clearTimeout(timer);
    }, []);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
                <div className="h-12 w-12 border-4 border-trust-100 border-t-trust-900 rounded-full animate-spin"></div>
                <p className="text-sm font-bold text-trust-900 uppercase tracking-widest animate-pulse">Analyzing Portfolio...</p>
            </div>
        );
    }

    return (
        <div className="space-y-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <div className="px-4 py-1.5 bg-trust-50 text-trust-600 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] mb-4 inline-block border border-trust-100">
                        Live Actuarial Ledger
                    </div>
                    <h1 className="text-4xl font-heading font-bold text-trust-900">Portfolio Performance</h1>
                    <p className="text-gray-400 font-medium">Deep-dive analytics and risk projections for current assets.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="px-6 py-3 bg-white border border-gray-100 rounded-2xl text-sm font-bold text-trust-900 shadow-sm hover:shadow-md transition-all active:scale-95 flex items-center gap-2">
                        <Download className="h-4 w-4 text-gray-400" />
                        Export Data
                    </button>
                    <button className="px-6 py-3 bg-trust-950 text-white rounded-2xl text-sm font-bold shadow-lg shadow-trust-900/20 hover:bg-trust-900 transition-all active:scale-95">
                        Refresh Run
                    </button>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <KPICard
                    title="Gross CSM"
                    value={formatCurrency(dashboardData.kpis.totalCSM)}
                    change="+2.4%"
                    icon={TrendingUp}
                    color="trust"
                />
                <KPICard
                    title="Solvency Ratio"
                    value={formatPercentage(dashboardData.kpis.solvencyRatio)}
                    change="-0.5%"
                    icon={Shield}
                    color="growth"
                />
                <KPICard
                    title="Aggregate FCF"
                    value={formatCurrency(dashboardData.kpis.totalFCF)}
                    change="+1.8%"
                    icon={DollarSign}
                    color="accent"
                />
                <KPICard
                    title="Policy Velocity"
                    value={dashboardData.kpis.portfolioSize.toLocaleString()}
                    change="+14"
                    icon={Activity}
                    color="trust"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* CSM Projection Chart */}
                <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-lg font-heading font-bold text-trust-900">Liability Projection</h3>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">IFRS 17 Projections (CSM/RA/BEL)</p>
                        </div>
                    </div>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={dashboardData.projections}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 700, fill: '#94a3b8' }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 700, fill: '#94a3b8' }} tickFormatter={(val) => `${val / 1000000}M`} />
                                <Tooltip
                                    cursor={{ fill: '#f8fafc' }}
                                    contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)', padding: '1rem' }}
                                    formatter={(value) => formatCurrency(value)}
                                />
                                <Legend iconType="circle" wrapperStyle={{ paddingTop: '2rem', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }} />
                                <Bar dataKey="bel" stackId="a" fill="#e2e8f0" name="BEL" radius={[0, 0, 0, 0]} />
                                <Bar dataKey="ra" stackId="a" fill="#c084fc" name="Risk Adjustment" />
                                <Bar dataKey="csm" stackId="a" fill="#0f172a" name="CSM" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Risk Composition Chart */}
                <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-lg font-heading font-bold text-trust-900">SCR Risk Weighting</h3>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Capital Composition breakdown</p>
                        </div>
                    </div>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={dashboardData.riskComposition}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={70}
                                    outerRadius={100}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {[
                                        '#0f172a', // deep navy
                                        '#10b981', // growth green
                                        '#f59e0b', // accent gold
                                        '#64748b'  // gray
                                    ].map((color, index) => (
                                        <Cell key={`cell-${index}`} fill={color} stroke="none" />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)', padding: '1rem' }}
                                    formatter={(value) => formatCurrency(value)}
                                />
                                <Legend verticalAlign="middle" align="right" layout="vertical" iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Recent Alerts / Warnings */}
            <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
                <h3 className="text-lg font-heading font-bold text-trust-900 mb-6">System Surveillance</h3>
                <div className="space-y-4">
                    <AlertItem
                        type="warning"
                        message="Internal capital target breached (185% < 190% threshold)"
                        timestamp="12:42 PM"
                    />
                    <AlertItem
                        type="info"
                        message="Nightly valuation for Batch #AZ-99 completed"
                        timestamp="04:15 AM"
                    />
                </div>
            </div>
        </div>
    );
}

function KPICard({ title, value, change, icon: Icon, color }) {
    const colors = {
        trust: { bg: 'bg-trust-50', text: 'text-trust-900', icon: 'bg-trust-900 text-white' },
        growth: { bg: 'bg-growth-50', text: 'text-growth-600', icon: 'bg-growth-600 text-white' },
        accent: { bg: 'bg-accent-50', text: 'text-accent-700', icon: 'bg-accent-600 text-white' },
    };

    const isPositive = change.startsWith('+');

    return (
        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            <div className="flex justify-between items-start mb-6">
                <div className={`p-4 rounded-2xl shadow-sm ${colors[color].icon}`}>
                    <Icon size={24} />
                </div>
                <div className={`px-2.5 py-1 rounded-lg text-[10px] font-black tracking-tighter shadow-sm ${isPositive ? 'bg-growth-50 text-growth-700' : 'bg-accent-50 text-accent-700'
                    }`}>
                    {change}
                </div>
            </div>
            <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{title}</p>
                <h3 className="text-3xl font-heading font-extrabold text-trust-900 mt-1">{value}</h3>
            </div>
        </div>
    );
}

function AlertItem({ type, message, timestamp }) {
    const isWarning = type === 'warning';
    return (
        <div className={`flex items-center justify-between p-6 rounded-2xl border transition-colors ${isWarning ? 'bg-accent-50/50 border-accent-100' : 'bg-trust-50/50 border-trust-100'
            }`}>
            <div className="flex items-center gap-4">
                <div className={`p-2 rounded-xl ${isWarning ? 'bg-accent-600 text-white' : 'bg-trust-900 text-white'}`}>
                    {isWarning ? <AlertTriangle size={18} /> : <Activity size={18} />}
                </div>
                <div>
                    <p className={`text-sm font-bold ${isWarning ? 'text-accent-900' : 'text-trust-900'}`}>{message}</p>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Audit Log • {timestamp}</p>
                </div>
            </div>
            <div className="text-[10px] font-black text-trust-600 uppercase tracking-widest bg-white px-3 py-1.5 rounded-lg border border-gray-100 shadow-sm cursor-pointer hover:bg-trust-900 hover:text-white transition-all">
                Acknowledge
            </div>
        </div>
    );
}
