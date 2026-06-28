import React, { useState, useEffect, useMemo } from 'react';
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
  Smartphone,
  Flame,
  Trophy,
  Crown,
  Star,
  Zap,
  Brain,
  Heart,
  Rocket,
  Users,
  Briefcase,
  Code,
  Book,
  Coffee,
  Moon,
  Sun,
  ArrowUp,
  ArrowDown,
  Gift,
  Medal,
  Target as TargetIcon,
  ListChecks,
  LayoutGrid,
  TrendingUp as TrendingUpIcon,
  Eye,
  EyeOff,
  Grid3x3,
  List,
  MoreHorizontal,
  Settings,
  Share2,
  Bookmark,
  Bell,
  User,
  CalendarDays,
  Clock as ClockIcon,
  CheckCircle2,
  XCircle,
  Circle,
  BarChart,
  LineChart,
  PieChart as PieChartIcon,
  Radar,
  Globe,
  MapPin,
  Compass,
  Shield,
  Lock,
  Unlock,
  ThumbsUp,
  ThumbsDown,
  MessageCircle,
  Send,
  Paperclip,
  Image,
  Video,
  Music,
  Camera,
  Palette,
  Zap as ZapIcon,
  Cloud,
  Database,
  Server,
  Cpu,
  HardDrive,
  Monitor,
  Tablet,
  Phone,
  Watch,
  Headphones,
  Speaker,
  Mic,
  Volume2,
  VolumeX,
  Radio,
  Tv,
  Film,
  Clapperboard,
  Theater,
  Mask,
  Drama,
  Music2,
  Guitar,
  Piano,
  Drum,
  Microscope,
  Atom,
  Flask,
  Beaker,
  TestTube,
  Pill,
  Syringe,
  Stethoscope,
  HeartPulse,
  Bone,
  Brain as BrainIcon,
  Activity as ActivityIcon,
  Dumbbell,
  Running,
  Bike,
  Swimmer,
  Skiing,
  Snowboard,
  Surfing,
  Skateboard,
  RollerCoaster,
  FerrisWheel,
  Carousel,
  Balloon,
  PartyPopper,
  Confetti,
  Fireworks,
  Sparkle,
  Rainbow,
  Cloudy,
  Wind,
  Snowflake,
  CloudRain,
  CloudLightning,
  CloudSun,
  CloudMoon,
  Thermometer,
  Compass as CompassIcon,
  Navigation,
  Anchor,
  Ship,
  Sailboat,
  Submarine,
  Rocket as RocketIcon,
  Satellite,
  Spaceship,
  Alien,
  Planet,
  Galaxy,
  Star as StarIcon,
  Sun as SunIcon,
  Moon as MoonIcon,
  Cloud as CloudIcon
} from 'lucide-react';
import { useTasks } from '../hooks/useTasks';
import { format, subDays, startOfWeek, endOfWeek, eachDayOfInterval, isToday, isYesterday, isThisWeek } from 'date-fns';
import { BottomBar } from '../components/layout/BottomBar';
import toast from 'react-hot-toast';

// Skeleton Loader
const SkeletonLoader = () => (
  <div className="min-h-screen bg-[#f8fafc] dark:bg-[#0f172a]">
    <div className="px-4 pt-6 space-y-4">
      <div className="animate-pulse">
        <div className="h-7 w-40 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
        <div className="h-4 w-56 bg-gray-200 dark:bg-gray-700 rounded-lg mt-1"></div>
      </div>
      <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded-2xl animate-pulse"></div>
      <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded-2xl animate-pulse"></div>
      <div className="grid grid-cols-2 gap-3">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded-2xl animate-pulse"></div>
        ))}
      </div>
      <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded-2xl animate-pulse"></div>
      <div className="h-40 bg-gray-200 dark:bg-gray-700 rounded-2xl animate-pulse"></div>
    </div>
  </div>
);

