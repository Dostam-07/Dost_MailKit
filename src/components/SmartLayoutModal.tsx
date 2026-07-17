import React, { useState, useEffect } from 'react';
import { Sparkles, X, Check, Loader2, Info, ArrowRight, ShieldAlert, Palette, HelpCircle, LayoutGrid } from 'lucide-react';
import { EmailTemplate, EmailBlock } from '../types';

interface SmartLayoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  template: EmailTemplate;
  onApply: (improvedTemplate: EmailTemplate, summary: string[]) => void;
}

interface SmartLayoutResponse {
  summaryOfChanges: string[];
  improvedTemplate: EmailTemplate;
  error?: string;
  isMissingKey?: boolean;
}

const LOADING_STEPS = [
  "Parsing template structure and content blocks...",
  "Analyzing semantic tone, purpose, and branding...",
  "Running visual rhythm & spacing algorithms...",
  "Harmonizing color palette contrast and ratios...",
  "Finalizing layout suggestions..."
];

export default function SmartLayoutModal({ isOpen, onClose, template, onApply }: SmartLayoutModalProps) {
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingStep, setLoadingStep] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [isMissingKey, setIsMissingKey] = useState<boolean>(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [proposedTemplate, setProposedTemplate] = useState<EmailTemplate | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    setLoading(true);
    setLoadingStep(0);
    setError(null);
    setIsMissingKey(false);
    setSuggestions([]);
    setProposedTemplate(null);

    // Dynamic loading text step updates
    const interval = setInterval(() => {
      setLoadingStep((prev) => (prev < LOADING_STEPS.length - 1 ? prev + 1 : prev));
    }, 1800);

    // Call API
    fetch('/api/gemini/smart-layout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ template }),
    })
      .then(async (res) => {
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || `HTTP error ${res.status}`);
        }
        return res.json() as Promise<SmartLayoutResponse>;
      })
      .then((data) => {
        if (data.error) {
          throw new Error(data.error);
        }
        setSuggestions(data.summaryOfChanges || []);
        
        // Merge blocks safely so we don't drop user variables/properties
        const improved = data.improvedTemplate;
        if (improved && improved.blocks) {
          const mergedBlocks = template.blocks.map((original) => {
            const proposed = improved.blocks.find((b) => b.id === original.id);
            if (proposed) {
              return {
                ...original,
                style: {
                  ...original.style,
                  ...proposed.style,
                },
              };
            }
            return original;
          });

          setProposedTemplate({
            ...template,
            globalSettings: {
              ...template.globalSettings,
              ...improved.globalSettings,
            },
            blocks: mergedBlocks,
          });
        } else {
          throw new Error("API response did not contain improved layout properties.");
        }
        setLoading(false);
      })
      .catch((err: any) => {
        console.error(err);
        if (err.message?.includes('API key') || err.message?.includes('Secrets')) {
          setIsMissingKey(true);
        }
        setError(err.message || 'Failed to analyze design settings.');
        setLoading(false);
      })
      .finally(() => {
        clearInterval(interval);
      });

    return () => clearInterval(interval);
  }, [isOpen, template]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[200] flex items-center justify-center p-4 overflow-y-auto select-none">
      <div 
        id="smart-layout-modal"
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-4xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-scale-in"
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-950/10 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-blue-600/10 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400 flex items-center justify-center shadow-2xs">
              <Sparkles className="h-5 w-5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">Gemini Smart Layout</h2>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest block mt-0.5">AI Brand & Spacing Harmonizer</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 min-h-0">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
              <Loader2 className="h-10 w-10 text-blue-600 dark:text-blue-400 animate-spin mb-6" />
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 transition-all duration-350">
                {LOADING_STEPS[loadingStep]}
              </h3>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-2 max-w-sm">
                Gemini is looking at your email template to discover the ideal padding sizes, background themes, and visual groupings...
              </p>
              
              {/* Fake progress pills */}
              <div className="flex gap-1.5 mt-8">
                {LOADING_STEPS.map((_, idx) => (
                  <div 
                    key={idx}
                    className={`h-1.5 w-8 rounded-full transition-all duration-500 ${
                      idx <= loadingStep 
                        ? 'bg-blue-600 dark:bg-blue-500' 
                        : 'bg-slate-100 dark:bg-slate-800'
                    }`}
                  />
                ))}
              </div>
            </div>
          ) : error ? (
            <div className="py-10 px-4 text-center max-w-md mx-auto">
              {isMissingKey ? (
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto mb-4">
                  <ShieldAlert className="h-6 w-6" />
                </div>
              ) : (
                <div className="w-12 h-12 rounded-2xl bg-red-500/10 text-red-500 flex items-center justify-center mx-auto mb-4">
                  <ShieldAlert className="h-6 w-6" />
                </div>
              )}
              
              <h3 className="text-sm font-extrabold text-slate-800 dark:text-slate-200">
                {isMissingKey ? 'GEMINI_API_KEY Missing' : 'Aesthetic Scan Failed'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                {isMissingKey 
                  ? 'Your dev environment requires a Gemini API key. Please open the Settings panel in AI Studio to enter your GEMINI_API_KEY secret.' 
                  : error}
              </p>
              <div className="mt-6 flex justify-center">
                <button
                  onClick={onClose}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl transition-all cursor-pointer"
                >
                  Close & Configure Key
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start h-full">
              {/* Recommendations */}
              <div className="md:col-span-5 space-y-5">
                <div>
                  <h4 className="text-xs font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                    <Palette className="h-3.5 w-3.5 text-blue-500" />
                    Design Recommendations
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    Based on your template content, Gemini has formulated these aesthetic enhancements:
                  </p>
                </div>

                <div className="space-y-3">
                  {suggestions.map((suggestion, index) => (
                    <div 
                      key={index}
                      className="p-3.5 bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800/80 rounded-2xl flex gap-3 text-xs text-slate-700 dark:text-slate-300 leading-relaxed"
                    >
                      <div className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 text-[10px] font-bold mt-0.5">
                        {index + 1}
                      </div>
                      <span>{suggestion}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Layout Change Comparison */}
              <div className="md:col-span-7 space-y-5">
                <h4 className="text-xs font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                  <LayoutGrid className="h-3.5 w-3.5 text-blue-500" />
                  Proposed Parameter Changes
                </h4>

                <div className="border border-slate-200/60 dark:border-slate-850 rounded-2xl overflow-hidden bg-white dark:bg-slate-950/20">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-900/60 border-b border-slate-100 dark:border-slate-850">
                        <th className="p-3.5 font-bold text-slate-600 dark:text-slate-400">Parameter</th>
                        <th className="p-3.5 font-bold text-slate-600 dark:text-slate-400">Current</th>
                        <th className="p-3.5 font-bold text-blue-600 dark:text-blue-400">Proposed (Optimized)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-850 font-medium">
                      <tr>
                        <td className="p-3.5 text-slate-500 dark:text-slate-400">Outer Background</td>
                        <td className="p-3.5 text-slate-700 dark:text-slate-300 font-mono text-[11px]">
                          <span className="inline-block w-2.5 h-2.5 rounded border border-slate-300 dark:border-slate-600 mr-1.5 align-middle" style={{ backgroundColor: template.globalSettings.backgroundColor }} />
                          {template.globalSettings.backgroundColor}
                        </td>
                        <td className="p-3.5 text-blue-600 dark:text-blue-400 font-bold font-mono text-[11px]">
                          <span className="inline-block w-2.5 h-2.5 rounded border border-blue-300 dark:border-blue-600 mr-1.5 align-middle" style={{ backgroundColor: proposedTemplate?.globalSettings.backgroundColor }} />
                          {proposedTemplate?.globalSettings.backgroundColor}
                        </td>
                      </tr>
                      <tr>
                        <td className="p-3.5 text-slate-500 dark:text-slate-400">Inner Background</td>
                        <td className="p-3.5 text-slate-700 dark:text-slate-300 font-mono text-[11px]">
                          <span className="inline-block w-2.5 h-2.5 rounded border border-slate-300 dark:border-slate-600 mr-1.5 align-middle" style={{ backgroundColor: template.globalSettings.contentBg }} />
                          {template.globalSettings.contentBg}
                        </td>
                        <td className="p-3.5 text-blue-600 dark:text-blue-400 font-bold font-mono text-[11px]">
                          <span className="inline-block w-2.5 h-2.5 rounded border border-blue-300 dark:border-blue-600 mr-1.5 align-middle" style={{ backgroundColor: proposedTemplate?.globalSettings.contentBg }} />
                          {proposedTemplate?.globalSettings.contentBg}
                        </td>
                      </tr>
                      <tr>
                        <td className="p-3.5 text-slate-500 dark:text-slate-400">Font Family</td>
                        <td className="p-3.5 text-slate-700 dark:text-slate-300 truncate max-w-[120px]">{template.globalSettings.fontFamily.replace(/"/g, '')}</td>
                        <td className="p-3.5 text-blue-600 dark:text-blue-400 font-bold truncate max-w-[120px]">{proposedTemplate?.globalSettings.fontFamily.replace(/"/g, '')}</td>
                      </tr>
                      <tr>
                        <td className="p-3.5 text-slate-500 dark:text-slate-400">Border Radius</td>
                        <td className="p-3.5 text-slate-700 dark:text-slate-300">{template.globalSettings.borderRadius}px</td>
                        <td className="p-3.5 text-blue-600 dark:text-blue-400 font-bold">{proposedTemplate?.globalSettings.borderRadius}px</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30 rounded-2xl p-4 flex gap-3 text-xs text-blue-800 dark:text-blue-300 leading-relaxed">
                  <Info className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                  <p>
                    <strong>Aesthetic Safety:</strong> Applying this layout matches the brand colors, aligns all margin proportions, and optimizes reading contrast automatically. You can easily rollback at any time using <strong>Undo (Ctrl+Z)</strong>.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        {!loading && !error && (
          <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/10 flex items-center justify-between shrink-0 gap-3">
            <button
              onClick={onClose}
              className="px-5 py-2.5 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 font-bold text-xs rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
            >
              Keep Existing Layout
            </button>
            <button
              onClick={() => {
                if (proposedTemplate) {
                  onApply(proposedTemplate, suggestions);
                  onClose();
                }
              }}
              className="flex items-center gap-1.5 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl transition-all shadow-md cursor-pointer hover:-translate-y-0.5 active:translate-y-0"
            >
              <Check className="h-4 w-4" />
              Apply Smart Design Suggestions
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
