import './bootstrap';
import { createApp } from 'vue';


// Set axios defaults for CSRF
axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

// Set auth token if exists
const token = localStorage.getItem('token');
if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    console.log('Token set from localStorage:', token); // Debug line
}

// Import your root component and mount the app
import App from './App.vue';
import router from './router';

const app = createApp(App);
app.use(router);
app.mount('#app');
