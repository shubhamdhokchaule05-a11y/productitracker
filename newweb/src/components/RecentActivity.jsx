import React from 'react';
import { motion } from 'framer-motion';
import { FiCheckCircle, FiClock, FiPlusCircle } from 'react-icons/fi';
import { recentActivities } from '../data/dummyData';

const iconMap = {
  check: FiCheckCircle,
  clock: FiClock,
  plus: FiPlusCircle,
};

const colorMap = {
  green: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400',
  blue: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
  indigo: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400',
  purple: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
};

function RecentActivity({ activities = recentActivities }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow border border-gray-100 dark:border-gray-700">
      <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">Recent Activity</h3>
      <div className="space-y-4">
        {activities.map((item, i) => {
          const Icon = iconMap[item.icon] || FiCheckCircle;
          const colorClass = colorMap[item.color] || colorMap.indigo;
          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.07 }}
              className="flex items-start gap-3"
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${colorClass}`}>
                <Icon className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-snug">{item.message}</p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{item.time}</p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

export default RecentActivity;
