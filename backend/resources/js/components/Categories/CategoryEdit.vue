<template>
  <div class="container">
    <h1>Edit Category</h1>
    
    <div v-if="loading" class="text-center my-5">
      <div class="spinner-border" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
    </div>
    
    <form v-else @submit.prevent="updateCategory" class="mt-4">
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
        <button type="submit" class="btn btn-primary" :disabled="saving">
          {{ saving ? 'Saving...' : 'Update Category' }}
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
        id: null,
        name: '',
        description: ''
      },
      errors: {},
      loading: true,
      saving: false
    };
  },
  computed: {
    categoryId() {
      return parseInt(this.$route.params.id);
    }
  },
  methods: {
    async updateCategory() {
      this.saving = true;
      this.errors = {};
      
      try {
        await this.$store.dispatch('updateCategory', {
          id: this.categoryId,
          categoryData: this.category
        });
        this.$router.push('/categories');
      } catch (error) {
        if (error.response?.data?.errors) {
          this.errors = error.response.data.errors;
        } else {
          console.error('Error updating category:', error);
        }
      } finally {
        this.saving = false;
      }
    },
    loadCategory() {
      this.loading = true;
      
      const category = this.$store.getters.categories.find(c => c.id === this.categoryId);
      
      if (category) {
        this.category = { ...category };
        this.loading = false;
      } else {
        // If we don't have the category in the store, fetch all categories
        this.$store.dispatch('fetchCategories').then(() => {
          const category = this.$store.getters.categories.find(c => c.id === this.categoryId);
          if (category) {
            this.category = { ...category };
          } else {
            console.error('Category not found');
            this.$router.push('/categories');
          }
          this.loading = false;
        }).catch(error => {
          console.error('Error fetching category:', error);
          this.loading = false;
          this.$router.push('/categories');
        });
      }
    }
  },
  created() {
    this.loadCategory();
  }
}
</script>