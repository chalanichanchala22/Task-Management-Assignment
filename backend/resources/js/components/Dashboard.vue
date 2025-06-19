<template>
  <div class="container py-4">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h1>Dashboard</h1>
      <div>
        <button @click="fetchData" class="btn btn-outline-secondary" :disabled="loading">
          <i class="fas fa-sync-alt me-1" :class="{'fa-spin': loading}"></i> Refresh
        </button>
      </div>
    </div>
    
    <!-- Error alert -->
    <div v-if="error" class="alert alert-danger alert-dismissible fade show" role="alert">
      <strong>Error!</strong> {{ error }}
      <button type="button" class="btn-close" @click="error = null"></button>
    </div>
    
    <!-- Welcome message -->
    <div v-if="user" class="alert alert-info mb-4">
      Welcome back, {{ user.name }}! You have {{ pendingTasks.length }} pending tasks.
      <span v-if="dueSoonCount > 0" class="ms-2 fw-bold">
        {{ dueSoonCount }} task{{ dueSoonCount !== 1 ? 's' : '' }} due soon!
      </span>
    </div>
    
    <!-- Loading spinner -->
    <div v-if="loading" class="text-center my-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
      <p class="text-muted mt-2">Loading your dashboard...</p>
    </div>
    
    <div v-else>
      <!-- Stats cards -->
      <div class="row mb-4">
        <div class="col-md-3 col-sm-6 mb-4 mb-md-0">
          <div class="card h-100 border-0 shadow-sm">
            <div class="card-body d-flex flex-column">
              <h5 class="card-title text-primary">Total Tasks</h5>
              <div class="d-flex align-items-center mt-auto">
                <div class="display-4 me-3">{{ tasks.length }}</div>
                <div class="progress flex-grow-1" style="height: 8px;">
                  <div class="progress-bar bg-primary" role="progressbar" style="width: 100%"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="col-md-3 col-sm-6 mb-4 mb-md-0">
          <div class="card h-100 border-0 shadow-sm">
            <div class="card-body d-flex flex-column">
              <h5 class="card-title text-success">Completed</h5>
              <div class="d-flex align-items-center mt-auto">
                <div class="display-4 me-3">{{ completedTasks.length }}</div>
                <div class="progress flex-grow-1" style="height: 8px;">
                  <div 
                    class="progress-bar bg-success" 
                    role="progressbar" 
                    :style="`width: ${completionRate}%`"
                  ></div>
                </div>
              </div>
              <small class="text-muted mt-2">{{ completionRate }}% completed</small>
            </div>
          </div>
        </div>
        
        <div class="col-md-3 col-sm-6 mb-4 mb-md-0">
          <div class="card h-100 border-0 shadow-sm">
            <div class="card-body d-flex flex-column">
              <h5 class="card-title text-warning">Pending</h5>
              <div class="d-flex align-items-center mt-auto">
                <div class="display-4 me-3">{{ pendingTasks.length }}</div>
                <div class="progress flex-grow-1" style="height: 8px;">
                  <div 
                    class="progress-bar bg-warning" 
                    role="progressbar" 
                    :style="`width: ${pendingTasksRate}%`"
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="col-md-3 col-sm-6 mb-4 mb-md-0">
          <div class="card h-100 border-0 shadow-sm">
            <div class="card-body d-flex flex-column">
              <h5 class="card-title text-danger">Overdue</h5>
              <div class="d-flex align-items-center mt-auto">
                <div class="display-4 me-3">{{ overdueTasks.length }}</div>
                <div class="progress flex-grow-1" style="height: 8px;">
                  <div 
                    class="progress-bar bg-danger" 
                    role="progressbar" 
                    :style="`width: ${overdueTasksRate}%`"
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="row mb-4">
        <!-- Task status breakdown -->
        <div class="col-lg-6 mb-4">
          <div class="card border-0 shadow-sm h-100">
            <div class="card-header bg-white border-0">
              <h5 class="card-title mb-0">Task Overview</h5>
            </div>
            <div class="card-body">
              <div class="task-status-chart mb-3" style="height: 200px;">
                <!-- This is a placeholder - would be implemented with a chart library -->
                <div class="d-flex h-100">
                  <div 
                    class="bg-warning align-self-end" 
                    :style="`width: ${pendingTasksRate}%; height: ${pendingTasksRate}%`"
                    title="Pending"
                  ></div>
                  <div 
                    class="bg-primary align-self-end" 
                    :style="`width: ${inProgressTasksRate}%; height: ${inProgressTasksRate}%`"
                    title="In Progress"
                  ></div>
                  <div 
                    class="bg-success align-self-end" 
                    :style="`width: ${completionRate}%; height: ${completionRate}%`"
                    title="Completed"
                  ></div>
                </div>
              </div>
              
              <div class="d-flex justify-content-between align-items-center mt-2">
                <div>
                  <span class="badge bg-warning me-1">Pending</span>
                  {{ pendingTasks.length }}
                </div>
                <div>
                  <span class="badge bg-primary me-1">In Progress</span>
                  {{ inProgressTasks.length }}
                </div>
                <div>
                  <span class="badge bg-success me-1">Completed</span>
                  {{ completedTasks.length }}
                </div>
              </div>
              
              <div class="mt-3">
                <router-link to="/tasks" class="btn btn-outline-primary btn-sm">
                  <i class="fas fa-tasks me-1"></i> Manage Tasks
                </router-link>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Categories -->
        <div class="col-lg-6 mb-4">
          <div class="card border-0 shadow-sm h-100">
            <div class="card-header bg-white border-0 d-flex justify-content-between align-items-center">
              <h5 class="card-title mb-0">Categories</h5>
              <router-link to="/categories/create" class="btn btn-sm btn-outline-success">
                <i class="fas fa-plus me-1"></i> New
              </router-link>
            </div>
            <div class="card-body">
              <div v-if="categories.length === 0" class="text-center my-4 text-muted">
                <i class="fas fa-folder-open fa-2x mb-2"></i>
                <p>No categories yet. Create your first category to organize tasks.</p>
              </div>
              
              <div v-else class="table-responsive">
                <table class="table table-hover">
                  <thead>
                    <tr>
                      <th>Category</th>
                      <th>Tasks</th>
                      <th>Progress</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="category in categoriesWithCounts" :key="category.id">
                      <td>
                        <div class="d-flex align-items-center">
                          <div 
                            class="category-color me-2" 
                            :style="`background-color: ${category.color || '#6c757d'}`"
                          ></div>
                          {{ category.name }}
                        </div>
                      </td>
                      <td>{{ category.taskCount }}</td>
                      <td>
                        <div class="progress" style="height: 6px;">
                          <div 
                            class="progress-bar" 
                            role="progressbar"
                            :style="`width: ${category.completionRate}%; background-color: ${category.color || '#6c757d'}`"
                          ></div>
                        </div>
                        <small>{{ category.completionRate }}% complete</small>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              
              <div class="mt-3">
                <router-link to="/categories" class="btn btn-outline-primary btn-sm">
                  <i class="fas fa-folder me-1"></i> Manage Categories
                </router-link>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Quick Actions and Due Soon -->
      <div class="row mb-4">
        <div class="col-lg-6 mb-4">
          <div class="card border-0 shadow-sm">
            <div class="card-header bg-white border-0">
              <h5 class="card-title mb-0">Quick Actions</h5>
            </div>
            <div class="card-body">
              <div class="d-grid gap-2">
                <router-link to="/tasks/create" class="btn btn-success">
                  <i class="fas fa-plus-circle me-2"></i> Create New Task
                </router-link>
                
                <router-link to="/categories/create" class="btn btn-outline-primary">
                  <i class="fas fa-folder-plus me-2"></i> Create New Category
                </router-link>
                
                <button class="btn btn-outline-secondary" @click="fetchData">
                  <i class="fas fa-sync-alt me-2"></i> Refresh Dashboard
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <div class="col-lg-6 mb-4">
          <div class="card border-0 shadow-sm">
            <div class="card-header bg-white border-0">
              <h5 class="card-title mb-0">Due Soon</h5>
            </div>
            <div class="card-body p-0">
              <div v-if="dueSoonTasks.length === 0" class="text-center py-4 text-muted">
                <i class="fas fa-calendar-check fa-2x mb-2"></i>
                <p>No upcoming tasks due soon.</p>
              </div>
              <ul v-else class="list-group list-group-flush">
                <li v-for="task in dueSoonTasks" :key="task.id" class="list-group-item">
                  <div class="d-flex justify-content-between align-items-center">
                    <div>
                      <router-link :to="`/tasks/${task.id}`" class="task-title">
                        {{ task.title }}
                      </router-link>
                      <div class="small text-muted">
                        {{ formatDueDate(task.due_date) }}
                      </div>
                    </div>
                    <div>
                      <span class="badge" :class="priorityBadgeClass(task.priority)">
                        {{ formatPriority(task.priority) }}
                      </span>
                    </div>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Recent Tasks -->
      <div class="row">
        <div class="col-12">
          <div class="card border-0 shadow-sm">
            <div class="card-header bg-white border-0 d-flex justify-content-between align-items-center">
              <h5 class="card-title mb-0">Recent Tasks</h5>
              <router-link to="/tasks" class="btn btn-sm btn-outline-primary">
                View All
              </router-link>
            </div>
            <div class="card-body p-0">
              <div v-if="recentTasks.length === 0" class="text-center py-4 text-muted">
                <i class="fas fa-tasks fa-2x mb-2"></i>
                <p>No tasks created yet. Start by creating your first task.</p>
              </div>
              
              <div v-else class="table-responsive">
                <table class="table table-hover">
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Category</th>
                      <th>Priority</th>
                      <th>Status</th>
                      <th>Due Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="task in recentTasks" :key="task.id">
                      <td>{{ task.title }}</td>
                      <td>
                        <span v-if="task.category" class="badge text-bg-light">
                          <span 
                            class="category-dot"
                            :style="`background-color: ${task.category.color || '#6c757d'}`"
                          ></span>
                          {{ task.category.name }}
                        </span>
                        <span v-else class="text-muted">Uncategorized</span>
                      </td>
                      <td>
                        <span class="badge" :class="priorityBadgeClass(task.priority)">
                          {{ formatPriority(task.priority) }}
                        </span>
                      </td>
                      <td>
                        <span class="badge" :class="statusBadgeClass(task.status)">
                          {{ formatStatus(task.status) }}
                        </span>
                      </td>
                      <td>
                        <span :class="{ 'text-danger fw-bold': isOverdue(task) }">
                          {{ formatDate(task.due_date) }}
                        </span>
                      </td>
                      <td>
                        <div class="btn-group btn-group-sm">
                          <router-link :to="`/tasks/${task.id}`" class="btn btn-outline-primary">
                            <i class="fas fa-eye"></i>
                          </router-link>
                          <router-link :to="`/tasks/${task.id}/edit`" class="btn btn-outline-secondary">
                            <i class="fas fa-edit"></i>
                          </router-link>
                          <button 
                            @click="markAsCompleted(task)" 
                            v-if="task.status !== 'completed'"
                            class="btn btn-outline-success"
                            title="Mark as completed"
                          >
                            <i class="fas fa-check"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Real-time notification toast -->
    <div class="position-fixed bottom-0 end-0 p-3" style="z-index: 11">
      <div 
        v-if="notification"
        class="toast show" 
        role="alert" 
        aria-live="assertive" 
        aria-atomic="true"
      >
        <div class="toast-header" :class="notification.headerClass">
          <strong class="me-auto text-white">{{ notification.title }}</strong>
          <button 
            type="button" 
            class="btn-close btn-close-white" 
            @click="notification = null"
          ></button>
        </div>
        <div class="toast-body">
          {{ notification.message }}
        </div>
      </div>
    </div>
    
  </div>
