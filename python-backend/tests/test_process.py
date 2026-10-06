"""
OS Guardian - Process Monitor Tests
"""
import pytest
import psutil
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.monitoring.process_monitor import ProcessMonitor


class TestProcessMonitor:
    """Test process monitoring functionality"""
    
    def setup_method(self):
        self.monitor = ProcessMonitor()
    
    def test_get_all_processes(self):
        """Test that we can list running processes"""
        processes = self.monitor.get_all_processes()
        assert len(processes) > 0
        
        # Check process structure
        proc = processes[0]
        assert proc.pid > 0
        assert proc.name != ''
        assert proc.status in ['running', 'sleeping', 'zombie', 'stopped', 'idle']
    
    def test_detect_current_pid(self):
        """Test detecting current process"""
        current_pid = os.getpid()
        process = self.monitor.get_process(current_pid)
        
        assert process is not None
        assert process.pid == current_pid
    
    def test_cpu_calculation(self):
        """Test CPU usage calculation"""
        processes = self.monitor.get_all_processes()
        
        # At least some processes should have CPU data
        for proc in processes[:10]:
            assert proc.cpu >= 0.0
    
    def test_memory_calculation(self):
        """Test memory usage calculation"""
        processes = self.monitor.get_all_processes()
        
        for proc in processes[:10]:
            assert proc.memory >= 0.0
    
    def test_thread_count(self):
        """Test thread count reporting"""
        processes = self.monitor.get_all_processes()
        
        for proc in processes[:10]:
            assert proc.threads >= 1
    
    def test_nonexistent_process(self):
        """Test handling of non-existent process"""
        process = self.monitor.get_process(999999)
        assert process is None
    
    def test_process_has_required_fields(self):
        """Test that all required fields are present"""
        processes = self.monitor.get_all_processes()
        proc = processes[0]
        
        assert hasattr(proc, 'pid')
        assert hasattr(proc, 'ppid')
        assert hasattr(proc, 'name')
        assert hasattr(proc, 'status')
        assert hasattr(proc, 'cpu')
        assert hasattr(proc, 'memory')
        assert hasattr(proc, 'threads')
        assert hasattr(proc, 'create_time')
        assert hasattr(proc, 'user')


if __name__ == '__main__':
    pytest.main([__file__, '-v'])
