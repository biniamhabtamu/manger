import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, Link } from 'react-router-dom';
import {
  Code,
  BookOpen,
  Heart,
  User,
  Wrench,
  Plus,
  Search,
  CheckSquare,
  Clock,
  AlertTriangle,
  Inbox,
  Filter,
  SortAsc,
  SortDesc,
  Calendar,
  Trash2,
  Download,
  Grid,
  List,
  ChevronDown,
  ChevronUp,
  BarChart3,
  Smartphone,
  Sparkles,
  X,
  ArrowLeft,
  Target,
  Flame,
  Award,
  TrendingUp,
  Eye,
  EyeOff,
  LayoutGrid,
  ListChecks,
  SlidersHorizontal,
  CheckCircle2,
  Circle,
  Zap
} from 'lucide-react';
import { useTasks } from '../hooks/useTasks';
import { TaskForm } from '../components/tasks/TaskForm';
import { TaskCard } from '../components/tasks/TaskCard';
import { TaskCategory, TaskStatus } from '../types/task';
import { BottomBar } from '../components/layout/BottomBar';

const categoryConfig = {
  'code-tasks': {
    icon: Code,
    title: 'Code Tasks',
    description: 'Programming tasks, bug fixes, and development work',
    color: 'blue',
    gradient: 'from-blue-500 to-blue-600',
    emoji: '💻',
    bgLight: 'bg-blue-50 dark:bg-blue-900/20'
  },
  'learning': {
    icon: BookOpen,
    title: 'Learning',
    description: 'Educational goals, courses, and skill development',
    color: 'green',
    gradient: 'from-green-500 to-green-600',
    emoji: '📚',
    bgLight: 'bg-green-50 dark:bg-green-900/20'
  },
  'relationship': {
    icon: Heart,
    title: 'Relationships',
    description: 'Personal connections and social activities',
    color: 'red',
    gradient: 'from-red-500 to-red-600',
    emoji: '❤️',
    bgLight: 'bg-red-50 dark:bg-red-900/20'
  },
  'self-development': {
    icon: User,
    title: 'Self Development',
    description: 'Personal growth and improvement goals',
    color: 'purple',
    gradient: 'from-purple-500 to-purple-600',
    emoji: '🧠',
    bgLight: 'bg-purple-50 dark:bg-purple-900/20'
  },
  'project-improvement': {
    icon: Wrench,
    title: 'Project Improvement',
    description: 'Enhancements and optimizations for existing projects',
    color: 'orange',
    gradient: 'from-orange-500 to-orange-600',
    emoji: '🚀',
    bgLight: 'bg-orange-50 dark:bg-orange-900/20'
  }
};

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

const statusFilters: { value: 'all' | TaskStatus; label: string; icon: React.ReactNode; color?: string }[] = [
  { value: 'all', label: 'All', icon: <LayoutGrid size={14} /> },
  { value: 'todo', label: 'To Do', icon: <Circle size={14} /> },
  { value: 'in-progress', label: 'Progress', icon: <Clock size={14} /> },
  { value: 'completed', label: 'Done', icon: <CheckCircle2 size={14} /> },
];

const sortOptions = [
  { value: 'dueDate-asc', label: 'Soonest Due', icon: <SortAsc size={14} /> },
  { value: 'dueDate-desc', label: 'Latest Due', icon: <SortDesc size={14} /> },
  { value: 'title-asc', label: 'A-Z', icon: <SortAsc size={14} /> },
  { value: 'title-desc', label: 'Z-A', icon: <SortDesc size={14} /> },
];

