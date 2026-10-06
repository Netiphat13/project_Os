"""
OS Guardian - System Monitor
Combines process and resource monitoring
"""
import psutil
import time
import platform
from typing import Dict


class SystemMonitor:
    """High-level system monitoring"""
    
    def __init__(self):
        self.boot_time = psutil.boot_time()
    
    def get_system_info(self) -> Dict:
        """Get system information"""
        uname = platform.uname()
        
        return {
            'hostname': uname.node,
            'system': uname.system,
            'release': uname.release,
            'version': uname.version,
            'machine': uname.machine,
            'processor': uname.processor,
            'python_version': platform.python_version(),
            'boot_time': time.strftime('%Y-%m-%d %H:%M:%S', 
                                       time.localtime(self.boot_time)),
            'uptime_seconds': int(time.time() - self.boot_time),
        }
    
    def get_cpu_info(self) -> Dict:
        """Get CPU information"""
        return {
            'physical_cores': psutil.cpu_count(logical=False) or 0,
            'total_cores': psutil.cpu_count(logical=True) or 0,
            'freq_current': psutil.cpu_freq().current if psutil.cpu_freq() else 0,
            'freq_max': psutil.cpu_freq().max if psutil.cpu_freq() else 0,
            'usage_per_core': psutil.cpu_percent(percpu=True),
            'usage_total': psutil.cpu_percent(),
        }
    
    def get_memory_info(self) -> Dict:
        """Get memory information"""
        mem = psutil.virtual_memory()
        swap = psutil.swap_memory()
        
        return {
            'total': mem.total,
            'available': mem.available,
            'used': mem.used,
            'percent': mem.percent,
            'swap_total': swap.total,
            'swap_used': swap.used,
            'swap_percent': swap.percent,
        }
    
    def get_disk_info(self) -> Dict:
        """Get disk information"""
        partitions = []
        for partition in psutil.disk_partitions():
            try:
                usage = psutil.disk_usage(partition.mountpoint)
                partitions.append({
                    'device': partition.device,
                    'mountpoint': partition.mountpoint,
                    'fstype': partition.fstype,
                    'total': usage.total,
                    'used': usage.used,
                    'free': usage.free,
                    'percent': usage.percent,
                })
            except PermissionError:
                continue
        
        io = psutil.disk_io_counters()
        
        return {
            'partitions': partitions,
            'io_read_bytes': io.read_bytes if io else 0,
            'io_write_bytes': io.write_bytes if io else 0,
        }
    
    def get_network_info(self) -> Dict:
        """Get network information"""
        io = psutil.net_io_counters()
        interfaces = psutil.net_if_addrs()
        
        interface_info = {}
        for name, addrs in interfaces.items():
            interface_info[name] = [
                {
                    'family': str(addr.family),
                    'address': addr.address,
                    'netmask': addr.netmask,
                }
                for addr in addrs
            ]
        
        return {
            'bytes_sent': io.bytes_sent if io else 0,
            'bytes_recv': io.bytes_recv if io else 0,
            'packets_sent': io.packets_sent if io else 0,
            'packets_recv': io.packets_recv if io else 0,
            'interfaces': interface_info,
        }
