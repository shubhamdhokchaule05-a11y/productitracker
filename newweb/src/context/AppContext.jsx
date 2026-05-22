import React, { createContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { getCurrentTime, getTodayDate } from '../utils/helpers';

export const AppContext = createContext();
const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

export const STATUS = { IDLE: 'idle', WORKING: 'working', BREAK: 'break', DONE: 'done' };

export function AppProvider({ children }) {
  const [tasks, setTasks] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('userProfile');
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    if (isLoggedIn && saved) return JSON.parse(saved);
    return null;
  });

  // --- Lifted Attendance Timer States ---
  const [status, setStatus] = useState(() => localStorage.getItem('timer_status') || 'idle');
  const [seconds, setSeconds] = useState(() => Number(localStorage.getItem('timer_seconds')) || 0);
  const [breakSeconds, setBreakSeconds] = useState(() => Number(localStorage.getItem('timer_breakSeconds')) || 0);
  const [punchInTime, setPunchInTime] = useState(() => localStorage.getItem('timer_punchInTime') || null);
  const [punchOutTime, setPunchOutTime] = useState(() => localStorage.getItem('timer_punchOutTime') || null);
  const [todayId, setTodayId] = useState(() => Number(localStorage.getItem('timer_todayId')) || null);
  const [isOnBreak, setIsOnBreak] = useState(() => localStorage.getItem('timer_isOnBreak') === 'true');
  
  // Idle Alert States
  const [isIdleModalOpen, setIsIdleModalOpen] = useState(false);
  const [idleAlertTriggered, setIdleAlertTriggered] = useState(false);
  const [lastActivity, setLastActivity] = useState(Date.now());

  // Inactivity Settings (Auto-Break)
  const [idleSettings, setIdleSettings] = useState(() => {
    const saved = localStorage.getItem('idle_settings');
    if (saved) return JSON.parse(saved);
    return {
      autoBreakEnabled: true,
      idleTimeout: 300000 // 5 minutes in milliseconds (300000 ms)
    };
  });

  // Sync Timer States to localStorage
  useEffect(() => {
    localStorage.setItem('timer_status', status);
    localStorage.setItem('timer_seconds', seconds);
    localStorage.setItem('timer_breakSeconds', breakSeconds);
    localStorage.setItem('timer_punchInTime', punchInTime || '');
    localStorage.setItem('timer_punchOutTime', punchOutTime || '');
    localStorage.setItem('timer_todayId', todayId || '');
    localStorage.setItem('timer_isOnBreak', isOnBreak);
  }, [status, seconds, breakSeconds, punchInTime, punchOutTime, todayId, isOnBreak]);

  // Sync Settings to localStorage
  useEffect(() => {
    localStorage.setItem('idle_settings', JSON.stringify(idleSettings));
  }, [idleSettings]);

  // Timer Tick Interval
  useEffect(() => {
    let interval;
    if (status === STATUS.WORKING) {
      interval = setInterval(() => setSeconds((s) => s + 1), 1000);
    } else if (status === STATUS.BREAK) {
      interval = setInterval(() => setBreakSeconds((s) => s + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [status]);

  const fetchTasks = useCallback(async () => {
    if (!user || !user.id) return;
    try {
      const response = await axios.get(`${API_URL}/tasks/?user_id=${user.id}`);
      const mapped = response.data.map(t => ({
        ...t,
        dueDate: t.due_date
      }));
      setTasks(mapped);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  }, [user]);

  const fetchAttendance = useCallback(async () => {
    if (!user || !user.id) return;
    try {
      const response = await axios.get(`${API_URL}/attendance/?user_id=${user.id}`);
      const mapped = response.data.map(a => ({
        ...a,
        punchIn: a.check_in || '-',
        punchOut: a.check_out || '-',
        breakTime: a.break_time || '0 min',
        totalHours: a.total_hours || '-'
      }));
      setAttendance(mapped);
    } catch (error) {
      console.error('Error fetching attendance:', error);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchTasks();
      fetchAttendance();
    }
  }, [user, fetchTasks, fetchAttendance]);

  const loginUser = async (email, password) => {
    try {
      const response = await axios.post(`${API_URL}/login/`, { email, password });
      const loggedInUser = response.data;
      setUser(loggedInUser);
      localStorage.setItem('userProfile', JSON.stringify(loggedInUser));
      localStorage.setItem('isLoggedIn', 'true');
      return { success: true };
    } catch (error) {
      return { success: false, message: error.response?.data?.detail || 'Login failed' };
    }
  };

  const registerUser = async (userData) => {
    try {
      const response = await axios.post(`${API_URL}/users/`, userData);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, message: error.response?.data?.detail || 'Registration failed' };
    }
  };

  const logoutUser = () => {
    setUser(null);
    setTasks([]);
    setAttendance([]);
    setStatus(STATUS.IDLE);
    setSeconds(0);
    setBreakSeconds(0);
    setPunchInTime(null);
    setPunchOutTime(null);
    setTodayId(null);
    setIsOnBreak(false);
    setIsIdleModalOpen(false);
    setIdleAlertTriggered(false);
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userProfile');
    localStorage.removeItem('timer_status');
    localStorage.removeItem('timer_seconds');
    localStorage.removeItem('timer_breakSeconds');
    localStorage.removeItem('timer_punchInTime');
    localStorage.removeItem('timer_punchOutTime');
    localStorage.removeItem('timer_todayId');
    localStorage.removeItem('timer_isOnBreak');
  };

  const addTask = async (task) => {
    try {
      const payload = {
        title: task.title,
        description: task.description || "",
        status: task.status || "pending",
        priority: task.priority || "medium",
        due_date: task.dueDate,
        owner_id: user?.id
      };
      const response = await axios.post(`${API_URL}/tasks/`, payload);
      const mapped = {
        ...response.data,
        dueDate: response.data.due_date
      };
      setTasks((prev) => [mapped, ...prev]);
    } catch (error) {
      console.error('Error adding task:', error);
    }
  };

  const updateTask = async (id, updates) => {
    try {
      const payload = { ...updates };
      if (payload.dueDate) {
        payload.due_date = payload.dueDate;
        delete payload.dueDate;
      }
      const response = await axios.put(`${API_URL}/tasks/${id}`, payload);
      const mapped = {
        ...response.data,
        dueDate: response.data.due_date
      };
      setTasks((prev) => prev.map((t) => (t.id === id ? mapped : t)));
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const deleteTask = async (id) => {
    try {
      await axios.delete(`${API_URL}/tasks/${id}`);
      setTasks((prev) => prev.filter((t) => t.id !== id));
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const toggleTask = async (id) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    const newStatus = task.status === 'completed' ? 'pending' : 'completed';
    await updateTask(id, { status: newStatus });
  };

  const addAttendance = async (record) => {
    try {
      const payload = {
        date: record.date || new Date().toISOString().split('T')[0],
        check_in: record.punchIn,
        check_out: record.punchOut,
        break_time: record.breakTime,
        total_hours: record.totalHours,
        status: record.status || "present",
        user_id: user?.id
      };
      const response = await axios.post(`${API_URL}/attendance/`, payload);
      
      const mapped = {
        ...response.data,
        punchIn: response.data.check_in,
        punchOut: response.data.check_out,
        breakTime: record.breakTime || '0 min',
        totalHours: record.totalHours || '-'
      };
      setAttendance((prev) => [mapped, ...prev]);
      return response.data.id; // Return DB ID
    } catch (error) {
      console.error('Error adding attendance:', error);
      return null;
    }
  };

  const updateAttendance = async (id, updates) => {
    try {
      const payload = {};
      if (updates.punchIn) payload.check_in = updates.punchIn;
      if (updates.punchOut) payload.check_out = updates.punchOut;
      if (updates.status) payload.status = updates.status;
      if (updates.date) payload.date = updates.date;
      if (updates.breakTime) payload.break_time = updates.breakTime;
      if (updates.totalHours) payload.total_hours = updates.totalHours;
      if (updates.breakStart) payload.break_start = updates.breakStart;
      if (updates.breakEnd) payload.break_end = updates.breakEnd;
      
      const response = await axios.put(`${API_URL}/attendance/${id}`, payload);
      const mapped = {
        ...response.data,
        punchIn: response.data.check_in,
        punchOut: response.data.check_out,
        breakTime: updates.breakTime,
        totalHours: updates.totalHours
      };
      setAttendance((prev) => prev.map((a) => (a.id === id ? { ...a, ...mapped } : a)));
    } catch (error) {
      console.error('Error updating attendance:', error);
    }
  };

  const deleteAttendance = async (id) => {
    try {
      await axios.delete(`${API_URL}/attendance/${id}`);
      setAttendance((prev) => prev.filter((a) => a.id !== id));
    } catch (error) {
      console.error('Error deleting attendance:', error);
    }
  };

  const updateUser = async (updates) => {
    try {
      const response = await axios.put(`${API_URL}/users/${user.id}`, updates);
      const updated = { ...user, ...response.data };
      setUser(updated);
      localStorage.setItem('userProfile', JSON.stringify(updated));
      return { success: true };
    } catch (error) {
      console.error('Error updating user:', error);
      return { success: false, message: error.response?.data?.detail || 'Update failed' };
    }
  };

  // --- Clock Action Handlers (Moved Globally) ---
  const handlePunchIn = async () => {
    const now = getCurrentTime();
    setPunchInTime(now);
    setStatus(STATUS.WORKING);
    setSeconds(0);
    setBreakSeconds(0);
    setIsOnBreak(false);
    const dbId = await addAttendance({ 
      date: getTodayDate(), 
      punchIn: now, 
      punchOut: '-', 
      breakTime: '0 min', 
      totalHours: '-', 
      status: 'present' 
    });
    if (dbId) {
      setTodayId(dbId);
    }
    toast.success(`Punched in at ${now} 🎉`);
  };

  const handleBreakStart = useCallback(() => {
    const now = getCurrentTime();
    setIsOnBreak(true);
    setStatus(STATUS.BREAK);
    if (todayId) {
      updateAttendance(todayId, { breakStart: now });
    }
  }, [todayId]);

  const handleBreakEnd = useCallback(() => {
    const now = getCurrentTime();
    setIsOnBreak(false);
    setStatus(STATUS.WORKING);
    if (todayId) {
      updateAttendance(todayId, { breakEnd: now });
    }
  }, [todayId]);

  const handlePunchOut = () => {
    const now = getCurrentTime();
    setPunchOutTime(now);
    setStatus(STATUS.DONE);
    const totalMins = Math.floor(seconds / 60);
    const breakMins = Math.floor(breakSeconds / 60);
    const netMins = totalMins - breakMins;
    const h = Math.floor(netMins / 60);
    const m = netMins % 60;
    const totalStr = `${h}h ${m}m`;
    if (todayId) {
      updateAttendance(todayId, { punchOut: now, breakTime: `${breakMins} min`, totalHours: totalStr });
    }
    toast.success(`Punched out at ${now}. Total: ${totalStr}`);
  };

  // --- Active Inactivity Tracker & Auto-Resume ---
  useEffect(() => {
    if (!user) return;

    const handleActivity = () => {
      setLastActivity(Date.now());

      // AUTO-RESUME: If the user is on auto-break and makes any movement, automatically resume!
      if (status === STATUS.BREAK && idleAlertTriggered) {
        setIdleAlertTriggered(false);
        setIsIdleModalOpen(false);
        handleBreakEnd();
        toast.success("Welcome back! Your work session has resumed. ⚡");
      }
    };

    window.addEventListener('mousemove', handleActivity);
    window.addEventListener('keydown', handleActivity);
    window.addEventListener('click', handleActivity);
    window.addEventListener('scroll', handleActivity);
    window.addEventListener('touchstart', handleActivity);

    return () => {
      window.removeEventListener('mousemove', handleActivity);
      window.removeEventListener('keydown', handleActivity);
      window.removeEventListener('click', handleActivity);
      window.removeEventListener('scroll', handleActivity);
      window.removeEventListener('touchstart', handleActivity);
    };
  }, [user, status, idleAlertTriggered, handleBreakEnd]);

  // --- Inactivity Idle Checker ---
  useEffect(() => {
    if (!user || status !== STATUS.WORKING || !idleSettings.autoBreakEnabled) return;

    const checkIdle = setInterval(() => {
      const elapsed = Date.now() - lastActivity;
      if (elapsed >= idleSettings.idleTimeout) {
        // Trigger idle break!
        setIdleAlertTriggered(true);
        setIsIdleModalOpen(true);
        handleBreakStart();
        toast('Idle detected! Automatic break started ☕', { icon: '⏸', duration: 4000 });
      }
    }, 1000); // Check every second

    return () => clearInterval(checkIdle);
  }, [user, status, lastActivity, idleSettings, handleBreakStart]);

  return (
    <AppContext.Provider
      value={{
        tasks, addTask, updateTask, deleteTask, toggleTask,
        attendance, addAttendance, updateAttendance, deleteAttendance,
        user, updateUser, setUser,
        registerUser, loginUser, logoutUser,
        
        // Timer states
        status, setStatus,
        seconds, setSeconds,
        breakSeconds, setBreakSeconds,
        punchInTime, setPunchInTime,
        punchOutTime, setPunchOutTime,
        todayId, setTodayId,
        isOnBreak, setIsOnBreak,
        isIdleModalOpen, setIsIdleModalOpen,
        idleAlertTriggered, setIdleAlertTriggered,
        idleSettings, setIdleSettings,
        
        // Handlers
        handlePunchIn, handleBreakStart, handleBreakEnd, handlePunchOut
      }}
    >
      {children}
    </AppContext.Provider>
  );
}
