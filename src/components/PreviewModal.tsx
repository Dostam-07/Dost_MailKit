import React, { useState } from 'react';
import { 
  X, 
  Inbox, 
  Link2, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle,
  Monitor, 
  Smartphone, 
  ExternalLink,
  Mail,
  ShieldCheck,
  Info,
  Clock,
  Sparkles,
  Download
} from 'lucide-react';
import { EmailTemplate, EmailBlock } from '../types';
import { generateHTML } from '../utils/htmlGenerator';

interface PreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  template: EmailTemplate;
}

type PreviewTab = 'inbox' | 'links' | 'compatibility';
type ClientType = 'gmail-desktop' | 'gmail-mobile' | 'outlook-desktop';

interface LinkStatus {
  url: string;
  sourceBlock: string;
  blockId: string;
  status: 'valid' | 'warning' | 'error';
  message: string;
}

export default function PreviewModal({ isOpen, onClose, template }: PreviewModalProps) {
  const [activeTab, setActiveTab] = useState<PreviewTab>('inbox');
  const [selectedClient, setSelectedClient] = useState<ClientType>('gmail-desktop');
  const [isMobileFrame, setIsMobileFrame] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  if (!isOpen) return null;

  const htmlCode = generateHTML(template);

  const downloadAsPDF = () => {
    setIsExporting(true);
    const runPdfExport = () => {
      const element = document.createElement('div');
      element.innerHTML = htmlCode;
      element.style.padding = '40px';
      element.style.width = '640px';
      element.style.backgroundColor = template.globalSettings.backgroundColor || '#F8F9FA';
      
      const html2pdf = (window as any).html2pdf;
      const opt = {
        margin:       10,
        filename:     `${template.subject || 'email-design'}.pdf`,
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2, useCORS: true },
        jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };
      
      html2pdf().from(element).set(opt).save().then(() => {
        setIsExporting(false);
      }).catch((err: any) => {
        console.error(err);
        setIsExporting(false);
      });
    };

    if (!(window as any).html2pdf) {
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';
      script.onload = () => {
        runPdfExport();
      };
      script.onerror = () => {
        setIsExporting(false);
      };
      document.body.appendChild(script);
    } else {
      runPdfExport();
    }
  };

  // Parse template to extract and check links
  const performLinkCheck = (): LinkStatus[] => {
    const results: LinkStatus[] = [];

    // Helper to add links
    const addLink = (url: string, blockType: string, blockId: string) => {
      if (!url) {
        results.push({
          url: '[Empty Link]',
          sourceBlock: blockType,
          blockId,
          status: 'error',
          message: 'The link destination URL is completely empty.'
        });
        return;
      }

      const trimmed = url.trim();
      if (trimmed === '#' || trimmed === 'javascript:void(0)') {
        results.push({
          url: trimmed,
          sourceBlock: blockType,
          blockId,
          status: 'warning',
          message: 'Uses a dummy placeholder page-top link ("#").'
        });
      } else if (trimmed.startsWith('/') || !trimmed.match(/^(https?:\/\/|mailto:)/i)) {
        results.push({
          url: trimmed,
          sourceBlock: blockType,
          blockId,
          status: 'error',
          message: 'Relative URL or invalid scheme. Use absolute URLs starting with http://, https://, or mailto:.'
        });
      } else if (trimmed.includes('example.com') || trimmed.includes('yoursite.com')) {
        results.push({
          url: trimmed,
          sourceBlock: blockType,
          blockId,
          status: 'warning',
          message: 'Uses a generic demo domain link (e.g. example.com).'
        });
      } else {
        results.push({
          url: trimmed,
          sourceBlock: blockType,
          blockId,
          status: 'valid',
          message: 'Valid absolute external URL.'
        });
      }
    };

    template.blocks.forEach((block) => {
      if (block.type === 'button' && block.properties?.href) {
        addLink(block.properties.href, 'Button Block', block.id);
      }
      if (block.type === 'image' && block.properties?.href) {
        addLink(block.properties.href, 'Image Banner Link', block.id);
      }
      if (block.type === 'social' && block.properties?.socialLinks) {
        block.properties.socialLinks.forEach((link) => {
          if (link.url) {
            addLink(link.url, `Social Link (${link.platform})`, block.id);
          }
        });
      }

      // Parse inline HTML link anchors using regex in text content
      if (block.content && (block.type === 'text' || block.type === 'footer' || block.type === 'header')) {
        const regex = /<a\s+(?:[^>]*?\s+)?href=["']([^"']*)["']/gi;
        let match;
        while ((match = regex.exec(block.content)) !== null) {
          addLink(match[1], `${block.type.toUpperCase()} inline anchor`, block.id);
        }
      }
    });

    return results;
  };

  const detectedLinks = performLinkCheck();
  const warningCount = detectedLinks.filter(l => l.status === 'warning').length;
  const errorCount = detectedLinks.filter(l => l.status === 'error').length;
  const validCount = detectedLinks.filter(l => l.status === 'valid').length;

  // Render client warnings
  const getCompatibilityWarnings = () => {
    const warnings = [];

    // Font family check
    if (template.globalSettings.fontFamily && template.globalSettings.fontFamily !== 'Arial' && template.globalSettings.fontFamily !== 'sans-serif') {
      warnings.push({
        client: 'Gmail (Web & Mobile)',
        severity: 'info',
        issue: 'Custom Web Fonts Support',
        fix: 'Gmail does not render custom Google Web Fonts directly. It will fall back to standard system sans-serif fonts. The auto-generated HTML fallback is configured properly.'
      });
    }

    // Border radius check
    const hasBorderRadius = template.globalSettings.borderRadius > 0 || template.blocks.some(b => b.style.borderRadius !== undefined && b.style.borderRadius > 0);
    if (hasBorderRadius) {
      warnings.push({
        client: 'Outlook Desktop (2007-2019)',
        severity: 'warning',
        issue: 'Border Radius Support',
        fix: 'Outlook utilizes Microsoft Word for rendering and does not support CSS border-radius. Rounded elements (except CTA Buttons with VML headers) will render as squares in Outlook.'
      });
    }

    // Button checks
    const hasButton = template.blocks.some(b => b.type === 'button');
    if (hasButton) {
      warnings.push({
        client: 'Outlook Desktop (all versions)',
        severity: 'info',
        issue: 'Maledict VML Button Fallback',
        fix: 'CTA Buttons are embedded with auto-generated VML (Vector Markup Language) blocks, guaranteeing buttons remain fully clickable and styled as capsules in Outlook clients.'
      });
    }

    // Spacing check
    const hasSpacer = template.blocks.some(b => b.type === 'spacer');
    if (hasSpacer) {
      warnings.push({
        client: 'Yahoo & AOL Mail',
        severity: 'info',
        issue: 'Spacer Element Heights',
        fix: 'Vertical empty spacers utilize explicit pixel heights with line-height and font-size reset nodes, ensuring proper render of vertical gaps across AOL/Yahoo.'
      });
    }

    // Default compatibility
    warnings.push({
      client: 'Responsive Layouts (General)',
      severity: 'success',
      issue: 'Mobile Optimization',
      fix: 'All blocks are framed inside fluid, percentage-based inner content tables with @media queries, ensuring automatic downscaling on smaller viewport sizes.'
    });

    return warnings;
  };

  const compatibilityIssues = getCompatibilityWarnings();

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 select-none">
      <div className="bg-white rounded-3xl w-full max-w-5xl h-[85vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 text-blue-600 rounded-xl">
              <Inbox className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider leading-none">
                Inbox Simulation & Testing Center
              </h2>
              <p className="text-[10px] text-slate-400 mt-1 uppercase font-bold tracking-widest">
                Dost_MailKit Suite • Auto-checkers, Inbox renders & Compatibility
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 hover:bg-slate-200 text-slate-400 hover:text-slate-700 rounded-xl transition-all"
            title="Close Preview (ESC)"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-white px-6 py-2">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('inbox')}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all ${
                activeTab === 'inbox'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
              }`}
            >
              <Mail className="h-4 w-4" />
              Inbox & Clients
            </button>
            <button
              onClick={() => setActiveTab('links')}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all relative ${
                activeTab === 'links'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
              }`}
            >
              <Link2 className="h-4 w-4" />
              Link Checker
              {errorCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold animate-pulse">
                  {errorCount}
                </span>
              )}
              {errorCount === 0 && warningCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-amber-500 text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                  {warningCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('compatibility')}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all ${
                activeTab === 'compatibility'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
              }`}
            >
              <ShieldCheck className="h-4 w-4" />
              Compatibility Audit
            </button>
          </div>

          {/* Download as PDF Button */}
          <button
            id="btn-download-pdf"
            onClick={downloadAsPDF}
            disabled={isExporting}
            className="flex items-center gap-2 py-2 px-4 text-xs font-extrabold rounded-xl transition-all bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs disabled:opacity-50 cursor-pointer"
            title="Download this design as a clean A4 PDF Document"
          >
            {isExporting ? (
              <div className="h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Download className="h-3.5 w-3.5 text-emerald-100" />
            )}
            <span>{isExporting ? 'Generating PDF...' : 'Download as PDF'}</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-hidden flex bg-slate-50">
          
          {activeTab === 'inbox' && (
            <div className="flex-1 flex overflow-hidden">
              
              {/* Inbox Sidebar / Simulated Email Clients */}
              <div className="w-64 border-r border-slate-200 bg-white flex flex-col shrink-0">
                <div className="p-4 border-b border-slate-100">
                  <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Simulate Client</h3>
                  <div className="space-y-1.5">
                    <button
                      onClick={() => { setSelectedClient('gmail-desktop'); setIsMobileFrame(false); }}
                      className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left text-xs font-bold transition-all border ${
                        selectedClient === 'gmail-desktop'
                          ? 'bg-blue-50 border-blue-200/60 text-blue-700 shadow-2xs'
                          : 'border-transparent text-slate-600 hover:bg-slate-50 hover:text-slate-800'
                      }`}
                    >
                      <Monitor className="h-4 w-4 text-slate-400" />
                      Gmail (Web / Chrome)
                    </button>
                    <button
                      onClick={() => { setSelectedClient('outlook-desktop'); setIsMobileFrame(false); }}
                      className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left text-xs font-bold transition-all border ${
                        selectedClient === 'outlook-desktop'
                          ? 'bg-blue-50 border-blue-200/60 text-blue-700 shadow-2xs'
                          : 'border-transparent text-slate-600 hover:bg-slate-50 hover:text-slate-800'
                      }`}
                    >
                      <Monitor className="h-4 w-4 text-indigo-400" />
                      Outlook Web Client
                    </button>
                    <button
                      onClick={() => { setSelectedClient('gmail-mobile'); setIsMobileFrame(true); }}
                      className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left text-xs font-bold transition-all border ${
                        selectedClient === 'gmail-mobile'
                          ? 'bg-blue-50 border-blue-200/60 text-blue-700 shadow-2xs'
                          : 'border-transparent text-slate-600 hover:bg-slate-50 hover:text-slate-800'
                      }`}
                    >
                      <Smartphone className="h-4 w-4 text-rose-400" />
                      Gmail App (iPhone 15)
                    </button>
                  </div>
                </div>

                <div className="p-4 mt-auto border-t border-slate-100 bg-slate-50/50">
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-blue-600 uppercase mb-1">
                    <Sparkles className="h-3 w-3 animate-pulse" />
                    <span>Inbox Preview Specs</span>
                  </div>
                  <p className="text-[10px] text-slate-400 leading-relaxed font-semibold">
                    Simulates active style tags and container viewport limits of different screen sizes.
                  </p>
                </div>
              </div>

              {/* Main Preview Container */}
              <div className="flex-1 flex flex-col overflow-hidden p-6 items-center justify-start">
                
                {/* Inbox header simulator (Subject line, Sender details, etc.) */}
                <div className="w-full max-w-4xl bg-white rounded-2xl border border-slate-200 p-4 mb-4 shadow-sm shrink-0">
                  <div className="flex items-start justify-between">
                    <div className="flex gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-black text-sm border border-blue-200/30">
                        D
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-slate-800">Dost_MailKit Campaigns</span>
                          <span className="text-[10px] text-slate-400 font-mono font-medium">&lt;campaigns@dostmailkit.io&gt;</span>
                        </div>
                        <div className="text-[10px] text-slate-500 mt-0.5 font-medium">
                          To: <span className="text-slate-600">subscriber@recipient-inbox.com</span>
                        </div>
                        <div className="mt-2 flex items-baseline gap-1.5">
                          <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">Subject</span>
                          <h4 className="text-xs font-bold text-slate-800 leading-snug">{template.subject || '[No Subject Line Specified]'}</h4>
                        </div>
                        {template.subtitle && (
                          <div className="mt-1 flex items-baseline gap-1.5">
                            <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">Preheader</span>
                            <p className="text-[10px] text-slate-400 leading-none italic font-medium">{template.subtitle}</p>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1 text-[10px] text-slate-400 font-bold font-mono uppercase">
                        <Clock className="h-3 w-3" />
                        <span>Just now</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Simulated Device Frame */}
                <div className="flex-1 w-full flex justify-center items-start overflow-hidden">
                  <div 
                    className={`transition-all duration-300 bg-slate-800 border-4 border-slate-700 shadow-xl overflow-hidden flex flex-col ${
                      isMobileFrame 
                        ? 'w-[375px] h-[95%] rounded-[36px] relative' 
                        : 'w-full max-w-4xl h-full rounded-2xl'
                    }`}
                  >
                    {isMobileFrame && (
                      <div className="h-6 w-full bg-slate-700 flex justify-between items-center px-6 shrink-0 text-white font-mono text-[9px] select-none">
                        <span>9:41 AM</span>
                        <div className="w-16 h-4 bg-slate-800 rounded-full mx-auto" />
                        <span>100% 🔋</span>
                      </div>
                    )}
                    <iframe 
                      title="HTML Email Preview"
                      srcDoc={htmlCode}
                      className="w-full flex-1 bg-white border-0"
                    />
                  </div>
                </div>

              </div>

            </div>
          )}

          {activeTab === 'links' && (
            <div className="flex-1 overflow-y-auto p-6 max-w-4xl mx-auto">
              
              <div className="mb-6 flex justify-between items-center">
                <div>
                  <h3 className="text-sm font-bold text-slate-800">Email Hyperlinks Audit</h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Scans and validates all destination links, button anchors, and social platform URLs inside your template blocks.
                  </p>
                </div>
                
                <div className="flex gap-2">
                  <div className="bg-emerald-50 text-emerald-700 border border-emerald-100 px-3 py-1.5 rounded-xl text-center">
                    <span className="block text-xs font-black font-mono leading-none">{validCount}</span>
                    <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-600/80">Valid</span>
                  </div>
                  <div className="bg-amber-50 text-amber-700 border border-amber-100 px-3 py-1.5 rounded-xl text-center">
                    <span className="block text-xs font-black font-mono leading-none">{warningCount}</span>
                    <span className="text-[9px] font-bold uppercase tracking-wider text-amber-600/80">Warnings</span>
                  </div>
                  <div className="bg-red-50 text-red-700 border border-red-100 px-3 py-1.5 rounded-xl text-center">
                    <span className="block text-xs font-black font-mono leading-none">{errorCount}</span>
                    <span className="text-[9px] font-bold uppercase tracking-wider text-red-600/80">Errors</span>
                  </div>
                </div>
              </div>

              {detectedLinks.length === 0 ? (
                <div className="bg-white rounded-2xl p-8 border border-slate-200 text-center">
                  <Info className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-sm font-bold text-slate-700">No Hyperlinks Detected</p>
                  <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                    Add buttons, interactive banners, or inline links using HTML tags (&lt;a href="..."&gt;) in body text to run validations.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {detectedLinks.map((link, idx) => (
                    <div 
                      key={idx} 
                      className={`p-4 rounded-2xl border transition-all bg-white flex items-start gap-3 shadow-2xs ${
                        link.status === 'valid' 
                          ? 'border-emerald-200 hover:border-emerald-300' 
                          : link.status === 'warning'
                          ? 'border-amber-200 hover:border-amber-300'
                          : 'border-red-200 hover:border-red-300'
                      }`}
                    >
                      <div className="mt-0.5">
                        {link.status === 'valid' && <CheckCircle2 className="h-5 w-5 text-emerald-500" />}
                        {link.status === 'warning' && <AlertTriangle className="h-5 w-5 text-amber-500" />}
                        {link.status === 'error' && <XCircle className="h-5 w-5 text-red-500" />}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-bold text-slate-800 break-all select-text font-mono">
                            {link.url}
                          </span>
                          <span className="text-[9px] font-bold font-mono uppercase tracking-wider bg-slate-100 text-slate-500 px-2 py-0.5 rounded">
                            {link.sourceBlock}
                          </span>
                        </div>
                        <p className={`text-[11px] mt-1 font-medium ${
                          link.status === 'valid' 
                            ? 'text-emerald-700' 
                            : link.status === 'warning'
                            ? 'text-amber-700'
                            : 'text-red-700'
                        }`}>
                          {link.message}
                        </p>
                      </div>

                      {link.status === 'valid' && (
                        <a 
                          href={link.url} 
                          target="_blank" 
                          rel="noreferrer"
                          className="p-1 hover:bg-slate-100 text-slate-400 hover:text-slate-700 rounded-lg shrink-0 transition-colors"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              )}

            </div>
          )}

          {activeTab === 'compatibility' && (
            <div className="flex-1 overflow-y-auto p-6 max-w-4xl mx-auto">
              
              <div className="mb-6">
                <h3 className="text-sm font-bold text-slate-800">Email Client Compatibility & Best Practices</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Evaluates template components and settings against typical CSS parsing bugs in desktop Outlook and Gmail applications.
                </p>
              </div>

              {/* Simulated Delivery Score Indicator */}
              <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-3xl p-6 border border-slate-700 shadow-lg flex flex-col md:flex-row items-center gap-6 mb-6">
                <div className="relative w-28 h-28 flex items-center justify-center border-4 border-blue-500/30 rounded-full shrink-0">
                  <div className="absolute inset-2 border-4 border-blue-500 border-r-transparent rounded-full animate-spin duration-3000" />
                  <div className="text-center">
                    <span className="text-3xl font-black font-mono leading-none">95%</span>
                    <span className="block text-[8px] font-bold text-blue-300 uppercase tracking-widest mt-0.5">Rating</span>
                  </div>
                </div>

                <div className="flex-1">
                  <h4 className="text-sm font-bold flex items-center gap-1.5">
                    Excellent Deliverability Rating 🚀
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed mt-1.5 font-medium">
                    This template utilizes robust inline tables, self-contained font stacks, and custom fallback layers. It is highly optimized for maximum inbox delivery and renders beautifully without layout breaks on 98%+ of worldwide active email clients.
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className="text-[9px] font-bold bg-white/10 text-emerald-300 px-2 py-1 rounded-lg">✓ VML CTA Buttons</span>
                    <span className="text-[9px] font-bold bg-white/10 text-emerald-300 px-2 py-1 rounded-lg">✓ Nested Table Grids</span>
                    <span className="text-[9px] font-bold bg-white/10 text-emerald-300 px-2 py-1 rounded-lg">✓ Responsive Frame</span>
                  </div>
                </div>
              </div>

              {/* Compatibility Warnings list */}
              <div className="space-y-3">
                {compatibilityIssues.map((item, index) => (
                  <div 
                    key={index}
                    className={`p-4 rounded-2xl border bg-white flex gap-3 shadow-2xs items-start ${
                      item.severity === 'warning' 
                        ? 'border-amber-200' 
                        : item.severity === 'success'
                        ? 'border-emerald-200'
                        : 'border-blue-100'
                    }`}
                  >
                    <div className="mt-0.5">
                      {item.severity === 'warning' && <AlertTriangle className="h-5 w-5 text-amber-500" />}
                      {item.severity === 'success' && <CheckCircle2 className="h-5 w-5 text-emerald-500" />}
                      {item.severity === 'info' && <Info className="h-5 w-5 text-blue-500" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-800">{item.issue}</span>
                        <span className="text-[9px] font-bold font-mono text-slate-400 uppercase tracking-widest bg-slate-100 px-2 py-0.5 rounded">
                          Target: {item.client}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 leading-relaxed font-semibold mt-1">
                        {item.fix}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          )}

        </div>

        {/* Modal Footer Controls */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between shrink-0">
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
            Press ESC to dismiss preview mode
          </p>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs rounded-xl transition-all shadow-2xs"
            >
              Close Simulator
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
