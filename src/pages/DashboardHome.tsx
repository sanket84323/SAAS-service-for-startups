import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { db } from '../services/mockData';
import type { StartupProfile, ActivityLog } from '../types';
import { 
  Sparkles, CheckCircle2, Circle, Users, ArrowRight, ClipboardList, 
  HelpCircle, ChevronRight, Activity, Calendar, Trophy, Send, UserPlus, Info, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const DashboardHome: React.FC = () => {
  const { workspace, addToast, user, updateWorkspace } = useApp();

  // Route to role-specific dashboard
  if (user?.role === 'TEAM_MEMBER') return <TeamMemberDashboard />;

  const [profile, setProfile] = useState<StartupProfile | null>(null);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [hasValidation, setHasValidation] = useState(false);
  const [hasBusinessPlan, setHasBusinessPlan] = useState(false);
  const [hasBrandKit, setHasBrandKit] = useState(false);
  const [hasWebsite, setHasWebsite] = useState(false);
  const [hasMarketing, setHasMarketing] = useState(false);
  const [hasPitchDeck, setHasPitchDeck] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteFirstName, setInviteFirstName] = useState('');
  const [inviteLastName, setInviteLastName] = useState('');
  const [invitePassword, setInvitePassword] = useState('');
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [teamEditingAllowed, setTeamEditingAllowed] = useState(workspace?.teamEditingAllowed || false);

  useEffect(() => {
    if (workspace) {
      setTeamEditingAllowed(workspace.teamEditingAllowed || false);
    }
  }, [workspace]);
  
  // Wizard states
  const [wizardStep, setWizardStep] = useState(1);
  const [profileName, setProfileName] = useState('');
  const [profileIndustry, setProfileIndustry] = useState('');
  const [profileOneLiner, setProfileOneLiner] = useState('');
  const [profileAudience, setProfileAudience] = useState('');
  const [profileProblem, setProfileProblem] = useState('');
  const [profileSolution, setProfileSolution] = useState('');
  const [profileCompetitors, setProfileCompetitors] = useState('');
  const [profileRevenue, setProfileRevenue] = useState('');

  const loadWorkspaceData = () => {
    if (workspace) {
      api.getProfile(workspace.id)
        .then(p => {
          setProfile(p);
          if (p) {
            setProfileName(p.name);
            setProfileIndustry(p.industry);
            setProfileOneLiner(p.oneLiner);
            setProfileAudience(p.targetAudience);
            setProfileProblem(p.problem);
            setProfileSolution(p.solution);
            setProfileCompetitors(p.competitors);
            setProfileRevenue(p.revenueModel);
          } else {
            // Load drafts from localStorage if they exist, otherwise use defaults
            const storedStep = localStorage.getItem('wizard_step');
            if (storedStep) setWizardStep(Number(storedStep));

            setProfileName(localStorage.getItem('wizard_draft_name') || workspace.name || '');
            setProfileIndustry(localStorage.getItem('wizard_draft_industry') || workspace.industry || '');
            setProfileOneLiner(localStorage.getItem('wizard_draft_oneliner') || '');
            setProfileAudience(localStorage.getItem('wizard_draft_audience') || workspace.targetAudience || '');
            setProfileProblem(localStorage.getItem('wizard_draft_problem') || '');
            setProfileSolution(localStorage.getItem('wizard_draft_solution') || '');
            setProfileCompetitors(localStorage.getItem('wizard_draft_competitors') || '');
            setProfileRevenue(localStorage.getItem('wizard_draft_revenue') || '');
          }
        })
        .catch(() => {
          setProfile(null);
          const storedStep = localStorage.getItem('wizard_step');
          if (storedStep) setWizardStep(Number(storedStep));

          setProfileName(localStorage.getItem('wizard_draft_name') || workspace.name || '');
          setProfileIndustry(localStorage.getItem('wizard_draft_industry') || workspace.industry || '');
          setProfileOneLiner(localStorage.getItem('wizard_draft_oneliner') || '');
          setProfileAudience(localStorage.getItem('wizard_draft_audience') || workspace.targetAudience || '');
          setProfileProblem(localStorage.getItem('wizard_draft_problem') || '');
          setProfileSolution(localStorage.getItem('wizard_draft_solution') || '');
          setProfileCompetitors(localStorage.getItem('wizard_draft_competitors') || '');
          setProfileRevenue(localStorage.getItem('wizard_draft_revenue') || '');
        });

      // Load real activity logs from backend
      api.getActivityLogs(workspace.id)
        .then(logs => setActivityLogs((logs || []).slice(0, 20)))
        .catch(() => setActivityLogs([]));

      // Load deliverable status from backend (check what actually exists)
      api.getValidation(workspace.id).then(v => setHasValidation(!!v)).catch(() => setHasValidation(false));
      api.getBusinessPlan(workspace.id).then(bp => setHasBusinessPlan(!!bp)).catch(() => setHasBusinessPlan(false));
      api.getBranding(workspace.id).then(bk => setHasBrandKit(!!bk)).catch(() => setHasBrandKit(false));
      api.getWebsiteContent(workspace.id).then(wc => setHasWebsite(!!wc)).catch(() => setHasWebsite(false));
      api.getMarketingStrategy(workspace.id).then(ms => setHasMarketing(!!ms)).catch(() => setHasMarketing(false));
      api.getPitchDeck(workspace.id).then(pd => setHasPitchDeck(!!pd)).catch(() => setHasPitchDeck(false));

      api.getTeamMembers(workspace.id)
        .then(setTeamMembers)
        .catch(() => setTeamMembers([]));
    }
  };

  useEffect(() => {
    loadWorkspaceData();
  }, [workspace]);

  // Save wizard step to localStorage
  useEffect(() => {
    localStorage.setItem('wizard_step', String(wizardStep));
  }, [wizardStep]);

  // Save drafts to localStorage
  useEffect(() => {
    if (!profile && workspace) {
      localStorage.setItem('wizard_draft_name', profileName);
      localStorage.setItem('wizard_draft_industry', profileIndustry);
      localStorage.setItem('wizard_draft_oneliner', profileOneLiner);
      localStorage.setItem('wizard_draft_audience', profileAudience);
      localStorage.setItem('wizard_draft_problem', profileProblem);
      localStorage.setItem('wizard_draft_solution', profileSolution);
      localStorage.setItem('wizard_draft_competitors', profileCompetitors);
      localStorage.setItem('wizard_draft_revenue', profileRevenue);
    }
  }, [profileName, profileIndustry, profileOneLiner, profileAudience, profileProblem, profileSolution, profileCompetitors, profileRevenue, profile, workspace]);

  const handleCreateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!workspace) return;
    
    const newProfile: StartupProfile = {
      id: profile?.id || 'prof_' + Date.now(),
      workspaceId: workspace.id,
      name: profileName,
      industry: profileIndustry,
      oneLiner: profileOneLiner,
      targetAudience: profileAudience,
      problem: profileProblem,
      solution: profileSolution,
      competitors: profileCompetitors,
      revenueModel: profileRevenue
    };
    
    api.saveProfile(newProfile)
      .then(saved => {
        setProfile(saved);
        addToast('Startup profile created! Time to validate your idea.', 'success');
        
        // Clear drafts from localStorage on success
        localStorage.removeItem('wizard_step');
        localStorage.removeItem('wizard_draft_name');
        localStorage.removeItem('wizard_draft_industry');
        localStorage.removeItem('wizard_draft_oneliner');
        localStorage.removeItem('wizard_draft_audience');
        localStorage.removeItem('wizard_draft_problem');
        localStorage.removeItem('wizard_draft_solution');
        localStorage.removeItem('wizard_draft_competitors');
        localStorage.removeItem('wizard_draft_revenue');
      })
      .catch((err) => {
        addToast(err.message || 'Failed to save profile', 'error');
      });
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!workspace || !inviteEmail || !invitePassword || !inviteFirstName || !inviteLastName) return;
    
    try {
      const members = await api.addTeamMember(workspace.id, {
        email: inviteEmail,
        password: invitePassword,
        firstName: inviteFirstName,
        lastName: inviteLastName
      });
      setTeamMembers(members);
      addToast(`Team member ${inviteFirstName} added successfully!`, 'success');
      setShowInviteModal(false);
      setInviteFirstName('');
      setInviteLastName('');
      setInviteEmail('');
      setInvitePassword('');
      if (updateWorkspace) {
        updateWorkspace({ ...workspace, teamMembersCount: members.length });
      }
    } catch (err: any) {
      addToast(err.message || 'Failed to add team member', 'error');
    }
  };

  const handleToggleTeamEdits = async (allowed: boolean) => {
    if (!workspace) return;
    try {
      const updated = await api.updateWorkspaceSettings(workspace.id, { teamEditingAllowed: allowed });
      setTeamEditingAllowed(updated.teamEditingAllowed || false);
      if (updateWorkspace) updateWorkspace(updated);
      addToast(allowed ? "Team editing access allowed" : "Team editing access restricted", "success");
    } catch (err: any) {
      addToast(err.message || "Failed to update settings", "error");
    }
  };

  // Deliverable status is now loaded from API in loadWorkspaceData() above

  const getStepStatusIcon = (complete: boolean) => {
    return complete 
      ? <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
      : <Circle className="w-5 h-5 text-slate-600 shrink-0" />;
  };

  if (!profile) {
    // Show Onboarding Wizard
    return (
      <div className="max-w-2xl mx-auto py-8">
        <div className="text-center mb-8">
          <span className="px-3 py-1 rounded-full bg-brand-500/10 text-brand-500 dark:text-brand-400 text-[10px] font-bold uppercase tracking-wider">Startup Onboarding</span>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white mt-3">Welcome to AI StartupOS</h2>
          <p className="text-sm text-slate-400 dark:text-slate-500 mt-1.5">Let's complete your startup workspace profile to activate the AI generators.</p>
        </div>

        {/* Wizard Steps indicator */}
        <div className="flex items-center justify-between mb-8 px-8 text-xs font-bold text-slate-500 dark:text-slate-400">
          <div className={`flex items-center gap-1.5 ${wizardStep >= 1 ? 'text-brand-500' : ''}`}>
            <span className={`w-5 h-5 rounded-full border flex items-center justify-center text-[10px] ${wizardStep >= 1 ? 'border-brand-500 bg-brand-500/5' : 'border-slate-700'}`}>1</span>
            Core
          </div>
          <div className="h-[1px] bg-slate-800 flex-1 mx-3" />
          <div className={`flex items-center gap-1.5 ${wizardStep >= 2 ? 'text-brand-500' : ''}`}>
            <span className={`w-5 h-5 rounded-full border flex items-center justify-center text-[10px] ${wizardStep >= 2 ? 'border-brand-500 bg-brand-500/5' : 'border-slate-700'}`}>2</span>
            Concept
          </div>
          <div className="h-[1px] bg-slate-800 flex-1 mx-3" />
          <div className={`flex items-center gap-1.5 ${wizardStep >= 3 ? 'text-brand-500' : ''}`}>
            <span className={`w-5 h-5 rounded-full border flex items-center justify-center text-[10px] ${wizardStep >= 3 ? 'border-brand-500 bg-brand-500/5' : 'border-slate-700'}`}>3</span>
            Model
          </div>
        </div>

        <form onSubmit={handleCreateProfile} className="bg-white dark:bg-card-dark border border-slate-200 dark:border-border-dark rounded-2xl p-6 shadow-xl space-y-6">
          <AnimatePresence mode="wait">
            {wizardStep === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <h3 className="text-base font-bold text-slate-800 dark:text-slate-200 border-b border-slate-800 pb-2 mb-4">Core Startup Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">Startup Name</label>
                    <input 
                      type="text" 
                      required
                      placeholder="e.g. EcoSphere AI"
                      value={profileName}
                      onChange={(e) => setProfileName(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-brand-500 text-slate-200"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">Industry</label>
                    <input 
                      type="text" 
                      required
                      placeholder="e.g. Sustainability, EdTech"
                      value={profileIndustry}
                      onChange={(e) => setProfileIndustry(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-brand-500 text-slate-200"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">One-Liner Hook</label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. Track, reduce, and offset carbon footprint with automated expenses modeling"
                    value={profileOneLiner}
                    onChange={(e) => setProfileOneLiner(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-brand-500 text-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">Target Audience</label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. SMBs, B2B companies, manufacturing vendors"
                    value={profileAudience}
                    onChange={(e) => setProfileAudience(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-brand-500 text-slate-200"
                  />
                </div>
              </motion.div>
            )}

            {wizardStep === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <h3 className="text-base font-bold text-slate-800 dark:text-slate-200 border-b border-slate-800 pb-2 mb-4">Problem & Solution</h3>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">What is the problem you solve?</label>
                  <textarea 
                    required
                    rows={3}
                    placeholder="Identify the main pain points your customers experience. Why is this an issue?"
                    value={profileProblem}
                    onChange={(e) => setProfileProblem(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-brand-500 text-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">What is your proposed solution?</label>
                  <textarea 
                    required
                    rows={3}
                    placeholder="How does your product solve this problem? What is the core value proposition?"
                    value={profileSolution}
                    onChange={(e) => setProfileSolution(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-brand-500 text-slate-200"
                  />
                </div>
              </motion.div>
            )}

            {wizardStep === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <h3 className="text-base font-bold text-slate-800 dark:text-slate-200 border-b border-slate-800 pb-2 mb-4">Competitors & Monetization</h3>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">Who are your main competitors?</label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. Watershed, Excel templates, carbon consulting agencies"
                    value={profileCompetitors}
                    onChange={(e) => setProfileCompetitors(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-brand-500 text-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">How do you make money? (Revenue Model)</label>
                  <textarea 
                    required
                    rows={3}
                    placeholder="e.g. SaaS subscription models starting at $99/mo, or transactional commission fees"
                    value={profileRevenue}
                    onChange={(e) => setProfileRevenue(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-brand-500 text-slate-200"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Buttons Navigation */}
          <div className="flex justify-between items-center pt-4 border-t border-slate-200 dark:border-slate-800/80">
            <button
              type="button"
              disabled={wizardStep === 1}
              onClick={() => setWizardStep(prev => prev - 1)}
              className="px-4 py-2 text-slate-400 hover:text-white text-xs font-bold uppercase tracking-wider disabled:opacity-30 transition-opacity"
            >
              Back
            </button>

            {wizardStep < 3 ? (
              <button
                type="button"
                onClick={() => setWizardStep(prev => prev + 1)}
                className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-1"
              >
                Next Step
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 transition-colors text-white font-bold text-xs uppercase tracking-wider flex items-center gap-1 cursor-pointer"
              >
                Complete Profile
                <CheckCircle2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Onboarding Complete Header Banner */}
      <div className="bg-gradient-to-r from-[#11131e] to-[#1e202f] border border-border-dark p-6 rounded-2xl relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        {/* Glow */}
        <div className="absolute top-0 right-0 w-60 h-60 bg-brand-500/5 rounded-full blur-[60px] pointer-events-none" />
        
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[9px] font-bold uppercase tracking-wider flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Profile Active
            </span>
            <span className="text-[10px] font-bold text-slate-500 capitalize">{profile.industry}</span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">{profile.name} Workspace</h2>
          <p className="text-slate-400 text-xs mt-1 max-w-xl italic">"{profile.oneLiner}"</p>
        </div>

        <button 
          onClick={() => setProfile(null)} // Re-triggers the wizard edit
          className="flex-shrink-0 text-xs px-3.5 py-2 bg-slate-800 hover:bg-slate-700 font-bold uppercase tracking-wider rounded-xl text-slate-300 hover:text-white transition-colors"
        >
          Edit Profile Wizard
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Checklist of actions */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-card-dark border border-slate-200 dark:border-border-dark p-5 rounded-2xl shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <ClipboardList className="w-4 h-4 text-brand-500" />
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider">Startup Launch Roadmap</h3>
              </div>
              <span className="text-[10px] font-bold bg-brand-500/10 text-brand-500 dark:text-brand-400 px-2 py-0.5 rounded">Checklist</span>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50/50 dark:bg-slate-900/40 border border-slate-200/50 dark:border-slate-800/40">
                <div className="flex items-center gap-3">
                  {getStepStatusIcon(true)}
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">1. Define Startup Workspace</h4>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500">Core parameters and idea hook configured.</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-emerald-400 uppercase">Complete</span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50/50 dark:bg-slate-900/40 border border-slate-200/50 dark:border-slate-800/40">
                <div className="flex items-center gap-3">
                  {getStepStatusIcon(hasValidation)}
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">2. Validate Business Idea</h4>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500">Analyze market sizes, SWOT, competitor gaps, and monetization models.</p>
                  </div>
                </div>
                {hasValidation ? (
                  <span className="text-[10px] font-bold text-emerald-400 uppercase">Complete</span>
                ) : (
                  <Link to="/validator" className="text-[10px] font-bold text-brand-500 hover:underline uppercase flex items-center">Start <ChevronRight className="w-3.5 h-3.5" /></Link>
                )}
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50/50 dark:bg-slate-900/40 border border-slate-200/50 dark:border-slate-800/40">
                <div className="flex items-center gap-3">
                  {getStepStatusIcon(hasBusinessPlan)}
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">3. Draft Business Plan</h4>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500">Formulate investor-ready executive summaries and operational projections.</p>
                  </div>
                </div>
                {hasBusinessPlan ? (
                  <span className="text-[10px] font-bold text-emerald-400 uppercase">Complete</span>
                ) : (
                  <Link to="/business-plan" className="text-[10px] font-bold text-brand-500 hover:underline uppercase flex items-center">Generate <ChevronRight className="w-3.5 h-3.5" /></Link>
                )}
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50/50 dark:bg-slate-900/40 border border-slate-200/50 dark:border-slate-800/40">
                <div className="flex items-center gap-3">
                  {getStepStatusIcon(hasBrandKit && hasWebsite)}
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">4. Establish Identity & Website Copy</h4>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500">Select color guidelines, create taglines, and write homepage mock copy.</p>
                  </div>
                </div>
                {hasBrandKit && hasWebsite ? (
                  <span className="text-[10px] font-bold text-emerald-400 uppercase">Complete</span>
                ) : (
                  <Link to="/branding" className="text-[10px] font-bold text-brand-500 hover:underline uppercase flex items-center">Build <ChevronRight className="w-3.5 h-3.5" /></Link>
                )}
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50/50 dark:bg-slate-900/40 border border-slate-200/50 dark:border-slate-800/40">
                <div className="flex items-center gap-3">
                  {getStepStatusIcon(hasMarketing && hasPitchDeck)}
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">5. Prepare Go-To-Market & Investor Ask</h4>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500">Draft pitch decks and content calendars to kick off client acquisition.</p>
                  </div>
                </div>
                {hasMarketing && hasPitchDeck ? (
                  <span className="text-[10px] font-bold text-emerald-400 uppercase">Complete</span>
                ) : (
                  <Link to="/pitch-deck" className="text-[10px] font-bold text-brand-500 hover:underline uppercase flex items-center">Prepare <ChevronRight className="w-3.5 h-3.5" /></Link>
                )}
              </div>
            </div>
          </div>

          {/* Activity Logs Feed */}
          <div className="bg-white dark:bg-card-dark border border-slate-200 dark:border-border-dark p-5 rounded-2xl shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-indigo-500" />
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider">Workspace Activity Feed</h3>
              </div>
              <span className="text-[10px] font-bold bg-indigo-500/10 text-indigo-500 dark:text-indigo-400 px-2 py-0.5 rounded">Audit Log</span>
            </div>

            <div className="space-y-3.5 max-h-[300px] overflow-y-auto pr-1">
              {activityLogs.length === 0 ? (
                <div className="text-center py-6 text-slate-500 text-xs">No activity logged yet. Complete tasks to record events.</div>
              ) : (
                activityLogs.map((log) => (
                  <div key={log.id} className="flex gap-3 text-xs leading-relaxed items-start">
                    <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 flex items-center justify-center font-bold text-[9px] shrink-0 uppercase text-slate-400">
                      {log.userName.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-baseline gap-2">
                        <span className="font-semibold text-slate-900 dark:text-slate-200">{log.userName}</span>
                        <span className="text-[10px] text-slate-500">{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <p className="text-slate-400 dark:text-slate-500">
                        <strong className="text-slate-300 font-semibold">{log.action}:</strong> {log.details}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Scoring, Team members */}
        <div className="space-y-6">
          {/* Idea Score Dial */}
          <div className="bg-white dark:bg-card-dark border border-slate-200 dark:border-border-dark p-5 rounded-2xl shadow-xl flex flex-col items-center justify-center text-center">
            <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-4 w-full text-left">Startup Validation Score</h3>
            
            {hasValidation ? (
              <div className="relative w-36 h-36 flex items-center justify-center">
                {/* SVG Dial */}
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="40" className="stroke-slate-200 dark:stroke-slate-800 fill-none" strokeWidth="8" />
                  <circle 
                    cx="50" 
                    cy="50" 
                    r="40" 
                    className="stroke-brand-500 fill-none transition-all duration-1000" 
                    strokeWidth="8" 
                    strokeDasharray="251.2" 
                    strokeDashoffset={251.2 - (251.2 * 84) / 100}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute flex flex-col items-center">
                  <span className="text-3xl font-black text-white leading-none">84</span>
                  <span className="text-[9px] font-bold text-emerald-400 uppercase mt-1 tracking-wider">Strong Fit</span>
                </div>
              </div>
            ) : (
              <div className="py-6 flex flex-col items-center">
                <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center mb-3">
                  <Trophy className="w-6 h-6 text-slate-500" />
                </div>
                <p className="text-xs text-slate-500 max-w-[160px] mx-auto leading-relaxed">Validate your idea to calculate your startup viability score.</p>
                <Link to="/validator" className="mt-3 inline-flex items-center gap-1 text-xs py-1.5 px-3 bg-brand-500 text-white rounded-lg font-bold uppercase tracking-wider">Run Validator</Link>
              </div>
            )}

            {hasValidation && (
              <div className="border-t border-slate-200 dark:border-slate-800/80 w-full mt-4 pt-3 flex justify-between text-xs text-slate-400">
                <span className="flex items-center gap-1"><Info className="w-3.5 h-3.5 text-slate-500" /> Market Fit: <strong className="text-white">High</strong></span>
                <span className="flex items-center gap-1">Score Class: <strong className="text-emerald-400">B2B</strong></span>
              </div>
            )}
          </div>

          {/* Team collaboration portal */}
          <div className="bg-white dark:bg-card-dark border border-slate-200 dark:border-border-dark p-5 rounded-2xl shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-brand-500" />
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider">Startup Team</h3>
              </div>
              <button 
                onClick={() => setShowInviteModal(true)}
                className="text-[10px] font-bold text-brand-500 hover:text-brand-400 uppercase flex items-center gap-1 cursor-pointer"
              >
                <UserPlus className="w-3.5 h-3.5" /> Invite
              </button>
            </div>

            {/* Toggle switch for allowing edits */}
            <div className="flex items-center justify-between p-3 mb-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/50 dark:border-slate-800/40">
              <div>
                <h4 className="text-[11px] font-bold text-slate-200 uppercase tracking-tight">Allow Team Edits</h4>
                <p className="text-[9px] text-slate-500 mt-0.5 leading-tight">Let team members customize & generate deliverables</p>
              </div>
              <button 
                onClick={() => handleToggleTeamEdits(!teamEditingAllowed)} 
                className={`relative rounded-full w-9 h-5 transition-colors shrink-0 ${teamEditingAllowed ? 'bg-brand-500' : 'bg-slate-600'}`}
              >
                <span className={`absolute top-0.5 left-0.5 rounded-full bg-white w-4 h-4 shadow transition-transform ${teamEditingAllowed ? 'translate-x-4' : ''}`} />
              </button>
            </div>

            <div className="space-y-3">
              {teamMembers.map(member => (
                <div key={member.id} className="flex items-center gap-3">
                  <img 
                    src={member.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${member.firstName || 'User'}`} 
                    alt={`${member.firstName} ${member.lastName}`} 
                    className="w-8 h-8 rounded-full bg-slate-800 shrink-0 object-cover"
                  />
                  <div className="flex-grow overflow-hidden">
                    <h4 className="text-xs font-bold truncate leading-tight">{member.firstName} {member.lastName}</h4>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate">{member.email}</p>
                  </div>
                  <span className={`text-[9px] font-bold border px-1.5 py-0.5 rounded uppercase ${
                    member.role === 'FOUNDER' 
                      ? 'text-brand-500 border-brand-500/20 bg-brand-500/5' 
                      : 'text-slate-400 border-slate-700 bg-slate-800'
                  }`}>
                    {member.role === 'FOUNDER' ? 'Owner' : 'Member'}
                  </span>
                </div>
              ))}
              {teamMembers.length === 0 && (
                <div className="text-center py-4 text-xs text-slate-500">No team members registered yet.</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Invite Member Modal */}
      <AnimatePresence>
        {showInviteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-card-dark border border-slate-200 dark:border-border-dark w-full max-w-sm rounded-2xl p-6 shadow-2xl"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Add Team Member</h3>
                <button 
                  onClick={() => setShowInviteModal(false)}
                  className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleInvite} className="space-y-4">
                <div className="flex gap-3">
                  <div className="flex-1">
                    <label className="block text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">First Name</label>
                    <input 
                      type="text" 
                      required 
                      placeholder="Sarah" 
                      value={inviteFirstName}
                      onChange={(e) => setInviteFirstName(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-brand-500 text-slate-200"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">Last Name</label>
                    <input 
                      type="text" 
                      required 
                      placeholder="Chen" 
                      value={inviteLastName}
                      onChange={(e) => setInviteLastName(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-brand-500 text-slate-200"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">Email Address</label>
                  <input 
                    type="email" 
                    required 
                    placeholder="colleague@yourcompany.com" 
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-brand-500 text-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">Password</label>
                  <input 
                    type="password" 
                    required 
                    placeholder="Enter login password" 
                    value={invitePassword}
                    onChange={(e) => setInvitePassword(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-brand-500 text-slate-200"
                  />
                </div>

                <div className="flex gap-3 justify-end pt-2">
                  <button 
                    type="button"
                    onClick={() => setShowInviteModal(false)}
                    className="px-4 py-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold uppercase tracking-wider"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 transition-colors text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5"
                  >
                    Add Member
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ─────────────────────────────────────────────────────────
// Team Member Dashboard
// ─────────────────────────────────────────────────────────
const TeamMemberDashboard: React.FC = () => {
  const { workspace, user } = useApp();
  const [activeTab, setActiveTab] = useState<'overview' | 'docs'>('overview');
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [activityLogs, setActivityLogs] = useState<any[]>([]);
  const [deliverables, setDeliverables] = useState<{
    profile: boolean;
    validation: boolean;
    businessPlan: boolean;
    brandKit: boolean;
    website: boolean;
    marketing: boolean;
    pitchDeck: boolean;
  }>({
    profile: false, validation: false, businessPlan: false,
    brandKit: false, website: false, marketing: false, pitchDeck: false
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!workspace) return;
    setIsLoading(true);

    // Load all real workspace data in parallel
    Promise.allSettled([
      api.getTeamMembers(workspace.id),
      api.getActivityLogs(workspace.id),
      api.getProfile(workspace.id),
      api.getValidation(workspace.id),
      api.getBusinessPlan(workspace.id),
      api.getBranding(workspace.id),
      api.getWebsiteContent(workspace.id),
      api.getMarketingStrategy(workspace.id),
      api.getPitchDeck(workspace.id),
    ]).then(([membersRes, activityRes, profileRes, validationRes, bpRes, brandRes, webRes, mktRes, pdRes]) => {
      if (membersRes.status === 'fulfilled') setTeamMembers(membersRes.value || []);
      if (activityRes.status === 'fulfilled') setActivityLogs((activityRes.value || []).slice(0, 15));

      setDeliverables({
        profile: profileRes.status === 'fulfilled' && !!profileRes.value,
        validation: validationRes.status === 'fulfilled' && !!validationRes.value,
        businessPlan: bpRes.status === 'fulfilled' && !!bpRes.value,
        brandKit: brandRes.status === 'fulfilled' && !!brandRes.value,
        website: webRes.status === 'fulfilled' && !!webRes.value,
        marketing: mktRes.status === 'fulfilled' && !!mktRes.value,
        pitchDeck: pdRes.status === 'fulfilled' && !!pdRes.value,
      });
      setIsLoading(false);
    });
  }, [workspace]);

  const canEdit = user?.role !== 'TEAM_MEMBER' || workspace?.teamEditingAllowed;

  const sharedDocs = [
    { name: 'Business Plan',      exists: deliverables.businessPlan, icon: '📄', path: '/business-plan', type: 'Business Plan' },
    { name: 'Brand Identity Kit', exists: deliverables.brandKit,     icon: '🎨', path: '/branding',      type: 'Brand Kit' },
    { name: 'Website Copy',       exists: deliverables.website,      icon: '🌐', path: '/website',       type: 'Website' },
    { name: 'Pitch Deck',         exists: deliverables.pitchDeck,    icon: '📊', path: '/pitch-deck',    type: 'Pitch Deck' },
    { name: 'Marketing Strategy', exists: deliverables.marketing,    icon: '📈', path: '/marketing',     type: 'Marketing' },
  ];

  const completedDocs = sharedDocs.filter(d => d.exists).length;
  const totalDocs = sharedDocs.length;

  const stats = [
    { label: 'Shared Docs',   value: completedDocs, icon: '📂', color: 'from-violet-500 to-brand-500' },
    { label: 'Available',     value: totalDocs,      icon: '📋', color: 'from-emerald-500 to-teal-400' },
    { label: 'Team Members',  value: teamMembers.length, icon: '👥', color: 'from-indigo-500 to-blue-400' },
    { label: 'Permission',    value: canEdit ? 'Edit' : 'View', icon: canEdit ? '✏️' : '👁️', color: 'from-amber-500 to-orange-400' },
  ];

  const tabs: { key: 'overview'|'docs'; label: string; icon: string }[] = [
    { key: 'overview', label: 'Overview',    icon: '🏠' },
    { key: 'docs',     label: 'Shared Docs', icon: '📂' },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Loading workspace data…</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-1 rounded-full bg-indigo-500/15 text-indigo-400 text-[10px] font-bold uppercase tracking-wider border border-indigo-500/25">👥 Team Member</span>
            {!canEdit && (
              <span className="px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-400 text-[10px] font-bold uppercase tracking-wider border border-amber-500/25">🔒 View Only</span>
            )}
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
            Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'},{' '}
            <span className="text-brand-400">{user?.firstName || 'Teammate'}</span> 👋
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">You're collaborating on <span className="text-white font-semibold">{workspace?.name || 'the workspace'}</span></p>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(s => (
          <div key={s.label} className="bg-white dark:bg-card-dark border border-slate-200 dark:border-border-dark rounded-2xl p-4 flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center text-xl shrink-0 shadow-md`}>{s.icon}</div>
            <div>
              <div className="text-2xl font-black text-slate-900 dark:text-white leading-none">{s.value}</div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-slate-100 dark:bg-slate-900/60 rounded-xl w-fit border border-slate-200 dark:border-slate-800">
        {tabs.map(t => (
          <button key={t.key} onClick={() => setActiveTab(t.key)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === t.key
                ? 'bg-white dark:bg-card-dark text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
            }`}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">

        {/* ── Overview tab ── */}
        {activeTab === 'overview' && (
          <motion.div key="overview" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Deliverables status */}
            <div className="lg:col-span-2 bg-white dark:bg-card-dark border border-slate-200 dark:border-border-dark rounded-2xl p-5">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">📋 Workspace Deliverables</h3>
                <span className="text-[10px] font-bold bg-brand-500/10 text-brand-500 dark:text-brand-400 px-2 py-0.5 rounded">{completedDocs}/{totalDocs} Ready</span>
              </div>
              <div className="space-y-2.5">
                {sharedDocs.map(doc => (
                  <div key={doc.name} className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <div className={`w-5 h-5 rounded-full border-2 shrink-0 flex items-center justify-center ${
                      doc.exists ? 'border-emerald-500 bg-emerald-500' : 'border-slate-400 dark:border-slate-600'
                    }`}>
                      {doc.exists && <span className="text-white text-[8px]">✓</span>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-slate-800 dark:text-white truncate">{doc.name}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        {doc.exists ? 'Generated by founder — click to view' : 'Not yet created by founder'}
                      </p>
                    </div>
                    {doc.exists ? (
                      <Link to={doc.path} className="text-[10px] font-bold text-brand-500 hover:underline uppercase flex items-center shrink-0">
                        {canEdit ? 'Open' : 'View'} <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    ) : (
                      <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider shrink-0">Pending</span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Activity feed — real data */}
            <div className="bg-white dark:bg-card-dark border border-slate-200 dark:border-border-dark rounded-2xl p-5">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">⚡ Recent Activity</h3>
              <div className="space-y-3 max-h-[320px] overflow-y-auto pr-1">
                {activityLogs.length === 0 ? (
                  <div className="text-center py-6 text-slate-500 text-xs">No activity recorded yet.</div>
                ) : (
                  activityLogs.map((log, i) => (
                    <div key={log.id || i} className="flex gap-2.5">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold text-white shrink-0 mt-0.5 ${
                        log.userRole === 'FOUNDER' ? 'bg-brand-500' : 'bg-indigo-500'
                      }`}>
                        {(log.userName || 'S').charAt(0)}
                      </div>
                      <div>
                        <p className="text-xs text-slate-700 dark:text-slate-300 leading-snug">
                          <span className="font-semibold">{log.userName || 'System'}</span>{' '}
                          <span className="text-slate-400">{log.action}</span>
                        </p>
                        <p className="text-[10px] text-slate-500 mt-0.5">{log.details}</p>
                        {log.timestamp && (
                          <p className="text-[9px] text-slate-600 mt-0.5">
                            {new Date(log.timestamp).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </p>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Quick access tools */}
            <div className="lg:col-span-3 bg-white dark:bg-card-dark border border-slate-200 dark:border-border-dark rounded-2xl p-5">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">🔧 Quick Access — Collaboration Tools</h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {sharedDocs.map(doc => (
                  <Link key={doc.name} to={doc.exists ? doc.path : '#'}
                    className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all group ${
                      doc.exists
                        ? 'border-slate-200 dark:border-slate-700 hover:border-brand-500/50 hover:bg-brand-500/5 cursor-pointer'
                        : 'border-slate-200/50 dark:border-slate-800/40 opacity-40 cursor-not-allowed'
                    }`}
                    onClick={e => { if (!doc.exists) e.preventDefault(); }}
                  >
                    <span className="text-3xl">{doc.icon}</span>
                    <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300 text-center leading-snug group-hover:text-brand-400 transition-colors">{doc.type}</span>
                    {!doc.exists && <span className="text-[8px] text-slate-500 font-bold uppercase">Not Ready</span>}
                  </Link>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* ── Docs tab ── */}
        {activeTab === 'docs' && (
          <motion.div key="docs" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="bg-white dark:bg-card-dark border border-slate-200 dark:border-border-dark rounded-2xl p-5">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-5">📂 Shared Workspace Documents</h3>
            <div className="space-y-2">
              {sharedDocs.map(doc => (
                <div key={doc.name} className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${
                  doc.exists
                    ? 'border-slate-200 dark:border-slate-700 hover:border-brand-500/50 hover:bg-brand-500/5'
                    : 'border-slate-200/40 dark:border-slate-800/30 opacity-50'
                }`}>
                  <span className="text-2xl">{doc.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-bold ${doc.exists ? 'text-slate-800 dark:text-white' : 'text-slate-500'}`}>{doc.name}</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {doc.exists ? `${doc.type} · Created by founder` : `${doc.type} · Not yet generated`}
                    </p>
                  </div>
                  {doc.exists ? (
                    <Link to={doc.path} className="text-xs font-bold text-brand-500 hover:text-brand-400 transition-colors">
                      {canEdit ? 'Open & Edit →' : 'View →'}
                    </Link>
                  ) : (
                    <span className="text-[10px] font-bold text-slate-500 uppercase">Pending</span>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
};

