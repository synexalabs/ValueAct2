'use client';

import React, { useState } from 'react';
import { BookOpen, Calculator, Shield, DollarSign, Heart, TrendingUp, ChevronDown, ChevronRight } from 'lucide-react';

const Methodology = () => {
    const [expandedSections, setExpandedSections] = useState({
        ifrs17: true,
        solvency: false,
        pricing: false,
        mortality: false
    });

    const toggleSection = (section) => {
        setExpandedSections(prev => ({
            ...prev,
            [section]: !prev[section]
        }));
    };

    const methodologySections = [
        {
            id: 'ifrs17',
            title: 'IFRS 17 Methodology',
            icon: Calculator,
            color: 'blue',
            description: 'Contractual Service Margin, Risk Adjustment, and Loss Component calculations',
            subsections: [
                {
                    title: 'Contractual Service Margin (CSM)',
                    content: `The CSM represents the unearned profit in an insurance contract. It is calculated as:

CSM = Fulfilment Cash Flows - Risk Adjustment - Loss Component

Where:
- Fulfilment Cash Flows = Expected Premiums - Expected Benefits - Expected Expenses
- Risk Adjustment = Compensation for non-financial risk
- Loss Component = Recognition of onerous contracts

The CSM is released over the service period in proportion to the services provided.`
                },
                {
                    title: 'Risk Adjustment',
                    content: `Risk Adjustment compensates for the non-financial risk inherent in insurance contracts. It is calculated using:

Risk Adjustment = Σ(Probability × Risk-free Value × Risk Factor)

Where:
- Probability = Likelihood of each scenario
- Risk-free Value = Present value of cash flows
- Risk Factor = Risk adjustment factor for each scenario

The risk adjustment should reflect the compensation required by market participants for bearing the non-financial risk.`
                },
                {
                    title: 'Loss Component',
                    content: `The Loss Component represents the recognition of onerous contracts where the fulfilment cash flows exceed the expected premiums.

Loss Component = Max(0, Fulfilment Cash Flows - Expected Premiums)

The loss component is recognized immediately in profit or loss and is not included in the CSM.`
                }
            ]
        },
        {
            id: 'solvency',
            title: 'Solvency II Methodology',
            icon: Shield,
            color: 'green',
            description: 'SCR, MCR, and capital requirement calculations',
            subsections: [
                {
                    title: 'Solvency Capital Requirement (SCR)',
                    content: `The SCR represents the capital needed to ensure a 99.5% confidence level of survival over one year.

SCR = √(Σ Σ ρij × SCRi × SCRj)

Where:
- SCRi = Capital requirement for risk module i
- ρij = Correlation coefficient between risk modules i and j

Risk modules include:
- Market Risk
- Life Risk
- Health Risk
- Non-life Risk
- Credit Risk
- Operational Risk`
                },
                {
                    title: 'Minimum Capital Requirement (MCR)',
                    content: `The MCR represents the minimum capital below which regulatory intervention is triggered.

MCR = Max(MCRlinear, MCRfloor)

Where:
- MCRlinear = Linear formula based on technical provisions
- MCRfloor = Absolute minimum floor

The MCR is typically 25-45% of the SCR and is calculated using simplified methods.`
                }
            ]
        },
        {
            id: 'pricing',
            title: 'Pricing Methodology',
            icon: DollarSign,
            color: 'purple',
            description: 'Premium calculation and profit testing methodologies',
            subsections: [
                {
                    title: 'Premium Calculation',
                    content: `Premiums are calculated using the equivalence principle:

Premium = Present Value of Benefits + Present Value of Expenses + Profit Loading

Where:
- Present Value of Benefits = Σ(Benefits × Discount Factor)
- Present Value of Expenses = Σ(Expenses × Discount Factor)
- Profit Loading = Required profit margin

The discount factor uses the risk-free rate plus appropriate risk margins.`
                },
                {
                    title: 'Profit Testing',
                    content: `Profit testing evaluates the profitability of insurance products over their lifetime.

Key metrics:
- Net Present Value (NPV) = Σ(Profit × Discount Factor)
- Internal Rate of Return (IRR) = Discount rate where NPV = 0
- Payback Period = Time to recover initial investment
- Profit Margin = Profit / Premium

Sensitivity analysis tests the impact of key assumptions on profitability.`
                }
            ]
        },
        {
            id: 'mortality',
            title: 'Mortality Methodology',
            icon: Heart,
            color: 'red',
            description: 'Mortality tables, life expectancy, and actuarial calculations',
            subsections: [
                {
                    title: 'Mortality Tables',
                    content: `Mortality tables provide the probability of death at each age:

qx = Probability of death at age x
lx = Number of lives at age x
dx = Number of deaths between ages x and x+1

Standard mortality tables:
- CSO (Commissioners Standard Ordinary)
- SOA (Society of Actuaries)
- Industry-specific tables

Tables are typically gender-specific and may include smoker/non-smoker distinctions.`
                },
                {
                    title: 'Life Expectancy',
                    content: `Life expectancy represents the average remaining lifetime:

ex = Σ(t × tpx) / tpx

Where:
- tpx = Probability of surviving t years from age x
- t = Time period

Life expectancy is used in annuity calculations and longevity risk assessment.`
                },
                {
                    title: 'Present Value Calculations',
                    content: `Present value calculations discount future cash flows:

PV = Σ(CFt × vt)

Where:
- CFt = Cash flow at time t
- vt = Discount factor = (1 + i)^(-t)
- i = Interest rate

For life insurance, cash flows are weighted by survival probabilities:
PV = Σ(CFt × tpx × vt)`
                }
            ]
        }
    ];

    const getColorClasses = (color) => {
        const colorMap = {
            blue: {
                bg: 'bg-blue-50',
                border: 'border-blue-200',
                text: 'text-blue-800',
                icon: 'text-blue-600'
            },
            green: {
                bg: 'bg-green-50',
                border: 'border-green-200',
                text: 'text-green-800',
                icon: 'text-green-600'
            },
            purple: {
                bg: 'bg-purple-50',
                border: 'border-purple-200',
                text: 'text-purple-800',
                icon: 'text-purple-600'
            },
            red: {
                bg: 'bg-red-50',
                border: 'border-red-200',
                text: 'text-red-800',
                icon: 'text-red-600'
            }
        };
        return colorMap[color] || colorMap.blue;
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="text-center">
                <h1 className="text-4xl font-bold text-gray-900 mb-4">Actuarial Methodology Reference</h1>
                <p className="text-xl text-gray-600 mb-2">Technical reference for actuarial calculations and methodologies</p>
                <p className="text-sm text-gray-500">
                    Professional documentation for insurance actuarial work
                </p>
            </div>

            {/* Methodology Sections */}
            <div className="space-y-6">
                {methodologySections.map((section) => {
                    const IconComponent = section.icon;
                    const colors = getColorClasses(section.color);
                    const isExpanded = expandedSections[section.id];

                    return (
                        <div
                            key={section.id}
                            className={`${colors.bg} ${colors.border} border rounded-lg overflow-hidden shadow-sm`}
                        >
                            {/* Section Header */}
                            <button
                                onClick={() => toggleSection(section.id)}
                                className="w-full p-6 text-left hover:bg-opacity-80 transition-colors bg-white/50"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-4">
                                        <div className={`p-3 bg-white rounded-lg shadow-sm ${colors.icon}`}>
                                            <IconComponent className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <h2 className={`text-2xl font-bold ${colors.text}`}>
                                                {section.title}
                                            </h2>
                                            <p className="text-gray-600 mt-1">{section.description}</p>
                                        </div>
                                    </div>
                                    {isExpanded ? (
                                        <ChevronDown className="h-6 w-6 text-gray-500" />
                                    ) : (
                                        <ChevronRight className="h-6 w-6 text-gray-500" />
                                    )}
                                </div>
                            </button>

                            {/* Section Content */}
                            {isExpanded && (
                                <div className="px-6 pb-6">
                                    <div className="space-y-6 pt-6 border-t border-gray-100">
                                        {section.subsections.map((subsection, index) => (
                                            <div key={index} className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
                                                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                                                    {subsection.title}
                                                </h3>
                                                <div className="prose max-w-none">
                                                    <pre className="whitespace-pre-wrap text-gray-700 font-mono text-sm leading-relaxed overflow-x-auto p-4 bg-gray-50 rounded-lg">
                                                        {subsection.content}
                                                    </pre>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Additional Resources */}
            <div className="bg-gray-50 rounded-lg p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Additional Resources</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
                        <div className="flex items-center space-x-3 mb-4">
                            <BookOpen className="h-6 w-6 text-blue-600" />
                            <h3 className="text-lg font-semibold text-gray-900">Regulatory Standards</h3>
                        </div>
                        <ul className="space-y-2 text-gray-700">
                            <li>• IFRS 17 - Insurance Contracts</li>
                            <li>• Solvency II Directive</li>
                            <li>• Local regulatory requirements</li>
                            <li>• Industry best practices</li>
                        </ul>
                    </div>
                    <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
                        <div className="flex items-center space-x-3 mb-4">
                            <TrendingUp className="h-6 w-6 text-green-600" />
                            <h3 className="text-lg font-semibold text-gray-900">Implementation Notes</h3>
                        </div>
                        <ul className="space-y-2 text-gray-700">
                            <li>• Model validation requirements</li>
                            <li>• Documentation standards</li>
                            <li>• Quality assurance processes</li>
                            <li>• Regular review procedures</li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Professional Notice */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <div className="flex items-center space-x-3">
                    <Shield className="h-6 w-6 text-blue-600" />
                    <div>
                        <h3 className="text-lg font-semibold text-blue-800">Professional Use</h3>
                        <p className="text-blue-700">
                            This methodology reference is intended for professional actuaries and should be used
                            in conjunction with appropriate professional judgment and regulatory requirements.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Methodology;
