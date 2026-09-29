import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import type { StartupProfile } from '../types';
import {
  User, Building2, Mail, Calendar, Shield, Briefcase,
  Users, Target, Lightbulb, DollarSign, Edit3, Save,
  X, CheckCircle, Cpu, Globe, Sparkles, Award, Zap,
  BarChart2, Clock, CreditCard
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const UserProfile: React.FC = () => {
  const { user, workspace, addToast } = useApp();

  const [profile, setProfile] = useState<StartupProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [editingProfile, setEditingProfile] = useState(false);
  const [draftProfile, setDraftProfile] = useState<StartupProfile | null>(null);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'personal' | 'business'>('personal');

  useEffect(() => {
    if (workspace?.id) {
      setProfileLoading(true);
      api.getProfile(workspace.id)
        .then(p => {
          setProfile(p);
          setDraftProfile(p);
        })
        .catch(() => {
          setProfile(null);
        })
        .finally(() => setProfileLoading(false));
    }
  }, [workspace?.id]);

  const handleEditProfile = () => {
    setDraftProfile(profile ? { ...profile } : {
      id: '',
      workspaceId: workspace?.id || '',
      name: workspace?.name || '',
      industry: workspace?.industry || '',
      targetAudience: workspace?.targetAudience || '',
      problem: '',
      solution: '',
      competitors: '',
      revenueModel: '',
      oneLiner: '',
    });
    setEditingProfile(true);
  };

  const handleSaveProfile = async () => {
    if (!draftProfile) return;
    setSaving(true);
    try {
      const saved = await api.saveProfile(draftProfile);
      setProfile(saved);
      setEditingProfile(false);
      addToast('Business profile updated!', 'success');
    } catch (e: any) {
      addToast(e.message || 'Failed to save profile', 'error');
    } finally {
      setSaving(false);
    }
  };

  const planColors: Record<string, string> = {
    FREE: 'text-slate-400 bg-slate-400/10',
    PRO: 'text-brand-400 bg-brand-400/10',
    ENTERPRISE: 'text-amber-400 bg-amber-400/10',
  };

  const joinedDate = user?.joinedAt
    ? new Date(user.joinedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : '—';

  const workspaceDate = workspace?.createdAt
    ? new Date(workspace.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : '—';

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Hero Banner */}
      <div className="relative bg-white dark:bg-card-dark border border-slate-200 dark:border-border-dark rounded-2xl overflow-hidden shadow-sm">
        {/* Background gradient mesh */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-brand-500/10 rounded-full blur-[80px]" />
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-indigo-500/10 rounded-full blur-[80px]" />
        </div>

        <div className="relative p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center gap-6">
          {/* Avatar */}
          <div className="relative shrink-0">
            <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl ring-4 ring-brand-500/20 overflow-hidden bg-gradient-to-tr from-brand-500 to-indigo-600 flex items-center justify-center shadow-xl">
              {user?.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.firstName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-white font-black text-3xl">
                  {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                </span>
              )}
            </div>
            <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-white dark:border-card-dark shadow" />
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                {user?.firstName} {user?.lastName}
              </h1>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${planColors[workspace?.activePlan || 'FREE']}`}>
                {workspace?.activePlan || 'FREE'}
              </span>
            </div>
            <p className="text-slate-500 text-sm mb-3">{user?.email}</p>
            <div className="flex flex-wrap gap-3">
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <Shield className="w-3.5 h-3.5 text-brand-400" />
                <span className="capitalize font-medium">{user?.role?.toLowerCase().replace('_', ' ')}</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <Calendar className="w-3.5 h-3.5 text-brand-400" />
                <span>Joined {joinedDate}</span>
              </div>
              {workspace && (
                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <Building2 className="w-3.5 h-3.5 text-brand-400" />
                  <span>{workspace.name} · {workspace.industry}</span>
                </div>
              )}
            </div>
          </div>

          {/* Plan badge */}
          <div className="hidden md:flex items-center shrink-0">
            <span className={`text-xs font-bold px-3 py-1.5 rounded-full border border-brand-500/25 bg-brand-500/10 text-brand-400 uppercase`}>
              {workspace?.activePlan || 'FREE'} Plan
            </span>
          </div>
        </div>

        {/* Tab navigation */}
        <div className="relative border-t border-slate-100 dark:border-slate-800 flex px-6 md:px-8">
          {(['personal', 'business'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`relative px-4 py-3 text-xs font-bold uppercase tracking-wider transition-colors ${
                activeTab === tab
                  ? 'text-brand-500 dark:text-brand-400'
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
              }`}
            >
              {tab === 'personal' ? '👤 Personal Info' : '🏢 Business Profile'}
              {activeTab === tab && (
                <motion.div
                  layoutId="tab-indicator"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-500 rounded-t-full"
                />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'personal' && (
          <motion.div
            key="personal"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-5"
          >
            {/* Personal Details Card */}
            <div className="bg-white dark:bg-card-dark border border-slate-200 dark:border-border-dark rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-5">
                <div className="w-8 h-8 rounded-lg bg-brand-500/10 flex items-center justify-center">
                  <User className="w-4 h-4 text-brand-500" />
                </div>
                <h2 className="text-sm font-bold text-slate-800 dark:text-white">Personal Details</h2>
              </div>
              <div className="space-y-4">
                <InfoRow icon={<User className="w-3.5 h-3.5" />} label="Full Name" value={`${user?.firstName || ''} ${user?.lastName || ''}`} />
                <InfoRow icon={<Mail className="w-3.5 h-3.5" />} label="Email Address" value={user?.email || '—'} />
                <InfoRow icon={<Shield className="w-3.5 h-3.5" />} label="Account Role" value={user?.role?.replace('_', ' ') || '—'} capitalize />
                <InfoRow icon={<Calendar className="w-3.5 h-3.5" />} label="Member Since" value={joinedDate} />
              </div>
            </div>

            {/* Workspace Overview Card */}
            <div className="bg-white dark:bg-card-dark border border-slate-200 dark:border-border-dark rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-5">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                  <Building2 className="w-4 h-4 text-indigo-500" />
                </div>
                <h2 className="text-sm font-bold text-slate-800 dark:text-white">Workspace Overview</h2>
              </div>
              <div className="space-y-4">
                <InfoRow icon={<Briefcase className="w-3.5 h-3.5" />} label="Workspace Name" value={workspace?.name || '—'} />
                <InfoRow icon={<Globe className="w-3.5 h-3.5" />} label="Industry" value={workspace?.industry || '—'} />
                <InfoRow icon={<Users className="w-3.5 h-3.5" />} label="Team Members" value={`${workspace?.teamMembersCount || 1} member(s)`} />
                <InfoRow icon={<Calendar className="w-3.5 h-3.5" />} label="Created On" value={workspaceDate} />
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'business' && (
          <motion.div
            key="business"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="space-y-5"
          >
            {/* Business Profile Header */}
            <div className="bg-white dark:bg-card-dark border border-slate-200 dark:border-border-dark rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-brand-500/10 flex items-center justify-center">
                    <Cpu className="w-4 h-4 text-brand-500" />
                  </div>
                  <h2 className="text-sm font-bold text-slate-800 dark:text-white">Startup Business Profile</h2>
                </div>
                {!editingProfile ? (
                  <button
                    onClick={handleEditProfile}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-500/10 hover:bg-brand-500/20 text-brand-500 text-xs font-bold transition-colors"
                  >
                    <Edit3 className="w-3.5 h-3.5" /> Edit Profile
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setEditingProfile(false)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold transition-colors"
                    >
                      <X className="w-3.5 h-3.5" /> Cancel
                    </button>
                    <button
                      onClick={handleSaveProfile}
                      disabled={saving}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold transition-colors disabled:opacity-50"
                    >
                      <Save className="w-3.5 h-3.5" />
                      {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                )}
              </div>

              {profileLoading ? (
                <div className="flex items-center justify-center py-12 text-slate-400">
                  <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mr-3" />
                  Loading business profile...
                </div>
              ) : !editingProfile ? (
                /* View Mode */
                profile ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <ProfileViewField
                      icon={<Briefcase className="w-4 h-4" />}
                      label="Startup Name"
                      value={profile.name}
                      color="brand"
                    />
                    <ProfileViewField
                      icon={<Globe className="w-4 h-4" />}
                      label="Industry"
                      value={profile.industry}
                      color="indigo"
                    />
                    <ProfileViewField
                      icon={<Sparkles className="w-4 h-4" />}
                      label="One-Liner Pitch"
                      value={profile.oneLiner}
                      color="emerald"
                      fullWidth
                    />
                    <ProfileViewField
                      icon={<Lightbulb className="w-4 h-4" />}
                      label="Problem Being Solved"
                      value={profile.problem}
                      color="amber"
                      fullWidth
                    />
                    <ProfileViewField
                      icon={<CheckCircle className="w-4 h-4" />}
                      label="Your Solution"
                      value={profile.solution}
                      color="emerald"
                      fullWidth
                    />
                    <ProfileViewField
                      icon={<Target className="w-4 h-4" />}
                      label="Target Audience"
                      value={profile.targetAudience}
                      color="rose"
                    />
                    <ProfileViewField
                      icon={<DollarSign className="w-4 h-4" />}
                      label="Revenue Model"
                      value={profile.revenueModel}
                      color="brand"
                    />
                    <ProfileViewField
                      icon={<BarChart2 className="w-4 h-4" />}
                      label="Key Competitors"
                      value={profile.competitors}
                      color="slate"
                    />
                  </div>
                ) : (
                  /* No profile yet */
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="w-14 h-14 rounded-2xl bg-brand-500/10 flex items-center justify-center mb-4">
                      <Briefcase className="w-7 h-7 text-brand-500" />
                    </div>
                    <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-1">No Business Profile Yet</h3>
                    <p className="text-sm text-slate-400 max-w-sm mb-5">
                      Fill in your startup details so AI features can be personalized to your business.
                    </p>
                    <button
                      onClick={handleEditProfile}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold transition-colors"
                    >
                      <Edit3 className="w-3.5 h-3.5" /> Create Business Profile
                    </button>
                  </div>
                )
              ) : (
                /* Edit Mode */
                draftProfile && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <ProfileEditField
                      label="Startup Name *"
                      value={draftProfile.name}
                      onChange={v => setDraftProfile(p => p ? { ...p, name: v } : p)}
                      placeholder="e.g. EcoSphere AI"
                    />
                    <ProfileEditField
                      label="Industry *"
                      value={draftProfile.industry}
                      onChange={v => setDraftProfile(p => p ? { ...p, industry: v } : p)}
                      placeholder="e.g. Sustainability Tech"
                    />
                    <ProfileEditField
                      label="One-Liner Pitch"
                      value={draftProfile.oneLiner}
                      onChange={v => setDraftProfile(p => p ? { ...p, oneLiner: v } : p)}
                      placeholder="e.g. Automate carbon accounting in minutes"
                      fullWidth
                    />
                    <ProfileEditField
                      label="Problem Being Solved"
                      value={draftProfile.problem}
                      onChange={v => setDraftProfile(p => p ? { ...p, problem: v } : p)}
                      placeholder="Describe the core problem you solve..."
                      textarea
                      fullWidth
                    />
                    <ProfileEditField
                      label="Your Solution"
                      value={draftProfile.solution}
                      onChange={v => setDraftProfile(p => p ? { ...p, solution: v } : p)}
                      placeholder="How do you solve it uniquely?"
                      textarea
                      fullWidth
                    />
                    <ProfileEditField
                      label="Target Audience"
                      value={draftProfile.targetAudience}
                      onChange={v => setDraftProfile(p => p ? { ...p, targetAudience: v } : p)}
                      placeholder="e.g. SMBs, B2B SaaS companies"
                    />
                    <ProfileEditField
                      label="Revenue Model"
                      value={draftProfile.revenueModel}
                      onChange={v => setDraftProfile(p => p ? { ...p, revenueModel: v } : p)}
                      placeholder="e.g. SaaS subscription $99/mo"
                    />
                    <ProfileEditField
                      label="Key Competitors"
                      value={draftProfile.competitors}
                      onChange={v => setDraftProfile(p => p ? { ...p, competitors: v } : p)}
                      placeholder="e.g. Greenly, Watershed, Plan A"
                    />
                  </div>
                )
              )}
            </div>

            {/* Workspace Description Card */}
            {workspace?.description && (
              <div className="bg-white dark:bg-card-dark border border-slate-200 dark:border-border-dark rounded-2xl p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                    <Clock className="w-4 h-4 text-indigo-500" />
                  </div>
                  <h2 className="text-sm font-bold text-slate-800 dark:text-white">Workspace Description</h2>
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{workspace.description}</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

/* ─── Helper sub-components ─── */

function InfoRow({
  icon, label, value, capitalize
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  capitalize?: boolean;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 shrink-0 mt-0.5">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{label}</p>
        <p className={`text-sm font-semibold text-slate-800 dark:text-slate-100 truncate ${capitalize ? 'capitalize' : ''}`}>
          {value}
        </p>
      </div>
    </div>
  );
}

const colorMap: Record<string, string> = {
  brand: 'bg-brand-500/10 text-brand-500',
  indigo: 'bg-indigo-500/10 text-indigo-500',
  emerald: 'bg-emerald-500/10 text-emerald-500',
  amber: 'bg-amber-500/10 text-amber-500',
  rose: 'bg-rose-500/10 text-rose-500',
  slate: 'bg-slate-500/10 text-slate-500',
};

function ProfileViewField({
  icon, label, value, color, fullWidth
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: string;
  fullWidth?: boolean;
}) {
  return (
    <div className={`p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 ${fullWidth ? 'md:col-span-2' : ''}`}>
      <div className="flex items-center gap-2 mb-2">
        <div className={`w-6 h-6 rounded-md flex items-center justify-center ${colorMap[color] || ''}`}>
          {icon}
        </div>
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{label}</span>
      </div>
      <p className="text-sm font-medium text-slate-700 dark:text-slate-200 leading-relaxed">
        {value || <span className="text-slate-400 italic">Not specified</span>}
      </p>
    </div>
  );
}

function ProfileEditField({
  label, value, onChange, placeholder, textarea, fullWidth
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  textarea?: boolean;
  fullWidth?: boolean;
}) {
  const cls = "w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/20 transition-all placeholder:text-slate-400 resize-none";
  return (
    <div className={fullWidth ? 'md:col-span-2' : ''}>
      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">{label}</label>
      {textarea ? (
        <textarea
          rows={3}
          className={cls}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
        />
      ) : (
        <input
          type="text"
          className={cls}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
        />
      )}
    </div>
  );
}
