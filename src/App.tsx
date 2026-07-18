import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Undo2, 
  Redo2, 
  Trash2, 
  Sparkles, 
  Save, 
  Play, 
  FileCode, 
  Eye, 
  Check, 
  Download, 
  RefreshCw,
  HelpCircle,
  LayoutGrid,
  Code2,
  Inbox,
  Sun,
  Moon,
  Sliders,
  ArrowLeft,
  Clock,
  Heading,
  Type,
  Image as ImageIcon,
  Square,
  Minus,
  Layout,
  Share2,
  FileText,
  Link,
  Grid,
  Layers,
  ShieldCheck
} from 'lucide-react';
import { EmailTemplate, EmailBlock, BlockType, UndoRedoState, SharedBlock, MediaAsset } from './types';
import Sidebar from './components/Sidebar';
import Canvas from './components/Canvas';
import Inspector from './components/Inspector';
import Postmark from './components/Postmark';
import CodeViewer from './components/CodeViewer';
import PreviewModal from './components/PreviewModal';
import SmartLayoutModal from './components/SmartLayoutModal';
import QualityCheckModal from './components/QualityCheckModal';
import HomeHub from './components/HomeHub';
import VersionHistorySidebar from './components/VersionHistorySidebar';
import LayersPanel from './components/LayersPanel';
import DeliverabilityPanel from './components/DeliverabilityPanel';
import { STARTER_TEMPLATES } from './utils/templates';
import { generateHTML } from './utils/htmlGenerator';
import { toPng } from 'html-to-image';

const AUTOSAVE_KEY = 'easy-email-builder-state-v1';

