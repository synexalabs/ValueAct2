'use client';

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '../contexts/AuthContext'
import {
  Home,
  BookOpen,
  Calculator,
  Shield,
  DollarSign,
  TrendingUp,
  Award,
  Cpu,
  MessageCircle,
  Menu,
  X,
  LogOut,
  User,
  Database,
  FileText,
  Search,
  CheckCircle,
  Users,
  Upload
} from 'lucide-react'

const Sidebar = () => {
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  // Temporarily disable auth for testing
  // const { user, logout } = useAuth()

  const navigation = [
    { name: 'Dashboard', href: '/', icon: Home },
    { name: 'Data Management', href: '/data', icon: Database },
    { name: 'Valuations', href: '/valuations', icon: Calculator },
    { name: 'Quick Calculators', href: '/calculators', icon: Cpu },
    { name: 'Settings', href: '/settings', icon: User },
  ]

  const referenceNavigation = [
    { name: 'Methodology', href: '/methodology', icon: BookOpen },
  ]

  // const handleLogout = () => {
  //   logout()
  //   setIsMobileMenuOpen(false)
  // }

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block fixed left-0 top-0 h-screen w-64 bg-white border-r border-gray-200 shadow-lg z-40 overflow-y-auto">
        {/* App Title */}
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center space-x-4">
            <img
              src="/Valuact_logo_v2.png?v=1"
              alt="Valuact Logo"
              className="h-8 w-8 object-contain"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
            <div className="h-8 w-8 bg-blue-600 rounded flex items-center justify-center" style={{ display: 'none' }}>
              <Calculator className="h-4 w-4 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-lg font-bold text-gray-900 truncate">
                Valuact
              </p>
              <p className="text-sm text-gray-600 font-medium -mt-2">Actuarial Platform</p>
            </div>
          </div>
        </div>

        <nav className="p-4 space-y-2">
          {navigation.map((item) => {
            const isActive = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center space-x-4 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${isActive
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50 hover:shadow-sm'
                  }`}
              >
                <item.icon className="h-5 w-5 flex-shrink-0" />
                <span className="truncate">{item.name}</span>
              </Link>
            );
          })}

          {/* Reference Section */}
          <div className="pt-6 mt-6 border-t border-gray-200">
            <div className="space-y-2">
              {referenceNavigation.map((item) => {
                const isActive = pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center space-x-4 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${isActive
                      ? 'bg-purple-600 text-white shadow-md'
                      : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50 hover:shadow-sm'
                      }`}
                  >
                    <item.icon className="h-5 w-5 flex-shrink-0" />
                    <span className="truncate">{item.name}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </nav>
      </aside>

      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-lg border border-gray-200"
      >
        {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div
            className="fixed inset-0 bg-black bg-opacity-50"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <aside className="fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-200 shadow-xl">
            {/* Mobile App Title */}
            <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
              <div className="flex items-center space-x-4">
                <img
                  src="/Valuact_logo_v2.png?v=1"
                  alt="Valuact Logo"
                  className="h-8 w-8 object-contain"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
                <div className="h-8 w-8 bg-blue-600 rounded flex items-center justify-center" style={{ display: 'none' }}>
                  <Calculator className="h-4 w-4 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-lg font-bold text-gray-900 truncate">
                    Valuact
                  </p>
                  <p className="text-sm text-gray-600 font-medium -mt-2">Actuarial Platform</p>
                </div>
              </div>
            </div>

            <nav className="p-4 space-y-2">
              {navigation.map((item) => {
                const isActive = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center space-x-4 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${isActive
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50 hover:shadow-sm'
                      }`}
                  >
                    <item.icon className="h-5 w-5" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}

              {/* Mobile Reference Section */}
              <div className="pt-6 mt-6 border-t border-gray-200">
                <div className="space-y-2">
                  {referenceNavigation.map((item) => {
                    const isActive = pathname.startsWith(item.href);
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`flex items-center space-x-4 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${isActive
                          ? 'bg-purple-600 text-white shadow-md'
                          : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50 hover:shadow-sm'
                          }`}
                      >
                        <item.icon className="h-5 w-5" />
                        <span>{item.name}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </nav>
          </aside>
        </div>
      )}
    </>
  )
}

export default Sidebar
