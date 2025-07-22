import { useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc 
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../contexts/AuthContext';
import { Task, TaskStats } from '../types/task';
import { offlineStorage } from '../utils/offlineStorage';
import { useOfflineStatus } from '../hooks/useOfflineStatus';

export const useTasks = () => {
  const { user } = useAuth();
  const isOnline = useOfflineStatus();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<TaskStats>({
    total: 0,
    completed: 0,
    inProgress: 0,
    overdue: 0,
    byCategory: {
      'code-tasks': 0,
      'learning': 0,
      'relationship': 0,
      'self-development': 0,
      'project-improvement': 0,
    },
    byPriority: {
      'low': 0,
      'medium': 0,
      'high': 0,
      'urgent': 0,
    },
  });

  useEffect(() => {
    if (!user) {
      setTasks([]);
      offlineStorage.setTasks([]);
      setLoading(false);
      return;
    }

    if (isOnline) {
      const tasksQuery = query(
        collection(db, 'tasks'),
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc')
      );

      const unsubscribe = onSnapshot(tasksQuery, (snapshot) => {
        const tasksData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate(),
          updatedAt: doc.data().updatedAt?.toDate(),
          dueDate: doc.data().dueDate?.toDate(),
        })) as Task[];

        setTasks(tasksData);
        offlineStorage.setTasks(tasksData);
        calculateStats(tasksData);
        setLoading(false);
      }, (error) => {
        console.warn('Failed to fetch tasks online, using offline data:', error);
        const offlineTasks = offlineStorage.getTasks();
        setTasks(offlineTasks);
        calculateStats(offlineTasks);
        setLoading(false);
      });

      return unsubscribe;
    } else {
      // Load offline tasks
      const offlineTasks = offlineStorage.getTasks();
      setTasks(offlineTasks);
      calculateStats(offlineTasks);
      setLoading(false);
    }
  }, [user, isOnline]);

  const calculateStats = (tasksData: Task[]) => {
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    // Filter tasks from this week
    const thisWeekTasks = tasksData.filter(task => 
      task.createdAt && task.createdAt >= oneWeekAgo
    );
    
    const stats: TaskStats = {
      total: tasksData.length,
      completed: tasksData.filter(t => t.status === 'completed').length,
      inProgress: tasksData.filter(t => t.status === 'in-progress').length,
      overdue: tasksData.filter(t => t.dueDate && t.dueDate < now && t.status !== 'completed').length,
      thisWeekTotal: thisWeekTasks.length,
      thisWeekCompleted: thisWeekTasks.filter(t => t.status === 'completed').length,
      byCategory: {
        'code-tasks': tasksData.filter(t => t.category === 'code-tasks').length,
        'learning': tasksData.filter(t => t.category === 'learning').length,
        'relationship': tasksData.filter(t => t.category === 'relationship').length,
        'self-development': tasksData.filter(t => t.category === 'self-development').length,
        'project-improvement': tasksData.filter(t => t.category === 'project-improvement').length,
      },
      byPriority: {
        'low': tasksData.filter(t => t.priority === 'low').length,
        'medium': tasksData.filter(t => t.priority === 'medium').length,
        'high': tasksData.filter(t => t.priority === 'high').length,
        'urgent': tasksData.filter(t => t.priority === 'urgent').length,
      },
    };
    setStats(stats);
  };

  const addTask = async (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'userId'>) => {
    if (!user) return;

    const newTask = {
      ...taskData,
      userId: user.uid,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    if (isOnline) {
      try {
        await addDoc(collection(db, 'tasks'), newTask);
      } catch (error) {
        console.warn('Failed to add task online, storing offline:', error);
        // Add to offline storage with temporary ID
        const tempId = `temp_${Date.now()}`;
        const offlineTasks = offlineStorage.getTasks();
        offlineTasks.unshift({ ...newTask, id: tempId } as Task);
        offlineStorage.setTasks(offlineTasks);
        setTasks(offlineTasks);
        calculateStats(offlineTasks);
      }
    } else {
      // Add to offline storage only
      const tempId = `temp_${Date.now()}`;
      const offlineTasks = offlineStorage.getTasks();
      offlineTasks.unshift({ ...newTask, id: tempId } as Task);
      offlineStorage.setTasks(offlineTasks);
      setTasks(offlineTasks);
      calculateStats(offlineTasks);
    }
  };

  const updateTask = async (taskId: string, updates: Partial<Task>) => {
    const updateData = {
      ...updates,
      updatedAt: new Date(),
    };

    if (isOnline && !taskId.startsWith('temp_')) {
      try {
        await updateDoc(doc(db, 'tasks', taskId), updateData);
      } catch (error) {
        console.warn('Failed to update task online:', error);
      }
    }

    // Update offline storage
    const offlineTasks = offlineStorage.getTasks();
    const taskIndex = offlineTasks.findIndex((t: Task) => t.id === taskId);
    if (taskIndex !== -1) {
      offlineTasks[taskIndex] = { ...offlineTasks[taskIndex], ...updateData };
      offlineStorage.setTasks(offlineTasks);
      setTasks(offlineTasks);
      calculateStats(offlineTasks);
    }
  };

  const deleteTask = async (taskId: string) => {
    if (isOnline && !taskId.startsWith('temp_')) {
      try {
        await deleteDoc(doc(db, 'tasks', taskId));
      } catch (error) {
        console.warn('Failed to delete task online:', error);
      }
    }

    // Remove from offline storage
    const offlineTasks = offlineStorage.getTasks();
    const filteredTasks = offlineTasks.filter((t: Task) => t.id !== taskId);
    offlineStorage.setTasks(filteredTasks);
    setTasks(filteredTasks);
    calculateStats(filteredTasks);
  };

  return {
    tasks,
    stats,
    loading,
    addTask,
    updateTask,
    deleteTask,
  };
};