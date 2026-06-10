import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiMail, FiLock, FiEye, FiEyeOff, FiZap, FiAlertCircle, FiArrowLeft, FiCheck } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { AppContext } from '../context/AppContext';

function LoginPage() {
  const navigate = useNavigate();
  const { loginUser, requestPasswordResetCode, resetPasswordWithCode } = useContext(AppContext);
  
  // View states: 'login', 'forgot', 'reset'
  const [view, setView] = useState('login');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showPass, setShowPass] = useState(false);

  // Form states
  const [form, setForm] = useState({ email: '', password: '', remember: false });
  const [forgotEmail, setForgotEmail] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const validateLogin = () => {
    const errs = {};
    if (!form.email) errs.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Enter a valid email';
    if (!form.password) errs.password = 'Password is required';
    return errs;
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    const errs = validateLogin();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setLoading(true);

    const result = await loginUser(form.email, form.password);
    if (result.success) {
      toast.success('Welcome back! 🎉');
      navigate('/dashboard');
    } else {
      setLoading(false);
      toast.error(result.message || 'Invalid credentials. Check email and password.');
      setErrors({ general: result.message || 'Invalid email or password.' });
    }
  };

  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    if (!forgotEmail) {
      setErrors({ forgotEmail: 'Email is required' });
      return;
    }
    if (!/\S+@\S+\.\S+/.test(forgotEmail)) {
      setErrors({ forgotEmail: 'Enter a valid email' });
      return;
    }
    setErrors({});
    setLoading(true);
    const result = await requestPasswordResetCode(forgotEmail);
    setLoading(false);
    if (result.success) {
      toast.success('Verification code sent to your email! 📨');
      setView('reset');
    } else {
      toast.error(result.message || 'Email not registered.');
      setErrors({ forgotEmail: result.message || 'Email not registered.' });
    }
  };

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!resetCode) errs.resetCode = 'Verification code is required';
    if (!newPassword) errs.newPassword = 'Password is required';
    else if (newPassword.length < 8) errs.newPassword = 'Password must be at least 8 characters';
    if (newPassword !== confirmPassword) errs.confirmPassword = 'Passwords do not match';
    
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    setErrors({});
    setLoading(true);
    const result = await resetPasswordWithCode(forgotEmail, resetCode, newPassword);
    setLoading(false);
    if (result.success) {
      toast.success('Password reset successfully! 🔐');
      setView('login');
      setForm({ email: forgotEmail, password: '', remember: false });
      setResetCode('');
      setNewPassword('');
      setConfirmPassword('');
    } else {
      toast.error(result.message || 'Password reset failed.');
      setErrors({ resetCode: result.message || 'Invalid or expired code.' });
    }
  };

  const inputClass = (error) => `w-full pl-11 pr-4 py-3 bg-white/10 border ${
    error ? 'border-red-400/60' : 'border-white/20'
  } rounded-xl text-white placeholder-white/30 text-sm focus:outline-none focus:border-indigo-400 focus:bg-white/15 transition-all`;

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-indigo-900 via-purple-900 to-gray-900">
      {/* Card */}
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, type: 'spring', stiffness: 200, damping: 25 }}
        className="relative z-10 w-full max-w-md mx-4"
      >
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl">
          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <motion.div
              whileHover={{ rotate: 15 }}
              className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-xl mb-3"
            >
              <FiZap className="w-7 h-7 text-white" />
            </motion.div>
            <h1 className="text-2xl font-bold text-white">ProductiTrack</h1>
            <p className="text-sm text-white/60 mt-1">
              {view === 'login' && 'Sign in to your workspace'}
              {view === 'forgot' && 'Reset your account password'}
              {view === 'reset' && 'Enter your verification code'}
            </p>
          </div>

          {/* VIEW: LOGIN */}
          {view === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4" noValidate>
              {errors.general && (
                <div className="px-4 py-3 bg-red-500/20 border border-red-400/30 rounded-xl text-red-300 text-sm">
                  {errors.general}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-white/80 mb-1.5">Email Address</label>
                <div className="relative">
                  <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="you@company.com"
                    className={inputClass(errors.email)}
                  />
                </div>
                {errors.email && (
                  <p className="text-red-300 text-xs mt-1 ml-1">{errors.email}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-1.5">Password</label>
                <div className="relative">
                  <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    placeholder="••••••••"
                    className={inputClass(errors.password)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass((p) => !p)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors"
                  >
                    {showPass ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-300 text-xs mt-1 ml-1">{errors.password}</p>
                )}
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={form.remember}
                    onChange={(e) => setForm({ ...form, remember: e.target.checked })}
                    className="w-4 h-4 rounded border-white/30 accent-indigo-500 cursor-pointer"
                  />
                  <span className="text-sm text-white/60 group-hover:text-white/80 transition-colors">Remember me</span>
                </label>
                <button
                  type="button"
                  onClick={() => { setView('forgot'); setErrors({}); }}
                  className="text-sm text-indigo-300 hover:text-indigo-200 transition-colors cursor-pointer bg-transparent border-0"
                >
                  Forgot password?
                </button>
              </div>

              <motion.button
                type="submit"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold rounded-xl shadow-lg shadow-indigo-900/50 transition-all disabled:opacity-70 disabled:cursor-not-allowed mt-2"
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </motion.button>
            </form>
          )}

          {/* VIEW: FORGOT PASSWORD REQUEST */}
          {view === 'forgot' && (
            <form onSubmit={handleForgotSubmit} className="space-y-4" noValidate>
              <div>
                <label className="block text-sm font-medium text-white/80 mb-1.5">Enter Email Address</label>
                <div className="relative">
                  <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                  <input
                    type="email"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="you@company.com"
                    className={inputClass(errors.forgotEmail)}
                  />
                </div>
                {errors.forgotEmail && (
                  <p className="text-red-300 text-xs mt-1 ml-1">{errors.forgotEmail}</p>
                )}
                <p className="text-[11px] text-white/40 mt-1.5 leading-relaxed">
                  We will send a 6-digit verification code directly to your email address. Please check your inbox.
                </p>
              </div>

              <motion.button
                type="submit"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold rounded-xl shadow-lg shadow-indigo-900/50 transition-all disabled:opacity-70 disabled:cursor-not-allowed mt-2"
              >
                {loading ? 'Sending Code...' : 'Send Verification Code'}
              </motion.button>

              <button
                type="button"
                onClick={() => { setView('login'); setErrors({}); }}
                className="flex items-center justify-center gap-1.5 w-full text-sm text-indigo-300 hover:text-indigo-200 transition-colors mt-2"
              >
                <FiArrowLeft className="w-4 h-4" /> Back to Sign In
              </button>
            </form>
          )}

          {/* VIEW: VERIFY & RESET PASSWORD */}
          {view === 'reset' && (
            <form onSubmit={handleResetSubmit} className="space-y-4" noValidate>
              <div>
                <label className="block text-sm font-medium text-white/80 mb-1.5">Verification Code</label>
                <div className="relative">
                  <FiCheck className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                  <input
                    type="text"
                    maxLength={6}
                    value={resetCode}
                    onChange={(e) => setResetCode(e.target.value)}
                    placeholder="6-digit code"
                    className={`${inputClass(errors.resetCode)} tracking-widest text-center font-bold text-lg`}
                  />
                </div>
                {errors.resetCode && (
                  <p className="text-red-300 text-xs mt-1 ml-1">{errors.resetCode}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-1.5">New Password</label>
                <div className="relative">
                  <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="At least 8 characters"
                    className={inputClass(errors.newPassword)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass((p) => !p)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors"
                  >
                    {showPass ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.newPassword && (
                  <p className="text-red-300 text-xs mt-1 ml-1">{errors.newPassword}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-1.5">Confirm New Password</label>
                <div className="relative">
                  <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter password"
                    className={inputClass(errors.confirmPassword)}
                  />
                </div>
                {errors.confirmPassword && (
                  <p className="text-red-300 text-xs mt-1 ml-1">{errors.confirmPassword}</p>
                )}
              </div>

              <motion.button
                type="submit"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold rounded-xl shadow-lg shadow-indigo-900/50 transition-all disabled:opacity-70 disabled:cursor-not-allowed mt-2"
              >
                {loading ? 'Resetting Password...' : 'Reset Password'}
              </motion.button>

              <button
                type="button"
                onClick={() => { setView('forgot'); setErrors({}); }}
                className="flex items-center justify-center gap-1.5 w-full text-sm text-indigo-300 hover:text-indigo-200 transition-colors mt-2"
              >
                <FiArrowLeft className="w-4 h-4" /> Resend Code
              </button>
            </form>
          )}

          <p className="text-center text-sm text-white/60 mt-6">
            Don't have an account?{' '}
            <Link to="/signup" className="text-indigo-300 hover:text-indigo-200 font-medium">
              Create One
            </Link>
          </p>

          <p className="text-center text-xs text-white/40 mt-6">
            © 2026 ProductiTrack · All rights reserved
          </p>
        </div>
      </motion.div>
    </div>
  );
}

export default LoginPage;
