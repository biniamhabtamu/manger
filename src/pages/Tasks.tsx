import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Search, 
  Filter, 
  SortAsc, 
  SortDesc, 
  Download, 
  Grid, 
  List, 
  Trash2, 
  CheckCircle2, 
  AlertTriangle, 
  ChevronLeft, 
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Smartphone,
  Sparkles,
  BarChart3,
  Inbox,
  Target,
  Clock,
  CheckSquare,
} from 'lucide-react';
import { useTasks } from '../hooks/useTasks';
import { TaskForm } from '../components/tasks/TaskForm';
import { TaskCard } from '../components/tasks/TaskCard';
import { TaskStatus, TaskCategory } from '../types/task';
import { BottomBar } from '../components/layout/BottomBar';

// Define the Skeleton Loader component
const SkeletonLoader = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 2 }} // <-- This line was updated to 2 seconds
    className="p-4 space-y-4 animate-pulse"
  >
    {/* Header Skeleton */}
    <div className="flex items-center justify-between">
      <div className="w-48 h-8 bg-gray-300 dark:bg-gray-700 rounded-lg"></div>
      <div className="w-12 h-12 bg-gray-300 dark:bg-gray-700 rounded-full"></div>
    </div>

    {/* Stats Skeleton */}
    <div className="grid grid-cols-2 gap-3">
      <div className="h-24 bg-gray-300 dark:bg-gray-700 rounded-2xl"></div>
      <div className="h-24 bg-gray-300 dark:bg-gray-700 rounded-2xl"></div>
      <div className="h-24 bg-gray-300 dark:bg-gray-700 rounded-2xl"></div>
      <div className="h-24 bg-gray-300 dark:bg-gray-700 rounded-2xl"></div>
    </div>

    {/* Search and Controls Skeleton */}
    <div className="h-12 bg-gray-300 dark:bg-gray-700 rounded-xl"></div>
    <div className="h-20 bg-gray-300 dark:bg-gray-700 rounded-xl"></div>

    {/* Task List Skeleton */}
    <div className="space-y-3">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm space-y-2">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-gray-200 dark:bg-gray-600 rounded-full"></div>
            <div className="w-3/4 h-4 bg-gray-200 dark:bg-gray-600 rounded-md"></div>
          </div>
          <div className="w-full h-3 bg-gray-200 dark:bg-gray-600 rounded-md"></div>
          <div className="w-1/2 h-3 bg-gray-200 dark:bg-gray-600 rounded-md"></div>
          <div className="flex justify-between items-center mt-2">
            <div className="w-1/4 h-3 bg-gray-200 dark:bg-gray-600 rounded-md"></div>
            <div className="w-1/4 h-3 bg-gray-200 dark:bg-gray-600 rounded-md"></div>
          </div>
        </div>
      ))}
    </div>
  </motion.div>
);

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.3 } },
};

