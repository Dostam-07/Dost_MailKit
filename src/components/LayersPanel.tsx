import React, { useState } from 'react';
import { Layers, Eye, EyeOff, Lock, Unlock, GripVertical, Type, Image as ImageIcon, Square, Minus, Layout, Share2, Columns, Grid, ShoppingBag, Quote, Menu, Code, Clock, Boxes, Trash2 } from 'lucide-react';
import { EmailBlock } from '../types';

interface LayersPanelProps {
  blocks: EmailBlock[];
  selectedBlockId: string | null;
  onSelectBlock: (id: string | null) => void;
  onUpdateBlock: (id: string, updates: Partial<EmailBlock>) => void;
  onReorder: (startIndex: number, endIndex: number) => void;
  onDeleteBlock: (id: string) => void;
  onClose: () => void;
}

const getBlockIcon = (type: string) => {
  switch (type) {
    case 'header':
    case 'text': return <Type className="w-3.5 h-3.5" />;
    case 'image': return <ImageIcon className="w-3.5 h-3.5" />;
    case 'button':
    case 'shape': return <Square className="w-3.5 h-3.5" />;
    case 'divider':
    case 'line': return <Minus className="w-3.5 h-3.5" />;
    case 'spacer': return <Layout className="w-3.5 h-3.5" />;
    case 'social': return <Share2 className="w-3.5 h-3.5" />;
    case 'section': return <Columns className="w-3.5 h-3.5" />;
    case 'imageGrid': return <Grid className="w-3.5 h-3.5" />;
    case 'productCard':
    case 'productLoop': return <ShoppingBag className="w-3.5 h-3.5" />;
    case 'quote': return <Quote className="w-3.5 h-3.5" />;
    case 'navbar': return <Menu className="w-3.5 h-3.5" />;
    case 'htmlEmbed': return <Code className="w-3.5 h-3.5" />;
    case 'countdown': return <Clock className="w-3.5 h-3.5" />;
    default: return <Boxes className="w-3.5 h-3.5" />;
  }
};

export default function LayersPanel({
  blocks,
  selectedBlockId,
  onSelectBlock,
  onUpdateBlock,
  onReorder,
  onDeleteBlock,
  onClose
}: LayersPanelProps) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== dropIndex) {
      onReorder(draggedIndex, dropIndex);
    }
    setDraggedIndex(null);
  };

  return (
    <div className="flex flex-col h-full bg-ink border-l border-ink-2/50 text-text-on-ink shadow-2xl w-64 absolute right-0 top-0 z-50 animate-in slide-in-from-right duration-300">
      <div className="flex items-center justify-between p-3 border-b border-ink-2/50">
        <h3 className="text-sm font-bold flex items-center gap-2">
          <Layers className="w-4 h-4 text-gold" />
          Layers
        </h3>
        <button onClick={onClose} className="text-text-on-ink-muted hover:text-white">
          &times;
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-2">
        {blocks.length === 0 ? (
          <div className="text-xs text-center text-text-on-ink-muted p-4">
            No layers yet
          </div>
        ) : (
          [...blocks].reverse().map((block, reverseIndex) => {
            const index = blocks.length - 1 - reverseIndex;
            const isSelected = selectedBlockId === block.id;
            const isHidden = block.visible === false;
            
            return (
              <div
                key={block.id}
                draggable
                onDragStart={(e) => handleDragStart(e, index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDrop={(e) => handleDrop(e, index)}
                onClick={() => onSelectBlock(block.id)}
                className={`flex items-center p-2 mb-1 rounded cursor-pointer transition-colors ${
                  isSelected ? 'bg-gold/10 border border-gold/30 text-gold' : 'hover:bg-ink-2 text-text-on-ink-muted'
                } ${draggedIndex === index ? 'opacity-50' : ''}`}
              >
                <div className="mr-2 cursor-grab active:cursor-grabbing opacity-50 hover:opacity-100">
                  <GripVertical className="w-3.5 h-3.5" />
                </div>
                <div className="mr-2">
                  {getBlockIcon(block.type)}
                </div>
                <div className="flex-1 text-xs truncate font-mono">
                  {block.type}
                </div>
                
                {/* Actions */}
                <div className="flex items-center gap-2 ml-2 opacity-50 hover:opacity-100">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onUpdateBlock(block.id, { visible: !isHidden });
                    }}
                    className="hover:text-white"
                  >
                    {isHidden ? <EyeOff className="w-3.5 h-3.5 text-rose-400" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onUpdateBlock(block.id, { locked: !block.locked });
                    }}
                    className="hover:text-white"
                  >
                    {block.locked ? <Lock className="w-3.5 h-3.5 text-gold" /> : <Unlock className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteBlock(block.id);
                    }}
                    className="hover:text-rose-400"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
