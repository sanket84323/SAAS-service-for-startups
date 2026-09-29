import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import type { MarketingStrategy, ContentCalendar } from '../types';
import {
  Megaphone, Target, Users, LayoutTemplate, Calendar,
  Sparkles, CheckCircle2, ChevronRight, Zap, Play, Loader2, AlertTriangle
} from 'lucide-react';
import { motion } from 'framer-motion';

export const MarketingHub: React.FC = () => {
  const { workspace, addToast, user } = useApp();
  const canEdit = user?.role !== 'TEAM_MEMBER' || workspace?.teamEditingAllowed;

  const [strategy, setStrategy] = useState<MarketingStrategy | null>(null);
  const [calendar, setCalendar] = useState<ContentCalendar | null>(null);

  const [isGeneratingStrategy, setIsGeneratingStrategy] = useState(false);
  const [isGeneratingCalendar, setIsGeneratingCalendar] = useState(false);

  // Load existing strategy and calendar on mount or workspace change
  useEffect(() => {
    if (!workspace) return;
    const fetchData = async () => {
      try {
        const [strat, cal] = await Promise.all([
          api.getMarketingStrategy(workspace.id),
          api.getContentCalendar(workspace.id)
        ]);
        setStrategy(strat);
        setCalendar(cal);
      } catch (e) {
        // If not found, keep null; user can generate
        console.error(e);
      }
    };
    fetchData();
  }, [workspace]);

  const handleGenerateStrategy = async () => {
    if (!workspace) return;
    setIsGeneratingStrategy(true);
    try {
      const newStrategy = await api.generateMarketingStrategy(workspace.id);
      setStrategy(newStrategy);
      addToast('Marketing strategy generated successfully!', 'success');
    } catch (e) {
      console.error(e);
      addToast('Failed to generate marketing strategy.', 'error');
    } finally {
      setIsGeneratingStrategy(false);
    }
  };

  const handleGenerateCalendar = async () => {
    if (!workspace) return;
    setIsGeneratingCalendar(true);
    try {
      const newCalendar = await api.generateContentCalendar(workspace.id);
      setCalendar(newCalendar);
      addToast('Content calendar generated!', 'success');
    } catch (e) {
      console.error(e);
      addToast('Failed to generate content calendar.', 'error');
    } finally {
      setIsGeneratingCalendar(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* View only banner */}
      {!canEdit && (
        <div className="bg-amber-500/10 border border-amber-500/20 text-amber-500 px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 shrink-0">
          <AlertTriangle className="w-4 h-4" />
          <span><strong>View Only Mode:</strong> Workspace founder has disabled customization privileges for team members.</span>
        </div>
      )}

      {/* Header */}
      <div className="bg-white dark:bg-card-dark border border-slate-200 dark:border-border-dark p-6 rounded-2xl relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="absolute top-0 right-0 w-64 h-64 bg-fuchsia-500/5 rounded-full blur-[60px] pointer-events-none" />        
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2 py-0.5 rounded-full bg-fuchsia-500/10 text-fuchsia-500 dark:text-fuchsia-400 text-[9px] font-bold uppercase tracking-wider flex items-center gap-1">
              <Megaphone className="w-3 h-3" /> Growth Engine
            </span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Marketing Hub</h2>
          <p className="text-slate-500 dark:text-slate-400 text-xs mt-1 max-w-xl">
            Identify your target audience and generate multi-channel content strategies.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Strategy Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider flex items-center gap-2">
              <Target className="w-4 h-4 text-fuchsia-500" /> Go-to-Market Strategy
            </h3>
            {!strategy && canEdit && (
              <button
                onClick={handleGenerateStrategy}
                disabled={isGeneratingStrategy}
                className="text-[10px] bg-fuchsia-500 hover:bg-fuchsia-600 text-white px-3 py-1.5 rounded-lg font-bold uppercase tracking-wider flex items-center gap-1 transition-colors disabled:opacity-50"
              >
                {isGeneratingStrategy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                {isGeneratingStrategy ? 'Analyzing...' : 'Generate Strategy'}
              </button>
            )}
          </div>

          {!strategy ? (
            <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center">
              <div className="w-12 h-12 bg-fuchsia-500/10 rounded-full flex items-center justify-center mb-4">
                <Target className="w-6 h-6 text-fuchsia-500" />
              </div>
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300">No strategy defined</p>
              <p className="text-xs text-slate-500 mt-2 max-w-xs">Run the AI analysis to identify your target personas and key messaging pillars.</p>
            </div>
          ) : (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              <div className="bg-white dark:bg-card-dark border border-slate-200 dark:border-border-dark p-5 rounded-2xl shadow-sm">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Target Personas</h4>
                <div className="space-y-3">
                  {strategy.personas?.map((persona, idx) => (
                    <div key={idx} className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-800">
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-bold text-sm text-slate-800 dark:text-slate-200">{persona.name}</span>
                        <span className="text-[9px] bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded font-medium">{persona.demographics}</span>
                      </div>
                      <div className="text-xs text-slate-600 dark:text-slate-400">
                        <strong className="block mb-1 text-slate-700 dark:text-slate-300">Pain Points:</strong>
                        <ul className="list-disc pl-4 space-y-0.5">
                          {persona.painPoints.map((pp, i) => <li key={i}>{pp}</li>)}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white dark:bg-card-dark border border-slate-200 dark:border-border-dark p-5 rounded-2xl shadow-sm">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Key Channels</h4>
                  <ul className="space-y-2">
                    {strategy.keyChannels?.map((channel, i) => (
                      <li key={i} className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> {channel}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="bg-white dark:bg-card-dark border border-slate-200 dark:border-border-dark p-5 rounded-2xl shadow-sm">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Messaging Pillars</h4>
                  <ul className="space-y-2">
                    {strategy.messagingPillars?.map((pillar, i) => (
                      <li key={i} className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300">
                        <Zap className="w-3.5 h-3.5 text-amber-500" /> {pillar}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Content Calendar Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-500" /> Content Calendar
            </h3>
            {!calendar && strategy && canEdit && (
              <button
                onClick={handleGenerateCalendar}
                disabled={isGeneratingCalendar}
                className="text-[10px] bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 rounded-lg font-bold uppercase tracking-wider flex items-center gap-1 transition-colors disabled:opacity-50"
              >
                {isGeneratingCalendar ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <LayoutTemplate className="w-3.5 h-3.5" />}
                {isGeneratingCalendar ? 'Drafting...' : 'Generate Calendar'}
              </button>
            )}
          </div>

          {!strategy ? (
            <div className="bg-slate-50/50 dark:bg-slate-900/30 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 text-center opacity-70">
              <p className="text-xs text-slate-500">Generate a marketing strategy first to unlock content planning.</p>
            </div>
          ) : !calendar ? (
            <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center">
              <div className="w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center mb-4">
                <Calendar className="w-6 h-6 text-blue-500" />
              </div>
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Ready to plan content</p>
              <p className="text-xs text-slate-500 mt-2 max-w-xs">Use your strategy to generate a 30-day content calendar for your key channels.</p>
            </div>
          ) : (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-card-dark border border-slate-200 dark:border-border-dark p-5 rounded-2xl shadow-sm">
              <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">{calendar.month} Schedule</h4>
                <span className="text-[10px] font-bold bg-blue-500/10 text-blue-500 px-2 py-0.5 rounded">{calendar.posts.length} Items</span>
              </div>

              <div className="space-y-3">
                {calendar.posts.map((post) => (
                  <div key={post.id} className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col gap-2">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-slate-500 uppercase">{new Date(post.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase ${
                          post.platform === 'LinkedIn' ? 'bg-blue-600/10 text-blue-5' :
                          post.platform === 'Twitter' ? 'bg-sky-500/10 text-sky-500' :
                          'bg-amber-500/10 text-amber-500'
                        }`}>
                          {post.platform}
                        </span>
                      </div>
                      <span className="text-[9px] font-bold text-slate-400 bg-slate-200 dark:bg-slate-800 px-1.5 py-0.5 rounded uppercase">{post.status}</span>
                    </div>
                    <p className="text-xs text-slate-700 dark:text-slate-300 font-medium">{post.content}</p>
                    <span className="text-[10px] text-slate-500 mt-1">Type: {post.type}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};
