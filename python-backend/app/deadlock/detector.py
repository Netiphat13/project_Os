"""
OS Guardian - Deadlock Detector
Implements Resource Allocation Graph and Wait-for Graph with cycle detection
"""
import networkx as nx
import time
from typing import List, Dict, Optional, Tuple
from app.models.deadlock import DeadlockStatus, DeadlockResult
from app.models.resource import Resource, ResourceTable


class DeadlockDetector:
    """Detect deadlocks using graph cycle detection"""
    
    def __init__(self):
        # Resource Allocation Graph
        self.rag = nx.DiGraph()
        
        # Define resources
        self.resources: Dict[str, Resource] = {
            'R1': Resource(id='R1', name='Mutex_A', type='mutex', total_instances=1, available_instances=0),
            'R2': Resource(id='R2', name='Mutex_B', type='mutex', total_instances=1, available_instances=0),
            'R3': Resource(id='R3', name='Semaphore_X', type='semaphore', total_instances=3, available_instances=1),
            'R4': Resource(id='R4', name='File_Lock', type='file', total_instances=1, available_instances=0),
            'R5': Resource(id='R5', name='Network_Sock', type='network', total_instances=5, available_instances=3),
            'R6': Resource(id='R6', name='Shared_Mem', type='memory', total_instances=2, available_instances=0),
        }
        
        # Process-Resource assignments
        # process_holds[process] = [resources held]
        self.process_holds: Dict[str, List[str]] = {
            'P1': ['R1'],
            'P2': ['R2'],
            'P3': ['R4'],
        }
        
        # process_waits[process] = [resources waiting for]
        self.process_waits: Dict[str, List[str]] = {
            'P1': ['R2'],
            'P2': ['R1'],
            'P3': [],
        }
        
        self._build_graph()
    
    def _build_graph(self):
        """Build Resource Allocation Graph from current state"""
        self.rag.clear()
        
        # Add process nodes
        for process in set(list(self.process_holds.keys()) + list(self.process_waits.keys())):
            self.rag.add_node(process, node_type='process')
        
        # Add resource nodes
        for resource_id in self.resources:
            self.rag.add_node(resource_id, node_type='resource')
        
        # Add "holds" edges (Process -> Resource)
        for process, resources in self.process_holds.items():
            for resource in resources:
                self.rag.add_edge(process, resource, edge_type='holds')
        
        # Add "waits" edges (Resource -> Process)
        for process, resources in self.process_waits.items():
            for resource in resources:
                self.rag.add_edge(resource, process, edge_type='waits')
    
    def _build_wait_for_graph(self) -> nx.DiGraph:
        """Convert RAG to Wait-for Graph"""
        wfg = nx.DiGraph()
        
        # For each process waiting for a resource
        for process, waited_resources in self.process_waits.items():
            for resource in waited_resources:
                # Find who holds this resource
                for holder, held_resources in self.process_holds.items():
                    if resource in held_resources and holder != process:
                        wfg.add_edge(process, holder)
        
        return wfg
    
    def detect(self) -> DeadlockStatus:
        """Detect deadlock using cycle detection on Wait-for Graph"""
        start_time = time.perf_counter()
        
        self._build_graph()
        wfg = self._build_wait_for_graph()
        
        # Find cycles using NetworkX
        try:
            cycles = list(nx.simple_cycles(wfg))
        except Exception:
            cycles = []
        
        elapsed = time.perf_counter() - start_time
        
        if cycles:
            # Deadlock found
            cycle = cycles[0]
            cycle_with_return = cycle + [cycle[0]]  # Close the cycle
            
            # Find involved resources
            involved_resources = set()
            for i in range(len(cycle)):
                process = cycle[i]
                next_process = cycle[(i + 1) % len(cycle)]
                for resource in self.process_waits.get(process, []):
                    if resource in self.process_holds.get(next_process, []):
                        involved_resources.add(resource)
            
            return DeadlockStatus(
                status='DEADLOCK',
                cycle=cycle_with_return,
                resources=list(involved_resources),
                timestamp=time.strftime('%Y-%m-%d %H:%M:%S'),
                detection_time_ms=round(elapsed * 1000, 3),
                processes_involved=cycle,
            )
        else:
            return DeadlockStatus(
                status='SAFE',
                cycle=[],
                resources=[],
                timestamp=time.strftime('%Y-%m-%d %H:%M:%S'),
                detection_time_ms=round(elapsed * 1000, 3),
                processes_involved=[],
            )
    
    def get_resource_table(self) -> ResourceTable:
        """Get current resource allocation table"""
        return ResourceTable(
            resources=list(self.resources.values()),
            process_holds=self.process_holds,
            process_waits=self.process_waits,
        )
    
    def get_graph_data(self) -> dict:
        """Get graph data for visualization"""
        self._build_graph()
        wfg = self._build_wait_for_graph()
        
        return {
            'rag': {
                'nodes': [
                    {'id': n, 'type': self.rag.nodes[n].get('node_type', 'unknown')}
                    for n in self.rag.nodes()
                ],
                'edges': [
                    {'source': u, 'target': v, 'type': d.get('edge_type', 'unknown')}
                    for u, v, d in self.rag.edges(data=True)
                ],
            },
            'wfg': {
                'nodes': [{'id': n} for n in wfg.nodes()],
                'edges': [{'source': u, 'target': v} for u, v in wfg.edges()],
            },
        }
    
    def run_scenario(self, scenario_id: str) -> DeadlockResult:
        """Run a predefined deadlock test scenario"""
        scenarios = {
            'safe-1': {
                'holds': {'P1': ['R1']},
                'waits': {'P1': [], 'P2': ['R1']},
                'expected': 'SAFE',
            },
            'deadlock-2': {
                'holds': {'P1': ['R1'], 'P2': ['R2']},
                'waits': {'P1': ['R2'], 'P2': ['R1']},
                'expected': 'DEADLOCK',
            },
            'deadlock-3': {
                'holds': {'P1': ['R1'], 'P2': ['R2'], 'P3': ['R3']},
                'waits': {'P1': ['R2'], 'P2': ['R3'], 'P3': ['R1']},
                'expected': 'DEADLOCK',
            },
            'safe-4': {
                'holds': {'P1': ['R1'], 'P2': ['R2']},
                'waits': {'P1': [], 'P2': ['R1'], 'P3': ['R2']},
                'expected': 'SAFE',
            },
            'deadlock-5': {
                'holds': {'P1': ['R1'], 'P2': ['R2'], 'P3': ['R3'], 'P4': ['R4'], 'P5': ['R5']},
                'waits': {'P1': ['R2'], 'P2': ['R3'], 'P3': ['R4'], 'P4': ['R5'], 'P5': ['R1']},
                'expected': 'DEADLOCK',
            },
        }
        
        if scenario_id not in scenarios:
            return DeadlockResult(
                scenario_id=scenario_id,
                status='ERROR',
                message=f'Unknown scenario: {scenario_id}',
                detection_time_ms=0,
            )
        
        scenario = scenarios[scenario_id]
        
        # Apply scenario
        self.process_holds = scenario['holds']
        self.process_waits = scenario['waits']
        
        # Run detection
        status = self.detect()
        
        return DeadlockResult(
            scenario_id=scenario_id,
            status=status.status,
            expected=scenario['expected'],
            cycle=status.cycle,
            resources=status.resources,
            detection_time_ms=status.detection_time_ms,
            correct=status.status == scenario['expected'],
        )
    
    def performance_test(self, process_counts: List[int] = None) -> List[dict]:
        """Run performance tests with varying graph sizes"""
        if process_counts is None:
            process_counts = [10, 50, 100, 500]
        
        results = []
        
        for count in process_counts:
            # Create a chain with a cycle at the end
            holds = {}
            waits = {}
            resources_needed = min(count, len(self.resources))
            
            for i in range(count):
                p_name = f'P{i}'
                r_idx = i % resources_needed
                r_name = f'R{r_idx + 1}'
                
                holds[p_name] = [r_name]
                
                if i < count - 1:
                    next_r = f'R{(i + 1) % resources_needed + 1}'
                    waits[p_name] = [next_r]
                else:
                    # Last process waits for first resource (creates cycle)
                    waits[p_name] = ['R1']
            
            self.process_holds = holds
            self.process_waits = waits
            
            start = time.perf_counter()
            status = self.detect()
            elapsed = time.perf_counter() - start
            
            results.append({
                'process_count': count,
                'detection_time_ms': round(elapsed * 1000, 3),
                'status': status.status,
                'cycle_length': len(status.cycle),
            })
        
        return results
