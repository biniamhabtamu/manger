import React, { useState } from 'react';
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
  Lightbulb
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { StatCard } from '../components/dashboard/StatCard';
import { useTasks } from '../hooks/useTasks';
import { useAuth } from '../contexts/AuthContext';
import { TaskCard } from '../components/tasks/TaskCard';
import { BottomBar } from '../components/layout/BottomBar';

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
    <div className="p-4 sm:p-6 md:p-8 space-y-6 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 min-h-screen pb-20">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-6 md:mb-8"
      >
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-gray-900 dark:text-white tracking-tight">
              Welcome back, {userProfile?.name}!
            </h1>
            <p className="text-base md:text-lg text-gray-600 dark:text-gray-400 mt-2 md:mt-3">
              Here's what's happening with your tasks today.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700"
              onClick={rotateMotivation}
              aria-label="Change motivation"
            >
              <Lightbulb size={20} className="text-yellow-500" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700"
              onClick={() => setShowFilters(!showFilters)}
              aria-label="Toggle filters"
            >
              <Filter size={20} />
            </motion.button>
          </div>
        </div>

        {/* View Toggle for Mobile */}
        <div className="flex md:hidden bg-white dark:bg-gray-800 rounded-lg p-1 shadow-md mt-4">
          <button
            onClick={() => setActiveView('overview')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium ${activeView === 'overview' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400'}`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveView('recent')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium ${activeView === 'recent' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400'}`}
          >
            Recent
          </button>
          <button
            onClick={() => setActiveView('upcoming')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium ${activeView === 'upcoming' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400'}`}
          >
            Upcoming
          </button>
        </div>
      </motion.div>

      {/* Filters */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-md mb-4 overflow-hidden"
          >
            <div className="flex flex-wrap gap-3">
              <div className="flex-1 min-w-[150px]">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                <select className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-sm">
                  <option>All Statuses</option>
                  <option>To Do</option>
                  <option>In Progress</option>
                  <option>Completed</option>
                </select>
              </div>
              <div className="flex-1 min-w-[150px]">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Priority</label>
                <select className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-sm">
                  <option>All Priorities</option>
                  <option>Urgent</option>
                  <option>High</option>
                  <option>Medium</option>
                  <option>Low</option>
                </select>
              </div>
              <div className="flex-1 min-w-[150px]">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
                <select className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-sm">
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
      <div className="md:hidden">
        {activeView === 'overview' && (
          <div className="space-y-5">
            {/* Stats Grid */}
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-2 gap-3"
            >
              <motion.div variants={itemVariants} className="col-span-1">
                <StatCard
                  title="Total Tasks"
                  value={stats.total}
                  icon={CheckSquare}
                  color="blue"
                  trend={{ value: 12, isPositive: true }}
                  compact
                />
              </motion.div>
              <motion.div variants={itemVariants} className="col-span-1">
                <StatCard
                  title="Completed"
                  value={stats.completed}
                  icon={Target}
                  color="green"
                  trend={{ value: 8, isPositive: true }}
                  compact
                />
              </motion.div>
              <motion.div variants={itemVariants} className="col-span-1">
                <StatCard
                  title="In Progress"
                  value={stats.inProgress}
                  icon={Clock}
                  color="yellow"
                  trend={{ value: 5, isPositive: false }}
                  compact
                />
              </motion.div>
              <motion.div variants={itemVariants} className="col-span-1">
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
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl p-4 text-white shadow-xl relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-8 -mt-8 blur-xl"></div>
              <div className="relative z-10">
                <h3 className="text-lg font-semibold mb-2">
                  Weekly Progress
                </h3>
                <p className="text-blue-100 text-sm">
                  Completed {weeklyCompletionRate}% of tasks this week
                </p>
                <div className="mt-4 bg-white/20 rounded-full h-2 shadow-inner">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${weeklyCompletionRate}%` }}
                    transition={{ duration: 1.5, ease: 'easeOut', delay: 0.5 }}
                    className="bg-white rounded-full h-2"
                  />
                </div>
              </div>
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 p-4"
            >
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                Quick Actions
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <Link to="/tasks/">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="p-3 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded-lg text-center transition-colors shadow-md w-full"
                  >
                    <Plus className="w-6 h-6 text-blue-600 dark:text-blue-400 mx-auto mb-1" />
                    <span className="text-xs font-medium text-blue-600 dark:text-blue-400">
                      Add Task
                    </span>
                  </motion.button>
                </Link>

                <Link to="/CalendarPage">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="p-3 bg-green-50 dark:bg-green-900/30 hover:bg-green-100 dark:hover:bg-green-900/50 rounded-lg text-center transition-colors shadow-md w-full"
                  >
                    <Calendar className="w-6 h-6 text-green-600 dark:text-green-400 mx-auto mb-1" />
                    <span className="text-xs font-medium text-green-600 dark:text-green-400">
                      Calendar
                    </span>
                  </motion.button>
                </Link>
              </div>
            </motion.div>
          </div>
        )}

        {activeView === 'recent' && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 p-4"
          >
            <div className="flex flex-col gap-3 mb-3">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                Recent Tasks
              </h3>
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
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 p-4"
          >
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              Upcoming Deadlines
            </h3>
            <AnimatePresence>
              {upcomingTasks.length === 0 ? (
                <div className="text-center py-6 text-gray-500 dark:text-gray-400 text-sm">
                  No upcoming deadlines. Great job!
                </div>
              ) : (
                <motion.ul 
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  className="space-y-3"
                >
                  {upcomingTasks.map((task) => (
                    <motion.li 
                      key={task.id} 
                      variants={itemVariants}
                      className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg shadow-sm"
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
                </motion.ul>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      {/* Desktop View Content */}
      <div className="hidden md:block">
        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6"
        >
          <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            Quick Actions
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Link to="/tasks/">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-4 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded-xl text-center transition-colors shadow-md w-full"
              >
                <Plus className="w-8 h-8 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
                <span className="text-base font-medium text-blue-600 dark:text-blue-400">
                  Add Task
                </span>
              </motion.button>
            </Link>

            <Link to="/CalendarPage">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-4 bg-green-50 dark:bg-green-900/30 hover:bg-green-100 dark:hover:bg-green-900/50 rounded-xl text-center transition-colors shadow-md w-full"
              >
                <Calendar className="w-8 h-8 text-green-600 dark:text-green-400 mx-auto mb-2" />
                <span className="text-base font-medium text-green-600 dark:text-green-400">
                  Calendar
                </span>
              </motion.button>
            </Link>

            <Link to="/analytics">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-4 bg-purple-50 dark:bg-purple-900/30 hover:bg-purple-100 dark:hover:bg-purple-900/50 rounded-xl text-center transition-colors shadow-md w-full"
              >
                <TrendingUp className="w-8 h-8 text-purple-600 dark:text-purple-400 mx-auto mb-2" />
                <span className="text-base font-medium text-purple-600 dark:text-purple-400">
                  Analytics
                </span>
              </motion.button>
            </Link>

            <Link to="/goals">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-4 bg-yellow-50 dark:bg-yellow-900/30 hover:bg-yellow-100 dark:hover:bg-yellow-900/50 rounded-xl text-center transition-colors shadow-md w-full"
              >
                <Target className="w-8 h-8 text-yellow-600 dark:text-yellow-400 mx-auto mb-2" />
                <span className="text-base font-medium text-yellow-600 dark:text-yellow-400">
                  Goals
                </span>
              </motion.button>
            </Link>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6"
        >
          <motion.div variants={itemVariants}>
            <StatCard
              title="Total Tasks"
              value={stats.total}
              icon={CheckSquare}
              color="blue"
              trend={{ value: 12, isPositive: true }}
            />
          </motion.div>
          <motion.div variants={itemVariants}>
            <StatCard
              title="Completed"
              value={stats.completed}
              icon={Target}
              color="green"
              trend={{ value: 8, isPositive: true }}
            />
          </motion.div>
          <motion.div variants={itemVariants}>
            <StatCard
              title="In Progress"
              value={stats.inProgress}
              icon={Clock}
              color="yellow"
              trend={{ value: 5, isPositive: false }}
            />
          </motion.div>
          <motion.div variants={itemVariants}>
            <StatCard
              title="Overdue"
              value={stats.overdue}
              icon={AlertTriangle}
              color="red"
              trend={{ value: 3, isPositive: false }}
            />
          </motion.div>
        </motion.div>

        {/* Completion Rate */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-xl"></div>
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-2xl font-semibold mb-2">
                Your Progress This Week
              </h3>
              <p className="text-blue-100 text-lg">
                You've completed {weeklyCompletionRate}% of your tasks this week. Keep it up!
              </p>
              <p className="text-blue-200 text-base mt-1">
                {stats.thisWeekCompleted} of {stats.thisWeekTotal} tasks completed this week
              </p>
            </div>
            <div className="text-center md:text-right">
              <div className="text-4xl font-bold">
                {weeklyCompletionRate}%
              </div>
              <div className="text-blue-100 text-lg">
                completion rate
              </div>
            </div>
          </div>
          
          <div className="mt-6 bg-white/20 rounded-full h-3 shadow-inner">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${weeklyCompletionRate}%` }}
              transition={{ duration: 1.5, ease: 'easeOut', delay: 0.5 }}
              className="bg-white rounded-full h-3"
            />
          </div>
        </motion.div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Tasks */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-2xl font-semibold text-gray-900 dark:text-white">
                Recent Tasks
              </h3>
              <div className="relative w-full max-w-xs">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search recent tasks..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <AnimatePresence>
              {recentTasks.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  No recent tasks found.
                </div>
              ) : (
                <motion.div 
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  className="space-y-4"
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

          {/* Upcoming Deadlines */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.5 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6"
          >
            <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              Upcoming Deadlines
            </h3>
            <AnimatePresence>
              {upcomingTasks.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  No upcoming deadlines. Great job!
                </div>
              ) : (
                <motion.ul 
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  className="space-y-4"
                >
                  {upcomingTasks.map((task) => (
                    <motion.li 
                      key={task.id} 
                      variants={itemVariants}
                      className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-xl shadow-sm"
                    >
                      <div className="flex items-center gap-4">
                        <AlertTriangle className="text-red-500" size={24} />
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white">{task.title}</h4>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Due: {task.dueDate?.toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <span className="text-sm font-medium text-red-500">
                        {Math.ceil((task.dueDate!.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days left
                      </span>
                    </motion.li>
                  ))}
                </motion.ul>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>

      {/* Motivational Tip */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.5 }}
        className="bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl md:rounded-2xl p-4 md:p-6 text-white shadow-xl relative overflow-hidden"
        onClick={rotateMotivation}
      >
        <div className="absolute bottom-0 left-0 w-24 h-24 md:w-32 md:h-32 bg-white/10 rounded-full -ml-8 -mb-8 md:-ml-16 md:-mb-16 blur-xl"></div>
        <div className="relative z-10 flex items-center gap-3 md:gap-4">
          <Star className="text-white w-6 h-6 md:w-8 md:h-8" />
          <div>
            <h3 className="text-lg md:text-xl font-semibold mb-1">Daily Motivation</h3>
            <p className="text-yellow-100 text-sm md:text-base">
              {motivations[motivationIndex]}
            </p>
          </div>
        </div>
      </motion.div>
      
      <BottomBar />
    </div>
  );
};