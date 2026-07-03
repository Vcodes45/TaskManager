from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List, Dict, Any

from database.connection import get_db
from models.user import User
from models.productivity import Activity
from services.auth import get_current_user

router = APIRouter(prefix="/activities", tags=["Activities"])

@router.get("", response_model=Dict[str, Any])
def get_activities(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get paginated activity log for the current user."""
    total = db.query(Activity).filter(Activity.user_id == current_user.id).count()
    activities = db.query(Activity).filter(
        Activity.user_id == current_user.id
    ).order_by(Activity.timestamp.desc()).offset(skip).limit(limit).all()
    
    return {
        "total": total,
        "items": [
            {
                "id": a.id,
                "type": a.activity_type,
                "description": a.description,
                "timestamp": a.timestamp.isoformat()
            } for a in activities
        ]
    }
