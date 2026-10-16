import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Activity, Lock, Mail, ShieldAlert, CheckCircle2 } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      if (err.message && (err.message.includes('Network Error') || err.message.includes('timeout'))) {
        setError('Cannot reach server. If Render free tier is waking up, please wait ~30 seconds and retry.');
      } else {
        setError(err.response?.data?.message || 'Login failed. Please verify credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  const fillDemoUser = (demoEmail) => {
    setEmail(demoEmail);
    setPassword('password123');
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
      {/* Background Graphic Accent */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-slate-950 to-slate-950 pointer-events-none"></div>

      <div className="w-full max-w-md z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex p-3 bg-blue-600/10 border border-blue-500/20 rounded-2xl text-blue-400 mb-3">
            <Activity className="w-10 h-10 animate-pulse" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-wide">AI Water Treatment System</h1>
          <p className="text-xs text-slate-400 mt-1">Smart Plant Monitoring & Chemical Optimization Prototype</p>
        </div>

        {/* Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl">
          <h2 className="text-lg font-semibold text-slate-200 mb-4">Sign In to Console</h2>

          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-xs text-red-400 flex items-center space-x-2">
              <ShieldAlert className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="operator@example.com"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-2.5 rounded-lg text-sm transition-colors shadow-lg shadow-blue-600/25 disabled:opacity-50"
            >
              {loading ? 'Authenticating...' : 'Sign In'}
            </button>
          </form>

          {/* Quick Demo Login Presets */}
          <div className="mt-6 pt-4 border-t border-slate-800">
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Quick Demo Login Presets:
            </p>
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <button
                onClick={() => fillDemoUser('operator@example.com')}
                className="p-2 bg-slate-950 hover:bg-blue-900/30 border border-slate-800 rounded-lg text-blue-400 font-medium transition-colors"
              >
                Operator
              </button>
              <button
                onClick={() => fillDemoUser('admin@example.com')}
                className="p-2 bg-slate-950 hover:bg-purple-900/30 border border-slate-800 rounded-lg text-purple-400 font-medium transition-colors"
              >
                Admin
              </button>
              <button
                onClick={() => fillDemoUser('auditor@example.com')}
                className="p-2 bg-slate-950 hover:bg-emerald-900/30 border border-slate-800 rounded-lg text-emerald-400 font-medium transition-colors"
              >
                Auditor
              </button>
            </div>
            <p className="text-[10px] text-slate-500 text-center mt-2">Demo Password: password123</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
