import React from 'react';
import { Sparkles } from 'lucide-react';

export const AuthLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen bg-bg-light dark:bg-bg-dark text-text-light dark:text-text-dark flex flex-col md:flex-row">
      {/* Visual branding pane (hidden on mobile) */}
      <div className="hidden md:flex md:w-1/2 bg-[#06070a] border-r border-slate-200 dark:border-border-dark flex-col justify-between p-12 relative overflow-hidden bg-grid-pattern-dark">
        {/* Glow dots */}
        <div className="absolute top-1/4 left-1/4 w-[300px] h-[300px] bg-brand-500/10 rounded-full blur-[80px] animate-pulse-slow" />
        <div className="absolute bottom-1/4 right-1/4 w-[250px] h-[250px] bg-indigo-500/10 rounded-full blur-[80px] animate-pulse-slow" style={{ animationDelay: '2s' }} />

        {/* Logo and Brand */}
        <div className="flex items-center gap-2 z-10">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-brand-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-brand-500/20">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <span className="font-display font-bold text-lg tracking-tight text-white">AI StartupOS</span>
        </div>

        {/* Visual Headline & Simple Features/Workflow */}
        <div className="space-y-8 z-10 max-w-lg my-auto pr-4">
          <div className="space-y-3">
            <h1 className="font-display font-extrabold text-4xl leading-tight text-white tracking-tight">
              Build your startup from idea to launch.
            </h1>
            <p className="text-slate-300 text-sm leading-relaxed">
              AI StartupOS is your virtual co-founder. We guide you through validation, generate launch assets, and prepare you to raise funding.
            </p>
          </div>

          {/* Clean Deliverables Bullet List */}
          <div className="space-y-3 bg-slate-950/50 border border-slate-900 p-4.5 rounded-2xl">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              What We Build For You:
            </h3>
            <ul className="grid grid-cols-2 gap-y-2.5 gap-x-4 text-xs font-semibold text-slate-200">
              <li className="flex items-center gap-2">
                <span className="text-base">📊</span> Viability & SWOT Audit
              </li>
              <li className="flex items-center gap-2">
                <span className="text-base">📄</span> Investor Business Plans
              </li>
              <li className="flex items-center gap-2">
                <span className="text-base">🎨</span> Brand Identity & Palettes
              </li>
              <li className="flex items-center gap-2">
                <span className="text-base">🌐</span> SEO Website Copy Decks
              </li>
              <li className="flex items-center gap-2">
                <span className="text-base">💻</span> PowerPoint Pitch Decks
              </li>
              <li className="flex items-center gap-2">
                <span className="text-base">💬</span> 24/7 AI Mentor Support
              </li>
            </ul>
          </div>

          {/* Simple Step-by-Step Flowchart */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Simple 3-Step Process:
            </h3>
            
            <div className="space-y-3">
              {[
                { step: "1", title: "Enter Your Concept", desc: "Type in your startup vision and audience model.", color: "bg-violet-500/10 border-violet-500/30 text-violet-400" },
                { step: "2", title: "AI Generates Assets", desc: "Our engine writes your business documents, templates, and designs.", color: "bg-indigo-500/10 border-indigo-500/30 text-indigo-400" },
                { step: "3", title: "Download & Launch", desc: "Download visual presentation slides in PPTX and seek AI mentor tips.", color: "bg-brand-500/10 border-brand-500/30 text-brand-400" }
              ].map((s, i) => (
                <div key={i} className="flex items-center gap-4 p-3.5 rounded-xl bg-slate-900/40 border border-slate-900 hover:border-slate-800 transition-colors">
                  <div className={`w-8 h-8 rounded-xl ${s.color} border flex items-center justify-center font-black text-sm shrink-0 shadow-sm`}>
                    {s.step}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white tracking-tight">{s.title}</h4>
                    <p className="text-[10px] text-slate-450 mt-0.5 leading-relaxed">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="flex justify-between items-center text-xs text-slate-500 z-10">
          <span>© 2026 AI StartupOS Technologies, Inc.</span>
          <div className="flex gap-4">
            <span className="hover:underline cursor-pointer">Privacy Policy</span>
            <span className="hover:underline cursor-pointer">Terms of Service</span>
          </div>
        </div>
      </div>

      {/* Forms content pane */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12 relative bg-bg-light dark:bg-bg-dark">
        {/* Micro glow on mobile */}
        <div className="md:hidden absolute top-10 left-1/2 -translate-x-1/2 w-48 h-48 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="w-full max-w-md z-10">
          {children}
        </div>
      </div>
    </div>
  );
};