// Skeleton Loader - Native Style
const CategoriesSkeleton: React.FC = () => {
  const { category } = useParams<{ category: string }>();

  if (!category) {
    return (
      <div className="min-h-screen bg-[#f8fafc] dark:bg-[#0f172a] pb-24">
        <div className="px-4 pt-6 space-y-4">
          <div className="animate-pulse">
            <div className="h-7 w-40 bg-gray-200 dark:bg-gray-700 rounded-xl mx-auto"></div>
            <div className="h-4 w-56 bg-gray-200 dark:bg-gray-700 rounded-lg mx-auto mt-1"></div>
          </div>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="bg-white dark:bg-[#1e293b] rounded-2xl p-4 border border-gray-100 dark:border-gray-700/50 animate-pulse">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gray-200 dark:bg-gray-700"></div>
                  <div className="flex-1">
                    <div className="h-4 w-3/4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    <div className="h-3 w-1/2 bg-gray-200 dark:bg-gray-700 rounded mt-1"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#0f172a] pb-24">
      <div className="animate-pulse">
        <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded-b-3xl"></div>
        <div className="px-4 pt-4 space-y-4">
          <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded-2xl"></div>
          <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded-2xl"></div>
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-20 bg-gray-200 dark:bg-gray-700 rounded-2xl"></div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const Categories: React.FC = () => {
  const { category } = useParams<{ category: string }>();
  const { tasks, loading, updateTask, deleteTask } = useTasks();
  const [searchTerm, setSearchTerm] = useState('');
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<'all' | TaskStatus>('all');
  const [sortBy, setSortBy] = useState('dueDate-asc');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [selectedTasks, setSelectedTasks] = useState<Set<string>>(new Set());
  const [pagination, setPagination] = useState({ page: 1, perPage: 10 });
  const [showFilters, setShowFilters] = useState(false);
  const [isDelayedLoading, setIsDelayedLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsDelayedLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  const currentCategory = category as TaskCategory;
  const config = currentCategory ? categoryConfig[currentCategory] : null;

  let filteredTasks = tasks.filter(task => {
    const matchesCategory = !currentCategory || task.category === currentCategory;
    const matchesSearch =
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (task.description && task.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = selectedStatus === 'all' || task.status === selectedStatus;
    return matchesCategory && matchesSearch && matchesStatus;
  });

  filteredTasks = [...filteredTasks].sort((a, b) => {
    if (sortBy === 'dueDate-asc') {
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return a.dueDate.getTime() - b.dueDate.getTime();
    } else if (sortBy === 'dueDate-desc') {
      if (!a.dueDate) return -1;
      if (!b.dueDate) return 1;
      return b.dueDate.getTime() - a.dueDate.getTime();
    } else if (sortBy === 'title-asc') {
      return a.title.localeCompare(b.title);
    } else if (sortBy === 'title-desc') {
      return b.title.localeCompare(a.title);
    }
    return 0;
  });

  const paginatedTasks = filteredTasks.slice(
    (pagination.page - 1) * pagination.perPage,
    pagination.page * pagination.perPage
  );

  const totalPages = Math.ceil(filteredTasks.length / pagination.perPage);

  const categoryStats = currentCategory
    ? {
      total: tasks.filter(t => t.category === currentCategory).length,
      completed: tasks.filter(t => t.category === currentCategory && t.status === 'completed').length,
      inProgress: tasks.filter(t => t.category === currentCategory && t.status === 'in-progress').length,
      overdue: tasks.filter(
        t =>
          t.category === currentCategory &&
          t.dueDate &&
          t.dueDate < new Date() &&
          t.status !== 'completed'
      ).length,
    }
    : null;

  if (loading || isDelayedLoading) {
    return <CategoriesSkeleton />;
  }

  // All Categories Overview
  if (!currentCategory) {
    return (
      <>
        <div className="min-h-screen bg-[#f8fafc] dark:bg-[#0f172a] pb-24">
          <div className="h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
          <div className="px-4 pt-4">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center shadow-lg shadow-blue-500/25">
                  <LayoutGrid size={18} className="text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-gray-900 dark:text-white">Categories</h1>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400">Organize your tasks by category</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-2.5"
            >
              {Object.entries(categoryConfig).map(([key, config], index) => {
                const categoryTasks = tasks.filter(t => t.category === key);
                const completedTasks = categoryTasks.filter(t => t.status === 'completed');
                const completionRate =
                  categoryTasks.length > 0 ? Math.round((completedTasks.length / categoryTasks.length) * 100) : 0;

                return (
                  <motion.div
                    key={key}
                    variants={itemVariants}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    className="bg-white dark:bg-[#1e293b] rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/50 overflow-hidden"
                  >
                    <Link to={`/tasks/${key}`} className="block">
                      <div className="p-3.5">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${config.gradient} flex items-center justify-center text-xl shadow-lg`}>
                            {config.emoji}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-sm text-gray-900 dark:text-white">{config.title}</h3>
                            <p className="text-[10px] text-gray-500 dark:text-gray-400 truncate">{config.description}</p>
                          </div>
                          <div className="text-right">
                            <span className="text-lg font-bold text-gray-900 dark:text-white">{categoryTasks.length}</span>
                            <div className="text-[9px] text-gray-400">tasks</div>
                          </div>
                        </div>

                        <div className="mt-2.5">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-[10px] text-gray-500 dark:text-gray-400">Progress</span>
                            <span className="text-[10px] font-semibold text-gray-700 dark:text-gray-300">{completionRate}%</span>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${completionRate}%` }}
                              transition={{ duration: 0.8, ease: 'easeOut' }}
                              className={`bg-gradient-to-r ${config.gradient} h-1.5 rounded-full`}
                            />
                          </div>
                        </div>

                        <div className="flex justify-around mt-2.5 pt-2 border-t border-gray-100 dark:border-gray-700">
                          <div className="text-center">
                            <div className="text-sm font-bold text-emerald-500">{completedTasks.length}</div>
                            <div className="text-[9px] text-gray-400">Done</div>
                          </div>
                          <div className="text-center">
                            <div className="text-sm font-bold text-amber-500">
                              {categoryTasks.filter(t => t.status === 'in-progress').length}
                            </div>
                            <div className="text-[9px] text-gray-400">Progress</div>
                          </div>
                          <div className="text-center">
                            <div className="text-sm font-bold text-blue-500">
                              {categoryTasks.filter(t => t.status === 'todo').length}
                            </div>
                            <div className="text-[9px] text-gray-400">Todo</div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </motion.div>
          </div>
        </div>
        <BottomBar onTaskFormOpen={() => setShowTaskForm(true)} />
      </>
    );
  }

  // Category Detail View
  return (
    <>
      <div className="min-h-screen bg-[#f8fafc] dark:bg-[#0f172a] pb-24">
        {/* Category Header - Native Style */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`bg-gradient-to-br ${config!.gradient} px-4 pt-6 pb-4 text-white relative overflow-hidden`}
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full -ml-24 -mb-24"></div>

          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-3">
              <Link
                to="/categories"
                className="p-2 rounded-xl bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-colors"
              >
                <ArrowLeft size={20} />
              </Link>
              <span className="text-3xl">{config!.emoji}</span>
              <div className="flex-1">
                <h1 className="text-lg font-bold">{config!.title}</h1>
                <p className="text-white/80 text-[10px]">{config!.description}</p>
              </div>
              <button
                onClick={() => setShowTaskForm(true)}
                className="p-2 rounded-xl bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-colors"
              >
                <Plus size={20} />
              </button>
            </div>

            {/* Stats - Native Cards */}
            {categoryStats && (
              <div className="grid grid-cols-4 gap-1.5 mt-3">
                <div className="bg-white/10 backdrop-blur-md rounded-xl p-2 text-center">
                  <div className="text-lg font-bold">{categoryStats.total}</div>
                  <div className="text-[9px] text-white/70">Total</div>
                </div>
                <div className="bg-white/10 backdrop-blur-md rounded-xl p-2 text-center">
                  <div className="text-lg font-bold text-green-300">{categoryStats.completed}</div>
                  <div className="text-[9px] text-white/70">Done</div>
                </div>
                <div className="bg-white/10 backdrop-blur-md rounded-xl p-2 text-center">
                  <div className="text-lg font-bold text-yellow-300">{categoryStats.inProgress}</div>
                  <div className="text-[9px] text-white/70">Progress</div>
                </div>
                <div className="bg-white/10 backdrop-blur-md rounded-xl p-2 text-center">
                  <div className="text-lg font-bold text-red-300">{categoryStats.overdue}</div>
                  <div className="text-[9px] text-white/70">Overdue</div>
                </div>
              </div>
            )}
          </div>
        </motion.div>

        <div className="px-4 pt-3 space-y-3">
          {/* Search - Native Style */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="search"
              placeholder="Search tasks..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1e293b] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-transparent text-sm shadow-sm"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 p-0.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <X size={14} className="text-gray-400" />
              </button>
            )}
          </div>

          {/* Filter Toggle - Native Style */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowFilters(!showFilters)}
            className={`w-full flex items-center justify-between p-3 rounded-2xl border transition-all ${showFilters
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1e293b]'
              }`}
          >
            <div className="flex items-center gap-2.5">
              <div className={`p-1.5 rounded-lg ${showFilters ? 'bg-blue-500 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-500'}`}>
                <SlidersHorizontal size={14} />
              </div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Filters & Sort</span>
              {(selectedStatus !== 'all' || sortBy !== 'dueDate-asc') && (
                <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
              )}
            </div>
            <ChevronDown size={18} className={`text-gray-400 transition-transform duration-300 ${showFilters ? 'rotate-180' : ''}`} />
          </motion.button>

          {/* Filters Panel - Native Style */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="bg-white dark:bg-[#1e293b] rounded-2xl p-4 border border-gray-200 dark:border-gray-700 space-y-4 shadow-lg">
                  {/* Status Filters */}
                  <div>
                    <p className="text-[10px] font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Status</p>
                    <div className="flex flex-wrap gap-1.5">
                      {statusFilters.map(filter => (
                        <motion.button
                          key={filter.value}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setSelectedStatus(filter.value)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 ${selectedStatus === filter.value
                              ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg shadow-blue-500/30'
                              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                            }`}
                        >
                          {filter.icon}
                          {filter.label}
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  {/* Sort Options */}
                  <div>
                    <p className="text-[10px] font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Sort by</p>
                    <div className="flex flex-wrap gap-1.5">
                      {sortOptions.map(option => (
                        <motion.button
                          key={option.value}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setSortBy(option.value)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 ${sortBy === option.value
                              ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg shadow-blue-500/30'
                              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                            }`}
                        >
                          {option.icon}
                          {option.label}
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  {/* View Mode */}
                  <div>
                    <p className="text-[10px] font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">View</p>
                    <div className="flex gap-1.5">
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setViewMode('list')}
                        className={`flex-1 py-2 rounded-xl text-xs font-medium transition-all flex items-center justify-center gap-1.5 ${viewMode === 'list'
                            ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg shadow-blue-500/30'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                          }`}
                      >
                        <List size={14} />
                        List
                      </motion.button>
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setViewMode('grid')}
                        className={`flex-1 py-2 rounded-xl text-xs font-medium transition-all flex items-center justify-center gap-1.5 ${viewMode === 'grid'
                            ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg shadow-blue-500/30'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                          }`}
                      >
                        <Grid size={14} />
                        Grid
                      </motion.button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Bulk Actions - Native Style */}
          {selectedTasks.size > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 rounded-2xl p-3 border border-yellow-200 dark:border-yellow-800"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-yellow-800 dark:text-yellow-200 flex items-center gap-2">
                  <CheckSquare size={16} />
                  {selectedTasks.size} selected
                </span>
                <div className="flex gap-1.5">
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => {
                      selectedTasks.forEach(id => {
                        const task = tasks.find(t => t.id === id);
                        if (task) updateTask({ ...task, status: 'completed' });
                      });
                      setSelectedTasks(new Set());
                    }}
                    className="px-3 py-1.5 bg-emerald-500 text-white rounded-xl text-xs font-medium flex items-center gap-1 hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/30"
                  >
                    <CheckCircle2 size={12} />
                    Complete
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => {
                      selectedTasks.forEach(id => deleteTask(id));
                      setSelectedTasks(new Set());
                    }}
                    className="px-3 py-1.5 bg-rose-500 text-white rounded-xl text-xs font-medium flex items-center gap-1 hover:bg-rose-600 transition-all shadow-lg shadow-rose-500/30"
                  >
                    <Trash2 size={12} />
                    Delete
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setSelectedTasks(new Set())}
                    className="px-3 py-1.5 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl text-xs font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-all"
                  >
                    <X size={12} />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Task List - Native Style */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className={viewMode === 'grid' ? 'grid grid-cols-1 gap-2.5' : 'space-y-2.5'}
          >
            <AnimatePresence mode="wait">
              {filteredTasks.length === 0 ? (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="text-center py-16 bg-white/50 dark:bg-[#1e293b]/50 rounded-3xl border border-gray-100 dark:border-gray-700"
                >
                  <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Inbox size={32} className="text-gray-400" />
                  </div>
                  <h3 className="text-base font-bold text-gray-900 dark:text-white">
                    No tasks found
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {tasks.filter(t => t.category === currentCategory).length === 0
                      ? `Create your first ${config!.title.toLowerCase()} task`
                      : 'Try adjusting your search or filters'}
                  </p>
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setShowTaskForm(true)}
                    className={`mt-4 px-5 py-2.5 bg-gradient-to-r ${config!.gradient} text-white rounded-xl text-xs font-medium flex items-center gap-2 mx-auto shadow-lg hover:shadow-xl transition-all`}
                  >
                    <Plus size={14} />
                    Add Task
                  </motion.button>
                </motion.div>
              ) : (
                paginatedTasks.map((task, index) => (
                  <motion.div
                    key={task.id}
                    variants={itemVariants}
                    className={viewMode === 'grid' ? 'col-span-1' : ''}
                  >
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={selectedTasks.has(task.id)}
                        onChange={() => {
                          const newSet = new Set(selectedTasks);
                          if (newSet.has(task.id)) newSet.delete(task.id);
                          else newSet.add(task.id);
                          setSelectedTasks(newSet);
                        }}
                        className="absolute top-3 left-3 z-10 w-4 h-4 rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 checked:bg-blue-500 checked:border-blue-500 focus:ring-2 focus:ring-blue-500/30 transition-all cursor-pointer"
                      />
                      <div className="pl-8">
                        <TaskCard task={task} index={index} compact />
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </motion.div>

          {/* Pagination - Native Style */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between bg-white dark:bg-[#1e293b] rounded-2xl p-2 border border-gray-200 dark:border-gray-700">
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                disabled={pagination.page === 1}
                className="px-4 py-2 rounded-xl disabled:opacity-50 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                Previous
              </motion.button>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {pagination.page} / {totalPages}
              </span>
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => setPagination(prev => ({ ...prev, page: Math.min(totalPages, prev.page + 1) }))}
                disabled={pagination.page === totalPages}
                className="px-4 py-2 rounded-xl disabled:opacity-50 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                Next
              </motion.button>
            </div>
          )}

          {/* Stats Summary - Native */}
          {filteredTasks.length > 0 && (
            <div className="flex items-center justify-between px-3 py-2.5 bg-white/80 dark:bg-[#1e293b]/80 rounded-2xl border border-gray-100 dark:border-gray-700">
              <div className="flex items-center gap-2.5 text-[10px] text-gray-500 dark:text-gray-400">
                <span className="font-medium text-gray-700 dark:text-gray-300">{filteredTasks.length}</span>
                <span>tasks</span>
                <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-600"></span>
                <span className="text-emerald-500">{filteredTasks.filter(t => t.status === 'completed').length}</span>
                <span>done</span>
                <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-600"></span>
                <span className="text-amber-500">{filteredTasks.filter(t => t.status === 'in-progress').length}</span>
                <span>progress</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-12 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500"
                    style={{
                      width: `${filteredTasks.length > 0
                        ? (filteredTasks.filter(t => t.status === 'completed').length / filteredTasks.length) * 100
                        : 0}%`
                    }}
                  />
                </div>
                <span className="text-[10px] font-medium text-gray-700 dark:text-gray-300">
                  {filteredTasks.length > 0
                    ? Math.round((filteredTasks.filter(t => t.status === 'completed').length / filteredTasks.length) * 100)
                    : 0}%
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Task Form */}
        <TaskForm
          isOpen={showTaskForm}
          onClose={() => setShowTaskForm(false)}
          category={currentCategory}
        />
      </div>
      <BottomBar onTaskFormOpen={() => setShowTaskForm(true)} />
    </>
  );
};