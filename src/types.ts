export type BlockType =
  | 'header'
  | 'text'
  | 'image'
  | 'button'
  | 'divider'
  | 'spacer'
  | 'social'
  | 'footer'
  | 'section'      // NEW: multi-column container
  | 'imageGrid'    // NEW: 2x2 / 3x1 image grid, single block
  | 'productCard'  // NEW: image + title + price + CTA, repeatable
  | 'hero'         // NEW: full-bleed image with overlaid heading/subhead/CTA
  | 'quote'        // NEW: pull-quote / testimonial block
  | 'countdown'    // NEW: static countdown-style banner (client-rendered, not live timer — email clients can't run JS)
  | 'navbar'       // NEW: horizontal logo + text link row
  | 'htmlEmbed'    // NEW: raw HTML passthrough for power users
  | 'productLoop'  // NEW: repeating product loop feed
  | 'pricingTable'
  | 'formEmbed'
  | 'videoThumbnail'
  | 'ratingStars'
  | 'couponCode'
  | 'appStoreBadges'
  | 'mapStatic'
  | 'tableData'
  | 'progressBar'
  | 'statBlock'
  | 'dividerDecorative';

export interface BrandKit {
  id: string;
  name: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    neutralScale: string[];
    custom: { name: string; value: string }[];
  };
  fonts: {
    heading: string;
    body: string;
    fallbacks: string[];
  };
  logoAssets: {
    horizontal?: string;
    icon?: string;
    wordmark?: string;
  };
  buttonStyles: any[]; // Saved button presets
  spacingScale?: number[];
}

export interface Symbol {
  id: string;
  name: string;
  block: EmailBlock;
}

export interface SocialLink {
  platform: 'facebook' | 'twitter' | 'instagram' | 'linkedin' | 'youtube' | 'website' | string;
  url: string;
}

export interface BlockStyle {
  color?: string;
  backgroundColor?: string;
  fontFamily?: string; // Sourced from global theme presets
  fontSize?: string; // e.g., '14px', '24px'
  fontWeight?: string; // 'normal', 'bold', '500'
  textAlign?: 'left' | 'center' | 'right' | 'justify';
  paddingTop?: number; // in pixels
  paddingBottom?: number;
  paddingLeft?: number;
  paddingRight?: number;
  marginTop?: number;
  marginBottom?: number;
  lineHeight?: string; // e.g., '1.5'
  borderRadius?: number;
  borderColor?: string;
  borderWidth?: number;
  borderStyle?: 'solid' | 'dashed' | 'dotted';
  // Style-system additions (Section 3.4)
  backgroundImage?: string;
  backgroundPosition?: string;
  boxShadow?: string;
  letterSpacing?: string; // e.g. '1px', '0.05em'
  textTransform?: 'none' | 'uppercase' | 'capitalize';
  background?: {             // supersedes flat backgroundColor for gradients/images (4.3)
    type: 'solid' | 'gradient' | 'image';
    value: string;           // hex, gradient CSS, or image URL
  };
  colorToken?: string;       // brand-kit token reference (4.4)
  fontToken?: 'heading' | 'body';
  textShadow?: string;
  blendMode?: string;
  // Figma Absolute Position styles
  position?: 'relative' | 'absolute';
  left?: number;
  top?: number;
  width?: string;
  height?: string;
  zIndex?: number;
  constraints?: {
    horizontal?: 'left' | 'right' | 'center' | 'stretch';
    vertical?: 'top' | 'bottom' | 'center' | 'stretch';
  };
}

export interface EmailBlock {
  id: string;
  type: BlockType;
  content?: string; // text/html content
  style: BlockStyle;
  locked?: boolean;
  groupId?: string;          // for canvas grouping (4.1)
  symbolId?: string;         // instance reference (4.5)
  rotation?: number;         // canvas transform (4.1)
  visibilityCondition?: {    // Dynamic Visibility Condition (4.3)
    field: string;
    operator: 'equals' | 'not_equals' | 'exists';
    value?: string;
  };
  properties?: {
    src?: string; // for images
    alt?: string; // for images
    href?: string; // link URLs for button, image, header
    width?: string; // e.g. '100%', '300px'
    height?: number; // for spacer
    socialLinks?: SocialLink[];
    // Multi-column and container properties (Section 3.1)
    columns?: EmailBlock[][];        // Array of column stacks
    columnWidths?: number[];         // Percentage splits, e.g. [50, 50]
    columnGap?: number;              // Gap between columns
    stackOnMobile?: boolean;         // Default true
    images?: { src: string; alt: string; href?: string }[]; // For imageGrid
    gridCols?: number;               // For imageGrid (number of columns)
    gridRows?: number;               // For imageGrid (number of rows)
    gridGap?: number;                // For imageGrid (gap size between items)
    price?: string;                  // For productCard
    badge?: string;                  // For productCard
    author?: string;                 // For quote
    overlayPosition?: 'center' | 'bottom-left' | 'bottom-center'; // For hero
    overlayScrim?: string;           // For hero overlay
    countdownDate?: string;          // For countdown e.g., '2026-12-31'
    dataSource?: string;             // For productLoop
    limit?: number;                  // For productLoop
    items?: Array<{ name: string; price: string; src: string; href?: string }>; // For productLoop
  };
}

export interface GlobalSettings {
  backgroundColor: string; // Outer background (canvas body background)
  contentWidth: number; // Inside content container width (usually 600px)
  contentBg: string; // Main background for email body
  fontFamily: string; // Global font family choice
  borderRadius: number; // Frame corner rounding
  layoutMode?: 'flow' | 'figma'; // Layout Mode: 'flow' (classic stack) or 'figma' (absolute position)
  brandColors: {
    primary: string;
    secondary: string;
    accent: string;
  };
}

export interface DesignTokens {
  id: string;
  name: string;                        // e.g. "Ohme Foods — Warm Editorial"
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
    textMuted: string;
  };
  typography: {
    headingFont: string;
    bodyFont: string;
    scale: {
      h1: string;
      h2: string;
      h3: string;
      body: string;
      small: string;
    };
  };
  spacing: { unit: number };            // base spacing unit, e.g. 8px
  radii: { sm: string; md: string; lg: string };
  buttonStyle: 'solid' | 'outline' | 'ghost';
}

export interface SharedBlock {
  id: string;
  name: string;
  category: 'header' | 'footer' | 'cta' | 'product' | 'general';
  isGlobal: boolean;                   // true = synced, false = unsynced pattern
  block: EmailBlock;                   // actual block representation
  usedInTemplateIds: string[];         // templates using this shared block
}

export interface MediaAsset {
  id: string;
  name: string;
  url: string;
  category: 'logos' | 'banners' | 'products' | 'general';
  altText: string;
  createdAt: number;
}

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  subtitle: string;
  thumbnail?: string;
  globalSettings: GlobalSettings;
  blocks: EmailBlock[];
  variables?: Record<string, string>;
  updatedAt?: number;
  brandKitId?: string;
  familyId?: string;
  // New PRD v2 fields
  themeId?: string;
  themeOverrides?: Partial<DesignTokens>;
  approvalState?: 'draft' | 'in_review' | 'approved';
  approvalRole?: 'owner' | 'editor' | 'contributor';
  isFeatured?: boolean;
  isAiGenerated?: boolean;
}

export interface UndoRedoState {
  past: EmailTemplate[];
  future: EmailTemplate[];
}
