import React, { useContext } from 'react';
import { motion } from 'framer-motion';
import {
  FiCheckSquare, FiClock, FiAlertCircle, FiTrendingUp,
  FiActivity, FiCalendar, FiZap,
} from 'react-icons/fi';
import StatCard from '../components/ui/StatCard';
import ProgressBar from '../components/ui/ProgressBar';
import RecentActivity from '../components/RecentActivity';
import CalendarWidget from '../components/CalendarWidget';
import { AppContext } from '../context/AppContext';
import { currentUser } from '../data/dummyData';
import { calcProductivity, getCurrentTime, getTodayDate, formatDate } from '../utils/helpers';

function DashboardHome() {
  const { tasks, user } = useContext(AppContext);
  const displayUser = user || currentUser;

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === 'completed').length;
  const pendingTasks = tasks.filter((t) => t.status === 'pending').length;
  const inProgressTasks = tasks.filter((t) => t.status === 'in-progress').length;
  const productivity = calcProductivity(completedTasks, totalTasks);

  const stats = [
    { title: 'Total Tasks', value: totalTasks, subtitle: 'This month', icon: FiCheckSquare, color: 'indigo', trend: 12 },
    { title: 'Completed', value: completedTasks, subtitle: 'Tasks finished', icon: FiActivity, color: 'emerald', trend: 8 },
    { title: 'Pending', value: pendingTasks, subtitle: 'Awaiting action', icon: FiAlertCircle, color: 'amber', trend: -3 },
    { title: 'Productivity', value: `${productivity}%`, subtitle: 'Completion rate', icon: FiTrendingUp, color: 'blue', trend: 5 },
    { title: 'Working Hours', value: '8h 28m', subtitle: 'Today', icon: FiClock, color: 'purple', trend: 2 },
    { title: 'Attendance', value: '✓ Present', subtitle: formatDate(getTodayDate()), icon: FiCalendar, color: 'rose', trend: null },
  ];

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative overflow-hidden bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 rounded-2xl p-6 text-white shadow-xl"
      >
        <div className="absolute -top-8 -right-8 w-40 h-40 bg-white/10 rounded-full" />
        <div className="absolute -bottom-8 right-20 w-32 h-32 bg-white/5 rounded-full" />
        <div className="absolute top-4 right-4 opacity-20">
          <FiZap className="w-24 h-24" />
        </div>
        <div className="relative">
          <p className="text-indigo-200 text-sm font-medium mb-1">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
          <h1 className="text-2xl font-bold mb-1">
            Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 17 ? 'Afternoon' : 'Evening'}, {displayUser.name.split(' ')[0]}! 👋
          </h1>
          <p className="text-indigo-100 text-sm">
            You have <span className="font-semibold text-white">{inProgressTasks} tasks in progress</span> and <span className="font-semibold text-white">{pendingTasks} pending</span>. Keep it up!
          </p>
          <div className="mt-4 flex items-center gap-2">
            <div className="flex-1 max-w-xs">
              <ProgressBar value={productivity} color="emerald" showPercent={false} size="md" />
            </div>
            <span className="text-sm font-semibold text-white">{productivity}% complete</span>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {stats.map((stat, i) => (
          <StatCard key={stat.title} {...stat} delay={i * 0.07} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl p-6 shadow border border-gray-100 dark:border-gray-700">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-5">Task Overview</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-1 text-sm">
                <span className="text-gray-600 dark:text-gray-400">Completed Tasks</span>
                <span className="font-semibold text-gray-800 dark:text-gray-200">{completedTasks}/{totalTasks}</span>
              </div>
              <ProgressBar value={completedTasks} max={totalTasks} color="emerald" showPercent={false} />
            </div>
            <div>
              <div className="flex justify-between mb-1 text-sm">
                <span className="text-gray-600 dark:text-gray-400">In Progress</span>
                <span className="font-semibold text-gray-800 dark:text-gray-200">{inProgressTasks}/{totalTasks}</span>
              </div>
              <ProgressBar value={inProgressTasks} max={totalTasks} color="indigo" showPercent={false} />
            </div>
            <div>
              <div className="flex justify-between mb-1 text-sm">
                <span className="text-gray-600 dark:text-gray-400">Pending Tasks</span>
                <span className="font-semibold text-gray-800 dark:text-gray-200">{pendingTasks}/{totalTasks}</span>
              </div>
              <ProgressBar value={pendingTasks} max={totalTasks} color="amber" showPercent={false} />
            </div>
            <div>
              <div className="flex justify-between mb-1 text-sm">
                <span className="text-gray-600 dark:text-gray-400">Weekly Productivity</span>
                <span className="font-semibold text-gray-800 dark:text-gray-200">{productivity}%</span>
              </div>
              <ProgressBar value={productivity} color="blue" showPercent={false} />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 mt-6 pt-4 border-t border-gray-100 dark:border-gray-700">
            {[
              { label: 'High Priority', value: tasks.filter(t=>t.priority==='high').length, color: 'text-red-500' },
              { label: 'Medium Priority', value: tasks.filter(t=>t.priority==='medium').length, color: 'text-amber-500' },
              { label: 'Low Priority', value: tasks.filter(t=>t.priority==='low').length, color: 'text-green-500' },
            ].map((item) => (
              <div key={item.label} className="text-center">
                <p className={`text-2xl font-bold ${item.color}`}>{item.value}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{item.label}</p>
              </div>
            ))}
          </div>
        </div>

        <CalendarWidget />
      </div>

      <RecentActivity />
    </div>
  );
}

export default DashboardHome;
