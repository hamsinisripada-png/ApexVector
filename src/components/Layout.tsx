import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTelemetryContext } from '../contexts/TelemetryContext';
import { supabase } from '../lib/supabase';
import AlertToast from './AlertToast';
import StatusBar from './StatusBar';
import {
  Zap, LayoutDashboard, TrendingUp, BarChart3, Eye, Radio, Settings, LogOut, Clock
} from 'lucide-react';

const navItems = [
  { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/strategy', icon: TrendingUp, label: 'Strategy' },
  { path: '/analytics', icon: BarChart3, label: 'Analytics' },
  { path: '/predictive', icon: Eye, label: 'Predictive' },
  { path: '/command-center', icon: Radio, label: 'Command' },
  { path: '/sessions', icon: Clock, label: 'Sessions' },
  { path: '/settings', icon: Settings, label: 'Settings' },
];

// Bottom nav only shows first 5 items + settings due to space
const mobileNavItems = [
  { path: '/dashboard', icon: LayoutDashboard, label: 'Dash' },
  { path: '/strategy', icon: TrendingUp, label: 'Strategy' },
  { path: '/analytics', icon: BarChart3, label: 'Analytics' },
  { path: '/command-center', icon: Radio, label: 'Command' },
  { path: '/settings', icon: Settings, label: 'Settings' },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { profile } = useAuth();
  const { alerts, dismissAlert } = useTelemetryContext();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="flex h-screen bg-slate-950 overflow-hidden">
      {/* Global alert toasts */}
      <AlertToast alerts={alerts} dismiss={dismissAlert} />

      {/* Sidebar — desktop only */}
      <aside className="hidden md:flex flex-col w-60 bg-slate-900 border-r border-slate-800 shrink-0">
        <div className="h-14 px-4 flex items-center gap-2.5 border-b border-slate-800">
          <div className="w-7 h-7 bg-red-600 rounded-lg flex items-center justify-center shrink-0">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-white tracking-tight">ApexVector</span>
        </div>

        {profile && (
          <div className="px-4 py-3 border-b border-slate-800">
            <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Team</p>
            <p className="text-white font-semibold text-sm truncate">{profile.team_name || 'My Team'}</p>
            {profile.car_number && (
              <span className="inline-flex items-center mt-1 px-2 py-0.5 rounded bg-red-600/20 text-red-400 text-[11px] font-bold">
                #{profile.car_number}
              </span>
            )}
          </div>
        )}

        <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
          {navItems.map(({ path, icon: Icon, label }) => (
            <button
              key={path}
              onClick={() => navigate(path)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive(path)
                  ? 'bg-red-600/15 text-red-400 border border-red-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Icon size={16} className="shrink-0" />
              {label}
            </button>
          ))}
        </nav>

        <button
          onClick={handleLogout}
          className="mx-2 mb-3 flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-500 hover:text-red-400 hover:bg-red-500/5 text-sm font-medium transition-all"
        >
          <LogOut size={16} />
          Logout
        </button>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile header */}
        <header className="md:hidden h-12 px-4 flex items-center justify-between bg-slate-900 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-red-600 rounded-md flex items-center justify-center">
              <Zap className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-bold text-white text-sm">ApexVector</span>
          </div>
          {profile?.team_name && (
            <span className="text-slate-400 text-xs truncate max-w-[140px]">{profile.team_name}</span>
          )}
        </header>

        {/* Status bar */}
        <StatusBar />

        <main className="flex-1 overflow-auto">{children}</main>

        {/* Mobile bottom nav */}
        <nav className="md:hidden shrink-0 h-14 bg-slate-900 border-t border-slate-800 flex items-stretch">
          {mobileNavItems.map(({ path, icon: Icon, label }) => (
            <button
              key={path}
              onClick={() => navigate(path)}
              className={`flex-1 flex flex-col items-center justify-center gap-0.5 transition-all ${
                isActive(path) ? 'text-red-400' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <Icon size={18} />
              <span className="text-[9px] font-medium">{label}</span>
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
}