import { blockRegistry } from './blocks/registry';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<'home' | 'editor'>('home');
  const [draftsList, setDraftsList] = useState<EmailTemplate[]>([]);
  const [mobileWorkspaceView, setMobileWorkspaceView] = useState<'elements' | 'canvas' | 'inspector'>('canvas');

  // Main Template state - defaults to the first starter template
  const [template, setTemplate] = useState<EmailTemplate>(STARTER_TEMPLATES[0]);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);

  // PRD v2 Additions State
  const [currentRole, setCurrentRole] = useState<'owner' | 'editor' | 'contributor'>('owner');

  const [sharedBlocks, setSharedBlocks] = useState<SharedBlock[]>(() => {
    try {
      const stored = localStorage.getItem('easy-email-shared-blocks');
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error(e);
    }
    // Default initial mock patterns and global synced blocks!
    return [
      {
        id: 'shared-pattern-hero-dark',
        name: 'Midnight Premium Hero Banner',
        category: 'general',
        isGlobal: false,
        usedInTemplateIds: [],
        block: {
          id: 'shared-hero-block',
          type: 'hero',
          style: {
            paddingTop: 40,
            paddingBottom: 40,
            paddingLeft: 20,
            paddingRight: 20,
            color: '#ffffff',
            backgroundColor: '#0f172a'
          },
          properties: {
            src: 'https://images.unsplash.com/photo-1499951360447-b19be8fe80f5?w=1000',
            overlayPosition: 'center',
            overlayScrim: 'rgba(15, 23, 42, 0.7)',
            alt: 'Midnight design banner cover'
          },
          content: '<h1 style="font-size: 28px; font-weight: bold; margin-bottom: 10px;">EXQUISITE MODERN CRAFT</h1><p style="font-size: 14px; opacity: 0.85;">Discover our collection of timeless premium pieces, designed for the minimalist enthusiast.</p>'
        }
      },
      {
        id: 'shared-global-footer-brand',
        name: 'Brand Compliance Global Footer',
        category: 'footer',
        isGlobal: true,
        usedInTemplateIds: [],
        block: {
          id: 'shared-footer-block',
          type: 'footer',
          style: {
            paddingTop: 30,
            paddingBottom: 30,
            paddingLeft: 20,
            paddingRight: 20,
            color: '#64748b',
            backgroundColor: '#f8fafc'
          },
          properties: {
            socialLinks: [
              { platform: 'facebook', url: 'https://facebook.com' },
              { platform: 'twitter', url: 'https://twitter.com' },
              { platform: 'website', url: 'https://brand.com' }
            ]
          },
          content: '<p style="font-size: 11px; margin-bottom: 8px;">© 2026 Acme Brand Inc. All rights reserved.</p><p style="font-size: 10px; opacity: 0.8;">You received this because you are subscribed to brand updates. <a href="#" style="color: #3b82f6; text-decoration: underline;">Unsubscribe instantly</a></p>'
        }
      }
    ];
  });

  const [mediaAssets, setMediaAssets] = useState<MediaAsset[]>(() => {
    try {
      const stored = localStorage.getItem('easy-email-media-assets');
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error(e);
    }
    // High-quality default Unsplash items
    return [
      {
        id: 'media-watch-minimal',
        name: 'Minimalist White Watch',
        url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600',
        category: 'products',
        altText: 'Premium white ceramic watch dial on modern grey background',
        createdAt: Date.now()
      },
      {
        id: 'media-cam-classic',
        name: 'Classic Vintage Camera',
        url: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600',
        category: 'products',
        altText: 'Retro yellow-toned mechanical rangefinder film camera',
        createdAt: Date.now()
      },
      {
        id: 'media-headphones-gold',
        name: 'Premium Wireless Headphones',
        url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600',
        category: 'products',
        altText: 'Golden-rimmed wireless over-ear noise-cancelling headphones',
        createdAt: Date.now()
      },
      {
        id: 'media-desk-minimal',
        name: 'Modern Workspace Tech Desk',
        url: 'https://images.unsplash.com/photo-1499951360447-b19be8fe80f5?w=1000',
        category: 'banners',
        altText: 'Clean workspace desk with iMac, mechanical keyboard, and ceramic cup',
        createdAt: Date.now()
      },
      {
        id: 'media-logo-acme',
        name: 'Acme Minimalist Logo',
        url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200',
        category: 'logos',
        altText: 'Geometric corporate brand mark design abstract art',
        createdAt: Date.now()
      }
    ];
  });

  // Persist sharedBlocks and mediaAssets whenever they change
  useEffect(() => {
    localStorage.setItem('easy-email-shared-blocks', JSON.stringify(sharedBlocks));
  }, [sharedBlocks]);

  useEffect(() => {
    localStorage.setItem('easy-email-media-assets', JSON.stringify(mediaAssets));
  }, [mediaAssets]);

  // Drag and drop preview ghost element state
  const [draggedNewBlockType, setDraggedNewBlockType] = useState<BlockType | null>(null);
  const [dragCoords, setDragCoords] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    if (!draggedNewBlockType) return;

    const handleGlobalDragOver = (e: DragEvent) => {
      // Prevent browser default animations
      e.preventDefault();
      setDragCoords({ x: e.clientX, y: e.clientY });
    };
    
    const handleGlobalDragEnd = () => {
      setDraggedNewBlockType(null);
      setDragCoords(null);
    };

    window.addEventListener('dragover', handleGlobalDragOver);
    window.addEventListener('dragend', handleGlobalDragEnd);
    window.addEventListener('drop', handleGlobalDragEnd);

    return () => {
      window.removeEventListener('dragover', handleGlobalDragOver);
      window.removeEventListener('dragend', handleGlobalDragEnd);
      window.removeEventListener('drop', handleGlobalDragEnd);
    };
  }, [draggedNewBlockType]);

  // Undo / Redo history stacks
  const [history, setHistory] = useState<UndoRedoState>({
    past: [],
    future: [],
  });

  // Editor screen mode: 'design' (split with canvas) or 'developer' (full code sandbox) or 'split' (side-by-side canvas + code)
  const [viewMode, setViewMode] = useState<'design' | 'developer' | 'split'>('design');
  const [autosaveStatus, setAutosaveStatus] = useState<'saved' | 'saving' | 'idle'>('saved');
  const [lastSavedTime, setLastSavedTime] = useState<string>('');
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isSmartLayoutOpen, setIsSmartLayoutOpen] = useState(false);
  const [isLayersPanelOpen, setIsLayersPanelOpen] = useState(false);
  const [isQualityCheckOpen, setIsQualityCheckOpen] = useState(false);
  const [isDeliverabilityOpen, setIsDeliverabilityOpen] = useState(false);

  const handleApplySmartLayout = (improvedTemplate: EmailTemplate, suggestions: string[]) => {
    saveStateToHistory(improvedTemplate);
    setTemplate(improvedTemplate);
    showToast('AI Smart Layout applied successfully!', 'success');
  };

  // Toast notification state
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ message, type });
  };

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 6000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Light/Dark mode state
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('easy-email-theme') as 'light' | 'dark') || 'light';
  });

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('easy-email-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const [snapshots, setSnapshots] = useState<{id: string, timestamp: number, template: EmailTemplate}[]>([]);
  const [isVersionHistoryOpen, setIsVersionHistoryOpen] = useState(false);
  const [showGrid, setShowGrid] = useState(false);

  const handleValidateEmail = () => {
    // A robust URL regex
    const urlRegex = /^(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})$/i;
    let hasInvalid = false;
    let invalidCount = 0;

    const checkUrl = (url?: string) => {
      if (!url) return;
      if (url === '#' || url.startsWith('mailto:')) return;
      if (!urlRegex.test(url)) {
        hasInvalid = true;
        invalidCount++;
      }
    };

    template.blocks.forEach(block => {
      if (block.type === 'image' || block.type === 'productCard' || block.type === 'hero') {
         checkUrl(block.properties?.src);
      }
      if (block.type === 'button' || block.type === 'hero' || block.type === 'productCard' || block.type === 'image') {
         checkUrl(block.properties?.href);
      }
      if (block.type === 'imageGrid') {
         block.properties?.images?.forEach((img: any) => {
           checkUrl(img.src);
           checkUrl(img.href);
         });
      }
      if (block.type === 'navbar') {
         block.properties?.socialLinks?.forEach((link: any) => checkUrl(link.url));
      }
      if (block.type === 'section') {
         block.properties?.columns?.forEach((col: EmailBlock[]) => {
            col.forEach(b => {
                if (b.type === 'image' || b.type === 'productCard' || b.type === 'hero') checkUrl(b.properties?.src);
                if (b.type === 'button' || b.type === 'hero' || b.type === 'productCard' || b.type === 'image') checkUrl(b.properties?.href);
            });
         });
      }
    });

    if (hasInvalid) {
      showToast(`Found ${invalidCount} invalid URL(s). Please review your links and image sources.`, 'error');
    } else {
      showToast('All links and images are valid!', 'success');
    }
  };

  // Helper to sync edited template back into our drafts list array
  const updateDraftsListWithTemplate = (tpl: EmailTemplate) => {
    try {
      const existingStr = localStorage.getItem('easy-email-drafts-v2');
      let currentDrafts: EmailTemplate[] = [];
      if (existingStr) {
        currentDrafts = JSON.parse(existingStr);
      }
      // Filter out existing draft with same ID and prepend the newest update
      const updated = [
        { ...tpl, updatedAt: Date.now() },
        ...currentDrafts.filter((d) => d.id !== tpl.id)
      ].slice(0, 12); // limit to 12 recent drafts
      setDraftsList(updated);
      localStorage.setItem('easy-email-drafts-v2', JSON.stringify(updated));
    } catch (err) {
      console.warn('Failed to update drafts list:', err);
    }
  };

  // Manual save handler for local storage
  const handleManualSave = async () => {
    if (!template) return;
    try {
      let updatedTemplate = { ...template };
      
      // Attempt to capture a fresh thumbnail
      const canvasElement = document.getElementById('email-editor-stage');
      if (canvasElement) {
        try {
          const thumbnailDataUrl = await toPng(canvasElement, { 
            pixelRatio: 0.3, 
            quality: 0.3,
            backgroundColor: template.globalSettings.backgroundColor || '#ffffff' 
          });
          updatedTemplate.thumbnail = thumbnailDataUrl;
          updatedTemplate.updatedAt = Date.now();
          setTemplate(updatedTemplate);
        } catch (err) {
          console.warn('Manual-thumbnail capture failed:', err);
        }
      }

      localStorage.setItem(AUTOSAVE_KEY, JSON.stringify(updatedTemplate));
      updateDraftsListWithTemplate(updatedTemplate);
      setAutosaveStatus('saved');
      setLastSavedTime(new Date().toLocaleTimeString());
      showToast('Template manually saved to local storage successfully!', 'success');
    } catch (e) {
      showToast('Manual save failed! Local storage is full. Export your template to preserve changes.', 'error');
    }
  };

  // 1. Initial State Loading from localStorage (if exists)
  useEffect(() => {
    try {
      // Load drafts list
      const existingStr = localStorage.getItem('easy-email-drafts-v2');
      if (existingStr) {
        const parsed = JSON.parse(existingStr);
        if (Array.isArray(parsed)) {
          setDraftsList(parsed);
        }
      }

      // Load active/autosaved template
      const cached = localStorage.getItem(AUTOSAVE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed && parsed.blocks && parsed.globalSettings) {
          setTemplate(parsed);
          setLastSavedTime(new Date().toLocaleTimeString());
        }
      }
    } catch (e) {
      console.warn('Failed to load initial state:', e);
    }
  }, []);

  // 2. Autosave triggers automatically on any template structural/meta changes
  useEffect(() => {
    if (!template) return;
    setAutosaveStatus('saving');
    const timer = setTimeout(() => {
      try {
        localStorage.setItem(AUTOSAVE_KEY, JSON.stringify(template));
        updateDraftsListWithTemplate(template);
        setAutosaveStatus('saved');
        setLastSavedTime(new Date().toLocaleTimeString());
      } catch (e) {
        setAutosaveStatus('idle');
        showToast('Autosave failed! Local storage limit reached. Please clean up old drafts or export JSON.', 'error');
      }
    }, 800);

    return () => clearTimeout(timer);
  }, [template]);

  // Draft action handlers
  const handleSelectTemplate = (tpl: EmailTemplate) => {
    const deepCloned = JSON.parse(JSON.stringify(tpl));
    setTemplate(deepCloned);
    setSelectedBlockId(null);
    setHistory({ past: [], future: [] });
    setCurrentScreen('editor');
  };

  const handleDeleteDraft = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const updated = draftsList.filter((d) => d.id !== id);
      setDraftsList(updated);
      localStorage.setItem('easy-email-drafts-v2', JSON.stringify(updated));
      if (template.id === id) {
        localStorage.removeItem(AUTOSAVE_KEY);
        setTemplate(STARTER_TEMPLATES[0]);
      }
    } catch (err) {
      console.warn('Failed to delete draft:', err);
    }
  };

  const handleDownloadImage = async () => {
    const canvasElement = document.getElementById('email-editor-stage');
    if (!canvasElement) {
      showToast('Export failed: Canvas not found. Please switch to Design Studio mode.', 'error');
      return;
    }

    try {
      showToast('Generating high-quality image export...', 'success');
      
      // If we are in dark mode, we should temporarily add 'dark' class to the element 
      // or ensure the clone has it so Tailwind dark: classes are respected.
      const isDarkMode = theme === 'dark';
      if (isDarkMode) canvasElement.classList.add('dark');
      
      // Small delay to allow any pending style recalcs (especially for dark mode transition)
      await new Promise(resolve => setTimeout(resolve, 150));
      
      const dataUrl = await toPng(canvasElement, { 
        cacheBust: true, 
        pixelRatio: 3, // High quality
        backgroundColor: template.globalSettings.contentBg || '#ffffff',
        style: {
          // Ensure these are exactly as defined in settings to be faithful
          borderRadius: `${template.globalSettings.borderRadius}px`,
          boxShadow: 'none', // We keep shadow off for the "clean" image file
          border: 'none',    // Also remove the editor's helper border
        }
      });
      
      if (isDarkMode) canvasElement.classList.remove('dark');
      
      const link = document.createElement('a');
      link.download = `${template.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_export.png`;
      link.href = dataUrl;
      link.click();
      
      showToast('Image exported successfully!', 'success');
    } catch (err) {
      console.error('Failed to generate image:', err);
      showToast('Failed to export image.', 'error');
    }
  };

  const handleNewFromScratch = () => {
    const freshId = `scratch-${Date.now()}`;
    const freshTemplate: EmailTemplate = {
      id: freshId,
      name: '📁 Custom Design from Scratch',
      subject: 'Draft Subject Line ✉️',
      subtitle: 'This is a preview text subtitle.',
      globalSettings: {
        backgroundColor: '#f8fafc',
        contentWidth: 600,
        contentBg: '#ffffff',
        fontFamily: '"Inter", sans-serif',
        borderRadius: 8,
        brandColors: {
          primary: '#3b82f6',
          secondary: '#6366f1',
          accent: '#f43f5e',
        },
      },
      blocks: [
        {
          id: `header-${Date.now()}`,
          type: 'header',
          content: 'YOUR BRAND LOGO',
          style: {
            color: '#1e293b',
            textAlign: 'center',
            fontSize: '16px',
            fontWeight: 'bold',
            paddingTop: 30,
            paddingBottom: 20,
          }
        },
        {
          id: `text-${Date.now()}`,
          type: 'text',
          content: '<p>Start typing your content here... Drag and drop new sections from the sidebar on the left to build your layout.</p>',
          style: {
            color: '#334155',
            textAlign: 'left',
            fontSize: '15px',
            lineHeight: '1.6',
            paddingTop: 10,
            paddingBottom: 20,
            paddingLeft: 20,
            paddingRight: 20,
          }
        },
        {
          id: `btn-${Date.now()}`,
          type: 'button',
          content: 'Call To Action Button 🚀',
          properties: {
            href: 'https://example.com'
          },
          style: {
            backgroundColor: '#2563eb',
            color: '#ffffff',
            textAlign: 'center',
            borderRadius: 6,
            fontSize: '15px',
            fontWeight: 'bold',
            paddingTop: 12,
            paddingBottom: 12,
            paddingLeft: 24,
            paddingRight: 24,
          }
        }
      ]
    };
    setTemplate(freshTemplate);
    setSelectedBlockId(null);
    setHistory({ past: [], future: [] });
    updateDraftsListWithTemplate(freshTemplate);
    setCurrentScreen('editor');
  };

  // Push updates to undo stack before making edits
  const saveStateToHistory = (nextTemplate: EmailTemplate) => {
    setHistory((prev) => {
      // Limit history length to 25 to protect client-side memory
      const newPast = [...prev.past, template].slice(-25);
      
      // Auto snapshot every 10 significant edits
      if (newPast.length % 10 === 0 && newPast.length > 0) {
         setSnapshots(s => {
           if (s.length > 0 && s[0].template === template) return s;
           return [{ id: Date.now().toString(), timestamp: Date.now(), template: JSON.parse(JSON.stringify(template)) }, ...s].slice(0, 20);
         });
      }
      
      return {
        past: newPast,
        future: [], // clear future on brand new action
      };
    });
  };

  // Main callback to update email properties / settings
  const updateTemplate = (updates: Partial<EmailTemplate>) => {
    const next = { ...template, ...updates } as EmailTemplate;
    saveStateToHistory(next);
    setTemplate(next);
  };

  const handleGoBack = async () => {
    // Attempt to capture a fresh thumbnail for the draft before leaving
    const canvasElement = document.getElementById('email-editor-stage');
    if (canvasElement) {
      try {
        // Small delay to ensure any pending renders finish
        await new Promise(resolve => setTimeout(resolve, 50));
        
        // Capture low-res thumbnail to keep localStorage size manageable
        const thumbnailDataUrl = await toPng(canvasElement, { 
          pixelRatio: 0.25, 
          quality: 0.3,
          backgroundColor: template.globalSettings.backgroundColor || '#ffffff' 
        });
        
        const updatedTemplate = { ...template, thumbnail: thumbnailDataUrl, updatedAt: Date.now() };
        setTemplate(updatedTemplate);
        updateDraftsListWithTemplate(updatedTemplate);
      } catch (err) {
        console.warn('Auto-thumbnail capture failed:', err);
      }
    }
    setCurrentScreen('home');
  };

  const handleExportHTML = () => {
    const htmlCode = generateHTML(template);
    const blob = new Blob([htmlCode], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${template.name?.toLowerCase().replace(/\s+/g, '-') || 'email-template'}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Undo action
  const handleUndo = () => {
    if (history.past.length === 0) return;
    const previous = history.past[history.past.length - 1];
    const newPast = history.past.slice(0, history.past.length - 1);

    setHistory({
      past: newPast,
      future: [template, ...history.future],
    });
    setTemplate(previous);
    setSelectedBlockId(null);
  };

  // Redo action
  const handleRedo = () => {
    if (history.future.length === 0) return;
    const next = history.future[0];
    const newFuture = history.future.slice(1);

    setHistory({
      past: [...history.past, template],
      future: newFuture,
    });
    setTemplate(next);
    setSelectedBlockId(null);
  };

  // Add / Append element to layout
  const handleAddBlock = (type: BlockType) => {
    const defaultBlockId = `${type}-${Date.now()}`;
    let newBlock: EmailBlock = {
      id: defaultBlockId,
      type,
      style: {
        paddingTop: 10,
        paddingBottom: 10,
        paddingLeft: 20,
        paddingRight: 20,
      }
    };

    // Sensible content & style presets
    const def = blockRegistry.get(type);
    if (def) {
      if (def.defaultContent) newBlock.content = def.defaultContent;
      if (def.defaultProps) newBlock.properties = { ...def.defaultProps };
      if (def.defaultStyle) newBlock.style = { ...newBlock.style, ...def.defaultStyle };
    }

    const updatedBlocks = [...template.blocks, newBlock];
    updateTemplate({ blocks: updatedBlocks });
    setSelectedBlockId(defaultBlockId);
  };

  // Reorder callback from visual canvas
  const handleUpdateBlocks = (nextBlocks: EmailBlock[]) => {
    updateTemplate({ blocks: nextBlocks });
  };

  // Modify individual element in template
  const handleUpdateBlock = (blockId: string, updates: Partial<EmailBlock>) => {
    const block = template.blocks.find(b => b.id === blockId);
    if (block && block.symbolId) {
      setSharedBlocks(prev => prev.map(sb => {
        if (sb.id === block.symbolId) {
          const nextBlock = { ...sb.block };
          if (updates.content !== undefined) nextBlock.content = updates.content;
          if (updates.properties !== undefined) {
            nextBlock.properties = { ...nextBlock.properties, ...updates.properties };
          }
          if (updates.style !== undefined) {
            nextBlock.style = { ...nextBlock.style, ...updates.style };
          }
          if (updates.visibilityCondition !== undefined) {
            nextBlock.visibilityCondition = updates.visibilityCondition;
          }
          return { ...sb, block: nextBlock };
        }
        return sb;
      }));
    }

    const nextBlocks = template.blocks.map((b) => {
      if (b.id === blockId) {
        return { ...b, ...updates };
      }
      return b;
    });
    updateTemplate({ blocks: nextBlocks });
  };

  // Delete Element
  const handleDeleteBlock = (blockId: string) => {
    const nextBlocks = template.blocks.filter((b) => b.id !== blockId);
    updateTemplate({ blocks: nextBlocks });
    if (selectedBlockId === blockId) {
      setSelectedBlockId(null);
    }
  };

  // Reorder Elements (Layers panel)
  const handleReorderBlocks = (startIndex: number, endIndex: number) => {
    const nextBlocks = [...template.blocks];
    const [removed] = nextBlocks.splice(startIndex, 1);
    nextBlocks.splice(endIndex, 0, removed);
    updateTemplate({ blocks: nextBlocks });
  };

  // Duplicate Block
  const handleCloneBlock = (blockId: string) => {
    const index = template.blocks.findIndex((b) => b.id === blockId);
    if (index === -1) return;

    const source = template.blocks[index];
    const clone: EmailBlock = {
      ...source,
      id: `${source.type}-${Date.now()}`,
      style: { ...source.style },
      properties: source.properties ? { ...source.properties } : undefined,
    };

    const nextBlocks = [...template.blocks];
    nextBlocks.splice(index + 1, 0, clone);
    updateTemplate({ blocks: nextBlocks });
    setSelectedBlockId(clone.id);
  };

  // Load a complete starter preset template
  const handleLoadTemplate = (tpl: EmailTemplate) => {
    saveStateToHistory(tpl);
    // Deep clone blocks to prevent shared-reference bugs
    const deepClonedTpl = JSON.parse(JSON.stringify(tpl));
    setTemplate(deepClonedTpl);
    setSelectedBlockId(null);
  };

  const handleImportJSON = (imported: EmailTemplate) => {
    saveStateToHistory(imported);
    setTemplate(imported);
    setSelectedBlockId(null);
  };

  // PRD v2 CRUD Handlers
  const handleSaveAsShared = (block: EmailBlock, name: string, isGlobal: boolean) => {
    const newShared: SharedBlock = {
      id: isGlobal ? `shared-global-${Date.now()}` : `shared-pattern-${Date.now()}`,
      name,
      category: block.type === 'header' || block.type === 'footer' ? block.type : 'general',
      isGlobal,
      usedInTemplateIds: [],
      block: { ...block, id: `block-template-${Date.now()}` } // clean ID
    };
    
    setSharedBlocks(prev => [newShared, ...prev]);
    
    if (isGlobal) {
      handleUpdateBlock(block.id, { symbolId: newShared.id });
      showToast(`Saved and linked! "${name}" is now a Synced Global Block.`, 'success');
    } else {
      showToast(`Saved "${name}" as a reusable custom Pattern!`, 'success');
    }
  };

  const handleDisconnectShared = (blockId: string) => {
    handleUpdateBlock(blockId, { symbolId: undefined });
    showToast('Unlinked from global block pattern! This block can now be edited independently.', 'info');
  };

  const handleAddBlockFromShared = (sharedBlockId: string) => {
    const shared = sharedBlocks.find(sb => sb.id === sharedBlockId);
    if (!shared) return;
    
    const newBlock: EmailBlock = {
      ...JSON.parse(JSON.stringify(shared.block)),
      id: `${shared.block.type}-${Date.now()}`,
      symbolId: shared.isGlobal ? shared.id : undefined
    };
    
    const updated = {
      ...template,
      blocks: [...template.blocks, newBlock]
    };
    saveStateToHistory(updated);
    setTemplate(updated);
    showToast(`Added block pattern "${shared.name}" to your canvas.`, 'success');
  };

  const handleDeleteSharedBlock = (id: string) => {
    setSharedBlocks(prev => prev.filter(p => p.id !== id));
    showToast('Pattern removed from your saved library.', 'info');
  };

  const handleAddMediaAsset = (asset: Omit<MediaAsset, 'id' | 'createdAt'>) => {
    const newAsset: MediaAsset = {
      ...asset,
      id: `media-asset-${Date.now()}`,
      createdAt: Date.now()
    };
    setMediaAssets(prev => [newAsset, ...prev]);
    showToast(`Added "${asset.name}" to media library.`, 'success');
  };

  const handleDeleteMediaAsset = (id: string) => {
    setMediaAssets(prev => prev.filter(m => m.id !== id));
    showToast('Image removed from media library.', 'info');
  };

  const handleCreateSnapshot = () => {
    setSnapshots(s => [
      { id: Date.now().toString(), timestamp: Date.now(), template: JSON.parse(JSON.stringify(template)) },
      ...s
    ].slice(0, 20));
    showToast('Snapshot saved manually.', 'success');
  };

  const rawSelectedBlock = template.blocks.find((b) => b.id === selectedBlockId) || null;
  const selectedBlock = (() => {
    if (!rawSelectedBlock) return null;
    if (rawSelectedBlock.symbolId) {
      const shared = sharedBlocks.find(sb => sb.id === rawSelectedBlock.symbolId);
      if (shared) {
        return {
          ...rawSelectedBlock,
          content: shared.block.content,
          properties: { ...shared.block.properties },
          style: { ...shared.block.style }
        };
      }
    }
    return rawSelectedBlock;
  })();

  if (currentScreen === 'home') {
    return (
      <HomeHub
        drafts={draftsList}
        onSelectTemplate={handleSelectTemplate}
        onNewFromScratch={handleNewFromScratch}
        onDeleteDraft={handleDeleteDraft}
        theme={theme}
        onToggleTheme={toggleTheme}
      />
    );
  }

  return (
    <div className="flex flex-col h-screen w-screen bg-ink text-text-on-ink font-sans overflow-hidden">
      
      {/* SaaS App Header Tool Rail */}
      <header className="h-16 border-b border-ink-2/40 bg-ink flex items-center justify-between px-4 sm:px-6 shrink-0 z-10">
        <div className="flex items-center gap-3">
          <button
            id="btn-back-home"
            onClick={handleGoBack}
            className="p-1.5 rounded-lg hover:bg-ink-2 text-text-on-ink-muted hover:text-text-on-ink transition-colors cursor-pointer"
            title="Back to Home Dashboard"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          
          {/* Postmark logomark & wordmark */}
          <div className="w-7 h-7 rounded-full bg-gold flex items-center justify-center font-serif text-ink font-bold text-xs shadow-inner">
            D
          </div>
          <span className="font-serif font-semibold text-sm tracking-tight text-text-on-ink hidden md:inline">Dost_MailKit</span>
          
          <div className="h-4 w-px bg-ink-2/50 mx-1 hidden md:block"></div>
          <div className="flex flex-col">
            <input 
              type="text" 
              value={template.subject} 
              onChange={(e) => updateTemplate({ subject: e.target.value })}
              className="text-xs sm:text-sm font-semibold border-none focus:ring-0 p-0 text-text-on-ink bg-transparent w-40 sm:w-64 outline-none placeholder-text-on-ink-muted/30 focus:border-b focus:border-gold"
              placeholder="Summer Solstice Sale"
              title="Click to edit subject line"
            />
            <span className="text-[8px] text-text-on-ink-muted/50 font-bold uppercase tracking-widest leading-none mt-0.5">Subject Line</span>
          </div>
        </div>

        {/* Global Toolbar Options */}
        <div className="flex items-center gap-2">
          
          {/* History Stack Toggles */}
          <div className="flex items-center gap-0.5 bg-ink-2 p-0.5 rounded-lg border border-ink-2/50">
            <button
              id="btn-undo"
              onClick={handleUndo}
              disabled={history.past.length === 0}
              className="p-1.5 rounded text-text-on-ink-muted hover:text-text-on-ink disabled:opacity-30 disabled:hover:bg-transparent transition-all cursor-pointer"
              title="Undo Action (Ctrl+Z)"
            >
              <Undo2 className="h-4 w-4" />
            </button>
            <button
              id="btn-redo"
              onClick={handleRedo}
              disabled={history.future.length === 0}
              className="p-1.5 rounded text-text-on-ink-muted hover:text-text-on-ink disabled:opacity-30 disabled:hover:bg-transparent transition-all cursor-pointer"
              title="Redo Action (Ctrl+Y)"
            >
              <Redo2 className="h-4 w-4" />
            </button>
            <button
              id="btn-history"
              onClick={() => setIsVersionHistoryOpen(true)}
              className="p-1.5 rounded text-text-on-ink-muted hover:text-text-on-ink transition-all cursor-pointer"
              title="Version History"
            >
              <Clock className="h-4 w-4" />
            </button>
          </div>

          {/* Sync / Autosave Indicator */}
          <div className="flex items-center gap-1.5 text-[9px]">
            {autosaveStatus === 'saving' ? (
              <div className="flex items-center gap-1 text-gold bg-gold/10 px-2 py-0.5 rounded-full border border-gold/30 font-semibold animate-pulse font-mono">
                <RefreshCw className="h-3 w-3 animate-spin" />
                <span>SAVING...</span>
              </div>
            ) : (
              <div className="flex items-center gap-1 text-text-on-ink-muted bg-ink-2 px-2 py-0.5 rounded-full border border-ink-2/50 font-semibold font-mono text-[9px] whitespace-nowrap">
                <span className="h-1.5 w-1.5 rounded-full bg-gold" />
                <span>AUTOSAVED {lastSavedTime && `AT ${lastSavedTime.toUpperCase()}`}</span>
              </div>
            )}

            {/* Manual Save Button */}
            <button
              id="btn-manual-save"
              onClick={handleManualSave}
              className="flex items-center gap-1 py-1 px-2 text-[10px] font-semibold rounded-lg bg-ink-2 hover:bg-ink-2/80 text-text-on-ink-muted hover:text-text-on-ink transition-all border border-ink-2/50 cursor-pointer"
              title="Save manually to Local Storage for peace of mind"
            >
              <Save className="h-3 w-3" />
              <span>Save</span>
            </button>
            <button
              id="btn-download-image"
              onClick={handleDownloadImage}
              className="flex items-center gap-1 py-1 px-2 text-[10px] font-semibold rounded-lg bg-ink-2 hover:bg-ink-2/80 text-text-on-ink-muted hover:text-text-on-ink transition-all border border-ink-2/50 cursor-pointer hidden md:flex"
              title="Download Canvas as Image"
            >
              <ImageIcon className="h-3 w-3" />
              <span>Export</span>
            </button>
            <button
              id="btn-validate-email"
              onClick={handleValidateEmail}
              className="flex items-center gap-1 py-1 px-2 text-[10px] font-semibold rounded-lg bg-ink-2 hover:bg-ink-2/80 text-text-on-ink-muted hover:text-text-on-ink transition-all border border-ink-2/50 cursor-pointer hidden md:flex"
              title="Validate Links & Images"
            >
              <Link className="h-3 w-3" />
              <span>Check URLs</span>
            </button>
          </div>

          <div className="h-5 w-px bg-ink-2/50" />

          {/* Layers Panel Toggle */}
          <button
            onClick={() => setIsLayersPanelOpen(!isLayersPanelOpen)}
            className={`flex items-center gap-1 py-1 px-2 text-[10px] font-bold rounded-lg transition-all border cursor-pointer shrink-0 ${isLayersPanelOpen ? 'border-gold text-gold bg-gold/5' : 'border-ink-2 hover:border-gold/40 text-text-on-ink hover:text-gold'}`}
            title="Toggle Layers Panel"
          >
            <Layers className="h-3 w-3 shrink-0" />
            <span>Layers</span>
          </button>

          <div className="h-5 w-px bg-ink-2/50" />

          {/* Quality Check Button */}
          <button
            onClick={() => setIsDeliverabilityOpen(true)}
            className={`flex items-center gap-1 py-1 px-2 text-[10px] font-bold rounded-lg transition-all border cursor-pointer shrink-0 ${isDeliverabilityOpen ? 'border-gold text-gold bg-gold/5' : 'border-ink-2 hover:border-gold/40 text-text-on-ink hover:text-gold'}`}
            title="Deliverability & Spam Check"
          >
            <ShieldCheck className="h-3 w-3 shrink-0" />
            <span>Quality</span>
          </button>

          <div className="h-5 w-px bg-ink-2/50" />

          {/* Smart Layout AI Button */}
          <button
            id="btn-smart-layout"
            onClick={() => setIsSmartLayoutOpen(true)}
            className="flex items-center gap-1 py-1 px-2 text-[10px] font-extrabold rounded-lg transition-all border border-gold/40 hover:border-gold text-gold hover:bg-gold/5 cursor-pointer shrink-0"
            title="AI Smart Layout: Harmonize color theme and professional spacing improvements"
          >
            <Sparkles className="h-3 w-3 animate-pulse text-gold shrink-0" />
            <span>Smart Layout</span>
          </button>

          <div className="h-5 w-px bg-ink-2/50" />

          {/* View Toggles */}
          <div className="flex items-center gap-1">
            <button
              id="btn-toggle-grid"
              onClick={() => setShowGrid(!showGrid)}
              className={`p-2 rounded-lg transition-colors border border-transparent cursor-pointer ${showGrid ? 'bg-gold/10 text-gold border-gold/20' : 'text-text-on-ink-muted hover:text-text-on-ink hover:bg-ink-2'}`}
              title={showGrid ? 'Hide Grid' : 'Show Grid'}
            >
              <Grid className="h-4 w-4" />
            </button>
            <button
              id="btn-toggle-theme"
              onClick={toggleTheme}
              className="p-2 rounded-lg text-text-on-ink-muted hover:text-text-on-ink hover:bg-ink-2 transition-colors border border-transparent cursor-pointer"
              title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
            >
              {theme === 'light' ? (
                <Moon className="h-4 w-4" />
              ) : (
                <Sun className="h-4 w-4 text-gold" />
              )}
            </button>
          </div>

          <div className="h-5 w-px bg-ink-2/50" />

          {/* Core View Selector Tabs */}
          <div className="flex bg-ink-2 p-1 rounded-lg border border-ink-2/50">
            <button
              id="btn-mode-design"
              onClick={() => setViewMode('design')}
              className={`flex items-center gap-1.5 py-1.5 px-3 text-xs font-bold rounded transition-all cursor-pointer ${
                viewMode === 'design'
                  ? 'bg-ink text-gold border border-gold/20 shadow-sm'
                  : 'text-text-on-ink-muted hover:text-text-on-ink'
              }`}
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              Design Studio
            </button>
            <button
              id="btn-mode-split"
              onClick={() => setViewMode('split')}
              className={`flex items-center gap-1.5 py-1.5 px-3 text-xs font-bold rounded transition-all cursor-pointer ${
                viewMode === 'split'
                  ? 'bg-ink text-gold border border-gold/20 shadow-sm'
                  : 'text-text-on-ink-muted hover:text-text-on-ink'
              }`}
            >
              <Code2 className="h-3.5 w-3.5" />
              Split Mode
            </button>
            <button
              id="btn-mode-developer"
              onClick={() => setViewMode('developer')}
              className={`flex items-center gap-1.5 py-1.5 px-3 text-xs font-bold rounded transition-all cursor-pointer ${
                viewMode === 'developer'
                  ? 'bg-ink text-gold border border-gold/20 shadow-sm'
                  : 'text-text-on-ink-muted hover:text-text-on-ink'
              }`}
            >
              <FileCode className="h-3.5 w-3.5" />
              Developer Sandbox
            </button>
          </div>

          <button
            id="btn-export-html"
            onClick={handleExportHTML}
            className="flex items-center gap-1.5 py-2 px-4 text-xs font-extrabold rounded-lg transition-all bg-gold text-ink hover:bg-gold-hover shadow-md shadow-gold/20 cursor-pointer"
          >
            <Download className="h-3.5 w-3.5 text-ink font-extrabold" />
            Export HTML
          </button>

          <button
            id="btn-preview-and-test"
            onClick={() => setIsPreviewOpen(true)}
            className="flex items-center gap-1.5 py-2 px-4 text-xs font-bold rounded-lg transition-all bg-transparent text-text-on-ink border border-ink-2 hover:border-gold/50 hover:bg-gold/5 cursor-pointer"
          >
            <Inbox className="h-3.5 w-3.5 text-text-on-ink-muted" />
            Preview & Test
          </button>
        </div>
      </header>

      {/* Main workspace layout: Styled as a Bento Grid with gap, paddings, and background */}
      <div className="flex-1 flex flex-wrap lg:flex-nowrap overflow-y-auto lg:overflow-hidden min-h-0 p-2 sm:p-4 gap-2 sm:gap-4 bg-ink-2 pb-24 lg:pb-4 relative">
        
        {isLayersPanelOpen && (
          <div className="fixed inset-y-0 right-0 z-[100] w-64 shadow-2xl">
            <LayersPanel
              blocks={template.blocks}
              selectedBlockId={selectedBlockId}
              onSelectBlock={setSelectedBlockId}
              onUpdateBlock={handleUpdateBlock}
              onReorder={handleReorderBlocks}
              onDeleteBlock={handleDeleteBlock}
              onClose={() => setIsLayersPanelOpen(false)}
            />
          </div>
        )}

        {isDeliverabilityOpen && (
          <DeliverabilityPanel 
            template={template}
            onClose={() => setIsDeliverabilityOpen(false)}
          />
        )}

        {/* Left Column: Sidebar Component (Always active for dragging, presets, global settings) */}
        <div className={`${mobileWorkspaceView === 'elements' ? 'flex flex-1' : 'hidden'} lg:flex lg:w-80 shrink-0 h-full min-w-0`}>
          <Sidebar
            template={template}
            onUpdateTemplate={updateTemplate}
            onAddBlock={handleAddBlock}
            onLoadTemplate={handleLoadTemplate}
            onDragStartNewBlock={setDraggedNewBlockType}
            selectedBlockId={selectedBlockId}
            onUpdateBlock={handleUpdateBlock}
            sharedBlocks={sharedBlocks}
            onAddSharedBlock={(name, category, isGlobal, block) => handleSaveAsShared(block, name, isGlobal)}
            onDeleteSharedBlock={handleDeleteSharedBlock}
            onAddBlockFromShared={handleAddBlockFromShared}
            mediaAssets={mediaAssets}
            onAddMediaAsset={handleAddMediaAsset}
            onDeleteMediaAsset={handleDeleteMediaAsset}
            currentRole={currentRole}
            onChangeRole={setCurrentRole}
          />
        </div>

        {/* Center/Right Dynamic layout according to active View Mode */}
        {viewMode === 'design' && (
          <>
            {/* Visual drag-and-drop workspace */}
            <div className={`${mobileWorkspaceView === 'canvas' ? 'flex flex-1' : 'hidden'} lg:flex lg:flex-1 flex-col min-w-0 h-full overflow-hidden relative`}>
              <Canvas
                template={template}
                selectedBlockId={selectedBlockId}
                onSelectBlock={setSelectedBlockId}
                onUpdateBlocks={handleUpdateBlocks}
                onUpdateBlock={handleUpdateBlock}
                onDeleteBlock={handleDeleteBlock}
                onCloneBlock={handleCloneBlock}
                showGrid={showGrid}
                sharedBlocks={sharedBlocks}
                onSaveAsShared={handleSaveAsShared}
                onDisconnectShared={handleDisconnectShared}
                onAddMediaAsset={handleAddMediaAsset}
              />
            </div>

            {/* Properties inspector panel on the right */}
            <div className={`${mobileWorkspaceView === 'inspector' ? 'flex flex-1' : 'hidden'} lg:flex lg:w-80 shrink-0 h-full min-w-0`}>
              <Inspector
                selectedBlock={selectedBlock}
                onUpdateBlock={handleUpdateBlock}
                template={template}
                onUpdateTemplate={updateTemplate}
              />
            </div>
          </>
        )}

        {viewMode === 'split' && (
          <>
            {/* Split Screen Side-by-side mode: Canvas Left, CodeViewer Right */}
            <div className="flex-1 flex gap-4 min-w-0 h-full overflow-hidden">
              <div className={`${mobileWorkspaceView === 'canvas' ? 'flex flex-1' : 'hidden'} lg:flex lg:flex-1 flex-col min-w-0 relative h-full overflow-hidden`}>
                <Canvas
                  template={template}
                  selectedBlockId={selectedBlockId}
                  onSelectBlock={setSelectedBlockId}
                  onUpdateBlocks={handleUpdateBlocks}
                  onUpdateBlock={handleUpdateBlock}
                  onDeleteBlock={handleDeleteBlock}
                  onCloneBlock={handleCloneBlock}
                  showGrid={showGrid}
                  sharedBlocks={sharedBlocks}
                  onSaveAsShared={handleSaveAsShared}
                  onDisconnectShared={handleDisconnectShared}
                  onAddMediaAsset={handleAddMediaAsset}
                />
              </div>
              <div className="hidden lg:block w-[500px] shrink-0 h-full select-text">
                <CodeViewer 
                  template={template} 
                  onImportJSON={handleImportJSON}
                />
              </div>
            </div>

            {/* Properties inspector panel */}
            <div className={`${mobileWorkspaceView === 'inspector' ? 'flex flex-1' : 'hidden'} lg:flex lg:w-80 shrink-0 h-full min-w-0`}>
              <Inspector
                selectedBlock={selectedBlock}
                onUpdateBlock={handleUpdateBlock}
                template={template}
                onUpdateTemplate={updateTemplate}
              />
            </div>
          </>
        )}

        {viewMode === 'developer' && (
          /* Full screen standalone inspector and code viewing playground */
          <div className="flex-1 bg-ink rounded-2xl border border-ink-2 p-4 sm:p-6 overflow-hidden flex flex-col h-full shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-sm font-mono font-bold text-text-on-ink flex items-center gap-1.5 uppercase tracking-widest">
                  <Code2 className="h-4 w-4 text-gold animate-pulse" />
                  Markup & Raw Code Inspect Room
                </h2>
                <p className="text-xs text-text-on-ink-muted mt-0.5">
                  Inspect the compiled real-time MJML syntax or inline styled tables. Test responsive client layouts using the sandboxed visual iframe.
                </p>
              </div>
            </div>

            <div className="flex-1 min-h-0 select-text">
              <CodeViewer 
                template={template} 
                onImportJSON={handleImportJSON}
              />
            </div>
          </div>
        )}
      </div>

      {/* Mobile View Switcher - Sticky/Floating Bottom Nav Bar (visible only below lg) */}
      <div className="lg:hidden fixed bottom-4 left-1/2 -translate-x-1/2 bg-ink/95 backdrop-blur-md border border-ink-2 p-2 rounded-full shadow-xl flex items-center gap-2 z-50">
        <button
          onClick={() => setMobileWorkspaceView('elements')}
          className={`px-4 py-2 rounded-full text-xs font-extrabold transition-all flex items-center gap-1.5 cursor-pointer ${
            mobileWorkspaceView === 'elements'
              ? 'bg-gold text-ink shadow-sm'
              : 'text-text-on-ink-muted hover:text-text-on-ink'
          }`}
        >
          <LayoutGrid className="h-3.5 w-3.5" />
          <span>Blocks</span>
        </button>
        <button
          onClick={() => setMobileWorkspaceView('canvas')}
          className={`px-4 py-2 rounded-full text-xs font-extrabold transition-all flex items-center gap-1.5 cursor-pointer ${
            mobileWorkspaceView === 'canvas'
              ? 'bg-gold text-ink shadow-sm'
              : 'text-text-on-ink-muted hover:text-text-on-ink'
          }`}
        >
          <Inbox className="h-3.5 w-3.5" />
          <span>Canvas</span>
        </button>
        <button
          onClick={() => setMobileWorkspaceView('inspector')}
          className={`px-4 py-2 rounded-full text-xs font-extrabold transition-all flex items-center gap-1.5 cursor-pointer ${
            mobileWorkspaceView === 'inspector'
              ? 'bg-gold text-ink shadow-sm'
              : 'text-text-on-ink-muted hover:text-text-on-ink'
          }`}
        >
          <Sliders className="h-3.5 w-3.5" />
          <span>Inspector</span>
        </button>
      </div>

      {/* Subtle toast notifications */}
      <AnimatePresence>
        {toast && (
          <motion.div 
            id="toast-notification"
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 350, damping: 25 }}
            className={`fixed bottom-24 right-4 lg:bottom-6 lg:right-6 z-[100] flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl border transition-all ${
              toast.type === 'success' 
                ? 'bg-paper border-paper-2 text-ink shadow-[3px_3px_0px_rgba(22,35,59,0.15)]' 
                : toast.type === 'error' 
                  ? 'bg-red-50 dark:bg-red-950/80 border-red-200 dark:border-red-900/60 text-red-800 dark:text-red-300' 
                  : 'bg-blue-50 dark:bg-blue-950/80 border-blue-200 dark:border-blue-900/60 text-blue-800 dark:text-blue-300'
            }`}
          >
            {toast.type === 'success' ? (
              <div className="scale-60 -mx-3 -my-3 shrink-0">
                <Postmark 
                  textLine1="SAVED" 
                  textLine2="POSTAL" 
                  textLine3="OK" 
                  size="sm" 
                  variant="seal" 
                  rotateDeg={-5} 
                />
              </div>
            ) : (
              toast.type === 'success' && <Check className="h-4 w-4 text-emerald-500" />
            )}
            <span className="text-xs font-semibold font-sans">{toast.message}</span>
            <button 
              onClick={() => setToast(null)}
              className="text-[10px] uppercase font-black tracking-wider opacity-60 hover:opacity-100 ml-2.5 cursor-pointer"
            >
              Dismiss
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <PreviewModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        template={template}
      />
      <SmartLayoutModal
        isOpen={isSmartLayoutOpen}
        onClose={() => setIsSmartLayoutOpen(false)}
        template={template}
        onApply={handleApplySmartLayout}
      />
      <QualityCheckModal
        isOpen={isQualityCheckOpen}
        onClose={() => setIsQualityCheckOpen(false)}
        template={template}
      />
      {isVersionHistoryOpen && (
        <VersionHistorySidebar
          history={history}
          template={template}
          snapshots={snapshots}
          onRestore={(tpl) => {
            saveStateToHistory(tpl);
            setTemplate(tpl);
            setIsVersionHistoryOpen(false);
          }}
          onClose={() => setIsVersionHistoryOpen(false)}
          onCreateSnapshot={handleCreateSnapshot}
        />
      )}

      {/* Figma-Style Drag Preview Ghost Element */}
      {draggedNewBlockType && dragCoords && (
        <div
          id="drag-preview-ghost"
          className="fixed pointer-events-none z-[9999] select-none backdrop-blur-md bg-ink/80 border-2 border-gold/80 rounded-xl px-3 py-2 flex items-center gap-2 shadow-xl animate-fade-in transition-all"
          style={{
            left: `${dragCoords.x + 12}px`,
            top: `${dragCoords.y + 12}px`,
          }}
        >
          <div className="w-8 h-8 rounded-lg bg-gold/10 border border-gold/20 text-gold flex items-center justify-center shadow-sm">
            {draggedNewBlockType === 'header' && <Heading className="h-4 w-4" />}
            {draggedNewBlockType === 'text' && <Type className="h-4 w-4" />}
            {draggedNewBlockType === 'image' && <ImageIcon className="h-4 w-4" />}
            {draggedNewBlockType === 'button' && <Square className="h-4 w-4" />}
            {draggedNewBlockType === 'divider' && <Minus className="h-4 w-4" />}
            {draggedNewBlockType === 'spacer' && <Layout className="h-4 w-4" />}
            {draggedNewBlockType === 'social' && <Share2 className="h-4 w-4" />}
            {draggedNewBlockType === 'footer' && <FileText className="h-4 w-4" />}
          </div>
          <div className="flex flex-col">
            <span className="text-[11px] font-mono font-bold text-text-on-ink uppercase tracking-wider">
              {draggedNewBlockType} Block
            </span>
            <span className="text-[9px] font-mono font-bold text-text-on-ink-muted uppercase tracking-widest leading-none mt-0.5">
              Drop onto Canvas
            </span>
          </div>
        </div>
      )}

    </div>
  );
}
