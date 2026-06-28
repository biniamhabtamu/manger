import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Plus,
    Search,
    Calendar as CalendarIcon,
    Check,
    X,
    Edit2,
    Trash2,
    TrendingUp,
    Award,
    Target,
    Flame,
    Star,
    Clock,
    BarChart3,
    ChevronDown,
    ChevronUp,
    Download,
    Upload,
    Grid3x3,
    List,
    Eye,
    EyeOff,
    AlertCircle,
    Activity,
    Sparkles,
    ArrowUp,
    ArrowDown,
    Zap as ZapIcon,
    Heart,
    Brain,
    BookOpen,
    Coffee,
    Moon,
    Sun,
    Droplet,
    Utensils,
    Dumbbell,
    Trophy,
    Crown,
    Gift,
    Bell,
    Settings,
    User,
    Home,
    CalendarDays,
    LayoutGrid,
    ListChecks,
    TrendingUp as TrendingUpIcon,
    PieChart,
    ArrowRight,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';
import toast from 'react-hot-toast';
import { BottomBar } from '../components/layout/BottomBar';

interface Habit {
    id: string;
    name: string;
    category: string;
    icon: string;
    color: string;
    frequency: 'daily' | 'weekly' | 'monthly';
    target: number;
    unit: string;
    currentStreak: number;
    bestStreak: number;
    totalCompletions: number;
    createdAt: Date;
    history: {
        date: string;
        value: number;
        note?: string;
    }[];
    reminder?: string;
    active: boolean;
    priority: 'low' | 'medium' | 'high';
}

interface HabitStats {
    totalHabits: number;
    activeHabits: number;
    completionRate: number;
    currentStreak: number;
    bestStreak: number;
    totalCompletions: number;
}

const DEFAULT_HABITS: Habit[] = [
    {
        id: '1',
        name: 'Morning Meditation',
        category: 'Mindfulness',
        icon: '🧘',
        color: '#8B5CF6',
        frequency: 'daily',
        target: 1,
        unit: 'session',
        currentStreak: 12,
        bestStreak: 45,
        totalCompletions: 89,
        createdAt: new Date('2024-01-01'),
        history: [],
        active: true,
        priority: 'high'
    },
    {
        id: '2',
        name: 'Exercise',
        category: 'Health',
        icon: '💪',
        color: '#EF4444',
        frequency: 'daily',
        target: 30,
        unit: 'minutes',
        currentStreak: 7,
        bestStreak: 30,
        totalCompletions: 156,
        createdAt: new Date('2024-01-01'),
        history: [],
        active: true,
        priority: 'high'
    },
    {
        id: '3',
        name: 'Read Books',
        category: 'Learning',
        icon: '📚',
        color: '#3B82F6',
        frequency: 'daily',
        target: 20,
        unit: 'pages',
        currentStreak: 3,
        bestStreak: 21,
        totalCompletions: 234,
        createdAt: new Date('2024-01-01'),
        history: [],
        active: true,
        priority: 'medium'
    },
    {
        id: '4',
        name: 'Drink Water',
        category: 'Health',
        icon: '💧',
        color: '#06B6D4',
        frequency: 'daily',
        target: 8,
        unit: 'glasses',
        currentStreak: 5,
        bestStreak: 15,
        totalCompletions: 78,
        createdAt: new Date('2024-01-01'),
        history: [],
        active: true,
        priority: 'medium'
    },
    {
        id: '5',
        name: 'Journal Writing',
        category: 'Mindfulness',
        icon: '📝',
        color: '#F59E0B',
        frequency: 'daily',
        target: 1,
        unit: 'entry',
        currentStreak: 2,
        bestStreak: 10,
        totalCompletions: 45,
        createdAt: new Date('2024-01-01'),
        history: [],
        active: true,
        priority: 'low'
    }
];

const CATEGORIES = [
    'All',
    'Health',
    'Mindfulness',
    'Learning',
    'Productivity',
    'Fitness',
    'Nutrition',
    'Sleep',
    'Social',
    'Finance',
    'Creativity',
    'Spiritual'
];

