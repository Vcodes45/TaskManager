from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database.connection import get_db
from models.task import Task
from models.user import User
from schemas.task import TaskResponse
from services.auth import get_current_user
from ai.gemini import GeminiService

router = APIRouter(prefix="/tasks", tags=["AI"])

# Initialize AI service
ai_service = None


def get_ai_service():
    """Get or create the AI service instance."""
    global ai_service
    if ai_service is None:
        ai_service = GeminiService()
    return ai_service


@router.post("/{task_id}/ai", response_model=TaskResponse)
async def analyze_task(
    task_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Run AI analysis on a task and store the results."""
    task = db.query(Task).filter(Task.id == task_id, Task.user_id == current_user.id).first()
    if not task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")

    try:
        service = get_ai_service()
        result = await service.analyze_task(task.title, task.description or "")

        # Update task with AI results
        task.summary = result.summary
        task.category = result.category
        task.priority = result.priority
        task.priority_reason = result.priority_reason
        task.improved_description = result.improved_description
        task.ai_actionable_steps = result.ai_actionable_steps
        task.ai_estimated_time = result.ai_estimated_time
        task.ai_potential_roadblocks = result.ai_potential_roadblocks

        db.commit()
        db.refresh(task)
        return task

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"AI analysis failed: {str(e)}"
        )
