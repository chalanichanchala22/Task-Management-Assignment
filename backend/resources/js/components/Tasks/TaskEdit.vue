<template>
  <div class="container">
    <h1>Edit Task</h1>
    
    <div v-if="loading" class="text-center my-5">
      <div class="spinner-border" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
    </div>
    
    <form v-else @submit.prevent="updateTask" class="mt-4">
      <div class="mb-3">
        <label for="title" class="form-label">Title</label>
        <input type="text" class="form-control" id="title" v-model="task.title" required>
        <div class="text-danger" v-if="errors.title">{{ errors.title[0] }}</div>
      </div>
      
      <div class="mb-3">
        <label for="description" class="form-label">Description</label>
        <textarea class="form-control" id="description" v-model="task.description" rows="3"></textarea>
        <div class="text-danger" v-if="errors.description">{{ errors.description[0] }}</div>
      </div>
      
      <div class="mb-3">
        <label for="category" class="form-label">Category</label>
        <select class="form-select" id="category" v-model="task.category_id">
          <option value="">No Category</option>
          <option v-for="category in categories" :key="category.id" :value="category.id">{{ category.name }}</option>
        </select>
        <div class="text-danger" v-if="errors.category_id">{{ errors.category_id[0] }}</div>
      </div>
      
      <div class="mb-3">
        <label for="status" class="form-label">Status</label>
        <select class="form-select" id="status" v-model="task.status">
          <option value="pending">Pending</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>
        <div class="text-danger" v-if="errors.status">{{ errors.status[0] }}</div>
      </div>
      
      <div class="mb-3">
        <label for="due_date" class="form-label">Due Date</label>
        <input type="date" class="form-control" id="due_date" v-model="task.due_date">
        <div class="text-danger" v-if="errors.due_date">{{ errors.due_date[0] }}</div>
      </div>
      
      <div class="mb-3">
        <button type="submit" class="btn btn-primary" :disabled="saving">
          {{ saving ? 'Saving...' : 'Update Task' }}
        </button>
        <router-link to="/tasks" class="btn btn-outline-secondary ms-2">Cancel</router-link>
      </div>
    </form>
  </div>
</template>

<script>
export default {
  data() {
    return {
      task: {
        id: null,
        title: '',
        description: '',
        status: '',
        due_date: '',
        category_id: ''
      },
      errors: {},
      loading: true,
      saving: false
    };
  },
  computed: {
    categories() {
      return this.$store.getters.categories;
    },
    taskId() {
      return parseInt(this.$route.params.id);
    }
  },
  methods: {
    async updateTask() {
      this.saving = true;
      this.errors = {};
      
      try {
        await this.$store.dispatch('updateTask', {
          id: this.taskId,
          taskData: this.task
        });
        this.$router.push('/tasks');
      } catch (error) {
        if (error.response?.data?.errors) {
          this.errors = error.response.data.errors;
        } else {
          console.error('Error updating task:', error);
        }
      } finally {
        this.saving = false;
      }
    },
    loadTask() {
      this.loading = true;
      
      const task = this.$store.getters.tasks.find(t => t.id === this.taskId);
      
      if (task) {
        this.task = { ...task };
        this.loading = false;
      } else {
        // If we don't have the task in the store, fetch all tasks
        this.$store.dispatch('fetchTasks').then(() => {
          const task = this.$store.getters.tasks.find(t => t.id === this.taskId);
          if (task) {
            this.task = { ...task };
          } else {
            console.error('Task not found');
            this.$router.push('/tasks');
          }
          this.loading = false;
        }).catch(error => {
          console.error('Error fetching task:', error);
          this.loading = false;
          this.$router.push('/tasks');
        });
      }
    }
  },
  created() {
    // Ensure we have categories
    if (this.categories.length === 0) {
      this.$store.dispatch('fetchCategories');
    }
    
    this.loadTask();
  }
}
</script>