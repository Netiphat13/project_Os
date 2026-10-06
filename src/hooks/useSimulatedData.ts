import { useState, useEffect, useCallback } from 'react';
import type { ProcessInfo, SystemMetrics, Alert, HistoryPoint, DeadlockCycle, Resource } from '../types';

const PROCESS_NAMES = [
  'chrome', 'firefox', 'node', 'python3', 'java', 'vscode', 'code',
  'systemd', 'Xorg', 'pulseaudio', 'gnome-shell', 'docker', 'nginx',
  'postgres', 'redis-server', 'mongod', 'apache2', 'sshd', 'cron',
  'dbus-daemon', 'networkd', 'journald', 'udevd', 'polkitd', 'avahi',
  'bluetoothd', 'cupsd', 'rtkit-daemon', 'accounts-daemon', 'thermald',
  'snapd', 'packagekitd', 'fwupd', 'colord', 'gdm', 'lightdm',
  'pipewire', 'wireplumber', 'xdg-desktop', 'tracker-miner', 'baloo',
  'kworker', 'ksoftirqd', 'migration', 'rcu_sched', 'watchdog'
];

const USERS = ['root', 'www-data', 'postgres', 'redis', 'user', 'nobody', 'daemon'];

function randomBetween(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

function generateProcesses(count: number): ProcessInfo[] {
  const processes: ProcessInfo[] = [];
  const statuses: ProcessInfo['status'][] = ['running', 'sleeping', 'sleeping', 'sleeping', 'idle'];
  
  for (let i = 0; i < count; i++) {
    const name = PROCESS_NAMES[Math.floor(Math.random() * PROCESS_NAMES.length)];
    processes.push({
      pid: 100 + i * Math.floor(Math.random() * 10 + 1),
      ppid: Math.floor(Math.random() * 100) + 1,
      name,
      command: `/usr/bin/${name} ${Math.random() > 0.5 ? '--daemon' : ''}`.trim(),
      status: statuses[Math.floor(Math.random() * statuses.length)],
      cpu: randomBetween(0, name === 'chrome' ? 25 : 8),
      memory: randomBetween(10, name === 'chrome' ? 800 : 200),
      threads: Math.floor(randomBetween(1, name === 'chrome' ? 30 : 12)),
      createTime: new Date(Date.now() - Math.random() * 86400000).toISOString(),
      user: USERS[Math.floor(Math.random() * USERS.length)],
    });
  }
  return processes;
}

function generateResources(): Resource[] {
  return [
    { id: 'R1', name: 'Mutex_A', type: 'mutex', totalInstances: 1, availableInstances: 0 },
    { id: 'R2', name: 'Mutex_B', type: 'mutex', totalInstances: 1, availableInstances: 0 },
    { id: 'R3', name: 'Semaphore_X', type: 'semaphore', totalInstances: 3, availableInstances: 1 },
    { id: 'R4', name: 'File_Lock', type: 'file', totalInstances: 1, availableInstances: 0 },
    { id: 'R5', name: 'Network_Sock', type: 'network', totalInstances: 5, availableInstances: 3 },
    { id: 'R6', name: 'Shared_Mem', type: 'memory', totalInstances: 2, availableInstances: 0 },
  ];
}

export function useSimulatedData() {
  const [processes, setProcesses] = useState<ProcessInfo[]>([]);
  const [metrics, setMetrics] = useState<SystemMetrics>({
    cpu: 45,
    memory: 52,
    processCount: 142,
    threadCount: 587,
    uptime: 3600,
    diskUsage: 67,
    networkIn: 1250,
    networkOut: 890,
  });
  const [history, setHistory] = useState<HistoryPoint[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [deadlockStatus, setDeadlockStatus] = useState<DeadlockCycle>({
    processes: [],
    resources: [],
    timestamp: new Date().toISOString(),
    status: 'SAFE',
  });
  const [resources, setResources] = useState<Resource[]>(generateResources());
  const [isMonitoring, setIsMonitoring] = useState(true);

  // Initialize processes
  useEffect(() => {
    setProcesses(generateProcesses(142));
    // Initialize history
    const initialHistory: HistoryPoint[] = [];
    for (let i = 59; i >= 0; i--) {
      initialHistory.push({
        time: `${i}s`,
        cpu: randomBetween(30, 70),
        memory: randomBetween(40, 60),
        processes: Math.floor(randomBetween(120, 160)),
        threads: Math.floor(randomBetween(450, 600)),
      });
    }
    setHistory(initialHistory);
  }, []);

  // Update data every second
  useEffect(() => {
    if (!isMonitoring) return;

    const interval = setInterval(() => {
      // Update metrics with smooth transitions
      setMetrics(prev => ({
        cpu: Math.max(5, Math.min(95, prev.cpu + randomBetween(-5, 5))),
        memory: Math.max(20, Math.min(90, prev.memory + randomBetween(-2, 2))),
        processCount: Math.floor(randomBetween(130, 160)),
        threadCount: Math.floor(randomBetween(500, 650)),
        uptime: prev.uptime + 1,
        diskUsage: Math.max(50, Math.min(85, prev.diskUsage + randomBetween(-0.5, 0.5))),
        networkIn: Math.floor(randomBetween(800, 2000)),
        networkOut: Math.floor(randomBetween(500, 1500)),
      }));

      // Update processes
      setProcesses(prev => prev.map(p => ({
        ...p,
        cpu: Math.max(0, Math.min(100, p.cpu + randomBetween(-3, 3))),
        memory: Math.max(5, p.memory + randomBetween(-10, 10)),
      })));

      // Update history
      setHistory(prev => {
        const newPoint: HistoryPoint = {
          time: 'now',
          cpu: randomBetween(30, 75),
          memory: randomBetween(40, 65),
          processes: Math.floor(randomBetween(130, 160)),
          threads: Math.floor(randomBetween(500, 650)),
        };
        const updated = [...prev.slice(1), newPoint].map((p, i) => ({
          ...p,
          time: `${59 - i}s`,
        }));
        return updated;
      });

      // Random alerts
      if (Math.random() > 0.92) {
        const alertTypes: Alert['type'][] = ['warning', 'critical', 'info'];
        const type = alertTypes[Math.floor(Math.random() * alertTypes.length)];
        const titles = {
          warning: ['High CPU Usage', 'High Memory Usage', 'Disk Space Low'],
          critical: ['Deadlock Detected', 'Process Crashed', 'System Overload'],
          info: ['New Process Started', 'Process Terminated', 'Resource Released'],
        };
        const title = titles[type][Math.floor(Math.random() * titles[type].length)];
        
        setAlerts(prev => [{
          id: Math.random().toString(36).substr(2, 9),
          type,
          title,
          message: `${title} detected at ${new Date().toLocaleTimeString()}`,
          timestamp: new Date().toISOString(),
          process: PROCESS_NAMES[Math.floor(Math.random() * PROCESS_NAMES.length)],
          value: `${Math.floor(randomBetween(70, 99))}%`,
        }, ...prev].slice(0, 50));
      }

      // Update resources
      setResources(prev => prev.map(r => ({
        ...r,
        availableInstances: Math.floor(randomBetween(0, r.totalInstances)),
      })));
    }, 1000);

    return () => clearInterval(interval);
  }, [isMonitoring]);

  const toggleMonitoring = useCallback(() => {
    setIsMonitoring(prev => !prev);
  }, []);

  const triggerDeadlock = useCallback(() => {
    setDeadlockStatus({
      processes: ['P1', 'P2', 'P3'],
      resources: ['R1', 'R2', 'R3'],
      timestamp: new Date().toISOString(),
      status: 'DEADLOCK',
    });
    setAlerts(prev => [{
      id: Math.random().toString(36).substr(2, 9),
      type: 'critical',
      title: 'DEADLOCK DETECTED',
      message: 'Deadlock cycle detected: P1 → P2 → P3 → P1',
      timestamp: new Date().toISOString(),
      process: 'P1, P2, P3',
      value: 'R1, R2, R3',
    }, ...prev]);
  }, []);

  const clearDeadlock = useCallback(() => {
    setDeadlockStatus({
      processes: [],
      resources: [],
      timestamp: new Date().toISOString(),
      status: 'SAFE',
    });
  }, []);

  return {
    processes,
    metrics,
    history,
    alerts,
    deadlockStatus,
    resources,
    isMonitoring,
    toggleMonitoring,
    triggerDeadlock,
    clearDeadlock,
  };
}
