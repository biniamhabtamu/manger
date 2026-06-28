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
  ArrowRight,
  TrendingUp,
  ListChecks,
  GripVertical,
  Edit2,
  Trash2,
  Copy,
  Star
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

interface GoalTemplate {
  id: string;
  label: string;
  icon: string;
  timeframe: Timeframe;
  totalTodos: number;
  prefix: string;
  color: string;
  emoji: string;
}

interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
  priority?: 'low' | 'medium' | 'high';
  dueDate?: string;
  notes?: string;
}

const DRAFT_KEY = 'taskFormDraft_v2';

export const TaskForm: React.FC<TaskFormProps> = ({ isOpen, onClose, category, initialDueDate }) => {
  const { addTask, tasks } = useTasks() as any;
  const [activeTab, setActiveTab] = useState<'basic' | 'advanced' | 'goal'>('basic');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: (category || ('code-tasks' as TaskCategory)) as TaskCategory,
    priority: 'medium' as Priority,
    timeframe: 'daily' as Timeframe,
    dueDate: initialDueDate ? initialDueDate.toISOString().split('T')[0] : '',
    tags: [] as string[],
    estimate: '' as string,
    isGoal: false,
    goalTodos: [] as TodoItem[],
    goalTimeframe: 'weekly' as Timeframe,
    goalColor: '#8B5CF6',
  });
  const [tagInput, setTagInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [descCount, setDescCount] = useState(0);
  const [todoInput, setTodoInput] = useState('');
  const [editingTodoId, setEditingTodoId] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<GoalTemplate | null>(null);
  const [showColorPicker, setShowColorPicker] = useState(false);

  // Drag and drop state
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const goalTemplates: GoalTemplate[] = [
    {
      id: 'daily',
      label: 'Daily Goals',
      icon: '🌅',
      timeframe: 'daily',
      totalTodos: 3,
      prefix: 'Daily',
      color: '#F59E0B',
      emoji: '⭐'
    },
    {
      id: 'weekly',
      label: 'Weekly Goals',
      icon: '📆',
      timeframe: 'weekly',
      totalTodos: 7,
      prefix: 'Week',
      color: '#8B5CF6',
      emoji: '🎯'
    },
    {
      id: 'monthly',
      label: 'Monthly Goals',
      icon: '🗓️',
      timeframe: 'monthly',
      totalTodos: 30,
      prefix: 'Month',
      color: '#3B82F6',
      emoji: '🚀'
    },
    {
      id: 'yearly',
      label: 'Yearly Goals',
      icon: '📋',
      timeframe: 'yearly',
      totalTodos: 12,
      prefix: 'Year',
      color: '#10B981',
      emoji: '🏆'
    },
  ];

  const colorOptions = [
    '#8B5CF6', '#3B82F6', '#10B981', '#F59E0B', '#EF4444',
    '#EC4899', '#8B5CF6', '#06B6D4', '#F97316', '#14B8A6'
  ];

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
      isGoal: false,
      goalTodos: [],
      goalTimeframe: 'weekly' as Timeframe,
      goalColor: '#8B5CF6',
    });
    setTagInput('');
    setDescCount(0);
    setTodoInput('');
    setEditingTodoId(null);
    setSelectedTemplate(null);
    setDraggedIndex(null);
    setDragOverIndex(null);
    localStorage.removeItem(DRAFT_KEY);
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();

    if (formData.isGoal) {
      const validTodos = formData.goalTodos.filter(t => t.text.trim());

      if (validTodos.length === 0) {
        toast.error('Please add at least one todo to your goal');
        return;
      }

      setLoading(true);
      try {
        const goalTitle = formData.title.trim() || `${formData.goalTimeframe} Goals`;

        // Create subtasks from todos
        const subtasks = validTodos.map((todo, index) => ({
          id: `subtask-${Date.now()}-${index}-${Math.random().toString(36).substr(2, 9)}`,
          title: todo.text,
          done: todo.completed,
          priority: todo.priority || 'medium',
        }));

        // Create a single goal task with subtasks
        await addTask({
          title: goalTitle,
          description: formData.description.trim() + `\n\n🎯 Goal: ${formData.goalTimeframe} goal with ${validTodos.length} todos`,
          category: formData.category,
          priority: formData.priority,
          status: 'todo',
          timeframe: formData.goalTimeframe,
          dueDate: formData.dueDate ? new Date(formData.dueDate) : undefined,
          tags: [...formData.tags, 'goal', formData.goalTimeframe, `goal-color-${formData.goalColor.replace('#', '')}`],
          subtasks: subtasks,
          estimate: formData.estimate ? Number(formData.estimate) : undefined,
        });

        toast.success(`🎯 Created goal "${goalTitle}" with ${validTodos.length} todos!`);
        resetForm();
        onClose();
      } catch (error) {
        toast.error('Failed to create goal');
      } finally {
        setLoading(false);
      }
    } else {
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

  // Goal todo management functions
  const addGoalTodo = () => {
    const text = todoInput.trim();
    if (!text) return;

    if (editingTodoId) {
      setFormData(prev => ({
        ...prev,
        goalTodos: prev.goalTodos.map(todo =>
          todo.id === editingTodoId ? { ...todo, text } : todo
        )
      }));
      setEditingTodoId(null);
    } else {
      const newTodo: TodoItem = {
        id: `todo-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        text,
        completed: false,
        priority: 'medium',
      };
      setFormData(prev => ({
        ...prev,
        goalTodos: [...prev.goalTodos, newTodo]
      }));
    }
    setTodoInput('');
  };

  const removeGoalTodo = (id: string) => {
    setFormData(prev => ({
      ...prev,
      goalTodos: prev.goalTodos.filter(todo => todo.id !== id)
    }));
  };

  const editGoalTodo = (todo: TodoItem) => {
    setTodoInput(todo.text);
    setEditingTodoId(todo.id);
  };

  const toggleGoalTodoComplete = (id: string) => {
    setFormData(prev => ({
      ...prev,
      goalTodos: prev.goalTodos.map(todo =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    }));
  };

  const updateTodoPriority = (id: string, priority: 'low' | 'medium' | 'high') => {
    setFormData(prev => ({
      ...prev,
      goalTodos: prev.goalTodos.map(todo =>
        todo.id === id ? { ...todo, priority } : todo
      )
    }));
  };

  const duplicateTodo = (todo: TodoItem) => {
    const newTodo: TodoItem = {
      ...todo,
      id: `todo-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      text: `${todo.text} (copy)`,
      completed: false,
    };
    setFormData(prev => ({
      ...prev,
      goalTodos: [...prev.goalTodos, newTodo]
    }));
    toast.success('Todo duplicated!');
  };

  const selectGoalTemplate = (template: GoalTemplate) => {
    const todos: TodoItem[] = Array.from({ length: template.totalTodos }, (_, i) => ({
      id: `todo-${Date.now()}-${i}-${Math.random().toString(36).substr(2, 9)}`,
      text: `${template.prefix} Goal ${i + 1}`,
      completed: false,
      priority: 'medium' as const,
    }));

    setFormData(prev => ({
      ...prev,
      isGoal: true,
      goalTimeframe: template.timeframe,
      goalTodos: todos,
      title: `${template.prefix} ${template.label}`,
      goalColor: template.color,
    }));
    setSelectedTemplate(template);
    setTodoInput('');
    setEditingTodoId(null);
  };

  const quickFillTemplate = () => {
    if (!selectedTemplate) return;

    const hasExistingTodos = formData.goalTodos.some(t => t.text.trim());
    if (hasExistingTodos) {
      toast.error('Clear existing todos first or add them manually');
      return;
    }

    const todos: TodoItem[] = Array.from({ length: selectedTemplate.totalTodos }, (_, i) => ({
      id: `todo-${Date.now()}-${i}-${Math.random().toString(36).substr(2, 9)}`,
      text: `${selectedTemplate.prefix} Goal ${i + 1}`,
      completed: false,
      priority: 'medium' as const,
    }));

    setFormData(prev => ({
      ...prev,
      goalTodos: todos
    }));
  };

  const clearAllTodos = () => {
    setFormData(prev => ({
      ...prev,
      goalTodos: []
    }));
    toast('All todos cleared');
  };

  const getTotalTodosForTimeframe = (timeframe: Timeframe) => {
    const template = goalTemplates.find(t => t.timeframe === timeframe);
    return template?.totalTodos || 7;
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      case 'high': return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400';
      case 'medium': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  // Custom drag and drop handlers
  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDragOverIndex(index);
  };

  const handleDragEnd = () => {
    if (draggedIndex !== null && dragOverIndex !== null && draggedIndex !== dragOverIndex) {
      const items = Array.from(formData.goalTodos);
      const [draggedItem] = items.splice(draggedIndex, 1);
      items.splice(dragOverIndex, 0, draggedItem);
      setFormData(prev => ({ ...prev, goalTodos: items }));
    }
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-end justify-center z-[100]">
          <motion.div
            initial={{ opacity: 0, y: '100%' }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="bg-white dark:bg-gray-900 rounded-t-3xl shadow-2xl w-full max-w-md max-h-[92vh] overflow-hidden relative"
          >
            <div className="w-12 h-1 bg-gray-300 dark:bg-gray-600 rounded-full mx-auto mt-2 flex-shrink-0" />

            {/* Header */}
            <div className="sticky top-0 bg-white dark:bg-gray-900 pt-3 px-5 pb-3 border-b border-gray-100 dark:border-gray-800 z-10">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <Sparkles size={20} className="text-purple-500" />
                    {formData.isGoal ? '🎯 Create Goal' : '✨ New Task'}
                  </h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    {formData.isGoal ? 'Break down your goal into actionable todos' : 'Fill in the details below'}
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
                <button
                  className={`flex-1 py-2.5 px-3 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-1 ${activeTab === 'goal'
                      ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-sm'
                      : 'text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                    }`}
                  onClick={() => setActiveTab('goal')}
                >
                  <TrendingUp size={14} />
                  Goal
                </button>
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="overflow-y-auto px-5 py-4 space-y-4" style={{ maxHeight: 'calc(92vh - 200px)' }}>
              {activeTab === 'goal' ? (
                <div className="space-y-4">
                  {/* Goal Templates */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Choose Goal Template
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {goalTemplates.map((template) => (
                        <motion.button
                          key={template.id}
                          whileHover={{ scale: 1.02, y: -2 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => selectGoalTemplate(template)}
                          className={`p-4 rounded-xl border-2 transition-all text-center relative overflow-hidden ${selectedTemplate?.id === template.id
                              ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 shadow-lg'
                              : 'border-gray-200 dark:border-gray-700 hover:border-purple-300 hover:shadow-md'
                            }`}
                          style={{
                            borderColor: selectedTemplate?.id === template.id ? template.color : undefined,
                          }}
                        >
                          <div className="text-3xl mb-1">{template.icon}</div>
                          <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            {template.label}
                          </div>
                          <div className="text-xs text-gray-400 dark:text-gray-500">
                            {template.totalTodos} todos
                          </div>
                          {selectedTemplate?.id === template.id && (
                            <div className="absolute top-1 right-1">
                              <Check size={14} className="text-purple-500" />
                            </div>
                          )}
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  {formData.isGoal && (
                    <>
                      {/* Goal Title & Color */}
                      <div className="grid grid-cols-3 gap-3">
                        <div className="col-span-2">
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                            Goal Title
                          </label>
                          <input
                            type="text"
                            value={formData.title}
                            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-all"
                            placeholder="e.g., Weekly Learning Goals"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                            Color
                          </label>
                          <div className="relative">
                            <button
                              onClick={() => setShowColorPicker(!showColorPicker)}
                              className="w-full h-11 rounded-xl border-2 border-gray-200 dark:border-gray-700 flex items-center justify-center transition-all hover:border-purple-300"
                              style={{ backgroundColor: formData.goalColor }}
                            >
                              <span className="text-white text-xs font-medium">Pick</span>
                            </button>
                            {showColorPicker && (
                              <div className="absolute top-12 left-0 z-20 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-3 border border-gray-200 dark:border-gray-700 grid grid-cols-5 gap-2 w-48">
                                {colorOptions.map(color => (
                                  <button
                                    key={color}
                                    onClick={() => {
                                      setFormData(prev => ({ ...prev, goalColor: color }));
                                      setShowColorPicker(false);
                                    }}
                                    className="w-8 h-8 rounded-full transition-all hover:scale-110"
                                    style={{ backgroundColor: color }}
                                  />
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Goal Todos */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Todos ({formData.goalTodos.filter(t => t.text.trim()).length} / {getTotalTodosForTimeframe(formData.goalTimeframe)})
                          </label>
                          <div className="flex gap-2">
                            {formData.goalTodos.filter(t => t.text.trim()).length > 0 && (
                              <button
                                onClick={clearAllTodos}
                                className="text-xs text-red-500 hover:text-red-600 transition-colors"
                              >
                                Clear all
                              </button>
                            )}
                            <span className="text-xs text-gray-400">Drag to reorder</span>
                          </div>
                        </div>

                        {/* Todo Input */}
                        <div className="flex gap-2 mb-3">
                          <input
                            type="text"
                            value={todoInput}
                            onChange={(e) => setTodoInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addGoalTodo())}
                            className="flex-1 px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-all"
                            placeholder={editingTodoId ? "Edit todo..." : "Add a todo..."}
                          />
                          <motion.button
                            whileTap={{ scale: 0.95 }}
                            onClick={addGoalTodo}
                            className="px-4 py-2.5 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-xl hover:shadow-lg transition-all flex items-center gap-1"
                          >
                            {editingTodoId ? <Edit2 size={16} /> : <Plus size={16} />}
                          </motion.button>
                        </div>

                        {/* Todo List with custom Drag & Drop */}
                        <div className="space-y-2 max-h-72 overflow-y-auto custom-scrollbar">
                          {formData.goalTodos.map((todo, index) => (
                            todo.text.trim() && (
                              <motion.div
                                key={todo.id}
                                draggable
                                onDragStart={() => handleDragStart(index)}
                                onDragOver={(e) => handleDragOver(e, index)}
                                onDragEnd={handleDragEnd}
                                onDragLeave={handleDragLeave}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{
                                  opacity: 1,
                                  x: 0,
                                  scale: draggedIndex === index ? 1.05 : 1,
                                  borderColor: dragOverIndex === index ? formData.goalColor : undefined,
                                }}
                                className={`group flex items-center gap-2 p-3 rounded-xl transition-all cursor-move ${todo.completed
                                    ? 'bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800'
                                    : 'bg-gray-50 dark:bg-gray-800 hover:shadow-md'
                                  } ${draggedIndex === index ? 'shadow-xl ring-2 ring-purple-500' : ''} ${dragOverIndex === index ? 'border-2 border-dashed' : ''
                                  }`}
                                style={{
                                  borderLeft: `4px solid ${todo.completed ? '#10B981' : formData.goalColor}`
                                }}
                              >
                                {/* Drag Handle */}
                                <div className="cursor-grab text-gray-400 hover:text-gray-600">
                                  <GripVertical size={16} />
                                </div>

                                {/* Complete Checkbox */}
                                <motion.button
                                  whileTap={{ scale: 0.8 }}
                                  onClick={() => toggleGoalTodoComplete(todo.id)}
                                  className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${todo.completed
                                      ? 'bg-green-500 border-green-500 text-white'
                                      : 'border-gray-300 dark:border-gray-600 hover:border-purple-500'
                                    }`}
                                >
                                  {todo.completed && <Check size={14} />}
                                </motion.button>

                                {/* Todo Text */}
                                <div className="flex-1 min-w-0">
                                  <p className={`text-sm break-words ${todo.completed
                                      ? 'line-through text-gray-400 dark:text-gray-500'
                                      : 'text-gray-700 dark:text-gray-300'
                                    }`}>
                                    {todo.text}
                                  </p>
                                  {todo.notes && (
                                    <p className="text-xs text-gray-400 mt-0.5">📝 {todo.notes}</p>
                                  )}
                                </div>

                                {/* Priority Badge */}
                                <select
                                  value={todo.priority || 'medium'}
                                  onChange={(e) => updateTodoPriority(todo.id, e.target.value as any)}
                                  className={`text-xs rounded-full px-2 py-0.5 border-0 ${getPriorityColor(todo.priority)}`}
                                >
                                  <option value="low">🟢 Low</option>
                                  <option value="medium">🟡 Medium</option>
                                  <option value="high">🔴 High</option>
                                </select>

                                {/* Actions */}
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button
                                    onClick={() => duplicateTodo(todo)}
                                    className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                    title="Duplicate"
                                  >
                                    <Copy size={14} className="text-gray-400" />
                                  </button>
                                  <button
                                    onClick={() => editGoalTodo(todo)}
                                    className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                    title="Edit"
                                  >
                                    <Edit2 size={14} className="text-gray-400" />
                                  </button>
                                  <button
                                    onClick={() => removeGoalTodo(todo.id)}
                                    className="p-1 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                    title="Delete"
                                  >
                                    <Trash2 size={14} className="text-red-400" />
                                  </button>
                                </div>
                              </motion.div>
                            )
                          ))}
                        </div>

                        {formData.goalTodos.filter(t => t.text.trim()).length === 0 && (
                          <div className="text-center py-8 text-gray-400 dark:text-gray-500">
                            <ListChecks size={32} className="mx-auto mb-2 opacity-50" />
                            <p className="text-sm">Add todos to your goal</p>
                            <p className="text-xs">Each todo becomes a subtask</p>
                          </div>
                        )}
                      </div>

                      {/* Goal Progress */}
                      {formData.goalTodos.filter(t => t.text.trim()).length > 0 && (
                        <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/10 dark:to-blue-900/10 rounded-xl p-4 border border-purple-100 dark:border-purple-800">
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-600 dark:text-gray-300 flex items-center gap-1">
                              <Award size={16} className="text-purple-500" />
                              Progress
                            </span>
                            <span className="text-purple-600 dark:text-purple-400 font-medium">
                              {formData.goalTodos.filter(t => t.completed).length} / {formData.goalTodos.filter(t => t.text.trim()).length}
                            </span>
                          </div>
                          <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                            <motion.div
                              className="h-full rounded-full transition-all duration-500"
                              style={{
                                width: `${formData.goalTodos.filter(t => t.text.trim()).length > 0
                                  ? (formData.goalTodos.filter(t => t.completed).length / formData.goalTodos.filter(t => t.text.trim()).length) * 100
                                  : 0}%`,
                                backgroundColor: formData.goalColor
                              }}
                              initial={{ width: 0 }}
                              animate={{
                                width: `${formData.goalTodos.filter(t => t.text.trim()).length > 0
                                  ? (formData.goalTodos.filter(t => t.completed).length / formData.goalTodos.filter(t => t.text.trim()).length) * 100
                                  : 0}%`
                              }}
                            />
                          </div>
                          <div className="flex justify-between mt-2 text-xs text-gray-400">
                            <span>{formData.goalTimeframe} goal</span>
                            <span>{formData.goalTodos.filter(t => t.completed).length} completed</span>
                          </div>
                        </div>
                      )}

                      {/* Quick Add Template Todos */}
                      {selectedTemplate && formData.goalTodos.every(t => !t.text.trim()) && (
                        <motion.button
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          onClick={quickFillTemplate}
                          className="w-full py-2 text-center text-sm text-purple-600 dark:text-purple-400 hover:text-purple-700 border-2 border-dashed border-purple-300 dark:border-purple-700 rounded-xl hover:bg-purple-50 dark:hover:bg-purple-900/10 transition-colors"
                        >
                          ⚡ Quick fill template todos
                        </motion.button>
                      )}

                      {selectedTemplate && formData.goalTodos.some(t => t.text.trim()) && (
                        <p className="text-xs text-gray-400 text-center">
                          💡 Edit the todos above or clear all to use the template
                        </p>
                      )}
                    </>
                  )}
                </div>
              ) : activeTab === 'basic' ? (
                // Basic Tab Content
                <>
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

                  <div className="grid grid-cols-2 gap-3">
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
                // Advanced Tab Content
                <>
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

            {/* Bottom Actions */}
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
                      {activeTab === 'goal' && formData.isGoal ? 'Create Goal' : 'Create Task'}
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

// Also export as default for backward compatibility
export default TaskForm;