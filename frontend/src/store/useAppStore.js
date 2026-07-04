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
      
      // Global Data Cache (Fast Routing)
      tasks: [],
      tasksLoaded: false,
      dashboardStats: null,
      dashboardStatsLoaded: false,
      setTasks: (tasks) => set({ tasks, tasksLoaded: true }),
      setDashboardStats: (dashboardStats) => set({ dashboardStats, dashboardStatsLoaded: true }),
      fetchTasks: async (taskService) => {
        try {
          const data = await taskService.getTasks();
          set({ tasks: data || [], tasksLoaded: true });
        } catch (error) {
          console.error("Failed to fetch tasks", error);
        }
      },
      fetchDashboardStats: async (statsService) => {
        try {
          const data = await statsService.getDashboardStats();
          set({ dashboardStats: data, dashboardStatsLoaded: true });
        } catch (error) {
          console.error("Failed to fetch dashboard stats", error);
        }
      },
      
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
        set((state) => {
          let newPomodoroState = { ...state.pomodoroState };
          
          if (!state.pomodoroState.isRunning) {
            if (newSettings.workDuration !== undefined && state.pomodoroState.mode === 'focus') {
              newPomodoroState.timeLeft = newSettings.workDuration * 60;
            } else if (newSettings.shortBreakDuration !== undefined && state.pomodoroState.mode === 'shortBreak') {
              newPomodoroState.timeLeft = newSettings.shortBreakDuration * 60;
            } else if (newSettings.longBreakDuration !== undefined && state.pomodoroState.mode === 'longBreak') {
              newPomodoroState.timeLeft = newSettings.longBreakDuration * 60;
            }
          }
          
          return {
            settings: { ...state.settings, ...newSettings },
            pomodoroState: newPomodoroState
          };
        }),
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
