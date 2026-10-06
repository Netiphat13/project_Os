"""
OS Guardian - WebSocket Handler
"""
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
import asyncio
import json
import time

from app.monitoring.resource_monitor import ResourceMonitor
from app.monitoring.process_monitor import ProcessMonitor

router = APIRouter()
resource_monitor = ResourceMonitor()
process_monitor = ProcessMonitor()


class ConnectionManager:
    """Manage WebSocket connections"""
    
    def __init__(self):
        self.active_connections: list[WebSocket] = []
    
    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
    
    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)
    
    async def broadcast(self, message: dict):
        disconnected = []
        for connection in self.active_connections:
            try:
                await connection.send_json(message)
            except Exception:
                disconnected.append(connection)
        
        # Clean up disconnected
        for conn in disconnected:
            if conn in self.active_connections:
                self.active_connections.remove(conn)


manager = ConnectionManager()


async def monitor_loop():
    """Background loop that sends monitoring data every second"""
    while True:
        if manager.active_connections:
            try:
                metrics = resource_monitor.get_metrics()
                data = {
                    "type": "metrics",
                    "cpu": metrics["cpu"],
                    "memory": metrics["memory"],
                    "processes": metrics["process_count"],
                    "threads": metrics["thread_count"],
                    "timestamp": time.time()
                }
                await manager.broadcast(data)
            except Exception as e:
                print(f"Monitor error: {e}")
        
        await asyncio.sleep(1)


@router.websocket("/ws/monitor")
async def websocket_monitor(websocket: WebSocket):
    """WebSocket endpoint for real-time monitoring"""
    await manager.connect(websocket)
    
    # Start monitor loop if first connection
    if len(manager.active_connections) == 1:
        task = asyncio.create_task(monitor_loop())
    
    try:
        while True:
            # Keep connection alive and listen for commands
            data = await websocket.receive_text()
            
            # Handle commands from client
            try:
                command = json.loads(data)
                if command.get("type") == "ping":
                    await websocket.send_json({"type": "pong"})
            except json.JSONDecodeError:
                pass
                
    except WebSocketDisconnect:
        manager.disconnect(websocket)
        if not manager.active_connections:
            task.cancel()
