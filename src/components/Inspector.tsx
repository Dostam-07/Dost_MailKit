import React, { useState } from 'react';
import { 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  AlignJustify,
  Upload,
  Link,
  Sliders,
  Type as TypeIcon,
  Palette,
  Layout,
  Plus,
  Trash,
  BarChart3,
  Clock,
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { EmailBlock, EmailTemplate, SocialLink } from '../types';
import { calculateMetrics } from '../utils/metrics';

interface InspectorProps {
  selectedBlock: EmailBlock | null;
  onUpdateBlock: (blockId: string, updates: Partial<EmailBlock>) => void;
  template: EmailTemplate;
  onUpdateTemplate: (updates: Partial<EmailTemplate>) => void;
}

export default function Inspector({ selectedBlock, onUpdateBlock, template, onUpdateTemplate }: InspectorProps) {
  const [activeTab, setActiveTab] = useState<'content' | 'style' | 'layout'>('content');
  const [isDragging, setIsDragging] = useState(false);
  const [newVarKey, setNewVarKey] = useState('');
  const [newVarVal, setNewVarVal] = useState('');

  // AI State
  const [copyPrompt, setCopyPrompt] = useState('');
  const [copySuggestions, setCopySuggestions] = useState<string[]>([]);
  const [isGeneratingCopy, setIsGeneratingCopy] = useState(false);
  const [isRewritingText, setIsRewritingText] = useState(false);
  const [imagePrompt, setImagePrompt] = useState('');
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  const handleRewriteText = async (operation: string) => {
    if (!selectedBlock || !selectedBlock.content) return;
    setIsRewritingText(true);
    setAiError(null);

    try {
      const response = await fetch('/api/gemini/rewrite-text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: selectedBlock.content,
          operation,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to rewrite text');
      }

      if (data.text) {
        onUpdateBlock(selectedBlock.id, { content: data.text });
      }
    } catch (err: any) {
      console.error('Error rewriting text:', err);
      setAiError(err.message || 'Text rewrite failed.');
    } finally {
      setIsRewritingText(false);
    }
  };

  const handleGenerateCopy = async () => {
    if (!copyPrompt.trim() || !selectedBlock) return;
    setIsGeneratingCopy(true);
    setAiError(null);
    setCopySuggestions([]);

    try {
      const response = await fetch('/api/gemini/generate-copy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: copyPrompt,
          blockType: selectedBlock.type,
          currentText: selectedBlock.content,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate copy');
      }

      setCopySuggestions(data.suggestions || []);
    } catch (err: any) {
      console.error('Error generating copy:', err);
      setAiError(err.message || 'Copy generation failed.');
    } finally {
      setIsGeneratingCopy(false);
    }
  };

  const handleGenerateImage = async () => {
    if (!imagePrompt.trim() || !selectedBlock) return;
    setIsGeneratingImage(true);
    setAiError(null);

    try {
      const response = await fetch('/api/gemini/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: imagePrompt }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate image');
      }

      if (data.url) {
        updateProperty('src', data.url);
        // Clear prompt on success
        setImagePrompt('');
      }
    } catch (err: any) {
      console.error('Error generating image:', err);
      setAiError(err.message || 'Image generation failed.');
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const metrics = calculateMetrics(template);

  if (!selectedBlock) {
    return (
      <div className="w-80 flex flex-col gap-4 shrink-0 select-none">
        <div id="inspector-empty-state" className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col justify-center items-center p-6 text-center select-none shadow-xs">
          <Sliders className="h-10 w-10 text-slate-300 dark:text-slate-600 mb-3 animate-pulse" />
          <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">No Element Selected</h3>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1.5 max-w-[200px] leading-relaxed">
            Click on any text, button, or image section inside the canvas to edit its properties, margins, or URLs.
          </p>
        </div>

        {/* Template Fallback Variables Card */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs flex flex-col">
          <div className="flex items-center gap-2 mb-3 border-b border-slate-100 dark:border-slate-800 pb-2.5">
            <TypeIcon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <h4 className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Template Variables
            </h4>
          </div>

          <p className="text-[11px] text-slate-400 dark:text-slate-500 mb-3 leading-relaxed">
            Define default values for placeholders like <code className="bg-slate-100 dark:bg-slate-950 px-1 py-0.5 rounded font-mono font-bold text-blue-600">{"{{first_name}}"}</code> to preview real-time substitutions.
          </p>

          {/* List of active variables */}
          <div className="space-y-1.5 max-h-40 overflow-y-auto mb-3 pr-1">
            {Object.keys(template.variables || {}).length === 0 ? (
              <span className="text-[11px] text-slate-400 dark:text-slate-600 italic block text-center py-2 bg-slate-50 dark:bg-slate-950/40 rounded-lg">
                No variables defined yet.
              </span>
            ) : (
              Object.entries(template.variables || {}).map(([key, val]) => (
                <div key={key} className="flex items-center justify-between gap-1.5 bg-slate-50 dark:bg-slate-950/40 px-2.5 py-1.5 rounded-lg border border-slate-100 dark:border-slate-800/60">
                  <div className="flex flex-col min-w-0 flex-1">
                    <span className="text-[10px] font-bold font-mono text-blue-600 dark:text-blue-400 truncate">{"{{" + key + "}}"}</span>
                    <span className="text-[11px] text-slate-600 dark:text-slate-300 font-semibold truncate">{val}</span>
                  </div>
                  <button
                    id={`btn-del-var-${key}`}
                    onClick={() => {
                      const updatedVars = { ...(template.variables || {}) };
                      delete updatedVars[key];
                      onUpdateTemplate({ variables: updatedVars });
                    }}
                    className="p-1 rounded text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors cursor-pointer"
                    title="Delete Variable"
                  >
                    <Trash className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Add Variable Form */}
          <div className="border-t border-slate-100 dark:border-slate-800 pt-3 flex flex-col gap-2">
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Add Placeholder Variable</span>
            <div className="grid grid-cols-2 gap-1.5">
              <input
                id="input-new-var-key"
                type="text"
                placeholder="key (e.g. name)"
                value={newVarKey}
                onChange={(e) => setNewVarKey(e.target.value.trim().replace(/[{}]/g, ''))}
                className="text-[11px] px-2 py-1.5 border border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50 dark:bg-slate-950 focus:border-blue-500 outline-none font-mono text-slate-800 dark:text-slate-200"
              />
              <input
                id="input-new-var-val"
                type="text"
                placeholder="default value"
                value={newVarVal}
                onChange={(e) => setNewVarVal(e.target.value)}
                className="text-[11px] px-2 py-1.5 border border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50 dark:bg-slate-950 focus:border-blue-500 outline-none text-slate-800 dark:text-slate-200"
              />
            </div>
            <button
              id="btn-add-var"
              onClick={() => {
                if (!newVarKey) return;
                const updatedVars = { ...(template.variables || {}), [newVarKey]: newVarVal };
                onUpdateTemplate({ variables: updatedVars });
                setNewVarKey('');
                setNewVarVal('');
              }}
              disabled={!newVarKey}
              className="py-1.5 px-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              Add Variable
            </button>
          </div>
        </div>

        {/* Global Email Metrics Status Card */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs">
          <div className="flex items-center gap-2 mb-3.5 border-b border-slate-100 dark:border-slate-800 pb-2.5">
            <BarChart3 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <h4 className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Email Stats & Metrics
            </h4>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div className="bg-slate-50 dark:bg-slate-950/40 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800/60 animate-fade-in">
              <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 block">Total Characters</span>
              <span className="text-sm font-black font-mono text-slate-800 dark:text-slate-200 leading-none block mt-1">
                {metrics.characterCount}
              </span>
            </div>
            <div className="bg-slate-50 dark:bg-slate-950/40 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800/60 animate-fade-in">
              <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 block">Image Elements</span>
              <span className="text-sm font-black font-mono text-slate-800 dark:text-slate-200 leading-none block mt-1">
                {metrics.imageCount}
              </span>
            </div>
            <div className="bg-slate-50 dark:bg-slate-950/40 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800/60 animate-fade-in">
              <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 block">Total Words</span>
              <span className="text-sm font-black font-mono text-slate-800 dark:text-slate-200 leading-none block mt-1">
                {metrics.wordCount}
              </span>
            </div>
            <div className="bg-slate-50 dark:bg-slate-950/40 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800/60 animate-fade-in">
              <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 block">Est. Read Time</span>
              <span className="text-sm font-black font-mono text-slate-800 dark:text-slate-200 leading-none block mt-1 flex items-center gap-1">
                <Clock className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500 shrink-0" />
                {metrics.readingTimeStr}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const { id, type, content = '', style, properties = {} } = selectedBlock;

  const insertMergeTag = (tag: string, elementId: string) => {
    const el = document.getElementById(elementId) as HTMLInputElement | HTMLTextAreaElement | null;
    if (el) {
      const start = el.selectionStart || 0;
      const end = el.selectionEnd || 0;
      const text = el.value;
      const before = text.substring(0, start);
      const after = text.substring(end, text.length);
      const newContent = before + tag + after;
      
      onUpdateBlock(id, { content: newContent });
      
      // Set selection back
      setTimeout(() => {
        el.focus();
        el.setSelectionRange(start + tag.length, start + tag.length);
      }, 10);
    } else {
      onUpdateBlock(id, { content: content + tag });
    }
  };

  // Generic style updater
  const updateStyle = (key: keyof typeof style, value: any) => {
    onUpdateBlock(id, {
      style: {
        ...style,
        [key]: value,
      },
    });
  };

  // Generic property updater
  const updateProperty = (key: string, value: any) => {
    onUpdateBlock(id, {
      properties: {
        ...properties,
        [key]: value,
      },
    });
  };

  // Base64 Image upload handler for local browser testing
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      updateProperty('src', base64);
    };
    reader.readAsDataURL(file);
  };

  // Drag and drop file handlers for image files
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      updateProperty('src', base64);
    };
    reader.readAsDataURL(file);
  };

  // Social link updates
  const handleSocialLinkChange = (index: number, value: string) => {
    const currentLinks = properties.socialLinks ? [...properties.socialLinks] : [];
    if (currentLinks[index]) {
      currentLinks[index] = { ...currentLinks[index], url: value };
      updateProperty('socialLinks', currentLinks);
    }
  };

  const addSocialPlatform = (platform: SocialLink['platform']) => {
    const currentLinks = properties.socialLinks ? [...properties.socialLinks] : [];
    currentLinks.push({ platform, url: 'https://' + platform + '.com' });
    updateProperty('socialLinks', currentLinks);
  };

  const removeSocialPlatform = (index: number) => {
    const currentLinks = properties.socialLinks ? [...properties.socialLinks] : [];
    currentLinks.splice(index, 1);
    updateProperty('socialLinks', currentLinks);
  };

  const availableSocials: SocialLink['platform'][] = ['facebook', 'twitter', 'instagram', 'linkedin', 'youtube', 'website'];

  // Helper to render a fully visual, integrated color picker
  const renderColorPicker = (
    label: string,
    value: string,
    onChange: (color: string) => void,
    defaultColor: string = '#ffffff'
  ) => {
    const brandColors = template.globalSettings.brandColors || {
      primary: '#3b82f6',
      secondary: '#6366f1',
      accent: '#f43f5e',
    };

    const swatches = [
      brandColors.primary,
      brandColors.secondary,
      brandColors.accent,
      '#ef4444', // Coral Red
      '#10b981', // Emerald Green
      '#111827', // Dark Slate
      '#ffffff', // White
    ];

    return (
      <div className="space-y-1">
        <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
          {label}
        </label>
        <div className="flex flex-col gap-2 p-2 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-200/40 dark:border-slate-800/40">
          <div className="flex items-center gap-2">
            {/* Clickable color box */}
            <div className="relative shrink-0">
              <input
                type="color"
                value={value || defaultColor}
                onChange={(e) => onChange(e.target.value)}
                className="absolute inset-0 opacity-0 w-full h-full cursor-pointer z-10"
                title="Choose custom color"
              />
              <div 
                className="w-8 h-8 rounded-lg border border-slate-200/80 dark:border-slate-700 shadow-2xs cursor-pointer flex items-center justify-center transition-transform hover:scale-105"
                style={{ backgroundColor: value || defaultColor }}
              >
                <div className="w-2.5 h-2.5 rounded-full bg-white border border-slate-400/50 mix-blend-difference" />
              </div>
            </div>

            {/* Display value as a styled badge */}
            <div className="flex-1 min-w-0">
              <span className="block text-[10px] font-mono font-black text-slate-700 dark:text-slate-300 truncate uppercase tracking-wider">
                {value || 'Transparent'}
              </span>
              <span className="block text-[8px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none mt-0.5">
                Click box to open picker
              </span>
            </div>
          </div>

          {/* Quick-select color swatches */}
          <div className="flex items-center justify-between gap-1 pt-1.5 border-t border-slate-200/30 dark:border-slate-800/50">
            {swatches.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => onChange(color)}
                className={`w-5.5 h-5.5 rounded-md border shadow-3xs hover:scale-110 active:scale-95 transition-all cursor-pointer ${
                  value === color 
                    ? 'border-blue-500 ring-2 ring-blue-500/20 scale-105' 
                    : 'border-slate-200 dark:border-slate-800'
                }`}
                style={{ backgroundColor: color }}
                title={`Select ${color}`}
              />
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div id="editor-inspector" className="w-full lg:w-80 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col h-full overflow-hidden shadow-xs select-none">
      {/* Title / Header */}
      <div className="flex flex-col shrink-0 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <div className="h-14 flex items-center px-4 justify-between">
          <div className="flex items-center gap-2">
            <Sliders className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
              {type} inspector
            </h3>
          </div>
          <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
            {id.slice(0, 8)}
          </span>
        </div>
        
        {/* Tabs */}
        <div className="flex w-full border-t border-slate-100 dark:border-slate-800">
          <button 
            onClick={() => setActiveTab('content')}
            className={`flex-1 py-2 text-[10px] font-bold tracking-wider uppercase transition-colors ${activeTab === 'content' ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50 dark:bg-blue-900/10' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
          >
            Content
          </button>
          <button 
            onClick={() => setActiveTab('style')}
            className={`flex-1 py-2 text-[10px] font-bold tracking-wider uppercase transition-colors ${activeTab === 'style' ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50 dark:bg-blue-900/10' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
          >
            Style
          </button>
          <button 
            onClick={() => setActiveTab('layout')}
            className={`flex-1 py-2 text-[10px] font-bold tracking-wider uppercase transition-colors ${activeTab === 'layout' ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50 dark:bg-blue-900/10' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
          >
            Layout
          </button>
        </div>
      </div>

      {/* Panels body container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        
        {/* CONTENT TAB */}
        {activeTab === 'content' && (
          <div className="space-y-3 animate-fade-in">
            <div className="flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-800 pb-1.5">
              <TypeIcon className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400" />
              <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300">Content Properties</h4>
            </div>

          {(type === 'header' || type === 'button') && (
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Text content
                </label>
                <select
                  id="select-header-personalize"
                  onChange={(e) => {
                    if (e.target.value) {
                      insertMergeTag(e.target.value, 'input-inspector-content');
                      e.target.value = '';
                    }
                  }}
                  className="text-[10px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900 border border-blue-200 dark:border-blue-800 rounded px-1.5 py-0.5 outline-none cursor-pointer"
                  defaultValue=""
                >
                  <option value="" disabled>⚡ Personalize</option>
                  <option value="{{first_name}}">First Name</option>
                  <option value="{{last_name}}">Last Name</option>
                  <option value="{{email}}">Email Address</option>
                  <option value="{{company}}">Company Name</option>
                  <option value="{{unsubscribe_link}}">Unsubscribe Link</option>
                  <option value="{{current_year}}">Current Year</option>
                </select>
              </div>
              <input
                id="input-inspector-content"
                type="text"
                value={content}
                onChange={(e) => onUpdateBlock(id, { content: e.target.value })}
                className="w-full text-xs px-2.5 py-1.5 border border-slate-200 dark:border-slate-800 rounded-lg focus:border-blue-500 outline-none transition-all bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100"
              />
              
              {/* AI Generate Copy for Header/Button */}
              <div className="mt-3 bg-violet-50/50 dark:bg-violet-900/10 p-3 rounded-xl border border-violet-100 dark:border-violet-900/30">
                <label className="flex items-center gap-1.5 text-[10px] font-bold text-violet-600 dark:text-violet-400 uppercase tracking-wider mb-2">
                  <Sparkles className="w-3.5 h-3.5" /> AI Generate Copy
                </label>
                <div className="flex flex-col gap-2">
                  <input
                    type="text"
                    placeholder="E.g., Catchy subject for summer sale"
                    value={copyPrompt}
                    onChange={(e) => setCopyPrompt(e.target.value)}
                    className="w-full text-[11px] px-2 py-1.5 border border-violet-200 dark:border-violet-800 rounded bg-white dark:bg-slate-900 outline-none focus:border-violet-400"
                  />
                  <button
                    onClick={handleGenerateCopy}
                    disabled={isGeneratingCopy || !copyPrompt}
                    className="w-full py-1.5 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white rounded text-[10px] font-bold flex justify-center items-center gap-1"
                  >
                    {isGeneratingCopy ? <RefreshCw className="w-3 h-3 animate-spin" /> : 'Generate'}
                  </button>
                  {aiError && <p className="text-[10px] text-red-500">{aiError}</p>}
                  
                  {copySuggestions.length > 0 && (
                    <div className="mt-2 space-y-1.5 max-h-32 overflow-y-auto pr-1">
                      {copySuggestions.map((sug, idx) => (
                        <div 
                          key={idx} 
                          onClick={() => onUpdateBlock(id, { content: sug })}
                          className="text-[11px] p-2 bg-white dark:bg-slate-800 border border-violet-100 dark:border-violet-800 rounded shadow-xs cursor-pointer hover:border-violet-400 transition-colors"
                        >
                          {sug}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {(type === 'text' || type === 'footer') && (
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Rich HTML / Text
                </label>
                <select
                  id="select-text-personalize"
                  onChange={(e) => {
                    if (e.target.value) {
                      insertMergeTag(e.target.value, 'textarea-inspector-content');
                      e.target.value = '';
                    }
                  }}
                  className="text-[10px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900 border border-blue-200 dark:border-blue-800 rounded px-1.5 py-0.5 outline-none cursor-pointer"
                  defaultValue=""
                >
                  <option value="" disabled>⚡ Personalize</option>
                  <option value="{{first_name}}">First Name</option>
                  <option value="{{last_name}}">Last Name</option>
                  <option value="{{email}}">Email Address</option>
                  <option value="{{company}}">Company Name</option>
                  <option value="{{unsubscribe_link}}">Unsubscribe Link</option>
                  <option value="{{current_year}}">Current Year</option>
                </select>
              </div>
              <textarea
                id="textarea-inspector-content"
                rows={5}
                value={content}
                onChange={(e) => onUpdateBlock(id, { content: e.target.value })}
                className="w-full text-xs font-mono p-2 border border-slate-200 dark:border-slate-800 rounded-lg focus:border-blue-500 outline-none transition-all bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100"
                placeholder="Supports regular text paragraphs or HTML inline tags."
              />
              
              {/* AI Generate Copy for Text */}
              <div className="mt-3 bg-violet-50/50 dark:bg-violet-900/10 p-3 rounded-xl border border-violet-100 dark:border-violet-900/30">
                <label className="flex items-center gap-1.5 text-[10px] font-bold text-violet-600 dark:text-violet-400 uppercase tracking-wider mb-2">
                  <Sparkles className="w-3.5 h-3.5" /> AI Generate Body Text
                </label>
                <div className="flex flex-col gap-2">
                  <textarea
                    placeholder="E.g., Write a paragraph explaining our new product features"
                    value={copyPrompt}
                    rows={2}
                    onChange={(e) => setCopyPrompt(e.target.value)}
                    className="w-full text-[11px] px-2 py-1.5 border border-violet-200 dark:border-violet-800 rounded bg-white dark:bg-slate-900 outline-none focus:border-violet-400 resize-none"
                  />
                  <button
                    onClick={handleGenerateCopy}
                    disabled={isGeneratingCopy || !copyPrompt}
                    className="w-full py-1.5 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white rounded text-[10px] font-bold flex justify-center items-center gap-1"
                  >
                    {isGeneratingCopy ? <RefreshCw className="w-3 h-3 animate-spin" /> : 'Generate Text'}
                  </button>
                  {aiError && <p className="text-[10px] text-red-500">{aiError}</p>}
                  
                  {copySuggestions.length > 0 && (
                    <div className="mt-2 space-y-1.5 max-h-32 overflow-y-auto pr-1">
                      {copySuggestions.map((sug, idx) => (
                        <div 
                          key={idx} 
                          onClick={() => onUpdateBlock(id, { content: sug })}
                          className="text-[11px] p-2 bg-white dark:bg-slate-800 border border-violet-100 dark:border-violet-800 rounded shadow-xs cursor-pointer hover:border-violet-400 transition-colors text-slate-600 dark:text-slate-300"
                        >
                          <span dangerouslySetInnerHTML={{__html: sug}} />
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="mt-2 pt-2 border-t border-violet-200/50 dark:border-violet-800/50">
                    <label className="flex items-center gap-1.5 text-[9px] font-bold text-violet-500 dark:text-violet-400 uppercase tracking-wider mb-2">
                      Rewrite Current Text
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {['professional', 'friendly', 'urgent', 'shorten', 'expand'].map((op) => (
                        <button
                          key={op}
                          onClick={() => handleRewriteText(op)}
                          disabled={isRewritingText || !content}
                          className="flex-1 min-w-[30%] py-1 px-2 bg-white dark:bg-slate-800 hover:bg-violet-50 dark:hover:bg-violet-900/40 border border-violet-200 dark:border-violet-800 rounded text-[9px] font-bold text-violet-700 dark:text-violet-300 uppercase tracking-wider disabled:opacity-50 transition-colors"
                        >
                          {op}
                        </button>
                      ))}
                    </div>
                    {isRewritingText && (
                      <p className="text-[10px] text-violet-600 dark:text-violet-400 mt-2 flex items-center justify-center gap-1">
                        <RefreshCw className="w-3 h-3 animate-spin" /> Rewriting text...
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {type === 'image' && (
            <div className="space-y-3">
              <div>
                <label className="block text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                  Upload Local Image
                </label>
                <div className="flex items-center justify-center w-full">
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`flex flex-col items-center justify-center w-full h-24 border-2 border-dashed rounded-xl cursor-pointer transition-all ${
                      isDragging
                        ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/20'
                        : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900/40 hover:border-blue-400'
                    }`}
                  >
                    <label className="flex flex-col items-center justify-center w-full h-full cursor-pointer p-4">
                      <div className="flex flex-col items-center justify-center text-center">
                        <Upload className={`h-5 w-5 mb-1 transition-transform ${isDragging ? 'scale-110 text-blue-500' : 'text-slate-400 dark:text-slate-600'}`} />
                        <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400 leading-snug">
                          {isDragging ? 'Drop Image Here!' : 'Select or drag & drop image'}
                        </p>
                      </div>
                      <input
                        id="input-upload-image"
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              </div>

              {/* AI Generate Image */}
              <div className="bg-emerald-50/50 dark:bg-emerald-900/10 p-3 rounded-xl border border-emerald-100 dark:border-emerald-900/30">
                <label className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-2">
                  <Sparkles className="w-3.5 h-3.5" /> AI Generate Image
                </label>
                <div className="flex flex-col gap-2">
                  <input
                    type="text"
                    placeholder="E.g., A minimalist workspace desk..."
                    value={imagePrompt}
                    onChange={(e) => setImagePrompt(e.target.value)}
                    className="w-full text-[11px] px-2 py-1.5 border border-emerald-200 dark:border-emerald-800 rounded bg-white dark:bg-slate-900 outline-none focus:border-emerald-400"
                  />
                  <button
                    onClick={handleGenerateImage}
                    disabled={isGeneratingImage || !imagePrompt}
                    className="w-full py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded text-[10px] font-bold flex justify-center items-center gap-1"
                  >
                    {isGeneratingImage ? <RefreshCw className="w-3 h-3 animate-spin" /> : 'Generate Image'}
                  </button>
                  {aiError && <p className="text-[10px] text-red-500">{aiError}</p>}
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                  Or Paste Image URL
                </label>
                <input
                  id="input-image-src"
                  type="text"
                  value={properties.src || ''}
                  onChange={(e) => updateProperty('src', e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full text-xs px-2.5 py-1.5 border border-slate-200 dark:border-slate-800 rounded-lg focus:border-blue-500 outline-none bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                  Alternative Text (Alt)
                </label>
                <input
                  id="input-image-alt"
                  type="text"
                  value={properties.alt || ''}
                  onChange={(e) => updateProperty('alt', e.target.value)}
                  placeholder="e.g. Graphic Banner Illustration"
                  className="w-full text-xs px-2.5 py-1.5 border border-slate-200 dark:border-slate-800 rounded-lg focus:border-blue-500 outline-none bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                  Image Link (Href)
                </label>
                <div className="relative">
                  <Link className="absolute left-2.5 top-2 h-3.5 w-3.5 text-slate-400 dark:text-slate-600" />
                  <input
                    id="input-image-href"
                    type="text"
                    value={properties.href || ''}
                    onChange={(e) => updateProperty('href', e.target.value)}
                    placeholder="e.g. https://yoursite.com"
                    className="w-full text-xs pl-8 pr-2.5 py-1.5 border border-slate-200 dark:border-slate-800 rounded-lg focus:border-blue-500 outline-none bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                  Display Width
                </label>
                <select
                  id="select-image-width"
                  value={properties.width || '100%'}
                  onChange={(e) => updateProperty('width', e.target.value)}
                  className="w-full text-xs px-2.5 py-1.5 border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-900 focus:border-blue-500 outline-none text-slate-800 dark:text-slate-100"
                >
                  <option value="100%">Full width (100%)</option>
                  <option value="400px">Large (400px)</option>
                  <option value="300px">Medium (300px)</option>
                  <option value="200px">Small (200px)</option>
                  <option value="120px">Logo Size (120px)</option>
                </select>
              </div>
            </div>
          )}

          {type === 'button' && (
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                  Button Link (Href)
                </label>
                <div className="relative">
                  <Link className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400 dark:text-slate-500" />
                  <input
                    id="input-button-href"
                    type="text"
                    value={properties.href || ''}
                    onChange={(e) => updateProperty('href', e.target.value)}
                    placeholder="e.g. https://yoursite.com"
                    className="w-full text-xs pl-8 pr-2.5 py-1.5 border border-slate-200 dark:border-slate-800 rounded-lg focus:border-blue-500 outline-none bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100"
                  />
                </div>
              </div>

              {/* Sizing Presets */}
              <div>
                <label className="block text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                  Button Size Preset
                </label>
                <div className="grid grid-cols-3 gap-1 bg-slate-100 dark:bg-slate-950 p-1 border border-slate-200/20 dark:border-slate-850 rounded-xl">
                  <button
                    id="btn-size-preset-sm"
                    onClick={() => {
                      onUpdateBlock(id, {
                        style: {
                          ...style,
                          paddingTop: 6,
                          paddingBottom: 6,
                          paddingLeft: 12,
                          paddingRight: 12,
                          fontSize: '13px'
                        }
                      });
                    }}
                    className={`py-1 text-[10px] font-bold rounded-lg transition-all ${
                      style.paddingTop === 6
                        ? 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 shadow-sm border border-slate-200/40 dark:border-slate-700/40'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                  >
                    Small
                  </button>
                  <button
                    id="btn-size-preset-md"
                    onClick={() => {
                      onUpdateBlock(id, {
                        style: {
                          ...style,
                          paddingTop: 10,
                          paddingBottom: 10,
                          paddingLeft: 18,
                          paddingRight: 18,
                          fontSize: '15px'
                        }
                      });
                    }}
                    className={`py-1 text-[10px] font-bold rounded-lg transition-all ${
                      style.paddingTop === 10 || style.paddingTop === undefined
                        ? 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 shadow-sm border border-slate-200/40 dark:border-slate-700/40'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                  >
                    Medium
                  </button>
                  <button
                    id="btn-size-preset-lg"
                    onClick={() => {
                      onUpdateBlock(id, {
                        style: {
                          ...style,
                          paddingTop: 14,
                          paddingBottom: 14,
                          paddingLeft: 24,
                          paddingRight: 24,
                          fontSize: '18px'
                        }
                      });
                    }}
                    className={`py-1 text-[10px] font-bold rounded-lg transition-all ${
                      style.paddingTop === 14
                        ? 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 shadow-sm border border-slate-200/40 dark:border-slate-700/40'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                  >
                    Large
                  </button>
                </div>
              </div>

              {/* Direct Quick Colors */}
              <div className="grid grid-cols-2 gap-2">
                {renderColorPicker('Button BG', style.backgroundColor || '#3b82f6', (color) => updateStyle('backgroundColor', color), '#3b82f6')}
                {renderColorPicker('Text Color', style.color || '#ffffff', (color) => updateStyle('color', color), '#ffffff')}
              </div>
            </div>
          )}

          {type === 'section' && (
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                  Columns Layout
                </label>
                <div className="flex gap-2">
                  <button 
                    onClick={() => {
                      const cols = properties.columns || [];
                      if (cols.length < 3) {
                        const newCols = [...cols, []];
                        const newWidths = newCols.length === 2 ? [50, 50] : [33.3, 33.3, 33.3];
                        onUpdateBlock(id, {
                          properties: {
                            ...properties,
                            columns: newCols,
                            columnWidths: newWidths
                          }
                        });
                      }
                    }}
                    disabled={(properties.columns || []).length >= 3}
                    className="flex-1 py-1.5 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 font-bold rounded-lg text-xs"
                  >
                    + Add Column
                  </button>
                  <button 
                    onClick={() => {
                      const cols = properties.columns || [];
                      if (cols.length > 1) {
                        const newCols = cols.slice(0, -1);
                        const newWidths = newCols.length === 1 ? [100] : [50, 50];
                        onUpdateBlock(id, {
                          properties: {
                            ...properties,
                            columns: newCols,
                            columnWidths: newWidths
                          }
                        });
                      }
                    }}
                    disabled={(properties.columns || []).length <= 1}
                    className="flex-1 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-850 text-slate-600 dark:text-slate-300 font-bold rounded-lg text-xs"
                  >
                    - Remove Column
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                  Column Gap (px)
                </label>
                <input 
                  type="range"
                  min="0"
                  max="40"
                  step="2"
                  value={properties.columnGap !== undefined ? properties.columnGap : 10}
                  onChange={(e) => updateProperty('columnGap', parseInt(e.target.value))}
                  className="w-full accent-blue-600"
                />
              </div>

              <div className="flex items-center gap-2">
                <input 
                  type="checkbox"
                  id="section-stack-mobile"
                  checked={properties.stackOnMobile !== false}
                  onChange={(e) => updateProperty('stackOnMobile', e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="section-stack-mobile" className="text-xs text-slate-600 dark:text-slate-350 font-medium cursor-pointer">
                  Stack Columns on Mobile
                </label>
              </div>
            </div>
          )}

          {type === 'hero' && (
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                  Hero Title / Content
                </label>
                <input 
                  type="text"
                  value={content}
                  onChange={(e) => onUpdateBlock(id, { content: e.target.value })}
                  className="w-full text-xs px-2.5 py-1.5 border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:border-blue-500 outline-none"
                  placeholder="SUMMER VIBES"
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                  Background Image URL
                </label>
                <input 
                  type="text"
                  value={properties.src || ''}
                  onChange={(e) => updateProperty('src', e.target.value)}
                  className="w-full text-xs px-2.5 py-1.5 border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:border-blue-500 outline-none"
                  placeholder="https://images.unsplash.com/..."
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                    Badge Label
                  </label>
                  <input 
                    type="text"
                    value={properties.badge || ''}
                    onChange={(e) => updateProperty('badge', e.target.value)}
                    className="w-full text-xs px-2 py-1 border border-slate-200 dark:border-slate-800 rounded bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100"
                    placeholder="E.g., Special"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                    Subtitle / Price
                  </label>
                  <input 
                    type="text"
                    value={properties.price || ''}
                    onChange={(e) => updateProperty('price', e.target.value)}
                    className="w-full text-xs px-2 py-1 border border-slate-200 dark:border-slate-800 rounded bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100"
                    placeholder="E.g., From $49"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                  Destination Href Link
                </label>
                <input 
                  type="text"
                  value={properties.href || ''}
                  onChange={(e) => updateProperty('href', e.target.value)}
                  className="w-full text-xs px-2.5 py-1.5 border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:border-blue-500 outline-none"
                  placeholder="https://..."
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                  Overlay Position
                </label>
                <select 
                  value={properties.overlayPosition || 'center'}
                  onChange={(e) => updateProperty('overlayPosition', e.target.value)}
                  className="w-full text-xs px-2.5 py-1.5 border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100"
                >
                  <option value="center">Center</option>
                  <option value="bottom-left">Bottom Left</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                  Overlay Scrim Layer Color
                </label>
                <input 
                  type="text"
                  value={properties.overlayScrim || 'rgba(15, 23, 42, 0.45)'}
                  onChange={(e) => updateProperty('overlayScrim', e.target.value)}
                  className="w-full text-xs px-2.5 py-1.5 border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 font-mono"
                  placeholder="rgba(0,0,0,0.5)"
                />
              </div>
            </div>
          )}

          {type === 'productCard' && (
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                  Product Name
                </label>
                <input 
                  type="text"
                  value={content}
                  onChange={(e) => onUpdateBlock(id, { content: e.target.value })}
                  className="w-full text-xs px-2.5 py-1.5 border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:border-blue-500 outline-none"
                  placeholder="Modern Product"
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                  Product Image URL
                </label>
                <input 
                  type="text"
                  value={properties.src || ''}
                  onChange={(e) => updateProperty('src', e.target.value)}
                  className="w-full text-xs px-2.5 py-1.5 border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:border-blue-500 outline-none"
                  placeholder="https://images.unsplash.com/..."
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                    Price Tag
                  </label>
                  <input 
                    type="text"
                    value={properties.price || ''}
                    onChange={(e) => updateProperty('price', e.target.value)}
                    className="w-full text-xs px-2 py-1 border border-slate-200 dark:border-slate-800 rounded bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100"
                    placeholder="$129.99"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                    Badge Tag
                  </label>
                  <input 
                    type="text"
                    value={properties.badge || ''}
                    onChange={(e) => updateProperty('badge', e.target.value)}
                    className="w-full text-xs px-2 py-1 border border-slate-200 dark:border-slate-800 rounded bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100"
                    placeholder="Sale"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                  Purchase Link (Href)
                </label>
                <input 
                  type="text"
                  value={properties.href || ''}
                  onChange={(e) => updateProperty('href', e.target.value)}
                  className="w-full text-xs px-2.5 py-1.5 border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:border-blue-500 outline-none"
                  placeholder="https://..."
                />
              </div>
            </div>
          )}

          {type === 'imageGrid' && (
            <div className="space-y-4">
              <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">Grid Images (3 columns)</span>
              {(properties.images || []).map((img: any, i: number) => (
                <div key={i} className="p-2 border border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50 dark:bg-slate-950/40">
                  <label className="block text-[9px] font-semibold text-slate-500 mb-1 uppercase">Image {i + 1} URL</label>
                  <input 
                    type="text"
                    value={img.src}
                    onChange={(e) => {
                      const list = [...(properties.images || [])];
                      list[i] = { ...list[i], src: e.target.value };
                      updateProperty('images', list);
                    }}
                    className="w-full text-[10px] px-2 py-1 border border-slate-200 dark:border-slate-800 rounded bg-white dark:bg-slate-900 text-slate-850 dark:text-slate-100"
                    placeholder="Image url"
                  />
                </div>
              ))}
            </div>
          )}

          {type === 'quote' && (
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                  Quote Body Text
                </label>
                <textarea 
                  rows={3}
                  value={content}
                  onChange={(e) => onUpdateBlock(id, { content: e.target.value })}
                  className="w-full text-xs p-2 border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:border-blue-500 outline-none"
                  placeholder="Quote text"
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                  Author Signature Name
                </label>
                <input 
                  type="text"
                  value={properties.author || ''}
                  onChange={(e) => updateProperty('author', e.target.value)}
                  className="w-full text-xs px-2.5 py-1.5 border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:border-blue-500 outline-none"
                  placeholder="Steve Jobs"
                />
              </div>
            </div>
          )}

          {type === 'navbar' && (
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                  Brand Logo Text
                </label>
                <input 
                  type="text"
                  value={content}
                  onChange={(e) => onUpdateBlock(id, { content: e.target.value })}
                  className="w-full text-xs px-2.5 py-1.5 border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:border-blue-500 outline-none"
                />
              </div>

              <div>
                <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Navbar Nav Links</span>
                <div className="space-y-2">
                  {(properties.socialLinks || []).map((link: any, i: number) => (
                    <div key={i} className="flex gap-1 bg-slate-50 dark:bg-slate-950 p-2 border border-slate-200 dark:border-slate-800 rounded-lg">
                      <input 
                        type="text"
                        value={link.platform}
                        onChange={(e) => {
                          const links = [...(properties.socialLinks || [])];
                          links[i] = { ...links[i], platform: e.target.value };
                          updateProperty('socialLinks', links);
                        }}
                        className="w-16 text-[10px] px-1 border border-slate-200 dark:border-slate-800 rounded"
                        placeholder="Label"
                      />
                      <input 
                        type="text"
                        value={link.url}
                        onChange={(e) => {
                          const links = [...(properties.socialLinks || [])];
                          links[i] = { ...links[i], url: e.target.value };
                          updateProperty('socialLinks', links);
                        }}
                        className="flex-1 text-[10px] px-1 border border-slate-200 dark:border-slate-800 rounded"
                        placeholder="Link URL"
                      />
                      <button 
                        onClick={() => {
                          const links = (properties.socialLinks || []).filter((_: any, idx: number) => idx !== i);
                          updateProperty('socialLinks', links);
                        }}
                        className="text-red-500 text-xs px-1"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  <button 
                    onClick={() => {
                      const links = [...(properties.socialLinks || []), { platform: 'Link', url: '#' }];
                      updateProperty('socialLinks', links);
                    }}
                    className="w-full py-1 text-[10px] font-bold border border-dashed border-blue-400 text-blue-500 hover:bg-blue-50/50 rounded"
                  >
                    + Add Link
                  </button>
                </div>
              </div>
            </div>
          )}

          {type === 'htmlEmbed' && (
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                  Raw Custom HTML Code
                </label>
                <textarea 
                  rows={8}
                  value={content}
                  onChange={(e) => onUpdateBlock(id, { content: e.target.value })}
                  className="w-full text-[10px] font-mono p-2 border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100 focus:border-blue-500 outline-none"
                  placeholder="<div style='color: red;'>Hello World</div>"
                />
              </div>
            </div>
          )}

          {type === 'countdown' && (
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                  Target Date / Time
                </label>
                <input 
                  type="text"
                  value={properties.countdownDate || 'December 31, 2026'}
                  onChange={(e) => updateProperty('countdownDate', e.target.value)}
                  className="w-full text-xs px-2.5 py-1.5 border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:border-blue-500 outline-none"
                  placeholder="e.g. December 31, 2026"
                />
              </div>
            </div>
          )}

          {type === 'divider' && (
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-[10px] text-slate-500 font-semibold uppercase tracking-wider mb-1">
                  <span>Divider Spacing</span>
                  <span>{((style.paddingTop !== undefined ? style.paddingTop : 15) * 2)}px</span>
                </div>
                <input
                  id="input-divider-spacing-slider"
                  type="range"
                  min="4"
                  max="60"
                  step="2"
                  value={style.paddingTop !== undefined ? style.paddingTop : 15}
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    onUpdateBlock(id, {
                      style: {
                        ...style,
                        paddingTop: val,
                        paddingBottom: val,
                      }
                    });
                  }}
                  className="w-full accent-blue-600 animate-none"
                />
              </div>

              <div>
                {renderColorPicker('Line Color', style.borderColor || '#e2e8f0', (color) => updateStyle('borderColor', color), '#e2e8f0')}
              </div>

              <div>
                <div className="flex justify-between text-[10px] text-slate-500 font-semibold uppercase tracking-wider mb-1">
                  <span>Line Weight</span>
                  <span>{style.borderWidth !== undefined ? style.borderWidth : 1}px</span>
                </div>
                <input
                  id="input-divider-weight-slider"
                  type="range"
                  min="1"
                  max="10"
                  step="1"
                  value={style.borderWidth !== undefined ? style.borderWidth : 1}
                  onChange={(e) => updateStyle('borderWidth', parseInt(e.target.value))}
                  className="w-full accent-blue-600 animate-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                  Line Style
                </label>
                <select
                  id="select-divider-style-select"
                  value={style.borderStyle || 'solid'}
                  onChange={(e) => updateStyle('borderStyle', e.target.value)}
                  className="w-full text-xs px-2.5 py-1.5 border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-950 focus:border-blue-500 outline-none text-slate-800 dark:text-slate-200 font-medium"
                >
                  <option value="solid">Solid continuous</option>
                  <option value="dashed">Dashed segmented</option>
                  <option value="dotted">Dotted nodes</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                  Line Width (Size)
                </label>
                <select
                  id="select-divider-width-select"
                  value={style.width || '100%'}
                  onChange={(e) => updateStyle('width', e.target.value)}
                  className="w-full text-xs px-2.5 py-1.5 border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-950 focus:border-blue-500 outline-none text-slate-800 dark:text-slate-200 font-medium"
                >
                  <option value="100%">Full Width (100%)</option>
                  <option value="80%">Wide (80%)</option>
                  <option value="50%">Half Width (50%)</option>
                  <option value="30%">Medium (30%)</option>
                  <option value="15%">Narrow (15%)</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                  Line Alignment
                </label>
                <div className="grid grid-cols-3 gap-1 bg-slate-100 dark:bg-slate-900 p-0.5 rounded-lg border border-slate-200/50 dark:border-slate-800">
                  {(['left', 'center', 'right'] as const).map((align) => (
                    <button
                      key={align}
                      onClick={() => updateStyle('textAlign', align)}
                      className={`py-1 text-[10px] font-bold rounded-md capitalize cursor-pointer transition-all ${
                        (style.textAlign || 'center') === align
                          ? 'bg-white dark:bg-slate-850 text-blue-600 dark:text-blue-400 shadow-xs'
                          : 'text-slate-400 dark:text-slate-500 hover:text-slate-650 dark:hover:text-slate-350'
                      }`}
                    >
                      {align}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {type === 'spacer' && (
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                  Spacer Height
                </label>
                <span className="text-xs font-mono text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                  {properties.height || 30}px
                </span>
              </div>
              <input
                id="input-spacer-height"
                type="range"
                min="10"
                max="120"
                step="5"
                value={properties.height || 30}
                onChange={(e) => updateProperty('height', parseInt(e.target.value))}
                className="w-full accent-blue-600"
              />
            </div>
          )}

          {type === 'social' && (
            <div className="space-y-3">
              <label className="block text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                Configured Networks
              </label>
              
              <div className="space-y-2.5">
                {(properties.socialLinks || []).map((link: any, index: number) => (
                  <div key={index} className="flex gap-1.5 items-center bg-slate-50 dark:bg-slate-950 p-2 rounded-lg border border-slate-200/50 dark:border-slate-800">
                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase w-14 truncate">
                      {link.platform}
                    </span>
                    <input
                      id={`input-social-url-${index}`}
                      type="text"
                      value={link.url}
                      onChange={(e) => handleSocialLinkChange(index, e.target.value)}
                      className="w-full text-[10px] px-2 py-1 border border-slate-200 dark:border-slate-800 rounded bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200"
                    />
                    <button
                      id={`btn-remove-social-${index}`}
                      onClick={() => removeSocialPlatform(index)}
                      className="text-slate-400 dark:text-slate-500 hover:text-red-500 p-0.5"
                    >
                      <Trash className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Add Platform dropdown selector */}
              { (properties.socialLinks || []).length < availableSocials.length && (
                <div className="pt-2">
                  <span className="block text-[9px] font-semibold text-slate-400 dark:text-slate-500 mb-1">ADD MORE NETWORKS:</span>
                  <div className="flex flex-wrap gap-1">
                    {availableSocials
                      .filter(platform => !(properties.socialLinks || []).some((l: any) => l.platform === platform))
                      .map(platform => (
                        <button
                          id={`btn-add-social-${platform}`}
                          key={platform}
                          onClick={() => addSocialPlatform(platform)}
                          className="text-[9px] font-semibold bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900 px-2 py-1 rounded transition-colors uppercase"
                        >
                          + {platform}
                        </button>
                      ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        )}
        
        {/* STYLE TAB */}
        {activeTab === 'style' && (
          <div className="space-y-4 animate-fade-in">

        {/* SECTION 2: Formatting Typographies (Omitted for dividers and spacers) */}
        {type !== 'divider' && type !== 'spacer' && (
          <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-800 pb-1.5">
              <Palette className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400" />
              <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300">Typography & Color</h4>
            </div>

            {/* Font Size & Weight (If applicable to texts/headers/buttons) */}
            {(type === 'header' || type === 'text' || type === 'button' || type === 'footer') && (
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                    Font Size
                  </label>
                  <select
                    id="select-font-size"
                    value={style.fontSize || ''}
                    onChange={(e) => updateStyle('fontSize', e.target.value)}
                    className="w-full text-xs px-2 py-1.5 border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-950 outline-none text-slate-800 dark:text-slate-200"
                  >
                    <option value="">Default</option>
                    <option value="11px">11px (Tiny)</option>
                    <option value="12px">12px (Small)</option>
                    <option value="14px">14px (Body Small)</option>
                    <option value="16px">16px (Body Regular)</option>
                    <option value="18px">18px (Large)</option>
                    <option value="20px">20px (Heading 3)</option>
                    <option value="24px">24px (Heading 2)</option>
                    <option value="28px">28px (Heading 1)</option>
                    <option value="32px">32px (Hero Big)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                    Font Weight
                  </label>
                  <select
                    id="select-font-weight"
                    value={style.fontWeight || ''}
                    onChange={(e) => updateStyle('fontWeight', e.target.value)}
                    className="w-full text-xs px-2 py-1.5 border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-950 outline-none text-slate-800 dark:text-slate-200"
                  >
                    <option value="">Default</option>
                    <option value="normal">Regular (400)</option>
                    <option value="500">Medium (500)</option>
                    <option value="600">Semi Bold (600)</option>
                    <option value="700">Bold (700)</option>
                    <option value="800">Heavy (800)</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                    Letter Spacing
                  </label>
                  <select
                    id="select-letter-spacing"
                    value={style.letterSpacing || ''}
                    onChange={(e) => updateStyle('letterSpacing', e.target.value)}
                    className="w-full text-xs px-2 py-1.5 border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-950 outline-none text-slate-800 dark:text-slate-200"
                  >
                    <option value="">Default</option>
                    <option value="-0.05em">Tighter</option>
                    <option value="-0.02em">Tight</option>
                    <option value="0.05em">Wide</option>
                    <option value="0.1em">Wider</option>
                    <option value="0.2em">Widest</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                    Text Transform
                  </label>
                  <select
                    id="select-text-transform"
                    value={style.textTransform || ''}
                    onChange={(e) => updateStyle('textTransform', e.target.value)}
                    className="w-full text-xs px-2 py-1.5 border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-950 outline-none text-slate-800 dark:text-slate-200"
                  >
                    <option value="">Default</option>
                    <option value="uppercase">UPPERCASE</option>
                    <option value="lowercase">lowercase</option>
                    <option value="capitalize">Capitalize</option>
                  </select>
                </div>
              </div>
            )}

            {/* Colors */}
            <div className="grid grid-cols-2 gap-2.5">
              {(type === 'header' || type === 'text' || type === 'button' || type === 'footer' || type === 'productCard' || type === 'hero' || type === 'quote') ? (
                renderColorPicker('Text Color', style.color || (type === 'hero' ? '#ffffff' : '#111827'), (color) => updateStyle('color', color), type === 'hero' ? '#ffffff' : '#111827')
              ) : (
                <div />
              )}
              {renderColorPicker('Block BG', style.backgroundColor || '#ffffff', (color) => {
                updateStyle('backgroundColor', color);
                updateStyle('background', { type: 'solid', value: color });
              }, '#ffffff')}
            </div>
            
            {/* Advanced Background (Gradients) */}
            <div className="pt-2">
              <label className="block text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                Background Type
              </label>
              <div className="flex bg-slate-100 dark:bg-slate-950 p-0.5 border border-slate-200/50 dark:border-slate-800 rounded-lg mb-2">
                <button
                  onClick={() => updateStyle('background', { type: 'solid', value: style.backgroundColor || '#ffffff' })}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${
                    !style.background || style.background.type === 'solid'
                      ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-xs'
                      : 'text-slate-500 dark:text-slate-400'
                  }`}
                >
                  Solid
                </button>
                <button
                  onClick={() => updateStyle('background', { type: 'gradient', value: 'linear-gradient(90deg, #ff7e5f 0%, #feb47b 100%)' })}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${
                    style.background?.type === 'gradient'
                      ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-xs'
                      : 'text-slate-500 dark:text-slate-400'
                  }`}
                >
                  Gradient
                </button>
              </div>
              
              {style.background?.type === 'gradient' && (
                <div>
                  <input
                    type="text"
                    value={style.background.value}
                    onChange={(e) => updateStyle('background', { type: 'gradient', value: e.target.value })}
                    className="w-full text-xs font-mono px-2 py-1.5 border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-950 outline-none text-slate-800 dark:text-slate-200"
                    placeholder="linear-gradient(...)"
                  />
                  <div className="mt-2 h-8 rounded-md border border-slate-200 dark:border-slate-700 w-full" style={{ background: style.background.value }}></div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* SECTION: Universal Alignment Control */}
        <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-850">
          <div className="flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-850 pb-1.5">
            <AlignLeft className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400" />
            <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300">Layout Alignment</h4>
          </div>
          <div>
            <div className="flex bg-slate-100 dark:bg-slate-950 p-0.5 border border-slate-200/50 dark:border-slate-800 rounded-lg">
              <button
                id="btn-align-left-global"
                onClick={() => updateStyle('textAlign', 'left')}
                className={`flex-1 py-1.5 flex justify-center rounded-md cursor-pointer transition-all ${
                  style.textAlign === 'left' || !style.textAlign
                    ? 'bg-white dark:bg-slate-850 text-blue-600 dark:text-blue-400 shadow-xs border border-slate-200/10'
                    : 'text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
                title="Align Left"
              >
                <AlignLeft className="h-4 w-4" />
              </button>
              <button
                id="btn-align-center-global"
                onClick={() => updateStyle('textAlign', 'center')}
                className={`flex-1 py-1.5 flex justify-center rounded-md cursor-pointer transition-all ${
                  style.textAlign === 'center'
                    ? 'bg-white dark:bg-slate-850 text-blue-600 dark:text-blue-400 shadow-xs border border-slate-200/10'
                    : 'text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
                title="Align Center"
              >
                <AlignCenter className="h-4 w-4" />
              </button>
              <button
                id="btn-align-right-global"
                onClick={() => updateStyle('textAlign', 'right')}
                className={`flex-1 py-1.5 flex justify-center rounded-md cursor-pointer transition-all ${
                  style.textAlign === 'right'
                    ? 'bg-white dark:bg-slate-850 text-blue-600 dark:text-blue-400 shadow-xs border border-slate-200/10'
                    : 'text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
                title="Align Right"
              >
                <AlignRight className="h-4 w-4" />
              </button>
              <button
                id="btn-align-justify-global"
                onClick={() => updateStyle('textAlign', 'justify')}
                className={`flex-1 py-1.5 flex justify-center rounded-md cursor-pointer transition-all ${
                  style.textAlign === 'justify'
                    ? 'bg-white dark:bg-slate-850 text-blue-600 dark:text-blue-400 shadow-xs border border-slate-200/10'
                    : 'text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
                title="Justify Text / Stretch"
              >
                <AlignJustify className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* FIGMA ABSOLUTE SECTION: Position & Constraints */}
        {template.globalSettings.layoutMode === 'figma' && (
          <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-1.5">
              <div className="flex items-center gap-1.5">
                <Sliders className="h-3.5 w-3.5 text-blue-500" />
                <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300">📐 Figma Position & Sizing</h4>
              </div>
              <span className="text-[9px] font-bold uppercase tracking-wider bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 px-1.5 py-0.5 rounded font-mono">
                ABSOLUTE
              </span>
            </div>

            <div className="space-y-3">
              {/* Position Mode Toggle */}
              <div>
                <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                  Position Mode
                </label>
                <div className="grid grid-cols-2 gap-1 bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border border-slate-200/40 dark:border-slate-800">
                  <button
                    id="position-relative"
                    onClick={() => updateStyle('position', 'relative')}
                    className={`py-1.5 text-[10px] font-bold rounded-lg transition-all cursor-pointer ${
                      style.position !== 'absolute'
                        ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-xs'
                        : 'text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                    }`}
                  >
                    Relative Stack
                  </button>
                  <button
                    id="position-absolute"
                    onClick={() => {
                      updateStyle('position', 'absolute');
                      if (style.left === undefined) updateStyle('left', 20);
                      if (style.top === undefined) updateStyle('top', 50);
                      if (style.width === undefined) updateStyle('width', '250px');
                    }}
                    className={`py-1.5 text-[10px] font-bold rounded-lg transition-all cursor-pointer ${
                      style.position === 'absolute'
                        ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-xs'
                        : 'text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                    }`}
                  >
                    Absolute Canvas
                  </button>
                </div>
              </div>

              {style.position === 'absolute' && (
                <>
                  {/* Coordinates X and Y */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">
                        X Position (Left)
                      </label>
                      <div className="flex items-center gap-1">
                        <input
                          id="figma-pos-left"
                          type="number"
                          value={style.left !== undefined ? style.left : 0}
                          onChange={(e) => updateStyle('left', parseInt(e.target.value) || 0)}
                          className="w-full text-xs px-2 py-1.5 border border-slate-200 dark:border-slate-850 rounded-lg bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100 outline-none focus:border-blue-500 font-mono"
                        />
                        <span className="text-[10px] text-slate-400 font-bold">px</span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">
                        Y Position (Top)
                      </label>
                      <div className="flex items-center gap-1">
                        <input
                          id="figma-pos-top"
                          type="number"
                          value={style.top !== undefined ? style.top : 0}
                          onChange={(e) => updateStyle('top', parseInt(e.target.value) || 0)}
                          className="w-full text-xs px-2 py-1.5 border border-slate-200 dark:border-slate-850 rounded-lg bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100 outline-none focus:border-blue-500 font-mono"
                        />
                        <span className="text-[10px] text-slate-400 font-bold">px</span>
                      </div>
                    </div>
                  </div>

                  {/* Width and Height */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">
                        Width (e.g. 200px)
                      </label>
                      <input
                        id="figma-size-width"
                        type="text"
                        value={style.width !== undefined ? style.width : '250px'}
                        onChange={(e) => updateStyle('width', e.target.value)}
                        className="w-full text-xs px-2 py-1.5 border border-slate-200 dark:border-slate-850 rounded-lg bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100 outline-none focus:border-blue-500 font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">
                        Height (e.g. auto)
                      </label>
                      <input
                        id="figma-size-height"
                        type="text"
                        value={style.height !== undefined ? style.height : 'auto'}
                        onChange={(e) => updateStyle('height', e.target.value)}
                        className="w-full text-xs px-2 py-1.5 border border-slate-200 dark:border-slate-850 rounded-lg bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100 outline-none focus:border-blue-500 font-mono"
                      />
                    </div>
                  </div>

                  {/* Z-Index (Layer ordering) */}
                  <div className="grid grid-cols-1 gap-2">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">
                        Layer Depth (z-index / Ordering)
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          id="figma-z-index"
                          type="range"
                          min="0"
                          max="100"
                          step="1"
                          value={style.zIndex !== undefined ? style.zIndex : 1}
                          onChange={(e) => updateStyle('zIndex', parseInt(e.target.value) || 1)}
                          className="flex-1 accent-blue-600"
                        />
                        <span className="text-xs font-mono font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                          {style.zIndex !== undefined ? style.zIndex : 1}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Sizing Constraints */}
                  <div className="space-y-2">
                    <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Figma Frame Constraints
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <span className="text-[9px] text-slate-400 dark:text-slate-500 font-semibold block mb-1">Horizontal</span>
                        <select
                          id="figma-constraint-h"
                          value={style.constraints?.horizontal || 'left'}
                          onChange={(e) => updateStyle('constraints', {
                            ...(style.constraints || {}),
                            horizontal: e.target.value as any
                          })}
                          className="w-full text-[11px] px-2 py-1 border border-slate-200 dark:border-slate-850 rounded bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100 outline-none focus:border-blue-500"
                        >
                          <option value="left">Left</option>
                          <option value="right">Right</option>
                          <option value="center">Center</option>
                          <option value="stretch">Stretch (Fill)</option>
                        </select>
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-400 dark:text-slate-500 font-semibold block mb-1">Vertical</span>
                        <select
                          id="figma-constraint-v"
                          value={style.constraints?.vertical || 'top'}
                          onChange={(e) => updateStyle('constraints', {
                            ...(style.constraints || {}),
                            vertical: e.target.value as any
                          })}
                          className="w-full text-[11px] px-2 py-1 border border-slate-200 dark:border-slate-850 rounded bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100 outline-none focus:border-blue-500"
                        >
                          <option value="top">Top</option>
                          <option value="bottom">Bottom</option>
                          <option value="center">Center</option>
                          <option value="stretch">Stretch (Fill)</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    )}

        {/* LAYOUT TAB */}
        {activeTab === 'layout' && (
          <div className="space-y-4 animate-fade-in">

        {/* SECTION 3: Spacing & Geometry */}
        <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-800 pb-1.5">
            <Layout className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400" />
            <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300">Paddings & Spacing</h4>
          </div>

          <div className="space-y-2">
            <div>
              <div className="flex justify-between text-[10px] text-slate-500 font-semibold uppercase tracking-wider mb-0.5">
                <span>Padding Top</span>
                <span>{style.paddingTop !== undefined ? style.paddingTop : 10}px</span>
              </div>
              <input
                id="input-padding-top"
                type="range"
                min="0"
                max="80"
                step="2"
                value={style.paddingTop !== undefined ? style.paddingTop : 10}
                onChange={(e) => updateStyle('paddingTop', parseInt(e.target.value))}
                className="w-full accent-blue-600"
              />
            </div>

            <div>
              <div className="flex justify-between text-[10px] text-slate-500 font-semibold uppercase tracking-wider mb-0.5">
                <span>Padding Bottom</span>
                <span>{style.paddingBottom !== undefined ? style.paddingBottom : 10}px</span>
              </div>
              <input
                id="input-padding-bottom"
                type="range"
                min="0"
                max="80"
                step="2"
                value={style.paddingBottom !== undefined ? style.paddingBottom : 10}
                onChange={(e) => updateStyle('paddingBottom', parseInt(e.target.value))}
                className="w-full accent-blue-600"
              />
            </div>

            <div>
              <div className="flex justify-between text-[10px] text-slate-500 font-semibold uppercase tracking-wider mb-0.5">
                <span>Padding Left</span>
                <span>{style.paddingLeft !== undefined ? style.paddingLeft : 20}px</span>
              </div>
              <input
                id="input-padding-left"
                type="range"
                min="0"
                max="80"
                step="2"
                value={style.paddingLeft !== undefined ? style.paddingLeft : 20}
                onChange={(e) => updateStyle('paddingLeft', parseInt(e.target.value))}
                className="w-full accent-blue-600"
              />
            </div>

            <div>
              <div className="flex justify-between text-[10px] text-slate-500 font-semibold uppercase tracking-wider mb-0.5">
                <span>Padding Right</span>
                <span>{style.paddingRight !== undefined ? style.paddingRight : 20}px</span>
              </div>
              <input
                id="input-padding-right"
                type="range"
                min="0"
                max="80"
                step="2"
                value={style.paddingRight !== undefined ? style.paddingRight : 20}
                onChange={(e) => updateStyle('paddingRight', parseInt(e.target.value))}
                className="w-full accent-blue-600"
              />
            </div>
          </div>
        </div>

        {/* SECTION 4: Borders & Rounding (Available for ALL Blocks) */}
        <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-800 pb-1.5">
            <Sliders className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400" />
            <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300">Border styling</h4>
          </div>

          <div>
            <div className="flex justify-between text-[10px] text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider mb-0.5">
              <span>Border Corner Radius</span>
              <span>{style.borderRadius !== undefined ? style.borderRadius : 0}px</span>
            </div>
            <input
              id="input-border-radius"
              type="range"
              min="0"
              max="40"
              step="1"
              value={style.borderRadius !== undefined ? style.borderRadius : 0}
              onChange={(e) => updateStyle('borderRadius', parseInt(e.target.value))}
              className="w-full accent-blue-600 cursor-pointer"
            />
          </div>

          {type === 'divider' && (
            <div className="space-y-3 pt-2">
              <div>
                <div className="flex justify-between text-[10px] text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider mb-0.5">
                  <span>Line Weight (Border Width)</span>
                  <span>{style.borderWidth !== undefined ? style.borderWidth : 1}px</span>
                </div>
                <input
                  id="input-border-width"
                  type="range"
                  min="1"
                  max="10"
                  step="1"
                  value={style.borderWidth !== undefined ? style.borderWidth : 1}
                  onChange={(e) => updateStyle('borderWidth', parseInt(e.target.value))}
                  className="w-full accent-blue-600 cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                  Line Style
                </label>
                <select
                  id="select-border-style"
                  value={style.borderStyle || 'solid'}
                  onChange={(e) => updateStyle('borderStyle', e.target.value)}
                  className="w-full text-xs px-2.5 py-1.5 border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-950 focus:border-blue-500 outline-none text-slate-800 dark:text-slate-250 cursor-pointer"
                >
                  <option value="solid">Solid continuous</option>
                  <option value="dashed">Dashed segmented</option>
                  <option value="dotted">Dotted nodes</option>
                </select>
              </div>

              <div>
                {renderColorPicker('Line Color', style.borderColor || '#e2e8f0', (color) => updateStyle('borderColor', color), '#e2e8f0')}
              </div>
            </div>
          )}
        </div>
        </div>
        )}
      </div>
    </div>
  );
}
