import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckSquare,
  Clock,
  TrendingUp,
  AlertTriangle,
  Calendar,
  Target,
  Plus,
  Search,
  Star,
  Filter,
  ChevronDown,
  ChevronUp,
  Bell,
  BarChart3,
  Trophy,
  Lightbulb,
  Sparkles,
  Zap,
  BarChart2,
  PieChart,
  Activity,
  Home,
  ListTodo,
  Users,
  Settings,
  Award,
  Flame,
  Gift,
  ArrowRight,
  Circle,
  CheckCircle,
  XCircle,
  Target as TargetIcon,
  LayoutGrid,
  List,
  Grid3x3,
  SlidersHorizontal,
  Eye,
  EyeOff,
  Crown,
  Award as AwardIcon,
  TrendingUp as TrendingUpIcon,
  Rocket,
  Coffee,
  Moon,
  Sun,
  Dumbbell,
  BookOpen,
  Heart,
  Brain
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTasks } from '../hooks/useTasks';
import { useAuth } from '../contexts/AuthContext';
import { BottomBar } from '../components/layout/BottomBar';
import { TaskForm } from '../components/tasks/TaskForm';

// Mini Stat Card - Native Style
const MiniStat = ({ label, value, icon: Icon, color, trend }) => {
  const colors = {
    blue: 'bg-blue-500/10 text-blue-500',
    green: 'bg-emerald-500/10 text-emerald-500',
    yellow: 'bg-amber-500/10 text-amber-500',
    red: 'bg-rose-500/10 text-rose-500',
    purple: 'bg-violet-500/10 text-violet-500'
  };

  return (
    <motion.div
      whileTap={{ scale: 0.95 }}
      className="bg-white dark:bg-[#1e293b] rounded-2xl p-3 border border-gray-100 dark:border-gray-700/50 shadow-sm"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[9px] font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            {label}
          </p>
          <p className="text-xl font-bold text-gray-900 dark:text-white mt-0.5">
            {value}
          </p>
        </div>
        <div className={`p-2 rounded-xl ${colors[color]}`}>
          <Icon size={16} />
        </div>
      </div>
      {trend && (
        <div className="flex items-center gap-1 mt-1">
          <TrendingUp size={10} className={trend > 0 ? 'text-emerald-500' : 'text-rose-500'} />
          <span className={`text-[10px] font-medium ${trend > 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
            {trend > 0 ? '+' : ''}{trend}%
          </span>
        </div>
      )}
    </motion.div>
  );
};

// Compact Task Item - Native Style
const TaskItem = ({ task, index }) => {
  const priorityColors = {
    low: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    medium: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    high: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
    urgent: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400'
  };

  const statusIcons = {
    completed: <CheckCircle size={14} className="text-emerald-500" />,
    'in-progress': <Clock size={14} className="text-amber-500" />,
    todo: <Circle size={14} className="text-gray-400" />
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className="flex items-center gap-3 p-3 bg-gray-50/50 dark:bg-gray-800/50 rounded-xl hover:bg-gray-100/50 dark:hover:bg-gray-700/50 transition-colors"
    >
      <div className="flex-shrink-0">
        {statusIcons[task.status]}
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium text-gray-900 dark:text-white truncate ${task.status === 'completed' ? 'line-through text-gray-400 dark:text-gray-500' : ''}`}>
          {task.title}
        </p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${priorityColors[task.priority]}`}>
            {task.priority}
          </span>
          {task.dueDate && (
            <span className="text-[10px] text-gray-500 dark:text-gray-400">
              • {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </span>
          )}
        </div>
      </div>
      <ArrowRight size={14} className="text-gray-400 flex-shrink-0" />
    </motion.div>
  );
};

// Skeleton Loader - Native Style
const DashboardSkeleton = () => (
  <div className="min-h-screen bg-[#f8fafc] dark:bg-[#0f172a] pb-24">
    <div className="px-4 pt-6 space-y-4 max-w-md mx-auto">
      <div className="flex items-center justify-between animate-pulse">
        <div className="space-y-2">
          <div className="h-7 w-40 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
          <div className="h-4 w-56 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
        </div>
        <div className="h-12 w-12 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
      </div>
      <div className="grid grid-cols-4 gap-2 animate-pulse">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="h-20 bg-gray-200 dark:bg-gray-700 rounded-2xl"></div>
        ))}
      </div>
      <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded-2xl animate-pulse"></div>
      <div className="grid grid-cols-4 gap-2 animate-pulse">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
        ))}
      </div>
      <div className="h-40 bg-gray-200 dark:bg-gray-700 rounded-2xl animate-pulse"></div>
      <div className="space-y-2">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse"></div>
        ))}
      </div>
      <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded-2xl animate-pulse"></div>
    </div>
  </div>
);

export const Dashboard: React.FC = () => {
  const { stats, tasks, loading } = useTasks();
  const { userProfile } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [isDelayedLoading, setIsDelayedLoading] = useState(true);
  const [motivationIndex, setMotivationIndex] = useState(0);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [showHabits, setShowHabits] = useState(true);

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

  useEffect(() => {
    const timer = setTimeout(() => setIsDelayedLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  if (loading || isDelayedLoading) {
    return <DashboardSkeleton />;
  }

  const completionRate = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;
  const weeklyCompletionRate = stats.thisWeekTotal > 0 ? Math.round((stats.thisWeekCompleted / stats.thisWeekTotal) * 100) : 0;

  const displayTasks = tasks
    .filter(task => task.title.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0))
    .slice(0, 5);

  const priorityTasks = tasks
    .filter(task => (task.priority === 'urgent' || task.priority === 'high') && task.status !== 'completed')
    .slice(0, 3);

  // Calculate habit stats
  const activeHabits = habits.filter(h => h.active !== false).length;
  const totalHabitStreak = habits.reduce((sum, h) => sum + (h.currentStreak || 0), 0);
  const bestHabitStreak = Math.max(...habits.map(h => h.bestStreak || 0), 0);
  const habitCompletionRate = habits.length > 0
    ? Math.round((habits.filter(h => h.totalCompletions > 0).length / habits.length) * 100)
    : 0;

  const quickStats = [
    { label: 'Total', value: stats.total, icon: CheckSquare, color: 'blue', trend: 12 },
    { label: 'Done', value: stats.completed, icon: Target, color: 'green', trend: 8 },
    { label: 'Progress', value: stats.inProgress, icon: Clock, color: 'yellow', trend: -5 },
    { label: 'Overdue', value: stats.overdue, icon: AlertTriangle, color: 'red', trend: -3 },
  ];

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const getGreetingEmoji = () => {
    const hour = new Date().getHours();
    if (hour < 12) return '🌅';
    if (hour < 17) return '☀️';
    return '🌙';
  };

  const motivations = [
    "✨ Start where you are. Use what you have. Do what you can.",
    "🔥 Success is the sum of small efforts repeated daily.",
    "💪 The secret of getting ahead is getting started.",
    "🎯 Focus on being productive instead of busy.",
    "🌟 Small daily improvements lead to stunning results."
  ];

  const handleOpenTaskForm = () => {
    setShowTaskForm(true);
  };

  const handleCloseTaskForm = () => {
    setShowTaskForm(false);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#0f172a] pb-24">
      {/* Status Bar Gradient */}
      <div className="h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>

      <div className="px-4 pt-3 space-y-4 max-w-md mx-auto">
        {/* Header - Native Style */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">{getGreetingEmoji()}</span>
              <h1 className="text-lg font-bold text-gray-900 dark:text-white">
                {greeting()}
              </h1>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              👋 Welcome back, {userProfile?.name || 'Alex'}!
            </p>
          </div>
          <motion.button
            whileTap={{ scale: 0.9 }}
            className="w-10 h-10 rounded-full bg-white dark:bg-[#1e293b] shadow-md flex items-center justify-center border border-gray-100 dark:border-gray-700 relative"
          >
            <Bell size={18} className="text-gray-600 dark:text-gray-300" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full"></span>
          </motion.button>
        </motion.div>

        {/* Stats Grid - Native Cards */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-4 gap-2"
        >
          {quickStats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <MiniStat {...stat} />
            </motion.div>
          ))}
        </motion.div>

        {/* Progress Ring - Native Style */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-[#1e293b] rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-700/50"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Weekly Progress
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-0.5">
                {weeklyCompletionRate}%
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                {stats.thisWeekCompleted} of {stats.thisWeekTotal} done
              </p>
            </div>
            <div className="relative w-16 h-16">
              <svg className="w-16 h-16 transform -rotate-90">
                <circle
                  cx="32"
                  cy="32"
                  r="28"
                  stroke="#e5e7eb"
                  strokeWidth="4"
                  fill="none"
                  className="dark:stroke-gray-700"
                />
                <circle
                  cx="32"
                  cy="32"
                  r="28"
                  stroke="url(#progressGradient)"
                  strokeWidth="4"
                  fill="none"
                  strokeLinecap="round"
                  strokeDasharray={175.93}
                  strokeDashoffset={175.93 - (weeklyCompletionRate / 100) * 175.93}
                />
                <defs>
                  <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#8B5CF6" />
                    <stop offset="100%" stopColor="#3B82F6" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <Flame size={16} className="text-amber-500" />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Habit Tracker Section - Native Style */}
        {habits.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-purple-500/10 via-indigo-500/10 to-blue-500/10 dark:from-purple-500/5 dark:via-indigo-500/5 dark:to-blue-500/5 rounded-2xl p-3.5 border border-purple-200/50 dark:border-purple-800/30"
          >
            <div className="flex items-center justify-between mb-2.5">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-500 shadow-lg shadow-purple-500/25">
                  <TargetIcon size={14} className="text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white">Habit Tracker</h3>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400">
                    {activeHabits} active • {totalHabitStreak} day streak
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
                    <div className="bg-white/80 dark:bg-gray-800/80 rounded-xl p-2 border border-purple-100 dark:border-purple-800/30">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <Flame size={12} className="text-orange-500" />
                          <span className="text-[9px] text-gray-500 dark:text-gray-400">Streak</span>
                        </div>
                        <span className="text-sm font-bold text-orange-500">{totalHabitStreak}</span>
                      </div>
                    </div>
                    <div className="bg-white/80 dark:bg-gray-800/80 rounded-xl p-2 border border-purple-100 dark:border-purple-800/30">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <AwardIcon size={12} className="text-yellow-500" />
                          <span className="text-[9px] text-gray-500 dark:text-gray-400">Best</span>
                        </div>
                        <span className="text-sm font-bold text-yellow-500">{bestHabitStreak}</span>
                      </div>
                    </div>
                    <div className="bg-white/80 dark:bg-gray-800/80 rounded-xl p-2 border border-purple-100 dark:border-purple-800/30">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <Activity size={12} className="text-emerald-500" />
                          <span className="text-[9px] text-gray-500 dark:text-gray-400">Active</span>
                        </div>
                        <span className="text-sm font-bold text-emerald-500">{activeHabits}</span>
                      </div>
                    </div>
                    <div className="bg-white/80 dark:bg-gray-800/80 rounded-xl p-2 border border-purple-100 dark:border-purple-800/30">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <TrendingUpIcon size={12} className="text-blue-500" />
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
                        className="flex items-center gap-2.5 bg-white/80 dark:bg-gray-800/80 rounded-xl p-2 border border-gray-100 dark:border-gray-700/50"
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
                        <div className="w-12 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
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

        {/* Quick Actions - Native Style */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25 }}
          className="grid grid-cols-4 gap-2"
        >
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
          >
            <motion.button
              whileTap={{ scale: 0.92 }}
              onClick={handleOpenTaskForm}
              className="w-full bg-white dark:bg-[#1e293b] rounded-xl p-3 shadow-sm border border-gray-100 dark:border-gray-700/50 hover:shadow-md transition-all"
            >
              <div className="w-8 h-8 rounded-xl bg-violet-500/10 flex items-center justify-center mx-auto mb-1">
                <Plus size={16} className="text-violet-500" />
              </div>
              <p className="text-[10px] font-medium text-gray-600 dark:text-gray-400 text-center">
                New
              </p>
            </motion.button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Link to="/calendarpage">
              <motion.button
                whileTap={{ scale: 0.92 }}
                className="w-full bg-white dark:bg-[#1e293b] rounded-xl p-3 shadow-sm border border-gray-100 dark:border-gray-700/50 hover:shadow-md transition-all"
              >
                <div className="w-8 h-8 rounded-xl bg-blue-500/10 flex items-center justify-center mx-auto mb-1">
                  <Calendar size={16} className="text-blue-500" />
                </div>
                <p className="text-[10px] font-medium text-gray-600 dark:text-gray-400 text-center">
                  Calendar
                </p>
              </motion.button>
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
          >
            <Link to="/analytics">
              <motion.button
                whileTap={{ scale: 0.92 }}
                className="w-full bg-white dark:bg-[#1e293b] rounded-xl p-3 shadow-sm border border-gray-100 dark:border-gray-700/50 hover:shadow-md transition-all"
              >
                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center mx-auto mb-1">
                  <BarChart3 size={16} className="text-emerald-500" />
                </div>
                <p className="text-[10px] font-medium text-gray-600 dark:text-gray-400 text-center">
                  Analytics
                </p>
              </motion.button>
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Link to="/habits">
              <motion.button
                whileTap={{ scale: 0.92 }}
                className="w-full bg-white dark:bg-[#1e293b] rounded-xl p-3 shadow-sm border border-gray-100 dark:border-gray-700/50 hover:shadow-md transition-all"
              >
                <div className="w-8 h-8 rounded-xl bg-purple-500/10 flex items-center justify-center mx-auto mb-1">
                  <TargetIcon size={16} className="text-purple-500" />
                </div>
                <p className="text-[10px] font-medium text-gray-600 dark:text-gray-400 text-center">
                  Habits
                </p>
              </motion.button>
            </Link>
          </motion.div>
        </motion.div>

        {/* Priority Tasks - Native Style */}
        {priorityTasks.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-white dark:bg-[#1e293b] rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-700/50"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center">
                  <Zap size={14} className="text-rose-500" />
                </div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                  Priority Tasks
                </h3>
              </div>
              <span className="text-xs font-medium text-rose-500">
                {priorityTasks.length} urgent
              </span>
            </div>
            <div className="space-y-2">
              {priorityTasks.map((task, index) => (
                <TaskItem key={task.id} task={task} index={index} />
              ))}
            </div>
          </motion.div>
        )}

        {/* Recent Tasks - Native Style */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35 }}
          className="bg-white dark:bg-[#1e293b] rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-700/50"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <Clock size={14} className="text-blue-500" />
              </div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                Recent Tasks
              </h3>
            </div>
            <Link to="/tasks" className="text-xs font-medium text-blue-500 flex items-center gap-1">
              View All <ArrowRight size={12} />
            </Link>
          </div>

          <div className="relative mb-3">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-gray-50 dark:bg-gray-700/50 rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 border border-gray-100 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="space-y-2">
            {displayTasks.length === 0 ? (
              <div className="text-center py-6">
                <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-2">
                  <ListTodo size={20} className="text-gray-400" />
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">No tasks yet</p>
                <button
                  onClick={handleOpenTaskForm}
                  className="text-xs text-blue-500 mt-1 inline-block hover:underline"
                >
                  Create your first task →
                </button>
              </div>
            ) : (
              displayTasks.map((task, index) => (
                <TaskItem key={task.id} task={task} index={index} />
              ))
            )}
          </div>
        </motion.div>

        {/* Motivation Tip - Native Style */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-gradient-to-r from-violet-500 to-blue-500 rounded-2xl p-4 text-white shadow-lg"
        >
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur flex items-center justify-center flex-shrink-0 mt-0.5">
              <Sparkles size={16} className="text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-white/80 uppercase tracking-wider">
                💡 Daily Motivation
              </p>
              <p className="text-sm font-medium mt-0.5 leading-snug">
                {motivations[motivationIndex % motivations.length]}
              </p>
            </div>
            <button
              onClick={() => setMotivationIndex(prev => prev + 1)}
              className="flex-shrink-0 w-6 h-6 rounded-full bg-white/20 backdrop-blur flex items-center justify-center hover:bg-white/30 transition-colors"
            >
              <ArrowRight size={12} className="text-white" />
            </button>
          </div>
        </motion.div>
      </div>

      {/* Task Form Modal */}
      <TaskForm
        isOpen={showTaskForm}
        onClose={handleCloseTaskForm}
      />

      {/* Bottom Bar */}
      <BottomBar onTaskFormOpen={handleOpenTaskForm} />
    </div>
  );
};