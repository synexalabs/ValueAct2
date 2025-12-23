'use client';

import React, { useState, useEffect } from 'react';
import { Calculator, Database, TrendingUp, Clock, CheckCircle, XCircle, AlertTriangle, FileText, BarChart3, Users, Cpu } from 'lucide-react';
import Link from 'next/link';

const Dashboard = () => {
    const [recentValuations, setRecentValuations] = useState([]);
    const [systemStats, setSystemStats] = useState({
        totalPolicies: 0,
        successRate: 0,
        avgProcessingTime: 0,
        dataQualityScore: 0
    });

    // Load real data from API
    useEffect(() => {
        const loadDashboardData = async () => {
            try {
                // Load recent valuations from API
                const valuationsResponse = await fetch('/api/valuations/recent');
                if (valuationsResponse.ok) {
                    const valuations = await valuationsResponse.json();
                    setRecentValuations(valuations);
                }

                // Load system stats from API
                const statsResponse = await fetch('/api/stats');
                if (statsResponse.ok) {
                    const stats = await statsResponse.json();
                    setSystemStats(stats);
                }
            } catch (error) {
                console.error('Failed to load dashboard data:', error);
                // Keep default empty state on error
            }
        };

        loadDashboardData();
    }, []);

    const getStatusIcon = (status) => {
        switch (status) {
            case 'completed':
                return <CheckCircle className="h-4 w-4 text-green-500" />;
            case 'running':
                return <Clock className="h-4 w-4 text-blue-500" />;
            case 'failed':
                return <XCircle className="h-4 w-4 text-red-500" />;
            default:
                return <Clock className="h-4 w-4 text-gray-500" />;
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'completed':
                return 'text-green-600';
            case 'running':
                return 'text-blue-600';
            case 'failed':
                return 'text-red-600';
            default:
                return 'text-gray-600';
        }
    };

    const quickActions = [
        {
            title: 'Upload Data',
            description: 'Upload policy data for validation and processing',
            icon: Database,
            href: '/data',
            color: 'bg-trust-900 hover:bg-trust-950'
        },
        {
            title: 'New Calculation',
            description: 'Run quick calculations using calculators',
            icon: Calculator,
            href: '/calculators',
            color: 'bg-growth-600 hover:bg-growth-700'
        },
        {
            title: 'View Reports',
            description: 'Access valuation reports and analytics',
            icon: FileText,
            href: '/valuations',
            color: 'bg-accent-600 hover:bg-accent-700'
        }
    ];

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-heading font-bold text-trust-900">Actuarial Dashboard</h1>
                <p className="text-gray-500 mt-2">Actuarial platform overview and operations</p>
            </div>

            {/* System Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center">
                        <div className="p-3 bg-trust-50 rounded-xl">
                            <Database className="h-6 w-6 text-trust-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Total Policies</p>
                            <p className="text-2xl font-bold text-trust-900">
                                {systemStats.totalPolicies.toLocaleString()}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center">
                        <div className="p-3 bg-growth-50 rounded-xl">
                            <CheckCircle className="h-6 w-6 text-growth-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Success Rate</p>
                            <p className="text-2xl font-bold text-trust-900">
                                {systemStats.successRate}%
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center">
                        <div className="p-3 bg-accent-50 rounded-xl">
                            <Clock className="h-6 w-6 text-accent-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Avg Time</p>
                            <p className="text-2xl font-bold text-trust-900">
                                {systemStats.avgProcessingTime}h
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center">
                        <div className="p-3 bg-trust-50 rounded-xl">
                            <TrendingUp className="h-6 w-6 text-trust-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Quality Score</p>
                            <p className="text-2xl font-bold text-trust-900">
                                {systemStats.dataQualityScore}%
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-[2rem] border border-gray-100 p-8 shadow-sm">
                <h2 className="text-xl font-heading font-bold text-trust-900 mb-6">Quick Actions</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {quickActions.map((action, index) => {
                        const IconComponent = action.icon;
                        return (
                            <Link
                                key={index}
                                href={action.href}
                                className={`${action.color} text-white rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1`}
                            >
                                <div className="flex items-center space-x-4">
                                    <div className="p-3 bg-white/10 rounded-xl backdrop-blur-md">
                                        <IconComponent className="h-7 w-7" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold">{action.title}</h3>
                                        <p className="text-white/80 text-xs mt-1 leading-relaxed">
                                            {action.description}
                                        </p>
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </div>

            {/* Recent Valuations */}
            <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-8 py-6 border-b border-gray-100">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-heading font-bold text-trust-900">Recent Valuation Runs</h2>
                        <Link
                            href="/valuations"
                            className="text-trust-600 hover:text-trust-800 font-bold text-sm flex items-center gap-1"
                        >
                            View All <TrendingUp className="h-4 w-4" />
                        </Link>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-100">
                        <thead className="bg-gray-50/50">
                            <tr>
                                <th className="px-8 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                    Valuation
                                </th>
                                <th className="px-8 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                    Status
                                </th>
                                <th className="px-8 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                    Date
                                </th>
                                <th className="px-8 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                    Policies
                                </th>
                                <th className="px-8 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                    Duration
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-50">
                            {recentValuations.map((valuation) => (
                                <tr key={valuation.id} className="hover:bg-trust-50/30 transition-colors">
                                    <td className="px-8 py-5 whitespace-nowrap">
                                        <div className="text-sm font-bold text-trust-900">{valuation.name}</div>
                                        <div className="text-[10px] font-mono text-gray-400">{valuation.id}</div>
                                    </td>
                                    <td className="px-8 py-5 whitespace-nowrap">
                                        <div className="flex items-center">
                                            {getStatusIcon(valuation.status)}
                                            <span className={`ml-2 text-xs font-bold uppercase tracking-wider ${getStatusColor(valuation.status)}`}>
                                                {valuation.status}
                                            </span>
                                        </div>
                                        {valuation.status === 'running' && valuation.progress && (
                                            <div className="mt-2 w-32">
                                                <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                                                    <div
                                                        className="bg-trust-600 h-full rounded-full transition-all duration-500"
                                                        style={{ width: `${valuation.progress}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-8 py-5 whitespace-nowrap text-sm font-medium text-gray-600">
                                        {new Date(valuation.date).toLocaleDateString()}
                                    </td>
                                    <td className="px-8 py-5 whitespace-nowrap text-sm font-bold text-trust-700">
                                        {valuation.policyCount.toLocaleString()}
                                    </td>
                                    <td className="px-8 py-5 whitespace-nowrap text-sm text-gray-500">
                                        {valuation.duration}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* System Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white rounded-[2rem] border border-gray-100 p-8 shadow-sm">
                    <h3 className="text-xl font-heading font-bold text-trust-900 mb-6 flex items-center gap-2">
                        <Cpu className="h-5 w-5 text-trust-600" />
                        System Health
                    </h3>
                    <div className="space-y-4">
                        {[
                            { name: 'Data Processing', status: 'Operational', color: 'bg-growth-500' },
                            { name: 'Calculation Engine', status: 'Operational', color: 'bg-growth-500' },
                            { name: 'Database Clusters', status: 'Operational', color: 'bg-growth-500' },
                            { name: 'API Gateway', status: 'Operational', color: 'bg-growth-500' },
                        ].map((item, i) => (
                            <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-gray-50/50">
                                <span className="text-sm font-medium text-gray-600">{item.name}</span>
                                <div className="flex items-center gap-2">
                                    <div className={`w-2 h-2 ${item.color} rounded-full animate-pulse`}></div>
                                    <span className="text-xs font-bold text-growth-700 uppercase">{item.status}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-white rounded-[2rem] border border-gray-100 p-8 shadow-sm">
                    <h3 className="text-xl font-heading font-bold text-trust-900 mb-6 flex items-center gap-2">
                        <Clock className="h-5 w-5 text-trust-600" />
                        Scheduled Events
                    </h3>
                    <div className="space-y-4">
                        {[
                            { name: 'Monthly Valuation', date: 'Dec 31, 2024' },
                            { name: 'Quarterly Review', date: 'Jan 15, 2025' },
                            { name: 'Annual Assessment', date: 'Mar 1, 2025' },
                        ].map((item, i) => (
                            <div key={i} className="flex items-center justify-between p-4 border border-gray-100 rounded-2xl hover:bg-trust-50/50 transition-colors">
                                <span className="text-sm font-bold text-trust-900">{item.name}</span>
                                <span className="text-xs font-medium text-gray-500 bg-white px-3 py-1 rounded-full border border-gray-100 shadow-sm">{item.date}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
