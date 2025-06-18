<template>
  <div class="container">
    <div class="row justify-content-center">
      <div class="col-md-8">
        <div class="card">
          <div class="card-header">Login</div>
          <div class="card-body">
            <div v-if="errors.length" class="alert alert-danger">
              <ul>
                <li v-for="(error, index) in errors" :key="index">{{ error }}</li>
              </ul>
            </div>
            <form @submit.prevent="login">
              <div class="form-group">
                <label for="email">Email</label>
                <input type="email" class="form-control" id="email" v-model="form.email">
              </div>
              <div class="form-group">
                <label for="password">Password</label>
                <input type="password" class="form-control" id="password" v-model="form.password">
              </div>
              <button type="submit" class="btn btn-primary">Login</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
    data() {
        return {
            form: {
                email: '',
                password: ''
            },
            errors: []
        }
    },
    methods: {
        login() {
            this.errors = [];
            axios.post('/api/login', this.form)
                .then(response => {
                    // Store token in localStorage
                    localStorage.setItem('token', response.data.token);
                    
                    // Set default Authorization header
                    axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
                    
                    // Redirect to tasks
                    this.$router.push('/tasks');
                })
                .catch(error => {
                    if (error.response && error.response.status === 422) {
                        const responseErrors = error.response.data.errors;
                        for (const key in responseErrors) {
                            this.errors = [...this.errors, ...responseErrors[key]];
                        }
                    } else if (error.response && error.response.status === 401) {
                        this.errors.push('Invalid email or password.');
                    } else {
                        this.errors.push('An error occurred during login.');
                    }
                });
        }
    }
}
</script>