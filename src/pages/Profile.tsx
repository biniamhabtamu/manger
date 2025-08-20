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
  BarChart2
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTasks } from '../hooks/useTasks';
import { format } from 'date-fns';
import { ProgressChart } from '../components/dashboard/ProgressChart'; // Assuming this component exists
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
    <div className="p-4 sm:p-6 md:p-8 space-y-6 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 min-h-screen">
      {/* Profile Header */}
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -mr-24 -mt-24 blur-xl"></div>
        <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-6">
          {/* Avatar */}
          <div className="relative group">
            <div className="w-32 h-32 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-4xl font-bold shadow-lg overflow-hidden">
              {profileData.profilePic ? (
                <img 
                  src={URL.createObjectURL(profileData.profilePic)} 
                  alt="Profile" 
                  className="w-full h-full object-cover"
                />
              ) : (
                userProfile?.name?.charAt(0).toUpperCase() || <User size={48} className="text-white/80" />
              )}
            </div>
            <label className="absolute bottom-0 right-0 w-10 h-10 bg-white text-gray-600 rounded-full flex items-center justify-center shadow-md cursor-pointer transition-all group-hover:scale-110 group-hover:bg-gray-50">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              <Upload size={20} />
            </label>
          </div>

          {/* Profile Info */}
          <div className="flex-1 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
              <h1 className="text-3xl md:text-4xl font-bold">
                {isEditing ? (
                  <input
                    type="text"
                    value={profileData.name}
                    onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                    className="bg-white/20 backdrop-blur-sm border border-white/30 rounded px-3 py-1 text-white placeholder-blue-200"
                  />
                ) : (
                  profileData.name
                )}
              </h1>
              {userProfile?.isPremium && (
                <Crown className="w-6 h-6 text-yellow-300" />
              )}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsEditing(!isEditing)}
                className="p-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg transition-colors shadow-sm"
              >
                <Edit3 size={18} />
              </motion.button>
            </div>
            
            <p className="text-blue-100 mb-4 max-w-xl mx-auto md:mx-0">
              {isEditing ? (
                <textarea
                  value={profileData.bio}
                  onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
                  className="bg-white/20 backdrop-blur-sm border border-white/30 rounded px-3 py-2 text-white placeholder-blue-200 w-full h-24 resize-none"
                  placeholder="Tell us about yourself..."
                />
              ) : (
                profileData.bio
              )}
            </p>

            <div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm">
              <div className="flex items-center">
                <Mail className="w-5 h-5 text-white/80 mr-2" />
                {userProfile?.email}
              </div>
              {userProfile?.phone && (
                <div className="flex items-center">
                  <Phone className="w-5 h-5 text-white/80 mr-2" />
                  {userProfile.phone}
                </div>
              )}
              <div className="flex items-center">
                <Calendar className="w-5 h-5 text-white/80 mr-2" />
                Joined {format(joinDate, 'MMMM yyyy')}
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-3 md:gap-4 w-full md:w-auto">
            <div className="bg-white/10 backdrop-blur-md rounded-lg p-3 md:p-4 text-center shadow-inner">
              <div className="text-2xl md:text-3xl font-bold">{stats.total}</div>
              <div className="text-blue-100 text-sm">Total Tasks</div>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-lg p-3 md:p-4 text-center shadow-inner">
              <div className="text-2xl md:text-3xl font-bold">{stats.completed}</div>
              <div className="text-blue-100 text-sm">Completed</div>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-lg p-3 md:p-4 text-center shadow-inner">
              <div className="text-2xl md:text-3xl font-bold">{completionRate}%</div>
              <div className="text-blue-100 text-sm">Success Rate</div>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {isEditing && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-6 pt-6 border-t border-white/20 relative z-10"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-blue-100 text-sm mb-1">Location</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/60" />
                    <input
                      type="text"
                      value={profileData.location}
                      onChange={(e) => setProfileData(prev => ({ ...prev, location: e.target.value }))}
                      className="w-full pl-10 bg-white/20 backdrop-blur-sm border border-white/30 rounded px-3 py-2 text-white placeholder-blue-200"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-blue-100 text-sm mb-1">Website</label>
                  <div className="relative">
                    <LinkIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/60" />
                    <input
                      type="url"
                      value={profileData.website}
                      onChange={(e) => setProfileData(prev => ({ ...prev, website: e.target.value }))}
                      className="w-full pl-10 bg-white/20 backdrop-blur-sm border border-white/30 rounded px-3 py-2 text-white placeholder-blue-200"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-blue-100 text-sm mb-1">GitHub</label>
                  <div className="relative">
                    <Github className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/60" />
                    <input
                      type="text"
                      value={profileData.github}
                      onChange={(e) => setProfileData(prev => ({ ...prev, github: e.target.value }))}
                      className="w-full pl-10 bg-white/20 backdrop-blur-sm border border-white/30 rounded px-3 py-2 text-white placeholder-blue-200"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-blue-100 text-sm mb-1">Twitter</label>
                  <div className="relative">
                    <Twitter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/60" />
                    <input
                      type="text"
                      value={profileData.twitter}
                      onChange={(e) => setProfileData(prev => ({ ...prev, twitter: e.target.value }))}
                      className="w-full pl-10 bg-white/20 backdrop-blur-sm border border-white/30 rounded px-3 py-2 text-white placeholder-blue-200"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-blue-100 text-sm mb-1">LinkedIn</label>
                  <div className="relative">
                    <Linkedin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/60" />
                    <input
                      type="text"
                      value={profileData.linkedin}
                      onChange={(e) => setProfileData(prev => ({ ...prev, linkedin: e.target.value }))}
                      className="w-full pl-10 bg-white/20 backdrop-blur-sm border border-white/30 rounded px-3 py-2 text-white placeholder-blue-200"
                    />
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end mt-6 gap-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsEditing(false)}
                  className="px-6 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg transition-colors text-white font-medium"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSaveProfile}
                  className="px-6 py-2 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-medium shadow-md"
                >
                  Save Changes
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Recent Activity */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6"
          >
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                Recent Tasks
              </h2>
              <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search tasks..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                  />
                </div>
                <select
                  value={selectedFilter}
                  onChange={(e) => setSelectedFilter(e.target.value)}
                  className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-auto"
                >
                  <option value="all">All Status</option>
                  <option value="todo">To Do</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </div>
            
            {filteredTasks.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-center py-12">
                No tasks found. Create your first task to get started!
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
                      className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900 dark:text-white">
                          {task.title}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {task.category.replace('-', ' ')} • {task.priority} priority
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
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

          {/* Task Statistics Chart */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6"
          >
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
              Task Statistics
            </h2>
            <ProgressChart stats={stats} type="bar" />
          </motion.div>

          {/* Achievements */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6"
          >
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
              Achievements
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {achievements.map((achievement, index) => (
                <motion.div
                  key={achievement.title}
                  variants={itemVariants}
                  custom={index}
                  className={`p-4 rounded-xl border-2 shadow-sm ${
                    achievement.earned
                      ? `border-${achievement.color}-200 bg-${achievement.color}-50/50 dark:bg-${achievement.color}-900/20`
                      : 'border-gray-200 bg-gray-50/50 dark:bg-gray-700/50 dark:border-gray-600'
                  }`}
                >
                  <div className="flex items-start mb-3">
                    <achievement.icon 
                      className={`w-8 h-8 mr-3 ${
                        achievement.earned 
                          ? `text-${achievement.color}-600 dark:text-${achievement.color}-400`
                          : 'text-gray-400'
                      }`} 
                    />
                    <div className="flex-1">
                      <h3 className={`font-medium text-lg ${
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
                      <Award className={`w-6 h-6 text-${achievement.color}-600 dark:text-${achievement.color}-400`} />
                    )}
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${achievement.progress}%` }}
                      transition={{ duration: 1, ease: 'easeOut' }}
                      className={`h-2 ${
                        achievement.earned ? `bg-${achievement.color}-500` : 'bg-gray-400'
                      }`}
                    />
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
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6 sticky top-4"
          >
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Contact & Social
            </h2>
            
            <div className="space-y-4">
              <div className="flex items-center">
                <MapPin className="w-5 h-5 text-gray-400 mr-3" />
                <span className="text-base text-gray-600 dark:text-gray-300">
                  {isEditing ? (
                    <input
                      type="text"
                      value={profileData.location}
                      onChange={(e) => setProfileData(prev => ({ ...prev, location: e.target.value }))}
                      className="bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded px-2 py-1 w-full"
                    />
                  ) : (
                    profileData.location
                  )}
                </span>
              </div>
              
              <div className="flex items-center">
                <LinkIcon className="w-5 h-5 text-gray-400 mr-3" />
                <a 
                  href={profileData.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-base text-blue-600 dark:text-blue-400 hover:underline"
                >
                  {profileData.website}
                </a>
              </div>
              
              <div className="flex items-center">
                <Github className="w-5 h-5 text-gray-400 mr-3" />
                <span className="text-base text-gray-600 dark:text-gray-300">
                  @{profileData.github}
                </span>
              </div>
              
              <div className="flex items-center">
                <Twitter className="w-5 h-5 text-gray-400 mr-3" />
                <span className="text-base text-gray-600 dark:text-gray-300">
                  @{profileData.twitter}
                </span>
              </div>
              
              <div className="flex items-center">
                <Linkedin className="w-5 h-5 text-gray-400 mr-3" />
                <span className="text-base text-gray-600 dark:text-gray-300">
                  @{profileData.linkedin}
                </span>
              </div>
            </div>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleShare}
              className="w-full mt-6 bg-white/20 text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2 hover:bg-white/30 transition-colors"
            >
              <Share2 size={20} />
              Share Profile
            </motion.button>
          </motion.div>

          {/* Stats Summary */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6"
          >
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Statistics
            </h2>
            
            <div className="space-y-6">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-base text-gray-600 dark:text-gray-300">Tasks Completed</span>
                  <span className="font-semibold text-gray-900 dark:text-white text-lg">{stats.completed}</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full"
                    style={{ width: `${(stats.completed / stats.total) * 100}%` }}
                  />
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-base text-gray-600 dark:text-gray-300">In Progress</span>
                <span className="font-semibold text-gray-900 dark:text-white text-lg">{stats.inProgress}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-base text-gray-600 dark:text-gray-300">Success Rate</span>
                <span className="font-semibold text-green-600 dark:text-green-400 text-lg">{completionRate}%</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-base text-gray-600 dark:text-gray-300">Account Type</span>
                <span className={`px-3 py-1 rounded text-sm font-medium ${
                  userProfile?.isPremium 
                    ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300'
                    : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                }`}>
                  {userProfile?.isPremium ? 'Premium' : 'Free'}
                </span>
              </div>
              {!userProfile?.isPremium && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full bg-blue-500 text-white py-3 rounded-lg font-semibold hover:bg-blue-600 transition-colors"
                >
                  Upgrade to Premium
                </motion.button>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Share Modal */}
      <AnimatePresence>
        {showShareModal && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed bottom-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg"
          >
            Profile link copied to clipboard!
          </motion.div>
        )}
      </AnimatePresence>
      <BottomBar />
    </div>
  );
};