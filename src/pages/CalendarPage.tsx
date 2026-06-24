import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  X,
  CheckCircle,
  Circle,
  AlertCircle,
  Clock,
  Archive,
  Plus,
  Filter,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Smartphone,
  BarChart3,
  Grid,
  List,
  Sun,
  Moon,
  Bell,
  Target,
  User,
  Tag,
  Zap,
  MoreVertical,
  CheckSquare,
} from 'lucide-react';
import { Task, SubTask, TaskStatus, Priority, TaskCategory } from './task';
import { TaskForm } from '../components/tasks/TaskForm';
import { BottomBar } from '../components/layout/BottomBar';

interface CalendarPageProps {
  tasks: Task[];
}

const statusColors: Record<TaskStatus, string> = {
  'todo': 'bg-gray-400',
  'in-progress': 'bg-yellow-500',
  'completed': 'bg-green-500',
  'archived': 'bg-purple-500',
};

const priorityColors: Record<Priority, string> = {
  'low': 'text-green-500 bg-green-50 dark:bg-green-900/20',
  'medium': 'text-yellow-500 bg-yellow-50 dark:bg-yellow-900/20',
  'high': 'text-orange-500 bg-orange-50 dark:bg-orange-900/20',
  'urgent': 'text-red-500 bg-red-50 dark:bg-red-900/20',
};

const categoryColors: Record<TaskCategory, string> = {
  'code-tasks': 'text-blue-500 bg-blue-50 dark:bg-blue-900/20',
  'learning': 'text-purple-500 bg-purple-50 dark:bg-purple-900/20',
  'relationship': 'text-pink-500 bg-pink-50 dark:bg-pink-900/20',
  'self-development': 'text-green-500 bg-green-50 dark:bg-green-900/20',
  'project-improvement': 'text-indigo-500 bg-indigo-50 dark:bg-indigo-900/20',
};

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

// Enhanced Skeleton loader
const SkeletonCard: React.FC = () => (
  <div className="p-4 bg-white dark:bg-gray-800 rounded-2xl animate-pulse shadow-sm border border-gray-100 dark:border-gray-700">
    <div className="flex justify-between items-start">
      <div className="flex items-start gap-3 w-full">
        <div className="mt-1 w-3 h-3 rounded-full bg-gray-300 dark:bg-gray-600 flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-5 bg-gray-300 dark:bg-gray-600 rounded w-3/4" />
          <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-1/2" />
          <div className="flex gap-2">
            <div className="h-6 w-16 bg-gray-300 dark:bg-gray-600 rounded-full" />
            <div className="h-6 w-20 bg-gray-300 dark:bg-gray-600 rounded-full" />
          </div>
        </div>
      </div>
      <div className="h-6 w-12 bg-gray-300 dark:bg-gray-600 rounded-full ml-2" />
    </div>
  </div>
);

// Stats component for quick overview
const StatsOverview: React.FC<{ tasks: Task[] }> = ({ tasks }) => {
  const todayTasks = tasks.filter(task => 
    task.dueDate && task.dueDate.toDateString() === new Date().toDateString()
  ).length;

  const completedTasks = tasks.filter(task => task.status === 'completed').length;
  const inProgressTasks = tasks.filter(task => task.status === 'in-progress').length;

  return (
    <motion.div 
      className="grid grid-cols-3 gap-3 mb-4"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-3 rounded-2xl text-center shadow-lg">
        <div className="text-2xl font-bold">{todayTasks}</div>
        <div className="text-xs opacity-90">Today</div>
      </div>
      <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-3 rounded-2xl text-center shadow-lg">
        <div className="text-2xl font-bold">{completedTasks}</div>
        <div className="text-xs opacity-90">Done</div>
      </div>
      <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white p-3 rounded-2xl text-center shadow-lg">
        <div className="text-2xl font-bold">{inProgressTasks}</div>
        <div className="text-xs opacity-90">In Progress</div>
      </div>
    </motion.div>
  );
};

