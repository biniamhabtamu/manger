import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Plus,
    Search,
    Filter,
    Grid,
    List,
    Trash2,
    CheckCircle2,
    AlertTriangle,
    ChevronLeft,
    ChevronRight,
    Inbox,
    Clock,
    X,
    Calendar,
    Sparkles,
    SlidersHorizontal,
    ArrowUpDown,
    Check,
    Circle,
    Zap,
    Flag
} from 'lucide-react';
import { useTasks } from '../hooks/useTasks';
import { TaskForm } from '../components/tasks/TaskForm';
import { TaskCard } from '../components/tasks/TaskCard';
import { TaskStatus, TaskCategory } from '../types/task';
import { BottomBar } from '../components/layout/BottomBar';

// Skeleton Loader
const SkeletonLoader = () => (
    <div className="px-4 pt-4 pb-20 space-y-4">
        <div className="flex items-center justify-between">
            <div className="space-y-1.5">
                <div className="h-7 w-32 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
                <div className="h-3.5 w-48 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
            </div>
            <div className="h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"></div>
        </div>
        <div className="grid grid-cols-4 gap-2">
            {[...Array(4)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse"></div>
            ))}
        </div>
        <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded-2xl animate-pulse"></div>
        <div className="h-14 bg-gray-200 dark:bg-gray-700 rounded-2xl animate-pulse"></div>
        {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-gray-200 dark:bg-gray-700 p-3.5 rounded-xl animate-pulse">
                <div className="flex items-start gap-3">
                    <div className="h-4 w-4 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
                    <div className="flex-1 space-y-1.5">
                        <div className="h-4 w-3/4 bg-gray-300 dark:bg-gray-600 rounded-lg"></div>
                        <div className="h-3 w-full bg-gray-300 dark:bg-gray-600 rounded-lg"></div>
                    </div>
                </div>
            </div>
        ))}
    </div>
);

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.05 }
    },
};

const itemVariants = {
    hidden: { opacity: 0, y: 12 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.25 } },
};

