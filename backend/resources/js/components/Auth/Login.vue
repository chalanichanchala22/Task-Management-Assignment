<template>
  <div class="container">
    <div class="row justify-content-center">
      <div class="col-md-8">
        <div class="card shadow">
          <div class="card-header bg-primary text-white">
            <h4 class="mb-0">Login to Task Management</h4>
          </div>
          <div class="card-body">
            <div v-if="errors.length" class="alert alert-danger">
              <ul class="mb-0">
                <li v-for="(error, index) in errors" :key="index">{{ error }}</li>
              </ul>
            </div>
            <div v-if="successMessage" class="alert alert-success">
              {{ successMessage }}
            </div>
            <form @submit.prevent="login" novalidate>
              <div class="form-group mb-3">
                <label for="email" class="form-label">Email Address</label>
                <input 
                  type="email" 
                  class="form-control" 
                  id="email" 
                  v-model.trim="form.email"
                  :class="{ 'is-invalid': fieldErrors.email }"
                  required
                  autocomplete="email"
                >
                <div v-if="fieldErrors.email" class="invalid-feedback">
                  {{ fieldErrors.email[0] }}
                </div>
              </div>
              <div class="form-group mb-3">
                <label for="password" class="form-label">Password</label>
                <div class="input-group">
                  <input 
                    :type="showPassword ? 'text' : 'password'" 
                    class="form-control" 
                    id="password" 
                    v-model="form.password"
                    :class="{ 'is-invalid': fieldErrors.password }"
                    required
                    autocomplete="current-password"
                  >
                  <button 
                    type="button" 
                    class="btn btn-outline-secondary" 
                    @click="togglePasswordVisibility"
                  >
                    <i :class="showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
                  </button>
                </div>
                <div v-if="fieldErrors.password" class="invalid-feedback d-block">
                  {{ fieldErrors.password[0] }}
                </div>
              </div>
              <div class="form-check mb-3">
                <input class="form-check-input" type="checkbox" id="remember" v-model="form.remember">
                <label class="form-check-label" for="remember">
                  Remember me
                </label>
              </div>
              <div class="d-flex justify-content-between align-items-center">
                <button 
                  type="submit" 
                  class="btn btn-primary px-4" 
                  :disabled="isLoading"
                >
                  <span v-if="isLoading" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  {{ isLoading ? 'Logging in...' : 'Login' }}
                </button>
                <router-link to="/forgot-password" class="text-decoration-none">Forgot Password?</router-link>
              </div>
            </form>
            <hr>
            <div class="text-center">
              <p>Don't have an account?</p>
              <router-link to="/register" class="btn btn-outline-primary">Register Now</router-link>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import { mapActions } from 'vuex';

export default {
  name: 'LoginPage',
  data() {
    return {
      form: {
        email: '',
        password: '',
        remember: false
      },
      errors: [],
      fieldErrors: {},
      successMessage: '',
      isLoading: false,
      showPassword: false,
      redirectPath: '/dashboard'
    };
  },
  created() {
    // Check if redirected from another page
    if (this.$route.query.redirect) {
      this.redirectPath = this.$route.query.redirect;
    }
    
    // Check if there was a success message from registration
    if (this.$route.query.registered) {
      this.successMessage = 'Registration successful! Please log in with your new account.';
    }
    
    // Check if already logged in
    if (this.isAuthenticated()) {
      this.$router.push(this.redirectPath);
    }
  },
  methods: {
    ...mapActions(['setUser', 'setAuthenticated']),
    
    async login() {
      this.errors = [];
      this.fieldErrors = {};
      this.isLoading = true;
      
      try {
        const response = await axios.post('/api/login', this.form);
        
        // Store token securely with expiration
        this.storeAuthToken(response.data.token);
        
        // Store user in Vuex
        this.setUser(response.data.user);
        this.setAuthenticated(true);
        
        // Show success message briefly
        this.successMessage = 'Login successful! Redirecting...';
        
        // Set default Authorization header for future requests
        axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
        
        // Redirect with small delay to show success message
        setTimeout(() => {
          this.$router.push(this.redirectPath);
        }, 500);
      } catch (error) {
        this.handleLoginError(error);
      } finally {
        this.isLoading = false;
      }
    },
    
    handleLoginError(error) {
      if (error.response) {
        const { status, data } = error.response;
        
        if (status === 422) {
          // Validation errors
          this.fieldErrors = data.errors || {};
          
          // Also collect all errors for the top alert
          if (data.errors) {
            for (const field in data.errors) {
              this.errors = [...this.errors, ...data.errors[field]];
            }
          }
        } else if (status === 401) {
          this.errors.push('Invalid email or password.');
        } else if (status === 429) {
          this.errors.push('Too many login attempts. Please try again later.');
        } else {
          this.errors.push('An error occurred during login. Please try again.');
        }
      } else if (error.request) {
        this.errors.push('Network error. Please check your internet connection.');
      } else {
        this.errors.push('An unexpected error occurred. Please try again.');
      }
    },
    
    storeAuthToken(token) {
      // Calculate expiration (24 hours from now)
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24);
      
      // Store token with expiration
      localStorage.setItem('auth_token', token);
      localStorage.setItem('auth_expires_at', expiresAt.toISOString());
      
      if (this.form.remember) {
        // Longer expiration for "remember me" (30 days)
        const longExpiresAt = new Date();
        longExpiresAt.setDate(longExpiresAt.getDate() + 30);
        localStorage.setItem('auth_expires_at', longExpiresAt.toISOString());
      }
    },
    
    isAuthenticated() {
      const token = localStorage.getItem('auth_token');
      const expiresAt = localStorage.getItem('auth_expires_at');
      
      if (!token || !expiresAt) {
        return false;
      }
      
      // Check if token is expired
      return new Date(expiresAt) > new Date();
    },
    
    togglePasswordVisibility() {
      this.showPassword = !this.showPassword;
    }
  }
}
</script>

<style scoped>
.card {
  border-radius: 8px;
  overflow: hidden;
}

.card-header {
  border-bottom: 0;
  padding: 1rem 1.5rem;
}

.card-body {
  padding: 1.5rem;
}

.form-control:focus {
  box-shadow: none;
  border-color: #80bdff;
}

.btn-primary {
  transition: all 0.3s;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
}
</style>