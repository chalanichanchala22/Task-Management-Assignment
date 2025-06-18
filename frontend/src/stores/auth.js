import { defineStore } from 'pinia'
import api from '@/api'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    token: localStorage.getItem('auth_token') || null,
    isAuthenticated: false
  }),

  actions: {
    async login(credentials) {
      try {
        const response = await api.post('/login', credentials);
        this.token = response.data.token;
        this.user = response.data.user;
        this.isAuthenticated = true;
        
        localStorage.setItem('auth_token', this.token);
        return { success: true };
      } catch (error) {
        return { 
          success: false, 
          message: error.response?.data?.message || 'Login failed' 
        };
      }
    },

    async register(name, email, password, passwordConfirmation) {
      try {
        const userData = {
          name: name,
          email: email,
          password: password,
          password_confirmation: passwordConfirmation
        };

        const response = await api.post('/register', userData);
        this.token = response.data.token;
        this.user = response.data.user;
        this.isAuthenticated = true;
        
        localStorage.setItem('auth_token', this.token);
        return { success: true };
      } catch (error) {
        console.error('Error details:', error.response?.data || error.message);
        return { 
          success: false, 
          message: error.response?.data?.message || 'Registration failed' 
        };
      }
    },

    async logout() {
      try {
        await api.post('/logout');
      } catch (error) {
        console.error('Logout error:', error);
      } finally {
        this.token = null;
        this.user = null;
        this.isAuthenticated = false;
        localStorage.removeItem('auth_token');
      }
    },

    async fetchUser() {
      try {
        const response = await api.get('/user');
        this.user = response.data;
        this.isAuthenticated = true;
      } catch (error) {
        this.logout();
      }
    },

    // Updated form handling to ensure validation works correctly
    handleAuth: async () => {
      console.log("Form submission attempted");
      console.log("Current form data:", form);
      
      // Reset error messages
      authError.value = '';
      
      // Validate all fields before submission
      if (!isLogin.value) {
        validateField('name');
        validateField('password_confirmation');
      }
      validateField('email');
      validateField('password');
      
      // Check if there are any validation errors
      const hasErrors = Object.values(errors).some(error => error !== '');
      if (hasErrors) {
        authError.value = 'Please correct the errors in the form';
        return;
      }
      
      // For registration, validate password match
      if (!isLogin.value) {
        validatePasswordMatch();
        
        // Don't proceed if passwords don't match
        if (passwordMatchError.value) {
          return;
        }
      }
      
      authLoading.value = true;
      
      try {
        if (isLogin.value) {
          await authStore.login(form.email, form.password);
        } else {
          await authStore.register(form.name, form.email, form.password, form.password_confirmation);
        }
        await tasksStore.fetchTasks();
      } catch (error) {
        console.error("Auth error:", error);
        authError.value = error.message || 'Authentication failed';
      } finally {
        authLoading.value = false;
      }
    },

    // Update the login mode toggle function
    // And make sure to use this in your template instead of directly modifying isLogin
    toggleLoginMode: () => {
      isLogin.value = !isLogin.value;
      form.name = '';
      form.email = '';
      form.password = '';
      form.password_confirmation = '';
      authError.value = '';
      passwordMatchError.value = '';
      
      // Clear all validation errors
      Object.keys(errors).forEach(key => {
        errors[key] = '';
      });
    }
  }
})
