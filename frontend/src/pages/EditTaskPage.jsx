import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import TaskForm from '../components/TaskForm';
import { taskService } from '../services/taskService';

export default function EditTaskPage() {
  const { id } = useParams();
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTask = async () => {
      try {
        const tasks = await taskService.getTasks();
        const found = tasks.find((t) => t.id === parseInt(id));
        if (found) {
          setTask(found);
        } else {
          setError('Task not found');
        }
      } catch (err) {
        setError('Failed to load task');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchTask();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen pt-16">
        <div className="w-8 h-8 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 pt-24">
        <div className="alert-danger">
          <span>{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 pt-24">
      <TaskForm task={task} isEdit={true} />
    </div>
  );
}
