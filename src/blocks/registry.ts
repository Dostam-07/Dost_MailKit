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
  category: 'content' | 'layout' | 'commerce' | 'social' | 'advanced';
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
    defaultContent: 'Inspirational Brand Title',
    defaultStyle: { color: '#111827', textAlign: 'center', fontSize: '24px', fontWeight: 'bold', paddingTop: 20, paddingBottom: 20 }
  },
  {
    type: 'text',
    label: 'Text Body',
    category: 'content',
    description: 'Paragraphs, lists & formatting',
    icon: Type,
    defaultContent: '<p>Introduce key sales updates, feature releases, or editorial columns directly. This text block can be clicked and edited.</p>',
    defaultStyle: { color: '#374151', textAlign: 'left', fontSize: '15px', lineHeight: '1.6' }
  },
  {
    type: 'image',
    label: 'Image Banner',
    category: 'content',
    description: 'Photos, designs or logo banners',
    icon: ImageIcon,
    defaultProps: {
      src: 'https://images.unsplash.com/photo-1542744094-3a31f103e35f?w=600&auto=format&fit=crop&q=80',
      alt: 'Editorial banner illustration',
      width: '100%',
    },
    defaultStyle: { borderRadius: 8, paddingTop: 10, paddingBottom: 10 }
  },
  {
    type: 'button',
    label: 'Call to Action',
    category: 'content',
    description: 'Clickable button with link',
    icon: Square,
    defaultContent: 'Claim Coupon Code ⚡',
    defaultProps: { href: 'https://github.com/zalify/easy-email-editor' },
    defaultStyle: { backgroundColor: '#3b82f6', color: '#ffffff', textAlign: 'center', borderRadius: 6, fontSize: '16px', fontWeight: 'bold', paddingTop: 15, paddingBottom: 15 }
  },
  {
    type: 'divider',
    label: 'Separator',
    category: 'content',
    description: 'Horizontal separator line',
    icon: Minus,
    defaultStyle: { borderColor: '#e2e8f0', borderWidth: 1, borderStyle: 'solid', paddingTop: 15, paddingBottom: 15 }
  },
  {
    type: 'spacer',
    label: 'Spacer Block',
    category: 'content',
    description: 'Blank space for vertical margin',
    icon: Layout,
    defaultProps: { height: 30 }
  },
  {
    type: 'social',
    label: 'Social Networks',
    category: 'social',
    description: 'Interactive social sharing icons',
    icon: Share2,
    defaultProps: {
      socialLinks: [
        { platform: 'facebook', url: 'https://facebook.com' },
        { platform: 'twitter', url: 'https://twitter.com' },
        { platform: 'linkedin', url: 'https://linkedin.com' },
      ],
    },
    defaultStyle: { textAlign: 'center', paddingTop: 15, paddingBottom: 15 }
  },
  {
    type: 'footer',
    label: 'Footer Note',
    category: 'advanced',
    description: 'Copyrights & Unsubscribe options',
    icon: FileText,
    defaultContent: '© 2026 Your Company. All rights reserved.<br/>Want to receive fewer emails? You can <a href="#" style="color: inherit; text-decoration: underline;">unsubscribe</a>.',
    defaultStyle: { color: '#6b7280', textAlign: 'center', fontSize: '12px', lineHeight: '1.5', paddingTop: 20, paddingBottom: 20 }
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
      columnGap: 20,
      stackOnMobile: true
    },
    defaultStyle: { paddingTop: 15, paddingBottom: 15 }
  },
  {
    type: 'hero',
    label: 'Hero Frame',
    category: 'commerce',
    description: 'Full-bleed image with overlaid copy and CTA',
    icon: Layers,
    defaultContent: 'Sleek Hero Title',
    defaultProps: {
      src: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800',
      overlayPosition: 'center',
      overlayScrim: 'rgba(15, 23, 42, 0.45)',
      badge: 'New Arrival',
      price: '$99.00',
      href: '#'
    },
    defaultStyle: { paddingTop: 10, paddingBottom: 10 }
  },
  {
    type: 'imageGrid',
    label: 'Image Grid',
    category: 'advanced',
    description: 'Symmetric photo gallery layouts',
    icon: Grid,
    defaultProps: {
      images: [
        { src: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300', alt: 'Img 1' },
        { src: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300', alt: 'Img 2' },
        { src: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=300', alt: 'Img 3' }
      ]
    },
    defaultStyle: { paddingTop: 15, paddingBottom: 15 }
  },
  {
    type: 'productCard',
    label: 'Product Showcase',
    category: 'commerce',
    description: 'Detailed card with image, price & buy CTA',
    icon: ShoppingBag,
    defaultContent: 'Exclusive Smartwatch',
    defaultProps: {
      src: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=400',
      badge: 'Best Seller',
      price: '$199.99',
      href: '#'
    },
    defaultStyle: { paddingTop: 15, paddingBottom: 15, color: '#111827' }
  },
  {
    type: 'quote',
    label: 'Testimonial',
    category: 'content',
    description: 'Styled blockquote for customer proof',
    icon: Quote,
    defaultContent: 'This platform transformed how our design team works. The real-time collaboration and layout tools are best-in-class.',
    defaultProps: { author: 'Jane Doe, Head of Design' },
    defaultStyle: { paddingTop: 15, paddingBottom: 15, color: '#1e293b' }
  },
  {
    type: 'navbar',
    label: 'Navigation Row',
    category: 'layout',
    description: 'Brand branding logo and navigation links',
    icon: Menu,
    defaultContent: 'Dost_MailKit',
    defaultProps: {
      socialLinks: [
        { platform: 'Shop', url: '#' },
        { platform: 'Blog', url: '#' },
        { platform: 'Contact', url: '#' }
      ]
    },
    defaultStyle: { paddingTop: 15, paddingBottom: 15 }
  },
  {
    type: 'htmlEmbed',
    label: 'Custom HTML',
    category: 'advanced',
    description: 'Inject raw layout HTML securely',
    icon: Code,
    defaultContent: '<div style="background: #f1f5f9; padding: 20px; text-align: center; border-radius: 8px;"><h4 style="margin: 0 0 10px 0; color: #0f172a;">Custom HTML Embed</h4><p style="margin: 0; font-size: 13px; color: #475569;">Perfect for adding tables, interactive RSVP forms, or custom styled widgets.</p></div>',
    defaultStyle: { paddingTop: 15, paddingBottom: 15 }
  },
  {
    type: 'countdown',
    label: 'Countdown static',
    category: 'advanced',
    description: 'Promotional countdown timer static display',
    icon: Clock,
    defaultProps: { countdownDate: 'December 31, 2026' },
    defaultStyle: { paddingTop: 15, paddingBottom: 15 }
  },
  {
    type: 'productLoop',
    label: 'Product Loop Feed',
    category: 'commerce',
    description: 'Dynamic repeating product loop feed',
    icon: ShoppingBag,
    defaultContent: 'Trending Products Feed',
    defaultProps: {
      dataSource: 'recommended_products',
      limit: 3,
      items: [
        { name: 'Minimalist Tech Backpack', price: '$120.00', src: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=300' },
        { name: 'Wireless Noise Cancelling Earbuds', price: '$89.00', src: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=300' },
        { name: 'Sleek Smartwatch & Tracker', price: '$199.99', src: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=300' }
      ]
    },
    defaultStyle: { paddingTop: 15, paddingBottom: 15, color: '#0f172a' }
  }
];

CORE_BLOCKS.forEach(registerBlock);
