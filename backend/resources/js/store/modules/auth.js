import axios from 'axios';

const state = {
  user: null,
  token: localStorage.getItem('token') || '',
};

const mutations = {
  SET_USER(state, user) {
    state.user = user;
  },
  SET_TOKEN(state, token) {
    state.token = token;
  },
};

const actions = {
  async register({ commit }, userData) {
    try {
      const response = await axios.post('/api/register', userData);
      
      if (response.data.user && response.data.token) {
        commit('SET_USER', response.data.user);
        commit('SET_TOKEN', response.data.token);
        
        localStorage.setItem('token', response.data.token);
        axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
        
        return response.data.user;
      }
    } catch (error) {
      throw error;
    }
  },
};

const getters = {
  isAuthenticated(state) {
    return !!state.token;
  },
  getUser(state) {
    return state.user;
  },
};

export default {
  state,
  mutations,
  actions,
  getters,
};