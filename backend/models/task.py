from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime, Enum, JSON
from sqlalchemy.sql import func
from database.connection import Base
import enum


class TaskStatus(str, enum.Enum):
    PENDING = "Pending"
    COMPLETED = "Completed"


class TaskPriority(str, enum.Enum):
    HIGH = "High"
    MEDIUM = "Medium"
    LOW = "Low"


class TaskCategory(str, enum.Enum):
    WORK = "Work"
    STUDY = "Study"
    PERSONAL = "Personal"
    SHOPPING = "Shopping"
    HEALTH = "Health"
    FINANCE = "Finance"
    OTHER = "Other"


class Task(Base):
    """Task model with AI analysis fields."""
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)

    # Core task fields
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    status = Column(String(20), default=TaskStatus.PENDING.value, nullable=False)
    due_date = Column(DateTime, nullable=True)

    # AI-generated fields
    summary = Column(Text, nullable=True)
    category = Column(String(50), nullable=True)
    priority = Column(String(20), nullable=True)
    priority_reason = Column(Text, nullable=True)
    improved_description = Column(Text, nullable=True)

    # Advanced Fields
    is_archived = Column(Integer, default=0, nullable=False) # SQLite doesn't natively support booleans without mapping, integer is safer or Boolean
    is_pinned = Column(Integer, default=0, nullable=False)
    subtasks = Column(JSON, nullable=True, default=[]) # Array of dicts: [{"id": 1, "title": "do this", "completed": false}]

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    def __repr__(self):
        return f"<Task(id={self.id}, title='{self.title}', status='{self.status}')>"
