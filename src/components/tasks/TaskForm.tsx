import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Calendar, Flag, Tag, Clock, Lightbulb, Sparkles } from 'lucide-react';
import { TaskCategory, Priority, Timeframe } from '../../types/task';
import { useTasks } from '../../hooks/useTasks';
import toast from 'react-hot-toast';

interface TaskFormProps {
  isOpen: boolean;
  onClose: () => void;
  category?: TaskCategory;
}

const DRAFT_KEY = 'taskFormDraft_v2';

export const TaskForm: React.FC<TaskFormProps> = ({ isOpen, onClose, category }) => {
  const { addTask, tasks } = useTasks() as any;
  const [activeTab, setActiveTab] = useState<'basic' | 'advanced'>('basic');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: (category || ('code-tasks' as TaskCategory)) as TaskCategory,
    priority: 'medium' as Priority,
    timeframe: 'daily' as Timeframe,
    dueDate: '',
    tags: [] as string[],
    estimate: '' as string,
  });
  const [tagInput, setTagInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [descCount, setDescCount] = useState(0);

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
      dueDate: '',
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

      toast.success('Task created successfully!');
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

  const categoryIcons = {
    'code-tasks': '💻',
    'learning': '📚',
    'relationship': '❤️',
    'self-development': '🧠',
    'project-improvement': '🚀'
  };

  const priorityColors = {
    low: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    high: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
    urgent: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-gradient-to-br from-purple-100 via-blue-100 to-pink-100 dark:from-gray-900 dark:to-gray-800 flex items-start justify-center p-0 z-50 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg rounded-t-3xl shadow-2xl w-full min-h-screen mt-16 border border-white/20 dark:border-gray-700"
          >
            <div className="sticky top-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md pt-4 pb-2 px-5 rounded-t-3xl border-b border-gray-200/50 dark:border-gray-700/50 z-10">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  Create New Task
                </h2>
                <button
                  onClick={() => { resetForm(); onClose(); }}
                  aria-label="close"
                  className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="flex space-x-1 bg-gray-100/80 dark:bg-gray-700/80 p-1 rounded-lg backdrop-blur-sm">
                <button 
                  className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all ${activeTab === 'basic' ? 'bg-white dark:bg-gray-600 shadow-sm text-purple-600 dark:text-purple-400' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}
                  onClick={() => setActiveTab('basic')}
                >
                  Basic
                </button>
                <button 
                  className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all ${activeTab === 'advanced' ? 'bg-white dark:bg-gray-600 shadow-sm text-purple-600 dark:text-purple-400' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}
                  onClick={() => setActiveTab('advanced')}
                >
                  Advanced
                </button>
              </div>
            </div>

            <div className="p-5 pb-32">
              <form onSubmit={(e) => handleSubmit(e)} className="space-y-6">
                <div className="bg-gradient-to-r from-purple-50/80 to-blue-50/80 dark:from-gray-750/50 dark:to-gray-700/50 p-4 rounded-2xl backdrop-blur-sm border border-white/50 dark:border-gray-600/30">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                    <Sparkles size={16} className="mr-2 text-purple-500" />
                    Task Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/70 dark:bg-gray-700/70 text-gray-900 dark:text-white backdrop-blur-sm"
                    placeholder="What needs to be done?"
                    autoFocus
                    aria-required
                  />
                </div>

                {activeTab === 'basic' ? (
                  <>
                    <div className="bg-white/50 dark:bg-gray-700/50 p-4 rounded-2xl backdrop-blur-sm border border-white/50 dark:border-gray-600/30">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                        <Lightbulb size={16} className="mr-2 text-yellow-500" />
                        Description
                      </label>
                      <textarea
                        value={formData.description}
                        onChange={(e) => { setFormData(prev => ({ ...prev, description: e.target.value })); setDescCount(e.target.value.length); }}
                        rows={3}
                        className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/70 dark:bg-gray-700/70 text-gray-900 dark:text-white backdrop-blur-sm"
                        placeholder="Add details about your task..."
                      />
                      <div className="flex justify-between text-xs mt-1 text-gray-500 dark:text-gray-400">
                        <div>{descCount} characters</div>
                        <div className="italic">Optional</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white/50 dark:bg-gray-700/50 p-4 rounded-2xl backdrop-blur-sm border border-white/50 dark:border-gray-600/30">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Category</label>
                        <div className="relative">
                          <select
                            value={formData.category}
                            onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value as TaskCategory }))}
                            className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/70 dark:bg-gray-700/70 text-gray-900 dark:text-white appearance-none backdrop-blur-sm"
                          >
                            <option value="code-tasks">💻 Code Tasks</option>
                            <option value="learning">📚 Learning</option>
                            <option value="relationship">❤️ Relationships</option>
                            <option value="self-development">🧠 Self Development</option>
                            <option value="project-improvement">🚀 Project Improvement</option>
                          </select>
                          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-gray-300">
                            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                              <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                            </svg>
                          </div>
                        </div>
                      </div>

                      <div className="bg-white/50 dark:bg-gray-700/50 p-4 rounded-2xl backdrop-blur-sm border border-white/50 dark:border-gray-600/30">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Priority</label>
                        <div className="relative">
                          <select
                            value={formData.priority}
                            onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value as Priority }))}
                            className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/70 dark:bg-gray-700/70 text-gray-900 dark:text-white appearance-none backdrop-blur-sm"
                          >
                            <option value="low">Low Priority</option>
                            <option value="medium">Medium Priority</option>
                            <option value="high">High Priority</option>
                            <option value="urgent">Urgent!</option>
                          </select>
                          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-gray-300">
                            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                              <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white/50 dark:bg-gray-700/50 p-4 rounded-2xl backdrop-blur-sm border border-white/50 dark:border-gray-600/30">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Timeframe</label>
                        <div className="relative">
                          <select
                            value={formData.timeframe}
                            onChange={(e) => setFormData(prev => ({ ...prev, timeframe: e.target.value as Timeframe }))}
                            className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/70 dark:bg-gray-700/70 text-gray-900 dark:text-white appearance-none backdrop-blur-sm"
                          >
                            <option value="daily">Daily</option>
                            <option value="weekly">Weekly</option>
                            <option value="monthly">Monthly</option>
                            <option value="yearly">Yearly</option>
                          </select>
                          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-gray-300">
                            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                              <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                            </svg>
                          </div>
                        </div>
                      </div>

                      <div className="bg-white/50 dark:bg-gray-700/50 p-4 rounded-2xl backdrop-blur-sm border border-white/50 dark:border-gray-600/30">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                          <Clock size={16} className="mr-2 text-blue-500" />
                          Estimate (hours)
                        </label>
                        <input
                          type="number"
                          min={0}
                          step={0.5}
                          value={formData.estimate}
                          onChange={(e) => setFormData(prev => ({ ...prev, estimate: e.target.value }))}
                          className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/70 dark:bg-gray-700/70 text-gray-900 dark:text-white backdrop-blur-sm"
                          placeholder="e.g. 1.5"
                        />
                      </div>
                    </div>

                    <div className="bg-white/50 dark:bg-gray-700/50 p-4 rounded-2xl backdrop-blur-sm border border-white/50 dark:border-gray-600/30">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                        <Calendar size={16} className="mr-2 text-green-500" />
                        Due Date
                      </label>
                      <div className="flex gap-2 mb-3 overflow-x-auto pb-2">
                        <button 
                          type="button" 
                          onClick={() => quickDue(0)} 
                          className="flex-shrink-0 px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                        >
                          Today
                        </button>
                        <button 
                          type="button" 
                          onClick={() => quickDue(1)} 
                          className="flex-shrink-0 px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                        >
                          Tomorrow
                        </button>
                        <button 
                          type="button" 
                          onClick={() => quickDue(7)} 
                          className="flex-shrink-0 px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                        >
                          Next Week
                        </button>
                      </div>
                      <input
                        type="date"
                        value={formData.dueDate}
                        onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/70 dark:bg-gray-700/70 text-gray-900 dark:text-white backdrop-blur-sm"
                      />
                    </div>

                    <div className="bg-white/50 dark:bg-gray-700/50 p-4 rounded-2xl backdrop-blur-sm border border-white/50 dark:border-gray-600/30">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                        <Tag size={16} className="mr-2 text-pink-500" />
                        Tags
                      </label>

                      <div className="flex flex-wrap gap-2 mb-3">
                        {formData.tags.map((tag) => (
                          <span key={tag} className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-purple-100 to-blue-100 text-purple-800 dark:from-purple-900/30 dark:to-blue-900/30 dark:text-purple-400">
                            {tag}
                            <button type="button" onClick={() => removeTag(tag)} className="ml-2 hover:text-purple-600 dark:hover:text-purple-300 transition-colors"><X size={12} /></button>
                          </span>
                        ))}
                      </div>

                      <div className="flex gap-2 items-center">
                        <input
                          type="text"
                          value={tagInput}
                          onChange={(e) => setTagInput(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                          className="flex-1 px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/70 dark:bg-gray-700/70 text-gray-900 dark:text-white backdrop-blur-sm"
                          placeholder="Add a tag and press Enter"
                          aria-label="tag input"
                        />
                        <button type="button" onClick={addTag} className="p-2 bg-purple-100 text-purple-600 rounded-xl hover:bg-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:hover:bg-purple-900/50 transition-colors">
                          <Plus size={18} />
                        </button>
                      </div>

                      {suggestedTags.length > 0 && (
                        <div className="mt-3 text-sm text-gray-500 dark:text-gray-400">
                          <div className="mb-1">Suggested tags:</div>
                          <div className="flex flex-wrap gap-2">
                            {suggestedTags.map(t => (
                              <button 
                                key={t} 
                                type="button" 
                                onClick={() => setFormData(prev => ({ ...prev, tags: Array.from(new Set([...prev.tags, t])) }))} 
                                className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-lg text-xs hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
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
              </form>
            </div>

            <div className="fixed bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-white/95 via-white/95 to-white/90 dark:from-gray-800/95 dark:via-gray-800/95 dark:to-gray-800/90 backdrop-blur-lg border-t border-gray-200/50 dark:border-gray-700/50">
              <div className="flex justify-between space-x-3 max-w-md mx-auto">
                <button 
                  type="button" 
                  onClick={() => { resetForm(); onClose(); }} 
                  className="px-5 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium flex-1"
                >
                  Cancel
                </button>

                <motion.button 
                  id="task-form-submit" 
                  whileHover={{ scale: 1.02 }} 
                  whileTap={{ scale: 0.98 }} 
                  type="button" 
                  onClick={() => handleSubmit()} 
                  disabled={loading} 
                  className="px-5 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 transition-colors shadow-md font-medium flex-1 flex items-center justify-center"
                >
                  {loading ? (
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : null}
                  {loading ? 'Creating...' : 'Create Task'}
                </motion.button>
              </div>
              <div className="text-center text-xs text-gray-500 dark:text-gray-400 mt-2">
                Tip: Ctrl/Cmd + Enter to submit
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};