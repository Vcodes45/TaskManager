import api from './api';

export const notesService = {
  async getNotes() {
    const response = await api.get('/notes');
    return response.data;
  },

  async createNote(noteData) {
    const response = await api.post('/notes', noteData);
    return response.data;
  },

  async updateNote(id, noteData) {
    const response = await api.put(`/notes/${id}`, noteData);
    return response.data;
  },

  async deleteNote(id) {
    await api.delete(`/notes/${id}`);
  }
};
