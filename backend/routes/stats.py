from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, date, timedelta
from typing import Dict, Any

from database.connection import get_db
from models.user import User
from models.task import Task
from models.productivity import Activity, FocusSession
from services.auth import get_current_user

router = APIRouter(prefix="/stats", tags=["Stats"])

@router.get("/dashboard", response_model=Dict[str, Any])
def get_dashboard_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Aggregate all statistics for the dashboard."""
    
    # Task Stats
    total_tasks = db.query(Task).filter(Task.user_id == current_user.id, Task.is_archived == 0).count()
    completed_tasks = db.query(Task).filter(Task.user_id == current_user.id, Task.status == "Completed", Task.is_archived == 0).count()
    pending_tasks = total_tasks - completed_tasks
    
    # Overdue tasks: due_date < now and not completed
    now = datetime.utcnow()
    overdue_tasks = db.query(Task).filter(
        Task.user_id == current_user.id, 
        Task.status != "Completed",
        Task.due_date < now,
        Task.is_archived == 0
    ).count()

    completion_percentage = (completed_tasks / total_tasks * 100) if total_tasks > 0 else 0

    # Focus Time Today
    today_start = datetime.combine(date.today(), datetime.min.time())
    focus_time_today = db.query(func.sum(FocusSession.duration_minutes)).filter(
        FocusSession.user_id == current_user.id,
        FocusSession.created_at >= today_start
    ).scalar() or 0

    # Weekly Goal (Completed this week / target)
    week_start = today_start - timedelta(days=today_start.weekday())
    completed_this_week = db.query(Task).filter(
        Task.user_id == current_user.id,
        Task.status == "Completed",
        Task.updated_at >= week_start
    ).count()
    
    weekly_target = current_user.settings.get("weekly_target", 15) if current_user.settings else 15

    # Productivity Score (0-100)
    # Simple algorithm: Base 50 + (Completion % * 0.3) - (Overdue * 2) + (Focus Hours * 5) + (Streak * 2)
    focus_hours = focus_time_today / 60
    raw_score = 50 + (completion_percentage * 0.3) - (overdue_tasks * 2) + (focus_hours * 5) + (current_user.current_streak * 2)
    productivity_score = max(0, min(100, int(raw_score)))

    # Recent Activity (last 5)
    activities = db.query(Activity).filter(
        Activity.user_id == current_user.id
    ).order_by(Activity.timestamp.desc()).limit(5).all()

    # Format activities for JSON
    recent_activity = [
        {
            "id": a.id,
            "type": a.activity_type,
            "description": a.description,
            "timestamp": a.timestamp.isoformat()
        } for a in activities
    ]

    # Upcoming Tasks (Next 5 due)
    upcoming = db.query(Task).filter(
        Task.user_id == current_user.id,
        Task.status != "Completed",
        Task.is_archived == 0
    ).order_by(Task.due_date.asc().nulls_last(), Task.priority.desc()).limit(5).all()

    upcoming_tasks = [
        {
            "id": t.id,
            "title": t.title,
            "priority": t.priority,
            "due_date": t.due_date.isoformat() if t.due_date else None
        } for t in upcoming
    ]

    return {
        "user": {
            "xp": current_user.xp,
            "level": current_user.level,
            "current_streak": current_user.current_streak,
            "longest_streak": current_user.longest_streak
        },
        "tasks": {
            "total": total_tasks,
            "completed": completed_tasks,
            "pending": pending_tasks,
            "overdue": overdue_tasks,
            "completion_percentage": round(completion_percentage, 1)
        },
        "weekly_goal": {
            "completed": completed_this_week,
            "target": weekly_target
        },
        "productivity": {
            "score": productivity_score,
            "focus_minutes_today": focus_time_today
        },
        "recent_activity": recent_activity,
        "upcoming_tasks": upcoming_tasks
    }
