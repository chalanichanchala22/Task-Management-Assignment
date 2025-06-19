import { defineStore } from 'pinia'
import api from '@/api'

export const useTasksStore = defineStore('tasks', {
  state: () => ({
    tasks: [],
    categories: [],
    loading: false,
    error: null
  }),

  actions: {
    async fetchTasks() {
      this.loading = true;
      try {
        const response = await api.get('/tasks');
        this.tasks = response.data.data;
        this.error = null;
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to fetch tasks';
      } finally {
        this.loading = false;
      }
    },

    async createTask(taskData) {
      try {
        const response = await api.post('/tasks', taskData);
        this.tasks.push(response.data.data);
        return { success: true };
      } catch (error) {
        return { 
          success: false, 
          message: error.response?.data?.message || 'Failed to create task' 
        };
      }
    },

    async updateTask(id, taskData) {
      try {
        const response = await api.put(`/tasks/${id}`, taskData);
        const index = this.tasks.findIndex(task => task.id === id);
        if (index !== -1) {
          this.tasks[index] = response.data.data;
        }
        return { success: true };
      } catch (error) {
        return { 
          success: false, 
          message: error.response?.data?.message || 'Failed to update task' 
        };
      }
    },

    async deleteTask(id) {
      try {
        await api.delete(`/tasks/${id}`);
        this.tasks = this.tasks.filter(task => task.id !== id);
        return { success: true };
      } catch (error) {
        return { 
          success: false, 
          message: error.response?.data?.message || 'Failed to delete task' 
        };
      }
    },

    async fetchCategories() {
      try {
        const response = await api.get('/categories');
        this.categories = response.data.data;
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to fetch categories';
      }
    },

    async createCategory(categoryData) {
      try {
        const response = await api.post('/categories', categoryData);
        this.categories.push(response.data.data);
        return { success: true };
      } catch (error) {
        return { 
          success: false, 
          message: error.response?.data?.message || 'Failed to create category' 
        };
      }
    }
  }
})
