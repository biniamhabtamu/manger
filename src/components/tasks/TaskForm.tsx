import React, { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { X, Plus, Calendar, Flag, Tag, Clock } from 'lucide-react';
import { TaskCategory, Priority, Timeframe } from '../../types/task';
import { useTasks } from '../../hooks/useTasks';
import toast from 'react-hot-toast';

interface TaskFormProps {
  isOpen: boolean;
  onClose: () => void;
  category?: TaskCategory;
}

const DRAFT_KEY = 'taskFormDraft_v1';

export const TaskForm: React.FC<TaskFormProps> = ({ isOpen, onClose, category }) => {
  const { addTask, tasks } = useTasks() as any; // `tasks` optional — used for tag suggestions

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

  // Suggested tags from existing tasks (if available)
  const suggestedTags = React.useMemo(() => {
    if (!tasks || !Array.isArray(tasks)) return [] as string[];
    const map = new Map<string, number>();
    tasks.forEach((t: any) => (t.tags || []).forEach((tg: string) => map.set(tg, (map.get(tg) || 0) + 1)));
    return Array.from(map.entries()).sort((a, b) => b[1] - a[1]).map(([k]) => k).slice(0, 8);
  }, [tasks]);

  // Load draft from localStorage when opened
  useEffect(() => {
    if (!isOpen) return;
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        // Only restore if same category or no category prop given
        if (!category || parsed.category === category) {
          setFormData(prev => ({ ...prev, ...parsed }));
          setDescCount((parsed.description || '').length);
          toast('Loaded draft', { icon: '💾' });
        }
      }
    } catch (err) {
      // ignore
    }
  }, [isOpen, category]);

  // Auto-save draft to localStorage (debounced)
  useEffect(() => {
    if (!isOpen) return;
    const t = setTimeout(() => {
      try {
        const toSave = { ...formData };
        localStorage.setItem(DRAFT_KEY, JSON.stringify(toSave));
        // small visual feedback but not noisy
      } catch (err) {
        // ignore
      }
    }, 600);
    return () => clearTimeout(t);
  }, [formData, isOpen]);

  // Keyboard shortcut: Ctrl/Cmd + Enter to submit
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, y: 12, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 12, scale: 0.98 }}
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[92vh] overflow-y-auto border border-gray-200 dark:border-gray-700"
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Create New Task</h2>
            <div className="flex items-center gap-2">
              <div className="text-xs text-gray-500 dark:text-gray-400">Tip: Ctrl/Cmd + Enter to submit</div>
              <button
                onClick={() => { resetForm(); onClose(); }}
                aria-label="close"
                className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          <form onSubmit={(e) => handleSubmit(e)} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Task Title *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Enter task title"
                autoFocus
                aria-required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => { setFormData(prev => ({ ...prev, description: e.target.value })); setDescCount(e.target.value.length); }}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Describe your task..."
              />
              <div className="flex justify-between text-xs mt-1 text-gray-500 dark:text-gray-400">
                <div>Characters: {descCount}</div>
                <div className="italic">Optional — keep it concise</div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value as TaskCategory }))}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="code-tasks">Code Tasks</option>
                  <option value="learning">Learning</option>
                  <option value="relationship">Relationships</option>
                  <option value="self-development">Self Development</option>
                  <option value="project-improvement">Project Improvement</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Priority</label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value as Priority }))}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Timeframe</label>
                <select
                  value={formData.timeframe}
                  onChange={(e) => setFormData(prev => ({ ...prev, timeframe: e.target.value as Timeframe }))}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Due Date</label>
                <div className="flex gap-2">
                  <input
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                    className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                  <button type="button" onClick={() => quickDue(0)} className="px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm">Today</button>
                  <button type="button" onClick={() => quickDue(1)} className="px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm">Tomorrow</button>
                  <button type="button" onClick={() => quickDue(7)} className="px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm">+7d</button>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Estimate (hours)</label>
              <input
                type="number"
                min={0}
                step={0.5}
                value={formData.estimate}
                onChange={(e) => setFormData(prev => ({ ...prev, estimate: e.target.value }))}
                className="w-40 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="e.g. 1.5"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tags</label>

              <div className="flex flex-wrap gap-2 mb-2">
                {formData.tags.map((tag) => (
                  <span key={tag} className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                    {tag}
                    <button type="button" onClick={() => removeTag(tag)} className="ml-2 hover:text-blue-600"><X size={12} /></button>
                  </span>
                ))}
              </div>

              <div className="flex gap-2 items-center">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Add a tag and press Enter"
                  aria-label="tag input"
                />
                <button type="button" onClick={addTag} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"><Plus size={16} /></button>
              </div>

              {suggestedTags.length > 0 && (
                <div className="mt-3 text-sm text-gray-500 dark:text-gray-400">
                  Suggested: <div className="inline-flex gap-2 ml-2 flex-wrap">{suggestedTags.map(t => (
                    <button key={t} type="button" onClick={() => setFormData(prev => ({ ...prev, tags: Array.from(new Set([...prev.tags, t])) }))} className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs">{t}</button>
                  ))}</div>
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-3 pt-3">
              <button type="button" onClick={() => { resetForm(); onClose(); }} className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">Cancel</button>

              <motion.button id="task-form-submit" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="button" onClick={() => handleSubmit()} disabled={loading} className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors">
                {loading ? 'Creating...' : 'Create Task'}
              </motion.button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};
