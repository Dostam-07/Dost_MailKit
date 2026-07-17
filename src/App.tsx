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
  Grid
} from 'lucide-react';
import { EmailTemplate, EmailBlock, BlockType, UndoRedoState } from './types';
import Sidebar from './components/Sidebar';
import Canvas from './components/Canvas';
import Inspector from './components/Inspector';
import CodeViewer from './components/CodeViewer';
import PreviewModal from './components/PreviewModal';
import SmartLayoutModal from './components/SmartLayoutModal';
import HomeHub from './components/HomeHub';
import VersionHistorySidebar from './components/VersionHistorySidebar';
import { STARTER_TEMPLATES } from './utils/templates';
import { generateHTML } from './utils/htmlGenerator';
import { toPng } from 'html-to-image';

const AUTOSAVE_KEY = 'easy-email-builder-state-v1';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<'home' | 'editor'>('home');
  const [draftsList, setDraftsList] = useState<EmailTemplate[]>([]);
  const [mobileWorkspaceView, setMobileWorkspaceView] = useState<'elements' | 'canvas' | 'inspector'>('canvas');

  // Main Template state - defaults to the first starter template
  const [template, setTemplate] = useState<EmailTemplate>(STARTER_TEMPLATES[0]);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);

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
    if (type === 'header') {
      newBlock.content = 'Inspirational Brand Title';
      newBlock.style = { ...newBlock.style, color: '#111827', textAlign: 'center', fontSize: '24px', fontWeight: 'bold', paddingTop: 20, paddingBottom: 20 };
    } else if (type === 'text') {
      newBlock.content = '<p>Introduce key sales updates, feature releases, or editorial columns directly. This text block can be clicked and edited.</p>';
      newBlock.style = { ...newBlock.style, color: '#374151', textAlign: 'left', fontSize: '15px', lineHeight: '1.6' };
    } else if (type === 'image') {
      newBlock.properties = {
        src: 'https://images.unsplash.com/photo-1542744094-3a31f103e35f?w=600&auto=format&fit=crop&q=80',
        alt: 'Editorial banner illustration',
        width: '100%',
      };
      newBlock.style = { ...newBlock.style, borderRadius: 8, paddingTop: 10, paddingBottom: 10 };
    } else if (type === 'button') {
      newBlock.content = 'Claim Coupon Code ⚡';
      newBlock.properties = { href: 'https://github.com/zalify/easy-email-editor' };
      newBlock.style = { ...newBlock.style, backgroundColor: '#3b82f6', color: '#ffffff', textAlign: 'center', borderRadius: 6, fontSize: '16px', fontWeight: 'bold', paddingTop: 15, paddingBottom: 15 };
    } else if (type === 'divider') {
      newBlock.style = { ...newBlock.style, borderColor: '#e2e8f0', borderWidth: 1, borderStyle: 'solid', paddingTop: 15, paddingBottom: 15 };
    } else if (type === 'spacer') {
      newBlock.properties = { height: 30 };
    } else if (type === 'social') {
      newBlock.properties = {
        socialLinks: [
          { platform: 'facebook', url: 'https://facebook.com' },
          { platform: 'twitter', url: 'https://twitter.com' },
          { platform: 'linkedin', url: 'https://linkedin.com' },
        ],
      };
      newBlock.style = { ...newBlock.style, textAlign: 'center', paddingTop: 15, paddingBottom: 15 };
    } else if (type === 'footer') {
      newBlock.content = '© 2026 Your Company. All rights reserved.<br/>Want to receive fewer emails? You can <a href="#" style="color: inherit; text-decoration: underline;">unsubscribe</a>.';
      newBlock.style = { ...newBlock.style, color: '#6b7280', textAlign: 'center', fontSize: '12px', lineHeight: '1.5', paddingTop: 20, paddingBottom: 20 };
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

  const handleCreateSnapshot = () => {
    setSnapshots(s => [
      { id: Date.now().toString(), timestamp: Date.now(), template: JSON.parse(JSON.stringify(template)) },
      ...s
    ].slice(0, 20));
    showToast('Snapshot saved manually.', 'success');
  };

  const selectedBlock = template.blocks.find((b) => b.id === selectedBlockId) || null;

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
    <div className="flex flex-col h-screen w-screen bg-[#F8F9FA] dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans overflow-hidden">
      
      {/* SaaS App Header Tool Rail */}
      <header className="h-16 border-b border-slate-200/80 dark:border-slate-850 bg-white dark:bg-slate-900 flex items-center justify-between px-4 sm:px-6 shrink-0 z-10 shadow-xs">
        <div className="flex items-center gap-3">
          <button
            id="btn-back-home"
            onClick={handleGoBack}
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition-colors cursor-pointer"
            title="Back to Home Dashboard"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <img 
            src="/dost_mailkit_icon.jpg" 
            alt="Dost_MailKit" 
            className="w-8 h-8 rounded-lg object-cover shadow-sm transition-all hover:scale-105 shrink-0"
          />
          <span className="font-bold text-slate-800 dark:text-slate-200 tracking-tight text-sm uppercase tracking-wider hidden md:inline">Dost_MailKit</span>
          <div className="h-4 w-px bg-slate-200 dark:bg-slate-800 mx-1 hidden md:block"></div>
          <div className="flex flex-col">
            <input 
              type="text" 
              value={template.subject} 
              onChange={(e) => updateTemplate({ subject: e.target.value })}
              className="text-xs sm:text-sm font-semibold border-none focus:ring-0 p-0 text-slate-700 dark:text-slate-300 bg-transparent w-40 sm:w-64 outline-none placeholder-slate-400"
              placeholder="Summer Solstice Sale 2024"
              title="Click to edit subject line"
            />
            <span className="text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest leading-none mt-0.5">Subject Line</span>
          </div>
        </div>

        {/* Global Toolbar Options */}
        <div className="flex items-center gap-4">
          
          {/* History Stack Toggles */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border border-slate-200/50 dark:border-slate-800">
            <button
              id="btn-undo"
              onClick={handleUndo}
              disabled={history.past.length === 0}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-white dark:hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-transparent transition-all cursor-pointer"
              title="Undo Action (Ctrl+Z)"
            >
              <Undo2 className="h-4 w-4" />
            </button>
            <button
              id="btn-redo"
              onClick={handleRedo}
              disabled={history.future.length === 0}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-white dark:hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-transparent transition-all cursor-pointer"
              title="Redo Action (Ctrl+Y)"
            >
              <Redo2 className="h-4 w-4" />
            </button>
            <button
              id="btn-history"
              onClick={() => setIsVersionHistoryOpen(true)}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-white dark:hover:bg-slate-800 transition-all cursor-pointer"
              title="Version History"
            >
              <Clock className="h-4 w-4" />
            </button>
          </div>

          {/* Sync / Autosave Indicator */}
          <div className="flex items-center gap-2.5 text-xs">
            {autosaveStatus === 'saving' ? (
              <div className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 px-2.5 py-1 rounded-full border border-blue-100 dark:border-blue-900/40 font-semibold animate-pulse">
                <RefreshCw className="h-3 w-3 animate-spin" />
                <span>Saving...</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-full border border-emerald-100 dark:border-emerald-900/40 font-semibold">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                <span>Autosaved {lastSavedTime && `at ${lastSavedTime}`}</span>
              </div>
            )}

            {/* Manual Save Button */}
            <button
              id="btn-manual-save"
              onClick={handleManualSave}
              className="flex items-center gap-1 py-1 px-2.5 text-xs font-semibold rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-all border border-slate-200 dark:border-slate-700 cursor-pointer"
              title="Save manually to Local Storage for peace of mind"
            >
              <Save className="h-3 w-3" />
              <span>Save</span>
            </button>
            <button
              id="btn-download-image"
              onClick={handleDownloadImage}
              className="flex items-center gap-1 py-1 px-2.5 text-xs font-semibold rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-all border border-slate-200 dark:border-slate-700 cursor-pointer hidden md:flex"
              title="Download Canvas as Image"
            >
              <ImageIcon className="h-3 w-3" />
              <span>Export Image</span>
            </button>
            <button
              id="btn-validate-email"
              onClick={handleValidateEmail}
              className="flex items-center gap-1 py-1 px-2.5 text-xs font-semibold rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-all border border-slate-200 dark:border-slate-700 cursor-pointer hidden md:flex"
              title="Validate Links & Images"
            >
              <Link className="h-3 w-3" />
              <span>Validate URLs</span>
            </button>
          </div>

          <div className="h-5 w-px bg-slate-200 dark:bg-slate-800" />

          {/* Smart Layout AI Button */}
          <button
            id="btn-smart-layout"
            onClick={() => setIsSmartLayoutOpen(true)}
            className="flex items-center gap-1.5 py-1.5 px-3 text-xs font-extrabold rounded-xl transition-all bg-gradient-to-r from-blue-650 to-indigo-650 hover:from-blue-700 hover:to-indigo-750 text-white shadow-md hover:-translate-y-0.5 active:translate-y-0 cursor-pointer shrink-0"
            title="AI Smart Layout: Harmonize color theme and professional spacing improvements"
          >
            <Sparkles className="h-3.5 w-3.5 animate-pulse text-blue-100 shrink-0" />
            <span>Smart Layout</span>
          </button>

          <div className="h-5 w-px bg-slate-200 dark:bg-slate-800" />

          {/* View Toggles */}
          <div className="flex items-center gap-1">
            <button
              id="btn-toggle-grid"
              onClick={() => setShowGrid(!showGrid)}
              className={`p-2 rounded-xl transition-colors border border-transparent cursor-pointer ${showGrid ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400' : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 dark:border-slate-800'}`}
              title={showGrid ? 'Hide Grid' : 'Show Grid'}
            >
              <Grid className="h-4 w-4" />
            </button>
            <button
              id="btn-toggle-theme"
              onClick={toggleTheme}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border border-transparent dark:border-slate-800 cursor-pointer"
              title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
            >
              {theme === 'light' ? (
                <Moon className="h-4 w-4" />
              ) : (
                <Sun className="h-4 w-4 text-amber-500" />
              )}
            </button>
          </div>

          <div className="h-5 w-px bg-slate-200 dark:bg-slate-800" />

          {/* Core View Selector Tabs */}
          <div className="flex bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border border-slate-200/50 dark:border-slate-800">
            <button
              id="btn-mode-design"
              onClick={() => setViewMode('design')}
              className={`flex items-center gap-1.5 py-1.5 px-3.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                viewMode === 'design'
                  ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm border border-slate-200/30 dark:border-slate-700/50'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              Design Studio
            </button>
            <button
              id="btn-mode-split"
              onClick={() => setViewMode('split')}
              className={`flex items-center gap-1.5 py-1.5 px-3.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                viewMode === 'split'
                  ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm border border-slate-200/30 dark:border-slate-700/50'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <Code2 className="h-3.5 w-3.5" />
              Split Mode
            </button>
            <button
              id="btn-mode-developer"
              onClick={() => setViewMode('developer')}
              className={`flex items-center gap-1.5 py-1.5 px-3.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                viewMode === 'developer'
                  ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm border border-slate-200/30 dark:border-slate-700/50'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <FileCode className="h-3.5 w-3.5" />
              Developer Sandbox
            </button>
          </div>

          <button
            id="btn-export-html"
            onClick={handleExportHTML}
            className="flex items-center gap-1.5 py-2 px-4 text-xs font-bold rounded-xl transition-all bg-blue-600 text-white hover:bg-blue-700 shadow-xs cursor-pointer"
          >
            <Download className="h-3.5 w-3.5 text-blue-100" />
            Export HTML
          </button>

          <button
            id="btn-preview-and-test"
            onClick={() => setIsPreviewOpen(true)}
            className="flex items-center gap-1.5 py-2 px-4 text-xs font-bold rounded-xl transition-all bg-slate-900 text-white hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 shadow-xs cursor-pointer border border-transparent dark:border-slate-700"
          >
            <Inbox className="h-3.5 w-3.5 text-slate-300 dark:text-slate-400" />
            Preview & Test
          </button>
        </div>
      </header>

      {/* Main workspace layout: Styled as a Bento Grid with gap, paddings, and background */}
      <div className="flex-1 flex flex-wrap lg:flex-nowrap overflow-y-auto lg:overflow-hidden min-h-0 p-2 sm:p-4 gap-2 sm:gap-4 bg-[#F8F9FA] dark:bg-slate-950 pb-24 lg:pb-4 relative">
        
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
          <div className="flex-1 bg-slate-900 rounded-2xl border border-slate-800 p-4 sm:p-6 overflow-hidden flex flex-col h-full shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-sm font-bold text-slate-100 flex items-center gap-1.5">
                  <Code2 className="h-4 w-4 text-blue-400 animate-pulse" />
                  Markup & Raw Code Inspect Room
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
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
      <div className="lg:hidden fixed bottom-4 left-1/2 -translate-x-1/2 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200/80 dark:border-slate-850 p-2 rounded-full shadow-xl flex items-center gap-2 z-50">
        <button
          onClick={() => setMobileWorkspaceView('elements')}
          className={`px-4 py-2 rounded-full text-xs font-extrabold transition-all flex items-center gap-1.5 cursor-pointer ${
            mobileWorkspaceView === 'elements'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-550 dark:text-slate-450 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <LayoutGrid className="h-3.5 w-3.5" />
          <span>Blocks</span>
        </button>
        <button
          onClick={() => setMobileWorkspaceView('canvas')}
          className={`px-4 py-2 rounded-full text-xs font-extrabold transition-all flex items-center gap-1.5 cursor-pointer ${
            mobileWorkspaceView === 'canvas'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-550 dark:text-slate-450 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Inbox className="h-3.5 w-3.5" />
          <span>Canvas</span>
        </button>
        <button
          onClick={() => setMobileWorkspaceView('inspector')}
          className={`px-4 py-2 rounded-full text-xs font-extrabold transition-all flex items-center gap-1.5 cursor-pointer ${
            mobileWorkspaceView === 'inspector'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-550 dark:text-slate-450 hover:text-slate-800 dark:hover:text-slate-200'
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
            className={`fixed bottom-24 right-4 lg:bottom-6 lg:right-6 z-[100] flex items-center gap-2.5 px-4 py-3 rounded-2xl shadow-lg border transition-all ${
              toast.type === 'success' 
                ? 'bg-emerald-50 dark:bg-emerald-950/80 border-emerald-200 dark:border-emerald-900/60 text-emerald-800 dark:text-emerald-300' 
                : toast.type === 'error' 
                  ? 'bg-red-50 dark:bg-red-950/80 border-red-200 dark:border-red-900/60 text-red-800 dark:text-red-300' 
                  : 'bg-blue-50 dark:bg-blue-950/80 border-blue-200 dark:border-blue-900/60 text-blue-800 dark:text-blue-300'
            }`}
          >
            {toast.type === 'success' && <Check className="h-4 w-4 text-emerald-500" />}
            <span className="text-xs font-bold">{toast.message}</span>
            <button 
              onClick={() => setToast(null)}
              className="text-[10px] uppercase font-black tracking-wider opacity-60 hover:opacity-100 ml-1.5 cursor-pointer"
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
          className="fixed pointer-events-none z-[9999] select-none backdrop-blur-md bg-white/80 dark:bg-slate-900/80 border-2 border-blue-500/80 rounded-xl px-3 py-2 flex items-center gap-2 shadow-xl animate-fade-in transition-all"
          style={{
            left: `${dragCoords.x + 12}px`,
            top: `${dragCoords.y + 12}px`,
          }}
        >
          <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center shadow-2xs">
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
            <span className="text-[11px] font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider">
              {draggedNewBlockType} Block
            </span>
            <span className="text-[9px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none mt-0.5">
              Drop onto Canvas
            </span>
          </div>
        </div>
      )}

    </div>
  );
}
