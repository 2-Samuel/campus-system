import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  GraduationCap,
  Mail,
  Lock,
  ArrowRight,
  ShieldCheck,
  User,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  KeyRound
} from 'lucide-react';

export const LoginPage = ({ onNavigateToRegister }) => {
  const { login, quickLogin } = useAuth();

  const [selectedRole, setSelectedRole] = useState('student'); // 'student' | 'lecturer' | 'admin'
  const [email, setEmail] = useState('student@university.ac.ke');
  const [password, setPassword] = useState('password123');
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [forgotMsg, setForgotMsg] = useState('');

  const handleRoleTabChange = (role) => {
    setSelectedRole(role);
    setError('');
    setForgotMsg('');
    if (role === 'student') {
      setEmail('student@university.ac.ke');
    } else if (role === 'lecturer') {
      setEmail('john.kamau@university.ac.ke');
    } else if (role === 'admin') {
      setEmail('admin@university.ac.ke');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setForgotMsg('');
    setLoading(true);

    try {
      await login(email, password, selectedRole, rememberMe);
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    setForgotMsg(`A password reset link has been dispatched to ${email}. For demonstration, all accounts use password: password123`);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50 dark:bg-slate-950">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8">
        {/* University Header */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-tr from-[#0A192F] to-[#1E3A8A] flex items-center justify-center text-white shadow-lg shadow-blue-900/30 mb-3">
            <GraduationCap className="w-8 h-8 text-blue-400" />
          </div>
          <h1 className="font-heading font-extrabold text-2xl text-slate-900 dark:text-white tracking-tight">
            UNIVERSITY PORTAL
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Lecturer Locator &amp; Appointment Management System
          </p>
        </div>

        {/* Role Selector Tabs */}
        <div className="grid grid-cols-3 gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl mb-6">
          {[
            { id: 'student', label: 'Student' },
            { id: 'lecturer', label: 'Lecturer' },
            { id: 'admin', label: 'Admin' }
          ].map((r) => (
            <button
              key={r.id}
              type="button"
              onClick={() => handleRoleTabChange(r.id)}
              className={`py-2 text-xs font-semibold rounded-xl transition ${
                selectedRole === r.id
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>

        {/* Feedback messages */}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900/60 text-xs text-red-700 dark:text-red-300 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {forgotMsg && (
          <div className="mb-4 p-3 rounded-xl bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-900/60 text-xs text-blue-700 dark:text-blue-300 flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{forgotMsg}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              University Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="name@university.ac.ke"
                className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              />
            </div>
          </div>

          <div className="flex items-center justify-between text-xs pt-1">
            <label className="flex items-center gap-2 cursor-pointer text-slate-600 dark:text-slate-400 font-medium">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded text-blue-600 focus:ring-blue-500"
              />
              <span>Remember Me</span>
            </label>
            <button
              type="button"
              onClick={handleForgotPassword}
              className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
            >
              Forgot Password?
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#1E3A8A] hover:bg-[#0A192F] text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-lg shadow-blue-900/25 transition flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <span>{loading ? 'Authenticating...' : `${selectedRole.toUpperCase()} LOGIN`}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Demo Fast Switch Pill */}
        <div className="mt-6 pt-5 border-t border-slate-200 dark:border-slate-800">
          <p className="text-[11px] text-slate-400 text-center uppercase tracking-wider font-semibold mb-2.5">
            Quick Demo 1-Click Access
          </p>
          <div className="grid grid-cols-3 gap-1.5">
            <button
              type="button"
              onClick={() => quickLogin('student')}
              className="px-2 py-1.5 text-[11px] font-semibold rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 hover:bg-blue-100 transition"
            >
              Student (Alex)
            </button>
            <button
              type="button"
              onClick={() => quickLogin('lecturer')}
              className="px-2 py-1.5 text-[11px] font-semibold rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 transition"
            >
              Lecturer (Kamau)
            </button>
            <button
              type="button"
              onClick={() => quickLogin('admin')}
              className="px-2 py-1.5 text-[11px] font-semibold rounded-lg bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 hover:bg-purple-100 transition"
            >
              Administrator
            </button>
          </div>
        </div>

        {/* Registration Link for Students */}
        {selectedRole === 'student' && (
          <div className="mt-5 text-center text-xs text-slate-500 dark:text-slate-400">
            Don't have a student account?{' '}
            <button
              type="button"
              onClick={onNavigateToRegister}
              className="font-bold text-blue-600 dark:text-blue-400 hover:underline"
            >
              Register here
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
