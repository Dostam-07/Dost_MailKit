import React from 'react';
import { Paintbrush, Plus } from 'lucide-react';

export default function BrandHub() {
  return (
    <div className="max-w-[1400px] mx-auto px-6 lg:px-12 py-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
        <div>
          <h2 className="text-3xl font-serif text-paper mb-2">Brand Hub</h2>
          <p className="text-text-on-ink-muted text-sm">Manage brand kits, colors, and typography settings.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-gold hover:bg-gold/90 text-ink font-bold text-sm rounded-lg shadow-lg transition-colors">
          <Plus className="w-4 h-4" />
          New Brand Kit
        </button>
      </div>

      <div className="bg-ink-2/30 rounded-xl border border-ink-2 p-8 text-center flex flex-col items-center justify-center py-20">
        <div className="w-16 h-16 rounded-full bg-ink-2 border border-ink-2 flex items-center justify-center mb-4">
          <Paintbrush className="w-6 h-6 text-gold" />
        </div>
        <h3 className="text-lg font-bold text-paper mb-2">Brand Hub Coming Soon</h3>
        <p className="text-sm text-text-on-ink-muted max-w-md mx-auto mb-6">
          Create complete brand kits including primary colors, neutral scales, typography scales, and button presets that can be applied to any template instantly.
        </p>
        
        <div className="bg-ink p-6 rounded-lg border border-gold/30 text-left max-w-lg w-full relative overflow-hidden">
           <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-gold via-purple-500 to-emerald-500" />
           <h4 className="text-sm font-bold text-paper mb-2 flex items-center gap-2">
             <Paintbrush className="w-4 h-4 text-gold" /> Magic Restyle AI
           </h4>
           <p className="text-xs text-text-on-ink-muted mb-4">
             Automatically generate a complete brand palette and typography system based on a simple text prompt or by uploading your logo.
           </p>
           <div className="flex gap-2">
             <input type="text" placeholder="e.g. Minimalist luxury coffee shop..." className="flex-1 text-xs px-3 py-2 bg-ink-2 border border-ink-2/50 rounded outline-none focus:border-gold text-text-on-ink" />
             <button className="px-3 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold text-[10px] uppercase tracking-wider rounded transition-colors flex items-center gap-1 shadow-lg shadow-purple-900/20">
               Generate
             </button>
           </div>
        </div>
      </div>
    </div>
  );
}
