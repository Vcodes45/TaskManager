import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiSave, FiArrowLeft } from 'react-icons/fi';
import { taskService } from '../services/taskService';

export default function TaskForm({ task = null, isEdit = false }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    due_date: '',
    status: 'Pending',
    priority: 'Medium',
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (task && isEdit) {
      setFormData({
        title: task.title || '',
        description: task.description || '',
        due_date: task.due_date ? task.due_date.slice(0, 16) : '',
        status: task.status || 'Pending',
        priority: task.priority || 'Medium',
      });
    }
  }, [task, isEdit]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.title.trim()) {
      setError('Title is required');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        title: formData.title.trim(),
        description: formData.description.trim() || null,
        due_date: formData.due_date ? new Date(formData.due_date).toISOString() : null,
        priority: formData.priority,
      };

      if (isEdit) {
        payload.status = formData.status;
        await taskService.updateTask(task.id, payload);
      } else {
        await taskService.createTask(payload);
      }

      navigate('/');
    } catch (err) {
      setError(err.response?.data?.detail || 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="border border-[var(--color-border)] bg-[var(--color-surface)] rounded-xl p-6 sm:p-8 max-w-xl mx-auto shadow-sm">
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate('/')}
          className="text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors bg-transparent border-none cursor-pointer p-0"
        >
          <FiArrowLeft size={18} />
        </button>
        <h2 className="text-lg font-bold text-[var(--color-text-primary)] m-0">
          {isEdit ? 'Edit Task' : 'Create New Task'}
        </h2>
      </div>

      {error && (
        <div className="alert-danger mb-4">
          <span>{error}</span>
          <button onClick={() => setError('')}>&times;</button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="taskTitle" className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1.5">
            Title <span className="text-[var(--color-danger)]">*</span>
          </label>
          <input
            id="taskTitle"
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="What needs to be done?"
            required
          />
        </div>

        <div>
          <label htmlFor="taskDescription" className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1.5">
            Description
          </label>
          <textarea
            id="taskDescription"
            rows={4}
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Add more details about this task..."
            className="resize-y"
          />
        </div>

        <div>
          <label htmlFor="taskDueDate" className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1.5">
            Due Date
          </label>
          <input
            id="taskDueDate"
            type="datetime-local"
            name="due_date"
            value={formData.due_date}
            onChange={handleChange}
          />
        </div>

        <div>
          <label htmlFor="taskPriority" className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1.5">
            Priority
          </label>
          <select
            id="taskPriority"
            name="priority"
            value={formData.priority}
            onChange={handleChange}
          >
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>
        </div>

        {isEdit && (
          <div>
            <label htmlFor="taskStatus" className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1.5">
              Status
            </label>
            <select
              id="taskStatus"
              name="status"
              value={formData.status}
              onChange={handleChange}
            >
              <option value="Pending">Pending</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={submitting}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-[var(--color-accent)] text-white font-semibold text-xs rounded-lg hover:bg-[var(--color-accent-hover)] transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-0 shadow-sm border-none cursor-pointer"
          >
            <FiSave size={14} />
            {submitting ? 'Saving...' : isEdit ? 'Update Task' : 'Create Task'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/')}
            className="px-5 py-2 rounded-lg border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-elevated)] text-xs font-semibold transition-all cursor-pointer bg-transparent"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
