import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, X, CheckCircle, Circle, AlertCircle, Clock, Archive, Plus, Filter } from 'lucide-react';
import { Task, SubTask, TaskStatus, Priority, TaskCategory } from './task';
import { TaskForm } from '../components/tasks/TaskForm'; // Assuming TaskForm is available

interface CalendarPageProps {
  tasks: Task[];
}

const statusColors: Record<TaskStatus, string> = {
  'todo': 'bg-gray-500',
  'in-progress': 'bg-yellow-500',
  'completed': 'bg-green-500',
  'archived': 'bg-purple-500',
};

const priorityColors: Record<Priority, string> = {
  'low': 'bg-blue-500',
  'medium': 'bg-yellow-500',
  'high': 'bg-orange-500',
  'urgent': 'bg-red-500',
};

const categoryColors: Record<TaskCategory, string> = {
  'code-tasks': 'bg-blue-500',
  'learning': 'bg-purple-500',
  'relationship': 'bg-pink-500',
  'self-development': 'bg-green-500',
  'project-improvement': 'bg-indigo-500',
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

export const CalendarPage: React.FC<CalendarPageProps> = ({ tasks }) => {
  const [selectedDay, setSelectedDay] = useState<Date | undefined>(new Date());
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<'all' | TaskStatus>('all');
  const [showCalendar, setShowCalendar] = useState(true); // For mobile toggle

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4 sm:p-8 max-w-7xl mx-auto">
      {/* Task Detail Modal */}
      {selectedTask && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-48 h-48 bg-blue-500/10 rounded-full -ml-24 -mt-24 blur-xl"></div>
            <div className="p-6 relative z-10">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{selectedTask.title}</h3>
                  <div className="flex gap-2 mt-2">
                    <span className={`px-3 py-1 text-sm rounded-full ${categoryColors[selectedTask.category]} text-white font-medium`}>
                      {selectedTask.category.replace('-', ' ').toUpperCase()}
                    </span>
                    <span className={`px-3 py-1 text-sm rounded-full ${priorityColors[selectedTask.priority]} text-white font-medium`}>
                      {selectedTask.priority.toUpperCase()}
                    </span>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedTask(null)}
                  className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                >
                  <X size={24} />
                </button>
              </div>
              
              {selectedTask.description && (
                <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">{selectedTask.description}</p>
              )}
              
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  {getStatusIcon(selectedTask.status)}
                  <span className={`font-semibold text-lg ${
                    selectedTask.status === 'completed' ? 'text-green-600 dark:text-green-400' :
                    selectedTask.status === 'in-progress' ? 'text-yellow-600 dark:text-yellow-400' :
                    selectedTask.status === 'archived' ? 'text-purple-600 dark:text-purple-400' :
                    'text-gray-600 dark:text-gray-400'
                  }`}>
                    {selectedTask.status.replace('-', ' ').toUpperCase()}
                  </span>
                </div>
                
                {selectedTask.dueDate && (
                  <div className="flex items-center gap-3 bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                    <Clock className="text-blue-500" size={20} />
                    <span className="text-gray-900 dark:text-white font-medium">
                      Due: {selectedTask.dueDate.toLocaleDateString()} at {selectedTask.dueDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                )}
                
                {selectedTask.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {selectedTask.tags.map(tag => (
                      <span key={tag} className="px-3 py-1 text-sm bg-blue-100 dark:bg-blue-900 rounded-full text-blue-600 dark:text-blue-300 font-medium">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
                
                {selectedTask.subtasks.length > 0 && (
                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-white">SUBTASKS</h4>
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        {getSubtaskProgress(selectedTask.subtasks)}% Complete
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-4">
                      <div 
                        className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${getSubtaskProgress(selectedTask.subtasks)}%` }}
                      />
                    </div>
                    <ul className="space-y-3">
                      {selectedTask.subtasks.map(subtask => (
                        <li key={subtask.id} className="flex items-center gap-3 p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <input 
                            type="checkbox" 
                            checked={subtask.completed}
                            readOnly
                            className="rounded text-blue-500 focus:ring-blue-500 w-5 h-5"
                          />
                          <span className={`text-base flex-1 ${subtask.completed ? 'line-through text-gray-400 dark:text-gray-500' : 'text-gray-900 dark:text-white'}`}>
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

      <div className={`flex ${isMobile ? 'flex-col' : 'flex-row'} gap-6`}>
        {/* Calendar Panel */}
        <section className={`${isMobile ? (showCalendar ? 'block' : 'hidden') : 'md:w-1/2'} bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 transition-all duration-300`}>
          <header className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <CalendarIcon size={32} className="text-blue-600 dark:text-blue-400" />
              <span>Calendar</span>
            </h2>
            {selectedDay && (
              <div className="text-base font-medium text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 px-4 py-2 rounded-full shadow-inner">
                {selectedDay.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
              </div>
            )}
          </header>

          <DayPicker
            mode="single"
            selected={selectedDay}
            onSelect={setSelectedDay}
            showOutsideDays
            pagedNavigation
            fromYear={2020}
            toYear={2030}
            modifiers={modifiers}
            modifiersStyles={modifiersStyles}
            className="mx-auto"
            modifiersClassNames={{
              today: 'border-2 border-blue-500 font-bold text-blue-500',
              selected: 'bg-gradient-to-br from-blue-500 to-blue-600 text-white font-bold',
              outside: 'text-gray-300 dark:text-gray-600 opacity-50',
              disabled: 'opacity-30 cursor-not-allowed',
            }}
            components={{
              IconLeft: () => <ChevronLeft className="text-blue-600 dark:text-blue-400" size={24} />,
              IconRight: () => <ChevronRight className="text-blue-600 dark:text-blue-400" size={24} />,
            }}
            styles={{
              root: {
                width: '100%',
              },
              caption: {
                marginBottom: '1.5rem',
                fontWeight: 'bold',
                fontSize: '1.25rem',
                textAlign: 'center',
                color: 'var(--text-primary)',
              },
              day: {
                borderRadius: '50%',
                margin: '0.25rem',
                padding: '0.75rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                fontSize: '1rem',
              },
              head_cell: {
                fontWeight: 'bold',
                textTransform: 'uppercase',
                fontSize: '0.875rem',
                color: 'var(--text-secondary)',
                paddingBottom: '1rem',
              },
            }}
          />
          {isMobile && (
            <button 
              onClick={() => setShowCalendar(false)}
              className="w-full mt-4 bg-blue-500 text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2 hover:bg-blue-600 transition-colors"
            >
              <CalendarIcon size={20} />
              View Tasks
            </button>
          )}
        </section>

        {/* Task List Panel */}
        <section className={`${isMobile ? (showCalendar ? 'hidden' : 'block') : 'md:w-1/2'} bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 flex flex-col transition-all duration-300`}>
          <header className="mb-6 flex justify-between items-center">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
              {tasksForSelectedDay.length} {tasksForSelectedDay.length === 1 ? 'Task' : 'Tasks'} for {selectedDay?.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
            </h3>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowTaskForm(true)}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2 hover:bg-blue-600 transition-colors shadow-md"
            >
              <Plus size={20} />
              Add Task
            </motion.button>
          </header>

          {/* Status Filter */}
          <div className="flex flex-wrap gap-2 mb-6">
            <motion.button
              onClick={() => setSelectedStatus('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 ${selectedStatus === 'all' ? 'bg-blue-500 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
              whileHover={{ scale: 1.05 }}
            >
              <Filter size={16} />
              All
            </motion.button>
            {Object.entries(statusColors).map(([status, color]) => (
              <motion.button
                key={status}
                onClick={() => setSelectedStatus(status as TaskStatus)}
                className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 ${selectedStatus === status ? 'text-white ' + color : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
                whileHover={{ scale: 1.05 }}
              >
                {getStatusIcon(status as TaskStatus)}
                {status.replace('-', ' ').toUpperCase()}
              </motion.button>
            ))}
          </div>

          {tasksForSelectedDay.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex-grow flex flex-col items-center justify-center text-center p-8"
            >
              <div className="bg-gray-100 dark:bg-gray-700 rounded-full p-6 mb-4 shadow-inner">
                <CalendarIcon className="text-gray-400 dark:text-gray-500" size={48} />
              </div>
              <h4 className="text-xl font-medium text-gray-500 dark:text-gray-400 mb-2">No tasks scheduled</h4>
              <p className="text-gray-400 dark:text-gray-500 max-w-md mb-4">
                You don't have any tasks for this day. Add new tasks or enjoy your free time!
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowTaskForm(true)}
                className="bg-blue-500 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 hover:bg-blue-600 transition-colors shadow-md"
              >
                <Plus size={20} />
                Add Task
              </motion.button>
            </motion.div>
          ) : (
            <motion.ul
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="flex-grow overflow-y-auto space-y-4 pr-2"
            >
              <AnimatePresence>
                {tasksForSelectedDay.map(task => (
                  <motion.li 
                    key={task.id}
                    variants={itemVariants}
                    layout
                    whileHover={{ scale: 1.02, boxShadow: '0 5px 15px rgba(0,0,0,0.1)' }}
                    onClick={() => setSelectedTask(task)}
                    className="group p-4 bg-gray-50 dark:bg-gray-700 rounded-xl cursor-pointer transition-all duration-200 border border-transparent hover:border-blue-200 dark:hover:border-blue-800 shadow-sm hover:shadow-md"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex items-start gap-4">
                        <div className={`mt-1 w-4 h-4 rounded-full flex-shrink-0 ${statusColors[task.status]}`} />
                        <div>
                          <h4 className="font-semibold text-lg text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            {task.title}
                          </h4>
                          {task.description && (
                            <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mt-1">
                              {task.description}
                            </p>
                          )}
                          <div className="flex gap-2 mt-3">
                            <span className={`px-2 py-1 text-xs rounded-full ${categoryColors[task.category]} text-white font-medium`}>
                              {task.category.replace('-', ' ').toUpperCase()}
                            </span>
                            <span className={`px-2 py-1 text-xs rounded-full ${priorityColors[task.priority]} text-white font-medium`}>
                              {task.priority.toUpperCase()}
                            </span>
                          </div>
                          {task.subtasks.length > 0 && (
                            <div className="mt-2 w-32 bg-gray-200 dark:bg-gray-600 rounded-full h-1.5">
                              <div 
                                className="bg-blue-500 h-1.5 rounded-full"
                                style={{ width: `${getSubtaskProgress(task.subtasks)}%` }}
                              />
                            </div>
                          )}
                        </div>
                      </div>
                      {task.dueDate && (
                        <time className="text-sm font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap ml-4 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">
                          {task.dueDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </time>
                      )}
                    </div>
                  </motion.li>
                ))}
              </AnimatePresence>
            </motion.ul>
          )}
          {isMobile && (
            <button 
              onClick={() => setShowCalendar(true)}
              className="w-full mt-4 bg-blue-500 text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2 hover:bg-blue-600 transition-colors"
            >
              <CalendarIcon size={20} />
              Back to Calendar
            </button>
          )}
        </section>
      </div>

      {/* Task Form Modal */}
      <TaskForm
        isOpen={showTaskForm}
        onClose={() => setShowTaskForm(false)}
        initialDueDate={selectedDay}
      />
    </div>
  );
};