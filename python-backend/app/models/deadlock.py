"""
OS Guardian - Deadlock Models (Pydantic)
"""
from pydantic import BaseModel
from typing import List, Optional


class DeadlockStatus(BaseModel):
    """Current deadlock detection status"""
    status: str  # SAFE, DEADLOCK, WARNING
    cycle: List[str] = []
    resources: List[str] = []
    timestamp: str
    detection_time_ms: float = 0.0
    processes_involved: List[str] = []


class DeadlockResult(BaseModel):
    """Result of a deadlock test scenario"""
    scenario_id: str
    status: str
    expected: Optional[str] = None
    cycle: List[str] = []
    resources: List[str] = []
    detection_time_ms: float = 0.0
    correct: Optional[bool] = None
    message: Optional[str] = None
