import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from 'recharts';
import { Cpu, MemoryStick, HardDrive, Wifi } from 'lucide-react';
import type { SystemMetrics, HistoryPoint } from '../types';

interface ResourcesProps {
  metrics: SystemMetrics;
  history: HistoryPoint[];
}

function GaugeChart({ value, label, color, icon }: { value: number; label: string; color: string; icon: React.ReactNode }) {
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const progress = (value / 100) * circumference * 0.75;
  const rotation = -225;

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-40 h-40">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 140 140">
          <circle
            cx="70"
            cy="70"
            r={radius}
            fill="none"
            stroke="#374151"
            strokeWidth="10"
            strokeDasharray={`${circumference * 0.75} ${circumference * 0.25}`}
            strokeLinecap="round"
            transform={`rotate(${rotation} 70 70)`}
          />
          <circle
            cx="70"
            cy="70"
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth="10"
            strokeDasharray={`${progress} ${circumference - progress}`}
            strokeLinecap="round"
            transform={`rotate(${rotation} 70 70)`}
            className="transition-all duration-500"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {icon}
          <span className="text-2xl font-bold text-white mt-1">{value.toFixed(1)}%</span>
        </div>
      </div>
      <span className="text-gray-400 text-sm mt-2 font-medium">{label}</span>
    </div>
  );
}

export function Resources({ metrics, history }: ResourcesProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Resource Monitor</h2>
        <p className="text-gray-400 text-sm mt-1">System resource utilization with 60-second history</p>
      </div>

      {/* Gauge Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gray-800/50 backdrop-blur border border-gray-700/50 rounded-xl p-6 flex flex-col items-center">
          <GaugeChart
            value={metrics.cpu}
            label="CPU Usage"
            color={metrics.cpu > 80 ? '#ef4444' : metrics.cpu > 60 ? '#f59e0b' : '#10b981'}
            icon={<Cpu size={24} className="text-blue-400" />}
          />
        </div>
        <div className="bg-gray-800/50 backdrop-blur border border-gray-700/50 rounded-xl p-6 flex flex-col items-center">
          <GaugeChart
            value={metrics.memory}
            label="Memory Usage"
            color={metrics.memory > 80 ? '#ef4444' : metrics.memory > 60 ? '#f59e0b' : '#a855f7'}
            icon={<MemoryStick size={24} className="text-purple-400" />}
          />
        </div>
        <div className="bg-gray-800/50 backdrop-blur border border-gray-700/50 rounded-xl p-6 flex flex-col items-center">
          <GaugeChart
            value={metrics.diskUsage}
            label="Disk Usage"
            color={metrics.diskUsage > 80 ? '#ef4444' : metrics.diskUsage > 60 ? '#f59e0b' : '#06b6d4'}
            icon={<HardDrive size={24} className="text-cyan-400" />}
          />
        </div>
        <div className="bg-gray-800/50 backdrop-blur border border-gray-700/50 rounded-xl p-6 flex flex-col items-center">
          <GaugeChart
            value={Math.min(100, (metrics.networkIn + metrics.networkOut) / 40)}
            label="Network I/O"
            color="#6366f1"
            icon={<Wifi size={24} className="text-indigo-400" />}
          />
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-gray-800/50 backdrop-blur border border-gray-700/50 rounded-xl p-5">
          <h3 className="text-white font-semibold mb-4">CPU Usage Over Time</h3>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={history}>
              <defs>
                <linearGradient id="cpuGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="time" stroke="#6b7280" fontSize={10} />
              <YAxis stroke="#6b7280" fontSize={10} domain={[0, 100]} />
              <Tooltip
                contentStyle={{ background: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                labelStyle={{ color: '#9ca3af' }}
              />
              <Area type="monotone" dataKey="cpu" stroke="#3b82f6" strokeWidth={2} fill="url(#cpuGradient)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-gray-800/50 backdrop-blur border border-gray-700/50 rounded-xl p-5">
          <h3 className="text-white font-semibold mb-4">Memory Usage Over Time</h3>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={history}>
              <defs>
                <linearGradient id="memGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#a855f7" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#a855f7" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="time" stroke="#6b7280" fontSize={10} />
              <YAxis stroke="#6b7280" fontSize={10} domain={[0, 100]} />
              <Tooltip
                contentStyle={{ background: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                labelStyle={{ color: '#9ca3af' }}
              />
              <Area type="monotone" dataKey="memory" stroke="#a855f7" strokeWidth={2} fill="url(#memGradient)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Process & Thread Count Chart */}
      <div className="bg-gray-800/50 backdrop-blur border border-gray-700/50 rounded-xl p-5">
        <h3 className="text-white font-semibold mb-4">Process & Thread Count</h3>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={history}>
            <defs>
              <linearGradient id="procGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="threadGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#f59e0b" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="time" stroke="#6b7280" fontSize={10} />
            <YAxis stroke="#6b7280" fontSize={10} />
            <Tooltip
              contentStyle={{ background: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
              labelStyle={{ color: '#9ca3af' }}
            />
            <Area type="monotone" dataKey="processes" stroke="#10b981" strokeWidth={2} fill="url(#procGradient)" dot={false} name="Processes" />
            <Area type="monotone" dataKey="threads" stroke="#f59e0b" strokeWidth={2} fill="url(#threadGradient)" dot={false} name="Threads" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* /proc info */}
      <div className="bg-gray-800/50 backdrop-blur border border-gray-700/50 rounded-xl p-5">
        <h3 className="text-white font-semibold mb-3">Linux /proc Data Sources</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[
            { path: '/proc/stat', desc: 'CPU time, context switches, boot time' },
            { path: '/proc/meminfo', desc: 'Memory usage, buffers, cache, swap' },
            { path: '/proc/loadavg', desc: 'System load averages (1, 5, 15 min)' },
            { path: '/proc/diskstats', desc: 'Disk I/O statistics per device' },
            { path: '/proc/net/dev', desc: 'Network interface statistics' },
            { path: '/proc/uptime', desc: 'System uptime and idle time' },
          ].map(item => (
            <div key={item.path} className="flex items-start gap-3 p-3 bg-gray-900/50 rounded-lg">
              <code className="text-emerald-400 text-xs font-mono whitespace-nowrap">{item.path}</code>
              <span className="text-gray-400 text-xs">{item.desc}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
