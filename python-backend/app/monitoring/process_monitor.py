"""
OS Guardian - Process Monitor
Uses psutil and /proc for process monitoring
"""
import psutil
import time
from typing import List, Optional
from app.models.process import ProcessInfo, ProcessDetail


class ProcessMonitor:
    """Monitor system processes using psutil"""
    
    def __init__(self):
        self._last_cpu_times = {}
        self._last_check_time = time.time()
    
    def get_all_processes(self) -> List[ProcessInfo]:
        """Get information about all running processes"""
        processes = []
        
        for proc in psutil.process_iter(['pid', 'ppid', 'name', 'status', 
                                          'cpu_percent', 'memory_info', 
                                          'num_threads', 'create_time', 'username']):
            try:
                info = proc.info
                processes.append(ProcessInfo(
                    pid=info['pid'],
                    ppid=info['ppid'] or 0,
                    name=info['name'] or 'unknown',
                    status=info['status'] or 'unknown',
                    cpu=info['cpu_percent'] or 0.0,
                    memory=round((info['memory_info'].rss if info['memory_info'] else 0) / (1024 * 1024), 1),
                    threads=info['num_threads'] or 0,
                    create_time=time.strftime('%Y-%m-%d %H:%M:%S', 
                                              time.localtime(info['create_time'] or 0)),
                    user=info['username'] or 'unknown',
                ))
            except (psutil.NoSuchProcess, psutil.AccessDenied, psutil.ZombieProcess):
                # Process disappeared or access denied - skip silently
                continue
        
        return sorted(processes, key=lambda p: p.cpu, reverse=True)
    
    def get_process(self, pid: int) -> Optional[ProcessDetail]:
        """Get detailed information about a specific process"""
        try:
            proc = psutil.Process(pid)
            
            with proc.oneshot():
                return ProcessDetail(
                    pid=proc.pid,
                    ppid=proc.ppid(),
                    name=proc.name(),
                    status=proc.status(),
                    cpu=proc.cpu_percent(interval=0.1),
                    memory=round(proc.memory_info().rss / (1024 * 1024), 1),
                    threads=proc.num_threads(),
                    command=' '.join(proc.cmdline()) if proc.cmdline() else 'N/A',
                    create_time=time.strftime('%Y-%m-%d %H:%M:%S',
                                              time.localtime(proc.create_time())),
                    user=proc.username(),
                    # /proc information (educational)
                    proc_status_path=f"/proc/{pid}/status",
                    proc_stat_path=f"/proc/{pid}/stat",
                    proc_cmdline_path=f"/proc/{pid}/cmdline",
                )
        except (psutil.NoSuchProcess, psutil.AccessDenied, psutil.ZombieProcess):
            return None
    
    def get_proc_info(self, pid: int) -> dict:
        """Read process info from /proc filesystem (educational comparison)"""
        info = {}
        
        try:
            # /proc/[pid]/status
            with open(f'/proc/{pid}/status', 'r') as f:
                for line in f:
                    if ':' in line:
                        key, value = line.split(':', 1)
                        info[key.strip()] = value.strip()
        except (FileNotFoundError, PermissionError):
            info['error'] = 'Cannot read /proc status'
        
        try:
            # /proc/[pid]/cmdline
            with open(f'/proc/{pid}/cmdline', 'r') as f:
                info['cmdline'] = f.read().replace('\x00', ' ').strip()
        except (FileNotFoundError, PermissionError):
            info['cmdline'] = 'N/A'
        
        return info
