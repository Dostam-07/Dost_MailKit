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
  Unlock,
  RefreshCw,
  Eye,
  Link,
  Bookmark,
  Upload,
  Move
} from 'lucide-react';
import { EmailTemplate, EmailBlock, BlockType, SharedBlock, BlockStyle } from '../types';
import { THEME_PRESETS } from '../utils/themes';

import { blockRegistry } from '../blocks/registry';
import { createDefaultBlock } from '../utils/blockUtils';

import { Countdown } from './Countdown';

const replaceVariables = (text: string, variables?: Record<string, string>): string => {
  if (!text) return '';
  // Support {{ first_name }} as well as {{ first_name | default: "there" }}
  return text.replace(/{{\s*([a-zA-Z0-9_.-]+)(?:\s*\|\s*default:\s*"([^"]*)")?\s*}}/g, (match, varName, fallback) => {
    if (variables && variables[varName] !== undefined && variables[varName] !== '') {
      return variables[varName];
    }
    return fallback !== undefined ? fallback : '';
  });
};

const RenderBlockInterior: React.FC<{
  block: EmailBlock;
  template: EmailTemplate;
  isEditing?: boolean;
  editValue?: string;
  onEdit?: (val: string) => void;
  onSelectBlock: (id: string | null) => void;
  onUpdateBlock: (blockId: string, updates: Partial<EmailBlock>) => void;
  onUpdateBlocks: (blocks: EmailBlock[]) => void;
  allBlocks: EmailBlock[];
  selectedBlockId: string | null;
  onAddMediaAsset?: (asset: { name: string; url: string; category: 'logos' | 'banners' | 'products' | 'general'; altText: string }) => void;
}> = ({ 
  block, 
  template, 
  isEditing, 
  editValue, 
  onEdit, 
  onSelectBlock, 
  onUpdateBlock, 
  onUpdateBlocks, 
  allBlocks,
  selectedBlockId,
  onAddMediaAsset
}) => {
  const { type, content, properties, style } = block;

  switch (type) {
    case 'header':
      return (
        <h1 
          className={`outline-none transition-all ${isEditing ? 'bg-gold/10 ring-1 ring-gold/30 p-1 rounded' : ''}`}
          style={{ 
            color: style.color, 
            textAlign: style.textAlign, 
            fontSize: style.fontSize || '24px', 
            fontWeight: style.fontWeight || 'bold',
            fontFamily: style.fontFamily,
            lineHeight: style.lineHeight,
            paddingTop: `${style.paddingTop || 0}px`,
            paddingBottom: `${style.paddingBottom || 0}px`,
            paddingLeft: `${style.paddingLeft || 0}px`,
            paddingRight: `${style.paddingRight || 0}px`,
            margin: 0
          }}
          contentEditable={isEditing}
          suppressContentEditableWarning
          onBlur={(e) => onEdit?.(e.currentTarget.textContent || '')}
        >
          {isEditing ? editValue : replaceVariables(content || '', template.variables)}
        </h1>
      );

    case 'text':
      return (
        <div 
          className={`prose prose-sm max-w-none outline-none transition-all ${isEditing ? 'bg-gold/10 ring-1 ring-gold/30 p-2 rounded min-h-[40px]' : ''}`}
          style={{ 
            color: style.color, 
            textAlign: style.textAlign, 
            fontSize: style.fontSize, 
            lineHeight: style.lineHeight,
            fontFamily: style.fontFamily,
            paddingTop: `${style.paddingTop || 0}px`,
            paddingBottom: `${style.paddingBottom || 0}px`,
            paddingLeft: `${style.paddingLeft || 0}px`,
            paddingRight: `${style.paddingRight || 0}px`,
          }}
          contentEditable={isEditing}
          suppressContentEditableWarning
          onBlur={(e) => onEdit?.(e.currentTarget.innerHTML || '')}
          dangerouslySetInnerHTML={isEditing ? undefined : { __html: replaceVariables(content || '', template.variables) }}
        >
          {isEditing ? editValue : null}
        </div>
      );

    case 'image':
      return (
        <div 
          className="flex flex-col items-center w-full relative group"
          style={{ 
            paddingTop: `${style.paddingTop || 0}px`,
            paddingBottom: `${style.paddingBottom || 0}px`,
            paddingLeft: `${style.paddingLeft || 0}px`,
            paddingRight: `${style.paddingRight || 0}px`,
          }}
        >
          <img 
            src={properties?.src} 
            alt={properties?.alt || 'Block Image'} 
            className={`max-w-full h-auto object-contain ${properties?.hoverScale ? 'transition-transform duration-300 hover:scale-105' : ''}`}
            style={{ 
              borderRadius: `${style.borderRadius || 0}px`,
              width: properties?.width || '100%',
              maxWidth: '100%',
              boxShadow: style.boxShadow,
              filter: `grayscale(${properties?.filterGrayscale || 0}%) sepia(${properties?.filterSepia || 0}%) contrast(${properties?.filterContrast || 100}%) brightness(${properties?.filterBrightness || 100}%)`,
              aspectRatio: properties?.aspectRatio && properties.aspectRatio !== 'original' ? properties.aspectRatio.replace('/', '/') : undefined,
            }}
            referrerPolicy="no-referrer"
            crossOrigin="anonymous"
          />
          {selectedBlockId === block.id && (
            <div className="absolute inset-0 bg-ink/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-xl">
              <button
                onClick={() => document.getElementById(`upload-${block.id}`)?.click()}
                className="px-4 py-2 bg-gold text-ink font-mono font-bold text-[10px] uppercase tracking-widest rounded-lg shadow-xl hover:scale-105 transition-transform flex items-center gap-2 cursor-pointer"
              >
                <Upload className="w-3 h-3" />
                Upload Image
              </button>
              <input 
                id={`upload-${block.id}`}
                type="file" 
                className="hidden" 
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = (ev) => {
                      const dataUrl = ev.target?.result as string;
                      onUpdateBlock(block.id, { properties: { ...properties, src: dataUrl } });
                      onAddMediaAsset?.({
                        name: `Uploaded Image ${Date.now()}`,
                        url: dataUrl,
                        category: 'general',
                        altText: 'Custom uploaded image'
                      });
                    };
                    reader.readAsDataURL(file);
                  }
                }}
              />
            </div>
          )}
        </div>
      );

    case 'button':
      return (
        <div 
          className="flex w-full"
          style={{ 
            justifyContent: style.textAlign === 'center' ? 'center' : style.textAlign === 'right' ? 'flex-end' : 'flex-start',
            paddingTop: `${style.paddingTop || 0}px`,
            paddingBottom: `${style.paddingBottom || 0}px`,
            paddingLeft: `${style.paddingLeft || 0}px`,
            paddingRight: `${style.paddingRight || 0}px`,
          }}
        >
          <a
            href={properties?.href || '#'}
            className="inline-block transition-transform hover:scale-[1.02] active:scale-[0.98]"
            style={{
              backgroundColor: style.backgroundColor || '#3b82f6',
              color: style.color || '#ffffff',
              padding: '12px 24px',
              borderRadius: `${style.borderRadius || 6}px`,
              fontSize: style.fontSize || '16px',
              fontWeight: style.fontWeight || 'bold',
              textDecoration: 'none',
              fontFamily: style.fontFamily,
              boxShadow: style.boxShadow
            }}
            onClick={(e) => e.preventDefault()}
          >
            {replaceVariables(content || 'Button', template.variables)}
          </a>
        </div>
      );

    case 'divider':
      return (
        <div style={{ 
          paddingTop: `${style.paddingTop || 15}px`, 
          paddingBottom: `${style.paddingBottom || 15}px`,
          paddingLeft: `${style.paddingLeft || 0}px`,
          paddingRight: `${style.paddingRight || 0}px`,
        }}>
          <hr style={{ 
            borderColor: style.borderColor || '#e2e8f0', 
            borderWidth: `${style.borderWidth || 1}px`, 
            borderStyle: style.borderStyle || 'solid' 
          }} />
        </div>
      );

    case 'spacer':
      return <div style={{ height: `${properties?.height || 30}px` }} />;

    case 'social':
      return (
        <div 
          className="flex gap-4 justify-center"
          style={{ 
            paddingTop: `${style.paddingTop || 15}px`, 
            paddingBottom: `${style.paddingBottom || 15}px`,
            paddingLeft: `${style.paddingLeft || 0}px`,
            paddingRight: `${style.paddingRight || 0}px`,
          }}
        >
          {(properties?.socialLinks || []).map((link: any, i: number) => (
            <div key={i} className="text-gold hover:text-gold-hover transition-colors">
              <span className="text-[10px] font-bold uppercase tracking-widest font-mono border-b border-gold/20 pb-0.5">
                {link.platform}
              </span>
            </div>
          ))}
        </div>
      );

    case 'countdown':
      return (
        <div 
          className="flex flex-col items-center justify-center bg-paper-2/30 py-8 px-4 rounded-2xl border border-gold/10"
          style={{ 
            paddingTop: `${style.paddingTop || 20}px`, 
            paddingBottom: `${style.paddingBottom || 20}px` 
          }}
        >
          <div className="mb-4 text-center">
            <h4 className="text-[10px] font-mono font-bold text-gold uppercase tracking-[0.2em] mb-2">Offer Ends In</h4>
            <Countdown targetDate={properties?.countdownDate || 'December 31, 2026'} />
          </div>
          <div className="text-[9px] font-medium text-text-on-paper/40 uppercase tracking-widest">
            {properties?.countdownDate || 'Limited Time Only'}
          </div>
        </div>
      );

    case 'navbar':
      return (
        <div 
          className="flex flex-col md:flex-row items-center justify-between gap-4"
          style={{ 
            paddingTop: `${style.paddingTop || 20}px`, 
            paddingBottom: `${style.paddingBottom || 20}px`,
            paddingLeft: `${style.paddingLeft || 20}px`,
            paddingRight: `${style.paddingRight || 20}px`
          }}
        >
          <div className="text-lg font-serif font-extrabold tracking-tighter text-text-on-paper">
            {replaceVariables(content || 'BRAND', template.variables)}
          </div>
          <div className="flex items-center gap-6">
            {(properties?.socialLinks || []).map((link: any, i: number) => (
              <a key={i} href={link.url} className="text-[10px] font-bold uppercase tracking-widest text-text-on-paper/70 hover:text-gold transition-colors no-underline">
                {link.platform}
              </a>
            ))}
          </div>
        </div>
      );

    case 'productCard':
      return (
        <div 
          className="flex flex-col rounded-2xl border border-gold/10 bg-paper transition-shadow hover:shadow-xl group relative"
          style={{ 
            paddingTop: `${style.paddingTop || 0}px`, 
            paddingBottom: `${style.paddingBottom || 0}px` 
          }}
        >
          <div className="relative aspect-[4/3]">
            <img 
              src={properties?.src || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600'} 
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
              alt="Product"
              referrerPolicy="no-referrer"
              crossOrigin="anonymous"
            />
            {properties?.badge && (
              <div className="absolute top-4 left-4 bg-gold text-ink text-[9px] font-mono font-bold px-2 py-1 rounded shadow-lg uppercase tracking-widest">
                {properties.badge}
              </div>
            )}
            
            {selectedBlockId === block.id && (
              <div className="absolute inset-0 bg-ink/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => document.getElementById(`upload-${block.id}`)?.click()}
                  className="px-3 py-1.5 bg-gold text-ink font-mono font-bold text-[9px] uppercase tracking-widest rounded shadow-xl hover:scale-105 transition-transform flex items-center gap-2 cursor-pointer"
                >
                  <Upload className="w-3 h-3" />
                  Replace
                </button>
                <input 
                  id={`upload-${block.id}`}
                  type="file" 
                  className="hidden" 
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (ev) => {
                        const dataUrl = ev.target?.result as string;
                        onUpdateBlock(block.id, { properties: { ...properties, src: dataUrl } });
                        onAddMediaAsset?.({
                          name: `Product Image ${Date.now()}`,
                          url: dataUrl,
                          category: 'products',
                          altText: 'Custom product image'
                        });
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                />
              </div>
            )}
          </div>
          <div className="p-6">
            <h3 className="text-lg font-serif font-bold text-text-on-paper mb-2 leading-tight">
              {replaceVariables(content || 'Premium Item', template.variables)}
            </h3>
            <div className="flex items-center justify-between gap-4 mt-4">
              <span className="text-xl font-mono font-bold text-gold">
                {replaceVariables(properties?.price || '$0.00', template.variables)}
              </span>
              <a href={properties?.href || '#'} className="bg-seal text-white px-5 py-2 rounded-lg text-[10px] font-extrabold uppercase tracking-widest hover:bg-gold hover:text-seal transition-colors no-underline">
                Shop Now
              </a>
            </div>
          </div>
        </div>
      );

    case 'hero':
      return (
        <div 
          className="relative w-full h-[400px] flex items-center justify-center overflow-hidden group"
          style={{ 
            backgroundImage: `url(${properties?.src || 'https://images.unsplash.com/photo-1499951360447-b19be8fe80f5?w=1200'})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            paddingTop: `${style.paddingTop || 0}px`,
            paddingBottom: `${style.paddingBottom || 0}px`,
          }}
        >
          <div className="absolute inset-0 z-1" style={{ backgroundColor: properties?.overlayScrim || 'rgba(0,0,0,0.4)' }} />
          
          {selectedBlockId === block.id && (
            <div className="absolute top-4 right-4 z-20 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => document.getElementById(`upload-${block.id}`)?.click()}
                className="px-3 py-1.5 bg-gold text-ink font-mono font-bold text-[9px] uppercase tracking-widest rounded-lg shadow-xl hover:scale-105 transition-transform flex items-center gap-2 cursor-pointer"
              >
                <Upload className="w-3 h-3" />
                Change Hero Image
              </button>
              <input 
                id={`upload-${block.id}`}
                type="file" 
                className="hidden" 
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = (ev) => {
                      const dataUrl = ev.target?.result as string;
                      onUpdateBlock(block.id, { properties: { ...properties, src: dataUrl } });
                      onAddMediaAsset?.({
                        name: `Hero Image ${Date.now()}`,
                        url: dataUrl,
                        category: 'banners',
                        altText: 'Custom hero image'
                      });
                    };
                    reader.readAsDataURL(file);
                  }
                }}
              />
            </div>
          )}

          <div className={`relative z-10 text-white max-w-md p-8 ${properties?.overlayPosition === 'bottom-left' ? 'w-full h-full flex flex-col justify-end text-left' : 'text-center'}`}>
            {properties?.badge && (
              <span className="inline-block px-3 py-1 bg-gold text-ink rounded text-[9px] font-extrabold uppercase tracking-[0.2em] mb-4 shadow-lg">
                {properties.badge}
              </span>
            )}
            <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4 leading-tight drop-shadow-xl italic">
              {replaceVariables(content || 'Hero Title', template.variables)}
            </h2>
            {properties?.price && (
              <p className="text-sm md:text-base text-white/90 mb-6 font-mono font-medium tracking-wide">
                {replaceVariables(properties.price, template.variables)}
              </p>
            )}
            {properties?.href && (
              <span className="inline-block bg-white text-seal px-8 py-3 rounded-full text-[11px] font-extrabold uppercase tracking-widest shadow-2xl hover:scale-105 transition-transform">
                Explore Collection
              </span>
            )}
          </div>
        </div>
      );

    case 'quote':
      return (
        <div 
          className="relative py-12 px-8 bg-paper-2/20 border-l-4 border-gold italic"
          style={{ 
            paddingTop: `${style.paddingTop || 30}px`, 
            paddingBottom: `${style.paddingBottom || 30}px`,
            color: style.color || 'inherit'
          }}
        >
          <div className="absolute top-4 left-6 text-gold/20 text-6xl font-serif select-none pointer-events-none">&ldquo;</div>
          <p className="text-lg md:text-xl font-serif relative z-10 leading-relaxed">
            {replaceVariables(content || 'Quote content here...', template.variables)}
          </p>
          {properties?.author && (
            <p className="mt-4 text-[10px] font-mono font-bold uppercase tracking-[0.3em] text-gold/60 not-italic">
              &mdash; {properties.author}
            </p>
          )}
        </div>
      );

    case 'footer':
      return (
        <div 
          className="w-full text-center"
          style={{ 
            color: style.color || '#94a3b8', 
            fontSize: style.fontSize || '11px', 
            lineHeight: style.lineHeight || '1.6',
            paddingTop: `${style.paddingTop || 40}px`,
            paddingBottom: `${style.paddingBottom || 40}px`,
            paddingLeft: `${style.paddingLeft || 20}px`,
            paddingRight: `${style.paddingRight || 20}px`
          }}
        >
          <div dangerouslySetInnerHTML={{ __html: replaceVariables(content || '', template.variables) }} />
          <div className="mt-6 flex justify-center gap-4 opacity-40">
             <span className="w-1.5 h-1.5 rounded-full bg-gold"></span>
             <span className="w-1.5 h-1.5 rounded-full bg-gold"></span>
             <span className="w-1.5 h-1.5 rounded-full bg-gold"></span>
          </div>
        </div>
      );

    case 'shape':
      return (
        <div 
          className="flex flex-col items-center justify-center overflow-hidden transition-all shadow-lg group/shape relative"
          onDragOver={(e) => {
            e.preventDefault();
            e.stopPropagation();
            e.currentTarget.classList.add('ring-4', 'ring-gold/30', 'scale-[1.02]');
          }}
          onDragLeave={(e) => {
            e.currentTarget.classList.remove('ring-4', 'ring-gold/30', 'scale-[1.02]');
          }}
          onDrop={(e) => {
            e.preventDefault();
            e.stopPropagation();
            e.currentTarget.classList.remove('ring-4', 'ring-gold/30', 'scale-[1.02]');
            
            const incomingBlockType = e.dataTransfer.getData('text/plain') as any;
            const incomingBlockId = e.dataTransfer.getData('text/block-id');
            
            let droppedBlock: EmailBlock | null = null;
            
            if (incomingBlockId) {
              const found = allBlocks.find(b => b.id === incomingBlockId);
              if (found) {
                droppedBlock = { ...found };
                onUpdateBlocks(allBlocks.filter(b => b.id !== incomingBlockId));
              }
            } else if (incomingBlockType) {
              droppedBlock = createDefaultBlock(incomingBlockType);
            }
            
            if (droppedBlock) {
              const newBlocks = [...(properties?.blocks || []), droppedBlock];
              onUpdateBlock(block.id, {
                properties: {
                  ...properties,
                  blocks: newBlocks
                }
              });
              onSelectBlock(droppedBlock.id);
            }
          }}
          style={{
            width: properties?.width || '100px',
            height: properties?.height || '100px',
            backgroundColor: style.backgroundColor || '#d4af37',
            borderRadius: properties?.shape === 'circle' ? '50%' : `${style.borderRadius || 0}px`,
            border: `${style.borderWidth || 0}px ${style.borderStyle || 'solid'} ${style.borderColor || 'transparent'}`,
            opacity: style.opacity !== undefined ? style.opacity : 1,
            clipPath: properties?.shape === 'triangle' 
              ? 'polygon(50% 0%, 0% 100%, 100% 100%)' 
              : properties?.shape === 'diamond' 
                ? 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)' 
                : properties?.shape === 'pentagon'
                  ? 'polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)'
                  : properties?.shape === 'hexagon'
                    ? 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)'
                    : properties?.shape === 'star'
                      ? 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)'
                      : undefined,
            position: 'relative'
          }}
        >
          {properties?.blocks && properties.blocks.length > 0 ? (
            <div className="w-full h-full flex flex-col items-center justify-center p-2">
              {properties.blocks.map((child: EmailBlock) => (
                <RenderBlockInterior 
                  key={child.id} 
                  block={child} 
                  template={template} 
                  onSelectBlock={onSelectBlock}
                  onUpdateBlock={onUpdateBlock}
                  onUpdateBlocks={onUpdateBlocks}
                  allBlocks={allBlocks}
                  selectedBlockId={selectedBlockId}
                  onAddMediaAsset={onAddMediaAsset}
                />
              ))}
            </div>
          ) : (
             content && <div className="text-center p-2 break-words text-[10px] font-bold uppercase tracking-tighter" style={{ color: style.color || '#000000' }}>{content}</div>
          )}
        </div>
      );

    case 'section':
      const columns = (properties?.columns || [[]]) as EmailBlock[][];
      return (
        <div 
          className={`flex flex-col ${properties?.stackOnMobile !== false ? 'md:flex-row' : 'flex-row'} items-stretch`} 
          style={{ gap: `${properties?.columnGap || 10}px` }}
        >
          {columns.map((colBlocks: EmailBlock[], colIdx: number) => {
            const widths = properties?.columnWidths || [];
            const colWidth = widths[colIdx] !== undefined ? `${widths[colIdx]}%` : '100%';
            return (
              <div 
                key={colIdx} 
                className="flex-1 flex flex-col min-h-[120px] p-4 border-2 border-dashed border-gold/10 bg-gold/[0.01] rounded-2xl hover:border-gold/30 hover:bg-gold/[0.03] transition-all relative group/column overflow-hidden flex-shrink-0"
                style={{ width: colWidth, flexGrow: widths[colIdx] ? undefined : 1 }}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  e.currentTarget.classList.add('bg-gold/10', 'border-gold/60', 'scale-[1.01]');
                }}
                onDragLeave={(e) => {
                  e.currentTarget.classList.remove('bg-gold/10', 'border-gold/60', 'scale-[1.01]');
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  e.currentTarget.classList.remove('bg-gold/10', 'border-gold/60', 'scale-[1.01]');
                  
                  const incomingBlockType = e.dataTransfer.getData('text/plain') as BlockType | '';
                  const incomingBlockId = e.dataTransfer.getData('text/block-id');
                  
                  let droppedBlock: EmailBlock | null = null;
                  
                  if (incomingBlockId) {
                    const found = allBlocks.find(b => b.id === incomingBlockId);
                    if (found) {
                      droppedBlock = { ...found };
                      onUpdateBlocks(allBlocks.filter(b => b.id !== incomingBlockId));
                    }
                  } else if (incomingBlockType) {
                    droppedBlock = createDefaultBlock(incomingBlockType);
                  }
                  
                  if (droppedBlock) {
                    const newColumns = [...(properties?.columns || [])];
                    newColumns[colIdx] = [...(newColumns[colIdx] || []), droppedBlock];
                    onUpdateBlock(block.id, {
                      properties: {
                        ...properties,
                        columns: newColumns
                      }
                    });
                    onSelectBlock(droppedBlock.id);
                  }
                }}
              >
                {colBlocks.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center p-4 text-[9px] text-gold/40 uppercase tracking-[0.2em] font-mono border border-dashed border-gold/10 rounded-lg">
                    <div className="mb-2 p-2 rounded-full bg-gold/5 border border-gold/10">
                      <Copy className="w-4 h-4" />
                    </div>
                    <span>Drop Block</span>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {colBlocks.map((childBlock) => (
                      <div 
                        key={childBlock.id} 
                        className={`group/child relative transition-all duration-300 ${selectedBlockId === childBlock.id ? 'ring-2 ring-gold rounded-lg shadow-xl shadow-gold/10 scale-[1.02] z-10' : 'hover:ring-1 hover:ring-gold/30 rounded-lg'}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectBlock(childBlock.id);
                        }}
                      >
                        <div className="absolute -top-3 -right-3 opacity-0 group-hover/child:opacity-100 transition-opacity flex gap-1 z-30">
                          <button 
                            className="p-1.5 bg-ink text-gold border border-gold/30 hover:bg-gold hover:text-ink rounded-lg shadow-lg cursor-pointer"
                            title="Delete Block"
                            onClick={(e) => {
                              e.stopPropagation();
                              const newColumns = [...(properties?.columns || [])];
                              newColumns[colIdx] = newColumns[colIdx].filter(b => b.id !== childBlock.id);
                              onUpdateBlock(block.id, { properties: { ...properties, columns: newColumns } });
                              onSelectBlock(null);
                            }}
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                        
                        <div className="pointer-events-none">
                          <RenderBlockInterior 
                            block={childBlock} 
                            template={template} 
                            onSelectBlock={onSelectBlock}
                            onUpdateBlock={onUpdateBlock}
                            onUpdateBlocks={onUpdateBlocks}
                            allBlocks={allBlocks}
                            selectedBlockId={selectedBlockId}
                            onAddMediaAsset={onAddMediaAsset}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      );

    case 'icon':
      return (
        <div 
          className="flex justify-center w-full relative group"
          style={{ 
            color: style.color || '#d4af37', 
            fontSize: style.fontSize || '32px',
            paddingTop: `${style.paddingTop || 10}px`,
            paddingBottom: `${style.paddingBottom || 10}px`,
          }}
        >
          {properties?.src ? (
            <img src={properties.src} style={{ width: style.fontSize || '32px', height: 'auto' }} alt="Icon" crossOrigin="anonymous" />
          ) : (
            <div 
              style={{ width: style.fontSize || '32px', height: style.fontSize || '32px' }}
              dangerouslySetInnerHTML={{ __html: properties?.svg || '' }} 
            />
          )}

          {selectedBlockId === block.id && (
            <div className="absolute inset-0 bg-ink/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded">
              <button
                onClick={() => document.getElementById(`upload-${block.id}`)?.click()}
                className="p-1.5 bg-gold text-ink rounded-full shadow-lg hover:scale-110 transition-transform cursor-pointer"
                title="Upload Custom Icon"
              >
                <Upload className="w-3.5 h-3.5" />
              </button>
              <input 
                id={`upload-${block.id}`}
                type="file" 
                className="hidden" 
                accept="image/*,.svg"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = (ev) => {
                      const dataUrl = ev.target?.result as string;
                      onUpdateBlock(block.id, { properties: { ...properties, src: dataUrl, svg: undefined } });
                      onAddMediaAsset?.({
                        name: `Custom Icon ${Date.now()}`,
                        url: dataUrl,
                        category: 'logos',
                        altText: 'Custom uploaded icon'
                      });
                    };
                    reader.readAsDataURL(file);
                  }
                }}
              />
            </div>
          )}
        </div>
      );

    case 'sticker':
      return (
        <div 
          className="flex justify-center w-full relative group"
          style={{ 
            paddingTop: `${style.paddingTop || 10}px`,
            paddingBottom: `${style.paddingBottom || 10}px`,
          }}
        >
          <img 
            src={properties?.src} 
            style={{ width: properties?.width || '100px', height: 'auto' }} 
            alt="Sticker" 
            crossOrigin="anonymous"
          />
          {selectedBlockId === block.id && (
            <div className="absolute inset-0 bg-ink/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded">
              <button
                onClick={() => document.getElementById(`upload-${block.id}`)?.click()}
                className="p-2 bg-gold text-ink rounded-full shadow-xl hover:scale-110 transition-transform cursor-pointer"
                title="Upload Custom Sticker"
              >
                <Upload className="w-4 h-4" />
              </button>
              <input 
                id={`upload-${block.id}`}
                type="file" 
                className="hidden" 
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = (ev) => {
                      const dataUrl = ev.target?.result as string;
                      onUpdateBlock(block.id, { properties: { ...properties, src: dataUrl } });
                      onAddMediaAsset?.({
                        name: `Sticker ${Date.now()}`,
                        url: dataUrl,
                        category: 'general',
                        altText: 'Custom sticker'
                      });
                    };
                    reader.readAsDataURL(file);
                  }
                }}
              />
            </div>
          )}
        </div>
      );

    case 'productLoop':
      return (
        <div className="border border-ink-2 rounded-2xl p-6 bg-ink-2/5 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-gold/30"></div>
          <div className="flex justify-between items-end mb-6 pb-2 border-b border-ink-2/30">
            <div>
              <h3 className="text-gold font-mono font-bold text-[10px] uppercase tracking-[0.2em] mb-1">
                {content || 'Product Feed'}
              </h3>
              <div className="text-[9px] text-text-on-ink-muted/50 font-mono italic">
                Source: {properties?.dataSource || 'standard_collection'} • Max {properties?.limit || 3} items
              </div>
            </div>
            <span className="text-[9px] text-gold/40 font-mono uppercase tracking-widest border border-gold/20 px-2 py-0.5 rounded">
              Dynamic
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {(properties?.items || []).slice(0, properties?.limit || 3).map((item: any, idx: number) => (
              <div key={idx} className="flex flex-col relative group/item">
                <div className="relative aspect-square mb-3 overflow-hidden rounded-lg border border-ink-2 bg-ink">
                  <img 
                    src={item.src || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200'} 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover/item:scale-110" 
                    alt={item.name} 
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink/60 to-transparent opacity-0 group-hover/item:opacity-100 transition-opacity flex items-end p-3">
                    <span className="text-[8px] font-mono font-bold text-gold uppercase tracking-tighter">View Details</span>
                  </div>
                </div>
                <h4 className="font-sans font-bold text-xs text-text-on-ink line-clamp-2 mb-1 leading-tight">
                  {item.name}
                </h4>
                <div className="flex items-center gap-2">
                  <span className="text-gold font-mono font-bold text-sm">
                    {item.price}
                  </span>
                  <span className="h-px flex-1 bg-gold/10"></span>
                </div>
              </div>
            ))}
          </div>
        </div>
      );

    case 'imageGrid':
      return (
        <div 
          className={`grid gap-4`} 
          style={{ 
            gridTemplateColumns: `repeat(${properties?.columns || 2}, 1fr)`,
            paddingTop: `${style.paddingTop || 0}px`,
            paddingBottom: `${style.paddingBottom || 0}px`
          }}
        >
          {(properties?.images || []).map((img: any, idx: number) => (
            <div key={idx} className="relative aspect-video rounded-xl overflow-hidden border border-gold/10 hover:border-gold/30 transition-all">
              <img 
                src={img.src || 'https://images.unsplash.com/photo-1579202673506-ca3ce28943ef?w=400'} 
                className="w-full h-full object-cover" 
                alt="Grid" 
                referrerPolicy="no-referrer"
              />
              {img.label && (
                <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-ink/80 to-transparent">
                  <span className="text-[9px] font-bold text-white uppercase tracking-widest">{img.label}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      );

    default:
      return <div className="p-4 text-xs italic text-slate-400">Block type "{type}" interior not implemented.</div>;
  }
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
  // PRD v2 Additions
  sharedBlocks?: SharedBlock[];
  onSaveAsShared?: (block: EmailBlock, name: string, isGlobal: boolean) => void;
  onDisconnectShared?: (blockId: string) => void;
  onAddMediaAsset?: (asset: { name: string; url: string; category: 'logos' | 'banners' | 'products' | 'general'; altText: string }) => void;
}

export default function Canvas({
  template,
  selectedBlockId,
  onSelectBlock,
  onUpdateBlocks,
  onUpdateBlock,
  onDeleteBlock,
  onCloneBlock,
  showGrid = false,
  sharedBlocks = [],
  onSaveAsShared,
  onDisconnectShared,
  onAddMediaAsset
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

  const { globalSettings, blocks: originalBlocks } = template;

  const activeTheme = THEME_PRESETS.find(t => t.id === template.themeId) || THEME_PRESETS[0];

  const blocks = originalBlocks.map(block => {
    let resolvedBlock = { ...block };
    if (block.symbolId) {
      const shared = sharedBlocks.find(sb => sb.id === block.symbolId);
      if (shared) {
        resolvedBlock = {
          ...block,
          content: shared.block.content,
          properties: { ...shared.block.properties },
          style: { ...shared.block.style }
        };
      }
    }
    
    // Fallback un-overridden styles to the active theme!
    const mergedStyle: BlockStyle = {
      ...resolvedBlock.style,
      color: resolvedBlock.style.color || activeTheme.colors.text,
      fontFamily: resolvedBlock.style.fontFamily || activeTheme.typography.bodyFont,
    };
    
    // If it's a button and has no custom background, default to activeTheme's primary!
    if (resolvedBlock.type === 'button' && !resolvedBlock.style.backgroundColor) {
      mergedStyle.backgroundColor = activeTheme.colors.primary;
    }
    
    return {
      ...resolvedBlock,
      style: mergedStyle
    };
  });

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
      
      const block = blocks.find(b => b.id === resizingBlockId);
      if (!block) return;

      if (globalSettings.layoutMode === 'figma') {
        const newWidth = Math.max(60, resizeStartCoords.blockWidth + dx);
        const newHeight = Math.max(20, resizeStartCoords.blockHeight + dy);
        
        onUpdateBlock(resizingBlockId, {
          style: {
            ...block.style,
            width: `${newWidth}px`,
            height: `${newHeight}px`
          }
        });
      } else {
        // Flow layout resizing
        if (block.type === 'spacer') {
          const newHeight = Math.max(5, resizeStartCoords.blockHeight + dy);
          onUpdateBlock(resizingBlockId, {
            properties: {
              ...block.properties,
              height: newHeight
            }
          });
        } else if (block.type === 'image' || block.type === 'sticker') {
          // Width resizing for images and stickers in flow
          const newWidth = Math.max(20, Math.min(100, resizeStartCoords.blockWidth + (dx / 5))); // Scale dx for percentage
          onUpdateBlock(resizingBlockId, {
            properties: {
              ...block.properties,
              width: `${newWidth}%`
            }
          });
        } else if (block.type === 'icon') {
          const newSize = Math.max(12, resizeStartCoords.blockWidth + dx);
          onUpdateBlock(resizingBlockId, {
            style: {
              ...block.style,
              fontSize: `${newSize}px`
            }
          });
        } else if (block.type === 'shape') {
          const newWidth = Math.max(20, resizeStartCoords.blockWidth + dx);
          const newHeight = Math.max(20, resizeStartCoords.blockHeight + dy);
          onUpdateBlock(resizingBlockId, {
            properties: {
              ...block.properties,
              width: `${newWidth}px`,
              height: newHeight
            }
          });
        }
      }
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
    
    let currentWidth = 0;
    let currentHeight = 0;

    if (globalSettings.layoutMode === 'figma') {
      currentWidth = el ? el.offsetWidth : parseInt(block.style.width || '250') || 250;
      currentHeight = el ? el.offsetHeight : parseInt(block.style.height || '120') || 120;
    } else {
      // For flow layout blocks
      if (block.type === 'spacer') {
        currentHeight = block.properties?.height || 30;
      } else if (block.type === 'image' || block.type === 'sticker') {
        // Convert current width property (usually percentage) to a number for relative dragging
        currentWidth = parseInt(block.properties?.width || '100') || 100;
      } else if (block.type === 'icon') {
        currentWidth = parseInt(block.style.fontSize || '24') || 24;
      } else if (block.type === 'shape') {
        currentWidth = parseInt(String(block.properties?.width || '100')) || 100;
        currentHeight = parseInt(String(block.properties?.height || '100')) || 100;
      }
    }
    
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
    if (targetIndex < 0 || targetIndex >= originalBlocks.length) return;

    const newBlocks = [...originalBlocks];
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
      const sourceIndex = originalBlocks.findIndex((b) => b.id === incomingBlockId);
      if (sourceIndex === -1 || sourceIndex === index) return;

      const updatedBlocks = [...originalBlocks];
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
      const updatedBlocks = [...originalBlocks];
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
      const sourceIndex = originalBlocks.findIndex((b) => b.id === incomingBlockId);
      if (sourceIndex === -1 || sourceIndex === originalBlocks.length - 1) return;
      
      const updatedBlocks = [...originalBlocks];
      const [movedBlock] = updatedBlocks.splice(sourceIndex, 1);
      updatedBlocks.push(movedBlock);
      onUpdateBlocks(updatedBlocks);
      setDraggedBlockId(null);
      return;
    }

    if (incomingBlockType) {
      const newBlock = createDefaultBlock(incomingBlockType);
      onUpdateBlocks([...originalBlocks, newBlock]);
      onSelectBlock(newBlock.id);
    }
  };

  // Create block with default configurations matching styling guide

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
    <div className="flex-1 flex flex-col bg-ink text-text-on-ink h-full overflow-hidden rounded-xl border border-ink-2/50 shadow-xl select-none">
      {/* Canvas Header / Controls */}
      <div className="h-14 border-b border-ink-2/40 bg-ink flex justify-between items-center px-6 shrink-0 z-10">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-bold text-text-on-ink-muted uppercase tracking-wider">Viewport:</span>
          <div className="flex bg-ink-2 rounded-lg p-0.5 border border-ink-2/50">
            <button
              id="btn-viewport-desktop"
              onClick={() => setViewportMode('desktop')}
              className={`p-1.5 rounded transition-all cursor-pointer ${
                viewportMode === 'desktop'
                  ? 'bg-ink text-gold border border-gold/20 shadow-sm'
                  : 'text-text-on-ink-muted hover:text-text-on-ink'
              }`}
              title="Desktop View (e.g. 600px)"
            >
              <Monitor className="h-4 w-4" />
            </button>
            <button
              id="btn-viewport-tablet"
              onClick={() => setViewportMode('tablet')}
              className={`p-1.5 rounded transition-all cursor-pointer ${
                viewportMode === 'tablet'
                  ? 'bg-ink text-gold border border-gold/20 shadow-sm'
                  : 'text-text-on-ink-muted hover:text-text-on-ink'
              }`}
              title="Tablet View (480px)"
            >
              <Tablet className="h-4 w-4" />
            </button>
            <button
              id="btn-viewport-mobile"
              onClick={() => setViewportMode('mobile')}
              className={`p-1.5 rounded transition-all cursor-pointer ${
                viewportMode === 'mobile'
                  ? 'bg-ink text-gold border border-gold/20 shadow-sm'
                  : 'text-text-on-ink-muted hover:text-text-on-ink'
              }`}
              title="Mobile View (375px)"
            >
              <Smartphone className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Info label */}
        <div className="hidden md:flex items-center gap-2 text-xs font-semibold text-text-on-ink-muted bg-ink-2/50 px-3 py-1 rounded-full border border-ink-2/40">
          <Sparkles className="h-3.5 w-3.5 text-gold" />
          <span>Click on elements to edit styles and contents.</span>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-xs font-bold text-text-on-ink-muted bg-ink-2 px-2.5 py-1 rounded-lg border border-ink-2/50 font-mono uppercase tracking-wider">
            {blocks.length} sections
          </div>

          {blocks.length > 0 && (
            <div className="relative">
              {showClearConfirm ? (
                <div className="flex items-center gap-1.5 bg-red-950/40 border border-red-900/40 p-1 rounded-lg">
                  <span className="text-[10px] font-bold text-red-400 px-1.5">Clear template?</span>
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
                    className="px-2 py-0.5 text-[10px] font-bold bg-ink-2 hover:bg-ink-2/80 text-text-on-ink rounded cursor-pointer transition-colors"
                  >
                    No
                  </button>
                </div>
              ) : (
                <button
                  id="btn-clear-canvas"
                  onClick={() => setShowClearConfirm(true)}
                  className="flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-red-400 hover:text-red-300 hover:bg-red-950/20 rounded-lg border border-red-900/40 transition-all cursor-pointer font-mono uppercase tracking-wider"
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
              if (block.visible === false) return null;
              
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
                      ? `absolute rounded-lg border ${!block.locked ? 'cursor-move' : ''} ${
                          isSelected 
                            ? 'border-gold bg-gold/5 ring-1 ring-gold/25' 
                            : 'border-dashed border-ink-2 hover:border-gold/50 bg-paper/5'
                        }`
                      : `relative border-y ${
                          isSelected 
                            ? 'border-gold/50 outline outline-1 outline-gold bg-gold/[0.03]' 
                            : 'border-transparent hover:outline hover:outline-1 hover:outline-gold/30 hover:bg-gold/[0.01]'
                        } ${dragOverIndex === index ? 'border-t-2 border-t-gold' : ''}`
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
                  <div className={`absolute top-1.5 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-20 flex gap-1.5 items-center ${isFigmaAbsolute ? 'left-2' : 'left-8'}`}>
                    <span className={`text-[9px] font-bold tracking-wider font-mono px-1.5 py-0.5 rounded shadow-xs uppercase ${block.locked ? 'bg-amber-600 text-white' : 'bg-blue-600 text-white'}`}>
                      {block.type} {block.locked ? '(LOCKED)' : ''}
                    </span>
                    {block.symbolId && (
                      <span className="text-[9px] font-bold tracking-wider font-mono px-1.5 py-0.5 rounded shadow-xs uppercase bg-emerald-600 text-white flex items-center gap-1">
                        <RefreshCw className="h-2.5 w-2.5 animate-spin" style={{ animationDuration: '8s' }} />
                        <span>Synced Block</span>
                      </span>
                    )}
                    {block.visibilityCondition && (
                      <span className="text-[9px] font-bold tracking-wider font-mono px-1.5 py-0.5 rounded shadow-xs uppercase bg-purple-600 text-white flex items-center gap-1">
                        <Eye className="h-2.5 w-2.5" />
                        <span>IF {block.visibilityCondition.field} {block.visibilityCondition.operator === 'exists' ? 'exists' : block.visibilityCondition.operator === 'equals' ? '==' : '!='} {block.visibilityCondition.value || ''}</span>
                      </span>
                    )}
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
                    <div 
                      className="absolute right-3 flex items-center bg-ink text-text-on-ink-muted rounded-lg shadow-lg z-30 overflow-hidden border border-ink-2/80 select-none"
                      style={{
                        top: index === 0 ? '8px' : '-16px'
                      }}
                    >
                      {!isFigmaAbsolute && !block.locked && (
                        <>
                          <button
                            id={`btn-move-up-${block.id}`}
                            onClick={(e) => { e.stopPropagation(); handleMoveBlock(index, 'up'); }}
                            disabled={index === 0}
                            className="p-1 text-text-on-ink-muted hover:text-gold hover:bg-ink-2 disabled:opacity-35 transition-colors cursor-pointer"
                            title="Move Up"
                          >
                            <ArrowUp className="h-3.5 w-3.5" />
                          </button>
                          <button
                            id={`btn-move-down-${block.id}`}
                            onClick={(e) => { e.stopPropagation(); handleMoveBlock(index, 'down'); }}
                            disabled={index === blocks.length - 1}
                            className="p-1 text-text-on-ink-muted hover:text-gold hover:bg-ink-2 disabled:opacity-35 transition-colors cursor-pointer"
                            title="Move Down"
                          >
                            <ArrowDown className="h-3.5 w-3.5" />
                          </button>
                          <div className="w-px h-3 bg-ink-2/60" />
                        </>
                      )}
                      
                      {(block.type === 'text' || block.type === 'header' || block.type === 'button' || block.type === 'footer') && (
                        <button
                          id={`btn-inline-edit-${block.id}`}
                          onClick={(e) => startEditing(e, block)}
                          className="p-1 text-text-on-ink-muted hover:text-gold hover:bg-ink-2 transition-colors flex items-center gap-1 px-1.5 cursor-pointer"
                          title="Edit Text Inline"
                        >
                          <Edit2 className="h-3 w-3" />
                          <span className="text-[10px] font-bold">Edit</span>
                        </button>
                      )}

                      <button
                        id={`btn-clone-${block.id}`}
                        onClick={(e) => { e.stopPropagation(); onCloneBlock(block.id); }}
                        className="p-1 text-text-on-ink-muted hover:text-gold hover:bg-ink-2 transition-colors cursor-pointer"
                        title="Clone Block"
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </button>

                      {/* Synced Block Unlink or Save Block as Pattern / Global Synced Block */}
                      {block.symbolId && onDisconnectShared ? (
                        <button
                          id={`btn-unlink-shared-${block.id}`}
                          onClick={(e) => { e.stopPropagation(); onDisconnectShared(block.id); }}
                          className="p-1 text-gold hover:bg-ink-2 transition-colors cursor-pointer"
                          title="Disconnect from Global Pattern (Convert to Local Block)"
                        >
                          <Link className="h-3.5 w-3.5" />
                        </button>
                      ) : (
                        !block.symbolId && onSaveAsShared && (
                          <>
                            <button
                              id={`btn-save-pattern-${block.id}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                const name = prompt("Enter a name for this layout pattern:", `My Saved ${block.type} Pattern`);
                                if (name) onSaveAsShared(block, name, false);
                              }}
                              className="p-1 text-text-on-ink-muted hover:text-gold hover:bg-ink-2 transition-colors cursor-pointer"
                              title="Save as Custom Reusable Pattern (Unsynced template foundation)"
                            >
                              <Bookmark className="h-3.5 w-3.5" />
                            </button>
                            <button
                              id={`btn-save-synced-${block.id}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                const name = prompt("Enter a name for this synced global block:", `Global Brand ${block.type}`);
                                if (name) onSaveAsShared(block, name, true);
                              }}
                              className="p-1 text-gold/80 hover:text-gold hover:bg-ink-2 transition-colors cursor-pointer"
                              title="Save as Synced Global Block (Editing updates everywhere instantly)"
                            >
                              <RefreshCw className="h-3.5 w-3.5" />
                            </button>
                          </>
                        )
                      )}

                      {(block.type === 'text' || block.type === 'header' || block.type === 'quote') && !block.locked && (
                        <button
                          onClick={(e) => { e.stopPropagation(); onSelectBlock(block.id); document.getElementById('textarea-inspector-content')?.focus(); }}
                          className="p-1 text-violet-400 hover:text-violet-300 hover:bg-violet-900/30 transition-colors cursor-pointer"
                          title="Magic Copy (AI Rewrite)"
                        >
                          <Sparkles className="h-3.5 w-3.5" />
                        </button>
                      )}
                      <button
                        id={`btn-toggle-lock-${block.id}`}
                        onClick={(e) => { e.stopPropagation(); onUpdateBlock(block.id, { locked: !block.locked }); }}
                        className="p-1 text-text-on-ink-muted hover:text-gold hover:bg-ink-2 transition-colors cursor-pointer"
                        title={block.locked ? "Unlock Block" : "Lock Block"}
                      >
                        {block.locked ? <Lock className="h-3.5 w-3.5 text-gold" /> : <Unlock className="h-3.5 w-3.5" />}
                      </button>

                      {!block.locked && (
                        <button
                          id={`btn-delete-${block.id}`}
                          onClick={(e) => { e.stopPropagation(); onDeleteBlock(block.id); }}
                          className="p-1 text-text-on-ink-muted hover:bg-red-900/30 hover:text-red-400 transition-colors cursor-pointer"
                          title="Delete Block"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  )}                  {/* Inner Content Rendering of Block */}
                  <div 
                    className="w-full relative"
                    style={{
                      borderRadius: block.style.borderRadius !== undefined ? `${block.style.borderRadius}px` : undefined,
                      overflow: block.style.borderRadius !== undefined ? 'hidden' : undefined,
                    }}
                  >
                    <RenderBlockInterior 
                      block={block} 
                      template={template} 
                      isEditing={editingBlockId === block.id}
                      editValue={editValue}
                      onEdit={(val) => {
                        onUpdateBlock(block.id, { content: val });
                        setEditingBlockId(null);
                      }}
                      onSelectBlock={onSelectBlock}
                      onUpdateBlock={onUpdateBlock}
                      onUpdateBlocks={onUpdateBlocks}
                      allBlocks={blocks}
                      selectedBlockId={selectedBlockId}
                      onAddMediaAsset={onAddMediaAsset}
                    />

                    {/* Standard Resize Handles for specific blocks that aren't Figma-absolute */}
                    {!block.locked && isSelected && !isFigmaAbsolute && (
                      <>
                        {(block.type === 'image' || block.type === 'sticker' || block.type === 'icon') && (
                          <div 
                            onMouseDown={(e) => handleResizeMouseDown(e, block)}
                            className="absolute top-1/2 -right-1.5 -translate-y-1/2 w-3 h-8 bg-gold rounded-full cursor-ew-resize flex items-center justify-center shadow-lg border border-white z-20 hover:scale-110 transition-transform"
                            title="Drag to adjust width"
                          >
                            <GripVertical className="h-2 w-2 text-ink" />
                          </div>
                        )}
                        {block.type === 'spacer' && (
                          <div 
                            onMouseDown={(e) => handleResizeMouseDown(e, block)}
                            className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-8 h-3 bg-gold rounded-full cursor-ns-resize flex items-center justify-center shadow-lg border border-white z-20 hover:scale-110 transition-transform rotate-90"
                            title="Drag to adjust height"
                          >
                            <GripVertical className="h-2 w-2 text-ink" />
                          </div>
                        )}
                        {block.type === 'shape' && (
                          <div 
                            onMouseDown={(e) => handleResizeMouseDown(e, block)}
                            className="absolute bottom-0 right-0 w-4 h-4 bg-gold rounded-full cursor-nwse-resize flex items-center justify-center shadow-lg border border-white z-20 hover:scale-125 transition-transform"
                            title="Drag to resize shape"
                          >
                            <Move className="h-2 w-2 text-ink" />
                          </div>
                        )}
                      </>
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
