import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useParams, Link } from 'react-router-dom';
import { 
  Code, 
  BookOpen, 
  Heart, 
  User, 
  Wrench, 
  Plus,
  Search,
  Filter,
  CheckSquare,
  Clock,
  AlertTriangle
} from 'lucide-react';
import { useTasks } from '../hooks/useTasks';
import { TaskForm } from '../components/tasks/TaskForm';
import { TaskCard } from '../components/tasks/TaskCard';
import { TaskCategory } from '../types/task';

const categoryConfig = {
  'code-tasks': {
    icon: Code,
    title: 'Code Tasks',
    description: 'Programming tasks, bug fixes, and development work',
    color: 'blue',
    gradient: 'from-blue-500 to-blue-600'
  },
  'learning': {
    icon: BookOpen,
    title: 'Learning',
    description: 'Educational goals, courses, and skill development',
    color: 'green',
    gradient: 'from-green-500 to-green-600'
  },
  'relationship': {
    icon: Heart,
    title: 'Relationships',
    description: 'Personal connections and social activities',
    color: 'red',
    gradient: 'from-red-500 to-red-600'
  },
  'self-development': {
    icon: User,
    title: 'Self Development',
    description: 'Personal growth and improvement goals',
    color: 'purple',
    gradient: 'from-purple-500 to-purple-600'
  },
  'project-improvement': {
    icon: Wrench,
    title: 'Project Improvement',
    description: 'Enhancements and optimizations for existing projects',
    color: 'orange',
    gradient: 'from-orange-500 to-orange-600'
  }
};

export const Categories: React.FC = () => {
  const { category } = useParams<{ category: string }>();
  const { tasks, loading } = useTasks();
  const [searchTerm, setSearchTerm] = useState('');
  const [showTaskForm, setShowTaskForm] = useState(false);

  const currentCategory = category as TaskCategory;
  const config = currentCategory ? categoryConfig[currentCategory] : null;

  const filteredTasks = tasks.filter(task => {
    const matchesCategory = !currentCategory || task.category === currentCategory;
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const categoryStats = currentCategory ? {
    total: tasks.filter(t => t.category === currentCategory).length,
    completed: tasks.filter(t => t.category === currentCategory && t.status === 'completed').length,
    inProgress: tasks.filter(t => t.category === currentCategory && t.status === 'in-progress').length,
    overdue: tasks.filter(t => t.category === currentCategory && t.dueDate && t.dueDate < new Date() && t.status !== 'completed').length,
  } : null;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Show all categories overview
  if (!currentCategory) {
    return (
      <div className="p-6 space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Task Categories
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Organize your tasks by category for better focus and productivity.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Object.entries(categoryConfig).map(([key, config], index) => {
            const categoryTasks = tasks.filter(t => t.category === key);
            const completedTasks = categoryTasks.filter(t => t.status === 'completed');
            const completionRate = categoryTasks.length > 0 ? Math.round((completedTasks.length / categoryTasks.length) * 100) : 0;

            return (
              <motion.div
                key={key}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02 }}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden"
              >
                <Link to={`/tasks/${key}`}>
                  <div className={`bg-gradient-to-r ${config.gradient} p-6 text-white`}>
                    <div className="flex items-center justify-between mb-4">
                      <config.icon size={32} />
                      <span className="text-2xl font-bold">{categoryTasks.length}</span>
                    </div>
                    <h3 className="text-xl font-semibold mb-2">{config.title}</h3>
                    <p className="text-white/80 text-sm">{config.description}</p>
                  </div>
                  
                  <div className="p-6">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Progress</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{completionRate}%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className={`bg-gradient-to-r ${config.gradient} h-2 rounded-full transition-all duration-300`}
                        style={{ width: `${completionRate}%` }}
                      />
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 mt-4 text-center">
                      <div>
                        <div className="text-lg font-semibold text-gray-900 dark:text-white">
                          {completedTasks.length}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Completed</div>
                      </div>
                      <div>
                        <div className="text-lg font-semibold text-gray-900 dark:text-white">
                          {categoryTasks.filter(t => t.status === 'in-progress').length}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">In Progress</div>
                      </div>
                      <div>
                        <div className="text-lg font-semibold text-gray-900 dark:text-white">
                          {categoryTasks.filter(t => t.status === 'todo').length}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Todo</div>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    );
  }

  // Show specific category
  return (
    <div className="p-6 space-y-6">
      {/* Category Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`bg-gradient-to-r ${config!.gradient} rounded-xl p-8 text-white`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <config.icon size={48} />
            <div>
              <h1 className="text-3xl font-bold">{config.title}</h1>
              <p className="text-white/80 mt-2">{config.description}</p>
            </div>
          </div>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowTaskForm(true)}
            className="bg-white/20 hover:bg-white/30 backdrop-blur-sm px-6 py-3 rounded-lg font-medium transition-colors flex items-center space-x-2"
          >
            <Plus size={20} />
            <span>Add Task</span>
          </motion.button>
        </div>

        {/* Category Stats */}
        {categoryStats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
              <CheckSquare size={24} className="mx-auto mb-2" />
              <div className="text-2xl font-bold">{categoryStats.total}</div>
              <div className="text-white/80 text-sm">Total Tasks</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
              <CheckSquare size={24} className="mx-auto mb-2" />
              <div className="text-2xl font-bold">{categoryStats.completed}</div>
              <div className="text-white/80 text-sm">Completed</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
              <Clock size={24} className="mx-auto mb-2" />
              <div className="text-2xl font-bold">{categoryStats.inProgress}</div>
              <div className="text-white/80 text-sm">In Progress</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
              <AlertTriangle size={24} className="mx-auto mb-2" />
              <div className="text-2xl font-bold">{categoryStats.overdue}</div>
              <div className="text-white/80 text-sm">Overdue</div>
            </div>
          </div>
        )}
      </motion.div>

      {/* Search */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="relative"
      >
        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search tasks..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        />
      </motion.div>

      {/* Tasks List */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="space-y-4"
      >
        {filteredTasks.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 dark:text-gray-500 text-lg mb-4">
              No tasks found
            </div>
            <p className="text-gray-500 dark:text-gray-400">
              {tasks.filter(t => t.category === currentCategory).length === 0 
                ? `Create your first ${config!.title.toLowerCase()} task to get started!`
                : "Try adjusting your search criteria."
              }
            </p>
          </div>
        ) : (
          filteredTasks.map((task, index) => (
            <TaskCard key={task.id} task={task} index={index} />
          ))
        )}
      </motion.div>

      <TaskForm
        isOpen={showTaskForm}
        onClose={() => setShowTaskForm(false)}
        category={currentCategory}
      />
    </div>
  );
};