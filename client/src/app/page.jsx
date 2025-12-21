'use client';

import React, { useState, useEffect } from 'react';
import { Calculator, Database, TrendingUp, Clock, CheckCircle, XCircle, AlertTriangle, FileText, BarChart3, Users } from 'lucide-react';
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
            color: 'bg-blue-600 hover:bg-blue-700'
        },
        {
            title: 'New Calculation',
            description: 'Run quick calculations using calculators',
            icon: Calculator,
            href: '/calculators',
            color: 'bg-green-600 hover:bg-green-700'
        },
        {
            title: 'View Reports',
            description: 'Access valuation reports and analytics',
            icon: FileText,
            href: '/reports',
            color: 'bg-purple-600 hover:bg-purple-700'
        }
    ];

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-gray-600 mt-2">Actuarial platform overview and operations</p>
            </div>

            {/* System Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <div className="flex items-center">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <Database className="h-6 w-6 text-blue-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-500">Total Policies</p>
                            <p className="text-2xl font-semibold text-gray-900">
                                {systemStats.totalPolicies.toLocaleString()}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <div className="flex items-center">
                        <div className="p-2 bg-green-100 rounded-lg">
                            <CheckCircle className="h-6 w-6 text-green-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-500">Success Rate</p>
                            <p className="text-2xl font-semibold text-gray-900">
                                {systemStats.successRate}%
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <div className="flex items-center">
                        <div className="p-2 bg-purple-100 rounded-lg">
                            <Clock className="h-6 w-6 text-purple-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-500">Avg Processing Time</p>
                            <p className="text-2xl font-semibold text-gray-900">
                                {systemStats.avgProcessingTime}h
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <div className="flex items-center">
                        <div className="p-2 bg-orange-100 rounded-lg">
                            <BarChart3 className="h-6 w-6 text-orange-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-500">Data Quality Score</p>
                            <p className="text-2xl font-semibold text-gray-900">
                                {systemStats.dataQualityScore}%
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Quick Actions</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {quickActions.map((action, index) => {
                        const IconComponent = action.icon;
                        return (
                            <Link
                                key={index}
                                href={action.href}
                                className={`${action.color} text-white rounded-lg p-6 hover:shadow-lg transition-all duration-200`}
                            >
                                <div className="flex items-center space-x-4">
                                    <IconComponent className="h-8 w-8" />
                                    <div>
                                        <h3 className="text-lg font-semibold">{action.title}</h3>
                                        <p className="text-white text-opacity-90 text-sm mt-1">
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
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-semibold text-gray-900">Recent Valuation Runs</h2>
                        <Link
                            href="/valuations"
                            className="text-blue-600 hover:text-blue-800 font-medium"
                        >
                            View All
                        </Link>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Valuation
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Date
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Policies
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Duration
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {recentValuations.map((valuation) => (
                                <tr key={valuation.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">{valuation.name}</div>
                                        <div className="text-sm text-gray-500">{valuation.id}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            {getStatusIcon(valuation.status)}
                                            <span className={`ml-2 text-sm font-medium ${getStatusColor(valuation.status)}`}>
                                                {valuation.status}
                                            </span>
                                        </div>
                                        {valuation.status === 'running' && valuation.progress && (
                                            <div className="mt-2">
                                                <div className="w-full bg-gray-200 rounded-full h-2">
                                                    <div
                                                        className="bg-blue-600 h-2 rounded-full"
                                                        style={{ width: `${valuation.progress}%` }}
                                                    ></div>
                                                </div>
                                                <div className="text-xs text-gray-500 mt-1">{valuation.progress}% complete</div>
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {new Date(valuation.date).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {valuation.policyCount.toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
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
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">System Status</h3>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Data Processing</span>
                            <div className="flex items-center">
                                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                                <span className="text-sm text-green-600 font-medium">Operational</span>
                            </div>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Calculation Engine</span>
                            <div className="flex items-center">
                                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                                <span className="text-sm text-green-600 font-medium">Operational</span>
                            </div>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Database</span>
                            <div className="flex items-center">
                                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                                <span className="text-sm text-green-600 font-medium">Operational</span>
                            </div>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">API Services</span>
                            <div className="flex items-center">
                                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                                <span className="text-sm text-green-600 font-medium">Operational</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Scheduled Runs</h3>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Monthly Valuation</span>
                            <span className="text-sm text-gray-900">Dec 31, 2024</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Quarterly Review</span>
                            <span className="text-sm text-gray-900">Jan 15, 2025</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Annual Assessment</span>
                            <span className="text-sm text-gray-900">Mar 1, 2025</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
