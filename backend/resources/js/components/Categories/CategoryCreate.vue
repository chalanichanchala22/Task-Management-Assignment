<template>
  <div class="container">
    <h1>Create New Category</h1>
    
    <form @submit.prevent="createCategory" class="mt-4">
      <div class="mb-3">
        <label for="name" class="form-label">Name</label>
        <input type="text" class="form-control" id="name" v-model="category.name" required>
        <div class="text-danger" v-if="errors.name">{{ errors.name[0] }}</div>
      </div>
      
      <div class="mb-3">
        <label for="description" class="form-label">Description</label>
        <textarea class="form-control" id="description" v-model="category.description" rows="3"></textarea>
        <div class="text-danger" v-if="errors.description">{{ errors.description[0] }}</div>
      </div>
      
      <div class="mb-3">
        <button type="submit" class="btn btn-primary" :disabled="loading">
          {{ loading ? 'Creating...' : 'Create Category' }}
        </button>
        <router-link to="/categories" class="btn btn-outline-secondary ms-2">Cancel</router-link>
      </div>
    </form>
  </div>
</template>

<script>
export default {
  data() {
    return {
      category: {
        name: '',
        description: ''
      },
      errors: {},
      loading: false
    };
  },
  methods: {
    async createCategory() {
      this.loading = true;
      this.errors = {};
      
      try {
        await this.$store.dispatch('createCategory', this.category);
        this.$router.push('/categories');
      } catch (error) {
        if (error.response?.data?.errors) {
          this.errors = error.response.data.errors;
        } else {
          console.error('Error creating category:', error);
        }
      } finally {
        this.loading = false;
      }
    }
  }
}
</script>