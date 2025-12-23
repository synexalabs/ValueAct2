'use client';

import React, { useState } from 'react';
import { Settings, User, Shield, Bell, Palette, HardDrive } from 'lucide-react';
import StorageManager from '../../../components/StorageManager';

const SettingsPage = () => {
    const [activeTab, setActiveTab] = useState('storage');

    const tabs = [
        { id: 'storage', label: 'Storage', icon: HardDrive },
        { id: 'profile', label: 'Profile', icon: User },
        { id: 'security', label: 'Security', icon: Shield },
        { id: 'notifications', label: 'Notifications', icon: Bell },
        { id: 'appearance', label: 'Appearance', icon: Palette },
    ];

    const renderTabContent = () => {
        switch (activeTab) {
            case 'storage':
                return <StorageManager />;
            case 'profile':
                return (
                    <div className="bg-white rounded-lg shadow-sm border p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Profile Settings</h3>
                        <p className="text-gray-600">Profile settings coming soon...</p>
                    </div>
                );
            case 'security':
                return (
                    <div className="bg-white rounded-lg shadow-sm border p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Security Settings</h3>
                        <p className="text-gray-600">Security settings coming soon...</p>
                    </div>
                );
            case 'notifications':
                return (
                    <div className="bg-white rounded-lg shadow-sm border p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Notification Settings</h3>
                        <p className="text-gray-600">Notification settings coming soon...</p>
                    </div>
                );
            case 'appearance':
                return (
                    <div className="bg-white rounded-lg shadow-sm border p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Appearance Settings</h3>
                        <p className="text-gray-600">Appearance settings coming soon...</p>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <Settings className="h-8 w-8 text-blue-600" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
                            <p className="text-gray-600">Manage your application preferences and storage</p>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Sidebar */}
                    <div className="lg:w-64">
                        <nav className="space-y-1">
                            {tabs.map((tab) => {
                                const Icon = tab.icon;
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`w-full flex items-center space-x-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${activeTab === tab.id
                                                ? 'bg-blue-600 text-white shadow-md'
                                                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                                            }`}
                                    >
                                        <Icon className="h-5 w-5" />
                                        <span>{tab.label}</span>
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
        </div>
    );
};

export default SettingsPage;
