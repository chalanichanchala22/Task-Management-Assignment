import { defineStore } from 'pinia'
import api from '@/api'
import { useTasksStore } from './tasksStore'
import { useCategoriesStore } from './categories'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    token: localStorage.getItem('auth_token') || null,
    isAuthenticated: false,
    authLoading: false,
    authError: null,
    loginAttempts: 0,
    lastLoginAttempt: null
  }),
  
  getters: {
    userInitials: (state) => {
      if (!state.user || !state.user.name) return '?';
      
      const nameParts = state.user.name.split(' ').filter(Boolean);
      if (nameParts.length === 0) return '?';
      
      if (nameParts.length === 1) {
        return nameParts[0].charAt(0).toUpperCase();
      }
      
      return (nameParts[0].charAt(0) + nameParts[nameParts.length - 1].charAt(0)).toUpperCase();
    },
    
    isTokenExpired: () => {
      const expiresAt = localStorage.getItem('auth_expires_at');
      if (!expiresAt) return true;
      
      return new Date(expiresAt) < new Date();
    },
    
    isAdmin: (state) => {
      return state.user?.role === 'admin' || state.user?.is_admin === true;
    },
    
    userName: (state) => {
      return state.user?.name || 'Guest';
    },
    
    isLoginThrottled: (state) => {
      // Throttle login after 5 failed attempts for 2 minutes
      if (state.loginAttempts >= 5 && state.lastLoginAttempt) {
        const throttleTime = 2 * 60 * 1000; // 2 minutes
        const now = Date.now();
        const timeSinceLastAttempt = now - state.lastLoginAttempt;
        
        return timeSinceLastAttempt < throttleTime;
      }
      
      return false;
    },
    
    timeUntilUnthrottled: (state) => {
      if (!state.lastLoginAttempt) return 0;
      
      const throttleTime = 2 * 60 * 1000; // 2 minutes
      const now = Date.now();
      const timeSinceLastAttempt = now - state.lastLoginAttempt;
      const timeRemaining = throttleTime - timeSinceLastAttempt;
      
      return Math.max(0, Math.ceil(timeRemaining / 1000));
    }
  },
  
  actions: {
    async login(credentials, remember = false) {
      this.authLoading = true;
      this.authError = null;
      
      // Check if login is throttled
      if (this.isLoginThrottled) {
        this.authLoading = false;
        return {
          success: false,
          message: `Too many login attempts. Please try again in ${Math.ceil(this.timeUntilUnthrottled / 60)} minutes.`
        };
      }
      
      try {
        const response = await api.post('/login', { ...credentials, remember });
        this.handleLoginSuccess(response.data, remember);
        
        // Reset login attempts on success
        this.loginAttempts = 0;
        
        return { success: true };
      } catch (error) {
        // Increment login attempts on failure
        this.lastLoginAttempt = Date.now();
        this.loginAttempts++;
        
        this.authError = error.response?.data?.message || 'Login failed';
        return {
          success: false,
          message: this.authError,
          errors: error.response?.data?.errors
        };
      } finally {
        this.authLoading = false;
      }
    },
    
    handleLoginSuccess(data, remember = false) {
      this.token = data.token;
      this.user = data.user;
      this.isAuthenticated = true;
      
      // Store token with expiration
      localStorage.setItem('auth_token', this.token);
      
      // Set expiration (24 hours by default, 30 days if remember me)
      const expiresAt = new Date();
      if (remember) {
        expiresAt.setDate(expiresAt.getDate() + 30); // 30 days
      } else {
        expiresAt.setHours(expiresAt.getHours() + 24); // 24 hours
      }
      
      localStorage.setItem('auth_expires_at', expiresAt.toISOString());
      
      // Set Authorization header
      api.defaults.headers.common['Authorization'] = `Bearer ${this.token}`;
    },
    
    async register(userData) {
      this.authLoading = true;
      this.authError = null;
      
      try {
        const response = await api.post('/register', {
          name: userData.name,
          email: userData.email,
          password: userData.password,
          password_confirmation: userData.password_confirmation // Make sure this matches Laravel's expected field
        });
        this.handleLoginSuccess(response.data);
        
        return { success: true };
      } catch (error) {
        this.authError = error.response?.data?.message || 'Registration failed';
        
        return {
          success: false,
          message: this.authError,
          errors: error.response?.data?.errors
        };
      } finally {
        this.authLoading = false;
      }
    },
    
    async logout(redirect = true) {
      this.authLoading = true;
      
      try {
        if (this.token) {
          await api.post('/logout');
        }
      } catch (error) {
        console.error('Logout error:', error);
      } finally {
        this.clearAuthData();
        this.clearRelatedStores();
        this.authLoading = false;
        
        // Return redirect info instead of handling it here
        return { success: true, shouldRedirect: redirect };
      }
    },
    
    clearAuthData() {
      this.token = null;
      this.user = null;
      this.isAuthenticated = false;
      
      // Remove from localStorage
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_expires_at');
      
      // Remove Authorization header
      delete api.defaults.headers.common['Authorization'];
    },
    
    clearRelatedStores() {
      // Reset other stores when logging out
      const tasksStore = useTasksStore();
      const categoriesStore = useCategoriesStore();
      
      tasksStore.$reset();
      categoriesStore.$reset();
    },
    
    async fetchUser() {
      // Don't try to fetch if not authenticated
      if (!this.token) return null;
      
      this.authLoading = true;
      
      try {
        const response = await api.get('/user');
        this.user = response.data;
        this.isAuthenticated = true;
        return this.user;
      } catch (error) {
        // If unauthorized, log out
        if (error.response?.status === 401) {
          this.clearAuthData();
        }
        return null;
      } finally {
        this.authLoading = false;
      }
    },
    
    async updateProfile(profileData) {
      this.authLoading = true;
      
      try {
        const response = await api.put('/profile', profileData);
        this.user = response.data;
        
        return { success: true };
      } catch (error) {
        return {
          success: false,
          message: error.response?.data?.message || 'Failed to update profile',
          errors: error.response?.data?.errors
        };
      } finally {
        this.authLoading = false;
      }
    },
    
    async changePassword(passwordData) {
      this.authLoading = true;
      
      try {
        await api.put('/change-password', passwordData);
        
        return { success: true };
      } catch (error) {
        return {
          success: false,
          message: error.response?.data?.message || 'Failed to change password',
          errors: error.response?.data?.errors
        };
      } finally {
        this.authLoading = false;
      }
    },
    
    async forgotPassword(email) {
      this.authLoading = true;
      
      try {
        await api.post('/forgot-password', { email });
        
        return { 
          success: true,
          message: 'Password reset instructions have been sent to your email.'
        };
      } catch (error) {
        return {
          success: false,
          message: error.response?.data?.message || 'Failed to process request'
        };
      } finally {
        this.authLoading = false;
      }
    },
    
    async resetPassword(token, password, passwordConfirmation) {
      this.authLoading = true;
      
      try {
        await api.post('/reset-password', {
          token,
          password,
          password_confirmation: passwordConfirmation
        });
        
        return { 
          success: true,
          message: 'Your password has been reset successfully. You can now log in.'
        };
      } catch (error) {
        return {
          success: false,
          message: error.response?.data?.message || 'Failed to reset password',
          errors: error.response?.data?.errors
        };
      } finally {
        this.authLoading = false;
      }
    },
    
    async refreshToken() {
      // Don't try to refresh if no token
      if (!this.token) return false;
      
      try {
        const response = await api.post('/refresh-token');
        
        if (response.data.token) {
          // Update token with the same expiration logic
          this.token = response.data.token;
          localStorage.setItem('auth_token', response.data.token);
          
          // Update authorization header
          api.defaults.headers.common['Authorization'] = `Bearer ${this.token}`;
          
          return true;
        }
        
        return false;
      } catch (error) {
        // If refresh fails, log out
        if (error.response?.status === 401) {
          this.clearAuthData();
        }
        return false;
      }
    },
    
    checkAuth() {
      const token = localStorage.getItem('auth_token');
      const expiresAt = localStorage.getItem('auth_expires_at');
      
      if (token && expiresAt && new Date(expiresAt) > new Date()) {
        // Valid token exists
        this.token = token;
        this.isAuthenticated = true;
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        // Fetch user data if not already loaded
        if (!this.user) {
          this.fetchUser();
        }
        
        return true;
      } else if (token) {
        // Token expired
        this.clearAuthData();
      }
      
      return false;
    },
    
    async setupAuthFromToken(token) {
      if (!token) return false;
      
      // Set token in store and localStorage
      this.token = token;
      localStorage.setItem('auth_token', token);
      
      // Set default Authorization header
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Set expiration (24 hours by default)
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24);
      localStorage.setItem('auth_expires_at', expiresAt.toISOString());
      
      // Fetch user data
      await this.fetchUser();
      
      return this.isAuthenticated;
    }
  }
})
