import React, { useState } from 'react';
import { Heart, Lock, Mail, ArrowRight, ShieldCheck, UserCheck, HeartHandshake } from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';

interface LoginPageProps {
  onNavigate: (page: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onNavigate }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please provide both email and password.');
      return;
    }

    setLoading(true);
    setError(null);

    const result = await login(email, password);
    setLoading(false);

    if (result.success) {
      // Navigate to dashboard
      const savedUser = JSON.parse(localStorage.getItem('bloodconnect_user') || '{}');
      if (savedUser.role === 'admin') {
        onNavigate('admin-dashboard');
      } else if (savedUser.role === 'donor') {
        onNavigate('donor-dashboard');
      } else {
        onNavigate('requester-dashboard');
      }
    } else {
      setError(result.message || 'Invalid credentials');
    }
  };

  const fillDemoAccount = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError(null);
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 to-red-700 text-white p-6 text-center">
          <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-xs flex items-center justify-center mx-auto mb-3">
            <Heart className="w-6 h-6 fill-white text-white" />
          </div>
          <h2 className="text-xl font-bold tracking-tight">Sign In to BloodConnect</h2>
          <p className="text-xs text-red-100 mt-1">Access your donor or requester portal</p>
        </div>

        {/* Quick Demo Logins Bar */}
        <div className="bg-slate-50 border-b border-slate-200 p-4">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-2 text-center">
            ⚡ Quick Demo Logins
          </span>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => fillDemoAccount('admin@bloodconnect.org', 'Admin@123')}
              className="py-1.5 px-2 bg-white hover:bg-red-50 border border-slate-200 hover:border-red-300 rounded-lg text-slate-700 hover:text-red-700 text-xs font-semibold flex items-center justify-center gap-1 transition-all cursor-pointer"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-red-600" />
              <span>Admin</span>
            </button>
            <button
              type="button"
              onClick={() => fillDemoAccount('marcus.v@donor.org', 'Donor@123')}
              className="py-1.5 px-2 bg-white hover:bg-red-50 border border-slate-200 hover:border-red-300 rounded-lg text-slate-700 hover:text-red-700 text-xs font-semibold flex items-center justify-center gap-1 transition-all cursor-pointer"
            >
              <HeartHandshake className="w-3.5 h-3.5 text-red-600" />
              <span>Donor</span>
            </button>
            <button
              type="button"
              onClick={() => fillDemoAccount('requester@bloodconnect.org', 'Requester@123')}
              className="py-1.5 px-2 bg-white hover:bg-red-50 border border-slate-200 hover:border-red-300 rounded-lg text-slate-700 hover:text-red-700 text-xs font-semibold flex items-center justify-center gap-1 transition-all cursor-pointer"
            >
              <UserCheck className="w-3.5 h-3.5 text-red-600" />
              <span>Requester</span>
            </button>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-lg">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.org"
                className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 bg-red-600 hover:bg-red-700 text-white font-bold text-sm rounded-lg transition-colors flex items-center justify-center gap-2 shadow-xs cursor-pointer"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
            <ArrowRight className="w-4 h-4" />
          </button>

          <div className="text-center pt-2">
            <p className="text-xs text-slate-500">
              Don't have an account yet?{' '}
              <button
                type="button"
                onClick={() => onNavigate('register')}
                className="font-bold text-red-600 hover:underline cursor-pointer"
              >
                Register Now
              </button>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};
