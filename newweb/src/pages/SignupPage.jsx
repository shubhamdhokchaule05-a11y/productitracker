import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiMail, FiLock, FiUser, FiZap, FiEye, FiEyeOff } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { AppContext } from '../context/AppContext';

function SignupPage() {
  const navigate = useNavigate();
  const { registerUser } = useContext(AppContext);
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '', role: 'Team Member' });
  const [showPass, setShowPass] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const errs = {};
    if (!form.name) errs.name = 'Full name is required';
    if (!form.email) errs.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Enter a valid email';
    
    if (!form.password) errs.password = 'Password is required';
    else if (form.password.length < 8) errs.password = 'Password must be at least 8 characters';
    
    if (form.password !== form.confirmPassword) errs.confirmPassword = 'Passwords do not match';
    
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setLoading(true);

    const newUser = {
      name: form.name,
      email: form.email,
      password: form.password,
      role: form.role,
    };
    
    const result = await registerUser(newUser);
    if (result.success) {
      toast.success('Account created successfully! Please login.');
      navigate('/login');
    } else {
      setLoading(false);
      toast.error(result.message || 'Registration failed');
      setErrors({ email: result.message });
    }
  };

  const inputClass = (error) => `w-full pl-11 pr-4 py-3 bg-white/10 border ${
    error ? 'border-red-400/60' : 'border-white/20'
  } rounded-xl text-white placeholder-white/30 text-sm focus:outline-none focus:border-indigo-400 focus:bg-white/15 transition-all`;

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-indigo-900 via-purple-900 to-gray-900">

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className="relative z-10 w-full max-w-md mx-4"
      >
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl">
          <div className="flex flex-col items-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-xl mb-3">
              <FiZap className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white">Create Account</h1>
            <p className="text-sm text-white/60 mt-1">Join ProductiTrack today</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white/80 mb-1.5">Full Name</label>
              <div className="relative">
                <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                <input
                  type="text"
                  placeholder="John Doe"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className={inputClass(errors.name)}
                />
              </div>
              {errors.name && <p className="text-red-300 text-xs mt-1 ml-1">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-white/80 mb-1.5">Email Address</label>
              <div className="relative">
                <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                <input
                  type="email"
                  placeholder="you@company.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className={inputClass(errors.email)}
                />
              </div>
              {errors.email && <p className="text-red-300 text-xs mt-1 ml-1">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-white/80 mb-1.5">Password</label>
              <div className="relative">
                <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                <input
                  type={showPass ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className={inputClass(errors.password)}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70"
                >
                  {showPass ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-red-300 text-xs mt-1 ml-1">{errors.password}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-white/80 mb-1.5">Confirm Password</label>
              <div className="relative">
                <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                <input
                  type={showPass ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={form.confirmPassword}
                  onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                  className={inputClass(errors.confirmPassword)}
                />
              </div>
              {errors.confirmPassword && <p className="text-red-300 text-xs mt-1 ml-1">{errors.confirmPassword}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-white/80 mb-1.5">Role</label>
              <div className="relative">
                <select
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white text-sm focus:outline-none focus:border-indigo-400 focus:bg-white/15 transition-all outline-none"
                  style={{ colorScheme: 'dark' }}
                >
                  <option value="Team Member" className="bg-gray-800 text-white">Team Member</option>
                  <option value="Admin" className="bg-gray-800 text-white">Admin</option>
                </select>
              </div>
            </div>

            <motion.button
              type="submit"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold rounded-xl shadow-lg transition-all disabled:opacity-70 mt-4"
            >
              {loading ? 'Creating Account...' : 'Sign Up'}
            </motion.button>
          </form>

          <p className="text-center text-sm text-white/60 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-indigo-300 hover:text-indigo-200 font-medium">
              Sign In
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}

export default SignupPage;
