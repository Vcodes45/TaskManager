import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAppStore = create(
  persist(
    (set) => ({
      // UI State
      isSidebarOpen: true,
      toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
      isCommandPaletteOpen: false,
      setCommandPaletteOpen: (isOpen) => set({ isCommandPaletteOpen: isOpen }),
      
      // Pomodoro State
      pomodoroState: {
        timeLeft: 25 * 60, // 25 mins in seconds
        isRunning: false,
        mode: 'focus', // focus, shortBreak, longBreak
        completedPomodoros: 0,
      },
      updatePomodoro: (newState) => 
        set((state) => ({
          pomodoroState: { ...state.pomodoroState, ...newState }
        })),
        
      // Gamification State
      userStats: {
        xp: 0,
        level: 1,
        current_streak: 0,
        longest_streak: 0,
      },
      updateUserStats: (newStats) => 
        set((state) => ({
          userStats: { ...state.userStats, ...newStats }
        })),

      // App Settings
      settings: {
        theme: 'dark', // dark, light, amoled, ocean, purple, forest, sunset
        soundEnabled: true,
        confettiEnabled: true,
        workDuration: 25,
        shortBreakDuration: 5,
        longBreakDuration: 15,
      },
      updateSettings: (newSettings) =>
        set((state) => ({
          settings: { ...state.settings, ...newSettings }
        })),
    }),
    {
      name: 'taskmanager-app-storage',
      partialize: (state) => ({ 
        pomodoroState: state.pomodoroState,
        settings: state.settings,
        isSidebarOpen: state.isSidebarOpen
      }), // Only persist these
    }
  )
);
