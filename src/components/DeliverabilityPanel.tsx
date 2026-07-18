import React from 'react';
import { ShieldCheck, AlertTriangle, CheckCircle, Info, ExternalLink, Mail, Search } from 'lucide-react';
import { EmailTemplate } from '../types';

interface DeliverabilityPanelProps {
  template: EmailTemplate;
  onClose: () => void;
}

export default function DeliverabilityPanel({ template, onClose }: DeliverabilityPanelProps) {
  // Simple deliverability check logic
  const checkDeliverability = () => {
    const issues = [];
    let score = 100;

    // 1. Subject Line Checks
    if (!template.subject) {
      issues.push({ id: 'sub-1', severity: 'error', message: 'Subject line is empty.', category: 'Spam' });
      score -= 30;
    } else {
      if (template.subject.length > 60) {
        issues.push({ id: 'sub-2', severity: 'info', message: 'Subject line is long. Aim for under 60 chars.', category: 'Best Practice' });
        score -= 5;
      }
      const spamWords = ['free', 'money', 'win', 'guaranteed', 'cash', 'prize'];
      const foundSpam = spamWords.filter(word => template.subject.toLowerCase().includes(word));
      if (foundSpam.length > 0) {
        issues.push({ id: 'sub-3', severity: 'warning', message: `Subject contains spammy words: ${foundSpam.join(', ')}`, category: 'Spam' });
        score -= 15;
      }
    }

    // 2. Link Checks
    const links = template.blocks.flatMap(b => {
      if (b.type === 'button') return [b.properties?.href];
      if (b.type === 'hero' && b.properties?.href) return [b.properties.href];
      if (b.type === 'image' && b.properties?.href) return [b.properties.href];
      return [];
    });

    if (links.length === 0) {
      issues.push({ id: 'link-1', severity: 'warning', message: 'No Call to Action (CTA) links found.', category: 'Engagement' });
      score -= 10;
    }

    // 3. Image Checks
    const images = template.blocks.filter(b => b.type === 'image' || b.type === 'hero');
    images.forEach(img => {
      if (!img.properties?.alt) {
        issues.push({ id: `img-${img.id}`, severity: 'warning', message: 'Image missing Alt Text.', category: 'Accessibility' });
        score -= 5;
      }
    });

    // 4. Content Checks
    const totalContent = template.blocks.map(b => b.content || '').join(' ');
    if (totalContent.length < 100) {
      issues.push({ id: 'cont-1', severity: 'warning', message: 'Email content is very short. Might be flagged as low quality.', category: 'Spam' });
      score -= 10;
    }

    return { score: Math.max(0, score), issues };
  };

  const { score, issues } = checkDeliverability();

  return (
    <div className="flex flex-col h-full bg-ink border-l border-ink-2/50 text-text-on-ink shadow-2xl w-80 absolute right-0 top-0 z-[100] animate-in slide-in-from-right duration-300">
      <div className="flex items-center justify-between p-4 border-b border-ink-2/50">
        <h3 className="text-sm font-bold flex items-center gap-2 uppercase tracking-widest">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          Deliverability Score
        </h3>
        <button onClick={onClose} className="text-text-on-ink-muted hover:text-white p-1 hover:bg-ink-2 rounded transition-colors">
          <ExternalLink className="w-4 h-4 rotate-45" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Score Gauge */}
        <div className="text-center py-6 bg-ink-2/20 rounded-2xl border border-ink-2/50 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)', backgroundSize: '20px 20px' }} />
          <div className="relative z-10">
            <div className={`text-5xl font-serif font-black mb-1 ${score > 80 ? 'text-emerald-400' : score > 50 ? 'text-gold' : 'text-rose-400'}`}>
              {score}
            </div>
            <div className="text-[10px] font-mono font-bold text-text-on-ink-muted uppercase tracking-[0.2em]">
              Postmaster Health Index
            </div>
          </div>
        </div>

        {/* Issues List */}
        <div className="space-y-3">
          <h4 className="text-[10px] font-mono font-black text-gold uppercase tracking-widest border-b border-ink-2/30 pb-1">
            Analysis Details
          </h4>
          
          {issues.length === 0 ? (
            <div className="flex items-center gap-3 p-3 bg-emerald-500/5 border border-emerald-500/20 rounded-lg text-emerald-400 text-xs">
              <CheckCircle className="w-4 h-4 shrink-0" />
              <span>Perfect! No major issues found. Your email is optimized for the inbox.</span>
            </div>
          ) : (
            issues.map((issue) => (
              <div 
                key={issue.id} 
                className={`p-3 rounded-lg border flex gap-3 transition-all ${
                  issue.severity === 'error' 
                    ? 'bg-rose-500/5 border-rose-500/20 text-rose-200' 
                    : issue.severity === 'warning' 
                      ? 'bg-gold/5 border-gold/20 text-gold' 
                      : 'bg-blue-500/5 border-blue-500/20 text-blue-200'
                }`}
              >
                <div className="mt-0.5">
                  {issue.severity === 'error' ? <AlertTriangle className="w-3.5 h-3.5" /> : issue.severity === 'warning' ? <AlertTriangle className="w-3.5 h-3.5" /> : <Info className="w-3.5 h-3.5" />}
                </div>
                <div>
                  <div className="text-[10px] font-mono font-bold uppercase tracking-wider opacity-60 mb-0.5">
                    {issue.category}
                  </div>
                  <div className="text-xs font-medium leading-relaxed">
                    {issue.message}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Best Practice Tips */}
        <div className="p-4 bg-ink-2/30 rounded-xl border border-ink-2/50 space-y-3">
          <h5 className="text-[10px] font-mono font-bold text-text-on-ink uppercase tracking-wider flex items-center gap-2">
            <Mail className="w-3 h-3 text-gold" />
            Expert Tip
          </h5>
          <p className="text-[11px] text-text-on-ink-muted leading-relaxed italic font-serif">
            "Maintaining a high text-to-image ratio helps bypass aggressive spam filters. Ensure every image has meaningful Alt Text for screen readers."
          </p>
        </div>
      </div>

      <div className="p-4 border-t border-ink-2/50 bg-ink-2/10">
        <button 
          onClick={onClose}
          className="w-full py-2.5 bg-text-on-ink text-ink font-bold text-xs rounded-lg hover:brightness-90 transition-all uppercase tracking-widest"
        >
          Got it, Close Analysis
        </button>
      </div>
    </div>
  );
}
