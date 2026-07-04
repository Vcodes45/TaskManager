import api from './api';

export const notificationService = {
  async getNotifications(skip = 0, limit = 20) {
    const res = await api.get('/notifications', { params: { skip, limit } });
    return res.data;
  },

  async markAsRead(id) {
    const res = await api.patch(`/notifications/${id}/read`);
    return res.data;
  },

  async markAllAsRead() {
    const res = await api.patch('/notifications/read-all');
    return res.data;
  }
};
