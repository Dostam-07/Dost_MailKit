import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Trash2, 
  ArrowRight, 
  Clock, 
  Sparkles, 
  Moon,
  Sun,
  LayoutGrid,
  FileText,
  MousePointer2
} from 'lucide-react';
import { EmailTemplate } from '../types';
import AiDesignPrompt from './AiDesignPrompt';
import TemplateLibraryModal from './TemplateLibraryModal';
import { STARTER_TEMPLATES } from '../utils/templates';

interface HomeHubProps {
  drafts: EmailTemplate[];
  onSelectTemplate: (tpl: EmailTemplate) => void;
  onNewFromScratch: () => void;
  onDeleteDraft: (id: string, e: React.MouseEvent) => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

export default function HomeHub({
  drafts,
  onSelectTemplate,
  onNewFromScratch,
  onDeleteDraft,
  theme,
  onToggleTheme
}: HomeHubProps) {

  const [isAiPromptOpen, setIsAiPromptOpen] = useState(false);
  const [isTemplateLibraryOpen, setIsTemplateLibraryOpen] = useState(false);

  const formatTime = (timestamp?: number) => {
    if (!timestamp) return 'Recently edited';
    const date = new Date(timestamp);
    return date.toLocaleDateString(undefined, { 
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="min-h-screen w-full bg-white dark:bg-[var(--color-primary)] text-slate-800 dark:text-slate-100 font-sans transition-colors duration-200 selection:bg-purple-500/30">
      
      {/* Top Banner/Header */}
      <header className="border-b border-slate-100 dark:border-[var(--color-primary-light)] bg-white/80 dark:bg-[var(--color-primary)]/80 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img 
              src="/dost_mailkit_icon.jpg" 
              alt="Dost_MailKit" 
              className="w-8 h-8 rounded-lg object-cover shadow-sm transition-all hover:scale-105 shrink-0"
            />
            <span className="font-display font-bold tracking-tight text-slate-900 dark:text-white text-lg">
              Dost_MailKit
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onToggleTheme}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[var(--color-primary-light)] transition-all cursor-pointer"
            >
              {theme === 'light' ? (
                <Moon className="h-4.5 w-4.5" />
              ) : (
                <Sun className="h-4.5 w-4.5 text-amber-500" />
              )}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-[1400px] mx-auto px-6 lg:px-12 py-16 lg:py-24 space-y-24">
        
        {/* Split Hero Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-8 items-center">
          
          {/* Left: Value Prop & CTAs */}
          <div className="space-y-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="space-y-4"
            >
              <h1 className="text-5xl lg:text-7xl font-display font-bold tracking-tight text-slate-900 dark:text-white leading-[1.1]">
                Design emails <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-accent)] to-[var(--color-accent-light)]">
                  without limits.
                </span>
              </h1>
              <p className="text-lg text-slate-500 dark:text-slate-400 leading-relaxed max-w-md font-sans">
                A creative studio for email. Build responsive, pixel-perfect layouts with a true free-form canvas and powerful styling tools.
              </p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
              className="flex flex-col sm:flex-row items-center gap-4"
            >
              <button
                onClick={onNewFromScratch}
                className="w-full sm:w-auto px-6 py-3 bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white font-medium rounded-xl flex items-center justify-center gap-2 transition-all shadow-[0_4px_20px_var(--color-accent-glow)] hover:shadow-[0_4px_25px_var(--color-accent-glow)] hover:-translate-y-0.5 cursor-pointer"
              >
                <Plus className="h-5 w-5" />
                New Canvas
              </button>
              
              <button
                onClick={() => setIsAiPromptOpen(true)}
                className="w-full sm:w-auto px-6 py-3 bg-slate-100 hover:bg-slate-200 dark:bg-[var(--color-primary-light)] dark:hover:bg-white/5 text-slate-900 dark:text-white font-medium rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Sparkles className="h-5 w-5 text-[var(--color-accent)]" />
                Generate with AI
              </button>
            </motion.div>
          </div>

          {/* Right: Abstract Canvas / Visualizer */}
          <div className="relative h-[400px] lg:h-[500px] w-full perspective-1000">
            <motion.div 
              initial={{ opacity: 0, rotateY: 10, rotateX: 5, x: 20 }}
              animate={{ opacity: 1, rotateY: -5, rotateX: 10, x: 0 }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="absolute inset-0 bg-slate-50 dark:bg-[var(--color-primary-light)] rounded-2xl border border-slate-200 dark:border-white/5 shadow-2xl overflow-hidden"
              style={{ transformStyle: 'preserve-3d' }}
            >
              {/* Decorative grid background */}
              <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]" 
                style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)', backgroundSize: '24px 24px' }}>
              </div>

              {/* Floating elements simulating design process */}
              <motion.div 
                animate={{ y: [0, -10, 0] }} 
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-1/4 left-1/4 w-48 h-32 bg-white dark:bg-white/5 backdrop-blur-md rounded-xl border border-slate-200 dark:border-white/10 p-4 shadow-xl"
              >
                <div className="w-1/2 h-4 bg-slate-200 dark:bg-white/10 rounded mb-4" />
                <div className="w-full h-2 bg-slate-100 dark:bg-white/5 rounded mb-2" />
                <div className="w-3/4 h-2 bg-slate-100 dark:bg-white/5 rounded" />
              </motion.div>

