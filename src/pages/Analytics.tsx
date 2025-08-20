import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3, 
  TrendingUp, 
  Calendar, 
  Target,
  Clock,
  CheckSquare,
  AlertTriangle,
  Filter,
  Download,
  RefreshCw
} from 'lucide-react';
import { useTasks } from '../hooks/useTasks';
import { ProgressChart } from '../components/dashboard/ProgressChart';
import { StatCard } from '../components/dashboard/StatCard';
import { format, subDays, startOfWeek, endOfWeek, eachDayOfInterval } from 'date-fns';
import { BottomBar } from '../components/layout/BottomBar';

export const Analytics: React.FC = () => {
  const { tasks, stats, loading } = useTasks();
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('week');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Calculate productivity trends
  const getProductivityData = () => {
    const now = new Date();
    const days = timeRange === 'week' ? 7 : timeRange === 'month' ? 30 : 365;
    const startDate = subDays(now, days);
    
    const dateRange = eachDayOfInterval({ start: startDate, end: now });
    
    return dateRange.map(date => {
      const dayTasks = tasks.filter(task => {
        const taskDate = new Date(task.createdAt);
        return taskDate.toDateString() === date.toDateString();
      });
      
      const completedTasks = dayTasks.filter(task => task.status === 'completed');
      
      return {
        date: format(date, 'MMM dd'),
        created: dayTasks.length,
        completed: completedTasks.length,
        completionRate: dayTasks.length > 0 ? Math.round((completedTasks.length / dayTasks.length) * 100) : 0
      };
    });
  };

  // Calculate category performance
  const getCategoryPerformance = () => {
    const categories = ['code-tasks', 'learning', 'relationship', 'self-development', 'project-improvement'];
    
    return categories.map(category => {
      const categoryTasks = tasks.filter(t => t.category === category);
      const completedTasks = categoryTasks.filter(t => t.status === 'completed');
      const completionRate = categoryTasks.length > 0 ? Math.round((completedTasks.length / categoryTasks.length) * 100) : 0;
      
      return {
        category: category.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()),
        total: categoryTasks.length,
        completed: completedTasks.length,
        completionRate
      };
    });
  };

  // Calculate priority distribution
  const getPriorityDistribution = () => {
    const priorities = ['low', 'medium', 'high', 'urgent'];
    
    return priorities.map(priority => {
      const priorityTasks = tasks.filter(t => t.priority === priority);
      const completedTasks = priorityTasks.filter(t => t.status === 'completed');
      
      return {
        priority: priority.charAt(0).toUpperCase() + priority.slice(1),
        total: priorityTasks.length,
        completed: completedTasks.length,
        percentage: stats.total > 0 ? Math.round((priorityTasks.length / stats.total) * 100) : 0
      };
    });
  };

  const productivityData = getProductivityData();
  const categoryPerformance = getCategoryPerformance();
  const priorityDistribution = getPriorityDistribution();
  
  const completionRate = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;
  const averageTasksPerDay = productivityData.length > 0 ? 
    Math.round(productivityData.reduce((sum, day) => sum + day.created, 0) / productivityData.length) : 0;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Analytics
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Insights into your productivity and task management patterns
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as 'week' | 'month' | 'year')}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="week">Last 7 days</option>
            <option value="month">Last 30 days</option>
            <option value="year">Last year</option>
          </select>
         
        </div>
      </motion.div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Overall Completion Rate"
          value={`${completionRate}%`}
          icon={Target}
          color="green"
          trend={{ value: 5, isPositive: true }}
        />
        <StatCard
          title="Average Tasks/Day"
          value={averageTasksPerDay}
          icon={Calendar}
          color="blue"
          trend={{ value: 12, isPositive: true }}
        />
        <StatCard
          title="Overdue Tasks"
          value={stats.overdue}
          icon={AlertTriangle}
          color="red"
          trend={{ value: 8, isPositive: false }}
        />
        <StatCard
          title="Active Streak"
          value="7 days"
          icon={TrendingUp}
          color="purple"
          trend={{ value: 15, isPositive: true }}
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Task Status Distribution */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6"
        >
          <ProgressChart stats={stats} type="doughnut" />
        </motion.div>

        {/* Category Performance */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6"
        >
          <ProgressChart stats={stats} type="bar" />
        </motion.div>
      </div>

      {/* Productivity Trends */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Productivity Trends
          </h3>
          <div className="flex items-center space-x-4 text-sm">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
              <span className="text-gray-600 dark:text-gray-400">Tasks Created</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
              <span className="text-gray-600 dark:text-gray-400">Tasks Completed</span>
            </div>
          </div>
        </div>
        
        <div className="h-64 flex items-end justify-between space-x-2">
          {productivityData.map((day, index) => (
            <div key={index} className="flex-1 flex flex-col items-center">
              <div className="w-full flex flex-col items-center space-y-1 mb-2">
                <div 
                  className="w-full bg-blue-500 rounded-t"
                  style={{ height: `${Math.max(day.created * 8, 4)}px` }}
                  title={`${day.created} tasks created`}
                />
                <div 
                  className="w-full bg-green-500 rounded-b"
                  style={{ height: `${Math.max(day.completed * 8, 4)}px` }}
                  title={`${day.completed} tasks completed`}
                />
              </div>
              <span className="text-xs text-gray-500 dark:text-gray-400 transform -rotate-45 origin-center">
                {day.date}
              </span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Category Performance Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden"
      >
        <div className="p-6 border-b border-gray-100 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Category Performance
          </h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Total Tasks
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Completed
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Completion Rate
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Progress
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {categoryPerformance.map((category, index) => (
                <motion.tr
                  key={category.category}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700/50"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {category.category}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">
                      {category.total}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">
                      {category.completed}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      category.completionRate >= 80 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                        : category.completionRate >= 60
                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                        : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                    }`}>
                      {category.completionRate}%
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${category.completionRate}%` }}
                      />
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Priority Distribution */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6"
      >
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
          Task Priority Distribution
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {priorityDistribution.map((priority, index) => (
            <motion.div
              key={priority.priority}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.7 + index * 0.1 }}
              className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
            >
              <div className={`text-2xl font-bold mb-2 ${
                priority.priority === 'Urgent' ? 'text-red-600 dark:text-red-400' :
                priority.priority === 'High' ? 'text-orange-600 dark:text-orange-400' :
                priority.priority === 'Medium' ? 'text-yellow-600 dark:text-yellow-400' :
                'text-gray-600 dark:text-gray-400'
              }`}>
                {priority.percentage}%
              </div>
              <div className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                {priority.priority}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {priority.completed}/{priority.total} completed
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Insights */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="bg-gradient-to-r from-purple-500 to-indigo-600 rounded-xl p-6 text-white"
      >
        <h3 className="text-xl font-semibold mb-4">📊 Productivity Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
            <div className="text-2xl font-bold mb-1">{completionRate}%</div>
            <div className="text-purple-100 text-sm">
              Overall completion rate - {completionRate >= 70 ? 'Excellent!' : completionRate >= 50 ? 'Good progress' : 'Room for improvement'}
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
            <div className="text-2xl font-bold mb-1">{averageTasksPerDay}</div>
            <div className="text-purple-100 text-sm">
              Average tasks per day - {averageTasksPerDay >= 5 ? 'Very productive!' : 'Steady pace'}
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
            <div className="text-2xl font-bold mb-1">
              {categoryPerformance.reduce((best, cat) => cat.completionRate > best.completionRate ? cat : best, categoryPerformance[0])?.category || 'N/A'}
            </div>
            <div className="text-purple-100 text-sm">
              Your strongest category
            </div>
          </div>
        </div>
      </motion.div>
      <BottomBar />
    </div>
  );
};