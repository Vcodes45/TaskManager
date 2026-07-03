from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from database.connection import get_db
from models.task import Task
from models.user import User
from schemas.task import TaskCreate, TaskUpdate, TaskResponse, TaskBulkAction
from services.auth import get_current_user

router = APIRouter(prefix="/tasks", tags=["Tasks"])

@router.patch("/bulk", response_model=dict)
def bulk_action_tasks(
    bulk_data: TaskBulkAction,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Perform bulk actions on tasks."""
    tasks_query = db.query(Task).filter(Task.user_id == current_user.id, Task.id.in_(bulk_data.task_ids))
    
    if bulk_data.action == "delete":
        tasks_query.delete(synchronize_session=False)
    elif bulk_data.action == "complete":
        tasks_query.update({"status": "Completed"}, synchronize_session=False)
    elif bulk_data.action == "archive":
        tasks_query.update({"is_archived": 1}, synchronize_session=False)
    elif bulk_data.action == "priority" and bulk_data.value:
        tasks_query.update({"priority": bulk_data.value}, synchronize_session=False)
    else:
        raise HTTPException(status_code=400, detail="Invalid bulk action")
        
    db.commit()
    return {"message": f"Successfully applied {bulk_data.action} to {len(bulk_data.task_ids)} tasks"}


from typing import List, Optional

@router.get("", response_model=List[TaskResponse])
def get_tasks(
    status: Optional[str] = None,
    priority: Optional[str] = None,
    is_archived: Optional[int] = 0,
    search: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all tasks for the current user with optional filtering."""
    query = db.query(Task).filter(Task.user_id == current_user.id)
    
    if is_archived is not None:
        query = query.filter(Task.is_archived == is_archived)
    
    if status:
        query = query.filter(Task.status == status)
        
    if priority:
        query = query.filter(Task.priority == priority)
        
    if search:
        search_term = f"%{search}%"
        query = query.filter(Task.title.ilike(search_term) | Task.description.ilike(search_term))
        
    # Order by pinned first, then created date
    tasks = query.order_by(Task.is_pinned.desc(), Task.created_at.desc()).all()
    return tasks


from models.productivity import Activity, ActivityType

def check_level_up(user: User):
    new_level = (user.xp // 100) + 1
    if new_level > user.level:
        user.level = new_level
        return True
    return False

@router.post("", response_model=TaskResponse, status_code=status.HTTP_201_CREATED)
def create_task(
    task_data: TaskCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new task."""
    new_task = Task(
        user_id=current_user.id,
        title=task_data.title,
        description=task_data.description,
        due_date=task_data.due_date,
        priority=task_data.priority,
        is_archived=task_data.is_archived,
        is_pinned=task_data.is_pinned,
        subtasks=task_data.subtasks
    )
    db.add(new_task)
    
    # Gamification
    current_user.xp += 5
    check_level_up(current_user)
    db.add(Activity(user_id=current_user.id, activity_type=ActivityType.TASK_CREATED, description=f"Created task: {new_task.title}"))
    
    db.commit()
    db.refresh(new_task)
    return new_task

@router.put("/{task_id}", response_model=TaskResponse)
def update_task(
    task_id: int,
    task_data: TaskUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update an existing task."""
    task = db.query(Task).filter(Task.id == task_id, Task.user_id == current_user.id).first()
    if not task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")

    update_data = task_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(task, field, value)
        
    db.add(Activity(user_id=current_user.id, activity_type=ActivityType.TASK_UPDATED, description=f"Updated task: {task.title}"))

    db.commit()
    db.refresh(task)
    return task

@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_task(
    task_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a task."""
    task = db.query(Task).filter(Task.id == task_id, Task.user_id == current_user.id).first()
    if not task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")

    db.add(Activity(user_id=current_user.id, activity_type=ActivityType.TASK_DELETED, description=f"Deleted task: {task.title}"))
    db.delete(task)
    db.commit()

@router.patch("/{task_id}/complete", response_model=TaskResponse)
def toggle_complete(
    task_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Toggle task status between Pending and Completed."""
    task = db.query(Task).filter(Task.id == task_id, Task.user_id == current_user.id).first()
    if not task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")

    if task.status == "Pending":
        task.status = "Completed"
        current_user.xp += 10
        check_level_up(current_user)
        db.add(Activity(user_id=current_user.id, activity_type=ActivityType.TASK_COMPLETED, description=f"Completed task: {task.title}"))
    else:
        task.status = "Pending"
        
    db.commit()
    db.refresh(task)
    return task
