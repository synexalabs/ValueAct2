"use client";

import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Eye, EyeOff, Mail, Lock, User, Activity } from 'lucide-react';
import { motion } from 'framer-motion';

const Register = ({ onSwitchToLogin }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const { register } = useAuth();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError(''); // Clear error when user types
    setSuccess(''); // Clear success message when user types
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    // Client-side validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    const result = await register(formData.email, formData.password, formData.confirmPassword);

    if (result.success) {
      setSuccess(result.message);
      setFormData({ email: '', password: '', confirmPassword: '' });
    } else {
      setError(result.error);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-6 relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-trust-50 rounded-full blur-[120px] opacity-60 animate-pulse" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-growth-50 rounded-full blur-[120px] opacity-60" />
      </div>

      <div className="max-w-md w-full relative">
        {/* Logo/Brand Area */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center h-16 w-16 bg-growth-600 rounded-3xl shadow-xl shadow-growth-900/20 mb-6 font-heading font-black text-2xl text-white">
            V
          </div>
          <h2 className="text-4xl font-heading font-black text-trust-900 tracking-tight">
            Build Your Access
          </h2>
          <p className="mt-2 text-gray-400 font-medium">
            Join the elite actuarial network
          </p>
        </div>

        <div className="bg-white/80 backdrop-blur-xl border border-gray-100 rounded-[2.5rem] p-8 md:p-10 shadow-glass relative overflow-hidden group">
          <div className="absolute top-0 left-0 p-8 opacity-[0.03] group-hover:rotate-12 transition-transform duration-1000">
            <User className="h-32 w-32 text-trust-900" />
          </div>

          <form className="space-y-6 relative z-10" onSubmit={handleSubmit}>
            <div className="space-y-5">
              <div>
                <label htmlFor="email" className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 px-1">
                  Professional Email
                </label>
                <div className="relative group/input">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-300 group-focus-within/input:text-growth-600 transition-colors" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="block w-full pl-12 pr-4 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl text-trust-900 font-medium placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-growth-900/5 focus:border-growth-600 transition-all font-sans"
                    placeholder="name@valuact.com"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 px-1">
                  Create Master Key
                </label>
                <div className="relative group/input">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-300 group-focus-within/input:text-growth-600 transition-colors" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="block w-full pl-12 pr-12 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl text-trust-900 font-medium placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-growth-900/5 focus:border-growth-600 transition-all font-sans"
                    placeholder="••••••••"
                  />
                  <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-gray-300 hover:text-growth-600 transition-colors focus:outline-none"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>
                <div className="mt-2 flex items-center gap-2 px-1">
                  <div className="h-1 w-8 bg-growth-200 rounded-full" />
                  <div className="h-1 w-8 bg-growth-200 rounded-full" />
                  <div className="h-1 w-8 bg-gray-100 rounded-full" />
                  <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest ml-1">Medium Strength</span>
                </div>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 px-1">
                  Confirm Master Key
                </label>
                <div className="relative group/input">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-300 group-focus-within/input:text-growth-600 transition-colors" />
                  </div>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="block w-full pl-12 pr-12 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl text-trust-900 font-medium placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-growth-900/5 focus:border-growth-600 transition-all font-sans"
                    placeholder="••••••••"
                  />
                  <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="text-gray-300 hover:text-growth-600 transition-colors focus:outline-none"
                    >
                      {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
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

            {success && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl bg-growth-50 border border-growth-100 p-4"
              >
                <div className="flex gap-3">
                  <div className="h-5 w-5 rounded-full bg-growth-100 flex items-center justify-center flex-shrink-0">
                    <Activity className="h-3 w-3 text-growth-600" />
                  </div>
                  <p className="text-xs font-bold text-growth-700 uppercase tracking-wider">{success}</p>
                </div>
              </motion.div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center py-4 px-6 bg-growth-600 text-white rounded-2xl font-bold text-sm shadow-xl shadow-growth-900/20 hover:bg-growth-500 hover:-translate-y-0.5 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center gap-3">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white"></div>
                  <span className="uppercase tracking-[0.2em] text-[10px]">Processing...</span>
                </div>
              ) : (
                <span className="uppercase tracking-[0.2em] text-[10px]">Create Account</span>
              )}
            </button>
          </form>
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm font-medium text-gray-500">
            Already registered?{' '}
            <button
              type="button"
              onClick={onSwitchToLogin}
              className="text-trust-900 font-bold hover:underline"
            >
              Sign in
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
