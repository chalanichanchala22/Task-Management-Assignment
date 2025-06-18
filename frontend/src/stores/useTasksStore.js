import { defineStore } from 'pinia';
import axios from 'axios';

export const useTasksStore = defineStore('tasks', {
  state: () => ({
    tasks: [],
    categories: [],
    loading: false,
    error: null
  }),
  
  getters: {
    getTasks: (state) => state.tasks,
    getCategories: (state) => state.categories,
    pendingTasks: (state) => state.tasks.filter(task => !task.completed),
    completedTasks: (state) => state.tasks.filter(task => task.completed),
    tasksByCategory: (state) => (categoryId) => {
      return state.tasks.filter(task => task.category_id === categoryId);
    }
  },
  
  actions: {
    // Task Actions
    async fetchTasks() {
      this.loading = true;
      this.error = null;
      
      try {
        const response = await axios.get('/api/tasks');
        this.tasks = response.data;
        return { success: true, data: response.data };
      } catch (error) {
        console.error('Error fetching tasks:', error);
        this.error = error.response?.data?.message || 'Failed to fetch tasks';
        return { success: false, error: this.error };
      } finally {
        this.loading = false;
      }
    },
    
    async createTask(taskData) {
      this.loading = true;
      this.error = null;
      
      try {
        const response = await axios.post('/api/tasks', taskData);
        this.tasks.unshift(response.data); // Add to the beginning of the array
        return { success: true, data: response.data };
      } catch (error) {
        console.error('Error creating task:', error);
        this.error = error.response?.data?.message || 'Failed to create task';
        return { success: false, error: this.error };
      } finally {
        this.loading = false;
      }
    },
    
    async updateTask(taskId, taskData) {
      this.loading = true;
      this.error = null;
      
      try {
        const response = await axios.put(`/api/tasks/${taskId}`, taskData);
        const index = this.tasks.findIndex(task => task.id === taskId);
        if (index !== -1) {
          this.tasks[index] = response.data;
        }
        return { success: true, data: response.data };
      } catch (error) {
        console.error('Error updating task:', error);
        this.error = error.response?.data?.message || 'Failed to update task';
        return { success: false, error: this.error };
      } finally {
        this.loading = false;
      }
    },
    
    async deleteTask(taskId) {
      this.loading = true;
      this.error = null;
      
      try {
        await axios.delete(`/api/tasks/${taskId}`);
        this.tasks = this.tasks.filter(task => task.id !== taskId);
        return { success: true };
      } catch (error) {
        console.error('Error deleting task:', error);
        this.error = error.response?.data?.message || 'Failed to delete task';
        return { success: false, error: this.error };
      } finally {
        this.loading = false;
      }
    },
    
    // Category Actions
    async fetchCategories() {
      this.loading = true;
      this.error = null;
      
      try {
        const response = await axios.get('/api/categories');
        this.categories = response.data;
        return { success: true, data: response.data };
      } catch (error) {
        console.error('Error fetching categories:', error);
        this.error = error.response?.data?.message || 'Failed to fetch categories';
        return { success: false, error: this.error };
      } finally {
        this.loading = false;
      }
    },
    
    async createCategory(categoryData) {
      this.loading = true;
      this.error = null;
      
      try {
        const response = await axios.post('/api/categories', categoryData);
        this.categories.push(response.data);
        return { success: true, data: response.data };
      } catch (error) {
        console.error('Error creating category:', error);
        this.error = error.response?.data?.message || 'Failed to create category';
        return { success: false, error: this.error };
      } finally {
        this.loading = false;
      }
    },
    
    async updateCategory(categoryId, categoryData) {
      this.loading = true;
      this.error = null;
      
      try {
        const response = await axios.put(`/api/categories/${categoryId}`, categoryData);
        const index = this.categories.findIndex(category => category.id === categoryId);
        if (index !== -1) {
          this.categories[index] = response.data;
        }
        return { success: true, data: response.data };
      } catch (error) {
        console.error('Error updating category:', error);
        this.error = error.response?.data?.message || 'Failed to update category';
        return { success: false, error: this.error };
      } finally {
        this.loading = false;
      }
    },
    
    async deleteCategory(categoryId) {
      this.loading = true;
      this.error = null;
      
      try {
        await axios.delete(`/api/categories/${categoryId}`);
        this.categories = this.categories.filter(category => category.id !== categoryId);
        return { success: true };
      } catch (error) {
        console.error('Error deleting category:', error);
        this.error = error.response?.data?.message || 'Failed to delete category';
        return { success: false, error: this.error };
      } finally {
        this.loading = false;
      }
    }
  }
});