import api from './api';

export const statsService = {
  async getDashboardStats() {
    const response = await api.get('/stats/dashboard');
    return response.data;
  },
  
  async getActivities(skip = 0, limit = 20) {
    const response = await api.get(`/activities?skip=${skip}&limit=${limit}`);
    return response.data;
  }
};

export const gamificationService = {
  async completeFocusSession(durationMinutes) {
    const response = await api.post('/gamification/focus/complete', { duration: durationMinutes });
    return response.data;
  },
  
  async getAchievements() {
    const response = await api.get('/gamification/achievements');
    return response.data;
  }
};
