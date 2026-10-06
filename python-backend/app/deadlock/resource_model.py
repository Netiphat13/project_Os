"""
OS Guardian - Resource Model
Defines the controlled resource allocation model for deadlock analysis
"""
from typing import Dict, List, Set
from dataclasses import dataclass, field


@dataclass
class ResourceInstance:
    """Single instance of a resource"""
    id: str
    name: str
    type: str  # mutex, semaphore, file, network, memory
    held_by: str = None  # Process ID holding this instance


@dataclass
class ResourceModel:
    """
    Controlled Resource Allocation Model for deadlock analysis.
    
    This is a SIMULATION model - it does NOT inspect actual mutex/semaphore
    ownership in Linux processes. Instead, it provides a controlled environment
    for demonstrating deadlock detection algorithms.
    """
    resources: Dict[str, List[ResourceInstance]] = field(default_factory=dict)
    allocation: Dict[str, List[str]] = field(default_factory=dict)  # process -> [resource_ids]
    request: Dict[str, List[str]] = field(default_factory=dict)     # process -> [resource_ids]
    
    def add_resource(self, resource_id: str, name: str, resource_type: str, instances: int = 1):
        """Add a resource with given number of instances"""
        self.resources[resource_id] = [
            ResourceInstance(
                id=f"{resource_id}_{i}",
                name=name,
                type=resource_type
            )
            for i in range(instances)
        ]
    
    def allocate(self, process: str, resource_id: str) -> bool:
        """Allocate a resource instance to a process"""
        if resource_id not in self.resources:
            return False
        
        # Find available instance
        for instance in self.resources[resource_id]:
            if instance.held_by is None:
                instance.held_by = process
                if process not in self.allocation:
                    self.allocation[process] = []
                self.allocation[process].append(resource_id)
                return True
        
        return False  # All instances in use
    
    def request_resource(self, process: str, resource_id: str):
        """Record that a process is requesting a resource"""
        if process not in self.request:
            self.request[process] = []
        if resource_id not in self.request[process]:
            self.request[process].append(resource_id)
    
    def release(self, process: str, resource_id: str):
        """Release a resource held by a process"""
        if resource_id in self.resources:
            for instance in self.resources[resource_id]:
                if instance.held_by == process:
                    instance.held_by = None
                    break
        
        if process in self.allocation:
            self.allocation[process] = [
                r for r in self.allocation[process] if r != resource_id
            ]
        
        if process in self.request:
            self.request[process] = [
                r for r in self.request[process] if r != resource_id
            ]
    
    def get_waiting_processes(self) -> Set[str]:
        """Get set of processes that are waiting for resources"""
        waiting = set()
        for process, requested in self.request.items():
            for resource_id in requested:
                # Check if all instances are held
                if resource_id in self.resources:
                    all_held = all(
                        inst.held_by is not None 
                        for inst in self.resources[resource_id]
                    )
                    if all_held:
                        waiting.add(process)
        return waiting
    
    def get_state_matrix(self) -> Dict:
        """Get the current state as matrices (for Banker's algorithm)"""
        processes = sorted(set(
            list(self.allocation.keys()) + list(self.request.keys())
        ))
        resources = sorted(self.resources.keys())
        
        # Allocation matrix
        allocation = {}
        for p in processes:
            allocation[p] = {}
            for r in resources:
                count = self.allocation.get(p, []).count(r)
                allocation[p][r] = count
        
        # Request matrix
        request = {}
        for p in processes:
            request[p] = {}
            for r in resources:
                count = self.request.get(p, []).count(r)
                request[p][r] = count
        
        # Available vector
        available = {}
        for r in resources:
            total = len(self.resources[r])
            allocated = sum(
                1 for inst in self.resources[r] if inst.held_by is not None
            )
            available[r] = total - allocated
        
        return {
            'processes': processes,
            'resources': resources,
            'allocation': allocation,
            'request': request,
            'available': available,
        }
