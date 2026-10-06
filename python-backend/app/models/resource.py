"""
OS Guardian - Resource Models (Pydantic)
"""
from pydantic import BaseModel
from typing import List, Dict


class Resource(BaseModel):
    """System resource definition"""
    id: str
    name: str
    type: str  # mutex, semaphore, file, network, memory
    total_instances: int
    available_instances: int


class ResourceTable(BaseModel):
    """Resource allocation table"""
    resources: List[Resource]
    process_holds: Dict[str, List[str]]  # process -> [resources held]
    process_waits: Dict[str, List[str]]  # process -> [resources waiting for]
