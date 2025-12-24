'use client';

import React, { useState } from 'react';
import {
    BookOpen,
    Calculator,
    Shield,
    TrendingUp,
    Activity,
    FileText,
    HelpCircle,
    ChevronRight,
    Search,
    Database,
    Zap,
    Table,
    AlertCircle,
    CheckCircle
} from 'lucide-react';

const GuideSection = ({ title, isActive, onClick, children }) => (
    <div className={`border-b border-gray-100 last:border-0`}>
        <button
            onClick={onClick}
            className={`w-full flex items-center justify-between p-6 text-left transition-all duration-300 ${isActive ? 'bg-trust-50/50' : 'hover:bg-gray-50'}`}
        >
            <span className={`font-heading font-bold text-lg ${isActive ? 'text-trust-900' : 'text-gray-600'}`}>
                {title}
            </span>
            <ChevronRight className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${isActive ? 'rotate-90' : ''}`} />
        </button>
        {isActive && (
            <div className="p-6 pt-0 animate-in slide-in-from-top-2 duration-300">
                <div className="prose prose-slate max-w-none text-gray-500 leading-relaxed">
                    {children}
                </div>
            </div>
        )}
    </div>
);

export default function UserGuidePage() {
    const [activeSection, setActiveSection] = useState('getting-started');

    return (
        <div className="space-y-12 pb-20">
            {/* Hero Section */}
            <div className="relative overflow-hidden bg-gradient-to-br from-trust-900 to-trust-950 rounded-[3rem] p-12 lg:p-16 text-white shadow-2xl">
                <div className="absolute top-0 right-0 p-20 opacity-10">
                    <BookOpen className="h-64 w-64" />
                </div>
                <div className="relative z-10 max-w-2xl">
                    <div className="px-4 py-1.5 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] mb-6 inline-block">
                        Product Manual v2.2
                    </div>
                    <h1 className="text-4xl lg:text-5xl font-heading font-bold mb-6">Valuact Platform Guide</h1>
                    <p className="text-lg text-white/70 leading-relaxed mb-8">
                        The definitive reference manual for the Valuact actuarial pricing and reporting engine.
                        Learn how to leverage our IFRS 17, Solvency II, and Pricing modules.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
                {/* Navigation Sidebar */}
                <div className="lg:col-span-1 space-y-4">
                    <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm sticky top-8">
                        <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4 px-2">Table of Contents</h3>
                        <nav className="space-y-1">
                            {[
                                { id: 'getting-started', label: 'Getting Started', icon: Zap },
                                { id: 'specs', label: 'Data Specs & Limits', icon: Table },
                                { id: 'ifrs17', label: 'IFRS 17 Engine', icon: Calculator },
                                { id: 'solvency', label: 'Solvency II', icon: Shield },
                                { id: 'pricing', label: 'Pricing Products', icon: TrendingUp },
                                { id: 'mortality', label: 'Mortality Tables', icon: Activity },
                                { id: 'api-reference', label: 'API & Data', icon: Database },
                            ].map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => setActiveSection(item.id)}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all duration-200 ${activeSection === item.id
                                        ? 'bg-trust-950 text-white shadow-md'
                                        : 'text-gray-500 hover:bg-gray-50 hover:text-trust-900'
                                        }`}
                                >
                                    <item.icon className={`w-4 h-4 ${activeSection === item.id ? 'text-growth-400' : 'text-gray-400'}`} />
                                    {item.label}
                                </button>
                            ))}
                        </nav>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="lg:col-span-3 bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden min-h-[600px]">

                    {/* Getting Started */}
                    {activeSection === 'getting-started' && (
                        <div className="p-8 lg:p-12">
                            <h2 className="text-3xl font-heading font-bold text-trust-900 mb-6 flex items-center gap-3">
                                <Zap className="w-8 h-8 text-growth-500" />
                                Getting Started
                            </h2>
                            <div className="prose prose-slate max-w-none text-gray-500">
                                <p className="text-lg">
                                    Welcome to Valuact. This platform provides real-time actuarial modeling capabilities.
                                    Follow these steps to generate your first valuation report.
                                </p>

                                <h3 className="text-trust-800 mt-8">1. Dashboard Overview</h3>
                                <p>
                                    Your dashboard is the command center. From here you can access quick metrics on recent calculations,
                                    system health status, and shortcuts to the primary calculators. The "Quick Actions" panel allows for rapid navigation.
                                </p>

                                <h3 className="text-trust-800 mt-8">2. Navigation Structure</h3>
                                <ul className="list-disc pl-5 space-y-2">
                                    <li><strong>Calculators:</strong> The core engines (IFRS 17, Solvency, Pricing, Mortality)</li>
                                    <li><strong>Valuations:</strong> View and manage stored solution outputs</li>
                                    <li><strong>Analytics:</strong> High-level visual reporting of your modeling history</li>
                                    <li><strong>Settings:</strong> Configure user preferences and API keys</li>
                                </ul>

                                <div className="bg-trust-50 p-6 rounded-2xl border border-trust-100 mt-8 not-prose">
                                    <h4 className="text-sm font-black text-trust-900 uppercase tracking-widest mb-2">Pro Tip</h4>
                                    <p className="text-sm text-trust-700">
                                        Use the "AI Assistant" (chat icon) at any time to ask methodological questions or get help interpreting results.
                                        The AI is trained on typical actuarial standards.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Data Specs & Limits */}
                    {activeSection === 'specs' && (
                        <div className="p-8 lg:p-12">
                            <h2 className="text-3xl font-heading font-bold text-trust-900 mb-6 flex items-center gap-3">
                                <Table className="w-8 h-8 text-blue-500" />
                                Data Specifications
                            </h2>
                            <div className="prose prose-slate max-w-none text-gray-500">
                                <p className="text-lg">
                                    To ensure accurate calculations and system stability, please adhere to the following data formatting guidelines and limits.
                                </p>

                                <h3 className="text-trust-800 mt-8">Supported Formats</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 not-prose my-4">
                                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100">
                                        <div className="h-8 w-8 bg-green-100 rounded-lg flex items-center justify-center font-bold text-green-700 text-xs">CSV</div>
                                        <span className="font-bold text-gray-700">Comma Separated</span>
                                    </div>
                                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100">
                                        <div className="h-8 w-8 bg-green-100 rounded-lg flex items-center justify-center font-bold text-green-700 text-xs">XLSX</div>
                                        <span className="font-bold text-gray-700">Excel Workbook</span>
                                    </div>
                                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100">
                                        <div className="h-8 w-8 bg-green-100 rounded-lg flex items-center justify-center font-bold text-green-700 text-xs">JSON</div>
                                        <span className="font-bold text-gray-700">JavaScript Object</span>
                                    </div>
                                </div>

                                <h3 className="text-trust-800 mt-8">System Limits</h3>
                                <div className="space-y-4 not-prose">
                                    <div className="flex justify-between items-center p-4 bg-gray-50 rounded-xl border border-gray-100">
                                        <div className="flex items-center gap-3">
                                            <AlertCircle className="text-orange-500 w-5 h-5" />
                                            <span className="font-bold text-gray-700">Max File Size</span>
                                        </div>
                                        <span className="font-mono text-sm bg-white px-3 py-1 rounded border border-gray-200">10 MB</span>
                                    </div>
                                    <div className="flex justify-between items-center p-4 bg-gray-50 rounded-xl border border-gray-100">
                                        <div className="flex items-center gap-3">
                                            <Zap className="text-trust-500 w-5 h-5" />
                                            <span className="font-bold text-gray-700">Max Concurrent Scenarios</span>
                                        </div>
                                        <span className="font-mono text-sm bg-white px-3 py-1 rounded border border-gray-200">5 Parallel</span>
                                    </div>
                                    <div className="flex justify-between items-center p-4 bg-gray-50 rounded-xl border border-gray-100">
                                        <div className="flex items-center gap-3">
                                            <Shield className="text-growth-500 w-5 h-5" />
                                            <span className="font-bold text-gray-700">Validation Batch Size</span>
                                        </div>
                                        <span className="font-mono text-sm bg-white px-3 py-1 rounded border border-gray-200">&lt; 50 Policies</span>
                                    </div>
                                </div>

                                <h3 className="text-trust-800 mt-8">Policy Data Schema</h3>
                                <p className="text-sm mb-4">The following columns are required in your <strong>Policies</strong> upload file:</p>
                                <div className="overflow-x-auto not-prose">
                                    <table className="min-w-full text-sm text-left">
                                        <thead className="bg-gray-50 text-gray-500 font-bold uppercase text-xs">
                                            <tr>
                                                <th className="px-4 py-3 rounded-tl-xl">Column Name</th>
                                                <th className="px-4 py-3">Type</th>
                                                <th className="px-4 py-3">Description</th>
                                                <th className="px-4 py-3 rounded-tr-xl">Required</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100 border border-gray-100 rounded-b-xl">
                                            <tr>
                                                <td className="px-4 py-3 font-mono text-trust-700">policy_id</td>
                                                <td className="px-4 py-3">String</td>
                                                <td className="px-4 py-3">Unique identifier for the contract</td>
                                                <td className="px-4 py-3 text-red-500 font-bold">Yes</td>
                                            </tr>
                                            <tr>
                                                <td className="px-4 py-3 font-mono text-trust-700">issue_date</td>
                                                <td className="px-4 py-3">Date (ISO)</td>
                                                <td className="px-4 py-3">Format: YYYY-MM-DD</td>
                                                <td className="px-4 py-3 text-red-500 font-bold">Yes</td>
                                            </tr>
                                            <tr>
                                                <td className="px-4 py-3 font-mono text-trust-700">face_amount</td>
                                                <td className="px-4 py-3">Number</td>
                                                <td className="px-4 py-3">Death benefit amount (min 0)</td>
                                                <td className="px-4 py-3 text-red-500 font-bold">Yes</td>
                                            </tr>
                                            <tr>
                                                <td className="px-4 py-3 font-mono text-trust-700">premium</td>
                                                <td className="px-4 py-3">Number</td>
                                                <td className="px-4 py-3">Annual premium amount (min 0)</td>
                                                <td className="px-4 py-3 text-red-500 font-bold">Yes</td>
                                            </tr>
                                            <tr>
                                                <td className="px-4 py-3 font-mono text-trust-700">issue_age</td>
                                                <td className="px-4 py-3">Integer</td>
                                                <td className="px-4 py-3">Age at issue (0-120), Default: 45</td>
                                                <td className="px-4 py-3 text-gray-400">No</td>
                                            </tr>
                                            <tr>
                                                <td className="px-4 py-3 font-mono text-trust-700">gender</td>
                                                <td className="px-4 py-3">String</td>
                                                <td className="px-4 py-3">'M' or 'F', Default: 'M'</td>
                                                <td className="px-4 py-3 text-gray-400">No</td>
                                            </tr>
                                            <tr>
                                                <td className="px-4 py-3 font-mono text-trust-700">policy_type</td>
                                                <td className="px-4 py-3">String</td>
                                                <td className="px-4 py-3">Product code. Default: 'TERM'</td>
                                                <td className="px-4 py-3 text-gray-400">No</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>

                                <h3 className="text-trust-800 mt-8">Supported Products</h3>
                                <p>
                                    Currently, the Valuact engine is optimized for <strong>Term Life Insurance</strong> products with level premiums and level death benefits.
                                    Additional product types (Whole Life, Endowment, Annuities) are in development beta.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* IFRS 17 Engine */}
                    {activeSection === 'ifrs17' && (
                        <div className="p-8 lg:p-12">
                            <h2 className="text-3xl font-heading font-bold text-trust-900 mb-6 flex items-center gap-3">
                                <Calculator className="w-8 h-8 text-trust-600" />
                                IFRS 17 Engine
                            </h2>
                            <div className="prose prose-slate max-w-none text-gray-500">
                                <p>
                                    The IFRS 17 Calculator allows for the estimation of Contractual Service Margin (CSM),
                                    Risk Adjustment (RA), and Loss Components for insurance contracts.
                                </p>

                                <h3 className="text-trust-800 font-bold mt-8">Key Features</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 not-prose my-6">
                                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                                        <div className="font-bold text-trust-900 mb-1">CSM Calculation</div>
                                        <div className="text-sm">Computes unearned profit based on Premium, FCF, and RA inputs.</div>
                                    </div>
                                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                                        <div className="font-bold text-trust-900 mb-1">Risk Adjustment</div>
                                        <div className="text-sm">Uses VaR (Value at Risk) confidence intervals (90%, 95%, 99%).</div>
                                    </div>
                                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                                        <div className="font-bold text-trust-900 mb-1">Run-off Projection</div>
                                        <div className="text-sm">Projects CSM release over time based on service units.</div>
                                    </div>
                                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                                        <div className="font-bold text-trust-900 mb-1">Methodology Transparency</div>
                                        <div className="text-sm">View exact formulas and intermediate calculation steps.</div>
                                    </div>
                                </div>

                                <h3 className="text-trust-800 font-bold mt-8">How to Use</h3>
                                <ol className="list-decimal pl-5 space-y-2">
                                    <li>Navigate to <strong>Calculators &gt; IFRS 17</strong>.</li>
                                    <li>Select the sub-module (CSM, RA, or Run-off) from the top tabs.</li>
                                    <li>Enter the required parameters (Premium, FCF, Risk Adjustment).</li>
                                    <li>Click "Calculate". Results will appear on the right panel.</li>
                                    <li>Use the "Audit Trail" button to see a detailed breakdown of the logic used.</li>
                                </ol>
                            </div>
                        </div>
                    )}

                    {/* Solvency II */}
                    {activeSection === 'solvency' && (
                        <div className="p-8 lg:p-12">
                            <h2 className="text-3xl font-heading font-bold text-trust-900 mb-6 flex items-center gap-3">
                                <Shield className="w-8 h-8 text-growth-600" />
                                Solvency II Engine
                            </h2>
                            <div className="prose prose-slate max-w-none text-gray-500">
                                <p>
                                    Calculate Solvency Capital Requirement (SCR) and Minimum Capital Requirement (MCR)
                                    compliant with the Standard Formula approach.
                                </p>

                                <h3 className="text-trust-800 font-bold mt-8">Included Modules</h3>
                                <ul className="list-disc pl-5 space-y-2">
                                    <li><strong>Market Risk:</strong> Interest rate, equity, property, and spread risks.</li>
                                    <li><strong>Life Underwriting Risk:</strong> Mortality, longevity, lapse, and expense risks.</li>
                                    <li><strong>BSCR Aggregation:</strong> Combines risk modules using correlation matrices.</li>
                                </ul>

                                <div className="bg-yellow-50 p-6 rounded-2xl border border-yellow-100 mt-8 not-prose">
                                    <h4 className="text-sm font-black text-yellow-800 uppercase tracking-widest mb-2">Important Note</h4>
                                    <p className="text-sm text-yellow-700">
                                        The standard formula correlations are hardcoded based on the EIOPA delegated acts.
                                        Ensure your input vectors match the required granularity (e.g., net vs gross scenarios).
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Pricing */}
                    {activeSection === 'pricing' && (
                        <div className="p-8 lg:p-12">
                            <h2 className="text-3xl font-heading font-bold text-trust-900 mb-6 flex items-center gap-3">
                                <TrendingUp className="w-8 h-8 text-accent-500" />
                                Pricing & Profit Testing
                            </h2>
                            <div className="prose prose-slate max-w-none text-gray-500">
                                <p>
                                    Design products and test their profitability metrics (NPV, IRR) under various assumptions.
                                </p>

                                <h3 className="text-trust-800 font-bold mt-8">Capabilities</h3>
                                <ul className="list-disc pl-5 space-y-2">
                                    <li><strong>Premium Calculation:</strong> Determine Net and Gross premiums based on mortality hooks.</li>
                                    <li><strong>Profit Testing:</strong> Calculate Net Present Value (NPV) and Internal Rate of Return (IRR).</li>
                                    <li><strong>Sensitivity Analysis:</strong> Automatically shock assumptions (Mortality, Interest, Expense) to see impact on break-even price.</li>
                                </ul>
                            </div>
                        </div>
                    )}

                    {/* Mortality */}
                    {activeSection === 'mortality' && (
                        <div className="p-8 lg:p-12">
                            <h2 className="text-3xl font-heading font-bold text-trust-900 mb-6 flex items-center gap-3">
                                <Activity className="w-8 h-8 text-red-500" />
                                Mortality Tables
                            </h2>
                            <div className="prose prose-slate max-w-none text-gray-500">
                                <p>
                                    Interactive viewer and calculator for standard life tables. Supports generation of $l_x$, $d_x$, $q_x$ columns.
                                </p>

                                <h3 className="text-trust-800 font-bold mt-8">Supported Tables</h3>
                                <ul className="list-disc pl-5 space-y-2">
                                    <li>Swiss Standard (BVG 2020)</li>
                                    <li>US CSO 2017</li>
                                    <li>Custom uploads (via API)</li>
                                </ul>
                            </div>
                        </div>
                    )}

                    {/* API Reference */}
                    {activeSection === 'api-reference' && (
                        <div className="p-8 lg:p-12">
                            <h2 className="text-3xl font-heading font-bold text-trust-900 mb-6 flex items-center gap-3">
                                <Database className="w-8 h-8 text-purple-500" />
                                Data & API
                            </h2>
                            <div className="prose prose-slate max-w-none text-gray-500">
                                <p>
                                    For batch processing or integration with other systems, you can interact with the Python Actuarial Engine directly.
                                </p>

                                <h3 className="text-trust-800 font-bold mt-8">Key Endpoints</h3>
                                <div className="space-y-4 not-prose">
                                    <div className="p-4 bg-gray-900 text-gray-100 rounded-xl overflow-x-auto">
                                        <code>POST /api/v1/calculate/ifrs17</code>
                                    </div>
                                    <div className="p-4 bg-gray-900 text-gray-100 rounded-xl overflow-x-auto">
                                        <code>POST /api/v1/calculate/solvency</code>
                                    </div>
                                </div>

                                <p className="mt-6">
                                    All endpoints require standard JSON payloads containing `portfolio` arrays and `assumptions` objects.
                                    See the Swagger documentation (running locally at :8000/docs) for schema details.
                                </p>
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
}
