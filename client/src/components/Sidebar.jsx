import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Activity,
  FlaskConical,
  Wrench,
  AlertTriangle,
  Cpu,
  FileText,
  Building2,
  Radio,
  Users,
  ClipboardList,
  Bot
} from 'lucide-react';

const Sidebar = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Live Monitoring', path: '/monitoring', icon: Activity },
    { label: 'Chemical Optimization', path: '/chemical-optimization', icon: FlaskConical },
    { label: 'Equipment Health', path: '/equipment', icon: Wrench },
    { label: 'Alerts', path: '/alerts', icon: AlertTriangle },
    { label: 'Digital Twin', path: '/digital-twin', icon: Cpu },
    { label: 'Compliance Reports', path: '/reports', icon: FileText },
    { label: 'Audit Logs', path: '/audit-logs', icon: ClipboardList },
    { label: 'AI Model Status', path: '/ai-model', icon: Bot },
  ];

  const adminItems = [
    { label: 'Plants Management', path: '/admin/plants', icon: Building2 },
    { label: 'Sensors Management', path: '/admin/sensors', icon: Radio },
    { label: 'User Management', path: '/admin/users', icon: Users },
  ];

  return (
    <aside className="w-64 bg-slate-950 border-r border-slate-800 flex flex-col min-h-screen text-slate-300">
      {/* Brand Header */}
      <div className="p-4 border-b border-slate-800 flex items-center space-x-3">
        <div className="p-2 bg-blue-600/20 text-blue-400 rounded-lg border border-blue-500/30">
          <Activity className="w-6 h-6 animate-pulse" />
        </div>
        <div>
          <h1 className="font-bold text-slate-100 text-sm tracking-wide">AQUA-OPTIMA AI</h1>
          <p className="text-[10px] text-blue-400 font-semibold uppercase tracking-wider">Water Plant Twin (Demo)</p>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        <div className="px-3 py-1 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
          Main Console
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white font-semibold shadow-lg shadow-blue-600/20'
                    : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                }`
              }
            >
              <Icon className="w-4 h-4" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}

        {isAdmin && (
          <>
            <div className="px-3 pt-4 pb-1 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Admin Controls
            </div>
            {adminItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center space-x-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-purple-600 text-white font-semibold shadow-lg shadow-purple-600/20'
                        : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                    }`
                  }
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </>
        )}
      </nav>

      {/* Prototype Tag Banner */}
      <div className="p-3 border-t border-slate-800 bg-slate-900/50 text-center">
        <div className="inline-block px-2.5 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded text-[10px] font-medium">
          ⚠️ Academic Prototype Mode
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
