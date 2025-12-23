"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';
import { Eye, EyeOff, Mail, Lock, Shield } from 'lucide-react';
import { motion } from 'framer-motion';

const Login = ({ onSwitchToRegister }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useAuth();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError(''); // Clear error when user types
  };

  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // DEMO BYPASS: For Phase 2 Testing of Customer Portal
    if (formData.email === 'demo@fairlife.de') {
      router.push('/portal');
      setLoading(false);
      return;
    }

    const result = await login(formData.email, formData.password);

    if (result.success) {
      // Role-based routing (MVP: Admin domain check)
      if (formData.email.includes('@valuact.com')) {
        router.push('/dashboard');
      } else {
        router.push('/portal');
      }
    } else {
      setError(result.error);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-6 relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-trust-50 rounded-full blur-[120px] opacity-60 animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-growth-50 rounded-full blur-[120px] opacity-60" />
      </div>

      <div className="max-w-md w-full relative">
        {/* Logo/Brand Area */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center h-16 w-16 bg-trust-900 rounded-3xl shadow-xl shadow-trust-900/20 mb-6">
            <Lock className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-4xl font-heading font-black text-trust-900 tracking-tight">
            Welcome Back
          </h2>
          <p className="mt-2 text-gray-400 font-medium">
            Secure access to the Valuact Engine
          </p>
        </div>

        <div className="bg-white/80 backdrop-blur-xl border border-gray-100 rounded-[2.5rem] p-8 md:p-10 shadow-glass relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:scale-110 transition-transform duration-700">
            <Shield className="h-32 w-32 text-trust-900" />
          </div>

          <form className="space-y-6 relative z-10" onSubmit={handleSubmit}>
            <div className="space-y-5">
              <div>
                <label htmlFor="email" className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 px-1">
                  Actuarial ID (Email)
                </label>
                <div className="relative group/input">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-300 group-focus-within/input:text-trust-600 transition-colors" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="block w-full pl-12 pr-4 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl text-trust-900 font-medium placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-trust-900/5 focus:border-trust-900 transition-all font-sans"
                    placeholder="name@valuact.com"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2 px-1">
                  <label htmlFor="password" className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                    Security Key
                  </label>
                  <button type="button" className="text-[10px] font-black text-trust-600 uppercase tracking-widest hover:text-trust-900">
                    Forgot?
                  </button>
                </div>
                <div className="relative group/input">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-300 group-focus-within/input:text-trust-600 transition-colors" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="block w-full pl-12 pr-12 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl text-trust-900 font-medium placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-trust-900/5 focus:border-trust-900 transition-all font-sans"
                    placeholder="••••••••"
                  />
                  <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-gray-300 hover:text-trust-600 transition-colors focus:outline-none"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="rounded-2xl bg-red-50 border border-red-100 p-4"
              >
                <div className="flex gap-3">
                  <div className="h-5 w-5 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                    <div className="h-1.5 w-1.5 rounded-full bg-red-600" />
                  </div>
                  <p className="text-xs font-bold text-red-600 uppercase tracking-wider">{error}</p>
                </div>
              </motion.div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center py-4 px-6 bg-trust-950 text-white rounded-2xl font-bold text-sm shadow-xl shadow-trust-900/20 hover:bg-trust-900 hover:-translate-y-0.5 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center gap-3">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white"></div>
                  <span className="uppercase tracking-[0.2em] text-[10px]">Authenticating...</span>
                </div>
              ) : (
                <span className="uppercase tracking-[0.2em] text-[10px]">Verify & Enter</span>
              )}
            </button>

            <div className="text-center pt-4">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                Protected by 256-bit encryption
              </p>
            </div>
          </form>
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm font-medium text-gray-500">
            Internal Access Portal •{' '}
            <button
              type="button"
              onClick={onSwitchToRegister}
              className="text-trust-900 font-bold hover:underline"
            >
              Request Credentials
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