const ICONS = [
    '🧘', '💪', '📚', '💧', '📝', '🏃', '🧠', '❤️', '🌟', '🎯',
    '📖', '✍️', '🎨', '🎵', '🌱', '🌙', '☀️', '🍎', '🥗', '🏋️',
    '🚶', '🏊', '🚴', '🧗', '🤸', '⛰️', '🌊', '🔥', '⚡', '🌈'
];

const COLORS = [
    '#8B5CF6', '#EF4444', '#3B82F6', '#06B6D4', '#F59E0B',
    '#10B981', '#EC4899', '#F97316', '#14B8A6', '#6366F1',
    '#D946EF', '#F43F5E', '#0EA5E9', '#84CC16', '#22D3EE'
];

// Skeleton Loader
const SkeletonLoader = () => (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#0f172a] pb-24">
        <div className="px-4 pt-6 space-y-4">
            <div className="flex items-center justify-between animate-pulse">
                <div className="space-y-2">
                    <div className="h-7 w-40 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
                    <div className="h-4 w-56 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                </div>
                <div className="h-12 w-12 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
            </div>
            <div className="grid grid-cols-2 gap-3 animate-pulse">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded-2xl"></div>
                ))}
            </div>
            <div className="h-14 bg-gray-200 dark:bg-gray-700 rounded-2xl animate-pulse"></div>
            <div className="grid grid-cols-2 gap-3 animate-pulse">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-40 bg-gray-200 dark:bg-gray-700 rounded-2xl"></div>
                ))}
            </div>
        </div>
    </div>
);

