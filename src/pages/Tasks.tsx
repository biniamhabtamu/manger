import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Filter, SortAsc, SortDesc, Download, Grid, List, Trash2, CheckCircle2, AlertTriangle } from 'lucide-react';
import { useTasks } from '../hooks/useTasks';
import { TaskForm } from '../components/tasks/TaskForm';
import { TaskCard } from '../components/tasks/TaskCard';
import { TaskStatus, TaskCategory } from '../types/task';

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
  const { tasks, stats, loading, updateTask, deleteTask } = useTasks(); // Assuming updateTask and deleteTask are added to hook
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<'all' | TaskCategory>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | TaskStatus>('all');
  const [sortBy, setSortBy] = useState<'dueDate-asc' | 'dueDate-desc' | 'priority' | 'status'>('dueDate-asc');
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, perPage: 10 });
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('list');
  const [selectedTasks, setSelectedTasks] = useState<Set<string>>(new Set());
  const [bulkAction, setBulkAction] = useState<'none' | 'complete' | 'delete'>('none');

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent shadow-lg"
        ></motion.div>
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
    <div className="p-4 sm:p-6 md:p-8 space-y-6 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 min-h-screen">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
      >
        <div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            Tasks
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 mt-2">
            Manage all your tasks in one place
          </p>
        </div>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowTaskForm(true)}
          className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md"
        >
          <Plus size={24} className="mr-2" />
          Add Task
        </motion.button>
      </motion.div>

      {/* Quick Stats */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6"
      >
        <motion.div variants={itemVariants} className="bg-white dark:bg-gray-800 rounded-2xl p-4 text-center shadow-md">
          <div className="text-3xl font-bold text-blue-500">{stats.total}</div>
          <div className="text-sm uppercase tracking-wide text-gray-600 dark:text-gray-400">Total Tasks</div>
        </motion.div>
        <motion.div variants={itemVariants} className="bg-white dark:bg-gray-800 rounded-2xl p-4 text-center shadow-md">
          <div className="text-3xl font-bold text-green-500">{stats.completed}</div>
          <div className="text-sm uppercase tracking-wide text-gray-600 dark:text-gray-400">Completed</div>
        </motion.div>
        <motion.div variants={itemVariants} className="bg-white dark:bg-gray-800 rounded-2xl p-4 text-center shadow-md">
          <div className="text-3xl font-bold text-yellow-500">{stats.inProgress}</div>
          <div className="text-sm uppercase tracking-wide text-gray-600 dark:text-gray-400">In Progress</div>
        </motion.div>
        <motion.div variants={itemVariants} className="bg-white dark:bg-gray-800 rounded-2xl p-4 text-center shadow-md">
          <div className="text-3xl font-bold text-red-500">{stats.overdue}</div>
          <div className="text-sm uppercase tracking-wide text-gray-600 dark:text-gray-400">Overdue</div>
        </motion.div>
      </motion.div>

      {/* Filters and View Mode */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-col lg:flex-row gap-4 items-center"
      >
        <div className="flex-1 relative w-full">
          <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition"
          />
        </div>
        
        <div className="flex flex-wrap gap-4 w-full lg:w-auto justify-center lg:justify-start">
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value as 'all' | TaskCategory)}
            className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="all">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>
                {cat.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </option>
            ))}
          </select>
          
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as 'all' | TaskStatus)}
            className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="all">All Status</option>
            <option value="todo">To Do</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="archived">Archived</option>
          </select>
          
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="dueDate-asc">Due Date (Soonest)</option>
            <option value="dueDate-desc">Due Date (Latest)</option>
            <option value="priority">Priority (High to Low)</option>
            <option value="status">Status</option>
          </select>

          <div className="flex gap-2">
            <motion.button
              onClick={() => setViewMode('list')}
              className={`p-3 rounded-lg ${viewMode === 'list' ? 'bg-blue-500 text-white' : 'bg-gray-100 dark:bg-gray-700'}`}
              whileHover={{ scale: 1.05 }}
            >
              <List size={20} />
            </motion.button>
            <motion.button
              onClick={() => setViewMode('kanban')}
              className={`p-3 rounded-lg ${viewMode === 'kanban' ? 'bg-blue-500 text-white' : 'bg-gray-100 dark:bg-gray-700'}`}
              whileHover={{ scale: 1.05 }}
            >
              <Grid size={20} />
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Bulk Actions */}
      {selectedTasks.size > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-yellow-100 dark:bg-yellow-900/30 p-4 rounded-lg flex items-center justify-between"
        >
          <span>{selectedTasks.size} tasks selected</span>
          <div className="flex gap-2">
            <motion.button
              onClick={() => setBulkAction('complete')}
              className="px-4 py-2 bg-green-500 text-white rounded-lg flex items-center gap-2"
              whileHover={{ scale: 1.05 }}
            >
              <CheckCircle2 size={20} />
              Complete
            </motion.button>
            <motion.button
              onClick={() => setBulkAction('delete')}
              className="px-4 py-2 bg-red-500 text-white rounded-lg flex items-center gap-2"
              whileHover={{ scale: 1.05 }}
            >
              <Trash2 size={20} />
              Delete
            </motion.button>
            <motion.button
              onClick={handleBulkAction}
              disabled={bulkAction === 'none'}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg disabled:opacity-50"
              whileHover={{ scale: 1.05 }}
            >
              Apply
            </motion.button>
          </div>
        </motion.div>
      )}

      {/* Tasks List */}
      {viewMode === 'list' ? (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-4"
        >
          <AnimatePresence>
            {paginatedTasks.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12 text-gray-500 dark:text-gray-400 space-y-4"
              >
                <div className="text-2xl font-semibold">
                  No tasks found
                </div>
                <p className="text-base">
                  {tasks.length === 0 
                    ? "Create your first task to get started!"
                    : "Try adjusting your search or filter criteria."
                  }
                </p>
              </motion.div>
            ) : (
              paginatedTasks.map((task, index) => (
                <motion.div key={task.id} variants={itemVariants} className="relative">
                  <input
                    type="checkbox"
                    checked={selectedTasks.has(task.id)}
                    onChange={() => handleTaskSelect(task.id)}
                    className="absolute top-4 left-4 z-10"
                  />
                  <TaskCard task={task} index={index} />
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {Object.entries(kanbanColumns).map(([status, columnTasks]) => (
            <div 
              key={status}
              onDrop={(e) => handleDrop(e, status as TaskStatus)}
              onDragOver={handleDragOver}
              className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg"
            >
              <h3 className="text-lg font-semibold mb-4 capitalize">{status.replace('-', ' ')}</h3>
              <div className="space-y-4">
                {columnTasks.map(task => (
                  <div 
                    key={task.id} 
                    draggable 
                    onDragStart={(e) => handleDragStart(e, task.id)}
                    className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow cursor-move"
                  >
                    <h4>{task.title}</h4>
                    <p className="text-sm text-gray-500">{task.category}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {viewMode === 'list' && totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-6">
          <button
            disabled={pagination.page === 1}
            onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-gray-600 dark:text-gray-400">
            Page {pagination.page} of {totalPages}
          </span>
          <button
            disabled={pagination.page === totalPages}
            onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}

      {/* Export Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleExportCSV}
        className="fixed bottom-4 right-4 bg-purple-500 text-white p-4 rounded-full shadow-lg hover:bg-purple-600 transition-colors"
        aria-label="Export Tasks"
      >
        <Download size={24} />
      </motion.button>

      <TaskForm
        isOpen={showTaskForm}
        onClose={() => setShowTaskForm(false)}
      />
    </div>
  );
};