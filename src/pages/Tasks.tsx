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
    X,
    MoreVertical,
    Calendar,
    Tag,
    Flag,
    Users,
    Settings,
    Home,
    Folder,
    Star,
    TrendingUp,
    Zap,
    Moon,
    Sun,
    LayoutGrid,
    ListChecks,
    PlusCircle,
    ArrowUpDown,
    SlidersHorizontal,
    Eye,
    EyeOff,
    Loader2
} from 'lucide-react';
import { useTasks } from '../hooks/useTasks';
import { TaskForm } from '../components/tasks/TaskForm';
import { TaskCard } from '../components/tasks/TaskCard';
import { TaskStatus, TaskCategory } from '../types/task';
import { BottomBar } from '../components/layout/BottomBar';

// Modern Skeleton Loader with shimmer effect
const SkeletonLoader = () => (
    <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="px-4 pt-4 pb-20 space-y-4"
    >
        {/* Header Skeleton */}
        <div className="flex items-center justify-between">
            <div className="space-y-1.5">
                <div className="h-7 w-32 skeleton-pulse rounded-lg"></div>
                <div className="h-3.5 w-48 skeleton-pulse rounded-lg"></div>
            </div>
            <div className="h-10 w-10 skeleton-pulse rounded-full"></div>
        </div>

        {/* Stats Grid Skeleton - Compact */}
        <div className="grid grid-cols-4 gap-2">
            {[...Array(4)].map((_, i) => (
                <div key={i} className="h-16 skeleton-pulse rounded-xl"></div>
            ))}
        </div>

        {/* Search Skeleton */}
        <div className="h-12 skeleton-pulse rounded-2xl"></div>

        {/* Filter Bar Skeleton */}
        <div className="h-14 skeleton-pulse rounded-2xl"></div>

        {/* Task List Skeleton */}
        <div className="space-y-2.5">
            {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white/70 dark:bg-gray-800/70 p-3.5 rounded-xl space-y-2 shadow-sm">
                    <div className="flex items-start gap-3">
                        <div className="h-4 w-4 skeleton-pulse rounded-full mt-0.5"></div>
                        <div className="flex-1 space-y-1.5">
                            <div className="h-4 w-3/4 skeleton-pulse rounded-lg"></div>
                            <div className="h-3 w-full skeleton-pulse rounded-lg"></div>
                            <div className="flex gap-1.5">
                                <div className="h-5 w-12 skeleton-pulse rounded-full"></div>
                                <div className="h-5 w-16 skeleton-pulse rounded-full"></div>
                            </div>
                        </div>
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
        transition: { staggerChildren: 0.06, delayChildren: 0.1 },
    },
};

