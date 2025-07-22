import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  Crown, 
  Edit3, 
  Camera,
  MapPin,
  Link as LinkIcon,
  Github,
  Twitter,
  Linkedin,
  Award,
  Target,
  TrendingUp,
  Clock
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTasks } from '../hooks/useTasks';
import { format } from 'date-fns';

export const Profile: React.FC = () => {
  const { userProfile } = useAuth();
  const { tasks, stats } = useTasks();
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    name: userProfile?.name || '',
    bio: 'Passionate developer focused on productivity and personal growth.',
    location: 'San Francisco, CA',
    website: 'https://example.com',
    github: 'username',
    twitter: 'username',
    linkedin: 'username',
  });

  const completionRate = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;
  const recentTasks = tasks.slice(0, 5);
  const joinDate = new Date('2024-01-15'); // Mock join date

  const achievements = [
    {
      icon: Target,
      title: 'Task Master',
      description: 'Completed 100+ tasks',
      earned: stats.completed >= 100,
      color: 'blue'
    },
    {
      icon: TrendingUp,
      title: 'Productivity Pro',
      description: 'Maintained 80%+ completion rate',
      earned: completionRate >= 80,
      color: 'green'
    },
    {
      icon: Clock,
      title: 'Early Bird',
      description: 'Completed tasks before deadline',
      earned: true,
      color: 'yellow'
    },
    {
      icon: Award,
      title: 'Streak Champion',
      description: '30-day completion streak',
      earned: false,
      color: 'purple'
    }
  ];

  const handleSaveProfile = () => {
    setIsEditing(false);
    // Here you would typically save to backend
  };

  return (
    <div className="p-6 space-y-6">
      {/* Profile Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-8 text-white"
      >
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
          {/* Avatar */}
          <div className="relative">
            <div className="w-24 h-24 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-3xl font-bold">
              {userProfile?.name?.charAt(0).toUpperCase() || <User size={32} />}
            </div>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="absolute -bottom-2 -right-2 w-8 h-8 bg-white text-gray-600 rounded-full flex items-center justify-center shadow-lg hover:bg-gray-50 transition-colors"
            >
              <Camera size={16} />
            </motion.button>
          </div>

          {/* Profile Info */}
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold">
                {userProfile?.name}
              </h1>
              {userProfile?.isPremium && (
                <Crown className="w-6 h-6 text-yellow-300" />
              )}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsEditing(!isEditing)}
                className="p-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg transition-colors"
              >
                <Edit3 size={16} />
              </motion.button>
            </div>
            
            <p className="text-blue-100 mb-4">
              {isEditing ? (
                <input
                  type="text"
                  value={profileData.bio}
                  onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
                  className="bg-white/20 backdrop-blur-sm border border-white/30 rounded px-3 py-1 text-white placeholder-blue-200 w-full"
                  placeholder="Tell us about yourself..."
                />
              ) : (
                profileData.bio
              )}
            </p>

            <div className="flex flex-wrap gap-4 text-sm">
              <div className="flex items-center">
                <Mail className="w-4 h-4 mr-2" />
                {userProfile?.email}
              </div>
              {userProfile?.phone && (
                <div className="flex items-center">
                  <Phone className="w-4 h-4 mr-2" />
                  {userProfile.phone}
                </div>
              )}
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-2" />
                Joined {format(joinDate, 'MMMM yyyy')}
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
              <div className="text-2xl font-bold">{stats.total}</div>
              <div className="text-blue-100 text-sm">Total Tasks</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
              <div className="text-2xl font-bold">{stats.completed}</div>
              <div className="text-blue-100 text-sm">Completed</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
              <div className="text-2xl font-bold">{completionRate}%</div>
              <div className="text-blue-100 text-sm">Success Rate</div>
            </div>
          </div>
        </div>

        {isEditing && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-6 pt-6 border-t border-white/20"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-blue-100 text-sm mb-1">Location</label>
                <input
                  type="text"
                  value={profileData.location}
                  onChange={(e) => setProfileData(prev => ({ ...prev, location: e.target.value }))}
                  className="w-full bg-white/20 backdrop-blur-sm border border-white/30 rounded px-3 py-2 text-white placeholder-blue-200"
                />
              </div>
              <div>
                <label className="block text-blue-100 text-sm mb-1">Website</label>
                <input
                  type="url"
                  value={profileData.website}
                  onChange={(e) => setProfileData(prev => ({ ...prev, website: e.target.value }))}
                  className="w-full bg-white/20 backdrop-blur-sm border border-white/30 rounded px-3 py-2 text-white placeholder-blue-200"
                />
              </div>
            </div>
            
            <div className="flex justify-end mt-4 gap-2">
              <button
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveProfile}
                className="px-4 py-2 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-medium"
              >
                Save Changes
              </button>
            </div>
          </motion.div>
        )}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6"
          >
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Recent Tasks
            </h2>
            
            {recentTasks.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                No tasks yet. Create your first task to get started!
              </p>
            ) : (
              <div className="space-y-3">
                {recentTasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                  >
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 dark:text-white">
                        {task.title}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {task.category.replace('-', ' ')} • {task.priority} priority
                      </p>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      task.status === 'completed' 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                        : task.status === 'in-progress'
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                    }`}>
                      {task.status.replace('-', ' ')}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </motion.div>

          {/* Achievements */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6"
          >
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Achievements
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {achievements.map((achievement, index) => (
                <motion.div
                  key={achievement.title}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  className={`p-4 rounded-lg border-2 ${
                    achievement.earned
                      ? `border-${achievement.color}-200 bg-${achievement.color}-50 dark:bg-${achievement.color}-900/20`
                      : 'border-gray-200 bg-gray-50 dark:bg-gray-700 dark:border-gray-600'
                  }`}
                >
                  <div className="flex items-start">
                    <achievement.icon 
                      className={`w-8 h-8 mr-3 ${
                        achievement.earned 
                          ? `text-${achievement.color}-600 dark:text-${achievement.color}-400`
                          : 'text-gray-400'
                      }`} 
                    />
                    <div className="flex-1">
                      <h3 className={`font-medium ${
                        achievement.earned 
                          ? 'text-gray-900 dark:text-white'
                          : 'text-gray-500 dark:text-gray-400'
                      }`}>
                        {achievement.title}
                      </h3>
                      <p className={`text-sm ${
                        achievement.earned 
                          ? 'text-gray-600 dark:text-gray-300'
                          : 'text-gray-400 dark:text-gray-500'
                      }`}>
                        {achievement.description}
                      </p>
                    </div>
                    {achievement.earned && (
                      <Award className={`w-5 h-5 text-${achievement.color}-600 dark:text-${achievement.color}-400`} />
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6"
          >
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Contact & Social
            </h2>
            
            <div className="space-y-3">
              <div className="flex items-center">
                <MapPin className="w-4 h-4 text-gray-400 mr-3" />
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  {profileData.location}
                </span>
              </div>
              
              <div className="flex items-center">
                <LinkIcon className="w-4 h-4 text-gray-400 mr-3" />
                <a 
                  href={profileData.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                >
                  {profileData.website}
                </a>
              </div>
              
              <div className="flex items-center">
                <Github className="w-4 h-4 text-gray-400 mr-3" />
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  @{profileData.github}
                </span>
              </div>
              
              <div className="flex items-center">
                <Twitter className="w-4 h-4 text-gray-400 mr-3" />
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  @{profileData.twitter}
                </span>
              </div>
              
              <div className="flex items-center">
                <Linkedin className="w-4 h-4 text-gray-400 mr-3" />
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  @{profileData.linkedin}
                </span>
              </div>
            </div>
          </motion.div>

          {/* Stats Summary */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6"
          >
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Statistics
            </h2>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-300">Tasks Completed</span>
                <span className="font-semibold text-gray-900 dark:text-white">{stats.completed}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-300">In Progress</span>
                <span className="font-semibold text-gray-900 dark:text-white">{stats.inProgress}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-300">Success Rate</span>
                <span className="font-semibold text-green-600 dark:text-green-400">{completionRate}%</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-300">Account Type</span>
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  userProfile?.isPremium 
                    ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                    : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                }`}>
                  {userProfile?.isPremium ? 'Premium' : 'Free'}
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};