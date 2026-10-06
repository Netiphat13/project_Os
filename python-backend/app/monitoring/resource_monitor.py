"""
OS Guardian - Resource Monitor
Monitors CPU, Memory, Disk, and Network usage
"""
import psutil
import time
from typing import List
from collections import deque


class ResourceMonitor:
    """Monitor system resources"""
    
    def __init__(self, history_size: int = 60):
        self.history_size = history_size
        self.cpu_history = deque(maxlen=history_size)
        self.memory_history = deque(maxlen=history_size)
        self.alerts: List[dict] = []
        self.alert_thresholds = {
            'cpu_warning': 80,
            'memory_warning': 80,
            'disk_warning': 85,
        }
    
    def get_metrics(self) -> dict:
        """Get current system metrics"""
        cpu = psutil.cpu_percent(interval=0.1)
        memory = psutil.virtual_memory().percent
        disk = psutil.disk_usage('/').percent
        
        # Count processes and threads
        process_count = len(psutil.pids())
        thread_count = 0
        for proc in psutil.process_iter(['num_threads']):
            try:
                thread_count += proc.info['num_threads'] or 0
            except (psutil.NoSuchProcess, psutil.AccessDenied):
                continue
        
        # Update history
        self.cpu_history.append(cpu)
        self.memory_history.append(memory)
        
        # Check for alerts
        self._check_alerts(cpu, memory, disk)
        
        return {
            'cpu': round(cpu, 1),
            'memory': round(memory, 1),
            'disk_usage': round(disk, 1),
            'process_count': process_count,
            'thread_count': thread_count,
            'uptime': int(time.time() - psutil.boot_time()),
            'cpu_history': list(self.cpu_history),
            'memory_history': list(self.memory_history),
        }
    
    def get_proc_stat(self) -> dict:
        """Read /proc/stat for CPU information (educational)"""
        try:
            with open('/proc/stat', 'r') as f:
                lines = f.readlines()
            
            cpu_line = lines[0].split()
            return {
                'user': int(cpu_line[1]),
                'nice': int(cpu_line[2]),
                'system': int(cpu_line[3]),
                'idle': int(cpu_line[4]),
                'iowait': int(cpu_line[5]) if len(cpu_line) > 5 else 0,
                'irq': int(cpu_line[6]) if len(cpu_line) > 6 else 0,
                'softirq': int(cpu_line[7]) if len(cpu_line) > 7 else 0,
            }
        except (FileNotFoundError, PermissionError):
            return {'error': 'Cannot read /proc/stat'}
    
    def get_proc_meminfo(self) -> dict:
        """Read /proc/meminfo (educational)"""
        info = {}
        try:
            with open('/proc/meminfo', 'r') as f:
                for line in f:
                    if ':' in line:
                        key, value = line.split(':', 1)
                        info[key.strip()] = value.strip()
        except (FileNotFoundError, PermissionError):
            info['error'] = 'Cannot read /proc/meminfo'
        return info
    
    def _check_alerts(self, cpu: float, memory: float, disk: float):
        """Check if thresholds are exceeded and generate alerts"""
        now = time.strftime('%Y-%m-%d %H:%M:%S')
        
        if cpu > self.alert_thresholds['cpu_warning']:
            self.alerts.insert(0, {
                'type': 'warning',
                'title': 'High CPU Usage',
                'message': f'CPU usage at {cpu:.1f}%',
                'timestamp': now,
                'value': f'{cpu:.1f}%',
            })
        
        if memory > self.alert_thresholds['memory_warning']:
            self.alerts.insert(0, {
                'type': 'warning',
                'title': 'High Memory Usage',
                'message': f'Memory usage at {memory:.1f}%',
                'timestamp': now,
                'value': f'{memory:.1f}%',
            })
        
        if disk > self.alert_thresholds['disk_warning']:
            self.alerts.insert(0, {
                'type': 'warning',
                'title': 'Disk Space Low',
                'message': f'Disk usage at {disk:.1f}%',
                'timestamp': now,
                'value': f'{disk:.1f}%',
            })
        
        # Keep only last 50 alerts
        self.alerts = self.alerts[:50]
    
    def get_alerts(self) -> List[dict]:
        """Get alert history"""
        return self.alerts
