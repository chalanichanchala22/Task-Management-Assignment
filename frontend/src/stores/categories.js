import { defineStore } from 'pinia'
import api from '@/api'
import { useTasksStore } from './tasksStore'

export const useCategoriesStore = defineStore('categories', {
  state: () => ({
    categories: [],
    currentCategory: null,
    categoriesLoading: false,
    categoriesError: null
  }),
  
  getters: {
    categoriesWithTaskCounts: (state) => {
      const tasksStore = useTasksStore();
      const taskCountsByCategory = tasksStore.taskCountsByCategory;
      
      return state.categories.map(category => {
        const taskCount = taskCountsByCategory[category.id] || 0;
        
        // Count completed tasks
        const completedTasks = tasksStore.tasks.filter(
          task => task.category_id === category.id && task.status === 'completed'
        ).length;
        
        return {
          ...category,
          taskCount,
          completedTaskCount: completedTasks,
          completionRate: taskCount > 0 ? Math.round((completedTasks / taskCount) * 100) : 0
        };
      });
    },
    
    getCategoryById: (state) => (id) => {
      return state.categories.find(category => category.id === id) || null;
    },
    
    getCategoryName: (state) => (id) => {
      const category = state.categories.find(c => c.id === id);
      return category ? category.name : 'Uncategorized';
    }
  },
  
  actions: {
    async fetchCategories() {
      this.categoriesLoading = true;
      this.categoriesError = null;
      
      try {
        const response = await api.get('/categories');
        this.categories = response.data;
        return response.data;
      } catch (error) {
        this.categoriesError = error.response?.data?.message || 'Failed to fetch categories';
        throw error;
      } finally {
        this.categoriesLoading = false;
      }
    },
    
    async fetchCategory(id) {
      this.categoriesLoading = true;
      
      try {
        const response = await api.get(`/categories/${id}`);
        this.currentCategory = response.data;
        return response.data;
      } catch (error) {
        this.categoriesError = error.response?.data?.message || 'Failed to fetch category';
        throw error;
      } finally {
        this.categoriesLoading = false;
      }
    },
    
    async createCategory(categoryData) {
      this.categoriesLoading = true;
      
      try {
        const response = await api.post('/categories', categoryData);
        this.categories.push(response.data);
        return response.data;
      } catch (error) {
        this.categoriesError = error.response?.data?.message || 'Failed to create category';
        throw error;
      } finally {
        this.categoriesLoading = false;
      }
    },
    
    async updateCategory(category) {
      this.categoriesLoading = true;
      
      try {
        const response = await api.put(`/categories/${category.id}`, category);
        const updatedCategory = response.data;
        
        // Update in categories array
        const index = this.categories.findIndex(c => c.id === updatedCategory.id);
        if (index !== -1) {
          this.categories[index] = updatedCategory;
        }
        
        // Update current category if it's the same one
        if (this.currentCategory && this.currentCategory.id === updatedCategory.id) {
          this.currentCategory = updatedCategory;
        }
        
        return updatedCategory;
      } catch (error) {
        this.categoriesError = error.response?.data?.message || 'Failed to update category';
        throw error;
      } finally {
        this.categoriesLoading = false;
      }
    },
    
    async deleteCategory(id) {
      this.categoriesLoading = true;
      
      try {
        await api.delete(`/categories/${id}`);
        
        // Remove from categories array
        this.categories = this.categories.filter(c => c.id !== id);
        
        // Clear current category if it was deleted
        if (this.currentCategory && this.currentCategory.id === id) {
          this.currentCategory = null;
        }
        
        return { success: true };
      } catch (error) {
        this.categoriesError = error.response?.data?.message || 'Failed to delete category';
        throw error;
      } finally {
        this.categoriesLoading = false;
      }
    },
    
    resetCategoryStore() {
      this.$reset();
    }
  }
})