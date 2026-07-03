import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiEdit2, FiTrash2, FiCheck, FiRotateCcw, FiCalendar, FiZap } from 'react-icons/fi';
import AIResultsPanel from './AIResultsPanel';
import { taskService } from '../services/taskService';

export default function TaskCard({ task, onUpdate, onDelete, revealDelay = 0 }) {
  const [aiLoading, setAiLoading] = useState(false);
  const [showAI, setShowAI] = useState(false);
  const navigate = useNavigate();

  const handleToggleComplete = async () => {
    try {
      const updated = await taskService.toggleComplete(task.id);
      onUpdate(updated);
    } catch (err) {
      console.error('Failed to toggle status:', err);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    try {
      await taskService.deleteTask(task.id);
      onDelete(task.id);
    } catch (err) {
      console.error('Failed to delete task:', err);
    }
  };

  const handleAIAnalyze = async () => {
    setAiLoading(true);
    setShowAI(true);
    try {
      const updated = await taskService.analyzeTask(task.id);
      onUpdate(updated);
    } catch (err) {
      console.error('AI analysis failed:', err);
      alert('AI analysis failed. Please try again.');
    } finally {
      setAiLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const isOverdue = task.due_date && task.status === 'Pending' && new Date(task.due_date) < new Date();
  const hasAIResults = task.summary || task.category || task.priority;

  return (
    <div
      className="reveal glass rounded-xl hover:border-border-light transition-all duration-300 group"
      style={{ '--reveal-delay': `${revealDelay}ms` }}
    >
      <div className="p-5">
        {/* Header: Title + Status badge */}
        <div className="flex items-start justify-between mb-2 gap-3">
          <h5 className="text-base font-semibold text-text-primary flex-1 m-0 group-hover:text-accent transition-colors duration-300">
            {task.title}
          </h5>
          <span className={`shrink-0 text-xs font-medium px-2.5 py-1 rounded-md border ${
            task.status === 'Completed'
              ? 'bg-success-dim text-success border-success/20'
              : 'bg-warning-dim text-warning border-warning/20'
          }`}>
            {task.status}
          </span>
        </div>

        {/* Description */}
        {task.description && (
          <p className="text-text-muted text-sm mb-3 leading-relaxed">{task.description}</p>
        )}

        {/* Badges row: Priority + Category + Due date */}
        <div className="flex items-center gap-2 flex-wrap mb-4">
          {task.priority && (
            <span className={`text-[0.7rem] font-semibold px-2 py-0.5 rounded border ${
              task.priority === 'High' ? 'bg-danger-dim text-danger border-danger/25' :
              task.priority === 'Medium' ? 'bg-warning-dim text-warning border-warning/25' :
              'bg-accent-dim text-accent border-accent/25'
            }`}>
              {task.priority}
            </span>
          )}
          {task.category && (
            <span className="text-[0.7rem] font-medium px-2 py-0.5 rounded bg-[var(--color-text-primary)]/5 text-text-muted border border-border-light">
              {task.category}
            </span>
          )}
          {task.due_date && (
            <span className={`flex items-center gap-1 text-xs ${isOverdue ? 'text-danger' : 'text-text-muted'}`}>
              <FiCalendar size={11} />
              {formatDate(task.due_date)}
              {isOverdue && <span className="font-semibold">(Overdue)</span>}
            </span>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleToggleComplete}
            title={task.status === 'Pending' ? 'Mark Complete' : 'Mark Pending'}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all duration-200 cursor-pointer ${
              task.status === 'Pending'
                ? 'border-success/25 text-success hover:bg-success-dim bg-transparent'
                : 'border-warning/25 text-warning hover:bg-warning-dim bg-transparent'
            }`}
          >
            {task.status === 'Pending' ? <FiCheck size={13} /> : <FiRotateCcw size={13} />}
            {task.status === 'Pending' ? 'Complete' : 'Pending'}
          </button>
          <button
            onClick={() => navigate(`/tasks/${task.id}/edit`)}
            title="Edit Task"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-accent/25 text-accent hover:bg-accent-dim transition-all duration-200 cursor-pointer bg-transparent"
          >
            <FiEdit2 size={13} /> Edit
          </button>
          <button
            onClick={handleDelete}
            title="Delete Task"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-danger/25 text-danger hover:bg-danger-dim transition-all duration-200 cursor-pointer bg-transparent"
          >
            <FiTrash2 size={13} /> Delete
          </button>
          <button
            onClick={handleAIAnalyze}
            disabled={aiLoading}
            title="Analyze with AI"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-purple/25 text-purple hover:bg-purple-dim transition-all duration-200 cursor-pointer bg-transparent disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <FiZap size={13} /> {aiLoading ? 'Analyzing...' : 'AI Analyze'}
          </button>
        </div>

        {/* AI Results */}
        {(showAI || hasAIResults) && (
          <AIResultsPanel task={task} loading={aiLoading} />
        )}
      </div>
    </div>
  );
}
