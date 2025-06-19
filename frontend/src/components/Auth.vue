<script setup>
import { ref, reactive, computed } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useTasksStore } from '@/stores/tasks';

const authStore = useAuthStore();
const tasksStore = useTasksStore();
const isLogin = ref(true);
const authLoading = ref(false);
const authError = ref('');

const form = reactive({
  name: '',
  email: '',
  password: '',
  confirmPassword: ''
});

const errors = reactive({
  name: '',
  email: '',
  password: '',
  confirmPassword: ''
});

const validateField = (field) => {
  errors[field] = '';
  
  if (field === 'name' && !form.name && !isLogin.value) {
    errors.name = 'Name is required';
  }
  
  if (field === 'email' && !form.email) {
    errors.email = 'Email is required';
  }
  
  if (field === 'password' && !form.password) {
    errors.password = 'Password is required';
  }
  
  if (field === 'confirmPassword' && !form.confirmPassword && !isLogin.value) {
    errors.confirmPassword = 'Please confirm your password';
  }
};

const validatePasswordMatch = () => {
  if (form.password !== form.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match';
    return false;
  }
  return true;
};

const handleAuth = async () => {
  // Reset error messages
  authError.value = '';
  
  // Validate all fields before submission
  if (!isLogin.value) {
    validateField('name');
    validateField('confirmPassword');
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
    if (errors.confirmPassword) {
      return;
    }
  }
  
  authLoading.value = true;
  try {
    if (isLogin.value) {
      await authStore.login({
        email: form.email,
        password: form.password
      });
    } else {
      await authStore.register({
        name: form.name,
        email: form.email,
        password: form.password,
        confirmPassword: form.confirmPassword
      });
    }
    await tasksStore.fetchTasks();
  } catch (error) {
    console.error("Auth error:", error);
    authError.value = error.message || 'Authentication failed';
  } finally {
    authLoading.value = false;
  }
};

const toggleLoginMode = () => {
  isLogin.value = !isLogin.value;
  form.name = '';
  form.email = '';
  form.password = '';
  form.confirmPassword = '';
  authError.value = '';
  Object.keys(errors).forEach(key => errors[key] = '');
};

const title = computed(() => isLogin.value ? 'Login' : 'Register');
</script>

<template>
  <div class="auth-container">
    <h2>{{ title }}</h2>
    
    <div v-if="authError" class="error-message">
      {{ authError }}
    </div>
    
    <form @submit.prevent="handleAuth">
      <!-- Name field (only for registration) -->
      <div class="form-group" v-if="!isLogin">
        <label for="name">Name</label>
        <input 
          id="name" 
          v-model="form.name" 
          type="text" 
          autocomplete="name"
          @blur="validateField('name')" 
          :class="{'error': errors.name}"
        >
        <div v-if="errors.name" class="error-text">{{ errors.name }}</div>
      </div>
      
      <!-- Email field -->
      <div class="form-group">
        <label for="email">Email</label>
        <input 
          id="email" 
          v-model="form.email" 
          type="email" 
          autocomplete="email"
          @blur="validateField('email')" 
          :class="{'error': errors.email}"
        >
        <div v-if="errors.email" class="error-text">{{ errors.email }}</div>
      </div>
      
      <!-- Password field -->
      <div class="form-group">
        <label for="password">Password</label>
        <input 
          id="password" 
          v-model="form.password" 
          type="password" 
          :autocomplete="isLogin ? 'current-password' : 'new-password'"
          @blur="validateField('password')" 
          :class="{'error': errors.password}"
        >
        <div v-if="errors.password" class="error-text">{{ errors.password }}</div>
      </div>
      
      <!-- Password confirmation (only for registration) -->
      <div v-if="!isLogin" class="form-group">
        <label for="confirmPassword">Confirm Password</label>
        <input 
          id="confirmPassword" 
          v-model="form.confirmPassword" 
          type="password" 
          autocomplete="new-password"
          @blur="validateField('confirmPassword')" 
          :class="{'error': errors.confirmPassword}"
        >
        <div v-if="errors.confirmPassword" class="error-text">{{ errors.confirmPassword }}</div>
      </div>
      
      <!-- Submit button -->
      <button type="submit" :disabled="authLoading">
        <span v-if="authLoading">Processing...</span>
        <span v-else>{{ isLogin ? 'Login' : 'Register' }}</span>
      </button>
      
      <!-- Toggle login/register -->
      <div class="mode-toggle">
        <button type="button" @click="toggleLoginMode">
          {{ isLogin ? 'Need an account? Register' : 'Already have an account? Login' }}
        </button>
      </div>
    </form>
  </div>
</template>

<style scoped>
.auth-container {
  max-width: 400px;
  margin: 0 auto;
  padding: 20px;
}

.form-group {
  margin-bottom: 15px;
}

label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}

input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

input.error {
  border-color: red;
}

.error-message, .error-text {
  color: red;
  margin-top: 5px;
  font-size: 0.875rem;
}

button {
  background-color: #4CAF50;
  color: white;
  padding: 10px 15px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-top: 10px;
}

button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

.mode-toggle {
  margin-top: 15px;
  text-align: center;
}

.mode-toggle button {
  background: none;
  color: #4CAF50;
  border: none;
  padding: 0;
  text-decoration: underline;
  cursor: pointer;
}
</style>