export const Tasks: React.FC = () => {
    const { tasks, stats, loading, updateTask, deleteTask } = useTasks();
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState<'all' | TaskCategory>('all');
    const [filterStatus, setFilterStatus] = useState<'all' | TaskStatus>('all');
    const [sortBy, setSortBy] = useState<'dueDate-asc' | 'dueDate-desc' | 'priority'>('dueDate-asc');
    const [showTaskForm, setShowTaskForm] = useState(false);
    const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
    const [selectedTasks, setSelectedTasks] = useState<Set<string>>(new Set());
    const [showFilters, setShowFilters] = useState(false);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
                <SkeletonLoader />
                <BottomBar onTaskFormOpen={() => { }} />
            </div>
        );
    }

    let filteredTasks = tasks.filter(task => {
        const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = filterCategory === 'all' || task.category === filterCategory;
        const matchesStatus = filterStatus === 'all' || task.status === filterStatus;
        return matchesSearch && matchesCategory && matchesStatus;
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
        } else if (sortBy === 'priority') {
            const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
            return priorityOrder[b.priority] - priorityOrder[a.priority];
        }
        return 0;
    });

    const completionRate = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;
    const categories = [...new Set(tasks.map(t => t.category))];

    const handleTaskSelect = (id: string) => {
        setSelectedTasks(prev => {
            const newSet = new Set(prev);
            if (newSet.has(id)) newSet.delete(id);
            else newSet.add(id);
            return newSet;
        });
    };

    const handleBulkComplete = () => {
        selectedTasks.forEach(id => {
            const task = tasks.find(t => t.id === id);
            if (task) updateTask({ ...task, status: 'completed' });
        });
        setSelectedTasks(new Set());
    };

    const handleBulkDelete = () => {
        selectedTasks.forEach(id => deleteTask(id));
        setSelectedTasks(new Set());
    };

    const statsData = [
        { label: 'Total', value: stats.total, icon: Inbox, color: 'blue' },
        { label: 'Completed', value: stats.completed, icon: CheckCircle2, color: 'emerald' },
        { label: 'In Progress', value: stats.inProgress, icon: Clock, color: 'amber' },
        { label: 'Overdue', value: stats.overdue, icon: AlertTriangle, color: 'rose' },
    ];

    const statusOptions = [
        { value: 'all', label: 'All' },
        { value: 'todo', label: 'Todo' },
        { value: 'in-progress', label: 'Progress' },
        { value: 'completed', label: 'Done' },
    ];

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-24">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="sticky top-0 z-20 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50 px-4 py-3"
            >
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-bold text-gray-900 dark:text-white">Tasks</h1>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            {filteredTasks.length} tasks • {completionRate}% done
                        </p>
                    </div>
                    <button
                        onClick={() => setShowTaskForm(true)}
                        className="p-2.5 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 transition-all"
                    >
                        <Plus size={20} />
                    </button>
                </div>
            </motion.div>

            <div className="px-4 pt-3 space-y-3 max-w-3xl mx-auto">
                {/* Stats - Compact */}
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="grid grid-cols-4 gap-1.5"
                >
                    {statsData.map((stat, index) => {
                        const Icon = stat.icon;
                        const colorClasses = {
                            blue: 'bg-blue-500/10 text-blue-500',
                            emerald: 'bg-emerald-500/10 text-emerald-500',
                            amber: 'bg-amber-500/10 text-amber-500',
                            rose: 'bg-rose-500/10 text-rose-500',
                        };
                        return (
                            <motion.div
                                key={index}
                                variants={itemVariants}
                                className="bg-white dark:bg-gray-800 rounded-xl p-2.5 shadow-sm border border-gray-100 dark:border-gray-700"
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="text-lg font-bold text-gray-900 dark:text-white">
                                            {stat.value}
                                        </div>
                                        <div className="text-[10px] font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                                            {stat.label}
                                        </div>
                                    </div>
                                    <div className={`p-1.5 rounded-lg ${colorClasses[stat.color as keyof typeof colorClasses]}`}>
                                        <Icon size={12} />
                                    </div>
                                </div>
                                {stat.label === 'Completed' && stats.total > 0 && (
                                    <div className="mt-1.5 h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full transition-all duration-500"
                                            style={{ width: `${completionRate}%` }}
                                        />
                                    </div>
                                )}
                            </motion.div>
                        );
                    })}
                </motion.div>

                {/* Search & Filters - Combined */}
                <div className="space-y-2">
                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                            type="search"
                            placeholder="Search tasks..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-9 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all"
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

                    {/* Quick Filters - Status Pills */}
                    <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
                        {statusOptions.map((status) => (
                            <button
                                key={status.value}
                                onClick={() => setFilterStatus(status.value as 'all' | TaskStatus)}
                                className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${filterStatus === status.value
                                        ? 'bg-blue-500 text-white shadow-sm shadow-blue-500/30'
                                        : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                                    }`}
                            >
                                {status.label}
                            </button>
                        ))}
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1 ${showFilters || filterCategory !== 'all' || sortBy !== 'dueDate-asc'
                                    ? 'bg-blue-500 text-white shadow-sm shadow-blue-500/30'
                                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                                }`}
                        >
                            <SlidersHorizontal size={12} />
                            More
                            {(filterCategory !== 'all' || sortBy !== 'dueDate-asc') && (
                                <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
                            )}
                        </button>
                    </div>

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
                                    <div className="grid grid-cols-2 gap-2">
                                        <div>
                                            <label className="block text-[10px] font-medium text-gray-500 dark:text-gray-400 mb-1">
                                                Category
                                            </label>
                                            <select
                                                value={filterCategory}
                                                onChange={(e) => setFilterCategory(e.target.value as 'all' | TaskCategory)}
                                                className="w-full p-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30"
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
                                            <label className="block text-[10px] font-medium text-gray-500 dark:text-gray-400 mb-1">
                                                Sort by
                                            </label>
                                            <select
                                                value={sortBy}
                                                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                                                className="w-full p-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                                            >
                                                <option value="dueDate-asc">Due Date (Soonest)</option>
                                                <option value="dueDate-desc">Due Date (Latest)</option>
                                                <option value="priority">Priority (High to Low)</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="flex gap-1.5">
                                        <button
                                            onClick={() => setViewMode('list')}
                                            className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center justify-center gap-1 ${viewMode === 'list'
                                                    ? 'bg-blue-500 text-white'
                                                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                                                }`}
                                        >
                                            <List size={14} />
                                            List
                                        </button>
                                        <button
                                            onClick={() => setViewMode('grid')}
                                            className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center justify-center gap-1 ${viewMode === 'grid'
                                                    ? 'bg-blue-500 text-white'
                                                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                                                }`}
                                        >
                                            <Grid size={14} />
                                            Grid
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Bulk Actions */}
                {selectedTasks.size > 0 && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-yellow-50 dark:bg-yellow-900/20 rounded-xl p-3 border border-yellow-200 dark:border-yellow-800"
                    >
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                                {selectedTasks.size} selected
                            </span>
                            <div className="flex gap-1.5">
                                <button
                                    onClick={handleBulkComplete}
                                    className="px-3 py-1.5 bg-emerald-500 text-white rounded-lg text-xs font-medium flex items-center gap-1 hover:bg-emerald-600 transition-colors"
                                >
                                    <CheckCircle2 size={12} />
                                    Complete
                                </button>
                                <button
                                    onClick={handleBulkDelete}
                                    className="px-3 py-1.5 bg-rose-500 text-white rounded-lg text-xs font-medium flex items-center gap-1 hover:bg-rose-600 transition-colors"
                                >
                                    <Trash2 size={12} />
                                    Delete
                                </button>
                                <button
                                    onClick={() => setSelectedTasks(new Set())}
                                    className="px-3 py-1.5 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-xs font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                                >
                                    <X size={12} />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Task List */}
                {viewMode === 'list' ? (
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className="space-y-2.5"
                    >
                        <AnimatePresence mode="wait">
                            {filteredTasks.length === 0 ? (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="text-center py-16 bg-white/50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-700"
                                >
                                    <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Inbox size={32} className="text-gray-400" />
                                    </div>
                                    <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                                        {tasks.length === 0 ? 'No tasks yet' : 'No results found'}
                                    </h3>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                        {tasks.length === 0
                                            ? 'Create your first task to get started'
                                            : 'Try adjusting your search or filters'}
                                    </p>
                                    {tasks.length === 0 && (
                                        <button
                                            onClick={() => setShowTaskForm(true)}
                                            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg text-xs font-medium flex items-center gap-1.5 mx-auto hover:bg-blue-600 transition-colors"
                                        >
                                            <Plus size={14} />
                                            Add Task
                                        </button>
                                    )}
                                </motion.div>
                            ) : (
                                filteredTasks.map((task, index) => (
                                    <motion.div
                                        key={task.id}
                                        variants={itemVariants}
                                        className="relative"
                                    >
                                        <input
                                            type="checkbox"
                                            checked={selectedTasks.has(task.id)}
                                            onChange={() => handleTaskSelect(task.id)}
                                            className="absolute top-3 left-3 z-10 w-4 h-4 rounded border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 checked:bg-blue-500 checked:border-blue-500 focus:ring-2 focus:ring-blue-500/30 transition-all cursor-pointer"
                                        />
                                        <TaskCard task={task} index={index} compact />
                                    </motion.div>
                                ))
                            )}
                        </AnimatePresence>
                    </motion.div>
                ) : (
                    <div className="grid grid-cols-2 gap-2.5">
                        {filteredTasks.map((task, index) => (
                            <motion.div
                                key={task.id}
                                variants={itemVariants}
                                initial="hidden"
                                animate="visible"
                                className="relative"
                            >
                                <input
                                    type="checkbox"
                                    checked={selectedTasks.has(task.id)}
                                    onChange={() => handleTaskSelect(task.id)}
                                    className="absolute top-2 left-2 z-10 w-4 h-4 rounded border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 checked:bg-blue-500 checked:border-blue-500 focus:ring-2 focus:ring-blue-500/30 transition-all cursor-pointer"
                                />
                                <div className="bg-white dark:bg-gray-800 rounded-xl p-3 shadow-sm border border-gray-100 dark:border-gray-700">
                                    <h4 className="text-sm font-medium text-gray-900 dark:text-white line-clamp-2">
                                        {task.title}
                                    </h4>
                                    <div className="flex flex-wrap items-center gap-1 mt-2">
                                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${task.priority === 'urgent' ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400' :
                                                task.priority === 'high' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' :
                                                    task.priority === 'medium' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                                                        'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                                            }`}>
                                            {task.priority}
                                        </span>
                                        {task.dueDate && (
                                            <span className="text-[10px] text-gray-500 dark:text-gray-400 flex items-center gap-0.5">
                                                <Calendar size={10} />
                                                {new Date(task.dueDate).toLocaleDateString()}
                                            </span>
                                        )}
                                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${task.status === 'completed' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                                                task.status === 'in-progress' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                                                    'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                                            }`}>
                                            {task.status === 'completed' ? '✓ Done' :
                                                task.status === 'in-progress' ? '⟳ Progress' : '○ Todo'}
                                        </span>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}

                {/* Quick Stats Summary */}
                {filteredTasks.length > 0 && (
                    <div className="flex items-center justify-between px-2 py-2 bg-white/50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700">
                        <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                            <span>Total: {filteredTasks.length}</span>
                            <span>•</span>
                            <span className="text-emerald-500">
                                Done: {filteredTasks.filter(t => t.status === 'completed').length}
                            </span>
                            <span>•</span>
                            <span className="text-amber-500">
                                Progress: {filteredTasks.filter(t => t.status === 'in-progress').length}
                            </span>
                        </div>
                        <span className="text-xs text-gray-400 dark:text-gray-500">
                            {completionRate}% complete
                        </span>
                    </div>
                )}

                {/* Tip */}
                <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-xl p-2.5 flex items-start gap-2.5 border border-indigo-100 dark:border-indigo-800/50">
                    <div className="p-1.5 rounded-lg bg-indigo-100 dark:bg-indigo-800/50 flex-shrink-0">
                        <Sparkles size={14} className="text-indigo-600 dark:text-indigo-300" />
                    </div>
                    <div>
                        <h4 className="font-medium text-xs text-indigo-800 dark:text-indigo-200">Pro Tip</h4>
                        <p className="text-[10px] text-indigo-600 dark:text-indigo-300/80">
                            Tap + to add tasks. Select multiple tasks for bulk actions.
                        </p>
                    </div>
                </div>
            </div>

            {/* Task Form */}
            <TaskForm
                isOpen={showTaskForm}
                onClose={() => setShowTaskForm(false)}
            />

            {/* Bottom Bar */}
            <BottomBar onTaskFormOpen={() => setShowTaskForm(true)} />
        </div>
    );
};

export default Tasks;