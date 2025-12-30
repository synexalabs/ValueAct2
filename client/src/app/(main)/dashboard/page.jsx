'use client';

import React, { useState, useEffect } from 'react';
import { Calculator, Database, TrendingUp, Clock, CheckCircle, XCircle, FileText, Cpu } from 'lucide-react';
import Link from 'next/link';

const Dashboard = () => {
    const [recentValuations, setRecentValuations] = useState([]);
    const [systemStats, setSystemStats] = useState({
        totalPolicies: 0,
        successRate: 0,
        avgProcessingTime: 0,
        dataQualityScore: 0
    });

    useEffect(() => {
        const loadDashboardData = async () => {
            try {
                const valuationsResponse = await fetch('/api/valuations/recent');
                if (valuationsResponse.ok) {
                    const valuations = await valuationsResponse.json();
                    setRecentValuations(valuations);
                }

                const statsResponse = await fetch('/api/stats');
                if (statsResponse.ok) {
                    const stats = await statsResponse.json();
                    setSystemStats(stats);
                }
            } catch (error) {
                console.error('Failed to load dashboard data:', error);
            }
        };

        loadDashboardData();
    }, []);

    const getStatusIcon = (status) => {
        switch (status) {
            case 'completed':
                return <CheckCircle className="h-4 w-4 text-trust-600" />;
            case 'running':
                return <Clock className="h-4 w-4 text-trust-500" />;
            case 'failed':
                return <XCircle className="h-4 w-4 text-red-500" />;
            default:
                return <Clock className="h-4 w-4 text-gray-400" />;
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'completed':
                return 'text-trust-700';
            case 'running':
                return 'text-trust-500';
            case 'failed':
                return 'text-red-600';
            default:
                return 'text-gray-500';
        }
    };

    const quickActions = [
        {
            title: 'Upload Data',
            description: 'Upload policy data for validation and processing',
            icon: Database,
            href: '/data',
        },
        {
            title: 'New Calculation',
            description: 'Run quick calculations using calculators',
            icon: Calculator,
            href: '/calculators',
        },
        {
            title: 'View Reports',
            description: 'Access valuation reports and analytics',
            icon: FileText,
            href: '/valuations',
        }
    ];

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-semibold text-trust-950">Actuarial Dashboard</h1>
                <p className="text-gray-500 mt-1">Platform overview and operations</p>
            </div>

            {/* System Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl border border-gray-100 p-5">
                    <div className="flex items-center gap-4">
                        <div className="p-2.5 bg-trust-50 rounded-lg">
                            <Database className="h-5 w-5 text-trust-600" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 uppercase tracking-wide">Total Policies</p>
                            <p className="text-xl font-semibold text-trust-950">
                                {systemStats.totalPolicies.toLocaleString()}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl border border-gray-100 p-5">
                    <div className="flex items-center gap-4">
                        <div className="p-2.5 bg-trust-50 rounded-lg">
                            <CheckCircle className="h-5 w-5 text-trust-600" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 uppercase tracking-wide">Success Rate</p>
                            <p className="text-xl font-semibold text-trust-950">
                                {systemStats.successRate}%
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl border border-gray-100 p-5">
                    <div className="flex items-center gap-4">
                        <div className="p-2.5 bg-trust-50 rounded-lg">
                            <Clock className="h-5 w-5 text-trust-600" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 uppercase tracking-wide">Avg Time</p>
                            <p className="text-xl font-semibold text-trust-950">
                                {systemStats.avgProcessingTime}h
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl border border-gray-100 p-5">
                    <div className="flex items-center gap-4">
                        <div className="p-2.5 bg-trust-50 rounded-lg">
                            <TrendingUp className="h-5 w-5 text-trust-600" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 uppercase tracking-wide">Quality Score</p>
                            <p className="text-xl font-semibold text-trust-950">
                                {systemStats.dataQualityScore}%
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl border border-gray-100 p-6">
                <h2 className="text-lg font-semibold text-trust-950 mb-4">Quick Actions</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {quickActions.map((action, index) => {
                        const IconComponent = action.icon;
                        return (
                            <Link
                                key={index}
                                href={action.href}
                                className="flex items-center gap-4 p-4 bg-trust-950 text-white rounded-xl hover:bg-trust-900 transition-colors"
                            >
                                <div className="p-2 bg-white/10 rounded-lg">
                                    <IconComponent className="h-5 w-5" />
                                </div>
                                <div>
                                    <h3 className="font-medium">{action.title}</h3>
                                    <p className="text-white/70 text-xs mt-0.5">
                                        {action.description}
                                    </p>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </div>

            {/* Recent Valuations */}
            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-trust-950">Recent Valuation Runs</h2>
                    <Link
                        href="/valuations"
                        className="text-trust-600 hover:text-trust-800 text-sm font-medium"
                    >
                        View All →
                    </Link>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-100">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wide">
                                    Valuation
                                </th>
                                <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wide">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wide">
                                    Date
                                </th>
                                <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wide">
                                    Policies
                                </th>
                                <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wide">
                                    Duration
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-50">
                            {recentValuations.map((valuation) => (
                                <tr key={valuation.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-trust-950">{valuation.name}</div>
                                        <div className="text-xs text-gray-400 font-mono">{valuation.id}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-2">
                                            {getStatusIcon(valuation.status)}
                                            <span className={`text-xs font-medium ${getStatusColor(valuation.status)}`}>
                                                {valuation.status}
                                            </span>
                                        </div>
                                        {valuation.status === 'running' && valuation.progress && (
                                            <div className="mt-2 w-24">
                                                <div className="w-full bg-gray-100 rounded-full h-1">
                                                    <div
                                                        className="bg-trust-600 h-full rounded-full transition-all"
                                                        style={{ width: `${valuation.progress}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                        {new Date(valuation.date).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-trust-700">
                                        {valuation.policyCount.toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {valuation.duration}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* System Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl border border-gray-100 p-6">
                    <h3 className="text-lg font-semibold text-trust-950 mb-4 flex items-center gap-2">
                        <Cpu className="h-4 w-4 text-trust-600" />
                        System Health
                    </h3>
                    <div className="space-y-3">
                        {[
                            { name: 'Data Processing', status: 'Operational' },
                            { name: 'Calculation Engine', status: 'Operational' },
                            { name: 'Database Clusters', status: 'Operational' },
                            { name: 'API Gateway', status: 'Operational' },
                        ].map((item, i) => (
                            <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                                <span className="text-sm text-gray-600">{item.name}</span>
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-trust-500 rounded-full"></div>
                                    <span className="text-xs font-medium text-trust-700">{item.status}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-white rounded-xl border border-gray-100 p-6">
                    <h3 className="text-lg font-semibold text-trust-950 mb-4 flex items-center gap-2">
                        <Clock className="h-4 w-4 text-trust-600" />
                        Scheduled Events
                    </h3>
                    <div className="space-y-3">
                        {[
                            { name: 'Monthly Valuation', date: 'Dec 31, 2024' },
                            { name: 'Quarterly Review', date: 'Jan 15, 2025' },
                            { name: 'Annual Assessment', date: 'Mar 1, 2025' },
                        ].map((item, i) => (
                            <div key={i} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
                                <span className="text-sm font-medium text-trust-900">{item.name}</span>
                                <span className="text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded">{item.date}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
