'use client';

import React, { useState, useEffect } from 'react';
import { Calculator, TrendingUp, Clock, CheckCircle, XCircle, Download, Eye, RefreshCw, Filter, Calendar } from 'lucide-react';
import { useRouter } from 'next/navigation';

const Valuations = () => {
    const router = useRouter();
    const [valuations, setValuations] = useState([]);
    const [filteredValuations, setFilteredValuations] = useState([]);
    const [filters, setFilters] = useState({
        status: 'all',
        dateRange: 'all',
        productType: 'all'
    });
    const [isLoading, setIsLoading] = useState(false);

    // Load real data from API
    useEffect(() => {
        const loadValuations = async () => {
            setIsLoading(true);
            try {
                const response = await fetch('/api/valuations');
                if (response.ok) {
                    const valuationsData = await response.json();
                    setValuations(valuationsData);
                    setFilteredValuations(valuationsData);
                }
            } catch (error) {
                console.error('Failed to load valuations:', error);
                // Keep empty state on error
            } finally {
                setIsLoading(false);
            }
        };

        loadValuations();
    }, []);

    const handleFilterChange = (filterType, value) => {
        const newFilters = { ...filters, [filterType]: value };
        setFilters(newFilters);

        let filtered = valuations;

        if (newFilters.status !== 'all') {
            filtered = filtered.filter(v => v.status === newFilters.status);
        }

        if (newFilters.productType !== 'all') {
            filtered = filtered.filter(v => v.productType === newFilters.productType);
        }

        if (newFilters.dateRange !== 'all') {
            const now = new Date();
            const daysAgo = parseInt(newFilters.dateRange);
            const cutoffDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
            filtered = filtered.filter(v => new Date(v.date) >= cutoffDate);
        }

        setFilteredValuations(filtered);
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'completed':
                return <CheckCircle className="h-5 w-5 text-green-500" />;
            case 'running':
                return <RefreshCw className="h-5 w-5 text-blue-500 animate-spin" />;
            case 'failed':
                return <XCircle className="h-5 w-5 text-red-500" />;
            case 'queued':
                return <Clock className="h-5 w-5 text-yellow-500" />;
            default:
                return <Clock className="h-5 w-5 text-gray-500" />;
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'completed':
                return 'bg-green-100 text-green-800';
            case 'running':
                return 'bg-blue-100 text-blue-800';
            case 'failed':
                return 'bg-red-100 text-red-800';
            case 'queued':
                return 'bg-yellow-100 text-yellow-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const handleNewValuation = () => {
        // Navigate to Data Management for new valuation
        router.push('/data');
    };

    const handleViewResults = (valuation) => {
        // Navigate to results viewer
        console.log('View results for:', valuation.id);
    };

    const handleDownloadReport = (valuation) => {
        // Download report
        console.log('Download report for:', valuation.id);
    };

    const handleRerun = (valuation) => {
        // Rerun valuation
        console.log('Rerun valuation:', valuation.id);
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Valuations</h1>
                    <p className="text-gray-600 mt-2">Monitor and manage batch valuation runs</p>
                </div>
                <button
                    onClick={handleNewValuation}
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                    <Calculator className="h-4 w-4 mr-2" />
                    New Valuation
                </button>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center space-x-4">
                    <Filter className="h-5 w-5 text-gray-500" />
                    <div className="flex space-x-4">
                        <select
                            value={filters.status}
                            onChange={(e) => handleFilterChange('status', e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                        >
                            <option value="all">All Status</option>
                            <option value="completed">Completed</option>
                            <option value="running">Running</option>
                            <option value="queued">Queued</option>
                            <option value="failed">Failed</option>
                        </select>

                        <select
                            value={filters.productType}
                            onChange={(e) => handleFilterChange('productType', e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                        >
                            <option value="all">All Products</option>
                            <option value="Term Life">Term Life</option>
                            <option value="Whole Life">Whole Life</option>
                            <option value="Endowment">Endowment</option>
                            <option value="Mixed">Mixed</option>
                        </select>

                        <select
                            value={filters.dateRange}
                            onChange={(e) => handleFilterChange('dateRange', e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                        >
                            <option value="all">All Time</option>
                            <option value="7">Last 7 days</option>
                            <option value="30">Last 30 days</option>
                            <option value="90">Last 90 days</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Valuations Table */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900">Recent Valuation Runs</h2>
                </div>

                <div className="overflow-x-auto">
                    {isLoading ? (
                        <div className="text-center py-12">
                            <RefreshCw className="h-8 w-8 text-gray-400 mx-auto mb-4 animate-spin" />
                            <p className="text-gray-500">Loading valuations...</p>
                        </div>
                    ) : (
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
                                        Type
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Duration
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredValuations.map((valuation) => (
                                    <tr key={valuation.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div>
                                                <div className="text-sm font-medium text-gray-900">{valuation.name}</div>
                                                <div className="text-sm text-gray-500">{valuation.id}</div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                {getStatusIcon(valuation.status)}
                                                <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(valuation.status)}`}>
                                                    {valuation.status}
                                                </span>
                                            </div>
                                            {valuation.status === 'running' && valuation.progress && (
                                                <div className="mt-2 text-center">
                                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                                        <div
                                                            className="bg-blue-600 h-2 rounded-full"
                                                            style={{ width: `${valuation.progress}%` }}
                                                        ></div>
                                                    </div>
                                                    <div className="text-xs text-gray-500 mt-1">{valuation.progress}% complete</div>
                                                </div>
                                            )}
                                            {valuation.status === 'failed' && valuation.error && (
                                                <div className="mt-2 text-xs text-red-600 max-w-xs truncate">
                                                    {valuation.error}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {new Date(valuation.date).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {valuation.policyCount.toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">{valuation.productType}</div>
                                            <div className="text-sm text-gray-500">{valuation.calculationType}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {valuation.duration}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <div className="flex space-x-2">
                                                {valuation.status === 'completed' && (
                                                    <>
                                                        <button
                                                            onClick={() => handleViewResults(valuation)}
                                                            className="text-blue-600 hover:text-blue-900"
                                                            title="View Results"
                                                        >
                                                            <Eye className="h-4 w-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDownloadReport(valuation)}
                                                            className="text-green-600 hover:text-green-900"
                                                            title="Download Report"
                                                        >
                                                            <Download className="h-4 w-4" />
                                                        </button>
                                                    </>
                                                )}
                                                {(valuation.status === 'failed' || valuation.status === 'completed') && (
                                                    <button
                                                        onClick={() => handleRerun(valuation)}
                                                        className="text-purple-600 hover:text-purple-900"
                                                        title="Rerun Valuation"
                                                    >
                                                        <RefreshCw className="h-4 w-4" />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                {!isLoading && filteredValuations.length === 0 && (
                    <div className="text-center py-12 border-t border-gray-200">
                        <Calculator className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No valuations found</h3>
                        <p className="text-gray-500 mb-4">Try adjusting your filters or create a new valuation.</p>
                        <button
                            onClick={handleNewValuation}
                            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            <Calculator className="h-4 w-4 mr-2" />
                            New Valuation
                        </button>
                    </div>
                )}
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <div className="flex items-center">
                        <div className="p-2 bg-green-100 rounded-lg">
                            <CheckCircle className="h-6 w-6 text-green-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-500">Completed</p>
                            <p className="text-2xl font-semibold text-gray-900">
                                {valuations.filter(v => v.status === 'completed').length}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <div className="flex items-center">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <RefreshCw className="h-6 w-6 text-blue-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-500">Running</p>
                            <p className="text-2xl font-semibold text-gray-900">
                                {valuations.filter(v => v.status === 'running').length}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <div className="flex items-center">
                        <div className="p-2 bg-red-100 rounded-lg">
                            <XCircle className="h-6 w-6 text-red-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-500">Failed</p>
                            <p className="text-2xl font-semibold text-gray-900">
                                {valuations.filter(v => v.status === 'failed').length}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <div className="flex items-center">
                        <div className="p-2 bg-purple-100 rounded-lg">
                            <TrendingUp className="h-6 w-6 text-purple-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-500">Total Policies</p>
                            <p className="text-2xl font-semibold text-gray-900">
                                {valuations.reduce((sum, v) => sum + v.policyCount, 0).toLocaleString()}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Valuations;