export const Tasks: React.FC = () => {
  const { tasks, stats, loading, updateTask, deleteTask } = useTasks();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<'all' | TaskCategory>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | TaskStatus>('all');
  const [sortBy, setSortBy] = useState<'dueDate-asc' | 'dueDate-desc' | 'priority' | 'status'>('dueDate-asc');
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, perPage: 10 });
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('list');
  const [selectedTasks, setSelectedTasks] = useState<Set<string>>(new Set());
  const [bulkAction, setBulkAction] = useState<'none' | 'complete' | 'delete'>('none');
  const [showFilters, setShowFilters] = useState(false);
  const [showSort, setShowSort] = useState(false);

  // The loading state now renders the SkeletonLoader component
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <SkeletonLoader />
        <BottomBar />
      </div>
    );
  }

  let filteredTasks = tasks.filter(task => {
    const matchesSearch =
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || task.category === filterCategory;
    const matchesStatus = filterStatus === 'all' || task.status === filterStatus;
    return matchesSearch && matchesCategory && matchesStatus;
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
    } else if (sortBy === 'priority') {
      const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    } else if (sortBy === 'status') {
      const statusOrder = { 'todo': 3, 'in-progress': 2, 'completed': 1, 'archived': 0 };
      return statusOrder[b.status] - statusOrder[a.status];
    }
    return 0;
  });

  const paginatedTasks = filteredTasks.slice(
    (pagination.page - 1) * pagination.perPage,
    pagination.page * pagination.perPage
  );

  const totalPages = Math.ceil(filteredTasks.length / pagination.perPage);

  const completionRate = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;

  const categories = [...new Set(tasks.map(t => t.category))];

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

  const handleExportCSV = () => {
    const csvContent = [
      ['ID', 'Title', 'Description', 'Category', 'Status', 'Priority', 'Due Date'],
      ...filteredTasks.map(task => [
        task.id,
        task.title,
        task.description,
        task.category,
        task.status,
        task.priority,
        task.dueDate ? task.dueDate.toISOString() : ''
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'tasks.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleTaskSelect = (id: string) => {
    setSelectedTasks(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const handleBulkAction = () => {
    if (bulkAction === 'complete') {
      selectedTasks.forEach(id => {
        const task = tasks.find(t => t.id === id);
        if (task) updateTask({ ...task, status: 'completed' });
      });
    } else if (bulkAction === 'delete') {
      selectedTasks.forEach(id => deleteTask(id));
    }
    setSelectedTasks(new Set());
    setBulkAction('none');
  };

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData('taskId', taskId);
  };

  const handleDrop = (e: React.DragEvent, newStatus: TaskStatus) => {
    const taskId = e.dataTransfer.getData('taskId');
    const task = tasks.find(t => t.id === taskId);
    if (task && task.status !== newStatus) {
      updateTask({ ...task, status: newStatus });
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 pb-20">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-10 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md p-4 border-b border-gray-200 dark:border-gray-700"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Tasks
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Manage all your tasks in one place
            </p>
          </div>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowTaskForm(true)}
            className="bg-blue-500 text-white p-3 rounded-xl shadow-md"
          >
            <Plus size={20} />
          </motion.button>
        </div>
      </motion.div>

      <div className="p-4 space-y-4">
        {/* Quick Stats */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-2 gap-3"
        >
          <motion.div variants={itemVariants} className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-4 text-white text-center shadow-lg">
            <div className="text-2xl font-bold">{stats.total}</div>
            <div className="text-xs uppercase tracking-wide text-blue-100">Total</div>
          </motion.div>
          <motion.div variants={itemVariants} className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-4 text-white text-center shadow-lg">
            <div className="text-2xl font-bold">{stats.completed}</div>
            <div className="text-xs uppercase tracking-wide text-green-100">Completed</div>
          </motion.div>
          <motion.div variants={itemVariants} className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-2xl p-4 text-white text-center shadow-lg">
            <div className="text-2xl font-bold">{stats.inProgress}</div>
            <div className="text-xs uppercase tracking-wide text-yellow-100">In Progress</div>
          </motion.div>
          <motion.div variants={itemVariants} className="bg-gradient-to-br from-red-500 to-red-600 rounded-2xl p-4 text-white text-center shadow-lg">
            <div className="text-2xl font-bold">{stats.overdue}</div>
            <div className="text-xs uppercase tracking-wide text-red-100">Overdue</div>
          </motion.div>
        </motion.div>

        {/* Search input */}
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400 dark:text-gray-500" />
          <input
            type="search"
            placeholder="Search tasks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            aria-label="Search tasks"
            spellCheck={false}
            autoComplete="off"
          />
        </div>

        {/* Controls */}
        <div className="flex flex-col gap-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md p-3 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center">
            <h3 className="font-medium text-gray-700 dark:text-gray-300">Filters & Sort</h3>
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
                className="overflow-hidden space-y-3"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
                  <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value as 'all' | TaskCategory)}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                  >
                    <option value="all">All Categories</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>
                        {cat.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value as 'all' | TaskStatus)}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                  >
                    <option value="all">All Status</option>
                    <option value="todo">To Do</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Sort by</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                  >
                    <option value="dueDate-asc">Due Date (Soonest)</option>
                    <option value="dueDate-desc">Due Date (Latest)</option>
                    <option value="priority">Priority (High to Low)</option>
                    <option value="status">Status</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">View</label>
                  <div className="flex gap-2">
                    <motion.button
                      onClick={() => setViewMode('list')}
                      className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-blue-500 text-white' : 'bg-gray-100 dark:bg-gray-700'}`}
                      whileHover={{ scale: 1.05 }}
                    >
                      <List size={18} />
                    </motion.button>
                    <motion.button
                      onClick={() => setViewMode('kanban')}
                      className={`p-2 rounded-lg ${viewMode === 'kanban' ? 'bg-blue-500 text-white' : 'bg-gray-100 dark:bg-gray-700'}`}
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
            className="bg-yellow-100 dark:bg-yellow-900/30 p-3 rounded-xl flex flex-col gap-2"
          >
            <span className="font-medium text-sm">{selectedTasks.size} tasks selected</span>
            <div className="flex gap-2">
              <motion.button
                onClick={() => setBulkAction('complete')}
                className="px-3 py-1.5 bg-green-500 text-white rounded-lg flex items-center gap-1 text-sm flex-1 justify-center"
                whileHover={{ scale: 1.05 }}
              >
                <CheckCircle2 size={14} />
                <span>Complete</span>
              </motion.button>
              <motion.button
                onClick={() => setBulkAction('delete')}
                className="px-3 py-1.5 bg-red-500 text-white rounded-lg flex items-center gap-1 text-sm flex-1 justify-center"
                whileHover={{ scale: 1.05 }}
              >
                <Trash2 size={14} />
                <span>Delete</span>
              </motion.button>
            </div>
            <motion.button
              onClick={handleBulkAction}
              disabled={bulkAction === 'none'}
              className="px-3 py-1.5 bg-blue-500 text-white rounded-lg disabled:opacity-50 text-sm"
              whileHover={{ scale: 1.05 }}
            >
              Apply Action
            </motion.button>
          </motion.div>
        )}

        {/* Tasks List */}
        {viewMode === 'list' ? (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-3"
          >
            <AnimatePresence>
              {paginatedTasks.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-10 text-gray-500 dark:text-gray-400 space-y-4"
                >
                  <Inbox size={48} className="mx-auto mb-2 opacity-50" />
                  <div className="text-lg font-semibold">
                    No tasks found
                  </div>
                  <p className="text-sm">
                    {tasks.length === 0 
                      ? "Create your first task to get started!"
                      : "Try adjusting your search or filter criteria."
                    }
                  </p>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowTaskForm(true)}
                    className="bg-blue-500 text-white px-4 py-2 rounded-lg font-semibold flex items-center space-x-2 mx-auto text-sm"
                  >
                    <Plus size={16} />
                    <span>Add Your First Task</span>
                  </motion.button>
                </motion.div>
              ) : (
                paginatedTasks.map((task, index) => (
                  <motion.div key={task.id} variants={itemVariants} className="relative">
                    <input
                      type="checkbox"
                      checked={selectedTasks.has(task.id)}
                      onChange={() => handleTaskSelect(task.id)}
                      className="absolute top-3 left-3 z-10 w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <TaskCard task={task} index={index} compact />
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </motion.div>
        ) : (
          <div className="overflow-x-auto pb-4">
            <div className="flex space-x-4 min-w-max">
              {Object.entries(kanbanColumns).map(([status, columnTasks]) => (
                <div 
                  key={status}
                  onDrop={(e) => handleDrop(e, status as TaskStatus)}
                  onDragOver={handleDragOver}
                  className="bg-gray-100 dark:bg-gray-700 p-3 rounded-xl min-w-[250px]"
                >
                  <h3 className="text-base font-semibold mb-3 capitalize">{status.replace('-', ' ')}</h3>
                  <div className="space-y-3">
                    {columnTasks.map(task => (
                      <div 
                        key={task.id} 
                        draggable 
                        onDragStart={(e) => handleDragStart(e, task.id)}
                        className="p-3 bg-white dark:bg-gray-800 rounded-lg shadow cursor-move"
                      >
                        <h4 className="text-sm font-medium">{task.title}</h4>
                        <p className="text-xs text-gray-500">{task.category}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Pagination */}
        {viewMode === 'list' && totalPages > 1 && (
          <div className="flex justify-center items-center gap-3 mt-4 text-gray-600 dark:text-gray-400 text-sm">
            <button
              disabled={pagination.page === 1}
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
              className="px-3 py-1.5 bg-gray-200 dark:bg-gray-700 rounded-lg disabled:opacity-50 flex items-center"
            >
              <ChevronLeft size={16} className="mr-1" />
              <span>Previous</span>
            </button>
            <span>
              Page {pagination.page} of {totalPages}
            </span>
            <button
              disabled={pagination.page === totalPages}
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
              className="px-3 py-1.5 bg-gray-200 dark:bg-gray-700 rounded-lg disabled:opacity-50 flex items-center"
            >
              <span>Next</span>
              <ChevronRight size={16} className="ml-1" />
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
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setShowTaskForm(true)}
        className="fixed bottom-20 right-4 bg-blue-500 text-white p-4 rounded-full shadow-lg hover:bg-blue-600 transition-colors z-10"
      >
        <Plus size={24} />
      </motion.button>

      {/* Floating Export Button */}
      

      <TaskForm
        isOpen={showTaskForm}
        onClose={() => setShowTaskForm(false)}
      />
<div className="fixed bottom-0 left-0 right-0 z-30">
      <BottomBar  />
</div>
    </div>
  );
};