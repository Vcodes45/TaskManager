from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class TaskCreate(BaseModel):
    """Schema for creating a new task."""
    title: str
    description: Optional[str] = None
    due_date: Optional[datetime] = None
    priority: Optional[str] = "Medium"
    is_archived: Optional[int] = 0
    is_pinned: Optional[int] = 0
    subtasks: Optional[list] = []


class TaskUpdate(BaseModel):
    """Schema for updating a task."""
    title: Optional[str] = None
    description: Optional[str] = None
    due_date: Optional[datetime] = None
    status: Optional[str] = None
    priority: Optional[str] = None
    is_archived: Optional[int] = None
    is_pinned: Optional[int] = None
    subtasks: Optional[list] = None

class TaskBulkAction(BaseModel):
    task_ids: list[int]
    action: str # "delete", "complete", "archive", "priority"
    value: Optional[str] = None # For priority or status if needed


class TaskResponse(BaseModel):
    """Schema for task data in responses."""
    id: int
    user_id: int
    title: str
    description: Optional[str] = None
    status: str
    due_date: Optional[datetime] = None
    summary: Optional[str] = None
    category: Optional[str] = None
    priority: Optional[str] = None
    priority_reason: Optional[str] = None
    improved_description: Optional[str] = None
    is_archived: int
    is_pinned: int
    subtasks: list
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class AIAnalysisResponse(BaseModel):
    """Schema for AI analysis results."""
    summary: str
    category: str
    priority: str
    priority_reason: str
    improved_description: str
