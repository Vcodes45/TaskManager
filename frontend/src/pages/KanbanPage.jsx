import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  DndContext, 
  DragOverlay, 
  closestCorners, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors,
  useDroppable 
} from '@dnd-kit/core';
import { 
  SortableContext, 
  arrayMove, 
  sortableKeyboardCoordinates,
  verticalListSortingStrategy 
} from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import confetti from 'canvas-confetti';
import { taskService } from '../services/taskService';
import { FiPlus, FiMoreHorizontal, FiCalendar, FiCheck } from 'react-icons/fi';
import { format } from 'date-fns';

import { useToastStore } from '../components/ui/ToastManager';

const COLUMNS = ['Todo', 'In Progress', 'Completed'];

// --- Sortable Item Component ---
function SortableTaskCard({ task, onClick }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id, data: { type: 'Task', task } });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  if (isDragging) {
    return (
      <div 
        ref={setNodeRef} 
        style={style} 
        className="p-4 rounded-xl mb-3 bg-surface-elevated border border-primary/50 opacity-30 h-[100px]" 
      />
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className="p-4 rounded-lg mb-3 cursor-grab active:cursor-grabbing border bg-[var(--color-surface)] border-[var(--color-border)] shadow-sm hover:border-[var(--color-text-secondary)] transition-colors group"
    >
      <div className="flex justify-between items-start mb-2">
        <span className={`text-xs px-2 py-1 rounded bg-[var(--color-text-primary)]/5 ${
          task.priority === 'High' ? 'text-[var(--color-danger)]' : 
          task.priority === 'Medium' ? 'text-[var(--color-warning)]' : 'text-[var(--color-success)]'
        }`}>
          {task.priority || 'Medium'}
        </span>
        <button className="text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] p-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <FiMoreHorizontal />
        </button>
      </div>
      <h4 className="font-medium text-[var(--color-text-primary)] mb-2 line-clamp-2">{task.title}</h4>
      {task.due_date && (
        <div className="flex items-center text-xs text-[var(--color-text-secondary)] mt-2">
          <FiCalendar className="mr-1" />
          {format(new Date(task.due_date), 'MMM d, yyyy')}
        </div>
      )}
    </div>
  );
}

