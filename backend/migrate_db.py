import os
from sqlalchemy import text
from dotenv import load_dotenv
from database.connection import engine, Base
# Import all models so create_all knows about them
import models.user
import models.task
import models.productivity

load_dotenv()

def run_migrations():
    print("Running database migrations...")
    
    # Create any NEW tables (like activities, notes, etc.)
    Base.metadata.create_all(bind=engine)
    print("Base metadata create_all complete.")
    
    # Add new columns to existing tables using raw SQL
    with engine.connect() as conn:
        try:
            # Users table upgrades
            conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS bio TEXT;"))
            conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS xp INTEGER DEFAULT 0 NOT NULL;"))
            conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS level INTEGER DEFAULT 1 NOT NULL;"))
            conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS current_streak INTEGER DEFAULT 0 NOT NULL;"))
            conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS longest_streak INTEGER DEFAULT 0 NOT NULL;"))
            conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS settings JSON DEFAULT '{}';"))
            conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL;"))
            conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL;"))
            print("Upgraded users table.")
        except Exception as e:
            print(f"Error upgrading users table: {e}")

        try:
            # Tasks table upgrades
            conn.execute(text("ALTER TABLE tasks ADD COLUMN IF NOT EXISTS is_archived INTEGER DEFAULT 0 NOT NULL;"))
            conn.execute(text("ALTER TABLE tasks ADD COLUMN IF NOT EXISTS is_pinned INTEGER DEFAULT 0 NOT NULL;"))
            conn.execute(text("ALTER TABLE tasks ADD COLUMN IF NOT EXISTS subtasks JSON DEFAULT '[]';"))
            conn.execute(text("ALTER TABLE tasks ADD COLUMN IF NOT EXISTS google_event_id VARCHAR(255);"))
            print("Upgraded tasks table.")
        except Exception as e:
            print(f"Error upgrading tasks table: {e}")
            
        conn.commit()

if __name__ == "__main__":
    run_migrations()
