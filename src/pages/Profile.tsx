import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  Clock,
  Search,
  Filter,
  Upload,
  Share2,
  BarChart2,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Smartphone,
  Bell,
  Zap,
  CheckCircle,
  Star
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTasks } from '../hooks/useTasks';
import { format } from 'date-fns';
import { ProgressChart } from '../components/dashboard/ProgressChart';
import { BottomBar } from '../components/layout/BottomBar';

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
    profilePic: null as File | null,
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [showShareModal, setShowShareModal] = useState(false);
  const [showAchievements, setShowAchievements] = useState(true);
  const [showStats, setShowStats] = useState(true);

  const completionRate = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;
  const filteredTasks = tasks
    .filter(task => 
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (selectedFilter === 'all' || task.status === selectedFilter)
    )
    .slice(0, 5);
  const joinDate = new Date('2024-01-15'); // Mock join date

  const achievements = [
    {
      icon: Target,
      title: 'Task Master',
      description: 'Completed 100+ tasks',
      earned: stats.completed >= 100,
      color: 'blue',
      progress: Math.min(stats.completed / 100 * 100, 100)
    },
    {
      icon: TrendingUp,
      title: 'Productivity Pro',
      description: 'Maintained 80%+ completion rate',
      earned: completionRate >= 80,
      color: 'green',
      progress: Math.min(completionRate / 80 * 100, 100)
    },
    {
      icon: Clock,
      title: 'Early Bird',
      description: 'Completed tasks before deadline',
      earned: true,
      color: 'yellow',
      progress: 100
    },
    {
      icon: Award,
      title: 'Streak Champion',
      description: '30-day completion streak',
      earned: false,
      color: 'purple',
      progress: 70 // Mock progress
    },
    {
      icon: BarChart2,
      title: 'Category Conqueror',
      description: 'Mastered all categories',
      earned: false,
      color: 'indigo',
      progress: 85 // Mock
    },
    {
      icon: Share2,
      title: 'Collaborator',
      description: 'Shared 50 tasks',
      earned: false,
      color: 'pink',
      progress: 45 // Mock
    }
  ];

  const handleSaveProfile = () => {
    setIsEditing(false);
    // Here you would typically save to backend, including uploading profile pic if changed
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setProfileData(prev => ({ ...prev, profilePic: e.target.files[0] }));
    }
  };

  const handleShare = () => {
    // Mock share functionality
    navigator.clipboard.writeText(window.location.href);
    setShowShareModal(true);
    setTimeout(() => setShowShareModal(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 pb-20">
      {/* Profile Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-b-3xl p-5 text-white shadow-lg relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-32 h-32 bg-white/10 rounded-full -ml-16 -mt-16 blur-xl"></div>
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold">Profile</h1>
            <div className="flex items-center gap-2">
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleShare}
                className="p-2 bg-white/20 backdrop-blur-sm rounded-xl"
              >
                <Share2 size={18} />
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsEditing(!isEditing)}
                className="p-2 bg-white/20 backdrop-blur-sm rounded-xl"
              >
                <Edit3 size={18} />
              </motion.button>
            </div>
          </div>

          <div className="flex items-center gap-4 mb-4">
            {/* Avatar */}
            <div className="relative">
              <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-2xl font-bold shadow-lg overflow-hidden">
                {profileData.profilePic ? (
                  <img 
                    src={URL.createObjectURL(profileData.profilePic)} 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  userProfile?.name?.charAt(0).toUpperCase() || <User size={32} className="text-white/80" />
                )}
              </div>
              <label className="absolute bottom-0 right-0 w-8 h-8 bg-white text-gray-600 rounded-full flex items-center justify-center shadow-md cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <Camera size={16} />
              </label>
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold">
                  {isEditing ? (
                    <input
                      type="text"
                      value={profileData.name}
                      onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                      className="bg-white/20 backdrop-blur-sm border border-white/30 rounded px-2 py-1 text-white w-full"
                    />
                  ) : (
                    profileData.name
                  )}
                </h2>
                {userProfile?.isPremium && (
                  <Crown className="w-5 h-5 text-yellow-300" />
                )}
              </div>
              <p className="text-blue-100 text-sm">
                {userProfile?.email}
              </p>
            </div>
          </div>

          {/* Bio */}
          <div className="mb-4">
            {isEditing ? (
              <textarea
                value={profileData.bio}
                onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
                className="bg-white/20 backdrop-blur-sm border border-white/30 rounded px-3 py-2 text-white w-full h-20 resize-none text-sm"
                placeholder="Tell us about yourself..."
              />
            ) : (
              <p className="text-blue-100 text-sm">{profileData.bio}</p>
            )}
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 text-center">
              <div className="text-lg font-bold">{stats.total}</div>
              <div className="text-blue-100 text-xs">Total</div>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 text-center">
              <div className="text-lg font-bold">{stats.completed}</div>
              <div className="text-blue-100 text-xs">Completed</div>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 text-center">
              <div className="text-lg font-bold">{completionRate}%</div>
              <div className="text-blue-100 text-xs">Success</div>
            </div>
          </div>

          <AnimatePresence>
            {isEditing && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 pt-4 border-t border-white/20"
              >
                <div className="space-y-3">
                  <div>
                    <label className="block text-blue-100 text-xs mb-1">Location</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/60" />
                      <input
                        type="text"
                        value={profileData.location}
                        onChange={(e) => setProfileData(prev => ({ ...prev, location: e.target.value }))}
                        className="w-full pl-10 bg-white/20 backdrop-blur-sm border border-white/30 rounded px-3 py-2 text-white text-sm"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-blue-100 text-xs mb-1">Website</label>
                    <div className="relative">
                      <LinkIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/60" />
                      <input
                        type="url"
                        value={profileData.website}
                        onChange={(e) => setProfileData(prev => ({ ...prev, website: e.target.value }))}
                        className="w-full pl-10 bg-white/20 backdrop-blur-sm border border-white/30 rounded px-3 py-2 text-white text-sm"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-blue-100 text-xs mb-1">GitHub</label>
                      <div className="relative">
                        <Github className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/60" />
                        <input
                          type="text"
                          value={profileData.github}
                          onChange={(e) => setProfileData(prev => ({ ...prev, github: e.target.value }))}
                          className="w-full pl-10 bg-white/20 backdrop-blur-sm border border-white/30 rounded px-3 py-2 text-white text-sm"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-blue-100 text-xs mb-1">Twitter</label>
                      <div className="relative">
                        <Twitter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/60" />
                        <input
                          type="text"
                          value={profileData.twitter}
                          onChange={(e) => setProfileData(prev => ({ ...prev, twitter: e.target.value }))}
                          className="w-full pl-10 bg-white/20 backdrop-blur-sm border border-white/30 rounded px-3 py-2 text-white text-sm"
                        />
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end mt-4 gap-2">
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg transition-colors text-white text-sm"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={handleSaveProfile}
                    className="px-4 py-2 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-medium text-sm"
                  >
                    Save
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      <div className="p-4 space-y-4">
        {/* Recent Tasks */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-4"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Recent Tasks
            </h2>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search tasks..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm w-32"
                />
              </div>
              <select
                value={selectedFilter}
                onChange={(e) => setSelectedFilter(e.target.value)}
                className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              >
                <option value="all">All</option>
                <option value="todo">To Do</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>
          
          {filteredTasks.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-center py-6 text-sm">
              No tasks found.
            </p>
          ) : (
            <div className="space-y-3">
              <AnimatePresence>
                {filteredTasks.map((task) => (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg shadow-sm"
                  >
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 dark:text-white text-sm">
                        {task.title}
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {task.category.replace('-', ' ')} • {task.priority}
                      </p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      task.status === 'completed' 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300'
                        : task.status === 'in-progress'
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                    }`}>
                      {task.status.replace('-', ' ')}
                    </span>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </motion.div>

        {/* Stats Section */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-4"
        >
          <button 
            onClick={() => setShowStats(!showStats)}
            className="flex items-center justify-between w-full mb-3"
          >
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Statistics
            </h2>
            {showStats ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>

          <AnimatePresence>
            {showStats && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-600 dark:text-gray-300">Tasks Completed</span>
                      <span className="font-semibold text-gray-900 dark:text-white">{stats.completed}</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full"
                        style={{ width: `${(stats.completed / stats.total) * 100}%` }}
                      />
                    </div>
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
                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                    }`}>
                      {userProfile?.isPremium ? 'Premium' : 'Free'}
                    </span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Achievements Section */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-4"
        >
          <button 
            onClick={() => setShowAchievements(!showAchievements)}
            className="flex items-center justify-between w-full mb-3"
          >
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Achievements
            </h2>
            {showAchievements ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>

          <AnimatePresence>
            {showAchievements && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="grid grid-cols-2 gap-3">
                  {achievements.map((achievement, index) => (
                    <motion.div
                      key={achievement.title}
                      variants={itemVariants}
                      custom={index}
                      className={`p-3 rounded-xl border ${
                        achievement.earned
                          ? `border-${achievement.color}-200 bg-${achievement.color}-50/50 dark:bg-${achievement.color}-900/20`
                          : 'border-gray-200 bg-gray-50/50 dark:bg-gray-700/50 dark:border-gray-600'
                      }`}
                    >
                      <div className="flex items-start mb-2">
                        <achievement.icon 
                          className={`w-5 h-5 mr-2 ${
                            achievement.earned 
                              ? `text-${achievement.color}-600 dark:text-${achievement.color}-400`
                              : 'text-gray-400'
                          }`} 
                        />
                        <div className="flex-1">
                          <h3 className={`font-medium text-sm ${
                            achievement.earned 
                              ? 'text-gray-900 dark:text-white'
                              : 'text-gray-500 dark:text-gray-400'
                          }`}>
                            {achievement.title}
                          </h3>
                        </div>
                        {achievement.earned && (
                          <Award className={`w-4 h-4 text-${achievement.color}-600 dark:text-${achievement.color}-400`} />
                        )}
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${achievement.progress}%` }}
                          transition={{ duration: 1, ease: 'easeOut' }}
                          className={`h-1.5 ${
                            achievement.earned ? `bg-${achievement.color}-500` : 'bg-gray-400'
                          }`}
                        />
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Mobile Optimization Notice */}
        <motion.div 
          className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-4 flex items-start"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg mr-3">
            <Smartphone size={18} className="text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h4 className="text-blue-800 dark:text-blue-200 font-medium text-sm">Mobile Optimized</h4>
            <p className="text-blue-600 dark:text-blue-300 text-xs mt-1">
              Your profile is designed to look great on any device.
            </p>
          </div>
        </motion.div>
      </div>

      {/* Share Modal */}
      <AnimatePresence>
        {showShareModal && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg text-sm"
          >
            Profile link copied to clipboard!
          </motion.div>
        )}
      </AnimatePresence>
      <BottomBar />
    </div>
  );
};