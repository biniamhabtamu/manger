// Local storage utilities for offline functionality
export const offlineStorage = {
  // Store user profile locally
  setUserProfile: (profile: any) => {
    try {
      localStorage.setItem('userProfile', JSON.stringify(profile));
    } catch (error) {
      console.warn('Failed to store user profile locally:', error);
    }
  },

  // Get user profile from local storage
  getUserProfile: () => {
    try {
      const profile = localStorage.getItem('userProfile');
      return profile ? JSON.parse(profile) : null;
    } catch (error) {
      console.warn('Failed to get user profile from local storage:', error);
      return null;
    }
  },

  // Store tasks locally
  setTasks: (tasks: any[]) => {
    try {
      localStorage.setItem('tasks', JSON.stringify(tasks));
    } catch (error) {
      console.warn('Failed to store tasks locally:', error);
    }
  },

  // Get tasks from local storage
  getTasks: () => {
    try {
      const tasks = localStorage.getItem('tasks');
      if (!tasks) return [];
      
      const parsedTasks = JSON.parse(tasks);
      
      // Convert string dates back to Date objects
      return parsedTasks.map((task: any) => ({
        ...task,
        dueDate: task.dueDate ? new Date(task.dueDate) : null,
        createdAt: task.createdAt ? new Date(task.createdAt) : new Date(),
        updatedAt: task.updatedAt ? new Date(task.updatedAt) : new Date()
      }));
    } catch (error) {
      console.warn('Failed to get tasks from local storage:', error);
      return [];
    }
  },

  // Store theme preference
  setTheme: (theme: string) => {
    try {
      localStorage.setItem('theme', theme);
    } catch (error) {
      console.warn('Failed to store theme locally:', error);
    }
  },

  // Get theme preference
  getTheme: () => {
    try {
      return localStorage.getItem('theme') || 'light';
    } catch (error) {
      console.warn('Failed to get theme from local storage:', error);
      return 'light';
    }
  },

  // Clear all offline data
  clear: () => {
    try {
      localStorage.removeItem('userProfile');
      localStorage.removeItem('tasks');
      localStorage.removeItem('theme');
    } catch (error) {
      console.warn('Failed to clear offline storage:', error);
    }
  }
};