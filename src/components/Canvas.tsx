import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  ArrowUp, 
  ArrowDown, 
  Copy, 
  Trash2, 
  GripVertical, 
  Monitor, 
  Smartphone,
  Tablet,
  Sparkles,
  MousePointerClick,
  Edit2,
  Check,
  Lock,
  Unlock
} from 'lucide-react';
import { EmailTemplate, EmailBlock, BlockType } from '../types';

const replaceVariables = (text: string, variables?: Record<string, string>): string => {
  if (!text) return '';
  return text.replace(/{{\s*([^{}\s]+)\s*}}/g, (match, varName) => {
    if (variables && variables[varName] !== undefined) {
      return variables[varName];
    }
    return match;
  });
};

interface CanvasProps {
  template: EmailTemplate;
  selectedBlockId: string | null;
  onSelectBlock: (id: string | null) => void;
  onUpdateBlocks: (blocks: EmailBlock[]) => void;
  onUpdateBlock: (blockId: string, updates: Partial<EmailBlock>) => void;
  onDeleteBlock: (id: string) => void;
  onCloneBlock: (id: string) => void;
  showGrid?: boolean;
}

export default function Canvas({
  template,
  selectedBlockId,
  onSelectBlock,
  onUpdateBlocks,
  onUpdateBlock,
  onDeleteBlock,
  onCloneBlock,
  showGrid = false
}: CanvasProps) {
  const [viewportMode, setViewportMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [draggedBlockId, setDraggedBlockId] = useState<string | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  
  // Interactive Figma Drag-to-Move and Drag-to-Resize states
  const [movingBlockId, setMovingBlockId] = useState<string | null>(null);
  const [dragStartCoords, setDragStartCoords] = useState<{ x: number; y: number; blockLeft: number; blockTop: number } | null>(null);

  const [resizingBlockId, setResizingBlockId] = useState<string | null>(null);
  const [resizeStartCoords, setResizeStartCoords] = useState<{ x: number; y: number; blockWidth: number; blockHeight: number } | null>(null);

  const { globalSettings, blocks } = template;

  // Drag-to-move effect
  React.useEffect(() => {
    if (!movingBlockId || !dragStartCoords) return;

    const handleMouseMove = (e: MouseEvent) => {
      const dx = e.clientX - dragStartCoords.x;
      const dy = e.clientY - dragStartCoords.y;
      
      const newLeft = Math.max(0, dragStartCoords.blockLeft + dx);
      const newTop = Math.max(0, dragStartCoords.blockTop + dy);
      
      onUpdateBlock(movingBlockId, {
        style: {
          ...blocks.find(b => b.id === movingBlockId)?.style,
          left: newLeft,
          top: newTop
        }
      });
    };

    const handleMouseUp = () => {
      setMovingBlockId(null);
      setDragStartCoords(null);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [movingBlockId, dragStartCoords, blocks, onUpdateBlock]);

  // Drag-to-resize effect
  React.useEffect(() => {
    if (!resizingBlockId || !resizeStartCoords) return;

    const handleMouseMove = (e: MouseEvent) => {
      const dx = e.clientX - resizeStartCoords.x;
      const dy = e.clientY - resizeStartCoords.y;
      
      const newWidth = Math.max(60, resizeStartCoords.blockWidth + dx);
      const newHeight = Math.max(20, resizeStartCoords.blockHeight + dy);
      
      onUpdateBlock(resizingBlockId, {
        style: {
          ...blocks.find(b => b.id === resizingBlockId)?.style,
          width: `${newWidth}px`,
          height: `${newHeight}px`
        }
      });
    };

    const handleMouseUp = () => {
      setResizingBlockId(null);
      setResizeStartCoords(null);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [resizingBlockId, resizeStartCoords, blocks, onUpdateBlock]);

  const handleBlockMouseDown = (e: React.MouseEvent, block: EmailBlock) => {
    if (block.style.position !== 'absolute' || globalSettings.layoutMode !== 'figma') return;
    
    // Only drag with left mouse button click
    if (e.button !== 0) return;
    
    // Ignore interactive forms, inputs and button clicks
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('input') || target.closest('textarea') || target.closest('select')) {
      return;
    }

    e.stopPropagation();
    onSelectBlock(block.id);
    
    setMovingBlockId(block.id);
    setDragStartCoords({
      x: e.clientX,
      y: e.clientY,
      blockLeft: block.style.left !== undefined ? block.style.left : 20,
      blockTop: block.style.top !== undefined ? block.style.top : 50
    });
  };

  const handleResizeMouseDown = (e: React.MouseEvent, block: EmailBlock) => {
    e.stopPropagation();
    e.preventDefault();
    
    const el = document.getElementById(`canvas-block-${block.id}`);
    const currentWidth = el ? el.offsetWidth : parseInt(block.style.width || '250') || 250;
    const currentHeight = el ? el.offsetHeight : parseInt(block.style.height || '120') || 120;
    
    setResizingBlockId(block.id);
    setResizeStartCoords({
      x: e.clientX,
      y: e.clientY,
      blockWidth: currentWidth,
      blockHeight: currentHeight
    });
  };

  // Inline editing state
  const [editingBlockId, setEditingBlockId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>('');

  // Move block utility
  const handleMoveBlock = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= blocks.length) return;

    const newBlocks = [...blocks];
    const temp = newBlocks[index];
    newBlocks[index] = newBlocks[targetIndex];
    newBlocks[targetIndex] = temp;
    onUpdateBlocks(newBlocks);
  };

  // Drag-and-drop handlers for workspace blocks reordering & dropping new elements
  const handleCanvasDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleBlockDragStart = (e: React.DragEvent, blockId: string) => {
    setDraggedBlockId(blockId);
    e.dataTransfer.setData('text/block-id', blockId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnterBlock = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDragOverIndex(index);
  };

  const handleDropOnBlock = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDragOverIndex(null);
    
    const incomingBlockType = e.dataTransfer.getData('text/plain') as BlockType | '';
    const incomingBlockId = e.dataTransfer.getData('text/block-id');

    // Case 1: Reordering an existing block inside the canvas
    if (incomingBlockId) {
      const sourceIndex = blocks.findIndex((b) => b.id === incomingBlockId);
      if (sourceIndex === -1 || sourceIndex === index) return;

      const updatedBlocks = [...blocks];
      const [movedBlock] = updatedBlocks.splice(sourceIndex, 1);
      
      // Determine final landing index based on relative direction
      const destinationIndex = index;
      updatedBlocks.splice(destinationIndex, 0, movedBlock);
      onUpdateBlocks(updatedBlocks);
      setDraggedBlockId(null);
      return;
    }

    // Case 2: Dropping a brand new block from sidebar
    if (incomingBlockType) {
      const newBlock = createDefaultBlock(incomingBlockType);
      const updatedBlocks = [...blocks];
      updatedBlocks.splice(index, 0, newBlock);
      onUpdateBlocks(updatedBlocks);
      onSelectBlock(newBlock.id);
    }
  };

  const handleDropOnEnd = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOverIndex(null);
    
    const incomingBlockType = e.dataTransfer.getData('text/plain') as BlockType | '';
    const incomingBlockId = e.dataTransfer.getData('text/block-id');

    if (incomingBlockId) {
      // Reorder to the end
      const sourceIndex = blocks.findIndex((b) => b.id === incomingBlockId);
      if (sourceIndex === -1 || sourceIndex === blocks.length - 1) return;
      
      const updatedBlocks = [...blocks];
      const [movedBlock] = updatedBlocks.splice(sourceIndex, 1);
      updatedBlocks.push(movedBlock);
      onUpdateBlocks(updatedBlocks);
      setDraggedBlockId(null);
      return;
    }

    if (incomingBlockType) {
      const newBlock = createDefaultBlock(incomingBlockType);
      onUpdateBlocks([...blocks, newBlock]);
      onSelectBlock(newBlock.id);
    }
  };

  // Create block with default configurations matching styling guide
  const createDefaultBlock = (type: BlockType): EmailBlock => {
    const uniqueId = `${type}-${Date.now()}`;
    switch (type) {
      case 'header':
        return {
          id: uniqueId,
          type,
          content: 'Amazing Product Headline ⭐️',
          style: {
            color: '#111827',
            textAlign: 'center',
            fontSize: '24px',
            fontWeight: 'bold',
            paddingTop: 20,
            paddingBottom: 20,
            paddingLeft: 20,
            paddingRight: 20,
          },
        };
      case 'text':
        return {
          id: uniqueId,
          type,
          content: '<p>Customize your rich description block here. Introduce key benefits, features, or share exciting newsletter insights with your subscribers.</p>',
          style: {
            color: '#374151',
            textAlign: 'left',
            fontSize: '15px',
            lineHeight: '1.6',
            paddingTop: 10,
            paddingBottom: 10,
            paddingLeft: 20,
            paddingRight: 20,
          },
        };
      case 'image':
        return {
          id: uniqueId,
          type,
          properties: {
            src: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&auto=format&fit=crop&q=80',
            alt: 'Visual Banner Graphic',
            width: '100%',
          },
          style: {
            borderRadius: 8,
            paddingTop: 10,
            paddingBottom: 10,
            paddingLeft: 20,
            paddingRight: 20,
          },
        };
      case 'button':
        return {
          id: uniqueId,
          type,
          content: 'Click To Explore Offer ➜',
          properties: {
            href: 'https://github.com/zalify/easy-email-editor',
          },
          style: {
            backgroundColor: '#3b82f6',
            color: '#ffffff',
            textAlign: 'center',
            borderRadius: 6,
            fontSize: '16px',
            fontWeight: 'bold',
            paddingTop: 15,
            paddingBottom: 15,
            paddingLeft: 20,
            paddingRight: 20,
          },
        };
      case 'divider':
        return {
          id: uniqueId,
          type,
          style: {
            borderColor: '#e2e8f0',
            borderWidth: 1,
            borderStyle: 'solid',
            paddingTop: 15,
            paddingBottom: 15,
            paddingLeft: 20,
            paddingRight: 20,
          },
        };
      case 'spacer':
        return {
          id: uniqueId,
          type,
          properties: {
            height: 30,
          },
          style: {
            paddingTop: 0,
            paddingBottom: 0,
            paddingLeft: 0,
            paddingRight: 0,
          },
        };
      case 'social':
        return {
          id: uniqueId,
          type,
          properties: {
            socialLinks: [
              { platform: 'facebook', url: 'https://facebook.com' },
              { platform: 'twitter', url: 'https://twitter.com' },
              { platform: 'linkedin', url: 'https://linkedin.com' },
            ],
          },
          style: {
            textAlign: 'center',
            paddingTop: 15,
            paddingBottom: 15,
          },
        };
      case 'footer':
        return {
          id: uniqueId,
          type,
          content: '© 2026 Your Company. All rights reserved.<br/>123 Workspace Ave, San Francisco CA.<br/>To manage emails, <a href="#" style="color: inherit; text-decoration: underline;">unsubscribe</a>.',
          style: {
            color: '#6b7280',
            textAlign: 'center',
            fontSize: '12px',
            lineHeight: '1.5',
            paddingTop: 20,
            paddingBottom: 20,
            paddingLeft: 20,
            paddingRight: 20,
          },
        };
      case 'section':
        return {
          id: uniqueId,
          type,
          properties: {
            columns: [
              [
                {
                  id: `header-${Date.now()}-1`,
                  type: 'header',
                  content: 'Left Column Heading',
                  style: { fontSize: '18px', textAlign: 'left', fontWeight: 'bold' }
                }
              ],
              [
                {
                  id: `text-${Date.now()}-2`,
                  type: 'text',
                  content: 'Right Column content goes here.',
                  style: { fontSize: '14px', textAlign: 'left' }
                }
              ]
            ],
            columnWidths: [50, 50],
            columnGap: 10,
            stackOnMobile: true,
          },
          style: {
            paddingTop: 15,
            paddingBottom: 15,
            paddingLeft: 20,
            paddingRight: 20,
          }
        };
      case 'hero':
        return {
          id: uniqueId,
          type,
          content: 'SUMMER VIBES',
          properties: {
            src: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800',
            alt: 'Hero background image',
            badge: 'Limited Offer',
            price: 'Save up to 50% on all outdoor items',
            href: 'https://google.com',
            overlayScrim: 'rgba(15, 23, 42, 0.45)',
            overlayPosition: 'center',
          },
          style: {
            paddingTop: 0,
            paddingBottom: 0,
            paddingLeft: 0,
            paddingRight: 0,
            borderRadius: 12,
            textAlign: 'center',
          }
        };
      case 'imageGrid':
        return {
          id: uniqueId,
          type,
          properties: {
            images: [
              { src: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=300', alt: 'Grid Image 1' },
              { src: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300', alt: 'Grid Image 2' },
              { src: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300', alt: 'Grid Image 3' }
            ]
          },
          style: {
            paddingTop: 10,
            paddingBottom: 10,
            paddingLeft: 20,
            paddingRight: 20,
          }
        };
      case 'productCard':
        return {
          id: uniqueId,
          type,
          content: 'Modern Leather Headset',
          properties: {
            badge: 'New Arrival',
            price: '$129.99',
            src: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400',
            alt: 'Headset',
            href: '#',
          },
          style: {
            paddingTop: 15,
            paddingBottom: 15,
            paddingLeft: 20,
            paddingRight: 20,
            borderRadius: 12,
          }
        };
      case 'quote':
        return {
          id: uniqueId,
          type,
          content: 'Design is not just what it looks like and feels like. Design is how it works.',
          properties: {
            author: 'Steve Jobs',
          },
          style: {
            paddingTop: 15,
            paddingBottom: 15,
            paddingLeft: 20,
            paddingRight: 20,
          }
        };
      case 'navbar':
        return {
          id: uniqueId,
          type,
          content: 'Dost_MailKit ⚡️',
          properties: {
            socialLinks: [
              { platform: 'Shop', url: '#' },
              { platform: 'Deals', url: '#' },
              { platform: 'Support', url: '#' }
            ]
          },
          style: {
            paddingTop: 15,
            paddingBottom: 15,
            paddingLeft: 20,
            paddingRight: 20,
          }
        };
      case 'htmlEmbed':
        return {
          id: uniqueId,
          type,
          content: '<div style="background-color: #fef08a; padding: 10px; border-radius: 6px; text-align: center; font-weight: bold; color: #854d0e;">⚡️ Flash Sale Banner! Custom HTML Code</div>',
          style: {
            paddingTop: 10,
            paddingBottom: 10,
            paddingLeft: 20,
            paddingRight: 20,
          }
        };
      case 'countdown':
        return {
          id: uniqueId,
          type,
          properties: {
            countdownDate: 'December 31, 2026',
          },
          style: {
            paddingTop: 15,
            paddingBottom: 15,
            paddingLeft: 20,
            paddingRight: 20,
            borderRadius: 12,
          }
        };
      default:
        // fallback
        return {
          id: uniqueId,
          type: 'text',
          content: 'New component block text',
          style: {}
        };
    }
  };

  // Quick inline text edit handlers
  const startEditing = (e: React.MouseEvent, block: EmailBlock) => {
    e.stopPropagation();
    setEditingBlockId(block.id);
    setEditValue(block.content || '');
  };

  const saveInlineEdit = (blockId: string) => {
    const updated = blocks.map((b) => {
      if (b.id === blockId) {
        return { ...b, content: editValue };
      }
      return b;
    });
    onUpdateBlocks(updated);
    setEditingBlockId(null);
  };

  return (
    <div className="flex-1 flex flex-col bg-[#EBEDF0] dark:bg-slate-950 h-full overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs select-none">
      {/* Canvas Header / Controls */}
      <div className="h-14 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex justify-between items-center px-6 shrink-0 z-10">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Viewport:</span>
          <div className="flex bg-slate-100 dark:bg-slate-950 rounded-lg p-0.5 border border-slate-200/50 dark:border-slate-800">
            <button
              id="btn-viewport-desktop"
              onClick={() => setViewportMode('desktop')}
              className={`p-1.5 rounded-md transition-all cursor-pointer ${
                viewportMode === 'desktop'
                  ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
              title="Desktop View (e.g. 600px)"
            >
              <Monitor className="h-4 w-4" />
            </button>
            <button
              id="btn-viewport-tablet"
              onClick={() => setViewportMode('tablet')}
              className={`p-1.5 rounded-md transition-all cursor-pointer ${
                viewportMode === 'tablet'
                  ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
              title="Tablet View (480px)"
            >
              <Tablet className="h-4 w-4" />
            </button>
            <button
              id="btn-viewport-mobile"
              onClick={() => setViewportMode('mobile')}
              className={`p-1.5 rounded-md transition-all cursor-pointer ${
                viewportMode === 'mobile'
                  ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
              title="Mobile View (375px)"
            >
              <Smartphone className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Info label */}
        <div className="hidden md:flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/60 px-3 py-1 rounded-full border border-slate-200/30 dark:border-slate-850">
          <Sparkles className="h-3.5 w-3.5 text-blue-500" />
          <span>Click on elements to edit styles and contents.</span>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-xs font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-200/30 dark:border-slate-800">
            {blocks.length} sections
          </div>

          {blocks.length > 0 && (
            <div className="relative">
              {showClearConfirm ? (
                <div className="flex items-center gap-1.5 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/40 p-1 rounded-lg">
                  <span className="text-[10px] font-bold text-red-600 dark:text-red-400 px-1.5">Clear template?</span>
                  <button
                    id="btn-clear-canvas-yes"
                    onClick={() => {
                      onUpdateBlocks([]);
                      onSelectBlock(null);
                      setShowClearConfirm(false);
                    }}
                    className="px-2 py-0.5 text-[10px] font-bold bg-red-600 hover:bg-red-700 text-white rounded cursor-pointer transition-colors"
                  >
                    Yes
                  </button>
                  <button
                    id="btn-clear-canvas-no"
                    onClick={() => setShowClearConfirm(false)}
                    className="px-2 py-0.5 text-[10px] font-bold bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded cursor-pointer transition-colors"
                  >
                    No
                  </button>
                </div>
              ) : (
                <button
                  id="btn-clear-canvas"
                  onClick={() => setShowClearConfirm(true)}
                  className="flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg border border-red-250/40 dark:border-red-900/40 transition-all cursor-pointer"
                  title="Clear all blocks from the canvas to start from a blank template"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Clear Canvas</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Main Sandbox Stage container */}
      <div 
        className="flex-1 overflow-y-auto flex flex-col items-center justify-start relative transition-all"
        style={{ 
          backgroundColor: globalSettings.backgroundColor || '#f3f4f6',
          padding: 'clamp(0.5rem, 4vw, 2rem)',
        }}
        onDragOver={handleCanvasDragOver}
        onDrop={handleDropOnEnd}
        onClick={() => onSelectBlock(null)}
      >
        <div
          id="email-editor-stage"
          className="transition-all duration-300 relative shadow-2xl flex flex-col border border-slate-200/60 overflow-hidden shrink-0 mb-6 w-full"
          style={{
            width: viewportMode === 'desktop' ? `${globalSettings.contentWidth}px` : viewportMode === 'tablet' ? '480px' : '375px',
            maxWidth: '100%',
            borderRadius: `${globalSettings.borderRadius}px`,
            backgroundColor: globalSettings.contentBg || '#ffffff',
            minHeight: globalSettings.layoutMode === 'figma' ? '750px' : '600px',
            fontFamily: globalSettings.fontFamily,
            backgroundImage: (globalSettings.layoutMode === 'figma' || showGrid) ? 'radial-gradient(rgba(148, 163, 184, 0.25) 1.5px, transparent 1.5px)' : undefined,
            backgroundSize: (globalSettings.layoutMode === 'figma' || showGrid) ? '20px 20px' : undefined,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {blocks.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center border-2 border-dashed border-slate-200 m-4 rounded-xl min-h-[400px]">
              <MousePointerClick className="h-10 w-10 text-slate-400 mb-3 animate-bounce" />
              <h4 className="text-sm font-bold text-slate-700">Your Canvas is empty</h4>
              <p className="text-xs text-slate-400 mt-1 max-w-xs">
                Drag a content block from the sidebar or choose one of our starter templates in the Presets tab.
              </p>
            </div>
          ) : (
            blocks.map((block, index) => {
              const isSelected = selectedBlockId === block.id;
              const isBeingDragged = draggedBlockId === block.id;
              const isFigmaAbsolute = globalSettings.layoutMode === 'figma' && block.style.position === 'absolute';

              return (
                <motion.div
                  id={`canvas-block-${block.id}`}
                  key={block.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  draggable={!isFigmaAbsolute && !block.locked}
                  onDragStart={(e) => {
                    if (block.locked) { e.preventDefault(); return; }
                    handleBlockDragStart(e, block.id);
                  }}
                  onDragEnter={(e) => handleDragEnterBlock(e, index)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => handleDropOnBlock(e, index)}
                  onMouseDown={(e) => {
                     if (block.locked) return;
                     handleBlockMouseDown(e, block);
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectBlock(block.id);
                  }}
                  className={`group transition-all duration-150 ${
                    isFigmaAbsolute
                      ? `absolute rounded-lg border-2 shadow-xs ${!block.locked ? 'cursor-move' : ''} ${
                          isSelected 
                            ? 'border-blue-500 bg-blue-50/5 ring-2 ring-blue-500/20' 
                            : 'border-dashed border-slate-300 dark:border-slate-700 hover:border-blue-400 bg-slate-50/5'
                        }`
                      : `relative border-y ${
                          isSelected 
                            ? 'border-blue-500 bg-blue-50/10' 
                            : 'border-transparent hover:border-blue-300/60 hover:bg-slate-50/10'
                        } ${dragOverIndex === index ? 'border-t-4 border-t-blue-500' : ''}`
                  } ${isBeingDragged ? 'opacity-40 scale-[0.98]' : ''}`}
                  style={{
                    background: block.style.background 
                      ? (block.style.background.type === 'gradient' ? block.style.background.value : (block.style.background.type === 'image' ? `url(${block.style.background.value}) center/cover no-repeat` : block.style.background.value))
                      : block.style.backgroundColor || 'transparent',
                    paddingTop: `clamp(4px, 2%, ${block.style.paddingTop !== undefined ? block.style.paddingTop : 10}px)`,
                    paddingBottom: `clamp(4px, 2%, ${block.style.paddingBottom !== undefined ? block.style.paddingBottom : 10}px)`,
                    paddingLeft: `clamp(8px, 4%, ${block.style.paddingLeft !== undefined ? block.style.paddingLeft : 20}px)`,
                    paddingRight: `clamp(8px, 4%, ${block.style.paddingRight !== undefined ? block.style.paddingRight : 20}px)`,
                    borderRadius: block.style.borderRadius !== undefined ? `${block.style.borderRadius}px` : undefined,
                    overflow: block.style.borderRadius !== undefined ? 'hidden' : undefined,
                    
                    // Absolute coordinates and sizes when Figma Absolute mode is enabled
                    position: isFigmaAbsolute ? 'absolute' : undefined,
                    left: isFigmaAbsolute ? `${block.style.left !== undefined ? block.style.left : 20}px` : undefined,
                    top: isFigmaAbsolute ? `${block.style.top !== undefined ? block.style.top : 50}px` : undefined,
                    width: isFigmaAbsolute ? (block.style.width || '250px') : undefined,
                    height: isFigmaAbsolute ? (block.style.height || 'auto') : undefined,
                    zIndex: isFigmaAbsolute ? (block.style.zIndex !== undefined ? block.style.zIndex : 1) : undefined,
                  }}
                >
                  {/* Grip Indicator Handle (Only in flow layout) */}
                  {!isFigmaAbsolute && !block.locked && (
                    <div className="absolute left-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity p-1 bg-white border border-slate-200 rounded-md cursor-grab active:cursor-grabbing text-slate-400 shadow-xs z-20">
                      <GripVertical className="h-3.5 w-3.5" />
                    </div>
                  )}

                  {/* Highlight bounding box name */}
                  <div className={`absolute top-1.5 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-20 ${isFigmaAbsolute ? 'left-2' : 'left-8'}`}>
                    <span className={`text-[9px] font-bold tracking-wider font-mono px-1.5 py-0.5 rounded shadow-xs uppercase ${block.locked ? 'bg-amber-600 text-white' : 'bg-blue-600 text-white'}`}>
                      {block.type} {block.locked ? '(LOCKED)' : ''}
                    </span>
                  </div>

                  {/* Figma-style Coordinate badge on dragging/resizing */}
                  {isFigmaAbsolute && (isSelected || movingBlockId === block.id || resizingBlockId === block.id) && (
                    <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 pointer-events-none bg-blue-600 text-white text-[9px] font-bold font-mono px-1.5 py-0.5 rounded shadow-sm z-[9999] whitespace-nowrap flex gap-1.5 uppercase">
                      <span>X: {block.style.left !== undefined ? block.style.left : 20}px</span>
                      <span>Y: {block.style.top !== undefined ? block.style.top : 50}px</span>
                      <span>W: {block.style.width || '250px'}</span>
                    </div>
                  )}

                  {/* Figma resize corner handle */}
                  {isFigmaAbsolute && isSelected && !block.locked && (
                    <div
                      onMouseDown={(e) => handleResizeMouseDown(e, block)}
                      className="absolute bottom-[-4px] right-[-4px] w-2.5 h-2.5 bg-white border-2 border-blue-600 rounded-full cursor-se-resize z-50 shadow-xs hover:scale-125 transition-transform"
                      title="Drag to resize (Width/Height)"
                    />
                  )}

                  {/* Inline quick edit controls */}
                  {isSelected && (
                    <div className="absolute -top-4 right-3 flex items-center bg-blue-600 rounded-md shadow-lg z-30 overflow-hidden border border-blue-500 select-none">
                      {!isFigmaAbsolute && !block.locked && (
                        <>
                          <button
                            id={`btn-move-up-${block.id}`}
                            onClick={(e) => { e.stopPropagation(); handleMoveBlock(index, 'up'); }}
                            disabled={index === 0}
                            className="p-1 text-white hover:bg-blue-700 disabled:opacity-40 transition-colors"
                            title="Move Up"
                          >
                            <ArrowUp className="h-3.5 w-3.5" />
                          </button>
                          <button
                            id={`btn-move-down-${block.id}`}
                            onClick={(e) => { e.stopPropagation(); handleMoveBlock(index, 'down'); }}
                            disabled={index === blocks.length - 1}
                            className="p-1 text-white hover:bg-blue-700 disabled:opacity-40 transition-colors"
                            title="Move Down"
                          >
                            <ArrowDown className="h-3.5 w-3.5" />
                          </button>
                          <div className="w-px h-3 bg-blue-500" />
                        </>
                      )}
                      
                      {(block.type === 'text' || block.type === 'header' || block.type === 'button' || block.type === 'footer') && (
                        <button
                          id={`btn-inline-edit-${block.id}`}
                          onClick={(e) => startEditing(e, block)}
                          className="p-1 text-white hover:bg-blue-700 transition-colors flex items-center gap-1 px-1.5"
                          title="Edit Text Inline"
                        >
                          <Edit2 className="h-3 w-3" />
                          <span className="text-[10px] font-bold">Edit</span>
                        </button>
                      )}

                      <button
                        id={`btn-clone-${block.id}`}
                        onClick={(e) => { e.stopPropagation(); onCloneBlock(block.id); }}
                        className="p-1 text-white hover:bg-blue-700 transition-colors"
                        title="Clone Block"
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </button>

                      <button
                        id={`btn-toggle-lock-${block.id}`}
                        onClick={(e) => { e.stopPropagation(); onUpdateBlock(block.id, { locked: !block.locked }); }}
                        className="p-1 text-white hover:bg-blue-700 transition-colors"
                        title={block.locked ? "Unlock Block" : "Lock Block"}
                      >
                        {block.locked ? <Lock className="h-3.5 w-3.5" /> : <Unlock className="h-3.5 w-3.5" />}
                      </button>

                      {!block.locked && (
                        <button
                          id={`btn-delete-${block.id}`}
                          onClick={(e) => { e.stopPropagation(); onDeleteBlock(block.id); }}
                          className="p-1 text-white hover:bg-red-600 transition-colors"
                          title="Delete Block"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  )}

                  {/* Inner Content Rendering of Block */}
                  <div className="w-full relative">
                    {editingBlockId === block.id ? (
                      <div className="p-2 bg-slate-50 rounded-xl border border-blue-400 flex flex-col gap-2 z-10 relative" onClick={(e) => e.stopPropagation()}>
                        <label className="text-[10px] font-bold text-slate-400">INLINE COMPONENT EDITOR</label>
                        {block.type === 'text' || block.type === 'footer' ? (
                          <textarea
                            id={`textarea-inline-${block.id}`}
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            rows={4}
                            className="w-full text-xs p-2 border border-slate-200 rounded-lg bg-white outline-none focus:border-blue-500 font-mono"
                          />
                        ) : (
                          <input
                            id={`input-inline-${block.id}`}
                            type="text"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            className="w-full text-xs p-2 border border-slate-200 rounded-lg bg-white outline-none focus:border-blue-500"
                          />
                        )}
                        <div className="flex justify-end gap-1.5">
                          <button
                            id={`btn-inline-cancel-${block.id}`}
                            onClick={(e) => { e.stopPropagation(); setEditingBlockId(null); }}
                            className="px-2.5 py-1 text-[11px] font-semibold text-slate-500 hover:bg-slate-100 rounded"
                          >
                            Cancel
                          </button>
                          <button
                            id={`btn-inline-save-${block.id}`}
                            onClick={(e) => { e.stopPropagation(); saveInlineEdit(block.id); }}
                            className="px-2.5 py-1 text-[11px] font-semibold bg-blue-600 text-white hover:bg-blue-700 rounded flex items-center gap-1 shadow-xs"
                          >
                            <Check className="h-3 w-3" />
                            Apply Changes
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* Read-Only render with active styling */
                      <div 
                        style={{ 
                          textAlign: block.style.textAlign || 'left',
                          color: block.style.color,
                          fontSize: block.style.fontSize,
                          fontWeight: block.style.fontWeight,
                          lineHeight: block.style.lineHeight,
                        }}
                        className="transition-all"
                      >
                        {block.type === 'header' && (
                          <h1 className="m-0 break-words">{replaceVariables(block.content || 'Header Text', template.variables)}</h1>
                        )}

                        {block.type === 'text' && (
                          <div 
                            className="break-words font-sans prose prose-sm max-w-none"
                            dangerouslySetInnerHTML={{ __html: replaceVariables(block.content || 'Text paragraph goes here.', template.variables) }}
                          />
                        )}

                        {block.type === 'image' && (
                          <div className={`flex justify-${block.style.textAlign === 'center' ? 'center' : block.style.textAlign === 'right' ? 'end' : 'start'}`}>
                            <img
                              src={block.properties?.src || 'https://images.unsplash.com/photo-1579202673506-ca3ce28943ef?w=600&auto=format&fit=crop&q=80'}
                              alt={block.properties?.alt || 'Placeholder'}
                              style={{ 
                                width: block.properties?.width || '100%',
                                borderRadius: `${block.style.borderRadius || 0}px`
                              }}
                              className="max-w-full h-auto object-cover select-none"
                              referrerPolicy="no-referrer"
                              crossOrigin="anonymous"
                            />
                          </div>
                        )}

                        {block.type === 'button' && (
                          <div className={`flex justify-${block.style.textAlign === 'center' ? 'center' : block.style.textAlign === 'right' ? 'end' : 'start'}`}>
                            <a
                              href={block.properties?.href || '#'}
                              onClick={(e) => e.preventDefault()}
                              style={{
                                backgroundColor: block.style.backgroundColor || '#3b82f6',
                                color: block.style.color || '#ffffff',
                                borderRadius: `${block.style.borderRadius !== undefined ? block.style.borderRadius : 6}px`,
                                fontSize: block.style.fontSize || '16px',
                                fontWeight: block.style.fontWeight || 'bold',
                              }}
                              className="inline-block px-6 py-2.5 text-center text-decoration-none transition-all hover:brightness-95 shadow-xs whitespace-nowrap"
                            >
                              {replaceVariables(block.content || 'Button', template.variables)}
                            </a>
                          </div>
                        )}

                        {block.type === 'divider' && (
                          <div className={`flex justify-${block.style.textAlign === 'center' ? 'center' : block.style.textAlign === 'right' ? 'end' : 'start'} w-full`}>
                            <hr 
                              style={{
                                borderColor: block.style.borderColor || '#e2e8f0',
                                borderWidth: `${block.style.borderWidth !== undefined ? block.style.borderWidth : 1}px`,
                                borderStyle: block.style.borderStyle || 'solid',
                                width: block.style.width || '100%',
                              }}
                            />
                          </div>
                        )}

                        {block.type === 'spacer' && (
                          <div style={{ height: `${block.properties?.height || 30}px` }} className="w-full border border-dashed border-slate-300/30 flex items-center justify-center">
                            <span className="text-[9px] font-mono text-slate-300 select-none">Spacer: {block.properties?.height || 30}px</span>
                          </div>
                        )}

                        {block.type === 'social' && (
                          <div className={`flex justify-${block.style.textAlign === 'center' ? 'center' : block.style.textAlign === 'right' ? 'end' : 'start'} gap-3`}>
                            {(block.properties?.socialLinks || []).map((link, i) => {
                              let logoUrl = 'https://cdn-icons-png.flaticon.com/32/145/145802.png';
                              if (link.platform === 'twitter') logoUrl = 'https://cdn-icons-png.flaticon.com/32/733/733579.png';
                              if (link.platform === 'instagram') logoUrl = 'https://cdn-icons-png.flaticon.com/32/2111/2111463.png';
                              if (link.platform === 'linkedin') logoUrl = 'https://cdn-icons-png.flaticon.com/32/145/145807.png';
                              if (link.platform === 'youtube') logoUrl = 'https://cdn-icons-png.flaticon.com/32/1384/1384060.png';
                              if (link.platform === 'website') logoUrl = 'https://cdn-icons-png.flaticon.com/32/1006/1006771.png';

                              return (
                                <img
                                  key={i}
                                  src={logoUrl}
                                  alt={link.platform}
                                  className="w-7 h-7 transition-opacity hover:opacity-85"
                                  referrerPolicy="no-referrer"
                                />
                              );
                            })}
                          </div>
                        )}

                        {block.type === 'footer' && (
                          <div 
                            className="break-words text-xs leading-normal"
                            dangerouslySetInnerHTML={{ __html: replaceVariables(block.content || 'Footer text', template.variables) }}
                          />
                        )}

                        {block.type === 'section' && (
                          <div 
                            className={`flex flex-col ${block.properties?.stackOnMobile !== false ? 'md:flex-row' : 'flex-row'} items-stretch`} 
                            style={{ gap: `${block.properties?.columnGap || 10}px` }}
                          >
                            {(block.properties?.columns || []).map((colBlocks: EmailBlock[], colIdx: number) => {
                              const widths = block.properties?.columnWidths || [];
                              const colWidth = widths[colIdx] !== undefined ? `${widths[colIdx]}%` : '100%';
                              return (
                                <div 
                                  key={colIdx} 
                                  className="flex-1 flex flex-col min-h-[60px] p-2 border border-dashed border-slate-300/40 dark:border-slate-800 rounded-lg hover:border-slate-400/80"
                                  style={{ width: colWidth, flexGrow: widths[colIdx] ? undefined : 1 }}
                                >
                                  {colBlocks.length === 0 ? (
                                    <div className="flex-1 flex items-center justify-center p-4 text-[10px] text-slate-400">
                                      Empty Column
                                    </div>
                                  ) : (
                                    colBlocks.map((childBlock) => (
                                      <div 
                                        key={childBlock.id} 
                                        className={`p-2 my-1 border border-transparent hover:border-blue-400 rounded-md transition-all relative ${selectedBlockId === childBlock.id ? 'border-blue-500 bg-blue-50/5' : ''}`}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          onSelectBlock(childBlock.id);
                                        }}
                                      >
                                        <div className="text-[8px] font-bold font-mono text-slate-400/80 uppercase tracking-wider mb-1">{childBlock.type}</div>
                                        {childBlock.type === 'header' && <h1 style={{ fontSize: childBlock.style.fontSize || '18px', textAlign: childBlock.style.textAlign || 'left', fontWeight: childBlock.style.fontWeight || 'bold' }} className="m-0">{childBlock.content}</h1>}
                                        {childBlock.type === 'text' && <div dangerouslySetInnerHTML={{ __html: childBlock.content || '' }} style={{ fontSize: childBlock.style.fontSize || '14px', textAlign: childBlock.style.textAlign || 'left' }} />}
                                        {childBlock.type === 'image' && <img src={childBlock.properties?.src} className="w-full h-auto rounded" alt=""  crossOrigin="anonymous" />}
                                        {childBlock.type === 'button' && <button className="px-4 py-1.5 rounded font-bold text-white bg-blue-600 text-[11px]" style={{ backgroundColor: childBlock.style.backgroundColor }}>{childBlock.content}</button>}
                                        {childBlock.type === 'divider' && <hr className="my-1 border-slate-200" />}
                                        {childBlock.type === 'spacer' && <div style={{ height: '15px' }} className="border border-dashed border-slate-200/40" />}
                                      </div>
                                    ))
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {block.type === 'hero' && (
                          <div 
                            className="relative flex items-center justify-center p-8 bg-cover bg-center rounded-xl overflow-hidden min-h-[220px]"
                            style={{ 
                              backgroundImage: `url(${block.properties?.src || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800'})`,
                              justifyContent: block.properties?.overlayPosition === 'bottom-left' ? 'flex-start' : 'center',
                              alignItems: block.properties?.overlayPosition?.startsWith('bottom') ? 'flex-end' : 'center'
                            }}
                          >
                            <div 
                              className="absolute inset-0 z-1" 
                              style={{ backgroundColor: block.properties?.overlayScrim || 'rgba(15, 23, 42, 0.45)' }}
                            />
                            <div className="relative z-10 text-white text-center w-full max-w-md p-4">
                              {block.properties?.badge && (
                                <span className="inline-block px-2.5 py-0.5 bg-blue-600 text-white rounded text-[9px] font-extrabold uppercase tracking-widest mb-3">
                                  {block.properties.badge}
                                </span>
                              )}
                              <h2 className="text-xl md:text-2xl font-extrabold mb-1 leading-tight drop-shadow-md">
                                {replaceVariables(block.content || 'Hero Title', template.variables)}
                              </h2>
                              {block.properties?.price && (
                                <p className="text-xs md:text-sm text-slate-100 opacity-90 mb-3 font-medium">
                                  {replaceVariables(block.properties.price, template.variables)}
                                </p>
                              )}
                              {block.properties?.href && (
                                <span className="inline-block bg-white text-slate-900 px-4 py-2 rounded-lg text-[11px] font-extrabold shadow-md hover:scale-102 transition-transform">
                                  Explore Offer
                                </span>
                              )}
                            </div>
                          </div>
                        )}

                        {block.type === 'imageGrid' && (
                          <div className="grid grid-cols-3 gap-2 w-full">
                            {(block.properties?.images || []).map((img, i) => (
                              <div key={i} className="aspect-square bg-slate-100 dark:bg-slate-800 rounded-lg overflow-hidden border border-slate-200/80 dark:border-slate-800">
                                <img src={img.src} alt={img.alt || ''} className="w-full h-full object-cover" crossOrigin="anonymous" />
                              </div>
                            ))}
                          </div>
                        )}

                        {block.type === 'productCard' && (
                          <div className="flex flex-col items-center p-4 border border-slate-200 dark:border-slate-800 rounded-xl max-w-sm mx-auto shadow-xs">
                            {block.properties?.badge && (
                              <span className="bg-rose-500 text-white font-extrabold text-[9px] uppercase px-2 py-0.5 rounded-full mb-3 self-center">
                                {block.properties.badge}
                              </span>
                            )}
                            <img 
                              src={block.properties?.src || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400'} 
                              className="w-full h-40 object-cover rounded-lg mb-3" 
                              alt="" 
                              crossOrigin="anonymous"
                            />
                            <h3 
                              className="font-bold text-sm text-center mb-1"
                              style={{ color: block.style.color }}
                            >
                              {replaceVariables(block.content || 'Product Name', template.variables)}
                            </h3>
                            <span className="text-blue-600 font-extrabold text-base mb-3 block">
                              {block.properties?.price || '$0.00'}
                            </span>
                            <button className="bg-blue-600 text-white font-bold text-xs px-4 py-2 rounded-lg w-full transition-transform active:scale-[0.98]">
                              Buy Now
                            </button>
                          </div>
                        )}

                        {block.type === 'quote' && (
                          <div 
                            className="border-l-4 border-blue-500 pl-4 py-1 italic"
                            style={{ color: block.style.color }}
                          >
                            <p className="text-base font-medium">
                              "{replaceVariables(block.content || 'Quotable text goes here', template.variables)}"
                            </p>
                            {block.properties?.author && (
                              <cite className="text-xs text-slate-400 dark:text-slate-500 not-italic block mt-1 font-bold">
                                — {block.properties.author}
                              </cite>
                            )}
                          </div>
                        )}

                        {block.type === 'navbar' && (
                          <div className="flex justify-between items-center border-b border-slate-200/50 pb-3 w-full">
                            <span className="font-bold text-slate-900 dark:text-white text-base">
                              {replaceVariables(block.content || 'Brand Logo', template.variables)}
                            </span>
                            <div className="flex gap-4">
                              {(block.properties?.socialLinks || []).map((link, i) => (
                                <span key={i} className="text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-blue-500 cursor-pointer">
                                  {link.platform}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {block.type === 'htmlEmbed' && (
                          <div className="w-full">
                            <div className="text-[9px] font-mono font-bold text-amber-500 bg-amber-50 dark:bg-amber-950/20 px-2 py-1 rounded border border-amber-200 dark:border-amber-900/30 mb-2 select-none uppercase tracking-wider">
                              HTML Embed Preview
                            </div>
                            <div dangerouslySetInnerHTML={{ __html: block.content || '<!-- empty -->' }} />
                          </div>
                        )}

                        {block.type === 'countdown' && (
                          <div className="flex flex-col items-center p-5 bg-slate-950 text-white rounded-xl shadow-md w-full">
                            <span className="text-blue-400 font-bold uppercase text-[9px] tracking-widest mb-3">🔥 Limited Offer! Ends Soon</span>
                            <div className="flex gap-4">
                              <div className="flex flex-col items-center">
                                <div className="bg-slate-800 px-3 py-1.5 rounded-lg text-lg font-bold">02</div>
                                <span className="text-[8px] text-slate-400 mt-1 uppercase tracking-wider">Days</span>
                              </div>
                              <div className="text-lg font-bold pt-1">:</div>
                              <div className="flex flex-col items-center">
                                <div className="bg-slate-800 px-3 py-1.5 rounded-lg text-lg font-bold">14</div>
                                <span className="text-[8px] text-slate-400 mt-1 uppercase tracking-wider">Hrs</span>
                              </div>
                              <div className="text-lg font-bold pt-1">:</div>
                              <div className="flex flex-col items-center">
                                <div className="bg-slate-800 px-3 py-1.5 rounded-lg text-lg font-bold">35</div>
                                <span className="text-[8px] text-slate-400 mt-1 uppercase tracking-wider">Mins</span>
                              </div>
                              <div className="text-lg font-bold pt-1">:</div>
                              <div className="flex flex-col items-center">
                                <div className="bg-slate-800 px-3 py-1.5 rounded-lg text-lg font-bold">59</div>
                                <span className="text-[8px] text-slate-400 mt-1 uppercase tracking-wider">Secs</span>
                              </div>
                            </div>
                            <span className="text-[9px] text-slate-500 mt-3">Target: {block.properties?.countdownDate || 'December 31, 2026'}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })
          )}
        </div>

        {/* Viewport Toggle floating at bottom */}
        <div className="flex items-center space-x-2 bg-white/95 backdrop-blur-xs border border-slate-200 px-4 py-2 rounded-full shadow-md shrink-0">
          <button 
            onClick={() => setViewportMode('desktop')} 
            className={`p-1.5 rounded-lg transition-all ${viewportMode === 'desktop' ? 'bg-blue-100 text-blue-600 font-bold' : 'text-slate-400 hover:text-slate-600'}`}
            title="Switch to Desktop (600px width)"
          >
            <Monitor className="w-4 h-4" />
          </button>
          <button 
            onClick={() => setViewportMode('tablet')} 
            className={`p-1.5 rounded-lg transition-all ${viewportMode === 'tablet' ? 'bg-blue-100 text-blue-600 font-bold' : 'text-slate-400 hover:text-slate-600'}`}
            title="Switch to Tablet (480px width)"
          >
            <Tablet className="w-4 h-4" />
          </button>
          <button 
            onClick={() => setViewportMode('mobile')} 
            className={`p-1.5 rounded-lg transition-all ${viewportMode === 'mobile' ? 'bg-blue-100 text-blue-600 font-bold' : 'text-slate-400 hover:text-slate-600'}`}
            title="Switch to Mobile (375px width)"
          >
            <Smartphone className="w-4 h-4" />
          </button>
          <div className="h-4 w-px bg-slate-200 mx-1"></div>
          <span className="text-[11px] font-bold text-slate-700">
            {viewportMode === 'desktop' ? '100% (600px)' : viewportMode === 'tablet' ? '480px (Tablet)' : '375px (Mobile)'}
          </span>
        </div>
      </div>
    </div>
  );
}
