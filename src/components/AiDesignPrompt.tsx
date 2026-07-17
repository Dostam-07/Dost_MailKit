import React, { useState } from 'react';
import { X, Sparkles, RefreshCw, Layout, ArrowRight } from 'lucide-react';
import { EmailTemplate } from '../types';

interface AiDesignPromptProps {
  onSelectTemplate: (template: EmailTemplate) => void;
  onClose: () => void;
}

export default function AiDesignPrompt({ onSelectTemplate, onClose }: AiDesignPromptProps) {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [options, setOptions] = useState<EmailTemplate[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch('/api/gemini/generate-templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate templates');
      }

      setOptions(data.templates || []);
    } catch (err: any) {
      console.error('Error generating templates:', err);
      setError(err.message || 'Template generation failed.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col my-8 animate-fade-in relative">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-lg">
              <Sparkles className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200">AI Design Prompt</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <div className="p-6 flex flex-col gap-6">
          <div className="space-y-3">
            <label className="text-sm font-bold text-slate-700 dark:text-slate-300">
              Describe your ideal email template
            </label>
            <div className="relative">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="E.g., A minimalist product launch email for a new premium coffee brand with dark earthy tones, a hero image, and a clear call to action..."
                className="w-full h-32 px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none text-slate-800 dark:text-slate-200"
              />
              <button
                onClick={handleGenerate}
                disabled={isGenerating || !prompt.trim()}
                className="absolute bottom-3 right-3 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg text-sm font-bold transition-all flex items-center gap-2"
              >
                {isGenerating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                {isGenerating ? 'Generating...' : 'Generate Magic Options'}
              </button>
            </div>
            {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
          </div>

          {options.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 border-b border-slate-100 dark:border-slate-800 pb-2">
                Select an Option to Initialize Editor
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {options.map((opt, idx) => (
                  <div key={idx} className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden hover:border-blue-500 hover:shadow-lg hover:-translate-y-1 transition-all bg-white dark:bg-slate-800 flex flex-col cursor-pointer group" onClick={() => onSelectTemplate(opt)}>
                    <div 
                      className="h-32 p-4 flex flex-col items-center justify-center text-center relative overflow-hidden"
                      style={{ backgroundColor: opt.globalSettings.backgroundColor || '#f8fafc' }}
                    >
                      <Layout className="w-8 h-8 mb-2 opacity-50" style={{ color: opt.globalSettings.contentBg === '#ffffff' ? '#333' : '#fff' }} />
                      <span className="text-xs font-bold px-2 py-1 bg-white/80 dark:bg-black/50 backdrop-blur rounded shadow-sm relative z-10" style={{ color: opt.globalSettings.contentBg === '#ffffff' ? '#333' : '#fff' }}>
                        {opt.blocks.length} Blocks
                      </span>
                    </div>
                    <div className="p-4 flex-1 flex flex-col">
                      <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm mb-1">{opt.name}</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 flex-1">{opt.subject}</p>
                      
                      <button className="mt-3 w-full py-1.5 px-3 bg-slate-100 dark:bg-slate-700 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/30 group-hover:text-blue-600 dark:group-hover:text-blue-400 text-slate-700 dark:text-slate-300 rounded text-xs font-bold transition-colors flex items-center justify-center gap-1">
                        Use Template <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
