import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Edit3,
  Trash2,
  Calendar,
  Flag,
  Tag,
  MoreVertical,
  CheckSquare,
  Star,
  Clock,
  Repeat,
  BellRing,
  Copy
} from 'lucide-react';
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

  // Helpers
  const formatDate = (d?: string | Date) => {
    if (!d) return '';
    const date = d instanceof Date ? d : new Date(d);
    return date.toLocaleDateString();
  };

  const getDaysLeft = (d?: string | Date) => {
    if (!d) return null;
    const today = new Date();
    const due = d instanceof Date ? d : new Date(d);
    // Normalize
    const msPerDay = 1000 * 60 * 60 * 24;
    const diff = Math.ceil((due.setHours(0,0,0,0) - today.setHours(0,0,0,0)) / msPerDay);
    return diff; // can be negative
  };

  const getUrgencyClass = (days: number | null) => {
    if (days === null) return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    if (days < 0) return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
    if (days <= 2) return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400';
    if (days <= 7) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
    return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
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

  const daysLeft = useMemo(() => getDaysLeft(task.dueDate), [task.dueDate]);

  const subtaskProgress = useMemo(() => {
    if (!task.subtasks || !Array.isArray(task.subtasks) || task.subtasks.length === 0) return null;
    const total = task.subtasks.length;
    const done = task.subtasks.filter((s: any) => s.done).length;
    return Math.round((done / total) * 100);
  }, [task.subtasks]);

  // Actions
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

  const toggleFavorite = async () => {
    setLoading(true);
    try {
      await updateTask(task.id, { favorite: !task.favorite });
      toast.success(task.favorite ? 'Removed from favorites' : 'Marked as favorite');
    } catch (error) {
      toast.error('Failed to update favorite');
    } finally {
      setLoading(false);
    }
  };

  const snoozeOneDay = async () => {
    if (!task.dueDate) return toast('No due date to snooze');
    setLoading(true);
    try {
      const d = new Date(task.dueDate);
      d.setDate(d.getDate() + 1);
      await updateTask(task.id, { dueDate: d.toISOString() });
      toast.success('Snoozed by 1 day');
    } catch (error) {
      toast.error('Failed to snooze');
    } finally {
      setLoading(false);
    }
  };

  const copyTaskToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(task, null, 2));
      toast.success('Task copied to clipboard (JSON)');
    } catch (err) {
      toast.error('Failed to copy');
    }
  };

  return (
    <>
      <motion.article
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 }}
        className={`group bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-800/80 rounded-2xl shadow-md border border-gray-200 dark:border-gray-700 p-5 transition-shadow hover:shadow-lg relative overflow-hidden`}
        aria-labelledby={`task-${task.id}-title`}
        role="article"
      >
        <div className="absolute -top-6 -right-6 opacity-10 transform rotate-45 text-6xl pointer-events-none select-none">⭐</div>

        <div className="flex items-start gap-4">
          {/* status toggle */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleStatusToggle}
            disabled={loading}
            aria-pressed={task.status === 'completed'}
            title={task.status === 'completed' ? 'Mark as Todo' : 'Mark as Completed'}
            className={`flex-shrink-0 mt-1 w-8 h-8 rounded-lg border-2 flex items-center justify-center transition-colors ${
              task.status === 'completed'
                ? 'bg-green-500 border-green-500 text-white'
                : 'border-gray-300 dark:border-gray-600 hover:border-green-500'
            }`}
          >
            {task.status === 'completed' ? <CheckSquare size={18} /> : <CheckSquare size={18} className="opacity-30" />}
          </motion.button>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 id={`task-${task.id}-title`} className={`text-lg font-semibold leading-tight truncate ${task.status === 'completed' ? 'text-gray-500 dark:text-gray-400 line-through' : 'text-gray-900 dark:text-white'}`}>
                  {task.title}
                </h3>

                <p className="text-sm mt-1 text-gray-600 dark:text-gray-300 break-words max-w-full">
                  {task.description || <span className="text-xs text-gray-400 italic">No description</span>}
                </p>

                {/* badges */}
                <div className="flex flex-wrap items-center gap-2 mt-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>{task.status.replace('-', ' ')}</span>

                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                    <Flag size={12} className="inline mr-1" />
                    {task.priority} priority
                  </span>

                  {task.dueDate && (
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getUrgencyClass(daysLeft)}`}>
                      <Calendar size={12} className="inline mr-1" />
                      {formatDate(task.dueDate)} {daysLeft !== null ? (daysLeft < 0 ? `· overdue ${Math.abs(daysLeft)}d` : `· ${daysLeft}d left`) : ''}
                    </span>
                  )}

                  {task.tags?.length > 0 && <span className="px-2 py-0.5 rounded text-xs bg-gray-100 dark:bg-gray-700 dark:text-gray-300">{task.tags.slice(0,3).join(', ')}</span>}
                </div>

                {/* subtasks progress */}
                {subtaskProgress !== null && (
                  <div className="mt-3">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-gray-600 dark:text-gray-300">Subtasks</span>
                      <span className="text-gray-500 dark:text-gray-400">{subtaskProgress}%</span>
                    </div>
                    <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div className="h-2 rounded-full transition-all" style={{ width: `${subtaskProgress}%` }} />
                    </div>
                  </div>
                )}
              </div>

              {/* right controls */}
              <div className="flex flex-col items-end gap-2">
                <div className="flex items-center gap-2">
                  <button
                    onClick={toggleFavorite}
                    disabled={loading}
                    title={task.favorite ? 'Unfavorite' : 'Mark favorite'}
                    className={`p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${task.favorite ? 'text-yellow-500' : 'text-gray-400'}`}
                    aria-label="toggle favorite"
                  >
                    <Star size={16} />
                  </button>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    onClick={() => setShowMenu((s) => !s)}
                    className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-500"
                    aria-haspopup="true"
                    aria-expanded={showMenu}
                  >
                    <MoreVertical size={16} />
                  </motion.button>
                </div>

                {task.assignee && (
                  <div className="text-xs text-gray-500 dark:text-gray-400">Assigned to <span className="font-medium text-gray-700 dark:text-gray-200">{task.assignee.name}</span></div>
                )}

                {task.estimate && <div className="text-xs text-gray-500 dark:text-gray-400">Est: {task.estimate}h</div>}
              </div>
            </div>
          </div>
        </div>

        {/* menu */}
        {showMenu && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="absolute right-4 top-12 z-20 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg w-44 overflow-hidden"
          >
            <button
              onClick={() => { setShowEditForm(true); setShowMenu(false); }}
              className="w-full px-3 py-2 text-left text-sm flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <Edit3 size={14} /> Edit
            </button>

            <button
              onClick={() => { copyTaskToClipboard(); setShowMenu(false); }}
              className="w-full px-3 py-2 text-left text-sm flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <Copy size={14} /> Copy JSON
            </button>

            <button
              onClick={() => { snoozeOneDay(); setShowMenu(false); }}
              className="w-full px-3 py-2 text-left text-sm flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <Clock size={14} /> Snooze +1 day
            </button>

            <button
              onClick={() => { setShowMenu(false); navigator.vibrate?.(50); setTimeout(() => { if (task.dueDate) { toast(`Reminder set for ${formatDate(task.dueDate)}`); } }, 150); }}
              className="w-full px-3 py-2 text-left text-sm flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <BellRing size={14} /> Quick reminder (local)
            </button>

            <button
              onClick={() => { handleDelete(); setShowMenu(false); }}
              disabled={loading}
              className="w-full px-3 py-2 text-left text-sm flex items-center gap-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50"
            >
              <Trash2 size={14} /> Delete
            </button>
          </motion.div>
        )}

        {/* click outside to close menu */}
        {showMenu && (
          <button
            aria-hidden
            onClick={() => setShowMenu(false)}
            className="fixed inset-0 z-10 bg-transparent"
          />
        )}

      </motion.article>

      <TaskEditForm
        task={task}
        isOpen={showEditForm}
        onClose={() => setShowEditForm(false)}
      />
    </>
  );
};
