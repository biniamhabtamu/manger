import React from 'react';
import { motion } from 'framer-motion';
import { 
  CheckSquare, 
  Clock, 
  TrendingUp, 
  AlertTriangle,
  Calendar,
  Target
} from 'lucide-react';
import { StatCard } from '../components/dashboard/StatCard';
import { ProgressChart } from '../components/dashboard/ProgressChart';
import { useTasks } from '../hooks/useTasks';
import { useAuth } from '../contexts/AuthContext';

export const Dashboard: React.FC = () => {
  const { stats, loading } = useTasks();
  const { userProfile } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const completionRate = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;
  const weeklyCompletionRate = stats.thisWeekTotal > 0 ? Math.round((stats.thisWeekCompleted / stats.thisWeekTotal) * 100) : 0;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Welcome back, {userProfile?.name}!
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Here's what's happening with your tasks today.
        </p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Tasks"
          value={stats.total}
          icon={CheckSquare}
          color="blue"
          trend={{ value: 12, isPositive: true }}
        />
        <StatCard
          title="Completed"
          value={stats.completed}
          icon={Target}
          color="green"
          trend={{ value: 8, isPositive: true }}
        />
        <StatCard
          title="In Progress"
          value={stats.inProgress}
          icon={Clock}
          color="yellow"
          trend={{ value: 5, isPositive: false }}
        />
        <StatCard
          title="Overdue"
          value={stats.overdue}
          icon={AlertTriangle}
          color="red"
          trend={{ value: 3, isPositive: false }}
        />
      </div>

      {/* Progress Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6"
        >
          <ProgressChart stats={stats} type="doughnut" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6"
        >
          <ProgressChart stats={stats} type="bar" />
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6"
      >
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Quick Actions
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="p-4 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg text-center transition-colors"
          >
            <CheckSquare className="w-6 h-6 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
            <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
              Add Task
            </span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="p-4 bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30 rounded-lg text-center transition-colors"
          >
            <Calendar className="w-6 h-6 text-green-600 dark:text-green-400 mx-auto mb-2" />
            <span className="text-sm font-medium text-green-600 dark:text-green-400">
              View Calendar
            </span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="p-4 bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-900/30 rounded-lg text-center transition-colors"
          >
            <TrendingUp className="w-6 h-6 text-purple-600 dark:text-purple-400 mx-auto mb-2" />
            <span className="text-sm font-medium text-purple-600 dark:text-purple-400">
              Analytics
            </span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="p-4 bg-yellow-50 dark:bg-yellow-900/20 hover:bg-yellow-100 dark:hover:bg-yellow-900/30 rounded-lg text-center transition-colors"
          >
            <Target className="w-6 h-6 text-yellow-600 dark:text-yellow-400 mx-auto mb-2" />
            <span className="text-sm font-medium text-yellow-600 dark:text-yellow-400">
              Set Goals
            </span>
          </motion.button>
        </div>
      </motion.div>

      {/* Completion Rate */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-6 text-white"
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold mb-2">
              Your Progress This Week
            </h3>
            <p className="text-blue-100">
              You've completed {weeklyCompletionRate}% of your tasks this week. Keep it up!
            </p>
            <p className="text-blue-200 text-sm mt-1">
              {stats.thisWeekCompleted} of {stats.thisWeekTotal} tasks completed this week
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">
              {weeklyCompletionRate}%
            </div>
            <div className="text-blue-100">
              completion rate
            </div>
          </div>
        </div>
        
        <div className="mt-4 bg-white/20 rounded-full h-2">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${weeklyCompletionRate}%` }}
            transition={{ duration: 1, delay: 0.5 }}
            className="bg-white rounded-full h-2"
          />
        </div>
      </motion.div>
    </div>
  );
};