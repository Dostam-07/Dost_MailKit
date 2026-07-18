import React from 'react';
import { 
  Heading, 
  Type, 
  Image as ImageIcon, 
  Square, 
  Minus, 
  Layout, 
  Share2, 
  FileText, 
  Columns, 
  Layers, 
  Grid, 
  ShoppingBag, 
  Quote, 
  Menu, 
  Code, 
  Clock 
} from 'lucide-react';
import { BlockType, EmailBlock, BlockStyle } from '../types';

export interface BlockDefinition {
  type: BlockType;
  label: string;
  category: 'content' | 'layout' | 'commerce' | 'social' | 'advanced' | 'elements';
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  defaultContent?: string;
  defaultProps?: any;
  defaultStyle?: Partial<BlockStyle>;
}

export const blockRegistry = new Map<BlockType, BlockDefinition>();

export function registerBlock(def: BlockDefinition) {
  blockRegistry.set(def.type, def);
}

// Register all core block definitions
const CORE_BLOCKS: BlockDefinition[] = [
  {
    type: 'header',
    label: 'Main Heading',
    category: 'content',
    description: 'Primary headline style text',
    icon: Heading,
    defaultContent: 'Elegance Redefined',
    defaultStyle: { color: '#d4af37', textAlign: 'center', fontSize: '28px', fontWeight: 'bold', paddingTop: 30, paddingBottom: 15 }
  },
  {
    type: 'text',
    label: 'Text Body',
    category: 'content',
    description: 'Paragraphs, lists & formatting',
    icon: Type,
    defaultContent: '<p>Discover the art of minimalist design. Our new collection combines timeless aesthetics with modern functionality, crafted for those who appreciate the finer details.</p>',
    defaultStyle: { color: '#e5e7eb', textAlign: 'left', fontSize: '15px', lineHeight: '1.7' }
  },
  {
    type: 'image',
    label: 'Image Banner',
    category: 'content',
    description: 'Photos, designs or logo banners',
    icon: ImageIcon,
    defaultProps: {
      src: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80',
      alt: 'Premium abstract texture',
      width: '100%',
    },
    defaultStyle: { borderRadius: 12, paddingTop: 10, paddingBottom: 10 }
  },
  {
    type: 'button',
    label: 'Call to Action',
    category: 'content',
    description: 'Clickable button with link',
    icon: Square,
    defaultContent: 'Explore Collection',
    defaultProps: { href: '#' },
    defaultStyle: { backgroundColor: '#d4af37', color: '#1a1a1a', textAlign: 'center', borderRadius: 8, fontSize: '15px', fontWeight: 'bold', paddingTop: 16, paddingBottom: 16 }
  },
  {
    type: 'divider',
    label: 'Separator',
    category: 'content',
    description: 'Horizontal separator line',
    icon: Minus,
    defaultStyle: { borderColor: 'rgba(212, 175, 55, 0.2)', borderWidth: 1, borderStyle: 'solid', paddingTop: 20, paddingBottom: 20 }
  },
  {
    type: 'spacer',
    label: 'Spacer Block',
    category: 'content',
    description: 'Blank space for vertical margin',
    icon: Layout,
    defaultProps: { height: 40 }
  },
  {
    type: 'social',
    label: 'Social Networks',
    category: 'social',
    description: 'Interactive social sharing icons',
    icon: Share2,
    defaultProps: {
      socialLinks: [
        { platform: 'Instagram', url: '#' },
        { platform: 'Pinterest', url: '#' },
        { platform: 'Twitter', url: '#' },
      ],
    },
    defaultStyle: { textAlign: 'center', paddingTop: 20, paddingBottom: 20 }
  },
  {
    type: 'footer',
    label: 'Footer Note',
    category: 'advanced',
    description: 'Copyrights & Unsubscribe options',
    icon: FileText,
    defaultContent: '© 2026 PREMIUM STUDIO. Crafted for Excellence.<br/>123 Design District, Paris, FR.<br/>You are receiving this as a member of our exclusive circle. <a href="#" style="color: #d4af37; text-decoration: underline;">Unsubscribe</a>.',
    defaultStyle: { color: '#9ca3af', textAlign: 'center', fontSize: '11px', lineHeight: '1.6', paddingTop: 30, paddingBottom: 30 }
  },
  {
    type: 'section',
    label: 'Section (Columns)',
    category: 'layout',
    description: 'Multi-column nested grid layout',
    icon: Columns,
    defaultProps: {
      columns: [[], []],
      columnWidths: [50, 50],
      columnGap: 30,
      stackOnMobile: true
    },
    defaultStyle: { paddingTop: 20, paddingBottom: 20 }
  },
  {
    type: 'hero',
    label: 'Hero Frame',
    category: 'commerce',
    description: 'Full-bleed image with overlaid copy and CTA',
    icon: Layers,
    defaultContent: 'The New Standard of Luxury',
    defaultProps: {
      src: 'https://images.unsplash.com/photo-1499951360447-b19be8fe80f5?w=1000',
      overlayPosition: 'center',
      overlayScrim: 'rgba(26, 26, 26, 0.6)',
      badge: 'Limited Edition',
      price: 'Starting from $499',
      href: '#'
    },
    defaultStyle: { paddingTop: 0, paddingBottom: 0 }
  },
  {
    type: 'imageGrid',
    label: 'Image Grid',
    category: 'advanced',
    description: 'Symmetric photo gallery layouts',
    icon: Grid,
    defaultProps: {
      images: [
        { src: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400', alt: 'Premium Product 1' },
        { src: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400', alt: 'Premium Product 2' },
        { src: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400', alt: 'Premium Product 3' }
      ]
    },
    defaultStyle: { paddingTop: 20, paddingBottom: 20 }
  },
  {
    type: 'productCard',
    label: 'Product Showcase',
    category: 'commerce',
    description: 'Detailed card with image, price & buy CTA',
    icon: ShoppingBag,
    defaultContent: 'Minimalist Timepiece',
    defaultProps: {
      src: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400',
      badge: 'Bespoke',
      price: '$249.00',
      href: '#'
    },
    defaultStyle: { paddingTop: 20, paddingBottom: 20, color: '#d4af37' }
  },
  {
    type: 'quote',
    label: 'Testimonial',
    category: 'content',
    description: 'Styled blockquote for customer proof',
    icon: Quote,
    defaultContent: 'Design is not just what it looks like and feels like. Design is how it works.',
    defaultProps: { author: 'Steve Jobs' },
    defaultStyle: { paddingTop: 25, paddingBottom: 25, color: '#e5e7eb' }
  },
  {
    type: 'navbar',
    label: 'Navigation Row',
    category: 'layout',
    description: 'Brand branding logo and navigation links',
    icon: Menu,
    defaultContent: 'PREMIUM STUDIO',
    defaultProps: {
      socialLinks: [
        { platform: 'SHOP', url: '#' },
        { platform: 'STORY', url: '#' },
        { platform: 'CONTACT', url: '#' }
      ]
    },
    defaultStyle: { paddingTop: 20, paddingBottom: 20 }
  },
  {
    type: 'htmlEmbed',
    label: 'Custom HTML',
    category: 'advanced',
    description: 'Inject raw layout HTML securely',
    icon: Code,
    defaultContent: '<div style="background: #1a1a1a; padding: 30px; text-align: center; border: 1px solid #d4af37; border-radius: 12px;"><h4 style="margin: 0 0 10px 0; color: #d4af37; font-family: serif;">PREMIUM EMBED</h4><p style="margin: 0; font-size: 13px; color: #9ca3af; line-height: 1.5;">Custom HTML integration for advanced users.</p></div>',
    defaultStyle: { paddingTop: 20, paddingBottom: 20 }
  },
  {
    type: 'countdown',
    label: 'Countdown static',
    category: 'advanced',
    description: 'Promotional countdown timer static display',
    icon: Clock,
    defaultProps: { countdownDate: 'December 31, 2026' },
    defaultStyle: { paddingTop: 20, paddingBottom: 20 }
  },
  {
    type: 'productLoop',
    label: 'Product Loop Feed',
    category: 'commerce',
    description: 'Dynamic repeating product loop feed',
    icon: ShoppingBag,
    defaultContent: 'Curated Essentials',
    defaultProps: {
      dataSource: 'recommended_products',
      limit: 3,
      items: [
        { name: 'Artifact Case', price: '$120.00', src: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400' },
        { name: 'Sound Module', price: '$89.00', src: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400' },
        { name: 'Chrono Series', price: '$199.99', src: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=400' }
      ]
    },
    defaultStyle: { paddingTop: 25, paddingBottom: 25, color: '#d4af37' }
  },
  {
    type: 'shape',
    label: 'Shape',
    category: 'elements',
    description: 'Basic shapes (rectangles, circles, diamonds)',
    icon: Square,
    defaultProps: {
      shape: 'rectangle',
      width: '100px',
      height: '100px',
    },
    defaultStyle: { backgroundColor: '#d4af37', borderRadius: 0, paddingTop: 10, paddingBottom: 10 }
  },
  {
    type: 'icon',
    label: 'Icon',
    category: 'elements',
    description: 'SVG vector icons or custom images',
    icon: ImageIcon,
    defaultProps: {
      svg: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>',
    },
    defaultStyle: { color: '#d4af37', fontSize: '32px', paddingTop: 10, paddingBottom: 10 }
  },
  {
    type: 'sticker',
    label: 'Sticker',
    category: 'elements',
    description: 'Visual badges and graphic labels',
    icon: Layers,
    defaultProps: {
      src: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200&q=80',
      width: '100px',
    },
    defaultStyle: { paddingTop: 10, paddingBottom: 10 }
  },
  {
    type: 'line',
    label: 'Line/Connector',
    category: 'elements',
    description: 'Horizontal divider lines',
    icon: Minus,
    defaultStyle: { borderColor: '#d4af37', borderWidth: 1, borderStyle: 'solid', width: '100%', paddingTop: 15, paddingBottom: 15 }
  }
];

CORE_BLOCKS.forEach(registerBlock);
