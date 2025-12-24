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
  Upload,
  HelpCircle
} from 'lucide-react'

const Sidebar = () => {
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  // Temporarily disable auth for testing
  // const { user, logout } = useAuth()

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Data Management', href: '/data', icon: Database },
    { name: 'Valuations', href: '/valuations', icon: Calculator },
    { name: 'Quick Calculators', href: '/calculators', icon: Cpu },
    { name: 'Settings', href: '/settings', icon: User },
  ]

  const referenceNavigation = [
    { name: 'Methodology', href: '/methodology', icon: BookOpen },
    { name: 'User Guide', href: '/user-guide', icon: HelpCircle },
  ]

  // const handleLogout = () => {
  //   logout()
  //   setIsMobileMenuOpen(false)
  // }

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block fixed left-0 top-0 h-screen w-64 bg-white border-r border-gray-100 shadow-glass z-40 overflow-y-auto">
        {/* App Title */}
        <div className="p-6 border-b border-gray-100 bg-gradient-to-br from-trust-50 via-white to-trust-50">
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="p-2 bg-gradient-to-br from-trust-600 to-trust-800 rounded-lg shadow-warm group-hover:scale-105 transition-transform duration-200">
              <Calculator className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-heading text-xl font-bold text-trust-900 tracking-tight">
                Valuact
              </p>
              <p className="text-[10px] font-bold text-trust-400 uppercase tracking-widest -mt-1">Actuarial Analytics</p>
            </div>
          </Link>
        </div>

        <nav className="p-4 space-y-1">
          <div className="px-3 mb-2">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Main Menu</p>
          </div>
          {navigation.map((item) => {
            const isActive = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center space-x-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${isActive
                  ? 'bg-trust-900 text-white shadow-lg shadow-trust-900/10'
                  : 'text-gray-600 hover:text-trust-900 hover:bg-trust-50'
                  }`}
              >
                <item.icon className={`h-4.5 w-4.5 flex-shrink-0 ${isActive ? 'text-growth-400' : 'text-gray-400'}`} />
                <span className="truncate">{item.name}</span>
              </Link>
            );
          })}

          {/* Reference Section */}
          <div className="pt-6 mt-6 border-t border-gray-100">
            <div className="px-3 mb-2">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Knowledge Base</p>
            </div>
            <div className="space-y-1">
              {referenceNavigation.map((item) => {
                const isActive = pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center space-x-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${isActive
                      ? 'bg-trust-100 text-trust-900 shadow-sm border border-trust-200'
                      : 'text-gray-600 hover:text-trust-900 hover:bg-trust-50'
                      }`}
                  >
                    <item.icon className={`h-4.5 w-4.5 flex-shrink-0 ${isActive ? 'text-trust-600' : 'text-gray-400'}`} />
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
          <aside className="fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-100 shadow-xl">
            {/* Mobile App Title */}
            <div className="p-6 border-b border-gray-100 bg-gradient-to-br from-trust-50 via-white to-trust-50">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-br from-trust-600 to-trust-800 rounded-lg">
                  <Calculator className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-heading text-xl font-bold text-trust-900 tracking-tight">
                    Valuact
                  </p>
                  <p className="text-[10px] font-bold text-trust-400 uppercase tracking-widest -mt-1">Actuarial Analytics</p>
                </div>
              </div>
            </div>

            <nav className="p-4 space-y-1">
              <div className="px-3 mb-2">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Main Menu</p>
              </div>
              {navigation.map((item) => {
                const isActive = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center space-x-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${isActive
                      ? 'bg-trust-900 text-white shadow-md'
                      : 'text-gray-700 hover:text-trust-900 hover:bg-trust-50'
                      }`}
                  >
                    <item.icon className={`h-4.5 w-4.5 ${isActive ? 'text-growth-400' : 'text-gray-400'}`} />
                    <span>{item.name}</span>
                  </Link>
                );
              })}

              {/* Mobile Reference Section */}
              <div className="pt-6 mt-6 border-t border-gray-100">
                <div className="px-3 mb-2">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Knowledge Base</p>
                </div>
                <div className="space-y-1">
                  {referenceNavigation.map((item) => {
                    const isActive = pathname.startsWith(item.href);
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`flex items-center space-x-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${isActive
                          ? 'bg-trust-100 text-trust-900 border border-trust-200'
                          : 'text-gray-700 hover:text-trust-900 hover:bg-trust-50'
                          }`}
                      >
                        <item.icon className={`h-4.5 w-4.5 ${isActive ? 'text-trust-600' : 'text-gray-400'}`} />
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
