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
  Sparkles
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
    gradient: 'from-blue-500 to-blue-600'
  },
  'learning': {
    icon: BookOpen,
    title: 'Learning',
    description: 'Educational goals, courses, and skill development',
    color: 'green',
    gradient: 'from-green-500 to-green-600'
  },
  'relationship': {
    icon: Heart,
    title: 'Relationships',
    description: 'Personal connections and social activities',
    color: 'red',
    gradient: 'from-red-500 to-red-600'
  },
  'self-development': {
    icon: User,
    title: 'Self Development',
    description: 'Personal growth and improvement goals',
    color: 'purple',
    gradient: 'from-purple-500 to-purple-600'
  },
  'project-improvement': {
    icon: Wrench,
    title: 'Project Improvement',
    description: 'Enhancements and optimizations for existing projects',
    color: 'orange',
    gradient: 'from-orange-500 to-orange-600'
  }
};

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.3 } },
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

// --- NEW SKELETON COMPONENTS ---
const CategoriesSkeleton: React.FC = () => {
    // Skeleton for a single category card
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

    // Skeleton for a single task card
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
            <div className="p-4 space-y-6 bg-gradient-to-b from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 min-h-screen pb-20">
                <div className="h-8 w-64 mx-auto bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse mb-4"></div>
                <div className="grid grid-cols-1 gap-4">
                    {[1, 2, 3, 4, 5].map(i => <CategoryCardSkeleton key={i} />)}
                </div>
                <div className="bg-gray-200 dark:bg-gray-700 rounded-2xl p-4 h-24 animate-pulse"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 pb-20">
            {/* Category Header Skeleton */}
            <div className="bg-gray-200 dark:bg-gray-700 h-48 rounded-b-3xl animate-pulse"></div>

            <div className="p-4 space-y-4">
                {/* Search & Controls Skeleton */}
                <div className="h-12 w-full bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse"></div>
                <div className="h-24 w-full bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse"></div>

                {/* Task List Skeletons */}
                <div className="space-y-3">
                    {[1, 2, 3, 4, 5].map(i => <TaskCardSkeleton key={i} />)}
                </div>
            </div>
        </div>
    );
};

// --- END SKELETON COMPONENTS ---

