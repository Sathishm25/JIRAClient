import axios from 'axios';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

// Modern JIRA-style logo for Sign Up (SVG)
const signUpLogo = (
  <div className="flex items-center justify-center mb-8">
    <div className="relative">
      <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0052cc" />
            <stop offset="100%" stopColor="#0098EB" />
          </linearGradient>
        </defs>
        <rect width="80" height="80" rx="20" fill="url(#logoGradient)" />
        <path d="M40 20L55 40L40 60L25 40L40 20Z" fill="#fff" fillOpacity="0.9"/>
        <circle cx="40" cy="40" r="12" fill="#fff"/>
        <circle cx="40" cy="40" r="8" fill="#0052cc"/>
      </svg>
      <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
      </div>
    </div>  
  </div>
);

export default function SignUp() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const navigate = useNavigate();
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  const onSubmit = async (data: any) => {
    try {
      const response = await axios.post('http://localhost:4000/api/users/', {...data, role: 'regular'});
      if(response?.status === 201) {
        showToast('success', 'Signed up successfully! Please sign in.');
        setTimeout(() => navigate('/'), 1000);
      }
    } catch (error: any) {
      console.error('Error signing up:', error);
      showToast(
        'error',
        'Failed to sign up' + (error?.response?.data?.error ? `: ${error.response.data.error}` : '')
      );
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Background with New Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900">
        {/* Animated geometric shapes */}
        <div className="absolute top-20 left-20 w-72 h-72 bg-cyan-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute top-40 right-20 w-72 h-72 bg-violet-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000"></div>
        <div className="absolute -bottom-32 left-40 w-72 h-72 bg-emerald-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-4000"></div>
        
        {/* Grid pattern overlay */}
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        
        {/* Floating particles */}
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-white rounded-full opacity-20 animate-float"></div>
        <div className="absolute top-1/3 right-1/3 w-1 h-1 bg-white rounded-full opacity-30 animate-float animation-delay-1000"></div>
        <div className="absolute bottom-1/4 left-1/3 w-1.5 h-1.5 bg-white rounded-full opacity-25 animate-float animation-delay-2000"></div>
        <div className="absolute top-2/3 right-1/4 w-1 h-1 bg-white rounded-full opacity-20 animate-float animation-delay-3000"></div>
      </div>

      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed top-6 left-1/2 transform -translate-x-1/2 z-50 px-6 py-4 rounded-xl shadow-2xl text-white font-semibold transition-all duration-300 backdrop-blur-sm
            ${toast.type === 'success' 
              ? 'bg-gradient-to-r from-green-500 to-green-600 border border-green-400' 
              : 'bg-gradient-to-r from-red-500 to-red-600 border border-red-400'
            }`}
        >
          <div className="flex items-center gap-2">
            {toast.type === 'success' ? (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            )}
            {toast.message}
          </div>
        </div>
      )}      {/* Main Content */}
      <div className="relative z-10 flex min-h-screen">        {/* Left Side - Join Our Community */}
        <div className="hidden lg:flex lg:w-3/5 flex-col justify-center px-12 py-12">
          <div className="max-w-2xl bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20 shadow-2xl">
            {/* Hero Section */}
            <div className="text-center mb-8">
              <div className="relative mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-emerald-400 to-blue-500 rounded-full flex items-center justify-center shadow-xl mx-auto">
                  <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full animate-bounce"></div>
                <div className="absolute -bottom-2 -left-2 w-6 h-6 bg-pink-400 rounded-full animate-pulse"></div>
              </div>
              
              <h1 className="text-5xl font-bold text-white mb-4 bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                Start Building Today
              </h1>
              <p className="text-blue-100 text-xl leading-relaxed">
                Join thousands of creators who are already building amazing things
              </p>
            </div>

            {/* Interactive Features */}
            <div className="space-y-4">
              <div className="group hover:bg-white/5 rounded-2xl p-4 transition-all duration-300 cursor-pointer">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-lg">Powerful Tools</h3>
                    <p className="text-blue-200 text-sm">Everything you need in one place</p>
                  </div>
                </div>
              </div>

              <div className="group hover:bg-white/5 rounded-2xl p-4 transition-all duration-300 cursor-pointer">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-lg">Global Community</h3>
                    <p className="text-blue-200 text-sm">Connect with creators worldwide</p>
                  </div>
                </div>
              </div>

              <div className="group hover:bg-white/5 rounded-2xl p-4 transition-all duration-300 cursor-pointer">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-lg">Accelerate Growth</h3>
                    <p className="text-blue-200 text-sm">Scale your projects faster than ever</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Call to Action */}
            <div className="mt-8 text-center p-6 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-2xl border border-white/10">
              <p className="text-white font-semibold text-lg mb-2">Ready to get started?</p>
              <p className="text-blue-200 text-sm">Join over 50,000 users building the future ✨</p>
            </div>
          </div>
        </div>

        {/* Right Side - Sign Up Form */}
        <div className="w-full lg:w-2/5 flex items-center justify-center px-4 py-12">
          <div className="w-full max-w-md">
            {/* Welcome message for mobile */}
            <div className="lg:hidden text-center mb-8">
              <h1 className="text-3xl font-bold text-white mb-2">Join JIRA</h1>
              <p className="text-blue-100">by R</p>
            </div>

            {/* Sign Up Card */}
            <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/20 transform transition-all duration-300 hover:scale-105">
              {/* Logo */}
              {signUpLogo}
              
              {/* Welcome Text */}
              <div className="text-center mb-8">
                <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">Create Account</h1>
                <p className="text-blue-100 text-lg">Join R JIRA today</p>
              </div>

              {/* Sign Up Form */}
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Name Field */}
                <div className="space-y-2">
                  <label className="text-white font-medium text-sm block">Full Name</label>
                  <div className="relative">
                    <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-blue-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <input 
                      {...register('name', { required: true })} 
                      type="text" 
                      placeholder="Enter your full name" 
                      className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white/20 backdrop-blur-sm text-white placeholder-blue-200 border border-white/30 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-300"
                    />
                  </div>
                  {errors.name && <span className="text-red-300 text-sm flex items-center gap-1">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    Name is required
                  </span>}
                </div>

                {/* Email Field */}
                <div className="space-y-2">
                  <label className="text-white font-medium text-sm block">Email Address</label>
                  <div className="relative">
                    <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-blue-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                    </svg>
                    <input 
                      {...register('email', { required: true })} 
                      type="email" 
                      placeholder="Enter your email" 
                      className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white/20 backdrop-blur-sm text-white placeholder-blue-200 border border-white/30 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-300"
                    />
                  </div>
                  {errors.email && <span className="text-red-300 text-sm flex items-center gap-1">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    Email is required
                  </span>}
                </div>

                {/* Password Field */}
                <div className="space-y-2">
                  <label className="text-white font-medium text-sm block">Password</label>
                  <div className="relative">
                    <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-blue-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    <input 
                      {...register('password', {
                        required: 'Password is required',
                        minLength: { value: 6, message: 'Password must be at least 6 characters' },
                        validate: {
                          hasLower: value => /[a-z]/.test(value) || 'Must include a lowercase letter',
                          hasUpper: value => /[A-Z]/.test(value) || 'Must include an uppercase letter',
                          hasNumber: value => /[0-9]/.test(value) || 'Must include a number',
                          hasSpecial: value => /[^A-Za-z0-9]/.test(value) || 'Must include a special character',
                        }
                      })} 
                      type="password" 
                      placeholder="Create a strong password" 
                      className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white/20 backdrop-blur-sm text-white placeholder-blue-200 border border-white/30 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-300"
                    />
                  </div>
                  {errors.password && <span className="text-red-300 text-sm flex items-center gap-1">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {errors.password.message || (errors.password.types && Object.values(errors.password.types)[0])}
                  </span>}
                </div>

                {/* Sign Up Button */}
                <button 
                  type="submit" 
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold text-lg shadow-lg hover:from-blue-600 hover:to-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-400/50 transform transition-all duration-300 hover:scale-105 active:scale-95"
                >
                  <span className="flex items-center justify-center gap-2">
                    Create Account
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </span>
                </button>
              </form>

              {/* Sign In Link */}
              <div className="mt-8 text-center">
                <p className="text-blue-100 text-sm">
                  Already have an account?{' '}
                  <a 
                    href="/" 
                    className="text-white font-semibold hover:text-blue-200 transition-colors duration-300 underline decoration-2 underline-offset-4"
                  >
                    Sign In
                  </a>
                </p>
              </div>              {/* Footer */}
              <div className="mt-8 pt-6 border-t border-white/20 text-center">
                <p className="text-blue-200 text-xs">
                  © 2025 Sathish. All rights reserved.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}