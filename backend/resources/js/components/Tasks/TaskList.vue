<template>
  <div class="container">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h1>Tasks</h1>
      <router-link to="/tasks/create" class="btn btn-primary">Create New Task</router-link>
    </div>
    
    <div v-if="loading" class="text-center">
      <div class="spinner-border" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
    </div>
    
    <div v-else-if="tasks.length === 0" class="alert alert-info">
      You don't have any tasks yet. Create one to get started!
    </div>
    
    <div v-else>
      <div class="mb-3">
        <label for="statusFilter" class="form-label">Filter by Status:</label>
        <select id="statusFilter" class="form-select" v-model="statusFilter">
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>
      </div>
      
      <div class="mb-3">
        <label for="categoryFilter" class="form-label">Filter by Category:</label>
        <select id="categoryFilter" class="form-select" v-model="categoryFilter">
          <option value="">All Categories</option>
          <option v-for="category in categories" :key="category.id" :value="category.id">
            {{ category.name }}
          </option>
        </select>
      </div>
      
      <div class="table-responsive">
        <table class="table table-striped">
          <thead>
            <tr>
              <th>Title</th>
              <th>Category</th>
              <th>Status</th>
              <th>Due Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="task in filteredTasks" :key="task.id">
              <td>{{ task.title }}</td>
              <td>{{ task.category?.name || 'No Category' }}</td>
              <td>
                <span class="badge" :class="statusBadgeClass(task.status)">
                  {{ formatStatus(task.status) }}
                </span>
              </td>
              <td>{{ formatDate(task.due_date) }}</td>
              <td>
                <div class="btn-group">
                  <router-link :to="`/tasks/${task.id}/edit`" class="btn btn-sm btn-outline-primary">
                    Edit
                  </router-link>
                  <button @click="deleteTask(task.id)" class="btn btn-sm btn-outline-danger">
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script>
import AuthService from '../../services/auth';

export default {
  data() {
    return {
      loading: true,
      statusFilter: '',
      categoryFilter: '',
      tasks: [],
      error: null
    }
  },
  computed: {
    categories() {
      return this.$store.getters.categories;
    },
    filteredTasks() {
      let filtered = [...this.tasks];
      
      if (this.statusFilter) {
        filtered = filtered.filter(task => task.status === this.statusFilter);
      }
      
      if (this.categoryFilter) {
        filtered = filtered.filter(task => 
          task.category_id && task.category_id.toString() === this.categoryFilter.toString()
        );
      }
      
      return filtered;
    }
  },
  methods: {
    statusBadgeClass(status) {
      switch (status) {
        case 'pending': return 'bg-warning';
        case 'in_progress': return 'bg-primary';
        case 'completed': return 'bg-success';
        default: return 'bg-secondary';
      }
    },
    formatStatus(status) {
      return status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
    },
    formatDate(dateString) {
      if (!dateString) return 'No due date';
      return new Date(dateString).toLocaleDateString();
    },
    async fetchData() {
      this.loading = true;
      try {
        // Ensure token is set in headers
        const token = AuthService.getToken();
        if (!token) {
          this.$router.push('/login');
          return;
        }
        
        await this.$store.dispatch('fetchTasks');
        await this.$store.dispatch('fetchCategories');
      } catch (error) {
        console.error('Error fetching tasks:', error);
        if (error.response && error.response.status === 401) {
          this.error = 'You are not authenticated. Please log in.';
          // Redirect to login
          this.$router.push('/login');
        } else {
          this.error = 'Error loading tasks.';
        }
      } finally {
        this.loading = false;
      }
    },
    async deleteTask(id) {
      if (confirm('Are you sure you want to delete this task?')) {
        try {
          await this.$store.dispatch('deleteTask', id);
        } catch (error) {
          console.error('Error deleting task:', error);
        }
      }
    }
  },
  created() {
    this.fetchData();
  }
}
</script>