import React, { useState } from 'react';
import { Search, Sparkles, Plus } from 'lucide-react';
import { EmailTemplate } from '../types';
import { STARTER_TEMPLATES } from '../utils/templates';

interface TemplatesGalleryProps {
  onSelectTemplate: (tpl: EmailTemplate) => void;
}

export default function TemplatesGallery({ onSelectTemplate }: TemplatesGalleryProps) {
  const [search, setSearch] = useState('');
  
  const filtered = STARTER_TEMPLATES.filter(t => 
    t.name.toLowerCase().includes(search.toLowerCase()) || 
    t.description?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-[1400px] mx-auto px-6 lg:px-12 py-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
        <div>
          <h2 className="text-3xl font-serif text-paper mb-2">Templates Gallery</h2>
          <p className="text-text-on-ink-muted text-sm">Start with a professional template or build from scratch.</p>
        </div>
        <div className="relative">
          <Search className="w-4 h-4 text-text-on-ink-muted absolute left-3 top-1/2 -translate-y-1/2" />
          <input 
            type="text" 
            placeholder="Search templates..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-4 py-2 bg-ink-2 border border-ink-2/50 rounded-lg text-sm text-text-on-ink focus:outline-none focus:border-gold w-64"
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filtered.map((t, idx) => (
          <div key={idx} className="group flex flex-col bg-ink-2/30 rounded-xl border border-ink-2 overflow-hidden hover:border-gold/30 transition-all hover:shadow-[0_0_20px_rgba(217,164,65,0.05)] h-full">
            <div className="aspect-[3/4] bg-ink-2 relative flex flex-col">
               {/* Simplified visual rep */}
               <div className="flex-1 p-4 bg-[#f8fafc] flex flex-col items-center justify-start overflow-hidden pointer-events-none relative" style={{ backgroundColor: t.globalSettings.contentBg }}>
                  {t.blocks.slice(0, 3).map((b, i) => (
                    <div key={i} className="w-full bg-black/10 rounded mb-2 h-10" />
                  ))}
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent to-ink-2/90" />
               </div>
               
               <div className="absolute inset-0 bg-ink-2/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                 <button 
                  onClick={() => onSelectTemplate(t)}
                  className="px-6 py-3 bg-gold hover:bg-gold/90 text-ink font-bold text-sm rounded-lg shadow-lg flex items-center gap-2 transform translate-y-4 group-hover:translate-y-0 transition-transform">
                   <Plus className="w-4 h-4" />
                   Use Template
                 </button>
               </div>
            </div>
            
            <div className="p-4 border-t border-ink-2 flex flex-col flex-1">
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-bold text-paper text-sm">{t.name}</h3>
                {t.isAiGenerated && (
                  <span className="text-[9px] uppercase tracking-wider font-bold bg-purple-500/10 text-purple-400 px-2 py-0.5 rounded flex items-center gap-1">
                    <Sparkles className="w-2.5 h-2.5" /> AI
                  </span>
                )}
              </div>
              <p className="text-text-on-ink-muted text-xs line-clamp-2 mt-1">{t.description || 'Professional email template'}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
