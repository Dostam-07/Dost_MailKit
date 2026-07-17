import React, { useState } from 'react';
import { 
  Type, 
  Image as ImageIcon, 
  Square, 
  Heading, 
  Minus, 
  Share2, 
  FileText, 
  Sparkles, 
  Settings as SettingsIcon, 
  Layers, 
  Layout, 
  RotateCcw, 
  Plus,
  HelpCircle,
  Sliders,
  Trash2
} from 'lucide-react';
import { BlockType, EmailTemplate, EmailBlock, GlobalSettings } from '../types';
import { STARTER_TEMPLATES } from '../utils/templates';

interface SidebarProps {
  template: EmailTemplate;
  onUpdateTemplate: (updates: Partial<EmailTemplate>) => void;
  onAddBlock: (type: BlockType) => void;
  onLoadTemplate: (template: EmailTemplate) => void;
  onDragStartNewBlock?: (type: BlockType | null) => void;
  selectedBlockId: string | null;
  onUpdateBlock?: (blockId: string, updates: Partial<EmailBlock>) => void;
}

const DEFAULT_STYLE_PRESETS = [
  {
    id: 'preset-elegant-coral',
    name: 'Elegant Coral Headline',
    type: 'header',
    style: {
      color: '#f43f5e',
      fontSize: '28px',
      fontWeight: 'bold',
      textAlign: 'center',
      paddingTop: 24,
      paddingBottom: 16
    }
  },
  {
    id: 'preset-neon-blue-btn',
    name: 'Neon Blue Button',
    type: 'button',
    style: {
      backgroundColor: '#2563eb',
      color: '#ffffff',
      borderRadius: 8,
      fontSize: '16px',
      fontWeight: 'bold',
      paddingTop: 14,
      paddingBottom: 14,
      paddingLeft: 28,
      paddingRight: 28,
      textAlign: 'center'
    }
  },
  {
    id: 'preset-clean-gray-card',
    name: 'Clean Gray Card',
    type: 'text',
    style: {
      backgroundColor: '#f1f5f9',
      borderRadius: 12,
      paddingTop: 20,
      paddingBottom: 20,
      paddingLeft: 20,
      paddingRight: 20,
      color: '#334155'
    }
  }
];

