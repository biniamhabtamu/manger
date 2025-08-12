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
  List
} from 'lucide-react';
import { useTasks } from '../hooks/useTasks';
import { TaskForm } from '../components/tasks/TaskForm';
import { TaskCard } from '../components/tasks/TaskCard';
import { TaskCategory, TaskStatus } from '../types/task';

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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent"
        ></motion.div>
      </div>
    );
  }

  // --- Show all categories overview ---
  if (!currentCategory) {
    return (
      <div className="p-4 sm:p-6 md:p-8 space-y-6 max-w-7xl mx-auto bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 min-h-screen">
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8 text-center"
        >
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            Task Categories
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 mt-3 max-w-2xl mx-auto">
            Organize your tasks by category for better focus and productivity. Track progress and stay motivated.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
                whileHover={{ scale: 1.05, boxShadow: '0 10px 25px rgba(0,0,0,0.15)' }}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden cursor-pointer transform transition-all duration-300"
              >
                <Link to={`/tasks/${key}`} className="block h-full">
                  <div className={`bg-gradient-to-br ${config.gradient} p-6 text-white relative overflow-hidden`}>
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
                    <div className="flex items-center justify-between mb-4">
                      <config.icon size={40} className="text-white/90" />
                      <span className="text-3xl font-bold tabular-nums">{categoryTasks.length}</span>
                    </div>
                    <h3 className="text-2xl font-semibold mb-2">{config.title}</h3>
                    <p className="text-white/80 text-sm leading-relaxed">{config.description}</p>
                  </div>

                  <div className="p-6">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Completion Progress</span>
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">{completionRate}%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden shadow-inner">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${completionRate}%` }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                        className={`bg-gradient-to-r ${config.gradient} h-3 rounded-full`}
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-4 mt-6 text-center text-gray-700 dark:text-gray-300">
                      <div>
                        <div className="text-xl font-semibold">{completedTasks.length}</div>
                        <div className="text-xs font-medium uppercase tracking-wide">Completed</div>
                      </div>
                      <div>
                        <div className="text-xl font-semibold">
                          {categoryTasks.filter(t => t.status === 'in-progress').length}
                        </div>
                        <div className="text-xs font-medium uppercase tracking-wide">In Progress</div>
                      </div>
                      <div>
                        <div className="text-xl font-semibold">{categoryTasks.filter(t => t.status === 'todo').length}</div>
                        <div className="text-xs font-medium uppercase tracking-wide">To Do</div>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    );
  }

  // --- Show specific category page ---
  return (
    <div className="p-2 sm:p-4 md:p-6 lg:p-8 max-w-5xl mx-auto space-y-4 md:space-y-6 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 min-h-screen">
      {/* Category Header */}
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className={`bg-gradient-to-br ${config!.gradient} rounded-2xl p-4 md:p-6 lg:p-8 text-white flex flex-col justify-between items-center gap-4 md:gap-6 shadow-xl relative overflow-hidden`}
      >
        <div className="absolute top-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-24 -mt-24 blur-xl"></div>
        <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-5 flex-1 min-w-0 w-full">
          <config.icon size={32} md:size={48} lg:size={64} className="text-white/90" />
          <div className="truncate text-center md:text-left">
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold truncate">{config.title}</h1>
            <p className="mt-1 md:mt-2 text-white/80 text-sm md:text-base max-w-lg">{config.description}</p>
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowTaskForm(true)}
          className="bg-white/20 hover:bg-white/30 backdrop-blur-md px-4 md:px-6 py-2 md:py-3 rounded-lg font-semibold transition-colors flex items-center space-x-2 text-white shadow-lg shadow-black/20 w-full md:w-auto justify-center"
          aria-label={`Add new task to ${config.title}`}
        >
          <Plus size={16} md:size={20} />
          <span className="text-sm md:text-base">Add Task</span>
        </motion.button>
      </motion.div>

      {/* Category Stats */}
      {categoryStats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 md:gap-4 lg:gap-6">
          <motion.div 
            className="bg-white dark:bg-gray-800 rounded-2xl p-3 md:p-5 text-center shadow-md border border-gray-100 dark:border-gray-700"
            whileHover={{ scale: 1.05 }}
          >
            <Inbox size={24} md:size={32} className="mx-auto mb-2 md:mb-3 text-blue-500" />
            <div className="text-xl md:text-3xl font-bold tabular-nums">{categoryStats.total}</div>
            <div className="uppercase text-xs tracking-wide text-gray-600 dark:text-gray-400">Total Tasks</div>
          </motion.div>
          <motion.div 
            className="bg-white dark:bg-gray-800 rounded-2xl p-3 md:p-5 text-center shadow-md border border-gray-100 dark:border-gray-700"
            whileHover={{ scale: 1.05 }}
          >
            <CheckSquare size={24} md:size={32} className="mx-auto mb-2 md:mb-3 text-green-500" />
            <div className="text-xl md:text-3xl font-bold tabular-nums">{categoryStats.completed}</div>
            <div className="uppercase text-xs tracking-wide text-gray-600 dark:text-gray-400">Completed</div>
          </motion.div>
          <motion.div 
            className="bg-white dark:bg-gray-800 rounded-2xl p-3 md:p-5 text-center shadow-md border border-gray-100 dark:border-gray-700"
            whileHover={{ scale: 1.05 }}
          >
            <Clock size={24} md:size={32} className="mx-auto mb-2 md:mb-3 text-yellow-500" />
            <div className="text-xl md:text-3xl font-bold tabular-nums">{categoryStats.inProgress}</div>
            <div className="uppercase text-xs tracking-wide text-gray-600 dark:text-gray-400">In Progress</div>
          </motion.div>
          <motion.div 
            className="bg-white dark:bg-gray-800 rounded-2xl p-3 md:p-5 text-center shadow-md border border-gray-100 dark:border-gray-700"
            whileHover={{ scale: 1.05 }}
          >
            <AlertTriangle size={24} md:size={32} className="mx-auto mb-2 md:mb-3 text-red-500" />
            <div className="text-xl md:text-3xl font-bold tabular-nums">{categoryStats.overdue}</div>
            <div className="uppercase text-xs tracking-wide text-gray-600 dark:text-gray-400">Overdue</div>
          </motion.div>
        </div>
      )}

      {/* Controls */}
      <div className="flex flex-col gap-2 sticky top-0 z-20 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md py-2 px-2 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex flex-wrap gap-2 justify-center md:justify-start">
          {statusFilters.map(filter => (
            <motion.button
              key={filter.value}
              onClick={() => setSelectedStatus(filter.value)}
              className={`px-2 py-1 md:px-4 md:py-2 rounded-lg text-xs md:text-sm font-medium transition-colors flex items-center space-x-1 md:space-x-2 ${
                selectedStatus === filter.value
                  ? 'bg-blue-500 text-white shadow-md'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {filter.icon}
              <span>{filter.label}</span>
            </motion.button>
          ))}
        </div>

        <div className="flex gap-2 justify-center md:justify-end">
          <motion.button
            onClick={() => setViewMode('list')}
            className={`p-1 md:p-2 rounded-lg ${viewMode === 'list' ? 'bg-blue-500 text-white' : 'bg-gray-100 dark:bg-gray-700'}`}
            whileHover={{ scale: 1.05 }}
          >
            <List size={16} md:size={20} />
          </motion.button>
          <motion.button
            onClick={() => setViewMode('grid')}
            className={`p-1 md:p-2 rounded-lg ${viewMode === 'grid' ? 'bg-blue-500 text-white' : 'bg-gray-100 dark:bg-gray-700'}`}
            whileHover={{ scale: 1.05 }}
          >
            <Grid size={16} md:size={20} />
          </motion.button>
          <motion.button
            onClick={() => setViewMode('kanban')}
            className={`p-1 md:p-2 rounded-lg ${viewMode === 'kanban' ? 'bg-blue-500 text-white' : 'bg-gray-100 dark:bg-gray-700'}`}
            whileHover={{ scale: 1.05 }}
          >
            <Grid size={16} md:size={20} />
          </motion.button>
        </div>

        <div className="relative w-full md:w-auto">
          <Filter className="absolute left-3 top-3 h-4 w-4 text-gray-400 dark:text-gray-500" />
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            className="pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition appearance-none w-full md:min-w-[200px]"
          >
            {sortOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Search input */}
      <div className="relative max-w-md mx-auto">
        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400 dark:text-gray-500" />
        <input
          type="search"
          placeholder="Search tasks..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
          aria-label="Search tasks"
          spellCheck={false}
          autoComplete="off"
        />
      </div>

      {/* Bulk Actions */}
      {selectedTasks.size > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-yellow-100 dark:bg-yellow-900/30 p-4 rounded-lg flex flex-col md:flex-row items-center justify-between sticky top-20 z-10 gap-4"
        >
          <span className="font-medium">{selectedTasks.size} selected</span>
          <div className="flex gap-2 flex-wrap justify-center">
            <motion.button
              onClick={() => {
                selectedTasks.forEach(id => updateTask({ ...tasks.find(t => t.id === id)!, status: 'completed' }));
                setSelectedTasks(new Set());
              }}
              className="px-4 py-2 bg-green-500 text-white rounded-lg flex items-center gap-2 hover:bg-green-600"
              whileHover={{ scale: 1.05 }}
            >
              <CheckSquare size={16} />
              Complete
            </motion.button>
            <motion.button
              onClick={() => {
                selectedTasks.forEach(id => deleteTask(id));
                setSelectedTasks(new Set());
              }}
              className="px-4 py-2 bg-red-500 text-white rounded-lg flex items-center gap-2 hover:bg-red-600"
              whileHover={{ scale: 1.05 }}
            >
              <Trash2 size={16} />
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
        className={`space-y-4 ${viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' : viewMode === 'kanban' ? 'flex flex-col md:flex-row gap-4 overflow-x-auto pb-4' : ''}`}
      >
        <AnimatePresence>
          {viewMode === 'kanban' ? (
            Object.entries(kanbanColumns).map(([status, columnTasks]) => (
              <div key={status} className="bg-gray-100 dark:bg-gray-700 p-4 rounded-2xl min-w-[250px] flex-1">
                <h3 className="text-lg font-semibold mb-4">{status.toUpperCase()}</h3>
                <div className="space-y-4 min-h-[200px]" onDrop={(e) => {
                  e.preventDefault();
                  const id = e.dataTransfer.getData('text');
                  const task = filteredTasks.find(t => t.id === id);
                  if (task && task.status !== status) {
                    updateTask({ ...task, status: status as TaskStatus });
                  }
                }} onDragOver={e => e.preventDefault()}>
                  {columnTasks.map((task, index) => (
                    <motion.div 
                      key={task.id} 
                      draggable 
                      onDragStart={e => e.dataTransfer.setData('text', task.id)}
                      variants={itemVariants}
                      className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow cursor-move"
                    >
                      <TaskCard task={task} index={index} compact />
                    </motion.div>
                  ))}
                </div>
              </div>
            ))
          ) : filteredTasks.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="text-center py-16 text-gray-500 dark:text-gray-400 space-y-4 max-w-lg mx-auto"
            >
              <Inbox size={64} className="mx-auto mb-2 opacity-50" />
              <div className="text-2xl font-semibold">
                No tasks found
              </div>
              <p className="text-base">
                {tasks.filter(t => t.category === currentCategory).length === 0
                  ? `Create your first ${config!.title.toLowerCase()} task to get started!`
                  : 'Try adjusting your search or filters.'}
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowTaskForm(true)}
                className={`bg-gradient-to-r ${config!.gradient} text-white px-6 py-3 rounded-lg font-semibold flex items-center space-x-2 mx-auto shadow-md`}
              >
                <Plus size={20} />
                <span>Add Your First Task</span>
              </motion.button>
            </motion.div>
          ) : (
            paginatedTasks.map((task, index) => (
              <motion.div 
                key={task.id} 
                variants={itemVariants} 
                layout 
                whileHover={{ scale: 1.02, boxShadow: '0 5px 15px rgba(0,0,0,0.1)' }}
                transition={{ duration: 0.3 }}
                className={viewMode === 'grid' ? 'col-span-1' : ''}
              >
                <input
                  type="checkbox"
                  checked={selectedTasks.has(task.id)}
                  onChange={() => {
                    const newSet = new Set(selectedTasks);
                    if (newSet.has(task.id)) newSet.delete(task.id);
                    else newSet.add(task.id);
                    setSelectedTasks(newSet);
                  }}
                  className="absolute top-4 left-4 z-10"
                />
                <TaskCard task={task} index={index} />
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </motion.div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-6 text-gray-600 dark:text-gray-400">
          <button
            onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
            disabled={pagination.page === 1}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg disabled:opacity-50"
          >
            Previous
          </button>
          <span>Page {pagination.page} of {totalPages}</span>
          <button
            onClick={() => setPagination(prev => ({ ...prev, page: Math.min(totalPages, prev.page + 1) }))}
            disabled={pagination.page === totalPages}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}

      {/* Export Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => {
          const csv = filteredTasks.map(task => `${task.title},${task.description},${task.status},${task.priority},${task.dueDate ? task.dueDate.toISOString() : ''}`).join('\n');
          const blob = new Blob([csv], { type: 'text/csv' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'tasks.csv';
          a.click();
        }}
        className="fixed bottom-4 right-4 bg-purple-500 text-white p-4 rounded-full shadow-lg hover:bg-purple-600 transition-colors md:bottom-8 md:right-8"
      >
        <Download size={24} />
      </motion.button>

      {/* Floating Add Button on Mobile */}
      {isMobile && (
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setShowTaskForm(true)}
          className="fixed bottom-20 right-4 bg-blue-500 text-white p-4 rounded-full shadow-lg hover:bg-blue-600 transition-colors"
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
    </div>
  );
};