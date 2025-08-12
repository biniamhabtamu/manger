import React from 'react';
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
  Star
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { StatCard } from '../components/dashboard/StatCard';
import { ProgressChart } from '../components/dashboard/ProgressChart';
import { useTasks } from '../hooks/useTasks';
import { useAuth } from '../contexts/AuthContext';
import { TaskCard } from '../components/tasks/TaskCard'; // Assuming TaskCard exists

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
  const [searchTerm, setSearchTerm] = React.useState('');

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

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 min-h-screen">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white tracking-tight">
          Welcome back, {userProfile?.name}!
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 mt-3">
          Here's what's happening with your tasks today. Stay productive!
        </p>
      </motion.div>

      {/* Stats Grid */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6"
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

      {/* Progress Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6"
        >
          <ProgressChart stats={stats} type="doughnut" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6"
        >
          <ProgressChart stats={stats} type="bar" />
        </motion.div>
      </div>

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
          <Link to="/tasks/new">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-4 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded-xl text-center transition-colors shadow-md"
            >
              <Plus className="w-8 h-8 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
              <span className="text-base font-medium text-blue-600 dark:text-blue-400">
                Add Task
              </span>
            </motion.button>
          </Link>

          <Link to="/calendar">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-4 bg-green-50 dark:bg-green-900/30 hover:bg-green-100 dark:hover:bg-green-900/50 rounded-xl text-center transition-colors shadow-md"
            >
              <Calendar className="w-8 h-8 text-green-600 dark:text-green-400 mx-auto mb-2" />
              <span className="text-base font-medium text-green-600 dark:text-green-400">
                View Calendar
              </span>
            </motion.button>
          </Link>

          <Link to="/analytics">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-4 bg-purple-50 dark:bg-purple-900/30 hover:bg-purple-100 dark:hover:bg-purple-900/50 rounded-xl text-center transition-colors shadow-md"
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
              className="p-4 bg-yellow-50 dark:bg-yellow-900/30 hover:bg-yellow-100 dark:hover:bg-yellow-900/50 rounded-xl text-center transition-colors shadow-md"
            >
              <Target className="w-8 h-8 text-yellow-600 dark:text-yellow-400 mx-auto mb-2" />
              <span className="text-base font-medium text-yellow-600 dark:text-yellow-400">
                Set Goals
              </span>
            </motion.button>
          </Link>
        </div>
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

      {/* New Feature: Recent Tasks */}
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

      {/* New Feature: Upcoming Deadlines */}
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

      {/* New Feature: Motivational Tip */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.5 }}
        className="bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden"
      >
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full -ml-16 -mb-16 blur-xl"></div>
        <div className="relative z-10 flex items-center gap-4">
          <Star className="text-white" size={32} />
          <div>
            <h3 className="text-xl font-semibold mb-1">Daily Motivation</h3>
            <p className="text-yellow-100">
              "The secret of getting ahead is getting started." - Mark Twain
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};