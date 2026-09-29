import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';

import type { PitchDeck, PitchDeckSlide } from '../types';
import { 
  Presentation, Play, ChevronLeft, ChevronRight, Download, 
  Sparkles, Loader2, Layout, Plus, Trash2, Maximize2, X, AlertTriangle,
  Wand2, Paintbrush, Sliders, Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import pptxgen from 'pptxgenjs';

interface DeckTheme {
  id: string;
  name: string;
  emoji: string;
  bgClass: string;
  canvasClass: string;
  textClass: string;
  titleClass: string;
  mutedClass: string;
  accentColor: string;
  cardClass: string;
  bulletColor: string;
}

const DECK_THEMES: DeckTheme[] = [
  {
    id: 'gradient-fusion',
    name: 'Gradient Fusion',
    emoji: '🔮',
    bgClass: 'bg-gradient-to-br from-indigo-950 via-slate-900 to-violet-950 text-white',
    canvasClass: 'bg-gradient-to-br from-indigo-950 via-slate-900 to-violet-950 text-white border-violet-500/20 shadow-[0_20px_50px_rgba(109,40,217,0.15)]',
    textClass: 'text-slate-200',
    titleClass: 'text-transparent bg-clip-text bg-gradient-to-r from-violet-200 via-indigo-200 to-pink-200 font-extrabold',
    mutedClass: 'text-slate-400',
    accentColor: '#8b5cf6',
    cardClass: 'bg-white/5 backdrop-blur-md border border-white/10 hover:border-white/20 transition-all rounded-xl shadow-lg',
    bulletColor: 'bg-violet-400'
  },
  {
    id: 'midnight-tech',
    name: 'Midnight Tech',
    emoji: '📟',
    bgClass: 'bg-[#06080e] text-[#00ff9f]',
    canvasClass: 'bg-[#06080e] text-slate-100 border-[#00ff9f]/20 shadow-[0_20px_50px_rgba(0,255,159,0.08)] relative before:absolute before:inset-0 before:bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] before:bg-[size:24px_24px] before:pointer-events-none',
    textClass: 'text-slate-300 font-mono',
    titleClass: 'text-white font-mono font-bold tracking-wider uppercase border-b-2 border-emerald-500 pb-2 mb-4',
    mutedClass: 'text-emerald-500/70 font-mono',
    accentColor: '#00ff9f',
    cardClass: 'bg-black/40 border border-emerald-500/30 hover:border-[#00ff9f] transition-all rounded-lg',
    bulletColor: 'bg-emerald-400'
  },
  {
    id: 'venture-editorial',
    name: 'Venture Editorial',
    emoji: '📖',
    bgClass: 'bg-[#fdfbfc] text-slate-800',
    canvasClass: 'bg-[#faf8f5] text-slate-800 border-stone-200 shadow-[0_20px_40px_rgba(28,25,23,0.06)] font-serif',
    textClass: 'text-stone-600 font-sans',
    titleClass: 'text-stone-900 font-serif font-semibold tracking-tight',
    mutedClass: 'text-stone-400 font-sans',
    accentColor: '#d97706',
    cardClass: 'bg-white border border-stone-200/80 hover:border-stone-400 transition-all rounded-md shadow-sm',
    bulletColor: 'bg-amber-600'
  },
  {
    id: 'ocean-breeze',
    name: 'Ocean Breeze',
    emoji: '🌊',
    bgClass: 'bg-gradient-to-br from-cyan-950 via-slate-900 to-emerald-950 text-white',
    canvasClass: 'bg-gradient-to-br from-cyan-950 via-slate-900 to-emerald-950 text-white border-cyan-500/20 shadow-[0_20px_50px_rgba(6,182,212,0.15)]',
    textClass: 'text-cyan-100',
    titleClass: 'text-transparent bg-clip-text bg-gradient-to-r from-cyan-200 via-teal-200 to-emerald-200 font-extrabold',
    mutedClass: 'text-cyan-400',
    accentColor: '#06b6d4',
    cardClass: 'bg-cyan-950/40 backdrop-blur-md border border-cyan-500/10 hover:border-cyan-500/30 transition-all rounded-xl shadow-lg',
    bulletColor: 'bg-cyan-400'
  },
  {
    id: 'corporate-clean',
    name: 'Corporate Clean',
    emoji: '🏢',
    bgClass: 'bg-white text-slate-800',
    canvasClass: 'bg-white text-slate-800 border-slate-200 shadow-[0_15px_35px_rgba(15,23,42,0.05)] font-sans',
    textClass: 'text-slate-600',
    titleClass: 'text-slate-900 font-extrabold tracking-tight border-l-4 border-blue-600 pl-4 py-1',
    mutedClass: 'text-slate-400',
    accentColor: '#2563eb',
    cardClass: 'bg-slate-50 border border-slate-200 hover:bg-slate-100 transition-all rounded-lg',
    bulletColor: 'bg-blue-600'
  }
];

export const PitchDeckBuilder: React.FC = () => {
  const { workspace, addToast, user } = useApp();
  const canEdit = user?.role !== 'TEAM_MEMBER' || workspace?.teamEditingAllowed;
  
  const [deck, setDeck] = useState<PitchDeck | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [isPresenting, setIsPresenting] = useState(false);

  // AI assistant states
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [customInstructions, setCustomInstructions] = useState('');
  const [refineInstructions, setRefineInstructions] = useState('');
  const [isRefining, setIsRefining] = useState(false);

  useEffect(() => {
    if (workspace) {
      api.getPitchDeck(workspace.id)
        .then(setDeck)
        .catch(() => setDeck(null));
    }
  }, [workspace]);

  const handleGenerate = async (instructions?: string) => {
    if (!workspace) return;
    setIsGenerating(true);
    
    try {
      const liveDeck = await api.generatePitchDeck(workspace.id, instructions);
      setDeck(liveDeck);
      setActiveSlideIndex(0);
      setIsAiModalOpen(false);
      setCustomInstructions('');
      addToast('Investor pitch deck generated!', 'success');
    } catch (err: any) {
      addToast(err.message || 'Failed to generate pitch deck', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleUpdateSlide = async (updatedSlide: PitchDeckSlide) => {
    if (!deck) return;
    const newSlides = [...deck.slides];
    newSlides[activeSlideIndex] = updatedSlide;
    const newDeck = { ...deck, slides: newSlides, updatedAt: new Date().toISOString() };
    setDeck(newDeck);
    
    try {
      await api.savePitchDeck(newDeck);
    } catch (err: any) {
      addToast('Failed to sync slide to database', 'warning');
    }
  };

  const handleUpdateTheme = async (themeId: string) => {
    if (!deck) return;
    const newDeck = { ...deck, theme: themeId, updatedAt: new Date().toISOString() };
    setDeck(newDeck);
    
    try {
      await api.savePitchDeck(newDeck);
      addToast('Theme updated!', 'success');
    } catch (err: any) {
      addToast('Failed to save theme choice', 'warning');
    }
  };

  const handleUpdateLayout = (layoutId: string) => {
    if (!activeSlide) return;
    handleUpdateSlide({ ...activeSlide, layout: layoutId });
  };

  const handleAddSlide = async () => {
    if (!deck) return;
    const newSlide: PitchDeckSlide = {
      id: "sld_" + Date.now(),
      slideNumber: deck.slides.length + 1,
      title: "New Highlight Slide",
      content: "Brief explanatory overview detailing startup features or goals.",
      points: ["Key takeaway point A", "Key takeaway point B"],
      layout: "traditional"
    };
    const newDeck = { ...deck, slides: [...deck.slides, newSlide], updatedAt: new Date().toISOString() };
    setDeck(newDeck);
    setActiveSlideIndex(deck.slides.length);
    try {
      await api.savePitchDeck(newDeck);
      addToast('New slide added!', 'success');
    } catch (err: any) {
      addToast('Failed to save new slide', 'warning');
    }
  };

  const handleDeleteSlide = async () => {
    if (!deck || deck.slides.length <= 1) {
      addToast('Cannot delete the last remaining slide.', 'warning');
      return;
    }
    const newSlides = deck.slides.filter((_, idx) => idx !== activeSlideIndex)
      .map((slide, idx) => ({ ...slide, slideNumber: idx + 1 }));
    const newDeck = { ...deck, slides: newSlides, updatedAt: new Date().toISOString() };
    setDeck(newDeck);
    setActiveSlideIndex(Math.max(0, activeSlideIndex - 1));
    try {
      await api.savePitchDeck(newDeck);
      addToast('Slide deleted', 'success');
    } catch (err: any) {
      addToast('Failed to save slides list', 'warning');
    }
  };

  const handleRefineSlide = async () => {
    if (!workspace || !activeSlide || !refineInstructions.trim()) return;
    setIsRefining(true);
    try {
      const updatedSlide = await api.refineSlide(workspace.id, activeSlide, refineInstructions);
      handleUpdateSlide(updatedSlide);
      setRefineInstructions('');
      addToast('Slide refined with AI!', 'success');
    } catch (err: any) {
      addToast(err.message || 'Failed to refine slide', 'error');
    } finally {
      setIsRefining(false);
    }
  };

  const exportToPPTX = () => {
    if (!deck) return;
    
    addToast('Generating PowerPoint presentation...', 'info');
    
    try {
      const pptx = new pptxgen();
      pptx.layout = 'LAYOUT_16x9';
      pptx.title = `${workspace?.name || 'Startup'} Pitch Deck`;
      
      const themeColors = {
        'gradient-fusion': { bg: '1e1b4b', text: 'f8fafc', accent: 'c084fc', cardBg: '312e81', cardText: 'e2e8f0', line: '4f46e5' },
        'midnight-tech': { bg: '06080e', text: '00ff9f', accent: '00ff9f', cardBg: '111827', cardText: '00ff9f', line: '059669' },
        'venture-editorial': { bg: 'faf8f5', text: '1c1917', accent: 'd97706', cardBg: 'ffffff', cardText: '44403c', line: 'd6d3d1' },
        'ocean-breeze': { bg: '083344', text: 'ecfeff', accent: '22d3ee', cardBg: '164e63', cardText: 'cffafe', line: '0891b2' },
        'corporate-clean': { bg: 'ffffff', text: '0f172a', accent: '2563eb', cardBg: 'f8fafc', cardText: '334155', line: 'cbd5e1' }
      };
      
      const tId = deck.theme || 'gradient-fusion';
      const colors = themeColors[tId as keyof typeof themeColors] || themeColors['gradient-fusion'];
      const isDarkTheme = tId !== 'corporate-clean' && tId !== 'venture-editorial';
      
      deck.slides.forEach((slide) => {
        const pptSlide = pptx.addSlide();
        pptSlide.background = { fill: colors.bg };
        
        // Brand tag bottom-left
        pptSlide.addText(workspace?.name?.toUpperCase() || 'STARTUP', {
          x: 0.5,
          y: 5.15,
          w: 4.0,
          h: 0.3,
          fontSize: 10,
          bold: true,
          color: colors.accent,
          fontFace: isDarkTheme ? 'Courier New' : 'Georgia'
        });
        
        // Slide number bottom-right
        pptSlide.addText(`Slide ${slide.slideNumber} of ${deck.slides.length}`, {
          x: 8.0,
          y: 5.15,
          w: 1.5,
          h: 0.3,
          align: 'right',
          fontSize: 10,
          color: isDarkTheme ? '94a3b8' : '78716c',
          fontFace: 'Arial'
        });
        
        const layout = slide.layout || 'traditional';
        
        if (layout === 'cover') {
          // Centered Title and Content
          pptSlide.addText(slide.title, {
            x: 0.5,
            y: 1.2,
            w: 9.0,
            h: 1.4,
            align: 'center',
            fontSize: 38,
            bold: true,
            color: colors.text,
            fontFace: tId === 'venture-editorial' ? 'Georgia' : 'Arial'
          });
          
          pptSlide.addText(slide.content, {
            x: 1.0,
            y: 2.8,
            w: 8.0,
            h: 0.8,
            align: 'center',
            fontSize: 16,
            color: isDarkTheme ? 'cbd5e1' : '44403c',
            fontFace: 'Arial'
          });
          
          if (slide.points && slide.points.length > 0) {
            const count = slide.points.length;
            const widthPerTag = 7.0 / count;
            slide.points.forEach((point, idx) => {
              const startX = 1.5 + (idx * widthPerTag);
              pptSlide.addText(point, {
                x: startX + 0.1,
                y: 3.8,
                w: widthPerTag - 0.2,
                h: 0.6,
                align: 'center',
                fontSize: 11,
                bold: true,
                color: isDarkTheme ? 'ffffff' : '1c1917',
                fill: { color: colors.cardBg },
                line: { color: colors.line, width: 1 },
                fontFace: 'Arial'
              });
            });
          }
        } else if (layout === 'split') {
          // Split Column Layout
          pptSlide.addText(slide.title, {
            x: 0.5,
            y: 0.6,
            w: 4.2,
            h: 1.0,
            fontSize: 26,
            bold: true,
            color: colors.text,
            fontFace: tId === 'venture-editorial' ? 'Georgia' : 'Arial'
          });
          
          pptSlide.addText(slide.content, {
            x: 0.5,
            y: 1.8,
            w: 4.2,
            h: 2.8,
            fontSize: 14,
            color: isDarkTheme ? '94a3b8' : '57534e',
            fontFace: 'Arial'
          });
          
          if (slide.points && slide.points.length > 0) {
            slide.points.forEach((point, idx) => {
              const startY = 0.8 + (idx * 0.95);
              pptSlide.addText(`0${idx + 1}   ${point}`, {
                x: 5.1,
                y: startY,
                w: 4.4,
                h: 0.8,
                fontSize: 11,
                bold: true,
                color: isDarkTheme ? 'ffffff' : '1c1917',
                fill: { color: colors.cardBg },
                line: { color: colors.line, width: 1 },
                fontFace: 'Arial'
              });
            });
          }
        } else if (layout === 'grid') {
          // Grid Layout
          pptSlide.addText(slide.title, {
            x: 0.5,
            y: 0.4,
            w: 9.0,
            h: 0.6,
            fontSize: 24,
            bold: true,
            color: colors.text,
            fontFace: tId === 'venture-editorial' ? 'Georgia' : 'Arial'
          });
          
          pptSlide.addText(slide.content, {
            x: 0.5,
            y: 1.1,
            w: 9.0,
            h: 0.5,
            fontSize: 13,
            color: isDarkTheme ? 'cbd5e1' : '44403c',
            fontFace: 'Arial'
          });
          
          if (slide.points && slide.points.length > 0) {
            slide.points.forEach((point, idx) => {
              const isCol2 = idx % 2 === 1;
              const isRow2 = idx >= 2;
              const xPos = isCol2 ? 5.1 : 0.5;
              const yPos = isRow2 ? 3.3 : 1.7;
              
              pptSlide.addText(`POINT 0${idx + 1}\n\n${point}`, {
                x: xPos,
                y: yPos,
                w: 4.4,
                h: 1.4,
                fontSize: 11,
                color: isDarkTheme ? 'e2e8f0' : '292524',
                fill: { color: colors.cardBg },
                line: { color: colors.line, width: 1 },
                fontFace: 'Arial'
              });
            });
          }
        } else {
          // Traditional vertical list
          pptSlide.addText(slide.title, {
            x: 0.5,
            y: 0.5,
            w: 9.0,
            h: 0.8,
            fontSize: 30,
            bold: true,
            color: colors.text,
            fontFace: tId === 'venture-editorial' ? 'Georgia' : 'Arial'
          });
          
          pptSlide.addText(slide.content, {
            x: 0.5,
            y: 1.4,
            w: 9.0,
            h: 0.8,
            fontSize: 15,
            color: isDarkTheme ? 'cbd5e1' : '44403c',
            fontFace: 'Arial'
          });
          
          if (slide.points && slide.points.length > 0) {
            const bulletItems = slide.points.map(p => ({ text: p, options: { bullet: true, color: colors.accent } }));
            pptSlide.addText(bulletItems, {
              x: 0.5,
              y: 2.3,
              w: 9.0,
              h: 2.5,
              fontSize: 13,
              fontFace: 'Arial',
              lineSpacing: 22
            });
          }
        }
      });
      
      pptx.writeFile({ fileName: `${workspace?.name?.replace(/\s+/g, '_') || 'Startup'}_PitchDeck.pptx` })
        .then(() => addToast('PowerPoint deck downloaded!', 'success'))
        .catch(() => addToast('Failed to write PPTX file', 'error'));
        
    } catch (err: any) {
      addToast('Error generating PPTX presentation', 'error');
    }
  };

  const activeSlide = deck?.slides[activeSlideIndex];
  const currentTheme = DECK_THEMES.find(t => t.id === (deck?.theme || 'gradient-fusion')) || DECK_THEMES[0];

  // Prevent keyboard scrolling when presenting
  useEffect(() => {
    if (!isPresenting) return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') {
        setActiveSlideIndex(prev => Math.min(prev + 1, (deck?.slides.length || 1) - 1));
      } else if (e.key === 'ArrowLeft') {
        setActiveSlideIndex(prev => Math.max(prev - 1, 0));
      } else if (e.key === 'Escape') {
        setIsPresenting(false);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPresenting, deck]);

  const renderSlideContent = (slide: PitchDeckSlide, isInteractive: boolean) => {
    const layout = slide.layout || 'traditional';
    const inputHoverRing = canEdit ? 'focus:ring-2 focus:ring-emerald-500/20 hover:bg-black/5 dark:hover:bg-white/5 cursor-text transition-all rounded px-2 -ml-2' : '';
    
    switch (layout) {
      case 'cover':
        return (
          <div className="flex-1 flex flex-col justify-center items-center text-center px-4 md:px-8">
            <div className={`text-[10px] uppercase tracking-widest font-extrabold ${currentTheme.mutedClass} mb-4`}>
              Slide {slide.slideNumber}
            </div>
            {isInteractive ? (
              <textarea
                value={slide.title}
                disabled={!canEdit}
                onChange={(e) => handleUpdateSlide({ ...slide, title: e.target.value })}
                rows={2}
                className={`w-full text-center text-3xl md:text-5xl font-black bg-transparent border-none focus:outline-none mb-4 resize-none ${currentTheme.titleClass} ${inputHoverRing}`}
              />
            ) : (
              <h1 className={`text-4xl md:text-6xl font-black mb-6 leading-tight ${currentTheme.titleClass}`}>
                {slide.title}
              </h1>
            )}
            
            {isInteractive ? (
              <textarea
                value={slide.content}
                disabled={!canEdit}
                onChange={(e) => handleUpdateSlide({ ...slide, content: e.target.value })}
                rows={2}
                className={`w-full max-w-xl text-center text-sm md:text-base bg-transparent border-none focus:outline-none resize-none mb-6 ${currentTheme.textClass} ${inputHoverRing}`}
              />
            ) : (
              <p className={`max-w-2xl text-base md:text-lg leading-relaxed ${currentTheme.textClass}`}>
                {slide.content}
              </p>
            )}

            {slide.points.length > 0 && (
              <div className="flex flex-wrap justify-center gap-2 mt-4 max-w-2xl">
                {slide.points.map((point, idx) => (
                  <div key={idx} className={`px-3 py-1.5 text-xs font-semibold rounded-full ${currentTheme.cardClass}`}>
                    {isInteractive ? (
                      <input
                        value={point}
                        disabled={!canEdit}
                        onChange={(e) => {
                          const newPoints = [...slide.points];
                          newPoints[idx] = e.target.value;
                          handleUpdateSlide({ ...slide, points: newPoints });
                        }}
                        className="bg-transparent text-center focus:outline-none border-none max-w-[150px] text-xs font-semibold"
                      />
                    ) : (
                      <span>{point}</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case 'split':
        return (
          <div className="flex-1 grid grid-cols-1 md:grid-cols-5 gap-6 md:gap-8 items-center h-full">
            <div className="md:col-span-2 flex flex-col justify-center text-left">
              <div className={`text-[10px] uppercase tracking-widest font-extrabold ${currentTheme.mutedClass} mb-2`}>
                Slide {slide.slideNumber}
              </div>
              {isInteractive ? (
                <textarea
                  value={slide.title}
                  disabled={!canEdit}
                  onChange={(e) => handleUpdateSlide({ ...slide, title: e.target.value })}
                  rows={2}
                  className={`w-full text-2xl md:text-3xl font-black bg-transparent border-none focus:outline-none mb-4 resize-none ${currentTheme.titleClass} ${inputHoverRing}`}
                />
              ) : (
                <h1 className={`text-2xl md:text-4xl font-extrabold mb-4 leading-tight ${currentTheme.titleClass}`}>
                  {slide.title}
                </h1>
              )}

              {isInteractive ? (
                <textarea
                  value={slide.content}
                  disabled={!canEdit}
                  onChange={(e) => handleUpdateSlide({ ...slide, content: e.target.value })}
                  rows={3}
                  className={`w-full text-xs md:text-sm bg-transparent border-none focus:outline-none resize-none ${currentTheme.textClass} ${inputHoverRing}`}
                />
              ) : (
                <p className={`text-xs md:text-sm leading-relaxed ${currentTheme.textClass}`}>
                  {slide.content}
                </p>
              )}
            </div>

            <div className="md:col-span-3 space-y-2.5 max-h-full overflow-y-auto">
              {slide.points.map((point, idx) => (
                <div key={idx} className={`p-3 flex items-center gap-3 text-left ${currentTheme.cardClass}`}>
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold text-white shrink-0 ${currentTheme.bulletColor}`}>
                    0{idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    {isInteractive ? (
                      <input
                        value={point}
                        disabled={!canEdit}
                        onChange={(e) => {
                          const newPoints = [...slide.points];
                          newPoints[idx] = e.target.value;
                          handleUpdateSlide({ ...slide, points: newPoints });
                        }}
                        className="w-full bg-transparent text-xs md:text-sm font-medium focus:outline-none border-none truncate focus:text-clip"
                      />
                    ) : (
                      <span className="text-xs md:text-sm font-medium block truncate">{point}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'grid':
        return (
          <div className="flex-1 flex flex-col justify-between text-left h-full">
            <div>
              <div className={`text-[10px] uppercase tracking-widest font-extrabold ${currentTheme.mutedClass} mb-1`}>
                Slide {slide.slideNumber}
              </div>
              {isInteractive ? (
                <textarea
                  value={slide.title}
                  disabled={!canEdit}
                  onChange={(e) => handleUpdateSlide({ ...slide, title: e.target.value })}
                  rows={1}
                  className={`w-full text-2xl md:text-3xl font-extrabold bg-transparent border-none focus:outline-none mb-1 resize-none ${currentTheme.titleClass} ${inputHoverRing}`}
                />
              ) : (
                <h1 className={`text-2xl md:text-3xl font-extrabold mb-1 leading-tight ${currentTheme.titleClass}`}>
                  {slide.title}
                </h1>
              )}

              {isInteractive ? (
                <textarea
                  value={slide.content}
                  disabled={!canEdit}
                  onChange={(e) => handleUpdateSlide({ ...slide, content: e.target.value })}
                  rows={2}
                  className={`w-full text-xs bg-transparent border-none focus:outline-none resize-none mb-2 ${currentTheme.textClass} ${inputHoverRing}`}
                />
              ) : (
                <p className={`text-xs mb-2 leading-relaxed ${currentTheme.textClass}`}>
                  {slide.content}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-auto">
              {slide.points.map((point, idx) => (
                <div key={idx} className={`p-3 flex flex-col justify-between hover:scale-[1.01] transition-transform ${currentTheme.cardClass}`}>
                  <span className={`text-[8px] font-bold ${currentTheme.mutedClass} mb-1.5 block`}>POINT 0{idx + 1}</span>
                  {isInteractive ? (
                    <textarea
                      value={point}
                      disabled={!canEdit}
                      onChange={(e) => {
                        const newPoints = [...slide.points];
                        newPoints[idx] = e.target.value;
                        handleUpdateSlide({ ...slide, points: newPoints });
                      }}
                      rows={2}
                      className="w-full bg-transparent text-xs font-medium focus:outline-none border-none resize-none leading-snug"
                    />
                  ) : (
                    <span className="text-xs md:text-sm font-medium leading-snug">{point}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        );

      case 'traditional':
      default:
        return (
          <div className="flex-1 flex flex-col text-left h-full">
            <div className={`text-[10px] uppercase tracking-widest font-extrabold ${currentTheme.mutedClass} mb-2`}>
              Slide {slide.slideNumber}
            </div>
            {isInteractive ? (
              <textarea
                value={slide.title}
                disabled={!canEdit}
                onChange={(e) => handleUpdateSlide({ ...slide, title: e.target.value })}
                rows={1}
                className={`w-full text-3xl md:text-4xl font-black bg-transparent border-none focus:outline-none mb-3 resize-none ${currentTheme.titleClass} ${inputHoverRing}`}
              />
            ) : (
              <h1 className={`text-3xl md:text-5xl font-black mb-3 leading-tight ${currentTheme.titleClass}`}>
                {slide.title}
              </h1>
            )}

            {isInteractive ? (
              <textarea
                value={slide.content}
                disabled={!canEdit}
                onChange={(e) => handleUpdateSlide({ ...slide, content: e.target.value })}
                rows={2}
                className={`w-full text-xs md:text-sm bg-transparent border-none focus:outline-none resize-none mb-4 ${currentTheme.textClass} ${inputHoverRing}`}
              />
            ) : (
              <p className={`text-xs md:text-base leading-relaxed mb-4 ${currentTheme.textClass}`}>
                {slide.content}
              </p>
            )}

            {slide.points.length > 0 && (
              <ul className="space-y-2 mt-auto">
                {slide.points.map((point, idx) => (
                  <li key={idx} className="flex items-start gap-2.5">
                    <div className={`w-1.5 h-1.5 rounded-full mt-2 shrink-0 ${currentTheme.bulletColor}`} />
                    <div className="flex-1 min-w-0">
                      {isInteractive ? (
                        <input
                          value={point}
                          disabled={!canEdit}
                          onChange={(e) => {
                            const newPoints = [...slide.points];
                            newPoints[idx] = e.target.value;
                            handleUpdateSlide({ ...slide, points: newPoints });
                          }}
                          className="w-full text-xs md:text-sm font-semibold bg-transparent border-none focus:outline-none"
                        />
                      ) : (
                        <span className="text-xs md:text-sm font-semibold">{point}</span>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        );
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)]">
      {/* Header */}
      <div className="bg-white dark:bg-card-dark border border-slate-200 dark:border-border-dark p-4 rounded-2xl mb-4 relative overflow-hidden flex flex-col md:flex-row justify-between items-center gap-4 shrink-0 shadow-sm">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-[60px] pointer-events-none" />
        
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 dark:text-emerald-400 text-[9px] font-bold uppercase tracking-wider flex items-center gap-1">
              <Presentation className="w-3 h-3" /> Premium Studio
            </span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">AI Pitch Deck Builder</h2>
        </div>

        <div className="flex items-center gap-2">
          {!deck ? (
            canEdit ? (
              <div className="flex gap-2">
                <button 
                  onClick={() => handleGenerate()}
                  disabled={isGenerating}
                  className="text-xs bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2.5 rounded-xl font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer shadow-sm shadow-emerald-500/15"
                >
                  {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  {isGenerating ? 'Drafting...' : 'Standard AI Deck'}
                </button>
                <button
                  onClick={() => setIsAiModalOpen(true)}
                  disabled={isGenerating}
                  className="text-xs bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 px-4 py-2.5 rounded-xl font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Wand2 className="w-4 h-4 text-emerald-500" />
                  Create with AI
                </button>
              </div>
            ) : (
              <span className="text-xs text-slate-500 font-bold bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800">No deck generated</span>
            )
          ) : (
            <>
              {canEdit && (
                <button
                  onClick={() => setIsAiModalOpen(true)}
                  className="text-[10px] bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 px-3 py-1.5 rounded-lg font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Wand2 className="w-3.5 h-3.5 text-emerald-500" /> Regenerate AI
                </button>
              )}
              <button 
                onClick={() => setIsPresenting(true)}
                className="text-[10px] bg-[#0f172a] hover:bg-[#1e293b] text-white px-3 py-1.5 rounded-lg font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Play className="w-3.5 h-3.5" /> Present
              </button>
              <button 
                onClick={exportToPPTX}
                className="text-[10px] bg-emerald-500 hover:bg-emerald-600 text-white px-3 py-1.5 rounded-lg font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm shadow-emerald-500/15"
              >
                <Download className="w-3.5 h-3.5" /> Export PPTX
              </button>
            </>
          )}
        </div>
      </div>

      {!deck ? (
        <div className="flex-1 bg-white dark:bg-card-dark border border-slate-200 dark:border-border-dark rounded-2xl flex flex-col items-center justify-center text-center p-8">
          <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mb-4">
            <Presentation className="w-8 h-8 text-emerald-500 animate-pulse" />
          </div>
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-2">Build Your Pitch Presentation</h3>
          <p className="text-sm text-slate-500 max-w-md mx-auto mb-6">Let our AI analyze your startup goals and compile a structured 5-slide pitch presentation. Standard generation reads your completed startup profile, or use custom prompts to design a specific VC deck.</p>
          {!canEdit && (
            <div className="bg-amber-500/10 border border-amber-500/20 text-amber-500 px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 shrink-0">
              <AlertTriangle className="w-4 h-4" />
              <span>A pitch deck hasn't been generated yet. Please ask the founder to generate it.</span>
            </div>
          )}
        </div>
      ) : (
        <div className="flex-1 flex flex-col gap-4 min-h-0">
          {!canEdit && (
            <div className="bg-amber-500/10 border border-amber-500/20 text-amber-500 px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 shrink-0">
              <AlertTriangle className="w-4 h-4" />
              <span><strong>View Only Mode:</strong> Workspace founder has disabled customization privileges for team members.</span>
            </div>
          )}
          
          <div className="flex-1 flex flex-col lg:flex-row gap-4 min-h-0">
            {/* Slides Sidebar */}
            <div className="w-full lg:w-56 bg-white dark:bg-card-dark border border-slate-200 dark:border-border-dark rounded-2xl flex flex-col overflow-hidden shrink-0 shadow-sm">
              <div className="p-3 border-b border-slate-200 dark:border-slate-850 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Slides ({deck.slides.length})</span>
                {canEdit && (
                  <button 
                    onClick={handleAddSlide}
                    className="p-1.5 hover:bg-slate-150 dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
                    title="Add new slide"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                )}
              </div>
              
              <div className="flex-1 flex lg:flex-col overflow-x-auto lg:overflow-x-visible lg:overflow-y-auto p-2 gap-2 custom-scrollbar">
                {deck.slides.map((slide, idx) => (
                  <button
                    key={slide.id}
                    onClick={() => setActiveSlideIndex(idx)}
                    className={`min-w-[120px] lg:min-w-0 text-left p-2 rounded-xl border transition-all ${
                      activeSlideIndex === idx 
                        ? 'bg-emerald-500/10 border-emerald-500/30' 
                        : 'bg-slate-50 dark:bg-slate-900/40 border-transparent hover:border-slate-200 dark:hover:border-slate-700'
                    }`}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[9px] font-bold text-slate-400">0{idx + 1}</span>
                      {activeSlideIndex === idx && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />}
                    </div>
                    <div className="aspect-video bg-white dark:bg-slate-950 rounded border border-slate-200 dark:border-slate-850 p-1.5 flex flex-col overflow-hidden shadow-sm">
                      <span className="text-[8px] font-bold text-slate-700 dark:text-slate-300 truncate">{slide.title}</span>
                      <span className="text-[6px] text-slate-400 mt-0.5 line-clamp-2">{slide.content}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Main Slide Editor */}
            <div className="flex-1 bg-white dark:bg-card-dark border border-slate-200 dark:border-border-dark rounded-2xl flex flex-col shadow-sm min-w-0">
              {/* Editor Toolbar */}
              <div className="min-h-12 border-b border-slate-200 dark:border-slate-850 flex flex-wrap items-center justify-between px-4 py-2 gap-3 bg-slate-50/50 dark:bg-slate-900/50 shrink-0">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                    <Paintbrush className="w-3 h-3 text-slate-400" /> Theme:
                  </span>
                  <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-950 p-1 rounded-lg">
                    {DECK_THEMES.map((t) => (
                      <button
                        key={t.id}
                        onClick={() => handleUpdateTheme(t.id)}
                        disabled={!canEdit}
                        className={`px-2 py-1 rounded text-[9px] font-bold transition-all flex items-center gap-1 cursor-pointer disabled:opacity-50 ${
                          currentTheme.id === t.id
                            ? 'bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-900 shadow-sm'
                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-850'
                        }`}
                        title={t.name}
                      >
                        <span>{t.emoji}</span>
                        <span className="hidden sm:inline">{t.name.split(' ')[0]}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                    <Sliders className="w-3 h-3 text-slate-400" /> Layout:
                  </span>
                  <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-950 p-1 rounded-lg">
                    {['traditional', 'split', 'grid', 'cover'].map((l) => (
                      <button
                        key={l}
                        onClick={() => handleUpdateLayout(l)}
                        disabled={!canEdit}
                        className={`px-2 py-1 rounded text-[9px] font-bold uppercase tracking-wider transition-all cursor-pointer disabled:opacity-50 ${
                          (activeSlide?.layout || 'traditional') === l
                            ? 'bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-900 shadow-sm'
                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-850'
                        }`}
                      >
                        {l}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setIsPresenting(true)}
                    className="p-1.5 text-slate-400 hover:text-emerald-500 hover:bg-emerald-500/10 rounded transition-colors cursor-pointer"
                    title="Fullscreen preview"
                  >
                    <Maximize2 className="w-4 h-4" />
                  </button>
                  {canEdit && (
                    <>
                      <div className="w-px h-4 bg-slate-255 dark:bg-slate-700 mx-1" />
                      <button 
                        onClick={handleDeleteSlide}
                        className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 rounded transition-colors cursor-pointer"
                        title="Delete Slide"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>
              
              {/* Slide Preview Canvas */}
              <div className="flex-1 bg-slate-100 dark:bg-[#07080c] overflow-auto flex flex-col items-center justify-center p-8 custom-scrollbar relative">
                {activeSlide && (
                  <>
                    <div className={`w-full max-w-3xl aspect-video shadow-2xl border flex flex-col p-8 md:p-12 relative overflow-hidden transition-all duration-500 rounded-xl group ${currentTheme.canvasClass}`}>
                      {/* Theme Specific Glow Effects */}
                      {currentTheme.id === 'gradient-fusion' && (
                        <div className="absolute -top-10 -right-10 w-48 h-48 bg-pink-500/10 rounded-full blur-3xl pointer-events-none" />
                      )}
                      {currentTheme.id === 'ocean-breeze' && (
                        <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
                      )}
                      
                      <div className="absolute bottom-4 left-6 text-[9px] font-bold tracking-widest opacity-60 uppercase">{workspace?.name}</div>
                      <div className="absolute bottom-4 right-6 text-[9px] font-bold opacity-60">{activeSlide.slideNumber} / {deck.slides.length}</div>
                      
                      {renderSlideContent(activeSlide, true)}
                    </div>
                    
                    {/* AI Slide Assistant */}
                    {canEdit && (
                      <div className="w-full max-w-3xl mt-4 flex gap-2 bg-white dark:bg-card-dark p-2 rounded-xl border border-slate-200 dark:border-border-dark shadow-md transition-all">
                        <div className="flex items-center gap-1.5 text-emerald-500 px-2 shrink-0">
                          <Wand2 className="w-4 h-4 animate-pulse" />
                          <span className="text-[10px] font-bold uppercase tracking-wider hidden sm:inline">AI Assistant</span>
                        </div>
                        <input
                          type="text"
                          placeholder="Instruct AI to refine this slide... (e.g. 'Make it punchier', 'Describe our monetization details')"
                          value={refineInstructions}
                          onChange={(e) => setRefineInstructions(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleRefineSlide();
                          }}
                          disabled={isRefining}
                          className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 px-3 py-1.5 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500/30"
                        />
                        <button
                          onClick={handleRefineSlide}
                          disabled={isRefining || !refineInstructions.trim()}
                          className="bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white text-[10px] px-3 py-1.5 rounded-lg font-bold tracking-wider uppercase flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          {isRefining ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                          {isRefining ? 'Refining...' : 'Refine'}
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
              
              {/* Bottom Slide Nav */}
              <div className="h-12 border-t border-slate-200 dark:border-slate-850 flex items-center justify-between px-4 bg-slate-50/50 dark:bg-slate-900/50 shrink-0">
                <button 
                  onClick={() => setActiveSlideIndex(Math.max(0, activeSlideIndex - 1))}
                  disabled={activeSlideIndex === 0}
                  className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-800 disabled:opacity-30 text-slate-500 cursor-pointer"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <span className="text-xs font-bold text-slate-500">
                  Slide {activeSlideIndex + 1} of {deck.slides.length}
                </span>
                <button 
                  onClick={() => setActiveSlideIndex(Math.min(deck.slides.length - 1, activeSlideIndex + 1))}
                  disabled={activeSlideIndex === deck.slides.length - 1}
                  className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-800 disabled:opacity-30 text-slate-500 cursor-pointer"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Full Presentation Mode Modal */}
      <AnimatePresence>
        {isPresenting && activeSlide && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black flex flex-col"
          >
            {/* Top controls */}
            <div className="absolute top-0 inset-x-0 h-16 bg-gradient-to-b from-black/80 to-transparent flex items-center justify-between px-6 z-10 opacity-50 hover:opacity-100 transition-opacity">
              <span className="text-white/70 text-xs font-bold tracking-widest uppercase">{workspace?.name} Pitch Presentation</span>
              <button 
                onClick={() => setIsPresenting(false)}
                className="p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* Slide Area */}
            <div className="flex-1 flex items-center justify-center p-8 md:p-16">
              <div className={`w-full max-w-5xl aspect-video rounded-xl flex flex-col p-12 md:p-16 relative overflow-hidden shadow-2xl ring-1 ring-white/10 transition-all duration-500 ${currentTheme.canvasClass}`}>
                {/* Theme Specific Glow Effects */}
                {currentTheme.id === 'gradient-fusion' && (
                  <div className="absolute -top-10 -right-10 w-64 h-64 bg-pink-500/10 rounded-full blur-3xl pointer-events-none animate-pulse" />
                )}
                {currentTheme.id === 'ocean-breeze' && (
                  <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none animate-pulse" />
                )}
                
                <div className="absolute bottom-8 left-12 text-sm font-bold tracking-widest opacity-45 uppercase">{workspace?.name}</div>
                <div className="absolute bottom-8 right-12 text-sm font-bold opacity-45">{activeSlide.slideNumber} / {deck.slides.length}</div>
                
                {renderSlideContent(activeSlide, false)}
              </div>
            </div>

            {/* Navigation Hint */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/30 text-[10px] font-semibold tracking-widest uppercase flex gap-4">
              <span>← Prev</span>
              <span>Space / Next →</span>
              <span>Esc to exit</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Create with AI Modal */}
      <AnimatePresence>
        {isAiModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-card-dark border border-slate-200 dark:border-border-dark w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl"
            >
              <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-emerald-500" />
                  <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">Create / Regenerate Presentation with AI</h3>
                </div>
                <button
                  onClick={() => setIsAiModalOpen(false)}
                  className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6">
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 leading-relaxed">
                  Provide custom instructions or guidelines to dictate what our AI models should focus on. We will regenerate the slides to align with your strategy, tone, or selected VC focus.
                </p>

                <div className="space-y-4">
                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                      Instructions & Focus Areas
                    </label>
                    <textarea
                      placeholder="e.g., 'Targeting medical device pre-seed VCs. Emphasize our engineering core competency, high margin business model, and make the tone highly professional and urgent.'"
                      value={customInstructions}
                      onChange={(e) => setCustomInstructions(e.target.value)}
                      rows={4}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 p-3 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20 resize-none text-slate-800 dark:text-slate-100"
                    />
                  </div>
                  
                  <div className="bg-emerald-500/10 border border-emerald-500/20 p-3.5 rounded-xl text-[10px] text-emerald-600 dark:text-emerald-400 leading-relaxed font-semibold">
                    ⚡ Custom generation will rebuild your entire deck. Your current manual changes to slides will be replaced with the newly generated structure.
                  </div>
                </div>
              </div>

              <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex justify-end gap-2">
                <button
                  onClick={() => setIsAiModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleGenerate(customInstructions)}
                  disabled={isGenerating || !customInstructions.trim()}
                  className="bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  {isGenerating ? 'Generating...' : 'Generate Deck'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
