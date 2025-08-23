import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, 
  Bell, 
  Shield, 
  Palette, 
  Download, 
  Trash2, 
  Save,
  Eye,
  EyeOff,
  Smartphone,
  Mail,
  Globe,
  Moon,
  Sun,
  Lock,
  Upload,
  Key,
  Smartphone as Mobile,
  LogOut,
  CreditCard,
  Palette as ThemeIcon,
  Globe as Language,
  Accessibility,
  ChevronLeft,
  Menu,
  X,
  Crown
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import toast from 'react-hot-toast';

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

export const Settings: React.FC = () => {
  const { userProfile, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  
  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setIsMobileSidebarOpen(false);
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Profile settings
  const [profileData, setProfileData] = useState({
    name: userProfile?.name || '',
    email: userProfile?.email || '',
    phone: userProfile?.phone || '',
    bio: '',
    avatar: null as File | null,
    language: 'en',
    timezone: 'UTC',
  });

  // Notification settings
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    pushNotifications: true,
    taskReminders: true,
    weeklyReports: false,
    marketingEmails: false,
    soundAlerts: true,
    vibration: false,
  });

  // Privacy settings
  const [privacy, setPrivacy] = useState({
    profileVisibility: 'private',
    dataSharing: false,
    analytics: true,
    twoFactor: false,
    password: '',
    confirmPassword: '',
    showPassword: false,
  });

  // Appearance settings
  const [appearance, setAppearance] = useState({
    fontSize: 'medium',
    colorScheme: 'default',
    reducedMotion: false,
    highContrast: false,
  });

  // Billing settings
  const [billing, setBilling] = useState({
    plan: 'free',
    cardLast4: '4242',
    nextBilling: '2024-09-01',
  });

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'privacy', label: 'Security', icon: Shield },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'billing', label: 'Billing', icon: CreditCard },
    { id: 'data', label: 'Data', icon: Download },
  ];

  const handleSaveProfile = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Profile updated successfully!');
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleExportData = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast.success('Data export started! You\'ll receive an email when ready.');
    } catch (error) {
      toast.error('Failed to export data');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      setLoading(true);
      try {
        await new Promise(resolve => setTimeout(resolve, 2000));
        toast.success('Account deletion initiated. You\'ll receive a confirmation email.');
      } catch (error) {
        toast.error('Failed to delete account');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleChangePassword = async () => {
    if (privacy.password !== privacy.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Password changed successfully!');
      setPrivacy(prev => ({ ...prev, password: '', confirmPassword: '' }));
    } catch (error) {
      toast.error('Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const handleToggle2FA = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success(`Two-factor authentication ${privacy.twoFactor ? 'disabled' : 'enabled'}!`);
      setPrivacy(prev => ({ ...prev, twoFactor: !prev.twoFactor }));
    } catch (error) {
      toast.error('Failed to update 2FA');
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setProfileData(prev => ({ ...prev, avatar: e.target.files[0] }));
    }
  };

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully!');
  };

  const handleUpgradePlan = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      setBilling(prev => ({ ...prev, plan: 'premium' }));
      toast.success('Plan upgraded to Premium!');
    } catch (error) {
      toast.error('Failed to upgrade plan');
    } finally {
      setLoading(false);
    }
  };

  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex flex-col items-center">
                <div className="relative group">
                  <motion.div 
                    className="w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden shadow-lg cursor-pointer"
                    whileHover={{ scale: 1.05 }}
                    onClick={handleAvatarClick}
                  >
                    {profileData.avatar ? (
                      <img 
                        src={URL.createObjectURL(profileData.avatar)} 
                        alt="Avatar" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl md:text-4xl font-bold">
                        {profileData.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </motion.div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleAvatarChange}
                    accept="image/*"
                    className="hidden"
                  />
                  <motion.div 
                    className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-full"
                    initial={false}
                  >
                    <Upload className="text-white" size={20} />
                  </motion.div>
                </div>
                <button 
                  onClick={handleAvatarClick}
                  className="mt-3 text-sm text-blue-600 dark:text-blue-400 font-medium"
                >
                  Change Photo
                </button>
              </div>
              
              <div className="flex-1 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={profileData.name}
                    onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={profileData.email}
                    onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={profileData.phone}
                    onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Bio
              </label>
              <textarea
                value={profileData.bio}
                onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Tell us about yourself..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Language
                </label>
                <select
                  value={profileData.language}
                  onChange={(e) => setProfileData(prev => ({ ...prev, language: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="en">English</option>
                  <option value="es">Español</option>
                  <option value="fr">Français</option>
                  <option value="de">Deutsch</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Timezone
                </label>
                <select
                  value={profileData.timezone}
                  onChange={(e) => setProfileData(prev => ({ ...prev, timezone: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="UTC">UTC</option>
                  <option value="PST">PST</option>
                  <option value="EST">EST</option>
                  <option value="CET">CET</option>
                </select>
              </div>
            </div>
            
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSaveProfile}
              disabled={loading}
              className="mt-4 flex items-center justify-center w-full md:w-auto px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-md"
            >
              <Save className="w-5 h-5 mr-2" />
              {loading ? 'Saving...' : 'Save Changes'}
            </motion.button>
          </div>
        );

      case 'notifications':
        return (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Mail size={20} />
                  Email Notifications
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-xl">
                    <span className="text-sm text-gray-600 dark:text-gray-300">Task Reminders</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notifications.taskReminders}
                        onChange={(e) => setNotifications(prev => ({ ...prev, taskReminders: e.target.checked }))}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-xl">
                    <span className="text-sm text-gray-600 dark:text-gray-300">Weekly Reports</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notifications.weeklyReports}
                        onChange={(e) => setNotifications(prev => ({ ...prev, weeklyReports: e.target.checked }))}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-xl">
                    <span className="text-sm text-gray-600 dark:text-gray-300">Marketing Emails</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notifications.marketingEmails}
                        onChange={(e) => setNotifications(prev => ({ ...prev, marketingEmails: e.target.checked }))}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Mobile size={20} />
                  Push Notifications
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-xl">
                    <span className="text-sm text-gray-600 dark:text-gray-300">Enable Push</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notifications.pushNotifications}
                        onChange={(e) => setNotifications(prev => ({ ...prev, pushNotifications: e.target.checked }))}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-xl">
                    <span className="text-sm text-gray-600 dark:text-gray-300">Sound Alerts</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notifications.soundAlerts}
                        onChange={(e) => setNotifications(prev => ({ ...prev, soundAlerts: e.target.checked }))}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-xl">
                    <span className="text-sm text-gray-600 dark:text-gray-300">Vibration</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notifications.vibration}
                        onChange={(e) => setNotifications(prev => ({ ...prev, vibration: e.target.checked }))}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>
              </div>
            </div>
            
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center justify-center w-full md:w-auto px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-md"
            >
              <Save className="w-5 h-5 mr-2" />
              Save Notification Settings
            </motion.button>
          </div>
        );

      case 'privacy':
        return (
          <div className="space-y-8">
            <div>
              <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Lock size={20} />
                Security
              </h3>
              
              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      Two-Factor Authentication
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      Add an extra layer of security to your account
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={privacy.twoFactor}
                      onChange={handleToggle2FA}
                      className="sr-only peer"
                      disabled={loading}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                  </label>
                </div>
                
                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Change Password
                  </label>
                  <div className="space-y-3">
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type={privacy.showPassword ? 'text' : 'password'}
                        value={privacy.password}
                        onChange={(e) => setPrivacy(prev => ({ ...prev, password: e.target.value }))}
                        placeholder="New password"
                        className="w-full pl-10 pr-10 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                      <button
                        type="button"
                        onClick={() => setPrivacy(prev => ({ ...prev, showPassword: !prev.showPassword }))}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {privacy.showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                    
                    <input
                      type={privacy.showPassword ? 'text' : 'password'}
                      value={privacy.confirmPassword}
                      onChange={(e) => setPrivacy(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      placeholder="Confirm new password"
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                    
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleChangePassword}
                      disabled={loading || !privacy.password || privacy.password !== privacy.confirmPassword}
                      className="w-full flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <Key className="w-4 h-4 mr-2" />
                      {loading ? 'Changing...' : 'Change Password'}
                    </motion.button>
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Shield size={20} />
                Privacy
              </h3>
              
              <div className="space-y-6">
                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Profile Visibility
                  </label>
                  <select
                    value={privacy.profileVisibility}
                    onChange={(e) => setPrivacy(prev => ({ ...prev, profileVisibility: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="private">Private</option>
                    <option value="public">Public</option>
                    <option value="friends">Friends Only</option>
                  </select>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      Data Sharing
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      Allow anonymous usage data to improve the service
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={privacy.dataSharing}
                      onChange={(e) => setPrivacy(prev => ({ ...prev, dataSharing: e.target.checked }))}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                  </label>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      Analytics Tracking
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      Help us understand how you use the app
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={privacy.analytics}
                      onChange={(e) => setPrivacy(prev => ({ ...prev, analytics: e.target.checked }))}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                    </label>
                </div>
              </div>
            </div>
          </div>
        );

      case 'appearance':
        return (
          <div className="space-y-8">
            <div>
              <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <ThemeIcon size={20} />
                Theme
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => theme === 'dark' && toggleTheme()}
                  className={`p-4 md:p-6 border-2 rounded-xl flex flex-col items-center justify-center ${
                    theme === 'light' 
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                      : 'border-gray-300 dark:border-gray-600'
                  } shadow-sm`}
                >
                  <Sun className="w-6 h-6 md:w-8 md:h-8 mb-2" />
                  <span className="font-medium text-sm md:text-base">Light Mode</span>
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => theme === 'light' && toggleTheme()}
                  className={`p-4 md:p-6 border-2 rounded-xl flex flex-col items-center justify-center ${
                    theme === 'dark' 
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                      : 'border-gray-300 dark:border-gray-600'
                  } shadow-sm`}
                >
                  <Moon className="w-6 h-6 md:w-8 md:h-8 mb-2" />
                  <span className="font-medium text-sm md:text-base">Dark Mode</span>
                </motion.button>
              </div>
            </div>
            
            {userProfile?.isPremium && (
              <div>
                <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Crown size={20} className="text-yellow-500" />
                  Premium Color Schemes
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {['Default', 'Ocean', 'Forest', 'Sunset', 'Midnight', 'Rose', 'Mint'].map((scheme) => (
                    <motion.button
                      key={scheme}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`p-3 border-2 rounded-xl text-center ${
                        appearance.colorScheme === scheme.toLowerCase()
                          ? 'border-blue-500' 
                          : 'border-gray-300 dark:border-gray-600'
                      } shadow-sm`}
                      onClick={() => setAppearance(prev => ({ ...prev, colorScheme: scheme.toLowerCase() }))}
                    >
                      <div className={`w-full h-12 rounded mb-2 bg-gradient-to-r ${
                        scheme === 'Ocean' ? 'from-blue-400 to-blue-600' :
                        scheme === 'Forest' ? 'from-green-400 to-green-600' :
                        scheme === 'Sunset' ? 'from-orange-400 to-red-500' :
                        scheme === 'Midnight' ? 'from-gray-800 to-black' :
                        scheme === 'Rose' ? 'from-pink-400 to-rose-500' :
                        scheme === 'Mint' ? 'from-emerald-400 to-teal-500' :
                        'from-gray-400 to-gray-600'
                      }`} />
                      <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                        {scheme}
                      </span>
                    </motion.button>
                  ))}
                </div>
              </div>
            )}
            
            <div>
              <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Accessibility size={20} />
                Accessibility
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      Reduced Motion
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      Reduce animations for motion sensitivity
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={appearance.reducedMotion}
                      onChange={(e) => setAppearance(prev => ({ ...prev, reducedMotion: e.target.checked }))}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                  </label>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      High Contrast Mode
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      Increase color contrast for better readability
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={appearance.highContrast}
                      onChange={(e) => setAppearance(prev => ({ ...prev, highContrast: e.target.checked }))}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                  </label>
                </div>
                
                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Font Size
                  </label>
                  <select
                    value={appearance.fontSize}
                    onChange={(e) => setAppearance(prev => ({ ...prev, fontSize: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="small">Small</option>
                    <option value="medium">Medium</option>
                    <option value="large">Large</option>
                  </select>
                </div>
              </div>
            </div>
            
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center justify-center w-full md:w-auto px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-md"
            >
              <Save className="w-5 h-5 mr-2" />
              Save Appearance Settings
            </motion.button>
          </div>
        );

      case 'billing':
        return (
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <CreditCard size={20} />
                Current Plan
              </h3>
              <div className="flex items-center justify-between mb-4">
                <span className="text-2xl font-bold capitalize">{billing.plan}</span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  billing.plan === 'premium' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                }`}>
                  Active
                </span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Next billing date: {billing.nextBilling}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Card ending in {billing.cardLast4}
              </p>
            </div>
            
            {billing.plan !== 'premium' && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleUpgradePlan}
                disabled={loading}
                className="w-full flex items-center justify-center px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-xl hover:from-yellow-600 hover:to-orange-600 disabled:opacity-50 transition-colors shadow-md"
              >
                <Crown className="w-5 h-5 mr-2 text-white" />
                {loading ? 'Upgrading...' : 'Upgrade to Premium'}
              </motion.button>
            )}
            
            <div className="space-y-4">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white">Billing History</h3>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 text-center text-gray-500 dark:text-gray-400">
                No billing history yet
              </div>
            </div>
          </div>
        );

      case 'data':
        return (
          <div className="space-y-6">
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6">
              <div className="flex items-start mb-4">
                <Download className="w-6 h-6 text-blue-600 dark:text-blue-400 mr-3 mt-1" />
                <div className="flex-1">
                  <h4 className="text-base font-medium text-blue-900 dark:text-blue-100 mb-1">
                    Export Your Data
                  </h4>
                  <p className="text-sm text-blue-700 dark:text-blue-300 mb-4">
                    Download all your tasks, settings, and account data in JSON or CSV format.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleExportData}
                      disabled={loading}
                      className="flex-1 flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-colors"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      {loading ? 'Exporting...' : 'Export JSON'}
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleExportData}
                      disabled={loading}
                      className="flex-1 flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-colors"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      {loading ? 'Exporting...' : 'Export CSV'}
                    </motion.button>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-6">
              <div className="flex items-start mb-4">
                <Upload className="w-6 h-6 text-green-600 dark:text-green-400 mr-3 mt-1" />
                <div className="flex-1">
                  <h4 className="text-base font-medium text-green-900 dark:text-green-100 mb-1">
                    Import Data
                  </h4>
                  <p className="text-sm text-green-700 dark:text-green-300 mb-4">
                    Upload your tasks from JSON or CSV file.
                  </p>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full flex items-center justify-center px-4 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Import Data
                  </motion.button>
                </div>
              </div>
            </div>
            
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6">
              <div className="flex items-start mb-4">
                <Trash2 className="w-6 h-6 text-red-600 dark:text-red-400 mr-3 mt-1" />
                <div className="flex-1">
                  <h4 className="text-base font-medium text-red-900 dark:text-red-100 mb-1">
                    Delete Account
                  </h4>
                  <p className="text-sm text-red-700 dark:text-red-300 mb-4">
                    Permanently delete your account and all associated data. This action cannot be undone.
                  </p>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleDeleteAccount}
                    disabled={loading}
                    className="w-full flex items-center justify-center px-4 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 disabled:opacity-50 transition-colors"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    {loading ? 'Processing...' : 'Delete Account'}
                  </motion.button>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Mobile Header */}
      {isMobile && (
        <div className="sticky top-0 z-10 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 flex items-center justify-between">
          <button 
            onClick={toggleMobileSidebar}
            className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700"
          >
            {isMobileSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            Settings
          </h1>
          
          <button 
            onClick={handleLogout}
            className="p-2 rounded-lg text-red-600 dark:text-red-400"
          >
            <LogOut size={20} />
          </button>
        </div>
      )}

      <div className="p-4 sm:p-6 space-y-6">
        {/* Desktop Header */}
        {!isMobile && (
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white tracking-tight">
              Settings
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 mt-2">
              Manage your account preferences and application settings.
            </p>
          </motion.div>
        )}

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Mobile Sidebar Overlay */}
          {isMobile && isMobileSidebarOpen && (
            <div 
              className="fixed inset-0 bg-black bg-opacity-50 z-20"
              onClick={() => setIsMobileSidebarOpen(false)}
            />
          )}

          {/* Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className={`lg:w-64 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-4 lg:sticky lg:top-4 h-fit ${
              isMobile 
                ? `fixed top-0 left-0 h-full w-64 z-30 transform transition-transform duration-300 ${
                    isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
                  }`
                : ''
            }`}
          >
            {isMobile && (
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Settings</h2>
                <button onClick={() => setIsMobileSidebarOpen(false)}>
                  <X size={24} />
                </button>
              </div>
            )}
            
            <nav className="space-y-1">
              {tabs.map((tab) => (
                <motion.button
                  key={tab.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setActiveTab(tab.id);
                    if (isMobile) setIsMobileSidebarOpen(false);
                  }}
                  className={`w-full flex items-center px-4 py-3 rounded-xl text-base font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-200 shadow-sm'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <tab.icon size={20} className="mr-3" />
                  {tab.label}
                </motion.button>
              ))}
            </nav>
            
            {!isMobile && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleLogout}
                className="w-full flex items-center px-4 py-3 rounded-xl text-base font-medium text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors mt-6"
              >
                <LogOut size={20} className="mr-3" />
                Log Out
              </motion.button>
            )}
          </motion.div>

          {/* Content */}
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="flex-1 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6"
          >
            {/* Mobile Tab Header */}
            {isMobile && (
              <div className="flex items-center mb-6">
                <button 
                  onClick={() => setIsMobileSidebarOpen(true)}
                  className="p-2 mr-3 rounded-lg bg-gray-100 dark:bg-gray-700"
                >
                  <Menu size={20} />
                </button>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {tabs.find(tab => tab.id === activeTab)?.label}
                </h2>
              </div>
            )}
            
            {renderTabContent()}
          </motion.div>
        </div>
      </div>
    </div>
  );
};