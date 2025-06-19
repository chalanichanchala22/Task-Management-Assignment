import { defineStore } from 'pinia'
import api from '@/api'
import router from '@/router'
import { useTasksStore } from './tasksStore'
import { useCategoriesStore } from './categories'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    token: localStorage.getItem('token') || null
  }),
  
  getters: {
    isAuthenticated: (state) => !!state.token
  },
  
  actions: {
    async login(email, password) {
      try {
        const response = await api.post('/login', { email, password });
        this.token = response.data.token;
        this.user = response.data.user;
        localStorage.setItem('token', this.token);
        api.defaults.headers.common['Authorization'] = `Bearer ${this.token}`;
        return response.data;
      } catch (error) {
        console.error('Login error:', error);
        throw new Error(error.response?.data?.message || 'Login failed');
      }
    },
    
    async register(name, email, password, password_confirmation) {
      try {
        const response = await api.post('/register', { 
          name, 
          email, 
          password, 
          confirmPassword
        });
        this.token = response.data.token;
        this.user = response.data.user;
        localStorage.setItem('token', this.token);
        api.defaults.headers.common['Authorization'] = `Bearer ${this.token}`;
        return response.data;
      } catch (error) {
        console.error('Registration error:', error);
        throw new Error(error.response?.data?.message || 'Registration failed');
      }
    },
    
    async fetchUser() {
      try {
        if (!this.token) throw new Error('No authentication token');
        
        api.defaults.headers.common['Authorization'] = `Bearer ${this.token}`;
        const response = await api.get('/user');
        this.user = response.data;
        return response.data;
      } catch (error) {
        console.error('Get user error:', error);
        this.logout();
        throw new Error('Session expired. Please login again.');
      }
    },
    
    logout() {
      this.user = null;
      this.token = null;
      localStorage.removeItem('token');
      delete api.defaults.headers.common['Authorization'];
    }
  }
});