import React, { useState } from 'react';
import { X, Sparkles, RefreshCw, Layout, ArrowRight } from 'lucide-react';
import { EmailTemplate } from '../types';
import Postmark from './Postmark';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/70 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-ink border border-ink-2/80 w-full max-w-4xl rounded-xl shadow-2xl flex flex-col my-8 animate-fade-in relative text-text-on-ink">
        
        {/* Header with Postal typography */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-ink-2/30">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gold/10 text-gold rounded-lg">
              <Sparkles className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-serif font-semibold text-text-on-ink">AI Design Studio</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-ink-2 text-text-on-ink-muted hover:text-text-on-ink rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 flex flex-col gap-6">
          <div className="space-y-3">
            <label className="text-sm font-semibold tracking-wider text-text-on-ink-muted uppercase">
              Describe your ideal email template
            </label>
            <div className="relative">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="E.g., A minimalist product launch email for a new premium coffee brand with dark earthy tones, a hero image, and a clear call to action..."
                className="w-full h-32 px-4 py-3 bg-paper text-ink border border-paper-2 rounded-lg focus:ring-2 focus:ring-gold/50 outline-none resize-none text-sm font-sans"
              />
              <button
                onClick={handleGenerate}
                disabled={isGenerating || !prompt.trim()}
                className="absolute bottom-3 right-3 px-5 py-2.5 bg-gold hover:bg-gold/90 disabled:opacity-50 text-ink rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-sm"
              >
                {isGenerating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                {isGenerating ? 'Drafting...' : 'Generate Canvas Options'}
              </button>
            </div>
            {error && <p className="text-xs text-red-400 mt-2 font-mono">{error}</p>}
          </div>

          {options.length > 0 && (
            <div className="space-y-4 pt-4 border-t border-ink-2/30">
              <h3 className="text-xs font-bold tracking-widest text-gold uppercase pb-2">
                Select an Option to Initialize Editor
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {options.map((opt, idx) => (
                  <div 
                    key={idx} 
                    className="border border-paper-2 rounded-lg overflow-hidden bg-paper text-ink hover:bg-paper-2 transition-all duration-300 flex flex-col cursor-pointer group shadow-[2px_2px_0px_rgba(22,35,59,0.1)] hover:shadow-sm" 
                    onClick={() => onSelectTemplate(opt)}
                  >
                    <div 
                      className="h-32 p-4 flex flex-col items-center justify-center text-center relative overflow-hidden bg-paper-2"
                    >
                      <Layout className="w-8 h-8 mb-2 opacity-35 text-ink" />
                      <span className="text-[9px] font-mono font-bold px-2 py-1 bg-ink text-paper rounded shadow-sm relative z-10 uppercase tracking-widest">
                        {opt.blocks.length} Blocks
                      </span>
                      
                      {/* AI Generated Postmark Badge stamp */}
                      <div className="absolute top-2 right-2 scale-50 origin-top-right z-10">
                        <Postmark 
                          textLine1="AI" 
                          textLine2="DRAFT" 
                          textLine3="PROT" 
                          size="md" 
                          variant="ink" 
                          rotateDeg={-6} 
                        />
                      </div>
                    </div>
                    <div className="p-4 flex-1 flex flex-col justify-between">
                      <div>
                        <h4 className="font-serif font-bold text-ink text-sm leading-snug mb-1">{opt.name}</h4>
                        <p className="text-xs text-ink/75 line-clamp-2 leading-relaxed">{opt.subject}</p>
                      </div>
                      
                      <button className="mt-4 pt-3 w-full flex items-center justify-between text-[11px] font-mono font-bold text-ink hover:text-seal border-t border-ink/5 transition-colors cursor-pointer uppercase tracking-wider">
                        Use Template <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
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
