import { createRouter, createWebHistory } from 'vue-router'

// Import your components
import Login from '../components/Auth/Login.vue'
import Register from '../components/Auth/Register.vue'
import Dashboard from '../components/Dashboard.vue'
import TaskList from '../components/Task/TaskList.vue'
import TaskCreate from '../components/Task/TaskCreate.vue'
import TaskEdit from '../components/Task/TaskEdit.vue'
import TaskDetail from '../components/Task/TaskDetail.vue'
import CategoryList from '../components/Category/CategoryList.vue'
import CategoryCreate from '../components/Category/CategoryCreate.vue'
import CategoryEdit from '../components/Category/CategoryEdit.vue'
import NotFound from '../components/NotFound.vue'

const routes = [
  {
    path: '/',
    redirect: '/dashboard'
  },
  {
    path: '/login',
    name: 'login',
    component: Login,
    meta: { requiresGuest: true }
  },
  {
    path: '/register',
    name: 'register',
    component: Register,
    meta: { requiresGuest: true }
  },
  {
    path: '/dashboard',
    name: 'dashboard',
    component: Dashboard,
    meta: { requiresAuth: true }
  },
  {
    path: '/tasks',
    name: 'tasks',
    component: TaskList,
    meta: { requiresAuth: true }
  },
  {
    path: '/tasks/create',
    name: 'task-create',
    component: TaskCreate,
    meta: { requiresAuth: true }
  },
  {
    path: '/tasks/:id',
    name: 'task-detail',
    component: TaskDetail,
    meta: { requiresAuth: true }
  },
  {
    path: '/tasks/:id/edit',
    name: 'task-edit',
    component: TaskEdit,
    meta: { requiresAuth: true }
  },
  {
    path: '/categories',
    name: 'categories',
    component: CategoryList,
    meta: { requiresAuth: true }
  },
  {
    path: '/categories/create',
    name: 'category-create',
    component: CategoryCreate,
    meta: { requiresAuth: true }
  },
  {
    path: '/categories/:id/edit',
    name: 'category-edit',
    component: CategoryEdit,
    meta: { requiresAuth: true }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: NotFound
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router