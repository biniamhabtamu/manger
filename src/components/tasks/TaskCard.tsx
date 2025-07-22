import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Edit3, Trash2, Calendar, Flag, Tag, MoreVertical, CheckSquare } from 'lucide-react';
import { Task } from '../../types/task';
import { useTasks } from '../../hooks/useTasks';
import { TaskEditForm } from './TaskEditForm';
import toast from 'react-hot-toast';

interface TaskCardProps {
  task: Task;
  index: number;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, index }) => {
  const { updateTask, deleteTask } = useTasks();
  const [showMenu, setShowMenu] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleStatusToggle = async () => {
    setLoading(true);
    try {
      const newStatus = task.status === 'completed' ? 'todo' : 'completed';
      await updateTask(task.id, { status: newStatus });
      toast.success(`Task marked as ${newStatus === 'completed' ? 'completed' : 'todo'}`);
    } catch (error) {
      toast.error('Failed to update task status');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      setLoading(true);
      try {
        await deleteTask(task.id);
        toast.success('Task deleted successfully');
      } catch (error) {
        toast.error('Failed to delete task');
      } finally {
        setLoading(false);
      }
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      case 'high':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1 }}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow relative"
      >
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3 flex-1">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleStatusToggle}
              disabled={loading}
              className={`mt-1 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                task.status === 'completed'
                  ? 'bg-green-500 border-green-500 text-white'
                  : 'border-gray-300 dark:border-gray-600 hover:border-green-500'
              }`}
            >
              {task.status === 'completed' && <CheckSquare size={12} />}
            </motion.button>

            <div className="flex-1">
              <h3 className={`text-lg font-semibold mb-2 ${
                task.status === 'completed' 
                  ? 'text-gray-500 dark:text-gray-400 line-through' 
                  : 'text-gray-900 dark:text-white'
              }`}>
                {task.title}
              </h3>
              
              {task.description && (
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  {task.description}
                </p>
              )}

              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                  {task.status.replace('-', ' ')}
                </span>
                
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                  <Flag size={10} className="inline mr-1" />
                  {task.priority} priority
                </span>

                {task.dueDate && (
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                    <Calendar size={10} className="inline mr-1" />
                    {task.dueDate.toLocaleDateString()}
                  </span>
                )}
              </div>

              {task.tags && task.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {task.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                    >
                      <Tag size={8} className="mr-1" />
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="relative">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <MoreVertical size={16} />
            </motion.button>

            {showMenu && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute right-0 top-10 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10 min-w-[120px]"
              >
                <button
                  onClick={() => {
                    setShowEditForm(true);
                    setShowMenu(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                >
                  <Edit3 size={14} className="mr-2" />
                  Edit
                </button>
                <button
                  onClick={() => {
                    handleDelete();
                    setShowMenu(false);
                  }}
                  disabled={loading}
                  className="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center disabled:opacity-50"
                >
                  <Trash2 size={14} className="mr-2" />
                  Delete
                </button>
              </motion.div>
            )}
          </div>
        </div>

        {/* Click outside to close menu */}
        {showMenu && (
          <div
            className="fixed inset-0 z-5"
            onClick={() => setShowMenu(false)}
          />
        )}
      </motion.div>

      <TaskEditForm
        task={task}
        isOpen={showEditForm}
        onClose={() => setShowEditForm(false)}
      />
    </>
  );
};