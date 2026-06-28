import React, { useState, useEffect } from 'react';
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
    Flag,
    Target,
    Activity,
    Flame,
    Award,
    TrendingUp,
    BarChart3,
    Eye,
    EyeOff,
    Gift,
    Star,
    Crown,
    User,
    Bell,
    MoreHorizontal,
    Settings,
    LayoutGrid,
    ListChecks,
    FolderKanban,
    PieChart,
    ArrowRight,
    ChevronDown
} from 'lucide-react';
import { useTasks } from '../hooks/useTasks';
import { TaskForm } from '../components/tasks/TaskForm';
import { TaskCard } from '../components/tasks/TaskCard';
import { TaskStatus, TaskCategory } from '../types/task';
import { BottomBar } from '../components/layout/BottomBar';
import { Link } from 'react-router-dom';

// Skeleton Loader - Native Style
const SkeletonLoader = () => (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#0f172a]">
        <div className="px-4 pt-6 pb-20 space-y-4">
            <div className="flex items-center justify-between animate-pulse">
                <div className="space-y-2">
                    <div className="h-7 w-40 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
                    <div className="h-4 w-56 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                </div>
                <div className="h-12 w-12 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
            </div>
            <div className="grid grid-cols-4 gap-2 animate-pulse">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-20 bg-gray-200 dark:bg-gray-700 rounded-2xl"></div>
                ))}
            </div>
            <div className="h-14 bg-gray-200 dark:bg-gray-700 rounded-2xl animate-pulse"></div>
            <div className="h-40 bg-gray-200 dark:bg-gray-700 rounded-2xl animate-pulse"></div>
            {[...Array(3)].map((_, i) => (
                <div key={i} className="h-20 bg-gray-200 dark:bg-gray-700 rounded-2xl animate-pulse"></div>
            ))}
        </div>
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
    const [showHabits, setShowHabits] = useState(true);
    const [activeQuickFilter, setActiveQuickFilter] = useState<'all' | 'today' | 'upcoming' | 'completed'>('all');

    // Get habits from localStorage
    const [habits, setHabits] = useState<any[]>([]);

    useEffect(() => {
        const saved = localStorage.getItem('habits');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                setHabits(parsed);
            } catch (e) {
                console.error('Error loading habits:', e);
            }
        }
    }, []);

    if (loading) {
        return <SkeletonLoader />;
    }

    // Filter tasks based on quick filter
    let filteredTasks = tasks.filter(task => {
        const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = filterCategory === 'all' || task.category === filterCategory;
        const matchesStatus = filterStatus === 'all' || task.status === filterStatus;

        let matchesQuickFilter = true;
        if (activeQuickFilter === 'today') {
            const today = new Date().toDateString();
            matchesQuickFilter = task.dueDate && new Date(task.dueDate).toDateString() === today;
        } else if (activeQuickFilter === 'upcoming') {
            matchesQuickFilter = task.dueDate && new Date(task.dueDate) > new Date() && task.status !== 'completed';
        } else if (activeQuickFilter === 'completed') {
            matchesQuickFilter = task.status === 'completed';
        }

        return matchesSearch && matchesCategory && matchesStatus && matchesQuickFilter;
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

    // Calculate habit stats
    const activeHabits = habits.filter(h => h.active !== false).length;
    const habitCompletionRate = habits.length > 0
        ? Math.round((habits.filter(h => h.totalCompletions > 0).length / habits.length) * 100)
        : 0;
    const totalHabitStreak = habits.reduce((sum, h) => sum + (h.currentStreak || 0), 0);
    const bestHabitStreak = Math.max(...habits.map(h => h.bestStreak || 0), 0);

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
        { label: 'Total', value: stats.total, icon: Inbox, color: '#3B82F6', bg: 'bg-blue-500/10' },
        { label: 'Completed', value: stats.completed, icon: CheckCircle2, color: '#10B981', bg: 'bg-emerald-500/10' },
        { label: 'Progress', value: stats.inProgress, icon: Clock, color: '#F59E0B', bg: 'bg-amber-500/10' },
        { label: 'Overdue', value: stats.overdue, icon: AlertTriangle, color: '#EF4444', bg: 'bg-rose-500/10' },
    ];

    const quickFilters = [
        { id: 'all', label: 'All', icon: LayoutGrid },
        { id: 'today', label: 'Today', icon: Calendar },
        { id: 'upcoming', label: 'Upcoming', icon: ArrowRight },
        { id: 'completed', label: 'Done', icon: CheckCircle2 },
    ];

    const statusOptions = [
        { value: 'all', label: 'All' },
        { value: 'todo', label: 'Todo' },
        { value: 'in-progress', label: 'Progress' },
        { value: 'completed', label: 'Done' },
    ];

    return (
        <div className="min-h-screen bg-[#f8fafc] dark:bg-[#0f172a] pb-24">
            {/* Native Status Bar Spacer */}
            <div className="h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>

            {/* Header - Native Style */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="sticky top-0 z-20 bg-white/95 dark:bg-[#1e293b]/95 backdrop-blur-xl border-b border-gray-100/50 dark:border-gray-700/50 px-4 pt-4 pb-3"
            >
                <div className="flex items-center justify-between">
                    <div>
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center shadow-lg shadow-blue-500/25">
                                <ListChecks size={16} className="text-white" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-gray-900 dark:text-white">My Tasks</h1>
                                <p className="text-[10px] text-gray-500 dark:text-gray-400">
                                    {filteredTasks.length} tasks • {completionRate}% done
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <motion.button
                            whileTap={{ scale: 0.9 }}
                            className="p-2 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors relative"
                        >
                            <Bell size={18} />
                            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                        </motion.button>
                        <motion.button
                            whileTap={{ scale: 0.9 }}
                            onClick={() => setShowTaskForm(true)}
                            className="p-2 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 transition-all flex items-center gap-1.5 px-3"
                        >
                            <Plus size={18} />
                            <span className="text-xs font-medium hidden sm:inline">Add</span>
                        </motion.button>
                    </div>
                </div>
            </motion.div>

            <div className="px-4 pt-3 space-y-3 max-w-3xl mx-auto">
                {/* Stats - Modern Cards */}
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="grid grid-cols-4 gap-2"
                >
                    {statsData.map((stat, index) => {
                        const Icon = stat.icon;
                        return (
                            <motion.div
                                key={index}
                                variants={itemVariants}
                                className="bg-white dark:bg-[#1e293b] rounded-2xl p-3 shadow-sm border border-gray-100 dark:border-gray-700/50"
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="text-xl font-bold text-gray-900 dark:text-white">
                                            {stat.value}
                                        </div>
                                        <div className="text-[9px] font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            {stat.label}
                                        </div>
                                    </div>
                                    <div className={`p-2 rounded-xl ${stat.bg}`} style={{ color: stat.color }}>
                                        <Icon size={14} />
                                    </div>
                                </div>
                                {stat.label === 'Completed' && stats.total > 0 && (
                                    <div className="mt-2 h-1 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${completionRate}%` }}
                                            transition={{ duration: 0.8, ease: "easeOut" }}
                                            className="h-full rounded-full"
                                            style={{ background: `linear-gradient(90deg, #10B981, #34D399)` }}
                                        />
                                    </div>
                                )}
                            </motion.div>
                        );
                    })}
                </motion.div>

                {/* Habit Tracker Section - Native Style */}
                {habits.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-gradient-to-br from-purple-500/10 via-indigo-500/10 to-blue-500/10 dark:from-purple-500/5 dark:via-indigo-500/5 dark:to-blue-500/5 rounded-2xl p-3.5 border border-purple-200/50 dark:border-purple-800/30 backdrop-blur-sm"
                    >
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2.5">
                                <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-500 shadow-lg shadow-purple-500/25">
                                    <Target size={14} className="text-white" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-gray-900 dark:text-white">Habit Tracker</h3>
                                    <p className="text-[10px] text-gray-500 dark:text-gray-400">
                                        {activeHabits} active habits • {totalHabitStreak} day streak
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <motion.button
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => setShowHabits(!showHabits)}
                                    className="p-1.5 rounded-lg bg-white/50 dark:bg-gray-700/50 hover:bg-white dark:hover:bg-gray-600 transition-colors"
                                >
                                    {showHabits ? <EyeOff size={14} className="text-gray-500" /> : <Eye size={14} className="text-gray-500" />}
                                </motion.button>
                                <Link to="/habits">
                                    <motion.button
                                        whileTap={{ scale: 0.9 }}
                                        className="px-3 py-1.5 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-lg text-[10px] font-medium hover:shadow-lg transition-all flex items-center gap-1"
                                    >
                                        <BarChart3 size={10} />
                                        View All
                                    </motion.button>
                                </Link>
                            </div>
                        </div>

                        <AnimatePresence>
                            {showHabits && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="overflow-hidden"
                                >
                                    <div className="grid grid-cols-4 gap-1.5 mb-2.5">
                                        <div className="bg-white/80 dark:bg-gray-800/80 rounded-xl p-2.5 border border-purple-100 dark:border-purple-800/30">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-1.5">
                                                    <Flame size={12} className="text-orange-500" />
                                                    <span className="text-[9px] text-gray-500 dark:text-gray-400">Streak</span>
                                                </div>
                                                <span className="text-sm font-bold text-orange-500">{totalHabitStreak}</span>
                                            </div>
                                        </div>
                                        <div className="bg-white/80 dark:bg-gray-800/80 rounded-xl p-2.5 border border-purple-100 dark:border-purple-800/30">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-1.5">
                                                    <Award size={12} className="text-yellow-500" />
                                                    <span className="text-[9px] text-gray-500 dark:text-gray-400">Best</span>
                                                </div>
                                                <span className="text-sm font-bold text-yellow-500">{bestHabitStreak}</span>
                                            </div>
                                        </div>
                                        <div className="bg-white/80 dark:bg-gray-800/80 rounded-xl p-2.5 border border-purple-100 dark:border-purple-800/30">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-1.5">
                                                    <Activity size={12} className="text-emerald-500" />
                                                    <span className="text-[9px] text-gray-500 dark:text-gray-400">Active</span>
                                                </div>
                                                <span className="text-sm font-bold text-emerald-500">{activeHabits}</span>
                                            </div>
                                        </div>
                                        <div className="bg-white/80 dark:bg-gray-800/80 rounded-xl p-2.5 border border-purple-100 dark:border-purple-800/30">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-1.5">
                                                    <TrendingUp size={12} className="text-blue-500" />
                                                    <span className="text-[9px] text-gray-500 dark:text-gray-400">Rate</span>
                                                </div>
                                                <span className="text-sm font-bold text-blue-500">{habitCompletionRate}%</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-1.5">
                                        {habits.slice(0, 2).map((habit) => (
                                            <div
                                                key={habit.id}
                                                className="flex items-center gap-2.5 bg-white/80 dark:bg-gray-800/80 rounded-xl p-2.5 border border-gray-100 dark:border-gray-700/50"
                                            >
                                                <span className="text-xl">{habit.icon || '🌟'}</span>
                                                <span className="text-xs font-medium text-gray-700 dark:text-gray-300 flex-1 truncate">
                                                    {habit.name}
                                                </span>
                                                <div className="flex items-center gap-1.5">
                                                    <Flame size={10} className="text-orange-400" />
                                                    <span className="text-[10px] font-bold text-orange-500">
                                                        {habit.currentStreak || 0}
                                                    </span>
                                                </div>
                                                <div className="w-16 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full rounded-full transition-all duration-500"
                                                        style={{
                                                            width: `${Math.min((habit.totalCompletions || 0) / 30 * 100, 100)}%`,
                                                            backgroundColor: habit.color || '#8B5CF6'
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                        {habits.length > 2 && (
                                            <Link
                                                to="/habits"
                                                className="block text-center text-[10px] text-purple-500 hover:text-purple-600 transition-colors py-1"
                                            >
                                                +{habits.length - 2} more habits
                                            </Link>
                                        )}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                )}

                {/* Quick Filters - Native Pills */}
                <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
                    {quickFilters.map((filter) => {
                        const Icon = filter.icon;
                        const isActive = activeQuickFilter === filter.id;
                        return (
                            <motion.button
                                key={filter.id}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setActiveQuickFilter(filter.id as any)}
                                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-all ${isActive
                                        ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg shadow-blue-500/30'
                                        : 'bg-white dark:bg-[#1e293b] text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
                                    }`}
                            >
                                <Icon size={12} />
                                {filter.label}
                            </motion.button>
                        );
                    })}
                    <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setShowFilters(!showFilters)}
                        className={`flex items-center gap-1 px-3.5 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-all ${showFilters || filterCategory !== 'all' || sortBy !== 'dueDate-asc'
                                ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg shadow-blue-500/30'
                                : 'bg-white dark:bg-[#1e293b] text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
                            }`}
                    >
                        <SlidersHorizontal size={12} />
                        Filters
                        {(filterCategory !== 'all' || sortBy !== 'dueDate-asc') && (
                            <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
                        )}
                    </motion.button>
                </div>

                {/* Filters Panel - Native Style */}
                <AnimatePresence>
                    {showFilters && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="overflow-hidden"
                        >
                            <div className="bg-white dark:bg-[#1e293b] rounded-2xl p-3.5 border border-gray-200 dark:border-gray-700 space-y-3 shadow-lg">
                                <div className="grid grid-cols-2 gap-2.5">
                                    <div>
                                        <label className="block text-[10px] font-medium text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider">
                                            Category
                                        </label>
                                        <select
                                            value={filterCategory}
                                            onChange={(e) => setFilterCategory(e.target.value as 'all' | TaskCategory)}
                                            className="w-full p-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all"
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
                                        <label className="block text-[10px] font-medium text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider">
                                            Sort by
                                        </label>
                                        <select
                                            value={sortBy}
                                            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                                            className="w-full p-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all"
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
                                        className={`flex-1 py-2 rounded-xl text-xs font-medium transition-all flex items-center justify-center gap-1.5 ${viewMode === 'list'
                                                ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg shadow-blue-500/30'
                                                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                                            }`}
                                    >
                                        <List size={14} />
                                        List
                                    </button>
                                    <button
                                        onClick={() => setViewMode('grid')}
                                        className={`flex-1 py-2 rounded-xl text-xs font-medium transition-all flex items-center justify-center gap-1.5 ${viewMode === 'grid'
                                                ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg shadow-blue-500/30'
                                                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
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

                {/* Search - Native Style */}
                <div className="relative">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                        type="search"
                        placeholder="Search tasks..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-9 py-3 bg-white dark:bg-[#1e293b] border border-gray-200 dark:border-gray-700 rounded-2xl text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all shadow-sm"
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

                {/* Bulk Actions - Native Style */}
                {selectedTasks.size > 0 && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 rounded-2xl p-3 border border-yellow-200 dark:border-yellow-800"
                    >
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-semibold text-yellow-800 dark:text-yellow-200 flex items-center gap-2">
                                <CheckCircle2 size={16} />
                                {selectedTasks.size} selected
                            </span>
                            <div className="flex gap-1.5">
                                <motion.button
                                    whileTap={{ scale: 0.9 }}
                                    onClick={handleBulkComplete}
                                    className="px-3 py-1.5 bg-emerald-500 text-white rounded-xl text-xs font-medium flex items-center gap-1 hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/30"
                                >
                                    <CheckCircle2 size={12} />
                                    Complete
                                </motion.button>
                                <motion.button
                                    whileTap={{ scale: 0.9 }}
                                    onClick={handleBulkDelete}
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

                {/* Task List - Native Cards */}
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
                                    className="text-center py-16 bg-white/50 dark:bg-[#1e293b]/50 rounded-3xl border border-gray-100 dark:border-gray-700"
                                >
                                    <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Inbox size={32} className="text-gray-400" />
                                    </div>
                                    <h3 className="text-base font-bold text-gray-900 dark:text-white">
                                        {tasks.length === 0 ? 'No tasks yet' : 'No results found'}
                                    </h3>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                        {tasks.length === 0
                                            ? 'Create your first task to get started'
                                            : 'Try adjusting your search or filters'}
                                    </p>
                                    {tasks.length === 0 && (
                                        <motion.button
                                            whileTap={{ scale: 0.9 }}
                                            onClick={() => setShowTaskForm(true)}
                                            className="mt-4 px-5 py-2.5 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl text-xs font-medium flex items-center gap-1.5 mx-auto hover:shadow-lg transition-all"
                                        >
                                            <Plus size={14} />
                                            Add Task
                                        </motion.button>
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
                                            className="absolute top-3.5 left-3.5 z-10 w-4.5 h-4.5 rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 checked:bg-blue-500 checked:border-blue-500 focus:ring-2 focus:ring-blue-500/30 transition-all cursor-pointer"
                                        />
                                        <div className="pl-9">
                                            <TaskCard task={task} index={index} compact />
                                        </div>
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
                                    className="absolute top-2 left-2 z-10 w-4 h-4 rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 checked:bg-blue-500 checked:border-blue-500 focus:ring-2 focus:ring-blue-500/30 transition-all cursor-pointer"
                                />
                                <div className="bg-white dark:bg-[#1e293b] rounded-2xl p-3.5 shadow-sm border border-gray-100 dark:border-gray-700">
                                    <div className="flex items-start gap-2.5">
                                        <div className="flex-1 min-w-0">
                                            <h4 className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-2">
                                                {task.title}
                                            </h4>
                                            <div className="flex flex-wrap items-center gap-1 mt-2">
                                                <span className={`text-[9px] px-2 py-0.5 rounded-full font-medium ${task.priority === 'urgent' ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400' :
                                                        task.priority === 'high' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' :
                                                            task.priority === 'medium' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                                                                'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                                                    }`}>
                                                    {task.priority}
                                                </span>
                                                {task.dueDate && (
                                                    <span className="text-[9px] text-gray-500 dark:text-gray-400 flex items-center gap-0.5">
                                                        <Calendar size={8} />
                                                        {new Date(task.dueDate).toLocaleDateString()}
                                                    </span>
                                                )}
                                                <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${task.status === 'completed' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                                                        task.status === 'in-progress' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                                                            'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                                                    }`}>
                                                    {task.status === 'completed' ? '✓' :
                                                        task.status === 'in-progress' ? '⟳' : '○'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}

                {/* Stats Summary - Native Footer */}
                {filteredTasks.length > 0 && (
                    <div className="flex items-center justify-between px-3 py-2.5 bg-white/80 dark:bg-[#1e293b]/80 rounded-2xl border border-gray-100 dark:border-gray-700 backdrop-blur-sm">
                        <div className="flex items-center gap-2.5 text-[10px] text-gray-500 dark:text-gray-400">
                            <span className="font-medium text-gray-700 dark:text-gray-300">{filteredTasks.length}</span>
                            <span>total</span>
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
                                    style={{ width: `${completionRate}%` }}
                                />
                            </div>
                            <span className="text-[10px] font-medium text-gray-700 dark:text-gray-300">
                                {completionRate}%
                            </span>
                        </div>
                    </div>
                )}

                {/* Motivation Tip - Native Style */}
                <div className="bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-pink-500/10 dark:from-indigo-500/5 dark:via-purple-500/5 dark:to-pink-500/5 rounded-2xl p-3.5 border border-indigo-200/50 dark:border-indigo-800/30">
                    <div className="flex items-start gap-3">
                        <div className="p-2 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 shadow-lg shadow-purple-500/25 flex-shrink-0">
                            <Sparkles size={14} className="text-white" />
                        </div>
                        <div>
                            <h4 className="font-semibold text-xs text-gray-800 dark:text-gray-200">Pro Tip</h4>
                            <p className="text-[10px] text-gray-600 dark:text-gray-400 mt-0.5 leading-relaxed">
                                Tap <span className="font-medium text-indigo-500 dark:text-indigo-400">+</span> to add tasks.
                                Select multiple tasks for bulk actions. Stay productive! 🚀
                            </p>
                        </div>
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