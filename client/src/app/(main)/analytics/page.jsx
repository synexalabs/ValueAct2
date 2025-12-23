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
        // Simulate API fetch or actually fetch from backend
        // const fetchData = async () => {
        //   const result = await data.getAnalytics();
        //   setDashboardData(result);
        // };
        // fetchData();
        const timer = setTimeout(() => setLoading(false), 1000);
        return () => clearTimeout(timer);
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Portfolio Analytics</h1>
                <p className="text-gray-600">Real-time insights and actuarial projections</p>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <KPICard
                    title="Total CSM"
                    value={formatCurrency(dashboardData.kpis.totalCSM)}
                    change="+2.5%"
                    icon={TrendingUp}
                    color="blue"
                />
                <KPICard
                    title="Solvency Ratio"
                    value={formatPercentage(dashboardData.kpis.solvencyRatio)}
                    change="-0.5%"
                    icon={Shield}
                    color="green"
                />
                <KPICard
                    title="Fulfillment Cash Flows"
                    value={formatCurrency(dashboardData.kpis.totalFCF)}
                    change="+1.2%"
                    icon={DollarSign}
                    color="purple"
                />
                <KPICard
                    title="Active Policies"
                    value={dashboardData.kpis.portfolioSize.toLocaleString()}
                    change="+12"
                    icon={Activity}
                    color="orange"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* CSM Projection Chart */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">CSM & Liability Projection</h3>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={dashboardData.projections}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="year" />
                                <YAxis />
                                <Tooltip formatter={(value) => formatCurrency(value)} />
                                <Legend />
                                <Bar dataKey="bel" stackId="a" fill="#94a3b8" name="Best Estimate Liability" />
                                <Bar dataKey="ra" stackId="a" fill="#f59e0b" name="Risk Adjustment" />
                                <Bar dataKey="csm" stackId="a" fill="#3b82f6" name="Contractual Service Margin" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Risk Composition Chart */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Risk Capital Composition (SCR)</h3>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={dashboardData.riskComposition}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                    outerRadius={100}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {dashboardData.riskComposition.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(value) => formatCurrency(value)} />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Recent Alerts / Warnings */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Alerts</h3>
                <div className="space-y-4">
                    <AlertItem
                        type="warning"
                        message="Solvency ratio dropped below internal target (190%)"
                        timestamp="2 hours ago"
                    />
                    <AlertItem
                        type="info"
                        message="New policy batch (Batch #2024-12) imported successfully"
                        timestamp="5 hours ago"
                    />
                </div>
            </div>
        </div>
    );
}

function KPICard({ title, value, change, icon: Icon, color }) {
    const colorClasses = {
        blue: 'bg-blue-50 text-blue-600',
        green: 'bg-green-50 text-green-600',
        purple: 'bg-purple-50 text-purple-600',
        orange: 'bg-orange-50 text-orange-600',
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
                    <Icon size={24} />
                </div>
                <span className={`text-sm font-medium ${change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                    {change}
                </span>
            </div>
            <div>
                <p className="text-sm text-gray-500 font-medium">{title}</p>
                <h3 className="text-2xl font-bold text-gray-900 mt-1">{value}</h3>
            </div>
        </div>
    );
}

function AlertItem({ type, message, timestamp }) {
    const isWarning = type === 'warning';
    return (
        <div className={`flex items-start p-4 rounded-lg border ${isWarning ? 'bg-yellow-50 border-yellow-200' : 'bg-blue-50 border-blue-200'
            }`}>
            <div className="mr-3 mt-1">
                {isWarning ? <AlertTriangle size={18} className="text-yellow-600" /> : <Activity size={18} className="text-blue-600" />}
            </div>
            <div>
                <p className={`text-sm font-medium ${isWarning ? 'text-yellow-800' : 'text-blue-800'}`}>{message}</p>
                <p className={`text-xs mt-1 ${isWarning ? 'text-yellow-600' : 'text-blue-600'}`}>{timestamp}</p>
            </div>
        </div>
    );
}
