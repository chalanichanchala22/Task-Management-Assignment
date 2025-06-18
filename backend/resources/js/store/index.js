import { createStore } from 'vuex';
import axios from 'axios';

export default createStore({
  state: {
    user: null,
    token: localStorage.getItem('token') || null,
    tasks: [],
    categories: []
  },
  getters: {
    isAuthenticated: state => !!state.token,
    user: state => state.user,
    tasks: state => state.tasks,
    categories: state => state.categories
  },
  mutations: {
    setToken(state, token) {
      state.token = token;
      if (token) {
        localStorage.setItem('token', token);
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      } else {
        localStorage.removeItem('token');
        delete axios.defaults.headers.common['Authorization'];
      }
    },
    setUser(state, user) {
      state.user = user;
    },
    setTasks(state, tasks) {
      state.tasks = tasks;
    },
    addTask(state, task) {
      state.tasks.push(task);
    },
    updateTask(state, updatedTask) {
      const index = state.tasks.findIndex(task => task.id === updatedTask.id);
      if (index !== -1) {
        state.tasks.splice(index, 1, updatedTask);
      }
    },
    removeTask(state, taskId) {
      state.tasks = state.tasks.filter(task => task.id !== taskId);
    },
    setCategories(state, categories) {
      state.categories = categories;
    },
    addCategory(state, category) {
      state.categories.push(category);
    },
    updateCategory(state, updatedCategory) {
      const index = state.categories.findIndex(category => category.id === updatedCategory.id);
      if (index !== -1) {
        state.categories.splice(index, 1, updatedCategory);
      }
    },
    removeCategory(state, categoryId) {
      state.categories = state.categories.filter(category => category.id !== categoryId);
    }
  },
  actions: {
    async login({ commit }, credentials) {
      try {
        const response = await axios.post('/login', credentials);
        commit('setToken', response.data.token);
        commit('setUser', response.data.user);
        return response;
      } catch (error) {
        throw error;
      }
    },
    async register({ commit }, userData) {
      try {
        const response = await axios.post('/register', userData);
        commit('setToken', response.data.token);
        commit('setUser', response.data.user);
        return response;
      } catch (error) {
        throw error;
      }
    },
    async logout({ commit }) {
      try {
        await axios.post('/logout');
      } catch (error) {
        console.error('Logout error:', error);
      } finally {
        commit('setToken', null);
        commit('setUser', null);
      }
    },
    async fetchUser({ commit }) {
      try {
        const response = await axios.get('/api/user');
        commit('setUser', response.data);
        return response;
      } catch (error) {
        throw error;
      }
    },
    async fetchTasks({ commit }) {
      try {
        const response = await axios.get('/api/tasks');
        commit('setTasks', response.data);
        return response;
      } catch (error) {
        throw error;
      }
    },
    async createTask({ commit }, taskData) {
      try {
        const response = await axios.post('/api/tasks', taskData);
        commit('addTask', response.data);
        return response;
      } catch (error) {
        throw error;
      }
    },
    async updateTask({ commit }, { id, taskData }) {
      try {
        const response = await axios.put(`/api/tasks/${id}`, taskData);
        commit('updateTask', response.data);
        return response;
      } catch (error) {
        throw error;
      }
    },
    async deleteTask({ commit }, id) {
      try {
        await axios.delete(`/api/tasks/${id}`);
        commit('removeTask', id);
      } catch (error) {
        throw error;
      }
    },
    async fetchCategories({ commit }) {
      try {
        const response = await axios.get('/api/categories');
        commit('setCategories', response.data);
        return response;
      } catch (error) {
        throw error;
      }
    },
    async createCategory({ commit }, categoryData) {
      try {
        const response = await axios.post('/api/categories', categoryData);
        commit('addCategory', response.data);
        return response;
      } catch (error) {
        throw error;
      }
    },
    async updateCategory({ commit }, { id, categoryData }) {
      try {
        const response = await axios.put(`/api/categories/${id}`, categoryData);
        commit('updateCategory', response.data);
        return response;
      } catch (error) {
        throw error;
      }
    },
    async deleteCategory({ commit }, id) {
      try {
        await axios.delete(`/api/categories/${id}`);
        commit('removeCategory', id);
      } catch (error) {
        throw error;
      }
    }
  }
});