import os
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
from database.connection import engine, Base
from routes import auth, tasks, ai

load_dotenv()

# Create all database tables
Base.metadata.create_all(bind=engine)

# Initialize FastAPI app
app = FastAPI(
    title="AI Task Manager API",
    description="A full-stack AI-powered Task Manager with Google Gemini integration",
    version="1.0.0",
)

# CORS middleware — allow all origins in development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Global exception handler to ensure CORS headers on errors
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={"detail": str(exc)},
    )


from routes import auth, tasks, ai, stats, gamification, activities, notes

# Include routers
app.include_router(auth.router)
app.include_router(tasks.router)
app.include_router(ai.router)
app.include_router(stats.router)
app.include_router(gamification.router)
app.include_router(activities.router)
app.include_router(notes.router)


@app.get("/", tags=["Health"])
def health_check():
    """Health check endpoint."""
    return {"status": "ok", "message": "AI Task Manager API is running"}
