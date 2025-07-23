// task.ts
export interface Task {
  id: string;
  title: string;
  description: string;
  category: TaskCategory;
  priority: Priority;
  status: TaskStatus;
  dueDate?: Date;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  subtasks: SubTask[];
  tags: string[];
  timeframe: Timeframe;
}

export interface SubTask {
  id: string;
  title: string;
  completed: boolean;
  createdAt: Date;
}

export type TaskCategory = 
  | 'code-tasks' 
  | 'learning' 
  | 'relationship' 
  | 'self-development' 
  | 'project-improvement';

export type Priority = 'low' | 'medium' | 'high' | 'urgent';

export type TaskStatus = 'todo' | 'in-progress' | 'completed' | 'archived';

export type Timeframe = 'daily' | 'weekly' | 'monthly' | 'yearly';

export interface TaskStats {
  total: number;
  completed: number;
  inProgress: number;
  overdue: number;
  thisWeekTotal: number;
  thisWeekCompleted: number;
  byCategory: Record<TaskCategory, number>;
  byPriority: Record<Priority, number>;
}