import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { taskService } from '../services/taskService';
import { 
  format, 
  addMonths, 
  subMonths, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  isSameMonth, 
  isSameDay, 
  addDays, 
  isToday 
} from 'date-fns';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

export default function CalendarPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTasks() {
      try {
        const data = await taskService.getTasks();
        setTasks(data);
      } catch (error) {
        console.error('Error fetching tasks:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchTasks();
  }, []);

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const jumpToToday = () => setCurrentMonth(new Date());

  const renderHeader = () => {
    return (
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[var(--color-text-primary)] to-[var(--color-text-secondary)]">Calendar</h1>
          <p className="text-[var(--color-text-secondary)] mt-1">Timeline & Monthly overview</p>
        </div>
        <div className="flex items-center space-x-4 bg-surface-elevated/50 p-2 rounded-xl border border-[var(--color-border-light)]">
          <button onClick={prevMonth} className="p-2 hover:bg-[var(--color-text-primary)]/10 rounded-lg transition-colors">
            <FiChevronLeft size={20} />
          </button>
          <span className="text-lg font-semibold min-w-[120px] text-center">
            {format(currentMonth, 'MMMM yyyy')}
          </span>
          <button onClick={nextMonth} className="p-2 hover:bg-[var(--color-text-primary)]/10 rounded-lg transition-colors">
            <FiChevronRight size={20} />
          </button>
          <button onClick={jumpToToday} className="px-4 py-1 text-sm bg-primary/20 text-primary rounded-lg hover:bg-primary/30 transition-colors">
            Today
          </button>
        </div>
      </div>
    );
  };

  const renderDays = () => {
    const days = [];
    const startDate = startOfWeek(currentMonth);
    for (let i = 0; i < 7; i++) {
      days.push(
        <div key={i} className="text-center font-semibold text-[var(--color-text-secondary)] text-sm py-2">
          {format(addDays(startDate, i), 'EEEE')}
        </div>
      );
    }
    return <div className="grid grid-cols-7 mb-2">{days}</div>;
  };

  const renderCells = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const rows = [];
    let days = [];
    let day = startDate;
    let formattedDate = '';

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        formattedDate = format(day, 'd');
        const cloneDay = day;
        
        // Find tasks for this day
        const dayTasks = tasks.filter(t => t.due_date && isSameDay(new Date(t.due_date), cloneDay));

        days.push(
          <div
            key={day.toString()}
            className={`min-h-[120px] p-2 border border-[var(--color-border-light)] transition-colors ${
              !isSameMonth(day, monthStart)
                ? 'bg-transparent text-[var(--color-text-muted)]'
                : isToday(day) 
                  ? 'bg-primary/10' 
                  : 'bg-surface-elevated/30 hover:bg-surface-elevated'
            }`}
          >
            <div className={`flex justify-end mb-2 ${isToday(day) ? 'text-primary font-bold' : ''}`}>
              <span className={`w-8 h-8 flex items-center justify-center rounded-full ${isToday(day) ? 'bg-primary text-[var(--color-text-primary)]' : ''}`}>
                {formattedDate}
              </span>
            </div>
            <div className="space-y-1 overflow-y-auto max-h-[80px] custom-scrollbar">
              {dayTasks.map((t, idx) => (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.1 }}
                  key={t.id} 
                  className={`text-xs p-1 px-2 rounded truncate ${
                    t.status === 'Completed' ? 'bg-[var(--color-success-dim)] text-green-300 line-through' :
                    t.priority === 'High' ? 'bg-[var(--color-danger-dim)] text-[var(--color-danger)]' : 'bg-primary/20 text-primary-light'
                  }`}
                >
                  {t.title}
                </motion.div>
              ))}
            </div>
          </div>
        );
        day = addDays(day, 1);
      }
      rows.push(
        <div key={day.toString()} className="grid grid-cols-7">
          {days}
        </div>
      );
      days = [];
    }
    return <div className="glass bg-surface-elevated/40 border border-[var(--color-border-light)] rounded-2xl overflow-hidden shadow-2xl">{rows}</div>;
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="pb-12">
      {renderHeader()}
      {renderDays()}
      {renderCells()}
    </div>
  );
}
