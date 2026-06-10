import React, { useState, useEffect, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiMonitor, FiClock, FiCheckCircle, FiAlertTriangle,
  FiSearch, FiFilter, FiTrendingUp, FiActivity,
  FiUser, FiCalendar, FiRefreshCw, FiInfo, FiTrash2
} from 'react-icons/fi';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, PieChart, Pie, Cell, LineChart, Line
} from 'recharts';
import axios from 'axios';
import toast from 'react-hot-toast';
import { AppContext } from '../context/AppContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';
const COLORS = ['#10b981', '#f43f5e']; // Green (productive), Red (distracting)

function AppUsage() {
  const { user } = useContext(AppContext);
  const isAdmin = user?.role === 'Admin';

  // Filters
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [selectedUserId, setSelectedUserId] = useState(() => user?.id || '');
  const [employees, setEmployees] = useState([]);
  
  // Data State
  const [summary, setSummary] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch all employees for dropdown (Admin only)
  useEffect(() => {
    if (isAdmin) {
      const fetchEmployees = async () => {
        try {
          const response = await axios.get(`${API_URL}/users/`);
          setEmployees(response.data);
        } catch (error) {
          console.error('Error fetching employees:', error);
        }
      };
      fetchEmployees();
    }
  }, [isAdmin]);

  // Fetch app usage data based on filters
  const fetchData = async () => {
    if (!selectedUserId) return;
    setLoading(true);
    try {
      const [summaryRes, logsRes] = await Promise.all([
        axios.get(`${API_URL}/app-usage/summary/?user_id=${selectedUserId}&date=${selectedDate}`),
        axios.get(`${API_URL}/app-usage/?user_id=${selectedUserId}&date=${selectedDate}`)
      ]);
      setSummary(summaryRes.data);
      setLogs(logsRes.data);
    } catch (error) {
      console.error('Error fetching app usage data:', error);
      toast.error('Failed to load tracking analytics');
    } finally {
      setLoading(false);
    }
  };

  const handleClearLogs = async () => {
    if (window.confirm("Are you sure you want to permanently clear all app usage logs for today?")) {
      try {
        await axios.delete(`${API_URL}/app-usage/?user_id=${selectedUserId}&date=${selectedDate}`);
        toast.success("Usage logs cleared! 🧹");
        fetchData();
      } catch (error) {
        console.error("Error clearing logs:", error);
        toast.error("Failed to clear logs");
      }
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedUserId, selectedDate]);

  // Format seconds to readable format: Xh Ym Zs
  const formatSeconds = (totalSecs) => {
    if (!totalSecs) return '0s';
    const h = Math.floor(totalSecs / 3600);
    const m = Math.floor((totalSecs % 3600) / 60);
    const s = totalSecs % 60;
    
    let result = '';
    if (h > 0) result += `${h}h `;
    if (m > 0) result += `${m}m `;
    if (s > 0 || result === '') result += `${s}s`;
    return result.strip ? result.strip() : result;
  };

  // Filtered log table data
  const filteredLogs = logs.filter(log => 
    log.app_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (log.window_title && log.window_title.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Setup Pie Chart Data
  const pieChartData = summary ? [
    { name: 'Productive Time', value: summary.productive_time },
    { name: 'Distracting Time', value: summary.unproductive_time }
  ].filter(item => item.value > 0) : [];

  // Setup Bar Chart Data
  const barChartData = summary?.top_apps?.map(app => ({
    name: app.app_name,
    duration: Math.round(app.duration / 60), // in minutes
    type: app.is_productive ? 'Productive' : 'Distracting'
  })) || [];

  // Derive current active app from the most recent tracked process log entry
  const latestLog = logs.length > 0 ? [...logs].sort((a, b) => new Date(b.timestamp.replace(' ', 'T')) - new Date(a.timestamp.replace(' ', 'T')))[0] : null;
  const currentActiveApp = latestLog ? {
    name: latestLog.app_name,
    title: latestLog.window_title
  } : null;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <FiMonitor className="text-indigo-600 dark:text-indigo-400" />
            App Usage Analytics
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Monitor application engagement, productivity scores, and application usage patterns
          </p>
        </div>
        
        {/* Live Tracking Ticker Notification */}
        {currentActiveApp && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-3 px-4 py-2 bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/30 rounded-xl shadow-sm text-xs"
          >
            <div className="relative flex h-3.5 w-3.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-indigo-600 dark:bg-indigo-400"></span>
            </div>
            <div className="text-left font-mono">
              <p className="text-gray-400 text-[10px] leading-none uppercase">Currently Active App</p>
              <p className="font-semibold text-indigo-700 dark:text-indigo-300 mt-1">
                {currentActiveApp.name} <span className="text-gray-500 font-normal">({currentActiveApp.title.substring(0, 20)}...)</span>
              </p>
            </div>
          </motion.div>
        )}
      </div>

      {/* Filter Options Bar */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700 shadow-sm flex flex-wrap gap-4 items-center justify-between">
        <div className="flex flex-wrap items-center gap-4 flex-1">
          {/* Employee dropdown filter - admin only */}
          {isAdmin ? (
            <div className="flex items-center gap-2">
              <FiUser className="text-gray-400 text-sm" />
              <select
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                className="pl-2 pr-6 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
              >
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>{emp.name} ({emp.role})</option>
                ))}
              </select>
            </div>
          ) : (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 dark:bg-gray-700/50 rounded-xl text-sm text-gray-600 dark:text-gray-400 border border-gray-200/50 dark:border-gray-700">
              <FiUser className="text-indigo-500" />
              <span className="font-medium text-gray-800 dark:text-gray-200">{user?.name}</span>
            </div>
          )}

          {/* Date Selector Filter */}
          <div className="flex items-center gap-2">
            <FiCalendar className="text-gray-400 text-sm" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-3 py-1.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
            />
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleClearLogs}
            className="flex items-center gap-2 px-4 py-2 bg-rose-50 dark:bg-rose-950/20 hover:bg-rose-100 dark:hover:bg-rose-950/30 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-900/30 rounded-xl text-sm font-semibold transition-all"
            title="Permanently Clear Today's Tracked Logs"
          >
            <FiTrash2 className="w-3.5 h-3.5" />
            Clear Logs
          </button>
          
          <button
            onClick={fetchData}
            className="flex items-center gap-2 px-4 py-2 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-600 rounded-xl text-sm font-semibold transition-all"
          >
            <FiRefreshCw className="w-3.5 h-3.5" />
            Refresh
          </button>
        </div>
      </div>

      {loading ? (
        // Premium Skeleton Loader
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 animate-pulse">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 bg-gray-200 dark:bg-gray-700 rounded-2xl" />
          ))}
          <div className="md:col-span-2 h-80 bg-gray-200 dark:bg-gray-700 rounded-2xl" />
          <div className="md:col-span-2 h-80 bg-gray-200 dark:bg-gray-700 rounded-2xl" />
        </div>
      ) : (
        <>
          {summary?.total_tracked_time === 0 ? (
            // Elegant Empty State
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-gray-800 rounded-2xl p-12 text-center border border-gray-100 dark:border-gray-700 shadow-sm"
            >
              <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-950/30 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-indigo-100/50 dark:border-indigo-900/30">
                <FiMonitor className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">No Tracking Records Found</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto mb-6">
                No app activity has been tracked for this user on the selected date. To start tracking:
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-left max-w-2xl mx-auto bg-gray-50 dark:bg-gray-900/30 p-4 rounded-xl border border-gray-100 dark:border-gray-700">
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-gray-800 dark:text-gray-200">Option 1: Browser Simulator (Plug-and-play)</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 leading-normal">
                    Click the **Punch In** button in the Navbar, select **Working** status, and the app will simulate and log common developer tool usage patterns.
                  </p>
                </div>
                <div className="w-px h-12 bg-gray-200 dark:bg-gray-700 hidden sm:block" />
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-gray-800 dark:text-gray-200">Option 2: Native Desktop Client</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 leading-normal">
                    Run the Python process agent script locally via terminal: <code className="bg-gray-100 dark:bg-gray-700 px-1 py-0.5 rounded text-[10px] text-pink-600 font-mono">python backend/agent.py {selectedUserId}</code>.
                  </p>
                </div>
              </div>
            </motion.div>
          ) : (
            <>
              {/* StatCards Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Total Tracked Card */}
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700 flex items-center justify-between group"
                >
                  <div className="space-y-1">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Total Tracked Time</p>
                    <p className="text-xl font-bold text-gray-900 dark:text-white font-mono leading-tight">
                      {formatSeconds(summary?.total_tracked_time)}
                    </p>
                  </div>
                  <div className="w-11 h-11 bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 rounded-xl flex items-center justify-center group-hover:scale-105 transition-all">
                    <FiClock className="w-5 h-5" />
                  </div>
                </motion.div>

                {/* Productive Card */}
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 }}
                  className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700 flex items-center justify-between group"
                >
                  <div className="space-y-1">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Productive Hours</p>
                    <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400 font-mono leading-tight">
                      {formatSeconds(summary?.productive_time)}
                    </p>
                  </div>
                  <div className="w-11 h-11 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 rounded-xl flex items-center justify-center group-hover:scale-105 transition-all">
                    <FiCheckCircle className="w-5 h-5" />
                  </div>
                </motion.div>

                {/* Unproductive Card */}
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700 flex items-center justify-between group"
                >
                  <div className="space-y-1">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Distracting Time</p>
                    <p className="text-xl font-bold text-rose-600 dark:text-rose-400 font-mono leading-tight">
                      {formatSeconds(summary?.unproductive_time)}
                    </p>
                  </div>
                  <div className="w-11 h-11 bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 rounded-xl flex items-center justify-center group-hover:scale-105 transition-all">
                    <FiAlertTriangle className="w-5 h-5" />
                  </div>
                </motion.div>

                {/* Productivity Score Card */}
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                  className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700 flex items-center justify-between group"
                >
                  <div className="space-y-1">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Productivity Score</p>
                    <p className={`text-2xl font-black font-mono leading-tight ${
                      summary?.productivity_percentage >= 80 ? 'text-emerald-500' :
                      summary?.productivity_percentage >= 50 ? 'text-amber-500' : 'text-rose-500'
                    }`}>
                      {summary?.productivity_percentage}%
                    </p>
                  </div>
                  <div className="w-11 h-11 bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 rounded-xl flex items-center justify-center group-hover:scale-105 transition-all">
                    <FiTrendingUp className="w-5 h-5" />
                  </div>
                </motion.div>
              </div>

              {/* Charts Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Horizontal Bar Chart: Top Apps */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm"
                >
                  <h3 className="text-sm font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-1.5">
                    <FiActivity className="text-indigo-500" />
                    Top Applications (Minutes)
                  </h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={barChartData} layout="vertical" margin={{ left: 20, right: 10, top: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" className="dark:stroke-gray-700" horizontal={false} />
                        <XAxis type="number" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                        <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} width={80} axisLine={false} tickLine={false} />
                        <Tooltip
                          formatter={(value) => [`${value}m`, 'Time Active']}
                          contentStyle={{ background: '#1e293b', border: 'none', borderRadius: '8px', color: '#f8fafc', fontSize: '12px' }}
                        />
                        <Bar dataKey="duration" radius={[0, 4, 4, 0]} barSize={16}>
                          {barChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.type === 'Productive' ? '#10b981' : '#f43f5e'} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </motion.div>

                {/* Pie Chart: App Productivity breakdown */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.05 }}
                  className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col justify-between"
                >
                  <h3 className="text-sm font-semibold text-gray-800 dark:text-white mb-2 flex items-center gap-1.5">
                    <FiTrendingUp className="text-indigo-500" />
                    Productivity Distribution
                  </h3>
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-6 flex-1 py-4">
                    {pieChartData.length === 0 ? (
                      <div className="text-gray-400 text-xs">No chart data available.</div>
                    ) : (
                      <>
                        <div className="w-48 h-48">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={pieChartData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={85}
                                paddingAngle={3}
                                dataKey="value"
                              >
                                {pieChartData.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="transparent" />
                                ))}
                              </Pie>
                              <Tooltip
                                formatter={(val) => [`${formatSeconds(val)}`, 'Total Time']}
                                contentStyle={{ background: '#1e293b', border: 'none', borderRadius: '8px', color: '#f8fafc', fontSize: '12px' }}
                              />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>

                        <div className="space-y-3 flex-shrink-0">
                          <div className="flex items-center gap-2.5">
                            <span className="w-3.5 h-3.5 rounded-md bg-emerald-500" />
                            <div className="text-left">
                              <p className="text-xs text-gray-500 dark:text-gray-400">Productive</p>
                              <p className="text-sm font-bold text-gray-800 dark:text-gray-100 font-mono">
                                {formatSeconds(summary?.productive_time)}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2.5">
                            <span className="w-3.5 h-3.5 rounded-md bg-rose-500" />
                            <div className="text-left">
                              <p className="text-xs text-gray-500 dark:text-gray-400">Distracting</p>
                              <p className="text-sm font-bold text-gray-800 dark:text-gray-100 font-mono">
                                {formatSeconds(summary?.unproductive_time)}
                              </p>
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </motion.div>
              </div>

              {/* Activity Log Table */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden"
              >
                {/* Table Header Filter */}
                <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <h3 className="text-sm font-semibold text-gray-800 dark:text-white">Active Windows Process Log</h3>
                  
                  {/* Search Box */}
                  <div className="relative w-full sm:max-w-xs">
                    <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search applications, windows..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-9 pr-4 py-1.5 text-xs bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-700 dark:text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                    />
                  </div>
                </div>

                {/* Table Layout */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-gray-50/55 dark:bg-gray-900/40 border-b border-gray-100 dark:border-gray-700 text-gray-400 font-semibold uppercase tracking-wider">
                        <th className="px-5 py-3">Application</th>
                        <th className="px-5 py-3">Active Window Title</th>
                        <th className="px-5 py-3">Active Time</th>
                        <th className="px-5 py-3">Status</th>
                        <th className="px-5 py-3 text-right">Last Synced</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 dark:divide-gray-700/50">
                      {filteredLogs.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="px-5 py-8 text-center text-gray-400 dark:text-gray-500">
                            No matching process logs found.
                          </td>
                        </tr>
                      ) : (
                        filteredLogs.map((log) => (
                          <tr key={log.id} className="hover:bg-gray-50/40 dark:hover:bg-gray-700/20 transition-colors">
                            <td className="px-5 py-3 font-semibold text-gray-800 dark:text-gray-200">
                              {log.app_name}
                            </td>
                            <td className="px-5 py-3 text-gray-500 dark:text-gray-400 font-mono truncate max-w-xs sm:max-w-md" title={log.window_title}>
                              {log.window_title || 'N/A'}
                            </td>
                            <td className="px-5 py-3 font-mono font-semibold text-gray-700 dark:text-gray-300">
                              {formatSeconds(log.active_duration)}
                            </td>
                            <td className="px-5 py-3">
                              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold tracking-wide uppercase ${
                                log.is_productive
                                  ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/20'
                                  : 'bg-rose-50 text-rose-600 dark:bg-rose-950/20 dark:text-rose-400 border border-rose-100 dark:border-rose-900/20'
                              }`}>
                                <span className={`w-1 h-1 rounded-full ${log.is_productive ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                                {log.is_productive ? 'Productive' : 'Distracting'}
                              </span>
                            </td>
                            <td className="px-5 py-3 text-right text-gray-400 dark:text-gray-500 font-mono">
                              {log.timestamp}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            </>
          )}
        </>
      )}
    </div>
  );
}

export default AppUsage;
