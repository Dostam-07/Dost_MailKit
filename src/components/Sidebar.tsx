import React, { useState } from 'react';
import {
  Type,
  Image as ImageIcon,
  Square,
  Minus,
  Settings as SettingsIcon, 
  Layers, 
  Layout, 
  Plus,
  HelpCircle,
  Sliders,
  Trash2,
  Boxes,
  Search,
  CheckSquare,
  Users,
  Paintbrush,
  Check,
  RefreshCw,
  FolderHeart,
  AlertCircle,
  Eye,
  Link,
  BookOpen,
  ArrowRight,
  Shapes,
  Sparkles
} from 'lucide-react';
import { BlockType, EmailTemplate, EmailBlock, GlobalSettings, SharedBlock, MediaAsset } from '../types';
import { STARTER_TEMPLATES } from '../utils/templates';
import { blockRegistry, BlockDefinition } from '../blocks/registry';
import { THEME_PRESETS } from '../utils/themes';

interface SidebarProps {
  template: EmailTemplate;
  onUpdateTemplate: (updates: Partial<EmailTemplate>) => void;
  onAddBlock: (type: BlockType) => void;
  onLoadTemplate: (template: EmailTemplate) => void;
  onDragStartNewBlock?: (type: BlockType | null) => void;
  selectedBlockId: string | null;
  onUpdateBlock?: (blockId: string, updates: Partial<EmailBlock>) => void;
  
  // PRD v2 Additions
  sharedBlocks?: SharedBlock[];
  onAddSharedBlock?: (name: string, category: SharedBlock['category'], isGlobal: boolean, block: EmailBlock) => void;
  onDeleteSharedBlock?: (id: string) => void;
  onAddBlockFromShared?: (sharedBlockId: string) => void;
  
  mediaAssets?: MediaAsset[];
  onAddMediaAsset?: (asset: Omit<MediaAsset, 'id' | 'createdAt'>) => void;
  onDeleteMediaAsset?: (id: string) => void;
  
  currentRole?: 'owner' | 'editor' | 'contributor';
  onChangeRole?: (role: 'owner' | 'editor' | 'contributor') => void;
}

