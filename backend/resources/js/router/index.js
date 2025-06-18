import { createRouter, createWebHistory } from 'vue-router';
import Login from '../components/Auth/Login.vue';
import Register from '../components/Auth/Register.vue';
import TaskList from '../components/Task/TaskList.vue';
// Import other components as needed

const routes = [
    {
        path: '/',
        redirect: '/tasks'
    },
    {
        path: '/login',
        component: Login,
        name: 'login'
    },
    {
        path: '/register',
        component: Register,
        name: 'register'
    },
    {
        path: '/tasks',
        component: TaskList,
        name: 'tasks',
        meta: { requiresAuth: true }
    }
    // Other routes
];

const router = createRouter({
    history: createWebHistory(),
    routes
});

// Navigation guard for protected routes
router.beforeEach((to, from, next) => {
    const isAuthenticated = localStorage.getItem('token') !== null;
    
    if (to.meta.requiresAuth && !isAuthenticated) {
        next('/login');
    } else {
        next();
    }
});

export default router;