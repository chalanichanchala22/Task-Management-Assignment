<script setup>
import { ref, reactive } from 'vue';
import { useTasksStore } from '@/stores/tasks';

const props = defineProps({
  editTask: {
    type: Object,
    default: null
  }
});

const emit = defineEmits(['taskSaved', 'cancel']);
const tasksStore = useTasksStore();

// Initialize form with editTask data if provided, otherwise use empty values
const form = reactive({
  title: props.editTask ? props.editTask.title : '',
  description: props.editTask ? props.editTask.description : '',
  category_id: props.editTask ? props.editTask.category_id : '',
  completed: props.editTask ? props.editTask.completed : false
});

const errors = reactive({
  title: '',
  category_id: ''
});

const isSubmitting = ref(false);
const submitError = ref('');

// Validate the form
const validateForm = () => {
  let isValid = true;
  errors.title = '';
  errors.category_id = '';
  
  if (!form.title.trim()) {
    errors.title = 'Title is required';
    isValid = false;
  }
  
  if (!form.category_id) {
    errors.category_id = 'Category is required';
    isValid = false;
  }
  
  return isValid;
};

// Handle form submission
const handleSubmit = async () => {
  if (!validateForm()) {
    return;
  }
  
  isSubmitting.value = true;
  submitError.value = '';
  
  try {
    let result;
    
    if (props.editTask) {
      // Update existing task
      result = await tasksStore.updateTask(props.editTask.id, {
        title: form.title.trim(),
        description: form.description.trim() || null,
        category_id: form.category_id,
        completed: form.completed
      });
    } else {
      // Create new task
      result = await tasksStore.createTask({
        title: form.title.trim(),
        description: form.description.trim() || null,
        category_id: form.category_id,
        completed: form.completed
      });
    }
    
    emit('taskSaved', result);
    resetForm();
  } catch (error) {
    submitError.value = error.message || 'Failed to save task';
  } finally {
    isSubmitting.value = false;
  }
};

// Reset form to initial state
const resetForm = () => {
  form.title = '';
  form.description = '';
  form.category_id = '';
  form.completed = false;
  errors.title = '';
  errors.category_id = '';
  submitError.value = '';
};

// Cancel form submission
const cancel = () => {
  resetForm();
  emit('cancel');
};
</script>

<template>
  <div class="task-form">
    <h2>{{ editTask ? 'Edit Task' : 'Create New Task' }}</h2>
    
    <form @submit.prevent="handleSubmit">
      <div class="form-group">
        <label for="title">Title</label>
        <input 
          type="text" 
          id="title" 
          v-model="form.title" 
          :class="{ error: errors.title }" 
          autocomplete="off"
          placeholder="Enter task title"
        >
        <div v-if="errors.title" class="error-text">{{ errors.title }}</div>
      </div>
      
      <div class="form-group">
        <label for="description">Description (optional)</label>
        <textarea 
          id="description" 
          v-model="form.description" 
          placeholder="Enter task description"
          autocomplete="off"
          rows="3"
        ></textarea>
      </div>
      
      <div class="form-group">
        <label for="category">Category</label>
        <select 
          id="category" 
          v-model="form.category_id"
          :class="{ error: errors.category_id }"
          autocomplete="off"
        >
          <option value="">Select a category</option>
          <option 
            v-for="category in tasksStore.categories" 
            :key="category.id" 
            :value="category.id"
          >
            {{ category.name }}
          </option>
        </select>
        <div v-if="errors.category_id" class="error-text">{{ errors.category_id }}</div>
      </div>
      
      <div class="form-group checkbox">
        <input 
          type="checkbox" 
          id="completed" 
          v-model="form.completed"
          autocomplete="off"
        >
        <label for="completed">Mark as completed</label>
      </div>
      
      <div v-if="submitError" class="submit-error">
        {{ submitError }}
      </div>
      
      <div class="form-actions">
        <button 
          type="submit" 
          class="btn primary" 
          :disabled="isSubmitting"
        >
          <span v-if="isSubmitting">Saving...</span>
          <span v-else>{{ editTask ? 'Update Task' : 'Create Task' }}</span>
        </button>
        
        <button 
          type="button" 
          class="btn secondary" 
          @click="cancel"
          :disabled="isSubmitting"
        >
          Cancel
        </button>
      </div>
    </form>
  </div>
</template>

<style scoped>
.task-form {
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

h2 {
  margin-top: 0;
  margin-bottom: 20px;
  font-size: 1.5rem;
  color: #333;
}

.form-group {
  margin-bottom: 16px;
}

label {
  display: block;
  margin-bottom: 6px;
  font-weight: 500;
  color: #555;
}

input[type="text"],
textarea,
select {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

input[type="text"]:focus,
textarea:focus,
select:focus {
  border-color: #4CAF50;
  outline: none;
  box-shadow: 0 0 0 2px rgba(76, 175, 80, 0.2);
}

input.error,
select.error {
  border-color: #f44336;
}

.error-text {
  color: #f44336;
  font-size: 12px;
  margin-top: 4px;
}

.checkbox {
  display: flex;
  align-items: center;
}

.checkbox input {
  margin-right: 8px;
}

.checkbox label {
  margin-bottom: 0;
}

.form-actions {
  display: flex;
  gap: 10px;
  margin-top: 20px;
}

.btn {
  padding: 10px 16px;
  border: none;
  border-radius: 4px;
  font-weight: 500;
  cursor: pointer;
}

.btn.primary {
  background-color: #4CAF50;
  color: white;
}

.btn.secondary {
  background-color: #f5f5f5;
  color: #333;
  border: 1px solid #ddd;
}

.submit-error {
  background-color: #ffebee;
  color: #f44336;
  padding: 10px;
  border-radius: 4px;
  margin-bottom: 16px;
}

button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>