function DroppableColumn({ columnId, tasks, onAddTask }) {
  const { setNodeRef } = useDroppable({ id: columnId, data: { type: 'Column', columnId } });
  const [isAdding, setIsAdding] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (newTaskTitle.trim()) {
      onAddTask(columnId, newTaskTitle.trim());
      setNewTaskTitle('');
      setIsAdding(false);
    }
  };

  return (
    <div className="flex-shrink-0 w-[85vw] md:w-80 flex flex-col snap-center">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-lg flex items-center">
          {columnId === 'Todo' && <span className="w-2 h-2 rounded-full bg-gray-400 mr-2" />}
          {columnId === 'In Progress' && <span className="w-2 h-2 rounded-full bg-blue-400 mr-2" />}
          {columnId === 'Completed' && <span className="w-2 h-2 rounded-full bg-green-400 mr-2" />}
          {columnId}
        </h3>
        <span className="bg-[var(--color-text-primary)]/10 text-[var(--color-text-primary)] text-xs px-2 py-1 rounded-full">
          {tasks.length}
        </span>
      </div>
      
      <div 
        ref={setNodeRef} 
        className="flex-1 bg-[var(--color-surface-elevated)] border border-[var(--color-border)] rounded-xl p-4 overflow-y-auto custom-scrollbar flex flex-col min-h-[200px]"
      >
        <SortableContext 
          id={columnId}
          items={tasks.map(t => t.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="flex-1">
            {tasks.map(task => (
              <SortableTaskCard key={task.id} task={task} />
            ))}
          </div>
        </SortableContext>

        {isAdding ? (
          <form onSubmit={handleAddSubmit} className="mt-2">
            <input
              type="text"
              autoFocus
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              placeholder="Task title..."
              className="w-full bg-surface border-[var(--color-border-light)] rounded-xl px-3 py-2 text-sm focus:border-primary mb-2"
              onBlur={() => {
                if (!newTaskTitle.trim()) setIsAdding(false);
              }}
            />
            <div className="flex gap-2">
              <button type="submit" className="bg-primary/20 text-primary px-3 py-1 rounded text-xs font-medium hover:bg-primary/30">Add</button>
              <button type="button" onClick={() => setIsAdding(false)} className="text-[var(--color-text-secondary)] px-3 py-1 rounded text-xs hover:text-[var(--color-text-primary)]">Cancel</button>
            </div>
          </form>
        ) : (
          <button 
            onClick={() => setIsAdding(true)}
            className="mt-2 w-full py-2 flex items-center justify-center gap-2 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-text-primary)]/5 rounded-lg transition-colors border border-dashed border-[var(--color-border)]"
          >
            <FiPlus size={14} /> <span className="text-xs font-semibold">Add Task</span>
          </button>
        )}
      </div>
    </div>
  );
}

import { useAppStore } from '../store/useAppStore';

// --- Main Kanban Page ---
export default function KanbanPage() {
  const { addToast } = useToastStore();
  const { tasks, tasksLoaded, fetchTasks, setTasks } = useAppStore();
  const [isFetching, setIsFetching] = useState(!tasksLoaded);
  const [activeTask, setActiveTask] = useState(null);

  useEffect(() => {
    async function loadData() {
      setIsFetching(true);
      if (!tasksLoaded) {
        await fetchTasks(taskService);
      }
      setIsFetching(false);
    }
    loadData();
  }, [tasksLoaded, fetchTasks]);

  const refreshTasks = async () => {
    await fetchTasks(taskService);
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const getTasksByStatus = (status) => {
    const normalizedStatus = status === 'Todo' ? 'Pending' : status;
    return tasks.filter(t => t.status === normalizedStatus || t.status === status);
  };

  const handleAddTask = async (columnId, title) => {
    const status = columnId === 'Todo' ? 'Pending' : columnId;
    const newTask = {
      title,
      status,
      priority: 'Medium'
    };
    
    // Optimistic Add (with fake ID)
    const optimisticTask = { ...newTask, id: `temp-${Date.now()}`, created_at: new Date().toISOString() };
    setTasks([...tasks, optimisticTask]);

    try {
      await taskService.createTask(newTask);
      refreshTasks(); // Refresh to get real IDs and complete data
      addToast({ type: 'success', title: 'Task Created', message: '+5 XP gained' });
    } catch (err) {
      console.error("Failed to add task", err);
      setTasks(tasks.filter(t => t.id !== optimisticTask.id));
    }
  };

  const handleDragStart = (event) => {
    const { active } = event;
    const task = tasks.find(t => t.id === active.id);
    setActiveTask(task);
  };

  const handleDragOver = (event) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    const isActiveTask = active.data.current?.type === 'Task';
    const isOverColumn = over.data.current?.type === 'Column';
    const isOverTask = over.data.current?.type === 'Task';

    if (!isActiveTask) return;

    let overStatus = null;
    if (isOverColumn) {
      overStatus = overId === 'Todo' ? 'Pending' : overId;
    } else if (isOverTask) {
      const overTaskData = over.data.current?.task;
      overStatus = overTaskData.status;
    }

    if (!overStatus) return;

    const activeTaskIndex = tasks.findIndex(t => t.id === activeId);
    const activeTaskData = tasks[activeTaskIndex];

    if (activeTaskData && activeTaskData.status !== overStatus) {
      // Move task to new column locally during drag
      setTasks(tasks.map(t => 
        t.id === activeId ? { ...t, status: overStatus } : t
      ));
    }
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    const activeTaskFinal = activeTask;
    setActiveTask(null);

    if (!over) {
      // Revert if dropped outside
      refreshTasks(); 
      return;
    }

    const activeId = active.id;
    const overId = over.id;
    const isOverColumn = over.data.current?.type === 'Column';
    const isOverTask = over.data.current?.type === 'Task';

    let newStatus = activeTaskFinal.status;
    if (isOverColumn) {
      newStatus = overId === 'Todo' ? 'Pending' : overId;
    } else if (isOverTask) {
      const overTaskData = over.data.current?.task;
      newStatus = overTaskData.status;
    }

    if (activeTaskFinal.status !== newStatus) {
      if (newStatus === 'Completed') {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#8b5cf6', '#3b82f6', '#10b981']
        });
        addToast({ type: 'xp', title: 'Task Completed!', message: '+10 XP gained' });
      }

      try {
        await taskService.updateTask(activeId, { status: newStatus });
      } catch (error) {
        console.error("Failed to update status:", error);
        refreshTasks();
      }
    }
  };

  if (isFetching && tasks.length === 0) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">Kanban Board</h1>
          <p className="text-[var(--color-text-secondary)] text-xs mt-0.5">Drag and drop to move tasks</p>
        </div>
      </div>

      <div className="flex-1 flex space-x-6 overflow-x-auto pb-4 custom-scrollbar snap-x snap-mandatory">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          {COLUMNS.map(columnId => (
            <DroppableColumn 
              key={columnId} 
              columnId={columnId} 
              tasks={getTasksByStatus(columnId)} 
              onAddTask={handleAddTask}
            />
          ))}

          <DragOverlay>
            {activeTask ? (
              <div className="p-4 rounded-xl bg-surface-elevated border border-primary shadow-2xl opacity-80 cursor-grabbing rotate-3">
                <div className="flex justify-between items-start mb-2">
                  <span className={`text-xs px-2 py-1 rounded bg-[var(--color-text-primary)]/5 ${
                    activeTask.priority === 'High' ? 'text-[var(--color-danger)]' : 
                    activeTask.priority === 'Medium' ? 'text-[var(--color-warning)]' : 'text-[var(--color-success)]'
                  }`}>
                    {activeTask.priority || 'Medium'}
                  </span>
                </div>
                <h4 className="font-medium text-[var(--color-text-primary)] line-clamp-2">{activeTask.title}</h4>
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>
    </div>
  );
}
