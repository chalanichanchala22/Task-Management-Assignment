import axios from 'axios';

export default {
  data() {
    return {
      tasks: [],
      error: null
    }
  },
  async created() {
    try {
      // Set the token for authenticated requests
      const token = localStorage.getItem('token');
      if (token) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      }
      const response = await axios.get('http://localhost:8000/api/tasks');
      this.tasks = response.data;
    } catch (error) {
      this.error = error.response?.data?.message || 'Failed to fetch tasks.';
    }
  }
}
