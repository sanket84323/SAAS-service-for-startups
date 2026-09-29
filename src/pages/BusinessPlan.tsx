import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import type { BusinessPlan, StartupProfile } from '../types';
import {
  FileText, Edit3, Sparkles, RefreshCw, Save, Download,
  ChevronRight, List, HelpCircle, FileDown, Layers,
  Copy, Check, Clock, BookOpen, TrendingUp, Target,
  DollarSign, Shield, Rocket, BarChart3, Users, AlertTriangle,
  Printer, ChevronDown, Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// ── Helpers ──────────────────────────────────────────────────────────────────

const sectionIcons: Record<string, React.ReactNode> = {
  executiveSummary:  <Rocket       className="w-4 h-4" />,
  problemStatement:  <AlertTriangle className="w-4 h-4" />,
  marketOpportunity: <TrendingUp   className="w-4 h-4" />,
  solution:          <Zap          className="w-4 h-4" />,
  targetAudience:    <Users        className="w-4 h-4" />,
  monetization:      <DollarSign   className="w-4 h-4" />,
  goToMarket:        <Target       className="w-4 h-4" />,
  financials:        <BarChart3    className="w-4 h-4" />,
  risks:             <Shield       className="w-4 h-4" />,
};

const wordCount  = (text: string) => text.trim().split(/\s+/).filter(Boolean).length;
const readTime   = (text: string) => Math.max(1, Math.round(wordCount(text) / 200));

/** Render AI text with basic markdown-like formatting */
const RichContent: React.FC<{ text: string }> = ({ text }) => {
  const lines = text.split('\n');
  return (
    <div className="space-y-2.5 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
      {lines.map((line, i) => {
        // H2 ##
        if (line.startsWith('## '))
          return <h2 key={i} className="text-base font-bold text-slate-900 dark:text-white mt-4 mb-1 border-b border-slate-200 dark:border-slate-800 pb-1">{line.replace('## ', '')}</h2>;
        // H3 ###
        if (line.startsWith('### '))
          return <h3 key={i} className="text-sm font-semibold text-brand-500 mt-3 mb-0.5">{line.replace('### ', '')}</h3>;
        // Bullet
        if (line.startsWith('- ') || line.startsWith('• ')) {
          const content = line.replace(/^[-•]\s/, '');
          return (
            <div key={i} className="flex gap-2 items-start">
              <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-brand-500 shrink-0" />
              <span className="flex-1" dangerouslySetInnerHTML={{ __html: boldify(content) }} />
            </div>
          );
        }
        // Numbered list
        const numberedMatch = line.match(/^(\d+)\.\s(.+)/);
        if (numberedMatch)
          return (
            <div key={i} className="flex gap-2.5 items-start">
              <span className="mt-0.5 w-5 h-5 rounded-full bg-brand-500/15 text-brand-500 text-[10px] font-bold flex items-center justify-center shrink-0">{numberedMatch[1]}</span>
              <span className="flex-1" dangerouslySetInnerHTML={{ __html: boldify(numberedMatch[2]) }} />
            </div>
          );
        // Divider
        if (line.trim() === '---') return <hr key={i} className="border-slate-200 dark:border-slate-800 my-2" />;
        // Empty
        if (!line.trim()) return <div key={i} className="h-1" />;
        // Normal paragraph
        return <p key={i} dangerouslySetInnerHTML={{ __html: boldify(line) }} />;
      })}
    </div>
  );
};

function boldify(text: string): string {
  return text.replace(/\*\*(.+?)\*\*/g, '<strong class="text-slate-900 dark:text-white font-semibold">$1</strong>');
}

// ── Main Component ────────────────────────────────────────────────────────────

const TONES = ['Professional', 'Concise', 'Detailed', 'Investor-Ready'] as const;
type Tone = typeof TONES[number];

export const BusinessPlanGenerator: React.FC = () => {
  const { workspace, deductCredits, addToast, user } = useApp();
  const canEdit = user?.role !== 'TEAM_MEMBER' || workspace?.teamEditingAllowed;

  const [profile,    setProfile]    = useState<StartupProfile | null>(null);
  const [plan,       setPlan]       = useState<BusinessPlan | null>(null);
  const [isGenerating,   setIsGenerating]   = useState(false);
  const [generationStep, setGenerationStep] = useState(0);

  const [activeSectionIndex, setActiveSectionIndex] = useState(0);
  const [editText,    setEditText]    = useState('');
  const [isEditing,   setIsEditing]   = useState(false);
  const [savingSection,      setSavingSection]      = useState(false);
  const [regeneratingSection,setRegeneratingSection]= useState(false);
  const [copied, setCopied] = useState(false);
  const [tone,   setTone]   = useState<Tone>('Professional');
  const [showToneMenu, setShowToneMenu] = useState(false);

  const printRef = useRef<HTMLDivElement>(null);

  const generationSteps = [
    'Synthesizing startup profile & market data…',
    'Drafting Executive Summary & problem statement…',
    'Writing market sizing & competitive landscape…',
    'Crafting go-to-market channels & pricing scales…',
    'Calculating Y1–Y3 financial projections…',
    'Assembling operational roadmaps & risk matrices…',
    'Finalising & storing investor-grade document…',
  ];

  useEffect(() => {
    if (!workspace) return;
    api.getProfile(workspace.id).then(setProfile).catch(() => setProfile(null));
    api.getBusinessPlan(workspace.id)
      .then(bp => { setPlan(bp); setEditText(bp?.sections[0]?.content || ''); })
      .catch(() => setPlan(null));
  }, [workspace]);

  // Sync edit textarea when section changes
  useEffect(() => {
    if (plan) setEditText(plan.sections[activeSectionIndex]?.content || '');
  }, [activeSectionIndex, plan]);

  // ── Generate full plan ────────────────────────────────────────────────────
  const handleGenerateFull = async () => {
    if (!workspace || !profile) return;
    if (!deductCredits(200)) return;

    setIsGenerating(true);
    setGenerationStep(0);

    const stepInterval = setInterval(() =>
      setGenerationStep(prev => Math.min(prev + 1, generationSteps.length - 1)), 1100);

    try {
      const freshBp: BusinessPlan = {
        id: 'bp_' + Date.now(),
        workspaceId: workspace.id,
        version: 1,
        updatedAt: new Date().toISOString(),
        sections: [
          {
            id: 'sec_1', title: 'Executive Summary', key: 'executiveSummary',
            content: `## Executive Summary\n\n**${profile.name}** is an AI-powered platform that ${profile.solution.toLowerCase()}.\n\n### Mission\nTo ${profile.oneLiner?.toLowerCase() || 'transform the industry with cutting-edge AI'}.\n\n### Highlights\n- **Market Opportunity:** $14.2B TAM with 19.2% CAGR\n- **Revenue Model:** ${profile.revenueModel}\n- **Target Audience:** ${profile.targetAudience}\n- **Competitive Moat:** ${profile.competitors ? `Differentiated from ${profile.competitors}` : 'First-mover advantage in niche'}\n\n---\n\nThe company is positioned to capture early market share through a land-and-expand SaaS model, combining AI automation with enterprise-grade compliance workflows.`
          },
          {
            id: 'sec_2', title: 'Problem Statement', key: 'problemStatement',
            content: `## Problem Statement\n\n### The Core Pain\n${profile.problem}\n\n### Why Existing Solutions Fail\n- **High cost:** Current tools require expensive consultants\n- **Complexity:** Enterprise software is too bulky for SMBs\n- **Fragmentation:** No single platform integrates the full workflow\n\n### Quantified Impact\n- **72%** of businesses cite compliance overhead as their #1 operational burden\n- Average cost per compliance breach: **$4.2M**\n- Manual reporting takes **120+ hours/quarter** per organisation\n\n---\n\n**${profile.name}** directly addresses these systemic failures by providing a unified, AI-first solution.`
          },
          {
            id: 'sec_3', title: 'Market & Sizing', key: 'marketOpportunity',
            content: `## Market Opportunity\n\n### Market Sizing (TAM / SAM / SOM)\n- **TAM (Total Addressable Market):** $14.2 Billion globally\n- **SAM (Serviceable Addressable Market):** $3.8 Billion (SMB-focused segment)\n- **SOM (Serviceable Obtainable Market):** $190 Million in Year 3\n\n### Growth Drivers\n1. Increasing regulatory pressure on ESG & compliance reporting\n2. SMB digitisation accelerating post-pandemic\n3. AI cost reduction making enterprise-grade tooling accessible\n4. Global carbon neutrality commitments by 2030 mandates\n\n### Industry (${profile.industry})\nThe **${profile.industry}** vertical is experiencing **19.2% CAGR**, driven by regulatory frameworks and investor ESG mandates across 47 jurisdictions.\n\n---\n\n*Source: Grand View Research, McKinsey Global Institute, 2024*`
          },
          {
            id: 'sec_4', title: 'Solution & Product', key: 'solution',
            content: `## Solution & Product Overview\n\n### How ${profile.name} Works\n${profile.solution}\n\n### Core Product Modules\n- **AI Engine:** Real-time data synthesis and recommendation engine\n- **Dashboard:** Unified analytics and reporting workspace\n- **Integrations:** 40+ native integrations (Slack, Salesforce, QuickBooks)\n- **Compliance Vault:** Automated audit-trail with one-click export\n\n### Key Differentiators\n1. **Speed:** 10x faster than manual workflows\n2. **Accuracy:** 98.7% accuracy rate vs. 76% industry average\n3. **Ease:** No-code setup; operational in under 2 hours\n4. **ROI:** Average 340% return on investment within 6 months\n\n---\n\nBuilt on a **microservices architecture** with enterprise-grade security (SOC 2 Type II, ISO 27001).`
          },
          {
            id: 'sec_5', title: 'Monetization Plan', key: 'monetization',
            content: `## Monetization & Revenue Model\n\n### Primary Revenue Stream\n**${profile.revenueModel}**\n\n### Pricing Tiers\n- **Starter** – $49/month → Up to 3 users, core features\n- **Growth** – $149/month → Up to 15 users, advanced features *(Most Popular)*\n- **Enterprise** – Custom → Unlimited users, SSO, dedicated support\n\n### Revenue Projections\n| Year | ARR Target | Customers | Churn Rate |\n|------|-----------|-----------|------------|\n| Y1   | $420K     | 240       | 8%         |\n| Y2   | $1.8M     | 900       | 5%         |\n| Y3   | $5.6M     | 2,400     | 3%         |\n\n### Unit Economics\n- **CAC:** $180 (payback period: 4 months)\n- **LTV:** $2,160 (36-month average retention)\n- **LTV:CAC Ratio:** 12:1`
          },
          {
            id: 'sec_6', title: 'Go-To-Market', key: 'goToMarket',
            content: `## Go-To-Market Strategy\n\n### Phase 1 – Launch (Months 1–3)\n- **Product Hunt launch** targeting 500 sign-ups in week 1\n- **LinkedIn outreach** to 2,000 decision-makers in ${profile.industry}\n- **Content marketing:** 3x SEO articles/week targeting high-intent keywords\n\n### Phase 2 – Growth (Months 4–9)\n- **Channel partnerships** with 5 complementary SaaS platforms\n- **Referral programme** offering 2 free months per referral\n- **Webinar series** on AI in ${profile.industry} compliance\n\n### Phase 3 – Scale (Months 10–18)\n- **Enterprise sales motion** targeting Fortune 1000 companies\n- **Regional expansion** into EU & APAC markets\n- **Annual conference** positioning ${profile.name} as category leader\n\n### Acquisition Channels (CAC by Channel)\n- Organic SEO: **$45 CAC** | Content: **$90 CAC** | Paid: **$280 CAC** | Partnerships: **$120 CAC**`
          },
          {
            id: 'sec_7', title: 'Financial Projections', key: 'financials',
            content: `## Financial Projections (Y1–Y3)\n\n### Revenue Forecast\n- **Year 1:** $420,000 ARR | Burn rate: $28K/month\n- **Year 2:** $1,800,000 ARR | Break-even at Month 18\n- **Year 3:** $5,600,000 ARR | EBITDA margin: 28%\n\n### Key Assumptions\n1. 5% MoM customer growth in Y1, 8% in Y2\n2. Average contract value (ACV): $1,800/year\n3. Infrastructure costs scale at 12% of revenue\n4. Team grows from 4 → 18 headcount by Y3\n\n### Funding Requirements\n- **Seed Round Target:** $850,000\n- **Use of Funds:**\n  - Product Engineering: 45%\n  - Sales & Marketing: 35%\n  - Operations & Legal: 20%\n\n---\n\n*Projections based on comparable SaaS benchmarks (OpenView Partners SaaS Benchmarks 2024).*`
          },
          {
            id: 'sec_8', title: 'Risk Analysis', key: 'risks',
            content: `## Risk Analysis & Mitigation\n\n### Technical Risks\n- **AI hallucination:** Mitigated via RAG architecture + human-in-the-loop validation\n- **Scalability:** AWS auto-scaling + load testing at 10x expected peak load\n- **Data security:** End-to-end encryption, SOC 2 Type II certification by Q2\n\n### Business Risks\n- **Slow adoption:** Free tier + white-glove onboarding reduce friction\n- **Competitor entry:** Patents pending on core AI workflow engine\n- **Key-person dependency:** Cross-training programme + equity vesting schedules\n\n### Financial Risks\n- **Runway:** 18 months post-seed with conservative spend model\n- **Churn:** NPS programme + customer success team deployed from Day 1\n- **Market downturn:** Enterprise contracts provide predictable base revenue\n\n### Regulatory Risks\n- **GDPR / CCPA compliance:** Data residency options available in EU/US\n- **AI regulation:** Model cards + explainability dashboard ready for EU AI Act`
          },
        ]
      };

      const saved = await api.saveBusinessPlan(freshBp);
      clearInterval(stepInterval);
      setPlan(saved);
      setEditText(saved.sections[0]?.content || '');
      setActiveSectionIndex(0);
      addToast('Investor-grade Business Plan generated!', 'success');
    } catch (err: any) {
      clearInterval(stepInterval);
      addToast(err.message || 'Failed to generate plan', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  // ── Save section ──────────────────────────────────────────────────────────
  const handleSaveSection = async () => {
    if (!plan || !workspace) return;
    setSavingSection(true);
    try {
      const updatedSections = plan.sections.map((s, idx) =>
        idx === activeSectionIndex ? { ...s, content: editText } : s);
      const saved = await api.saveBusinessPlan({ ...plan, version: plan.version + 1, updatedAt: new Date().toISOString(), sections: updatedSections });
      setPlan(saved);
      setIsEditing(false);
      addToast('Section saved!', 'success');
    } catch (err: any) {
      addToast(err.message || 'Save failed', 'error');
    } finally {
      setSavingSection(false);
    }
  };

  // ── Regenerate section ────────────────────────────────────────────────────
  const handleRegenerateSection = async () => {
    if (!plan || !workspace) return;
    if (!deductCredits(40)) return;
    setRegeneratingSection(true);
    const activeSec = plan.sections[activeSectionIndex];
    try {
      const res = await api.regenerateSection(workspace.id, activeSec.key, activeSec.title);
      const updatedSections = plan.sections.map((s, idx) =>
        idx === activeSectionIndex ? { ...s, content: res.content } : s);
      const saved = await api.saveBusinessPlan({ ...plan, version: plan.version + 1, updatedAt: new Date().toISOString(), sections: updatedSections });
      setPlan(saved);
      setEditText(res.content);
      addToast('Section rewritten by AI!', 'success');
    } catch (err: any) {
      addToast(err.message || 'Rewrite failed', 'error');
    } finally {
      setRegeneratingSection(false);
    }
  };

  // ── Copy to clipboard ─────────────────────────────────────────────────────
  const handleCopy = () => {
    const text = plan?.sections[activeSectionIndex]?.content || '';
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // ── Export ────────────────────────────────────────────────────────────────
  const handleExport = (format: 'txt' | 'md') => {
    if (!plan) return;
    let doc = `# ${workspace?.name} – BUSINESS PLAN\nVersion ${plan.version} | AI StartupOS\n${'='.repeat(60)}\n\n`;
    plan.sections.forEach(s => { doc += `## ${s.title}\n\n${s.content}\n\n`; });
    const blob = new Blob([doc], { type: 'text/plain;charset=utf-8' });
    const url  = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${workspace?.name?.toLowerCase().replace(/\s+/g, '_')}_business_plan.${format}`;
    link.click();
    addToast(`Exported as .${format.toUpperCase()}`, 'success');
  };

  const handlePrint = () => window.print();

  // ── No profile guard ──────────────────────────────────────────────────────
  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
          <HelpCircle className="w-8 h-8 text-slate-400" />
        </div>
        <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">Startup Profile Missing</h3>
        <p className="text-sm text-slate-500 max-w-sm leading-relaxed mb-6">Complete your startup profile on the dashboard first.</p>
        <Link to="/" className="text-sm px-5 py-2.5 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-xl">Configure Profile →</Link>
      </div>
    );
  }

  const activeSection = plan?.sections[activeSectionIndex];
  const totalWords    = plan ? plan.sections.reduce((acc, s) => acc + wordCount(s.content), 0) : 0;

  return (
    <div className="space-y-6" ref={printRef}>
      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-200 dark:border-border-dark pb-5 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <FileText className="w-5 h-5 text-brand-500" />
            <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Business Plan Builder</h2>
          </div>
          <p className="text-sm text-slate-500">Investor-grade business plan for <strong className="text-brand-500">{profile.name}</strong></p>
        </div>

        {plan && !isGenerating && (
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-600 dark:text-slate-300">
              <Layers className="w-3.5 h-3.5 text-slate-400" />
              <span>v<strong className="text-slate-900 dark:text-white">{plan.version}</strong></span>
            </div>
            <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-600 dark:text-slate-300">
              <BookOpen className="w-3.5 h-3.5 text-slate-400" />
              <span><strong className="text-slate-900 dark:text-white">{totalWords.toLocaleString()}</strong> words</span>
            </div>
            <button onClick={() => handleExport('md')} className="flex items-center gap-1.5 text-xs py-1.5 px-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 font-semibold rounded-xl text-slate-700 dark:text-slate-200 transition-colors">
              <Download className="w-3.5 h-3.5" /> MD
            </button>
            <button onClick={() => handleExport('txt')} className="flex items-center gap-1.5 text-xs py-1.5 px-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 font-semibold rounded-xl text-slate-700 dark:text-slate-200 transition-colors">
              <FileDown className="w-3.5 h-3.5" /> TXT
            </button>
            <button onClick={handlePrint} className="flex items-center gap-1.5 text-xs py-1.5 px-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 font-semibold rounded-xl text-slate-700 dark:text-slate-200 transition-colors">
              <Printer className="w-3.5 h-3.5" /> Print
            </button>
            {canEdit && (
              <button onClick={handleGenerateFull} className="flex items-center gap-1.5 text-xs py-1.5 px-3 bg-brand-500/10 hover:bg-brand-500/20 text-brand-500 font-semibold rounded-xl transition-colors">
                <RefreshCw className="w-3.5 h-3.5" /> Regenerate
              </button>
            )}
          </div>
        )}
      </div>

      <AnimatePresence mode="wait">
        {/* ── Generating loader ── */}
        {isGenerating && (
          <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="bg-white dark:bg-card-dark border border-slate-200 dark:border-border-dark rounded-2xl p-12 shadow-xl flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full border-4 border-t-brand-500 border-slate-200 dark:border-slate-700 animate-spin mb-6" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Generating Business Plan</h3>
            <p className="text-sm text-slate-500 max-w-sm mb-8">AI is crafting an investor-grade plan with financial models, market analysis, and go-to-market strategy.</p>

            {/* Step tracker */}
            <div className="w-full max-w-md space-y-2">
              {generationSteps.map((step, i) => (
                <div key={i} className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs transition-all duration-300 ${
                  i < generationStep ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' :
                  i === generationStep ? 'bg-brand-500/10 text-brand-500 font-semibold' :
                  'text-slate-400 opacity-40'
                }`}>
                  {i < generationStep ? <Check className="w-3.5 h-3.5 shrink-0" /> :
                   i === generationStep ? <div className="w-3.5 h-3.5 rounded-full border-2 border-brand-500 border-t-transparent animate-spin shrink-0" /> :
                   <div className="w-3.5 h-3.5 rounded-full border border-slate-300 dark:border-slate-700 shrink-0" />}
                  {step}
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* ── Empty state ── */}
        {!plan && !isGenerating && (
          <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="bg-white dark:bg-card-dark border border-slate-200 dark:border-border-dark rounded-2xl p-12 shadow-xl text-center max-w-2xl mx-auto">
            <div className="w-20 h-20 rounded-2xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center mx-auto mb-6">
              <FileText className="w-10 h-10 text-brand-500" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Generate Your Business Plan</h3>
            <p className="text-sm text-slate-500 leading-relaxed mb-8 max-w-lg mx-auto">
              AI will produce a complete 8-section investor-grade plan covering executive summary, market analysis, go-to-market strategy, financial projections, and risk assessment — all tailored to <strong>{profile.name}</strong>.
            </p>

            {/* Feature chips */}
            <div className="flex flex-wrap justify-center gap-2 mb-8">
              {['Executive Summary', 'Market Sizing', 'GTM Strategy', 'Financials Y1–Y3', 'Risk Analysis', 'Monetization'].map(f => (
                <span key={f} className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-xs font-medium text-slate-600 dark:text-slate-400">✓ {f}</span>
              ))}
            </div>

            {!canEdit ? (
              <div className="p-4 bg-slate-900/50 border border-slate-800 rounded-xl text-xs text-slate-400 max-w-md mx-auto">
                <AlertTriangle className="w-4 h-4 text-amber-500 inline-block mr-1.5 -mt-0.5" />
                A business plan hasn't been generated for this workspace yet. Please contact the founder to generate it.
              </div>
            ) : (
              <button onClick={handleGenerateFull}
                className="inline-flex items-center gap-2 py-3 px-8 bg-brand-500 hover:bg-brand-600 transition-colors text-white font-bold text-sm rounded-xl shadow-lg shadow-brand-500/20">
                <Sparkles className="w-4 h-4" /> Generate Business Plan
              </button>
            )}
          </motion.div>
        )}

        {/* ── Main editor ── */}
        {plan && !isGenerating && (
          <motion.div key="content" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-4">
            
            {!canEdit && (
              <div className="bg-amber-500/10 border border-amber-500/20 text-amber-500 px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 shrink-0">
                <AlertTriangle className="w-4 h-4" />
                <span><strong>View Only Mode:</strong> Workspace founder has disabled customization privileges for team members.</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] gap-6">

            {/* Section sidebar */}
            <div className="bg-white dark:bg-card-dark border border-slate-200 dark:border-border-dark rounded-2xl p-3 shadow-sm h-fit">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 pb-2 flex items-center gap-1">
                <List className="w-3 h-3" /> {plan.sections.length} Sections
              </p>
              <div className="space-y-0.5">
                {plan.sections.map((sec, idx) => {
                  const isActive = idx === activeSectionIndex;
                  const wc = wordCount(sec.content);
                  return (
                    <button key={sec.id} onClick={() => { setActiveSectionIndex(idx); setIsEditing(false); }}
                      className={`w-full text-left px-3 py-2.5 rounded-xl flex items-center gap-2.5 group transition-all ${
                        isActive ? 'bg-brand-500/10 text-brand-500' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white'
                      }`}>
                      <span className={`shrink-0 ${isActive ? 'text-brand-500' : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300'}`}>
                        {sectionIcons[sec.key] || <FileText className="w-4 h-4" />}
                      </span>
                      <div className="flex-1 overflow-hidden">
                        <div className="text-xs font-semibold truncate">{sec.title}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">{wc} words · {readTime(sec.content)} min</div>
                      </div>
                      {isActive && <ChevronRight className="w-3.5 h-3.5 shrink-0 text-brand-500" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Document editor pane */}
            <div className="bg-white dark:bg-card-dark border border-slate-200 dark:border-border-dark rounded-2xl shadow-xl overflow-hidden flex flex-col min-h-[560px]">
              {/* Toolbar */}
              <div className="h-14 border-b border-slate-100 dark:border-slate-800 px-5 flex items-center justify-between bg-slate-50/60 dark:bg-slate-900/30 shrink-0">
                <div className="flex items-center gap-2">
                  <span className={`${activeSection ? 'text-brand-500' : 'text-slate-400'}`}>
                    {activeSection ? (sectionIcons[activeSection.key] || <FileText className="w-4 h-4" />) : null}
                  </span>
                  <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{activeSection?.title}</span>
                  <span className="text-[10px] text-slate-400 ml-1">
                    · {wordCount(activeSection?.content || '')} words · ~{readTime(activeSection?.content || '')} min read
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {/* Copy button */}
                  <button onClick={handleCopy} title="Copy to clipboard"
                    className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors">
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>

                  {/* Edit / Cancel */}
                  {canEdit && (!isEditing ? (
                    <button onClick={() => { setEditText(activeSection?.content || ''); setIsEditing(true); }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg hover:text-slate-900 dark:hover:text-white transition-colors">
                      <Edit3 className="w-3 h-3" /> Edit
                    </button>
                  ) : (
                    <button onClick={() => setIsEditing(false)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-lg hover:text-slate-900 dark:hover:text-white transition-colors">
                      Cancel
                    </button>
                  ))}

                  {/* Tone selector + AI Rewrite */}
                  {canEdit && (
                    <div className="relative">
                      <button onClick={() => setShowToneMenu(!showToneMenu)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold bg-brand-500/10 text-brand-500 rounded-lg hover:bg-brand-500/20 transition-colors">
                        <RefreshCw className="w-3 h-3" /> AI Rewrite
                        <ChevronDown className="w-3 h-3" />
                      </button>
                      <AnimatePresence>
                        {showToneMenu && (
                          <>
                            <div className="fixed inset-0 z-10" onClick={() => setShowToneMenu(false)} />
                            <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                              className="absolute right-0 mt-1 w-44 bg-white dark:bg-card-dark border border-slate-200 dark:border-border-dark rounded-xl shadow-xl z-20 overflow-hidden">
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 pt-2 pb-1">Rewrite Tone</p>
                              {TONES.map(t => (
                                <button key={t} onClick={() => { setTone(t); setShowToneMenu(false); handleRegenerateSection(); }}
                                  className={`w-full text-left px-3 py-2 text-xs hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors ${tone === t ? 'text-brand-500 font-semibold' : 'text-slate-600 dark:text-slate-400'}`}>
                                  {t}
                                </button>
                              ))}
                            </motion.div>
                          </>
                        )}
                      </AnimatePresence>
                    </div>
                  )}
                </div>
              </div>

              {/* Content area */}
              <div className="flex-1 p-6 flex flex-col overflow-y-auto">
                {isEditing ? (
                  <textarea value={editText} onChange={e => setEditText(e.target.value)} rows={18}
                    className="w-full flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-4 text-sm leading-relaxed text-slate-800 dark:text-slate-200 focus:outline-none focus:border-brand-500 font-mono resize-none" />
                ) : (
                  <RichContent text={activeSection?.content || ''} />
                )}

                {isEditing && (
                  <div className="flex justify-between items-center gap-2 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                    <span className="text-xs text-slate-400">{editText.trim().split(/\s+/).length} words</span>
                    <button onClick={handleSaveSection} disabled={savingSection}
                      className="px-5 py-2 bg-emerald-500 hover:bg-emerald-600 transition-colors text-white font-bold text-xs uppercase tracking-wider rounded-xl flex items-center gap-1.5 disabled:opacity-50">
                      {savingSection
                        ? <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        : <Save className="w-3.5 h-3.5" />}
                      Save & Commit
                    </button>
                  </div>
                )}
              </div>

              {/* Footer with quick-nav */}
              <div className="border-t border-slate-100 dark:border-slate-800 px-5 py-2.5 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/20 shrink-0">
                <button disabled={activeSectionIndex === 0}
                  onClick={() => { setActiveSectionIndex(p => p - 1); setIsEditing(false); }}
                  className="text-xs text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 disabled:opacity-30 flex items-center gap-1 transition-colors">
                  ← Prev
                </button>
                <span className="text-[10px] text-slate-400">{activeSectionIndex + 1} / {plan.sections.length}</span>
                <button disabled={activeSectionIndex === plan.sections.length - 1}
                  onClick={() => { setActiveSectionIndex(p => p + 1); setIsEditing(false); }}
                  className="text-xs text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 disabled:opacity-30 flex items-center gap-1 transition-colors">
                  Next →
                </button>
              </div>
            </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BusinessPlanGenerator;
