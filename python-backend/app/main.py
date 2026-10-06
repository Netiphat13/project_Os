"""
OS Guardian - FastAPI Application
"""
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.api.routes import router as api_router
from app.api.websocket import router as ws_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan events"""
    print("🛡 OS Guardian starting...")
    yield
    print("🛡 OS Guardian shutting down...")


app = FastAPI(
    title="OS Guardian",
    description="Real-time Process Monitoring and Deadlock Detection System",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(api_router, prefix="/api")
app.include_router(ws_router)


@app.get("/", response_class=HTMLResponse)
async def root():
    """Serve the dashboard"""
    return """
    <!DOCTYPE html>
    <html>
    <head>
        <title>OS Guardian</title>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <script>
            // Redirect to the built React dashboard or show API info
            window.location.href = '/docs';
        </script>
    </head>
    <body>
        <h1>OS Guardian API</h1>
        <p>Visit <a href="/docs">/docs</a> for API documentation</p>
        <p>WebSocket: ws://localhost:8000/ws/monitor</p>
    </body>
    </html>
    """


@app.get("/health")
async def health():
    """Health check endpoint"""
    return {"status": "healthy", "service": "OS Guardian"}
