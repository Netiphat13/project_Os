"""
OS Guardian - Permission Utilities
Handle Linux file permissions safely
"""
import os
import psutil


def check_proc_access(pid: int) -> dict:
    """Check if we can access /proc/[pid] files"""
    result = {
        'pid': pid,
        'exists': False,
        'readable': False,
        'status': False,
        'stat': False,
        'cmdline': False,
    }
    
    proc_dir = f'/proc/{pid}'
    result['exists'] = os.path.exists(proc_dir)
    
    if not result['exists']:
        return result
    
    # Check individual files
    for filename in ['status', 'stat', 'cmdline']:
        filepath = os.path.join(proc_dir, filename)
        try:
            with open(filepath, 'r') as f:
                f.read(1)  # Just try to read 1 byte
            result[filename] = True
        except PermissionError:
            result[filename] = False
        except FileNotFoundError:
            result[filename] = False
    
    result['readable'] = any([
        result['status'],
        result['stat'],
        result['cmdline'],
    ])
    
    return result


def safe_read_proc(pid: int, filename: str) -> str:
    """Safely read a /proc/[pid] file"""
    filepath = f'/proc/{pid}/{filename}'
    try:
        with open(filepath, 'r') as f:
            return f.read()
    except FileNotFoundError:
        return f'Process {pid} not found'
    except PermissionError:
        return f'Permission denied for {filepath}'
    except Exception as e:
        return f'Error reading {filepath}: {str(e)}'


def validate_pid(pid: int) -> bool:
    """Validate that a PID is valid and accessible"""
    if not isinstance(pid, int) or pid < 0:
        return False
    
    try:
        proc = psutil.Process(pid)
        return proc.is_running()
    except (psutil.NoSuchProcess, psutil.AccessDenied):
        return False


def get_process_owner(pid: int) -> str:
    """Get the owner of a process"""
    try:
        proc = psutil.Process(pid)
        return proc.username()
    except (psutil.NoSuchProcess, psutil.AccessDenied):
        return 'unknown'
