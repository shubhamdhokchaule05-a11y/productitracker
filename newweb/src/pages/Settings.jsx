import React, { useState, useContext } from 'react';
import { motion } from 'framer-motion';
import { FiUser, FiMail, FiPhone, FiMapPin, FiBriefcase, FiBell, FiSun, FiMoon, FiSave, FiCamera, FiLock } from 'react-icons/fi';
import { AppContext } from '../context/AppContext';
import { ThemeContext } from '../context/ThemeContext';
import { currentUser } from '../data/dummyData';
import toast from 'react-hot-toast';

function Settings() {
  const { user, updateUser } = useContext(AppContext);
  const { isDark, toggleTheme } = useContext(ThemeContext);
  const displayUser = user || currentUser;

  const [form, setForm] = useState({
    name: displayUser.name,
    email: displayUser.email,
    phone: displayUser.phone || '',
    role: displayUser.role,
    department: displayUser.department || '',
    location: displayUser.location || '',
    password: '',
  });

  const [notifications, setNotifications] = useState({
    email: displayUser.notifications?.email ?? true,
    push: displayUser.notifications?.push ?? true,
    taskReminders: displayUser.notifications?.taskReminders ?? true,
    weeklyReport: displayUser.notifications?.weeklyReport ?? false,
    teamUpdates: displayUser.notifications?.teamUpdates ?? true,
  });

  const [saving, setSaving] = useState(false);

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    const payload = { name: form.name, email: form.email };
    if (form.password) {
      payload.password = form.password;
    }
    
    const result = await updateUser(payload);
    setSaving(false);
    
    if (result.success) {
      toast.success('Profile updated successfully!');
      setForm({ ...form, password: '' });
    } else {
      toast.error(result.message || 'Failed to update profile');
    }
  };

  const handleNotifToggle = (key) => {
    const updated = { ...notifications, [key]: !notifications[key] };
    setNotifications(updated);
    updateUser({ notifications: updated });
    toast.success(`${key} notifications ${updated[key] ? 'enabled' : 'disabled'}`);
  };

  const inputClass = "w-full px-4 py-2.5 text-sm border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-400 transition-all";

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">Settings</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">Manage your profile and preferences</p>
      </div>

      {/* Profile Card */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow border border-gray-100 dark:border-gray-700"
      >
        <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-5 flex items-center gap-2">
          <FiUser className="w-5 h-5 text-indigo-500" /> Profile
        </h2>

        {/* Avatar */}
        <div className="flex items-center gap-5 mb-6">
          <div className="relative">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-3xl font-bold shadow-lg">
              {form.name.charAt(0)}
            </div>
            <button className="absolute -bottom-2 -right-2 w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow hover:bg-indigo-500 transition-colors">
              <FiCamera className="w-3.5 h-3.5" />
            </button>
          </div>
          <div>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">{displayUser.name}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{displayUser.role}</p>
            <p className="text-xs text-indigo-500 mt-0.5">{displayUser.email}</p>
          </div>
        </div>

        {/* Profile Form */}
        <form onSubmit={handleProfileSave} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Full Name</label>
              <div className="relative">
                <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={`${inputClass} pl-10`} />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Email</label>
              <div className="relative">
                <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={`${inputClass} pl-10`} />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Password (Leave blank to keep current)</label>
              <div className="relative">
                <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className={`${inputClass} pl-10`} placeholder="New password" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Phone</label>
              <div className="relative">
                <FiPhone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="text" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className={`${inputClass} pl-10`} />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Job Role</label>
              <div className="relative">
                <FiBriefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="text" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className={`${inputClass} pl-10`} />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Department</label>
              <input type="text" value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} className={inputClass} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Location</label>
              <div className="relative">
                <FiMapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="text" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className={`${inputClass} pl-10`} />
              </div>
            </div>
          </div>

          <motion.button
            type="submit"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl shadow-md shadow-indigo-500/20 transition-all disabled:opacity-70"
          >
            {saving ? (
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
            ) : (
              <FiSave className="w-4 h-4" />
            )}
            {saving ? 'Saving...' : 'Save Changes'}
          </motion.button>
        </form>
      </motion.div>

      {/* Theme Settings */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow border border-gray-100 dark:border-gray-700"
      >
        <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-5 flex items-center gap-2">
          {isDark ? <FiMoon className="w-5 h-5 text-indigo-400" /> : <FiSun className="w-5 h-5 text-amber-500" />}
          Theme
        </h2>
        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
          <div>
            <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{isDark ? 'Dark Mode' : 'Light Mode'}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Toggle between light and dark interface</p>
          </div>
          <button
            onClick={toggleTheme}
            className={`relative w-12 h-6 rounded-full transition-all duration-300 ${isDark ? 'bg-indigo-600' : 'bg-gray-200'}`}
          >
            <motion.span
              animate={{ x: isDark ? 24 : 2 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              className="absolute top-1 w-4 h-4 bg-white rounded-full shadow"
            />
          </button>
        </div>
      </motion.div>

      {/* Notification Settings */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow border border-gray-100 dark:border-gray-700"
      >
        <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-5 flex items-center gap-2">
          <FiBell className="w-5 h-5 text-indigo-500" /> Notifications
        </h2>
        <div className="space-y-3">
          {[
            { key: 'email', label: 'Email Notifications', desc: 'Receive updates via email' },
            { key: 'push', label: 'Push Notifications', desc: 'Browser push alerts' },
            { key: 'taskReminders', label: 'Task Reminders', desc: 'Reminders for due tasks' },
            { key: 'weeklyReport', label: 'Weekly Report', desc: 'Weekly productivity email digest' },
            { key: 'teamUpdates', label: 'Team Updates', desc: 'Notifications from team activity' },
          ].map((item) => (
            <div key={item.key} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
              <div>
                <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{item.label}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{item.desc}</p>
              </div>
              <button
                onClick={() => handleNotifToggle(item.key)}
                className={`relative w-12 h-6 rounded-full transition-all duration-300 ${notifications[item.key] ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-gray-600'}`}
              >
                <motion.span
                  animate={{ x: notifications[item.key] ? 24 : 2 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  className="absolute top-1 w-4 h-4 bg-white rounded-full shadow"
                />
              </button>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

export default Settings;
