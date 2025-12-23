'use client';

import React, { useState } from 'react';
import { Settings, User, Shield, Bell, Palette, HardDrive } from 'lucide-react';
import StorageManager from '../../../components/StorageManager';

const SettingsPage = () => {
    const [activeTab, setActiveTab] = useState('storage');

    const tabs = [
        { id: 'storage', label: 'Cloud Storage', icon: HardDrive },
        { id: 'profile', label: 'Actuary Profile', icon: User },
        { id: 'security', label: 'Security Audit', icon: Shield },
        { id: 'notifications', label: 'System Alerts', icon: Bell },
        { id: 'appearance', label: 'Interface Design', icon: Palette },
    ];

    const renderTabContent = () => {
        switch (activeTab) {
            case 'storage':
                return <StorageManager />;
            default:
                return (
                    <div className="bg-white rounded-[2rem] border border-gray-100 p-12 shadow-sm text-center">
                        <div className="h-20 w-20 bg-trust-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
                            <Settings className="h-10 w-10 text-trust-600 animate-pulse" />
                        </div>
                        <h3 className="text-2xl font-heading font-bold text-trust-900 mb-2">{tabs.find(t => t.id === activeTab)?.label}</h3>
                        <p className="text-gray-400 max-w-sm mx-auto">This module is currently undergoing architectural refinement to meet V2.0 standards.</p>
                    </div>
                );
        }
    };

    return (
        <div className="space-y-10">
            {/* Header */}
            <div>
                <div className="flex items-center gap-4 mb-4">
                    <div className="h-12 w-12 bg-trust-900 rounded-2xl flex items-center justify-center shadow-lg shadow-trust-900/20">
                        <Settings className="h-6 w-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-4xl font-heading font-bold text-trust-900">Platform Settings</h1>
                        <p className="text-gray-400 font-medium">Configure your actuarial environment and security protocols.</p>
                    </div>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-10">
                {/* Sidebar */}
                <div className="lg:w-72">
                    <nav className="space-y-2">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            const isActive = activeTab === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`w-full group flex items-center justify-between px-5 py-4 rounded-2xl transition-all duration-300 ${isActive
                                            ? 'bg-trust-900 text-white shadow-xl shadow-trust-900/10'
                                            : 'bg-white text-gray-500 hover:text-trust-900 border border-gray-100 hover:border-trust-200'
                                        }`}
                                >
                                    <div className="flex items-center gap-4 text-sm font-bold">
                                        <Icon className={`h-5 w-5 ${isActive ? 'text-growth-400' : 'text-gray-400 group-hover:text-trust-600'}`} />
                                        <span>{tab.label}</span>
                                    </div>
                                    <div className={`h-1.5 w-1.5 rounded-full transition-all ${isActive ? 'bg-growth-400 scale-125' : 'bg-transparent'}`} />
                                </button>
                            );
                        })}
                    </nav>
                </div>

                {/* Main Content */}
                <div className="flex-1">
                    {renderTabContent()}
                </div>
            </div>
        </div>
    );
};

export default SettingsPage;
