<script setup>
import { ref, computed } from 'vue';
import { useTasksStore } from '@/stores/tasks';

const tasksStore = useTasksStore();

const filter = ref('all');

// Compute filtered tasks based on the selected filter
const filteredTasks = computed(() => {
  const tasks = tasksStore.tasks;
  
  switch (filter.value) {
    case 'completed':
      return tasks.filter(task => task.completed);
    case 'active':
      return tasks.filter(task => !task.completed);
    default:
      return tasks;
  }
});

const confirmDelete = (taskId) => {
  if (confirm('Are you sure you want to delete this task?')) {
    tasksStore.deleteTask(taskId);
  }
};

const toggleTaskStatus = (task) => {
  tasksStore.updateTask(task.id, {
    ...task,
    completed: !task.completed
  });
};

const getCategoryName = (categoryId) => {
  const category = tasksStore.categories.find(c => c.id === categoryId);
  return category ? category.name : 'Uncategorized';
};

const editTask = (task) => {
  // Emit an event to parent component to handle task editing
  emit('editTask', task);
};
</script>

<template>
  <div class="task-list">
    <div class="filters">
      <button 
        @click="filter = 'all'" 
        :class="{ active: filter === 'all' }"
      >
        All
      </button>
      <button 
        @click="filter = 'active'" 
        :class="{ active: filter === 'active' }"
      >
        Active
      </button>
      <button 
        @click="filter = 'completed'" 
        :class="{ active: filter === 'completed' }"
      >
        Completed
      </button>
    </div>

    <div v-if="tasksStore.loading" class="loading">
      Loading tasks...
    </div>
    
    <div v-else-if="filteredTasks.length === 0" class="empty-state">
      <p>No tasks found</p>
    </div>
    
    <ul v-else class="tasks">
      <li 
        v-for="task in filteredTasks" 
        :key="task.id" 
        class="task-item"
        :class="{ 'completed': task.completed }"
      >
        <div class="task-header">
          <div class="task-title">
            <input 
              type="checkbox" 
              :checked="task.completed" 
              @change="toggleTaskStatus(task)" 
            />
            <h3>{{ task.title }}</h3>
          </div>
          <div class="task-actions">
            <button @click="editTask(task)" class="edit-btn">Edit</button>
            <button @click="confirmDelete(task.id)" class="delete-btn">Delete</button>
          </div>
        </div>
        
        <div v-if="task.description" class="task-description">
          {{ task.description }}
        </div>
        
        <div class="task-meta">
          <span class="task-category">
            {{ getCategoryName(task.category_id) }}
          </span>
          <span class="task-date">
            {{ new Date(task.created_at).toLocaleDateString() }}
          </span>
        </div>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.task-list {
  margin-top: 20px;
}

.filters {
  display: flex;
  margin-bottom: 15px;
  gap: 10px;
}

.filters button {
  padding: 6px 12px;
  background-color: #f5f5f5;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
}

.filters button.active {
  background-color: #4CAF50;
  color: white;
  border-color: #4CAF50;
}

.loading, .empty-state {
  text-align: center;
  padding: 20px;
  color: #666;
}

.tasks {
  list-style-type: none;
  padding: 0;
}

.task-item {
  padding: 15px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  margin-bottom: 10px;
  background-color: white;
}

.task-item.completed {
  border-left: 4px solid #4CAF50;
  opacity: 0.8;
}

.task-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.task-title {
  display: flex;
  align-items: center;
  gap: 10px;
}

.task-title h3 {
  margin: 0;
  font-size: 16px;
}

.task-item.completed .task-title h3 {
  text-decoration: line-through;
  color: #777;
}

.task-actions {
  display: flex;
  gap: 5px;
}

.edit-btn, .delete-btn {
  padding: 5px 10px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
}

.edit-btn {
  background-color: #2196F3;
  color: white;
}

.delete-btn {
  background-color: #f44336;
  color: white;
}

.task-description {
  margin-top: 10px;
  color: #666;
  font-size: 14px;
}

.task-meta {
  display: flex;
  justify-content: space-between;
  margin-top: 10px;
  font-size: 12px;
}

.task-category {
  background-color: #e0e0e0;
  padding: 3px 8px;
  border-radius: 10px;
}

.task-date {
  color: #777;
}
</style>