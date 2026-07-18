import React, { useMemo } from 'react';
import { ShieldCheck, AlertTriangle, CheckCircle, XCircle, FileWarning } from 'lucide-react';
import { EmailTemplate } from '../types';
import { generateHTML } from '../utils/htmlGenerator';

interface QualityCheckModalProps {
  isOpen: boolean;
  onClose: () => void;
  template: EmailTemplate;
}

export default function QualityCheckModal({ isOpen, onClose, template }: QualityCheckModalProps) {
  const issues = useMemo(() => {
    if (!isOpen) return [];
    
    const html = generateHTML(template);
    const sizeKB = new Blob([html]).size / 1024;
    
    const results = [];
    
    // Check 1: HTML Size
    if (sizeKB > 102) {
      results.push({
        type: 'error',
        message: `HTML size is ${sizeKB.toFixed(1)}KB, exceeding Gmail's 102KB clip limit.`
      });
    } else {
      results.push({
        type: 'success',
        message: `HTML size is safe (${sizeKB.toFixed(1)}KB)`
      });
    }
    
    // Check 2: Unsubscribe link
    const hasUnsubscribe = template.blocks.some(b => 
      b.type === 'footer' && 
      b.content?.toLowerCase().includes('unsubscribe')
    );
    if (!hasUnsubscribe) {
      results.push({
        type: 'warning',
        message: 'No clear "unsubscribe" link found in a footer block.'
      });
    } else {
      results.push({
        type: 'success',
        message: 'Unsubscribe link present.'
      });
    }
    
    // Check 3: Alt text on images
    let missingAltCount = 0;
    template.blocks.forEach(b => {
      if ((b.type === 'image' || b.type === 'hero' || b.type === 'productCard') && !b.properties?.alt) {
        missingAltCount++;
      }
    });
    if (missingAltCount > 0) {
      results.push({
        type: 'warning',
        message: `${missingAltCount} images missing alt text.`
      });
    } else {
      results.push({
        type: 'success',
        message: 'All images have alt text.'
      });
    }
    
    // Check 4: Free Canvas Outlook fallback
    const hasFigmaMode = template.globalSettings.layoutMode === 'figma' || 
                         template.blocks.some(b => b.properties?.sectionLayoutMode === 'figma');
    if (hasFigmaMode) {
      results.push({
        type: 'info',
        message: 'Free Canvas mode active. Outlook fallback applied.'
      });
    }
    
    return results;
  }, [isOpen, template]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-ink rounded-2xl w-full max-w-md shadow-2xl border border-ink-2/50 flex flex-col max-h-[85vh]">
        <div className="p-4 border-b border-ink-2/50 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            Deliverability & Accessibility Check
          </h2>
          <button onClick={onClose} className="text-text-on-ink-muted hover:text-white transition-colors">
            &times;
          </button>
        </div>
        
        <div className="p-4 flex-1 overflow-y-auto space-y-3">
          {issues.map((issue, idx) => (
            <div key={idx} className="flex items-start gap-3 bg-ink-2/30 p-3 rounded-lg border border-ink-2">
              {issue.type === 'success' && <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />}
              {issue.type === 'warning' && <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />}
              {issue.type === 'error' && <XCircle className="w-4 h-4 text-rose-500 mt-0.5 shrink-0" />}
              {issue.type === 'info' && <FileWarning className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" />}
              <span className="text-xs text-slate-300 leading-relaxed">
                {issue.message}
              </span>
            </div>
          ))}
        </div>
        
        <div className="p-4 border-t border-ink-2/50 bg-ink-2/20 flex justify-end">
          <button 
            onClick={onClose}
            className="px-4 py-2 bg-ink-2 hover:bg-ink-2/80 text-white rounded text-xs font-bold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
