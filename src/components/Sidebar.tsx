import { Shield, LayoutDashboard, Cpu, Activity, AlertTriangle, Bell, Settings, Wifi, WifiOff } from 'lucide-react';
import type { Page } from '../types';

interface SidebarProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
  isMonitoring: boolean;
  onToggleMonitoring: () => void;
}

const navItems: { id: Page; label: string; icon: React.ReactNode }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
  { id: 'processes', label: 'Processes', icon: <Cpu size={20} /> },
  { id: 'resources', label: 'Resources', icon: <Activity size={20} /> },
  { id: 'deadlock', label: 'Deadlocks', icon: <AlertTriangle size={20} /> },
  { id: 'alerts', label: 'Alerts', icon: <Bell size={20} /> },
  { id: 'settings', label: 'Settings', icon: <Settings size={20} /> },
];

export function Sidebar({ currentPage, onNavigate, isMonitoring, onToggleMonitoring }: SidebarProps) {
  return (
    <aside className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col h-screen sticky top-0">
      {/* Logo */}
      <div className="p-6 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <Shield size={22} className="text-white" />
          </div>
          <div>
            <h1 className="text-white font-bold text-lg leading-tight">OS Guardian</h1>
            <p className="text-gray-500 text-xs">Process Monitor</p>
          </div>
        </div>
      </div>

      {/* Status */}
      <div className="px-4 py-3 border-b border-gray-800">
        <button
          onClick={onToggleMonitoring}
          className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-all ${
            isMonitoring 
              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' 
              : 'bg-red-500/10 text-red-400 border border-red-500/30'
          }`}
        >
          <div className="flex items-center gap-2">
            {isMonitoring ? <Wifi size={16} /> : <WifiOff size={16} />}
            <span className="text-sm font-medium">{isMonitoring ? 'MONITORING' : 'PAUSED'}</span>
          </div>
          <div className={`w-2 h-2 rounded-full ${isMonitoring ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'}`} />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map(item => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
              currentPage === item.id
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                : 'text-gray-400 hover:text-white hover:bg-gray-800'
            }`}
          >
            {item.icon}
            {item.label}
          </button>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-800">
        <div className="text-xs text-gray-600 text-center">
          <p>OS Guardian v1.0.0</p>
          <p className="mt-1">Python + FastAPI + WebSocket</p>
        </div>
      </div>
    </aside>
  );
}
