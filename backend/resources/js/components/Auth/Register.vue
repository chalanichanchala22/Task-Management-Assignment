<template>
  <div class="container">
    <div class="row justify-content-center">
      <div class="col-md-8">
        <div class="card shadow">
          <div class="card-header bg-primary text-white">
            <h4 class="mb-0">Create Your Account</h4>
          </div>
          <div class="card-body">
            <!-- General errors alert -->
            <div v-if="generalErrors.length" class="alert alert-danger">
              <ul class="mb-0">
                <li v-for="(error, index) in generalErrors" :key="index">{{ error }}</li>
              </ul>
            </div>
            
            <!-- Success message -->
            <div v-if="successMessage" class="alert alert-success">
              {{ successMessage }}
            </div>
            
            <form @submit.prevent="register" novalidate>
              <!-- Name field -->
              <div class="mb-3">
                <label for="name" class="form-label">Full Name</label>
                <input 
                  type="text" 
                  class="form-control" 
                  id="name" 
                  v-model.trim="form.name" 
                  :class="{ 'is-invalid': errors.name }"
                  required
                  autocomplete="name"
                >
                <div class="invalid-feedback" v-if="errors.name">
                  {{ errors.name[0] }}
                </div>
              </div>
              
              <!-- Email field -->
              <div class="mb-3">
                <label for="email" class="form-label">Email Address</label>
                <input 
                  type="email" 
                  class="form-control" 
                  id="email" 
                  v-model.trim="form.email" 
                  :class="{ 'is-invalid': errors.email }"
                  required
                  autocomplete="email"
                >
                <div class="invalid-feedback" v-if="errors.email">
                  {{ errors.email[0] }}
                </div>
                <small class="form-text text-muted">We'll never share your email with anyone else.</small>
              </div>
              
              <!-- Password field -->
              <div class="mb-3">
                <label for="password" class="form-label">Password</label>
                <div class="input-group">
                  <input 
                    :type="showPassword ? 'text' : 'password'" 
                    class="form-control" 
                    id="password" 
                    v-model="form.password" 
                    :class="{ 'is-invalid': errors.password }"
                    required
                    autocomplete="new-password"
                  >
                  <button 
                    type="button" 
                    class="btn btn-outline-secondary" 
                    @click="togglePasswordVisibility"
                  >
                    <i :class="showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
                  </button>
                  <div class="invalid-feedback" v-if="errors.password">
                    {{ errors.password[0] }}
                  </div>
                </div>
                <div class="password-strength mt-2" v-if="form.password">
                  <div class="progress" style="height: 5px;">
                    <div 
                      class="progress-bar" 
                      :class="passwordStrengthClass" 
                      :style="{ width: passwordStrength + '%' }"
                    ></div>
                  </div>
                  <small :class="passwordStrengthTextClass">
                    {{ passwordStrengthText }}
                  </small>
                </div>
              </div>
              
              <!-- Confirm Password field -->
              <div class="mb-3">
                <label for="confirmPassword" class="form-label">Confirm Password</label>
                <input 
                  :type="showPassword ? 'text' : 'password'" 
                  class="form-control" 
                  id="confirmPassword" 
                  v-model="form.confirmPassword" 
                  :class="{ 'is-invalid': errors.confirmPassword || passwordsDontMatch }"
                  required
                  autocomplete="new-password"
                >
                <div class="invalid-feedback" v-if="errors.confirmPassword">
                  {{ errors.confirmPassword[0] }}
                </div>
                <div class="invalid-feedback" v-else-if="passwordsDontMatch">
                  Passwords don't match
                </div>
              </div>
              
              <!-- Terms and Conditions -->
              <div class="mb-3 form-check">
                <input 
                  type="checkbox" 
                  class="form-check-input" 
                  id="agreeTerms" 
                  v-model="form.agreeTerms"
                  :class="{ 'is-invalid': errors.agreeTerms }"
                  required
                >
                <label class="form-check-label" for="agreeTerms">
                  I agree to the <a href="#" @click.prevent="showTerms">Terms and Conditions</a>
                </label>
                <div class="invalid-feedback" v-if="errors.agreeTerms">
                  {{ errors.agreeTerms[0] }}
                </div>
              </div>
              
              <!-- Submit button -->
              <div class="d-flex justify-content-between align-items-center">
                <button 
                  type="submit" 
                  class="btn btn-primary px-4" 
                  :disabled="isLoading || !formValid"
                >
                  <span v-if="isLoading" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  {{ isLoading ? 'Registering...' : 'Register' }}
                </button>
                <router-link to="/login" class="text-decoration-none">
                  Already have an account? Login
                </router-link>
              </div>
            </form>
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
  name: 'RegisterPage',
  data() {
    return {
      form: {
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        agreeTerms: false
      },
      errors: {},
      generalErrors: [],
      isLoading: false,
      showPassword: false,
      successMessage: ''
    };
  },
  computed: {
    passwordStrength() {
      const password = this.form.password;
      if (!password) return 0;
      
      let strength = 0;
      
      // Length check
      if (password.length >= 8) strength += 25;
      
      // Contains uppercase
      if (/[A-Z]/.test(password)) strength += 25;
      
      // Contains lowercase
      if (/[a-z]/.test(password)) strength += 25;
      
      // Contains number or symbol
      if (/[0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) strength += 25;
      
      return strength;
    },
    
    passwordStrengthClass() {
      const strength = this.passwordStrength;
      if (strength < 50) return 'bg-danger';
      if (strength < 75) return 'bg-warning';
      return 'bg-success';
    },
    
    passwordStrengthText() {
      const strength = this.passwordStrength;
      if (strength < 50) return 'Weak password';
      if (strength < 75) return 'Medium password';
      return 'Strong password';
    },
    
    passwordStrengthTextClass() {
      const strength = this.passwordStrength;
      if (strength < 50) return 'text-danger';
      if (strength < 75) return 'text-warning';
      return 'text-success';
    },
    
    passwordsDontMatch() {
      return this.form.password && 
             this.form.confirmPassword && 
             this.form.password !== this.form.confirmPassword;
    },
    
    formValid() {
      return this.form.name && 
             this.form.email && 
             this.form.password && 
             this.form.confirmPassword &&
             !this.passwordsDontMatch &&
             this.form.agreeTerms;
    }
  },
  methods: {
    ...mapActions(['setUser', 'setAuthenticated']),
    
    togglePasswordVisibility() {
      this.showPassword = !this.showPassword;
    },
    
    showTerms() {
      // You could show terms in a modal here
      alert('Terms and Conditions will be displayed here');
    },
    
    validateForm() {
      let isValid = true;
      this.errors = {};
      this.generalErrors = [];
      
      // Validate name
      if (!this.form.name.trim()) {
        this.errors.name = ['Name is required'];
        isValid = false;
      }
      
      // Validate email
      if (!this.form.email.trim()) {
        this.errors.email = ['Email is required'];
        isValid = false;
      } else if (!/\S+@\S+\.\S+/.test(this.form.email)) {
        this.errors.email = ['Please enter a valid email address'];
        isValid = false;
      }
      
      // Validate password
      if (!this.form.password) {
        this.errors.password = ['Password is required'];
        isValid = false;
      } else if (this.form.password.length < 8) {
        this.errors.password = ['Password must be at least 8 characters'];
        isValid = false;
      }
      
      // Validate confirm password
      if (!this.form.confirmPassword) {
        this.errors.confirmPassword = ['Please confirm your password'];
        isValid = false;
      } else if (this.form.password !== this.form.confirmPassword) {
        this.errors.confirmPassword = ['Passwords do not match'];
        isValid = false;
      }
      
      // Validate terms agreement
      if (!this.form.agreeTerms) {
        this.errors.agreeTerms = ['You must agree to the Terms and Conditions'];
        isValid = false;
      }
      
      return isValid;
    },
    
    async register() {
      // Reset errors
      this.errors = {};
      this.generalErrors = [];
      
      // Validate form
      if (!this.validateForm()) {
        return;
      }
      
      // Set loading
      this.isLoading = true;
      
      try {
        const response = await axios.post('/api/register', {
          name: this.form.name,
          email: this.form.email,
          password: this.form.password,
          confirmPassword: this.form.confirmPassword
        });
        
        // Show success message
        this.successMessage = 'Registration successful!';
        
        // Store token
        localStorage.setItem('auth_token', response.data.token);
        
        // Calculate expiration (24 hours from now)
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 24);
        localStorage.setItem('auth_expires_at', expiresAt.toISOString());
        
        // Set default Authorization header
        axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
        
        // Store user in Vuex
        this.setUser(response.data.user);
        this.setAuthenticated(true);
        
        // Short delay to show success message
        setTimeout(() => {
          // Redirect to tasks page
          this.$router.push('/dashboard');
        }, 1000);
        
      } catch (error) {
        this.handleRegistrationError(error);
      } finally {
        this.isLoading = false;
      }
    },
    
    handleRegistrationError(error) {
      if (error.response) {
        const { status, data } = error.response;
        
        if (status === 422) {
          // Validation errors
          this.errors = data.errors || {};
          
          // Add general error if needed
          this.generalErrors = ['Please correct the errors in the form.'];
        } else if (status === 429) {
          // Rate limiting
          this.generalErrors = ['Too many registration attempts. Please try again later.'];
        } else {
          // Other server errors
          this.generalErrors = [data.message || 'Registration failed. Please try again.'];
        }
      } else if (error.request) {
        // Network error
        this.generalErrors = ['Network error. Please check your internet connection.'];
      } else {
        // Something else
        this.generalErrors = ['An unexpected error occurred. Please try again.'];
      }
    }
  }
}
</script>

<style scoped>
.card {
  border-radius: 8px;
  overflow: hidden;
  margin-top: 2rem;
  margin-bottom: 2rem;
}

.card-header {
  padding: 1rem 1.5rem;
}

.card-body {
  padding: 1.5rem;
}

.form-control:focus {
  box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25);
}

.btn-primary {
  transition: all 0.3s;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
}

.password-strength {
  margin-top: 5px;
}

input.is-invalid {
  border-color: #dc3545;
  padding-right: calc(1.5em + 0.75rem);
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 12 12' width='12' height='12' fill='none' stroke='%23dc3545'%3e%3ccircle cx='6' cy='6' r='4.5'/%3e%3cpath stroke-linejoin='round' d='M5.8 3.6h.4L6 6.5z'/%3e%3ccircle cx='6' cy='8.2' r='.6' fill='%23dc3545' stroke='none'/%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right calc(0.375em + 0.1875rem) center;
  background-size: calc(0.75em + 0.375rem) calc(0.75em + 0.375rem);
}
</style>