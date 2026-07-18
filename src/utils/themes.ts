import { DesignTokens } from '../types';

export const THEME_PRESETS: DesignTokens[] = [
  {
    id: 'theme-warm-editorial',
    name: 'Ohme Foods — Warm Editorial',
    colors: {
      primary: '#7c2d12', // Terracotta
      secondary: '#ea580c', // Warm orange
      accent: '#fef3c7', // Soft amber cream
      background: '#fdfbf7', // Warm vanilla background
      surface: '#fffbeb', // Light amber surface
      text: '#431407', // Dark rust-brown text
      textMuted: '#9a3412', // Rust-brown secondary text
    },
    typography: {
      headingFont: '"Playfair Display", Georgia, serif',
      bodyFont: '"Inter", sans-serif',
      scale: {
        h1: '32px',
        h2: '24px',
        h3: '20px',
        body: '15px',
        small: '12px'
      }
    },
    spacing: { unit: 8 },
    radii: { sm: '4px', md: '12px', lg: '24px' },
    buttonStyle: 'solid'
  },
  {
    id: 'theme-tech-minimal',
    name: 'Cosmic Slate — Tech Minimal',
    colors: {
      primary: '#0f172a', // Deep slate
      secondary: '#3b82f6', // Bright tech-blue
      accent: '#10b981', // Emerald green
      background: '#f8fafc', // Soft ice-gray
      surface: '#ffffff', // Clean white
      text: '#0f172a', // High-contrast dark slate text
      textMuted: '#64748b', // Medium slate-gray
    },
    typography: {
      headingFont: '"Space Grotesk", sans-serif',
      bodyFont: '"JetBrains Mono", monospace',
      scale: {
        h1: '30px',
        h2: '22px',
        h3: '18px',
        body: '14px',
        small: '11px'
      }
    },
    spacing: { unit: 8 },
    radii: { sm: '2px', md: '6px', lg: '12px' },
    buttonStyle: 'solid'
  },
  {
    id: 'theme-nordic-breeze',
    name: 'Nordic Breeze — Clean & Air',
    colors: {
      primary: '#0e7490', // Cyan-teal
      secondary: '#06b6d4', // Bright cyan
      accent: '#ecfeff', // Clean ice-blue
      background: '#f0fdfa', // Mint-white background
      surface: '#ffffff', // Clean white
      text: '#115e59', // Dark pine green
      textMuted: '#0d9488', // Nordic teal
    },
    typography: {
      headingFont: '"Outfit", sans-serif',
      bodyFont: '"Inter", sans-serif',
      scale: {
        h1: '28px',
        h2: '22px',
        h3: '18px',
        body: '14px',
        small: '12px'
      }
    },
    spacing: { unit: 8 },
    radii: { sm: '8px', md: '16px', lg: '32px' },
    buttonStyle: 'outline'
  },
  {
    id: 'theme-royal-velvet',
    name: 'Royal Velvet — Bold Luxury',
    colors: {
      primary: '#581c87', // Royal purple
      secondary: '#d946ef', // Bright magenta
      accent: '#fae8ff', // Soft violet
      background: '#faf5ff', // Pale lavender white
      surface: '#ffffff', // Clean white
      text: '#3b0764', // Deep gothic violet
      textMuted: '#701a75', // Muted violet-wine
    },
    typography: {
      headingFont: 'Georgia, "Times New Roman", serif',
      bodyFont: '"Inter", sans-serif',
      scale: {
        h1: '36px',
        h2: '26px',
        h3: '20px',
        body: '15px',
        small: '12px'
      }
    },
    spacing: { unit: 8 },
    radii: { sm: '0px', md: '8px', lg: '16px' },
    buttonStyle: 'solid'
  },
  {
    id: 'theme-brutalist-craft',
    name: 'Brutalist Craft — High Contrast',
    colors: {
      primary: '#000000', // Solid black
      secondary: '#ffffff', // Solid white
      accent: '#facc15', // Neon warning yellow
      background: '#f3f4f6', // Cement gray
      surface: '#ffffff', // Clean white
      text: '#000000', // Rich black
      textMuted: '#4b5563', // Charcoal gray
    },
    typography: {
      headingFont: '"Impact", sans-serif',
      bodyFont: '"JetBrains Mono", monospace',
      scale: {
        h1: '40px',
        h2: '28px',
        h3: '22px',
        body: '14px',
        small: '11px'
      }
    },
    spacing: { unit: 6 },
    radii: { sm: '0px', md: '0px', lg: '0px' }, // Fully square
    buttonStyle: 'outline'
  }
];
