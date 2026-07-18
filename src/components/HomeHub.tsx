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
  MousePointer2,
  Mail,
  Send,
  Sliders,
  History
} from 'lucide-react';
import { EmailTemplate } from '../types';
import AiDesignPrompt from './AiDesignPrompt';
import TemplateLibraryModal from './TemplateLibraryModal';
import { STARTER_TEMPLATES } from '../utils/templates';
import TemplatesGallery from './TemplatesGallery';
import BrandHub from './BrandHub';
import Postmark from './Postmark';

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

  const [activeTab, setActiveTab] = useState<'projects' | 'templates' | 'brands'>('projects');
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
    <div className="min-h-screen w-full bg-ink text-text-on-ink font-sans transition-colors duration-200 selection:bg-gold/30">
      
      {/* Postal Studio Sticky Header */}
      <header className="border-b border-ink-2/30 bg-ink/90 backdrop-blur-md sticky top-0 z-30 text-text-on-ink" id="app-header">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Elegant Postmark-style logomark */}
            <div className="w-8 h-8 rounded-full bg-gold flex items-center justify-center font-serif text-ink font-bold text-sm shadow-inner transition-transform hover:scale-105 shrink-0">
              D
            </div>
            <span className="font-serif font-semibold tracking-tight text-text-on-ink text-lg">
              Dost_MailKit
            </span>
          </div>

          {/* Center-Right Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-xs font-semibold uppercase tracking-[0.15em] text-text-on-ink-muted">
            <button 
              onClick={() => setActiveTab('projects')} 
              className={`transition-all hover:text-text-on-ink ${activeTab === 'projects' ? 'text-text-on-ink underline decoration-gold decoration-2 underline-offset-4' : ''}`}
            >
              My Projects
            </button>
            <button 
              onClick={() => setActiveTab('templates')} 
              className={`transition-all hover:text-text-on-ink ${activeTab === 'templates' ? 'text-text-on-ink underline decoration-gold decoration-2 underline-offset-4' : ''}`}
            >
              Templates
            </button>
            <button 
              onClick={() => setActiveTab('brands')} 
              className={`transition-all hover:text-text-on-ink ${activeTab === 'brands' ? 'text-text-on-ink underline decoration-gold decoration-2 underline-offset-4' : ''}`}
            >
              Brand Hub
            </button>
          </nav>

          {/* Far Right: Theme and Sign in */}
          <div className="flex items-center gap-4">
            <button
              onClick={onToggleTheme}
              className="p-2 rounded-xl text-text-on-ink-muted hover:text-text-on-ink hover:bg-ink-2/50 transition-all cursor-pointer"
              aria-label="Toggle theme"
            >
              {theme === 'light' ? (
                <Moon className="h-4 w-4" />
              ) : (
                <Sun className="h-4 w-4 text-gold" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Hub Body */}
      <main className="max-w-[1400px] mx-auto px-6 lg:px-12 py-12 lg:py-18 space-y-24">
        
        {/* Postal Studio Hero Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          
          {/* Hero Left: Craft Typography & Value Prop */}
          <div className="space-y-8">
            <div className="space-y-4">
              <span className="text-[11px] font-bold tracking-[0.22em] text-gold uppercase block">
                EMAIL DESIGN STUDIO
              </span>
              <h1 className="text-4xl sm:text-5xl lg:text-[56px] font-serif font-normal text-text-on-ink leading-[1.06] tracking-[-0.5px]">
                Compose newsletters <br/>
                like you <span className="font-serif italic text-gold">mean</span> it.
              </h1>
              <p className="text-sm sm:text-base text-text-on-ink-muted leading-relaxed max-w-md font-sans">
                Drag, drop, and arrange real editorial layouts — multi-column sections, product grids, and pull quotes — then hand the rest to AI when you want a first draft.
              </p>
            </div>

            {/* Distinct CTAs system-wide rules */}
            <div className="flex flex-col sm:flex-row items-center gap-4">
              {/* Primary button: Solid Gold */}
              <button
                onClick={onNewFromScratch}
                className="w-full sm:w-auto px-6 py-3.5 bg-gold text-ink font-semibold rounded-lg flex items-center justify-center gap-2 transition-all hover:bg-gold/95 hover:-translate-y-0.5 cursor-pointer shadow-sm text-sm"
              >
                <Plus className="h-4 w-4 stroke-[3px]" />
                Start a new canvas
              </button>
              
              {/* Secondary button: Outlined */}
              <button
                onClick={() => setIsTemplateLibraryOpen(true)}
                className="w-full sm:w-auto px-6 py-3.5 bg-transparent border border-text-on-ink-muted/30 hover:border-text-on-ink text-text-on-ink font-semibold rounded-lg flex items-center justify-center gap-2 transition-all hover:bg-ink-2/30 cursor-pointer text-sm"
              >
                <LayoutGrid className="h-4 w-4" />
                Browse templates
              </button>
            </div>

            {/* Under-buttons microcopy */}
            <p className="text-xs text-text-on-ink-muted/60 font-sans">
              No credit card. Export to HTML or MJML whenever you're ready. Or{' '}
              <button 
                onClick={() => setIsAiPromptOpen(true)} 
                className="text-gold underline hover:text-gold/80 font-medium cursor-pointer"
              >
                generate templates using AI
              </button>.
            </p>
          </div>

          {/* Hero Right: Postcard & Postmark Signature Illustration */}
          <div className="flex justify-center lg:justify-end items-center relative py-8">
            {/* Tilted background shadow layers */}
            <div className="absolute w-[320px] sm:w-[350px] h-[400px] sm:h-[440px] bg-ink-2/40 rounded-xl rotate-[-2deg] -translate-x-4 -translate-y-2 pointer-events-none border border-ink-2/20"></div>

            {/* Postcard Wrapper */}
            <div 
              className="relative w-[320px] sm:w-[350px] h-[400px] sm:h-[440px] bg-paper text-ink rounded-lg p-5 sm:p-6 shadow-xl rotate-[3deg] hover:rotate-0 transition-all duration-300 flex flex-col justify-between overflow-visible border border-paper-2 border-b-2"
              id="postcard-illustration"
            >
              {/* Top Row: Brand Header & Postmark Stamp */}
              <div className="flex justify-between items-start">
                <div className="border-b border-dashed border-ink/20 pb-1 w-[60%]">
                  <span className="font-serif font-bold text-xs tracking-wide text-ink/75 block">
                    Ohme Foods
                  </span>
                  <span className="text-[8px] uppercase tracking-wider text-ink/40 font-mono">
                    Issue #18 · Gazette
                  </span>
                </div>
                
                {/* Signature Postmark Badge Stamped Over top-right corner */}
                <div className="absolute -top-6 -right-6 z-10">
                  <Postmark 
                    textLine1="DOST" 
                    textLine2="MAILKIT" 
                    textLine3="STUDIO" 
                    size="md" 
                    variant="seal" 
                    rotateDeg={9} 
                  />
                </div>
              </div>

              {/* Middle: Organic Harvest Green Picture Placeholder */}
              <div className="relative flex-1 my-4 bg-[#4A5D4E] rounded overflow-hidden flex items-center justify-center min-h-[160px] shadow-inner group">
                <div className="absolute inset-0 opacity-[0.08] bg-white pointer-events-none" 
                  style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)', backgroundSize: '12px 12px' }} />
                <div className="text-center p-4">
                  <Mail className="h-8 w-8 text-paper/40 mx-auto mb-2" />
                  <span className="text-[10px] font-mono tracking-widest text-paper/50 uppercase block">
                    Editorial Frame
                  </span>
                </div>
              </div>

              {/* Bottom: Editorial Article Section */}
              <div className="space-y-2">
                <h3 className="font-serif font-bold text-base text-ink leading-snug">
                  This week's harvest
                </h3>
                <p className="text-xs text-ink/70 leading-relaxed font-sans">
                  Three new small-batch flavors, straight from the coast to your kitchen.
                </p>
                <div className="pt-1 flex items-center justify-between">
                  {/* Postcard dark button CTA */}
                  <span className="inline-block px-4 py-1.5 bg-ink text-paper text-[10px] font-semibold rounded-lg hover:bg-ink-2 cursor-pointer transition-colors">
                    Shop the drop →
                  </span>
                  <span className="text-[9px] font-mono text-ink/40">
                    Acme Postal Service
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Canvas (History Section) */}
        <div className="space-y-6 pt-8 border-t border-ink-2/30" id="drafts-section">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gold/10 text-gold">
                <History className="h-5 w-5" />
              </div>
              <h2 className="text-xl sm:text-2xl font-serif font-normal text-text-on-ink">
                Recent Canvas
              </h2>
            </div>
            <span className="text-xs font-mono font-bold text-text-on-ink-muted/80 bg-ink-2 px-3 py-1.5 rounded-lg border border-ink-2/40 uppercase tracking-widest">
              {drafts.length} Active {drafts.length === 1 ? 'Draft' : 'Drafts'}
            </span>
          </div>

          {drafts.length === 0 ? (
            <div className="h-56 border border-dashed border-text-on-ink-muted/20 rounded-xl flex flex-col items-center justify-center text-center bg-ink-2/20">
              <FileText className="h-8 w-8 text-text-on-ink-muted/30 mb-4" />
              <p className="text-sm font-medium text-text-on-ink">No custom drafts yet</p>
              <p className="text-xs text-text-on-ink-muted/50 mt-1 max-w-xs">Start a clean slate or generate using our AI templates to see your recent canvas drafts here.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {drafts.map((draft, i) => (
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: i * 0.05 }}
                  key={draft.id}
                  onClick={() => onSelectTemplate(draft)}
                  className="group relative bg-ink-2 border border-ink-2/40 hover:border-gold/50 rounded-lg overflow-hidden cursor-pointer transition-all duration-300"
                >
                  {/* Draft card header/thumbnail */}
                  <div className="h-32 bg-ink/40 border-b border-ink-2/50 relative flex items-center justify-center overflow-hidden">
                    {draft.thumbnail ? (
                      <img 
                        src={draft.thumbnail} 
                        alt={draft.name} 
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="absolute inset-0 flex flex-col items-center justify-center bg-ink/60">
                        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)', backgroundSize: '16px 16px' }} />
                        <Mail className="h-6 w-6 text-text-on-ink-muted/30 mb-2 group-hover:text-gold transition-colors" />
                        <span className="text-[9px] font-mono text-text-on-ink-muted/40 uppercase tracking-widest">
                          Draft Canvas
                        </span>
                      </div>
                    )}
                  </div>
                  
                  {/* Card text footer info */}
                  <div className="p-4 flex flex-col justify-between">
                    <div>
                      <h4 className="text-sm font-serif font-bold text-text-on-ink truncate group-hover:text-gold transition-colors">
                        {draft.name || 'Untitled Canvas'}
                      </h4>
                      <p className="text-[11px] text-text-on-ink-muted/60 mt-1 font-mono flex items-center gap-1.5">
                        <Clock className="h-3 w-3" />
                        {formatTime(draft.updatedAt)}
                      </p>
                    </div>
                  </div>

                  {/* Absolute Trash action for quick delete */}
                  <button
                    onClick={(e) => { e.stopPropagation(); onDeleteDraft(draft.id, e); }}
                    className="absolute top-3 right-3 p-1.5 rounded bg-ink-2/95 text-text-on-ink-muted hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-sm border border-ink-2/30 cursor-pointer"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Starters Section (Template Library cards - PRD specs) */}
        <div className="space-y-6 pt-4" id="starters-section">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gold/10 text-gold">
                <Sliders className="h-5 w-5" />
              </div>
              <h2 className="text-xl sm:text-2xl font-serif font-normal text-text-on-ink">
                Starters
              </h2>
            </div>
            <button 
              onClick={() => setIsTemplateLibraryOpen(true)}
              className="text-xs font-semibold uppercase tracking-[0.15em] text-gold hover:text-gold/80 transition-colors cursor-pointer"
            >
              Explore Full Library &rarr;
            </button>
          </div>

          {/* Starters Grid conforming to the Template library cards specs */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {STARTER_TEMPLATES.map((tpl, i) => (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: i * 0.1 }}
                key={tpl.id}
                onClick={() => onSelectTemplate(tpl)}
                className="group cursor-pointer"
              >
                {/* Custom Card surface --paper, thin hairline border, minimal offset shadow */}
                <div className="bg-paper text-ink border border-paper-2 hover:bg-paper-2 transition-all duration-300 rounded-lg overflow-hidden flex flex-col h-full shadow-[2px_2px_0px_rgba(22,35,59,0.15)] hover:shadow-sm">
                  
                  {/* Header thumbnail container */}
                  <div className="h-44 bg-paper-2 flex items-center justify-center border-b border-ink/5 overflow-hidden relative">
                    {tpl.thumbnail ? (
                      <img 
                        src={tpl.thumbnail} 
                        alt={tpl.name} 
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <LayoutGrid className="h-8 w-8 text-ink/20 group-hover:text-ink/40 transition-colors" />
                    )}

                    {/* REUSE Postmark Badge as a status indicator top-right of thumbnail for featured or AI-generated templates */}
                    {tpl.isFeatured && (
                      <div className="absolute top-2 right-2 scale-65 origin-top-right z-10">
                        <Postmark 
                          textLine1="OFFICIAL" 
                          textLine2="FEATURED" 
                          textLine3="MAIL" 
                          size="md" 
                          variant="seal" 
                          rotateDeg={5} 
                        />
                      </div>
                    )}
                    {tpl.isAiGenerated && (
                      <div className="absolute top-2 right-2 scale-65 origin-top-right z-10">
                        <Postmark 
                          textLine1="AI" 
                          textLine2="GENERATED" 
                          textLine3="DRAFT" 
                          size="md" 
                          variant="ink" 
                          rotateDeg={-4} 
                        />
                      </div>
                    )}
                  </div>

                  {/* Card Content body: Fraunces headlines, Inter details */}
                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="text-lg font-serif font-bold text-ink leading-snug group-hover:text-seal transition-colors">
                        {tpl.name}
                      </h4>
                      <p className="text-xs text-ink/70 mt-2 leading-relaxed line-clamp-2">
                        {tpl.subtitle || 'Start from a clean, pre-built structural post layout.'}
                      </p>
                    </div>

                    <div className="mt-4 pt-4 border-t border-ink/5 flex items-center justify-between text-[11px] font-mono text-ink/50">
                      <span>ACME PROTOCOL</span>
                      <span className="font-bold text-ink/80 group-hover:translate-x-1 transition-transform">Customize →</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </main>

      {/* Slide/Fade Modals */}
      <AnimatePresence>
        {isAiPromptOpen && (
          <AiDesignPrompt 
            onClose={() => setIsAiPromptOpen(false)} 
            onSelectTemplate={(tpl) => {
              onSelectTemplate(tpl);
              setIsAiPromptOpen(false);
            }} 
          />
        )}
      </AnimatePresence>
      
      <AnimatePresence>
        {isTemplateLibraryOpen && (
          <TemplateLibraryModal 
            onClose={() => setIsTemplateLibraryOpen(false)} 
            onSelectTemplate={(tpl) => {
              onSelectTemplate(tpl);
              setIsTemplateLibraryOpen(false);
            }} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}
