<template>
  <div class="container">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h1>Categories</h1>
      <router-link to="/categories/create" class="btn btn-primary">Create New Category</router-link>
    </div>
    
    <div v-if="loading" class="text-center">
      <div class="spinner-border" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
    </div>
    
    <div v-else-if="categories.length === 0" class="alert alert-info">
      You don't have any categories yet. Create one to get started!
    </div>
    
    <div v-else class="table-responsive">
      <table class="table table-striped">
        <thead>
          <tr>
            <th>Name</th>
            <th>Description</th>
            <th>Task Count</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="category in categories" :key="category.id">
            <td>{{ category.name }}</td>
            <td>{{ category.description || 'No description' }}</td>
            <td>{{ getTaskCount(category.id) }}</td>
            <td>
              <div class="btn-group">
                <router-link :to="`/categories/${category.id}/edit`" class="btn btn-sm btn-outline-primary">
                  Edit
                </router-link>
                <button @click="deleteCategory(category.id)" class="btn btn-sm btn-outline-danger">
                  Delete
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      loading: true,
    }
  },
  computed: {
    categories() {
      return this.$store.getters.categories;
    },
    tasks() {
      return this.$store.getters.tasks;
    }
  },
  methods: {
    getTaskCount(categoryId) {
      return this.tasks.filter(task => task.category_id === categoryId).length;
    },
    async fetchData() {
      this.loading = true;
      try {
        await this.$store.dispatch('fetchCategories');
        if (this.tasks.length === 0) {
          await this.$store.dispatch('fetchTasks');
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      } finally {
        this.loading = false;
      }
    },
    async deleteCategory(id) {
      // Check if there are any tasks using this category
      const taskCount = this.getTaskCount(id);
      
      if (taskCount > 0) {
        if (!confirm(`This category has ${taskCount} tasks. Are you sure you want to delete it? Tasks will be updated to have no category.`)) {
          return;
        }
      } else if (!confirm('Are you sure you want to delete this category?')) {
        return;
      }
      
      try {
        await this.$store.dispatch('deleteCategory', id);
      } catch (error) {
        console.error('Error deleting category:', error);
      }
    }
  },
  created() {
    this.fetchData();
  }
}
</script>