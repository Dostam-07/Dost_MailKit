import React, { useState, useEffect, useRef } from 'react';
import { 
  Code, 
  Eye, 
  Copy, 
  Download, 
  Database, 
  Check, 
  FileCode,
  ArrowRight,
  RefreshCw,
  Search,
  Upload
} from 'lucide-react';
import { EmailTemplate } from '../types';
import { generateMJML } from '../utils/mjmlGenerator';
import { generateHTML } from '../utils/htmlGenerator';

interface CodeViewerProps {
  template: EmailTemplate;
  onImportJSON: (imported: EmailTemplate) => void;
}

export default function CodeViewer({ template, onImportJSON }: CodeViewerProps) {
  const [activeTab, setActiveTab] = useState<'mjml' | 'html' | 'preview' | 'json'>('mjml');
  const [copied, setCopied] = useState(false);
  const [jsonImportText, setJsonImportText] = useState('');
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState(false);

  const mjmlCode = generateMJML(template);
  const htmlCode = generateHTML(template);
  const jsonCode = JSON.stringify(template, null, 2);

  // Trigger clipboard copying
  const handleCopy = () => {
    let textToCopy = '';
    if (activeTab === 'mjml') textToCopy = mjmlCode;
    else if (activeTab === 'html') textToCopy = htmlCode;
    else if (activeTab === 'json') textToCopy = jsonCode;

    if (textToCopy) {
      navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Trigger file downloads
  const handleDownload = () => {
    let content = '';
    let filename = '';
    let mimeType = 'text/plain';

    if (activeTab === 'mjml') {
      content = mjmlCode;
      filename = `${template.id || 'email-template'}.mjml`;
      mimeType = 'text/xml';
    } else if (activeTab === 'html') {
      content = htmlCode;
      filename = `${template.id || 'email-template'}.html`;
      mimeType = 'text/html';
    } else if (activeTab === 'json') {
      content = jsonCode;
      filename = `${template.id || 'email-template'}.json`;
      mimeType = 'application/json';
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Import JSON Schema
  const handleImport = () => {
    try {
      setImportError(null);
      setImportSuccess(false);
      const parsed = JSON.parse(jsonImportText);
      if (!parsed.blocks || !Array.isArray(parsed.blocks)) {
        throw new Error('Invalid schema: template must contain a "blocks" array');
      }
      onImportJSON({
        ...parsed,
        id: parsed.id || `imported-${Date.now()}`,
        name: parsed.name || '📥 Imported Schema',
      });
      setImportSuccess(true);
      setJsonImportText('');
      setTimeout(() => setImportSuccess(false), 4000);
    } catch (err: any) {
      setImportError(err.message || 'Syntax Error: Invalid JSON Format');
    }
  };

  return (
    <div id="code-viewer-panel" className="bg-slate-900 text-slate-100 rounded-2xl border border-slate-800 overflow-hidden shadow-2xl flex flex-col h-full min-h-[500px]">
      
      {/* Tab bar header */}
      <div className="flex justify-between items-center bg-slate-950 p-3 border-b border-slate-800 shrink-0 flex-wrap gap-2">
        <div className="flex items-center gap-1 bg-slate-900 rounded-lg p-0.5 border border-slate-800/80">
          <button
            id="tab-code-mjml"
            onClick={() => setActiveTab('mjml')}
            className={`flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
              activeTab === 'mjml' 
                ? 'bg-blue-600 text-white shadow' 
                : 'text-slate-400 hover:text-slate-100'
            }`}
          >
            <FileCode className="h-3.5 w-3.5" />
            MJML Markup
          </button>
          
          <button
            id="tab-code-html"
            onClick={() => setActiveTab('html')}
            className={`flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
              activeTab === 'html' 
                ? 'bg-blue-600 text-white shadow' 
                : 'text-slate-400 hover:text-slate-100'
            }`}
          >
            <Code className="h-3.5 w-3.5" />
            HTML Output
          </button>

          <button
            id="tab-code-preview"
            onClick={() => setActiveTab('preview')}
            className={`flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
              activeTab === 'preview' 
                ? 'bg-blue-600 text-white shadow' 
                : 'text-slate-400 hover:text-slate-100'
            }`}
          >
            <Eye className="h-3.5 w-3.5" />
            Live Render
          </button>

          <button
            id="tab-code-json"
            onClick={() => setActiveTab('json')}
            className={`flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
              activeTab === 'json' 
                ? 'bg-blue-600 text-white shadow' 
                : 'text-slate-400 hover:text-slate-100'
            }`}
          >
            <Database className="h-3.5 w-3.5" />
            JSON Schema
          </button>
        </div>

        {/* Action buttons (Copy / Download) */}
        {activeTab !== 'preview' && (
          <div className="flex items-center gap-2">
            <button
              id="btn-code-copy"
              onClick={handleCopy}
              className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg text-xs font-semibold border border-slate-700 transition-all active:scale-95"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  <span>Copy</span>
                </>
              )}
            </button>

            <button
              id="btn-code-download"
              onClick={handleDownload}
              className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-lg text-xs font-semibold shadow transition-all active:scale-95"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Download</span>
            </button>
          </div>
        )}
      </div>

      {/* Code viewport body */}
      <div className="flex-1 min-h-0 bg-slate-900 flex flex-col relative">
        {activeTab === 'mjml' && (
          <pre className="flex-1 overflow-auto p-4 text-[11px] leading-relaxed font-mono text-blue-300 selection:bg-blue-900 select-text">
            <code>{mjmlCode}</code>
          </pre>
        )}

        {activeTab === 'html' && (
          <pre className="flex-1 overflow-auto p-4 text-[11px] leading-relaxed font-mono text-emerald-300 selection:bg-emerald-900 select-text">
            <code>{htmlCode}</code>
          </pre>
        )}

        {activeTab === 'preview' && (
          <div className="flex-1 bg-white flex flex-col h-full relative">
            <iframe
              id="sandbox-email-iframe-preview"
              title="Compiled HTML Client Mock"
              srcDoc={htmlCode}
              sandbox="allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts"
              className="w-full h-full border-0 bg-slate-100"
            />
          </div>
        )}

        {activeTab === 'json' && (
          <div className="flex-1 flex flex-col md:flex-row h-full min-h-0 divide-y md:divide-y-0 md:divide-x divide-slate-800">
            {/* Left side: View State JSON */}
            <div className="flex-1 flex flex-col min-h-0">
              <div className="bg-slate-950 px-3 py-2 border-b border-slate-800 flex justify-between items-center text-xs text-slate-400">
                <span>Current State Schema</span>
                <span className="text-[10px] font-mono text-slate-500">Read-Only</span>
              </div>
              <pre className="flex-1 overflow-auto p-4 text-[11px] leading-relaxed font-mono text-slate-300 selection:bg-slate-800 select-text">
                <code>{jsonCode}</code>
              </pre>
            </div>

            {/* Right side: Paste / Import Custom JSON */}
            <div className="w-full md:w-80 bg-slate-950 flex flex-col shrink-0 p-4 space-y-3">
              <div>
                <h4 className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                  <Upload className="h-3.5 w-3.5 text-blue-400" />
                  Import custom values
                </h4>
                <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">
                  Paste a previously exported JSON email configuration back into the builder to restore all blocks, images, margins, and metadata.
                </p>
              </div>

              <textarea
                id="textarea-json-import"
                rows={12}
                value={jsonImportText}
                onChange={(e) => setJsonImportText(e.target.value)}
                placeholder='{ "subject": "Hi...", "blocks": [...] }'
                className="w-full flex-1 p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-[10px] font-mono text-slate-300 focus:outline-none focus:border-blue-500 resize-none"
              />

              {importError && (
                <div className="p-2 bg-red-950/50 border border-red-800/50 rounded-lg text-[10px] text-red-300">
                  ⚠️ {importError}
                </div>
              )}

              {importSuccess && (
                <div className="p-2 bg-emerald-950/50 border border-emerald-800/50 rounded-lg text-[10px] text-emerald-300">
                  🎉 Template imported successfully!
                </div>
              )}

              <button
                id="btn-trigger-json-import"
                onClick={handleImport}
                disabled={!jsonImportText.trim()}
                className="w-full py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 text-xs font-bold rounded-xl transition-all border border-slate-700/80 flex items-center justify-center gap-1.5"
              >
                Apply Imported Payload
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
