import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiCheckCircle, FiClock, FiActivity, FiStar, FiZap, 
  FiPlus, FiEdit2, FiTrash2, FiCircle, FiCalendar, 
  FiSearch, FiFilter, FiGrid, FiList, FiArchive, FiCheckSquare 
} from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { statsService } from '../services/statsService';
import { taskService } from '../services/taskService';
import { useAppStore } from '../store/useAppStore';
import GlassCard from '../components/ui/GlassCard';
import ProgressRing from '../components/ui/ProgressRing';
import { format, isToday, isTomorrow, isThisWeek, isPast, parseISO } from 'date-fns';
import { Link } from 'react-router-dom';
import confetti from 'canvas-confetti';

const quotes = [
  "Focus on being productive instead of busy.",
  "The secret of getting ahead is getting started.",
  "Don't wait. The time will never be just right.",
  "It’s not always that we need to do more but rather that we need to focus on less."
];

export default function Dashboard() {
  const { user } = useAuth();
  const { 
    updateUserStats,
    tasks, tasksLoaded, setTasks, fetchTasks,
    dashboardStats: stats, dashboardStatsLoaded: statsLoaded, setDashboardStats: setStats, fetchDashboardStats 
  } = useAppStore();
  
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };
  
  // Local state for fetching status to avoid full-page spinner if already cached
  const [isFetching, setIsFetching] = useState(!tasksLoaded || !statsLoaded);
  const [quote] = useState(() => quotes[Math.floor(Math.random() * quotes.length)]);

  // Tasks Filtering & Sorting State
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all'); // all, today, tomorrow, week, overdue, completed, archived, high, medium, low
  const [sortBy, setSortBy] = useState('created_desc'); // created_desc, due_asc, priority, alpha
  const [viewMode, setViewMode] = useState('list'); // list, grid
  
  // Bulk Action State
  const [selectedTasks, setSelectedTasks] = useState(new Set());

  // AI Expanded State
  const [expandedAI, setExpandedAI] = useState(new Set());

  const toggleAIExpand = (taskId) => {
    const newExpanded = new Set(expandedAI);
    if (newExpanded.has(taskId)) {
      newExpanded.delete(taskId);
    } else {
      newExpanded.add(taskId);
    }
    setExpandedAI(newExpanded);
  };

  useEffect(() => {
    async function loadData() {
      setIsFetching(true);
      
      const promises = [];
      if (!statsLoaded) promises.push(fetchDashboardStats(statsService));
      if (!tasksLoaded) promises.push(fetchTasks(taskService));
      
      if (promises.length > 0) {
        await Promise.all(promises);
      }
      setIsFetching(false);
    }
    loadData();
  }, [statsLoaded, tasksLoaded, fetchDashboardStats, fetchTasks]);

  // Sync user stats to global layout state when stats load
  useEffect(() => {
    if (stats) {
      updateUserStats({
        xp: stats.user.xp,
        level: stats.user.level,
        current_streak: stats.user.current_streak,
        longest_streak: stats.user.longest_streak
      });
    }
  }, [stats, updateUserStats]);

  // Tasks Methods
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await taskService.deleteTask(id);
        setTasks(tasks.filter((task) => task.id !== id));
      } catch (error) {
        console.error('Error deleting task:', error);
      }
    }
  };

  const handleAIAnalyze = async (task) => {
    try {
      const updated = await taskService.analyzeTask(task.id);
      setTasks(tasks.map((t) => t.id === task.id ? updated : t));
      
      const newExpanded = new Set(expandedAI);
      newExpanded.add(task.id);
      setExpandedAI(newExpanded);
    } catch (error) {
      console.error('AI analysis failed:', error);
      alert('AI analysis failed. Please try again.');
    }
  };

  const toggleStatus = async (task) => {
    const newStatus = task.status === 'Completed' ? 'Pending' : 'Completed';
    try {
      await taskService.updateTask(task.id, { status: newStatus });
      setTasks(tasks.map((t) => t.id === task.id ? { ...t, status: newStatus } : t));
      
      // Instantly update stats on dashboard
      if (stats) {
        setStats({
          ...stats,
          tasks: {
            ...stats.tasks,
            completed: stats.tasks.completed + (newStatus === 'Completed' ? 1 : -1)
          }
        });
      }

      if (newStatus === 'Completed') {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#8b5cf6', '#3b82f6', '#10b981']
        });
      }
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const toggleSelection = (id) => {
    const newSelection = new Set(selectedTasks);
    if (newSelection.has(id)) {
      newSelection.delete(id);
    } else {
      newSelection.add(id);
    }
    setSelectedTasks(newSelection);
  };

  const selectAll = () => {
    if (selectedTasks.size === filteredAndSortedTasks.length) {
      setSelectedTasks(new Set());
    } else {
      setSelectedTasks(new Set(filteredAndSortedTasks.map(t => t.id)));
    }
  };

  const handleBulkAction = async (action) => {
    if (selectedTasks.size === 0) return;
    const taskIds = Array.from(selectedTasks);
    try {
      await taskService.bulkAction(taskIds, action);
      
      // Optimistic update
      if (action === 'delete') {
        setTasks(tasks.filter(t => !selectedTasks.has(t.id)));
      } else if (action === 'complete') {
        const newlyCompletedCount = tasks.filter(t => selectedTasks.has(t.id) && t.status !== 'Completed').length;
        setTasks(tasks.map(t => selectedTasks.has(t.id) ? { ...t, status: 'Completed' } : t));
        
        if (stats && newlyCompletedCount > 0) {
          setStats({
            ...stats,
            tasks: { ...stats.tasks, completed: stats.tasks.completed + newlyCompletedCount }
          });
        }
        
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      } else if (action === 'archive') {
        setTasks(tasks.map(t => selectedTasks.has(t.id) ? { ...t, is_archived: 1 } : t));
      }
      setSelectedTasks(new Set());
    } catch (error) {
      console.error('Bulk action failed', error);
    }
  };

  // Derived state: Filtered and Sorted Tasks
  const filteredAndSortedTasks = useMemo(() => {
    let result = tasks;

    // Search
    if (search) {
      const s = search.toLowerCase();
      result = result.filter(t => t.title.toLowerCase().includes(s) || (t.description && t.description.toLowerCase().includes(s)));
    }

    // Filter
    if (filter === 'archived') {
      result = result.filter(t => t.is_archived === 1);
    } else {
      result = result.filter(t => t.is_archived === 0);
      switch (filter) {
        case 'completed': result = result.filter(t => t.status === 'Completed'); break;
        case 'today': result = result.filter(t => t.due_date && isToday(parseISO(t.due_date))); break;
        case 'tomorrow': result = result.filter(t => t.due_date && isTomorrow(parseISO(t.due_date))); break;
        case 'week': result = result.filter(t => t.due_date && isThisWeek(parseISO(t.due_date))); break;
        case 'overdue': result = result.filter(t => t.status !== 'Completed' && t.due_date && isPast(parseISO(t.due_date)) && !isToday(parseISO(t.due_date))); break;
        case 'high': result = result.filter(t => t.priority === 'High'); break;
        case 'medium': result = result.filter(t => t.priority === 'Medium'); break;
        case 'low': result = result.filter(t => t.priority === 'Low'); break;
      }
    }

    // Sort
    result.sort((a, b) => {
      if (a.is_pinned !== b.is_pinned) return b.is_pinned - a.is_pinned;
      
      switch (sortBy) {
        case 'due_asc':
          if (!a.due_date) return 1;
          if (!b.due_date) return -1;
          return new Date(a.due_date) - new Date(b.due_date);
        case 'priority':
          const pVal = { 'High': 3, 'Medium': 2, 'Low': 1 };
          return (pVal[b.priority] || 0) - (pVal[a.priority] || 0);
        case 'alpha':
          return a.title.localeCompare(b.title);
        case 'created_desc':
        default:
          return new Date(b.created_at) - new Date(a.created_at);
      }
    });

    return result;
  }, [tasks, search, filter, sortBy]);

  if (isFetching && (!stats || tasks.length === 0)) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!stats) return null;

  const progress = stats.tasks.completion_percentage;

  return (
    <div className="space-y-8 pb-12 max-w-6xl mx-auto">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="relative overflow-hidden rounded-xl bg-[var(--color-surface-elevated)] border border-[var(--color-border)] p-8 sm:p-10"
      >
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-4 flex-1 text-center md:text-left">
            <motion.h1 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="text-3xl sm:text-4xl font-bold tracking-tight text-[var(--color-text-primary)]"
            >
              {getGreeting()}, <span className="greeting-name font-bold text-[var(--color-text-primary)]">{user?.name?.split(' ')[0] || 'User'}</span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-[var(--color-text-secondary)] text-base max-w-xl"
            >
              "{quote}"
            </motion.p>
            <div className="flex flex-wrap gap-3 mt-4">
              <div className="flex items-center space-x-2 border border-[var(--color-border)] bg-[var(--color-surface)] px-3.5 py-1.5 rounded-lg">
                <FiStar className="text-[var(--color-warning)]" />
                <span className="font-medium text-xs">Level {stats.user.level} ({stats.user.xp} XP)</span>
              </div>
              <div className="flex items-center space-x-2 border border-[var(--color-border)] bg-[var(--color-surface)] px-3.5 py-1.5 rounded-lg">
                <FiZap className="text-[var(--color-warning)]" />
                <span className="font-medium text-xs">{stats.user.current_streak} Day Streak</span>
              </div>
            </div>
          </div>
          
          <div className="shrink-0 flex flex-col items-center">
            <ProgressRing progress={progress} size={110} strokeWidth={8} color="var(--color-accent)" />
            <span className="text-xs text-[var(--color-text-secondary)] mt-2 font-medium">Task Completion</span>
          </div>
        </div>
      </motion.div>

      {/* Widgets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <GlassCard delay={0.05} className="flex items-center space-x-4">
          <div className="p-3 border border-[var(--color-border)] bg-[var(--color-surface-elevated)] text-[var(--color-text-secondary)] rounded-xl">
            <FiCheckCircle size={20} />
          </div>
          <div>
            <p className="text-[var(--color-text-secondary)] text-xs font-medium">Completed Tasks</p>
            <p className="text-2xl font-bold text-[var(--color-text-primary)]">{stats.tasks.completed}</p>
          </div>
        </GlassCard>
        
        <GlassCard delay={0.1} className="flex items-center space-x-4">
          <div className="p-3 border border-[var(--color-border)] bg-[var(--color-surface-elevated)] text-[var(--color-text-secondary)] rounded-xl">
            <FiActivity size={20} />
          </div>
          <div>
            <p className="text-[var(--color-text-secondary)] text-xs font-medium">Productivity Score</p>
            <p className="text-2xl font-bold text-[var(--color-text-primary)]">
              {stats.productivity.score}
            </p>
          </div>
        </GlassCard>

        <GlassCard delay={0.15} className="flex items-center space-x-4 h-full bg-[var(--color-surface)]">
          <div className="p-3 border border-[var(--color-border)] bg-[var(--color-surface-elevated)] text-[var(--color-text-secondary)] rounded-xl">
            <FiClock size={20} />
          </div>
          <div>
            <p className="text-[var(--color-text-secondary)] text-xs font-medium">Focus Time Today</p>
            <p className="text-2xl font-bold text-[var(--color-text-primary)]">{stats.productivity.focus_minutes_today} min</p>
          </div>
        </GlassCard>
        
        <GlassCard delay={0.2} className="flex flex-col justify-center h-full">
          <p className="text-[var(--color-text-secondary)] text-xs font-medium mb-2">Weekly Goal</p>
          <div className="flex justify-between text-xs mb-1">
            <span className="font-semibold">{stats.weekly_goal.completed} / {stats.weekly_goal.target} Tasks</span>
            <span className="text-[var(--color-text-secondary)]">{Math.round((stats.weekly_goal.completed / stats.weekly_goal.target) * 100)}%</span>
          </div>
          <div className="progress-bar-custom bg-[var(--color-border)] w-full">
            <div 
              className="progress-bar-fill bg-[var(--color-accent)]" 
              style={{ width: `${Math.min(100, (stats.weekly_goal.completed / stats.weekly_goal.target) * 100)}%` }}
            ></div>
          </div>
        </GlassCard>
      </div>

      {/* Main Task List Area */}
      <div className="pt-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h2 className="text-xl font-bold text-[var(--color-text-primary)]">My Tasks</h2>
            <p className="text-[var(--color-text-secondary)] mt-0.5 text-xs">Manage and prioritize your work</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex bg-[var(--color-surface-elevated)] border border-[var(--color-border)] rounded-lg p-1">
              <button onClick={() => setViewMode('list')} className={`p-1.5 rounded transition-colors ${viewMode === 'list' ? 'bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text-primary)]' : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'}`}><FiList size={14} /></button>
              <button onClick={() => setViewMode('grid')} className={`p-1.5 rounded transition-colors ${viewMode === 'grid' ? 'bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text-primary)]' : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'}`}><FiGrid size={14} /></button>
            </div>
            <Link to="/tasks/new" className="flex items-center space-x-2 bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white text-xs font-semibold px-4 py-2 rounded-lg transition-all shadow-sm">
              <FiPlus />
              <span>New Task</span>
            </Link>
          </div>
        </div>

        {/* Toolbar */}
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-4 mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-80">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-secondary)] text-sm" />
            <input 
              type="text" 
              placeholder="Search tasks..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ paddingLeft: '2.25rem' }}
              className="w-full pr-4 py-1.5 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg focus:border-accent transition-colors text-xs"
            />
          </div>
          
          <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto pb-1 md:pb-0 custom-scrollbar">
            <div className="flex items-center gap-2">
              <FiFilter className="text-[var(--color-text-secondary)] text-xs" />
              <select value={filter} onChange={(e) => setFilter(e.target.value)} className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg text-xs px-2.5 py-1.5 min-w-[120px]">
                <option value="all">All Tasks</option>
                <option value="today">Today</option>
                <option value="tomorrow">Tomorrow</option>
                <option value="week">This Week</option>
                <option value="overdue">Overdue</option>
                <option value="completed">Completed</option>
                <option value="archived">Archived</option>
                <option value="high">High Priority</option>
              </select>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-[var(--color-text-secondary)] text-xs whitespace-nowrap">Sort:</span>
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg text-xs px-2.5 py-1.5">
                <option value="created_desc">Newest</option>
                <option value="due_asc">Due Date</option>
                <option value="priority">Priority</option>
                <option value="alpha">Alphabetical</option>
              </select>
            </div>
          </div>
        </div>

        {/* Bulk Actions */}
        <AnimatePresence>
          {selectedTasks.size > 0 && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden mb-6"
            >
              <div className="border border-[var(--color-border)] bg-[var(--color-surface-elevated)] rounded-xl p-3 flex items-center justify-between">
                <span className="text-xs font-semibold text-[var(--color-text-primary)]">{selectedTasks.size} tasks selected</span>
                <div className="flex flex-wrap gap-2 mt-2 sm:mt-0">
                  <button onClick={() => handleBulkAction('complete')} className="px-3 py-1 text-xs border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-success)] rounded-lg hover:bg-[var(--color-success-dim)] transition-colors flex items-center gap-1.5"><FiCheckCircle /> Complete</button>
                  <button onClick={() => handleBulkAction('archive')} className="px-3 py-1 text-xs border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-warning)] rounded-lg hover:bg-[var(--color-warning-dim)] transition-colors flex items-center gap-1.5"><FiArchive /> Archive</button>
                  <button onClick={() => handleBulkAction('delete')} className="px-3 py-1 text-xs border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-danger)] rounded-lg hover:bg-[var(--color-danger-dim)] transition-colors flex items-center gap-1.5"><FiTrash2 /> Delete</button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Task List/Grid */}
        <div className="mb-4 flex items-center gap-3 px-2">
          <button onClick={selectAll} className="text-[var(--color-text-secondary)] hover:text-primary transition-colors">
            {selectedTasks.size === filteredAndSortedTasks.length && filteredAndSortedTasks.length > 0 ? <FiCheckSquare size={18} className="text-[var(--color-text-primary)]"/> : <div className="w-[18px] h-[18px] border-2 border-[var(--color-border)] rounded-sm"></div>}
          </button>
          <span className="text-sm text-[var(--color-text-muted)]">Select All</span>
        </div>

        {filteredAndSortedTasks.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20 border border-[var(--color-border)] rounded-xl">
            <FiCheckCircle size={36} className="mx-auto text-[var(--color-text-muted)] mb-3" />
            <h2 className="text-lg font-bold mb-1">No tasks found</h2>
            <p className="text-[var(--color-text-secondary)] text-sm">Try adjusting your filters or search query.</p>
          </motion.div>
        ) : (
          <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" : "space-y-3"}>
            <AnimatePresence>
              {filteredAndSortedTasks.map((task) => (
                <motion.div
                  layout
                  key={task.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className={`border rounded-xl p-4 transition-colors relative ${
                    task.status === 'Completed' ? 'opacity-60' : ''
                  } ${selectedTasks.has(task.id) ? 'border-[var(--color-text-primary)]' : 'border-[var(--color-border)]'} flex flex-col w-full`}
                >
                  <div className={`flex ${viewMode === 'list' ? 'flex-col sm:flex-row sm:items-center justify-between gap-4 w-full' : 'flex-col gap-3 w-full'}`}>
                    {/* Left side: Selection + CompleteCircle + Title & Description */}
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <button onClick={() => toggleSelection(task.id)} className="mt-1 shrink-0">
                        {selectedTasks.has(task.id) ? (
                          <FiCheckSquare size={16} className="text-[var(--color-text-primary)]" />
                        ) : (
                          <div className="w-4 h-4 border-2 border-[var(--color-border)] hover:border-[var(--color-text-primary)] rounded-sm transition-colors" />
                        )}
                      </button>

                      <button onClick={() => toggleStatus(task)} className="mt-0.5 shrink-0">
                        {task.status === 'Completed' ? (
                          <FiCheckCircle size={18} className="text-[var(--color-text-primary)]" />
                        ) : (
                          <FiCircle size={18} className="text-[var(--color-border)] hover:text-[var(--color-text-primary)] transition-colors" />
                        )}
                      </button>

                      <div className="flex-1 min-w-0">
                        <h3 className={`font-semibold text-xs leading-5 truncate ${task.status === 'Completed' ? 'line-through text-[var(--color-text-muted)]' : 'text-[var(--color-text-primary)]'}`}>
                          {task.title}
                        </h3>
                        {task.description && (
                          <p className={`text-[11px] text-[var(--color-text-secondary)] mt-0.5 ${viewMode === 'list' ? 'line-clamp-1' : 'line-clamp-2'}`}>{task.description}</p>
                        )}
                      </div>
                    </div>

                    {/* Right side: Priority + Date + Actions */}
                    <div className={`flex items-center gap-3 shrink-0 ${viewMode === 'list' ? '' : 'justify-between border-t border-[var(--color-border)] pt-3 w-full'}`}>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[9px] font-semibold px-2 py-0.5 rounded border border-[var(--color-border)] text-[var(--color-text-secondary)] bg-[var(--color-surface-elevated)]">
                          {task.priority || 'Medium'}
                        </span>
                        {task.due_date && (
                          <div className="flex items-center text-[9px] font-semibold text-[var(--color-text-secondary)] border border-[var(--color-border)] px-2 py-0.5 rounded bg-[var(--color-surface-elevated)]">
                            <FiCalendar className="mr-1 text-[9px]" />
                            {format(parseISO(task.due_date), 'MMM d')}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-1 opacity-80 hover:opacity-100 transition-opacity">
                        <button onClick={() => handleAIAnalyze(task)} className="p-1 border border-[var(--color-border)] hover:bg-[var(--color-surface-elevated)] rounded transition-colors text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]" title="AI Analyze">
                          <FiZap size={12} />
                        </button>
                        <Link to={`/tasks/${task.id}/edit`} className="p-1 border border-[var(--color-border)] hover:bg-[var(--color-surface-elevated)] rounded transition-colors text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]" title="Edit">
                          <FiEdit2 size={12} />
                        </Link>
                        <button onClick={() => handleDelete(task.id)} className="p-1 border border-[var(--color-border)] hover:bg-[var(--color-surface-elevated)] rounded transition-colors text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]" title="Delete">
                          <FiTrash2 size={12} />
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  {/* Embedded AI Results Panel if AI has run on this task */}
                  {(task.summary || task.category || task.priority) && (
                    <div className="mt-4 pt-4 border-t border-[var(--color-border)] w-full">
                      <button 
                        onClick={() => toggleAIExpand(task.id)}
                        className="text-xs font-semibold text-[var(--color-text-primary)] flex items-center gap-2 mb-2 transition-colors"
                      >
                        <FiZap /> {expandedAI.has(task.id) ? 'Hide AI Insights' : 'View AI Insights'}
                      </button>
                      
                      <AnimatePresence>
                        {expandedAI.has(task.id) && (
                          <motion.div 
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="bg-[var(--color-surface-elevated)] border border-[var(--color-border)] rounded-lg p-3.5 mt-2">
                              {task.summary && <p className="text-xs text-[var(--color-text-secondary)] mb-2.5">{task.summary}</p>}
                              
                              <div className="flex flex-wrap gap-1.5 mb-2.5">
                                {task.category && <span className="text-[10px] px-2 py-0.5 border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-secondary)] rounded">Category: {task.category}</span>}
                                {task.priority && <span className="text-[10px] px-2 py-0.5 border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-secondary)] rounded">Priority: {task.priority}</span>}
                                {task.ai_estimated_time && <span className="text-[10px] px-2 py-0.5 border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-secondary)] rounded flex items-center gap-1"><FiClock size={9} /> {task.ai_estimated_time}</span>}
                              </div>

                              {task.ai_actionable_steps && task.ai_actionable_steps.length > 0 && (
                                <div className="mb-2.5">
                                  <h4 className="text-[10px] font-semibold text-[var(--color-text-secondary)] mb-1 uppercase tracking-wider">Actionable Steps</h4>
                                  <ul className="space-y-1">
                                    {task.ai_actionable_steps.map((step, idx) => (
                                      <li key={idx} className="text-xs text-[var(--color-text-secondary)] flex items-start gap-1.5">
                                        <span className="text-[var(--color-text-muted)] mt-0.5">•</span> {step}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}

                              {task.ai_potential_roadblocks && (
                                <div>
                                  <h4 className="text-[10px] font-semibold text-[var(--color-text-secondary)] mb-1 uppercase tracking-wider">Potential Roadblocks</h4>
                                  <p className="text-xs text-[var(--color-text-secondary)]">{task.ai_potential_roadblocks}</p>
                                </div>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
