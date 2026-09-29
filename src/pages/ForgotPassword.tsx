import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, Send, CheckCircle2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { motion } from 'framer-motion';

export const ForgotPassword: React.FC = () => {
  const { addToast } = useApp();
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    // Simulate recovery link delivery
    await new Promise(resolve => setTimeout(resolve, 800));
    setLoading(false);
    setSubmitted(true);
    addToast('Password reset link sent to your email!', 'success');
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-card-dark border border-slate-200 dark:border-border-dark p-8 rounded-2xl shadow-xl w-full"
    >
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Recover Password</h2>
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1.5">Enter your email and we'll send a recovery link</p>
      </div>

      {!submitted ? (
        <form onSubmit={handleReset} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input 
                type="email"
                required
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:border-brand-500 transition-colors text-slate-200"
              />
            </div>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-brand-500 hover:bg-brand-600 disabled:bg-brand-500/50 transition-colors text-white font-bold text-xs uppercase tracking-wider rounded-xl cursor-pointer"
          >
            {loading ? 'Sending Link...' : 'Send Recovery Link'}
            <Send className="w-4 h-4" />
          </button>
        </form>
      ) : (
        <div className="text-center space-y-4 py-4">
          <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <p className="text-sm leading-relaxed text-slate-300">
            A secure recovery link has been sent to <strong className="text-white">{email}</strong>. Please check your inbox and follow the instructions to reset your password.
          </p>
        </div>
      )}

      <div className="text-center mt-6">
        <Link to="/login" className="inline-flex items-center gap-1 text-xs text-brand-500 hover:underline font-semibold">
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Sign In
        </Link>
      </div>
    </motion.div>
  );
};
