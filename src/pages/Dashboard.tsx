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
  Activity
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTasks } from '../hooks/useTasks';
import { useAuth } from '../contexts/AuthContext';
import { BottomBar } from '../components/layout/BottomBar';

// StatCard Component
const StatCard = ({ title, value, icon: Icon, color, trend, compact = false }) => {
  const colorMap = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    yellow: 'from-yellow-500 to-yellow-600',
    red: 'from-red-500 to-red-600',
    purple: 'from-purple-500 to-purple-600'
  };

  return (
    <motion.div
      whileHover={{ y: -5 }}
      className={`bg-gradient-to-br ${colorMap[color]} rounded-2xl p-4 text-white shadow-lg ${compact ? 'h-28' : 'h-32'}`}
    >
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm opacity-90">{title}</p>
          <h3 className={`font-bold ${compact ? 'text-2xl mt-1' : 'text-3xl mt-2'}`}>{value}</h3>
        </div>
        <div className="bg-white/20 p-2 rounded-lg">
          <Icon size={compact ? 20 : 24} />
        </div>
      </div>
      {trend && (
        <div className={`flex items-center mt-2 ${compact ? 'text-xs' : 'text-sm'}`}>
          <TrendingUp size={compact ? 14 : 16} className={trend.isPositive ? 'text-white' : 'text-red-200 rotate-180'} />
          <span className={`ml-1 ${trend.isPositive ? 'text-white' : 'text-red-200'}`}>
            {trend.value}% {trend.isPositive ? 'increase' : 'decrease'}
          </span>
        </div>
      )}
    </motion.div>
  );
};