</template>

<script>
import { format, isAfter, isBefore, addDays } from 'date-fns';
import { mapGetters } from 'vuex';

export default {
  name: 'DashboardPage',
  data() {
    return {
      loading: true,
      error: null,
      notification: null,
      notificationTimeout: null
    };
  },
  computed: {
    ...mapGetters({
      tasks: 'tasks',
      categories: 'categories',
      user: 'user',
      isAuthenticated: 'isAuthenticated'
    }),
    pendingTasks() {
      return this.tasks.filter(task => task.status === 'pending');
    },
    inProgressTasks() {
      return this.tasks.filter(task => task.status === 'in_progress');
    },
    completedTasks() {
      return this.tasks.filter(task => task.status === 'completed');
    },
    overdueTasks() {
      const now = new Date();
      return this.tasks.filter(task => 
        task.status !== 'completed' && 
        task.due_date && 
        isBefore(new Date(task.due_date), now)
      );
    },
    dueSoonTasks() {
      const now = new Date();
      const threeDaysLater = addDays(now, 3);
      
      return this.tasks
        .filter(task => 
          task.status !== 'completed' && 
          task.due_date && 
          isAfter(new Date(task.due_date), now) &&
          isBefore(new Date(task.due_date), threeDaysLater)
        )
        .sort((a, b) => new Date(a.due_date) - new Date(b.due_date));
    },
    dueSoonCount() {
      return this.dueSoonTasks.length;
    },
    recentTasks() {
      return [...this.tasks]
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 5);
    },
    completionRate() {
      if (this.tasks.length === 0) return 0;
      return Math.round((this.completedTasks.length / this.tasks.length) * 100);
    },
    pendingTasksRate() {
      if (this.tasks.length === 0) return 0;
      return Math.round((this.pendingTasks.length / this.tasks.length) * 100);
    },
    inProgressTasksRate() {
      if (this.tasks.length === 0) return 0;
      return Math.round((this.inProgressTasks.length / this.tasks.length) * 100);
    },
    overdueTasksRate() {
      if (this.tasks.length === 0) return 0;
      return Math.round((this.overdueTasks.length / this.tasks.length) * 100);
    },
    categoriesWithCounts() {
      return this.categories.map(category => {
        const categoryTasks = this.tasks.filter(task => task.category_id === category.id);
        const completedCategoryTasks = categoryTasks.filter(task => task.status === 'completed');
        
        return {
          ...category,
          taskCount: categoryTasks.length,
          completedCount: completedCategoryTasks.length,
          completionRate: categoryTasks.length > 0 
            ? Math.round((completedCategoryTasks.length / categoryTasks.length) * 100) 
            : 0
        };
      });
    }
  },
  methods: {
    statusBadgeClass(status) {
      switch (status) {
        case 'pending': return 'bg-warning text-dark';
        case 'in_progress': return 'bg-primary';
        case 'completed': return 'bg-success';
        default: return 'bg-secondary';
      }
    },
    priorityBadgeClass(priority) {
      switch (priority) {
        case 'low': return 'bg-info text-dark';
        case 'medium': return 'bg-warning text-dark';
        case 'high': return 'bg-danger';
        default: return 'bg-secondary';
      }
    },
    formatStatus(status) {
      return status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
    },
    formatPriority(priority) {
      return priority ? priority.charAt(0).toUpperCase() + priority.slice(1) : 'None';
    },
    formatDate(dateString) {
      if (!dateString) return 'No due date';
      
      const date = new Date(dateString);
      return format(date, 'MMM d, yyyy');
    },
    formatDueDate(dateString) {
      if (!dateString) return 'No due date';
      
      const dueDate = new Date(dateString);
      const now = new Date();
      
      // If due date is today
      if (format(dueDate, 'yyyy-MM-dd') === format(now, 'yyyy-MM-dd')) {
        return 'Due Today';
      }
      
      // If due date is tomorrow
      const tomorrow = addDays(now, 1);
      if (format(dueDate, 'yyyy-MM-dd') === format(tomorrow, 'yyyy-MM-dd')) {
        return 'Due Tomorrow';
      }
      
      // If overdue
      if (isBefore(dueDate, now)) {
        return `Overdue by ${Math.floor((now - dueDate) / (1000 * 60 * 60 * 24))} days`;
      }
      
      // Otherwise show date
      return `Due ${format(dueDate, 'MMM d')}`;
    },
    isOverdue(task) {
      if (!task.due_date || task.status === 'completed') return false;
      return isBefore(new Date(task.due_date), new Date());
    },
    async fetchData() {
      this.loading = true;
      this.error = null;
      
      try {
        await Promise.all([
          this.$store.dispatch('fetchTasks'),
          this.$store.dispatch('fetchCategories')
        ]);
      } catch (error) {
        console.error('Error fetching data:', error);
        this.error = 'Failed to load dashboard data. Please try again.';
      } finally {
        this.loading = false;
      }
    },
    async markAsCompleted(task) {
      try {
        const updatedTask = { ...task, status: 'completed' };
        await this.$store.dispatch('updateTask', updatedTask);
        
        this.showNotification({
          title: 'Task Completed',
          message: `"${task.title}" marked as completed.`,
          headerClass: 'bg-success'
        });
      } catch (error) {
        console.error('Error updating task:', error);
        this.showNotification({
          title: 'Error',
          message: 'Failed to update task status.',
          headerClass: 'bg-danger'
        });
      }
    },
    showNotification(notification) {
      // Clear any existing timeout
      if (this.notificationTimeout) {
        clearTimeout(this.notificationTimeout);
      }
      
      this.notification = notification;
      
      // Auto-dismiss after 3 seconds
      this.notificationTimeout = setTimeout(() => {
        this.notification = null;
      }, 3000);
    },
    setupRealTimeListeners() {
      if (this.isAuthenticated && this.user) {
        const userId = this.user.id;
        
        window.Echo.private(`user.${userId}`)
          .listen('TaskCreated', (e) => {
            this.$store.commit('addTask', e.task);
            this.showNotification({
              title: 'New Task',
              message: `New task "${e.task.title}" was created.`,
              headerClass: 'bg-primary'
            });
          })
          .listen('TaskUpdated', (e) => {
            this.$store.commit('updateTask', e.task);
            this.showNotification({
              title: 'Task Updated',
              message: `Task "${e.task.title}" was updated.`,
              headerClass: 'bg-info'
            });
          })
          .listen('TaskDeleted', (e) => {
            this.$store.commit('removeTask', e.taskId);
            this.showNotification({
              title: 'Task Deleted',
              message: 'A task was deleted.',
              headerClass: 'bg-warning'
            });
          });
      }
    }
  },
  created() {
    this.fetchData();
    this.setupRealTimeListeners();
  },
  beforeUnmount() {
    // Clean up the listener when component is destroyed
    if (this.isAuthenticated && this.user) {
      const userId = this.user.id;
      window.Echo.leave(`user.${userId}`);
    }
    
    // Clear any pending notification timeout
    if (this.notificationTimeout) {
      clearTimeout(this.notificationTimeout);
    }
  }
}
</script>

<style scoped>
.card {
  transition: transform 0.2s, box-shadow 0.2s;
}

.card:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 20px rgba(0,0,0,.05) !important;
}

.category-color {
  width: 12px;
  height: 12px;
  border-radius: 3px;
}

.category-dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-right: 5px;
}

.task-title {
  color: #333;
  text-decoration: none;
}

.task-title:hover {
  color: #007bff;
  text-decoration: underline;
}

.task-status-chart {
  display: flex;
  align-items: flex-end;
  gap: 1px;
}

.task-status-chart > div {
  flex-grow: 1;
  border-radius: 4px 4px 0 0;
}

/* Toast styles */
.toast {
  min-width: 250px;
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
  border: none;
  border-radius: 6px;
  overflow: hidden;
}

.toast-header {
  padding: 0.75rem 1rem;
}
</style>