<template>
  <div class="container">
    <div class="row justify-content-center">
      <div class="col-md-8">
        <div class="card">
          <div class="card-header">Register</div>
          <div class="card-body">
            <div v-if="errors.length" class="alert alert-danger">
              <ul>
                <li v-for="(error, index) in errors" :key="index">{{ error }}</li>
              </ul>
            </div>
            <form @submit.prevent="register">
              <div class="mb-3">
                <label for="name" class="form-label">Name</label>
                <input type="text" class="form-control" id="name" v-model="form.name" required>
                <div class="text-danger" v-if="errors.name">{{ errors.name[0] }}</div>
              </div>
              
              <div class="mb-3">
                <label for="email" class="form-label">Email address</label>
                <input type="email" class="form-control" id="email" v-model="form.email" required>
                <div class="text-danger" v-if="errors.email">{{ errors.email[0] }}</div>
              </div>
              
              <div class="mb-3">
                <label for="password" class="form-label">Password</label>
                <input type="password" class="form-control" id="password" v-model="form.password" required>
                <div class="text-danger" v-if="errors.password">{{ errors.password[0] }}</div>
              </div>
              
              <div class="mb-3">
                <label for="password_confirmation" class="form-label">Confirm Password</label>
                <input type="password" class="form-control" id="password_confirmation" v-model="form.password_confirmation" required>
                <div class="text-danger" v-if="errors.password_confirmation">{{ errors.password_confirmation[0] }}</div>
              </div>
              
              <button type="submit" class="btn btn-primary">Register</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      form: {
        name: '',
        email: '',
        password: '',
        password_confirmation: ''
      },
      errors: {},
      error: null
    }
  },
  methods: {
    register() {
      this.errors = {};
      this.error = null;
      
      axios.post('/api/register', this.form)
        .then(response => {
          // Store the token in localStorage
          localStorage.setItem('token', response.data.token);
          
          // Set the default Authorization header for Axios
          axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
          
          // Redirect to dashboard or tasks page
          this.$router.push('/tasks');
        })
        .catch(error => {
          if (error.response && error.response.status === 422) {
            this.errors = error.response.data.errors || {};
          } else {
            this.error = error.response?.data?.message || 'Registration failed.';
          }
        });
    }
  }
}
</script>

<style scoped>
.container {
  max-width: 500px;
  margin: 0 auto;
  padding: 20px;
}

.mb-3 {
  margin-bottom: 1rem;
}

.form-control {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ced4da;
  border-radius: 0.25rem;
}

.text-danger {
  color: #dc3545;
  font-size: 0.875rem;
  margin-top: 0.25rem;
}

.btn {
  padding: 0.5rem 1rem;
  font-size: 1rem;
  border-radius: 0.25rem;
  cursor: pointer;
}

.btn-primary {
  background-color: #007bff;
  color: white;
  border: none;
}

.btn-primary:disabled {
  background-color: #6c757d;
  cursor: not-allowed;
}
</style>