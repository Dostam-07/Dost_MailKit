import React from 'react';
import { X, LayoutGrid, ArrowRight, Clock } from 'lucide-react';
import { EmailTemplate } from '../types';
import { STARTER_TEMPLATES } from '../utils/templates';

interface TemplateLibraryModalProps {
  onSelectTemplate: (template: EmailTemplate) => void;
  onClose: () => void;
}

export default function TemplateLibraryModal({ onSelectTemplate, onClose }: TemplateLibraryModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 w-full max-w-5xl rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col my-8 animate-fade-in relative">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 rounded-lg">
              <LayoutGrid className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200">Template Library</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
            Browse our collection of pre-built, community-inspired email templates. Select a template to import it directly into the editor.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {STARTER_TEMPLATES.map((tpl) => (
              <div
                key={tpl.id}
                onClick={() => {
                  onSelectTemplate(tpl);
                  onClose();
                }}
                className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-emerald-500 rounded-xl overflow-hidden shadow-sm hover:shadow-lg cursor-pointer transition-all flex flex-col group"
              >
                <div className="h-32 border-b border-slate-100 dark:border-slate-700 relative overflow-hidden group">
                  {tpl.thumbnail ? (
                    <img 
                      src={tpl.thumbnail} 
                      alt={tpl.name} 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-slate-50 dark:bg-slate-900" style={{ backgroundColor: tpl.globalSettings.backgroundColor }}>
                       <LayoutGrid className="w-8 h-8 text-slate-300 dark:text-slate-700" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                  <span className="absolute bottom-2 left-2 text-[10px] font-bold px-2 py-1 bg-white/80 dark:bg-black/50 backdrop-blur rounded shadow-sm z-10 w-max uppercase tracking-wider text-slate-800 dark:text-slate-200">
                    {tpl.blocks.length} Blocks
                  </span>
                </div>
                <div className="p-4 flex-1 flex flex-col gap-2">
                  <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm">
                    {tpl.name}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                    {tpl.subtitle || tpl.subject}
                  </p>
                  <button className="mt-auto pt-3 w-full flex items-center justify-between text-xs font-bold text-emerald-600 dark:text-emerald-400 group-hover:translate-x-1 transition-transform border-t border-slate-100 dark:border-slate-700">
                    Import Template <ArrowRight className="w-3.5 h-3.5" />
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
