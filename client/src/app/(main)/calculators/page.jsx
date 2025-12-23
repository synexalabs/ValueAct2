'use client';

import React from 'react';
import Link from 'next/link';
import {
    Calculator,
    Shield,
    DollarSign,
    Heart,
    TrendingUp,
    BarChart3,
    FileText,
    Download,
    Database
} from 'lucide-react';
import { getCalculatorColors } from '../../../utils/designSystem';

const CalculatorHub = () => {
    const calculators = [
        {
            id: 'ifrs17',
            title: 'IFRS 17 Calculator',
            description: 'Calculate CSM, Risk Adjustment, and BEL for individual contracts',
            icon: Calculator,
            color: 'from-blue-600 to-indigo-600',
            features: ['CSM Calculation', 'Risk Adjustment', 'BEL Analysis', 'Loss Component'],
            route: '/calculators/ifrs17'
        },
        {
            id: 'solvency',
            title: 'Solvency II Calculator',
            description: 'Calculate SCR, MCR, and capital ratios for individual scenarios',
            icon: Shield,
            color: 'from-green-600 to-emerald-600',
            features: ['SCR Calculation', 'MCR Calculation', 'Solvency Ratio', 'Risk Contributions'],
            route: '/calculators/solvency'
        },
        {
            id: 'pricing',
            title: 'Pricing Calculator',
            description: 'Calculate premiums, profit margins, and product metrics',
            icon: DollarSign,
            color: 'from-purple-600 to-indigo-600',
            features: ['Premium Calculation', 'Profit Testing', 'Sensitivity Analysis', 'Break-even Analysis'],
            route: '/calculators/pricing'
        },
        {
            id: 'mortality',
            title: 'Mortality Calculator',
            description: 'Calculate mortality rates, life expectancies, and annuities',
            icon: Heart,
            color: 'from-red-600 to-pink-600',
            features: ['Mortality Rates', 'Life Expectancy', 'Present Value', 'Annuity Calculations'],
            route: '/calculators/mortality'
        }
    ];

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="text-center">
                <h1 className="text-4xl font-bold text-gray-900 mb-4">Quick Actuarial Calculators</h1>
                <p className="text-xl text-gray-600 mb-2">Ad-hoc calculations for single policies or quick analysis</p>
                <p className="text-sm text-gray-500">
                    For batch processing of multiple policies, use{' '}
                    <Link href="/data" className="text-blue-600 hover:text-blue-800 font-medium">
                        Data Management
                    </Link>
                </p>
            </div>

            {/* Batch Processing Notice */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <div className="flex items-center space-x-3">
                    <Database className="h-6 w-6 text-blue-600" />
                    <div>
                        <h3 className="text-lg font-semibold text-blue-800">Need Batch Processing?</h3>
                        <p className="text-blue-700">
                            For processing multiple policies, uploading datasets, and running valuations,
                            use our Data Management system for comprehensive batch operations.
                        </p>
                        <Link
                            href="/data"
                            className="inline-flex items-center mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            <Database className="h-4 w-4 mr-2" />
                            Go to Data Management
                        </Link>
                    </div>
                </div>
            </div>

            {/* Calculators Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {calculators.map((calculator) => {
                    const IconComponent = calculator.icon;
                    return (
                        <div
                            key={calculator.id}
                            className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-shadow duration-300"
                        >
                            {/* Header */}
                            <div className={`bg-gradient-to-r ${calculator.color} p-6 text-white min-h-[120px] flex items-center`}>
                                <div className="flex items-center space-x-4 w-full">
                                    <div className="p-3 bg-white bg-opacity-20 rounded-lg flex-shrink-0">
                                        <IconComponent className="h-8 w-8" />
                                    </div>
                                    <div className="flex-1">
                                        <h2 className="text-2xl font-bold leading-tight">{calculator.title}</h2>
                                        <p className="text-white text-opacity-90 mt-1 leading-relaxed">{calculator.description}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Features */}
                            <div className="p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Key Features</h3>
                                <ul className="space-y-2">
                                    {calculator.features.map((feature, index) => {
                                        const colors = getCalculatorColors(calculator.id);
                                        return (
                                            <li key={index} className="flex items-center text-gray-700">
                                                <div className={`w-2 h-2 ${colors.value.replace('text-', 'bg-')} rounded-full mr-3`}></div>
                                                {feature}
                                            </li>
                                        );
                                    })}
                                </ul>

                                {/* Actions */}
                                <div className="mt-6 flex space-x-3">
                                    <Link
                                        href={calculator.route}
                                        className="flex-1 bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors text-center font-medium"
                                    >
                                        Open Calculator
                                    </Link>
                                    <button className="px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                                        <Download className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Professional Features */}
            <div className="bg-gray-50 rounded-lg p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Professional Features</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center">
                        <div className="bg-blue-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                            <FileText className="h-8 w-8 text-blue-600" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Save to Workspace</h3>
                        <p className="text-gray-600">Save calculation results and assumptions for future reference</p>
                    </div>
                    <div className="text-center">
                        <div className="bg-green-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                            <Download className="h-8 w-8 text-green-600" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Export Results</h3>
                        <p className="text-gray-600">Export calculations to PDF or CSV for reporting and analysis</p>
                    </div>
                    <div className="text-center">
                        <div className="bg-purple-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                            <BarChart3 className="h-8 w-8 text-purple-600" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">History Tracking</h3>
                        <p className="text-gray-600">Track recent calculations and compare results over time</p>
                    </div>
                </div>
            </div>

            {/* Integration Notice */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <div className="flex items-center space-x-3">
                    <TrendingUp className="h-6 w-6 text-green-600" />
                    <div>
                        <h3 className="text-lg font-semibold text-green-800">Integration with Batch Processing</h3>
                        <p className="text-green-700">
                            Use these calculators to validate assumptions and test scenarios before running
                            batch valuations on your full dataset.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CalculatorHub;
