# 🛡 OS Guardian

## Real-time Process Monitoring and Deadlock Detection System

OS Guardian เป็นแอปพลิเคชันสำหรับ monitoring กระบวนการทำงานของ Linux แบบ real-time พร้อมระบบตรวจจับ Deadlock ประกอบด้วย:

- **Web Dashboard** (React + Tailwind CSS) - UI แสดงผลแบบ modern dark theme
- **Python Backend** (FastAPI + WebSocket) - Backend สำหรับ monitoring และ deadlock detection
- **Desktop Mode** (pywebview) - แสดงเป็น desktop application

![OS Guardian](https://img.shields.io/badge/OS%20Guardian-v1.0.0-emerald)
![Python](https://img.shields.io/badge/Python-3.11+-blue)
![React](https://img.shields.io/badge/React-18-blue)
![License](https://img.shields.io/badge/License-MIT-green)

---

## ✨ Features

- ✅ **Real-time Process Monitoring** - ตรวจสอบ processes ทั้งหมดแบบ real-time
- ✅ **CPU/Memory Monitoring** - แสดง CPU และ Memory usage แบบ live
- ✅ **Thread Monitoring** - ติดตาม thread count ของแต่ละ process
- ✅ **Linux /proc Integration** - อ่านข้อมูลจาก /proc filesystem
- ✅ **Deadlock Detection** - ตรวจจับ deadlock ด้วย Resource Allocation Graph
- ✅ **Wait-for Graph** - แปลง RAG เป็น Wait-for Graph
- ✅ **Cycle Detection** - ใช้ DFS/NetworkX หา cycle ใน graph
- ✅ **Alert System** - แจ้งเตือนเมื่อ CPU/Memory สูงเกิน threshold
- ✅ **WebSocket Real-time** - ส่งข้อมูลแบบ real-time ผ่าน WebSocket
- ✅ **Desktop Application** - แสดงเป็น desktop app ด้วย pywebview
- ✅ **Performance Testing** - ทดสอบ performance กับ 10-500 processes

---

## 🏗 Architecture

```
┌─────────────────────────────────────────────┐
│              OS GUARDIAN APP                │
│                                             │
│              pywebview                      │
│                  │                          │
│                  ▼                          │
│        ┌─────────────────────┐              │
│        │   Web Dashboard     │              │
│        │ HTML/CSS/JavaScript │              │
│        └──────────┬──────────┘              │
│                   │                         │
│              WebSocket/API                 │
│                   │                         │
│        ┌──────────▼──────────┐              │
│        │     FastAPI         │              │
│        │     Backend         │              │
│        └──────────┬──────────┘              │
│                   │                         │
│       ┌───────────┼───────────┐             │
│       ▼           ▼           ▼             │
│    Process     Resource    Deadlock         │
│    Monitor     Monitor     Detector         │
│       │           │           │             │
│       └───────────┼───────────┘             │
│                   ▼                         │
│                Linux                       │
│              /proc + OS                    │
└─────────────────────────────────────────────┘
```

---

## 📁 Project Structure

```
os-guardian/
│
├── app/
│   ├── main.py                  # FastAPI app entry point
│   │
│   ├── api/
│   │   ├── routes.py            # REST API endpoints
│   │   └── websocket.py         # WebSocket handler
│   │
│   ├── monitoring/
│   │   ├── process_monitor.py   # Process monitoring (psutil)
│   │   ├── resource_monitor.py  # CPU/Memory/Disk monitoring
│   │   └── system_monitor.py    # System-level monitoring
│   │
│   ├── deadlock/
│   │   ├── resource_model.py    # Resource allocation model
│   │   ├── graph.py             # RAG & Wait-for Graph
│   │   └── detector.py          # Cycle detection algorithm
│   │
│   ├── models/
│   │   ├── process.py           # Pydantic models
│   │   ├── resource.py
│   │   └── deadlock.py
│   │
│   └── utils/
│       └── permissions.py       # Permission handling
│
├── web/
│   ├── index.html               # Dashboard HTML
│   ├── css/
│   │   └── style.css            # Dashboard styles
│   └── js/
│       ├── dashboard.js         # Dashboard logic
│       ├── processes.js         # Process page
│       ├── resources.js         # Resource page
│       └── deadlock.js          # Deadlock page
│
├── tests/
│   ├── test_process.py          # Process monitor tests
│   ├── test_resource.py         # Resource monitor tests
│   └── test_deadlock.py         # Deadlock detection tests
│
├── data/
│   └── test_scenarios/          # Deadlock test scenarios
│
├── requirements.txt
├── run.py                       # Main entry point
├── README.md
└── .gitignore
```

---

## 🔧 Installation

### Prerequisites

- **Python 3.11+**
- **Linux/WSL2 Ubuntu** (required for /proc access)
- **pip** (Python package manager)

### Step 1: Clone or Create Project

```bash
mkdir os-guardian
cd os-guardian
```

### Step 2: Create Virtual Environment

```bash
python3 -m venv .venv
source .venv/bin/activate
```

### Step 3: Install Dependencies

```bash
pip install -r requirements.txt
```

### requirements.txt

```
fastapi==0.104.1
uvicorn[standard]==0.24.0
psutil==5.9.6
networkx==3.2.1
pywebview==4.4.1
jinja2==3.1.2
pydantic==2.5.2
websockets==12.0
```

Optional dependencies:

```
plotly==5.18.0
pytest==7.4.3
```

### Step 4: Verify Installation

```bash
python -c "import psutil, fastapi, networkx; print('✅ All dependencies installed')"
```

---

## 🚀 Running the Application

### Method 1: Full Desktop Application (Recommended)

```bash
python run.py
```

This will:
1. Start the FastAPI backend server
2. Start the WebSocket server
3. Open the dashboard in a native desktop window (pywebview)

### Method 2: Web Dashboard Only

```bash
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

Then open: `http://localhost:8000`

### Method 3: Development Mode

```bash
# Terminal 1: Start backend
python -m uvicorn app.main:app --reload --port 8000

# Terminal 2: Open dashboard in browser
xdg-open http://localhost:8000
```

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/system` | System metrics (CPU, Memory, etc.) |
| GET | `/api/processes` | List all processes |
| GET | `/api/processes/{pid}` | Process details |
| GET | `/api/resources` | Resource allocation table |
| GET | `/api/deadlock/status` | Current deadlock status |
| GET | `/api/deadlock/graph` | Resource allocation graph |
| GET | `/api/alerts` | Alert history |
| WS | `/ws/monitor` | Real-time monitoring stream |

### Example API Response

```json
// GET /api/system
{
  "cpu": 62.4,
  "memory": 48.2,
  "process_count": 126,
  "thread_count": 487,
  "uptime": 3600,
  "disk_usage": 67.5
}

// GET /api/deadlock/status
{
  "status": "SAFE",
  "cycle": [],
  "resources": [],
  "timestamp": "2024-01-15T15:42:31"
}
```

---

## 🔍 Deadlock Detection

### How It Works

1. **Resource Allocation Graph (RAG)**
   - Processes (circles) → Resources (squares)
   - "holds" edges: Process holds resource
   - "waits" edges: Process waits for resource

2. **Wait-for Graph (WFG)**
   - Convert RAG to process-to-process edges
   - P1 → P2 means "P1 waits for a resource held by P2"

3. **Cycle Detection**
   - Use DFS to find cycles in WFG
   - Cycle found = DEADLOCK
   - No cycle = SAFE

### Test Scenarios

| Scenario | Graph | Expected Result |
|----------|-------|-----------------|
| 1 | P1 → P2 | SAFE |
| 2 | P1 → P2 → P1 | DEADLOCK |
| 3 | P1 → P2 → P3 → P1 | DEADLOCK |
| 4 | P1 → P2 → P3 → P4 → P5 → P1 | DEADLOCK |
| 5 | 500 nodes (performance test) | < 100ms detection |

---

## 🧪 Testing

### Run All Tests

```bash
pytest tests/ -v
```

### Run Specific Tests

```bash
# Process monitoring tests
pytest tests/test_process.py -v

# Deadlock detection tests
pytest tests/test_deadlock.py -v

# Resource monitoring tests
pytest tests/test_resource.py -v
```

### Performance Testing

```bash
python -m tests.test_performance
```

Output:
```
Processes | Detection Time | CPU Usage | Memory
----------------------------------------------
10        | 0.12ms         | 0.3%      | 45 MB
50        | 0.89ms         | 1.2%      | 52 MB
100       | 2.34ms         | 2.1%      | 68 MB
500       | 15.67ms        | 8.4%      | 142 MB
```

---

## 🖥 VS Code Setup

### Recommended Extensions

- Python (ms-python.python)
- Pylance (ms-python.vscode-pylance)
- Python Debugger (ms-python.debugpy)
- HTML CSS Support (ecmel.vscode-html-css)

### Debug Configuration

Create `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "OS Guardian",
      "type": "python",
      "request": "launch",
      "program": "${workspaceFolder}/run.py",
      "console": "integratedTerminal"
    },
    {
      "name": "FastAPI Server",
      "type": "python",
      "request": "launch",
      "module": "uvicorn",
      "args": ["app.main:app", "--reload", "--port", "8000"],
      "console": "integratedTerminal"
    },
    {
      "name": "Pytest",
      "type": "python",
      "request": "launch",
      "module": "pytest",
      "args": ["-v"],
      "console": "integratedTerminal"
    }
  ]
}
```

---

## 🐧 Linux /proc Integration

OS Guardian reads from Linux `/proc` filesystem:

| Path | Data |
|------|------|
| `/proc/stat` | CPU time, context switches |
| `/proc/meminfo` | Memory usage, buffers, cache |
| `/proc/loadavg` | System load averages |
| `/proc/[PID]/status` | Process status info |
| `/proc/[PID]/stat` | Process statistics |
| `/proc/[PID]/cmdline` | Process command line |

### Comparison: psutil vs /proc

```python
# Using psutil (recommended)
import psutil
process = psutil.Process(pid)
cpu = process.cpu_percent()

# Using /proc (educational)
with open(f'/proc/{pid}/stat', 'r') as f:
    stat = f.read().split()
    utime = int(stat[13])
    stime = int(stat[14])
```

---

## 🔒 Security

- ❌ ไม่ execute shell commands จาก Web UI
- ✅ Validate ทุก PID และ resource inputs
- ✅ ไม่ต้องการ root privileges (ยกเว้นจำเป็น)
- ✅ Handle Linux permissions อย่างปลอดภัย
- ✅ ไม่ส่ง Python stack traces ไปยัง UI

---

## ⚡ Performance Requirements

| Metric | Target |
|--------|--------|
| Monitoring interval | 1 second |
| Supported processes | 500+ |
| UI responsiveness | < 100ms |
| WebSocket | Continuous |
| Deadlock detection (500 nodes) | < 50ms |

---

## 📝 Development Phases

1. ✅ Phase 1: Process Monitor (psutil + /proc)
2. ✅ Phase 2: Resource Monitor (CPU, Memory, Processes, Threads)
3. ✅ Phase 3: FastAPI Backend
4. ✅ Phase 4: Web Dashboard
5. ✅ Phase 5: WebSocket Integration
6. ✅ Phase 6: Deadlock Analyzer
7. ✅ Phase 7: Deadlock Dashboard
8. ✅ Phase 8: pywebview Desktop App
9. ✅ Phase 9: Performance Testing
10. ✅ Phase 10: Packaging

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests: `pytest tests/ -v`
5. Submit a pull request

---

## 📄 License

MIT License - See LICENSE file for details

---

## 🙏 Acknowledgments

- [psutil](https://psutil.readthedocs.io/) - Process and system monitoring
- [FastAPI](https://fastapi.tiangolo.com/) - Modern Python web framework
- [NetworkX](https://networkx.org/) - Graph algorithms
- [pywebview](https://pywebview.flowrl.com/) - Native desktop windows

---

## 🌐 Web Dashboard (React)

Web Dashboard ถูกสร้างด้วย React + Tailwind CSS แสดงข้อมูลแบบ real-time

### Dashboard Pages

| Page | Description |
|------|-------------|
| **Dashboard** | System overview with CPU, Memory, Process metrics |
| **Processes** | Process table with search, sort, filter |
| **Resources** | Resource gauges and real-time charts |
| **Deadlocks** | Deadlock analyzer with graph visualization |
| **Alerts** | Alert history and notifications |
| **Settings** | Configuration for monitoring parameters |

### Features

- 🌑 Dark theme modern UI
- 📊 Real-time charts (CPU, Memory, Processes, Threads)
- 🔍 Process search and filtering
- 📋 Process detail modal with /proc paths
- 🔄 Resource Allocation Graph visualization
- ⚡ Wait-for Graph visualization
- 🎯 Deadlock test scenarios
- 🔔 Alert system with severity levels
- 📱 Responsive layout

---

## 📞 Support

For issues and questions:
- GitHub Issues
- Email: support@osguardian.dev

---

**Made with ❤️ for Operating Systems Education**