const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.25, ease: [0.22, 1, 0.36, 1] } },
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
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [showStats, setShowStats] = useState(true);

    // Toggle dark mode
    const toggleDarkMode = () => {
        setIsDarkMode(!isDarkMode);
        document.documentElement.classList.toggle('dark');
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
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

    // Quick stats data - Compact version
    const statsData = [
        { label: 'Total', value: stats.total, icon: Inbox, color: 'from-blue-500 to-blue-600' },
        { label: 'Completed', value: stats.completed, icon: CheckCircle2, color: 'from-emerald-500 to-emerald-600' },
        { label: 'In Progress', value: stats.inProgress, icon: Clock, color: 'from-amber-500 to-amber-600' },
        { label: 'Overdue', value: stats.overdue, icon: AlertTriangle, color: 'from-rose-500 to-rose-600' },
    ];

    return (
        <div className={`min-h-screen transition-colors duration-300 ${isDarkMode
                ? 'bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900'
                : 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50'
            } pb-24`}>

            {/* Header - Compact with Theme Toggle */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`sticky top-0 z-20 ${isDarkMode
                        ? 'bg-gray-900/80 backdrop-blur-xl border-gray-800'
                        : 'bg-white/70 backdrop-blur-xl border-gray-200/50'
                    } backdrop-blur-xl border-b px-4 py-3`}
            >
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className={`text-xl font-bold tracking-tight ${isDarkMode ? 'text-white' : 'text-gray-900'
                            }`}>
                            Tasks
                        </h1>
                        <p className={`text-xs mt-0.5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'
                            }`}>
                            {filteredTasks.length} tasks • {completionRate}% done
                        </p>
                    </div>

                    <div className="flex items-center gap-1.5">
                        {/* Theme Toggle - Only in Header */}
                        <button
                            onClick={toggleDarkMode}
                            className={`p-2 rounded-full transition-all ${isDarkMode
                                    ? 'bg-yellow-500/20 text-yellow-400'
                                    : 'bg-indigo-500/10 text-indigo-600'
                                }`}
                        >
                            {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
                        </button>

                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.92 }}
                            onClick={() => setShowTaskForm(true)}
                            className={`p-2.5 rounded-full shadow-lg ${isDarkMode
                                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                                    : 'bg-blue-500 hover:bg-blue-600 text-white'
                                } transition-all`}
                        >
                            <Plus size={20} />
                        </motion.button>
                    </div>
                </div>
            </motion.div>

            <div className="px-4 pt-3 space-y-3 max-w-3xl mx-auto">
                {/* Quick Stats - MINIMIZED CARDS (No theme toggle) */}
                {showStats && (
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className="grid grid-cols-4 gap-1.5"
                    >
                        {statsData.map((stat, index) => {
                            const Icon = stat.icon;
                            return (
                                <motion.div
                                    key={index}
                                    variants={itemVariants}
                                    className={`relative overflow-hidden rounded-xl p-2.5 ${isDarkMode
                                            ? 'bg-gray-800/80 border border-gray-700'
                                            : 'bg-white/80 backdrop-blur-sm border border-white/50'
                                        } shadow-sm`}
                                >
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <div className={`text-lg font-bold leading-none ${isDarkMode ? 'text-white' : 'text-gray-900'
                                                }`}>
                                                {stat.value}
                                            </div>
                                            <div className={`text-[10px] font-medium mt-0.5 uppercase tracking-wide ${isDarkMode ? 'text-gray-400' : 'text-gray-500'
                                                }`}>
                                                {stat.label}
                                            </div>
                                        </div>
                                        <div className={`p-1.5 rounded-lg bg-gradient-to-br ${stat.color} bg-opacity-20`}>
                                            <Icon size={12} className="text-white" />
                                        </div>
                                    </div>
                                    {/* Mini progress bar for completed */}
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
                )}

                {/* Search - Compact */}
                <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative"
                >
                    <Search className={`absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-400'
                        }`} />
                    <input
                        type="search"
                        placeholder="Search tasks..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className={`w-full pl-10 pr-9 py-2.5 rounded-xl border text-sm ${isDarkMode
                                ? 'bg-gray-800/80 border-gray-700 text-white placeholder-gray-400 focus:border-blue-500'
                                : 'bg-white/80 border-gray-200/70 text-gray-900 placeholder-gray-400 focus:border-blue-400'
                            } focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all backdrop-blur-sm`}
                        aria-label="Search tasks"
                        spellCheck={false}
                        autoComplete="off"
                    />
                    {searchTerm && (
                        <button
                            onClick={() => setSearchTerm('')}
                            className={`absolute right-3.5 top-1/2 -translate-y-1/2 p-0.5 rounded-full ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                                } transition-colors`}
                        >
                            <X size={14} className={isDarkMode ? 'text-gray-400' : 'text-gray-400'} />
                        </button>
                    )}
                </motion.div>

                {/* Controls - Compact */}
                <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`rounded-xl p-2.5 ${isDarkMode
                            ? 'bg-gray-800/80 border border-gray-700'
                            : 'bg-white/80 backdrop-blur-sm border border-white/50'
                        } shadow-sm`}
                >
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${showFilters
                                        ? 'bg-blue-500 text-white'
                                        : isDarkMode
                                            ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                <SlidersHorizontal size={14} />
                                <span>Filters</span>
                                {(filterCategory !== 'all' || filterStatus !== 'all') && (
                                    <span className="w-1 h-1 rounded-full bg-blue-400 ml-0.5"></span>
                                )}
                            </button>

                            <div className="flex gap-0.5">
                                <button
                                    onClick={() => setViewMode('list')}
                                    className={`p-1.5 rounded-lg transition-all ${viewMode === 'list'
                                            ? isDarkMode ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white'
                                            : isDarkMode ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-500'
                                        }`}
                                >
                                    <List size={15} />
                                </button>
                                <button
                                    onClick={() => setViewMode('kanban')}
                                    className={`p-1.5 rounded-lg transition-all ${viewMode === 'kanban'
                                            ? isDarkMode ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white'
                                            : isDarkMode ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-500'
                                        }`}
                                >
                                    <LayoutGrid size={15} />
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center gap-0.5">
                            <button
                                onClick={() => setShowStats(!showStats)}
                                className={`p-1.5 rounded-lg transition-all ${isDarkMode ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-500'
                                    }`}
                            >
                                {showStats ? <Eye size={14} /> : <EyeOff size={14} />}
                            </button>
                            <button
                                onClick={handleExportCSV}
                                className={`p-1.5 rounded-lg transition-all ${isDarkMode ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-500'
                                    }`}
                            >
                                <Download size={14} />
                            </button>
                        </div>
                    </div>

                    {/* Expandable Filters - Compact */}
                    <AnimatePresence>
                        {showFilters && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="overflow-hidden mt-2 pt-2 border-t border-gray-200/50 dark:border-gray-700/50"
                            >
                                <div className="space-y-2">
                                    <div className="grid grid-cols-2 gap-1.5">
                                        <div>
                                            <label className={`block text-[10px] font-medium mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'
                                                }`}>
                                                Category
                                            </label>
                                            <select
                                                value={filterCategory}
                                                onChange={(e) => setFilterCategory(e.target.value as 'all' | TaskCategory)}
                                                className={`w-full p-2 rounded-lg text-xs border ${isDarkMode
                                                        ? 'bg-gray-700 border-gray-600 text-white'
                                                        : 'bg-white border-gray-200 text-gray-900'
                                                    } focus:outline-none focus:ring-2 focus:ring-blue-500/30`}
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
                                            <label className={`block text-[10px] font-medium mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'
                                                }`}>
                                                Status
                                            </label>
                                            <select
                                                value={filterStatus}
                                                onChange={(e) => setFilterStatus(e.target.value as 'all' | TaskStatus)}
                                                className={`w-full p-2 rounded-lg text-xs border ${isDarkMode
                                                        ? 'bg-gray-700 border-gray-600 text-white'
                                                        : 'bg-white border-gray-200 text-gray-900'
                                                    } focus:outline-none focus:ring-2 focus:ring-blue-500/30`}
                                            >
                                                <option value="all">All Status</option>
                                                <option value="todo">To Do</option>
                                                <option value="in-progress">In Progress</option>
                                                <option value="completed">Completed</option>
                                                <option value="archived">Archived</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div>
                                        <label className={`block text-[10px] font-medium mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'
                                            }`}>
                                            Sort by
                                        </label>
                                        <select
                                            value={sortBy}
                                            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                                            className={`w-full p-2 rounded-lg text-xs border ${isDarkMode
                                                    ? 'bg-gray-700 border-gray-600 text-white'
                                                    : 'bg-white border-gray-200 text-gray-900'
                                                } focus:outline-none focus:ring-2 focus:ring-blue-500/30`}
                                        >
                                            <option value="dueDate-asc">Due Date (Soonest)</option>
                                            <option value="dueDate-desc">Due Date (Latest)</option>
                                            <option value="priority">Priority (High to Low)</option>
                                            <option value="status">Status</option>
                                        </select>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>

                {/* Bulk Actions - Compact */}
                {selectedTasks.size > 0 && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className={`rounded-xl p-3 ${isDarkMode
                                ? 'bg-gray-800/90 border border-gray-700'
                                : 'bg-white/90 backdrop-blur-sm border border-white/50'
                            } shadow-lg`}
                    >
                        <div className="flex items-center justify-between mb-2">
                            <span className={`text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'
                                }`}>
                                {selectedTasks.size} selected
                            </span>
                            <button
                                onClick={() => setSelectedTasks(new Set())}
                                className={`p-1 rounded-full ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                                    } transition-colors`}
                            >
                                <X size={16} className={isDarkMode ? 'text-gray-400' : 'text-gray-500'} />
                            </button>
                        </div>
                        <div className="flex gap-1.5">
                            <motion.button
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setBulkAction('complete')}
                                className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-1.5 text-xs font-medium ${bulkAction === 'complete'
                                        ? 'bg-emerald-500 text-white'
                                        : isDarkMode
                                            ? 'bg-gray-700 text-gray-300'
                                            : 'bg-gray-100 text-gray-700'
                                    } transition-colors`}
                            >
                                <CheckCircle2 size={14} />
                                Complete
                            </motion.button>
                            <motion.button
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setBulkAction('delete')}
                                className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-1.5 text-xs font-medium ${bulkAction === 'delete'
                                        ? 'bg-rose-500 text-white'
                                        : isDarkMode
                                            ? 'bg-gray-700 text-gray-300'
                                            : 'bg-gray-100 text-gray-700'
                                    } transition-colors`}
                            >
                                <Trash2 size={14} />
                                Delete
                            </motion.button>
                            <motion.button
                                whileTap={{ scale: 0.95 }}
                                onClick={handleBulkAction}
                                disabled={bulkAction === 'none'}
                                className={`px-3 py-2 rounded-lg text-xs font-medium ${bulkAction !== 'none'
                                        ? 'bg-blue-500 text-white'
                                        : isDarkMode
                                            ? 'bg-gray-700 text-gray-500'
                                            : 'bg-gray-200 text-gray-400'
                                    } transition-colors disabled:opacity-50`}
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
                        className="space-y-2.5"
                    >
                        <AnimatePresence mode="wait">
                            {paginatedTasks.length === 0 ? (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className={`text-center py-12 rounded-2xl ${isDarkMode
                                            ? 'bg-gray-800/50 border border-gray-700'
                                            : 'bg-white/50 backdrop-blur-sm border border-white/50'
                                        }`}
                                >
                                    <div className="flex justify-center mb-3">
                                        <div className={`p-3 rounded-full ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
                                            }`}>
                                            <Inbox size={32} className={isDarkMode ? 'text-gray-500' : 'text-gray-400'} />
                                        </div>
                                    </div>
                                    <h3 className={`text-base font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'
                                        }`}>
                                        {tasks.length === 0 ? 'No tasks yet' : 'No results found'}
                                    </h3>
                                    <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'
                                        }`}>
                                        {tasks.length === 0
                                            ? 'Create your first task to get started'
                                            : 'Try adjusting your search or filters'}
                                    </p>
                                    {tasks.length === 0 && (
                                        <motion.button
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => setShowTaskForm(true)}
                                            className={`mt-3 px-4 py-2 rounded-lg text-xs font-medium flex items-center gap-1.5 mx-auto ${isDarkMode
                                                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                                                    : 'bg-blue-500 text-white hover:bg-blue-600'
                                                } transition-colors`}
                                        >
                                            <Plus size={14} />
                                            Add Task
                                        </motion.button>
                                    )}
                                </motion.div>
                            ) : (
                                paginatedTasks.map((task, index) => (
                                    <motion.div
                                        key={task.id}
                                        variants={itemVariants}
                                        className="relative"
                                    >
                                        <input
                                            type="checkbox"
                                            checked={selectedTasks.has(task.id)}
                                            onChange={() => handleTaskSelect(task.id)}
                                            className={`absolute top-3 left-3 z-10 w-4 h-4 rounded-full border-2 ${isDarkMode
                                                    ? 'border-gray-600 bg-gray-700 checked:bg-blue-600 checked:border-blue-600'
                                                    : 'border-gray-300 bg-white checked:bg-blue-500 checked:border-blue-500'
                                                } focus:ring-2 focus:ring-blue-500/30 transition-all cursor-pointer`}
                                        />
                                        <TaskCard task={task} index={index} compact />
                                    </motion.div>
                                ))
                            )}
                        </AnimatePresence>
                    </motion.div>
                ) : (
                    // Kanban View - Compact
                    <div className="overflow-x-auto pb-3 -mx-1 px-1">
                        <div className="flex gap-3 min-w-max">
                            {Object.entries(kanbanColumns).map(([status, columnTasks]) => (
                                <div
                                    key={status}
                                    onDrop={(e) => handleDrop(e, status as TaskStatus)}
                                    onDragOver={handleDragOver}
                                    className={`min-w-[240px] rounded-xl p-2.5 ${isDarkMode
                                            ? 'bg-gray-800/60 border border-gray-700'
                                            : 'bg-white/60 backdrop-blur-sm border border-white/50'
                                        }`}
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <h3 className={`text-xs font-semibold capitalize ${isDarkMode ? 'text-white' : 'text-gray-900'
                                            }`}>
                                            {status.replace('-', ' ')}
                                        </h3>
                                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${isDarkMode ? 'bg-gray-700 text-gray-400' : 'bg-gray-200 text-gray-600'
                                            }`}>
                                            {columnTasks.length}
                                        </span>
                                    </div>
                                    <div className="space-y-2">
                                        {columnTasks.map(task => (
                                            <div
                                                key={task.id}
                                                draggable
                                                onDragStart={(e) => handleDragStart(e, task.id)}
                                                className={`p-2.5 rounded-lg shadow-sm cursor-move transition-all ${isDarkMode
                                                        ? 'bg-gray-700/80 hover:bg-gray-600/80 border border-gray-600'
                                                        : 'bg-white hover:shadow-md border border-gray-100'
                                                    }`}
                                            >
                                                <h4 className={`text-xs font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'
                                                    }`}>
                                                    {task.title}
                                                </h4>
                                                <p className={`text-[10px] mt-0.5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'
                                                    }`}>
                                                    {task.category.replace('-', ' ')}
                                                </p>
                                                {task.dueDate && (
                                                    <div className={`text-[10px] mt-1 flex items-center gap-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'
                                                        }`}>
                                                        <Calendar size={10} />
                                                        {new Date(task.dueDate).toLocaleDateString()}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                        {columnTasks.length === 0 && (
                                            <div className={`text-center py-4 text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'
                                                }`}>
                                                No tasks
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Pagination - Compact */}
                {viewMode === 'list' && totalPages > 1 && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className={`flex items-center justify-between px-2 py-2 rounded-xl ${isDarkMode
                                ? 'bg-gray-800/60 border border-gray-700'
                                : 'bg-white/60 backdrop-blur-sm border border-white/50'
                            }`}
                    >
                        <button
                            disabled={pagination.page === 1}
                            onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${pagination.page === 1
                                    ? isDarkMode ? 'text-gray-600 cursor-not-allowed' : 'text-gray-300 cursor-not-allowed'
                                    : isDarkMode ? 'text-white hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'
                                }`}
                        >
                            <ChevronLeft size={14} />
                            <span className="hidden sm:inline">Previous</span>
                        </button>

                        <span className={`text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'
                            }`}>
                            {pagination.page} / {totalPages}
                        </span>

                        <button
                            disabled={pagination.page === totalPages}
                            onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${pagination.page === totalPages
                                    ? isDarkMode ? 'text-gray-600 cursor-not-allowed' : 'text-gray-300 cursor-not-allowed'
                                    : isDarkMode ? 'text-white hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'
                                }`}
                        >
                            <span className="hidden sm:inline">Next</span>
                            <ChevronRight size={14} />
                        </button>
                    </motion.div>
                )}

                {/* Native Tip Card - Compact */}
                <motion.div
                    className={`rounded-xl p-2.5 flex items-start gap-2.5 ${isDarkMode
                            ? 'bg-indigo-900/30 border border-indigo-800/50'
                            : 'bg-indigo-50/80 backdrop-blur-sm border border-indigo-100'
                        }`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                >
                    <div className={`p-1.5 rounded-lg flex-shrink-0 ${isDarkMode ? 'bg-indigo-800/50' : 'bg-indigo-100'
                        }`}>
                        <Sparkles size={14} className={isDarkMode ? 'text-indigo-300' : 'text-indigo-600'} />
                    </div>
                    <div>
                        <h4 className={`font-medium text-xs ${isDarkMode ? 'text-indigo-200' : 'text-indigo-800'
                            }`}>
                            Pro Tip
                        </h4>
                        <p className={`text-[10px] mt-0.5 ${isDarkMode ? 'text-indigo-300/80' : 'text-indigo-600/80'
                            }`}>
                            Tap + to quickly add tasks. Swipe to mark complete.
                        </p>
                    </div>
                </motion.div>
            </div>

            {/* Floating Action Button - Compact */}
            <motion.button
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.92 }}
                onClick={() => setShowTaskForm(true)}
                className={`fixed bottom-20 right-4 p-3.5 rounded-full shadow-2xl z-10 ${isDarkMode
                        ? 'bg-blue-600 hover:bg-blue-700 text-white'
                        : 'bg-blue-500 hover:bg-blue-600 text-white'
                    } transition-all`}
            >
                <Plus size={20} />
            </motion.button>

            {/* Task Form Modal */}
            <TaskForm
                isOpen={showTaskForm}
                onClose={() => setShowTaskForm(false)}
            />

            {/* Bottom Navigation */}
            <div className="fixed bottom-0 left-0 right-0 z-30">
                <BottomBar />
            </div>
        </div>
    );
};