// TaskCard Component
const TaskCard = ({ task, index, compact = false }) => {
  const priorityColors = {
    low: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    high: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
    urgent: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
  };

  const statusIcons = {
    'completed': <CheckSquare size={14} className="text-green-500" />,
    'in-progress': <Clock size={14} className="text-yellow-500" />,
    'todo': <AlertTriangle size={14} className="text-gray-400" />
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-white dark:bg-gray-800 rounded-xl p-3 shadow-sm border border-gray-100 dark:border-gray-700"
    >
      <div className="flex justify-between items-start">
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-gray-900 dark:text-white truncate">{task.title}</h4>
          <div className="flex items-center mt-2 space-x-2">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${priorityColors[task.priority]}`}>
              {task.priority}
            </span>
            {task.dueDate && (
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Due: {task.dueDate.toLocaleDateString()}
              </span>
            )}
          </div>
        </div>
        <div className="pl-2">
          {statusIcons[task.status]}
        </div>
      </div>
      {!compact && task.description && (
        <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 line-clamp-2">
          {task.description}
        </p>
      )}
    </motion.div>
  );
};

// --- NEW Skeleton Components ---

const DashboardSkeleton: React.FC = () => {
  // Skeleton for a single StatCard
  const StatCardSkeleton = () => (
    <div className="bg-gray-200 dark:bg-gray-700 rounded-2xl p-4 h-28 animate-pulse">
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <div className="h-4 w-24 bg-gray-300 dark:bg-gray-600 rounded"></div>
          <div className="h-6 w-16 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
        </div>
        <div className="h-8 w-8 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
      </div>
    </div>
  );

  // Skeleton for a single TaskCard
  const TaskCardSkeleton = () => (
    <div className="bg-gray-100 dark:bg-gray-700 rounded-xl p-3 shadow-sm border border-gray-200 dark:border-gray-600 animate-pulse">
      <div className="flex justify-between items-start">
        <div className="flex-1 min-w-0 space-y-2">
          <div className="h-4 w-3/4 bg-gray-300 dark:bg-gray-600 rounded"></div>
          <div className="h-3 w-1/2 bg-gray-300 dark:bg-gray-600 rounded"></div>
        </div>
        <div className="h-4 w-4 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4 space-y-4 pb-20">
      {/* Header Skeleton */}
      <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md p-4 rounded-xl shadow-md">
        <div className="flex justify-between items-center">
          <div className="space-y-2">
            <div className="h-6 w-48 bg-gray-300 dark:bg-gray-600 rounded"></div>
            <div className="h-4 w-32 bg-gray-300 dark:bg-gray-600 rounded"></div>
          </div>
          <div className="flex gap-2">
            <div className="h-8 w-8 rounded-full bg-gray-300 dark:bg-gray-600 animate-pulse"></div>
            <div className="h-8 w-8 rounded-full bg-gray-300 dark:bg-gray-600 animate-pulse"></div>
          </div>
        </div>
      </div>

      {/* View Toggle Skeleton */}
      <div className="flex bg-white dark:bg-gray-800 rounded-xl p-1 shadow-md animate-pulse">
          <div className="flex-1 py-2 px-4 h-10 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
          <div className="flex-1 py-2 px-4 h-10 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
          <div className="flex-1 py-2 px-4 h-10 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
      </div>

      {/* Stats Grid Skeleton */}
      <div className="grid grid-cols-2 gap-3">
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
      </div>

      {/* Completion Rate Skeleton */}
      <div className="bg-gray-200 dark:bg-gray-700 rounded-2xl p-4 h-28 animate-pulse">
        <div className="h-5 w-3/4 bg-gray-300 dark:bg-gray-600 rounded mb-3"></div>
        <div className="h-3 w-1/2 bg-gray-300 dark:bg-gray-600 rounded mb-2"></div>
        <div className="bg-gray-300 dark:bg-gray-600 rounded-full h-2"></div>
      </div>

      {/* Quick Actions Skeleton */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-4 animate-pulse">
        <div className="h-5 w-32 bg-gray-200 dark:bg-gray-600 rounded mb-4"></div>
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-xl h-16"></div>
          <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-xl h-16"></div>
        </div>
      </div>

      {/* Priority Tasks Skeleton */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-4 animate-pulse">
        <div className="h-5 w-36 bg-gray-200 dark:bg-gray-600 rounded mb-4"></div>
        <div className="space-y-3">
          <TaskCardSkeleton />
          <TaskCardSkeleton />
        </div>
      </div>
      
      {/* Motivational Tip Skeleton */}
      <div className="bg-gray-200 dark:bg-gray-700 rounded-2xl p-4 h-24 animate-pulse">
        <div className="flex items-center gap-3">
            <div className="h-5 w-5 rounded-full bg-gray-300 dark:bg-gray-600"></div>
            <div className="space-y-2">
                <div className="h-4 w-32 bg-gray-300 dark:bg-gray-600 rounded"></div>
                <div className="h-3 w-48 bg-gray-300 dark:bg-gray-600 rounded"></div>
            </div>
        </div>
      </div>
    </div>
  );
};

// --- END NEW SKELETON COMPONENTS ---

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

export const Dashboard: React.FC = () => {
  const { stats, tasks, loading } = useTasks();
  const { userProfile } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeView, setActiveView] = useState<'overview' | 'recent' | 'upcoming'>('overview');
  const [showFilters, setShowFilters] = useState(false);
  const [motivationIndex, setMotivationIndex] = useState(0);
  
  // State for the 2-second delay
  const [isDelayedLoading, setIsDelayedLoading] = useState(true);

  // Simulates a minimum loading time for a smoother user experience
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsDelayedLoading(false);
    }, 2000); // 2 seconds

    return () => clearTimeout(timer);
  }, []);

  const motivations = [
    "The secret of getting ahead is getting started. - Mark Twain",
    "Productivity is never an accident. It is always the result of a commitment to excellence, intelligent planning, and focused effort. - Paul J. Meyer",
    "Your time is limited, so don't waste it living someone else's life. - Steve Jobs",
    "The way to get started is to quit talking and begin doing. - Walt Disney",
    "It's not about having time, it's about making time.",
    "Small daily improvements over time lead to stunning results."
  ];

  const rotateMotivation = () => {
    setMotivationIndex((prev) => (prev + 1) % motivations.length);
  };

  // Condition to show the skeleton loader
  if (loading || isDelayedLoading) {
    return <DashboardSkeleton />;
  }

  const completionRate = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;
  const weeklyCompletionRate = stats.thisWeekTotal > 0 ? Math.round((stats.thisWeekCompleted / stats.thisWeekTotal) * 100) : 0;

  // Add recent tasks feature
  const recentTasks = tasks
    .filter(task => task.title.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0))
    .slice(0, 5);

  // Add upcoming deadlines
  const upcomingTasks = tasks
    .filter(task => task.dueDate && task.dueDate > new Date() && task.status !== 'completed')
    .sort((a, b) => (a.dueDate?.getTime() || 0) - (b.dueDate?.getTime() || 0))
    .slice(0, 5);

  // Priority tasks (urgent and high priority)
  const priorityTasks = tasks
    .filter(task => (task.priority === 'urgent' || task.priority === 'high') && task.status !== 'completed')
    .slice(0, 3);

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
              Welcome back, {userProfile?.name}!
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Here's your productivity overview
            </p>
          </div>
          <div className="flex items-center gap-2">
            <motion.button
              whileTap={{ scale: 0.95 }}
              className="p-2 rounded-full bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700"
              onClick={rotateMotivation}
              aria-label="Change motivation"
            >
              <Lightbulb size={18} className="text-yellow-500" />
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.95 }}
              className="p-2 rounded-full bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700"
              onClick={() => setShowFilters(!showFilters)}
              aria-label="Toggle filters"
            >
              <Filter size={18} />
            </motion.button>
          </div>
        </div>

        {/* View Toggle for Mobile */}
        <div className="flex bg-white dark:bg-gray-800 rounded-xl p-1 shadow-md mt-4">
          <button
            onClick={() => setActiveView('overview')}
            className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium flex items-center justify-center space-x-1 ${
              activeView === 'overview'
                ? 'bg-blue-500 text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400'
            }`}
          >
            <BarChart2 size={16} />
            <span>Overview</span>
          </button>
          <button
            onClick={() => setActiveView('recent')}
            className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium flex items-center justify-center space-x-1 ${
              activeView === 'recent'
                ? 'bg-blue-500 text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400'
            }`}
          >
            <Clock size={16} />
            <span>Recent</span>
          </button>
          <button
            onClick={() => setActiveView('upcoming')}
            className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium flex items-center justify-center space-x-1 ${
              activeView === 'upcoming'
                ? 'bg-blue-500 text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400'
            }`}
          >
            <Calendar size={16} />
            <span>Upcoming</span>
          </button>
        </div>
      </motion.div>

      <div className="p-4 space-y-4">
        {/* Filters */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-md overflow-hidden"
            >
              <div className="flex flex-wrap gap-3">
                <div className="flex-1 min-w-[120px]">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                  <select className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm">
                    <option>All Statuses</option>
                    <option>To Do</option>
                    <option>In Progress</option>
                    <option>Completed</option>
                  </select>
                </div>
                <div className="flex-1 min-w-[120px]">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Priority</label>
                  <select className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm">
                    <option>All Priorities</option>
                    <option>Urgent</option>
                    <option>High</option>
                    <option>Medium</option>
                    <option>Low</option>
                  </select>
                </div>
                <div className="flex-1 min-w-[120px]">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
                  <select className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm">
                    <option>All Categories</option>
                    <option>Work</option>
                    <option>Personal</option>
                    <option>Health</option>
                    <option>Learning</option>
                  </select>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mobile View Content */}
        <AnimatePresence mode="wait">
          {activeView === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              {/* Stats Grid */}
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-2 gap-3"
              >
                <motion.div variants={itemVariants}>
                  <StatCard
                    title="Total Tasks"
                    value={stats.total}
                    icon={CheckSquare}
                    color="blue"
                    trend={{ value: 12, isPositive: true }}
                    compact
                  />
                </motion.div>
                <motion.div variants={itemVariants}>
                  <StatCard
                    title="Completed"
                    value={stats.completed}
                    icon={Target}
                    color="green"
                    trend={{ value: 8, isPositive: true }}
                    compact
                  />
                </motion.div>
                <motion.div variants={itemVariants}>
                  <StatCard
                    title="In Progress"
                    value={stats.inProgress}
                    icon={Clock}
                    color="yellow"
                    trend={{ value: 5, isPositive: false }}
                    compact
                  />
                </motion.div>
                <motion.div variants={itemVariants}>
                  <StatCard
                    title="Overdue"
                    value={stats.overdue}
                    icon={AlertTriangle}
                    color="red"
                    trend={{ value: 3, isPositive: false }}
                    compact
                  />
                </motion.div>
              </motion.div>

              {/* Completion Rate */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl p-4 text-white shadow-lg"
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold">Weekly Progress</h3>
                  <div className="bg-white/20 p-1 rounded">
                    <TrendingUp size={16} />
                  </div>
                </div>
                <p className="text-blue-100 text-sm mb-2">
                  Completed {weeklyCompletionRate}% of tasks this week
                </p>
                <div className="bg-white/20 rounded-full h-2 mb-2">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${weeklyCompletionRate}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="bg-white rounded-full h-2"
                  />
                </div>
                <p className="text-blue-100 text-xs">
                  {stats.thisWeekCompleted} of {stats.thisWeekTotal} tasks completed
                </p>
              </motion.div>

              {/* Quick Actions */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-4"
              >
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Quick Actions</h3>
                <div className="grid grid-cols-2 gap-3">
                  <Link to="/tasks/">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-xl text-center w-full"
                    >
                      <Plus className="w-5 h-5 text-blue-600 dark:text-blue-400 mx-auto mb-1" />
                      <span className="text-xs font-medium text-blue-600 dark:text-blue-400">Add Task</span>
                    </motion.button>
                  </Link>

                  <Link to="/CalendarPage">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="p-3 bg-green-50 dark:bg-green-900/30 rounded-xl text-center w-full"
                    >
                      <Calendar className="w-5 h-5 text-green-600 dark:text-green-400 mx-auto mb-1" />
                      <span className="text-xs font-medium text-green-600 dark:text-green-400">Calendar</span>
                    </motion.button>
                  </Link>
                </div>
              </motion.div>

              {/* Priority Tasks */}
              {priorityTasks.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-4"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-gray-900 dark:text-white">Priority Tasks</h3>
                    <Zap size={16} className="text-yellow-500" />
                  </div>
                  <div className="space-y-3">
                    {priorityTasks.map((task, index) => (
                      <TaskCard key={task.id} task={task} index={index} compact />
                    ))}
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}

          {activeView === 'recent' && (
            <motion.div
              key="recent"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-4"
            >
              <div className="flex flex-col gap-3 mb-3">
                <h3 className="font-semibold text-gray-900 dark:text-white">Recent Tasks</h3>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search recent tasks..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>
              </div>
              <AnimatePresence>
                {recentTasks.length === 0 ? (
                  <div className="text-center py-6 text-gray-500 dark:text-gray-400 text-sm">
                    No recent tasks found.
                  </div>
                ) : (
                  <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="space-y-3"
                  >
                    {recentTasks.map((task, index) => (
                      <motion.div key={task.id} variants={itemVariants}>
                        <TaskCard task={task} index={index} compact />
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {activeView === 'upcoming' && (
            <motion.div
              key="upcoming"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-4"
            >
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Upcoming Deadlines</h3>
              <AnimatePresence>
                {upcomingTasks.length === 0 ? (
                  <div className="text-center py-6 text-gray-500 dark:text-gray-400 text-sm">
                    No upcoming deadlines. Great job!
                  </div>
                ) : (
                  <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="space-y-3"
                  >
                    {upcomingTasks.map((task) => (
                      <motion.li
                        key={task.id}
                        variants={itemVariants}
                        className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <AlertTriangle className="text-red-500 w-5 h-5" />
                          <div className="overflow-hidden">
                            <h4 className="font-medium text-gray-900 dark:text-white text-sm truncate">
                              {task.title}
                            </h4>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              Due: {task.dueDate?.toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <span className="text-xs font-medium text-red-500 whitespace-nowrap ml-2">
                          {Math.ceil((task.dueDate!.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))}d
                        </span>
                      </motion.li>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Motivational Tip */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-2xl p-4 text-white shadow-lg"
          onClick={rotateMotivation}
        >
          <div className="flex items-center gap-3">
            <Sparkles size={20} className="text-white" />
            <div>
              <h3 className="font-semibold mb-1">Daily Motivation</h3>
              <p className="text-yellow-100 text-sm">
                {motivations[motivationIndex]}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Mobile Optimization Notice */}
        <motion.div
          className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-4 flex items-start"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg mr-3">
            <BarChart3 size={18} className="text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h4 className="text-blue-800 dark:text-blue-200 font-medium text-sm">Mobile Optimized</h4>
            <p className="text-blue-600 dark:text-blue-300 text-xs mt-1">
              Swipe between tabs to explore different aspects of your productivity.
            </p>
          </div>
        </motion.div>
      </div>

      <BottomBar />
    </div>
  );
};