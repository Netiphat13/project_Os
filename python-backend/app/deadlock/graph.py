"""
OS Guardian - Graph Utilities
Resource Allocation Graph and Wait-for Graph construction
"""
import networkx as nx
from typing import Dict, List, Tuple, Set


class ResourceAllocationGraph:
    """
    Resource Allocation Graph (RAG)
    
    Nodes:
    - Processes (circles): P1, P2, P3, ...
    - Resources (squares): R1, R2, R3, ...
    
    Edges:
    - Process -> Resource: "request edge" (process is waiting)
    - Resource -> Process: "assignment edge" (resource is allocated to process)
    """
    
    def __init__(self):
        self.graph = nx.DiGraph()
    
    def add_process(self, process_id: str):
        """Add a process node"""
        self.graph.add_node(process_id, node_type='process')
    
    def add_resource(self, resource_id: str, instances: int = 1):
        """Add a resource node"""
        self.graph.add_node(resource_id, node_type='resource', instances=instances)
    
    def add_request_edge(self, process: str, resource: str):
        """Add request edge: Process -> Resource (process waits for resource)"""
        self.graph.add_edge(process, resource, edge_type='request')
    
    def add_assignment_edge(self, resource: str, process: str):
        """Add assignment edge: Resource -> Process (resource assigned to process)"""
        self.graph.add_edge(resource, process, edge_type='assignment')
    
    def to_wait_for_graph(self) -> 'WaitForGraph':
        """
        Convert RAG to Wait-for Graph (WFG)
        
        In WFG:
        - Only process nodes exist
        - Edge P_i -> P_j means "P_i is waiting for a resource held by P_j"
        """
        wfg = WaitForGraph()
        
        # Add all process nodes
        for node in self.graph.nodes():
            if self.graph.nodes[node].get('node_type') == 'process':
                wfg.add_process(node)
        
        # For each request edge P -> R
        for u, v, data in self.graph.edges(data=True):
            if data.get('edge_type') == 'request':
                process_waiting = u
                resource = v
                
                # Find who holds this resource (assignment edges from R)
                for r, p, rdata in self.graph.edges(data=True):
                    if r == resource and rdata.get('edge_type') == 'assignment':
                        process_holding = p
                        if process_waiting != process_holding:
                            wfg.add_edge(process_waiting, process_holding)
        
        return wfg
    
    def get_visualization_data(self) -> Dict:
        """Get data for graph visualization"""
        nodes = []
        edges = []
        
        for node in self.graph.nodes():
            node_data = self.graph.nodes[node]
            nodes.append({
                'id': node,
                'type': node_data.get('node_type', 'unknown'),
            })
        
        for u, v, data in self.graph.edges(data=True):
            edges.append({
                'source': u,
                'target': v,
                'type': data.get('edge_type', 'unknown'),
            })
        
        return {'nodes': nodes, 'edges': edges}


class WaitForGraph:
    """
    Wait-for Graph (WFG)
    
    Only contains process nodes.
    Edge P_i -> P_j means "P_i is waiting for a resource held by P_j"
    
    A cycle in WFG indicates a DEADLOCK.
    """
    
    def __init__(self):
        self.graph = nx.DiGraph()
    
    def add_process(self, process_id: str):
        """Add a process node"""
        self.graph.add_node(process_id)
    
    def add_edge(self, from_process: str, to_process: str):
        """Add wait-for edge"""
        self.graph.add_edge(from_process, to_process)
    
    def has_deadlock(self) -> bool:
        """Check if there is a deadlock (cycle in WFG)"""
        try:
            cycles = list(nx.simple_cycles(self.graph))
            return len(cycles) > 0
        except Exception:
            return False
    
    def find_cycles(self) -> List[List[str]]:
        """Find all cycles (deadlocks) in the graph"""
        try:
            return list(nx.simple_cycles(self.graph))
        except Exception:
            return []
    
    def find_deadlocked_processes(self) -> Set[str]:
        """Find all processes involved in deadlocks"""
        deadlocked = set()
        for cycle in self.find_cycles():
            deadlocked.update(cycle)
        return deadlocked
    
    def get_visualization_data(self) -> Dict:
        """Get data for graph visualization"""
        nodes = [{'id': n} for n in self.graph.nodes()]
        edges = [{'source': u, 'target': v} for u, v in self.graph.edges()]
        return {'nodes': nodes, 'edges': edges}
