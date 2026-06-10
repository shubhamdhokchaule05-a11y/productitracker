import React, { useState, useContext, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiCalendar, FiPlus, FiClock, FiFileText, 
  FiAlertCircle, FiCheck, FiX, FiTrash2, FiUser, FiActivity 
} from 'react-icons/fi';
import { AppContext } from '../context/AppContext';
import Modal from '../components/ui/Modal';
import Badge from '../components/ui/Badge';
import toast from 'react-hot-toast';

function Leaves() {
  const { 
    user, 
    leaveRequests, 
    applyForLeave, 
    updateLeaveStatus, 
    deleteLeaveRequest, 
    fetchLeaveRequests 
  } = useContext(AppContext);

  // Employee Form State
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [leaveType, setLeaveType] = useState('Sick Leave');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');

  // Admin Review State
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [adminNotes, setAdminNotes] = useState('');

  // Filters
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Auto-refresh leave requests on load
  useEffect(() => {
    fetchLeaveRequests();
  }, [fetchLeaveRequests]);

  // Date helper: calculate inclusive number of days
  const calculateDays = (start, end) => {
    if (!start || !end) return 0;
    const s = new Date(start);
    const e = new Date(end);
    if (isNaN(s) || isNaN(e)) return 0;
    const diffTime = e - s;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays > 0 ? diffDays : 0;
  };

  // Leave allowances
  const ALLOWANCES = {
    'Sick Leave': 5,
    'Casual Leave': 8,
    'Paid Leave': 12
  };

  // Calculate used days for a specific leave type
  const getUsedDays = (type) => {
    return leaveRequests
      .filter(r => r.leave_type === type && r.status === 'Approved')
      .reduce((acc, curr) => acc + calculateDays(curr.start_date, curr.end_date), 0);
  };

  // Handle leave application
  const handleApplySubmit = async (e) => {
    e.preventDefault();
    if (!startDate || !endDate) {
      toast.error('Please select both start and end dates');
      return;
    }
    if (new Date(startDate) > new Date(endDate)) {
      toast.error('Start date cannot be after end date');
      return;
    }
    if (!reason.trim()) {
      toast.error('Please provide a reason for the leave');
      return;
    }

    const duration = calculateDays(startDate, endDate);
    const used = getUsedDays(leaveType);
    const max = ALLOWANCES[leaveType];
    const remaining = max - used;

    if (duration > remaining) {
      toast.error(`Insufficient balance. You requested ${duration} days, but only have ${remaining} days remaining.`);
      return;
    }

    const result = await applyForLeave({
      leave_type: leaveType,
      start_date: startDate,
      end_date: endDate,
      reason: reason.trim()
    });

    if (result.success) {
      setIsApplyModalOpen(false);
      setStartDate('');
      setEndDate('');
      setReason('');
    }
  };

  // Open review modal for Admin
  const openReviewModal = (leave) => {
    setSelectedLeave(leave);
    setAdminNotes('');
    setIsReviewModalOpen(true);
  };

  // Handle Admin decision
  const handleAdminDecision = async (status) => {
    if (!selectedLeave) return;
    const result = await updateLeaveStatus(selectedLeave.id, status, adminNotes.trim());
    if (result.success) {
      setIsReviewModalOpen(false);
      setSelectedLeave(null);
      setAdminNotes('');
    }
  };

  const isAdmin = user?.role === 'Admin';

  // Filter requests
  const filteredRequests = leaveRequests.filter(req => {
    const matchesStatus = statusFilter === 'All' || req.status === statusFilter;
    const matchesSearch = 
      req.reason.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.leave_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (req.user?.name || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <FiCalendar className="w-6 h-6 text-indigo-500" /> Leave Management
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {isAdmin ? 'Review and manage company leave requests' : 'Request time off and track your balances'}
          </p>
        </div>

        {!isAdmin && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setIsApplyModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl shadow-lg shadow-indigo-500/20 transition-all text-sm"
          >
            <FiPlus className="w-4 h-4" /> Apply for Leave
          </motion.button>
        )}
      </div>

      {/* Stats and Balances Container */}
      {!isAdmin ? (
        // Employee Balances Dashboard
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {Object.keys(ALLOWANCES).map((type) => {
            const max = ALLOWANCES[type];
            const used = getUsedDays(type);
            const remaining = max - used;
            const percentage = (remaining / max) * 100;
            
            const colorClass = 
              type === 'Sick Leave' ? 'from-rose-500 to-red-600 shadow-red-500/10' :
              type === 'Casual Leave' ? 'from-amber-400 to-orange-500 shadow-amber-500/10' :
              'from-indigo-500 to-purple-600 shadow-indigo-500/10';

            return (
              <motion.div
                key={type}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow border border-gray-100 dark:border-gray-700 flex flex-col justify-between relative overflow-hidden group"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{type}</p>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1.5 tabular-nums">
                      {remaining} <span className="text-sm font-normal text-gray-400">/ {max} days left</span>
                    </h3>
                  </div>
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${colorClass} flex items-center justify-center text-white shadow-lg`}>
                    <FiCalendar className="w-5 h-5" />
                  </div>
                </div>

                <div className="mt-6">
                  <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-1.5">
                    <span>Used: {used} days</span>
                    <span className="font-semibold">{Math.round(percentage)}% remaining</span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className={`h-full bg-gradient-to-r ${colorClass} rounded-full transition-all duration-500`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        // Admin Summary Cards
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {[
            { 
              label: 'Pending Approvals', 
              val: leaveRequests.filter(r => r.status === 'Pending').length, 
              color: 'from-amber-400 to-orange-500 shadow-amber-500/10',
              icon: FiClock
            },
            { 
              label: 'Approved leaves (Total)', 
              val: leaveRequests.filter(r => r.status === 'Approved').length, 
              color: 'from-emerald-400 to-teal-500 shadow-emerald-500/10',
              icon: FiCheck
            },
            { 
              label: 'Total Requests Processed', 
              val: leaveRequests.filter(r => r.status !== 'Pending').length, 
              color: 'from-indigo-500 to-purple-600 shadow-indigo-500/10',
              icon: FiActivity
            }
          ].map((item, idx) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow border border-gray-100 dark:border-gray-700 flex items-center justify-between"
            >
              <div>
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{item.label}</p>
                <h3 className="text-3xl font-extrabold text-gray-900 dark:text-white mt-2 tabular-nums">{item.val}</h3>
              </div>
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center text-white shadow-lg`}>
                <item.icon className="w-6 h-6" />
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Admin Review queue */}
      {isAdmin && leaveRequests.filter(r => r.status === 'Pending').length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow overflow-hidden"
        >
          <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 bg-amber-500/5 flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-amber-500 rounded-full animate-ping" />
            <h3 className="text-base font-semibold text-amber-700 dark:text-amber-400">Action Required: Leave Approval Queue</h3>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {leaveRequests.filter(r => r.status === 'Pending').map((leave) => (
              <div key={leave.id} className="p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:bg-gray-50/50 dark:hover:bg-gray-700/10 transition-colors">
                <div className="space-y-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                      <FiUser className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-800 dark:text-gray-100">{leave.user?.name || 'Employee'}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{leave.user?.email || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-600 dark:text-gray-300">
                    <span className="font-semibold text-indigo-600 dark:text-indigo-400">{leave.leave_type}</span>
                    <span className="text-gray-400">|</span>
                    <span>{leave.start_date} to {leave.end_date}</span>
                    <span className="text-gray-400">|</span>
                    <span className="font-bold text-gray-700 dark:text-gray-200">{calculateDays(leave.start_date, leave.end_date)} days</span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 italic bg-gray-50 dark:bg-gray-900/50 px-3 py-2 rounded-xl border border-gray-100 dark:border-gray-800 max-w-2xl">
                    "{leave.reason}"
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0 w-full md:w-auto">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => openReviewModal(leave)}
                    className="flex-1 md:flex-none flex items-center justify-center gap-1.5 px-4.5 py-2 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-semibold rounded-xl text-xs shadow shadow-indigo-600/10 cursor-pointer"
                  >
                    Review Request
                  </motion.button>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Main Request History Logs Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 rounded-2xl shadow border border-gray-100 dark:border-gray-700 overflow-hidden"
      >
        {/* Filter Controls Header */}
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <FiFileText className="w-5 h-5 text-indigo-500" />
            {isAdmin ? 'All Company Leave Logs' : 'My Leave Request History'}
          </h3>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            {/* Search */}
            <input
              type="text"
              placeholder="Search leaves..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="px-3.5 py-1.5 text-xs bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-700 dark:text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
            />
            {/* Dropdown status */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 text-xs bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-700 dark:text-gray-200 focus:outline-none"
            >
              <option value="All">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
        </div>

        {/* History Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-100 dark:border-gray-700">
                {isAdmin && <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Employee</th>}
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Leave Type</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Duration</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Dates</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Reason</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Admin Note</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan={isAdmin ? 7 : 6} className="px-5 py-12 text-center text-gray-400">
                    No leave requests found matching the filters.
                  </td>
                </tr>
              ) : (
                filteredRequests.map((record) => {
                  const duration = calculateDays(record.start_date, record.end_date);
                  let badgeVariant = 'default';
                  if (record.status === 'Approved') badgeVariant = 'present';
                  if (record.status === 'Pending') badgeVariant = 'pending';
                  if (record.status === 'Rejected') badgeVariant = 'absent';

                  return (
                    <tr key={record.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors group">
                      {isAdmin && (
                        <td className="px-5 py-3.5">
                          <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">{record.user?.name || 'Employee'}</p>
                          <p className="text-[10px] text-gray-500 dark:text-gray-400">{record.user?.email || ''}</p>
                        </td>
                      )}
                      <td className="px-5 py-3.5 font-medium text-gray-700 dark:text-gray-200">{record.leave_type}</td>
                      <td className="px-5 py-3.5 text-gray-900 dark:text-white font-semibold tabular-nums">{duration} days</td>
                      <td className="px-5 py-3.5 text-xs text-gray-600 dark:text-gray-400 font-mono">
                        {record.start_date} <span className="text-gray-400 mx-1">→</span> {record.end_date}
                      </td>
                      <td className="px-5 py-3.5 text-xs text-gray-600 dark:text-gray-400 max-w-xs truncate" title={record.reason}>
                        {record.reason}
                      </td>
                      <td className="px-5 py-3.5 text-xs text-gray-500 dark:text-gray-400 max-w-xs truncate" title={record.admin_notes || ''}>
                        {record.admin_notes || <span className="text-gray-300 dark:text-gray-600">-</span>}
                      </td>
                      <td className="px-5 py-3.5 flex items-center justify-between gap-2 h-full my-auto align-middle">
                        <Badge variant={badgeVariant}>{record.status}</Badge>
                        
                        {!isAdmin && record.status === 'Pending' && (
                          <button
                            onClick={() => {
                              if (window.confirm('Are you sure you want to cancel this leave request?')) {
                                deleteLeaveRequest(record.id);
                              }
                            }}
                            className="opacity-0 group-hover:opacity-100 p-1.5 text-red-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition-all"
                            title="Cancel Leave"
                          >
                            <FiTrash2 className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* EMPLOYEE Modal: Apply for Leave */}
      <Modal
        isOpen={isApplyModalOpen}
        onClose={() => setIsApplyModalOpen(false)}
        title="Apply for Leave"
        size="md"
      >
        <form onSubmit={handleApplySubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Leave Type</label>
            <select
              value={leaveType}
              onChange={(e) => setLeaveType(e.target.value)}
              className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
            >
              <option value="Sick Leave">Sick Leave (5 days max)</option>
              <option value="Casual Leave">Casual Leave (8 days max)</option>
              <option value="Paid Leave">Paid Leave (12 days max)</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                required
              />
            </div>
          </div>

          {startDate && endDate && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="p-3.5 bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 rounded-xl text-xs font-semibold flex items-center justify-between"
            >
              <span>Duration Calculated:</span>
              <span className="text-sm font-bold">{calculateDays(startDate, endDate)} days</span>
            </motion.div>
          )}

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Reason</label>
            <textarea
              placeholder="Provide a detailed reason for your leave request..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 placeholder-gray-400 resize-none"
              required
            />
          </div>

          <div className="flex gap-3 mt-6 pt-2">
            <button
              type="button"
              onClick={() => setIsApplyModalOpen(false)}
              className="flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-white font-semibold rounded-xl text-sm transition-all outline-none"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl text-sm shadow-md shadow-indigo-500/10 transition-all outline-none"
            >
              Submit Request
            </button>
          </div>
        </form>
      </Modal>

      {/* ADMIN Modal: Review Leave Request */}
      <Modal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        title="Review Leave Request"
        size="md"
      >
        {selectedLeave && (
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-sm">
                  {selectedLeave.user?.name?.charAt(0) || 'E'}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-900 dark:text-white">{selectedLeave.user?.name || 'Employee'}</h4>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400">{selectedLeave.user?.email || ''}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-y-2 pt-2 border-t border-gray-100 dark:border-gray-800 text-xs">
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Leave Type:</span>
                  <p className="font-semibold text-indigo-600 dark:text-indigo-400">{selectedLeave.leave_type}</p>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Duration:</span>
                  <p className="font-bold text-gray-800 dark:text-white">{calculateDays(selectedLeave.start_date, selectedLeave.end_date)} days</p>
                </div>
                <div className="col-span-2">
                  <span className="text-gray-500 dark:text-gray-400">Dates Requested:</span>
                  <p className="font-mono text-gray-700 dark:text-gray-300 font-semibold">{selectedLeave.start_date} to {selectedLeave.end_date}</p>
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">Employee Reason:</span>
              <p className="text-sm text-gray-700 dark:text-gray-300 italic bg-gray-50 dark:bg-gray-900 px-4 py-2.5 rounded-xl border border-gray-100 dark:border-gray-850">
                "{selectedLeave.reason}"
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Reviewer Notes (Optional)</label>
              <textarea
                placeholder="Add comments, approvals conditions, or feedback..."
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                rows={3}
                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 resize-none"
              />
            </div>

            <div className="flex gap-3 mt-6 pt-2">
              <button
                type="button"
                onClick={() => handleAdminDecision('Rejected')}
                className="flex-1 px-4 py-2.5 border border-red-200 hover:bg-red-50 text-red-500 dark:border-red-900/40 dark:hover:bg-red-950/20 font-semibold rounded-xl text-sm transition-all outline-none"
              >
                Reject Request
              </button>
              <button
                type="button"
                onClick={() => handleAdminDecision('Approved')}
                className="flex-1 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl text-sm shadow-md shadow-emerald-500/10 transition-all outline-none"
              >
                Approve Request
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default Leaves;
