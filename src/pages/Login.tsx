import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as zod from 'zod';
import { useApp } from '../context/AppContext';
import {
  Mail, Lock, LogIn, ShieldCheck, Sparkles, Loader2,
  Rocket, Users, ChevronRight, CheckCircle2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const loginSchema = zod.object({
  email:    zod.string().email('Please enter a valid email address'),
  password: zod.string().min(6, 'Password must be at least 6 characters'),
});
type LoginFormValues = zod.infer<typeof loginSchema>;

type RoleOption = { id: string; label: string; description: string; color: string; accent: string; emoji: string };

const ROLE_OPTIONS: RoleOption[] = [
  {
    id:          'FOUNDER',
    label:       'Founder',
    description: 'Full access to all AI tools, business plan, analytics and settings.',
    color:       'from-violet-600 to-brand-500',
    accent:      'brand',
    emoji:       '🚀',
  },
  {
    id:          'TEAM_MEMBER',
    label:       'Team Member',
    description: 'Collaborate on tasks, view progress and contribute to the workspace.',
    color:       'from-indigo-500 to-blue-500',
    accent:      'indigo',
    emoji:       '👥',
  },
];

export const Login: React.FC = () => {
  const { login, addToast } = useApp();
  const navigate = useNavigate();

  const [selectedRole, setSelectedRole] = useState<string>('FOUNDER');
  const [loadingRole,  setLoadingRole]  = useState<string | null>(null);
  const [step,         setStep]         = useState<'role' | 'credentials'>('role');

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (data: LoginFormValues) => {
    try {
      const success = await login(data.email, selectedRole, data.password);
      if (success) navigate('/');
    } catch {
      addToast('Invalid credentials', 'error');
    }
  };

  const triggerDemoLogin = async (email: string, role: string) => {
    setLoadingRole(role);
    try {
      const success = await login(email, role);
      if (success) navigate('/');
    } catch {
      addToast('Demo login failed', 'error');
    } finally {
      setLoadingRole(null);
    }
  };

  const activeRole = ROLE_OPTIONS.find(r => r.id === selectedRole)!;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-card-dark border border-slate-200 dark:border-border-dark rounded-2xl shadow-2xl w-full overflow-hidden"
    >
      {/* Step indicator */}
      <div className="flex border-b border-slate-100 dark:border-slate-800">
        {(['role', 'credentials'] as const).map((s, i) => (
          <button key={s} onClick={() => s === 'role' && setStep('role')}
            className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors ${
              step === s
                ? 'text-brand-500 border-b-2 border-brand-500 bg-brand-500/5'
                : step === 'credentials' && s === 'role'
                  ? 'text-emerald-500 bg-emerald-500/5 cursor-pointer'
                  : 'text-slate-400 cursor-default'
            }`}>
            {step === 'credentials' && s === 'role'
              ? <CheckCircle2 className="w-3.5 h-3.5" />
              : <span className="w-4 h-4 rounded-full border-2 flex items-center justify-center text-[9px]"
                  style={{ borderColor: 'currentColor' }}>{i + 1}</span>}
            {s === 'role' ? 'Choose Role' : 'Sign In'}
          </button>
        ))}
      </div>

      <div className="p-7">
        <AnimatePresence mode="wait">

          {/* ── Step 1: Role selector ── */}
          {step === 'role' && (
            <motion.div key="role" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
              <div className="text-center mb-6">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Who are you?</h2>
                <p className="text-xs text-slate-400 mt-1">Select your role to personalise your dashboard</p>
              </div>

              <div className="space-y-3 mb-6">
                {ROLE_OPTIONS.map(role => (
                  <button key={role.id} onClick={() => setSelectedRole(role.id)}
                    className={`w-full p-4 rounded-2xl border-2 text-left flex items-center gap-4 transition-all ${
                      selectedRole === role.id
                        ? 'border-brand-500 bg-brand-500/5 dark:bg-brand-500/10'
                        : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                    }`}>
                    {/* Emoji icon */}
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${role.color} flex items-center justify-center text-2xl shrink-0 shadow-lg`}>
                      {role.emoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 dark:text-white text-sm">{role.label}</span>
                        {selectedRole === role.id && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-brand-500 text-white font-bold uppercase tracking-wider">Selected</span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">{role.description}</p>
                    </div>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                      selectedRole === role.id ? 'border-brand-500 bg-brand-500' : 'border-slate-300 dark:border-slate-600'
                    }`}>
                      {selectedRole === role.id && <div className="w-2 h-2 rounded-full bg-white" />}
                    </div>
                  </button>
                ))}
              </div>

              <button onClick={() => setStep('credentials')}
                className="w-full flex items-center justify-center gap-2 py-3 bg-brand-500 hover:bg-brand-600 transition-colors text-white font-bold text-sm rounded-xl">
                Continue as {activeRole.emoji} {activeRole.label}
                <ChevronRight className="w-4 h-4" />
              </button>

              {/* Quick demo tiles */}
              <div className="mt-5">
                <div className="relative mb-4">
                  <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200 dark:border-slate-800" /></div>
                  <div className="relative flex justify-center"><span className="bg-white dark:bg-card-dark px-3 text-[10px] uppercase font-bold text-slate-400">Or quick demo</span></div>
                </div>
                <div className="grid grid-cols-1 gap-2">
                  {[
                    { email: 'piyush@startupos.com', role: 'FOUNDER',     label: 'Founder Demo',     sub: 'Piyush Sakha · EcoSphere AI',    color: 'text-brand-500',  bg: 'bg-brand-500/10',  icon: '🚀' },
                    { email: 'sarah@startupos.com',  role: 'TEAM_MEMBER', label: 'Team Member Demo', sub: 'Sarah Chen · Collaborator',       color: 'text-indigo-500', bg: 'bg-indigo-500/10', icon: '👥' },
                    { email: 'admin@startupos.com',  role: 'ADMIN',       label: 'Platform Admin',   sub: 'Alex Miller · Global Analytics',  color: 'text-rose-500',   bg: 'bg-rose-500/10',   icon: '🛡️' },
                  ].map(d => (
                    <button key={d.role} onClick={() => triggerDemoLogin(d.email, d.role)}
                      disabled={loadingRole !== null}
                      className="flex items-center justify-between px-3 py-2.5 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-xl transition-all group">
                      <div className="flex items-center gap-2.5">
                        <span className={`w-7 h-7 rounded-lg ${d.bg} flex items-center justify-center text-sm`}>{d.icon}</span>
                        <div className="text-left">
                          <span className="text-xs font-bold text-slate-800 dark:text-white">{d.label}</span>
                          <p className="text-[10px] text-slate-400">{d.sub}</p>
                        </div>
                      </div>
                      {loadingRole === d.role
                        ? <Loader2 className={`w-3.5 h-3.5 animate-spin ${d.color}`} />
                        : <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200 transition-colors" />}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* ── Step 2: Credentials ── */}
          {step === 'credentials' && (
            <motion.div key="creds" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              {/* Role badge */}
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Welcome back</h2>
                  <p className="text-xs text-slate-400 mt-0.5">Sign in to your StartupOS account</p>
                </div>
                <button onClick={() => setStep('role')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r ${activeRole.color} text-white shadow-md`}>
                  {activeRole.emoji} {activeRole.label}
                </button>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Email Address</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input type="email" {...register('email')} placeholder="name@company.com"
                      className={`w-full bg-slate-50 dark:bg-slate-900/60 border ${errors.email ? 'border-rose-500/50' : 'border-slate-200 dark:border-slate-800'} rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:border-brand-500 transition-colors text-slate-800 dark:text-slate-200`} />
                  </div>
                  {errors.email && <p className="text-xs text-rose-500 mt-1">{errors.email.message}</p>}
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Password</label>
                    <Link to="/forgot-password" className="text-xs text-brand-500 hover:underline">Forgot password?</Link>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input type="password" {...register('password')} placeholder="••••••••"
                      className={`w-full bg-slate-50 dark:bg-slate-900/60 border ${errors.password ? 'border-rose-500/50' : 'border-slate-200 dark:border-slate-800'} rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:border-brand-500 transition-colors text-slate-800 dark:text-slate-200`} />
                  </div>
                  {errors.password && <p className="text-xs text-rose-500 mt-1">{errors.password.message}</p>}
                </div>

                <button type="submit" disabled={isSubmitting}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-brand-500 hover:bg-brand-600 disabled:bg-brand-500/50 transition-colors text-white font-bold text-sm rounded-xl">
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogIn className="w-4 h-4" />}
                  Sign In as {activeRole.label}
                </button>
              </form>

              <div className="text-center mt-5 text-xs text-slate-500">
                Don't have an account?{' '}
                <Link to="/register" className="text-brand-500 hover:underline font-semibold">Create account</Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};
