import { EmailTemplate, EmailBlock, BlockStyle } from '../types';

function getPaddingStyle(style: BlockStyle) {
  const top = style.paddingTop !== undefined ? `${style.paddingTop}px` : '10px';
  const bottom = style.paddingBottom !== undefined ? `${style.paddingBottom}px` : '10px';
  const left = style.paddingLeft !== undefined ? `${style.paddingLeft}px` : '20px';
  const right = style.paddingRight !== undefined ? `${style.paddingRight}px` : '20px';
  return `padding-top="${top}" padding-bottom="${bottom}" padding-left="${left}" padding-right="${right}"`;
}

function escapeHtml(text?: string): string {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function generateMJML(template: EmailTemplate): string {
  const { subject, subtitle, globalSettings, blocks } = template;
  const { backgroundColor, contentWidth, contentBg, fontFamily, borderRadius } = globalSettings;

  const renderBlockMJML = (block: EmailBlock): string => {
    let blockBg = block.style.backgroundColor || 'transparent';
    let gradientStr = '';
    
    if (block.style.background) {
      if (block.style.background.type === 'gradient') {
         blockBg = 'transparent'; 
         // MJML doesn't natively support full CSS gradients on all elements, but it can be applied to css-class
         gradientStr = `css-class="gradient-bg"`; 
      } else if (block.style.background.type === 'solid') {
         blockBg = block.style.background.value;
      }
    }
    const paddingStr = getPaddingStyle(block.style);
    const alignStr = block.style.textAlign ? `align="${block.style.textAlign}"` : 'align="left"';
    
    let mjmlBlock = '';

    switch (block.type) {
      case 'header': {
        const color = block.style.color || '#111827';
        const fontSize = block.style.fontSize || '24px';
        const fontWeight = block.style.fontWeight || 'bold';
        mjmlBlock += `
      <mj-section background-color="${blockBg}" ${gradientStr} padding="0px">
        <mj-column width="100%">
          <mj-text ${alignStr} color="${color}" font-size="${fontSize}" font-weight="${fontWeight}" ${paddingStr}>
            ${block.content || 'Header Text'}
          </mj-text>
        </mj-column>
      </mj-section>`;
        break;
      }

      case 'text': {
        const color = block.style.color || '#374151';
        const fontSize = block.style.fontSize || '16px';
        const fontWeight = block.style.fontWeight || 'normal';
        const lineHeight = block.style.lineHeight || '1.6';
        mjmlBlock += `
      <mj-section background-color="${blockBg}" ${gradientStr} padding="0px">
        <mj-column width="100%">
          <mj-text ${alignStr} color="${color}" font-size="${fontSize}" font-weight="${fontWeight}" line-height="${lineHeight}" ${paddingStr}>
            ${block.content || 'Enter your text content here.'}
          </mj-text>
        </mj-column>
      </mj-section>`;
        break;
      }

      case 'image': {
        const src = block.properties?.src || 'https://images.unsplash.com/photo-1579202673506-ca3ce28943ef?w=600&auto=format&fit=crop&q=80';
        const alt = block.properties?.alt || 'Image';
        const width = block.properties?.width || '100%';
        const href = block.properties?.href ? `href="${block.properties.href}"` : '';
        const imgBorderRadius = block.style.borderRadius !== undefined ? `border-radius="${block.style.borderRadius}px"` : '';
        mjmlBlock += `
      <mj-section background-color="${blockBg}" ${gradientStr} padding="0px">
        <mj-column width="100%">
          <mj-image src="${src}" alt="${alt}" width="${width}" ${href} ${alignStr} ${imgBorderRadius} ${paddingStr} />
        </mj-column>
      </mj-section>`;
        break;
      }

      case 'button': {
        const color = block.style.color || '#ffffff';
        const btnBg = block.style.backgroundColor || '#2563eb';
        const fontSize = block.style.fontSize || '16px';
        const fontWeight = block.style.fontWeight || 'bold';
        const href = block.properties?.href || '#';
        const btnBorderRadius = block.style.borderRadius !== undefined ? `${block.style.borderRadius}px` : '4px';
        mjmlBlock += `
      <mj-section background-color="${blockBg}" ${gradientStr} padding="0px">
        <mj-column width="100%">
          <mj-button background-color="${btnBg}" color="${color}" font-size="${fontSize}" font-weight="${fontWeight}" border-radius="${btnBorderRadius}" href="${href}" ${alignStr} ${paddingStr}>
            ${block.content || 'Click Here'}
          </mj-button>
        </mj-column>
      </mj-section>`;
        break;
      }

      case 'divider': {
        const borderColor = block.style.borderColor || '#e5e7eb';
        const borderWidth = block.style.borderWidth !== undefined ? `${block.style.borderWidth}px` : '1px';
        const borderStyle = block.style.borderStyle || 'solid';
        mjmlBlock += `
      <mj-section background-color="${blockBg}" ${gradientStr} padding="0px">
        <mj-column width="100%">
          <mj-divider border-color="${borderColor}" border-width="${borderWidth}" border-style="${borderStyle}" ${paddingStr} />
        </mj-column>
      </mj-section>`;
        break;
      }

      case 'spacer': {
        const height = block.properties?.height || 20;
        mjmlBlock += `
      <mj-section background-color="${blockBg}" ${gradientStr} padding="0px">
        <mj-column width="100%">
          <mj-spacer height="${height}px" />
        </mj-column>
      </mj-section>`;
        break;
      }

      case 'social': {
        mjmlBlock += `
      <mj-section background-color="${blockBg}" ${gradientStr} padding="0px">
        <mj-column width="100%">
          <mj-social font-size="15px" icon-size="30px" mode="horizontal" ${alignStr} ${paddingStr}>`;
        
        const links = block.properties?.socialLinks || [];
        links.forEach((link) => {
          if (link.url) {
            mjmlBlock += `
            <mj-social-element name="${link.platform}" href="${link.url}">${link.platform.charAt(0).toUpperCase() + link.platform.slice(1)}</mj-social-element>`;
          }
        });

        mjmlBlock += `
          </mj-social>
        </mj-column>
      </mj-section>`;
        break;
      }

      case 'footer': {
        const color = block.style.color || '#6b7280';
        const fontSize = block.style.fontSize || '12px';
        const lineHeight = block.style.lineHeight || '1.5';
        mjmlBlock += `
      <mj-section background-color="${blockBg}" ${gradientStr} padding="0px">
        <mj-column width="100%">
          <mj-text ${alignStr} color="${color}" font-size="${fontSize}" line-height="${lineHeight}" ${paddingStr}>
            ${block.content || '© 2026 Your Company. All rights reserved.<br/>Want to change how you receive these emails?<br/>You can <a href="#" style="color: inherit; text-decoration: underline;">unsubscribe from this list</a>.'}
          </mj-text>
        </mj-column>
      </mj-section>`;
        break;
      }

      // NEW BLOCK TYPES (Section 3.2)
      case 'section': {
        const cols = block.properties?.columns || [];
        const widths = block.properties?.columnWidths || cols.map(() => 100 / cols.length);
        
        mjmlBlock += `
      <!-- Container Section -->
      <mj-section background-color="${blockBg}" ${gradientStr} padding="10px 0px">`;
        
        cols.forEach((colBlocks, idx) => {
          const widthVal = widths[idx] || (100 / cols.length);
          mjmlBlock += `
        <mj-column width="${widthVal}%">`;
          
          colBlocks.forEach((childBlock) => {
            // Render inside columns, strip container wrapper section for nested blocks
            const innerBg = childBlock.style.backgroundColor || 'transparent';
            const innerPadding = getPaddingStyle(childBlock.style);
            const innerAlign = childBlock.style.textAlign ? `align="${childBlock.style.textAlign}"` : 'align="left"';

            if (childBlock.type === 'header') {
              mjmlBlock += `
          <mj-text ${innerAlign} color="${childBlock.style.color || '#111827'}" font-size="${childBlock.style.fontSize || '20px'}" font-weight="${childBlock.style.fontWeight || 'bold'}" ${innerPadding}>
            ${childBlock.content || 'Header'}
          </mj-text>`;
            } else if (childBlock.type === 'text') {
              mjmlBlock += `
          <mj-text ${innerAlign} color="${childBlock.style.color || '#374151'}" font-size="${childBlock.style.fontSize || '14px'}" line-height="${childBlock.style.lineHeight || '1.5'}" ${innerPadding}>
            ${childBlock.content || 'Text'}
          </mj-text>`;
            } else if (childBlock.type === 'image') {
              mjmlBlock += `
          <mj-image src="${childBlock.properties?.src || ''}" alt="image" width="${childBlock.properties?.width || '100%'}" ${innerPadding} />`;
            } else if (childBlock.type === 'button') {
              mjmlBlock += `
          <mj-button background-color="${childBlock.style.backgroundColor || '#2563eb'}" color="${childBlock.style.color || '#ffffff'}" href="${childBlock.properties?.href || '#'}" ${innerPadding}>
            ${childBlock.content || 'Button'}
          </mj-button>`;
            } else if (childBlock.type === 'divider') {
              mjmlBlock += `
          <mj-divider border-color="${childBlock.style.borderColor || '#e2e8f0'}" ${innerPadding} />`;
            } else if (childBlock.type === 'spacer') {
              mjmlBlock += `
          <mj-spacer height="${childBlock.properties?.height || 20}px" />`;
            }
          });

          mjmlBlock += `
        </mj-column>`;
        });

        mjmlBlock += `
      </mj-section>`;
        break;
      }

      case 'hero': {
        const scrimBg = block.properties?.overlayScrim || 'rgba(0,0,0,0.4)';
        const overlayPos = block.properties?.overlayPosition || 'center';
        const hasHref = !!block.properties?.href;

        mjmlBlock += `
      <mj-hero mode="fixed-height" height="300px" background-width="600px" background-height="300px" background-url="${block.properties?.src || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800'}" background-color="${blockBg}" padding="40px">
        <mj-text align="${block.style.textAlign || 'center'}" color="#ffffff" font-size="28px" font-weight="800">
          ${block.content || 'Hero Title text'}
        </mj-text>
        <mj-text align="${block.style.textAlign || 'center'}" color="#f1f5f9" font-size="16px">
          ${block.properties?.price || ''}
        </mj-text>
        ${hasHref ? `
        <mj-button background-color="#ffffff" color="#111827" href="${block.properties?.href}" align="${block.style.textAlign || 'center'}">
          Explore More
        </mj-button>` : ''}
      </mj-hero>`;
        break;
      }

      case 'imageGrid': {
        const gridImgs = block.properties?.images || [];
        mjmlBlock += `
      <mj-section background-color="${blockBg}" ${gradientStr} padding="10px">`;
        gridImgs.forEach((img) => {
          mjmlBlock += `
        <mj-column>
          <mj-image src="${img.src}" alt="${img.alt || 'grid-image'}" padding="4px" />
        </mj-column>`;
        });
        mjmlBlock += `
      </mj-section>`;
        break;
      }

      case 'productCard': {
        const badge = block.properties?.badge;
        const price = block.properties?.price || '$0.00';
        const src = block.properties?.src || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400';
        const alt = block.properties?.alt || 'Product';
        const href = block.properties?.href || '#';

        mjmlBlock += `
      <mj-section background-color="#ffffff" padding="16px" border-radius="${block.style.borderRadius || 12}px">
        <mj-column width="100%">
          ${badge ? `<mj-text align="center" color="#f43f5e" font-size="11px" font-weight="bold">${badge}</mj-text>` : ''}
          <mj-image src="${src}" alt="${alt}" max-height="180px" />
          <mj-text align="center" font-size="16px" font-weight="bold" color="#1e293b">${block.content || 'Product Name'}</mj-text>
          <mj-text align="center" font-size="18px" font-weight="800" color="#2563eb">${price}</mj-text>
          <mj-button background-color="#2563eb" color="#ffffff" href="${href}" width="80%">Buy Now</mj-button>
        </mj-column>
      </mj-section>`;
        break;
      }

      case 'quote': {
        const quoteText = block.content || 'Quotable text goes here';
        const author = block.properties?.author;

        mjmlBlock += `
      <mj-section background-color="${blockBg}" ${gradientStr} padding="10px">
        <mj-column border-left="4px solid #2563eb" padding-left="15px">
          <mj-text font-size="18px" font-style="italic" color="#334155">"${quoteText}"</mj-text>
          ${author ? `<mj-text font-size="13px" font-weight="bold" color="#64748b">— ${author}</mj-text>` : ''}
        </mj-column>
      </mj-section>`;
        break;
      }

      case 'navbar': {
        const logo = block.content || 'Brand Logo';
        const navLinks = block.properties?.socialLinks || [];

        mjmlBlock += `
      <mj-section background-color="${blockBg}" ${gradientStr} padding="10px 20px">
        <mj-column width="40%">
          <mj-text font-size="18px" font-weight="800" color="#0f172a">${logo}</mj-text>
        </mj-column>
        <mj-column width="60%">
          <mj-text align="right">
            ${navLinks.map(link => `<a href="${link.url}" target="_blank" style="margin-left: 15px; color: #475569; text-decoration: none; font-weight: 600;">${link.platform}</a>`).join('')}
          </mj-text>
        </mj-column>
      </mj-section>`;
        break;
      }

      case 'htmlEmbed': {
        mjmlBlock += `
      <mj-section background-color="${blockBg}" ${gradientStr} padding="0px">
        <mj-column width="100%">
          <mj-raw>${block.content || ''}</mj-raw>
        </mj-column>
      </mj-section>`;
        break;
      }

      case 'countdown': {
        const cDate = block.properties?.countdownDate || 'December 31, 2026';
        mjmlBlock += `
      <mj-section background-color="#0f172a" padding="24px" border-radius="12px">
        <mj-column width="100%">
          <mj-text align="center" color="#38bdf8" font-size="13px" font-weight="bold">🔥 Limited Time Offer! Ends Soon</mj-text>
          <mj-text align="center" color="#ffffff" font-size="24px" font-weight="bold">02 : 14 : 35 : 59</mj-text>
          <mj-text align="center" color="#64748b" font-size="11px">Target: ${cDate}</mj-text>
        </mj-column>
      </mj-section>`;
        break;
      }

      default:
        break;
    }

    return mjmlBlock;
  };

  let mjml = `<mjml>
  <mj-head>
    <mj-title>${escapeHtml(subject)}</mj-title>
    <mj-preview>${escapeHtml(subtitle)}</mj-preview>
    <mj-attributes>
      <mj-all font-family="${fontFamily || 'Inter, Helvetica, Arial, sans-serif'}" />
      <mj-text font-size="16px" color="#333333" line-height="1.6" />
    </mj-attributes>
    <mj-style>
      .email-body {
        border-radius: ${borderRadius || 0}px;
        overflow: hidden;
      }
    </mj-style>
  </mj-head>
  <mj-body background-color="${backgroundColor || '#f4f4f5'}" width="${contentWidth || 600}px">
    <!-- Wrapper for styling -->
    <mj-wrapper css-class="email-body" background-color="${contentBg || '#ffffff'}" padding="0px">
`;

  blocks.forEach((block) => {
    mjml += renderBlockMJML(block);
  });

  mjml += `
    </mj-wrapper>
  </mj-body>
</mjml>`;

  return mjml;
}
