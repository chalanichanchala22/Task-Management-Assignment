import axios from 'axios';
import router from '@/router';
import store from '@/store';

class AuthService {
  /**
   * Register a new user
   * @param {Object} userData - User registration data
   * @returns {Promise} - API response
   */
  async register(userData) {
    try {
      const response = await axios.post('/api/register', userData);
      
      if (response.data.token) {
        this.setToken(response.data.token);
        this.storeUserData(response.data.user);
      }
      
      return response;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }
  
  /**
   * Log in a user
   * @param {Object} credentials - Login credentials
   * @param {Boolean} remember - Whether to remember the user
   * @returns {Promise} - API response
   */
  async login(credentials, remember = false) {
    try {
      const response = await axios.post('/api/login', { ...credentials, remember });
      
      if (response.data.token) {
        this.setToken(response.data.token, remember);
        this.storeUserData(response.data.user);
      }
      
      return response;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }
  
  /**
   * Log out the current user
   * @returns {Promise} - API response
   */
  async logout() {
    try {
      // Only send logout request if we have a token
      if (this.getToken()) {
        await axios.post('/api/logout');
      }
      
      return this.clearSession();
    } catch (error) {
      // Even if the server request fails, clear the local session
      this.clearSession();
      throw error;
    }
  }
  
  /**
   * Clear all session data
   */
  clearSession() {
    // Clear localStorage
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_expires_at');
    
    // Clear axios headers
    delete axios.defaults.headers.common['Authorization'];
    
    // Clear store
    store.commit('setAuthenticated', false);
    store.commit('setUser', null);
    
    return true;
  }
  
  /**
   * Request a password reset
   * @param {String} email - User's email
   * @returns {Promise} - API response
   */
  async forgotPassword(email) {
    try {
      return await axios.post('/api/forgot-password', { email });
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }
  
  /**
   * Reset a user's password
   * @param {Object} resetData - Password reset data
   * @returns {Promise} - API response
   */
  async resetPassword(resetData) {
    try {
      return await axios.post('/api/reset-password', resetData);
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }
  
  /**
   * Get current user data
   * @returns {Promise} - API response
   */
  async getCurrentUser() {
    try {
      const response = await axios.get('/api/user');
      this.storeUserData(response.data);
      return response;
    } catch (error) {
      // If 401 unauthorized, clear the session
      if (error.response && error.response.status === 401) {
        this.clearSession();
      }
      throw error;
    }
  }
  
  /**
   * Get the authentication token
   * @returns {String|null} - Token or null if not logged in
   */
  getToken() {
    return localStorage.getItem('auth_token');
  }
  
  /**
   * Set the authentication token
   * @param {String} token - JWT token
   * @param {Boolean} remember - Whether to set a long expiration
   */
  setToken(token, remember = false) {
    // Store token
    localStorage.setItem('auth_token', token);
    
    // Set expiration
    const expiresAt = new Date();
    if (remember) {
      // 30 days if "remember me" is checked
      expiresAt.setDate(expiresAt.getDate() + 30);
    } else {
      // 24 hours by default
      expiresAt.setHours(expiresAt.getHours() + 24);
    }
    
    localStorage.setItem('auth_expires_at', expiresAt.toISOString());
    
    // Set axios header
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }
  
  /**
   * Store user data in Vuex
   * @param {Object} userData - User data from API
   */
  storeUserData(userData) {
    if (userData) {
      store.commit('setUser', userData);
      store.commit('setAuthenticated', true);
    }
  }
  
  /**
   * Check if user is authenticated
   * @returns {Boolean} - Authentication status
   */
  isAuthenticated() {
    const token = this.getToken();
    const expiresAt = localStorage.getItem('auth_expires_at');
    
    if (!token || !expiresAt) {
      return false;
    }
    
    // Check if token is expired
    return new Date(expiresAt) > new Date();
  }
  
  /**
   * Refresh the authentication token
   * @returns {Promise} - API response
   */
  async refreshToken() {
    try {
      const response = await axios.post('/api/refresh-token');
      
      if (response.data.token) {
        this.setToken(response.data.token);
      }
      
      return response;
    } catch (error) {
      if (error.response && error.response.status === 401) {
        this.clearSession();
        router.push('/login');
      }
      throw error;
    }
  }
  
  /**
   * Update user profile
   * @param {Object} userData - Updated user data
   * @returns {Promise} - API response
   */
  async updateProfile(userData) {
    try {
      const response = await axios.put('/api/profile', userData);
      this.storeUserData(response.data.user);
      return response;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }
  
  /**
   * Change user password
   * @param {Object} passwordData - Password change data
   * @returns {Promise} - API response
   */
  async changePassword(passwordData) {
    try {
      return await axios.put('/api/change-password', passwordData);
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }
  
  /**
   * Handle authentication errors
   * @param {Error} error - Error object
   */
  handleError(error) {
    if (error.response) {
      const { status } = error.response;
      
      // If token expired or invalid
      if (status === 401) {
        this.clearSession();
        
        // Only redirect if we're not already on the login page
        if (router.currentRoute.value.name !== 'login') {
          router.push({
            name: 'login',
            query: { redirect: router.currentRoute.value.fullPath }
          });
        }
      }
      
      // If user doesn't have permission
      if (status === 403) {
        router.push({ name: 'unauthorized' });
      }
    }
  }
  
  /**
   * Setup interceptors for axios
   */
  setupInterceptors() {
    // Request interceptor
    axios.interceptors.request.use(
      (config) => {
        const token = this.getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );
    
    // Response interceptor
    axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;
        
        // If token expired and we haven't tried to refresh yet
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          
          try {
            // Try to refresh the token
            await this.refreshToken();
            
            // Retry the original request with the new token
            originalRequest.headers.Authorization = `Bearer ${this.getToken()}`;
            return axios(originalRequest);
          } catch (refreshError) {
            return Promise.reject(refreshError);
          }
        }
        
        return Promise.reject(error);
      }
    );
  }
}

const authService = new AuthService();
authService.setupInterceptors();

export default authService;