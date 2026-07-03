import api from './api';

export const taskService = {
  async getTasks() {
    const response = await api.get('/tasks');
    return response.data;
  },

  async createTask(taskData) {
    const response = await api.post('/tasks', taskData);
    return response.data;
  },

  async updateTask(taskId, taskData) {
    const response = await api.put(`/tasks/${taskId}`, taskData);
    return response.data;
  },

  async deleteTask(taskId) {
    await api.delete(`/tasks/${taskId}`);
  },

  async toggleComplete(taskId) {
    const response = await api.patch(`/tasks/${taskId}/complete`);
    return response.data;
  },

  async analyzeTask(taskId) {
    const response = await api.post(`/tasks/${taskId}/ai`);
    return response.data;
  },

  async bulkAction(taskIds, action, value = null) {
    const response = await api.patch('/tasks/bulk', {
      task_ids: taskIds,
      action: action,
      value: value
    });
    return response.data;
  }
};
