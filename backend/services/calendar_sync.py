import httpx
from models.user import User
from models.task import Task
from sqlalchemy.orm import Session
from datetime import datetime, timedelta

import os

CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET")
TOKEN_URL = "https://oauth2.googleapis.com/token"

async def get_access_token(refresh_token: str) -> str:
    data = {
        "client_id": CLIENT_ID,
        "client_secret": CLIENT_SECRET,
        "refresh_token": refresh_token,
        "grant_type": "refresh_token"
    }
    async with httpx.AsyncClient() as client:
        response = await client.post(TOKEN_URL, data=data)
        if response.status_code == 200:
            return response.json().get("access_token")
        else:
            print("Failed to get access token:", response.status_code, response.text)
    return None

def build_event_body(task: Task):
    if not task.due_date:
        return None
        
    start_time = task.due_date.isoformat()
    if not start_time.endswith("Z") and "+" not in start_time:
        start_time += "Z"
        
    end_date = task.due_date + timedelta(hours=1)
    end_time = end_date.isoformat()
    if not end_time.endswith("Z") and "+" not in end_time:
        end_time += "Z"

    return {
        "summary": task.title,
        "description": task.description or "",
        "start": {
            "dateTime": start_time,
        },
        "end": {
            "dateTime": end_time,
        }
    }

async def sync_task_to_google_calendar(task: Task, user: User, db: Session):
    print(f"Syncing task to Google Calendar: {task.title}")
    if not user.settings or not user.settings.get("google_refresh_token"):
        print("No google_refresh_token found for user")
        return
        
    if not task.due_date:
        print("Task has no due_date, skipping sync")
        return
        
    refresh_token = user.settings.get("google_refresh_token")
    access_token = await get_access_token(refresh_token)
    
    if not access_token:
        print("Failed to get access token from refresh token")
        return
        
    headers = {
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json"
    }
    
    event_body = build_event_body(task)
    if not event_body:
        return
        
    url = "https://www.googleapis.com/calendar/v3/calendars/primary/events"
    
    async with httpx.AsyncClient() as client:
        if task.google_event_id:
            update_url = f"{url}/{task.google_event_id}"
            res = await client.put(update_url, headers=headers, json=event_body)
            if res.status_code == 404:
                res = await client.post(url, headers=headers, json=event_body)
                if res.status_code == 200:
                    task.google_event_id = res.json().get("id")
                    db.commit()
        else:
            res = await client.post(url, headers=headers, json=event_body)
            print("Google Calendar POST Response:", res.status_code, res.text)
            if res.status_code in [200, 201]:
                task.google_event_id = res.json().get("id")
                db.commit()
            else:
                print("Failed to create Google Calendar event")

async def delete_task_from_google_calendar(task: Task, user: User, db: Session):
    if not task.google_event_id:
        return
    if not user.settings or not user.settings.get("google_refresh_token"):
        return
        
    refresh_token = user.settings.get("google_refresh_token")
    access_token = await get_access_token(refresh_token)
    if not access_token:
        return
        
    headers = {
        "Authorization": f"Bearer {access_token}",
    }
    url = f"https://www.googleapis.com/calendar/v3/calendars/primary/events/{task.google_event_id}"
    
    async with httpx.AsyncClient() as client:
        await client.delete(url, headers=headers)
