import { Bell, AlertTriangle, AlertCircle, Info, Trash2 } from 'lucide-react';
import type { Alert } from '../types';

interface AlertsProps {
  alerts: Alert[];
}

export function Alerts({ alerts }: AlertsProps) {
  const getIcon = (type: Alert['type']) => {
    switch (type) {
      case 'critical': return <AlertCircle size={18} className="text-red-400" />;
      case 'warning': return <AlertTriangle size={18} className="text-amber-400" />;
      case 'info': return <Info size={18} className="text-blue-400" />;
    }
  };

  const getColor = (type: Alert['type']) => {
    switch (type) {
      case 'critical': return 'border-red-500/30 bg-red-500/5';
      case 'warning': return 'border-amber-500/30 bg-amber-500/5';
      case 'info': return 'border-blue-500/30 bg-blue-500/5';
    }
  };

  const criticalCount = alerts.filter(a => a.type === 'critical').length;
  const warningCount = alerts.filter(a => a.type === 'warning').length;
  const infoCount = alerts.filter(a => a.type === 'info').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Alert Center</h2>
          <p className="text-gray-400 text-sm mt-1">System alerts and notifications</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-gray-400 hover:text-white transition-colors text-sm">
          <Trash2 size={16} />
          Clear All
        </button>
      </div>

      {/* Alert Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-4 flex items-center gap-4">
          <div className="w-12 h-12 bg-red-500/10 rounded-lg flex items-center justify-center">
            <AlertCircle size={24} className="text-red-400" />
          </div>
          <div>
            <p className="text-2xl font-bold text-red-400">{criticalCount}</p>
            <p className="text-gray-400 text-sm">Critical Alerts</p>
          </div>
        </div>
        <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4 flex items-center gap-4">
          <div className="w-12 h-12 bg-amber-500/10 rounded-lg flex items-center justify-center">
            <AlertTriangle size={24} className="text-amber-400" />
          </div>
          <div>
            <p className="text-2xl font-bold text-amber-400">{warningCount}</p>
            <p className="text-gray-400 text-sm">Warnings</p>
          </div>
        </div>
        <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-4 flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center">
            <Info size={24} className="text-blue-400" />
          </div>
          <div>
            <p className="text-2xl font-bold text-blue-400">{infoCount}</p>
            <p className="text-gray-400 text-sm">Info</p>
          </div>
        </div>
      </div>

      {/* Alert List */}
      <div className="space-y-3">
        {alerts.length === 0 ? (
          <div className="bg-gray-800/50 backdrop-blur border border-gray-700/50 rounded-xl p-12 text-center">
            <Bell size={48} className="text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">No alerts yet</p>
            <p className="text-gray-500 text-sm mt-1">Alerts will appear here when system thresholds are exceeded</p>
          </div>
        ) : (
          alerts.map(alert => (
            <div
              key={alert.id}
              className={`border rounded-xl p-4 transition-all hover:scale-[1.01] ${getColor(alert.type)}`}
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5">{getIcon(alert.type)}</div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className={`font-semibold text-sm ${
                      alert.type === 'critical' ? 'text-red-400' :
                      alert.type === 'warning' ? 'text-amber-400' :
                      'text-blue-400'
                    }`}>
                      {alert.type === 'critical' ? '🔴 CRITICAL' : alert.type === 'warning' ? '⚠️ WARNING' : 'ℹ️ INFO'}
                      {' — '}{alert.title}
                    </h4>
                    <span className="text-gray-500 text-xs">
                      {new Date(alert.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-gray-400 text-sm mt-1">{alert.message}</p>
                  {alert.process && (
                    <div className="flex items-center gap-4 mt-2 text-xs">
                      <span className="text-gray-500">Process: <span className="text-gray-300 font-mono">{alert.process}</span></span>
                      {alert.value && <span className="text-gray-500">Value: <span className="text-gray-300 font-mono">{alert.value}</span></span>}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
