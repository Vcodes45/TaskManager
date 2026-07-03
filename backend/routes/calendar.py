from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database.connection import get_db
from services.auth import get_current_user
from models.user import User
import httpx
import os

router = APIRouter(prefix="/calendar", tags=["Calendar"])

CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET")
TOKEN_URL = "https://oauth2.googleapis.com/token"

@router.post("/connect")
async def connect_calendar(auth_code: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Exchanges auth code for tokens and saves refresh_token to user settings."""
    try:
        data = {
            "code": auth_code,
            "client_id": CLIENT_ID,
            "client_secret": CLIENT_SECRET,
            "redirect_uri": "postmessage",
            "grant_type": "authorization_code"
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.post(token_url, data=data)
            
        if response.status_code != 200:
            raise HTTPException(status_code=400, detail=f"Failed to exchange code: {response.text}")
            
        token_data = response.json()
        refresh_token = token_data.get("refresh_token")
        
        settings = current_user.settings or {}
        if refresh_token:
            settings["google_refresh_token"] = refresh_token
            # Reassign dict for SQLAlchemy JSON tracking
            current_user.settings = dict(settings)
            db.commit()
            
        return {"message": "Google Calendar connected successfully", "has_refresh_token": bool(settings.get("google_refresh_token"))}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/disconnect")
async def disconnect_calendar(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Removes the Google Calendar refresh token from user settings."""
    settings = current_user.settings or {}
    if "google_refresh_token" in settings:
        del settings["google_refresh_token"]
        current_user.settings = dict(settings)
        db.commit()
    return {"message": "Google Calendar disconnected"}
