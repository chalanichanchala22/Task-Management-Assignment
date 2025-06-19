import { defineStore } from 'pinia'
import api from '@/api'

export const useTasksStore = defineStore('tasks', {
  state: () => ({
    tasks: [],
    currentTask: null,
    tasksLoading: false,
    tasksError: null,
    taskFilters: {
      status: null,
      priority: null,
      category: null,
      search: ''
    },
    taskSorting: {
      field: 'due_date',
      direction: 'asc'
    }
  }),
  
  getters: {
    filteredTasks: (state) => {
      const { status, priority, category, search } = state.taskFilters;
      
      return state.tasks.filter(task => {
        // Filter by status
        if (status && task.status !== status) {
          return false;
        }
        
        // Filter by priority
        if (priority && task.priority !== priority) {
          return false;
        }
        
        // Filter by category
        if (category && task.category_id !== parseInt(category)) {
          return false;
        }
        
        // Filter by search term
        if (search) {
          const searchTerm = search.toLowerCase();
          const titleMatches = task.title.toLowerCase().includes(searchTerm);
          const descMatches = task.description && task.description.toLowerCase().includes(searchTerm);
          
          if (!titleMatches && !descMatches) {
            return false;
          }
        }
        
        return true;
      });
    },
    
    sortedTasks: (state) => {
      const { field, direction } = state.taskSorting;
      const filteredTasks = state.filteredTasks;
      
      return [...filteredTasks].sort((a, b) => {
        let fieldA = a[field];
        let fieldB = b[field];
        
        // Handle null values
        if (fieldA === null) return direction === 'asc' ? 1 : -1;
        if (fieldB === null) return direction === 'asc' ? -1 : 1;
        
        // Handle dates
        if (field === 'due_date' || field === 'created_at' || field === 'updated_at') {
          fieldA = new Date(fieldA);
          fieldB = new Date(fieldB);
        }
        
        // Sort direction
        if (direction === 'asc') {
          return fieldA < fieldB ? -1 : fieldA > fieldB ? 1 : 0;
        } else {
          return fieldA > fieldB ? -1 : fieldA < fieldB ? 1 : 0;
        }
      });
    },
    
    tasksByStatus: (state) => {
      const result = {
        pending: [],
        in_progress: [],
        completed: []
      };
      
      state.tasks.forEach(task => {
        if (result[task.status]) {
          result[task.status].push(task);
        }
      });
      
      return result;
    },
    
    pendingTasks: (state) => state.tasks.filter(task => task.status === 'pending'),
    
    inProgressTasks: (state) => state.tasks.filter(task => task.status === 'in_progress'),
    
    completedTasks: (state) => state.tasks.filter(task => task.status === 'completed'),
    
    overdueTasks: (state) => {
      const now = new Date();
      return state.tasks.filter(task => 
        task.status !== 'completed' && 
        task.due_date && 
        new Date(task.due_date) < now
      );
    },
    
    dueSoonTasks: (state) => {
      const now = new Date();
      const threeDaysLater = new Date();
      threeDaysLater.setDate(now.getDate() + 3);
      
      return state.tasks.filter(task => 
        task.status !== 'completed' && 
        task.due_date && 
        new Date(task.due_date) >= now &&
        new Date(task.due_date) <= threeDaysLater
      );
    },
    
    taskCountsByCategory: (state) => {
      const counts = {};
      
      state.tasks.forEach(task => {
        if (task.category_id) {
          if (!counts[task.category_id]) {
            counts[task.category_id] = 0;
          }
          counts[task.category_id]++;
        }
      });
      
      return counts;
    },
    
    completionRate: (state) => {
      const total = state.tasks.length;
      if (total === 0) return 0;
      
      const completed = state.tasks.filter(task => task.status === 'completed').length;
      return Math.round((completed / total) * 100);
    }
  },
  
  actions: {
    async fetchTasks() {
      this.tasksLoading = true;
      this.tasksError = null;
      
      try {
        const response = await api.get('/tasks');
        this.tasks = response.data;
        return response;
      } catch (error) {
        this.tasksError = error.response?.data?.message || 'Failed to fetch tasks';
        throw error;
      } finally {
        this.tasksLoading = false;
      }
    },
    
    async fetchTask(id) {
      this.tasksLoading = true;
      
      try {
        const response = await api.get(`/tasks/${id}`);
        this.currentTask = response.data;
        return response.data;
      } catch (error) {
        this.tasksError = error.response?.data?.message || 'Failed to fetch task';
        throw error;
      } finally {
        this.tasksLoading = false;
      }
    },
    
    async createTask(taskData) {
      this.tasksLoading = true;
      
      try {
        const response = await api.post('/tasks', taskData);
        this.tasks.push(response.data);
        return response.data;
      } catch (error) {
        this.tasksError = error.response?.data?.message || 'Failed to create task';
        throw error;
      } finally {
        this.tasksLoading = false;
      }
    },
    
    async updateTask(task) {
      this.tasksLoading = true;
      
      try {
        const response = await api.put(`/tasks/${task.id}`, task);
        const updatedTask = response.data;
        
        // Update in tasks array
        const index = this.tasks.findIndex(t => t.id === updatedTask.id);
        if (index !== -1) {
          this.tasks[index] = updatedTask;
        }
        
        // Update current task if it's the same one
        if (this.currentTask && this.currentTask.id === updatedTask.id) {
          this.currentTask = updatedTask;
        }
        
        return updatedTask;
      } catch (error) {
        this.tasksError = error.response?.data?.message || 'Failed to update task';
        throw error;
      } finally {
        this.tasksLoading = false;
      }
    },
    
    async deleteTask(id) {
      this.tasksLoading = true;
      
      try {
        await api.delete(`/tasks/${id}`);
        
        // Remove from tasks array
        this.tasks = this.tasks.filter(t => t.id !== id);
        
        // Clear current task if it was deleted
        if (this.currentTask && this.currentTask.id === id) {
          this.currentTask = null;
        }
        
        return { success: true };
      } catch (error) {
        this.tasksError = error.response?.data?.message || 'Failed to delete task';
        throw error;
      } finally {
        this.tasksLoading = false;
      }
    },
    
    async updateTaskStatus(id, status) {
      this.tasksLoading = true;
      
      try {
        const response = await api.patch(`/tasks/${id}/status`, { status });
        const updatedTask = response.data;
        
        // Update in tasks array
        const index = this.tasks.findIndex(t => t.id === id);
        if (index !== -1) {
          this.tasks[index] = updatedTask;
        }
        
        // Update current task if it's the same one
        if (this.currentTask && this.currentTask.id === id) {
          this.currentTask = updatedTask;
        }
        
        return updatedTask;
      } catch (error) {
        this.tasksError = error.response?.data?.message || 'Failed to update task status';
        throw error;
      } finally {
        this.tasksLoading = false;
      }
    },
    
    setFilters(filters) {
      this.taskFilters = { ...this.taskFilters, ...filters };
    },
    
    setSorting(field, direction = 'asc') {
      this.taskSorting = { field, direction };
    },
    
    clearFilters() {
      this.taskFilters = {
        status: null,
        priority: null,
        category: null,
        search: ''
      };
    },
    
    resetTaskStore() {
      this.$reset();
    }
  }
});