import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  RefreshCw,
  ChevronDown,
  ChevronUp,
  PieChart,
  Activity,
  Award,
  Sparkles,
  Lightbulb,
  BarChart2,
  Smartphone
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
  const [activeTab, setActiveTab] = useState<'overview' | 'categories' | 'priorities' | 'insights'>('overview');
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    productivity: true,
    categories: false,
    priorities: false,
    insights: false
  });
  const [refreshing, setRefreshing] = useState(false);

  // Simulate refresh
  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  useEffect(() => {
    // Add specific mobile UI event listeners if needed
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading your analytics...</p>
        </div>
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
        date: format(date, timeRange === 'week' ? 'EEE' : timeRange === 'month' ? 'MMM dd' : 'MMM yy'),
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

  // New feature: Productivity score (0-100)
  const productivityScore = Math.min(100, Math.round(
    (completionRate * 0.4) + 
    (Math.min(averageTasksPerDay, 10) * 6) + 
    (Math.max(0, 100 - (stats.overdue * 5)))
  ));

  // New feature: Weekly comparison
  const weeklyComparison = 12; // Example value - would need real data

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
              Analytics
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Insights into your productivity
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleRefresh}
              className="p-2 rounded-full bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700"
            >
              <RefreshCw size={18} className={`text-gray-600 dark:text-gray-400 ${refreshing ? 'animate-spin' : ''}`} />
            </motion.button>
            
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as 'week' | 'month' | 'year')}
              className="text-sm px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="year">This Year</option>
            </select>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex mt-4 overflow-x-auto scrollbar-hide -mx-4 px-4">
          <div className="flex space-x-2 pb-1">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart2 },
              { id: 'categories', label: 'Categories', icon: PieChart },
              { id: 'priorities', label: 'Priorities', icon: Activity },
              { id: 'insights', label: 'Insights', icon: Lightbulb }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <motion.button
                  key={tab.id}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-4 py-2 rounded-full flex items-center space-x-1 text-sm font-medium whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'bg-blue-500 text-white shadow-sm'
                      : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 shadow-sm'
                  }`}
                >
                  <Icon size={16} />
                  <span>{tab.label}</span>
                </motion.button>
              );
            })}
          </div>
        </div>
      </motion.div>

      <div className="p-4 space-y-4">
        {/* Productivity Score Card - New Feature */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl p-5 text-white shadow-lg"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Productivity Score</h2>
            <Award size={20} />
          </div>
          
          <div className="flex items-end justify-between">
            <div className="flex flex-col">
              <span className="text-3xl font-bold">{productivityScore}</span>
              <span className="text-blue-100 text-sm">out of 100</span>
            </div>
            
            <div className="flex items-center">
              <TrendingUp size={16} className="mr-1" />
              <span className="text-sm">+{weeklyComparison}% from last week</span>
            </div>
          </div>
          
          <div className="mt-4 w-full bg-white/20 rounded-full h-2">
            <div 
              className="bg-white h-2 rounded-full transition-all duration-500"
              style={{ width: `${productivityScore}%` }}
            />
          </div>
          
          <p className="text-blue-100 text-xs mt-3">
            {productivityScore >= 80 
              ? "You're doing amazing! Keep up the great work!" 
              : productivityScore >= 60 
              ? "Good progress! You're on the right track."
              : "Let's focus on completing more tasks this week."}
          </p>
        </motion.div>

        {/* Key Metrics */}
        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              <div className="grid grid-cols-2 gap-3">
                <StatCard
                  title="Completion Rate"
                  value={`${completionRate}%`}
                  icon={Target}
                  color="green"
                  trend={{ value: 5, isPositive: true }}
                  compact
                />
                <StatCard
                  title="Tasks/Day"
                  value={averageTasksPerDay}
                  icon={Calendar}
                  color="blue"
                  trend={{ value: 12, isPositive: true }}
                  compact
                />
                <StatCard
                  title="Overdue"
                  value={stats.overdue}
                  icon={AlertTriangle}
                  color="red"
                  trend={{ value: 8, isPositive: false }}
                  compact
                />
                <StatCard
                  title="Active Streak"
                  value="7 days"
                  icon={TrendingUp}
                  color="purple"
                  trend={{ value: 15, isPositive: true }}
                  compact
                />
              </div>

              {/* Task Status Distribution */}
              <motion.div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white">Task Status</h3>
                  <div className="p-1 bg-gray-100 dark:bg-gray-700 rounded-lg">
                    <PieChart size={16} className="text-gray-600 dark:text-gray-300" />
                  </div>
                </div>
                <ProgressChart stats={stats} type="doughnut" mobile />
              </motion.div>

              {/* Productivity Trends */}
              <motion.div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white">Productivity Trends</h3>
                  <div className="flex items-center space-x-3 text-xs">
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mr-1"></div>
                      <span className="text-gray-600 dark:text-gray-400">Created</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
                      <span className="text-gray-600 dark:text-gray-400">Completed</span>
                    </div>
                  </div>
                </div>
                
                <div className="h-40 flex items-end justify-between space-x-1 px-1">
                  {productivityData.slice(-7).map((day, index) => (
                    <div key={index} className="flex-1 flex flex-col items-center">
                      <div className="w-full flex flex-col items-center space-y-1 mb-2">
                        <div 
                          className="w-full bg-blue-500 rounded-t"
                          style={{ height: `${Math.max(day.created * 6, 4)}px` }}
                          title={`${day.created} tasks created`}
                        />
                        <div 
                          className="w-full bg-green-500 rounded-b"
                          style={{ height: `${Math.max(day.completed * 6, 4)}px` }}
                          title={`${day.completed} tasks completed`}
                        />
                      </div>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {day.date}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          )}

          {/* Category Performance */}
          {activeTab === 'categories' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              {categoryPerformance.map((category, index) => (
                <motion.div
                  key={category.category}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm"
                >
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-medium text-gray-900 dark:text-white">{category.category}</h3>
                    <span className={`text-sm font-medium px-2 py-1 rounded-full ${
                      category.completionRate >= 80 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                        : category.completionRate >= 60
                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                        : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                    }`}>
                      {category.completionRate}%
                    </span>
                  </div>
                  
                  <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-2">
                    <span>{category.completed}/{category.total} completed</span>
                    <span>{category.total} total</span>
                  </div>
                  
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="h-2 rounded-full transition-all duration-300 bg-gradient-to-r from-blue-500 to-indigo-600"
                      style={{ width: `${category.completionRate}%` }}
                    />
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* Priority Distribution */}
          {activeTab === 'priorities' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              {priorityDistribution.map((priority, index) => (
                <motion.div
                  key={priority.priority}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className={`font-medium ${
                      priority.priority === 'Urgent' ? 'text-red-600 dark:text-red-400' :
                      priority.priority === 'High' ? 'text-orange-600 dark:text-orange-400' :
                      priority.priority === 'Medium' ? 'text-yellow-600 dark:text-yellow-400' :
                      'text-gray-600 dark:text-gray-400'
                    }`}>
                      {priority.priority}
                    </span>
                    <span className="text-lg font-bold">{priority.percentage}%</span>
                  </div>
                  
                  <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-2">
                    <span>{priority.completed}/{priority.total} completed</span>
                  </div>
                  
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="h-2 rounded-full transition-all duration-300"
                      style={{ 
                        width: `${priority.percentage}%`,
                        backgroundColor: 
                          priority.priority === 'Urgent' ? '#ef4444' :
                          priority.priority === 'High' ? '#f97316' :
                          priority.priority === 'Medium' ? '#eab308' :
                          '#6b7280'
                      }}
                    />
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* Insights */}
          {activeTab === 'insights' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              <motion.div className="bg-gradient-to-r from-purple-500 to-indigo-600 rounded-2xl p-5 text-white shadow-lg">
                <h3 className="font-semibold mb-3 flex items-center">
                  <Sparkles size={18} className="mr-2" />
                  Productivity Insights
                </h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-bold">{completionRate}%</div>
                      <div className="text-purple-100 text-sm">Completion Rate</div>
                    </div>
                    <div className="text-right">
                      <div className={`flex items-center justify-end ${completionRate >= 70 ? 'text-green-300' : 'text-yellow-300'}`}>
                        {completionRate >= 70 ? 'Excellent! ' : 'Good progress '}
                        {completionRate >= 70 ? '🎉' : '👍'}
                      </div>
                      <div className="text-purple-100 text-xs">
                        {completionRate >= 70 ? 'Ahead of most users' : 'Keep going!'}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-bold">{averageTasksPerDay}</div>
                      <div className="text-purple-100 text-sm">Avg Tasks/Day</div>
                    </div>
                    <div className="text-right">
                      <div className={`flex items-center justify-end ${averageTasksPerDay >= 5 ? 'text-green-300' : 'text-yellow-300'}`}>
                        {averageTasksPerDay >= 5 ? 'Very productive! ' : 'Steady pace '}
                        {averageTasksPerDay >= 5 ? '🔥' : '👌'}
                      </div>
                      <div className="text-purple-100 text-xs">
                        {averageTasksPerDay >= 5 ? 'You\'re on fire!' : 'Consistency is key'}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-bold">
                        {categoryPerformance.reduce((best, cat) => 
                          cat.completionRate > best.completionRate ? cat : best, 
                          categoryPerformance[0])?.category || 'N/A'}
                      </div>
                      <div className="text-purple-100 text-sm">Strongest Category</div>
                    </div>
                    <div className="text-right">
                      <div className="text-green-300">Well done! 🌟</div>
                      <div className="text-purple-100 text-xs">Focus on your strengths</div>
                    </div>
                  </div>
                </div>
              </motion.div>
              
              {/* Tips Card */}
              <motion.div 
                className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                  <Lightbulb size={18} className="mr-2 text-yellow-500" />
                  Pro Tip
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  {completionRate < 70 
                    ? "Try breaking larger tasks into smaller, manageable subtasks to improve your completion rate."
                    : "Your completion rate is excellent! Consider taking on more challenging tasks to continue growing."}
                </p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mobile Optimization Notice - New Feature */}
        <motion.div 
          className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-4 flex items-start"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <Smartphone size={18} className="text-blue-500 mt-0.5 mr-3 flex-shrink-0" />
          <div>
            <h4 className="text-blue-800 dark:text-blue-200 font-medium text-sm">Mobile Optimized</h4>
            <p className="text-blue-600 dark:text-blue-300 text-xs mt-1">
              This view is specially designed for your mobile device. Swipe between tabs to explore different analytics.
            </p>
          </div>
        </motion.div>
      </div>

      <BottomBar />
    </div>
  );
};