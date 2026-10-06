import { Cpu, MemoryStick, Users, GitBranch, TrendingUp, TrendingDown, Shield, AlertTriangle } from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer, Tooltip } from 'recharts';
import type { SystemMetrics, HistoryPoint, ProcessInfo, DeadlockCycle } from '../types';

interface DashboardProps {
  metrics: SystemMetrics;
  history: HistoryPoint[];
  processes: ProcessInfo[];
  deadlockStatus: DeadlockCycle;
}

function MetricCard({ title, value, unit, icon, color, trend }: {
  title: string;
  value: number | string;
  unit: string;
  icon: React.ReactNode;
  color: string;
  trend?: 'up' | 'down';
}) {
  return (
    <div className="bg-gray-800/50 backdrop-blur border border-gray-700/50 rounded-xl p-5 hover:border-gray-600/50 transition-all">
      <div className="flex items-center justify-between mb-3">
        <span className="text-gray-400 text-sm font-medium">{title}</span>
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${color}`}>
          {icon}
        </div>
      </div>
      <div className="flex items-end gap-2">
        <span className="text-3xl font-bold text-white">{typeof value === 'number' ? Math.round(value) : value}</span>
        <span className="text-gray-500 text-sm mb-1">{unit}</span>
        {trend && (
          <span className={`ml-auto mb-1 ${trend === 'up' ? 'text-red-400' : 'text-emerald-400'}`}>
            {trend === 'up' ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
          </span>
        )}
      </div>
    </div>
  );
}

function MiniChart({ data, dataKey, color }: { data: HistoryPoint[]; dataKey: keyof HistoryPoint; color: string }) {
  return (
    <ResponsiveContainer width="100%" height={60}>
      <AreaChart data={data.slice(-20)}>
        <defs>
          <linearGradient id={`gradient-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.3} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <Tooltip
          contentStyle={{ background: '#1f2937', border: '1px solid #374151', borderRadius: '8px', fontSize: '12px' }}
          labelStyle={{ color: '#9ca3af' }}
        />
        <Area
          type="monotone"
          dataKey={dataKey}
          stroke={color}
          strokeWidth={2}
          fill={`url(#gradient-${dataKey})`}
          dot={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function Dashboard({ metrics, history, processes, deadlockStatus }: DashboardProps) {
  const topProcesses = [...processes]
    .sort((a, b) => b.cpu - a.cpu)
    .slice(0, 8);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">System Overview</h2>
          <p className="text-gray-400 text-sm mt-1">Real-time system monitoring dashboard</p>
        </div>
        <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${
          deadlockStatus.status === 'DEADLOCK'
            ? 'bg-red-500/10 text-red-400 border border-red-500/30'
            : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
        }`}>
          {deadlockStatus.status === 'DEADLOCK' ? (
            <>
              <AlertTriangle size={16} />
              <span>DEADLOCK DETECTED</span>
            </>
          ) : (
            <>
              <Shield size={16} />
              <span>SYSTEM SECURE</span>
            </>
          )}
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="CPU Usage"
          value={metrics.cpu}
          unit="%"
          icon={<Cpu size={18} className="text-blue-400" />}
          color="bg-blue-500/10"
          trend={metrics.cpu > 70 ? 'up' : 'down'}
        />
        <MetricCard
          title="Memory Usage"
          value={metrics.memory}
          unit="%"
          icon={<MemoryStick size={18} className="text-purple-400" />}
          color="bg-purple-500/10"
          trend={metrics.memory > 70 ? 'up' : 'down'}
        />
        <MetricCard
          title="Processes"
          value={metrics.processCount}
          unit="active"
          icon={<Users size={18} className="text-emerald-400" />}
          color="bg-emerald-500/10"
        />
        <MetricCard
          title="Threads"
          value={metrics.threadCount}
          unit="total"
          icon={<GitBranch size={18} className="text-amber-400" />}
          color="bg-amber-500/10"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-gray-800/50 backdrop-blur border border-gray-700/50 rounded-xl p-5">
          <h3 className="text-white font-semibold mb-3">CPU History (60s)</h3>
          <MiniChart data={history} dataKey="cpu" color="#3b82f6" />
        </div>
        <div className="bg-gray-800/50 backdrop-blur border border-gray-700/50 rounded-xl p-5">
          <h3 className="text-white font-semibold mb-3">Memory History (60s)</h3>
          <MiniChart data={history} dataKey="memory" color="#a855f7" />
        </div>
      </div>

      {/* Process Table + Deadlock Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-gray-800/50 backdrop-blur border border-gray-700/50 rounded-xl p-5">
          <h3 className="text-white font-semibold mb-4">Top Processes by CPU</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-400 border-b border-gray-700">
                  <th className="text-left pb-3 font-medium">PID</th>
                  <th className="text-left pb-3 font-medium">Name</th>
                  <th className="text-left pb-3 font-medium">CPU</th>
                  <th className="text-left pb-3 font-medium">Memory</th>
                  <th className="text-left pb-3 font-medium">State</th>
                </tr>
              </thead>
              <tbody>
                {topProcesses.map(proc => (
                  <tr key={proc.pid} className="border-b border-gray-800 hover:bg-gray-700/30 transition-colors">
                    <td className="py-2.5 text-gray-300 font-mono text-xs">{proc.pid}</td>
                    <td className="py-2.5 text-white font-medium">{proc.name}</td>
                    <td className="py-2.5">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${proc.cpu > 70 ? 'bg-red-500' : proc.cpu > 40 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                            style={{ width: `${Math.min(100, proc.cpu)}%` }}
                          />
                        </div>
                        <span className="text-gray-300 text-xs">{proc.cpu.toFixed(1)}%</span>
                      </div>
                    </td>
                    <td className="py-2.5 text-gray-300">{proc.memory.toFixed(0)} MB</td>
                    <td className="py-2.5">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        proc.status === 'running' ? 'bg-emerald-500/10 text-emerald-400' :
                        proc.status === 'sleeping' ? 'bg-blue-500/10 text-blue-400' :
                        proc.status === 'zombie' ? 'bg-red-500/10 text-red-400' :
                        'bg-gray-500/10 text-gray-400'
                      }`}>
                        {proc.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Deadlock Status */}
        <div className="bg-gray-800/50 backdrop-blur border border-gray-700/50 rounded-xl p-5">
          <h3 className="text-white font-semibold mb-4">Deadlock Status</h3>
          <div className={`p-4 rounded-lg border ${
            deadlockStatus.status === 'DEADLOCK'
              ? 'bg-red-500/5 border-red-500/30'
              : 'bg-emerald-500/5 border-emerald-500/30'
          }`}>
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-3 h-3 rounded-full ${
                deadlockStatus.status === 'DEADLOCK' ? 'bg-red-500 animate-pulse' : 'bg-emerald-500'
              }`} />
              <span className={`font-bold text-lg ${
                deadlockStatus.status === 'DEADLOCK' ? 'text-red-400' : 'text-emerald-400'
              }`}>
                {deadlockStatus.status === 'DEADLOCK' ? 'DEADLOCK' : 'NO DEADLOCK'}
              </span>
            </div>
            {deadlockStatus.status === 'DEADLOCK' && (
              <div className="text-sm text-gray-400 space-y-1">
                <p>Cycle: {deadlockStatus.processes.join(' → ')} → {deadlockStatus.processes[0]}</p>
                <p>Resources: {deadlockStatus.resources.join(', ')}</p>
              </div>
            )}
            {deadlockStatus.status === 'SAFE' && (
              <p className="text-sm text-gray-400">All processes are running safely. No circular dependencies detected.</p>
            )}
          </div>

          {/* System Info */}
          <div className="mt-4 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Uptime</span>
              <span className="text-white font-mono">{Math.floor(metrics.uptime / 3600)}h {Math.floor((metrics.uptime % 3600) / 60)}m</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Disk Usage</span>
              <span className="text-white font-mono">{metrics.diskUsage.toFixed(1)}%</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Network In</span>
              <span className="text-white font-mono">{(metrics.networkIn / 1024).toFixed(1)} MB/s</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Network Out</span>
              <span className="text-white font-mono">{(metrics.networkOut / 1024).toFixed(1)} MB/s</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
