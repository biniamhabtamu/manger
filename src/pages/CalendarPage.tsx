import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import {
  ChevronLeft,
  ChevronRight,
  X,
  CheckCircle,
  Circle,
  AlertCircle,
  Clock,
  Archive,
  Plus,
  Sparkles,
  Sun,
  Moon,
  CheckSquare,
  CalendarDays,
} from 'lucide-react';
import { Task, SubTask, TaskStatus, Priority, TaskCategory } from '../types/task';
import { TaskForm } from '../components/tasks/TaskForm';
import { BottomBar } from '../components/layout/BottomBar';

interface CalendarPageProps {
  tasks: Task[];
}

const statusColors: Record<TaskStatus, string> = {
  'todo': 'bg-slate-400 dark:bg-slate-500',
  'in-progress': 'bg-amber-500',
  'completed': 'bg-emerald-500',
  'archived': 'bg-violet-500',
};

const priorityColors: Record<Priority, string> = {
  'low': 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20',
  'medium': 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20',
  'high': 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20',
  'urgent': 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20',
};

const categoryColors: Record<TaskCategory, string> = {
  'code-tasks': 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
  'learning': 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
  'relationship': 'bg-pink-500/10 text-pink-600 dark:text-pink-400',
  'self-development': 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  'project-improvement': 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400',
};

// Skeleton Loader
const SkeletonLoader = () => (
  <div className="px-4 pt-4 pb-24 space-y-4 animate-pulse">
    <div className="flex items-center justify-between">
      <div className="space-y-1.5">
        <div className="h-7 w-28 bg-gray-200 dark:bg-gray-800 rounded-xl" />
        <div className="h-3.5 w-40 bg-gray-200 dark:bg-gray-800 rounded-lg" />
      </div>
      <div className="h-10 w-10 bg-gray-200 dark:bg-gray-800 rounded-full" />
    </div>
    <div className="grid grid-cols-3 gap-2">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="h-14 bg-gray-200 dark:bg-gray-800 rounded-2xl" />
      ))}
    </div>
    <div className="h-72 bg-gray-200 dark:bg-gray-800 rounded-3xl" />
    <div className="space-y-3">
      {[...Array(2)].map((_, i) => (
        <div key={i} className="h-20 bg-gray-200 dark:bg-gray-800 rounded-2xl" />
      ))}
    </div>
  </div>
);