export default function Sidebar({ 
  template, 
  onUpdateTemplate, 
  onAddBlock,
  onLoadTemplate,
  onDragStartNewBlock,
  selectedBlockId,
  onUpdateBlock,
  
  // PRD v2 fallbacks
  sharedBlocks = [],
  onDeleteSharedBlock,
  onAddBlockFromShared,
  
  mediaAssets = [],
  onAddMediaAsset,
  onDeleteMediaAsset,
  
  currentRole = 'owner',
  onChangeRole
}: SidebarProps) {
  const [activeTab, setActiveTab] = useState<'blocks' | 'elements' | 'patterns' | 'media' | 'styles' | 'presets' | 'workflow'>('blocks');
  
  // Search & filter states
  const [patternSearch, setPatternSearch] = useState('');
  const [patternCategory, setPatternCategory] = useState<string>('all');
  const [mediaSearch, setMediaSearch] = useState('');
  const [mediaCategory, setMediaCategory] = useState<string>('all');

  // Media upload state
  const [newMediaUrl, setNewMediaUrl] = useState('');
  const [newMediaName, setNewMediaName] = useState('');
  const [newMediaCategory, setNewMediaCategory] = useState<MediaAsset['category']>('general');
  const [newMediaAlt, setNewMediaAlt] = useState('');
  const [showAddMediaForm, setShowAddMediaForm] = useState(false);

  const selectedBlock = template.blocks.find(b => b.id === selectedBlockId) || null;

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

  const updateBrandColor = (colorKey: 'primary' | 'secondary' | 'accent', value: string) => {
    const defaultBrandColors = {
      primary: '#3b82f6',
      secondary: '#6366f1',
      accent: '#f43f5e',
    };

    onUpdateTemplate({
      globalSettings: {
        ...template.globalSettings,
        brandColors: {
          ...(template.globalSettings.brandColors || defaultBrandColors),
          [colorKey]: value
        }
      }
    });
  };

  // Switch current visual theme preset
  const handleSelectTheme = (themeId: string) => {
    const selectedTheme = THEME_PRESETS.find(t => t.id === themeId);
    if (!selectedTheme) return;

    // Apply Brand Kit to entire template (sweep)
    const updatedBlocks = template.blocks.map(block => {
      const newStyle = { ...block.style };
      
      // Clear specific colors to let the theme override them
      if (block.type === 'header' || block.type === 'text' || block.type === 'quote' || block.type === 'footer') {
        delete newStyle.color;
      } else if (block.type === 'button') {
        delete newStyle.backgroundColor;
      }
      
      // Update font family
      delete newStyle.fontFamily;
      
      return {
        ...block,
        style: newStyle
      };
    });

    onUpdateTemplate({
      themeId: selectedTheme.id,
      globalSettings: {
        ...template.globalSettings,
        fontFamily: selectedTheme.typography.bodyFont,
        brandColors: {
          primary: selectedTheme.colors.primary,
          secondary: selectedTheme.colors.secondary,
          accent: selectedTheme.colors.accent,
        },
        contentBg: selectedTheme.colors.background,
        backgroundColor: selectedTheme.colors.background === '#ffffff' ? '#f1f5f9' : '#0f172a'
      },
      blocks: updatedBlocks,
    });
  };

  // Group registry blocks by category
  const categorizedBlocks: Record<string, BlockDefinition[]> = React.useMemo(() => {
    const groups: Record<string, BlockDefinition[]> = {
      content: [],
      layout: [],
      commerce: [],
      social: [],
      elements: [],
      advanced: []
    };
    
    // Sourced dynamically from the Map
    Array.from(blockRegistry.values()).forEach(def => {
      if (groups[def.category]) {
        groups[def.category].push(def);
      } else {
        groups.advanced.push(def);
      }
    });
    return groups;
  }, []);

  // Filtered patterns list
  const filteredPatterns = React.useMemo(() => {
    return sharedBlocks.filter(p => {
      const matchSearch = p.name.toLowerCase().includes(patternSearch.toLowerCase());
      const matchCat = patternCategory === 'all' || p.category === patternCategory;
      return matchSearch && matchCat;
    });
  }, [sharedBlocks, patternSearch, patternCategory]);

  // Filtered media assets list
  const filteredMedia = React.useMemo(() => {
    return mediaAssets.filter(m => {
      const matchSearch = m.name.toLowerCase().includes(mediaSearch.toLowerCase()) || m.altText.toLowerCase().includes(mediaSearch.toLowerCase());
      const matchCat = mediaCategory === 'all' || m.category === mediaCategory;
      return matchSearch && matchCat;
    });
  }, [mediaAssets, mediaSearch, mediaCategory]);

  // Create a new media asset handler
  const handleCreateMedia = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMediaUrl || !newMediaName) return;
    if (onAddMediaAsset) {
      onAddMediaAsset({
        name: newMediaName,
        url: newMediaUrl,
        category: newMediaCategory,
        altText: newMediaAlt || `Asset image of ${newMediaName}`
      });
      setNewMediaUrl('');
      setNewMediaName('');
      setNewMediaAlt('');
      setShowAddMediaForm(false);
    }
  };

  // Quick apply an asset to the currently selected image block
  const handleApplyMediaToSelected = (url: string) => {
    if (!selectedBlock || !onUpdateBlock) return;
    if (selectedBlock.type === 'image' || selectedBlock.type === 'productCard' || selectedBlock.type === 'hero') {
      onUpdateBlock(selectedBlock.id, {
        properties: {
          ...selectedBlock.properties,
          src: url
        }
      });
    } else if (selectedBlock.type === 'imageGrid') {
      // Update first slot for quick editing demo
      const nextImages = [...(selectedBlock.properties?.images || [])];
      if (nextImages[0]) {
        nextImages[0] = { ...nextImages[0], src: url };
        onUpdateBlock(selectedBlock.id, {
          properties: {
            ...selectedBlock.properties,
            images: nextImages
          }
        });
      }
    }
  };

  const activeApprovalState = template.approvalState || 'draft';

  return (
    <div id="editor-sidebar" className="w-full lg:w-80 rounded-xl border border-ink-2/50 bg-ink flex flex-col h-full overflow-hidden shadow-xl select-none text-text-on-ink">
      {/* 2-Row Bento Style Tab Selection grid */}
      <div className="p-3 border-b border-ink-2/40 bg-ink">
        <div className="grid grid-cols-4 gap-1 bg-ink-2 p-1 rounded-lg border border-ink-2/50">
          <button
            id="tab-blocks"
            onClick={() => setActiveTab('blocks')}
            className={`py-1.5 text-[9px] font-mono font-bold rounded transition-all uppercase tracking-wider flex flex-col items-center gap-0.5 cursor-pointer ${
              activeTab === 'blocks'
                ? 'bg-ink text-gold border border-gold/15 shadow-sm'
                : 'text-text-on-ink-muted hover:text-text-on-ink'
            }`}
            title="Content block builder elements"
          >
            <Boxes className="h-3.5 w-3.5" />
            <span>Blocks</span>
          </button>
          
          <button
            id="tab-elements"
            onClick={() => setActiveTab('elements')}
            className={`py-1.5 text-[9px] font-mono font-bold rounded transition-all uppercase tracking-wider flex flex-col items-center gap-0.5 cursor-pointer ${
              activeTab === 'elements'
                ? 'bg-ink text-gold border border-gold/15 shadow-sm'
                : 'text-text-on-ink-muted hover:text-text-on-ink'
            }`}
            title="Shapes, icons, stickers & lines"
          >
            <Shapes className="h-3.5 w-3.5" />
            <span>Elements</span>
          </button>
          
          <button
            id="tab-patterns"
            onClick={() => setActiveTab('patterns')}
            className={`py-1.5 text-[9px] font-mono font-bold rounded transition-all uppercase tracking-wider flex flex-col items-center gap-0.5 cursor-pointer ${
              activeTab === 'patterns'
                ? 'bg-ink text-gold border border-gold/15 shadow-sm'
                : 'text-text-on-ink-muted hover:text-text-on-ink'
            }`}
            title="Saved Patterns & Synced Global blocks"
          >
            <FolderHeart className="h-3.5 w-3.5" />
            <span>Patterns</span>
          </button>

          <button
            id="tab-media"
            onClick={() => setActiveTab('media')}
            className={`py-1.5 text-[9px] font-mono font-bold rounded transition-all uppercase tracking-wider flex flex-col items-center gap-0.5 cursor-pointer ${
              activeTab === 'media'
                ? 'bg-ink text-gold border border-gold/15 shadow-sm'
                : 'text-text-on-ink-muted hover:text-text-on-ink'
            }`}
            title="Shared Image asset library & AI Generator"
          >
            <ImageIcon className="h-3.5 w-3.5" />
            <span>Photos</span>
          </button>
        </div>

        <div className="grid grid-cols-3 gap-1 bg-ink-2 p-1 rounded-lg border border-ink-2/50 mt-1.5">
          <button
            id="tab-styles"
            onClick={() => setActiveTab('styles')}
            className={`py-1.5 text-[10px] font-mono font-bold rounded transition-all uppercase tracking-wider flex flex-col items-center gap-0.5 cursor-pointer ${
              activeTab === 'styles'
                ? 'bg-ink text-gold border border-gold/15 shadow-sm'
                : 'text-text-on-ink-muted hover:text-text-on-ink'
            }`}
            title="Global Style system & Theme switcher"
          >
            <Paintbrush className="h-3.5 w-3.5" />
            <span>Themes</span>
          </button>

          <button
            id="tab-presets"
            onClick={() => setActiveTab('presets')}
            className={`py-1.5 text-[10px] font-mono font-bold rounded transition-all uppercase tracking-wider flex flex-col items-center gap-0.5 cursor-pointer ${
              activeTab === 'presets'
                ? 'bg-ink text-gold border border-gold/15 shadow-sm'
                : 'text-text-on-ink-muted hover:text-text-on-ink'
            }`}
            title="Ready-made newsletters presets"
          >
            <BookOpen className="h-3.5 w-3.5" />
            <span>Presets</span>
          </button>

          <button
            id="tab-workflow"
            onClick={() => setActiveTab('workflow')}
            className={`py-1.5 text-[10px] font-mono font-bold rounded transition-all uppercase tracking-wider flex flex-col items-center gap-0.5 relative cursor-pointer ${
              activeTab === 'workflow'
                ? 'bg-ink text-gold border border-gold/15 shadow-sm'
                : 'text-text-on-ink-muted hover:text-text-on-ink'
            }`}
            title="Simulated Approval Workflow and User Roles"
          >
            <CheckSquare className="h-3.5 w-3.5" />
            <span>Status</span>
            {activeApprovalState !== 'draft' && (
              <span className={`absolute top-1 right-1 w-2 h-2 rounded-full ${activeApprovalState === 'approved' ? 'bg-emerald-500' : 'bg-purple-500'}`} />
            )}
          </button>
        </div>
      </div>

      {/* Tab Content Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5 bg-ink">
        
        {/* 1. BLOCKS TAB */}
        {activeTab === 'blocks' && (
          <div className="space-y-5">
            <div>
              <h3 className="text-sm font-serif font-bold text-text-on-ink flex items-center gap-1">
                Content Inserter
              </h3>
              <p className="text-[11px] text-text-on-ink-muted mt-1 leading-relaxed">
                Drag blocks onto the central canvas, or click any element to append it directly.
              </p>
            </div>

            {Object.entries(categorizedBlocks).map(([category, blocks]) => {
              if (category === 'elements' || blocks.length === 0) return null;
              return (
                <div key={category} className="space-y-2">
                  <h4 className="text-[10px] font-mono font-bold text-gold/85 uppercase tracking-widest border-b border-ink-2/50 pb-1">
                    {category} Elements
                  </h4>
                  <div className="grid grid-cols-2 gap-2.5">
                    {blocks.map((block) => {
                      const IconComponent = block.icon;
                      return (
                        <div
                          id={`block-item-${block.type}`}
                          key={block.type}
                          draggable
                          onDragStart={(e) => handleDragStart(e, block.type)}
                          onClick={() => onAddBlock(block.type)}
                          className="p-3 border border-dashed border-ink-2 rounded-lg flex flex-col items-center justify-center text-center hover:border-gold/50 hover:bg-ink-2/30 cursor-grab active:cursor-grabbing transition-all relative group bg-ink-2/15"
                        >
                          <div className="w-9 h-9 rounded bg-ink border border-ink-2 flex items-center justify-center text-text-on-ink-muted group-hover:bg-ink-2 group-hover:text-gold transition-colors">
                            <IconComponent className="h-4 w-4" />
                          </div>
                          <span className="text-[10px] font-mono font-bold text-text-on-ink-muted mt-2 group-hover:text-paper transition-colors">
                            {block.label}
                          </span>
                          <span className="text-[9px] text-text-on-ink-muted/75 line-clamp-1 mt-0.5 px-1">
                            {block.description}
                          </span>
                          <div className="absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-100 transition-opacity bg-gold text-ink rounded-full p-0.5 pointer-events-none">
                            <Plus className="h-2.5 w-2.5" />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* 1.5. ELEMENTS TAB */}
        {activeTab === 'elements' && (
          <div className="space-y-5">
            <div>
              <h3 className="text-sm font-serif font-bold text-text-on-ink flex items-center gap-1">
                Elements Library
              </h3>
              <p className="text-[11px] text-text-on-ink-muted mt-1 leading-relaxed">
                Add shapes, icons, stickers, and lines.
              </p>
            </div>

            {Object.entries(categorizedBlocks).map(([category, blocks]) => {
              if (category !== 'elements' || blocks.length === 0) return null;
              return (
                <div key={category} className="space-y-2">
                  <div className="grid grid-cols-2 gap-2.5">
                    {blocks.map((block) => {
                      const IconComponent = block.icon;
                      return (
                        <div
                          id={`block-item-${block.type}`}
                          key={block.type}
                          draggable
                          onDragStart={(e) => handleDragStart(e, block.type)}
                          onClick={() => onAddBlock(block.type)}
                          className="p-3 border border-dashed border-ink-2 rounded-lg flex flex-col items-center justify-center text-center hover:border-gold/50 hover:bg-ink-2/30 cursor-grab active:cursor-grabbing transition-all relative group bg-ink-2/15"
                        >
                          <div className="w-9 h-9 rounded bg-ink border border-ink-2 flex items-center justify-center text-text-on-ink-muted group-hover:bg-ink-2 group-hover:text-gold transition-colors">
                            <IconComponent className="h-4 w-4" />
                          </div>
                          <span className="text-[10px] font-mono font-bold text-text-on-ink-muted mt-2 group-hover:text-paper transition-colors">
                            {block.label}
                          </span>
                          <span className="text-[9px] text-text-on-ink-muted/75 line-clamp-1 mt-0.5 px-1">
                            {block.description}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* 2. PATTERNS & SYNCED BLOCKS TAB */}
        {activeTab === 'patterns' && (
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-serif font-bold text-text-on-ink">Patterns & Global Blocks</h3>
              <p className="text-[11px] text-text-on-ink-muted mt-1 leading-relaxed">
                Insert pre-designed layouts. <strong className="text-gold font-semibold">Synced Global Blocks</strong> stay synchronized across all templates.
              </p>
            </div>

            {/* Filter and Search Bar */}
            <div className="space-y-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-text-on-ink-muted" />
                <input
                  type="text"
                  placeholder="Search saved patterns..."
                  value={patternSearch}
                  onChange={(e) => setPatternSearch(e.target.value)}
                  className="w-full text-xs pl-8 pr-3 py-2 border border-ink-2/60 rounded bg-ink-2 text-text-on-ink outline-none focus:border-gold placeholder:text-text-on-ink-muted/50"
                />
              </div>

              {/* Categories */}
              <div className="flex flex-wrap gap-1.5">
                {['all', 'header', 'footer', 'cta', 'product', 'general'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setPatternCategory(cat)}
                    className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase transition-all cursor-pointer ${
                      patternCategory === cat
                        ? 'bg-gold text-ink shadow-sm'
                        : 'bg-ink-2 text-text-on-ink-muted hover:text-text-on-ink hover:bg-ink-2/80'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* List of custom patterns */}
            <div className="space-y-2.5 pt-2">
              {filteredPatterns.map((shared) => (
                <div
                  key={shared.id}
                  className={`p-3 rounded border transition-all relative group flex justify-between items-center bg-ink-2/15 ${
                    shared.isGlobal 
                      ? 'border-emerald-950/40 hover:border-emerald-500/40' 
                      : 'border-ink-2 hover:border-gold/30'
                  }`}
                >
                  <div className="flex-1 min-w-0 pr-4">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-paper truncate">
                        {shared.name}
                      </span>
                      <span className={`text-[8px] font-mono font-bold px-1.5 py-0.2 rounded uppercase ${
                        shared.isGlobal 
                          ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-900/40' 
                          : 'bg-ink-2 text-gold border border-gold/10'
                      }`}>
                        {shared.isGlobal ? 'Synced' : 'Pattern'}
                      </span>
                    </div>
                    <p className="text-[9px] text-text-on-ink-muted/70 mt-1 capitalize">
                      Category: {shared.category} • {shared.block.type} block
                    </p>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => onAddBlockFromShared && onAddBlockFromShared(shared.id)}
                      className={`p-1 rounded transition-colors cursor-pointer ${
                        shared.isGlobal 
                          ? 'bg-emerald-950 text-emerald-400 hover:bg-emerald-500 hover:text-white' 
                          : 'bg-ink text-gold border border-gold/15 hover:bg-gold hover:text-ink'
                      }`}
                      title="Insert block pattern"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                    {onDeleteSharedBlock && (
                      <button
                        onClick={() => onDeleteSharedBlock(shared.id)}
                        className="p-1 rounded text-text-on-ink-muted hover:bg-red-950/40 hover:text-red-400 transition-colors cursor-pointer"
                        title="Delete from Library"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}

              {filteredPatterns.length === 0 && (
                <div className="text-center py-6 border border-dashed border-ink-2 rounded">
                  <Sliders className="h-6 w-6 text-text-on-ink-muted mx-auto mb-1.5" />
                  <p className="text-[11px] text-text-on-ink-muted font-bold font-mono uppercase tracking-wider">
                    No matching patterns found.
                  </p>
                  <p className="text-[9px] text-text-on-ink-muted/70 mt-1 max-w-[200px] mx-auto leading-relaxed">
                    Select a block on canvas and click Bookmark/Refresh to save current content!
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 3. MEDIA LIBRARY TAB */}
        {activeTab === 'media' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-sm font-serif font-bold text-text-on-ink">Asset Media Library</h3>
                <p className="text-[11px] text-text-on-ink-muted mt-0.5">Manage and inject brand images.</p>
              </div>
              <button
                id="btn-toggle-add-media"
                onClick={() => setShowAddMediaForm(!showAddMediaForm)}
                className="px-2.5 py-1 text-[10px] font-mono font-bold uppercase tracking-wider border border-gold text-gold hover:bg-gold hover:text-ink rounded transition-all cursor-pointer"
              >
                {showAddMediaForm ? 'Cancel' : 'Add Image'}
              </button>
            </div>

            {/* Image upload simulation form */}
            {showAddMediaForm && (
              <form onSubmit={handleCreateMedia} className="p-3 bg-ink-2 rounded border border-ink-2/60 space-y-2.5">
                <div>
                  <label className="block text-[9px] font-mono font-bold text-gold uppercase tracking-widest mb-1">Image URL</label>
                  <input
                    type="url"
                    required
                    placeholder="https://images.unsplash.com/..."
                    value={newMediaUrl}
                    onChange={(e) => setNewMediaUrl(e.target.value)}
                    className="w-full text-xs px-2.5 py-1.5 border border-ink-2/80 rounded bg-ink text-text-on-ink outline-none focus:border-gold placeholder:text-text-on-ink-muted/40"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[9px] font-mono font-bold text-gold uppercase tracking-widest mb-1">Friendly Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Watch Banner"
                      value={newMediaName}
                      onChange={(e) => setNewMediaName(e.target.value)}
                      className="w-full text-xs px-2.5 py-1.5 border border-ink-2/80 rounded bg-ink text-text-on-ink outline-none focus:border-gold placeholder:text-text-on-ink-muted/40"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-mono font-bold text-gold uppercase tracking-widest mb-1">Category</label>
                    <select
                      value={newMediaCategory}
                      onChange={(e) => setNewMediaCategory(e.target.value as any)}
                      className="w-full text-xs px-2.5 py-1.5 border border-ink-2/80 rounded bg-ink text-text-on-ink outline-none focus:border-gold"
                    >
                      <option value="general">General</option>
                      <option value="logos">Logos</option>
                      <option value="banners">Banners</option>
                      <option value="products">Products</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-[9px] font-mono font-bold text-gold uppercase tracking-widest mb-1">Alt Text (Accessibility)</label>
                  <input
                    type="text"
                    placeholder="Describe image content..."
                    value={newMediaAlt}
                    onChange={(e) => setNewMediaAlt(e.target.value)}
                    className="w-full text-xs px-2.5 py-1.5 border border-ink-2/80 rounded bg-ink text-text-on-ink outline-none focus:border-gold placeholder:text-text-on-ink-muted/40"
                  />
                </div>
                <div className="pt-1 border-t border-ink-2/40">
                  <label className="block text-[9px] font-mono font-bold text-gold uppercase tracking-widest mb-1">Or Upload Local File</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (event) => {
                          const base64 = event.target?.result as string;
                          setNewMediaUrl(base64);
                          if (!newMediaName) setNewMediaName(file.name);
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="w-full text-[10px] text-text-on-ink-muted file:mr-2 file:py-1 file:px-2 file:rounded file:border file:border-gold file:text-[10px] file:font-bold file:bg-transparent file:text-gold hover:file:bg-gold hover:file:text-ink cursor-pointer"
                  />
                </div>
                <button
                  id="btn-save-media-asset"
                  type="submit"
                  className="w-full py-1.5 bg-gold hover:bg-gold-hover text-ink font-mono font-bold text-xs uppercase tracking-wider rounded transition-all cursor-pointer shadow-lg shadow-gold/20"
                >
                  Save Image to Account
                </button>
              </form>
            )}

            {/* Media Search & Category Filtering */}
            <div className="space-y-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-text-on-ink-muted" />
                <input
                  type="text"
                  placeholder="Search media..."
                  value={mediaSearch}
                  onChange={(e) => setMediaSearch(e.target.value)}
                  className="w-full text-xs pl-8 pr-3 py-2 border border-ink-2/60 rounded bg-ink-2 text-text-on-ink outline-none focus:border-gold placeholder:text-text-on-ink-muted/40"
                />
              </div>

              <div className="flex flex-wrap gap-1.5">
                {['all', 'logos', 'banners', 'products', 'general'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setMediaCategory(cat)}
                    className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase transition-all cursor-pointer ${
                      mediaCategory === cat
                        ? 'bg-gold text-ink shadow-sm'
                        : 'bg-ink-2 text-text-on-ink-muted hover:text-text-on-ink hover:bg-ink-2/80'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Media grid list */}
            <div className="grid grid-cols-2 gap-2.5 pt-1">
              {filteredMedia.map((asset) => {
                const hasMissingAlt = !asset.altText || asset.altText === '';
                return (
                  <div key={asset.id} className="border border-ink-2 bg-ink-2/15 rounded-lg p-2 flex flex-col justify-between group relative overflow-hidden">
                    <div className="relative aspect-video rounded overflow-hidden bg-ink-2 mb-1.5">
                      <img
                        src={asset.url}
                        alt={asset.altText}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                      
                      {/* Alt text warnings */}
                      {hasMissingAlt && (
                        <div className="absolute top-1 right-1 bg-seal text-paper p-0.5 rounded-full shadow-md" title="Missing Alt Text (Required for accessibility)">
                          <AlertCircle className="h-3 w-3" />
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 mb-2">
                      <h4 className="text-[10px] font-bold text-paper truncate" title={asset.name}>
                        {asset.name}
                      </h4>
                      <p className="text-[8px] font-mono text-text-on-ink-muted truncate mt-0.5">
                        {asset.category.toUpperCase()}
                      </p>
                    </div>

                    <div className="grid grid-cols-3 gap-1">
                      <button
                        onClick={() => handleApplyMediaToSelected(asset.url)}
                        disabled={!selectedBlock || !['image', 'productCard', 'hero', 'imageGrid'].includes(selectedBlock.type)}
                        className="col-span-2 py-1 px-1 text-[9px] border border-gold text-gold hover:bg-gold hover:text-ink rounded font-bold disabled:opacity-35 disabled:pointer-events-none transition-all cursor-pointer"
                        title="Inject into current selected canvas block"
                      >
                        Apply
                      </button>
                      
                      {onDeleteMediaAsset && (
                        <button
                          onClick={() => onDeleteMediaAsset(asset.id)}
                          className="py-1 px-1 text-[9px] text-text-on-ink-muted hover:text-rose-400 rounded flex items-center justify-center hover:bg-ink-2 transition-colors cursor-pointer"
                          title="Delete from Library"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}

              {filteredMedia.length === 0 && (
                <div className="col-span-2 text-center py-6 text-text-on-ink-muted text-xs">
                  No images found matching criteria.
                </div>
              )}
            </div>
          </div>
        )}

        {/* 4. GLOBAL THEMES & STYLES TAB */}
        {activeTab === 'styles' && (
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-serif font-bold text-text-on-ink">Global Style Tokens</h3>
              <p className="text-[11px] text-text-on-ink-muted mt-0.5 leading-relaxed">
                Centralized theme and design variables mapped across all dynamic components.
              </p>
            </div>

            {/* Theme Presets SWITCHER Catalog */}
            <div className="space-y-2">
              <h4 className="text-[10px] font-mono font-bold uppercase text-gold/80 tracking-wider">
                Theme Presets Switcher
              </h4>
              <div className="grid grid-cols-1 gap-2">
                {THEME_PRESETS.map((t) => {
                  const isActive = template.themeId === t.id;
                  return (
                    <button
                      key={t.id}
                      onClick={() => handleSelectTheme(t.id)}
                      className={`w-full p-2.5 rounded border text-left transition-all relative flex flex-col gap-1.5 cursor-pointer ${
                        isActive
                          ? 'border-gold bg-ink-2 shadow-xs ring-1 ring-gold/15'
                          : 'border-ink-2 hover:border-gold/35 bg-ink-2/15'
                      }`}
                    >
                      <div className="flex justify-between items-center w-full">
                        <span className="text-xs font-bold text-paper">
                          {t.name}
                        </span>
                        {isActive && (
                          <span className="bg-gold text-ink rounded-full p-0.5">
                            <Check className="h-2.5 w-2.5" />
                          </span>
                        )}
                      </div>

                      <div className="flex justify-between items-center w-full">
                        {/* Swatches indicator */}
                        <div className="flex gap-1.5">
                          <span className="w-4.5 h-4.5 rounded-full border border-ink shadow-2xs block" style={{ backgroundColor: t.colors.primary }} />
                          <span className="w-4.5 h-4.5 rounded-full border border-ink shadow-2xs block" style={{ backgroundColor: t.colors.secondary }} />
                          <span className="w-4.5 h-4.5 rounded-full border border-ink shadow-2xs block" style={{ backgroundColor: t.colors.accent }} />
                          <span className="w-4.5 h-4.5 rounded-full border border-ink shadow-2xs block" style={{ backgroundColor: t.colors.background }} />
                        </div>
                        {/* Font info */}
                        <span className="text-[8px] font-mono text-text-on-ink-muted truncate max-w-40">
                          {t.typography.headingFont.split(',')[0]}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom Palette and Design Token Overrides */}
            <div className="pt-2 border-t border-ink-2/40 space-y-3.5">
              <h4 className="text-[10px] font-mono font-bold uppercase text-gold/80 tracking-wider">
                Custom Palette Overrides
              </h4>

              {/* Brand palette config */}
              <div className="grid grid-cols-3 gap-2 bg-ink-2/20 p-3 rounded border border-ink-2">
                <div className="flex flex-col items-center gap-1.5">
                  <label className="text-[9px] font-mono font-bold text-text-on-ink-muted uppercase tracking-tight">Primary</label>
                  <input
                    type="color"
                    value={template.globalSettings.brandColors?.primary || '#3b82f6'}
                    onChange={(e) => updateBrandColor('primary', e.target.value)}
                    className="w-full h-8 rounded cursor-pointer overflow-hidden p-0 border border-ink-2 bg-transparent"
                  />
                </div>
                <div className="flex flex-col items-center gap-1.5">
                  <label className="text-[9px] font-mono font-bold text-text-on-ink-muted uppercase tracking-tight">Secondary</label>
                  <input
                    type="color"
                    value={template.globalSettings.brandColors?.secondary || '#6366f1'}
                    onChange={(e) => updateBrandColor('secondary', e.target.value)}
                    className="w-full h-8 rounded cursor-pointer overflow-hidden p-0 border border-ink-2 bg-transparent"
                  />
                </div>
                <div className="flex flex-col items-center gap-1.5">
                  <label className="text-[9px] font-mono font-bold text-text-on-ink-muted uppercase tracking-tight">Accent</label>
                  <input
                    type="color"
                    value={template.globalSettings.brandColors?.accent || '#f43f5e'}
                    onChange={(e) => updateBrandColor('accent', e.target.value)}
                    className="w-full h-8 rounded cursor-pointer overflow-hidden p-0 border border-ink-2 bg-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Layout Dimensions */}
            <div className="pt-2 border-t border-ink-2/40 space-y-3">
              <h4 className="text-[10px] font-mono font-bold uppercase text-gold/80 tracking-wider">
                Dimensions & Canvas Options
              </h4>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-mono font-bold text-text-on-ink-muted mb-1">Canvas Width</label>
                  <input
                    type="number"
                    value={template.globalSettings.contentWidth}
                    onChange={(e) => updateGlobalSetting('contentWidth', Number(e.target.value))}
                    className="w-full text-xs px-2.5 py-1.5 border border-ink-2/80 rounded bg-ink text-text-on-ink outline-none focus:border-gold"
                    min={480}
                    max={800}
                    step={10}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono font-bold text-text-on-ink-muted mb-1">Corner Rounding</label>
                  <input
                    type="number"
                    value={template.globalSettings.borderRadius}
                    onChange={(e) => updateGlobalSetting('borderRadius', Number(e.target.value))}
                    className="w-full text-xs px-2.5 py-1.5 border border-ink-2/80 rounded bg-ink text-text-on-ink outline-none focus:border-gold"
                    min={0}
                    max={32}
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-mono font-bold text-text-on-ink-muted mb-1">Canvas Background</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={template.globalSettings.contentBg}
                    onChange={(e) => updateGlobalSetting('contentBg', e.target.value)}
                    className="w-8 h-8 rounded cursor-pointer border border-ink-2 p-0"
                  />
                  <input
                    type="text"
                    value={template.globalSettings.contentBg}
                    onChange={(e) => updateGlobalSetting('contentBg', e.target.value)}
                    className="flex-1 text-xs px-2.5 py-1.5 border border-ink-2/80 rounded bg-ink text-text-on-ink outline-none focus:border-gold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-mono font-bold text-text-on-ink-muted mb-1">Global Font Family</label>
                <select
                  value={template.globalSettings.fontFamily}
                  onChange={(e) => updateGlobalSetting('fontFamily', e.target.value)}
                  className="w-full text-xs px-2.5 py-1.5 border border-ink-2/80 rounded bg-ink text-text-on-ink outline-none focus:border-gold"
                >
                  <option value='"Inter", sans-serif'>Inter (Sans-serif)</option>
                  <option value='"Playfair Display", Georgia, serif'>Playfair (Elegant Serif)</option>
                  <option value='"Space Grotesk", sans-serif'>Space Grotesk (Tech Modern)</option>
                  <option value='"Outfit", sans-serif'>Outfit (Geometric)</option>
                  <option value='"JetBrains Mono", monospace'>JetBrains Mono (Technical)</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* 5. READY-MADE PRESETS TAB */}
        {activeTab === 'presets' && (
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-serif font-bold text-text-on-ink">Starter Foundations</h3>
              <p className="text-[11px] text-text-on-ink-muted mt-0.5 leading-relaxed">
                Load high-converting templates. This will replace active canvas elements.
              </p>
            </div>

            <div className="space-y-3">
              {STARTER_TEMPLATES.map((tpl) => (
                <button
                  id={`preset-load-${tpl.id}`}
                  key={tpl.id}
                  onClick={() => onLoadTemplate(tpl)}
                  className={`w-full text-left p-3.5 rounded border transition-all flex flex-col gap-1.5 group cursor-pointer ${
                    template.id === tpl.id 
                      ? 'border-gold bg-ink-2 ring-1 ring-gold/15' 
                      : 'border-ink-2 hover:border-gold/30 hover:bg-ink-2/10'
                  }`}
                >
                  <div className="flex justify-between items-center w-full">
                    <span className="text-xs font-bold text-paper group-hover:text-gold transition-colors">
                      {tpl.name}
                    </span>
                    <span className="text-[9px] bg-ink border border-ink-2 text-text-on-ink-muted px-1.5 py-0.5 rounded font-mono font-bold">
                      {tpl.blocks.length} blocks
                    </span>
                  </div>
                  <p className="text-[10px] text-text-on-ink-muted/80">
                    {tpl.subject}
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 6. APPROVAL WORKFLOW & ROLES TAB */}
        {activeTab === 'workflow' && (
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-serif font-bold text-text-on-ink">Role & Approvals</h3>
              <p className="text-[11px] text-text-on-ink-muted mt-0.5 leading-relaxed">
                Enforce marketing locks, roles compliance, and approval review tracking.
              </p>
            </div>

            {/* simulated Role Switcher */}
            <div className="space-y-2 bg-ink-2/15 p-3 rounded border border-ink-2">
              <label className="text-[9px] font-mono font-bold uppercase text-gold/80 tracking-wider flex items-center gap-1">
                <Users className="h-3 w-3 text-gold" />
                Simulate Current Role
              </label>
              <div className="grid grid-cols-3 gap-1 bg-ink p-1 rounded">
                {(['owner', 'editor', 'contributor'] as const).map((role) => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => onChangeRole && onChangeRole(role)}
                    className={`py-1 text-[10px] font-mono font-bold rounded transition-all capitalize cursor-pointer ${
                      currentRole === role
                        ? 'bg-gold text-ink shadow-sm'
                        : 'text-text-on-ink-muted hover:text-paper'
                    }`}
                  >
                    {role}
                  </button>
                ))}
              </div>
            </div>

            {/* Approval State Panel */}
            <div className="p-4 rounded border border-dashed flex flex-col gap-3.5 bg-ink-2/10 border-ink-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-text-on-ink-muted">Campaign Status</span>
                
                {activeApprovalState === 'draft' && (
                  <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 bg-ink text-gold rounded border border-gold/15 uppercase tracking-wider">
                    Drafting
                  </span>
                )}
                {activeApprovalState === 'in_review' && (
                  <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 bg-seal text-paper rounded uppercase tracking-wider">
                    In Review
                  </span>
                )}
                {activeApprovalState === 'approved' && (
                  <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 bg-emerald-950 text-emerald-400 border border-emerald-900/40 rounded uppercase tracking-wider">
                    Approved
                  </span>
                )}
              </div>

              {/* Status information descriptions */}
              <p className="text-[11px] text-text-on-ink-muted/80 leading-relaxed">
                {activeApprovalState === 'draft' && 'The campaign is currently in development. You can submit it for owner/editor review when ready.'}
                {activeApprovalState === 'in_review' && 'The draft is in review. Owner or Editor permission is required to lock edits and mark as Approved.'}
                {activeApprovalState === 'approved' && '🎉 Approved! Campaign layout is locked and verified. Editing any element will automatically reset status back to review.'}
              </p>

              {/* Dynamic Action Buttons */}
              <div className="pt-2">
                {currentRole === 'contributor' ? (
                  activeApprovalState === 'draft' ? (
                    <button
                      onClick={() => onUpdateTemplate({ approvalState: 'in_review' })}
                      className="w-full py-2 bg-gold hover:bg-gold/90 text-ink font-mono font-bold text-xs uppercase tracking-wider rounded transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <span>Submit for Review</span>
                      <ArrowRight className="h-3 w-3" />
                    </button>
                  ) : (
                    <div className="p-2.5 bg-seal/10 rounded border border-seal/25 flex items-start gap-2">
                      <AlertCircle className="h-4 w-4 text-seal shrink-0 mt-0.5" />
                      <span className="text-[10px] text-paper font-semibold leading-normal">
                        Approval is locked. Contributor role cannot approve drafts. Ask an Owner or Editor to sign-off.
                      </span>
                    </div>
                  )
                ) : (
                  /* Owner or Editor Controls */
                  <div className="flex flex-col gap-2">
                    {activeApprovalState !== 'approved' ? (
                      <button
                        onClick={() => onUpdateTemplate({ approvalState: 'approved' })}
                        className="w-full py-2 bg-gold hover:bg-gold/90 text-ink font-mono font-bold text-xs uppercase tracking-wider rounded transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Check className="h-3.5 w-3.5" />
                        <span>Approve Layout</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => onUpdateTemplate({ approvalState: 'draft' })}
                        className="w-full py-2 bg-ink text-text-on-ink-muted border border-ink-2 hover:border-gold/30 hover:text-paper font-mono font-bold text-xs uppercase tracking-wider rounded transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Minus className="h-3.5 w-3.5" />
                        <span>Return to Draft</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Simulated Activity Timeline Log */}
            <div className="space-y-3 pt-2">
              <h4 className="text-[10px] font-mono font-bold uppercase text-gold/80 tracking-wider">
                Approval Event Logs
              </h4>

              <div className="space-y-3.5 pl-3 border-l border-ink-2 relative font-sans">
                <div className="relative">
                  <div className="absolute -left-[16.5px] top-1 w-2 h-2 rounded-full bg-gold ring-4 ring-ink" />
                  <p className="text-[10px] font-bold text-paper leading-none">Campaign Draft Initiated</p>
                  <p className="text-[9px] text-text-on-ink-muted mt-1 font-mono">By Contributor • Just now</p>
                </div>

                <div className="relative">
                  <div className="absolute -left-[16.5px] top-1 w-2 h-2 rounded-full bg-seal ring-4 ring-ink" />
                  <p className="text-[10px] font-bold text-paper leading-none">Starter Template Loaded</p>
                  <p className="text-[9px] text-text-on-ink-muted mt-1 font-mono">Theme presets synchronized • 2m ago</p>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
