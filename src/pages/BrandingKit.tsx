import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { db } from '../services/mockData';
import type { BrandKit, StartupProfile } from '../types';
import { 
  Palette, Sparkles, RefreshCw, Copy, Check, Info, HelpCircle, 
  BookOpen, Star, Sparkle, Heart, Flame, AlertTriangle, Save, Edit3
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const PRESET_PALETTES = [
  { name: 'Emerald Forest (Eco Default)', colors: ['#10b981', '#064e3b', '#f8fafc', '#0f172a', '#6366f1'] },
  { name: 'Cyberpunk Violet', colors: ['#a855f7', '#3b82f6', '#0f172a', '#f8fafc', '#f43f5e'] },
  { name: 'Corporate Stripe', colors: ['#00d4ff', '#0048ff', '#f8fafc', '#0f172a', '#505d70'] },
  { name: 'Sunset Minimal', colors: ['#f97316', '#ea580c', '#fff7ed', '#1c1917', '#e7e5e4'] },
  { name: 'Ocean Wave', colors: ['#06b6d4', '#0891b2', '#f0fdfa', '#0f172a', '#14b8a6'] }
];

export const BrandingKit: React.FC = () => {
  const { workspace, deductCredits, addToast, user } = useApp();
  const canEdit = user?.role !== 'TEAM_MEMBER' || workspace?.teamEditingAllowed;
  
  const [profile, setProfile] = useState<StartupProfile | null>(null);
  const [kit, setKit] = useState<BrandKit | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedColor, setCopiedColor] = useState<string | null>(null);

  // Text editing states
  const [isEditingText, setIsEditingText] = useState(false);
  const [editedMission, setEditedMission] = useState('');
  const [editedVision, setEditedVision] = useState('');
  const [editedStory, setEditedStory] = useState('');
  const [editedPersonality, setEditedPersonality] = useState('');
  const [editedVoice, setEditedVoice] = useState('');
  const [editedValues, setEditedValues] = useState('');
  const [isSavingText, setIsSavingText] = useState(false);

  const startEditing = () => {
    if (!kit) return;
    setEditedMission(kit.mission || '');
    setEditedVision(kit.vision || '');
    setEditedStory(kit.brandStory || '');
    setEditedPersonality(kit.personality || '');
    setEditedVoice(kit.voiceAndTone || '');
    setEditedValues((kit.values || []).join(', '));
    setIsEditingText(true);
  };

  const handleSaveText = async () => {
    if (!kit || !workspace) return;
    setIsSavingText(true);
    const updatedKit: BrandKit = {
      ...kit,
      mission: editedMission,
      vision: editedVision,
      brandStory: editedStory,
      personality: editedPersonality,
      voiceAndTone: editedVoice,
      values: editedValues.split(',').map(v => v.trim()).filter(Boolean)
    };
    try {
      const saved = await api.saveBranding(updatedKit);
      setKit(saved);
      setIsEditingText(false);
      addToast('Brand Kit details saved successfully!', 'success');
    } catch (err: any) {
      addToast(err.message || 'Failed to save Brand Kit details', 'error');
    } finally {
      setIsSavingText(false);
    }
  };

  useEffect(() => {
    if (workspace) {
      api.getProfile(workspace.id)
        .then(setProfile)
        .catch(() => setProfile(null));

      api.getBranding(workspace.id)
        .then(setKit)
        .catch(() => setKit(null));
    }
  }, [workspace]);

  const handleGenerate = async () => {
    if (!workspace || !profile) return;
    const success = deductCredits(80);
    if (!success) return;

    setIsGenerating(true);

    try {
      const liveKit = await api.generateBranding(workspace.id);
      setKit(liveKit);
      addToast('Professional Brand Kit generated!', 'success');
    } catch (err: any) {
      addToast(err.message || 'Failed to generate branding', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSelectPalette = (colors: string[]) => {
    if (!kit) return;
    const nextKit = {
      ...kit,
      paletteColors: colors
    };
    db.saveBrandKit(nextKit);
    setKit(nextKit);
    addToast('Brand color palette updated!', 'success');
  };

  const handleCopyColor = (color: string) => {
    navigator.clipboard.writeText(color);
    setCopiedColor(color);
    addToast(`Color hex code ${color} copied to clipboard!`, 'info');
    setTimeout(() => setCopiedColor(null), 1500);
  };

  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <HelpCircle className="w-12 h-12 text-slate-600 mb-4" />
        <h3 className="text-base font-bold text-white uppercase tracking-wider mb-2">Startup Profile Missing</h3>
        <p className="text-xs text-slate-500 max-w-sm leading-relaxed mb-4">Complete your core startup profile on the main dashboard to generate your brand guidelines.</p>
        <Link to="/" className="text-xs px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-xl uppercase tracking-wider">Configure Profile</Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-slate-200 dark:border-border-dark pb-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Brand Identity Kit</h2>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Configure taglines, vision statements, guidelines, and palettes for {profile.name}.</p>
        </div>
        
        {kit && !isGenerating && (
          <div className="flex gap-2">
            {canEdit && (
              <>
                {isEditingText ? (
                  <button 
                    disabled={isSavingText}
                    onClick={handleSaveText}
                    className="flex items-center gap-1.5 text-xs py-2 px-4 bg-emerald-500 hover:bg-emerald-600 font-bold uppercase tracking-wider rounded-xl text-white transition-colors cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5" /> Save Changes
                  </button>
                ) : (
                  <button 
                    onClick={startEditing}
                    className="flex items-center gap-1.5 text-xs py-2 px-4 bg-slate-800 hover:bg-slate-700 font-bold uppercase tracking-wider rounded-xl text-slate-200 hover:text-white transition-colors cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" /> Customize Details
                  </button>
                )}
                
                {!isEditingText && (
                  <button 
                    onClick={handleGenerate}
                    className="flex items-center gap-1.5 text-xs py-2 px-4 bg-slate-800 hover:bg-slate-700 font-bold uppercase tracking-wider rounded-xl text-slate-200 hover:text-white transition-colors cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" /> Re-Generate Kit
                  </button>
                )}
              </>
            )}
          </div>
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
            <h3 className="text-base font-bold text-white mb-2">Assembling Brand Guidelines</h3>
            <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
              Generating name iterations, vision logs, voice guides, and matching color swatches.
            </p>
          </motion.div>
        )}

        {!kit && !isGenerating && (
          <motion.div 
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white dark:bg-card-dark border border-slate-200 dark:border-border-dark rounded-2xl p-8 shadow-xl text-center py-16 max-w-xl mx-auto"
          >
            <div className="w-16 h-16 bg-brand-500/10 border border-brand-500/20 text-brand-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <Palette className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">Brand Kit Ready</h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-6">
              Establish taglines, brand core missions, corporate stories, communication styling guides, and color boards matching your target audience.
            </p>
            
            {!canEdit ? (
              <div className="p-4 bg-slate-900/50 border border-slate-800 rounded-xl text-xs text-slate-400 max-w-sm mx-auto">
                <AlertTriangle className="w-4.5 h-4.5 text-amber-500 inline-block mr-1.5 -mt-0.5" />
                A Brand Kit hasn't been generated for this workspace yet. Please contact the founder to generate it.
              </div>
            ) : (
              <button
                onClick={handleGenerate}
                className="inline-flex items-center gap-1.5 py-3 px-6 bg-brand-500 hover:bg-brand-600 transition-colors text-white font-bold text-xs uppercase tracking-wider rounded-xl cursor-pointer"
              >
                <Sparkles className="w-4 h-4" /> Generate Brand Kit
              </button>
            )}
          </motion.div>
        )}

        {kit && !isGenerating && (
          <motion.div 
            key="kit"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-4"
          >
            {!canEdit && (
              <div className="bg-amber-500/10 border border-amber-500/20 text-amber-500 px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 shrink-0">
                <AlertTriangle className="w-4 h-4" />
                <span><strong>View Only Mode:</strong> Workspace founder has disabled customization privileges for team members.</span>
              </div>
            )}
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column: Brand Names, Taglines, and Color Palettes */}
            <div className="space-y-6">
              {/* Color Swatch manager */}
              <div className="bg-white dark:bg-card-dark border border-slate-200 dark:border-border-dark p-5 rounded-2xl shadow-xl">
                <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-1.5">
                  <Palette className="w-4 h-4 text-brand-500" /> Active Color Swatches
                </h3>
                
                {/* Active circles */}
                <div className="flex gap-3 justify-center mb-6">
                  {kit.paletteColors.map((color, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleCopyColor(color)}
                      className="group relative flex flex-col items-center cursor-pointer focus:outline-none"
                    >
                      <div 
                        className="w-10 h-10 rounded-full border border-slate-200 dark:border-slate-800 shadow group-hover:scale-105 transition-transform" 
                        style={{ backgroundColor: color }}
                      />
                      <span className="text-[9px] font-mono text-slate-400 mt-1 uppercase">{color}</span>
                      {copiedColor === color ? (
                        <span className="absolute -top-6 bg-slate-900 text-white font-bold text-[8px] px-1 rounded flex items-center gap-0.5"><Check className="w-2.5 h-2.5 text-emerald-400" /> Copied</span>
                      ) : (
                        <span className="absolute -top-6 bg-slate-900 text-white text-[8px] px-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">Copy</span>
                      )}
                    </button>
                  ))}
                </div>

                {/* Preset selectors */}
                <div className="border-t border-slate-200 dark:border-slate-800/80 pt-4 space-y-2">
                  <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-2">Preset Color palettes</span>
                  {PRESET_PALETTES.map((pal, idx) => {
                    const isSelected = JSON.stringify(pal.colors) === JSON.stringify(kit.paletteColors);
                    return (
                      <button
                        key={idx}
                        disabled={!canEdit}
                        onClick={() => handleSelectPalette(pal.colors)}
                        className={`w-full flex items-center justify-between p-2 rounded-xl transition-all ${
                          isSelected ? 'bg-brand-500/5 border border-brand-500/20' : 'hover:bg-slate-900/40 border border-transparent'
                        } ${!canEdit ? 'opacity-55 cursor-not-allowed' : ''}`}
                      >
                        <span className="text-xs font-semibold text-slate-300 truncate pr-2">{pal.name}</span>
                        <div className="flex gap-1">
                          {pal.colors.slice(0, 4).map((c, i) => (
                            <div key={i} className="w-3.5 h-3.5 rounded-full border border-slate-800/40" style={{ backgroundColor: c }} />
                          ))}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Taglines list */}
              <div className="bg-white dark:bg-card-dark border border-slate-200 dark:border-border-dark p-5 rounded-2xl shadow-xl">
                <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-1.5">
                  <Sparkle className="w-4 h-4 text-amber-500" /> Core Taglines
                </h3>
                <div className="space-y-2.5">
                  {kit.taglineIdeas.map((tag, idx) => (
                    <div key={idx} className="p-3 bg-slate-50 dark:bg-slate-900/60 border border-slate-200/50 dark:border-slate-800/50 rounded-xl text-xs text-slate-300 font-semibold italic">
                      "{tag}"
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Middle and Right column: Mission, guidelines */}
            <div className="lg:col-span-2 space-y-6">
              {/* Mission and Vision statement */}
              <div className="bg-white dark:bg-card-dark border border-slate-200 dark:border-border-dark p-5 rounded-2xl shadow-xl grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1"><Star className="w-3.5 h-3.5 text-brand-500" /> Mission Statement</h4>
                  {isEditingText ? (
                    <textarea 
                      value={editedMission} 
                      onChange={e => setEditedMission(e.target.value)} 
                      rows={4}
                      className="w-full bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-brand-500 resize-none leading-relaxed"
                    />
                  ) : (
                    <p className="text-xs leading-relaxed text-slate-300">{kit.mission}</p>
                  )}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1"><Star className="w-3.5 h-3.5 text-indigo-500" /> Vision Statement</h4>
                  {isEditingText ? (
                    <textarea 
                      value={editedVision} 
                      onChange={e => setEditedVision(e.target.value)} 
                      rows={4}
                      className="w-full bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-brand-500 resize-none leading-relaxed"
                    />
                  ) : (
                    <p className="text-xs leading-relaxed text-slate-300">{kit.vision}</p>
                  )}
                </div>
              </div>

              {/* Brand Story */}
              <div className="bg-white dark:bg-card-dark border border-slate-200 dark:border-border-dark p-5 rounded-2xl shadow-xl">
                <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-1"><BookOpen className="w-4 h-4 text-emerald-500" /> Brand Story</h3>
                {isEditingText ? (
                  <textarea 
                    value={editedStory} 
                    onChange={e => setEditedStory(e.target.value)} 
                    rows={6}
                    className="w-full bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-brand-500 resize-none leading-relaxed"
                  />
                ) : (
                  <p className="text-xs leading-relaxed text-slate-300 whitespace-pre-line">{kit.brandStory}</p>
                )}
              </div>

              {/* Core Values & Personality */}
              <div className="bg-white dark:bg-card-dark border border-slate-200 dark:border-border-dark p-5 rounded-2xl shadow-xl grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-1"><Heart className="w-3.5 h-3.5 text-rose-500" /> Company Values</h4>
                  {isEditingText ? (
                    <input 
                      type="text"
                      value={editedValues} 
                      onChange={e => setEditedValues(e.target.value)} 
                      placeholder="e.g. Integrity, Innovation, ESG"
                      className="w-full bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-brand-500"
                    />
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {kit.values.map(v => (
                        <span key={v} className="text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700 px-2.5 py-1 rounded-xl">{v}</span>
                      ))}
                    </div>
                  )}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-1"><Flame className="w-3.5 h-3.5 text-amber-500" /> Brand Personality</h4>
                  {isEditingText ? (
                    <textarea 
                      value={editedPersonality} 
                      onChange={e => setEditedPersonality(e.target.value)} 
                      rows={3}
                      className="w-full bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-brand-500 resize-none leading-relaxed"
                    />
                  ) : (
                    <p className="text-xs leading-relaxed text-slate-300">{kit.personality}</p>
                  )}
                </div>
              </div>

              {/* Voice and Tone guidelines */}
              <div className="bg-white dark:bg-card-dark border border-slate-200 dark:border-border-dark p-5 rounded-2xl shadow-xl">
                <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">Communication Voice & Style</h3>
                {isEditingText ? (
                  <textarea 
                    value={editedVoice} 
                    onChange={e => setEditedVoice(e.target.value)} 
                    rows={3}
                    className="w-full bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-brand-500 resize-none leading-relaxed"
                  />
                ) : (
                  <p className="text-xs leading-relaxed text-slate-300">{kit.voiceAndTone}</p>
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

const Loader2: React.FC<{ className?: string; animateSpinner?: boolean }> = ({ className, animateSpinner }) => {
  return (
    <div className={`relative ${className}`}>
      <div className={`w-full h-full rounded-full border-4 border-t-brand-500 border-slate-700 ${animateSpinner ? 'animate-spin' : ''}`} />
    </div>
  );
};
export default BrandingKit;