export const Analytics: React.FC = () => {
  const { tasks, stats, loading } = useTasks();
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('week');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'overview' | 'categories' | 'priorities' | 'insights'>('overview');
  const [refreshing, setRefreshing] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showStats, setShowStats] = useState(true);
  const [viewMode, setViewMode] = useState<'cards' | 'list'>('cards');

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

  // ALL HOOKS MUST BE CALLED BEFORE ANY CONDITIONAL RETURNS

  // Calculate productivity data - moved before conditional return
  const getProductivityData = useMemo(() => {
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
        completionRate: dayTasks.length > 0 ? Math.round((completedTasks.length / dayTasks.length) * 100) : 0,
        isToday: isToday(date)
      };
    });
  }, [tasks, timeRange]);

  // Calculate category performance - moved before conditional return
  const categoryPerformance = useMemo(() => {
    const categories = ['code-tasks', 'learning', 'relationship', 'self-development', 'project-improvement'];
    const labels = {
      'code-tasks': '💻 Code',
      'learning': '📚 Learning',
      'relationship': '❤️ Relationships',
      'self-development': '🧠 Development',
      'project-improvement': '🚀 Projects'
    };

    return categories.map(category => {
      const categoryTasks = tasks.filter(t => t.category === category);
      const completedTasks = categoryTasks.filter(t => t.status === 'completed');
      const completionRate = categoryTasks.length > 0 ? Math.round((completedTasks.length / categoryTasks.length) * 100) : 0;

      return {
        category: labels[category as keyof typeof labels] || category,
        total: categoryTasks.length,
        completed: completedTasks.length,
        completionRate
      };
    }).filter(cat => cat.total > 0);
  }, [tasks]);

  // Calculate priority distribution - moved before conditional return
  const priorityDistribution = useMemo(() => {
    const priorities = ['low', 'medium', 'high', 'urgent'];
    const labels = {
      low: '🟢 Low',
      medium: '🟡 Medium',
      high: '🟠 High',
      urgent: '🔴 Urgent'
    };

    return priorities.map(priority => {
      const priorityTasks = tasks.filter(t => t.priority === priority);
      const completedTasks = priorityTasks.filter(t => t.status === 'completed');

      return {
        priority: labels[priority as keyof typeof labels] || priority,
        total: priorityTasks.length,
        completed: completedTasks.length,
        percentage: stats.total > 0 ? Math.round((priorityTasks.length / stats.total) * 100) : 0
      };
    });
  }, [tasks, stats.total]);

  // Calculate habit stats - moved before conditional return
  const habitStats = useMemo(() => {
    const totalHabits = habits.length;
    const activeHabits = habits.filter(h => h.active !== false).length;
    const totalStreak = habits.reduce((sum, h) => sum + (h.currentStreak || 0), 0);
    const bestStreak = Math.max(...habits.map(h => h.bestStreak || 0), 0);
    const totalCompletions = habits.reduce((sum, h) => sum + (h.totalCompletions || 0), 0);
    const completionRate = totalHabits > 0 ? Math.round((habits.filter(h => h.totalCompletions > 0).length / totalHabits) * 100) : 0;

    return { totalHabits, activeHabits, totalStreak, bestStreak, totalCompletions, completionRate };
  }, [habits]);

  // Calculate derived values - moved before conditional return
  const completionRate = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;
  const averageTasksPerDay = getProductivityData.length > 0 ?
    Math.round(getProductivityData.reduce((sum, day) => sum + day.created, 0) / getProductivityData.length) : 0;

  const productivityScore = Math.min(100, Math.round(
    (completionRate * 0.4) +
    (Math.min(averageTasksPerDay, 10) * 6) +
    (Math.max(0, 100 - (stats.overdue * 5)))
  ));

  const weeklyComparison = 12;
  const todayTasks = tasks.filter(t => {
    const taskDate = new Date(t.createdAt);
    return isToday(taskDate);
  });

  const todayCompleted = todayTasks.filter(t => t.status === 'completed').length;

  const handleRefresh = () => {
    setRefreshing(true);
    toast.loading('Refreshing analytics...');
    setTimeout(() => {
      setRefreshing(false);
      toast.dismiss();
      toast.success('Analytics updated!');
    }, 1500);
  };

  const handleExport = () => {
    toast.success('Analytics exported successfully!');
    setShowExportMenu(false);
  };

  // NOW we can use conditional return
  if (loading) {
    return <SkeletonLoader />;
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#0f172a] pb-24">
      {/* Status Bar Gradient */}
      <div className="h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>

      {/* Header - Native Style */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-20 bg-white/95 dark:bg-[#1e293b]/95 backdrop-blur-xl border-b border-gray-100/50 dark:border-gray-700/50 px-4 pt-4 pb-3"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center shadow-lg shadow-blue-500/25">
              <BarChart3 size={18} className="text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900 dark:text-white">Analytics</h1>
              <p className="text-[10px] text-gray-500 dark:text-gray-400">
                {timeRange === 'week' ? 'This Week' : timeRange === 'month' ? 'This Month' : 'This Year'} • {tasks.length} tasks
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={handleRefresh}
              className="p-2 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              <RefreshCw size={18} className={refreshing ? 'animate-spin' : ''} />
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="p-2 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors relative"
            >
              <Download size={18} />
            </motion.button>
          </div>
        </div>

        {/* Time Range Selector */}
        <div className="flex gap-1 mt-3 bg-gray-100 dark:bg-gray-700 p-1 rounded-xl">
          {[
            { id: 'week', label: 'Week' },
            { id: 'month', label: 'Month' },
            { id: 'year', label: 'Year' }
          ].map((range) => (
            <button
              key={range.id}
              onClick={() => setTimeRange(range.id as any)}
              className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all ${timeRange === range.id
                  ? 'bg-white dark:bg-gray-600 shadow-sm text-blue-600 dark:text-blue-400'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'
                }`}
            >
              {range.label}
            </button>
          ))}
        </div>

        {/* Tabs - Native Style */}
        <div className="flex gap-1 mt-3 overflow-x-auto scrollbar-hide -mx-1 px-1">
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
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1.5 ${activeTab === tab.id
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg shadow-blue-500/30'
                    : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600'
                  }`}
              >
                <Icon size={12} />
                {tab.label}
              </motion.button>
            );
          })}
        </div>
      </motion.div>

      <div className="px-4 pt-3 space-y-3 max-w-3xl mx-auto">
        {/* Productivity Score - Native Style */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-500 rounded-2xl p-4 text-white shadow-lg shadow-blue-500/25"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Award size={16} className="text-white/80" />
              <span className="text-sm font-semibold">Productivity Score</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-white/80">
              <TrendingUpIcon size={12} />
              +{weeklyComparison}% this week
            </div>
          </div>

          <div className="flex items-end justify-between">
            <div>
              <span className="text-4xl font-bold">{productivityScore}</span>
              <span className="text-white/60 text-sm ml-1">/100</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="text-right">
                <div className="text-xs text-white/60">Today</div>
                <div className="text-sm font-semibold">{todayCompleted}/{todayTasks.length}</div>
              </div>
            </div>
          </div>

          <div className="mt-3">
            <div className="w-full bg-white/20 rounded-full h-2">
              <motion.div
                className="bg-white h-2 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${productivityScore}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
              />
            </div>
          </div>

          <p className="text-xs text-white/80 mt-2">
            {productivityScore >= 80
              ? "🌟 Outstanding! You're crushing it!"
              : productivityScore >= 60
                ? "💪 Good progress! Keep pushing forward."
                : "📈 Let's focus on completing more tasks today."}
          </p>
        </motion.div>

        {/* Quick Stats - Native Cards */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-4 gap-2"
        >
          <div className="bg-white dark:bg-[#1e293b] rounded-2xl p-2.5 border border-gray-100 dark:border-gray-700/50">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-lg font-bold text-gray-900 dark:text-white">{stats.total}</div>
                <div className="text-[9px] text-gray-500 dark:text-gray-400">Total</div>
              </div>
              <div className="p-1.5 rounded-xl bg-blue-500/10">
                <BarChart3 size={12} className="text-blue-500" />
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-[#1e293b] rounded-2xl p-2.5 border border-gray-100 dark:border-gray-700/50">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-lg font-bold text-emerald-500">{stats.completed}</div>
                <div className="text-[9px] text-gray-500 dark:text-gray-400">Done</div>
              </div>
              <div className="p-1.5 rounded-xl bg-emerald-500/10">
                <CheckCircle2 size={12} className="text-emerald-500" />
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-[#1e293b] rounded-2xl p-2.5 border border-gray-100 dark:border-gray-700/50">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-lg font-bold text-amber-500">{stats.inProgress}</div>
                <div className="text-[9px] text-gray-500 dark:text-gray-400">Progress</div>
              </div>
              <div className="p-1.5 rounded-xl bg-amber-500/10">
                <ClockIcon size={12} className="text-amber-500" />
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-[#1e293b] rounded-2xl p-2.5 border border-gray-100 dark:border-gray-700/50">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-lg font-bold text-rose-500">{stats.overdue}</div>
                <div className="text-[9px] text-gray-500 dark:text-gray-400">Overdue</div>
              </div>
              <div className="p-1.5 rounded-xl bg-rose-500/10">
                <AlertTriangle size={12} className="text-rose-500" />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Habit Stats - New Section */}
        {habits.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-purple-500/10 to-indigo-500/10 dark:from-purple-500/5 dark:to-indigo-500/5 rounded-2xl p-3 border border-purple-200/50 dark:border-purple-800/30"
          >
            <div className="flex items-center gap-2 mb-2">
              <TargetIcon size={14} className="text-purple-500" />
              <span className="text-sm font-semibold text-gray-900 dark:text-white">Habit Progress</span>
            </div>
            <div className="grid grid-cols-4 gap-2">
              <div className="text-center">
                <div className="text-sm font-bold text-gray-900 dark:text-white">{habitStats.activeHabits}</div>
                <div className="text-[9px] text-gray-500 dark:text-gray-400">Active</div>
              </div>
              <div className="text-center">
                <div className="text-sm font-bold text-orange-500">{habitStats.totalStreak}</div>
                <div className="text-[9px] text-gray-500 dark:text-gray-400">Streak</div>
              </div>
              <div className="text-center">
                <div className="text-sm font-bold text-yellow-500">{habitStats.bestStreak}</div>
                <div className="text-[9px] text-gray-500 dark:text-gray-400">Best</div>
              </div>
              <div className="text-center">
                <div className="text-sm font-bold text-emerald-500">{habitStats.completionRate}%</div>
                <div className="text-[9px] text-gray-500 dark:text-gray-400">Rate</div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Main Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-3"
            >
              {/* Productivity Trends */}
              <div className="bg-white dark:bg-[#1e293b] rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-700/50">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Daily Activity</h3>
                  <div className="flex items-center gap-2 text-[10px] text-gray-500 dark:text-gray-400">
                    <span className="flex items-center gap-0.5">
                      <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                      Created
                    </span>
                    <span className="flex items-center gap-0.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                      Done
                    </span>
                  </div>
                </div>

                <div className="flex items-end justify-between gap-1 h-32">
                  {getProductivityData.slice(-7).map((day, index) => (
                    <div key={index} className="flex-1 flex flex-col items-center gap-1">
                      <div className="w-full flex flex-col items-center gap-0.5">
                        <motion.div
                          className="w-full bg-blue-400 rounded-t-sm"
                          initial={{ height: 0 }}
                          animate={{ height: `${Math.max(day.created * 8, 4)}px` }}
                          transition={{ delay: index * 0.05 }}
                        />
                        <motion.div
                          className="w-full bg-emerald-400 rounded-b-sm"
                          initial={{ height: 0 }}
                          animate={{ height: `${Math.max(day.completed * 8, 4)}px` }}
                          transition={{ delay: index * 0.05 + 0.1 }}
                        />
                      </div>
                      <span className={`text-[10px] ${day.isToday ? 'text-blue-500 font-bold' : 'text-gray-400'}`}>
                        {day.date}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Completion Rate */}
              <div className="bg-white dark:bg-[#1e293b] rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-700/50">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Completion Rate</h3>
                  <span className="text-sm font-bold text-emerald-500">{completionRate}%</span>
                </div>
                <div className="w-full h-2.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${completionRate}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-gray-500 dark:text-gray-400 mt-1">
                  <span>{stats.completed} completed</span>
                  <span>{stats.total} total</span>
                </div>
              </div>
            </motion.div>
          )}

          {/* Categories Tab */}
          {activeTab === 'categories' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-2.5"
            >
              {categoryPerformance.length === 0 ? (
                <div className="text-center py-12 bg-white/50 dark:bg-[#1e293b]/50 rounded-2xl border border-gray-100 dark:border-gray-700">
                  <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-3">
                    <PieChart size={24} className="text-gray-400" />
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">No category data available</p>
                </div>
              ) : (
                categoryPerformance.map((category, index) => (
                  <motion.div
                    key={category.category}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-white dark:bg-[#1e293b] rounded-2xl p-3.5 shadow-sm border border-gray-100 dark:border-gray-700/50"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-medium text-sm text-gray-900 dark:text-white">{category.category}</span>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${category.completionRate >= 80 ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                          category.completionRate >= 50 ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                            'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400'
                        }`}>
                        {category.completionRate}%
                      </span>
                    </div>
                    <div className="flex justify-between text-[10px] text-gray-500 dark:text-gray-400 mb-1">
                      <span>{category.completed} completed</span>
                      <span>{category.total} total</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${category.completionRate}%` }}
                        transition={{ duration: 0.8 }}
                        style={{
                          background: `linear-gradient(90deg, 
                            ${category.completionRate >= 80 ? '#10B981' :
                              category.completionRate >= 50 ? '#F59E0B' : '#EF4444'}, 
                            ${category.completionRate >= 80 ? '#34D399' :
                              category.completionRate >= 50 ? '#FBBF24' : '#F87171'})`
                        }}
                      />
                    </div>
                  </motion.div>
                ))
              )}
            </motion.div>
          )}

          {/* Priorities Tab */}
          {activeTab === 'priorities' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-2.5"
            >
              {priorityDistribution.map((priority, index) => (
                <motion.div
                  key={priority.priority}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white dark:bg-[#1e293b] rounded-2xl p-3.5 shadow-sm border border-gray-100 dark:border-gray-700/50"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className={`font-medium text-sm ${priority.priority.includes('Urgent') ? 'text-rose-600 dark:text-rose-400' :
                        priority.priority.includes('High') ? 'text-orange-600 dark:text-orange-400' :
                          priority.priority.includes('Medium') ? 'text-amber-600 dark:text-amber-400' :
                            'text-gray-600 dark:text-gray-400'
                      }`}>
                      {priority.priority}
                    </span>
                    <span className="text-sm font-bold">{priority.percentage}%</span>
                  </div>
                  <div className="flex justify-between text-[10px] text-gray-500 dark:text-gray-400 mb-1">
                    <span>{priority.completed} completed</span>
                    <span>{priority.total} total</span>
                  </div>
                  <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${priority.percentage}%` }}
                      transition={{ duration: 0.8 }}
                      style={{
                        backgroundColor:
                          priority.priority.includes('Urgent') ? '#EF4444' :
                            priority.priority.includes('High') ? '#F97316' :
                              priority.priority.includes('Medium') ? '#EAB308' :
                                '#6B7280'
                      }}
                    />
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* Insights Tab */}
          {activeTab === 'insights' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-3"
            >
              {/* Insights Cards */}
              <div className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl p-4 text-white shadow-lg shadow-purple-500/25">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Sparkles size={16} />
                  Key Insights
                </h3>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-bold">{completionRate}%</div>
                      <div className="text-purple-200 text-xs">Completion Rate</div>
                    </div>
                    <div className="text-right">
                      <div className={`flex items-center gap-1 ${completionRate >= 70 ? 'text-green-300' : 'text-yellow-300'}`}>
                        {completionRate >= 70 ? '🌟 Excellent' : '📈 Keep going'}
                      </div>
                      <div className="text-purple-200 text-[10px]">
                        {completionRate >= 70 ? 'Top performer' : 'Room to grow'}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-bold">{averageTasksPerDay}</div>
                      <div className="text-purple-200 text-xs">Avg Tasks/Day</div>
                    </div>
                    <div className="text-right">
                      <div className={`flex items-center gap-1 ${averageTasksPerDay >= 5 ? 'text-green-300' : 'text-yellow-300'}`}>
                        {averageTasksPerDay >= 5 ? '🔥 On fire' : '👌 Steady'}
                      </div>
                      <div className="text-purple-200 text-[10px]">
                        {averageTasksPerDay >= 5 ? 'Very productive' : 'Consistent'}
                      </div>
                    </div>
                  </div>

                  {categoryPerformance.length > 0 && (
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-2xl font-bold">
                          {categoryPerformance.reduce((best, cat) =>
                            cat.completionRate > best.completionRate ? cat : best
                          ).category}
                        </div>
                        <div className="text-purple-200 text-xs">Strongest Category</div>
                      </div>
                      <div className="text-right">
                        <div className="text-green-300">🎯 Focus area</div>
                        <div className="text-purple-200 text-[10px]">Leverage your strength</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Motivational Tip */}
              <div className="bg-white dark:bg-[#1e293b] rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-700/50">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-yellow-500/10 flex-shrink-0">
                    <Lightbulb size={16} className="text-yellow-500" />
                  </div>
                  <div>
                    <h4 className="font-medium text-sm text-gray-900 dark:text-white">Pro Tip</h4>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5 leading-relaxed">
                      {completionRate < 70
                        ? "🎯 Break large tasks into smaller steps. Focus on one task at a time to improve your completion rate."
                        : "🌟 You're doing great! Challenge yourself with more complex tasks to keep growing."}
                    </p>
                  </div>
                </div>
              </div>

              {/* Achievement */}
              {productivityScore >= 70 && (
                <div className="bg-gradient-to-r from-amber-500/10 to-yellow-500/10 dark:from-amber-500/5 dark:to-yellow-500/5 rounded-2xl p-4 border border-amber-200/50 dark:border-amber-800/30">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">🏆</div>
                    <div>
                      <h4 className="font-semibold text-sm text-gray-900 dark:text-white">Achievement Unlocked!</h4>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Productivity Master - You're in the top tier of users!</p>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom Bar */}
      <BottomBar onTaskFormOpen={() => { }} />
    </div>
  );
};

export default Analytics;