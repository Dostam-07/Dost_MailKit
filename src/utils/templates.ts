import { EmailTemplate } from '../types';

export const STARTER_TEMPLATES: EmailTemplate[] = [
  {
    id: 'welcome-email',
    name: '✨ Welcome & Onboarding',
    subject: 'Welcome to your brand new adventure! 🚀',
    subtitle: 'Everything you need to get started inside this welcome guide.',
    thumbnail: '/src/assets/images/welcome_template_thumb_1784298259239.jpg',
    globalSettings: {
      backgroundColor: '#f3f4f6',
      contentWidth: 600,
      contentBg: '#ffffff',
      fontFamily: '"Inter", sans-serif',
      borderRadius: 12,
      brandColors: {
        primary: '#3b82f6',
        secondary: '#6366f1',
        accent: '#f43f5e',
      },
    },
    blocks: [
      {
        id: 'header-1',
        type: 'header',
        content: '✨ STARTER KIT',
        style: {
          color: '#3b82f6',
          textAlign: 'center',
          fontSize: '14px',
          fontWeight: '700',
          paddingTop: 30,
          paddingBottom: 5,
          paddingLeft: 20,
          paddingRight: 20,
        },
      },
      {
        id: 'header-2',
        type: 'header',
        content: 'We are absolutely thrilled to have you!',
        style: {
          color: '#111827',
          textAlign: 'center',
          fontSize: '28px',
          fontWeight: '800',
          paddingTop: 5,
          paddingBottom: 20,
          paddingLeft: 20,
          paddingRight: 20,
        },
      },
      {
        id: 'image-1',
        type: 'image',
        properties: {
          src: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=600&auto=format&fit=crop&q=80',
          alt: 'Welcome Banner',
          width: '100%',
          href: 'https://github.com/zalify/easy-email-editor',
        },
        style: {
          borderRadius: 8,
          paddingTop: 10,
          paddingBottom: 20,
          paddingLeft: 20,
          paddingRight: 20,
        },
      },
      {
        id: 'text-1',
        type: 'text',
        content: '<p>Hello there,</p><p>Thank you for choosing <strong>Easy Email Editor</strong>. You are joining a community of over 10,000 creators who design responsive emails without writing code.</p><p>Our editor allows you to construct gorgeous newsletters using pre-built content blocks, adjust settings instantly in the sidebar, and output production-ready <strong>MJML code</strong> or responsive HTML tables with one click.</p>',
        style: {
          color: '#374151',
          textAlign: 'left',
          fontSize: '16px',
          lineHeight: '1.6',
          paddingTop: 10,
          paddingBottom: 20,
          paddingLeft: 20,
          paddingRight: 20,
        },
      },
      {
        id: 'btn-1',
        type: 'button',
        content: 'Access Your Dashboard ⚡',
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
          paddingBottom: 25,
          paddingLeft: 20,
          paddingRight: 20,
        },
      },
      {
        id: 'divider-1',
        type: 'divider',
        style: {
          borderColor: '#e5e7eb',
          borderWidth: 1,
          borderStyle: 'solid',
          paddingTop: 10,
          paddingBottom: 20,
          paddingLeft: 20,
          paddingRight: 20,
        },
      },
      {
        id: 'social-1',
        type: 'social',
        properties: {
          socialLinks: [
            { platform: 'facebook', url: 'https://facebook.com' },
            { platform: 'twitter', url: 'https://twitter.com' },
            { platform: 'linkedin', url: 'https://linkedin.com' },
            { platform: 'website', url: 'https://github.com' },
          ],
        },
        style: {
          textAlign: 'center',
          paddingTop: 10,
          paddingBottom: 10,
        },
      },
      {
        id: 'footer-1',
        type: 'footer',
        content: '© 2026 Easy Email Editor Inc. 123 Innovation Way, Suite 400, San Francisco, CA 94107.<br/><br/>You are receiving this email because you registered on our platform.<br/>No longer interested? <a href="#" style="color: #3b82f6; text-decoration: underline;">Unsubscribe safely</a> or <a href="#" style="color: #3b82f6; text-decoration: underline;">Manage Preferences</a>.',
        style: {
          color: '#9ca3af',
          textAlign: 'center',
          fontSize: '12px',
          lineHeight: '1.5',
          paddingTop: 10,
          paddingBottom: 30,
          paddingLeft: 30,
          paddingRight: 30,
        },
      },
    ],
  },
  {
    id: 'weekly-newsletter',
    name: '📰 Weekly Newsletter',
    subject: 'Issue #42: Unlocking design productivity in 2026 📈',
    subtitle: 'Plus: The rise of AI-assisted templating systems and weekly design roundups.',
    thumbnail: '/src/assets/images/newsletter_template_thumb_1784298270073.jpg',
    isFeatured: true,
    globalSettings: {
      backgroundColor: '#fdfdfd',
      contentWidth: 600,
      contentBg: '#f8fafc',
      fontFamily: '"Space Grotesk", sans-serif',
      borderRadius: 8,
      brandColors: {
        primary: '#0f172a',
        secondary: '#475569',
        accent: '#3b82f6',
      },
    },
    blocks: [
      {
        id: 'nl-header',
        type: 'header',
        content: 'THE CREATIVE ROUNDUP',
        style: {
          color: '#0f172a',
          textAlign: 'left',
          fontSize: '18px',
          fontWeight: '800',
          paddingTop: 30,
          paddingBottom: 10,
          paddingLeft: 24,
          paddingRight: 24,
        },
      },
      {
        id: 'nl-divider',
        type: 'divider',
        style: {
          borderColor: '#475569',
          borderWidth: 2,
          borderStyle: 'solid',
          paddingTop: 5,
          paddingBottom: 25,
          paddingLeft: 24,
          paddingRight: 24,
        },
      },
      {
        id: 'nl-image',
        type: 'image',
        properties: {
          src: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=600&auto=format&fit=crop&q=80',
          alt: 'Creative Working Environment',
          width: '100%',
        },
        style: {
          borderRadius: 4,
          paddingTop: 5,
          paddingBottom: 20,
          paddingLeft: 24,
          paddingRight: 24,
        },
      },
      {
        id: 'nl-title',
        type: 'header',
        content: 'How To Keep Your Email Templates Lightweight',
        style: {
          color: '#1e293b',
          textAlign: 'left',
          fontSize: '24px',
          fontWeight: '700',
          paddingTop: 10,
          paddingBottom: 10,
          paddingLeft: 24,
          paddingRight: 24,
        },
      },
      {
        id: 'nl-text',
        type: 'text',
        content: '<p>Every kilobyte counts when sending HTML marketing newsletters. Most mobile mail clients will clip your email if the raw HTML size exceeds <strong>102KB</strong>. Here is how to keep it light:</p><ul><li>Minify your CSS properties</li><li>Keep your nesting simple (avoid deeply stacked nested tables)</li><li>Rely on MJML compiler structures to optimize column layout code</li></ul>',
        style: {
          color: '#334155',
          textAlign: 'left',
          fontSize: '15px',
          lineHeight: '1.6',
          paddingTop: 10,
          paddingBottom: 20,
          paddingLeft: 24,
          paddingRight: 24,
        },
      },
      {
        id: 'nl-btn',
        type: 'button',
        content: 'Read Full Article 📖',
        properties: {
          href: 'https://github.com',
        },
        style: {
          backgroundColor: '#0f172a',
          color: '#ffffff',
          textAlign: 'left',
          borderRadius: 0,
          fontSize: '15px',
          fontWeight: 'bold',
          paddingTop: 10,
          paddingBottom: 30,
          paddingLeft: 24,
          paddingRight: 24,
        },
      },
      {
        id: 'nl-footer',
        type: 'footer',
        content: 'You are receiving this digest because you are subscribed to The Creative Roundup.<br/>To stop receiving weekly digests, <a href="#" style="color: #0f172a; text-decoration: underline;">unsubscribe immediately</a>.',
        style: {
          color: '#64748b',
          textAlign: 'left',
          fontSize: '11px',
          paddingTop: 30,
          paddingBottom: 30,
          paddingLeft: 24,
          paddingRight: 24,
        },
      },
    ],
  },
  {
    id: 'product-promo',
    name: '🛍️ Special Sale Promo',
    subject: 'Last Chance: 35% Off Everything in our Store! 🏷️',
    subtitle: 'Use code SUMMERSALE at checkout. Sale ends in less than 24 hours.',
    thumbnail: '/src/assets/images/promo_template_thumb_1784298280669.jpg',
    isAiGenerated: true,
    globalSettings: {
      backgroundColor: '#090d16',
      contentWidth: 600,
      contentBg: '#111827',
      fontFamily: '"Outfit", "Inter", sans-serif',
      borderRadius: 16,
      brandColors: {
        primary: '#f59e0b',
        secondary: '#d97706',
        accent: '#ffffff',
      },
    },
    blocks: [
      {
        id: 'promo-header',
        type: 'header',
        content: 'SUMMER clearance SALE',
        style: {
          color: '#f59e0b',
          textAlign: 'center',
          fontSize: '12px',
          fontWeight: 'bold',
          paddingTop: 40,
          paddingBottom: 5,
          paddingLeft: 20,
          paddingRight: 20,
        },
      },
      {
        id: 'promo-title',
        type: 'header',
        content: 'UP TO 35% OFF EVERYTHING',
        style: {
          color: '#ffffff',
          textAlign: 'center',
          fontSize: '32px',
          fontWeight: '900',
          paddingTop: 5,
          paddingBottom: 15,
          paddingLeft: 20,
          paddingRight: 20,
        },
      },
      {
        id: 'promo-image',
        type: 'image',
        properties: {
          src: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&auto=format&fit=crop&q=80',
          alt: 'Vibrant Clothes Rack',
          width: '100%',
        },
        style: {
          borderRadius: 8,
          paddingTop: 10,
          paddingBottom: 25,
          paddingLeft: 20,
          paddingRight: 20,
        },
      },
      {
        id: 'promo-text',
        type: 'text',
        content: '<p style="text-align: center;">Refresh your wardrobe, elevate your workstation, or stock up on your favorite essentials. The summer catalog is selling out rapidly.</p><p style="text-align: center; font-size: 20px; color: #f59e0b; font-weight: bold; margin-top: 15px;">Discount Code: <strong>SUMMER35</strong></p>',
        style: {
          color: '#9ca3af',
          textAlign: 'center',
          fontSize: '16px',
          lineHeight: '1.6',
          paddingTop: 5,
          paddingBottom: 25,
          paddingLeft: 20,
          paddingRight: 20,
        },
      },
      {
        id: 'promo-btn',
        type: 'button',
        content: 'Shop the Sale Now ➜',
        properties: {
          href: 'https://github.com',
        },
        style: {
          backgroundColor: '#f59e0b',
          color: '#111827',
          textAlign: 'center',
          borderRadius: 30,
          fontSize: '16px',
          fontWeight: 'bold',
          paddingTop: 10,
          paddingBottom: 40,
          paddingLeft: 20,
          paddingRight: 20,
        },
      },
      {
        id: 'promo-footer',
        type: 'footer',
        content: 'This advertisement was sent to dostam002@gmail.com.<br/>To ensure delivery to your inbox, add news@store.com to your address book.<br/><a href="#" style="color: #f59e0b;">Update Subscription Settings</a> | <a href="#" style="color: #f59e0b;">Unsubscribe</a>',
        style: {
          color: '#4b5563',
          textAlign: 'center',
          fontSize: '11px',
          paddingTop: 20,
          paddingBottom: 40,
          paddingLeft: 20,
          paddingRight: 20,
        },
      },
    ],
  },
  {
    id: 'ink-gold-premium',
    name: '🖋️ Ink & Gold Premium',
    subject: 'A New Standard of Excellence has Arrived',
    subtitle: 'Step into the world of luxury design and curated essentials.',
    thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400',
    globalSettings: {
      backgroundColor: '#0a0a0a',
      contentWidth: 600,
      contentBg: '#121212',
      fontFamily: '"Inter", sans-serif',
      borderRadius: 12,
      brandColors: {
        primary: '#d4af37',
        secondary: '#1a1a1a',
        accent: '#ffffff',
      },
    },
    blocks: [
      {
        id: 'ig-navbar',
        type: 'navbar',
        content: 'PREMIUM STUDIO',
        properties: {
          socialLinks: [
            { platform: 'SHOP', url: '#' },
            { platform: 'STORY', url: '#' },
            { platform: 'CONTACT', url: '#' }
          ]
        },
        style: { paddingTop: 20, paddingBottom: 20, paddingLeft: 20, paddingRight: 20 }
      },
      {
        id: 'ig-hero',
        type: 'hero',
        content: 'THE ART OF MINIMALISM',
        properties: {
          src: 'https://images.unsplash.com/photo-1499951360447-b19be8fe80f5?w=1000',
          overlayPosition: 'center',
          overlayScrim: 'rgba(26, 26, 26, 0.65)',
          badge: 'NEW COLLECTION',
          price: 'Starting from $299',
          href: '#'
        },
        style: { paddingTop: 0, paddingBottom: 0 }
      },
      {
        id: 'ig-header',
        type: 'header',
        content: 'Curated for the Discerning',
        style: { color: '#d4af37', textAlign: 'center', fontSize: '28px', fontWeight: 'bold', paddingTop: 40, paddingBottom: 10 }
      },
      {
        id: 'ig-text',
        type: 'text',
        content: '<p style="text-align: center;">Our latest release focuses on the intersection of form and function. Each piece is meticulously designed to provide a seamless experience that transcends time.</p>',
        style: { color: '#e5e7eb', textAlign: 'center', fontSize: '15px', lineHeight: '1.7', paddingTop: 5, paddingBottom: 30, paddingLeft: 40, paddingRight: 40 }
      },
      {
        id: 'ig-grid',
        type: 'imageGrid',
        properties: {
          images: [
            { src: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400', alt: 'Watch' },
            { src: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400', alt: 'Headphones' },
            { src: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400', alt: 'Glass' }
          ]
        },
        style: { paddingTop: 10, paddingBottom: 30, paddingLeft: 20, paddingRight: 20 }
      },
      {
        id: 'ig-quote',
        type: 'quote',
        content: 'Simplicity is the ultimate sophistication.',
        properties: { author: 'Leonardo da Vinci' },
        style: { paddingTop: 30, paddingBottom: 30, paddingLeft: 40, paddingRight: 40, color: '#e5e7eb' }
      },
      {
        id: 'ig-btn',
        type: 'button',
        content: 'Explore the Catalog',
        properties: { href: '#' },
        style: { backgroundColor: '#d4af37', color: '#121212', textAlign: 'center', borderRadius: 8, fontSize: '15px', fontWeight: 'bold', paddingTop: 16, paddingBottom: 16, paddingLeft: 60, paddingRight: 60 }
      },
      {
        id: 'ig-divider',
        type: 'divider',
        style: { borderColor: 'rgba(212, 175, 55, 0.2)', borderWidth: 1, borderStyle: 'solid', paddingTop: 40, paddingBottom: 40, paddingLeft: 20, paddingRight: 20 }
      },
      {
        id: 'ig-footer',
        type: 'footer',
        content: '© 2026 PREMIUM STUDIO. Crafted for Excellence.<br/>Paris • New York • Tokyo<br/><a href="#" style="color: #d4af37; text-decoration: underline;">Unsubscribe</a>',
        style: { color: '#9ca3af', textAlign: 'center', fontSize: '11px', lineHeight: '1.6', paddingTop: 0, paddingBottom: 40 }
      },
    ]
  }
];
