<template>
  <div class="container">
    <h1 class="mb-4">Dashboard</h1>
    
    <div v-if="loading" class="text-center my-5">
      <div class="spinner-border" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
    </div>
    
    <div class="row" v-else>
      <div class="col-md-4 mb-4">
        <div class="card bg-light">
          <div class="card-body">
            <h5 class="card-title">Tasks Overview</h5>
            <div class="d-flex justify-content-between align-items-center">
              <span>Total Tasks:</span>
              <span class="badge bg-primary">{{ tasks.length }}</span>
            </div>
            <div class="d-flex justify-content-between align-items-center mt-2">
              <span>Pending:</span>
              <span class="badge bg-warning">{{ pendingTasks.length }}</span>
            </div>
            <div class="d-flex justify-content-between align-items-center mt-2">
              <span>In Progress:</span>
              <span class="badge bg-info">{{ inProgressTasks.length }}</span>
            </div>
            <div class="d-flex justify-content-between align-items-center mt-2">
              <span>Completed:</span>
              <span class="badge bg-success">{{ completedTasks.length }}</span>
            </div>
            <div class="mt-3">
              <router-link to="/tasks" class="btn btn-outline-primary btn-sm">Manage Tasks</router-link>
            </div>
          </div>
        </div>
      </div>
      
      <div class="col-md-4 mb-4">
        <div class="card bg-light">
          <div class="card-body">
            <h5 class="card-title">Categories</h5>
            <div class="d-flex justify-content-between align-items-center">
              <span>Total Categories:</span>
              <span class="badge bg-primary">{{ categories.length }}</span>
            </div>
            <div class="mt-3">
              <router-link to="/categories" class="btn btn-outline-primary btn-sm">Manage Categories</router-link>
            </div>
          </div>
        </div>
      </div>
      
      <div class="col-md-4 mb-4">
        <div class="card bg-light">
          <div class="card-body">
            <h5 class="card-title">Quick Actions</h5>
            <div class="d-grid gap-2">
              <router-link to="/tasks/create" class="btn btn-outline-success btn-sm">
                Create New Task
              </router-link>
              <router-link to="/categories/create" class="btn btn-outline-success btn-sm">
                Create New Category
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <div class="row mt-4">
      <div class="col-md-12">
        <h3>Recent Tasks</h3>
        <table class="table table-striped" v-if="recentTasks.length > 0">
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
            <tr v-for="task in recentTasks" :key="task.id">
              <td>{{ task.title }}</td>
              <td>{{ task.category?.name || 'No Category' }}</td>
              <td>
                <span class="badge" :class="statusBadgeClass(task.status)">
                  {{ formatStatus(task.status) }}
                </span>
              </td>
              <td>{{ formatDate(task.due_date) }}</td>
              <td>
                <router-link :to="`/tasks/${task.id}/edit`" class="btn btn-sm btn-outline-primary me-1">
                  Edit
                </router-link>
              </td>
            </tr>
          </tbody>
        </table>
        <div v-else class="alert alert-info">No recent tasks found.</div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      loading: true
    }
  },
  computed: {
    tasks() {
      return this.$store.getters.tasks;
    },
    categories() {
      return this.$store.getters.categories;
    },
    pendingTasks() {
      return this.tasks.filter(task => task.status === 'pending');
    },
    inProgressTasks() {
      return this.tasks.filter(task => task.status === 'in_progress');
    },
    completedTasks() {
      return this.tasks.filter(task => task.status === 'completed');
    },
    recentTasks() {
      return [...this.tasks].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 5);
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
        await Promise.all([
          this.$store.dispatch('fetchTasks'),
          this.$store.dispatch('fetchCategories')
        ]);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        this.loading = false;
      }
    }
  },
  created() {
    this.fetchData();
    
    // Listen for real-time events
    if (this.$store.getters.isAuthenticated) {
      const userId = this.$store.getters.user.id;
      
      window.Echo.private(`user.${userId}`)
        .listen('TaskCreated', (e) => {
          this.$store.commit('addTask', e.task);
        })
        .listen('TaskUpdated', (e) => {
          this.$store.commit('updateTask', e.task);
        })
        .listen('TaskDeleted', (e) => {
          this.$store.commit('removeTask', e.task.id);
        });
    }
  },
  beforeUnmount() {
    // Clean up the listener when component is destroyed
    if (this.$store.getters.isAuthenticated) {
      const userId = this.$store.getters.user.id;
      window.Echo.leave(`user.${userId}`);
    }
  }
}
</script>