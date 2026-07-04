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
  const { updateUserStats } = useAppStore();
  
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };
  // Dashboard Stats State
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [quote] = useState(() => quotes[Math.floor(Math.random() * quotes.length)]);

  // Tasks State
  const [tasks, setTasks] = useState([]);
  const [tasksLoading, setTasksLoading] = useState(true);
  
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
    async function fetchData() {
      try {
        const [statsData, tasksData] = await Promise.all([
          statsService.getDashboardStats(),
          taskService.getTasks()
        ]);
        
        setStats(statsData);
        setTasks(tasksData);
        
        // Sync gamification state to global store
        updateUserStats({
          xp: statsData.user.xp,
          level: statsData.user.level,
          current_streak: statsData.user.current_streak,
          longest_streak: statsData.user.longest_streak
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setStatsLoading(false);
        setTasksLoading(false);
      }
    }
    fetchData();
  }, [updateUserStats]);

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
        setTasks(tasks.map(t => selectedTasks.has(t.id) ? { ...t, status: 'Completed' } : t));
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

  if (statsLoading || tasksLoading || !stats) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const progress = stats.tasks.completion_percentage;

  return (
    <div className="space-y-8 pb-12 max-w-6xl mx-auto">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-surface-elevated/80 to-surface border border-[var(--color-border-light)] p-8 sm:p-12 shadow-2xl glass"
      >
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-primary/20 rounded-full blur-[80px]" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-accent/20 rounded-full blur-[100px]" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-4 flex-1 text-center md:text-left">
            <motion.h1 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="text-4xl sm:text-5xl font-bold"
            >
              {getGreeting()}, <span className="greeting-name font-bold">{user?.name?.split(' ')[0] || 'User'}</span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-[var(--color-text-secondary)] text-lg italic max-w-xl"
            >
              "{quote}"
            </motion.p>
            <div className="flex flex-wrap gap-4 mt-6">
              <div className="flex items-center space-x-2 bg-[var(--color-text-primary)]/5 px-4 py-2 rounded-full">
                <FiStar className="text-[var(--color-warning)]" />
                <span className="font-medium text-sm">Level {stats.user.level} ({stats.user.xp} XP)</span>
              </div>
              <div className="flex items-center space-x-2 bg-[var(--color-text-primary)]/5 px-4 py-2 rounded-full">
                <FiZap className="text-[var(--color-warning)]" />
                <span className="font-medium text-sm">{stats.user.current_streak} Day Streak</span>
              </div>
            </div>
          </div>
          
          <div className="shrink-0 flex flex-col items-center">
            <ProgressRing progress={progress} size={140} strokeWidth={10} />
            <span className="text-sm text-[var(--color-text-secondary)] mt-2 font-medium">Task Completion</span>
          </div>
        </div>
      </motion.div>

      {/* Widgets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <GlassCard delay={0.1} className="flex items-center space-x-4">
          <div className="p-3 bg-primary/20 text-primary rounded-xl">
            <FiCheckCircle size={24} />
          </div>
          <div>
            <p className="text-[var(--color-text-secondary)] text-sm">Completed Tasks</p>
            <p className="text-2xl font-bold">{stats.tasks.completed}</p>
          </div>
        </GlassCard>
        
        <GlassCard delay={0.2} className="flex items-center space-x-4">
          <div className="p-3 bg-blue-500/20 text-blue-400 rounded-xl">
            <FiActivity size={24} />
          </div>
          <div>
            <p className="text-[var(--color-text-secondary)] text-sm">Productivity Score</p>
            <p className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-[var(--color-primary)]">
              {stats.productivity.score}
            </p>
          </div>
        </GlassCard>

        <GlassCard delay={0.3} className="flex items-center space-x-4 h-full bg-gradient-to-br from-surface-elevated to-surface">
          <div className="p-3 bg-[var(--color-warning-dim)] text-[var(--color-warning)] rounded-xl">
            <FiClock size={24} />
          </div>
          <div>
            <p className="text-[var(--color-text-secondary)] text-sm">Focus Time Today</p>
            <p className="text-xl font-bold text-[var(--color-warning)]">{stats.productivity.focus_minutes_today} min</p>
          </div>
        </GlassCard>
        
        <GlassCard delay={0.4} className="flex flex-col justify-center h-full">
          <p className="text-[var(--color-text-secondary)] text-sm mb-2">Weekly Goal</p>
          <div className="flex justify-between text-sm mb-1">
            <span>{stats.weekly_goal.completed} / {stats.weekly_goal.target} Tasks</span>
            <span>{Math.round((stats.weekly_goal.completed / stats.weekly_goal.target) * 100)}%</span>
          </div>
          <div className="progress-bar-custom bg-[var(--color-text-primary)]/10 w-full">
            <div 
              className="progress-bar-fill bg-gradient-to-r from-[var(--color-purple)] to-[var(--color-primary)]" 
              style={{ width: `${Math.min(100, (stats.weekly_goal.completed / stats.weekly_goal.target) * 100)}%` }}
            ></div>
          </div>
        </GlassCard>
      </div>

      {/* Main Task List Area */}
      <div className="pt-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[var(--color-text-primary)] to-[var(--color-text-secondary)]">My Tasks</h2>
            <p className="text-[var(--color-text-secondary)] mt-1 text-sm">Manage and prioritize your work</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex bg-surface-glass border border-[var(--color-border-light)] rounded-xl p-1">
              <button onClick={() => setViewMode('list')} className={`p-2 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-[var(--color-text-primary)]/10 text-primary' : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'}`}><FiList /></button>
              <button onClick={() => setViewMode('grid')} className={`p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-[var(--color-text-primary)]/10 text-primary' : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'}`}><FiGrid /></button>
            </div>
            <Link to="/tasks/new" className="flex items-center space-x-2 bg-primary hover:bg-primary/90 text-[var(--color-text-primary)] px-4 py-2 rounded-xl transition-all shadow-[0_0_20px_rgba(var(--color-primary),0.3)]">
              <FiPlus />
              <span>New Task</span>
            </Link>
          </div>
        </div>

        {/* Toolbar */}
        <div className="glass border-[var(--color-border-light)] rounded-2xl p-4 mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-96">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-secondary)]" />
            <input 
              type="text" 
              placeholder="Search tasks..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-surface border-[var(--color-border-light)] rounded-xl focus:border-primary transition-colors text-sm"
            />
          </div>
          
          <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 custom-scrollbar">
            <div className="flex items-center gap-2">
              <FiFilter className="text-[var(--color-text-secondary)]" />
              <select value={filter} onChange={(e) => setFilter(e.target.value)} className="bg-surface border-[var(--color-border-light)] rounded-lg text-sm px-3 py-2 min-w-[120px]">
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
              <span className="text-[var(--color-text-secondary)] text-sm whitespace-nowrap">Sort:</span>
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="bg-surface border-[var(--color-border-light)] rounded-lg text-sm px-3 py-2">
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
              <div className="glass border border-primary/30 bg-primary/10 rounded-xl p-3 flex items-center justify-between">
                <span className="text-sm font-medium">{selectedTasks.size} tasks selected</span>
                <div className="flex flex-wrap gap-2 mt-2 sm:mt-0">
                  <button onClick={() => handleBulkAction('complete')} className="px-3 py-1.5 text-xs bg-[var(--color-success-dim)] text-[var(--color-success)] rounded-lg hover:bg-[var(--color-success-dim)] transition-colors flex items-center gap-2"><FiCheckCircle /> Complete</button>
                  <button onClick={() => handleBulkAction('archive')} className="px-3 py-1.5 text-xs bg-[var(--color-warning-dim)] text-[var(--color-warning)] rounded-lg hover:bg-[var(--color-warning-dim)] transition-colors flex items-center gap-2"><FiArchive /> Archive</button>
                  <button onClick={() => handleBulkAction('delete')} className="px-3 py-1.5 text-xs bg-[var(--color-danger-dim)] text-[var(--color-danger)] rounded-lg hover:bg-[var(--color-danger-dim)] transition-colors flex items-center gap-2"><FiTrash2 /> Delete</button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Task List/Grid */}
        <div className="mb-4 flex items-center gap-3 px-2">
          <button onClick={selectAll} className="text-[var(--color-text-secondary)] hover:text-primary transition-colors">
            {selectedTasks.size === filteredAndSortedTasks.length && filteredAndSortedTasks.length > 0 ? <FiCheckSquare size={18} className="text-primary"/> : <div className="w-[18px] h-[18px] border-2 border-[var(--color-text-muted)] rounded-sm"></div>}
          </button>
          <span className="text-sm text-[var(--color-text-muted)]">Select All</span>
        </div>

        {filteredAndSortedTasks.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20 glass rounded-3xl">
            <FiCheckCircle size={48} className="mx-auto text-primary/30 mb-4" />
            <h2 className="text-xl font-bold mb-2">No tasks found</h2>
            <p className="text-[var(--color-text-secondary)]">Try adjusting your filters or search query.</p>
          </motion.div>
        ) : (
          <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" : "space-y-3"}>
            <AnimatePresence>
              {filteredAndSortedTasks.map((task) => (
                <motion.div
                  layout
                  key={task.id}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className={`glass border rounded-2xl p-4 transition-all group relative ${
                    task.status === 'Completed' ? 'bg-surface-elevated/20 opacity-60' : 'bg-surface-elevated/60 hover:border-[var(--color-border)]'
                  } ${selectedTasks.has(task.id) ? 'border-primary ring-1 ring-primary/50' : 'border-[var(--color-border-light)]'} ${viewMode === 'list' ? 'flex items-center' : 'flex flex-col'}`}
                >
                  <div className={`absolute top-4 ${viewMode === 'list' ? 'left-4' : 'right-4'} z-10`}>
                    <button onClick={() => toggleSelection(task.id)}>
                      {selectedTasks.has(task.id) ? <FiCheckSquare size={18} className="text-primary"/> : <div className="w-[18px] h-[18px] border-2 border-[var(--color-text-muted)] hover:border-[var(--color-text-primary)] rounded-sm transition-colors"></div>}
                    </button>
                  </div>

                  <div className={`${viewMode === 'list' ? 'flex items-center flex-1 ml-8 sm:ml-10' : 'flex-1 mt-6'}`}>
                    <button onClick={() => toggleStatus(task)} className={`shrink-0 ${viewMode === 'list' ? 'mr-4' : 'mb-3'}`}>
                      {task.status === 'Completed' ? <FiCheckCircle size={22} className="text-[var(--color-success)]" /> : <FiCircle size={22} className="text-[var(--color-text-secondary)] hover:text-primary transition-colors" />}
                    </button>
                    
                    <div className="flex-1 min-w-0">
                      <h3 className={`font-medium truncate ${task.status === 'Completed' ? 'line-through text-[var(--color-text-muted)]' : 'text-[var(--color-text-primary)]'}`}>
                        {task.title}
                      </h3>
                      {task.description && (
                        <p className={`text-xs text-[var(--color-text-secondary)] mt-1 ${viewMode === 'list' ? 'line-clamp-1' : 'line-clamp-2'}`}>{task.description}</p>
                      )}
                    </div>
                  </div>

                  <div className={`flex items-center gap-3 ${viewMode === 'list' ? 'mt-3 sm:mt-0 ml-4 sm:ml-4 shrink-0 flex-wrap sm:flex-nowrap' : 'mt-4 pt-4 border-t border-[var(--color-border-light)] w-full justify-between'}`}>
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] px-2 py-1 rounded bg-[var(--color-text-primary)]/5 ${
                        task.priority === 'High' ? 'text-[var(--color-danger)]' : task.priority === 'Medium' ? 'text-[var(--color-warning)]' : 'text-[var(--color-success)]'
                      }`}>
                        {task.priority || 'Medium'}
                      </span>
                      {task.due_date && (
                        <div className="flex items-center text-[10px] text-[var(--color-text-secondary)] bg-[var(--color-text-primary)]/5 px-2 py-1 rounded">
                          <FiCalendar className="mr-1" />
                          {format(parseISO(task.due_date), 'MMM d')}
                        </div>
                      )}
                    </div>
                    
                    <div className={`flex items-center gap-1 ${viewMode === 'list' ? 'opacity-0 group-hover:opacity-100 transition-opacity' : ''}`}>
                      <button onClick={() => handleAIAnalyze(task)} className="p-1.5 text-[var(--color-purple)] hover:text-[var(--color-purple)] hover:bg-[var(--color-purple-dim)] rounded transition-colors" title="AI Analyze">
                        <FiZap size={14} />
                      </button>
                      <Link to={`/tasks/${task.id}/edit`} className="p-1.5 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-text-primary)]/10 rounded transition-colors" title="Edit">
                        <FiEdit2 size={14} />
                      </Link>
                      <button onClick={() => handleDelete(task.id)} className="p-1.5 text-[var(--color-text-secondary)] hover:text-[var(--color-danger)] hover:bg-[var(--color-danger-dim)] rounded transition-colors" title="Delete">
                        <FiTrash2 size={14} />
                      </button>
                    </div>
                  </div>
                  
                  {/* Embedded AI Results Panel if AI has run on this task */}
                  {(task.summary || task.category || task.priority) && (
                    <div className="mt-4 pt-4 border-t border-[var(--color-border-light)] w-full">
                      <button 
                        onClick={() => toggleAIExpand(task.id)}
                        className="text-xs font-semibold text-[var(--color-purple)] hover:text-[var(--color-purple)] flex items-center gap-2 mb-2 transition-colors"
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
                            <div className="bg-[var(--color-purple-dim)] border border-[var(--color-purple)]/30 rounded-xl p-4 mt-2">
                              {task.summary && <p className="text-xs text-[var(--color-text-secondary)] mb-2">{task.summary}</p>}
                              <div className="flex gap-2">
                                {task.category && <span className="text-[10px] px-2 py-1 bg-[var(--color-purple-dim)] text-[var(--color-purple)] rounded">Category: {task.category}</span>}
                                {task.priority && <span className="text-[10px] px-2 py-1 bg-[var(--color-purple-dim)] text-[var(--color-purple)] rounded">Priority: {task.priority}</span>}
                              </div>
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