export const CalendarPage: React.FC<CalendarPageProps> = ({ tasks }) => {
  const [selectedDay, setSelectedDay] = useState<Date | undefined>(new Date());
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<'all' | TaskStatus>('all');
  const [showCalendar, setShowCalendar] = useState(!(window.innerWidth < 768));
  const [showFilters, setShowFilters] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeView, setActiveView] = useState<'calendar' | 'tasks'>('calendar');

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);

    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) {
        setShowCalendar(activeView === 'calendar');
      } else {
        setShowCalendar(true);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', handleResize);
    };
  }, [activeView]);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark');
  };

  // Compute days with tasks for calendar modifiers
  const taskDays = tasks.reduce((acc, task) => {
    if (task.dueDate) {
      const dateStr = task.dueDate.toDateString();
      acc[dateStr] = (acc[dateStr] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  const modifiers = {
    hasTasks: (date: Date) => !!taskDays[date.toDateString()],
  };

  const modifiersStyles = {
    hasTasks: {
      position: 'relative',
      '&::after': {
        content: '""',
        position: 'absolute',
        bottom: '0.25rem',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '0.375rem',
        height: '0.375rem',
        borderRadius: '50%',
        backgroundColor: '#3B82F6',
      },
    },
  };

  let tasksForSelectedDay = tasks.filter(task => {
    if (!task.dueDate || !selectedDay) return false;
    return task.dueDate.toDateString() === selectedDay.toDateString();
  });

  if (selectedStatus !== 'all') {
    tasksForSelectedDay = tasksForSelectedDay.filter(task => task.status === selectedStatus);
  }

  // Sort tasks by time if dueDate has time
  tasksForSelectedDay.sort((a, b) => {
    if (!a.dueDate || !b.dueDate) return 0;
    return a.dueDate.getTime() - b.dueDate.getTime();
  });

  const getStatusIcon = (status: TaskStatus) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="text-green-500" size={20} />;
      case 'in-progress':
        return <AlertCircle className="text-yellow-500" size={20} />;
      case 'archived':
        return <Archive className="text-gray-400" size={20} />;
      default:
        return <Circle className="text-gray-400" size={20} />;
    }
  };

  const getSubtaskProgress = (subtasks: SubTask[]) => {
    if (subtasks.length === 0) return 0;
    const completed = subtasks.filter(st => st.completed).length;
    return Math.round((completed / subtasks.length) * 100);
  };

  const handleViewToggle = (view: 'calendar' | 'tasks') => {
    setActiveView(view);
    if (isMobile) {
      setShowCalendar(view === 'calendar');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 pb-24">
      {/* Enhanced Task Detail Modal */}
      <AnimatePresence>
        {selectedTask && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl max-w-md w-full max-h-[85vh] overflow-y-auto relative overflow-hidden"
            >
              {/* Background gradient */}
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 to-purple-500"></div>
              
              <div className="p-6 relative z-10">
                <div className="flex justify-between items-start mb-6">
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                      {selectedTask.title}
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      <span className={`px-3 py-1.5 text-sm rounded-full font-medium ${categoryColors[selectedTask.category]}`}>
                        {selectedTask.category.replace('-', ' ')}
                      </span>
                      <span className={`px-3 py-1.5 text-sm rounded-full font-medium ${priorityColors[selectedTask.priority]}`}>
                        {selectedTask.priority}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedTask(null)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-2xl transition-colors"
                  >
                    <X size={20} className="text-gray-500 dark:text-gray-400" />
                  </button>
                </div>

                {selectedTask.description && (
                  <div className="mb-6">
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                      {selectedTask.description}
                    </p>
                  </div>
                )}

                <div className="space-y-4">
                  {/* Status */}
                  <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-2xl">
                    {getStatusIcon(selectedTask.status)}
                    <span className={`font-semibold ${
                      selectedTask.status === 'completed' ? 'text-green-600 dark:text-green-400' :
                      selectedTask.status === 'in-progress' ? 'text-yellow-600 dark:text-yellow-400' :
                      selectedTask.status === 'archived' ? 'text-purple-600 dark:text-purple-400' :
                      'text-gray-600 dark:text-gray-400'
                    }`}>
                      {selectedTask.status.replace('-', ' ')}
                    </span>
                  </div>

                  {/* Due Date */}
                  {selectedTask.dueDate && (
                    <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-2xl">
                      <Clock className="text-blue-500" size={20} />
                      <div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">Due Date</div>
                        <div className="text-gray-900 dark:text-white font-medium">
                          {selectedTask.dueDate.toLocaleDateString()} at {' '}
                          {selectedTask.dueDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Tags */}
                  {selectedTask.tags.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Tags</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedTask.tags.map(tag => (
                          <span key={tag} className="px-3 py-1.5 text-sm bg-blue-100 dark:bg-blue-900/30 rounded-full text-blue-600 dark:text-blue-300 font-medium">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Subtasks */}
                  {selectedTask.subtasks.length > 0 && (
                    <div>
                      <div className="flex justify-between items-center mb-3">
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Subtasks</h4>
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                          {getSubtaskProgress(selectedTask.subtasks)}% Complete
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-4">
                        <div
                          className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${getSubtaskProgress(selectedTask.subtasks)}%` }}
                        />
                      </div>
                      <ul className="space-y-2">
                        {selectedTask.subtasks.map(subtask => (
                          <li key={subtask.id} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-xl">
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                              subtask.completed 
                                ? 'bg-green-500 border-green-500 text-white' 
                                : 'border-gray-300 dark:border-gray-600'
                            }`}>
                              {subtask.completed && <CheckSquare size={12} />}
                            </div>
                            <span className={`flex-1 ${subtask.completed ? 'line-through text-gray-400 dark:text-gray-500' : 'text-gray-900 dark:text-white'}`}>
                              {subtask.title}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Enhanced Header */}
      <div className="sticky top-0 z-40 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50">
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Calendar
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {selectedDay?.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={toggleDarkMode}
                className="p-2.5 rounded-2xl bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all"
              >
                {darkMode ? <Sun size={18} /> : <Moon size={18} />}
              </button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowTaskForm(true)}
                className="p-2.5 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg hover:shadow-xl transition-all"
              >
                <Plus size={18} />
              </motion.button>
            </div>
          </div>

          {/* Stats Overview */}
          <StatsOverview tasks={tasks} />

          {/* Enhanced View Toggle for Mobile */}
          {isMobile && (
            <div className="flex bg-white dark:bg-gray-800 rounded-2xl p-1 shadow-lg border border-gray-100 dark:border-gray-700">
              <button
                onClick={() => handleViewToggle('calendar')}
                className={`flex-1 py-3 px-4 rounded-xl text-sm font-semibold flex items-center justify-center space-x-2 transition-all ${
                  activeView === 'calendar'
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-md'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <CalendarIcon size={18} />
                <span>Calendar</span>
              </button>
              <button
                onClick={() => handleViewToggle('tasks')}
                className={`flex-1 py-3 px-4 rounded-xl text-sm font-semibold flex items-center justify-center space-x-2 transition-all ${
                  activeView === 'tasks'
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-md'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <List size={18} />
                <span>Tasks</span>
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Enhanced Calendar Panel */}
        <AnimatePresence>
          {(!isMobile || showCalendar) && (
            <motion.section
              className="bg-white dark:bg-gray-800 rounded-3xl shadow-lg p-6 border border-gray-100 dark:border-gray-700"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
            >
              <header className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold flex items-center gap-3 text-gray-900 dark:text-white">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                    <CalendarIcon size={20} className="text-blue-600 dark:text-blue-400" />
                  </div>
                  <span>Calendar View</span>
                </h2>
                {selectedDay && (
                  <div className="text-sm font-medium text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 px-4 py-2 rounded-full">
                    {selectedDay.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                  </div>
                )}
              </header>

              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-2xl p-4">
                <DayPicker
                  mode="single"
                  selected={selectedDay}
                  onSelect={setSelectedDay}
                  showOutsideDays
                  modifiers={modifiers}
                  modifiersStyles={modifiersStyles}
                  className="mx-auto"
                  modifiersClassNames={{
                    today: 'border-2 border-blue-500 font-bold text-blue-500 dark:text-blue-400',
                    selected: 'bg-gradient-to-br from-blue-500 to-purple-500 text-white font-bold shadow-lg',
                    outside: 'text-gray-300 dark:text-gray-600 opacity-50',
                    disabled: 'opacity-30 cursor-not-allowed',
                  }}
                  components={{
                    IconLeft: () => <ChevronLeft className="text-blue-600 dark:text-blue-400" size={20} />,
                    IconRight: () => <ChevronRight className="text-blue-600 dark:text-blue-400" size={20} />,
                  }}
                  styles={{
                    root: {
                      width: '100%',
                    },
                    caption: {
                      marginBottom: '1rem',
                      fontWeight: 'bold',
                      fontSize: '1.1rem',
                      textAlign: 'center',
                      color: 'var(--text-primary)',
                    },
                    day: {
                      borderRadius: '12px',
                      margin: '0.1rem',
                      padding: '0.6rem',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      fontSize: '0.9rem',
                      border: '2px solid transparent',
                    },
                    head_cell: {
                      fontWeight: 'bold',
                      textTransform: 'uppercase',
                      fontSize: '0.75rem',
                      paddingBottom: '1rem',
                      color: 'var(--text-secondary)',
                    },
                  }}
                />
              </div>
            </motion.section>
          )}
        </AnimatePresence>

        {/* Enhanced Task List Panel */}
        <AnimatePresence>
          {(!isMobile || !showCalendar) && (
            <motion.section
              className="bg-white dark:bg-gray-800 rounded-3xl shadow-lg p-6 border border-gray-100 dark:border-gray-700"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
            >
              <header className="mb-6 flex flex-wrap justify-between items-center gap-3">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    {tasksForSelectedDay.length} {tasksForSelectedDay.length === 1 ? 'Task' : 'Tasks'} for Today
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {selectedDay?.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                  </p>
                </div>

                <div className="flex gap-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowFilters(!showFilters)}
                    className={`p-3 rounded-2xl transition-all ${
                      showFilters 
                        ? 'bg-blue-500 text-white shadow-lg' 
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:shadow-md'
                    }`}
                  >
                    <Filter size={18} />
                  </motion.button>
                </div>
              </header>

              {/* Enhanced Status Filter */}
              <AnimatePresence>
                {showFilters && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden mb-6"
                  >
                    <div className="flex flex-wrap gap-2">
                      <motion.button
                        onClick={() => setSelectedStatus('all')}
                        className={`px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all ${
                          selectedStatus === 'all' 
                            ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg' 
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:shadow-md'
                        }`}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <span>All Tasks</span>
                      </motion.button>
                      {Object.entries(statusColors).map(([status, color]) => (
                        <motion.button
                          key={status}
                          onClick={() => setSelectedStatus(status as TaskStatus)}
                          className={`px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all ${
                            selectedStatus === status 
                              ? `${color} text-white shadow-lg` 
                              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:shadow-md'
                          }`}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          {getStatusIcon(status as TaskStatus)}
                          <span className="capitalize">{status.replace('-', ' ')}</span>
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {isLoading ? (
                <div className="space-y-4">
                  <SkeletonCard />
                  <SkeletonCard />
                  <SkeletonCard />
                </div>
              ) : tasksForSelectedDay.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center justify-center text-center p-8"
                >
                  <div className="bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/20 dark:to-purple-900/20 rounded-3xl p-6 mb-4">
                    <CalendarIcon className="text-blue-500 dark:text-blue-400" size={48} />
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    No tasks scheduled
                  </h4>
                  <p className="text-gray-500 dark:text-gray-400 text-sm mb-6 max-w-sm">
                    You're all caught up! Enjoy your free time or add new tasks to stay productive.
                  </p>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowTaskForm(true)}
                    className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-3 rounded-2xl font-semibold flex items-center gap-2 shadow-lg hover:shadow-xl transition-all"
                  >
                    <Plus size={18} />
                    Add New Task
                  </motion.button>
                </motion.div>
              ) : (
                <motion.ul
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  className="space-y-3"
                >
                  <AnimatePresence>
                    {tasksForSelectedDay.map(task => (
                      <motion.li
                        key={task.id}
                        variants={itemVariants}
                        layout
                        whileHover={{ y: -2, scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setSelectedTask(task)}
                        className="group p-4 bg-white dark:bg-gray-700 rounded-2xl cursor-pointer transition-all duration-300 border border-gray-100 dark:border-gray-600 shadow-sm hover:shadow-lg hover:border-blue-200 dark:hover:border-blue-800"
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex items-start gap-4 flex-1">
                            <div className={`mt-1.5 w-3 h-3 rounded-full flex-shrink-0 ${statusColors[task.status]}`} />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between mb-2">
                                <h4 className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
                                  {task.title}
                                </h4>
                                {task.dueDate && (
                                  <time className="text-xs font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap ml-3 bg-gray-100 dark:bg-gray-600 px-2 py-1 rounded-full flex items-center gap-1 flex-shrink-0">
                                    <Clock size={12} />
                                    {task.dueDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  </time>
                                )}
                              </div>
                              
                              {task.description && (
                                <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-3">
                                  {task.description}
                                </p>
                              )}
                              
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className={`px-2.5 py-1 text-xs rounded-full font-medium ${categoryColors[task.category]}`}>
                                  {task.category.replace('-', ' ')}
                                </span>
                                <span className={`px-2.5 py-1 text-xs rounded-full font-medium ${priorityColors[task.priority]}`}>
                                  {task.priority}
                                </span>
                                {task.subtasks.length > 0 && (
                                  <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                                    <div className="w-16 bg-gray-200 dark:bg-gray-600 rounded-full h-1.5">
                                      <div
                                        className="bg-gradient-to-r from-blue-500 to-purple-500 h-1.5 rounded-full transition-all duration-500"
                                        style={{ width: `${getSubtaskProgress(task.subtasks)}%` }}
                                      />
                                    </div>
                                    <span>{getSubtaskProgress(task.subtasks)}%</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.li>
                    ))}
                  </AnimatePresence>
                </motion.ul>
              )}
            </motion.section>
          )}
        </AnimatePresence>

        {/* Enhanced Mobile Optimization Notice */}
        {isMobile && (
          <motion.div
            className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-4 flex items-start"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-xl mr-3">
              <Smartphone size={18} className="text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex-1">
              <h4 className="text-blue-800 dark:text-blue-200 font-semibold text-sm">Mobile Optimized</h4>
              <p className="text-blue-600 dark:text-blue-300 text-xs mt-1">
                Swipe between calendar and task views. Pull down to refresh your tasks.
              </p>
            </div>
          </motion.div>
        )}
      </div>

      <TaskForm
        isOpen={showTaskForm}
        onClose={() => setShowTaskForm(false)}
        initialDueDate={selectedDay}
      />
      <BottomBar />
    </div>
  );NPM 
};