              <motion.div 
                animate={{ y: [0, 15, 0] }} 
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute bottom-1/4 right-1/4 w-32 h-32 bg-[var(--color-accent)] rounded-xl p-4 shadow-[0_8px_30px_var(--color-accent-glow)] flex flex-col justify-end"
              >
                <div className="w-full h-8 bg-white/20 rounded-lg" />
              </motion.div>

              <div className="absolute bottom-6 left-6 right-6 h-12 bg-white dark:bg-[#1A1A24] rounded-xl border border-slate-200 dark:border-white/5 flex items-center px-4 gap-4 shadow-lg backdrop-blur-xl">
                <MousePointer2 className="h-4 w-4 text-[var(--color-accent)]" />
                <span className="text-xs font-mono text-slate-400">Design mode active</span>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Drafts Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-display font-bold text-slate-900 dark:text-white">
              Recent Canvas
            </h2>
            <span className="text-sm font-mono text-slate-500 bg-slate-100 dark:bg-[var(--color-primary-light)] px-3 py-1 rounded-lg">
              {drafts.length} drafts
            </span>
          </div>

          {drafts.length === 0 ? (
            <div className="h-64 border border-dashed border-slate-200 dark:border-white/10 rounded-2xl flex flex-col items-center justify-center text-center bg-slate-50 dark:bg-[var(--color-primary-light)]/50">
              <FileText className="h-8 w-8 text-slate-300 dark:text-slate-600 mb-4" />
              <p className="text-sm font-medium text-slate-900 dark:text-white">No drafts yet</p>
              <p className="text-xs text-slate-500 mt-1 max-w-xs">Create a new canvas to start designing your first email.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {drafts.map((draft, i) => (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.05 }}
                  key={draft.id}
                  onClick={() => onSelectTemplate(draft)}
                  className="group relative bg-white dark:bg-[var(--color-primary-light)] border border-slate-200 dark:border-white/5 rounded-2xl overflow-hidden hover:border-[var(--color-accent)] dark:hover:border-[var(--color-accent)] cursor-pointer transition-colors"
                >
                  <div className="h-32 bg-slate-50 dark:bg-black/20 border-b border-slate-100 dark:border-white/5 relative flex items-center justify-center overflow-hidden">
                    {draft.thumbnail ? (
                      <img 
                        src={draft.thumbnail} 
                        alt={draft.name} 
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900/50">
                        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)', backgroundSize: '16px 16px' }} />
                        <FileText className="h-8 w-8 text-slate-300 dark:text-slate-700 mb-2 group-hover:text-[var(--color-accent)] transition-colors" />
                        <span className="text-[10px] font-bold text-slate-400 dark:text-slate-600 uppercase tracking-widest">
                          Empty Canvas
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="p-5">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate group-hover:text-[var(--color-accent)] transition-colors">
                      {draft.name || 'Untitled'}
                    </h4>
                    <p className="text-xs text-slate-500 mt-1 font-mono">
                      {formatTime(draft.updatedAt)}
                    </p>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); onDeleteDraft(draft.id, e); }}
                    className="absolute top-3 right-3 p-2 rounded-lg bg-white/80 dark:bg-black/50 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-md cursor-pointer"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Templates Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-display font-bold text-slate-900 dark:text-white">
              Starters
            </h2>
            <button 
              onClick={() => setIsTemplateLibraryOpen(true)}
              className="text-sm font-medium text-[var(--color-accent)] hover:text-[var(--color-accent-hover)] transition-colors"
            >
              View Library &rarr;
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {STARTER_TEMPLATES.map((tpl, i) => (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                key={tpl.id}
                onClick={() => onSelectTemplate(tpl)}
                className="group cursor-pointer"
              >
                <div className="bg-white dark:bg-[var(--color-primary-light)] border border-slate-200 dark:border-white/5 rounded-2xl overflow-hidden hover:border-slate-300 dark:hover:border-white/20 transition-colors h-full flex flex-col">
                  <div className="h-40 bg-slate-50 dark:bg-black/20 flex items-center justify-center border-b border-slate-100 dark:border-white/5 overflow-hidden relative">
                    {tpl.thumbnail ? (
                      <img 
                        src={tpl.thumbnail} 
                        alt={tpl.name} 
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <LayoutGrid className="h-8 w-8 text-slate-300 dark:text-white/20 group-hover:text-slate-400 dark:group-hover:text-white/40 transition-colors" />
                    )}
                  </div>
                  <div className="p-6 flex-1 flex flex-col justify-between gap-4">
                    <div>
                      <h4 className="text-base font-bold text-slate-900 dark:text-white">
                        {tpl.name}
                      </h4>
                      <p className="text-sm text-slate-500 mt-2 line-clamp-2">
                        {tpl.subtitle || 'Start from a clean, pre-built structure.'}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </main>

      {isAiPromptOpen && (
        <AiDesignPrompt 
          onClose={() => setIsAiPromptOpen(false)} 
          onSelectTemplate={(tpl) => {
            onSelectTemplate(tpl);
            setIsAiPromptOpen(false);
          }} 
        />
      )}
      
      {isTemplateLibraryOpen && (
        <TemplateLibraryModal 
          onClose={() => setIsTemplateLibraryOpen(false)} 
          onSelectTemplate={(tpl) => {
            onSelectTemplate(tpl);
            setIsTemplateLibraryOpen(false);
          }} 
        />
      )}
    </div>
  );
}
