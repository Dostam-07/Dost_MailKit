import React from 'react';
import { X, LayoutGrid, ArrowRight } from 'lucide-react';
import { EmailTemplate } from '../types';
import { STARTER_TEMPLATES } from '../utils/templates';
import Postmark from './Postmark';

interface TemplateLibraryModalProps {
  onSelectTemplate: (template: EmailTemplate) => void;
  onClose: () => void;
}

export default function TemplateLibraryModal({ onSelectTemplate, onClose }: TemplateLibraryModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/70 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-ink border border-ink-2/80 w-full max-w-5xl rounded-xl shadow-2xl flex flex-col my-8 animate-fade-in relative text-text-on-ink">
        
        {/* Header with Postal typography */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-ink-2/30">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gold/10 text-gold rounded-lg">
              <LayoutGrid className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-serif font-semibold text-text-on-ink">Template Library</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-ink-2 text-text-on-ink-muted hover:text-text-on-ink rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          <p className="text-sm text-text-on-ink-muted">
            Browse our collection of pre-built, community-inspired email templates. Select a template to import it directly into your Postal Canvas.
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {STARTER_TEMPLATES.map((tpl) => (
              <div
                key={tpl.id}
                onClick={() => {
                  onSelectTemplate(tpl);
                  onClose();
                }}
                className="bg-paper text-ink border border-paper-2 hover:bg-paper-2 rounded-lg overflow-hidden flex flex-col group cursor-pointer transition-all duration-300 shadow-[2px_2px_0px_rgba(22,35,59,0.1)] hover:shadow-sm"
              >
                {/* Image / Thumbnail Section */}
                <div className="h-40 bg-paper-2 border-b border-ink/5 relative overflow-hidden group">
                  {tpl.thumbnail ? (
                    <img 
                      src={tpl.thumbnail} 
                      alt={tpl.name} 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-paper-2">
                       <LayoutGrid className="w-8 h-8 text-ink/20" />
                    </div>
                  )}

                  {/* Badging overlay */}
                  <span className="absolute bottom-2 left-2 text-[9px] font-mono font-bold px-2 py-1 bg-ink text-paper rounded shadow-sm z-10 uppercase tracking-widest">
                    {tpl.blocks.length} Blocks
                  </span>

                  {/* Featured / AI Generated Postmark Badges */}
                  {tpl.isFeatured && (
                    <div className="absolute top-2 right-2 scale-60 origin-top-right z-10">
                      <Postmark 
                        textLine1="OFFICIAL" 
                        textLine2="FEATURED" 
                        textLine3="MAIL" 
                        size="md" 
                        variant="seal" 
                        rotateDeg={4} 
                      />
                    </div>
                  )}
                  {tpl.isAiGenerated && (
                    <div className="absolute top-2 right-2 scale-60 origin-top-right z-10">
                      <Postmark 
                        textLine1="AI" 
                        textLine2="GENERATED" 
                        textLine3="DRAFT" 
                        size="md" 
                        variant="ink" 
                        rotateDeg={-5} 
                      />
                    </div>
                  )}
                </div>

                {/* Info Text Section */}
                <div className="p-5 flex-1 flex flex-col gap-2">
                  <h4 className="font-serif font-bold text-ink text-base group-hover:text-seal transition-colors leading-snug">
                    {tpl.name}
                  </h4>
                  <p className="text-xs text-ink/75 leading-relaxed line-clamp-2">
                    {tpl.subtitle || tpl.subject}
                  </p>
                  
                  {/* Distinct secondary CTA look */}
                  <button className="mt-auto pt-3 w-full flex items-center justify-between text-xs font-bold text-ink hover:text-seal border-t border-ink/5 transition-colors cursor-pointer font-mono uppercase tracking-wider">
                    Import Template <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
