from fastapi import APIRouter, Depends, Body
from sqlalchemy.orm import Session
from datetime import datetime, date, timedelta
from typing import Dict, Any, List

from database.connection import get_db
from models.user import User
from models.productivity import Activity, FocusSession, UserAchievement, ActivityType
from services.auth import get_current_user

router = APIRouter(prefix="/gamification", tags=["Gamification"])

def log_activity(db: Session, user_id: int, type: str, description: str):
    activity = Activity(user_id=user_id, activity_type=type, description=description)
    db.add(activity)

def check_level_up(user: User):
    """Simple formula: 100 XP per level."""
    new_level = (user.xp // 100) + 1
    if new_level > user.level:
        user.level = new_level
        return True
    return False

@router.post("/focus/complete", response_model=Dict[str, Any])
def complete_focus_session(
    duration: int = Body(..., embed=True),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Log a completed focus session and grant XP."""
    session = FocusSession(user_id=current_user.id, duration_minutes=duration, completed=1)
    db.add(session)
    
    # Grant XP (e.g., 20 XP per session)
    current_user.xp += 20
    leveled_up = check_level_up(current_user)
    
    # Log Activity
    log_activity(db, current_user.id, ActivityType.FOCUS_COMPLETED, f"Completed a {duration}-minute focus session")
    
    db.commit()
    db.refresh(current_user)
    
    return {
        "message": "Focus session logged successfully",
        "xp_gained": 20,
        "new_total_xp": current_user.xp,
        "leveled_up": leveled_up,
        "new_level": current_user.level
    }

@router.get("/achievements", response_model=List[Dict[str, Any]])
def get_achievements(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all unlocked achievements for user."""
    achievements = db.query(UserAchievement).filter(UserAchievement.user_id == current_user.id).all()
    return [{"id": a.achievement_id, "unlocked_at": a.unlocked_at.isoformat()} for a in achievements]
