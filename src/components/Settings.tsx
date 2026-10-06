import { Settings as SettingsIcon, Monitor, Clock, Bell, Database, Shield } from 'lucide-react';

export function Settings() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Settings</h2>
        <p className="text-gray-400 text-sm mt-1">Configure OS Guardian monitoring parameters</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monitoring Settings */}
        <div className="bg-gray-800/50 backdrop-blur border border-gray-700/50 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 bg-emerald-500/10 rounded-lg flex items-center justify-center">
              <Monitor size={20} className="text-emerald-400" />
            </div>
            <div>
              <h3 className="text-white font-semibold">Monitoring</h3>
              <p className="text-gray-400 text-xs">Update intervals and thresholds</p>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <label className="text-gray-400 text-sm block mb-1.5">Update Interval</label>
              <select className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-emerald-500/50">
                <option>1 second</option>
                <option>2 seconds</option>
                <option>5 seconds</option>
                <option>10 seconds</option>
              </select>
            </div>
            <div>
              <label className="text-gray-400 text-sm block mb-1.5">History Buffer</label>
              <select className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-emerald-500/50">
                <option>60 seconds</option>
                <option>120 seconds</option>
                <option>300 seconds</option>
              </select>
            </div>
            <div>
              <label className="text-gray-400 text-sm block mb-1.5">Max Processes Tracked</label>
              <input type="number" defaultValue={500} className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-emerald-500/50" />
            </div>
          </div>
        </div>

        {/* Alert Thresholds */}
        <div className="bg-gray-800/50 backdrop-blur border border-gray-700/50 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 bg-amber-500/10 rounded-lg flex items-center justify-center">
              <Bell size={20} className="text-amber-400" />
            </div>
            <div>
              <h3 className="text-white font-semibold">Alert Thresholds</h3>
              <p className="text-gray-400 text-xs">Configure when alerts trigger</p>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <label className="text-gray-400 text-sm block mb-1.5">CPU Warning (%)</label>
              <input type="range" min={50} max={95} defaultValue={80} className="w-full" />
              <span className="text-gray-300 text-xs">80%</span>
            </div>
            <div>
              <label className="text-gray-400 text-sm block mb-1.5">Memory Warning (%)</label>
              <input type="range" min={50} max={95} defaultValue={80} className="w-full" />
              <span className="text-gray-300 text-xs">80%</span>
            </div>
            <div>
              <label className="text-gray-400 text-sm block mb-1.5">Disk Warning (%)</label>
              <input type="range" min={50} max={95} defaultValue={85} className="w-full" />
              <span className="text-gray-300 text-xs">85%</span>
            </div>
          </div>
        </div>

        {/* Deadlock Settings */}
        <div className="bg-gray-800/50 backdrop-blur border border-gray-700/50 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 bg-red-500/10 rounded-lg flex items-center justify-center">
              <Shield size={20} className="text-red-400" />
            </div>
            <div>
              <h3 className="text-white font-semibold">Deadlock Detection</h3>
              <p className="text-gray-400 text-xs">Detection algorithm settings</p>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <label className="text-gray-400 text-sm block mb-1.5">Algorithm</label>
              <select className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-emerald-500/50">
                <option>DFS Cycle Detection</option>
                <option>NetworkX simple_cycles</option>
                <option>Banker's Algorithm</option>
              </select>
            </div>
            <div>
              <label className="text-gray-400 text-sm block mb-1.5">Detection Interval</label>
              <select className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-emerald-500/50">
                <option>Every 5 seconds</option>
                <option>Every 10 seconds</option>
                <option>Every 30 seconds</option>
                <option>Manual only</option>
              </select>
            </div>
            <div>
              <label className="text-gray-400 text-sm block mb-1.5">Max Graph Nodes</label>
              <input type="number" defaultValue={500} className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-emerald-500/50" />
            </div>
          </div>
        </div>

        {/* Data Settings */}
        <div className="bg-gray-800/50 backdrop-blur border border-gray-700/50 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 bg-indigo-500/10 rounded-lg flex items-center justify-center">
              <Database size={20} className="text-indigo-400" />
            </div>
            <div>
              <h3 className="text-white font-semibold">Data & Storage</h3>
              <p className="text-gray-400 text-xs">History and logging configuration</p>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <label className="text-gray-400 text-sm block mb-1.5">Storage Backend</label>
              <select className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-emerald-500/50">
                <option>SQLite (local)</option>
                <option>In-Memory Only</option>
              </select>
            </div>
            <div>
              <label className="text-gray-400 text-sm block mb-1.5">Log Retention</label>
              <select className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-emerald-500/50">
                <option>24 hours</option>
                <option>7 days</option>
                <option>30 days</option>
              </select>
            </div>
            <div>
              <label className="text-gray-400 text-sm block mb-1.5">WebSocket Port</label>
              <input type="number" defaultValue={8000} className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-emerald-500/50" />
            </div>
          </div>
        </div>
      </div>

      {/* Backend Info */}
      <div className="bg-gray-800/50 backdrop-blur border border-gray-700/50 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 bg-cyan-500/10 rounded-lg flex items-center justify-center">
            <Clock size={20} className="text-cyan-400" />
          </div>
          <div>
            <h3 className="text-white font-semibold">Backend Configuration</h3>
            <p className="text-gray-400 text-xs">Python FastAPI + WebSocket server</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-3 bg-gray-900/50 rounded-lg">
            <p className="text-gray-400 text-xs mb-1">API Server</p>
            <p className="text-white font-mono text-sm">http://localhost:8000</p>
          </div>
          <div className="p-3 bg-gray-900/50 rounded-lg">
            <p className="text-gray-400 text-xs mb-1">WebSocket</p>
            <p className="text-white font-mono text-sm">ws://localhost:8000/ws/monitor</p>
          </div>
          <div className="p-3 bg-gray-900/50 rounded-lg">
            <p className="text-gray-400 text-xs mb-1">Desktop Mode</p>
            <p className="text-white font-mono text-sm">pywebview (native window)</p>
          </div>
        </div>
        <div className="mt-4 p-3 bg-gray-900/50 rounded-lg border border-gray-700">
          <p className="text-gray-400 text-xs mb-2 flex items-center gap-2">
            <SettingsIcon size={14} />
            Run command:
          </p>
          <code className="text-emerald-400 text-sm font-mono">python run.py</code>
        </div>
      </div>
    </div>
  );
}
