"""
OS Guardian - Process Models (Pydantic)
"""
from pydantic import BaseModel
from typing import Optional


class ProcessInfo(BaseModel):
    """Basic process information"""
    pid: int
    ppid: int
    name: str
    status: str
    cpu: float
    memory: float  # in MB
    threads: int
    create_time: str
    user: str


class ProcessDetail(ProcessInfo):
    """Detailed process information"""
    command: str = ""
    proc_status_path: str = ""
    proc_stat_path: str = ""
    proc_cmdline_path: str = ""
