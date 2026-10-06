"""
OS Guardian - API Routes
"""
from fastapi import APIRouter, HTTPException
from typing import List
import psutil
import time

from app.models.process import ProcessInfo, ProcessDetail
from app.models.resource import Resource, ResourceTable
from app.models.deadlock import DeadlockStatus
from app.monitoring.process_monitor import ProcessMonitor
from app.monitoring.resource_monitor import ResourceMonitor
from app.deadlock.detector import DeadlockDetector

router = APIRouter()

# Initialize monitors
process_monitor = ProcessMonitor()
resource_monitor = ResourceMonitor()
deadlock_detector = DeadlockDetector()


@router.get("/system")
async def get_system_metrics():
    """Get current system metrics"""
    return resource_monitor.get_metrics()


@router.get("/processes", response_model=List[ProcessInfo])
async def get_processes():
    """Get list of all processes"""
    return process_monitor.get_all_processes()


@router.get("/processes/{pid}", response_model=ProcessDetail)
async def get_process(pid: int):
    """Get details of a specific process"""
    try:
        process = process_monitor.get_process(pid)
        if process is None:
            raise HTTPException(status_code=404, detail=f"Process {pid} not found")
        return process
    except psutil.NoSuchProcess:
        raise HTTPException(status_code=404, detail=f"Process {pid} not found")
    except psutil.AccessDenied:
        raise HTTPException(status_code=403, detail=f"Access denied to process {pid}")


@router.get("/resources", response_model=ResourceTable)
async def get_resources():
    """Get resource allocation table"""
    return deadlock_detector.get_resource_table()


@router.get("/deadlock/status", response_model=DeadlockStatus)
async def get_deadlock_status():
    """Get current deadlock detection status"""
    return deadlock_detector.detect()


@router.get("/deadlock/graph")
async def get_deadlock_graph():
    """Get resource allocation graph data"""
    return deadlock_detector.get_graph_data()


@router.get("/deadlock/test/{scenario_id}")
async def run_deadlock_scenario(scenario_id: str):
    """Run a deadlock test scenario"""
    return deadlock_detector.run_scenario(scenario_id)


@router.get("/alerts")
async def get_alerts():
    """Get alert history"""
    return resource_monitor.get_alerts()


@router.get("/proc/{pid}/status")
async def get_proc_status(pid: int):
    """Read /proc/[pid]/status (educational)"""
    try:
        with open(f'/proc/{pid}/status', 'r') as f:
            content = f.read()
        return {"pid": pid, "path": f"/proc/{pid}/status", "content": content}
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail=f"Process {pid} not found in /proc")
    except PermissionError:
        raise HTTPException(status_code=403, detail=f"Permission denied for /proc/{pid}/status")


@router.get("/proc/stat")
async def get_proc_stat():
    """Read /proc/stat (educational)"""
    try:
        with open('/proc/stat', 'r') as f:
            content = f.read()
        return {"path": "/proc/stat", "content": content}
    except (FileNotFoundError, PermissionError) as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/proc/meminfo")
async def get_proc_meminfo():
    """Read /proc/meminfo (educational)"""
    try:
        with open('/proc/meminfo', 'r') as f:
            content = f.read()
        return {"path": "/proc/meminfo", "content": content}
    except (FileNotFoundError, PermissionError) as e:
        raise HTTPException(status_code=500, detail=str(e))
