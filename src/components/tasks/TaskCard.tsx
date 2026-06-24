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
        return <Zap size={10} className="text-red-500" />;
      case 'high':
        return <Flag size={10} className="text-orange-500" />;
      case 'medium':
        return <Target size={10} className="text-yellow-500" />;
      default:
        return <Circle size={10} className="text-gray-500" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle size={12} className="text-green-500" />;
      case 'in-progress':
        return <Clock size={12} className="text-blue-500" />;
      default:
        return <Circle size={12} className="text-gray-400" />;
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
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.04 }}
        className={`group bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-3 transition-all hover:shadow-md relative overflow-hidden w-full ${task.status === 'completed' ? 'opacity-75' : ''
          }`}
        aria-labelledby={`task-${task.id}-title`}
        role="article"
      >
        {/* Favorite indicator */}
        {task.favorite && (
          <div className="absolute top-1.5 right-1.5 text-yellow-400">
            <Star size={12} fill="currentColor" />
          </div>
        )}

        <div className="flex items-start gap-2.5 w-full">
          {/* status toggle - smaller */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.92 }}
            onClick={handleStatusToggle}
            disabled={loading}
            aria-pressed={task.status === 'completed'}
            title={task.status === 'completed' ? 'Mark as Todo' : 'Mark as Completed'}
            className={`flex-shrink-0 mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${task.status === 'completed'
                ? 'bg-green-500 border-green-500 text-white'
                : 'border-gray-300 dark:border-gray-600 hover:border-green-500'
              }`}
          >
            {task.status === 'completed' && <CheckSquare size={10} />}
          </motion.button>

          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-start gap-1.5">
              <div className="flex-1 min-w-0">
                {/* Title - smaller */}
                <h3
                  id={`task-${task.id}-title`}
                  className={`text-sm font-semibold leading-tight break-words ${task.status === 'completed'
                      ? 'text-gray-500 dark:text-gray-400 line-through'
                      : 'text-gray-900 dark:text-white'
                    }`}
                >
                  {task.title}
                </h3>

                {/* Badges - more compact */}
                <div className="flex flex-wrap items-center gap-1 mt-1.5">
                  <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                    {getStatusIcon(task.status)}
                    <span className="capitalize">{task.status.replace('-', ' ')}</span>
                  </span>

                  <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                    {getPriorityIcon(task.priority)}
                    <span className="capitalize">{task.priority}</span>
                  </span>

                  {task.dueDate && (
                    <span
                      className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-medium ${getUrgencyClass(
                        daysLeft
                      )}`}
                    >
                      <Calendar size={10} />
                      {formatDate(task.dueDate)}
                    </span>
                  )}
                </div>

                {/* Description with expand/collapse - more compact */}
                {task.description && (
                  <div className="mt-1.5">
                    <button
                      onClick={toggleExpand}
                      className="flex items-center text-[11px] text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                    >
                      {expanded ? (
                        <>
                          <ChevronUp size={12} className="mr-0.5" />
                          Less
                        </>
                      ) : (
                        <>
                          <ChevronDown size={12} className="mr-0.5" />
                          More
                        </>
                      )}
                    </button>

                    <AnimatePresence>
                      {expanded && (
                        <motion.p
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="text-[11px] mt-1 text-gray-600 dark:text-gray-300 break-words whitespace-pre-line"
                        >
                          {task.description}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>
                )}

                {/* Tags - more compact */}
                {task.tags?.length > 0 && (
                  <div className="flex flex-wrap gap-0.5 mt-1.5">
                    {task.tags.slice(0, 2).map((tag, i) => (
                      <span key={i} className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400">
                        <Tag size={8} />
                        {tag}
                      </span>
                    ))}
                    {task.tags.length > 2 && (
                      <span className="text-[10px] text-gray-500 dark:text-gray-400">
                        +{task.tags.length - 2}
                      </span>
                    )}
                  </div>
                )}

                {/* Subtasks progress - more compact */}
                {subtaskProgress !== null && (
                  <div className="mt-1.5">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-gray-600 dark:text-gray-300">
                        Progress
                      </span>
                      <span className="text-gray-500 dark:text-gray-400">
                        {subtaskProgress}%
                      </span>
                    </div>
                    <div className="w-full h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mt-0.5">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${subtaskProgress}%` }}
                        className="h-1 rounded-full bg-gradient-to-r from-blue-500 to-purple-500"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Right controls - more compact */}
              <div className="flex flex-col items-end gap-0.5 flex-shrink-0">
                <button
                  onClick={toggleFavorite}
                  disabled={loading}
                  title={task.favorite ? 'Unfavorite' : 'Mark favorite'}
                  className={`p-1 rounded-md transition-colors ${task.favorite
                      ? 'text-yellow-500 bg-yellow-100 dark:bg-yellow-900/30'
                      : 'text-gray-400 hover:text-yellow-500 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  aria-label="toggle favorite"
                >
                  <Star size={13} fill={task.favorite ? "currentColor" : "none"} />
                </button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.92 }}
                  onClick={() => setShowMenu((s) => !s)}
                  className="p-1 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  aria-haspopup="true"
                  aria-expanded={showMenu}
                >
                  <MoreVertical size={14} />
                </motion.button>
              </div>
            </div>

            {/* Additional info row - more compact */}
            <div className="flex items-center justify-between mt-1.5 text-[10px] text-gray-500 dark:text-gray-400">
              <div className="flex items-center gap-1.5">
                {task.assignee && (
                  <span className="inline-flex items-center gap-0.5">
                    <User size={10} />
                    {task.assignee.name}
                  </span>
                )}

                {task.estimate && (
                  <span className="inline-flex items-center gap-0.5">
                    <Clock size={10} />
                    {task.estimate}h
                  </span>
                )}

                {task.category && (
                  <span className="inline-flex items-center gap-0.5 capitalize">
                    <Sparkles size={10} />
                    {task.category.replace('-', ' ')}
                  </span>
                )}
              </div>

              <div className="text-[10px]">
                {new Date(task.createdAt).toLocaleDateString()}
              </div>
            </div>
          </div>
        </div>

        {/* Menu - more compact */}
        <AnimatePresence>
          {showMenu && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -4 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -4 }}
              className="absolute right-1.5 top-10 z-20 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg w-40 overflow-hidden"
            >
              <button
                onClick={() => {
                  setShowEditForm(true);
                  setShowMenu(false);
                }}
                className="w-full px-3 py-2 text-left text-xs flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <Edit3 size={13} /> Edit Task
              </button>

              <button
                onClick={() => {
                  copyTaskToClipboard();
                  setShowMenu(false);
                }}
                className="w-full px-3 py-2 text-left text-xs flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <Copy size={13} /> Copy JSON
              </button>

              <button
                onClick={() => {
                  snoozeOneDay();
                  setShowMenu(false);
                }}
                className="w-full px-3 py-2 text-left text-xs flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <Clock size={13} /> Snooze 1 Day
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
                className="w-full px-3 py-2 text-left text-xs flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <BellRing size={13} /> Set Reminder
              </button>

              <button
                onClick={() => {
                  setShowMenu(false);
                  setShowDeleteConfirm(true);
                }}
                disabled={loading}
                className="w-full px-3 py-2 text-left text-xs flex items-center gap-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50 transition-colors"
              >
                <Trash2 size={13} /> Delete Task
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Click outside */}
        {showMenu && (
          <button
            aria-hidden
            onClick={() => setShowMenu(false)}
            className="fixed inset-0 z-10 bg-transparent cursor-default"
          />
        )}
      </motion.article>

      {/* Delete Confirmation Modal - more compact */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.92 }}
              className="bg-white dark:bg-gray-800 rounded-xl p-5 max-w-sm w-full shadow-xl"
            >
              <div className="text-center mb-5">
                <div className="w-14 h-14 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
                  <AlertTriangle className="text-red-500" size={28} />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1.5">
                  Delete Task?
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Are you sure you want to delete "<span className="font-medium">{task.title}</span>"?
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  This action cannot be undone.
                </p>
              </div>

              <div className="flex gap-2.5">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={loading}
                  className="flex-1 py-2.5 px-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={loading}
                  className="flex-1 py-2.5 px-3 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center justify-center"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    'Delete'
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