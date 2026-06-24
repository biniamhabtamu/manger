import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Save,
  Calendar,
  Flag,
  Tag,
  Clock,
  RotateCw,
  Copy,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Check,
  AlertCircle,
  Edit3,
  Eye,
  EyeOff,
  Zap,
  Target,
  Award
} from 'lucide-react';
import { Task, TaskCategory, Priority, Timeframe } from '../../types/task';
import { useTasks } from '../../hooks/useTasks';
import toast from 'react-hot-toast';

interface TaskEditFormProps {
  task: Task;
  isOpen: boolean;
  onClose: () => void;
}

const DRAFT_PREFIX = 'taskEditDraft_v1_';

export const TaskEditForm: React.FC<TaskEditFormProps> = ({ task, isOpen, onClose }) => {
  const { updateTask, tasks } = useTasks() as any;

  const categoryOptions = [
    { value: 'code-tasks', label: 'Code Tasks', icon: '💻', color: 'from-blue-500 to-indigo-500' },
    { value: 'learning', label: 'Learning', icon: '📚', color: 'from-emerald-500 to-teal-500' },
    { value: 'relationship', label: 'Relationships', icon: '❤️', color: 'from-rose-500 to-pink-500' },
    { value: 'self-development', label: 'Self Development', icon: '🧠', color: 'from-purple-500 to-violet-500' },
    { value: 'project-improvement', label: 'Project Improvement', icon: '🚀', color: 'from-orange-500 to-amber-500' },
  ];

  const priorityOptions = [
    { value: 'low', label: 'Low', icon: '🌱', color: 'text-emerald-500' },
    { value: 'medium', label: 'Medium', icon: '🌿', color: 'text-yellow-500' },
    { value: 'high', label: 'High', icon: '🔥', color: 'text-orange-500' },
    { value: 'urgent', label: 'Urgent', icon: '⚡', color: 'text-red-500' },
  ];

  const statusOptions = [
    { value: 'todo', label: 'Todo', icon: '📋', color: 'text-gray-500' },
    { value: 'in-progress', label: 'In Progress', icon: '🔄', color: 'text-blue-500' },
    { value: 'completed', label: 'Completed', icon: '✅', color: 'text-emerald-500' },
  ];

  const timeframeOptions = [
    { value: 'daily', label: 'Daily', icon: '📅' },
    { value: 'weekly', label: 'Weekly', icon: '📆' },
    { value: 'monthly', label: 'Monthly', icon: '🗓️' },
    { value: 'yearly', label: 'Yearly', icon: '📋' },
  ];

  const initialState = useMemo(() => ({
    title: task.title || '',
    description: task.description || '',
    category: task.category || ('code-tasks' as TaskCategory),
    priority: task.priority || ('medium' as Priority),
    status: task.status || 'todo',
    timeframe: task.timeframe || ('daily' as Timeframe),
    dueDate: task.dueDate ? task.dueDate.toISOString().split('T')[0] : '',
    tags: task.tags || [],
    estimate: (task as any).estimate ? String((task as any).estimate) : '',
  }), [task]);

  const [formData, setFormData] = useState(initialState);
  const [tagInput, setTagInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [descCount, setDescCount] = useState((task.description || '').length);
  const [showDraftIndicator, setShowDraftIndicator] = useState(false);

  const draftKey = `${DRAFT_PREFIX}${task.id}`;

  const suggestedTags = useMemo(() => {
    if (!tasks || !Array.isArray(tasks)) return [] as string[];
    const map = new Map<string, number>();
    tasks.forEach((t: any) => (t.tags || []).forEach((tg: string) => map.set(tg, (map.get(tg) || 0) + 1)));
    return Array.from(map.entries()).sort((a, b) => b[1] - a[1]).map(([k]) => k).slice(0, 8);
  }, [tasks]);

  useEffect(() => {
    if (isOpen) {
      try {
        const raw = localStorage.getItem(draftKey);
        if (raw) {
          const parsed = JSON.parse(raw);
          setFormData(prev => ({ ...prev, ...parsed }));
          setDescCount((parsed.description || '').length);
          setShowDraftIndicator(true);
          toast('Draft loaded', { icon: '💾', duration: 1500 });
          return;
        }
      } catch (err) {
        // ignore
      }
      setFormData(initialState);
      setDescCount(initialState.description.length);
      setShowDraftIndicator(false);
    }
  }, [isOpen, draftKey, initialState]);

  useEffect(() => {
    if (!isOpen) return;
    const t = setTimeout(() => {
      try {
        const toSave = {
          title: formData.title,
          description: formData.description,
          category: formData.category,
          priority: formData.priority,
          status: formData.status,
          timeframe: formData.timeframe,
          dueDate: formData.dueDate,
          tags: formData.tags,
          estimate: formData.estimate,
        };
        localStorage.setItem(draftKey, JSON.stringify(toSave));
        setShowDraftIndicator(true);
      } catch (err) {
        // ignore
      }
    }, 700);
    return () => clearTimeout(t);
  }, [formData, isOpen, draftKey]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        const el = document.getElementById('task-edit-save') as HTMLButtonElement | null;
        el?.click();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen]);

  const resetToOriginal = () => {
    setFormData(initialState);
    setDescCount(initialState.description.length);
    localStorage.removeItem(draftKey);
    setShowDraftIndicator(false);
    toast.success('Reverted to original');
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!formData.title.trim()) {
      toast.error('Please enter a task title');
      return;
    }

    setLoading(true);
    try {
      await updateTask(task.id, {
        title: formData.title.trim(),
        description: formData.description.trim(),
        category: formData.category,
        priority: formData.priority,
        status: formData.status,
        timeframe: formData.timeframe,
        dueDate: formData.dueDate ? new Date(formData.dueDate) : undefined,
        tags: formData.tags,
        estimate: formData.estimate ? Number(formData.estimate) : undefined,
      });

      localStorage.removeItem(draftKey);
      setShowDraftIndicator(false);
      toast.success('Task updated successfully! 🎉');
      onClose();
    } catch (error) {
      toast.error('Failed to update task');
    } finally {
      setLoading(false);
    }
  };

  const addTag = () => {
    const val = tagInput.trim();
    if (!val) return;
    if (formData.tags.includes(val)) {
      setTagInput('');
      return;
    }
    setFormData(prev => ({ ...prev, tags: [...prev.tags, val] }));
    setTagInput('');
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({ ...prev, tags: prev.tags.filter(tag => tag !== tagToRemove) }));
  };

  const quickDue = (days: number) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    const iso = d.toISOString().slice(0, 10);
    setFormData(prev => ({ ...prev, dueDate: iso }));
  };

  const copyJSON = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify({ ...task, ...formData }, null, 2));
      toast.success('Task JSON copied to clipboard');
    } catch (err) {
      toast.error('Failed to copy');
    }
  };

  const getCategoryEmoji = (value: string) => {
    const found = categoryOptions.find(c => c.value === value);
    return found ? found.icon : '📋';
  };

  const getPriorityEmoji = (value: string) => {
    const found = priorityOptions.find(p => p.value === value);
    return found ? found.icon : '🌿';
  };

  const getStatusEmoji = (value: string) => {
    const found = statusOptions.find(s => s.value === value);
    return found ? found.icon : '📋';
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-end justify-center z-50">
          <motion.div
            initial={{ opacity: 0, y: '100%' }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="bg-white dark:bg-gray-900 rounded-t-3xl shadow-2xl w-full max-w-md max-h-[92vh] overflow-hidden"
          >
            {/* Header */}
            <div className="sticky top-0 bg-white dark:bg-gray-900 pt-5 px-5 pb-3 border-b border-gray-100 dark:border-gray-800 z-10">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <Edit3 size={20} className="text-blue-500" />
                    Edit Task
                  </h2>
                  <div className="flex items-center gap-2 mt-0.5">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {formData.title || 'Untitled'}
                    </p>
                    {showDraftIndicator && (
                      <span className="text-[10px] px-2 py-0.5 bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 rounded-full flex items-center gap-1">
                        <Save size={10} />
                        Draft
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={copyJSON}
                    title="Copy JSON"
                    className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    <Copy size={18} className="text-gray-500 dark:text-gray-400" />
                  </button>
                  <button
                    onClick={resetToOriginal}
                    title="Reset to original"
                    className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    <RotateCw size={18} className="text-gray-500 dark:text-gray-400" />
                  </button>
                  <button
                    onClick={onClose}
                    className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                  >
                    <X size={20} className="text-gray-600 dark:text-gray-300" />
                  </button>
                </div>
              </div>

              {/* Status Quick Select */}
              <div className="flex gap-1 mt-4 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
                {statusOptions.map((status) => (
                  <button
                    key={status.value}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, status: status.value as any }))}
                    className={`flex-1 py-2 px-2 rounded-lg text-xs font-medium transition-all flex items-center justify-center gap-1 ${formData.status === status.value
                        ? 'bg-white dark:bg-gray-700 shadow-sm text-gray-900 dark:text-white'
                        : 'text-gray-500 dark:text-gray-400'
                      }`}
                  >
                    <span>{status.icon}</span>
                    <span className="hidden xs:inline">{status.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="overflow-y-auto px-5 py-4 space-y-4" style={{ maxHeight: 'calc(92vh - 220px)' }}>
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Task Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-all"
                  placeholder="What needs to be done?"
                  autoFocus
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => {
                    setFormData(prev => ({ ...prev, description: e.target.value }));
                    setDescCount(e.target.value.length);
                  }}
                  rows={3}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-all resize-none"
                  placeholder="Add details about your task..."
                />
                <div className="flex justify-between text-xs mt-1 text-gray-400 dark:text-gray-500">
                  <span>{descCount} characters</span>
                  <span>Optional</span>
                </div>
              </div>

              {/* Category & Priority */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Category
                  </label>
                  <div className="relative">
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value as TaskCategory }))}
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white appearance-none transition-all"
                    >
                      {categoryOptions.map(cat => (
                        <option key={cat.value} value={cat.value}>
                          {cat.icon} {cat.label}
                        </option>
                      ))}
                    </select>
                    <ChevronDown size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Priority
                  </label>
                  <div className="relative">
                    <select
                      value={formData.priority}
                      onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value as Priority }))}
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white appearance-none transition-all"
                    >
                      {priorityOptions.map(p => (
                        <option key={p.value} value={p.value}>
                          {p.icon} {p.label}
                        </option>
                      ))}
                    </select>
                    <ChevronDown size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Priority Quick Select */}
              <div className="flex gap-1">
                {priorityOptions.map(p => (
                  <button
                    key={p.value}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, priority: p.value as Priority }))}
                    className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all ${formData.priority === p.value
                        ? `bg-gradient-to-r ${p.value === 'low' ? 'from-emerald-400 to-emerald-500' :
                          p.value === 'medium' ? 'from-yellow-400 to-yellow-500' :
                            p.value === 'high' ? 'from-orange-400 to-orange-500' :
                              'from-red-400 to-red-500'} text-white`
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'
                      }`}
                  >
                    {p.icon} {p.label}
                  </button>
                ))}
              </div>

              {/* Timeframe & Estimate */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Timeframe
                  </label>
                  <div className="relative">
                    <select
                      value={formData.timeframe}
                      onChange={(e) => setFormData(prev => ({ ...prev, timeframe: e.target.value as Timeframe }))}
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white appearance-none transition-all"
                    >
                      {timeframeOptions.map(t => (
                        <option key={t.value} value={t.value}>
                          {t.icon} {t.label}
                        </option>
                      ))}
                    </select>
                    <ChevronDown size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Estimate (hours)
                  </label>
                  <input
                    type="number"
                    min={0}
                    step={0.5}
                    value={formData.estimate}
                    onChange={(e) => setFormData(prev => ({ ...prev, estimate: e.target.value }))}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-all"
                    placeholder="1.5"
                  />
                </div>
              </div>

              {/* Due Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Due Date
                </label>
                <div className="flex gap-2 mb-3 overflow-x-auto pb-1">
                  {[
                    { label: 'Today', days: 0 },
                    { label: 'Tomorrow', days: 1 },
                    { label: '3 Days', days: 3 },
                    { label: 'Week', days: 7 },
                  ].map((item) => (
                    <button
                      key={item.days}
                      type="button"
                      onClick={() => quickDue(item.days)}
                      className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-all ${formData.dueDate === new Date(Date.now() + item.days * 86400000).toISOString().slice(0, 10)
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                        }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
                <input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white transition-all"
                />
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Tags
                </label>

                <div className="flex flex-wrap gap-1.5 mb-3">
                  {formData.tags.map((tag) => (
                    <span key={tag} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                      <Tag size={12} />
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="hover:text-blue-600 dark:hover:text-blue-300 transition-colors"
                      >
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                    className="flex-1 px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-all"
                    placeholder="Add a tag..."
                  />
                  <button
                    type="button"
                    onClick={addTag}
                    className="p-2.5 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors flex items-center justify-center"
                  >
                    <Plus size={20} />
                  </button>
                </div>

                {suggestedTags.length > 0 && (
                  <div className="mt-3">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1.5">Suggested:</p>
                    <div className="flex flex-wrap gap-1.5">
                      {suggestedTags.map(t => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setFormData(prev => ({
                            ...prev,
                            tags: Array.from(new Set([...prev.tags, t]))
                          }))}
                          className="px-3 py-1.5 bg-gray-100 dark:bg-gray-800 rounded-lg text-xs text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Current Values Summary */}
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-3 space-y-1.5">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Current Values</p>
                <div className="flex flex-wrap gap-2 text-xs">
                  <span className="flex items-center gap-1 text-gray-700 dark:text-gray-300">
                    <span>{getCategoryEmoji(formData.category)}</span>
                    <span>{categoryOptions.find(c => c.value === formData.category)?.label}</span>
                  </span>
                  <span className="flex items-center gap-1 text-gray-700 dark:text-gray-300">
                    <span>{getPriorityEmoji(formData.priority)}</span>
                    <span>{priorityOptions.find(p => p.value === formData.priority)?.label}</span>
                  </span>
                  <span className="flex items-center gap-1 text-gray-700 dark:text-gray-300">
                    <span>{getStatusEmoji(formData.status)}</span>
                    <span>{statusOptions.find(s => s.value === formData.status)?.label}</span>
                  </span>
                  {formData.timeframe && (
                    <span className="flex items-center gap-1 text-gray-700 dark:text-gray-300">
                      <span>{timeframeOptions.find(t => t.value === formData.timeframe)?.icon}</span>
                      <span>{timeframeOptions.find(t => t.value === formData.timeframe)?.label}</span>
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="sticky bottom-0 bg-white dark:bg-gray-900 px-5 py-4 border-t border-gray-100 dark:border-gray-800">
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => { localStorage.removeItem(draftKey); onClose(); }}
                  className="flex-1 py-3 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <motion.button
                  id="task-edit-save"
                  whileTap={{ scale: 0.95 }}
                  type="button"
                  onClick={() => handleSubmit()}
                  disabled={loading}
                  className="flex-1 py-3 rounded-xl text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 disabled:opacity-50 transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Save size={16} />
                      Save Changes
                    </>
                  )}
                </motion.button>
              </div>
              <p className="text-center text-xs text-gray-400 dark:text-gray-500 mt-2">
                ⌘ + Enter to save
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

// Plus icon component
function Plus(props: any) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}