import api from './api';

export const authService = {
  async login(email, password) {
    const response = await api.post('/login', { email, password });
    return response.data;
  },

  async register(name, email, password) {
    const response = await api.post('/register', { name, email, password });
    return response.data;
  },

  async updateProfile(profileData) {
    const response = await api.put('/profile', profileData);
    return response.data;
  },
};
