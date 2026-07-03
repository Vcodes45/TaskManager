import asyncio
import os
from database.connection import SessionLocal
from models.task import Task
from models.user import User
from services.calendar_sync import sync_task_to_google_calendar

async def sync_all():
    db = SessionLocal()
    try:
        users = db.query(User).all()
        for user in users:
            if user.settings and user.settings.get("google_refresh_token"):
                print(f"Syncing tasks for user {user.email}...")
                tasks = db.query(Task).filter(Task.user_id == user.id, Task.due_date.isnot(None)).all()
                for task in tasks:
                    print(f"  -> Task: {task.title} (Due: {task.due_date})")
                    await sync_task_to_google_calendar(task, user, db)
        print("Done syncing.")
    finally:
        db.close()

if __name__ == "__main__":
    asyncio.run(sync_all())