export const HabitTracker: React.FC = () => {
    const [habits, setHabits] = useState<Habit[]>(() => {
        const saved = localStorage.getItem('habits');
        return saved ? JSON.parse(saved) : DEFAULT_HABITS;
    });

    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [searchTerm, setSearchTerm] = useState('');
    const [showAddHabit, setShowAddHabit] = useState(false);
    const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
    const [showStats, setShowStats] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [sortBy, setSortBy] = useState<'name' | 'streak' | 'completion'>('name');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
    const [activeQuickFilter, setActiveQuickFilter] = useState<'all' | 'active' | 'completed'>('all');
    const [isLoading, setIsLoading] = useState(true);

    const [newHabit, setNewHabit] = useState<Partial<Habit>>({
        name: '',
        category: 'Health',
        icon: '🌟',
        color: '#8B5CF6',
        frequency: 'daily',
        target: 1,
        unit: 'time',
        priority: 'medium',
        active: true
    });

    useEffect(() => {
        const timer = setTimeout(() => setIsLoading(false), 1000);
        return () => clearTimeout(timer);
    }, []);

    const stats = useMemo<HabitStats>(() => {
        const activeHabits = habits.filter(h => h.active);
        const totalCompletions = habits.reduce((sum, h) => sum + h.totalCompletions, 0);
        const totalTargets = habits.reduce((sum, h) => sum + h.target, 0);
        const completionRate = totalTargets > 0 ? Math.round((totalCompletions / totalTargets) * 100) : 0;

        return {
            totalHabits: habits.length,
            activeHabits: activeHabits.length,
            completionRate,
            currentStreak: Math.max(...habits.map(h => h.currentStreak), 0),
            bestStreak: Math.max(...habits.map(h => h.bestStreak), 0),
            totalCompletions
        };
    }, [habits]);

    const filteredHabits = useMemo(() => {
        let filtered = habits;

        if (selectedCategory !== 'All') {
            filtered = filtered.filter(h => h.category === selectedCategory);
        }

        if (activeQuickFilter === 'active') {
            filtered = filtered.filter(h => h.active);
        } else if (activeQuickFilter === 'completed') {
            filtered = filtered.filter(h => h.totalCompletions > 0);
        }

        if (searchTerm) {
            filtered = filtered.filter(h =>
                h.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                h.category.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        filtered = [...filtered].sort((a, b) => {
            let comparison = 0;
            switch (sortBy) {
                case 'name':
                    comparison = a.name.localeCompare(b.name);
                    break;
                case 'streak':
                    comparison = a.currentStreak - b.currentStreak;
                    break;
                case 'completion':
                    comparison = a.totalCompletions - b.totalCompletions;
                    break;
                default:
                    comparison = 0;
            }
            return sortOrder === 'asc' ? comparison : -comparison;
        });

        return filtered;
    }, [habits, selectedCategory, searchTerm, sortBy, sortOrder, activeQuickFilter]);

    useEffect(() => {
        localStorage.setItem('habits', JSON.stringify(habits));
    }, [habits]);

    const addHabit = useCallback(() => {
        if (!newHabit.name?.trim()) {
            toast.error('Please enter a habit name');
            return;
        }

        const habit: Habit = {
            id: `habit-${Date.now()}`,
            name: newHabit.name.trim(),
            category: newHabit.category || 'Health',
            icon: newHabit.icon || '🌟',
            color: newHabit.color || '#8B5CF6',
            frequency: newHabit.frequency as 'daily' | 'weekly' | 'monthly' || 'daily',
            target: newHabit.target || 1,
            unit: newHabit.unit || 'time',
            currentStreak: 0,
            bestStreak: 0,
            totalCompletions: 0,
            createdAt: new Date(),
            history: [],
            active: true,
            priority: newHabit.priority as 'low' | 'medium' | 'high' || 'medium'
        };

        setHabits(prev => [...prev, habit]);
        setShowAddHabit(false);
        setNewHabit({
            name: '',
            category: 'Health',
            icon: '🌟',
            color: '#8B5CF6',
            frequency: 'daily',
            target: 1,
            unit: 'time',
            priority: 'medium',
            active: true
        });
        toast.success('Habit created successfully! 🎯');
    }, [newHabit]);

    const updateHabit = useCallback(() => {
        if (!editingHabit || !editingHabit.name?.trim()) {
            toast.error('Please enter a habit name');
            return;
        }

        setHabits(prev => prev.map(h =>
            h.id === editingHabit.id ? { ...editingHabit } : h
        ));
        setEditingHabit(null);
        toast.success('Habit updated successfully! ✏️');
    }, [editingHabit]);

    const deleteHabit = useCallback((id: string) => {
        setHabits(prev => prev.filter(h => h.id !== id));
        setShowDeleteConfirm(null);
        toast.success('Habit deleted successfully');
    }, []);

    const toggleHabitCompletion = useCallback((habitId: string, date: Date) => {
        setLoading(true);
        try {
            const dateStr = date.toISOString().split('T')[0];
            setHabits(prev => prev.map(habit => {
                if (habit.id !== habitId) return habit;

                const existingEntry = habit.history.find(h => h.date === dateStr);
                let newHistory = [...habit.history];
                let newTotalCompletions = habit.totalCompletions;
                let newStreak = habit.currentStreak;

                if (existingEntry) {
                    newHistory = newHistory.filter(h => h.date !== dateStr);
                    newTotalCompletions = Math.max(0, newTotalCompletions - 1);
                    newStreak = calculateStreak(newHistory);
                } else {
                    newHistory.push({ date: dateStr, value: habit.target });
                    newTotalCompletions = newTotalCompletions + 1;
                    newStreak = calculateStreak(newHistory);
                }

                const newBestStreak = Math.max(habit.bestStreak, newStreak);

                return {
                    ...habit,
                    history: newHistory,
                    totalCompletions: newTotalCompletions,
                    currentStreak: newStreak,
                    bestStreak: newBestStreak
                };
            }));

            toast.success('Habit updated!');
        } catch (error) {
            toast.error('Failed to update habit');
        } finally {
            setLoading(false);
        }
    }, []);

    const calculateStreak = (history: { date: string }[]): number => {
        if (history.length === 0) return 0;

        const sortedDates = history
            .map(h => new Date(h.date))
            .sort((a, b) => b.getTime() - a.getTime());

        let streak = 1;
        let currentDate = new Date(sortedDates[0]);
        currentDate.setDate(currentDate.getDate() - 1);

        for (let i = 1; i < sortedDates.length; i++) {
            const expectedDate = new Date(currentDate);
            expectedDate.setDate(expectedDate.getDate() - 1);

            if (sortedDates[i].toDateString() === expectedDate.toDateString()) {
                streak++;
                currentDate = expectedDate;
            } else {
                break;
            }
        }

        return streak;
    };

    const getHabitCompletionStatus = (habit: Habit, date: Date) => {
        const dateStr = date.toISOString().split('T')[0];
        return habit.history.some(h => h.date === dateStr);
    };

    const getWeekDates = () => {
        const dates = [];
        const today = new Date();
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay());

        for (let i = 0; i < 7; i++) {
            const date = new Date(startOfWeek);
            date.setDate(startOfWeek.getDate() + i);
            dates.push(date);
        }
        return dates;
    };

    const getFrequencyLabel = (frequency: string) => {
        switch (frequency) {
            case 'daily': return 'Daily';
            case 'weekly': return 'Weekly';
            case 'monthly': return 'Monthly';
            default: return frequency;
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'high': return 'text-red-500';
            case 'medium': return 'text-yellow-500';
            case 'low': return 'text-green-500';
            default: return 'text-gray-500';
        }
    };

    const getPriorityEmoji = (priority: string) => {
        switch (priority) {
            case 'high': return '🔥';
            case 'medium': return '⚡';
            case 'low': return '🌱';
            default: return '•';
        }
    };

    const exportData = () => {
        const data = {
            habits,
            exportedAt: new Date().toISOString(),
            version: '1.0'
        };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `habits-backup-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success('Data exported successfully!');
    };

    const importData = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = (e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const data = JSON.parse(event.target?.result as string);
                    if (data.habits && Array.isArray(data.habits)) {
                        setHabits(data.habits);
                        toast.success('Data imported successfully!');
                    } else {
                        toast.error('Invalid data format');
                    }
                } catch (error) {
                    toast.error('Failed to import data');
                }
            };
            reader.readAsText(file);
        };
        input.click();
    };

    const weekDates = getWeekDates();
    const quickFilters = [
        { id: 'all', label: 'All', icon: LayoutGrid },
        { id: 'active', label: 'Active', icon: Activity },
        { id: 'completed', label: 'Completed', icon: Check },
    ];

    if (isLoading) {
        return <SkeletonLoader />;
    }

    return (
        <div className="min-h-screen bg-[#f8fafc] dark:bg-[#0f172a] pb-24">
            {/* Status Bar Gradient */}
            <div className="h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500"></div>

            {/* Header - Native Style */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="sticky top-0 z-20 bg-white/95 dark:bg-[#1e293b]/95 backdrop-blur-xl border-b border-gray-100/50 dark:border-gray-700/50 px-4 pt-4 pb-3"
            >
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center shadow-lg shadow-purple-500/25">
                            <Target size={18} className="text-white" />
                        </div>
                        <div>
                            <h1 className="text-lg font-bold text-gray-900 dark:text-white">Habits</h1>
                            <p className="text-[10px] text-gray-500 dark:text-gray-400">
                                {filteredHabits.length} habits • {stats.completionRate}% done
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <motion.button
                            whileTap={{ scale: 0.9 }}
                            onClick={() => setShowStats(!showStats)}
                            className="p-2 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                        >
                            <BarChart3 size={18} />
                        </motion.button>
                        <motion.button
                            whileTap={{ scale: 0.9 }}
                            onClick={() => setShowAddHabit(true)}
                            className="p-2 rounded-xl bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 transition-all flex items-center gap-1.5 px-3"
                        >
                            <Plus size={18} />
                            <span className="text-xs font-medium hidden sm:inline">Add</span>
                        </motion.button>
                    </div>
                </div>
            </motion.div>

            <div className="px-4 pt-3 space-y-3 max-w-3xl mx-auto">
                {/* Stats Dashboard - Native Cards */}
                <AnimatePresence>
                    {showStats && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                        >
                            <div className="grid grid-cols-3 gap-2 mb-3">
                                <div className="bg-white dark:bg-[#1e293b] rounded-2xl p-3 border border-gray-100 dark:border-gray-700/50">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <div className="text-lg font-bold text-gray-900 dark:text-white">{stats.totalHabits}</div>
                                            <div className="text-[9px] text-gray-500 dark:text-gray-400">Total</div>
                                        </div>
                                        <div className="p-2 rounded-xl bg-purple-500/10">
                                            <Target size={14} className="text-purple-500" />
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-white dark:bg-[#1e293b] rounded-2xl p-3 border border-gray-100 dark:border-gray-700/50">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <div className="text-lg font-bold text-orange-500">{stats.currentStreak}</div>
                                            <div className="text-[9px] text-gray-500 dark:text-gray-400">Streak</div>
                                        </div>
                                        <div className="p-2 rounded-xl bg-orange-500/10">
                                            <Flame size={14} className="text-orange-500" />
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-white dark:bg-[#1e293b] rounded-2xl p-3 border border-gray-100 dark:border-gray-700/50">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <div className="text-lg font-bold text-emerald-500">{stats.completionRate}%</div>
                                            <div className="text-[9px] text-gray-500 dark:text-gray-400">Rate</div>
                                        </div>
                                        <div className="p-2 rounded-xl bg-emerald-500/10">
                                            <TrendingUpIcon size={14} className="text-emerald-500" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="grid grid-cols-3 gap-2 mb-3">
                                <div className="bg-white dark:bg-[#1e293b] rounded-2xl p-3 border border-gray-100 dark:border-gray-700/50">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <div className="text-lg font-bold text-yellow-500">{stats.bestStreak}</div>
                                            <div className="text-[9px] text-gray-500 dark:text-gray-400">Best</div>
                                        </div>
                                        <div className="p-2 rounded-xl bg-yellow-500/10">
                                            <Trophy size={14} className="text-yellow-500" />
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-white dark:bg-[#1e293b] rounded-2xl p-3 border border-gray-100 dark:border-gray-700/50">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <div className="text-lg font-bold text-blue-500">{stats.totalCompletions}</div>
                                            <div className="text-[9px] text-gray-500 dark:text-gray-400">Done</div>
                                        </div>
                                        <div className="p-2 rounded-xl bg-blue-500/10">
                                            <Check size={14} className="text-blue-500" />
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-white dark:bg-[#1e293b] rounded-2xl p-3 border border-gray-100 dark:border-gray-700/50">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <div className="text-lg font-bold text-pink-500">{stats.activeHabits}</div>
                                            <div className="text-[9px] text-gray-500 dark:text-gray-400">Active</div>
                                        </div>
                                        <div className="p-2 rounded-xl bg-pink-500/10">
                                            <Activity size={14} className="text-pink-500" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

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
                                    ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg shadow-purple-500/30'
                                    : 'bg-white dark:bg-[#1e293b] text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
                                    }`}
                            >
                                <Icon size={12} />
                                {filter.label}
                            </motion.button>
                        );
                    })}
                </div>

                {/* Controls - Native Style */}
                <div className="flex flex-wrap items-center gap-2 bg-white dark:bg-[#1e293b] rounded-2xl p-2.5 border border-gray-200 dark:border-gray-700">
                    <div className="flex-1 min-w-[140px]">
                        <div className="relative">
                            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Search habits..."
                                className="w-full pl-9 pr-3 py-1.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-xs focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                            />
                        </div>
                    </div>

                    <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="px-2.5 py-1.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-xs focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    >
                        {CATEGORIES.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>

                    <div className="flex gap-0.5">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-1.5 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                            <Grid3x3 size={14} />
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-1.5 rounded-lg transition-all ${viewMode === 'list' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                            <List size={14} />
                        </button>
                    </div>
                </div>

                {/* Habits Grid/List */}
                <div className={viewMode === 'grid'
                    ? 'grid grid-cols-2 gap-2.5'
                    : 'space-y-2.5'
                }>
                    {filteredHabits.map((habit) => (
                        <motion.div
                            key={habit.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`bg-white dark:bg-[#1e293b] rounded-2xl border border-gray-100 dark:border-gray-700/50 overflow-hidden transition-all hover:shadow-lg ${viewMode === 'list' ? 'p-3' : 'p-3'
                                }`}
                            style={{ borderLeft: viewMode === 'list' ? `4px solid ${habit.color}` : undefined }}
                        >
                            {viewMode === 'list' ? (
                                // List View
                                <div className="flex items-center gap-3">
                                    <div
                                        className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                                        style={{ backgroundColor: `${habit.color}20` }}
                                    >
                                        {habit.icon}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-semibold text-sm text-gray-900 dark:text-white truncate">
                                            {habit.name}
                                        </h3>
                                        <div className="flex items-center gap-2 text-[10px] text-gray-500 dark:text-gray-400">
                                            <span>{habit.category}</span>
                                            <span>•</span>
                                            <span>{getFrequencyLabel(habit.frequency)}</span>
                                            <span className={getPriorityColor(habit.priority)}>
                                                {getPriorityEmoji(habit.priority)}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <div className="text-center px-2">
                                            <div className="text-xs font-bold text-orange-500 flex items-center gap-0.5">
                                                <Flame size={10} />
                                                {habit.currentStreak}
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => toggleHabitCompletion(habit.id, new Date())}
                                            disabled={loading}
                                            className={`px-2.5 py-1 rounded-xl text-[10px] font-medium transition-all ${getHabitCompletionStatus(habit, new Date())
                                                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                                                : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200'
                                                }`}
                                        >
                                            {getHabitCompletionStatus(habit, new Date()) ? '✅' : 'Mark'}
                                        </button>
                                        <button
                                            onClick={() => setEditingHabit(habit)}
                                            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                        >
                                            <Edit2 size={14} className="text-gray-400" />
                                        </button>
                                        <button
                                            onClick={() => setShowDeleteConfirm(habit.id)}
                                            className="p-1 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                        >
                                            <Trash2 size={14} className="text-red-400" />
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                // Grid View
                                <div className="space-y-2.5">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-2.5">
                                            <div
                                                className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                                                style={{ backgroundColor: `${habit.color}20` }}
                                            >
                                                {habit.icon}
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-sm text-gray-900 dark:text-white line-clamp-1">
                                                    {habit.name}
                                                </h3>
                                                <div className="flex items-center gap-1.5 text-[10px] text-gray-500 dark:text-gray-400">
                                                    <span>{habit.category}</span>
                                                    <span>•</span>
                                                    <span className={getPriorityColor(habit.priority)}>
                                                        {getPriorityEmoji(habit.priority)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => toggleHabitCompletion(habit.id, new Date())}
                                            disabled={loading}
                                            className={`p-1.5 rounded-xl text-xs font-medium transition-all ${getHabitCompletionStatus(habit, new Date())
                                                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                                                : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200'
                                                }`}
                                        >
                                            {getHabitCompletionStatus(habit, new Date()) ? '✅' : 'Mark'}
                                        </button>
                                    </div>

                                    <div className="flex items-center justify-between text-xs">
                                        <div className="flex items-center gap-3">
                                            <div className="flex items-center gap-0.5 text-orange-500">
                                                <Flame size={12} />
                                                <span className="font-bold">{habit.currentStreak}</span>
                                            </div>
                                            <div className="flex items-center gap-0.5 text-purple-500">
                                                <Target size={12} />
                                                <span className="font-bold">{habit.totalCompletions}</span>
                                            </div>
                                        </div>
                                        <span className="text-[10px] text-gray-400">
                                            {habit.frequency}
                                        </span>
                                    </div>

                                    {/* Weekly Grid - Compact */}
                                    <div className="grid grid-cols-7 gap-1">
                                        {weekDates.map((date, i) => {
                                            const isCompleted = getHabitCompletionStatus(habit, date);
                                            const isToday = date.toDateString() === new Date().toDateString();
                                            return (
                                                <button
                                                    key={i}
                                                    onClick={() => toggleHabitCompletion(habit.id, date)}
                                                    disabled={loading}
                                                    className={`aspect-square rounded-lg flex items-center justify-center text-[10px] font-medium transition-all ${isCompleted
                                                        ? 'bg-emerald-500 text-white'
                                                        : isToday
                                                            ? 'bg-purple-100 dark:bg-purple-900/30 border-2 border-purple-500'
                                                            : 'bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700'
                                                        }`}
                                                >
                                                    {isCompleted ? '✓' : date.getDate()}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    ))}
                </div>

                {filteredHabits.length === 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center py-16 bg-white/50 dark:bg-[#1e293b]/50 rounded-3xl border border-gray-100 dark:border-gray-700"
                    >
                        <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Target size={32} className="text-purple-500" />
                        </div>
                        <h3 className="text-base font-bold text-gray-900 dark:text-white">
                            {searchTerm ? 'No habits found' : 'Start building habits!'}
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {searchTerm ? 'Try adjusting your search' : 'Create your first habit today'}
                        </p>
                        {!searchTerm && (
                            <motion.button
                                whileTap={{ scale: 0.9 }}
                                onClick={() => setShowAddHabit(true)}
                                className="mt-4 px-5 py-2.5 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-xl text-xs font-medium flex items-center gap-1.5 mx-auto hover:shadow-lg transition-all"
                            >
                                <Plus size={14} />
                                Create Habit
                            </motion.button>
                        )}
                    </motion.div>
                )}

                {/* Stats Summary */}
                {filteredHabits.length > 0 && (
                    <div className="flex items-center justify-between px-3 py-2 bg-white/80 dark:bg-[#1e293b]/80 rounded-2xl border border-gray-100 dark:border-gray-700">
                        <div className="flex items-center gap-2 text-[10px] text-gray-500 dark:text-gray-400">
                            <span className="font-medium text-gray-700 dark:text-gray-300">{filteredHabits.length}</span>
                            <span>habits</span>
                            <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-600"></span>
                            <span className="text-emerald-500">{habits.filter(h => h.totalCompletions > 0).length}</span>
                            <span>active</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <div className="w-16 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                <div
                                    className="h-full rounded-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-500"
                                    style={{ width: `${stats.completionRate}%` }}
                                />
                            </div>
                            <span className="text-[10px] font-medium text-gray-700 dark:text-gray-300">
                                {stats.completionRate}%
                            </span>
                        </div>
                    </div>
                )}

                {/* Motivation Tip */}
                <div className="bg-gradient-to-br from-purple-500/10 via-blue-500/10 to-pink-500/10 dark:from-purple-500/5 dark:via-blue-500/5 dark:to-pink-500/5 rounded-2xl p-3.5 border border-purple-200/50 dark:border-purple-800/30">
                    <div className="flex items-start gap-3">
                        <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 shadow-lg shadow-purple-500/25 flex-shrink-0">
                            <Sparkles size={14} className="text-white" />
                        </div>
                        <div>
                            <h4 className="font-semibold text-xs text-gray-800 dark:text-gray-200">💡 Daily Reminder</h4>
                            <p className="text-[10px] text-gray-600 dark:text-gray-400 mt-0.5 leading-relaxed">
                                Consistency is key. Small daily habits lead to big results. Keep going! 🚀
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Add/Edit Habit Modal - Native Style */}
            <AnimatePresence>
                {(showAddHabit || editingHabit) && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end justify-center z-50">
                        <motion.div
                            initial={{ opacity: 0, y: '100%' }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: '100%' }}
                            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                            className="bg-white dark:bg-[#1e293b] rounded-t-3xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                    {editingHabit ? 'Edit Habit' : 'New Habit'}
                                </h2>
                                <button
                                    onClick={() => {
                                        setShowAddHabit(false);
                                        setEditingHabit(null);
                                    }}
                                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
                                >
                                    <X size={20} className="text-gray-500" />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Habit Name
                                    </label>
                                    <input
                                        type="text"
                                        value={editingHabit ? editingHabit.name : newHabit.name}
                                        onChange={(e) => {
                                            if (editingHabit) {
                                                setEditingHabit({ ...editingHabit, name: e.target.value });
                                            } else {
                                                setNewHabit({ ...newHabit, name: e.target.value });
                                            }
                                        }}
                                        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                                        placeholder="e.g., Morning Meditation"
                                        autoFocus
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Category
                                        </label>
                                        <select
                                            value={editingHabit ? editingHabit.category : newHabit.category}
                                            onChange={(e) => {
                                                if (editingHabit) {
                                                    setEditingHabit({ ...editingHabit, category: e.target.value });
                                                } else {
                                                    setNewHabit({ ...newHabit, category: e.target.value });
                                                }
                                            }}
                                            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                                        >
                                            {CATEGORIES.filter(c => c !== 'All').map(cat => (
                                                <option key={cat} value={cat}>{cat}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Frequency
                                        </label>
                                        <select
                                            value={editingHabit ? editingHabit.frequency : newHabit.frequency}
                                            onChange={(e) => {
                                                if (editingHabit) {
                                                    setEditingHabit({ ...editingHabit, frequency: e.target.value as any });
                                                } else {
                                                    setNewHabit({ ...newHabit, frequency: e.target.value as any });
                                                }
                                            }}
                                            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                                        >
                                            <option value="daily">📅 Daily</option>
                                            <option value="weekly">📆 Weekly</option>
                                            <option value="monthly">🗓️ Monthly</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Target
                                        </label>
                                        <input
                                            type="number"
                                            min="1"
                                            value={editingHabit ? editingHabit.target : newHabit.target}
                                            onChange={(e) => {
                                                const val = parseInt(e.target.value) || 1;
                                                if (editingHabit) {
                                                    setEditingHabit({ ...editingHabit, target: val });
                                                } else {
                                                    setNewHabit({ ...newHabit, target: val });
                                                }
                                            }}
                                            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Unit
                                        </label>
                                        <input
                                            type="text"
                                            value={editingHabit ? editingHabit.unit : newHabit.unit}
                                            onChange={(e) => {
                                                if (editingHabit) {
                                                    setEditingHabit({ ...editingHabit, unit: e.target.value });
                                                } else {
                                                    setNewHabit({ ...newHabit, unit: e.target.value });
                                                }
                                            }}
                                            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                                            placeholder="minutes, times, etc."
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Icon
                                        </label>
                                        <select
                                            value={editingHabit ? editingHabit.icon : newHabit.icon}
                                            onChange={(e) => {
                                                if (editingHabit) {
                                                    setEditingHabit({ ...editingHabit, icon: e.target.value });
                                                } else {
                                                    setNewHabit({ ...newHabit, icon: e.target.value });
                                                }
                                            }}
                                            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                                        >
                                            {ICONS.map(icon => (
                                                <option key={icon} value={icon}>{icon}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Color
                                        </label>
                                        <div className="flex flex-wrap gap-2">
                                            {COLORS.slice(0, 6).map(color => (
                                                <button
                                                    key={color}
                                                    onClick={() => {
                                                        if (editingHabit) {
                                                            setEditingHabit({ ...editingHabit, color });
                                                        } else {
                                                            setNewHabit({ ...newHabit, color });
                                                        }
                                                    }}
                                                    className={`w-8 h-8 rounded-full transition-all ${(editingHabit ? editingHabit.color : newHabit.color) === color
                                                        ? 'ring-2 ring-offset-2 ring-purple-500'
                                                        : 'hover:scale-110'
                                                        }`}
                                                    style={{ backgroundColor: color }}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Priority
                                    </label>
                                    <select
                                        value={editingHabit ? editingHabit.priority : newHabit.priority}
                                        onChange={(e) => {
                                            if (editingHabit) {
                                                setEditingHabit({ ...editingHabit, priority: e.target.value as any });
                                            } else {
                                                setNewHabit({ ...newHabit, priority: e.target.value as any });
                                            }
                                        }}
                                        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                                    >
                                        <option value="low">🌱 Low</option>
                                        <option value="medium">⚡ Medium</option>
                                        <option value="high">🔥 High</option>
                                    </select>
                                </div>

                                <motion.button
                                    whileTap={{ scale: 0.95 }}
                                    onClick={editingHabit ? updateHabit : addHabit}
                                    className="w-full py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-xl font-medium hover:shadow-lg transition-all"
                                >
                                    {editingHabit ? 'Update Habit' : 'Create Habit'}
                                </motion.button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Delete Confirmation Modal */}
            <AnimatePresence>
                {showDeleteConfirm && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white dark:bg-[#1e293b] rounded-2xl p-6 max-w-sm w-full"
                        >
                            <div className="text-center mb-6">
                                <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <AlertCircle className="text-red-500" size={32} />
                                </div>
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                                    Delete Habit?
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    This will permanently delete this habit and all its data.
                                </p>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowDeleteConfirm(null)}
                                    className="flex-1 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => deleteHabit(showDeleteConfirm)}
                                    className="flex-1 py-2.5 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 transition-all"
                                >
                                    Delete
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Bottom Bar */}
            <BottomBar onTaskFormOpen={() => { }} />
        </div>
    );
};

export default HabitTracker;