export default function Sidebar({ 
  template, 
  onUpdateTemplate, 
  onAddBlock,
  onLoadTemplate,
  onDragStartNewBlock,
  selectedBlockId,
  onUpdateBlock
}: SidebarProps) {
  const [activeTab, setActiveTab] = useState<'blocks' | 'settings' | 'templates'>('blocks');
  const [newStylePresetName, setNewStylePresetName] = useState('');

  const [savedStylePresets, setSavedStylePresets] = useState<{ id: string; name: string; type: string; style: any }[]>(() => {
    try {
      const stored = localStorage.getItem('easy-email-saved-styles');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error(e);
    }
    return DEFAULT_STYLE_PRESETS;
  });

  const savePresets = (updatedPresets: any[]) => {
    setSavedStylePresets(updatedPresets);
    try {
      localStorage.setItem('easy-email-saved-styles', JSON.stringify(updatedPresets));
    } catch (e) {
      console.error(e);
    }
  };

  const selectedBlock = template.blocks.find(b => b.id === selectedBlockId) || null;

  const handleSaveCurrentStyle = () => {
    if (!selectedBlock) return;
    const name = newStylePresetName.trim() || `${selectedBlock.type.toUpperCase()} Style Preset`;
    const newPreset = {
      id: `style-preset-${Date.now()}`,
      name,
      type: selectedBlock.type,
      style: { ...selectedBlock.style }
    };
    const nextPresets = [newPreset, ...savedStylePresets];
    savePresets(nextPresets);
    setNewStylePresetName('');
  };

  const handleApplyStylePreset = (style: any) => {
    if (!selectedBlockId || !onUpdateBlock) return;
    onUpdateBlock(selectedBlockId, {
      style: {
        ...selectedBlock?.style,
        ...style
      }
    });
  };

  const handleDeleteStylePreset = (id: string) => {
    const nextPresets = savedStylePresets.filter(p => p.id !== id);
    savePresets(nextPresets);
  };

  // Available block definitions to render in sidebar
  const blockDefinitions: { type: BlockType; label: string; icon: React.ReactNode; description: string }[] = [
    { 
      type: 'header', 
      label: 'Main Heading', 
      icon: <Heading className="h-5 w-5 text-indigo-500" />, 
      description: 'Primary headline style text' 
    },
    { 
      type: 'text', 
      label: 'Text Body', 
      icon: <Type className="h-5 w-5 text-emerald-500" />, 
      description: 'Paragraphs, lists & formatting' 
    },
    { 
      type: 'image', 
      label: 'Image Banner', 
      icon: <ImageIcon className="h-5 w-5 text-rose-500" />, 
      description: 'Photos, designs or logo banners' 
    },
    { 
      type: 'button', 
      label: 'Call to Action', 
      icon: <Square className="h-5 w-5 text-amber-500" />, 
      description: 'Clickable button with link' 
    },
    { 
      type: 'divider', 
      label: 'Separator', 
      icon: <Minus className="h-5 w-5 text-slate-400" />, 
      description: 'Horizontal separator line' 
    },
    { 
      type: 'spacer', 
      label: 'Spacer block', 
      icon: <Layout className="h-5 w-5 text-sky-400" />, 
      description: 'Blank space for vertical margin' 
    },
    { 
      type: 'social', 
      label: 'Social Networks', 
      icon: <Share2 className="h-5 w-5 text-purple-500" />, 
      description: 'Interactive social sharing icons' 
    },
    { 
      type: 'footer', 
      label: 'Footer Note', 
      icon: <FileText className="h-5 w-5 text-indigo-400" />, 
      description: 'Copyrights & Unsubscribe options' 
    },
  ];

  // Drag start handler for blocks
  const handleDragStart = (e: React.DragEvent, type: BlockType) => {
    e.dataTransfer.setData('text/plain', type);
    e.dataTransfer.effectAllowed = 'copy';
    if (onDragStartNewBlock) {
      onDragStartNewBlock(type);
    }
  };

  const updateGlobalSetting = (key: keyof GlobalSettings, value: any) => {
    onUpdateTemplate({
      globalSettings: {
        ...template.globalSettings,
        [key]: value
      }
    });
  };

  return (
    <div id="editor-sidebar" className="w-full lg:w-80 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col h-full overflow-hidden shadow-xs select-none">
      {/* Sidebar Tabs - Bento Style Tab Selection bar */}
      <div className="p-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex space-x-1 bg-slate-100 dark:bg-slate-950 p-1 rounded-xl">
          <button
            id="tab-blocks"
            onClick={() => setActiveTab('blocks')}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'blocks'
                ? 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 shadow-sm border border-slate-200/40 dark:border-slate-700/50'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Blocks
          </button>
          <button
            id="tab-settings"
            onClick={() => setActiveTab('settings')}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'settings'
                ? 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 shadow-sm border border-slate-200/40 dark:border-slate-700/50'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Settings
          </button>
          <button
            id="tab-templates"
            onClick={() => setActiveTab('templates')}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'templates'
                ? 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 shadow-sm border border-slate-200/40 dark:border-slate-700/50'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Presets
          </button>
        </div>
      </div>

      {/* Tab Content Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        {activeTab === 'blocks' && (
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                Content Elements
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Drag blocks onto the central canvas, or click any element to append it directly.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {blockDefinitions.map((block) => (
                <div
                  id={`block-item-${block.type}`}
                  key={block.type}
                  draggable
                  onDragStart={(e) => handleDragStart(e, block.type)}
                  onClick={() => onAddBlock(block.type)}
                  className="aspect-square border-2 border-dashed border-slate-200/50 dark:border-slate-800 rounded-xl flex flex-col items-center justify-center space-y-2 hover:border-blue-300 dark:hover:border-blue-500 hover:bg-blue-50/20 dark:hover:bg-blue-950/10 cursor-grab active:cursor-grabbing transition-all text-center group bg-slate-50 dark:bg-slate-900/40 relative overflow-hidden"
                >
                  <div className="w-10 h-10 rounded-lg bg-white dark:bg-slate-800 border border-slate-200/40 dark:border-slate-700/50 shadow-xs flex items-center justify-center group-hover:bg-blue-100 dark:group-hover:bg-blue-900/40 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {block.icon}
                  </div>
                  <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 group-hover:text-slate-800 dark:group-hover:text-slate-200 transition-colors">
                    {block.label}
                  </span>
                  
                  {/* Plus icon on hover */}
                  <div className="absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-100 transition-opacity bg-blue-600 text-white rounded-full p-0.5 pointer-events-none shadow-xs">
                    <Plus className="h-2.5 w-2.5" />
                  </div>
                </div>
              ))}
            </div>

            {/* Saved Styles Section */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
              <div>
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <Sliders className="h-4 w-4 text-blue-500" />
                  Saved Styles Presets
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Save a block's layout configuration as a reusable style preset, and apply it instantly onto other elements.
                </p>
              </div>

              {/* Save current block style interface */}
              {selectedBlock ? (
                <div className="bg-slate-50 dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-800/80 p-3 rounded-xl space-y-2.5">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-slate-450 dark:text-slate-500 uppercase tracking-wider mb-1">
                      Save Current Block Style ({selectedBlock.type})
                    </span>
                    <div className="flex gap-1.5">
                      <input
                        type="text"
                        placeholder="Style Name (e.g. Hero Heading)"
                        value={newStylePresetName}
                        onChange={(e) => setNewStylePresetName(e.target.value)}
                        className="flex-1 text-xs px-2.5 py-1.5 border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:border-blue-500 outline-none"
                      />
                      <button
                        onClick={handleSaveCurrentStyle}
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer shrink-0"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-[11px] text-slate-400 dark:text-slate-500 border border-dashed border-slate-200 dark:border-slate-800 p-3 rounded-xl text-center">
                  Select any block on the canvas to save its custom style configuration as a reusable preset!
                </div>
              )}

              {/* Presets list */}
              <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                {savedStylePresets.map((preset) => (
                  <div
                    key={preset.id}
                    className="group flex items-center justify-between p-2.5 rounded-xl border border-slate-200/60 dark:border-slate-800/80 bg-slate-50/30 dark:bg-slate-950/20 hover:border-blue-300 dark:hover:border-blue-500/50 hover:bg-white dark:hover:bg-slate-900/60 transition-all text-xs"
                  >
                    <button
                      onClick={() => handleApplyStylePreset(preset.style)}
                      disabled={!selectedBlock}
                      title={selectedBlock ? `Apply style preset "${preset.name}"` : 'Select a block to apply this style preset'}
                      className="flex-1 text-left flex items-center gap-2 mr-2 cursor-pointer disabled:cursor-not-allowed group min-w-0"
                    >
                      <div className="w-6 h-6 rounded-md bg-white dark:bg-slate-800 border border-slate-200/40 dark:border-slate-700/60 flex items-center justify-center text-[10px] font-bold shrink-0 text-slate-550 dark:text-slate-450 uppercase group-hover:bg-blue-50 dark:group-hover:bg-blue-950/30 group-hover:text-blue-600 transition-colors">
                        {preset.type[0]}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="font-bold text-slate-700 dark:text-slate-300 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {preset.name}
                        </span>
                        <span className="text-[9px] text-slate-400 dark:text-slate-550 uppercase tracking-widest font-semibold font-sans">
                          {preset.type} • {Object.keys(preset.style).length} rules
                        </span>
                      </div>
                    </button>
                    
                    <button
                      onClick={() => handleDeleteStylePreset(preset.id)}
                      className="opacity-0 group-hover:opacity-100 p-1 rounded-md hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/30 dark:hover:text-rose-400 text-slate-400 dark:text-slate-550 transition-all cursor-pointer shrink-0"
                      title="Delete Preset"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}

                {savedStylePresets.length === 0 && (
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 text-center py-2">
                    No custom style presets created yet.
                  </p>
                )}
              </div>
            </div>

            <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/30 rounded-xl p-3 flex gap-2.5 mt-6">
              <HelpCircle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
              <div className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
                <span className="font-semibold block mb-0.5">Tip for Creators:</span>
                Rearrange existing sections inside the canvas by dragging their handles, or select individual elements to fine-tune margin, paddings, and background colors.
              </div>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">Email Metadata</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Control mail envelope settings.</p>
            </div>

            <div className="space-y-3 bg-slate-50 dark:bg-slate-900/40 p-3 rounded-xl border border-slate-200/60 dark:border-slate-800">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Email Subject
                </label>
                <input
                  id="input-meta-subject"
                  type="text"
                  value={template.subject}
                  onChange={(e) => onUpdateTemplate({ subject: e.target.value })}
                  placeholder="e.g. Weekly Updates"
                  className="w-full text-xs px-2.5 py-1.5 border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all text-slate-800 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Preview Subtitle text
                </label>
                <textarea
                  id="input-meta-subtitle"
                  rows={2}
                  value={template.subtitle}
                  onChange={(e) => onUpdateTemplate({ subtitle: e.target.value })}
                  placeholder="Teaser paragraph shown in inboxes..."
                  className="w-full text-xs px-2.5 py-1.5 border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all text-slate-800 dark:text-slate-100 resize-none"
                />
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">Layout Engine & Dimensions</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Configure rendering model and container sizes.</p>
            </div>

            <div className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                  Layout Model
                </label>
                <div className="grid grid-cols-2 gap-1 bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border border-slate-200/40 dark:border-slate-800">
                  <button
                    id="layout-mode-flow"
                    type="button"
                    onClick={() => updateGlobalSetting('layoutMode', 'flow')}
                    className={`py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                      template.globalSettings.layoutMode !== 'figma'
                        ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-xs'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                  >
                    Classic Flow
                  </button>
                  <button
                    id="layout-mode-figma"
                    type="button"
                    onClick={() => updateGlobalSetting('layoutMode', 'figma')}
                    className={`py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                      template.globalSettings.layoutMode === 'figma'
                        ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-xs'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                  >
                    🎨 Figma Canvas
                  </button>
                </div>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 leading-relaxed">
                  {template.globalSettings.layoutMode === 'figma'
                    ? 'Figma Mode: Move items freely, drag to resize, set coordinates and depth layers (z-index).'
                    : 'Classic Flow Mode: Standard vertical element stacking. Ideal for production email deliverability.'}
                </p>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                    Content Width
                  </label>
                  <span className="text-xs font-mono text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-850 px-1.5 py-0.5 rounded">
                    {template.globalSettings.contentWidth}px
                  </span>
                </div>
                <input
                  id="input-global-width"
                  type="range"
                  min="400"
                  max="800"
                  step="10"
                  value={template.globalSettings.contentWidth}
                  onChange={(e) => updateGlobalSetting('contentWidth', parseInt(e.target.value))}
                  className="w-full accent-blue-600"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                    Border Corner Radius
                  </label>
                  <span className="text-xs font-mono text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-850 px-1.5 py-0.5 rounded">
                    {template.globalSettings.borderRadius}px
                  </span>
                </div>
                <input
                  id="input-global-radius"
                  type="range"
                  min="0"
                  max="32"
                  step="2"
                  value={template.globalSettings.borderRadius}
                  onChange={(e) => updateGlobalSetting('borderRadius', parseInt(e.target.value))}
                  className="w-full accent-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Primary Font Family
                </label>
                <select
                  id="select-global-font"
                  value={template.globalSettings.fontFamily}
                  onChange={(e) => updateGlobalSetting('fontFamily', e.target.value)}
                  className="w-full text-xs px-2.5 py-1.5 border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-900 focus:border-blue-500 outline-none transition-all text-slate-800 dark:text-slate-100 cursor-pointer"
                >
                  <optgroup label="Sans-Serif (Modern)">
                    <option value='"Inter", sans-serif'>Inter (App Standard)</option>
                    <option value='Arial, Helvetica, sans-serif'>Arial / Helvetica</option>
                    <option value='"Trebuchet MS", "Lucida Grande", "Lucida Sans Unicode", "Lucida Sans", Tahoma, sans-serif'>Trebuchet MS</option>
                    <option value='"Verdana", Geneva, sans-serif'>Verdana</option>
                    <option value='"Tahoma", Geneva, sans-serif'>Tahoma</option>
                    <option value='"Lucida Sans Unicode", "Lucida Grande", sans-serif'>Lucida Sans</option>
                  </optgroup>
                  <optgroup label="Serif (Traditional)">
                    <option value='"Georgia", serif'>Georgia</option>
                    <option value='"Times New Roman", Times, serif'>Times New Roman</option>
                    <option value='"Palatino Linotype", "Book Antiqua", Palatino, serif'>Palatino</option>
                  </optgroup>
                  <optgroup label="Monospace (Code)">
                    <option value='"Courier New", Courier, monospace'>Courier New</option>
                    <option value='"Lucida Console", Monaco, monospace'>Lucida Console</option>
                  </optgroup>
                </select>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 leading-relaxed">
                  Note: These are "web-safe" fonts with high compatibility across Gmail, Outlook, and Apple Mail.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Outer Background
                  </label>
                  <div className="flex gap-1.5 items-center">
                    <input
                      id="input-global-outer-bg"
                      type="color"
                      value={template.globalSettings.backgroundColor}
                      onChange={(e) => updateGlobalSetting('backgroundColor', e.target.value)}
                      className="w-7 h-7 rounded-md border border-slate-200 dark:border-slate-700 cursor-pointer overflow-hidden p-0"
                    />
                    <input
                      type="text"
                      value={template.globalSettings.backgroundColor}
                      onChange={(e) => updateGlobalSetting('backgroundColor', e.target.value)}
                      className="w-full text-[10px] font-mono px-1.5 py-1 border border-slate-200 dark:border-slate-700 rounded bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Inner Background
                  </label>
                  <div className="flex gap-1.5 items-center">
                    <input
                      id="input-global-inner-bg"
                      type="color"
                      value={template.globalSettings.contentBg}
                      onChange={(e) => updateGlobalSetting('contentBg', e.target.value)}
                      className="w-7 h-7 rounded-md border border-slate-200 dark:border-slate-700 cursor-pointer overflow-hidden p-0"
                    />
                    <input
                      type="text"
                      value={template.globalSettings.contentBg}
                      onChange={(e) => updateGlobalSetting('contentBg', e.target.value)}
                      className="w-full text-[10px] font-mono px-1.5 py-1 border border-slate-200 dark:border-slate-700 rounded bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'templates' && (
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">Ready-made Presets</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Load high-converting layout foundations. This replaces your current active canvas template content.
              </p>
            </div>

            <div className="space-y-3">
              {STARTER_TEMPLATES.map((tpl) => (
                <button
                  id={`preset-load-${tpl.id}`}
                  key={tpl.id}
                  onClick={() => onLoadTemplate(tpl)}
                  className={`w-full text-left p-3.5 rounded-xl border transition-all flex flex-col gap-1.5 group ${
                    template.id === tpl.id 
                      ? 'border-blue-500 bg-blue-50/30 dark:bg-blue-950/20 ring-1 ring-blue-500' 
                      : 'border-slate-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-500 hover:bg-slate-50/50 dark:hover:bg-slate-850/50'
                  }`}
                >
                  <div className="flex justify-between items-center w-full">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {tpl.name}
                    </span>
                    <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-1.5 py-0.5 rounded font-mono">
                      {tpl.blocks.length} blocks
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                    Subject: "{tpl.subject}"
                  </span>
                </button>
              ))}
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-center">
              <button
                id="btn-reset-blank"
                onClick={() => onLoadTemplate({
                  id: 'blank-template',
                  name: 'Blank slate',
                  subject: 'Default Marketing Campaign',
                  subtitle: 'This is the preview text shown in modern mail client inboxes.',
                  globalSettings: {
                    backgroundColor: '#f4f4f5',
                    contentWidth: 600,
                    contentBg: '#ffffff',
                    fontFamily: '"Inter", sans-serif',
                    borderRadius: 8,
                  },
                  blocks: [
                    {
                      id: 'header-blank-1',
                      type: 'header',
                      content: 'Custom Header Title',
                      style: {
                        color: '#111827',
                        textAlign: 'center',
                        fontSize: '24px',
                        fontWeight: 'bold',
                        paddingTop: 30,
                        paddingBottom: 20,
                        paddingLeft: 20,
                        paddingRight: 20,
                      }
                    }
                  ]
                })}
                className="text-xs font-semibold text-rose-500 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/20 dark:text-rose-400 dark:hover:bg-rose-950/40 px-4 py-2 rounded-lg transition-all border border-rose-200/30 dark:border-rose-900/30 flex items-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Reset to Blank Canvas
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Footer Settings Summary & Branding */}
      <div className="mt-auto p-4 bg-slate-50 dark:bg-slate-950/40 border-t border-slate-100 dark:border-slate-800">
        <p className="text-[10px] text-slate-400 dark:text-slate-500 leading-tight uppercase font-bold mb-2">Template Settings</p>
        <div className="space-y-2 mb-3">
          <div className="flex justify-between items-center">
            <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">Width</span>
            <span className="text-xs font-mono font-bold text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-850 border border-slate-200/50 dark:border-slate-750 px-1.5 py-0.5 rounded shadow-2xs">
              {template.globalSettings.contentWidth}px
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">Background</span>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-mono font-medium text-slate-400 dark:text-slate-500 uppercase">
                {template.globalSettings.contentBg}
              </span>
              <div 
                className="w-4 h-4 rounded border border-slate-200/60 dark:border-slate-700 shadow-xs"
                style={{ backgroundColor: template.globalSettings.contentBg }}
              />
            </div>
          </div>
        </div>
        <div className="pt-2.5 border-t border-slate-200/50 dark:border-slate-850 text-center">
          <span className="text-[9px] text-slate-400 dark:text-slate-500 font-mono tracking-wider block uppercase">
            Dost_MailKit • React & MJML
          </span>
        </div>
      </div>
    </div>
  );
}
