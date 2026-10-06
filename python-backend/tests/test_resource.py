"""
OS Guardian - Resource Monitor Tests
"""
import pytest
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.monitoring.resource_monitor import ResourceMonitor


class TestResourceMonitor:
    """Test resource monitoring functionality"""
    
    def setup_method(self):
        self.monitor = ResourceMonitor()
    
    def test_get_metrics(self):
        """Test getting system metrics"""
        metrics = self.monitor.get_metrics()
        
        assert 'cpu' in metrics
        assert 'memory' in metrics
        assert 'process_count' in metrics
        assert 'thread_count' in metrics
        assert 'disk_usage' in metrics
        assert 'uptime' in metrics
    
    def test_cpu_range(self):
        """Test CPU value is in valid range"""
        metrics = self.monitor.get_metrics()
        assert 0 <= metrics['cpu'] <= 100
    
    def test_memory_range(self):
        """Test memory value is in valid range"""
        metrics = self.monitor.get_metrics()
        assert 0 <= metrics['memory'] <= 100
    
    def test_process_count_positive(self):
        """Test process count is positive"""
        metrics = self.monitor.get_metrics()
        assert metrics['process_count'] > 0
    
    def test_thread_count_positive(self):
        """Test thread count is positive"""
        metrics = self.monitor.get_metrics()
        assert metrics['thread_count'] > 0
    
    def test_history_tracking(self):
        """Test that history is tracked"""
        # Get metrics multiple times
        for _ in range(3):
            self.monitor.get_metrics()
        
        metrics = self.monitor.get_metrics()
        assert len(metrics['cpu_history']) > 0
        assert len(metrics['memory_history']) > 0
    
    def test_alert_generation(self):
        """Test alert generation for high usage"""
        # Set low threshold to trigger alerts
        self.monitor.alert_thresholds['cpu_warning'] = 0
        
        metrics = self.monitor.get_metrics()
        
        # Should have generated at least one alert
        assert len(self.monitor.alerts) > 0


if __name__ == '__main__':
    pytest.main([__file__, '-v'])
