export interface ProcessInfo {
  pid: number;
  ppid: number;
  name: string;
  command: string;
  status: 'running' | 'sleeping' | 'zombie' | 'stopped' | 'idle';
  cpu: number;
  memory: number;
  threads: number;
  createTime: string;
  user: string;
}

export interface SystemMetrics {
  cpu: number;
  memory: number;
  processCount: number;
  threadCount: number;
  uptime: number;
  diskUsage: number;
  networkIn: number;
  networkOut: number;
}

export interface Resource {
  id: string;
  name: string;
  type: 'mutex' | 'semaphore' | 'file' | 'network' | 'memory';
  totalInstances: number;
  availableInstances: number;
}

export interface DeadlockCycle {
  processes: string[];
  resources: string[];
  timestamp: string;
  status: 'SAFE' | 'DEADLOCK' | 'WARNING';
}

export interface Alert {
  id: string;
  type: 'warning' | 'critical' | 'info';
  title: string;
  message: string;
  timestamp: string;
  process?: string;
  value?: string;
}

export interface HistoryPoint {
  time: string;
  cpu: number;
  memory: number;
  processes: number;
  threads: number;
}

export type Page = 'dashboard' | 'processes' | 'resources' | 'deadlock' | 'alerts' | 'settings';
