"""
OS Guardian - Deadlock Detection Tests
"""
import pytest
import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.deadlock.detector import DeadlockDetector


class TestDeadlockDetection:
    """Test deadlock detection algorithm"""
    
    def setup_method(self):
        """Set up test fixtures"""
        self.detector = DeadlockDetector()
    
    def test_no_deadlock_linear(self):
        """Scenario 1: P1 -> P2 (No cycle, SAFE)"""
        self.detector.process_holds = {'P1': ['R1']}
        self.detector.process_waits = {'P1': [], 'P2': ['R1']}
        
        result = self.detector.detect()
        assert result.status == 'SAFE'
        assert result.cycle == []
    
    def test_simple_deadlock(self):
        """Scenario 2: P1 -> P2 -> P1 (DEADLOCK)"""
        self.detector.process_holds = {'P1': ['R1'], 'P2': ['R2']}
        self.detector.process_waits = {'P1': ['R2'], 'P2': ['R1']}
        
        result = self.detector.detect()
        assert result.status == 'DEADLOCK'
        assert len(result.cycle) >= 2
    
    def test_three_process_deadlock(self):
        """Scenario 3: P1 -> P2 -> P3 -> P1 (DEADLOCK)"""
        self.detector.process_holds = {'P1': ['R1'], 'P2': ['R2'], 'P3': ['R3']}
        self.detector.process_waits = {'P1': ['R2'], 'P2': ['R3'], 'P3': ['R1']}
        
        result = self.detector.detect()
        assert result.status == 'DEADLOCK'
        assert 'P1' in result.cycle
        assert 'P2' in result.cycle
        assert 'P3' in result.cycle
    
    def test_safe_complex(self):
        """Scenario 4: Complex safe graph"""
        self.detector.process_holds = {'P1': ['R1'], 'P2': ['R2']}
        self.detector.process_waits = {'P1': [], 'P2': ['R1'], 'P3': ['R2']}
        
        result = self.detector.detect()
        assert result.status == 'SAFE'
    
    def test_large_deadlock(self):
        """Scenario 5: 5-process cycle"""
        self.detector.process_holds = {
            'P1': ['R1'], 'P2': ['R2'], 'P3': ['R3'], 
            'P4': ['R4'], 'P5': ['R5']
        }
        self.detector.process_waits = {
            'P1': ['R2'], 'P2': ['R3'], 'P3': ['R4'], 
            'P4': ['R5'], 'P5': ['R1']
        }
        
        result = self.detector.detect()
        assert result.status == 'DEADLOCK'
        assert len(result.cycle) == 6  # 5 processes + return to start
    
    def test_detection_performance(self):
        """Test detection performance with 500 processes"""
        import time
        
        # Create 500-process chain with cycle
        count = 500
        holds = {}
        waits = {}
        
        for i in range(count):
            p = f'P{i}'
            holds[p] = [f'R{i % 6 + 1}']
            if i < count - 1:
                waits[p] = [f'R{(i + 1) % 6 + 1}']
            else:
                waits[p] = ['R1']  # Creates cycle
        
        self.detector.process_holds = holds
        self.detector.process_waits = waits
        
        start = time.perf_counter()
        result = self.detector.detect()
        elapsed = time.perf_counter() - start
        
        assert result.status == 'DEADLOCK'
        # Should detect within 100ms for 500 processes
        assert elapsed < 0.1, f"Detection took {elapsed:.3f}s (expected < 0.1s)"
    
    def test_scenario_runner(self):
        """Test predefined scenario runner"""
        # Test safe scenario
        result = self.detector.run_scenario('safe-1')
        assert result.status == 'SAFE'
        assert result.correct == True
        
        # Test deadlock scenario
        result = self.detector.run_scenario('deadlock-2')
        assert result.status == 'DEADLOCK'
        assert result.correct == True
    
    def test_wait_for_graph(self):
        """Test Wait-for Graph construction"""
        self.detector.process_holds = {'P1': ['R1'], 'P2': ['R2']}
        self.detector.process_waits = {'P1': ['R2'], 'P2': ['R1']}
        
        wfg = self.detector._build_wait_for_graph()
        
        # WFG should have edges P1->P2 and P2->P1
        assert wfg.has_edge('P1', 'P2')
        assert wfg.has_edge('P2', 'P1')


if __name__ == '__main__':
    pytest.main([__file__, '-v'])
