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
  RefreshCw,
  Eye,
  Image as ImageIcon
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
        <div id="inspector-empty-state" className="rounded-xl border border-ink-2 bg-ink-2/10 flex flex-col justify-center items-center p-6 text-center select-none shadow-sm">
          <div className="p-3 bg-gold/10 rounded-full mb-3">
            <Sliders className="h-8 w-8 text-gold" />
          </div>
          <h3 className="text-sm font-serif font-bold text-text-on-ink">No Element Selected</h3>
          <p className="text-[11px] text-text-on-ink-muted mt-1.5 max-w-[200px] leading-relaxed">
            Click on any text, button, or image section inside the canvas to edit its properties, margins, or URLs.
          </p>
        </div>

        {/* Template Fallback Variables Card */}
        <div className="rounded-xl border border-ink-2 bg-ink-2/15 p-5 flex flex-col shadow-sm">
          <div className="flex items-center gap-2 mb-3 border-b border-ink-2/40 pb-2.5">
            <TypeIcon className="h-4 w-4 text-gold" />
            <h4 className="text-[11px] font-mono font-black text-gold uppercase tracking-widest">
              Template Variables
            </h4>
          </div>

          <p className="text-[11px] text-text-on-ink-muted mb-3 leading-relaxed">
            Define default values for placeholders like <code className="bg-ink px-1.5 py-0.5 rounded font-mono font-bold text-gold">{"{{first_name}}"}</code> to preview real-time substitutions.
          </p>

          {/* List of active variables */}
          <div className="space-y-1.5 max-h-40 overflow-y-auto mb-3 pr-1 custom-scrollbar">
            {Object.keys(template.variables || {}).length === 0 ? (
              <span className="text-[11px] text-text-on-ink-muted/70 italic block text-center py-4 bg-ink/40 rounded-lg border border-ink-2/20">
                No variables defined yet.
              </span>
            ) : (
              Object.entries(template.variables || {}).map(([key, val]) => (
                <div key={key} className="flex items-center justify-between gap-1.5 bg-ink px-3 py-2 rounded-lg border border-ink-2/60 shadow-xs">
                  <div className="flex flex-col min-w-0 flex-1">
                    <span className="text-[10px] font-mono font-bold text-gold truncate tracking-wider">{"{{" + key + "}}"}</span>
                    <span className="text-[11px] text-text-on-ink font-bold truncate mt-0.5">{val}</span>
                  </div>
                  <button
                    id={`btn-del-var-${key}`}
                    onClick={() => {
                      const updatedVars = { ...(template.variables || {}) };
                      delete updatedVars[key];
                      onUpdateTemplate({ variables: updatedVars });
                    }}
                    className="p-1.5 rounded-md text-text-on-ink-muted hover:text-rose-400 hover:bg-rose-500/10 transition-all cursor-pointer"
                    title="Delete Variable"
                  >
                    <Trash className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Add Variable Form */}
          <div className="border-t border-ink-2/40 pt-4 flex flex-col gap-2.5">
            <span className="text-[10px] font-mono font-bold text-text-on-ink-muted uppercase tracking-widest">Add Placeholder Variable</span>
            <div className="grid grid-cols-2 gap-2">
              <input
                id="input-new-var-key"
                type="text"
                placeholder="Key"
                value={newVarKey}
                onChange={(e) => setNewVarKey(e.target.value.trim().replace(/[{}]/g, ''))}
                className="text-[11px] px-3 py-2 border border-ink-2/80 rounded-lg bg-ink focus:border-gold outline-none font-mono text-text-on-ink placeholder:text-text-on-ink-muted/40"
              />
              <input
                id="input-new-var-val"
                type="text"
                placeholder="Value"
                value={newVarVal}
                onChange={(e) => setNewVarVal(e.target.value)}
                className="text-[11px] px-3 py-2 border border-ink-2/80 rounded-lg bg-ink focus:border-gold outline-none text-text-on-ink placeholder:text-text-on-ink-muted/40"
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
              className="py-2 px-3 bg-gold hover:bg-gold/90 disabled:opacity-35 text-ink rounded-lg font-mono font-bold text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
            >
              <Plus className="h-3.5 w-3.5" />
              Add Variable
            </button>
          </div>
        </div>

        {/* Global Email Metrics Status Card */}
        <div className="rounded-xl border border-ink-2 bg-ink-2/15 p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4 border-b border-ink-2/40 pb-2.5">
            <BarChart3 className="h-4 w-4 text-gold" />
            <h4 className="text-[11px] font-mono font-black text-gold uppercase tracking-widest">
              Email Health Metrics
            </h4>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-ink/60 p-3 rounded-lg border border-ink-2/50">
              <span className="text-[9px] font-mono font-bold text-text-on-ink-muted uppercase block tracking-wider">Characters</span>
              <span className="text-sm font-bold font-mono text-text-on-ink leading-none block mt-1.5">
                {metrics.characterCount}
              </span>
            </div>
            <div className="bg-ink/60 p-3 rounded-lg border border-ink-2/50">
              <span className="text-[9px] font-mono font-bold text-text-on-ink-muted uppercase block tracking-wider">Images</span>
              <span className="text-sm font-bold font-mono text-text-on-ink leading-none block mt-1.5">
                {metrics.imageCount}
              </span>
            </div>
            <div className="bg-ink/60 p-3 rounded-lg border border-ink-2/50">
              <span className="text-[9px] font-mono font-bold text-text-on-ink-muted uppercase block tracking-wider">Words</span>
              <span className="text-sm font-bold font-mono text-text-on-ink leading-none block mt-1.5">
                {metrics.wordCount}
              </span>
            </div>
            <div className="bg-ink/60 p-3 rounded-lg border border-ink-2/50">
              <span className="text-[9px] font-mono font-bold text-text-on-ink-muted uppercase block tracking-wider">Read Time</span>
              <span className="text-sm font-bold font-mono text-text-on-ink leading-none block mt-1.5 flex items-center gap-1.5">
                <Clock className="h-3 w-3 text-text-on-ink-muted shrink-0" />
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
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, index?: number, arrayKey?: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      if (index !== undefined && arrayKey) {
        const arr = [...(properties[arrayKey] || [])];
        if (arr[index]) {
          arr[index] = { ...arr[index], src: base64 };
          updateProperty(arrayKey, arr);
        }
      } else {
        updateProperty('src', base64);
        if (type === 'icon') updateProperty('svg', '');
      }
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

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, index?: number, arrayKey?: string) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      if (index !== undefined && arrayKey) {
        const arr = [...(properties[arrayKey] || [])];
        if (arr[index]) {
          arr[index] = { ...arr[index], src: base64 };
          updateProperty(arrayKey, arr);
        }
      } else {
        updateProperty('src', base64);
        if (type === 'icon') updateProperty('svg', '');
      }
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
      template.globalSettings.brandColors?.primary || '#D9A441',
      '#16233B', // Ink
      '#B8452F', // Seal
      '#F1E9D8', // Paper
      '#ffffff', // White
    ];

    return (
      <div className="space-y-1">
        <label className="block text-[10px] font-mono font-bold text-text-on-ink-muted uppercase tracking-wider mb-1">
          {label}
        </label>
        <div className="flex flex-col gap-2 p-2 bg-ink border border-ink-2 rounded">
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
                className="w-8 h-8 rounded border border-ink-2 shadow-2xs cursor-pointer flex items-center justify-center transition-transform hover:scale-105"
                style={{ backgroundColor: value || defaultColor }}
              >
                <div className="w-2.5 h-2.5 rounded-full bg-white border border-slate-400/50 mix-blend-difference" />
              </div>
            </div>

            {/* Display value as a styled badge */}
            <div className="flex-1 min-w-0">
              <span className="block text-[10px] font-mono font-bold text-gold truncate uppercase tracking-wider">
                {value || 'Transparent'}
              </span>
              <span className="block text-[8px] font-mono text-text-on-ink-muted uppercase tracking-widest leading-none mt-0.5">
                Click box to open picker
              </span>
            </div>
          </div>

          {/* Quick-select color swatches */}
          <div className="flex items-center justify-between gap-1 pt-1.5 border-t border-ink-2/30">
            {swatches.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => onChange(color)}
                className={`w-5.5 h-5.5 rounded border shadow-3xs hover:scale-110 active:scale-95 transition-all cursor-pointer ${
                  value === color 
                    ? 'border-gold ring-2 ring-gold/15 scale-105' 
                    : 'border-ink-2'
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
    <div id="editor-inspector" className="w-full lg:w-80 rounded border border-ink-2 bg-ink flex flex-col h-full overflow-hidden select-none">
      {/* Title / Header */}
      <div className="flex flex-col shrink-0 bg-ink border-b border-ink-2">
        <div className="h-14 flex items-center px-4 justify-between">
          <div className="flex items-center gap-2">
            <Sliders className="h-4 w-4 text-gold" />
            <h3 className="text-xs font-mono font-bold text-text-on-ink uppercase tracking-wider">
              {type} inspector
            </h3>
          </div>
          <span className="text-[10px] font-mono text-text-on-ink-muted bg-ink-2 px-1.5 py-0.5 rounded border border-ink-2/50">
            {id.slice(0, 8)}
          </span>
        </div>
        
        {/* Tabs */}
        <div className="flex w-full border-t border-ink-2">
          <button 
            onClick={() => setActiveTab('content')}
            className={`flex-1 py-2 text-[10px] font-mono font-bold tracking-wider uppercase transition-colors cursor-pointer ${activeTab === 'content' ? 'text-gold border-b-2 border-gold bg-ink-2/30' : 'text-text-on-ink-muted hover:bg-ink-2/20 hover:text-text-on-ink'}`}
          >
            Content
          </button>
          <button 
            onClick={() => setActiveTab('style')}
            className={`flex-1 py-2 text-[10px] font-mono font-bold tracking-wider uppercase transition-colors cursor-pointer ${activeTab === 'style' ? 'text-gold border-b-2 border-gold bg-ink-2/30' : 'text-text-on-ink-muted hover:bg-ink-2/20 hover:text-text-on-ink'}`}
          >
            Style
          </button>
          <button 
            onClick={() => setActiveTab('layout')}
            className={`flex-1 py-2 text-[10px] font-mono font-bold tracking-wider uppercase transition-colors cursor-pointer ${activeTab === 'layout' ? 'text-gold border-b-2 border-gold bg-ink-2/30' : 'text-text-on-ink-muted hover:bg-ink-2/20 hover:text-text-on-ink'}`}
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
            <div className="flex items-center gap-1.5 border-b border-ink-2/30 pb-1.5">
              <TypeIcon className="h-3.5 w-3.5 text-gold" />
              <h4 className="text-xs font-mono font-bold text-gold">Content Properties</h4>
            </div>

          {(type === 'header' || type === 'button') && (
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-[10px] font-mono font-bold text-text-on-ink-muted uppercase tracking-widest">
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
                  className="text-[10px] font-bold text-gold bg-gold/10 hover:bg-gold/20 border border-gold/20 rounded px-2 py-1 outline-none cursor-pointer transition-all"
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
                className="w-full text-xs px-3 py-2 border border-ink-2 rounded-lg focus:border-gold outline-none transition-all bg-ink text-text-on-ink"
              />
              
              {/* AI Generate Copy for Header/Button */}
              <div className="mt-3 bg-gold/5 p-3 rounded-xl border border-gold/10">
                <label className="flex items-center gap-1.5 text-[10px] font-bold text-gold uppercase tracking-wider mb-2">
                  <Sparkles className="w-3.5 h-3.5" /> AI Generate Copy
                </label>
                <div className="flex flex-col gap-2">
                  <input
                    type="text"
                    placeholder="E.g., Catchy subject for summer sale"
                    value={copyPrompt}
                    onChange={(e) => setCopyPrompt(e.target.value)}
                    className="w-full text-[11px] px-2 py-1.5 border border-ink-2 rounded bg-ink outline-none focus:border-gold text-text-on-ink"
                  />
                  <button
                    id="btn-generate-copy"
                    onClick={handleGenerateCopy}
                    disabled={isGeneratingCopy || !copyPrompt}
                    className="w-full py-1.5 border border-gold text-gold hover:bg-gold hover:text-ink disabled:opacity-50 rounded text-[10px] font-bold flex justify-center items-center gap-1 transition-all cursor-pointer"
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
                          className="text-[11px] p-2 bg-ink-2/40 border border-ink-2 rounded shadow-xs cursor-pointer hover:border-gold/40 transition-colors text-text-on-ink"
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
                <label className="block text-[10px] font-mono font-bold text-text-on-ink-muted uppercase tracking-widest">
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
                  className="text-[10px] font-bold text-gold bg-gold/10 hover:bg-gold/20 border border-gold/20 rounded px-2 py-1 outline-none cursor-pointer transition-all"
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
                className="w-full text-xs font-mono p-3 border border-ink-2 rounded-lg focus:border-gold outline-none transition-all bg-ink text-text-on-ink custom-scrollbar"
                placeholder="Supports regular text paragraphs or HTML inline tags."
              />
              
              {/* AI Generate Copy for Text */}
              <div className="mt-3 bg-gold/5 p-3 rounded-xl border border-gold/10">
                <label className="flex items-center gap-1.5 text-[10px] font-bold text-gold uppercase tracking-wider mb-2">
                  <Sparkles className="w-3.5 h-3.5" /> AI Generate Body Text
                </label>
                <div className="flex flex-col gap-2">
                  <textarea
                    placeholder="E.g., Write a paragraph explaining our new product features"
                    value={copyPrompt}
                    rows={2}
                    onChange={(e) => setCopyPrompt(e.target.value)}
                    className="w-full text-[11px] px-2 py-1.5 border border-ink-2 rounded bg-ink outline-none focus:border-gold text-text-on-ink resize-none"
                  />
                  <button
                    id="btn-generate-body-copy"
                    onClick={handleGenerateCopy}
                    disabled={isGeneratingCopy || !copyPrompt}
                    className="w-full py-1.5 border border-gold text-gold hover:bg-gold hover:text-ink disabled:opacity-50 rounded text-[10px] font-bold flex justify-center items-center gap-1 transition-all cursor-pointer"
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
                          className="text-[11px] p-2 bg-ink-2/40 border border-ink-2 rounded shadow-xs cursor-pointer hover:border-gold/40 transition-colors text-text-on-ink"
                        >
                          <span dangerouslySetInnerHTML={{__html: sug}} />
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="mt-2 pt-2 border-t border-ink-2/30">
                    <label className="flex items-center gap-1.5 text-[9px] font-bold text-gold/60 uppercase tracking-wider mb-2">
                      Rewrite Current Text
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {['professional', 'friendly', 'urgent', 'shorten', 'expand'].map((op) => (
                        <button
                          key={op}
                          onClick={() => handleRewriteText(op)}
                          disabled={isRewritingText || !content}
                          className="flex-1 min-w-[30%] py-1 px-2 bg-ink hover:bg-gold/10 border border-ink-2 rounded text-[9px] font-bold text-gold uppercase tracking-wider disabled:opacity-50 transition-colors"
                        >
                          {op}
                        </button>
                      ))}
                    </div>
                    {isRewritingText && (
                      <p className="text-[10px] text-gold mt-2 flex items-center justify-center gap-1">
                        <RefreshCw className="w-3 h-3 animate-spin" /> Rewriting text...
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {type === 'image' && (
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-mono font-bold text-text-on-ink-muted uppercase tracking-widest mb-1">
                  Upload Local Image
                </label>
                <div className="flex items-center justify-center w-full">
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`flex flex-col items-center justify-center w-full h-24 border-2 border-dashed rounded-xl cursor-pointer transition-all ${
                      isDragging
                        ? 'border-gold bg-ink-2/30'
                        : 'border-ink-2 hover:border-gold/40 hover:bg-ink-2/10'
                    }`}
                  >
                    <label className="flex flex-col items-center justify-center w-full h-full cursor-pointer p-4">
                      <div className="flex flex-col items-center justify-center text-center">
                        <Upload className={`h-5 w-5 mb-1 transition-transform ${isDragging ? 'scale-110 text-gold' : 'text-text-on-ink-muted'}`} />
                        <p className="text-[10px] font-medium text-text-on-ink-muted leading-snug">
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
              <div className="bg-ink-2/40 p-4 rounded-xl border border-ink-2">
                <label className="flex items-center gap-1.5 text-[10px] font-mono font-bold text-gold uppercase tracking-widest mb-3">
                  <Sparkles className="w-3.5 h-3.5" /> AI Generate Image
                </label>
                <div className="flex flex-col gap-2">
                  <input
                    type="text"
                    placeholder="E.g., A minimalist workspace desk..."
                    value={imagePrompt}
                    onChange={(e) => setImagePrompt(e.target.value)}
                    className="w-full text-[11px] px-3 py-2 border border-ink-2 rounded bg-ink outline-none text-text-on-ink focus:border-gold"
                  />
                  <button
                    id="btn-generate-ai-image"
                    onClick={handleGenerateImage}
                    disabled={isGeneratingImage || !imagePrompt}
                    className="w-full py-2 border border-gold text-gold hover:bg-gold hover:text-ink disabled:opacity-50 rounded text-[10px] font-bold flex justify-center items-center gap-1 uppercase tracking-wider transition-all cursor-pointer"
                  >
                    {isGeneratingImage ? <RefreshCw className="w-3 h-3 animate-spin" /> : 'Generate Image'}
                  </button>
                  {aiError && <p className="text-[10px] text-red-400 mt-1">{aiError}</p>}
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-mono font-bold text-text-on-ink-muted uppercase tracking-widest mb-2">
                  Image Styling
                </label>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        const input = document.getElementById('input-upload-image') as HTMLInputElement;
                        input?.click();
                      }}
                      className="flex-1 py-2 bg-ink-2 hover:bg-gold hover:text-ink text-text-on-ink rounded text-[10px] font-bold uppercase tracking-wider transition-all"
                    >
                      Replace Image
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-[9px] text-text-on-ink-muted">Grayscale</label>
                      <input type="range" min="0" max="100" value={properties.filterGrayscale || 0} onChange={(e) => updateProperty('filterGrayscale', parseInt(e.target.value))} className="w-full h-1 bg-ink-2 rounded-lg appearance-none cursor-pointer accent-gold" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] text-text-on-ink-muted">Sepia</label>
                      <input type="range" min="0" max="100" value={properties.filterSepia || 0} onChange={(e) => updateProperty('filterSepia', parseInt(e.target.value))} className="w-full h-1 bg-ink-2 rounded-lg appearance-none cursor-pointer accent-gold" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] text-text-on-ink-muted">Contrast</label>
                      <input type="range" min="50" max="200" value={properties.filterContrast || 100} onChange={(e) => updateProperty('filterContrast', parseInt(e.target.value))} className="w-full h-1 bg-ink-2 rounded-lg appearance-none cursor-pointer accent-gold" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] text-text-on-ink-muted">Brightness</label>
                      <input type="range" min="50" max="200" value={properties.filterBrightness || 100} onChange={(e) => updateProperty('filterBrightness', parseInt(e.target.value))} className="w-full h-1 bg-ink-2 rounded-lg appearance-none cursor-pointer accent-gold" />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] text-text-on-ink-muted">Aspect Ratio</label>
                    <select
                      value={properties.aspectRatio || 'original'}
                      onChange={(e) => updateProperty('aspectRatio', e.target.value)}
                      className="w-full text-[11px] px-2 py-1.5 border border-ink-2 rounded bg-ink outline-none text-text-on-ink"
                    >
                      <option value="original">Original</option>
                      <option value="16/9">16:9</option>
                      <option value="4/3">4:3</option>
                      <option value="1/1">1:1</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="text-[9px] text-text-on-ink-muted">Hover Scale Effect</label>
                    <input
                      type="checkbox"
                      checked={properties.hoverScale || false}
                      onChange={(e) => updateProperty('hoverScale', e.target.checked)}
                      className="accent-gold"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-mono font-bold text-text-on-ink-muted uppercase tracking-widest mb-1">
                  Or Paste Image URL
                </label>
                <input
                  id="input-image-src"
                  type="text"
                  value={properties.src || ''}
                  onChange={(e) => updateProperty('src', e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full text-xs px-3 py-2 border border-ink-2 rounded-lg bg-ink outline-none text-text-on-ink"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono font-bold text-text-on-ink-muted uppercase tracking-widest mb-1">
                  Alternative Text (Alt)
                </label>
                <input
                  id="input-image-alt"
                  type="text"
                  value={properties.alt || ''}
                  onChange={(e) => updateProperty('alt', e.target.value)}
                  placeholder="e.g. Graphic Banner Illustration"
                  className="w-full text-xs px-3 py-2 border border-ink-2 rounded-lg bg-ink outline-none text-text-on-ink"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono font-bold text-text-on-ink-muted uppercase tracking-widest mb-1">
                  Image Link (Href)
                </label>
                <div className="relative">
                  <Link className="absolute left-3 top-2.5 h-3.5 w-3.5 text-text-on-ink-muted" />
                  <input
                    id="input-image-href"
                    type="text"
                    value={properties.href || ''}
                    onChange={(e) => updateProperty('href', e.target.value)}
                    placeholder="e.g. https://yoursite.com"
                    className="w-full text-xs pl-9 pr-3 py-2 border border-ink-2 rounded-lg bg-ink outline-none text-text-on-ink"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-mono font-bold text-text-on-ink-muted uppercase tracking-widest mb-1">
                  Display Width
                </label>
                <select
                  id="select-image-width"
                  value={properties.width || '100%'}
                  onChange={(e) => updateProperty('width', e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-ink-2 rounded-lg bg-ink outline-none text-text-on-ink font-bold"
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
                    id="btn-add-section-column"
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
                    className="flex-1 py-1.5 border border-gold text-gold hover:bg-gold hover:text-ink disabled:opacity-35 font-bold rounded-lg text-xs transition-all cursor-pointer"
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
                <label className="block text-[10px] font-mono font-bold text-text-on-ink-muted uppercase tracking-widest mb-1">
                  Hero Title / Content
                </label>
                <input 
                  type="text"
                  value={content}
                  onChange={(e) => onUpdateBlock(id, { content: e.target.value })}
                  className="w-full text-xs px-3 py-2 border border-ink-2 rounded-lg bg-ink outline-none text-text-on-ink"
                  placeholder="SUMMER VIBES"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono font-bold text-text-on-ink-muted uppercase tracking-widest mb-1">
                  Upload Hero Background
                </label>
                <div className="flex items-center justify-center w-full">
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`flex flex-col items-center justify-center w-full h-24 border-2 border-dashed rounded-xl cursor-pointer transition-all ${
                      isDragging
                        ? 'border-gold bg-ink-2/30'
                        : 'border-ink-2 hover:border-gold/40 hover:bg-ink-2/10'
                    }`}
                  >
                    <label className="flex flex-col items-center justify-center w-full h-full cursor-pointer p-4">
                      <div className="flex flex-col items-center justify-center text-center">
                        <Upload className={`h-5 w-5 mb-1 transition-transform ${isDragging ? 'scale-110 text-gold' : 'text-text-on-ink-muted'}`} />
                        <p className="text-[10px] font-medium text-text-on-ink-muted leading-snug">
                          {isDragging ? 'Drop Image Here!' : 'Select or drag & drop image'}
                        </p>
                      </div>
                      <input
                        id="input-upload-hero"
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-mono font-bold text-text-on-ink-muted uppercase tracking-widest mb-1">
                  Background Image URL
                </label>
                <input 
                  type="text"
                  value={properties.src || ''}
                  onChange={(e) => updateProperty('src', e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-ink-2 rounded-lg bg-ink outline-none text-text-on-ink"
                  placeholder="https://images.unsplash.com/..."
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-mono font-bold text-text-on-ink-muted uppercase tracking-widest mb-1">
                    Badge Label
                  </label>
                  <input 
                    type="text"
                    value={properties.badge || ''}
                    onChange={(e) => updateProperty('badge', e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-ink-2 rounded-lg bg-ink outline-none text-text-on-ink"
                    placeholder="E.g., Special"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono font-bold text-text-on-ink-muted uppercase tracking-widest mb-1">
                    Subtitle / Price
                  </label>
                  <input 
                    type="text"
                    value={properties.price || ''}
                    onChange={(e) => updateProperty('price', e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-ink-2 rounded-lg bg-ink outline-none text-text-on-ink"
                    placeholder="E.g., From $49"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-mono font-bold text-text-on-ink-muted uppercase tracking-widest mb-1">
                  Destination Href Link
                </label>
                <input 
                  type="text"
                  value={properties.href || ''}
                  onChange={(e) => updateProperty('href', e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-ink-2 rounded-lg bg-ink outline-none text-text-on-ink"
                  placeholder="https://..."
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono font-bold text-text-on-ink-muted uppercase tracking-widest mb-1">
                  Overlay Position
                </label>
                <select 
                  value={properties.overlayPosition || 'center'}
                  onChange={(e) => updateProperty('overlayPosition', e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-ink-2 rounded-lg bg-ink outline-none text-text-on-ink font-bold"
                >
                  <option value="center">Center</option>
                  <option value="bottom-left">Bottom Left</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-mono font-bold text-text-on-ink-muted uppercase tracking-widest mb-1">
                  Overlay Scrim Layer Color
                </label>
                <input 
                  type="text"
                  value={properties.overlayScrim || 'rgba(15, 23, 42, 0.45)'}
                  onChange={(e) => updateProperty('overlayScrim', e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-ink-2 rounded-lg bg-ink outline-none text-text-on-ink font-mono"
                  placeholder="rgba(0,0,0,0.5)"
                />
              </div>
            </div>
          )}

          {type === 'productCard' && (
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-mono font-bold text-text-on-ink-muted uppercase tracking-widest mb-1">
                  Product Name
                </label>
                <input 
                  type="text"
                  value={content}
                  onChange={(e) => onUpdateBlock(id, { content: e.target.value })}
                  className="w-full text-xs px-3 py-2 border border-ink-2 rounded-lg bg-ink outline-none text-text-on-ink"
                  placeholder="Modern Product"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono font-bold text-text-on-ink-muted uppercase tracking-widest mb-1">
                  Upload Product Image
                </label>
                <div className="flex items-center justify-center w-full">
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`flex flex-col items-center justify-center w-full h-24 border-2 border-dashed rounded-xl cursor-pointer transition-all ${
                      isDragging
                        ? 'border-gold bg-ink-2/30'
                        : 'border-ink-2 hover:border-gold/40 hover:bg-ink-2/10'
                    }`}
                  >
                    <label className="flex flex-col items-center justify-center w-full h-full cursor-pointer p-4">
                      <div className="flex flex-col items-center justify-center text-center">
                        <Upload className={`h-5 w-5 mb-1 transition-transform ${isDragging ? 'scale-110 text-gold' : 'text-text-on-ink-muted'}`} />
                        <p className="text-[10px] font-medium text-text-on-ink-muted leading-snug">
                          {isDragging ? 'Drop Image Here!' : 'Select or drag & drop image'}
                        </p>
                      </div>
                      <input
                        id="input-upload-product"
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-mono font-bold text-text-on-ink-muted uppercase tracking-widest mb-1">
                  Product Image URL
                </label>
                <input 
                  type="text"
                  value={properties.src || ''}
                  onChange={(e) => updateProperty('src', e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-ink-2 rounded-lg bg-ink outline-none text-text-on-ink"
                  placeholder="https://images.unsplash.com/..."
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-mono font-bold text-text-on-ink-muted uppercase tracking-widest mb-1">
                    Price Tag
                  </label>
                  <input 
                    type="text"
                    value={properties.price || ''}
                    onChange={(e) => updateProperty('price', e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-ink-2 rounded-lg bg-ink outline-none text-text-on-ink"
                    placeholder="$129.99"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono font-bold text-text-on-ink-muted uppercase tracking-widest mb-1">
                    Badge Tag
                  </label>
                  <input 
                    type="text"
                    value={properties.badge || ''}
                    onChange={(e) => updateProperty('badge', e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-ink-2 rounded-lg bg-ink outline-none text-text-on-ink"
                    placeholder="Sale"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-mono font-bold text-text-on-ink-muted uppercase tracking-widest mb-1">
                  Purchase Link (Href)
                </label>
                <input 
                  type="text"
                  value={properties.href || ''}
                  onChange={(e) => updateProperty('href', e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-ink-2 rounded-lg bg-ink outline-none text-text-on-ink"
                  placeholder="https://..."
                />
              </div>
            </div>
          )}

          {type === 'imageGrid' && (
            <div className="space-y-4">
              <span className="block text-[10px] font-mono font-bold text-gold uppercase tracking-widest">Image Grid Layout Configuration</span>
              
              {/* Grid Column and Row selectors */}
              <div className="grid grid-cols-2 gap-3 p-3 bg-ink-2/15 rounded border border-ink-2">
                <div>
                  <label className="block text-[10px] font-mono font-bold text-text-on-ink-muted uppercase tracking-wider mb-1">
                    Columns ({properties.gridCols || 3})
                  </label>
                  <input
                    type="range"
                    min={1}
                    max={6}
                    value={properties.gridCols || 3}
                    onChange={(e) => {
                      const newCols = parseInt(e.target.value, 10);
                      const currentRows = properties.gridRows || 1;
                      
                      // Calculate new images array
                      const targetCount = newCols * currentRows;
                      let currentImages = [...(properties.images || [])];
                      if (currentImages.length < targetCount) {
                        const placeholders = [
                          'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=300',
                          'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300',
                          'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300',
                          'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=300'
                        ];
                        const diff = targetCount - currentImages.length;
                        for (let k = 0; k < diff; k++) {
                          currentImages.push({
                            src: placeholders[(currentImages.length + k) % placeholders.length],
                            alt: `Grid Image ${currentImages.length + 1}`
                          });
                        }
                      } else {
                        currentImages = currentImages.slice(0, targetCount);
                      }
                      
                      onUpdateBlock(id, {
                        properties: {
                          ...properties,
                          gridCols: newCols,
                          images: currentImages
                        }
                      });
                    }}
                    className="w-full h-1.5 bg-ink border border-ink-2 rounded-lg appearance-none cursor-pointer accent-gold"
                  />
                  <div className="flex justify-between text-[9px] text-text-on-ink-muted/50 font-mono mt-1">
                    <span>1</span>
                    <span>3</span>
                    <span>6</span>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-mono font-bold text-text-on-ink-muted uppercase tracking-wider mb-1">
                    Rows ({properties.gridRows || 1})
                  </label>
                  <input
                    type="range"
                    min={1}
                    max={6}
                    value={properties.gridRows || 1}
                    onChange={(e) => {
                      const newRows = parseInt(e.target.value, 10);
                      const currentCols = properties.gridCols || 3;
                      
                      // Calculate new images array
                      const targetCount = currentCols * newRows;
                      let currentImages = [...(properties.images || [])];
                      if (currentImages.length < targetCount) {
                        const placeholders = [
                          'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=300',
                          'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300',
                          'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300',
                          'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=300'
                        ];
                        const diff = targetCount - currentImages.length;
                        for (let k = 0; k < diff; k++) {
                          currentImages.push({
                            src: placeholders[(currentImages.length + k) % placeholders.length],
                            alt: `Grid Image ${currentImages.length + 1}`
                          });
                        }
                      } else {
                        currentImages = currentImages.slice(0, targetCount);
                      }
                      
                      onUpdateBlock(id, {
                        properties: {
                          ...properties,
                          gridRows: newRows,
                          images: currentImages
                        }
                      });
                    }}
                    className="w-full h-1.5 bg-ink border border-ink-2 rounded-lg appearance-none cursor-pointer accent-gold"
                  />
                  <div className="flex justify-between text-[9px] text-text-on-ink-muted/50 font-mono mt-1">
                    <span>1</span>
                    <span>3</span>
                    <span>6</span>
                  </div>
                </div>
              </div>

              {/* Gap Size selector */}
              <div className="p-3 bg-ink-2/15 rounded border border-ink-2">
                <label className="block text-[10px] font-mono font-bold text-text-on-ink-muted uppercase tracking-wider mb-1 flex justify-between">
                  <span>Gap Size</span>
                  <span className="text-gold">{properties.gridGap !== undefined ? properties.gridGap : 8}px</span>
                </label>
                <input
                  type="range"
                  min={0}
                  max={40}
                  step={2}
                  value={properties.gridGap !== undefined ? properties.gridGap : 8}
                  onChange={(e) => {
                    onUpdateBlock(id, {
                      properties: {
                        ...properties,
                        gridGap: parseInt(e.target.value, 10)
                      }
                    });
                  }}
                  className="w-full h-1.5 bg-ink border border-ink-2 rounded-lg appearance-none cursor-pointer accent-gold"
                />
                <div className="flex justify-between text-[9px] text-text-on-ink-muted/50 font-mono mt-1">
                  <span>0px</span>
                  <span>10px</span>
                  <span>20px</span>
                  <span>40px</span>
                </div>
              </div>

              <span className="block text-[10px] font-mono font-bold text-gold uppercase tracking-widest mt-4">Grid Images ({(properties.images || []).length} items)</span>
              
              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
                {(properties.images || []).map((img: any, i: number) => {
                  const r = Math.floor(i / (properties.gridCols || 3)) + 1;
                  const c = (i % (properties.gridCols || 3)) + 1;
                  return (
                    <div key={i} className="p-3 border border-ink-2 rounded bg-ink-2/15 space-y-2 relative group/item">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono font-bold text-gold">Image {i + 1} <span className="text-text-on-ink-muted/65">(Row {r}, Col {c})</span></span>
                        
                        {/* Move Actions */}
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => {
                              if (i === 0) return;
                              const list = [...(properties.images || [])];
                              const temp = list[i - 1];
                              list[i - 1] = list[i];
                              list[i] = temp;
                              updateProperty('images', list);
                            }}
                            disabled={i === 0}
                            className="p-1 rounded bg-ink text-text-on-ink-muted hover:text-gold hover:bg-ink-2 disabled:opacity-35 text-[10px] cursor-pointer"
                            title="Move Up"
                          >
                            ↑
                          </button>
                          <button
                            onClick={() => {
                              if (i === (properties.images || []).length - 1) return;
                              const list = [...(properties.images || [])];
                              const temp = list[i + 1];
                              list[i + 1] = list[i];
                              list[i] = temp;
                              updateProperty('images', list);
                            }}
                            disabled={i === (properties.images || []).length - 1}
                            className="p-1 rounded bg-ink text-text-on-ink-muted hover:text-gold hover:bg-ink-2 disabled:opacity-35 text-[10px] cursor-pointer"
                            title="Move Down"
                          >
                            ↓
                          </button>
                        </div>
                      </div>

                      <div className="flex gap-2 items-start">
                        {/* Mini image preview */}
                        <div className="w-12 h-12 rounded bg-ink border border-ink-2 overflow-hidden shrink-0">
                          <img src={img.src} alt="" className="w-full h-full object-cover" />
                        </div>

                        {/* File Upload Button */}
                        <div className="flex-1 min-w-0">
                          <label className="flex items-center gap-1.5 px-2 py-1.5 bg-ink hover:bg-ink-2 text-text-on-ink border border-ink-2 rounded text-[10px] font-mono font-bold uppercase cursor-pointer justify-center transition-colors">
                            <Upload className="h-3.5 w-3.5 text-gold" />
                            <span>Upload Image</span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (!file) return;
                                const reader = new FileReader();
                                reader.onload = (event) => {
                                  const base64 = event.target?.result as string;
                                  const list = [...(properties.images || [])];
                                  list[i] = { ...list[i], src: base64 };
                                  updateProperty('images', list);
                                };
                                reader.readAsDataURL(file);
                              }}
                            />
                          </label>
                        </div>
                      </div>

                      <div>
                        <label className="block text-[9px] font-mono font-bold text-text-on-ink-muted mb-1 uppercase">Image URL</label>
                        <input 
                          type="text"
                          value={img.src}
                          onChange={(e) => {
                            const list = [...(properties.images || [])];
                            list[i] = { ...list[i], src: e.target.value };
                            updateProperty('images', list);
                          }}
                          className="w-full text-[10px] px-2 py-1.5 border border-ink-2/80 rounded bg-ink text-text-on-ink outline-none focus:border-gold"
                          placeholder="https://..."
                        />
                      </div>

                      <div>
                        <label className="block text-[9px] font-mono font-bold text-text-on-ink-muted mb-1 uppercase">Alt Description</label>
                        <input 
                          type="text"
                          value={img.alt || ''}
                          onChange={(e) => {
                            const list = [...(properties.images || [])];
                            list[i] = { ...list[i], alt: e.target.value };
                            updateProperty('images', list);
                          }}
                          className="w-full text-[10px] px-2 py-1.5 border border-ink-2/80 rounded bg-ink text-text-on-ink outline-none focus:border-gold"
                          placeholder="e.g. Vintage leather boots"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {type === 'quote' && (
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-mono font-bold text-text-on-ink-muted uppercase tracking-widest mb-1">
                  Quote Body Text
                </label>
                <textarea 
                  rows={3}
                  value={content}
                  onChange={(e) => onUpdateBlock(id, { content: e.target.value })}
                  className="w-full text-xs p-3 border border-ink-2 rounded-lg bg-ink outline-none text-text-on-ink"
                  placeholder="The details are not the details. They make the design."
                />
              </div>
              <div>
                <label className="block text-[10px] font-mono font-bold text-text-on-ink-muted uppercase tracking-widest mb-1">
                  Author Signature Name
                </label>
                <input 
                  type="text"
                  value={properties.author || ''}
                  onChange={(e) => updateProperty('author', e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-ink-2 rounded-lg bg-ink outline-none text-text-on-ink"
                  placeholder="Charles Eames"
                />
              </div>
            </div>
          )}

          {type === 'navbar' && (
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-mono font-bold text-text-on-ink-muted uppercase tracking-widest mb-1">
                  Brand Logo Text
                </label>
                <input 
                  type="text"
                  value={content}
                  onChange={(e) => onUpdateBlock(id, { content: e.target.value })}
                  className="w-full text-xs px-3 py-2 border border-ink-2 rounded-lg bg-ink outline-none text-text-on-ink"
                />
              </div>

              <div>
                <span className="block text-[10px] font-mono font-bold text-gold uppercase tracking-widest mb-3">Navbar Nav Links</span>
                <div className="space-y-2">
                  {(properties.socialLinks || []).map((link: any, i: number) => (
                    <div key={i} className="flex gap-2 bg-ink-2/15 p-2 border border-ink-2 rounded-lg items-center">
                      <input 
                        type="text"
                        value={link.platform}
                        onChange={(e) => {
                          const links = [...(properties.socialLinks || [])];
                          links[i] = { ...links[i], platform: e.target.value };
                          updateProperty('socialLinks', links);
                        }}
                        className="w-20 text-[10px] px-2 py-1 border border-ink-2 rounded bg-ink text-text-on-ink outline-none focus:border-gold"
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
                        className="flex-1 text-[10px] px-2 py-1 border border-ink-2 rounded bg-ink text-text-on-ink outline-none focus:border-gold"
                        placeholder="Link URL"
                      />
                      <button 
                        onClick={() => {
                          const links = (properties.socialLinks || []).filter((_: any, idx: number) => idx !== i);
                          updateProperty('socialLinks', links);
                        }}
                        className="text-red-400 hover:text-red-500 text-lg px-1 transition-colors"
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
                    className="w-full py-2 text-[10px] font-mono font-bold border border-dashed border-gold/30 text-gold hover:bg-gold/10 rounded-lg transition-colors uppercase tracking-widest"
                  >
                    + Add Nav Link
                  </button>
                </div>
              </div>
            </div>
          )}

          {type === 'htmlEmbed' && (
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-mono font-bold text-text-on-ink-muted uppercase tracking-widest mb-1">
                  Raw Custom HTML Code
                </label>
                <textarea 
                  rows={10}
                  value={content}
                  onChange={(e) => onUpdateBlock(id, { content: e.target.value })}
                  className="w-full text-[10px] font-mono p-3 border border-ink-2 rounded-lg bg-ink outline-none text-gold"
                  placeholder="<div style='color: #d4af37;'>Premium Content</div>"
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
                <div className="flex justify-between text-[10px] font-mono font-bold text-text-on-ink-muted uppercase tracking-widest mb-2">
                  <span>Divider Spacing</span>
                  <span className="text-gold">{((style.paddingTop !== undefined ? style.paddingTop : 15) * 2)}px</span>
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
                  className="w-full h-1.5 bg-ink border border-ink-2 rounded-lg appearance-none cursor-pointer accent-gold"
                />
              </div>

              <div>
                {renderColorPicker('Line Color', style.borderColor || '#e2e8f0', (color) => updateStyle('borderColor', color), '#e2e8f0')}
              </div>

              <div>
                <div className="flex justify-between text-[10px] font-mono font-bold text-text-on-ink-muted uppercase tracking-widest mb-2">
                  <span>Line Weight</span>
                  <span className="text-gold">{style.borderWidth !== undefined ? style.borderWidth : 1}px</span>
                </div>
                <input
                  id="input-divider-weight-slider"
                  type="range"
                  min="1"
                  max="10"
                  step="1"
                  value={style.borderWidth !== undefined ? style.borderWidth : 1}
                  onChange={(e) => updateStyle('borderWidth', parseInt(e.target.value))}
                  className="w-full h-1.5 bg-ink border border-ink-2 rounded-lg appearance-none cursor-pointer accent-gold"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono font-bold text-text-on-ink-muted uppercase tracking-widest mb-2">
                  Line Style
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {['solid', 'dashed', 'dotted'].map((s) => (
                    <button
                      key={s}
                      onClick={() => updateStyle('borderStyle', s)}
                      className={`py-1.5 px-2 text-[10px] font-mono font-bold uppercase rounded border transition-colors ${
                        (style.borderStyle || 'solid') === s 
                          ? 'bg-gold/10 border-gold text-gold' 
                          : 'bg-ink border-ink-2 text-text-on-ink-muted hover:border-gold/50'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-mono font-bold text-text-on-ink-muted uppercase tracking-widest mb-1">
                  Line Width (Size)
                </label>
                <select
                  id="select-divider-width-select"
                  value={style.width || '100%'}
                  onChange={(e) => updateStyle('width', e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-ink-2 rounded-lg bg-ink focus:border-gold outline-none text-text-on-ink font-bold"
                >
                  <option value="100%">Full Width (100%)</option>
                  <option value="80%">Wide (80%)</option>
                  <option value="50%">Half Width (50%)</option>
                  <option value="30%">Medium (30%)</option>
                  <option value="15%">Narrow (15%)</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-mono font-bold text-text-on-ink-muted uppercase tracking-widest mb-1.5">
                  Line Alignment
                </label>
                <div className="grid grid-cols-3 gap-1 bg-ink-2 p-1 rounded-lg border border-ink-2">
                  {(['left', 'center', 'right'] as const).map((align) => (
                    <button
                      key={align}
                      onClick={() => updateStyle('textAlign', align)}
                      className={`py-1.5 text-[10px] font-bold rounded-md capitalize cursor-pointer transition-all ${
                        (style.textAlign || 'center') === align
                          ? 'bg-ink text-gold shadow-sm'
                          : 'text-text-on-ink-muted hover:text-text-on-ink'
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

          {type === 'shape' && (
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-mono font-bold text-text-on-ink-muted uppercase tracking-widest mb-1">
                  Shape Type
                </label>
                <select
                  value={properties.shape || 'rect'}
                  onChange={(e) => updateProperty('shape', e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-ink-2 rounded-lg bg-ink outline-none text-text-on-ink font-bold"
                >
                  <option value="rect">Rectangle / Square</option>
                  <option value="circle">Circle / Oval</option>
                  <option value="triangle">Triangle</option>
                  <option value="diamond">Diamond</option>
                  <option value="pentagon">Pentagon</option>
                  <option value="hexagon">Hexagon</option>
                  <option value="star">Star</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-mono font-bold text-text-on-ink-muted uppercase tracking-widest mb-1">
                    Width
                  </label>
                  <input 
                    type="text"
                    value={properties.width || '100px'}
                    onChange={(e) => updateProperty('width', e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-ink-2 rounded-lg bg-ink outline-none text-text-on-ink"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono font-bold text-text-on-ink-muted uppercase tracking-widest mb-1">
                    Height
                  </label>
                  <input 
                    type="text"
                    value={properties.height || '100px'}
                    onChange={(e) => updateProperty('height', e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-ink-2 rounded-lg bg-ink outline-none text-text-on-ink"
                  />
                </div>
              </div>
              {properties.blocks && properties.blocks.length > 0 && (
                 <div>
                    <label className="block text-[10px] font-mono font-bold text-rose-400 uppercase tracking-widest mb-2">
                      Nested Items ({properties.blocks.length})
                    </label>
                    <button 
                      onClick={() => updateProperty('blocks', [])}
                      className="text-[10px] text-rose-400 hover:underline"
                    >
                      Clear all nested items
                    </button>
                 </div>
              )}
            </div>
          )}

          {type === 'sticker' && (
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-mono font-bold text-text-on-ink-muted uppercase tracking-widest mb-1">
                  Upload Local Sticker
                </label>
                <div className="flex items-center justify-center w-full">
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`flex flex-col items-center justify-center w-full h-24 border-2 border-dashed rounded-xl cursor-pointer transition-all ${
                      isDragging
                        ? 'border-gold bg-ink-2/30'
                        : 'border-ink-2 hover:border-gold/40 hover:bg-ink-2/10'
                    }`}
                  >
                    <label className="flex flex-col items-center justify-center w-full h-full cursor-pointer p-4">
                      <div className="flex flex-col items-center justify-center text-center">
                        <Upload className={`h-5 w-5 mb-1 transition-transform ${isDragging ? 'scale-110 text-gold' : 'text-text-on-ink-muted'}`} />
                        <p className="text-[10px] font-medium text-text-on-ink-muted leading-snug">
                          {isDragging ? 'Drop Image Here!' : 'Select or drag & drop image'}
                        </p>
                      </div>
                      <input
                        id="input-upload-sticker"
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-mono font-bold text-text-on-ink-muted uppercase tracking-widest mb-1">
                  Sticker Image URL
                </label>
                <div className="flex gap-2">
                  <input 
                    type="text"
                    value={properties.src || ''}
                    onChange={(e) => updateProperty('src', e.target.value)}
                    className="flex-1 text-xs px-3 py-2 border border-ink-2 rounded-lg bg-ink outline-none text-text-on-ink"
                    placeholder="https://..."
                  />
                  <button 
                    onClick={() => {
                      const url = prompt('Enter Image URL:');
                      if (url) updateProperty('src', url);
                    }}
                    className="px-3 py-2 bg-gold/10 text-gold rounded-lg border border-gold/20"
                  >
                    <ImageIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-mono font-bold text-text-on-ink-muted uppercase tracking-widest mb-1">
                  Size
                </label>
                <input 
                  type="text"
                  value={properties.width || '80px'}
                  onChange={(e) => updateProperty('width', e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-ink-2 rounded-lg bg-ink outline-none text-text-on-ink"
                />
              </div>
            </div>
          )}

          {type === 'icon' && (
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-mono font-bold text-text-on-ink-muted uppercase tracking-widest mb-1">
                  Upload Custom Icon (Image)
                </label>
                <div className="flex items-center justify-center w-full">
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`flex flex-col items-center justify-center w-full h-24 border-2 border-dashed rounded-xl cursor-pointer transition-all ${
                      isDragging
                        ? 'border-gold bg-ink-2/30'
                        : 'border-ink-2 hover:border-gold/40 hover:bg-ink-2/10'
                    }`}
                  >
                    <label className="flex flex-col items-center justify-center w-full h-full cursor-pointer p-4">
                      <div className="flex flex-col items-center justify-center text-center">
                        <Upload className={`h-5 w-5 mb-1 transition-transform ${isDragging ? 'scale-110 text-gold' : 'text-text-on-ink-muted'}`} />
                        <p className="text-[10px] font-medium text-text-on-ink-muted leading-snug">
                          {isDragging ? 'Drop Image Here!' : 'Select or drag & drop image'}
                        </p>
                      </div>
                      <input
                        id="input-upload-icon-image"
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-mono font-bold text-text-on-ink-muted uppercase tracking-widest mb-2">
                  SVG Icon Markup
                </label>
                <textarea 
                  rows={6}
                  value={properties.svg || ''}
                  onChange={(e) => {
                    updateProperty('svg', e.target.value);
                    updateProperty('src', ''); // Clear image source if SVG is edited
                  }}
                  className="w-full text-[10px] font-mono p-3 border border-ink-2 rounded-lg bg-ink outline-none text-text-on-ink custom-scrollbar"
                  placeholder='<svg ...>...</svg>'
                />
              </div>
              <div>
                <label className="block text-[9px] font-mono font-bold text-text-on-ink-muted mb-2 uppercase tracking-widest">Presets:</label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { name: 'Star', svg: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>' },
                    { name: 'Heart', svg: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>' },
                    { name: 'Check', svg: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>' },
                    { name: 'Alert', svg: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>' },
                  ].map(p => (
                    <button 
                      key={p.name}
                      onClick={() => updateProperty('svg', p.svg)}
                      className="text-[10px] font-bold bg-ink-2 text-text-on-ink px-2 py-1 rounded hover:bg-gold/20 hover:text-gold transition-all"
                    >
                      {p.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {type === 'social' && (
            <div className="space-y-3">
              <label className="block text-[10px] font-mono font-bold text-text-on-ink-muted uppercase tracking-widest mb-1">
                Configured Networks
              </label>
              
              <div className="space-y-2.5">
                {(properties.socialLinks || []).map((link: any, index: number) => (
                  <div key={index} className="flex gap-1.5 items-center bg-ink-2 p-2 rounded-lg border border-ink-2/40">
                    <span className="text-[10px] font-mono font-bold text-text-on-ink-muted uppercase w-14 truncate tracking-wider">
                      {link.platform}
                    </span>
                    <input
                      id={`input-social-url-${index}`}
                      type="text"
                      value={link.url}
                      onChange={(e) => handleSocialLinkChange(index, e.target.value)}
                      className="w-full text-[10px] px-2 py-1 border border-ink-2 rounded bg-ink text-text-on-ink"
                    />
                    <button
                      id={`btn-remove-social-${index}`}
                      onClick={() => removeSocialPlatform(index)}
                      className="text-text-on-ink-muted hover:text-rose-400 p-1 hover:bg-rose-500/10 rounded transition-all"
                    >
                      <Trash className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Add Platform dropdown selector */}
              { (properties.socialLinks || []).length < availableSocials.length && (
                <div className="pt-2">
                  <span className="block text-[9px] font-mono font-bold text-text-on-ink-muted mb-2 uppercase tracking-widest">ADD MORE NETWORKS:</span>
                  <div className="flex flex-wrap gap-2">
                    {availableSocials
                      .filter(platform => !(properties.socialLinks || []).some((l: any) => l.platform === platform))
                      .map(platform => (
                        <button
                          id={`btn-add-social-${platform}`}
                          key={platform}
                          onClick={() => addSocialPlatform(platform)}
                          className="text-[9px] font-bold bg-gold/10 text-gold hover:bg-gold/20 px-2.5 py-1.5 rounded transition-all uppercase tracking-wider border border-gold/10"
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
          <div className="space-y-4 pt-4 border-t border-ink-2/30">
            <div className="flex items-center gap-1.5 border-b border-ink-2/30 pb-2">
              <Palette className="h-3.5 w-3.5 text-gold" />
              <h4 className="text-xs font-mono font-bold text-text-on-ink uppercase tracking-widest">Typography & Color</h4>
            </div>

            {/* Font Size & Weight (If applicable to texts/headers/buttons) */}
            {(type === 'header' || type === 'text' || type === 'button' || type === 'footer') && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-mono font-bold text-text-on-ink-muted uppercase tracking-widest mb-1">
                    Font Size
                  </label>
                  <select
                    id="select-font-size"
                    value={style.fontSize || ''}
                    onChange={(e) => updateStyle('fontSize', e.target.value)}
                    className="w-full text-xs px-2 py-1.5 border border-ink-2 rounded-lg bg-ink outline-none text-text-on-ink font-bold"
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
                  <label className="block text-[10px] font-mono font-bold text-text-on-ink-muted uppercase tracking-widest mb-1">
                    Font Weight
                  </label>
                  <select
                    id="select-font-weight"
                    value={style.fontWeight || ''}
                    onChange={(e) => updateStyle('fontWeight', e.target.value)}
                    className="w-full text-xs px-2 py-1.5 border border-ink-2 rounded-lg bg-ink outline-none text-text-on-ink font-bold"
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
        <div className="space-y-4 pt-4 border-t border-ink-2/30">
          <div className="flex items-center gap-1.5 border-b border-ink-2/30 pb-2">
            <AlignLeft className="h-3.5 w-3.5 text-gold" />
            <h4 className="text-xs font-mono font-bold text-text-on-ink uppercase tracking-widest">Layout Alignment</h4>
          </div>
          <div>
            <div className="flex bg-ink-2 p-1 border border-ink-2 rounded-lg">
              <button
                id="btn-align-left-global"
                onClick={() => updateStyle('textAlign', 'left')}
                className={`flex-1 py-1.5 flex justify-center rounded-md cursor-pointer transition-all ${
                  style.textAlign === 'left' || !style.textAlign
                    ? 'bg-ink text-gold shadow-sm'
                    : 'text-text-on-ink-muted hover:text-text-on-ink'
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
                    ? 'bg-ink text-gold shadow-sm'
                    : 'text-text-on-ink-muted hover:text-text-on-ink'
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
                    ? 'bg-ink text-gold shadow-sm'
                    : 'text-text-on-ink-muted hover:text-text-on-ink'
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
                    ? 'bg-ink text-gold shadow-sm'
                    : 'text-text-on-ink-muted hover:text-text-on-ink'
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

          {type === 'productLoop' && (
            <div className="space-y-4">
              <span className="block text-[10px] font-mono font-bold text-gold uppercase tracking-widest">Product Loop Configuration</span>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-[10px] font-mono font-bold text-text-on-ink-muted uppercase tracking-widest mb-1">
                    Feed Name / Title
                  </label>
                  <input
                    type="text"
                    value={content}
                    onChange={(e) => onUpdateBlock(id, { content: e.target.value })}
                    className="w-full text-xs px-3 py-2 border border-ink-2 rounded-lg bg-ink outline-none text-text-on-ink"
                    placeholder="Trending Products"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-mono font-bold text-text-on-ink-muted uppercase tracking-widest mb-1">
                      Data Source
                    </label>
                    <select
                      value={properties.dataSource || 'recommended'}
                      onChange={(e) => updateProperty('dataSource', e.target.value)}
                      className="w-full text-xs px-3 py-2 border border-ink-2 rounded-lg bg-ink outline-none text-text-on-ink font-bold"
                    >
                      <option value="recommended">Recommended</option>
                      <option value="new_arrivals">New Arrivals</option>
                      <option value="best_sellers">Best Sellers</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono font-bold text-text-on-ink-muted uppercase tracking-widest mb-1">
                      Limit
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={12}
                      value={properties.limit || 3}
                      onChange={(e) => updateProperty('limit', parseInt(e.target.value, 10))}
                      className="w-full text-xs px-3 py-2 border border-ink-2 rounded-lg bg-ink outline-none text-text-on-ink"
                    />
                  </div>
                </div>
              </div>

              <span className="block text-[10px] font-mono font-bold text-gold uppercase tracking-widest mt-4">Product Items ({(properties.items || []).length})</span>
              
              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
                {(properties.items || []).map((item: any, i: number) => (
                  <div key={i} className="p-3 border border-ink-2 rounded bg-ink-2/15 space-y-2 relative group/item">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold text-gold">Item {i + 1}</span>
                      <button
                        onClick={() => {
                          const list = [...(properties.items || [])];
                          list.splice(i, 1);
                          updateProperty('items', list);
                        }}
                        className="text-[10px] text-red-400 hover:text-red-500 font-bold uppercase tracking-tighter"
                      >
                        Remove
                      </button>
                    </div>

                    <div className="flex gap-2">
                      <div className="w-12 h-12 rounded border border-ink-2 bg-ink overflow-hidden flex-shrink-0 flex items-center justify-center relative group">
                        <img src={item.src} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        <label className="absolute inset-0 bg-ink/80 opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-opacity">
                          <Upload className="w-4 h-4 text-gold" />
                          <input 
                            type="file" 
                            accept="image/*" 
                            className="hidden" 
                            onChange={(e) => handleImageUpload(e, i, 'items')}
                          />
                        </label>
                      </div>
                      <div className="flex-1 space-y-1">
                        <input
                          type="text"
                          value={item.name || ''}
                          onChange={(e) => {
                            const list = [...(properties.items || [])];
                            list[i] = { ...list[i], name: e.target.value };
                            updateProperty('items', list);
                          }}
                          className="w-full text-[9px] px-2 py-1 border border-ink-2 rounded bg-ink text-text-on-ink outline-none focus:border-gold"
                          placeholder="Product Name"
                        />
                        <div className="flex gap-1">
                          <input
                            type="text"
                            value={item.price || ''}
                            onChange={(e) => {
                              const list = [...(properties.items || [])];
                              list[i] = { ...list[i], price: e.target.value };
                              updateProperty('items', list);
                            }}
                            className="flex-1 text-[9px] px-2 py-1 border border-ink-2 rounded bg-ink text-text-on-ink-muted outline-none focus:border-gold"
                            placeholder="Price"
                          />
                          <input
                            type="text"
                            value={item.src || ''}
                            onChange={(e) => {
                              const list = [...(properties.items || [])];
                              list[i] = { ...list[i], src: e.target.value };
                              updateProperty('items', list);
                            }}
                            className="flex-1 text-[9px] px-2 py-1 border border-ink-2 rounded bg-ink text-text-on-ink-muted outline-none focus:border-gold"
                            placeholder="Image URL"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                <button
                  onClick={() => {
                    const list = [...(properties.items || [])];
                    list.push({ name: 'New Product', price: '$0.00', src: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300' });
                    updateProperty('items', list);
                  }}
                  className="w-full py-2 border border-dashed border-gold/30 rounded-lg text-[10px] font-mono font-bold text-gold hover:bg-gold/10 transition-colors uppercase tracking-widest"
                >
                  + Add Product Item
                </button>
              </div>
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

        {/* SECTION 5: Dynamic Visibility Conditions (Personalization) */}
        <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-800 pb-1.5">
            <Eye className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400" />
            <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300">Conditional visibility</h4>
          </div>

          <div className="flex items-center gap-2">
            <input
              id="checkbox-enable-visibility"
              type="checkbox"
              checked={selectedBlock.visibilityCondition !== undefined}
              onChange={(e) => {
                if (e.target.checked) {
                  onUpdateBlock(selectedBlock.id, {
                    visibilityCondition: {
                      field: 'membership_tier',
                      operator: 'equals',
                      value: 'premium'
                    }
                  });
                } else {
                  onUpdateBlock(selectedBlock.id, {
                    visibilityCondition: undefined
                  });
                }
              }}
              className="rounded text-blue-600 focus:ring-blue-500 h-3.5 w-3.5 cursor-pointer"
            />
            <label htmlFor="checkbox-enable-visibility" className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 cursor-pointer">
              Enable conditional display (Liquid)
            </label>
          </div>

          {selectedBlock.visibilityCondition && (
            <div className="space-y-3 bg-slate-50 dark:bg-slate-900/40 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800 animate-fadeIn">
              <div>
                <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Merge Field Variable
                </label>
                <input
                  id="input-visibility-field"
                  type="text"
                  value={selectedBlock.visibilityCondition.field}
                  onChange={(e) => {
                    onUpdateBlock(selectedBlock.id, {
                      visibilityCondition: {
                        ...selectedBlock.visibilityCondition!,
                        field: e.target.value
                      }
                    });
                  }}
                  placeholder="e.g. membership_tier"
                  className="w-full text-xs px-2.5 py-1.5 border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-950 focus:border-blue-500 outline-none text-slate-800 dark:text-slate-200"
                />
              </div>

              <div>
                <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Operator
                </label>
                <select
                  id="select-visibility-operator"
                  value={selectedBlock.visibilityCondition.operator}
                  onChange={(e) => {
                    onUpdateBlock(selectedBlock.id, {
                      visibilityCondition: {
                        ...selectedBlock.visibilityCondition!,
                        operator: e.target.value as any
                      }
                    });
                  }}
                  className="w-full text-xs px-2.5 py-1.5 border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-950 focus:border-blue-500 outline-none text-slate-800 dark:text-slate-200 cursor-pointer"
                >
                  <option value="equals">Equals (==)</option>
                  <option value="not_equals">Does Not Equal (!=)</option>
                  <option value="exists">Is Defined / Exists</option>
                </select>
              </div>

              {selectedBlock.visibilityCondition.operator !== 'exists' && (
                <div>
                  <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Value to Match
                  </label>
                  <input
                    id="input-visibility-value"
                    type="text"
                    value={selectedBlock.visibilityCondition.value || ''}
                    onChange={(e) => {
                      onUpdateBlock(selectedBlock.id, {
                        visibilityCondition: {
                          ...selectedBlock.visibilityCondition!,
                          value: e.target.value
                        }
                      });
                    }}
                    placeholder="e.g. premium"
                    className="w-full text-xs px-2.5 py-1.5 border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-950 focus:border-blue-500 outline-none text-slate-800 dark:text-slate-200"
                  />
                </div>
              )}
            </div>
          )}
        </div>
        </div>
        )}
      </div>
    </div>
  );
}
