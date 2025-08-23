import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Edit3,
  Trash2,
  Calendar,
  Flag,
  MoreVertical,
  CheckSquare,
  Star,
  Clock,
  BellRing,
  Copy,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Target,
  User,
  Tag,
  Zap,
  CheckCircle,
  Circle,
  X,
  AlertTriangle
} from 'lucide-react';
import { Task } from '../../types/task';
import { useTasks } from '../../hooks/useTasks';
import { TaskEditForm } from './TaskEditForm';
import toast from 'react-hot-toast';

interface TaskCardProps {
  task: Task;
  index: number;
  compact?: boolean;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, index, compact = false }) => {
  const { updateTask, deleteTask } = useTasks();
  const [showMenu, setShowMenu] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);

  // Helpers
  const formatDate = (d?: string | Date) => {
    if (!d) return '';
    const date = d instanceof Date ? d : new Date(d);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: task.dueDate && new Date(task.dueDate).getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
    });
  };

  const getDaysLeft = (d?: string | Date) => {
    if (!d) return null;
    const today = new Date();
    const due = d instanceof Date ? d : new Date(d);
    const msPerDay = 1000 * 60 * 60 * 24;
    const diff = Math.ceil(
      (due.setHours(0, 0, 0, 0) - today.setHours(0, 0, 0, 0)) / msPerDay
    );
    return diff;
  };

  const getUrgencyClass = (days: number | null) => {
    if (days === null)
      return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    if (days < 0)
      return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
    if (days <= 2)
      return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400';
    if (days <= 7)
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
    return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return <Zap size={12} className="text-red-500" />;
      case 'high':
        return <Flag size={12} className="text-orange-500" />;
      case 'medium':
        return <Target size={12} className="text-yellow-500" />;
      default:
        return <Circle size={12} className="text-gray-500" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle size={14} className="text-green-500" />;
      case 'in-progress':
        return <Clock size={14} className="text-blue-500" />;
      default:
        return <Circle size={14} className="text-gray-400" />;
    }
  };

  const daysLeft = useMemo(() => getDaysLeft(task.dueDate), [task.dueDate]);

  const subtaskProgress = useMemo(() => {
    if (!task.subtasks || !Array.isArray(task.subtasks) || task.subtasks.length === 0)
      return null;
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
      toast.success(
        `Task marked as ${newStatus === 'completed' ? 'completed' : 'todo'}`
      );
    } catch {
      toast.error('Failed to update task status');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      await deleteTask(task.id);
      toast.success('Task deleted successfully');
      setShowDeleteConfirm(false);
    } catch {
      toast.error('Failed to delete task');
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = async () => {
    setLoading(true);
    try {
      await updateTask(task.id, { favorite: !task.favorite });
      toast.success(
        task.favorite ? 'Removed from favorites' : 'Marked as favorite'
      );
    } catch {
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
    } catch {
      toast.error('Failed to snooze');
    } finally {
      setLoading(false);
    }
  };

  const copyTaskToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(task, null, 2));
      toast.success('Task copied to clipboard (JSON)');
    } catch {
      toast.error('Failed to copy');
    }
  };

  const toggleExpand = () => {
    setExpanded(!expanded);
  };

  return (
    <>
      <motion.article
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 }}
        className={`group bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-4 transition-all hover:shadow-md relative overflow-hidden w-full ${
          task.status === 'completed' ? 'opacity-80' : ''
        }`}
        aria-labelledby={`task-${task.id}-title`}
        role="article"
      >
        {/* Favorite indicator */}
        {task.favorite && (
          <div className="absolute top-2 right-2 text-yellow-400">
            <Star size={14} fill="currentColor" />
          </div>
        )}

        <div className="flex items-start gap-3 w-full">
          {/* status toggle */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleStatusToggle}
            disabled={loading}
            aria-pressed={task.status === 'completed'}
            title={task.status === 'completed' ? 'Mark as Todo' : 'Mark as Completed'}
            className={`flex-shrink-0 mt-0.5 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
              task.status === 'completed'
                ? 'bg-green-500 border-green-500 text-white'
                : 'border-gray-300 dark:border-gray-600 hover:border-green-500'
            }`}
          >
            {task.status === 'completed' && <CheckSquare size={12} />}
          </motion.button>

          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-start gap-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3
                    id={`task-${task.id}-title`}
                    className={`text-base font-semibold leading-tight break-words ${
                      task.status === 'completed'
                        ? 'text-gray-500 dark:text-gray-400 line-through'
                        : 'text-gray-900 dark:text-white'
                    }`}
                  >
                    {task.title}
                  </h3>
                </div>

                {/* badges */}
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                    {getStatusIcon(task.status)}
                    <span className="capitalize">{task.status.replace('-', ' ')}</span>
                  </span>

                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                    {getPriorityIcon(task.priority)}
                    <span className="capitalize">{task.priority}</span>
                  </span>

                  {task.dueDate && (
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${getUrgencyClass(
                        daysLeft
                      )}`}
                    >
                      <Calendar size={12} />
                      {formatDate(task.dueDate)}
                      {daysLeft !== null && daysLeft < 0 && (
                        <span> • {Math.abs(daysLeft)}d ago</span>
                      )}
                      {daysLeft !== null && daysLeft >= 0 && (
                        <span> • {daysLeft}d left</span>
                      )}
                    </span>
                  )}
                </div>

                {/* Description with expand/collapse */}
                {task.description && (
                  <div className="mb-2">
                    <button 
                      onClick={toggleExpand}
                      className="flex items-center text-sm text-gray-600 dark:text-gray-400"
                    >
                      {expanded ? (
                        <>
                          <ChevronUp size={14} className="mr-1" />
                          Hide details
                        </>
                      ) : (
                        <>
                          <ChevronDown size={14} className="mr-1" />
                          Show details
                        </>
                      )}
                    </button>
                    
                    <AnimatePresence>
                      {expanded && (
                        <motion.p 
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="text-sm mt-1 text-gray-600 dark:text-gray-300 break-words whitespace-pre-line"
                        >
                          {task.description}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>
                )}

                {/* tags */}
                {task.tags?.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-2">
                    {task.tags.slice(0, 3).map((tag, i) => (
                      <span key={i} className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400">
                        <Tag size={10} />
                        {tag}
                      </span>
                    ))}
                    {task.tags.length > 3 && (
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        +{task.tags.length - 3} more
                      </span>
                    )}
                  </div>
                )}

                {/* subtasks progress */}
                {subtaskProgress !== null && (
                  <div className="mt-2">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-gray-600 dark:text-gray-300">
                        Subtasks progress
                      </span>
                      <span className="text-gray-500 dark:text-gray-400">
                        {subtaskProgress}%
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${subtaskProgress}%` }}
                        className="h-1.5 rounded-full bg-gradient-to-r from-blue-500 to-purple-500"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* right controls */}
              <div className="flex flex-col items-end gap-1">
                <button
                  onClick={toggleFavorite}
                  disabled={loading}
                  title={task.favorite ? 'Unfavorite' : 'Mark favorite'}
                  className={`p-1.5 rounded-md transition-colors ${
                    task.favorite 
                      ? 'text-yellow-500 bg-yellow-100 dark:bg-yellow-900/30' 
                      : 'text-gray-400 hover:text-yellow-500 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                  aria-label="toggle favorite"
                >
                  <Star size={16} fill={task.favorite ? "currentColor" : "none"} />
                </button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  onClick={() => setShowMenu((s) => !s)}
                  className="p-1.5 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  aria-haspopup="true"
                  aria-expanded={showMenu}
                >
                  <MoreVertical size={16} />
                </motion.button>
              </div>
            </div>

            {/* Additional info row */}
            <div className="flex items-center justify-between mt-2 text-xs text-gray-500 dark:text-gray-400">
              <div className="flex items-center gap-2">
                {task.assignee && (
                  <span className="inline-flex items-center gap-1">
                    <User size={12} />
                    {task.assignee.name}
                  </span>
                )}
                
                {task.estimate && (
                  <span className="inline-flex items-center gap-1">
                    <Clock size={12} />
                    {task.estimate}h
                  </span>
                )}
                
                {task.category && (
                  <span className="inline-flex items-center gap-1 capitalize">
                    <Sparkles size={12} />
                    {task.category.replace('-', ' ')}
                  </span>
                )}
              </div>
              
              <div className="text-xs">
                {new Date(task.createdAt).toLocaleDateString()}
              </div>
            </div>
          </div>
        </div>

        {/* menu */}
        <AnimatePresence>
          {showMenu && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -6 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -6 }}
              className="absolute right-3 top-12 z-20 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg w-44 overflow-hidden"
            >
              <button
                onClick={() => {
                  setShowEditForm(true);
                  setShowMenu(false);
                }}
                className="w-full px-4 py-3 text-left text-sm flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <Edit3 size={16} /> Edit Task
              </button>

              <button
                onClick={() => {
                  copyTaskToClipboard();
                  setShowMenu(false);
                }}
                className="w-full px-4 py-3 text-left text-sm flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <Copy size={16} /> Copy JSON
              </button>

              <button
                onClick={() => {
                  snoozeOneDay();
                  setShowMenu(false);
                }}
                className="w-full px-4 py-3 text-left text-sm flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <Clock size={16} /> Snooze 1 Day
              </button>

              <button
                onClick={() => {
                  setShowMenu(false);
                  navigator.vibrate?.(50);
                  setTimeout(() => {
                    if (task.dueDate) {
                      toast(`Reminder set for ${formatDate(task.dueDate)}`);
                    }
                  }, 150);
                }}
                className="w-full px-4 py-3 text-left text-sm flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <BellRing size={16} /> Set Reminder
              </button>

              <button
                onClick={() => {
                  setShowMenu(false);
                  setShowDeleteConfirm(true);
                }}
                disabled={loading}
                className="w-full px-4 py-3 text-left text-sm flex items-center gap-3 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50 transition-colors"
              >
                <Trash2 size={16} /> Delete Task
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* click outside */}
        {showMenu && (
          <button
            aria-hidden
            onClick={() => setShowMenu(false)}
            className="fixed inset-0 z-10 bg-transparent cursor-default"
          />
        )}
      </motion.article>

      {/* Beautiful Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full shadow-xl"
            >
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle className="text-red-500" size={32} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  Delete Task?
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Are you sure you want to delete "{task.title}"? This action cannot be undone.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={loading}
                  className="flex-1 py-3 px-4 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={loading}
                  className="flex-1 py-3 px-4 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center justify-center"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    'Delete Task'
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <TaskEditForm
        task={task}
        isOpen={showEditForm}
        onClose={() => setShowEditForm(false)}
      />
    </>
  );
};