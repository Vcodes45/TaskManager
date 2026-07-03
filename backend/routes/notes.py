from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional

from database.connection import get_db
from models.user import User
from models.productivity import Note
from services.auth import get_current_user

router = APIRouter(prefix="/notes", tags=["Notes"])

class NoteCreate(BaseModel):
    title: str
    content: Optional[str] = None
    is_pinned: Optional[int] = 0

class NoteUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    is_pinned: Optional[int] = None

class NoteResponse(BaseModel):
    id: int
    title: str
    content: Optional[str]
    is_pinned: int
    created_at: str
    updated_at: str

    class Config:
        from_attributes = True

@router.get("", response_model=List[NoteResponse])
def get_notes(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    notes = db.query(Note).filter(Note.user_id == current_user.id).order_by(Note.is_pinned.desc(), Note.updated_at.desc()).all()
    # Manual conversion of dates for response model
    return [{
        "id": n.id,
        "title": n.title,
        "content": n.content,
        "is_pinned": n.is_pinned,
        "created_at": n.created_at.isoformat(),
        "updated_at": n.updated_at.isoformat()
    } for n in notes]

@router.post("", response_model=NoteResponse)
def create_note(note_data: NoteCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    new_note = Note(
        user_id=current_user.id,
        title=note_data.title,
        content=note_data.content,
        is_pinned=note_data.is_pinned
    )
    db.add(new_note)
    db.commit()
    db.refresh(new_note)
    
    return {
        "id": new_note.id,
        "title": new_note.title,
        "content": new_note.content,
        "is_pinned": new_note.is_pinned,
        "created_at": new_note.created_at.isoformat(),
        "updated_at": new_note.updated_at.isoformat()
    }

@router.put("/{note_id}", response_model=NoteResponse)
def update_note(note_id: int, note_data: NoteUpdate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    note = db.query(Note).filter(Note.id == note_id, Note.user_id == current_user.id).first()
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")
        
    if note_data.title is not None:
        note.title = note_data.title
    if note_data.content is not None:
        note.content = note_data.content
    if note_data.is_pinned is not None:
        note.is_pinned = note_data.is_pinned
        
    db.commit()
    db.refresh(note)
    
    return {
        "id": note.id,
        "title": note.title,
        "content": note.content,
        "is_pinned": note.is_pinned,
        "created_at": note.created_at.isoformat(),
        "updated_at": note.updated_at.isoformat()
    }

@router.delete("/{note_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_note(note_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    note = db.query(Note).filter(Note.id == note_id, Note.user_id == current_user.id).first()
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")
        
    db.delete(note)
    db.commit()