export const CalendarPage: React.FC<CalendarPageProps> = ({ tasks }) => {
  const [selectedDay, setSelectedDay] = useState<Date | undefined>(new Date());
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<'all' | TaskStatus>('all');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  };

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

  let tasksForSelectedDay = tasks.filter(task => {
    if (!task.dueDate || !selectedDay) return false;
    return task.dueDate.toDateString() === selectedDay.toDateString();
  });

  if (selectedStatus !== 'all') {
    tasksForSelectedDay = tasksForSelectedDay.filter(task => task.status === selectedStatus);
  }

  tasksForSelectedDay.sort((a, b) => (a.dueDate?.getTime() || 0) - (b.dueDate?.getTime() || 0));

  const getStatusIcon = (status: TaskStatus) => {
    switch (status) {
      case 'completed': return <CheckCircle size={15} className="text-emerald-500" />;
      case 'in-progress': return <AlertCircle size={15} className="text-amber-500" />;
      case 'archived': return <Archive size={15} className="text-purple-400" />;
      default: return <Circle size={15} className="text-slate-400" />;
    }
  };

  const getSubtaskProgress = (subtasks: SubTask[]) => {
    if (subtasks.length === 0) return 0;
    const completed = subtasks.filter(st => st.completed).length;
    return Math.round((completed / subtasks.length) * 100);
  };

  const todayStats = {
    today: tasks.filter(t => t.dueDate?.toDateString() === new Date().toDateString()).length,
    completed: tasks.filter(t => t.status === 'completed').length,
    inProgress: tasks.filter(t => t.status === 'in-progress').length,
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#0f172a]">
        <SkeletonLoader />
        <BottomBar onTaskFormOpen={() => { }} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0f172a] text-slate-900 dark:text-slate-100 pb-28 antialiased overflow-x-hidden">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-white/80 dark:bg-[#0f172a]/80 backdrop-blur-xl border-b border-slate-200/40 dark:border-slate-800/40 px-4 pt-4 pb-3">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Schedule</h1>
            <p className="text-xs font-medium text-blue-600 dark:text-blue-400 mt-0.5">
              {selectedDay?.toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={toggleDarkMode}
              className="p-2.5 rounded-full bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 shadow-sm text-slate-600 dark:text-slate-300 active:scale-95 transition-transform"
            >
              {isDarkMode ? <Sun size={18} className="text-amber-400" /> : <Moon size={18} />}
            </button>
            <button
              onClick={() => setShowTaskForm(true)}
              className="p-2.5 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-md shadow-blue-500/20 active:scale-95 transition-transform"
            >
              <Plus size={18} strokeWidth={2.5} />
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="max-w-md mx-auto grid grid-cols-3 gap-2 mt-4">
          <div className="bg-white/60 dark:bg-slate-800/60 border border-slate-200/40 dark:border-slate-700/40 rounded-2xl p-2.5 flex flex-col items-center shadow-sm">
            <span className="text-base font-bold text-blue-600 dark:text-blue-400">{todayStats.today}</span>
            <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider mt-0.5">Today</span>
          </div>
          <div className="bg-white/60 dark:bg-slate-800/60 border border-slate-200/40 dark:border-slate-700/40 rounded-2xl p-2.5 flex flex-col items-center shadow-sm">
            <span className="text-base font-bold text-emerald-500">{todayStats.completed}</span>
            <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider mt-0.5">Done</span>
          </div>
          <div className="bg-white/60 dark:bg-slate-800/60 border border-slate-200/40 dark:border-slate-700/40 rounded-2xl p-2.5 flex flex-col items-center shadow-sm">
            <span className="text-base font-bold text-amber-500">{todayStats.inProgress}</span>
            <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider mt-0.5">Doing</span>
          </div>
        </div>
      </div>

      <div className="px-4 mt-4 space-y-4 max-w-md mx-auto">
        {/* Calendar Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white dark:bg-slate-800/90 rounded-3xl p-3 shadow-xl shadow-slate-200/30 dark:shadow-none border border-slate-200/50 dark:border-slate-700/50 overflow-hidden"
        >
          <style>{`
            .rdp {
              --rdp-cell-size: 40px;
              margin: 0;
              width: 100%;
              max-width: 100%;
            }
            .rdp-months {
              justify-content: center;
              width: 100%;
              max-width: 100%;
            }
            .rdp-month {
              width: 100%;
              max-width: 100%;
            }
            .rdp-table {
              width: 100%;
              max-width: 100%;
              table-layout: fixed;
            }
            .rdp-cell {
              padding: 2px;
              text-align: center;
              width: 14.28%;
            }
            .rdp-caption {
              display: flex;
              align-items: center;
              justify-content: space-between;
              padding: 0 4px 12px 4px;
            }
            .rdp-caption_label {
              font-size: 15px;
              font-weight: 700;
              color: #0f172a;
            }
            .dark .rdp-caption_label {
              color: #ffffff;
            }
            .rdp-head_cell {
              font-size: 11px;
              font-weight: 600;
              text-transform: uppercase;
              color: #94a3b8;
              padding-bottom: 8px;
              width: 14.28%;
              text-align: center;
            }
            .rdp-day {
              width: 100%;
              max-width: 40px;
              height: 40px;
              border-radius: 12px;
              font-size: 14px;
              font-weight: 500;
              color: #334155;
              display: inline-flex;
              align-items: center;
              justify-content: center;
              position: relative;
              transition: all 0.15s ease;
              border: none;
              background: transparent;
              cursor: pointer;
              margin: 0 auto;
            }
            .dark .rdp-day {
              color: #cbd5e1;
            }
            .rdp-day_outside {
              color: #cbd5e1 !important;
              opacity: 0.3;
            }
            .dark .rdp-day_outside {
              color: #475569 !important;
            }
            .rdp-day_today {
              background: #f1f5f9 !important;
              color: #2563eb !important;
              font-weight: 700;
              border: 1px solid #dbeafe !important;
            }
            .dark .rdp-day_today {
              background: #1e293b !important;
              color: #3b82f6 !important;
              border: 1px solid #1e3a8a !important;
            }
            .rdp-day_selected {
              background: linear-gradient(135deg, #2563eb, #4f46e5) !important;
              color: white !important;
              font-weight: 700;
              box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
            }
            .rdp-day_hasTasks::after {
              content: '';
              position: absolute;
              bottom: 4px;
              left: 50%;
              transform: translateX(-50%);
              width: 5px;
              height: 5px;
              border-radius: 50%;
              background-color: #3b82f6;
            }
            .rdp-day_selected.rdp-day_hasTasks::after {
              background-color: #ffffff;
            }
            .rdp-day:hover:not(.rdp-day_selected) {
              background: #f1f5f9;
            }
            .dark .rdp-day:hover:not(.rdp-day_selected) {
              background: #1e293b;
            }
            .rdp-day:active {
              transform: scale(0.92);
            }
            .rdp-nav_button {
              padding: 6px;
              border-radius: 10px;
              background: transparent;
              transition: background 0.2s;
              min-width: 32px;
              min-height: 32px;
            }
            .rdp-nav_button:hover {
              background: #f1f5f9;
            }
            .dark .rdp-nav_button:hover {
              background: #1e293b;
            }
            @media (max-width: 640px) {
              .rdp {
                --rdp-cell-size: 36px;
              }
              .rdp-day {
                max-width: 36px;
                height: 36px;
                font-size: 13px;
              }
              .rdp-caption_label {
                font-size: 14px;
              }
            }
          `}</style>

          <DayPicker
            mode="single"
            selected={selectedDay}
            onSelect={setSelectedDay}
            showOutsideDays
            modifiers={modifiers}
            modifiersClassNames={{
              hasTasks: 'rdp-day_hasTasks',
              today: 'rdp-day_today',
              selected: 'rdp-day_selected',
              outside: 'rdp-day_outside',
            }}
            components={{
              IconLeft: () => <ChevronLeft size={18} className="text-slate-500 dark:text-slate-400" />,
              IconRight: () => <ChevronRight size={18} className="text-slate-500 dark:text-slate-400" />,
            }}
          />
        </motion.div>

        {/* Status Filters - Now wraps properly */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedStatus('all')}
            className={`px-4 py-2 rounded-2xl text-xs font-semibold transition-all ${selectedStatus === 'all'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-md'
                : 'bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 text-slate-600 dark:text-slate-400'
              }`}
          >
            All Tasks
          </button>
          {Object.entries(statusColors).map(([status, color]) => (
            <button
              key={status}
              onClick={() => setSelectedStatus(status as TaskStatus)}
              className={`px-3.5 py-2 rounded-2xl text-xs font-semibold flex items-center gap-1.5 transition-all border ${selectedStatus === status
                  ? 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 shadow-sm'
                  : 'bg-white dark:bg-slate-800 border-slate-200/60 dark:border-slate-700/60 text-slate-500 dark:text-slate-400'
                }`}
            >
              <span className={`w-2 h-2 rounded-full ${color}`} />
              <span className="capitalize">{status.replace('-', ' ')}</span>
            </button>
          ))}
        </div>

        {/* Task List */}
        <div className="space-y-3 pb-4">
          <AnimatePresence mode="popLayout">
            {tasksForSelectedDay.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-center py-12 bg-white dark:bg-slate-800/40 rounded-3xl border border-slate-200/50 dark:border-slate-800/50"
              >
                <div className="w-14 h-14 bg-blue-50 dark:bg-blue-950/40 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <CalendarDays size={24} className="text-blue-500 dark:text-blue-400" />
                </div>
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">No Tasks</h3>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                  Nothing scheduled for this day
                </p>
              </motion.div>
            ) : (
              tasksForSelectedDay.map((task) => (
                <motion.div
                  key={task.id}
                  layoutId={`task-card-${task.id}`}
                  onClick={() => setSelectedTask(task)}
                  className="bg-white dark:bg-slate-800 rounded-2xl p-3.5 shadow-sm border border-slate-200/60 dark:border-slate-700/50 cursor-pointer active:scale-[0.98] transition-transform"
                >
                  <div className="flex items-start gap-3">
                    <span className={`w-2 h-2 rounded-full ${statusColors[task.status]} flex-shrink-0 mt-1.5`} />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-semibold text-slate-900 dark:text-white line-clamp-2">
                        {task.title}
                      </h4>
                      <div className="flex flex-wrap gap-1.5 mt-1.5">
                        <span className={`text-[10px] px-2 py-0.5 rounded-lg font-medium ${categoryColors[task.category]}`}>
                          {task.category.replace('-', ' ')}
                        </span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-lg font-medium ${priorityColors[task.priority]}`}>
                          {task.priority}
                        </span>
                        {task.dueDate && (
                          <span className="text-[10px] text-slate-400 dark:text-slate-500 flex items-center gap-0.5">
                            <Clock size={10} />
                            {task.dueDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        )}
                      </div>
                      {task.subtasks.length > 0 && (
                        <div className="flex items-center gap-2 mt-2">
                          <div className="flex-1 h-1 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"
                              style={{ width: `${getSubtaskProgress(task.subtasks)}%` }}
                            />
                          </div>
                          <span className="text-[10px] font-medium text-slate-400">
                            {getSubtaskProgress(task.subtasks)}%
                          </span>
                        </div>
                      )}
                    </div>
                    <ChevronRight size={16} className="text-slate-300 dark:text-slate-600 flex-shrink-0 mt-1" />
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>

        {/* Tip */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-2xl p-3 flex items-start gap-3 border border-blue-100 dark:border-blue-900/30">
          <Sparkles size={16} className="text-blue-500 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="text-xs font-semibold text-blue-800 dark:text-blue-300">Pro Tip</h4>
            <p className="text-[11px] text-blue-600 dark:text-blue-400/80 leading-relaxed">
              Tap any task to view details and subtasks.
            </p>
          </div>
        </div>
      </div>

      {/* Task Detail Modal - Bottom Sheet */}
      <AnimatePresence>
        {selectedTask && (
          <div className="fixed inset-0 z-50 flex items-end justify-center">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedTask(null)}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-t-3xl shadow-2xl max-h-[80vh] overflow-y-auto"
            >
              <div className="w-12 h-1 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto mt-3" />
              <div className="p-5 pt-2 space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    {selectedTask.title}
                  </h3>
                  <button
                    onClick={() => setSelectedTask(null)}
                    className="p-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                  >
                    <X size={18} />
                  </button>
                </div>

                <div className="flex flex-wrap gap-2">
                  <span className={`text-xs px-2.5 py-1 rounded-xl font-medium ${categoryColors[selectedTask.category]}`}>
                    {selectedTask.category.replace('-', ' ')}
                  </span>
                  <span className={`text-xs px-2.5 py-1 rounded-xl font-medium ${priorityColors[selectedTask.priority]}`}>
                    {selectedTask.priority}
                  </span>
                  <span className={`text-xs px-2.5 py-1 rounded-xl font-medium capitalize ${selectedTask.status === 'completed' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                      selectedTask.status === 'in-progress' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                        selectedTask.status === 'archived' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' :
                          'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                    }`}>
                    {selectedTask.status.replace('-', ' ')}
                  </span>
                </div>

                {selectedTask.description && (
                  <div className="bg-slate-50 dark:bg-slate-800/50 p-3.5 rounded-2xl">
                    <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                      {selectedTask.description}
                    </p>
                  </div>
                )}

                {selectedTask.dueDate && (
                  <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
                    <Clock size={16} className="text-blue-500" />
                    <div>
                      <p className="text-xs text-slate-400 font-medium">Due Date</p>
                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                        {selectedTask.dueDate.toLocaleDateString()} at{' '}
                        {selectedTask.dueDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                )}

                {selectedTask.subtasks.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Subtasks</h4>
                      <span className="text-xs font-medium text-slate-500">
                        {getSubtaskProgress(selectedTask.subtasks)}% done
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all"
                        style={{ width: `${getSubtaskProgress(selectedTask.subtasks)}%` }}
                      />
                    </div>
                    <ul className="space-y-1.5">
                      {selectedTask.subtasks.map(subtask => (
                        <li key={subtask.id} className="flex items-center gap-2 p-2 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                          <div className={`w-4 h-4 rounded-md border-2 flex items-center justify-center flex-shrink-0 ${subtask.completed
                              ? 'bg-emerald-500 border-emerald-500 text-white'
                              : 'border-slate-300 dark:border-slate-600'
                            }`}>
                            {subtask.completed && <CheckSquare size={10} strokeWidth={3} />}
                          </div>
                          <span className={`text-sm flex-1 ${subtask.completed ? 'line-through text-slate-400' : 'text-slate-800 dark:text-slate-200'}`}>
                            {subtask.title}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <TaskForm
        isOpen={showTaskForm}
        onClose={() => setShowTaskForm(false)}
        initialDueDate={selectedDay}
      />

      <BottomBar onTaskFormOpen={() => setShowTaskForm(true)} />
    </div>
  );
};

export default CalendarPage;