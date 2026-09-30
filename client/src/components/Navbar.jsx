import React from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, User as UserIcon, ShieldAlert } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();

  const getRoleBadge = (role) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/30';
      case 'OPERATOR':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
      case 'AUDITOR':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      default:
        return 'bg-slate-700 text-slate-300';
    }
  };

  return (
    <header className="bg-slate-950 border-b border-slate-800 px-6 py-3 flex items-center justify-between">
      {/* Live System Status */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2 text-xs">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          <span className="text-slate-300 font-medium">Sensor Simulator Active</span>
        </div>
        <div className="text-xs text-slate-500 border-l border-slate-800 pl-4 hidden md:block">
          Plant: <span className="text-slate-300 font-medium">Central Treatment Facility</span>
        </div>
      </div>

      {/* User Info & Actions */}
      <div className="flex items-center space-x-4">
        {user && (
          <div className="flex items-center space-x-3 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg">
            <UserIcon className="w-4 h-4 text-slate-400" />
            <div className="text-right">
              <div className="text-xs font-semibold text-slate-200">{user.name}</div>
              <div className="text-[10px] text-slate-400">{user.email}</div>
            </div>
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${getRoleBadge(user.role)}`}>
              {user.role}
            </span>
          </div>
        )}

        <button
          onClick={logout}
          className="flex items-center space-x-1.5 text-xs text-slate-400 hover:text-red-400 px-3 py-1.5 rounded-lg hover:bg-slate-900 transition-colors"
          title="Logout"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );
};

export default Navbar;
