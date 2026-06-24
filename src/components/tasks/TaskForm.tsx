import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Plus,
  Calendar,
  Flag,
  Tag,
  Clock,
  Lightbulb,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Zap,
  Target,
  Award,
  BookOpen,
  Heart,
  Brain,
  Rocket,
  Check,
  ArrowRight
} from 'lucide-react';
import { TaskCategory, Priority, Timeframe } from '../../types/task';
import { useTasks } from '../../hooks/useTasks';
import toast from 'react-hot-toast';

interface TaskFormProps {
  isOpen: boolean;
  onClose: () => void;
  category?: TaskCategory;
  initialDueDate?: Date;
}

const DRAFT_KEY = 'taskFormDraft_v2';

export const TaskForm: React.FC<TaskFormProps> = ({ isOpen, onClose, category, initialDueDate }) => {
  const { addTask, tasks } = useTasks() as any;
  const [activeTab, setActiveTab] = useState<'basic' | 'advanced'>('basic');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: (category || ('code-tasks' as TaskCategory)) as TaskCategory,
    priority: 'medium' as Priority,
    timeframe: 'daily' as Timeframe,
    dueDate: initialDueDate ? initialDueDate.toISOString().split('T')[0] : '',
    tags: [] as string[],
    estimate: '' as string,
  });
  const [tagInput, setTagInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [descCount, setDescCount] = useState(0);

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

  const timeframeOptions = [
    { value: 'daily', label: 'Daily', icon: '📅' },
    { value: 'weekly', label: 'Weekly', icon: '📆' },
    { value: 'monthly', label: 'Monthly', icon: '🗓️' },
    { value: 'yearly', label: 'Yearly', icon: '📋' },
  ];

  const suggestedTags = React.useMemo(() => {
    if (!tasks || !Array.isArray(tasks)) return [] as string[];
    const map = new Map<string, number>();
    tasks.forEach((t: any) => (t.tags || []).forEach((tg: string) => map.set(tg, (map.get(tg) || 0) + 1)));
    return Array.from(map.entries()).sort((a, b) => b[1] - a[1]).map(([k]) => k).slice(0, 6);
  }, [tasks]);

  useEffect(() => {
    if (!isOpen) return;
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (!category || parsed.category === category) {
          setFormData(prev => ({ ...prev, ...parsed }));
          setDescCount((parsed.description || '').length);
          toast('Draft loaded', { icon: '💾', duration: 1500 });
        }
      }
    } catch (err) {
      // ignore
    }
  }, [isOpen, category]);

  useEffect(() => {
    if (!isOpen) return;
    const t = setTimeout(() => {
      try {
        const toSave = { ...formData };
        localStorage.setItem(DRAFT_KEY, JSON.stringify(toSave));
      } catch (err) {
        // ignore
      }
    }, 600);
    return () => clearTimeout(t);
  }, [formData, isOpen]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        const el = document.getElementById('task-form-submit') as HTMLButtonElement | null;
        el?.click();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen]);

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      category: (category || ('code-tasks' as TaskCategory)) as TaskCategory,
      priority: 'medium' as Priority,
      timeframe: 'daily' as Timeframe,
      dueDate: initialDueDate ? initialDueDate.toISOString().split('T')[0] : '',
      tags: [],
      estimate: '',
    });
    setTagInput('');
    setDescCount(0);
    localStorage.removeItem(DRAFT_KEY);
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!formData.title.trim()) {
      toast.error('Please enter a task title');
      return;
    }

    setLoading(true);
    try {
      await addTask({
        title: formData.title.trim(),
        description: formData.description.trim(),
        category: formData.category,
        priority: formData.priority,
        status: 'todo',
        timeframe: formData.timeframe,
        dueDate: formData.dueDate ? new Date(formData.dueDate) : undefined,
        tags: formData.tags,
        subtasks: [],
        estimate: formData.estimate ? Number(formData.estimate) : undefined,
      });

      toast.success('Task created successfully! 🎉');
      resetForm();
      onClose();
    } catch (error) {
      toast.error('Failed to create task');
    } finally {
      setLoading(false);
    }
  };

  const addTag = useCallback(() => {
    const val = tagInput.trim();
    if (!val) return;
    if (formData.tags.includes(val)) {
      setTagInput('');
      return;
    }
    setFormData(prev => ({ ...prev, tags: [...prev.tags, val] }));
    setTagInput('');
  }, [tagInput, formData.tags]);

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({ ...prev, tags: prev.tags.filter(tag => tag !== tagToRemove) }));
  };

  const quickDue = (days: number) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    const iso = d.toISOString().slice(0, 10);
    setFormData(prev => ({ ...prev, dueDate: iso }));
  };

  const getCategoryIcon = (value: string) => {
    const found = categoryOptions.find(c => c.value === value);
    return found ? found.icon : '📋';
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        // Fixed z-index to be above everything including BottomBar (z-50)
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-end justify-center z-[100]">
          <motion.div
            initial={{ opacity: 0, y: '100%' }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="bg-white dark:bg-gray-900 rounded-t-3xl shadow-2xl w-full max-w-md max-h-[92vh] overflow-hidden relative"
          >
            {/* Handle/Pull indicator */}
            <div className="w-12 h-1 bg-gray-300 dark:bg-gray-600 rounded-full mx-auto mt-2 flex-shrink-0" />

            {/* Header */}
            <div className="sticky top-0 bg-white dark:bg-gray-900 pt-3 px-5 pb-3 border-b border-gray-100 dark:border-gray-800 z-10">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <Sparkles size={20} className="text-purple-500" />
                    New Task
                  </h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    Fill in the details below
                  </p>
                </div>
                <button
                  onClick={() => { resetForm(); onClose(); }}
                  className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  <X size={20} className="text-gray-600 dark:text-gray-300" />
                </button>
              </div>

              {/* Tabs */}
              <div className="flex gap-1 mt-4 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
                <button
                  className={`flex-1 py-2.5 px-3 rounded-lg text-sm font-medium transition-all ${activeTab === 'basic'
                    ? 'bg-white dark:bg-gray-700 shadow-sm text-purple-600 dark:text-purple-400'
                    : 'text-gray-500 dark:text-gray-400'
                    }`}
                  onClick={() => setActiveTab('basic')}
                >
                  Basic
                </button>
                <button
                  className={`flex-1 py-2.5 px-3 rounded-lg text-sm font-medium transition-all ${activeTab === 'advanced'
                    ? 'bg-white dark:bg-gray-700 shadow-sm text-purple-600 dark:text-purple-400'
                    : 'text-gray-500 dark:text-gray-400'
                    }`}
                  onClick={() => setActiveTab('advanced')}
                >
                  Advanced
                </button>
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="overflow-y-auto px-5 py-4 space-y-4" style={{ maxHeight: 'calc(92vh - 200px)' }}>
              {/* Title Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Task Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-all"
                  placeholder="What needs to be done?"
                  autoFocus
                />
              </div>

              {activeTab === 'basic' ? (
                <>
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
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-all resize-none"
                      placeholder="Add details about your task..."
                    />
                    <div className="flex justify-between text-xs mt-1 text-gray-400 dark:text-gray-500">
                      <span>{descCount} characters</span>
                      <span>Optional</span>
                    </div>
                  </div>

                  {/* Category & Priority Grid */}
                  <div className="grid grid-cols-2 gap-3">
                    {/* Category */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                        Category
                      </label>
                      <div className="relative">
                        <select
                          value={formData.category}
                          onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value as TaskCategory }))}
                          className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 dark:text-white appearance-none transition-all"
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

                    {/* Priority */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                        Priority
                      </label>
                      <div className="relative">
                        <select
                          value={formData.priority}
                          onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value as Priority }))}
                          className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 dark:text-white appearance-none transition-all"
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

                  {/* Priority Indicator */}
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
                                'from-red-400 to-red-500'
                          } text-white`
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'
                          }`}
                      >
                        {p.icon} {p.label}
                      </button>
                    ))}
                  </div>
                </>
              ) : (
                <>
                  {/* Timeframe & Estimate Grid */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                        Timeframe
                      </label>
                      <div className="relative">
                        <select
                          value={formData.timeframe}
                          onChange={(e) => setFormData(prev => ({ ...prev, timeframe: e.target.value as Timeframe }))}
                          className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 dark:text-white appearance-none transition-all"
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
                        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-all"
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
                            ? 'bg-purple-500 text-white'
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
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 dark:text-white transition-all"
                    />
                  </div>

                  {/* Tags */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                      Tags
                    </label>

                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {formData.tags.map((tag) => (
                        <span key={tag} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
                          <Tag size={12} />
                          {tag}
                          <button
                            type="button"
                            onClick={() => removeTag(tag)}
                            className="hover:text-purple-600 dark:hover:text-purple-300 transition-colors"
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
                        className="flex-1 px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-all"
                        placeholder="Add a tag..."
                      />
                      <button
                        type="button"
                        onClick={addTag}
                        className="p-2.5 bg-purple-500 text-white rounded-xl hover:bg-purple-600 transition-colors flex items-center justify-center"
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
                </>
              )}
            </div>

            {/* Bottom Actions - Native style */}
            <div className="sticky bottom-0 bg-white dark:bg-gray-900 px-5 py-4 border-t border-gray-100 dark:border-gray-800">
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => { resetForm(); onClose(); }}
                  className="flex-1 py-3 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <motion.button
                  id="task-form-submit"
                  whileTap={{ scale: 0.95 }}
                  type="button"
                  onClick={() => handleSubmit()}
                  disabled={loading}
                  className="flex-1 py-3 rounded-xl text-sm font-medium text-white bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 disabled:opacity-50 transition-all shadow-lg shadow-purple-500/20 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Sparkles size={16} />
                      Create Task
                    </>
                  )}
                </motion.button>
              </div>
              <p className="text-center text-xs text-gray-400 dark:text-gray-500 mt-2">
                ⌘ + Enter to submit
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};