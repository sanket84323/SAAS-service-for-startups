import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as zod from 'zod';
import { useApp } from '../context/AppContext';
import { Mail, Lock, User, UserPlus, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

const registerSchema = zod.object({
  firstName: zod.string().min(2, 'First name must be at least 2 characters'),
  lastName: zod.string().min(1, 'Last name is required'),
  email: zod.string().email('Please enter a valid email address'),
  password: zod.string().min(6, 'Password must be at least 6 characters')
});

type RegisterFormValues = zod.infer<typeof registerSchema>;

export const Register: React.FC = () => {
  const { register: registerUser, addToast } = useApp();
  const navigate = useNavigate();
  const [avatarBase64, setAvatarBase64] = useState<string>('');

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { firstName: '', lastName: '', email: '', password: '' }
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        addToast('Image must be less than 2MB', 'error');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarBase64(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data: RegisterFormValues) => {
    try {
      const success = await registerUser(data.firstName, data.lastName, data.email, data.password, avatarBase64);
      if (success) {
        navigate('/');
      }
    } catch (err) {
      addToast('Registration failed. Please try again.', 'error');
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-card-dark border border-slate-200 dark:border-border-dark p-8 rounded-2xl shadow-xl w-full"
    >
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Create Your Account</h2>
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1.5">Get started with AI StartupOS for free</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">First Name</label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input 
                type="text"
                {...register('firstName')}
                placeholder="John"
                className={`w-full bg-slate-50 dark:bg-slate-900/60 border ${errors.firstName ? 'border-rose-500/50' : 'border-slate-200 dark:border-slate-800'} rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-brand-500 transition-colors text-slate-200`}
              />
            </div>
            {errors.firstName && <p className="text-xs text-rose-500 mt-1">{errors.firstName.message}</p>}
          </div>

          <div className="flex-1">
            <label className="block text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">Last Name</label>
            <input 
              type="text"
              {...register('lastName')}
              placeholder="Doe"
              className={`w-full bg-slate-50 dark:bg-slate-900/60 border ${errors.lastName ? 'border-rose-500/50' : 'border-slate-200 dark:border-slate-800'} rounded-xl py-2 px-4 text-sm focus:outline-none focus:border-brand-500 transition-colors text-slate-200`}
            />
            {errors.lastName && <p className="text-xs text-rose-500 mt-1">{errors.lastName.message}</p>}
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">Email Address</label>
          <div className="relative">
            <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input 
              type="email"
              {...register('email')}
              placeholder="john@example.com"
              className={`w-full bg-slate-50 dark:bg-slate-900/60 border ${errors.email ? 'border-rose-500/50' : 'border-slate-200 dark:border-slate-800'} rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:border-brand-500 transition-colors text-slate-200`}
            />
          </div>
          {errors.email && <p className="text-xs text-rose-500 mt-1">{errors.email.message}</p>}
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">Password</label>
          <div className="relative">
            <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input 
              type="password"
              {...register('password')}
              placeholder="••••••••"
              className={`w-full bg-slate-50 dark:bg-slate-900/60 border ${errors.password ? 'border-rose-500/50' : 'border-slate-200 dark:border-slate-800'} rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:border-brand-500 transition-colors text-slate-200`}
            />
          </div>
          {errors.password && <p className="text-xs text-rose-500 mt-1">{errors.password.message}</p>}
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">Profile Image (Optional)</label>
          <div className="flex items-center gap-4">
            {avatarBase64 ? (
              <img src={avatarBase64} alt="Avatar preview" className="w-12 h-12 rounded-full object-cover border border-slate-200 dark:border-slate-800" />
            ) : (
              <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center border border-slate-200 dark:border-slate-800 shrink-0">
                <User className="w-5 h-5 text-slate-400" />
              </div>
            )}
            <input 
              type="file" 
              accept="image/*" 
              onChange={handleFileChange}
              className="text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-brand-500/10 file:text-brand-500 hover:file:bg-brand-500/20 cursor-pointer"
            />
          </div>
        </div>

        <button 
          type="submit"
          disabled={isSubmitting}
          className="w-full flex items-center justify-center gap-2 py-2.5 bg-brand-500 hover:bg-brand-600 disabled:bg-brand-500/50 transition-colors text-white font-bold text-xs uppercase tracking-wider rounded-xl cursor-pointer"
        >
          {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
          Register & Create Startup
        </button>
      </form>

      <div className="text-center mt-6 text-xs text-slate-500">
        Already have an account?{' '}
        <Link to="/login" className="text-brand-500 hover:underline font-semibold">
          Sign in
        </Link>
      </div>
    </motion.div>
  );
};
