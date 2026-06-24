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
  ArrowLeft
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
    emoji: '💻'
  },
  'learning': {
    icon: BookOpen,
    title: 'Learning',
    description: 'Educational goals, courses, and skill development',
    color: 'green',
    gradient: 'from-green-500 to-green-600',
    emoji: '📚'
  },
  'relationship': {
    icon: Heart,
    title: 'Relationships',
    description: 'Personal connections and social activities',
    color: 'red',
    gradient: 'from-red-500 to-red-600',
    emoji: '❤️'
  },
  'self-development': {
    icon: User,
    title: 'Self Development',
    description: 'Personal growth and improvement goals',
    color: 'purple',
    gradient: 'from-purple-500 to-purple-600',
    emoji: '🧠'
  },
  'project-improvement': {
    icon: Wrench,
    title: 'Project Improvement',
    description: 'Enhancements and optimizations for existing projects',
    color: 'orange',
    gradient: 'from-orange-500 to-orange-600',
    emoji: '🚀'
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

const statusFilters: { value: 'all' | TaskStatus; label: string; icon: React.ReactNode }[] = [
  { value: 'all', label: 'All', icon: <Inbox size={16} /> },
  { value: 'todo', label: 'To Do', icon: <CheckSquare size={16} /> },
  { value: 'in-progress', label: 'In Progress', icon: <Clock size={16} /> },
  { value: 'completed', label: 'Completed', icon: <CheckSquare size={16} className="text-green-500" /> },
];

const sortOptions = [
  { value: 'dueDate-asc', label: 'Due Date (Soonest)', icon: <SortAsc size={16} /> },
  { value: 'dueDate-desc', label: 'Due Date (Latest)', icon: <SortDesc size={16} /> },
  { value: 'title-asc', label: 'Title (A-Z)', icon: <SortAsc size={16} /> },
  { value: 'title-desc', label: 'Title (Z-A)', icon: <SortDesc size={16} /> },
];

// Skeleton Loader
const CategoriesSkeleton: React.FC = () => {
  const CategoryCardSkeleton = () => (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 animate-pulse overflow-hidden">
      <div className="bg-gray-200 dark:bg-gray-700 p-5 h-40">
        <div className="h-8 w-8 rounded-full bg-gray-300 dark:bg-gray-600 mb-3"></div>
        <div className="h-6 w-3/4 bg-gray-300 dark:bg-gray-600 rounded mb-2"></div>
        <div className="h-4 w-full bg-gray-300 dark:bg-gray-600 rounded"></div>
      </div>
      <div className="p-4">
        <div className="h-4 w-1/2 bg-gray-200 dark:bg-gray-600 rounded mb-2"></div>
        <div className="h-2 w-full bg-gray-200 dark:bg-gray-600 rounded-full"></div>
      </div>
    </div>
  );

  const TaskCardSkeleton = () => (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-3 shadow-sm border border-gray-100 dark:border-gray-700 animate-pulse">
      <div className="flex justify-between items-start">
        <div className="flex-1 min-w-0 space-y-2">
          <div className="h-4 w-3/4 bg-gray-200 dark:bg-gray-600 rounded"></div>
          <div className="h-3 w-1/2 bg-gray-200 dark:bg-gray-600 rounded"></div>
        </div>
        <div className="h-4 w-4 bg-gray-200 dark:bg-gray-600 rounded-full"></div>
      </div>
    </div>
  );

  const { category } = useParams<{ category: string }>();

  if (!category) {
    return (
      <div className="p-4 space-y-6 bg-gradient-to-b from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 min-h-screen pb-24">
        <div className="h-8 w-64 mx-auto bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse mb-4"></div>
        <div className="grid grid-cols-1 gap-4">
          {[1, 2, 3, 4, 5].map(i => <CategoryCardSkeleton key={i} />)}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 pb-24">
      <div className="bg-gray-200 dark:bg-gray-700 h-48 rounded-b-3xl animate-pulse"></div>
      <div className="p-4 space-y-4">
        <div className="h-12 w-full bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse"></div>
        <div className="h-24 w-full bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse"></div>
        <div className="space-y-3">
          {[1, 2, 3, 4].map(i => <TaskCardSkeleton key={i} />)}
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
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [showFilters, setShowFilters] = useState(false);
  const [showSort, setShowSort] = useState(false);
  const [isDelayedLoading, setIsDelayedLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsDelayedLoading(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const currentCategory = category as TaskCategory;
  const config = currentCategory ? categoryConfig[currentCategory] : null;

  let filteredTasks = tasks.filter(task => {
    const matchesCategory = !currentCategory || task.category === currentCategory;
    const matchesSearch =
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.description.toLowerCase().includes(searchTerm.toLowerCase());
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
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 pb-24">
          <div className="p-4 pt-6">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-6"
            >
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Categories
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Organize your tasks by category
              </p>
            </motion.div>

            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 gap-3"
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
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden"
                  >
                    <Link to={`/tasks/${key}`} className="block h-full">
                      <div className={`bg-gradient-to-br ${config.gradient} p-4 text-white relative overflow-hidden`}>
                        <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12"></div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">{config.emoji}</span>
                            <div>
                              <h3 className="text-base font-semibold">{config.title}</h3>
                              <p className="text-white/70 text-xs">{config.description}</p>
                            </div>
                          </div>
                          <span className="text-lg font-bold">{categoryTasks.length}</span>
                        </div>
                      </div>

                      <div className="p-3">
                        <div className="flex justify-between items-center mb-1.5">
                          <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Progress</span>
                          <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">{completionRate}%</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${completionRate}%` }}
                            transition={{ duration: 0.8, ease: 'easeOut' }}
                            className={`bg-gradient-to-r ${config.gradient} h-1.5 rounded-full`}
                          />
                        </div>

                        <div className="flex justify-around mt-3 text-center">
                          <div>
                            <div className="text-sm font-semibold text-gray-700 dark:text-gray-300">{completedTasks.length}</div>
                            <div className="text-[10px] text-gray-500 dark:text-gray-400">Done</div>
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                              {categoryTasks.filter(t => t.status === 'in-progress').length}
                            </div>
                            <div className="text-[10px] text-gray-500 dark:text-gray-400">Progress</div>
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                              {categoryTasks.filter(t => t.status === 'todo').length}
                            </div>
                            <div className="text-[10px] text-gray-500 dark:text-gray-400">Todo</div>
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
        {/* BottomBar - rendered outside the main content */}
        <BottomBar onTaskFormOpen={() => setShowTaskForm(true)} />
      </>
    );
  }

  // Category Detail View
  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 pb-24">
        {/* Category Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`bg-gradient-to-br ${config!.gradient} px-4 pt-8 pb-4 text-white shadow-lg relative overflow-hidden`}
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-xl"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-3">
              <Link to="/categories" className="p-2 bg-white/20 rounded-xl backdrop-blur-sm hover:bg-white/30 transition-colors">
                <ArrowLeft size={20} />
              </Link>
              <span className="text-3xl">{config!.emoji}</span>
              <div>
                <h1 className="text-xl font-bold">{config!.title}</h1>
                <p className="text-white/80 text-xs">{config!.description}</p>
              </div>
            </div>

            {/* Stats */}
            {categoryStats && (
              <div className="grid grid-cols-4 gap-2 mt-3">
                <div className="bg-white/10 backdrop-blur-md p-2 rounded-xl text-center">
                  <div className="text-lg font-bold">{categoryStats.total}</div>
                  <div className="text-[10px] text-white/80">Total</div>
                </div>
                <div className="bg-white/10 backdrop-blur-md p-2 rounded-xl text-center">
                  <div className="text-lg font-bold text-green-300">{categoryStats.completed}</div>
                  <div className="text-[10px] text-white/80">Done</div>
                </div>
                <div className="bg-white/10 backdrop-blur-md p-2 rounded-xl text-center">
                  <div className="text-lg font-bold text-yellow-300">{categoryStats.inProgress}</div>
                  <div className="text-[10px] text-white/80">Progress</div>
                </div>
                <div className="bg-white/10 backdrop-blur-md p-2 rounded-xl text-center">
                  <div className="text-lg font-bold text-red-300">{categoryStats.overdue}</div>
                  <div className="text-[10px] text-white/80">Overdue</div>
                </div>
              </div>
            )}
          </div>
        </motion.div>

        <div className="p-4 space-y-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="search"
              placeholder="Search tasks..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
          </div>

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all ${showFilters
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
              : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
              }`}
          >
            <div className="flex items-center gap-2">
              <Filter size={18} className="text-gray-500" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Filters & Sort</span>
              {(selectedStatus !== 'all' || sortBy !== 'dueDate-asc') && (
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
              )}
            </div>
            <ChevronDown size={18} className={`text-gray-400 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </button>

          {/* Filters Panel */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="bg-white dark:bg-gray-800 rounded-xl p-3 border border-gray-200 dark:border-gray-700 space-y-3">
                  {/* Status Filters */}
                  <div>
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Status</p>
                    <div className="flex flex-wrap gap-1.5">
                      {statusFilters.map(filter => (
                        <button
                          key={filter.value}
                          onClick={() => setSelectedStatus(filter.value)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${selectedStatus === filter.value
                            ? 'bg-blue-500 text-white shadow-md'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                            }`}
                        >
                          {filter.icon}
                          {filter.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Sort Options */}
                  <div>
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Sort by</p>
                    <div className="flex flex-wrap gap-1.5">
                      {sortOptions.map(option => (
                        <button
                          key={option.value}
                          onClick={() => setSortBy(option.value)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${sortBy === option.value
                            ? 'bg-blue-500 text-white shadow-md'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                            }`}
                        >
                          {option.icon}
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* View Mode */}
                  <div>
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">View</p>
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => setViewMode('list')}
                        className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${viewMode === 'list'
                          ? 'bg-blue-500 text-white shadow-md'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                          }`}
                      >
                        <List size={14} />
                        List
                      </button>
                      <button
                        onClick={() => setViewMode('grid')}
                        className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${viewMode === 'grid'
                          ? 'bg-blue-500 text-white shadow-md'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                          }`}
                      >
                        <Grid size={14} />
                        Grid
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Bulk Actions */}
          {selectedTasks.size > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-xl border border-yellow-200 dark:border-yellow-800"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                  {selectedTasks.size} selected
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      selectedTasks.forEach(id => {
                        const task = tasks.find(t => t.id === id);
                        if (task) updateTask({ ...task, status: 'completed' });
                      });
                      setSelectedTasks(new Set());
                    }}
                    className="px-3 py-1 bg-green-500 text-white rounded-lg text-xs font-medium flex items-center gap-1"
                  >
                    <CheckSquare size={12} />
                    Complete
                  </button>
                  <button
                    onClick={() => {
                      selectedTasks.forEach(id => deleteTask(id));
                      setSelectedTasks(new Set());
                    }}
                    className="px-3 py-1 bg-red-500 text-white rounded-lg text-xs font-medium flex items-center gap-1"
                  >
                    <Trash2 size={12} />
                    Delete
                  </button>
                  <button
                    onClick={() => setSelectedTasks(new Set())}
                    className="px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-xs font-medium"
                  >
                    <X size={12} />
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Task List */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className={viewMode === 'grid' ? 'grid grid-cols-1 gap-3' : 'space-y-2.5'}
          >
            <AnimatePresence mode="wait">
              {filteredTasks.length === 0 ? (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="text-center py-16"
                >
                  <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Inbox size={32} className="text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    No tasks found
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {tasks.filter(t => t.category === currentCategory).length === 0
                      ? `Create your first ${config!.title.toLowerCase()} task`
                      : 'Try adjusting your search or filters'}
                  </p>
                  <button
                    onClick={() => setShowTaskForm(true)}
                    className={`mt-4 px-4 py-2 bg-gradient-to-r ${config!.gradient} text-white rounded-xl text-sm font-medium flex items-center gap-2 mx-auto`}
                  >
                    <Plus size={16} />
                    Add Task
                  </button>
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
                        className="absolute top-3 left-3 z-10 w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <TaskCard task={task} index={index} compact />
                    </div>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </motion.div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-3 mt-4 text-sm">
              <button
                onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                disabled={pagination.page === 1}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-xl disabled:opacity-50 text-gray-700 dark:text-gray-300 font-medium"
              >
                Previous
              </button>
              <span className="text-gray-600 dark:text-gray-400">
                {pagination.page} / {totalPages}
              </span>
              <button
                onClick={() => setPagination(prev => ({ ...prev, page: Math.min(totalPages, prev.page + 1) }))}
                disabled={pagination.page === totalPages}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-xl disabled:opacity-50 text-gray-700 dark:text-gray-300 font-medium"
              >
                Next
              </button>
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
      {/* BottomBar - rendered outside the main content with proper z-index */}
      <BottomBar onTaskFormOpen={() => setShowTaskForm(true)} />
    </>
  );
};