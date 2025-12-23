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
        // TODO: Navigate to results viewer
        // router.push(`/valuations/${valuation.id}/results`);
    };

    const handleDownloadReport = (valuation) => {
        // TODO: Implement report download
        // window.open(`/api/valuations/${valuation.id}/report`, '_blank');
    };

    const handleRerun = (valuation) => {
        // TODO: Implement valuation rerun
        // router.push(`/data?rerun=${valuation.id}`);
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-heading font-bold text-trust-900">Batch Valuations</h1>
                    <p className="text-gray-400 mt-2 italic">Monitor and manage actuarial batch valuation runs</p>
                </div>
                <button
                    onClick={handleNewValuation}
                    className="inline-flex items-center px-6 py-3 bg-gradient-to-br from-trust-900 to-trust-950 text-white text-sm font-bold rounded-2xl shadow-lg hover:shadow-trust-900/20 transition-all active:scale-95"
                >
                    <Calculator className="h-4 w-4 mr-2" />
                    New Valuation
                </button>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-[2rem] border border-gray-100 p-6 shadow-sm">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-xl border border-gray-100">
                            <Filter className="h-4 w-4 text-gray-400" />
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Filters</span>
                        </div>
                        <div className="flex gap-4">
                            <select
                                value={filters.status}
                                onChange={(e) => handleFilterChange('status', e.target.value)}
                                className="px-5 py-2.5 bg-white border border-gray-100 rounded-xl text-sm font-medium focus:ring-2 focus:ring-trust-500 transition-all outline-none text-gray-700 shadow-sm"
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
                                className="px-5 py-2.5 bg-white border border-gray-100 rounded-xl text-sm font-medium focus:ring-2 focus:ring-trust-500 transition-all outline-none text-gray-700 shadow-sm"
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
                                className="px-5 py-2.5 bg-white border border-gray-100 rounded-xl text-sm font-medium focus:ring-2 focus:ring-trust-500 transition-all outline-none text-gray-700 shadow-sm"
                            >
                                <option value="all">All Time</option>
                                <option value="7">Last 7 days</option>
                                <option value="30">Last 30 days</option>
                                <option value="90">Last 90 days</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            {/* Valuations Table */}
            <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden min-h-[400px]">
                <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between">
                    <h2 className="text-xl font-heading font-bold text-trust-900">Valuation Run Ledger</h2>
                    <div className="flex items-center gap-2 text-xs font-bold text-gray-400">
                        <RefreshCw className="h-3 w-3" />
                        AUTO-REFRESH ACTIVE
                    </div>
                </div>

                <div className="overflow-x-auto">
                    {isLoading ? (
                        <div className="text-center py-20">
                            <RefreshCw className="h-10 w-10 text-trust-200 mx-auto mb-4 animate-spin" />
                            <p className="text-gray-400 font-medium">Synchronizing records...</p>
                        </div>
                    ) : (
                        <table className="min-w-full divide-y divide-gray-50">
                            <thead className="bg-gray-50/50">
                                <tr>
                                    <th className="px-8 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Valuation</th>
                                    <th className="px-8 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Status</th>
                                    <th className="px-8 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Metadata</th>
                                    <th className="px-8 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Policies</th>
                                    <th className="px-8 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Duration</th>
                                    <th className="px-8 py-4 text-right text-[10px] font-bold text-gray-400 uppercase tracking-widest">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-50">
                                {filteredValuations.map((valuation) => (
                                    <tr key={valuation.id} className="hover:bg-trust-50/30 transition-colors group">
                                        <td className="px-8 py-5">
                                            <div className="text-sm font-bold text-trust-900">{valuation.name}</div>
                                            <div className="text-[10px] font-mono text-gray-400">{valuation.id}</div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="flex items-center">
                                                {getStatusIcon(valuation.status)}
                                                <span className={`ml-2 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest rounded-lg ${getStatusColor(valuation.status).replace('text-', 'text-').replace('bg-', 'bg-opacity-20 bg-')}`}>
                                                    {valuation.status}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="text-xs font-bold text-gray-700">{valuation.productType}</div>
                                            <div className="text-[10px] text-gray-400">{valuation.calculationType}</div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="text-sm font-bold text-trust-700">{valuation.policyCount.toLocaleString()}</div>
                                            <div className="text-[10px] text-gray-400 italic">Valid Entities</div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-1.5 text-xs font-medium text-gray-500">
                                                <Clock className="h-3 w-3" />
                                                {valuation.duration}
                                            </div>
                                        </td>
                                        <td className="px-8 py-5 text-right">
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                {valuation.status === 'completed' && (
                                                    <>
                                                        <button
                                                            onClick={() => handleViewResults(valuation)}
                                                            className="p-2 text-trust-600 hover:bg-trust-50 rounded-lg transition-colors border border-transparent hover:border-trust-100"
                                                            title="Analyze Results"
                                                        >
                                                            <Eye className="h-4 w-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDownloadReport(valuation)}
                                                            className="p-2 text-growth-600 hover:bg-growth-50 rounded-lg transition-colors border border-transparent hover:border-growth-100"
                                                            title="Export Ledger"
                                                        >
                                                            <Download className="h-4 w-4" />
                                                        </button>
                                                    </>
                                                )}
                                                <button
                                                    onClick={() => handleRerun(valuation)}
                                                    className="p-2 text-gray-400 hover:bg-gray-50 hover:text-trust-900 rounded-lg transition-colors"
                                                    title="Rerun Pipeline"
                                                >
                                                    <RefreshCw className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                {!isLoading && filteredValuations.length === 0 && (
                    <div className="text-center py-20">
                        <div className="p-6 bg-gray-50 rounded-full inline-block mb-4">
                            <Calculator className="h-12 w-12 text-gray-300" />
                        </div>
                        <h3 className="text-xl font-heading font-bold text-trust-900 mb-2">No valuation records found</h3>
                        <p className="text-gray-400 max-w-sm mx-auto mb-8 text-sm leading-relaxed">Adjust your filters or initiate a new cloud-based actuarial processing run to populate the ledger.</p>
                        <button
                            onClick={handleNewValuation}
                            className="inline-flex items-center px-8 py-3 bg-trust-900 text-white font-bold rounded-2xl shadow-lg hover:shadow-trust-900/20 active:scale-95 transition-all"
                        >
                            <Calculator className="h-4 w-4 mr-2" />
                            Initialize New Run
                        </button>
                    </div>
                )}
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                    { label: 'Completed', value: valuations.filter(v => v.status === 'completed').length, icon: CheckCircle, color: 'text-growth-600', bg: 'bg-growth-50' },
                    { label: 'Running', value: valuations.filter(v => v.status === 'running').length, icon: RefreshCw, color: 'text-trust-600', bg: 'bg-trust-50' },
                    { label: 'Failed', value: valuations.filter(v => v.status === 'failed').length, icon: XCircle, color: 'text-accent-600', bg: 'bg-accent-50' },
                    { label: 'Processed', value: valuations.reduce((sum, v) => sum + v.policyCount, 0).toLocaleString(), icon: TrendingUp, color: 'text-trust-900', bg: 'bg-gray-50' }
                ].map((stat, i) => (
                    <div key={i} className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
                        <div className="flex items-center">
                            <div className={`p-3 ${stat.bg} rounded-xl`}>
                                <stat.icon className={`h-6 w-6 ${stat.color} ${stat.label === 'Running' ? 'animate-spin' : ''}`} />
                            </div>
                            <div className="ml-4">
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{stat.label}</p>
                                <p className="text-2xl font-bold text-trust-900">{stat.value}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Valuations;
