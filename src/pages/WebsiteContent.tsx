import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { Link } from 'react-router-dom';
import type { WebsiteContent, StartupProfile } from '../types';
import {
  Globe, Sparkles, RefreshCw, Save, HelpCircle, Copy, Check,
  Search, ArrowUpRight, ChevronDown, ChevronUp, Zap, Star,
  DollarSign, Monitor, Smartphone, Tablet, Palette, Type,
  Layers, Grid, AlignCenter, AlignLeft, RotateCcw, ExternalLink,
  ChevronRight, ChevronLeft, Wand2, LayoutTemplate, Columns, List,
  Plus, Trash2, Edit3, GripVertical, Quote, TrendingUp, Users,
  Mail, Puzzle, ArrowRight, CheckCircle, PlayCircle, Shield,
  Award, Rocket, PanelLeft, AlertTriangle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// ─────────────────────────────────────────────────────────────────────────────
// Types & Data Structures
// ─────────────────────────────────────────────────────────────────────────────

type ActiveTool = 'colors' | 'typography' | 'layout' | 'effects' | 'sections';
type PreviewDevice = 'desktop' | 'tablet' | 'mobile';
type Tab = 'studio' | 'seo';
type SectionKey = 'nav' | 'hero' | 'stats' | 'features' | 'howItWorks' | 'testimonials' | 'pricing' | 'cta' | 'integrations' | 'newsletter' | 'faq' | 'footer';

interface StatItem      { value: string; label: string; prefix?: string; suffix?: string }
interface StepItem      { title: string; description: string }
interface Testimonial   { name: string; role: string; company: string; quote: string; rating: number; avatar: string }
interface Integration   { name: string; color: string }

interface SectionData {
  heroTitle:       string;
  heroSubtitle:    string;
  heroCta:         string;
  heroSecondaryCta:string;
  stats:           StatItem[];
  features:        { title: string; description: string; icon: string }[];
  steps:           StepItem[];
  testimonials:    Testimonial[];
  pricingTitle:    string;
  pricingSubtitle: string;
  pricing:         { name: string; price: string; period: string; features: string[]; highlighted: boolean }[];
  ctaHeadline:     string;
  ctaSubtext:      string;
  ctaButton:       string;
  integrations:    Integration[];
  integrationsTitle: string;
  newsletterHeadline: string;
  newsletterSubtext:  string;
  newsletterButton:   string;
  faq:             { question: string; answer: string }[];
  footerTagline:   string;
  navLinks:        string[];
  seoTitle:        string;
  seoDesc:         string;
  seoKeywords:     string;
}

interface DesignConfig {
  primaryColor: string;
  accentColor:  string;
  bgColor:      string;
  cardBg:       string;
  textColor:    string;
  mutedColor:   string;
  headingFont:  string;
  bodyFont:     string;
  borderRadius: number;
  buttonStyle:  'filled' | 'outline' | 'gradient' | 'soft';
  heroLayout:   'centered' | 'left' | 'split';
  featureLayout:'grid3' | 'grid2' | 'list';
  navStyle:     'transparent' | 'solid' | 'glass';
  heroBg:       'solid' | 'gradient' | 'mesh' | 'dots';
  spacing:      'compact' | 'normal' | 'spacious';
  shadowLevel:  'none' | 'sm' | 'md' | 'lg';
  sectionOrder: SectionKey[];
  sectionVisible: Record<SectionKey, boolean>;
  darkMode:     boolean;
}

const ALL_SECTIONS: SectionKey[] = ['nav','hero','stats','features','howItWorks','testimonials','pricing','cta','integrations','newsletter','faq','footer'];

const SECTION_LABELS: Record<SectionKey, string> = {
  nav: 'Navigation', hero: 'Hero', stats: 'Stats Bar', features: 'Features',
  howItWorks: 'How It Works', testimonials: 'Testimonials', pricing: 'Pricing',
  cta: 'CTA Banner', integrations: 'Integrations', newsletter: 'Newsletter',
  faq: 'FAQ', footer: 'Footer',
};

const DEFAULT_SECTION_DATA: SectionData = {
  heroTitle:        'The Smarter Way to Build Your Startup',
  heroSubtitle:     'AI-powered tools that turn your idea into an investor-ready business in minutes — not months.',
  heroCta:          'Get Started Free',
  heroSecondaryCta: 'Watch Demo',
  stats: [
    { value: '500', label: 'Startups Launched', suffix: '+' },
    { value: '99.9', label: 'Uptime SLA', suffix: '%' },
    { value: '12', label: 'Avg. ROI Months', prefix: '', suffix: 'x' },
    { value: '4.9', label: 'Rating on G2', suffix: '/5' },
  ],
  features: [
    { title: 'AI Business Plan', description: 'Generate investor-grade plans with financials, market analysis and GTM strategy in seconds.', icon: '📄' },
    { title: 'Idea Validator', description: 'Validate your concept against real market data with SWOT, TAM/SAM/SOM and competitor maps.', icon: '✅' },
    { title: 'Brand Kit Generator', description: 'Create cohesive brand identity — name ideas, taglines, color palette and brand voice.', icon: '🎨' },
    { title: 'Pitch Deck Builder', description: 'Design compelling investor slides with AI-crafted narratives and storytelling structures.', icon: '📊' },
    { title: 'AI Mentor Chat', description: 'Get real-time startup coaching from an AI trained on thousands of successful founders.', icon: '🤖' },
    { title: 'Marketing Hub', description: 'Generate go-to-market strategies, content calendars, and acquisition channel plans.', icon: '📣' },
  ],
  steps: [
    { title: 'Complete Your Profile', description: 'Tell us about your startup idea — your industry, target audience, and the problem you solve.' },
    { title: 'Generate with AI', description: 'Our AI synthesises your inputs and generates a complete business plan, brand kit, and pitch deck.' },
    { title: 'Refine & Export', description: 'Edit any section, regenerate with a new tone, and export investor-ready documents in one click.' },
  ],
  testimonials: [
    { name: 'Sarah Chen', role: 'Co-Founder', company: 'GreenFlow', quote: 'We went from idea to pitch deck in 48 hours. Our seed investors were blown away by the quality of the business plan.', rating: 5, avatar: 'SC' },
    { name: 'Marcus Williams', role: 'CEO', company: 'TechBridge', quote: 'The AI Mentor saved us months of trial and error. It\'s like having a startup advisor available 24/7.', rating: 5, avatar: 'MW' },
    { name: 'Priya Patel', role: 'Founder', company: 'NutrAI', quote: 'The brand kit generator alone is worth the subscription. Clean, professional, and completely tailored to our vision.', rating: 5, avatar: 'PP' },
  ],
  pricingTitle:    'Simple, Transparent Pricing',
  pricingSubtitle: 'Start free. Upgrade when you\'re ready to scale.',
  pricing: [
    { name: 'Starter', price: '$0', period: '/month', features: ['Standard AI Access', '1 Workspace', 'Business Plan', 'Community Access'], highlighted: false },
    { name: 'Growth', price: '$49', period: '/month', features: ['Unlimited AI Generations', '5 Workspaces', 'All AI Tools', 'Priority Support', 'Export to PDF/DOCX'], highlighted: true },
    { name: 'Enterprise', price: 'Custom', period: '', features: ['Enterprise AI Access', 'Unlimited Workspaces', 'SSO & Teams', 'Dedicated CSM', 'SLA Guarantee'], highlighted: false },
  ],
  ctaHeadline: 'Ready to Launch Your Startup?',
  ctaSubtext:  'Join 500+ founders who turned their idea into a fundable business with AI.',
  ctaButton:   'Start Building Free',
  integrations: [
    { name: 'Notion', color: '#000000' }, { name: 'Slack', color: '#4A154B' },
    { name: 'Salesforce', color: '#00A1E0' }, { name: 'HubSpot', color: '#FF7A59' },
    { name: 'QuickBooks', color: '#2CA01C' }, { name: 'Stripe', color: '#635BFF' },
    { name: 'Zapier', color: '#FF4A00' }, { name: 'Airtable', color: '#18BFFF' },
  ],
  integrationsTitle: 'Connects with your favourite tools',
  newsletterHeadline: 'Stay Ahead of the Curve',
  newsletterSubtext:  'Weekly startup insights, AI tool updates, and founder stories — delivered to your inbox.',
  newsletterButton:   'Subscribe Free',
  faq: [
    { question: 'How does the AI generate my business plan?', answer: 'Our AI analyses your startup profile inputs and synthesises them with real market data, competitive intelligence, and startup best practices to produce a comprehensive, investor-ready document.' },
    { question: 'Can I edit the AI-generated content?', answer: 'Absolutely. Every section is fully editable. You can manually tweak text, or use the AI Rewrite feature to regenerate any section with a different tone or focus.' },
    { question: 'What plan do I need?', answer: 'Our Starter plan allows you to try all tools. Upgrade to Pro for unlimited generation, team collaboration, and exporting capabilities.' },
    { question: 'Is my data secure?', answer: 'Yes. All data is encrypted at rest and in transit. We are SOC 2 Type II certified and GDPR compliant. We never share your data with third parties.' },
  ],
  footerTagline: 'Built for founders, by founders.',
  navLinks:      ['Features', 'Pricing', 'FAQ', 'Blog', 'About'],
  seoTitle:      '',
  seoDesc:       '',
  seoKeywords:   '',
};

const DEFAULT_DESIGN: DesignConfig = {
  primaryColor: '#8b5cf6', accentColor: '#10b981',
  bgColor: '#090a0f', cardBg: '#11131e',
  textColor: '#f3f4f6', mutedColor: '#8e97aa',
  headingFont: 'Outfit', bodyFont: 'Plus Jakarta Sans',
  borderRadius: 12, buttonStyle: 'filled',
  heroLayout: 'centered', featureLayout: 'grid3',
  navStyle: 'solid', heroBg: 'dots',
  spacing: 'normal', shadowLevel: 'md',
  sectionOrder: [...ALL_SECTIONS],
  sectionVisible: Object.fromEntries(ALL_SECTIONS.map(s => [s, true])) as Record<SectionKey, boolean>,
  darkMode: true,
};

const THEMES = [
  { name: 'Midnight',  emoji: '🌙', config: { primaryColor: '#8b5cf6', accentColor: '#10b981', bgColor: '#090a0f', cardBg: '#11131e', textColor: '#f3f4f6', mutedColor: '#6b7280', darkMode: true }},
  { name: 'Ocean',     emoji: '🌊', config: { primaryColor: '#0ea5e9', accentColor: '#06b6d4', bgColor: '#0a1628', cardBg: '#0f1f3d', textColor: '#e0f2fe', mutedColor: '#7dd3fc', darkMode: true }},
  { name: 'Sunset',    emoji: '🌅', config: { primaryColor: '#f97316', accentColor: '#fb923c', bgColor: '#1a0a00', cardBg: '#1f1107', textColor: '#fff7ed', mutedColor: '#fdba74', darkMode: true }},
  { name: 'Forest',    emoji: '🌿', config: { primaryColor: '#22c55e', accentColor: '#86efac', bgColor: '#021207', cardBg: '#071a0e', textColor: '#dcfce7', mutedColor: '#6ee7b7', darkMode: true }},
  { name: 'Rose',      emoji: '🌸', config: { primaryColor: '#f43f5e', accentColor: '#fb7185', bgColor: '#1a0010', cardBg: '#250016', textColor: '#ffe4e6', mutedColor: '#fda4af', darkMode: true }},
  { name: 'Minimal',   emoji: '⬜', config: { primaryColor: '#6366f1', accentColor: '#a5b4fc', bgColor: '#ffffff', cardBg: '#f8fafc', textColor: '#0f172a', mutedColor: '#64748b', darkMode: false }},
  { name: 'Warm',      emoji: '🏖️', config: { primaryColor: '#d97706', accentColor: '#f59e0b', bgColor: '#fefce8', cardBg: '#fffbeb', textColor: '#1c1917', mutedColor: '#78716c', darkMode: false }},
  { name: 'Arctic',    emoji: '❄️', config: { primaryColor: '#0284c7', accentColor: '#38bdf8', bgColor: '#f0f9ff', cardBg: '#e0f2fe', textColor: '#0c4a6e', mutedColor: '#0369a1', darkMode: false }},
];

const HEADING_FONTS = ['Outfit', 'Plus Jakarta Sans', 'Inter', 'Poppins', 'Space Grotesk', 'Raleway', 'DM Sans', 'Syne'];
const BODY_FONTS    = ['Plus Jakarta Sans', 'Inter', 'Outfit', 'DM Sans', 'Source Sans Pro', 'Nunito', 'Lato', 'Open Sans'];

// ─────────────────────────────────────────────────────────────────────────────
// Primitive UI components
// ─────────────────────────────────────────────────────────────────────────────

const CopyBtn: React.FC<{ text: string }> = ({ text }) => {
  const [ok, setOk] = useState(false);
  return (
    <button onClick={() => { navigator.clipboard.writeText(text); setOk(true); setTimeout(() => setOk(false), 1500); }}
      className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors">
      {ok ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
    </button>
  );
};

const TField: React.FC<{ label?: string; value: string; onChange: (v: string) => void; multi?: boolean; rows?: number; max?: number; placeholder?: string }> = ({
  label, value, onChange, multi, rows = 2, max, placeholder
}) => (
  <div className="space-y-1">
    {label && <div className="flex items-center justify-between"><label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{label}</label>{max && <span className={`text-[9px] font-mono ${value.length > max * 0.9 ? 'text-amber-400' : 'text-slate-500'}`}>{value.length}/{max}</span>}</div>}
    {multi
      ? <textarea value={value} rows={rows} maxLength={max} placeholder={placeholder} onChange={e => onChange(e.target.value)}
          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-brand-500 resize-none leading-relaxed" />
      : <input value={value} maxLength={max} placeholder={placeholder} onChange={e => onChange(e.target.value)}
          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-brand-500" />}
  </div>
);

const ColorSwatch: React.FC<{ label: string; value: string; onChange: (v: string) => void }> = ({ label, value, onChange }) => (
  <div className="flex items-center justify-between py-1.5">
    <span className="text-xs text-slate-400">{label}</span>
    <div className="flex items-center gap-2">
      <span className="text-[9px] font-mono text-slate-500">{value}</span>
      <label className="cursor-pointer">
        <div className="w-6 h-6 rounded-lg border-2 border-white/10 shadow overflow-hidden" style={{ backgroundColor: value }}>
          <input type="color" value={value} onChange={e => onChange(e.target.value)} className="opacity-0 w-full h-full cursor-pointer absolute" />
        </div>
      </label>
    </div>
  </div>
);

const SliderRow: React.FC<{ label: string; value: number; min: number; max: number; unit?: string; onChange: (v: number) => void }> = ({ label, value, min, max, unit = '', onChange }) => (
  <div className="space-y-1">
    <div className="flex justify-between text-xs"><span className="text-slate-400">{label}</span><span className="font-mono text-slate-300">{value}{unit}</span></div>
    <input type="range" min={min} max={max} value={value} onChange={e => onChange(Number(e.target.value))} className="w-full h-1.5 rounded-full appearance-none bg-slate-700 accent-brand-500 cursor-pointer" />
  </div>
);

const Seg: React.FC<{ label: string; value: string; options: { value: string; label: string }[]; onChange: (v: string) => void }> = ({ label, value, options, onChange }) => (
  <div className="space-y-1.5">
    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{label}</span>
    <div className="flex bg-slate-800 rounded-xl p-0.5 gap-0.5">
      {options.map(o => (
        <button key={o.value} onClick={() => onChange(o.value)}
          className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold transition-all ${value === o.value ? 'bg-slate-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}>
          {o.label}
        </button>
      ))}
    </div>
  </div>
);

const Toggle: React.FC<{ label: string; value: boolean; onChange: (v: boolean) => void; small?: boolean }> = ({ label, value, onChange, small }) => (
  <div className="flex items-center justify-between py-1">
    <span className={`${small ? 'text-[11px]' : 'text-xs'} text-slate-400`}>{label}</span>
    <button onClick={() => onChange(!value)} className={`relative rounded-full transition-colors shrink-0 ${small ? 'w-8 h-4' : 'w-9 h-5'} ${value ? 'bg-brand-500' : 'bg-slate-600'}`}>
      <span className={`absolute top-0.5 left-0.5 rounded-full bg-white shadow transition-transform ${small ? 'w-3 h-3' : 'w-4 h-4'} ${value ? (small ? 'translate-x-4' : 'translate-x-4') : ''}`} />
    </button>
  </div>
);

const Divider: React.FC<{ label: string }> = ({ label }) => (
  <div className="flex items-center gap-2 py-1 mt-1">
    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap">{label}</span>
    <div className="flex-1 h-px bg-slate-700" />
  </div>
);

// Collapsible section editor card
const EditorCard: React.FC<{ title: string; icon?: React.ReactNode; children: React.ReactNode; badge?: string }> = ({ title, icon, children, badge }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-slate-700/60 rounded-xl overflow-hidden">
      <button onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-2 px-3 py-2.5 bg-slate-800/60 hover:bg-slate-800 transition-colors text-left">
        {icon && <span className="text-brand-400 shrink-0">{icon}</span>}
        <span className="flex-1 text-xs font-bold text-slate-200">{title}</span>
        {badge && <span className="text-[9px] bg-brand-500/20 text-brand-400 px-2 py-0.5 rounded-full font-bold">{badge}</span>}
        {open ? <ChevronUp className="w-3.5 h-3.5 text-slate-500 shrink-0" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-500 shrink-0" />}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
            <div className="p-3 space-y-2 bg-slate-900/60 border-t border-slate-700/50">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Live Canvas renderer
// ─────────────────────────────────────────────────────────────────────────────

const LiveCanvas: React.FC<{ data: SectionData; design: DesignConfig; device: PreviewDevice }> = ({ data, design, device }) => {
  const { primaryColor: pc, accentColor: ac, bgColor: bg, cardBg: cb, textColor: tc, mutedColor: mc } = design;
  const br = `${design.borderRadius}px`;
  const sp = { compact: 'py-8 px-6', normal: 'py-14 px-8', spacious: 'py-20 px-10' }[design.spacing];
  const shd = { none: '', sm: '0 1px 3px rgba(0,0,0,.2)', md: '0 4px 16px rgba(0,0,0,.3)', lg: '0 8px 32px rgba(0,0,0,.4)' }[design.shadowLevel];

  const btnFill: React.CSSProperties = { backgroundColor: pc, color: '#fff', borderRadius: br, boxShadow: shd };
  const btnOut:  React.CSSProperties = { border: `1.5px solid ${pc}`, color: pc, borderRadius: br };
  const btnGrad: React.CSSProperties = { background: `linear-gradient(135deg, ${pc}, ${ac})`, color: '#fff', borderRadius: br };
  const btnSoft: React.CSSProperties = { backgroundColor: pc + '25', color: pc, borderRadius: br };
  const btnStyle: React.CSSProperties = { filled: btnFill, outline: btnOut, gradient: btnGrad, soft: btnSoft }[design.buttonStyle];

  const heroBgStyle = (): React.CSSProperties => ({
    solid:    { backgroundColor: bg },
    gradient: { background: `linear-gradient(135deg, ${bg}, ${pc}22, ${bg})` },
    mesh:     { background: `radial-gradient(at 20% 30%, ${pc}22 0%, transparent 60%), radial-gradient(at 80% 70%, ${ac}18 0%, transparent 60%), ${bg}` },
    dots:     { backgroundColor: bg, backgroundImage: `radial-gradient(${pc}28 1.5px, transparent 1.5px)`, backgroundSize: '22px 22px' },
  } as Record<string, React.CSSProperties>)[design.heroBg];

  const featureCols = { grid3: device === 'mobile' ? 1 : 3, grid2: device === 'mobile' ? 1 : 2, list: 1 }[design.featureLayout];
  const isMobile = device === 'mobile';

  const renderSection = (key: SectionKey) => {
    if (!design.sectionVisible[key]) return null;
    switch (key) {

      case 'nav': return (
        <nav key="nav" style={{ backgroundColor: { solid: cb, transparent: 'transparent', glass: bg + 'cc' }[design.navStyle], borderBottom: `1px solid ${pc}20`, backdropFilter: design.navStyle === 'glass' ? 'blur(12px)' : undefined, position: 'sticky', top: 0, zIndex: 10 }}
          className="flex items-center justify-between px-8 py-3.5">
          <span style={{ color: pc, fontFamily: design.headingFont }} className="font-black text-sm">{data.navLinks[0] ? '' : ''}{/* brand name */}
            <span style={{ color: tc }}>★</span><span style={{ color: pc }}>OS</span>
          </span>
          {!isMobile && <div style={{ color: mc }} className="flex items-center gap-5 text-xs font-medium">
            {data.navLinks.map(l => <span key={l} className="cursor-pointer hover:opacity-80">{l}</span>)}
          </div>}
          <button style={{ ...btnStyle, fontSize: 11, padding: '6px 14px', fontWeight: 700 }}>{data.heroCta}</button>
        </nav>
      );

      case 'hero': return (
        <div key="hero" style={heroBgStyle()} className={sp}>
          {design.heroLayout === 'split' && !isMobile ? (
            <div className="grid grid-cols-2 gap-8 items-center max-w-5xl mx-auto">
              <HeroText data={data} design={design} br={br} btnStyle={btnStyle} mc={mc} pc={pc} tc={tc} ac={ac} />
              <div style={{ backgroundColor: cb, borderRadius: br, border: `1px solid ${pc}20`, boxShadow: shd, aspectRatio: '4/3' }} className="flex items-center justify-center">
                <Globe className="w-16 h-16 opacity-15" style={{ color: pc }} />
              </div>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto" style={{ textAlign: design.heroLayout === 'centered' ? 'center' : 'left' }}>
              <HeroText data={data} design={design} br={br} btnStyle={btnStyle} mc={mc} pc={pc} tc={tc} ac={ac} centered={design.heroLayout === 'centered'} />
            </div>
          )}
        </div>
      );

      case 'stats': return (
        <div key="stats" style={{ backgroundColor: cb, borderTop: `1px solid ${pc}15`, borderBottom: `1px solid ${pc}15` }} className={`px-8 py-8`}>
          <div className={`grid gap-6 max-w-4xl mx-auto ${isMobile ? 'grid-cols-2' : 'grid-cols-4'}`}>
            {data.stats.map((s, i) => (
              <div key={i} className="text-center">
                <div style={{ color: pc, fontFamily: design.headingFont }} className="text-3xl font-black">{s.prefix}{s.value}{s.suffix}</div>
                <div style={{ color: mc }} className="text-xs mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      );

      case 'features': return (
        <div key="features" style={{ backgroundColor: bg }} className={sp}>
          <div className="text-center mb-10">
            <span style={{ color: ac }} className="text-[10px] font-bold uppercase tracking-widest">Features</span>
            <h2 style={{ color: tc, fontFamily: design.headingFont }} className="text-2xl font-bold mt-1.5">Everything You Need</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${featureCols}, 1fr)`, gap: 16, maxWidth: 960, margin: '0 auto' }}>
            {data.features.map((f, i) => (
              <div key={i} style={{ backgroundColor: cb, borderRadius: br, border: `1px solid ${pc}18`, boxShadow: shd }} className="p-5">
                <div style={{ fontSize: 24 }} className="mb-3">{f.icon}</div>
                <h4 style={{ color: tc }} className="text-xs font-bold mb-1.5">{f.title}</h4>
                <p style={{ color: mc }} className="text-[11px] leading-relaxed">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      );

      case 'howItWorks': return (
        <div key="howItWorks" style={{ backgroundColor: cb }} className={sp}>
          <div className="text-center mb-10">
            <span style={{ color: ac }} className="text-[10px] font-bold uppercase tracking-widest">Process</span>
            <h2 style={{ color: tc, fontFamily: design.headingFont }} className="text-2xl font-bold mt-1.5">How It Works</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : `repeat(${data.steps.length}, 1fr)`, gap: 24, maxWidth: 900, margin: '0 auto' }}>
            {data.steps.map((s, i) => (
              <div key={i} className="text-center px-4">
                <div style={{ width: 44, height: 44, borderRadius: '50%', backgroundColor: pc + '20', border: `2px solid ${pc}40`, color: pc, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontFamily: design.headingFont }} className="font-black text-lg">{i + 1}</div>
                {i < data.steps.length - 1 && !isMobile && (
                  <div style={{ position: 'absolute', top: 22, left: '50%', width: '100%', height: 1, backgroundColor: pc + '25' }} />
                )}
                <h4 style={{ color: tc, fontFamily: design.headingFont }} className="text-sm font-bold mb-2">{s.title}</h4>
                <p style={{ color: mc }} className="text-[11px] leading-relaxed">{s.description}</p>
              </div>
            ))}
          </div>
        </div>
      );

      case 'testimonials': return (
        <div key="testimonials" style={{ backgroundColor: bg }} className={sp}>
          <div className="text-center mb-10">
            <span style={{ color: ac }} className="text-[10px] font-bold uppercase tracking-widest">Testimonials</span>
            <h2 style={{ color: tc, fontFamily: design.headingFont }} className="text-2xl font-bold mt-1.5">Loved by Founders</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : `repeat(${Math.min(data.testimonials.length, 3)}, 1fr)`, gap: 16, maxWidth: 960, margin: '0 auto' }}>
            {data.testimonials.map((t, i) => (
              <div key={i} style={{ backgroundColor: cb, borderRadius: br, border: `1px solid ${pc}15`, boxShadow: shd }} className="p-5">
                <div className="flex mb-3">
                  {[...Array(t.rating)].map((_, ri) => <Star key={ri} className="w-3.5 h-3.5" style={{ color: '#f59e0b', fill: '#f59e0b' }} />)}
                </div>
                <p style={{ color: mc }} className="text-xs leading-relaxed mb-4">"{t.quote}"</p>
                <div className="flex items-center gap-3">
                  <div style={{ width: 36, height: 36, borderRadius: '50%', backgroundColor: pc + '30', color: pc, fontFamily: design.headingFont }} className="flex items-center justify-center text-xs font-bold shrink-0">{t.avatar}</div>
                  <div>
                    <div style={{ color: tc }} className="text-xs font-bold">{t.name}</div>
                    <div style={{ color: mc }} className="text-[10px]">{t.role}, {t.company}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      );

      case 'pricing': return (
        <div key="pricing" style={{ backgroundColor: cb }} className={sp}>
          <div className="text-center mb-10">
            <span style={{ color: ac }} className="text-[10px] font-bold uppercase tracking-widest">Pricing</span>
            <h2 style={{ color: tc, fontFamily: design.headingFont }} className="text-2xl font-bold mt-1.5">{data.pricingTitle}</h2>
            <p style={{ color: mc }} className="text-xs mt-1.5">{data.pricingSubtitle}</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : `repeat(${data.pricing.length}, 1fr)`, gap: 16, maxWidth: 800, margin: '0 auto' }}>
            {data.pricing.map((p, i) => (
              <div key={i} style={{ backgroundColor: p.highlighted ? pc + '12' : bg, borderRadius: br, border: `${p.highlighted ? 2 : 1}px solid ${p.highlighted ? pc : pc + '20'}`, position: 'relative', boxShadow: p.highlighted ? shd : undefined }} className="p-5">
                {p.highlighted && <span style={{ backgroundColor: pc, borderRadius: br, color: '#fff', position: 'absolute', top: -12, right: 16, fontSize: 9, fontWeight: 700, padding: '2px 10px', textTransform: 'uppercase', letterSpacing: 1 }}>Popular</span>}
                <p style={{ color: mc, fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>{p.name}</p>
                <div style={{ color: tc, fontFamily: design.headingFont }} className="text-2xl font-black">{p.price}<span style={{ color: mc, fontSize: 11, fontWeight: 400 }}>{p.period}</span></div>
                <ul className="space-y-2 mt-4">
                  {p.features.map((f, fi) => (
                    <li key={fi} style={{ color: mc, fontSize: 11 }} className="flex items-center gap-2">
                      <CheckCircle className="w-3.5 h-3.5 shrink-0" style={{ color: ac }} />{f}
                    </li>
                  ))}
                </ul>
                <button style={{ ...( p.highlighted ? btnStyle : btnOut), width: '100%', marginTop: 16, padding: '8px 0', fontSize: 11, fontWeight: 700, cursor: 'pointer', display: 'block', textAlign: 'center' }}>
                  Get Started
                </button>
              </div>
            ))}
          </div>
        </div>
      );

      case 'cta': return (
        <div key="cta" style={{ background: `linear-gradient(135deg, ${pc}22, ${ac}15)`, borderTop: `1px solid ${pc}25`, borderBottom: `1px solid ${pc}25` }} className={`${sp} text-center`}>
          <div className="max-w-2xl mx-auto">
            <h2 style={{ color: tc, fontFamily: design.headingFont }} className="text-2xl font-black mb-3">{data.ctaHeadline}</h2>
            <p style={{ color: mc }} className="text-sm mb-6 leading-relaxed">{data.ctaSubtext}</p>
            <button style={{ ...btnStyle, fontSize: 13, padding: '12px 32px', fontWeight: 700 }}>{data.ctaButton} →</button>
          </div>
        </div>
      );

      case 'integrations': return (
        <div key="integrations" style={{ backgroundColor: bg }} className={sp}>
          <div className="text-center mb-8">
            <p style={{ color: mc }} className="text-xs font-medium">{data.integrationsTitle}</p>
          </div>
          <div className="flex flex-wrap justify-center gap-3 max-w-3xl mx-auto">
            {data.integrations.map((integ, i) => (
              <div key={i} style={{ backgroundColor: cb, borderRadius: br, border: `1px solid ${pc}15`, boxShadow: shd }} className="px-4 py-2.5 flex items-center gap-2">
                <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: integ.color }} />
                <span style={{ color: tc }} className="text-xs font-bold">{integ.name}</span>
              </div>
            ))}
          </div>
        </div>
      );

      case 'newsletter': return (
        <div key="newsletter" style={{ backgroundColor: cb, borderTop: `1px solid ${pc}15` }} className={`${sp} text-center`}>
          <div className="max-w-lg mx-auto">
            <h2 style={{ color: tc, fontFamily: design.headingFont }} className="text-xl font-bold mb-2">{data.newsletterHeadline}</h2>
            <p style={{ color: mc }} className="text-xs mb-6 leading-relaxed">{data.newsletterSubtext}</p>
            <div style={{ display: 'flex', gap: 8, maxWidth: 400, margin: '0 auto' }}>
              <input placeholder="Enter your email…" readOnly style={{ flex: 1, backgroundColor: bg, border: `1px solid ${pc}25`, borderRadius: br, padding: '10px 14px', fontSize: 12, color: mc, outline: 'none' }} />
              <button style={{ ...btnStyle, padding: '10px 20px', fontSize: 12, fontWeight: 700 }}>{data.newsletterButton}</button>
            </div>
          </div>
        </div>
      );

      case 'faq': return (
        <div key="faq" style={{ backgroundColor: bg }} className={sp}>
          <div className="text-center mb-8">
            <span style={{ color: ac }} className="text-[10px] font-bold uppercase tracking-widest">FAQ</span>
            <h2 style={{ color: tc, fontFamily: design.headingFont }} className="text-2xl font-bold mt-1.5">Common Questions</h2>
          </div>
          <div style={{ maxWidth: 720, margin: '0 auto' }} className="space-y-2">
            {data.faq.map((q, i) => (
              <div key={i} style={{ backgroundColor: cb, borderRadius: br, border: `1px solid ${pc}15` }} className="p-4">
                <p style={{ color: tc }} className="text-xs font-bold mb-1.5">{q.question}</p>
                <p style={{ color: mc }} className="text-[11px] leading-relaxed">{q.answer}</p>
              </div>
            ))}
          </div>
        </div>
      );

      case 'footer': return (
        <footer key="footer" style={{ backgroundColor: cb, borderTop: `1px solid ${pc}15` }} className="px-8 py-8">
          <div className="max-w-5xl mx-auto">
            <div className={`${isMobile ? 'space-y-4' : 'flex items-center justify-between'}`}>
              <div>
                <span style={{ color: pc, fontFamily: design.headingFont }} className="font-black text-sm">★OS</span>
                <p style={{ color: mc }} className="text-[10px] mt-1">{data.footerTagline}</p>
              </div>
              {!isMobile && <div style={{ color: mc }} className="flex gap-5 text-xs">{data.navLinks.map(l => <span key={l}>{l}</span>)}</div>}
            </div>
            <div style={{ borderTop: `1px solid ${pc}12`, marginTop: 20, paddingTop: 16, color: mc }} className="text-[10px] text-center">
              © 2025 Your Startup. All rights reserved.
            </div>
          </div>
        </footer>
      );

      default: return null;
    }
  };

  return (
    <div style={{ fontFamily: design.bodyFont, backgroundColor: bg, color: tc, fontSize: 13 }} className="overflow-hidden">
      {design.sectionOrder.map(key => renderSection(key))}
    </div>
  );
};

const HeroText: React.FC<{ data: SectionData; design: DesignConfig; br: string; btnStyle: React.CSSProperties; mc: string; pc: string; tc: string; ac: string; centered?: boolean }> = ({
  data, design, br, btnStyle, mc, pc, tc, ac, centered
}) => (
  <div className="space-y-5">
    <span style={{ backgroundColor: pc + '20', color: pc, borderRadius: 999, padding: '4px 14px' }} className="inline-block text-[10px] font-bold uppercase tracking-wider">
      ✦ Introducing ★OS
    </span>
    <h1 style={{ color: tc, fontFamily: design.headingFont, fontSize: design.heroLayout === 'split' ? 32 : 40, fontWeight: 800, lineHeight: 1.2 }}>
      {data.heroTitle}
    </h1>
    <p style={{ color: mc, lineHeight: 1.7 }} className="text-sm max-w-xl">
      {data.heroSubtitle}
    </p>
    <div style={{ display: 'flex', gap: 10, justifyContent: centered ? 'center' : 'flex-start', flexWrap: 'wrap' }}>
      <button style={{ ...btnStyle, padding: '11px 24px', fontSize: 12, fontWeight: 700 }}>{data.heroCta} →</button>
      <button style={{ border: `1px solid ${pc}40`, color: mc, borderRadius: br, padding: '11px 20px', fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
        <PlayCircle style={{ width: 14, height: 14 }} /> {data.heroSecondaryCta}
      </button>
    </div>
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: centered ? 'center' : 'flex-start' }}>
      {[...Array(5)].map((_, i) => <Star key={i} style={{ width: 14, height: 14, color: '#f59e0b', fill: '#f59e0b' }} />)}
      <span style={{ color: mc }} className="text-xs ml-1">4.9/5 from 500+ founders</span>
    </div>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────────────────────

export const WebsiteContentGenerator: React.FC = () => {
  const { workspace, deductCredits, addToast, user } = useApp();
  const canEdit = user?.role !== 'TEAM_MEMBER' || workspace?.teamEditingAllowed;

  const [profile,      setProfile]      = useState<StartupProfile | null>(null);
  const [content,      setContent]      = useState<WebsiteContent | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving,     setIsSaving]     = useState(false);
  const [activeTab,    setActiveTab]    = useState<Tab>('studio');
  const [activeTool,   setActiveTool]   = useState<ActiveTool>('colors');
  const [device,       setDevice]       = useState<PreviewDevice>('desktop');
  const [design,       setDesign]       = useState<DesignConfig>(DEFAULT_DESIGN);
  const [panelOpen,    setPanelOpen]    = useState(true);
  const [data,         setData]         = useState<SectionData>(DEFAULT_SECTION_DATA);

  const upD = useCallback((patch: Partial<DesignConfig>) => setDesign(d => ({ ...d, ...patch })), []);
  const upS = useCallback((patch: Partial<SectionData>)  => setData(d => ({ ...d, ...patch })), []);

  useEffect(() => {
    if (!workspace) return;
    api.getProfile(workspace.id).then(setProfile).catch(() => setProfile(null));
    api.getWebsiteContent(workspace.id).then(wc => {
      setContent(wc);
      if (wc?.sections) {
        upS({
          heroTitle:    wc.sections.hero.title,
          heroSubtitle: wc.sections.hero.subtitle,
          heroCta:      wc.sections.hero.cta,
          features:     wc.sections.features.map(f => ({ ...f, icon: '⚡' })),
          pricing:      wc.sections.pricing.map((p, i) => ({ ...p, period: '/mo', highlighted: i === 1 })),
          faq:          wc.sections.faq || [],
          seoTitle:     wc.sections.seoMetadata.title,
          seoDesc:      wc.sections.seoMetadata.description,
          seoKeywords:  wc.sections.seoMetadata.keywords || '',
        });
      }
    }).catch(() => setContent(null));
  }, [workspace]);

  const handleGenerate = async () => {
    if (!workspace || !profile) return;
    if (!deductCredits(70)) return;
    setIsGenerating(true);
    try {
      const wc = await api.generateWebsiteContent(workspace.id);
      setContent(wc);
      upS({
        heroTitle:    wc.sections.hero.title,
        heroSubtitle: wc.sections.hero.subtitle,
        heroCta:      wc.sections.hero.cta,
        features:     wc.sections.features.map(f => ({ ...f, icon: '⚡' })),
        pricing:      wc.sections.pricing.map((p, i) => ({ ...p, period: '/mo', highlighted: i === 1 })),
        faq:          wc.sections.faq || [],
        seoTitle:     wc.sections.seoMetadata.title,
        seoDesc:      wc.sections.seoMetadata.description,
        seoKeywords:  wc.sections.seoMetadata.keywords || '',
      });
      addToast('Website copy generated!', 'success');
    } catch (err: any) { addToast(err.message || 'Failed', 'error'); }
    finally { setIsGenerating(false); }
  };

  const handleSave = async () => {
    if (!workspace) return;
    setIsSaving(true);
    try {
      const payload: WebsiteContent = content
        ? { ...content, updatedAt: new Date().toISOString(), sections: { ...content.sections, hero: { title: data.heroTitle, subtitle: data.heroSubtitle, cta: data.heroCta }, features: data.features, pricing: data.pricing.map(p => ({ ...p, highlighted: undefined } as any)), faq: data.faq, seoMetadata: { title: data.seoTitle, description: data.seoDesc, keywords: data.seoKeywords } } }
        : { id: 'wc_' + Date.now(), workspaceId: workspace.id, updatedAt: new Date().toISOString(), sections: { hero: { title: data.heroTitle, subtitle: data.heroSubtitle, cta: data.heroCta }, features: data.features, pricing: data.pricing.map(p => ({ ...p })), faq: data.faq, seoMetadata: { title: data.seoTitle, description: data.seoDesc, keywords: data.seoKeywords } } };
      const saved = await api.saveWebsiteContent(payload);
      setContent(saved);
      addToast('Saved!', 'success');
    } catch (err: any) { addToast(err.message || 'Save failed', 'error'); }
    finally { setIsSaving(false); }
  };

  // ── Sections tool panel content ────────────────────────────────────────────
  const renderSectionsPanel = () => (
    <div className="space-y-2">
      <Divider label="Visibility & Order" />
      <div className="space-y-1">
        {design.sectionOrder.map(key => (
          <div key={key} className="flex items-center gap-2 py-1 px-1 rounded-lg hover:bg-slate-800/50 group">
            <GripVertical className="w-3.5 h-3.5 text-slate-600 group-hover:text-slate-400 shrink-0 cursor-grab" />
            <span className="flex-1 text-xs text-slate-400">{SECTION_LABELS[key]}</span>
            <Toggle label="" small value={design.sectionVisible[key]} onChange={v => upD({ sectionVisible: { ...design.sectionVisible, [key]: v } })} />
          </div>
        ))}
      </div>

      <Divider label="Edit Hero" />
      <TField label="Title"          value={data.heroTitle}        onChange={v => upS({ heroTitle: v })}        max={80} />
      <TField label="Subtitle"       value={data.heroSubtitle}     onChange={v => upS({ heroSubtitle: v })}     multi rows={2} max={200} />
      <TField label="Primary CTA"    value={data.heroCta}          onChange={v => upS({ heroCta: v })}          max={30} />
      <TField label="Secondary CTA"  value={data.heroSecondaryCta} onChange={v => upS({ heroSecondaryCta: v })} max={30} />

      <Divider label="Edit Stats" />
      {data.stats.map((s, i) => (
        <div key={i} className="flex gap-1">
          <input value={s.value} onChange={e => { const u = [...data.stats]; u[i] = { ...u[i], value: e.target.value }; upS({ stats: u }); }}
            className="w-16 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-brand-500 font-black text-center" placeholder="99" />
          <input value={s.label} onChange={e => { const u = [...data.stats]; u[i] = { ...u[i], label: e.target.value }; upS({ stats: u }); }}
            className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-brand-500" placeholder="Label" />
          <input value={s.suffix || ''} onChange={e => { const u = [...data.stats]; u[i] = { ...u[i], suffix: e.target.value }; upS({ stats: u }); }}
            className="w-10 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-slate-400 focus:outline-none focus:border-brand-500 text-center" placeholder="%" />
        </div>
      ))}

      <Divider label="Edit Features" />
      {data.features.map((f, i) => (
        <EditorCard key={i} title={f.title || `Feature ${i + 1}`} icon={<span className="text-base">{f.icon}</span>}
          badge={`${i + 1}`}>
          <div className="flex gap-1.5 items-center">
            <span className="text-xs">Icon:</span>
            <input value={f.icon} onChange={e => { const u = [...data.features]; u[i] = { ...u[i], icon: e.target.value }; upS({ features: u }); }}
              className="w-12 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-center focus:outline-none focus:border-brand-500" />
          </div>
          <TField value={f.title} onChange={v => { const u = [...data.features]; u[i] = { ...u[i], title: v }; upS({ features: u }); }} placeholder="Feature title" />
          <TField value={f.description} onChange={v => { const u = [...data.features]; u[i] = { ...u[i], description: v }; upS({ features: u }); }} multi rows={2} placeholder="Description" />
          <button onClick={() => upS({ features: data.features.filter((_, fi) => fi !== i) })} className="text-[10px] text-rose-400 hover:text-rose-500 font-bold">Remove</button>
        </EditorCard>
      ))}
      <button onClick={() => upS({ features: [...data.features, { title: 'New Feature', description: 'Describe this feature.', icon: '⭐' }] })}
        className="w-full py-1.5 text-[10px] font-bold text-brand-400 hover:text-brand-300 border border-dashed border-slate-700 rounded-xl hover:border-brand-500 transition-colors">
        + Add Feature
      </button>

      <Divider label="Edit How It Works" />
      {data.steps.map((s, i) => (
        <EditorCard key={i} title={s.title || `Step ${i + 1}`} badge={`Step ${i + 1}`}>
          <TField value={s.title} onChange={v => { const u = [...data.steps]; u[i] = { ...u[i], title: v }; upS({ steps: u }); }} placeholder="Step title" />
          <TField value={s.description} onChange={v => { const u = [...data.steps]; u[i] = { ...u[i], description: v }; upS({ steps: u }); }} multi rows={2} placeholder="Step description" />
          <button onClick={() => upS({ steps: data.steps.filter((_, si) => si !== i) })} className="text-[10px] text-rose-400 font-bold">Remove</button>
        </EditorCard>
      ))}
      <button onClick={() => upS({ steps: [...data.steps, { title: 'New Step', description: 'Describe this step.' }] })}
        className="w-full py-1.5 text-[10px] font-bold text-brand-400 border border-dashed border-slate-700 rounded-xl hover:border-brand-500 transition-colors">
        + Add Step
      </button>

      <Divider label="Edit Testimonials" />
      {data.testimonials.map((t, i) => (
        <EditorCard key={i} title={`${t.name} – ${t.company}`} icon={<Quote className="w-3 h-3" />}>
          <div className="grid grid-cols-2 gap-1.5">
            <TField value={t.name}    onChange={v => { const u = [...data.testimonials]; u[i] = { ...u[i], name: v };    upS({ testimonials: u }); }} placeholder="Name" />
            <TField value={t.company} onChange={v => { const u = [...data.testimonials]; u[i] = { ...u[i], company: v }; upS({ testimonials: u }); }} placeholder="Company" />
            <TField value={t.role}    onChange={v => { const u = [...data.testimonials]; u[i] = { ...u[i], role: v };    upS({ testimonials: u }); }} placeholder="Role" />
            <TField value={t.avatar}  onChange={v => { const u = [...data.testimonials]; u[i] = { ...u[i], avatar: v };  upS({ testimonials: u }); }} placeholder="Initials" />
          </div>
          <TField value={t.quote} onChange={v => { const u = [...data.testimonials]; u[i] = { ...u[i], quote: v }; upS({ testimonials: u }); }} multi rows={2} placeholder="Quote text" />
          <button onClick={() => upS({ testimonials: data.testimonials.filter((_, ti) => ti !== i) })} className="text-[10px] text-rose-400 font-bold">Remove</button>
        </EditorCard>
      ))}
      <button onClick={() => upS({ testimonials: [...data.testimonials, { name: 'New Person', role: 'Founder', company: 'Startup', quote: 'Amazing product!', rating: 5, avatar: 'NP' }] })}
        className="w-full py-1.5 text-[10px] font-bold text-brand-400 border border-dashed border-slate-700 rounded-xl hover:border-brand-500 transition-colors">
        + Add Testimonial
      </button>

      <Divider label="Edit Pricing" />
      <TField label="Title"    value={data.pricingTitle}    onChange={v => upS({ pricingTitle: v })} />
      <TField label="Subtitle" value={data.pricingSubtitle} onChange={v => upS({ pricingSubtitle: v })} />
      {data.pricing.map((p, i) => (
        <EditorCard key={i} title={`${p.name} – ${p.price}`} icon={<DollarSign className="w-3 h-3" />}>
          <div className="grid grid-cols-2 gap-1.5">
            <TField value={p.name}   onChange={v => { const u = [...data.pricing]; u[i] = { ...u[i], name: v };   upS({ pricing: u }); }} placeholder="Tier name" />
            <TField value={p.price}  onChange={v => { const u = [...data.pricing]; u[i] = { ...u[i], price: v };  upS({ pricing: u }); }} placeholder="$49" />
            <TField value={p.period} onChange={v => { const u = [...data.pricing]; u[i] = { ...u[i], period: v }; upS({ pricing: u }); }} placeholder="/month" />
          </div>
          <Toggle label="Highlighted (Popular)" value={p.highlighted} small onChange={v => { const u = [...data.pricing]; u[i] = { ...u[i], highlighted: v }; upS({ pricing: u }); }} />
          {p.features.map((f, fi) => (
            <div key={fi} className="flex gap-1">
              <input value={f} onChange={e => { const u = [...data.pricing]; const ff = [...u[i].features]; ff[fi] = e.target.value; u[i] = { ...u[i], features: ff }; upS({ pricing: u }); }}
                className="flex-1 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-slate-300 focus:outline-none focus:border-brand-500" />
              <button onClick={() => { const u = [...data.pricing]; u[i] = { ...u[i], features: u[i].features.filter((_, ffi) => ffi !== fi) }; upS({ pricing: u }); }} className="text-rose-400 text-xs px-1">×</button>
            </div>
          ))}
          <button onClick={() => { const u = [...data.pricing]; u[i] = { ...u[i], features: [...u[i].features, 'New Feature'] }; upS({ pricing: u }); }} className="text-[10px] text-brand-400 font-bold">+ Add feature</button>
        </EditorCard>
      ))}

      <Divider label="Edit CTA Banner" />
      <TField label="Headline" value={data.ctaHeadline} onChange={v => upS({ ctaHeadline: v })} />
      <TField label="Subtext"  value={data.ctaSubtext}  onChange={v => upS({ ctaSubtext: v })}  multi rows={2} />
      <TField label="Button"   value={data.ctaButton}   onChange={v => upS({ ctaButton: v })} />

      <Divider label="Edit Integrations" />
      <TField label="Section Title" value={data.integrationsTitle} onChange={v => upS({ integrationsTitle: v })} />
      <div className="grid grid-cols-2 gap-1">
        {data.integrations.map((integ, i) => (
          <div key={i} className="flex items-center gap-1">
            <label className="cursor-pointer shrink-0">
              <div style={{ backgroundColor: integ.color }} className="w-5 h-5 rounded overflow-hidden">
                <input type="color" value={integ.color} onChange={e => { const u = [...data.integrations]; u[i] = { ...u[i], color: e.target.value }; upS({ integrations: u }); }} className="opacity-0 w-full h-full cursor-pointer" />
              </div>
            </label>
            <input value={integ.name} onChange={e => { const u = [...data.integrations]; u[i] = { ...u[i], name: e.target.value }; upS({ integrations: u }); }}
              className="flex-1 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-[10px] text-slate-300 focus:outline-none focus:border-brand-500" />
            <button onClick={() => upS({ integrations: data.integrations.filter((_, ii) => ii !== i) })} className="text-rose-400 text-xs">×</button>
          </div>
        ))}
      </div>
      <button onClick={() => upS({ integrations: [...data.integrations, { name: 'New Tool', color: '#888888' }] })}
        className="w-full py-1.5 text-[10px] font-bold text-brand-400 border border-dashed border-slate-700 rounded-xl hover:border-brand-500 transition-colors">
        + Add Integration
      </button>

      <Divider label="Edit Newsletter" />
      <TField label="Headline"    value={data.newsletterHeadline} onChange={v => upS({ newsletterHeadline: v })} />
      <TField label="Subtext"     value={data.newsletterSubtext}  onChange={v => upS({ newsletterSubtext: v })}  multi rows={2} />
      <TField label="Button Text" value={data.newsletterButton}   onChange={v => upS({ newsletterButton: v })} />

      <Divider label="Edit FAQ" />
      {data.faq.map((q, i) => (
        <EditorCard key={i} title={q.question.slice(0, 36) + (q.question.length > 36 ? '…' : '')}>
          <TField value={q.question} onChange={v => { const u = [...data.faq]; u[i] = { ...u[i], question: v }; upS({ faq: u }); }} placeholder="Question" />
          <TField value={q.answer}   onChange={v => { const u = [...data.faq]; u[i] = { ...u[i], answer: v };   upS({ faq: u }); }} multi rows={2} placeholder="Answer" />
          <button onClick={() => upS({ faq: data.faq.filter((_, fi) => fi !== i) })} className="text-[10px] text-rose-400 font-bold">Remove</button>
        </EditorCard>
      ))}
      <button onClick={() => upS({ faq: [...data.faq, { question: 'New question?', answer: 'Answer here.' }] })}
        className="w-full py-1.5 text-[10px] font-bold text-brand-400 border border-dashed border-slate-700 rounded-xl hover:border-brand-500 transition-colors">
        + Add FAQ
      </button>

      <Divider label="Edit Footer" />
      <TField label="Tagline" value={data.footerTagline} onChange={v => upS({ footerTagline: v })} />
      <div className="space-y-1">
        {data.navLinks.map((l, i) => (
          <div key={i} className="flex gap-1">
            <input value={l} onChange={e => { const u = [...data.navLinks]; u[i] = e.target.value; upS({ navLinks: u }); }}
              className="flex-1 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-slate-300 focus:outline-none focus:border-brand-500" />
            <button onClick={() => upS({ navLinks: data.navLinks.filter((_, li) => li !== i) })} className="text-rose-400 text-xs px-1">×</button>
          </div>
        ))}
        <button onClick={() => upS({ navLinks: [...data.navLinks, 'New Link'] })} className="text-[10px] text-brand-400 font-bold">+ Add link</button>
      </div>

      <div className="pt-3">
        <button onClick={() => setDesign(DEFAULT_DESIGN)}
          className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl border border-slate-700 text-[10px] font-bold text-slate-400 hover:border-rose-500 hover:text-rose-400 transition-colors">
          <RotateCcw className="w-3 h-3" /> Reset Design
        </button>
      </div>
    </div>
  );

  const renderToolPanel = () => {
    if (activeTool === 'sections') return renderSectionsPanel();
    if (activeTool === 'colors') return (
      <div className="space-y-3">
        <Divider label="Preset Themes" />
        <div className="grid grid-cols-4 gap-1">
          {THEMES.map(t => (
            <button key={t.name} onClick={() => upD(t.config as Partial<DesignConfig>)} title={t.name}
              className="flex flex-col items-center gap-1 p-1.5 rounded-xl hover:bg-slate-700 transition-colors">
              <div className="w-8 h-8 rounded-xl text-lg shadow" style={{ background: `linear-gradient(135deg, ${(t.config as any).primaryColor}, ${(t.config as any).accentColor})`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{t.emoji}</div>
              <span className="text-[8px] text-slate-500">{t.name}</span>
            </button>
          ))}
        </div>
        <Divider label="Brand" />
        <ColorSwatch label="Primary"    value={design.primaryColor} onChange={v => upD({ primaryColor: v })} />
        <ColorSwatch label="Accent"     value={design.accentColor}  onChange={v => upD({ accentColor: v })} />
        <Divider label="Surface" />
        <ColorSwatch label="Background" value={design.bgColor}    onChange={v => upD({ bgColor: v })} />
        <ColorSwatch label="Card"       value={design.cardBg}     onChange={v => upD({ cardBg: v })} />
        <ColorSwatch label="Text"       value={design.textColor}  onChange={v => upD({ textColor: v })} />
        <ColorSwatch label="Muted"      value={design.mutedColor} onChange={v => upD({ mutedColor: v })} />
        <Divider label="Mode" />
        <Toggle label="Dark Mode" value={design.darkMode} onChange={v => upD({ darkMode: v })} />
      </div>
    );
    if (activeTool === 'typography') return (
      <div className="space-y-3">
        <Divider label="Heading Font" />
        {HEADING_FONTS.map(f => (
          <button key={f} onClick={() => upD({ headingFont: f })} style={{ fontFamily: f }}
            className={`w-full text-left px-3 py-2 rounded-xl text-sm transition-all ${design.headingFont === f ? 'bg-brand-500/15 text-brand-400 font-bold' : 'text-slate-400 hover:bg-slate-700'}`}>{f}</button>
        ))}
        <Divider label="Body Font" />
        {BODY_FONTS.map(f => (
          <button key={f} onClick={() => upD({ bodyFont: f })} style={{ fontFamily: f }}
            className={`w-full text-left px-3 py-2 rounded-xl text-sm transition-all ${design.bodyFont === f ? 'bg-brand-500/15 text-brand-400 font-bold' : 'text-slate-400 hover:bg-slate-700'}`}>{f}</button>
        ))}
      </div>
    );
    if (activeTool === 'layout') return (
      <div className="space-y-4">
        <Divider label="Hero" />
        <Seg label="Layout" value={design.heroLayout} options={[{ value: 'centered', label: 'Center' }, { value: 'left', label: 'Left' }, { value: 'split', label: 'Split' }]} onChange={v => upD({ heroLayout: v as any })} />
        <Seg label="Background" value={design.heroBg} options={[{ value: 'solid', label: 'Solid' }, { value: 'gradient', label: 'Grad' }, { value: 'mesh', label: 'Mesh' }, { value: 'dots', label: 'Dots' }]} onChange={v => upD({ heroBg: v as any })} />
        <Divider label="Features" />
        <Seg label="Feature Layout" value={design.featureLayout} options={[{ value: 'grid3', label: '3 Col' }, { value: 'grid2', label: '2 Col' }, { value: 'list', label: 'List' }]} onChange={v => upD({ featureLayout: v as any })} />
        <Divider label="Nav & Spacing" />
        <Seg label="Nav Style" value={design.navStyle} options={[{ value: 'transparent', label: 'Clear' }, { value: 'solid', label: 'Solid' }, { value: 'glass', label: 'Glass' }]} onChange={v => upD({ navStyle: v as any })} />
        <Seg label="Spacing" value={design.spacing} options={[{ value: 'compact', label: 'Tight' }, { value: 'normal', label: 'Normal' }, { value: 'spacious', label: 'Wide' }]} onChange={v => upD({ spacing: v as any })} />
      </div>
    );
    if (activeTool === 'effects') return (
      <div className="space-y-4">
        <Divider label="Buttons" />
        <Seg label="Button Style" value={design.buttonStyle} options={[{ value: 'filled', label: 'Solid' }, { value: 'outline', label: 'Line' }, { value: 'gradient', label: 'Grad' }, { value: 'soft', label: 'Soft' }]} onChange={v => upD({ buttonStyle: v as any })} />
        <Divider label="Shape & Shadow" />
        <SliderRow label="Border Radius" value={design.borderRadius} min={0} max={24} unit="px" onChange={v => upD({ borderRadius: v })} />
        <Seg label="Card Shadow" value={design.shadowLevel} options={[{ value: 'none', label: 'None' }, { value: 'sm', label: 'Sm' }, { value: 'md', label: 'Md' }, { value: 'lg', label: 'Lg' }]} onChange={v => upD({ shadowLevel: v as any })} />
      </div>
    );
    return null;
  };

  // ── Guard ──────────────────────────────────────────────────────────────────
  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
          <HelpCircle className="w-8 h-8 text-slate-400" />
        </div>
        <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">Startup Profile Missing</h3>
        <p className="text-sm text-slate-500 max-w-sm mb-6">Complete your profile to generate landing page copy.</p>
        <Link to="/" className="text-sm px-5 py-2.5 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-xl">Configure Profile →</Link>
      </div>
    );
  }

  const TOOLS: { id: ActiveTool; icon: React.ReactNode; label: string }[] = [
    { id: 'colors',     icon: <Palette       className="w-4 h-4" />, label: 'Colors'   },
    { id: 'typography', icon: <Type          className="w-4 h-4" />, label: 'Fonts'    },
    { id: 'layout',     icon: <LayoutTemplate className="w-4 h-4" />, label: 'Layout'  },
    { id: 'effects',    icon: <Wand2         className="w-4 h-4" />, label: 'Effects'  },
    { id: 'sections',   icon: <Layers        className="w-4 h-4" />, label: 'Sections' },
  ];

  const deviceW: Record<PreviewDevice, string> = { desktop: 'w-full', tablet: 'max-w-[768px] mx-auto', mobile: 'max-w-[390px] mx-auto' };

  const needsGeneration = !content;

  return (
    <div className="space-y-4">
      {/* Top bar */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <Globe className="w-5 h-5 text-brand-500" />
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Website Design Studio</h2>
          </div>
          <p className="text-sm text-slate-500">Design & copy for <strong className="text-brand-500">{profile.name}</strong> · {design.sectionOrder.filter(k => design.sectionVisible[k]).length} sections visible</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap justify-end">
          <div className="flex items-center gap-0.5 bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 p-0.5 rounded-xl text-xs">
            {([['studio', '🎨 Studio'], ['seo', '🔍 SEO']] as [Tab, string][]).map(([t, l]) => (
              <button key={t} onClick={() => setActiveTab(t)}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${activeTab === t ? 'bg-white dark:bg-slate-600 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}>{l}</button>
            ))}
          </div>
          {canEdit && (
            <button onClick={handleSave} disabled={isSaving}
              className="flex items-center gap-1.5 text-xs py-2 px-4 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl transition-colors disabled:opacity-50">
              {isSaving ? <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              Save
            </button>
          )}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {/* ─── SEO TAB ─── */}
        {activeTab === 'seo' && (
          <motion.div key="seo" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid md:grid-cols-2 gap-6 max-w-4xl">
            <div className="bg-white dark:bg-card-dark border border-slate-200 dark:border-border-dark rounded-2xl p-6 space-y-4">
              <h3 className="text-sm font-bold text-slate-800 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3">SEO Metadata</h3>
              {[{ l: 'Page Title', k: 'seoTitle' as const, max: 60, hint: '40–60 chars' }, { l: 'Meta Description', k: 'seoDesc' as const, max: 160, multi: true, hint: '120–160 chars' }, { l: 'Keywords', k: 'seoKeywords' as const, hint: 'Comma-separated' }].map(f => (
                <div key={f.k}>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{f.l}</label>
                    {f.max && <span className={`text-[10px] font-mono ${(data[f.k] as string).length > (f.max || 0) * 0.9 ? 'text-amber-500' : 'text-slate-400'}`}>{(data[f.k] as string).length}/{f.max}</span>}
                  </div>
                  {f.multi
                    ? <textarea value={data[f.k]} disabled={!canEdit} rows={3} maxLength={f.max} onChange={e => upS({ [f.k]: e.target.value } as any)} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:border-brand-500 resize-none disabled:opacity-70" />
                    : <input value={data[f.k]} disabled={!canEdit} maxLength={f.max} onChange={e => upS({ [f.k]: e.target.value } as any)} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:border-brand-500 disabled:opacity-70" />}
                  {f.hint && <p className="text-[10px] text-slate-400 mt-1">{f.hint}</p>}
                </div>
              ))}
              {canEdit && <button onClick={handleSave} disabled={isSaving} className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm rounded-xl">Save SEO</button>}
            </div>
            <div className="space-y-4">
              {/* Score */}
              {(() => {
                const checks = [
                  { label: 'Title 40-60 chars',  pass: data.seoTitle.length >= 40 && data.seoTitle.length <= 60 },
                  { label: 'Desc 120-160 chars',  pass: data.seoDesc.length >= 120 && data.seoDesc.length <= 160 },
                  { label: '3+ keywords',         pass: data.seoKeywords.split(',').length >= 3 },
                  { label: 'Keyword in title',    pass: data.seoKeywords.split(',').some(k => data.seoTitle.toLowerCase().includes(k.trim().toLowerCase())) },
                ];
                const pct   = Math.round((checks.filter(c => c.pass).length / checks.length) * 100);
                const color = pct >= 75 ? '#22c55e' : pct >= 50 ? '#f59e0b' : '#f43f5e';
                return (
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <div className="flex justify-between mb-2"><span className="text-xs font-bold text-slate-500 uppercase tracking-wider">SEO Score</span><span style={{ color }} className="text-xl font-black">{pct}%</span></div>
                    <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 mb-3 overflow-hidden"><div style={{ width: `${pct}%`, backgroundColor: color }} className="h-full rounded-full transition-all" /></div>
                    {checks.map(c => <div key={c.label} className="flex gap-2 text-xs mb-1"><span style={{ color: c.pass ? '#22c55e' : '#94a3b8' }}>{c.pass ? '✓' : '○'}</span><span className={c.pass ? 'text-slate-700 dark:text-slate-300' : 'text-slate-400'}>{c.label}</span></div>)}
                  </div>
                );
              })()}
              <div className="p-4 rounded-xl bg-white dark:bg-card-dark border border-slate-200 dark:border-border-dark">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">SERP Preview</p>
                <div className="p-3 rounded-lg bg-white border border-slate-100 shadow-sm">
                  <p className="text-[10px] text-slate-500">{profile.name.toLowerCase().replace(/\s+/g, '')}.com</p>
                  <p className="text-sm text-blue-600 font-medium">{data.seoTitle || 'Page title here'}</p>
                  <p className="text-xs text-slate-600 leading-relaxed">{data.seoDesc || 'Meta description here.'}</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* ─── STUDIO TAB ─── */}
        {activeTab === 'studio' && (
          <motion.div key="studio" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {/* Generation gate */}
            {needsGeneration && !isGenerating && (
              <div className="bg-white dark:bg-card-dark border border-slate-200 dark:border-border-dark rounded-2xl p-12 text-center max-w-xl mx-auto shadow-xl">
                <div className="w-20 h-20 rounded-2xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center mx-auto mb-6"><Globe className="w-10 h-10 text-brand-500" /></div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Generate Copy to Start Designing</h3>
                <p className="text-sm text-slate-500 mb-8 leading-relaxed">AI will produce all 10 sections of your landing page, then you can customise every element in the studio.</p>
                <div className="flex flex-wrap justify-center gap-2 mb-8">
                  {['Hero', 'Stats Bar', 'Features', 'How It Works', 'Testimonials', 'Pricing', 'CTA', 'Integrations', 'Newsletter', 'FAQ'].map(f => (
                    <span key={f} className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-xs font-medium text-slate-600 dark:text-slate-400">✓ {f}</span>
                  ))}
                </div>
                {!canEdit ? (
                  <div className="p-4 bg-slate-900/50 border border-slate-800 rounded-xl text-xs text-slate-400 max-w-sm mx-auto">
                    <AlertTriangle className="w-4.5 h-4.5 text-amber-500 inline-block mr-1.5 -mt-0.5" />
                    Website copy hasn't been generated for this workspace yet. Please contact the founder to generate it.
                  </div>
                ) : (
                  <button onClick={handleGenerate} className="inline-flex items-center gap-2 py-3 px-8 bg-brand-500 hover:bg-brand-600 text-white font-bold text-sm rounded-xl shadow-lg shadow-brand-500/20">
                    <Sparkles className="w-4 h-4" /> Generate All Sections
                  </button>
                )}
              </div>
            )}

            {isGenerating && (
              <div className="bg-white dark:bg-card-dark border border-slate-200 dark:border-border-dark rounded-2xl p-12 text-center shadow-xl">
                <div className="w-16 h-16 rounded-full border-4 border-t-brand-500 border-slate-200 dark:border-slate-700 animate-spin mb-6 mx-auto" />
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Generating 10 Sections…</h3>
                <p className="text-sm text-slate-500">Crafting hero, features, testimonials, pricing, FAQs and more.</p>
              </div>
            )}

            {/* Full Studio */}
            {!needsGeneration && !isGenerating && (
              <div className="flex rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-2xl relative" style={{ minHeight: 680 }}>

                {/* ── Icon rail ── */}
                {canEdit && (
                  <div className="w-14 shrink-0 bg-white dark:bg-[#0d0f1a] border-r border-slate-200 dark:border-slate-800 flex flex-col items-center py-3 gap-1">
                    {TOOLS.map(t => (
                      <button key={t.id} onClick={() => { setActiveTool(t.id); setPanelOpen(true); }} title={t.label}
                        className={`w-9 h-9 rounded-xl flex flex-col items-center justify-center gap-0.5 transition-all ${activeTool === t.id && panelOpen ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/30' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}>
                        {t.icon}
                        <span className="text-[7px] font-bold leading-none">{t.label}</span>
                      </button>
                    ))}
                    <div className="flex-1" />
                    <button onClick={() => setPanelOpen(o => !o)} className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">
                      {panelOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    </button>
                  </div>
                )}

                {/* ── Tool panel ── */}
                <AnimatePresence>
                  {canEdit && panelOpen && (
                    <motion.div key="panel" initial={{ width: 0 }} animate={{ width: 260 }} exit={{ width: 0 }}
                      className="shrink-0 bg-white dark:bg-[#0d0f1a] border-r border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col">
                      <div style={{ width: 260 }} className="flex flex-col h-full">
                        <div className="h-10 flex items-center px-4 border-b border-slate-100 dark:border-slate-800 shrink-0">
                          <span className="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider">
                            {TOOLS.find(t => t.id === activeTool)?.label}
                          </span>
                        </div>
                        <div className="flex-1 overflow-y-auto p-3">
                          {renderToolPanel()}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* ── Canvas ── */}
                <div className="flex-1 flex flex-col bg-slate-100 dark:bg-slate-900 min-w-0">
                  {/* Canvas warning for read-only */}
                  {!canEdit && (
                    <div className="bg-amber-500/10 border-b border-amber-500/20 text-amber-500 px-4 py-2.5 text-xs flex items-center gap-2 shrink-0">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span><strong>View Only Mode:</strong> Workspace founder has disabled customization privileges for team members.</span>
                    </div>
                  )}

                  {/* Canvas toolbar */}
                  <div className="h-10 flex items-center justify-between px-4 bg-white dark:bg-[#0d0f1a] border-b border-slate-200 dark:border-slate-800 shrink-0 gap-3">
                    <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 rounded-lg p-0.5">
                      {([['desktop', Monitor], ['tablet', Tablet], ['mobile', Smartphone]] as [PreviewDevice, any][]).map(([d, Icon]) => (
                        <button key={d} onClick={() => setDevice(d)}
                          className={`p-1.5 rounded-md transition-all ${device === d ? 'bg-white dark:bg-slate-600 text-brand-500 shadow-sm' : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}>
                          <Icon className="w-3.5 h-3.5" />
                        </button>
                      ))}
                    </div>
                    <div className="flex-1 max-w-xs">
                      <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1 text-[10px] font-mono text-slate-500">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                        {profile.name.toLowerCase().replace(/\s+/g, '')}.com
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-slate-400 font-mono hidden sm:block">{device === 'desktop' ? '1440' : device === 'tablet' ? '768' : '390'}px</span>
                      <span className="text-[10px] text-slate-400">·</span>
                      <span className="text-[10px] text-slate-400">{design.sectionOrder.filter(k => design.sectionVisible[k]).length} sections</span>
                      {canEdit && (
                        <button onClick={handleGenerate}
                          className="flex items-center gap-1 text-[10px] font-bold px-2.5 py-1.5 rounded-lg bg-brand-500/10 text-brand-500 hover:bg-brand-500/20 transition-colors">
                          <RefreshCw className="w-3 h-3" /> Regen
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Canvas body */}
                  <div className="flex-1 overflow-y-auto p-5">
                    <div className={`${deviceW[device]} transition-all duration-300`}>
                      {/* Browser chrome */}
                      <div className="rounded-t-xl overflow-hidden border border-b-0 border-slate-300 dark:border-slate-600">
                        <div className="h-8 bg-slate-200 dark:bg-slate-700 flex items-center px-3 gap-1.5">
                          <div className="w-2 h-2 rounded-full bg-rose-400" />
                          <div className="w-2 h-2 rounded-full bg-amber-400" />
                          <div className="w-2 h-2 rounded-full bg-emerald-400" />
                          <div className="flex-1 max-w-[40%] mx-auto h-4 bg-white dark:bg-slate-600 rounded border border-slate-300 dark:border-slate-500 flex items-center justify-center">
                            <span className="text-[8px] font-mono text-slate-400">{profile.name.toLowerCase().replace(/\s+/g, '')}.com</span>
                          </div>
                          <ExternalLink className="w-3 h-3 text-slate-400 ml-auto" />
                        </div>
                      </div>
                      {/* Live canvas */}
                      <div className="rounded-b-xl overflow-hidden border border-slate-300 dark:border-slate-600 shadow-2xl">
                        <LiveCanvas data={data} design={design} device={device} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default WebsiteContentGenerator;