export const Categories: React.FC = () => {
  const { category } = useParams<{ category: string }>();
  const { tasks, loading, updateTask, deleteTask } = useTasks();
  const [searchTerm, setSearchTerm] = useState('');
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<'all' | TaskStatus>('all');
  const [sortBy, setSortBy] = useState('dueDate-asc');
  const [viewMode, setViewMode] = useState<'list' | 'grid' | 'kanban'>('list');
  const [selectedTasks, setSelectedTasks] = useState<Set<string>>(new Set());
  const [pagination, setPagination] = useState({ page: 1, perPage: 10 });
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [showFilters, setShowFilters] = useState(false);
  const [showSort, setShowSort] = useState(false);

  // State for the 2-second delay
  const [isDelayedLoading, setIsDelayedLoading] = useState(true);

  // Simulates a minimum loading time for a smoother user experience
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsDelayedLoading(false);
    }, 2000); // 2 seconds

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

  // Sorting
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

  const kanbanColumns: Record<TaskStatus, Task[]> = {
    'todo': [],
    'in-progress': [],
    'completed': [],
    'archived': [],
  };

  if (viewMode === 'kanban') {
    filteredTasks.forEach(task => {
      kanbanColumns[task.status].push(task);
    });
  }

  // Use the new skeleton component
  if (loading || isDelayedLoading) {
    return <CategoriesSkeleton />;
  }

  // --- Show all categories overview ---
  if (!currentCategory) {
    return (
      <div className="p-4 space-y-6 bg-gradient-to-b from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 min-h-screen pb-20">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-6"
        >
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Task Categories
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Organize your tasks by category for better focus
          </p>
        </motion.div>

        <div className="grid grid-cols-1 gap-4">
          {Object.entries(categoryConfig).map(([key, config], index) => {
            const categoryTasks = tasks.filter(t => t.category === key);
            const completedTasks = categoryTasks.filter(t => t.status === 'completed');
            const completionRate =
              categoryTasks.length > 0 ? Math.round((completedTasks.length / categoryTasks.length) * 100) : 0;

            return (
              <motion.div
                key={key}
                initial="hidden"
                animate="visible"
                variants={itemVariants}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden cursor-pointer"
              >
                <Link to={`/tasks/${key}`} className="block h-full">
                  <div className={`bg-gradient-to-br ${config.gradient} p-5 text-white relative overflow-hidden`}>
                    <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12"></div>
                    <div className="flex items-center justify-between mb-3">
                      <config.icon size={32} className="text-white/90" />
                      <span className="text-2xl font-bold">{categoryTasks.length}</span>
                    </div>
                    <h3 className="text-xl font-semibold mb-1">{config.title}</h3>
                    <p className="text-white/80 text-sm">{config.description}</p>
                  </div>

                  <div className="p-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Progress</span>
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">{completionRate}%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${completionRate}%` }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                        className={`bg-gradient-to-r ${config.gradient} h-2 rounded-full`}
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-2 mt-4 text-center text-gray-700 dark:text-gray-300">
                      <div>
                        <div className="text-lg font-semibold">{completedTasks.length}</div>
                        <div className="text-xs">Done</div>
                      </div>
                      <div>
                        <div className="text-lg font-semibold">
                          {categoryTasks.filter(t => t.status === 'in-progress').length}
                        </div>
                        <div className="text-xs">In Progress</div>
                      </div>
                      <div>
                        <div className="text-lg font-semibold">{categoryTasks.filter(t => t.status === 'todo').length}</div>
                        <div className="text-xs">To Do</div>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>

        {/* Mobile Optimization Notice */}
        <motion.div 
          className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-4 flex items-start"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg mr-3">
            <Smartphone size={18} className="text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h4 className="text-blue-800 dark:text-blue-200 font-medium text-sm">Mobile Optimized</h4>
            <p className="text-blue-600 dark:text-blue-300 text-xs mt-1">
              Tap on any category to view and manage your tasks.
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  // --- Show specific category page ---
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 pb-20">
      {/* Category Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`bg-gradient-to-br ${config!.gradient} rounded-b-3xl p-5 text-white shadow-lg relative overflow-hidden`}
      >
        <div className="absolute top-0 left-0 w-32 h-32 bg-white/10 rounded-full -ml-16 -mt-16 blur-xl"></div>
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <config.icon size={28} className="text-white/90 mr-3" />
              <div>
                <h1 className="text-2xl font-bold">{config.title}</h1>
                <p className="text-white/80 text-sm">{config.description}</p>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowTaskForm(true)}
              className="bg-white/20 backdrop-blur-md p-3 rounded-xl font-semibold transition-colors flex items-center justify-center text-white shadow-lg"
              aria-label={`Add new task to ${config.title}`}
            >
              <Plus size={20} />
            </motion.button>
          </div>

          {/* Category Stats */}
          {categoryStats && (
            <div className="grid grid-cols-2 gap-3 mt-4">
              <div className="bg-white/10 backdrop-blur-md p-3 rounded-xl text-center">
                <div className="text-xl font-bold">{categoryStats.total}</div>
                <div className="text-xs text-white/80">Total</div>
              </div>
              <div className="bg-white/10 backdrop-blur-md p-3 rounded-xl text-center">
                <div className="text-xl font-bold">{categoryStats.completed}</div>
                <div className="text-xs text-white/80">Completed</div>
              </div>
              <div className="bg-white/10 backdrop-blur-md p-3 rounded-xl text-center">
                <div className="text-xl font-bold">{categoryStats.inProgress}</div>
                <div className="text-xs text-white/80">In Progress</div>
              </div>
              <div className="bg-white/10 backdrop-blur-md p-3 rounded-xl text-center">
                <div className="text-xl font-bold">{categoryStats.overdue}</div>
                <div className="text-xs text-white/80">Overdue</div>
              </div>
            </div>
          )}
        </div>
      </motion.div>

      <div className="p-4 space-y-4">
        {/* Search input */}
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400 dark:text-gray-500" />
          <input
            type="search"
            placeholder="Search tasks..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            aria-label="Search tasks"
            spellCheck={false}
            autoComplete="off"
          />
        </div>

        {/* Controls */}
        <div className="flex flex-col gap-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md p-3 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center">
            <h3 className="font-medium text-gray-700 dark:text-gray-300">Filters</h3>
            <motion.button
              onClick={() => setShowFilters(!showFilters)}
              className="p-1 rounded-lg bg-gray-100 dark:bg-gray-700"
              whileTap={{ scale: 0.95 }}
            >
              {showFilters ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </motion.button>
          </div>

          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="flex flex-wrap gap-2 mt-2">
                  {statusFilters.map(filter => (
                    <motion.button
                      key={filter.value}
                      onClick={() => setSelectedStatus(filter.value)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2 ${
                        selectedStatus === filter.value
                          ? 'bg-blue-500 text-white shadow-md'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                      }`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {filter.icon}
                      <span>{filter.label}</span>
                    </motion.button>
                  ))}
                </div>

                <div className="mt-3">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Sort by</span>
                    <motion.button
                      onClick={() => setShowSort(!showSort)}
                      className="p-1 rounded-lg bg-gray-100 dark:bg-gray-700"
                      whileTap={{ scale: 0.95 }}
                    >
                      {showSort ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </motion.button>
                  </div>

                  <AnimatePresence>
                    {showSort && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden space-y-2"
                      >
                        {sortOptions.map(option => (
                          <motion.button
                            key={option.value}
                            onClick={() => setSortBy(option.value)}
                            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center space-x-2 ${
                              sortBy === option.value
                                ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                            }`}
                            whileTap={{ scale: 0.95 }}
                          >
                            {option.icon}
                            <span>{option.label}</span>
                          </motion.button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="mt-3">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">View</span>
                  <div className="flex gap-2">
                    <motion.button
                      onClick={() => setViewMode('list')}
                      className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-blue-500 text-white' : 'bg-gray-100 dark:bg-gray-700'}`}
                      whileHover={{ scale: 1.05 }}
                    >
                      <List size={18} />
                    </motion.button>
                    <motion.button
                      onClick={() => setViewMode('grid')}
                      className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-blue-500 text-white' : 'bg-gray-100 dark:bg-gray-700'}`}
                      whileHover={{ scale: 1.05 }}
                    >
                      <Grid size={18} />
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Bulk Actions */}
        {selectedTasks.size > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-yellow-100 dark:bg-yellow-900/30 p-3 rounded-xl flex flex-col md:flex-row items-center justify-between gap-2"
          >
            <span className="font-medium text-sm">{selectedTasks.size} selected</span>
            <div className="flex gap-2">
              <motion.button
                onClick={() => {
                  selectedTasks.forEach(id => updateTask({ ...tasks.find(t => t.id === id)!, status: 'completed' }));
                  setSelectedTasks(new Set());
                }}
                className="px-3 py-1 bg-green-500 text-white rounded-lg flex items-center gap-1 text-sm"
                whileHover={{ scale: 1.05 }}
              >
                <CheckSquare size={14} />
                Complete
              </motion.button>
              <motion.button
                onClick={() => {
                  selectedTasks.forEach(id => deleteTask(id));
                  setSelectedTasks(new Set());
                }}
                className="px-3 py-1 bg-red-500 text-white rounded-lg flex items-center gap-1 text-sm"
                whileHover={{ scale: 1.05 }}
              >
                <Trash2 size={14} />
                Delete
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* Tasks List */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className={`space-y-3 ${viewMode === 'grid' ? 'grid grid-cols-1 gap-3' : ''}`}
        >
          <AnimatePresence>
            {filteredTasks.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="text-center py-10 text-gray-500 dark:text-gray-400 space-y-4"
              >
                <Inbox size={48} className="mx-auto mb-2 opacity-50" />
                <div className="text-lg font-semibold">
                  No tasks found
                </div>
                <p className="text-sm">
                  {tasks.filter(t => t.category === currentCategory).length === 0
                    ? `Create your first ${config!.title.toLowerCase()} task to get started!`
                    : 'Try adjusting your search or filters.'}
                </p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowTaskForm(true)}
                  className={`bg-gradient-to-r ${config!.gradient} text-white px-4 py-2 rounded-lg font-semibold flex items-center space-x-2 mx-auto text-sm`}
                >
                  <Plus size={16} />
                  <span>Add Your First Task</span>
                </motion.button>
              </motion.div>
            ) : (
              paginatedTasks.map((task, index) => (
                <motion.div 
                  key={task.id} 
                  variants={itemVariants} 
                  layout 
                  whileHover={{ y: -2 }}
                  transition={{ duration: 0.2 }}
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
                      className="absolute top-3 left-3 z-10 w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
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
          <div className="flex justify-center items-center gap-3 mt-4 text-gray-600 dark:text-gray-400 text-sm">
            <button
              onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
              disabled={pagination.page === 1}
              className="px-3 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg disabled:opacity-50"
            >
              Previous
            </button>
            <span>Page {pagination.page} of {totalPages}</span>
            <button
              onClick={() => setPagination(prev => ({ ...prev, page: Math.min(totalPages, prev.page + 1) }))}
              disabled={pagination.page === totalPages}
              className="px-3 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}

        {/* Mobile Optimization Notice */}
        <motion.div 
          className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-4 flex items-start"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg mr-3">
            <Sparkles size={18} className="text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h4 className="text-blue-800 dark:text-blue-200 font-medium text-sm">Mobile Tips</h4>
            <p className="text-blue-600 dark:text-blue-300 text-xs mt-1">
              Tap the + button to quickly add tasks. Swipe on tasks to mark as complete.
            </p>
          </div>
        </motion.div>
      </div>

      {/* Floating Add Button on Mobile */}
      {isMobile && (
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setShowTaskForm(true)}
          className="fixed bottom-20 right-4 bg-blue-500 text-white p-4 rounded-full shadow-lg hover:bg-blue-600 transition-colors z-10"
        >
          <Plus size={24} />
        </motion.button>
      )}

      {/* Task Form Modal */}
      <TaskForm
        isOpen={showTaskForm}
        onClose={() => setShowTaskForm(false)}
        category={currentCategory}
      />
      <BottomBar />
    </div>
  );
};