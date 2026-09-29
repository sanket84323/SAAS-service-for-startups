import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import type { IdeaValidationReport, StartupProfile } from '../types';
import { 
  BarChart3, Activity, ShieldAlert, Award, RefreshCw, Sparkles, 
  HelpCircle, ChevronDown, CheckCircle2, ChevronRight, TrendingUp,
  AlertTriangle, DollarSign, Cpu, FileWarning, ArrowRight, BookOpen
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const IdeaValidator: React.FC = () => {
  const { workspace, deductCredits, addToast } = useApp();
  
  const [profile, setProfile] = useState<StartupProfile | null>(null);
  const [report, setReport] = useState<IdeaValidationReport | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState(0);
  const [activeRiskTab, setActiveRiskTab] = useState<'tech' | 'biz' | 'fin' | 'reg'>('tech');

  const generationSteps = [
    'Parsing startup profile and industry factors...',
    'Analyzing Scope 3 carbon compliance regulatory landscape...',
    'Performing competitor analysis against Watershed and Sweep...',
    'Drafting 2x2 SWOT viability matrix...',
    'Calculating market CAGR ($12.4B opportunity)...',
    'Formulating monetization pricing channels...',
    'Saving validation report to workspace database...'
  ];

  useEffect(() => {
    if (workspace) {
      api.getProfile(workspace.id)
        .then(setProfile)
        .catch(() => setProfile(null));

      api.getValidation(workspace.id)
        .then(setReport)
        .catch(() => setReport(null));
    }
  }, [workspace]);

  const handleGenerate = async () => {
    if (!workspace || !profile) return;
    
    // Deduct credit
    const success = deductCredits(100);
    if (!success) return;

    setIsGenerating(true);
    setGenerationStep(0);

    // Animate progress steps concurrently
    const stepInterval = setInterval(() => {
      setGenerationStep(prev => Math.min(prev + 1, generationSteps.length - 1));
    }, 1100);

    try {
      const liveReport = await api.generateValidation(workspace.id);
      clearInterval(stepInterval);
      setReport(liveReport);
      addToast('Idea assessment validation report successfully generated!', 'success');
    } catch (err: any) {
      clearInterval(stepInterval);
      addToast(err.message || 'Failed to generate validation report', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <HelpCircle className="w-12 h-12 text-slate-600 mb-4" />
        <h3 className="text-base font-bold text-white uppercase tracking-wider mb-2">Startup Profile Missing</h3>
        <p className="text-xs text-slate-500 max-w-sm leading-relaxed mb-4">You must complete your core startup profile on the main dashboard before running the AI Validator.</p>
        <Link to="/" className="text-xs px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-xl uppercase tracking-wider">Configure Profile</Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center border-b border-slate-200 dark:border-border-dark pb-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">AI Idea Validator</h2>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Viability audit and SWOT estimation for {profile.name}.</p>
        </div>
        
        {report && !isGenerating && (
          <button 
            onClick={handleGenerate}
            className="flex items-center gap-1.5 text-xs py-2 px-4 bg-slate-800 hover:bg-slate-700 font-bold uppercase tracking-wider rounded-xl text-slate-200 hover:text-white transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Re-Run Analysis
          </button>
        )}
      </div>

      <AnimatePresence mode="wait">
        {isGenerating && (
          <motion.div 
            key="loading"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="bg-white dark:bg-card-dark border border-slate-200 dark:border-border-dark rounded-2xl p-8 shadow-xl flex flex-col items-center justify-center text-center py-16"
          >
            <Loader2 animateSpinner className="w-12 h-12 text-brand-500 mb-6" />
            <h3 className="text-base font-bold text-white mb-2">Analyzing Startup Viability</h3>
            <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
              Our AI is auditing market reports, testing customer models, mapping SWOT parameters, and sizing competitors.
            </p>
            
            {/* Step messages */}
            <div className="mt-8 bg-slate-900/60 border border-slate-800/80 rounded-xl px-4 py-2 text-xs text-brand-400 font-mono w-full max-w-md text-left">
              <span className="text-slate-500 font-semibold mr-1.5">&gt;</span> {generationSteps[generationStep]}
            </div>
          </motion.div>
        )}

        {!report && !isGenerating && (
          <motion.div 
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white dark:bg-card-dark border border-slate-200 dark:border-border-dark rounded-2xl p-8 shadow-xl text-center py-16 max-w-xl mx-auto"
          >
            <div className="w-16 h-16 bg-brand-500/10 border border-brand-500/20 text-brand-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <BarChart3 className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">Viability Audit Ready</h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-6">
              Assess your startup idea against market sizes, competitor listings, SWOT channels, and regulatory risk maps. Generates an investor-grade report in seconds.
            </p>
            
            <button
              onClick={handleGenerate}
              className="inline-flex items-center gap-1.5 py-3 px-6 bg-brand-500 hover:bg-brand-600 transition-colors text-white font-bold text-xs uppercase tracking-wider rounded-xl cursor-pointer"
            >
              <Sparkles className="w-4 h-4" /> Run AI Assessment
            </button>
          </motion.div>
        )}

        {report && !isGenerating && (
          <motion.div 
            key="report"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          >
            {/* Left panels: Score and Market info */}
            <div className="space-y-6">
              {/* Score card */}
              <div className="bg-white dark:bg-card-dark border border-slate-200 dark:border-border-dark p-5 rounded-2xl shadow-xl flex flex-col items-center text-center">
                <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-4 w-full text-left">Startup Viability Score</h3>
                <div className="relative w-36 h-36 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="40" className="stroke-slate-200 dark:stroke-slate-800 fill-none" strokeWidth="8" />
                    <circle 
                      cx="50" 
                      cy="50" 
                      r="40" 
                      className="stroke-brand-500 fill-none transition-all duration-1000" 
                      strokeWidth="8" 
                      strokeDasharray="251.2" 
                      strokeDashoffset={251.2 - (251.2 * report.score) / 100}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center">
                    <span className="text-4xl font-black text-white leading-none">{report.score}</span>
                    <span className="text-[10px] font-bold text-emerald-400 uppercase mt-1.5 tracking-wider">Strong viability</span>
                  </div>
                </div>
                <p className="text-[11px] text-slate-400 mt-4 leading-relaxed max-w-[200px]">
                  Your idea scored in the top 12% of B2B Sustainability Software models evaluated this quarter.
                </p>
              </div>

              {/* Market Opportunity */}
              <div className="bg-white dark:bg-card-dark border border-slate-200 dark:border-border-dark p-5 rounded-2xl shadow-xl">
                <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-emerald-500" /> Market Sizing & CAGR
                </h3>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="p-3 bg-slate-50 dark:bg-slate-900/60 border border-slate-200/50 dark:border-slate-800/50 rounded-xl">
                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">TAM Size</span>
                    <span className="text-lg font-black text-white">{report.marketOpportunity.size}</span>
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-slate-900/60 border border-slate-200/50 dark:border-slate-800/50 rounded-xl">
                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">CAGR Rate</span>
                    <span className="text-lg font-black text-emerald-400">{report.marketOpportunity.cagr}</span>
                  </div>
                </div>
                <p className="text-xs leading-relaxed text-slate-400 dark:text-slate-500">{report.marketOpportunity.summary}</p>
              </div>

              {/* Competitors & Gap */}
              <div className="bg-white dark:bg-card-dark border border-slate-200 dark:border-border-dark p-5 rounded-2xl shadow-xl">
                <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3">Competitive Gaps</h3>
                <div className="space-y-3">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-1">Direct Benchmarks</span>
                    <div className="flex flex-wrap gap-1.5">
                      {report.competitorAnalysis.directCompetitors.map(c => (
                        <span key={c} className="text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700 px-2 py-0.5 rounded-lg">{c}</span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-1">Competitive Advantage</span>
                    <p className="text-xs leading-relaxed text-slate-400 dark:text-slate-500">{report.competitorAnalysis.marketGap}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right panels: SWOT Matrix and Risk sections */}
            <div className="lg:col-span-2 space-y-6">
              {/* SWOT Grid */}
              <div className="bg-white dark:bg-card-dark border border-slate-200 dark:border-border-dark p-5 rounded-2xl shadow-xl">
                <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-4">SWOT Analysis Quadrant</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Strengths */}
                  <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl space-y-2">
                    <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block border-b border-emerald-500/10 pb-1">Strengths (S)</span>
                    <ul className="space-y-1.5">
                      {report.swotAnalysis.strengths.map((s, idx) => (
                        <li key={idx} className="text-xs text-slate-300 leading-relaxed flex items-start gap-1.5">
                          <span className="text-emerald-500 font-bold shrink-0 mt-0.5">•</span> {s}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Weaknesses */}
                  <div className="p-4 bg-rose-500/5 border border-rose-500/10 rounded-2xl space-y-2">
                    <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider block border-b border-rose-500/10 pb-1">Weaknesses (W)</span>
                    <ul className="space-y-1.5">
                      {report.swotAnalysis.weaknesses.map((w, idx) => (
                        <li key={idx} className="text-xs text-slate-300 leading-relaxed flex items-start gap-1.5">
                          <span className="text-rose-500 font-bold shrink-0 mt-0.5">•</span> {w}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Opportunities */}
                  <div className="p-4 bg-amber-500/5 border border-amber-500/10 rounded-2xl space-y-2">
                    <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block border-b border-amber-500/10 pb-1">Opportunities (O)</span>
                    <ul className="space-y-1.5">
                      {report.swotAnalysis.opportunities.map((o, idx) => (
                        <li key={idx} className="text-xs text-slate-300 leading-relaxed flex items-start gap-1.5">
                          <span className="text-amber-500 font-bold shrink-0 mt-0.5">•</span> {o}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Threats */}
                  <div className="p-4 bg-sky-500/5 border border-sky-500/10 rounded-2xl space-y-2">
                    <span className="text-[10px] font-bold text-sky-400 uppercase tracking-wider block border-b border-sky-500/10 pb-1">Threats (T)</span>
                    <ul className="space-y-1.5">
                      {report.swotAnalysis.threats.map((t, idx) => (
                        <li key={idx} className="text-xs text-slate-300 leading-relaxed flex items-start gap-1.5">
                          <span className="text-sky-500 font-bold shrink-0 mt-0.5">•</span> {t}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Monetization Channels */}
              <div className="bg-white dark:bg-card-dark border border-slate-200 dark:border-border-dark p-5 rounded-2xl shadow-xl">
                <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-1.5">
                  <DollarSign className="w-4 h-4 text-brand-500" /> Revenue & Monetization Channels
                </h3>
                <div className="space-y-3">
                  <div className="grid grid-cols-3 text-[10px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-800 pb-1.5 px-2">
                    <span>Channel Name</span>
                    <span>Billing Type</span>
                    <span className="text-right">Implementation</span>
                  </div>
                  {report.monetizationStrategies.channels.map((chan, idx) => (
                    <div key={idx} className="grid grid-cols-3 text-xs py-2 px-2 hover:bg-slate-900/20 rounded-lg transition-colors items-center">
                      <span className="font-semibold text-white">{chan.name}</span>
                      <span className="text-slate-400">{chan.type}</span>
                      <span className="text-right"><span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${
                        chan.difficulty === 'Easy' 
                          ? 'border-emerald-500/20 text-emerald-400 bg-emerald-500/5' 
                          : 'border-amber-500/20 text-amber-400 bg-amber-500/5'
                      }`}>{chan.difficulty}</span></span>
                    </div>
                  ))}
                  <div className="mt-4 p-3 bg-slate-900/60 border border-slate-800 rounded-xl text-xs leading-relaxed text-slate-400">
                    <strong className="text-brand-500 font-semibold">Pricing Advisory: </strong> {report.monetizationStrategies.pricingRecommendation}
                  </div>
                </div>
              </div>

              {/* Risks and Challenges tabs */}
              <div className="bg-white dark:bg-card-dark border border-slate-200 dark:border-border-dark p-5 rounded-2xl shadow-xl">
                <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-rose-500" /> Risk Auditing
                </h3>
                
                {/* Tabs selection */}
                <div className="flex border-b border-slate-800 mb-4 text-xs font-bold text-slate-500">
                  <button 
                    onClick={() => setActiveRiskTab('tech')}
                    className={`flex-1 pb-2 border-b-2 transition-colors flex items-center justify-center gap-1 cursor-pointer ${activeRiskTab === 'tech' ? 'border-brand-500 text-white' : 'border-transparent'}`}
                  >
                    <Cpu className="w-3.5 h-3.5" /> Technical
                  </button>
                  <button 
                    onClick={() => setActiveRiskTab('biz')}
                    className={`flex-1 pb-2 border-b-2 transition-colors flex items-center justify-center gap-1 cursor-pointer ${activeRiskTab === 'biz' ? 'border-brand-500 text-white' : 'border-transparent'}`}
                  >
                    <BarChart3 className="w-3.5 h-3.5" /> Business
                  </button>
                  <button 
                    onClick={() => setActiveRiskTab('fin')}
                    className={`flex-1 pb-2 border-b-2 transition-colors flex items-center justify-center gap-1 cursor-pointer ${activeRiskTab === 'fin' ? 'border-brand-500 text-white' : 'border-transparent'}`}
                  >
                    <DollarSign className="w-3.5 h-3.5" /> Financial
                  </button>
                  <button 
                    onClick={() => setActiveRiskTab('reg')}
                    className={`flex-1 pb-2 border-b-2 transition-colors flex items-center justify-center gap-1 cursor-pointer ${activeRiskTab === 'reg' ? 'border-brand-500 text-white' : 'border-transparent'}`}
                  >
                    <BookOpen className="w-3.5 h-3.5" /> Regulatory
                  </button>
                </div>

                <div className="min-h-[80px]">
                  {activeRiskTab === 'tech' && (
                    <div className="space-y-2 animate-fadeIn">
                      {report.risksAndChallenges.technical.map((risk, idx) => (
                        <p key={idx} className="text-xs text-slate-300 leading-relaxed flex gap-2"><FileWarning className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" /> {risk}</p>
                      ))}
                    </div>
                  )}
                  {activeRiskTab === 'biz' && (
                    <div className="space-y-2 animate-fadeIn">
                      {report.risksAndChallenges.business.map((risk, idx) => (
                        <p key={idx} className="text-xs text-slate-300 leading-relaxed flex gap-2"><FileWarning className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" /> {risk}</p>
                      ))}
                    </div>
                  )}
                  {activeRiskTab === 'fin' && (
                    <div className="space-y-2 animate-fadeIn">
                      {report.risksAndChallenges.financial.map((risk, idx) => (
                        <p key={idx} className="text-xs text-slate-300 leading-relaxed flex gap-2"><FileWarning className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" /> {risk}</p>
                      ))}
                    </div>
                  )}
                  {activeRiskTab === 'reg' && (
                    <div className="space-y-2 animate-fadeIn">
                      {report.risksAndChallenges.regulatory.map((risk, idx) => (
                        <p key={idx} className="text-xs text-slate-300 leading-relaxed flex gap-2"><FileWarning className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" /> {risk}</p>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Reusable spinner loader
const Loader2: React.FC<{ className?: string; animateSpinner?: boolean }> = ({ className, animateSpinner }) => {
  return (
    <div className={`relative ${className}`}>
      <div className={`w-full h-full rounded-full border-4 border-t-brand-500 border-slate-700 ${animateSpinner ? 'animate-spin' : ''}`} />
    </div>
  );
};
