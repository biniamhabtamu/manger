import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Plus,
    Search,
    Filter,
    Calendar as CalendarIcon,
    Check,
    X,
    Edit2,
    Trash2,
    TrendingUp,
    TrendingDown,
    Award,
    Target,
    Flame,
    Star,
    Clock,
    BarChart3,
    ChevronDown,
    ChevronUp,
    MoreVertical,
    Copy,
    Download,
    Upload,
    Settings,
    Grid3x3,
    List,
    Eye,
    EyeOff,
    RefreshCw,
    AlertCircle,
    CheckCircle,
    Circle,
    Square,
    Zap,
    Heart,
    Brain,
    BookOpen,
    Activity,
    Coffee,
    Moon,
    Sun,
    Droplet,
    Utensils,
    Dumbbell,
    Sparkles
} from 'lucide-react';
import toast from 'react-hot-toast';

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
    '🧘‍♀️', '🧘‍♂️', '🚶', '🏊', '🚴', '🧗', '🤸', '⛰️', '🌊', '🔥'
];

const COLORS = [
    '#8B5CF6', '#EF4444', '#3B82F6', '#06B6D4', '#F59E0B',
    '#10B981', '#EC4899', '#F97316', '#14B8A6', '#6366F1',
    '#8B5CF6', '#D946EF', '#F43F5E', '#0EA5E9', '#84CC16'
];

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
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [showStats, setShowStats] = useState(false);
    const [selectedHabitId, setSelectedHabitId] = useState<string | null>(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [sortBy, setSortBy] = useState<'name' | 'streak' | 'completion'>('name');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

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
    }, [habits, selectedCategory, searchTerm, sortBy, sortOrder]);

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

    const resetHabits = () => {
        if (window.confirm('Are you sure you want to reset all habits? This action cannot be undone.')) {
            setHabits(DEFAULT_HABITS);
            toast.success('Habits reset to default');
        }
    };

    const weekDates = getWeekDates();

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4 md:p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                            <Target className="text-purple-500" size={32} />
                            Habit Tracker
                            <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
                                Excel & Sheets Style
                            </span>
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            Track your habits like a spreadsheet - log, analyze, and improve
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        <button
                            onClick={() => setShowStats(!showStats)}
                            className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all flex items-center gap-1"
                        >
                            <BarChart3 size={16} />
                            Stats
                        </button>

                        <button
                            onClick={exportData}
                            className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all flex items-center gap-1"
                        >
                            <Download size={16} />
                            Export
                        </button>

                        <button
                            onClick={importData}
                            className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all flex items-center gap-1"
                        >
                            <Upload size={16} />
                            Import
                        </button>

                        <button
                            onClick={() => setShowAddHabit(true)}
                            className="px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg text-sm font-medium hover:shadow-lg transition-all flex items-center gap-2"
                        >
                            <Plus size={16} />
                            Add Habit
                        </button>
                    </div>
                </div>

                {/* Stats Dashboard */}
                <AnimatePresence>
                    {showStats && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden mb-6"
                        >
                            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                                <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                                    <div className="text-xs text-gray-500 dark:text-gray-400">Total Habits</div>
                                    <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalHabits}</div>
                                    <div className="text-xs text-green-500">{stats.activeHabits} active</div>
                                </div>

                                <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                                    <div className="text-xs text-gray-500 dark:text-gray-400">Completion Rate</div>
                                    <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.completionRate}%</div>
                                    <div className="text-xs text-blue-500">Overall progress</div>
                                </div>

                                <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                                    <div className="text-xs text-gray-500 dark:text-gray-400">Current Streak</div>
                                    <div className="text-2xl font-bold text-orange-500 flex items-center gap-1">
                                        <Flame size={20} />
                                        {stats.currentStreak}
                                    </div>
                                    <div className="text-xs text-gray-500">Best: {stats.bestStreak}</div>
                                </div>

                                <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                                    <div className="text-xs text-gray-500 dark:text-gray-400">Total Completions</div>
                                    <div className="text-2xl font-bold text-purple-500">{stats.totalCompletions}</div>
                                    <div className="text-xs text-gray-500">Lifetime count</div>
                                </div>

                                <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                                    <div className="text-xs text-gray-500 dark:text-gray-400">Best Streak</div>
                                    <div className="text-2xl font-bold text-yellow-500">🏆 {stats.bestStreak}</div>
                                    <div className="text-xs text-gray-500">Personal best</div>
                                </div>

                                <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                                    <div className="text-xs text-gray-500 dark:text-gray-400">Achievement</div>
                                    <div className="text-2xl font-bold text-green-500">
                                        {stats.totalHabits > 0 ? '⭐' : '📋'}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                        {stats.totalHabits > 0 ? 'On track' : 'Start now'}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Controls */}
                <div className="flex flex-wrap items-center gap-3 mb-6 bg-white dark:bg-gray-800 rounded-xl p-3 border border-gray-200 dark:border-gray-700">
                    <div className="flex-1 min-w-[200px]">
                        <div className="relative">
                            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Search habits..."
                                className="w-full pl-9 pr-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                            />
                        </div>
                    </div>

                    <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    >
                        {CATEGORIES.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>

                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as any)}
                        className="px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    >
                        <option value="name">Sort by Name</option>
                        <option value="streak">Sort by Streak</option>
                        <option value="completion">Sort by Completion</option>
                    </select>

                    <button
                        onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                        className="px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
                    >
                        {sortOrder === 'asc' ? '↑' : '↓'}
                    </button>

                    <div className="flex gap-1 ml-auto">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                            <Grid3x3 size={18} />
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                            <List size={18} />
                        </button>
                    </div>
                </div>

                {/* Habits Grid/List */}
                <div className={viewMode === 'grid'
                    ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'
                    : 'space-y-3'
                }>
                    {filteredHabits.map((habit) => (
                        <motion.div
                            key={habit.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden transition-all hover:shadow-lg ${viewMode === 'list' ? 'flex items-center p-3' : 'p-4'
                                }`}
                            style={{ borderLeft: `4px solid ${habit.color}` }}
                        >
                            <div className={viewMode === 'list' ? 'flex-1 flex items-center gap-4' : ''}>
                                <div className={`flex items-center gap-3 ${viewMode === 'list' ? 'min-w-[200px]' : 'mb-3'}`}>
                                    <div
                                        className="w-10 h-10 rounded-lg flex items-center justify-center text-xl"
                                        style={{ backgroundColor: `${habit.color}20` }}
                                    >
                                        {habit.icon}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                                            {habit.name}
                                        </h3>
                                        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                                            <span>{habit.category}</span>
                                            <span>•</span>
                                            <span>{getFrequencyLabel(habit.frequency)}</span>
                                            <span className={`${getPriorityColor(habit.priority)}`}>
                                                {getPriorityEmoji(habit.priority)}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {viewMode === 'list' ? (
                                    <>
                                        <div className="flex-1 flex items-center justify-between gap-4">
                                            <div className="flex items-center gap-4">
                                                <div className="text-center">
                                                    <div className="text-xs text-gray-500 dark:text-gray-400">Streak</div>
                                                    <div className="text-sm font-bold text-orange-500 flex items-center gap-1">
                                                        <Flame size={14} />
                                                        {habit.currentStreak}
                                                    </div>
                                                </div>
                                                <div className="text-center">
                                                    <div className="text-xs text-gray-500 dark:text-gray-400">Completed</div>
                                                    <div className="text-sm font-bold text-purple-500">
                                                        {habit.totalCompletions}
                                                    </div>
                                                </div>
                                                <div className="text-center">
                                                    <div className="text-xs text-gray-500 dark:text-gray-400">Target</div>
                                                    <div className="text-sm font-bold text-blue-500">
                                                        {habit.target} {habit.unit}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => toggleHabitCompletion(habit.id, new Date())}
                                                    disabled={loading}
                                                    className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${getHabitCompletionStatus(habit, new Date())
                                                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                                            : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200'
                                                        }`}
                                                >
                                                    {getHabitCompletionStatus(habit, new Date()) ? '✅ Done' : 'Mark Done'}
                                                </button>

                                                <button
                                                    onClick={() => setEditingHabit(habit)}
                                                    className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                                >
                                                    <Edit2 size={14} className="text-gray-400" />
                                                </button>
                                                <button
                                                    onClick={() => setShowDeleteConfirm(habit.id)}
                                                    className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                                >
                                                    <Trash2 size={14} className="text-red-400" />
                                                </button>
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between text-sm">
                                            <div className="flex items-center gap-4">
                                                <div>
                                                    <div className="text-xs text-gray-500 dark:text-gray-400">Streak</div>
                                                    <div className="font-bold text-orange-500 flex items-center gap-1">
                                                        <Flame size={14} />
                                                        {habit.currentStreak}
                                                    </div>
                                                </div>
                                                <div>
                                                    <div className="text-xs text-gray-500 dark:text-gray-400">Best</div>
                                                    <div className="font-bold text-yellow-500">🏆 {habit.bestStreak}</div>
                                                </div>
                                                <div>
                                                    <div className="text-xs text-gray-500 dark:text-gray-400">Total</div>
                                                    <div className="font-bold text-purple-500">{habit.totalCompletions}</div>
                                                </div>
                                            </div>

                                            <button
                                                onClick={() => toggleHabitCompletion(habit.id, new Date())}
                                                disabled={loading}
                                                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${getHabitCompletionStatus(habit, new Date())
                                                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                                        : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200'
                                                    }`}
                                            >
                                                {getHabitCompletionStatus(habit, new Date()) ? '✅ Done' : 'Mark Done'}
                                            </button>
                                        </div>

                                        <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-2">
                                            <div className="grid grid-cols-7 gap-1">
                                                {weekDates.map((date, i) => {
                                                    const isCompleted = getHabitCompletionStatus(habit, date);
                                                    const isToday = date.toDateString() === new Date().toDateString();
                                                    return (
                                                        <button
                                                            key={i}
                                                            onClick={() => toggleHabitCompletion(habit.id, date)}
                                                            disabled={loading}
                                                            className={`aspect-square rounded-lg flex items-center justify-center text-xs font-medium transition-all ${isCompleted
                                                                    ? 'bg-green-500 text-white'
                                                                    : isToday
                                                                        ? 'bg-purple-100 dark:bg-purple-900/30 border-2 border-purple-500'
                                                                        : 'bg-white dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
                                                                }`}
                                                        >
                                                            {isCompleted ? '✓' : date.getDate()}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                            <div className="flex justify-between mt-1 text-[10px] text-gray-400">
                                                {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => (
                                                    <span key={i}>{day}</span>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                                            <span>Target: {habit.target} {habit.unit}</span>
                                            <span>{habit.frequency}</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    ))}
                </div>

                {filteredHabits.length === 0 && (
                    <div className="text-center py-12">
                        <div className="text-6xl mb-4">📋</div>
                        <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300">No habits found</h3>
                        <p className="text-gray-500 dark:text-gray-400 mt-2">
                            {searchTerm ? 'Try adjusting your search' : 'Start tracking your habits today!'}
                        </p>
                        <button
                            onClick={() => setShowAddHabit(true)}
                            className="mt-4 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-all"
                        >
                            Create Habit
                        </button>
                    </div>
                )}

                {/* Add/Edit Habit Modal */}
                <AnimatePresence>
                    {(showAddHabit || editingHabit) && (
                        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="bg-white dark:bg-gray-900 rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto"
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                        {editingHabit ? 'Edit Habit' : 'Add New Habit'}
                                    </h2>
                                    <button
                                        onClick={() => {
                                            setShowAddHabit(false);
                                            setEditingHabit(null);
                                        }}
                                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                                    >
                                        <X size={20} />
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
                                            className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                                            placeholder="e.g., Morning Meditation"
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
                                                className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
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
                                                className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                                            >
                                                <option value="daily">Daily</option>
                                                <option value="weekly">Weekly</option>
                                                <option value="monthly">Monthly</option>
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
                                                className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
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
                                                className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                                                placeholder="minutes, pages, etc."
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
                                                className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
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
                                                {COLORS.slice(0, 8).map(color => (
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
                                            className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                                        >
                                            <option value="low">🌱 Low</option>
                                            <option value="medium">⚡ Medium</option>
                                            <option value="high">🔥 High</option>
                                        </select>
                                    </div>

                                    <button
                                        onClick={editingHabit ? updateHabit : addHabit}
                                        className="w-full py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg font-medium hover:shadow-lg transition-all"
                                    >
                                        {editingHabit ? 'Update Habit' : 'Create Habit'}
                                    </button>
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
                                className="bg-white dark:bg-gray-900 rounded-2xl p-6 max-w-sm w-full"
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
                                        className="flex-1 py-2.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={() => deleteHabit(showDeleteConfirm)}
                                        className="flex-1 py-2.5 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-all"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default HabitTracker;