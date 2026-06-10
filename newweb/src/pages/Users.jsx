import React, { useState, useEffect, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiUsers, FiSearch, FiEdit2, FiX, FiSave, 
  FiUser, FiMail, FiPhone, FiBriefcase, FiMapPin, FiShield 
} from 'react-icons/fi';
import { AppContext } from '../context/AppContext';
import toast from 'react-hot-toast';

function Users() {
  const { fetchAllUsers, updateUser, user: currentUser } = useContext(AppContext);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal states
  const [editingUser, setEditingUser] = useState(null);
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    role: '',
    department: '',
    location: '',
    systemRole: 'Team Member', // Maps to the role column (Admin or Team Member/User)
  });
  const [saving, setSaving] = useState(false);

  const loadUsers = async () => {
    setLoading(true);
    const data = await fetchAllUsers();
    setUsers(data || []);
    setLoading(false);
  };

  useEffect(() => {
    loadUsers();
  }, [fetchAllUsers]);

  const handleEditClick = (user) => {
    setEditingUser(user);
    setForm({
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || '',
      role: user.role || '',
      department: user.department || '',
      location: user.location || '',
      systemRole: user.role === 'Admin' ? 'Admin' : 'Team Member',
    });
  };

  const handleModalClose = () => {
    setEditingUser(null);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!editingUser) return;
    setSaving(true);

    const payload = {
      name: form.name,
      email: form.email,
      phone: form.phone,
      role: form.systemRole === 'Admin' ? 'Admin' : form.role, // Set their DB role field
      department: form.department,
      location: form.location,
    };

    const result = await updateUser(payload, editingUser.id);
    setSaving(false);

    if (result.success) {
      toast.success('User updated successfully!');
      // Update local state
      setUsers((prev) =>
        prev.map((u) => (u.id === editingUser.id ? { ...u, ...result.data } : u))
      );
      handleModalClose();
    } else {
      toast.error(result.message || 'Failed to update user');
    }
  };

  // Filtered users list
  const filteredUsers = users.filter((u) => {
    const query = searchQuery.toLowerCase();
    return (
      (u.name || '').toLowerCase().includes(query) ||
      (u.email || '').toLowerCase().includes(query) ||
      (u.role || '').toLowerCase().includes(query) ||
      (u.department || '').toLowerCase().includes(query) ||
      (u.location || '').toLowerCase().includes(query)
    );
  });

  const inputClass = "w-full px-4 py-2.5 text-sm border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-400 transition-all";

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <FiUsers className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
            User Management
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            View registered user accounts, manage their details, and set authorities.
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex items-center gap-4"
        >
          <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-xl font-bold">
            <FiUsers className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Total Accounts Created</p>
            <p className="text-2xl font-bold text-gray-950 dark:text-white">{loading ? '...' : users.length}</p>
          </div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex items-center gap-4"
        >
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
            <FiShield className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Administrators</p>
            <p className="text-2xl font-bold text-gray-950 dark:text-white">
              {loading ? '...' : users.filter(u => u.role === 'Admin').length}
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex items-center gap-4"
        >
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <FiBriefcase className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Team Members</p>
            <p className="text-2xl font-bold text-gray-950 dark:text-white">
              {loading ? '...' : users.filter(u => u.role !== 'Admin').length}
            </p>
          </div>
        </motion.div>
      </div>

      {/* Users List Card */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow overflow-hidden"
      >
        {/* Search Bar */}
        <div className="p-5 border-b border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row gap-3 justify-between items-center bg-gray-50/50 dark:bg-gray-800/50">
          <span className="text-sm font-semibold text-gray-800 dark:text-white self-start sm:self-center">
            Registered Users ({filteredUsers.length})
          </span>
          <div className="relative w-full sm:w-72">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search user name, email, department..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-800 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-500">
              <svg className="animate-spin h-8 w-8 text-indigo-600 mb-3" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
              <span>Loading users...</span>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-16 text-gray-400 dark:text-gray-500">
              <FiUsers className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="text-sm">No users found match your search criteria</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 dark:bg-gray-900/10 border-b border-gray-100 dark:border-gray-700 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  <th className="py-4 px-6">User</th>
                  <th className="py-4 px-6">Job Role</th>
                  <th className="py-4 px-6">Department</th>
                  <th className="py-4 px-6">Location</th>
                  <th className="py-4 px-6">Authority</th>
                  <th className="py-4 px-6 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50 text-sm">
                {filteredUsers.map((user) => (
                  <tr 
                    key={user.id} 
                    className="hover:bg-gray-50/40 dark:hover:bg-gray-700/10 transition-colors"
                  >
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold shadow-sm flex-shrink-0">
                          {(user.name || 'U').charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white leading-normal">
                            {user.name} {user.id === currentUser?.id && <span className="text-[10px] bg-indigo-500/15 text-indigo-600 px-1.5 py-0.5 rounded-full font-normal">You</span>}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 font-mono mt-0.5">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-gray-700 dark:text-gray-300">
                      {user.role || '-'}
                    </td>
                    <td className="py-4 px-6 text-gray-700 dark:text-gray-300">
                      {user.department || '-'}
                    </td>
                    <td className="py-4 px-6 text-gray-700 dark:text-gray-300">
                      {user.location || '-'}
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-full ${
                        user.role === 'Admin' 
                          ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400' 
                          : 'bg-gray-100 text-gray-700 dark:bg-gray-700/40 dark:text-gray-300'
                      }`}>
                        <FiShield className="w-3 h-3" />
                        {user.role === 'Admin' ? 'Admin' : 'Team Member'}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <button
                        onClick={() => handleEditClick(user)}
                        className="p-2 text-indigo-600 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-all inline-flex items-center justify-center"
                        title="Edit User Details"
                      >
                        <FiEdit2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </motion.div>

      {/* Edit User Modal */}
      <AnimatePresence>
        {editingUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="w-full max-w-lg bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-2xl overflow-hidden"
            >
              {/* Modal Header */}
              <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900/40 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <FiEdit2 className="w-5 h-5 text-indigo-500" />
                  <span className="font-bold text-gray-900 dark:text-white">Edit User Settings</span>
                </div>
                <button
                  onClick={handleModalClose}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <FiX className="w-4 h-4" />
                </button>
              </div>

              {/* Modal Body / Form */}
              <form onSubmit={handleFormSubmit} className="p-6 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5 flex items-center gap-1">
                      <FiUser className="w-3.5 h-3.5" /> Full Name
                    </label>
                    <input
                      type="text"
                      required
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className={inputClass}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5 flex items-center gap-1">
                      <FiMail className="w-3.5 h-3.5" /> Email Address
                    </label>
                    <input
                      type="email"
                      required
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5 flex items-center gap-1">
                      <FiPhone className="w-3.5 h-3.5" /> Phone Number
                    </label>
                    <input
                      type="text"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      placeholder="+1 (555) 000-0000"
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5 flex items-center gap-1">
                      <FiBriefcase className="w-3.5 h-3.5" /> Job Role
                    </label>
                    <input
                      type="text"
                      value={form.role}
                      onChange={(e) => setForm({ ...form, role: e.target.value })}
                      placeholder="e.g. Developer, QA, Designer"
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">
                      Department
                    </label>
                    <input
                      type="text"
                      value={form.department}
                      onChange={(e) => setForm({ ...form, department: e.target.value })}
                      placeholder="e.g. Engineering, HR"
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5 flex items-center gap-1">
                      <FiMapPin className="w-3.5 h-3.5" /> Location
                    </label>
                    <input
                      type="text"
                      value={form.location}
                      onChange={(e) => setForm({ ...form, location: e.target.value })}
                      placeholder="e.g. New York, Remote"
                      className={inputClass}
                    />
                  </div>
                </div>

                {/* System Authority / Role */}
                <div className="pt-2 border-t border-gray-100 dark:border-gray-700/50">
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5 flex items-center gap-1">
                    <FiShield className="w-3.5 h-3.5 text-indigo-500" /> System Authority (Role)
                  </label>
                  <select
                    value={form.systemRole}
                    onChange={(e) => setForm({ ...form, systemRole: e.target.value })}
                    className="w-full px-4 py-2.5 text-sm border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all outline-none"
                    style={{ colorScheme: 'dark' }}
                  >
                    <option value="Team Member">Team Member (Standard User)</option>
                    <option value="Admin">Admin (Full Control)</option>
                  </select>
                  <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-1">
                    Admins can manage other users, approve leaves, and override profile lock policies.
                  </p>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-700/50">
                  <button
                    type="button"
                    onClick={handleModalClose}
                    className="px-4 py-2 text-sm font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={saving}
                    className="flex items-center gap-1.5 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl shadow-md shadow-indigo-500/20 transition-all disabled:opacity-75"
                  >
                    {saving ? (
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                      </svg>
                    ) : (
                      <FiSave className="w-4 h-4" />
                    )}
                    {saving ? 'Saving...' : 'Save Settings'}
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default Users;
