import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Crown, 
  Check, 
  Star, 
  Zap, 
  Shield, 
  BarChart3, 
  Calendar, 
  Users,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

const features = [
  {
    icon: Zap,
    title: 'Unlimited Tasks',
    description: 'Create unlimited tasks across all categories without restrictions',
    free: '50 tasks',
    premium: 'Unlimited'
  },
  {
    icon: BarChart3,
    title: 'Advanced Analytics',
    description: 'Detailed insights, productivity trends, and performance metrics',
    free: 'Basic stats',
    premium: 'Full analytics'
  },
  {
    icon: Calendar,
    title: 'Smart Scheduling',
    description: 'AI-powered task scheduling and deadline optimization',
    free: false,
    premium: true
  },
  {
    icon: Users,
    title: 'Team Collaboration',
    description: 'Share tasks, collaborate with team members, and track progress together',
    free: false,
    premium: true
  },
  {
    icon: Shield,
    title: 'Priority Support',
    description: '24/7 premium support with faster response times',
    free: 'Community support',
    premium: 'Priority support'
  },
  {
    icon: Sparkles,
    title: 'Custom Themes',
    description: 'Personalize your workspace with premium themes and customizations',
    free: '2 themes',
    premium: '20+ themes'
  }
];

const plans = [
  {
    name: 'Free',
    price: 0,
    period: 'forever',
    description: 'Perfect for personal use',
    features: [
      '50 tasks maximum',
      'Basic task management',
      'Standard themes',
      'Community support',
      'Basic analytics'
    ],
    buttonText: 'Current Plan',
    popular: false
  },
  {
    name: 'Premium',
    price: 9.99,
    period: 'month',
    description: 'For power users and teams',
    features: [
      'Unlimited tasks',
      'Advanced analytics',
      'Smart scheduling',
      'Team collaboration',
      'Priority support',
      'Custom themes',
      'Export capabilities',
      'Advanced filters'
    ],
    buttonText: 'Upgrade Now',
    popular: true
  },
  {
    name: 'Premium Annual',
    price: 99.99,
    period: 'year',
    originalPrice: 119.88,
    description: 'Best value - 2 months free!',
    features: [
      'Everything in Premium',
      '2 months free',
      'Annual planning tools',
      'Exclusive features',
      'Early access to new features'
    ],
    buttonText: 'Get Annual',
    popular: false
  }
];

export const Premium: React.FC = () => {
  const { userProfile } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleUpgrade = async (planName: string) => {
    setLoading(true);
    setSelectedPlan(planName);
    
    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast.success(`Successfully upgraded to ${planName}!`);
    } catch (error) {
      toast.error('Payment failed. Please try again.');
    } finally {
      setLoading(false);
      setSelectedPlan(null);
    }
  };

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <div className="flex items-center justify-center mb-4">
          <Crown className="w-12 h-12 text-yellow-500 mr-3" />
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
            TaskManager Premium
          </h1>
        </div>
        <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Unlock the full potential of your productivity with advanced features and unlimited possibilities.
        </p>
      </motion.div>

      {/* Current Status */}
      {userProfile?.isPremium && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-xl p-6 text-white text-center"
        >
          <Crown className="w-16 h-16 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">You're a Premium User!</h2>
          <p className="text-yellow-100">
            Thank you for supporting TaskManager. Enjoy all premium features!
          </p>
        </motion.div>
      )}

      {/* Feature Comparison */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden"
      >
        <div className="p-6 border-b border-gray-100 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center">
            Compare Features
          </h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Feature
                </th>
                <th className="px-6 py-4 text-center text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Free
                </th>
                <th className="px-6 py-4 text-center text-sm font-medium text-yellow-600 dark:text-yellow-400 uppercase tracking-wider">
                  Premium
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {features.map((feature, index) => (
                <motion.tr
                  key={feature.title}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700/50"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <feature.icon className="w-5 h-5 text-gray-400 mr-3" />
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {feature.title}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {feature.description}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    {feature.free === false ? (
                      <span className="text-red-500">✗</span>
                    ) : feature.free === true ? (
                      <Check className="w-5 h-5 text-green-500 mx-auto" />
                    ) : (
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {feature.free}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-center">
                    {feature.premium === true ? (
                      <Check className="w-5 h-5 text-yellow-500 mx-auto" />
                    ) : (
                      <span className="text-sm font-medium text-yellow-600 dark:text-yellow-400">
                        {feature.premium}
                      </span>
                    )}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Pricing Plans */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        {plans.map((plan, index) => (
          <motion.div
            key={plan.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + index * 0.1 }}
            className={`relative bg-white dark:bg-gray-800 rounded-xl shadow-sm border-2 p-6 ${
              plan.popular 
                ? 'border-yellow-400 ring-2 ring-yellow-400/20' 
                : 'border-gray-100 dark:border-gray-700'
            }`}
          >
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-4 py-1 rounded-full text-sm font-medium flex items-center">
                  <Star className="w-4 h-4 mr-1" />
                  Most Popular
                </span>
              </div>
            )}

            <div className="text-center">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                {plan.name}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {plan.description}
              </p>
              
              <div className="mb-6">
                <div className="flex items-center justify-center">
                  <span className="text-4xl font-bold text-gray-900 dark:text-white">
                    ${plan.price}
                  </span>
                  <span className="text-gray-600 dark:text-gray-400 ml-2">
                    /{plan.period}
                  </span>
                </div>
                {plan.originalPrice && (
                  <div className="text-sm text-gray-500 dark:text-gray-400 line-through">
                    ${plan.originalPrice}/year
                  </div>
                )}
              </div>

              <ul className="space-y-3 mb-6 text-left">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-center">
                    <Check className="w-4 h-4 text-green-500 mr-3 flex-shrink-0" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleUpgrade(plan.name)}
                disabled={loading && selectedPlan === plan.name || (plan.price === 0 && !userProfile?.isPremium)}
                className={`w-full py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center ${
                  plan.popular
                    ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white hover:from-yellow-500 hover:to-orange-600'
                    : plan.price === 0
                    ? 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {loading && selectedPlan === plan.name ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                ) : (
                  plan.price > 0 && <ArrowRight className="w-4 h-4 mr-2" />
                )}
                {loading && selectedPlan === plan.name ? 'Processing...' : plan.buttonText}
              </motion.button>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* FAQ Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6"
      >
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
          Frequently Asked Questions
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
              Can I cancel anytime?
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Yes, you can cancel your subscription at any time. You'll continue to have access to premium features until the end of your billing period.
            </p>
          </div>
          
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
              What happens to my data if I downgrade?
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Your data is always safe. If you exceed the free plan limits, you'll have read-only access to your extra tasks until you upgrade again.
            </p>
          </div>
          
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
              Do you offer refunds?
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              We offer a 30-day money-back guarantee. If you're not satisfied, contact our support team for a full refund.
            </p>
          </div>
          
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
              Is my data secure?
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Absolutely. We use enterprise-grade security and encryption to protect your data. Your privacy is our top priority.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};