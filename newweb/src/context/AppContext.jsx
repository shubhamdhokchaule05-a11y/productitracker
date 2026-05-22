import React, { createContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

export const AppContext = createContext();
const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

export function AppProvider({ children }) {
  const [tasks, setTasks] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('userProfile');
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    if (isLoggedIn && saved) return JSON.parse(saved);
    return null;
  });

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
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userProfile');
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

  return (
    <AppContext.Provider
      value={{
        tasks, addTask, updateTask, deleteTask, toggleTask,
        attendance, addAttendance, updateAttendance, deleteAttendance,
        user, updateUser, setUser,
        registerUser, loginUser, logoutUser
      }}
    >
      {children}
    </AppContext.Provider>
  );
}
