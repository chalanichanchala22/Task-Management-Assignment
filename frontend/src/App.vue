<script setup>
import { onMounted, computed, ref } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useTasksStore } from '@/stores/tasks';
import Auth from '@/components/Auth.vue';
import TaskList from '@/components/TaskList.vue';
import TaskForm from '@/components/TaskForm.vue';

const authStore = useAuthStore();
const tasksStore = useTasksStore();

const isAuthenticated = computed(() => authStore.isAuthenticated);
const user = computed(() => authStore.user);

const errors = ref({
  name: null,
  email: null,
  password: null
});

onMounted(async () => {
  try {
    if (authStore.token) {
      await authStore.getCurrentUser();
      await tasksStore.fetchTasks();
    }
  } catch (error) {
    console.error('Failed to initialize app:', error);
    authStore.logout();
  }
});

const handleLogout = () => {
  authStore.logout();
};
</script>

<template>
  <div class="app-container">
    <template v-if="isAuthenticated">
      <header class="app-header">
        <div class="header-content">
          <h1>Task Management</h1>
          <div class="user-info">
            <span>Welcome, {{ user?.name }}</span>
            <button @click="handleLogout" class="logout-btn">Logout</button>
          </div>
        </div>
      </header>
      
      <main class="app-main">
        <div class="task-container">
          <TaskForm />
          <TaskList />
        </div>
      </main>
    </template>
    
    <Auth v-else />
  </div>
</template>

<style>
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  line-height: 1.6;
  color: #333;
  background-color: #f5f5f5;
}

.app-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.app-header {
  background-color: #4f46e5;
  color: white;
  padding: 1rem 2rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.logout-btn {
  background-color: rgba(255, 255, 255, 0.2);
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.logout-btn:hover {
  background-color: rgba(255, 255, 255, 0.3);
}

.app-main {
  flex: 1;
  padding: 2rem;
}

.task-container {
  max-width: 800px;
  margin: 0 auto;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 2rem;
}

/* Error input styles */
.error-input {
  border: 2px solid red;
}
</style>