import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPlay, FiPause, FiRotateCcw, FiCoffee, FiMonitor, FiSettings } from 'react-icons/fi';
import { useAppStore } from '../store/useAppStore';
import api from '../services/api';

const quotes = [
  "Deep work is the superpower of the 21st century.",
  "Distraction is the enemy of greatness.",
  "Focus on being productive instead of busy.",
  "You don't get results by focusing on results. You get results by focusing on the actions that produce results."
];

export default function FocusModePage() {
  const { pomodoroState, updatePomodoro, settings, updateSettings } = useAppStore();
  const [showSettings, setShowSettings] = useState(false);
  const timerRef = useRef(null);

  // Helper to format mm:ss
  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    if (pomodoroState.isRunning) {
      timerRef.current = setInterval(() => {
        if (pomodoroState.timeLeft > 0) {
          updatePomodoro({ timeLeft: pomodoroState.timeLeft - 1 });
        } else {
          // Timer finished
          clearInterval(timerRef.current);
          handleTimerComplete();
        }
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [pomodoroState.isRunning, pomodoroState.timeLeft]);

  const playAlarm = () => {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      
      const playBeep = (time, freq) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, time);
        
        gain.gain.setValueAtTime(0, time);
        gain.gain.linearRampToValueAtTime(0.5, time + 0.1);
        gain.gain.linearRampToValueAtTime(0, time + 0.3);
        
        osc.start(time);
        osc.stop(time + 0.4);
      };

      const now = ctx.currentTime;
      playBeep(now, 800);
      playBeep(now + 0.4, 800);
      playBeep(now + 0.8, 1200);
    } catch (e) {
      console.error('Audio API error', e);
    }
  };

  const handleTimerComplete = async () => {
    if (settings.soundEnabled) {
      playAlarm();
    }

    if (pomodoroState.mode === 'focus') {
      try {
        // Log focus time to backend
        await api.post('/gamification/focus/complete', { duration: settings.workDuration });
      } catch (error) {
        console.error('Failed to log focus session:', error);
      }

      const newCompleted = pomodoroState.completedPomodoros + 1;
      const nextMode = newCompleted % 4 === 0 ? 'longBreak' : 'shortBreak';
      updatePomodoro({
        isRunning: false,
        mode: nextMode,
        completedPomodoros: newCompleted,
        timeLeft: (nextMode === 'longBreak' ? settings.longBreakDuration : settings.shortBreakDuration) * 60
      });
    } else {
      updatePomodoro({
        isRunning: false,
        mode: 'focus',
        timeLeft: settings.workDuration * 60
      });
    }
  };

  const toggleTimer = () => {
    updatePomodoro({ isRunning: !pomodoroState.isRunning });
  };

  const resetTimer = () => {
    const duration = pomodoroState.mode === 'focus' 
      ? settings.workDuration 
      : pomodoroState.mode === 'shortBreak' 
        ? settings.shortBreakDuration 
        : settings.longBreakDuration;
        
    updatePomodoro({ isRunning: false, timeLeft: duration * 60 });
  };

  const switchMode = (mode) => {
    const duration = mode === 'focus' 
      ? settings.workDuration 
      : mode === 'shortBreak' 
        ? settings.shortBreakDuration 
        : settings.longBreakDuration;
        
    updatePomodoro({ isRunning: false, mode, timeLeft: duration * 60 });
  };

  // Calculate SVG Circle progress
  const getTotalSeconds = () => {
    if (pomodoroState.mode === 'focus') return settings.workDuration * 60;
    if (pomodoroState.mode === 'shortBreak') return settings.shortBreakDuration * 60;
    return settings.longBreakDuration * 60;
  };
  
  const total = getTotalSeconds();
  const progress = ((total - pomodoroState.timeLeft) / total) * 100;
  
  const radius = 160;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="min-h-[calc(100vh-8rem)] flex flex-col items-center justify-center relative">
      {/* Motivational Quote - changes based on state */}
      <AnimatePresence mode="wait">
        <motion.p 
          key={pomodoroState.mode}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="text-[var(--color-text-secondary)] italic text-lg mb-12 text-center max-w-xl"
        >
          {pomodoroState.mode === 'focus' 
            ? `"${quotes[pomodoroState.completedPomodoros % quotes.length]}"` 
            : "Time to rest and recharge. Step away from the screen."}
        </motion.p>
      </AnimatePresence>

      {/* Timer Modes */}
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-0 sm:space-x-2 bg-surface-elevated/50 p-2 rounded-2xl border border-[var(--color-border-light)] mb-8 sm:mb-12 glass w-full max-w-lg">
        <button 
          onClick={() => switchMode('focus')}
          className={`flex items-center space-x-2 px-6 py-2 rounded-xl transition-all ${pomodoroState.mode === 'focus' ? 'bg-primary text-[var(--color-text-primary)] shadow-lg shadow-primary/20' : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'}`}
        >
          <FiMonitor />
          <span>Focus</span>
        </button>
        <button 
          onClick={() => switchMode('shortBreak')}
          className={`flex items-center space-x-2 px-6 py-2 rounded-xl transition-all ${pomodoroState.mode === 'shortBreak' ? 'bg-accent text-[var(--color-text-primary)] shadow-lg shadow-accent/20' : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'}`}
        >
          <FiCoffee />
          <span>Short Break</span>
        </button>
        <button 
          onClick={() => switchMode('longBreak')}
          className={`flex items-center space-x-2 px-6 py-2 rounded-xl transition-all ${pomodoroState.mode === 'longBreak' ? 'bg-purple-500 text-[var(--color-text-primary)] shadow-lg shadow-purple-500/20' : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'}`}
        >
          <FiCoffee />
          <span>Long Break</span>
        </button>
      </div>

      {/* Main Timer Display */}
      <div className="relative flex items-center justify-center mb-8 sm:mb-12 w-full max-w-[360px] aspect-square mx-auto">
        <svg viewBox="0 0 360 360" className="w-full h-full transform -rotate-90 filter drop-shadow-[0_0_30px_rgba(var(--color-primary),0.3)]">
          <circle
            cx="180" cy="180" r={radius}
            stroke="rgba(255,255,255,0.05)"
            strokeWidth="8"
            fill="transparent"
          />
          <motion.circle
            cx="180" cy="180" r={radius}
            stroke={
              pomodoroState.mode === 'focus' ? 'var(--color-primary)' : 
              pomodoroState.mode === 'shortBreak' ? 'var(--color-accent)' : '#a855f7'
            }
            strokeWidth="8"
            fill="transparent"
            strokeDasharray={circumference}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1, ease: "linear" }}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.div 
            key={pomodoroState.timeLeft}
            initial={{ scale: 0.9, opacity: 0.8 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-5xl sm:text-7xl font-bold font-mono tracking-tighter bg-clip-text text-transparent bg-gradient-to-b from-[var(--color-text-primary)] to-[var(--color-text-secondary)] drop-shadow-lg"
          >
            {formatTime(pomodoroState.timeLeft)}
          </motion.div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center space-x-6">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={resetTimer}
          className="p-4 rounded-full bg-surface-elevated border border-[var(--color-border-light)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-text-primary)]/5 transition-colors"
        >
          <FiRotateCcw size={24} />
        </motion.button>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={toggleTimer}
          className={`p-6 rounded-full border-2 shadow-2xl transition-all ${
            pomodoroState.isRunning 
              ? 'bg-surface-elevated border-[var(--color-border-light)] text-[var(--color-text-primary)]' 
              : 'bg-primary border-primary text-[var(--color-text-primary)] shadow-primary/30'
          }`}
        >
          {pomodoroState.isRunning ? <FiPause size={32} /> : <FiPlay size={32} className="ml-1" />}
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setShowSettings(!showSettings)}
          className={`p-4 rounded-full border transition-colors ${
            showSettings ? 'bg-primary/20 border-primary text-primary' : 'bg-surface-elevated border-[var(--color-border-light)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-text-primary)]/5'
          }`}
        >
          <FiSettings size={24} />
        </motion.button>
      </div>

      {/* Settings Panel */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0, height: 0, y: -20 }}
            animate={{ opacity: 1, height: 'auto', y: 0 }}
            exit={{ opacity: 0, height: 0, y: -20 }}
            className="mt-8 overflow-hidden w-full max-w-md"
          >
            <div className="glass bg-surface-elevated/80 border border-[var(--color-border-light)] p-6 rounded-2xl">
              <h3 className="text-lg font-bold mb-4">Timer Settings (Minutes)</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-[var(--color-text-secondary)]">Focus Duration</label>
                  <input 
                    type="number" 
                    min="1"
                    value={settings.workDuration}
                    onChange={(e) => updateSettings({ workDuration: parseInt(e.target.value) || 25 })}
                    className="w-24 bg-surface px-3 py-2 rounded-lg border border-[var(--color-border-light)] focus:outline-none focus:border-primary text-[var(--color-text-primary)]"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <label className="text-[var(--color-text-secondary)]">Short Break</label>
                  <input 
                    type="number" 
                    min="1"
                    value={settings.shortBreakDuration}
                    onChange={(e) => updateSettings({ shortBreakDuration: parseInt(e.target.value) || 5 })}
                    className="w-24 bg-surface px-3 py-2 rounded-lg border border-[var(--color-border-light)] focus:outline-none focus:border-primary text-[var(--color-text-primary)]"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <label className="text-[var(--color-text-secondary)]">Long Break</label>
                  <input 
                    type="number" 
                    min="1"
                    value={settings.longBreakDuration}
                    onChange={(e) => updateSettings({ longBreakDuration: parseInt(e.target.value) || 15 })}
                    className="w-24 bg-surface px-3 py-2 rounded-lg border border-[var(--color-border-light)] focus:outline-none focus:border-primary text-[var(--color-text-primary)]"
                  />
                </div>
              </div>
              <p className="text-xs text-[var(--color-text-muted)] mt-6 text-center">
                Click the Reset button to apply new durations to the current timer.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Sessions Tracker */}
      <div className="mt-8 flex space-x-2">
        {[...Array(4)].map((_, i) => (
          <div 
            key={i} 
            className={`w-3 h-3 rounded-full ${
              i < (pomodoroState.completedPomodoros % 4) 
                ? 'bg-primary shadow-[0_0_10px_rgba(var(--color-primary),0.8)]' 
                : 'bg-[var(--color-text-primary)]/10'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
