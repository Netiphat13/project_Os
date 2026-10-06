import { useState, useMemo } from 'react';
import { Search, ArrowUpDown, X, ExternalLink } from 'lucide-react';
import type { ProcessInfo } from '../types';

interface ProcessesProps {
  processes: ProcessInfo[];
}

export function Processes({ processes }: ProcessesProps) {
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState<keyof ProcessInfo>('cpu');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedProcess, setSelectedProcess] = useState<ProcessInfo | null>(null);

  const filtered = useMemo(() => {
    let result = processes.filter(p => 
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.pid.toString().includes(search) ||
      p.command.toLowerCase().includes(search.toLowerCase())
    );

    if (statusFilter !== 'all') {
      result = result.filter(p => p.status === statusFilter);
    }

    result.sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortDir === 'asc' ? aVal - bVal : bVal - aVal;
      }
      return sortDir === 'asc' 
        ? String(aVal).localeCompare(String(bVal))
        : String(bVal).localeCompare(String(aVal));
    });

    return result;
  }, [processes, search, sortField, sortDir, statusFilter]);

  const handleSort = (field: keyof ProcessInfo) => {
    if (sortField === field) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('desc');
    }
  };

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = { all: processes.length };
    processes.forEach(p => {
      counts[p.status] = (counts[p.status] || 0) + 1;
    });
    return counts;
  }, [processes]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Process Monitor</h2>
          <p className="text-gray-400 text-sm mt-1">Real-time Linux process monitoring via psutil + /proc</p>
        </div>
        <div className="text-sm text-gray-400">
          <span className="text-white font-bold">{filtered.length}</span> processes
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[250px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="Search by PID, name, or command..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-gray-800/50 border border-gray-700 rounded-lg text-white text-sm placeholder:text-gray-500 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20"
          />
        </div>
        <div className="flex gap-2">
          {['all', 'running', 'sleeping', 'zombie', 'stopped'].map(status => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                statusFilter === status
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                  : 'bg-gray-800/50 text-gray-400 border border-gray-700 hover:border-gray-600'
              }`}
            >
              {status === 'all' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1)}
              <span className="ml-1.5 opacity-60">({statusCounts[status] || 0})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-gray-800/50 backdrop-blur border border-gray-700/50 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-900/50">
              <tr className="text-gray-400">
                {[
                  { key: 'pid', label: 'PID' },
                  { key: 'ppid', label: 'PPID' },
                  { key: 'name', label: 'Name' },
                  { key: 'cpu', label: 'CPU %' },
                  { key: 'memory', label: 'Memory (MB)' },
                  { key: 'threads', label: 'Threads' },
                  { key: 'status', label: 'State' },
                  { key: 'user', label: 'User' },
                ].map(col => (
                  <th
                    key={col.key}
                    className="text-left px-4 py-3 font-medium cursor-pointer hover:text-white transition-colors"
                    onClick={() => handleSort(col.key as keyof ProcessInfo)}
                  >
                    <div className="flex items-center gap-1">
                      {col.label}
                      <ArrowUpDown size={12} className={sortField === col.key ? 'text-emerald-400' : 'text-gray-600'} />
                    </div>
                  </th>
                ))}
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.slice(0, 50).map(proc => (
                <tr
                  key={proc.pid}
                  className="border-t border-gray-800 hover:bg-gray-700/30 transition-colors cursor-pointer"
                  onClick={() => setSelectedProcess(proc)}
                >
                  <td className="px-4 py-3 text-gray-300 font-mono text-xs">{proc.pid}</td>
                  <td className="px-4 py-3 text-gray-400 font-mono text-xs">{proc.ppid}</td>
                  <td className="px-4 py-3 text-white font-medium">{proc.name}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-12 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            proc.cpu > 70 ? 'bg-red-500' : proc.cpu > 40 ? 'bg-amber-500' : 'bg-emerald-500'
                          }`}
                          style={{ width: `${Math.min(100, proc.cpu)}%` }}
                        />
                      </div>
                      <span className="text-gray-300 text-xs w-10">{proc.cpu.toFixed(1)}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-300">{proc.memory.toFixed(0)}</td>
                  <td className="px-4 py-3 text-gray-300">{proc.threads}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      proc.status === 'running' ? 'bg-emerald-500/10 text-emerald-400' :
                      proc.status === 'sleeping' ? 'bg-blue-500/10 text-blue-400' :
                      proc.status === 'zombie' ? 'bg-red-500/10 text-red-400' :
                      'bg-gray-500/10 text-gray-400'
                    }`}>
                      {proc.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-xs">{proc.user}</td>
                  <td className="px-4 py-3">
                    <ExternalLink size={14} className="text-gray-500 hover:text-emerald-400 transition-colors" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length > 50 && (
          <div className="px-4 py-3 border-t border-gray-800 text-sm text-gray-400">
            Showing 50 of {filtered.length} processes
          </div>
        )}
      </div>

      {/* Process Detail Modal */}
      {selectedProcess && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setSelectedProcess(null)}>
          <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 max-w-lg w-full shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Process Details</h3>
              <button onClick={() => setSelectedProcess(null)} className="text-gray-400 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="space-y-3">
              {[
                { label: 'PID', value: selectedProcess.pid },
                { label: 'PPID', value: selectedProcess.ppid },
                { label: 'Name', value: selectedProcess.name },
                { label: 'State', value: selectedProcess.status },
                { label: 'CPU Usage', value: `${selectedProcess.cpu.toFixed(2)}%` },
                { label: 'Memory', value: `${selectedProcess.memory.toFixed(1)} MB` },
                { label: 'Threads', value: selectedProcess.threads },
                { label: 'User', value: selectedProcess.user },
                { label: 'Command', value: selectedProcess.command },
                { label: 'Start Time', value: new Date(selectedProcess.createTime).toLocaleString() },
              ].map(item => (
                <div key={item.label} className="flex justify-between items-center py-2 border-b border-gray-800">
                  <span className="text-gray-400 text-sm">{item.label}</span>
                  <span className="text-white text-sm font-mono">{item.value}</span>
                </div>
              ))}
            </div>
            {/* /proc info */}
            <div className="mt-4 p-3 bg-gray-800/50 rounded-lg border border-gray-700">
              <p className="text-xs text-gray-500 mb-2">Linux /proc paths:</p>
              <div className="space-y-1 text-xs font-mono text-gray-400">
                <p>/proc/{selectedProcess.pid}/status</p>
                <p>/proc/{selectedProcess.pid}/stat</p>
                <p>/proc/{selectedProcess.pid}/cmdline</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
