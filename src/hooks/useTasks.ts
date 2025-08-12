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
  doc,
  enableNetwork,
  disableNetwork,
  Timestamp
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../contexts/AuthContext';
import { Task, TaskStats } from '../types/task';
import { useOfflineStatus } from '../hooks/useOfflineStatus';

// Helper function to safely convert Firestore data
const convertFirestoreData = (data: any) => {
  const convertTimestamp = (field: any) => {
    if (!field) return null;
    if (field instanceof Timestamp) return field.toDate();
    if (field instanceof Date) return field;
    if (typeof field === 'string') {
      const date = new Date(field);
      return isNaN(date.getTime()) ? null : date;
    }
    return null;
  };

  return {
    ...data,
    createdAt: convertTimestamp(data.createdAt),
    updatedAt: convertTimestamp(data.updatedAt),
    dueDate: convertTimestamp(data.dueDate),
    // Convert other date fields as needed
  };
};

export const useTasks = () => {
  const { user } = useAuth();
  const isOnline = useOfflineStatus();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [stats, setStats] = useState<TaskStats>({
    total: 0,
    completed: 0,
    inProgress: 0,
    overdue: 0,
    thisWeekTotal: 0,
    thisWeekCompleted: 0,
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

  // Calculate task statistics
  const calculateStats = (tasksData: Task[]) => {
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    const thisWeekTasks = tasksData.filter(task => 
      task.createdAt && task.createdAt >= oneWeekAgo
    );
    
    const newStats: TaskStats = {
      total: tasksData.length,
      completed: tasksData.filter(t => t.status === 'completed').length,
      inProgress: tasksData.filter(t => t.status === 'in-progress').length,
      overdue: tasksData.filter(t => 
        t.dueDate && t.dueDate < now && t.status !== 'completed'
      ).length,
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
    setStats(newStats);
  };

  // Main effect for loading tasks
  useEffect(() => {
    if (!user) {
      setTasks([]);
      setLoading(false);
      return;
    }

    let unsubscribe: () => void;
    let networkEnabled = true;

    const setupFirestoreListener = async () => {
      try {
        const tasksQuery = query(
          collection(db, 'tasks'),
          where('userId', '==', user.uid),
          orderBy('createdAt', 'desc')
        );

        if (isOnline) {
          if (!networkEnabled) {
            await enableNetwork(db);
            networkEnabled = true;
          }
        } else {
          await disableNetwork(db);
          networkEnabled = false;
        }

        unsubscribe = onSnapshot(
          tasksQuery,
          (snapshot) => {
            const tasksData = snapshot.docs.map(doc => ({
              id: doc.id,
              ...convertFirestoreData(doc.data())
            })) as Task[];

            setTasks(tasksData);
            calculateStats(tasksData);
            setLoading(false);
            setError(null);
          },
          (error) => {
            console.error('Firestore snapshot error:', error);
            setError(error);
            setLoading(false);
            
            if (error.code === 'failed-precondition') {
              console.error(
                'Index missing. Create it in Firebase Console:',
                error.message.match(/https:\/\/console\.firebase\.google\.com[^\s]+/)?.[0]
              );
            }
          }
        );

      } catch (error) {
        console.error('Firestore setup error:', error);
        setError(error as Error);
        setLoading(false);
      }
    };

    setupFirestoreListener();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [user, isOnline]);

  // Add a new task
  const addTask = async (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'userId'>) => {
    if (!user) throw new Error('User not authenticated');

    const newTask = {
      ...taskData,
      userId: user.uid,
      createdAt: Timestamp.fromDate(new Date()),
      updatedAt: Timestamp.fromDate(new Date()),
      // Convert undefined values to null for Firestore
      estimate: taskData.estimate ?? null,
      dueDate: taskData.dueDate ? Timestamp.fromDate(taskData.dueDate) : null,
    };

    try {
      await addDoc(collection(db, 'tasks'), newTask);
      setError(null);
    } catch (error) {
      console.error('Failed to add task:', error);
      setError(error as Error);
      throw error;
    }
  };

  // Update an existing task
  const updateTask = async (taskId: string, updates: Partial<Task>) => {
    // Filter out undefined values and convert dates
    const filteredUpdates = Object.entries(updates).reduce((acc, [key, value]) => {
      if (value === undefined) return acc;
      
      // Convert Date objects to Timestamps
      if (value instanceof Date) {
        return { ...acc, [key]: Timestamp.fromDate(value) };
      }
      
      // Convert null/undefined estimates to null
      if (key === 'estimate' && value === undefined) {
        return { ...acc, [key]: null };
      }
      
      return { ...acc, [key]: value };
    }, {});

    const updateData = {
      ...filteredUpdates,
      updatedAt: Timestamp.fromDate(new Date()),
    };

    try {
      await updateDoc(doc(db, 'tasks', taskId), updateData);
      setError(null);
    } catch (error) {
      console.error('Failed to update task:', error);
      setError(error as Error);
      throw error;
    }
  };

  // Delete a task
  const deleteTask = async (taskId: string) => {
    try {
      await deleteDoc(doc(db, 'tasks', taskId));
      setError(null);
    } catch (error) {
      console.error('Failed to delete task:', error);
      setError(error as Error);
      throw error;
    }
  };

  return {
    tasks,
    stats,
    loading,
    error,
    addTask,
    updateTask,
    deleteTask,
  };
};