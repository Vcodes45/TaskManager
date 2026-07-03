import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { notesService } from '../services/notesService';
import GlassCard from '../components/ui/GlassCard';
import { FiPlus, FiTrash2, FiEdit2, FiSave, FiX, FiFileText } from 'react-icons/fi';
import { format, parseISO } from 'date-fns';

export default function NotesPage() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  
  // Form State
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [color, setColor] = useState('#1e293b'); // Default dark grayish blue

  const colors = [
    '#1e293b', // Default
    '#7f1d1d', // Red
    '#14532d', // Green
    '#1e3a8a', // Blue
    '#4a044e', // Purple
    '#78350f', // Orange
  ];

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    try {
      const data = await notesService.getNotes();
      setNotes(data);
    } catch (error) {
      console.error('Error fetching notes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!title.trim() && !content.trim()) return;

    const noteData = { title, content, color };

    try {
      if (editingId) {
        await notesService.updateNote(editingId, noteData);
        setNotes(notes.map(n => n.id === editingId ? { ...n, ...noteData, updated_at: new Date().toISOString() } : n));
      } else {
        const newNote = await notesService.createNote(noteData);
        setNotes([newNote, ...notes]);
      }
      resetForm();
    } catch (error) {
      console.error('Error saving note:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this note?')) {
      try {
        await notesService.deleteNote(id);
        setNotes(notes.filter(n => n.id !== id));
        if (editingId === id) resetForm();
      } catch (error) {
        console.error('Error deleting note:', error);
      }
    }
  };

  const editNote = (note) => {
    setEditingId(note.id);
    setTitle(note.title);
    setContent(note.content);
    setColor(note.color || '#1e293b');
  };

  const resetForm = () => {
    setEditingId(null);
    setTitle('');
    setContent('');
    setColor('#1e293b');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="pb-12 max-w-6xl mx-auto flex flex-col md:flex-row gap-8 h-[calc(100vh-8rem)]">
      {/* Editor Side */}
      <div className="w-full md:w-1/2 flex flex-col h-full">
        <div className="mb-6 flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[var(--color-text-primary)] to-[var(--color-text-secondary)]">Notes</h1>
            <p className="text-[var(--color-text-secondary)] mt-1">Capture your thoughts and ideas</p>
          </div>
          {editingId && (
            <button 
              onClick={resetForm}
              className="text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] px-3 py-1.5 rounded-lg border border-[var(--color-border-light)] hover:bg-[var(--color-text-primary)]/5 transition flex items-center gap-2 text-sm"
            >
              <FiPlus /> New Note
            </button>
          )}
        </div>

        <GlassCard className="flex-1 flex flex-col p-0 overflow-hidden border-2 transition-colors" style={{ borderColor: `${color}80` }}>
          <div className="p-4 border-b border-[var(--color-border-light)] bg-black/20 flex gap-2">
            {colors.map(c => (
              <button
                key={c}
                onClick={() => setColor(c)}
                className={`w-6 h-6 rounded-full border-2 transition-transform ${color === c ? 'scale-110 border-white' : 'border-transparent hover:scale-105'}`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
          <div className="flex-1 flex flex-col p-6" style={{ backgroundColor: `${color}20` }}>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Note Title"
              className="bg-transparent text-2xl font-bold border-none outline-none focus:ring-0 px-0 placeholder:text-[var(--color-text-primary)]/30 mb-4"
            />
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your note here... (Markdown supported visually in mind)"
              className="bg-transparent text-[var(--color-text-secondary)] flex-1 resize-none border-none outline-none focus:ring-0 px-0 placeholder:text-[var(--color-text-primary)]/20 custom-scrollbar"
            />
          </div>
          <div className="p-4 border-t border-[var(--color-border-light)] bg-black/20 flex justify-end gap-3">
            {editingId && (
              <button 
                onClick={() => handleDelete(editingId)}
                className="px-4 py-2 rounded-xl text-[var(--color-danger)] hover:bg-[var(--color-danger-dim)] transition flex items-center gap-2"
              >
                <FiTrash2 /> Delete
              </button>
            )}
            <button 
              onClick={handleSave}
              disabled={!title.trim() && !content.trim()}
              className="px-6 py-2 bg-primary hover:bg-primary/90 text-[var(--color-text-primary)] rounded-xl transition shadow-lg shadow-primary/20 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FiSave /> {editingId ? 'Update Note' : 'Save Note'}
            </button>
          </div>
        </GlassCard>
      </div>

      {/* List Side */}
      <div className="w-full md:w-1/2 h-full flex flex-col">
        <div className="mb-6 flex items-center gap-2 text-[var(--color-text-secondary)] font-medium">
          <FiFileText />
          <span>All Notes ({notes.length})</span>
        </div>
        
        <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4 pr-2">
          <AnimatePresence>
            {notes.map(note => (
              <motion.div
                key={note.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                onClick={() => editNote(note)}
                className={`p-5 rounded-2xl cursor-pointer transition-all border ${
                  editingId === note.id 
                    ? 'border-primary ring-1 ring-primary shadow-lg shadow-primary/10' 
                    : 'border-[var(--color-border-light)] hover:border-[var(--color-text-primary)]/30'
                }`}
                style={{ backgroundColor: `${note.color || '#1e293b'}60` }}
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-lg text-[var(--color-text-primary)] line-clamp-1">{note.title || 'Untitled'}</h3>
                  <span className="text-[10px] text-[var(--color-text-secondary)] shrink-0 mt-1.5 bg-black/20 px-2 py-1 rounded">
                    {format(parseISO(note.updated_at), 'MMM d')}
                  </span>
                </div>
                <p className="text-sm text-[var(--color-text-secondary)] line-clamp-3 leading-relaxed">
                  {note.content || <span className="italic opacity-50">No content</span>}
                </p>
              </motion.div>
            ))}
          </AnimatePresence>
          
          {notes.length === 0 && (
            <div className="text-center py-20 text-[var(--color-text-secondary)]">
              <FiFileText size={48} className="mx-auto mb-4 opacity-20" />
              <p>No notes yet. Create one on the left!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
