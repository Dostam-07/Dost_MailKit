import { EmailTemplate, EmailBlock, BlockStyle } from '../types';

const replaceVariables = (text: string, variables?: Record<string, string>): string => {
  if (!text) return '';
  return text.replace(/{{\s*([^{}\s]+)\s*}}/g, (match, varName) => {
    if (variables && variables[varName] !== undefined) {
      return variables[varName];
    }
    return match;
  });
};

function getInlineStyles(style: BlockStyle, extra: string = ''): string {
  const parts: string[] = [];
  if (style.color) parts.push(`color: ${style.color}`);
  if (style.background) {
    if (style.background.type === 'gradient') {
      parts.push(`background: ${style.background.value}`);
    } else if (style.background.type === 'image') {
      parts.push(`background: url(${style.background.value}) center/cover no-repeat`);
    } else {
      parts.push(`background-color: ${style.background.value}`);
    }
  } else if (style.backgroundColor) {
    parts.push(`background-color: ${style.backgroundColor}`);
  }
  if (style.fontSize) parts.push(`font-size: ${style.fontSize}`);
  if (style.fontWeight) parts.push(`font-weight: ${style.fontWeight}`);
  if (style.textAlign) parts.push(`text-align: ${style.textAlign}`);
  if (style.lineHeight) parts.push(`line-height: ${style.lineHeight}`);
  
  // Custom design-system properties (Section 3.4)
  if (style.letterSpacing) parts.push(`letter-spacing: ${style.letterSpacing}`);
  if (style.textTransform) parts.push(`text-transform: ${style.textTransform}`);
  if (style.backgroundImage) parts.push(`background-image: url('${style.backgroundImage}')`);
  if (style.backgroundPosition) parts.push(`background-position: ${style.backgroundPosition}`);
  if (style.boxShadow) parts.push(`box-shadow: ${style.boxShadow}`);

  // Padding
  const t = style.paddingTop !== undefined ? style.paddingTop : 10;
  const b = style.paddingBottom !== undefined ? style.paddingBottom : 10;
  const l = style.paddingLeft !== undefined ? style.paddingLeft : 20;
  const r = style.paddingRight !== undefined ? style.paddingRight : 20;
  parts.push(`padding: ${t}px ${r}px ${b}px ${l}px`);

  if (style.borderRadius !== undefined) parts.push(`border-radius: ${style.borderRadius}px`);
  if (style.borderWidth !== undefined) {
    const color = style.borderColor || '#e5e7eb';
    const bstyle = style.borderStyle || 'solid';
    parts.push(`border: ${style.borderWidth}px ${bstyle} ${color}`);
  }

  if (extra) parts.push(extra);
  return parts.join('; ');
}

export function generateHTML(template: EmailTemplate): string {
  const { subject, globalSettings, blocks } = template;
  const { backgroundColor, contentWidth, contentBg, fontFamily, borderRadius } = globalSettings;
  const fontValue = fontFamily || 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';

  const renderBlockHTML = (block: EmailBlock): string => {
    const blockBg = block.style.backgroundColor || 'transparent';
    const inlineStyles = getInlineStyles(block.style);
    const alignStr = block.style.textAlign || 'left';

    let blockHtml = `
              <!-- Block: ${block.type.toUpperCase()} (ID: ${block.id}) -->
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: ${blockBg}; table-layout: fixed;">
                <tr>
                  <td align="${alignStr}" valign="top" style="${inlineStyles}">
    `;

    switch (block.type) {
      case 'header': {
        const titleStyle = `margin: 0; font-family: ${fontValue};`;
        blockHtml += `
                    <h1 style="${titleStyle}">${replaceVariables(block.content || 'Header Text', template.variables)}</h1>`;
        break;
      }

      case 'text': {
        const pStyle = `margin: 0; font-family: ${fontValue}; word-break: break-word;`;
        blockHtml += `
                    <div style="${pStyle}">${replaceVariables(block.content || 'Enter your text content here.', template.variables)}</div>`;
        break;
      }

      case 'image': {
        const src = block.properties?.src || 'https://images.unsplash.com/photo-1579202673506-ca3ce28943ef?w=600&auto=format&fit=crop&q=80';
        const alt = block.properties?.alt || 'Image';
        const width = block.properties?.width || '100%';
        const href = block.properties?.href || '';
        const borderRadiusVal = block.style.borderRadius !== undefined ? `${block.style.borderRadius}px` : '0px';

        const imgTag = `<img src="${src}" alt="${alt}" width="${width === '100%' ? '100%' : width.replace('px', '')}" class="responsive-img" style="display: block; width: ${width}; height: auto; border: 0; border-radius: ${borderRadiusVal};" />`;

        if (href) {
          blockHtml += `<a href="${href}" target="_blank" style="display: inline-block; width: ${width};">${imgTag}</a>`;
        } else {
          blockHtml += imgTag;
        }
        break;
      }

      case 'button': {
        const btnBg = block.style.backgroundColor || '#2563eb';
        const color = block.style.color || '#ffffff';
        const fontSize = block.style.fontSize || '16px';
        const fontWeight = block.style.fontWeight || 'bold';
        const href = block.properties?.href || '#';
        const rVal = block.style.borderRadius !== undefined ? `${block.style.borderRadius}px` : '4px';

        const btnText = replaceVariables(block.content || 'Click Here', template.variables);

        blockHtml += `
                    <!--[if mso]>
                    <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="${href}" style="height:44px;v-text-anchor:middle;width:180px;" arcsize="10%" stroke="f" fillcolor="${btnBg}">
                      <w:anchorlock/>
                      <center style="color:${color};font-family:${fontValue};font-size:${fontSize};font-weight:${fontWeight};">${btnText}</center>
                    </v:roundrect>
                    <![endif]-->
                    <!--[if !mso]><!-->
                    <a href="${href}" target="_blank" style="display: inline-block; background-color: ${btnBg}; color: ${color}; font-size: ${fontSize}; font-family: ${fontValue}; font-weight: ${fontWeight}; text-decoration: none; padding: 12px 24px; border-radius: ${rVal}; text-align: center; border: 1px solid ${btnBg}; transition: background-color 0.2s ease;">
                      ${btnText}
                    </a>
                    <!--<![endif]-->`;
        break;
      }

      case 'divider': {
        const borderColor = block.style.borderColor || '#e5e7eb';
        const borderWidth = block.style.borderWidth !== undefined ? `${block.style.borderWidth}px` : '1px';
        const borderStyle = block.style.borderStyle || 'solid';
        const dividerWidth = block.style.width || '100%';
        const align = block.style.textAlign || 'center';
        blockHtml += `
                    <table border="0" cellpadding="0" cellspacing="0" width="${dividerWidth}" style="margin: ${align === 'center' ? '0 auto' : align === 'right' ? '0 0 0 auto' : '0 auto 0 0'}; line-height: 1px; font-size: 1px;">
                      <tr>
                        <td style="border-top: ${borderWidth} ${borderStyle} ${borderColor}; font-size: 1px; line-height: 1px; height: 0;">&nbsp;</td>
                      </tr>
                    </table>`;
        break;
      }

      case 'spacer': {
        const height = block.properties?.height || 20;
        blockHtml += `
                    <div style="height: ${height}px; line-height: ${height}px; font-size: 1px;">&nbsp;</div>`;
        break;
      }

      case 'social': {
        const links = block.properties?.socialLinks || [];
        blockHtml += `
                    <table border="0" cellpadding="0" cellspacing="0" style="display: inline-block;">
                      <tr>`;
        
        links.forEach((link) => {
          if (link.url) {
            let iconSrc = 'https://cdn-icons-png.flaticon.com/32/145/145802.png'; // facebook
            if (link.platform === 'twitter') iconSrc = 'https://cdn-icons-png.flaticon.com/32/733/733579.png';
            if (link.platform === 'instagram') iconSrc = 'https://cdn-icons-png.flaticon.com/32/2111/2111463.png';
            if (link.platform === 'linkedin') iconSrc = 'https://cdn-icons-png.flaticon.com/32/145/145807.png';
            if (link.platform === 'youtube') iconSrc = 'https://cdn-icons-png.flaticon.com/32/1384/1384060.png';
            if (link.platform === 'website') iconSrc = 'https://cdn-icons-png.flaticon.com/32/1006/1006771.png';

            blockHtml += `
                        <td style="padding: 0 8px;">
                          <a href="${link.url}" target="_blank">
                            <img src="${iconSrc}" alt="${link.platform}" width="28" style="display: block; border: 0;" />
                          </a>
                        </td>`;
          }
        });

        blockHtml += `
                      </tr>
                    </table>`;
        break;
      }

      case 'footer': {
        const pStyle = `margin: 0; font-family: ${fontValue}; font-size: 12px; line-height: 1.5; color: ${block.style.color || '#6b7280'};`;
        blockHtml += `
                    <div style="${pStyle}">${replaceVariables(block.content || '© 2026 Your Company. All rights reserved.<br/>Want to change how you receive these emails?<br/>You can unsubscribe from this list.', template.variables)}</div>`;
        break;
      }

      // NEW BLOCK TYPES (Section 3.2)
      case 'section': {
        const cols = block.properties?.columns || [];
        const widths = block.properties?.columnWidths || cols.map(() => 100 / cols.length);
        const stackMobile = block.properties?.stackOnMobile !== false;

        blockHtml += `
                    <!--[if mso]>
                    <table role="presentation" border="0" cellspacing="0" cellpadding="0" width="100%">
                      <tr>
                    <![endif]-->
        `;

        cols.forEach((colBlocks, idx) => {
          const widthVal = widths[idx] || (100 / cols.length);
          blockHtml += `
                    <!--[if mso]>
                    <td valign="top" width="${widthVal}%">
                    <![endif]-->
                    <div style="display: inline-block; width: ${widthVal}%; vertical-align: top;" class="${stackMobile ? 'col-stack' : ''}">
                      <table border="0" cellpadding="0" cellspacing="0" width="100%">
                        <tr>
                          <td valign="top" style="padding: 0 ${block.properties?.columnGap ? (block.properties.columnGap / 2) : 5}px;">
                            ${colBlocks.map(b => renderBlockHTML(b)).join('')}
                          </td>
                        </tr>
                      </table>
                    </div>
                    <!--[if mso]>
                    </td>
                    <![endif]-->
          `;
        });

        blockHtml += `
                    <!--[if mso]>
                      </tr>
                    </table>
                    <![endif]-->
        `;
        break;
      }

      case 'hero': {
        const scrimBg = block.properties?.overlayScrim || 'rgba(0,0,0,0.4)';
        const overlayPos = block.properties?.overlayPosition || 'center';
        const hasHref = !!block.properties?.href;
        
        let alignItems = 'center';
        let textAlign = 'center';
        if (overlayPos === 'bottom-left') {
          alignItems = 'flex-end';
          textAlign = 'left';
        } else if (overlayPos === 'bottom-center') {
          alignItems = 'flex-end';
          textAlign = 'center';
        }

        blockHtml += `
                    <div style="background-image: url('${block.properties?.src || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800'}'); background-size: cover; background-position: center; position: relative; padding: 60px 40px; min-height: 250px; display: flex; align-items: ${alignItems}; text-align: ${textAlign}; border-radius: ${block.style.borderRadius || 0}px; overflow: hidden;" class="hero-block">
                      <div style="position: absolute; top:0; left:0; right:0; bottom:0; background-color: ${scrimBg}; z-index: 1;"></div>
                      <div style="position: relative; z-index: 2; color: #ffffff; width: 100%;">
                        ${block.properties?.badge ? `<span style="display: inline-block; background-color: #2563eb; color: #ffffff; font-size: 11px; font-weight: bold; padding: 4px 10px; border-radius: 4px; margin-bottom: 12px; text-transform: uppercase; letter-spacing: 1px;">${block.properties.badge}</span>` : ''}
                        <h1 style="margin: 0 0 10px 0; font-family: ${fontValue}; font-size: 32px; font-weight: 800; color: #ffffff; text-shadow: 0 2px 4px rgba(0,0,0,0.4); line-height: 1.2;">${replaceVariables(block.content || 'Hero Title text', template.variables)}</h1>
                        <p style="margin: 0 0 20px 0; font-family: ${fontValue}; font-size: 16px; color: #f1f5f9; text-shadow: 0 1px 2px rgba(0,0,0,0.4); line-height: 1.4;">${replaceVariables(block.properties?.price || 'This is overlay subtext', template.variables)}</p>
                        ${hasHref ? `
                        <a href="${block.properties?.href}" target="_blank" style="display: inline-block; background-color: #ffffff; color: #111827; font-size: 14px; font-family: ${fontValue}; font-weight: bold; text-decoration: none; padding: 12px 24px; border-radius: 6px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                          Explore More
                        </a>` : ''}
                      </div>
                    </div>
        `;
        break;
      }

      case 'imageGrid': {
        const gridImgs = block.properties?.images || [];
        const count = gridImgs.length || 1;
        const colWidth = 100 / count;

        blockHtml += `
                    <table border="0" cellpadding="0" cellspacing="0" width="100%">
                      <tr>
        `;

        gridImgs.forEach((img) => {
          blockHtml += `
                        <td valign="top" width="${colWidth}%" style="padding: 4px;">
                          <img src="${img.src}" alt="${img.alt || 'grid-image'}" style="width: 100%; height: auto; display: block; border-radius: ${block.style.borderRadius || 4}px;" />
                        </td>
          `;
        });

        if (gridImgs.length === 0) {
          blockHtml += `
                        <td align="center" style="padding: 20px; color: #94a3b8; border: 1px dashed #cbd5e1; border-radius: 8px;">
                          No images selected for this grid.
                        </td>
          `;
        }

        blockHtml += `
                      </tr>
                    </table>
        `;
        break;
      }

      case 'productCard': {
        const badge = block.properties?.badge;
        const price = block.properties?.price || '$0.00';
        const src = block.properties?.src || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400';
        const alt = block.properties?.alt || 'Product';
        const href = block.properties?.href || '#';

        blockHtml += `
                    <div style="text-align: center; border: 1px solid #e2e8f0; border-radius: ${block.style.borderRadius || 12}px; padding: 16px; background-color: #ffffff; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
                      ${badge ? `<span style="display: inline-block; background-color: #f43f5e; color: #ffffff; font-size: 10px; font-weight: 800; padding: 3px 8px; border-radius: 4px; margin-bottom: 12px; text-transform: uppercase; letter-spacing: 0.5px;">${badge}</span>` : ''}
                      <img src="${src}" alt="${alt}" style="width: 100%; max-height: 180px; object-fit: cover; border-radius: 8px; margin-bottom: 12px;" />
                      <h3 style="margin: 0 0 6px 0; font-family: ${fontValue}; font-size: 15px; font-weight: bold; color: #1e293b; line-height: 1.3;">${replaceVariables(block.content || 'Product Name', template.variables)}</h3>
                      <p style="margin: 0 0 12px 0; font-family: ${fontValue}; font-size: 16px; font-weight: 800; color: #2563eb;">${price}</p>
                      <a href="${href}" target="_blank" style="display: inline-block; background-color: #2563eb; color: #ffffff; padding: 8px 16px; border-radius: 6px; text-decoration: none; font-size: 13px; font-weight: bold; width: 80%; text-align: center;">Buy Now</a>
                    </div>
        `;
        break;
      }

      case 'quote': {
        const quoteText = replaceVariables(block.content || 'Quotable text goes here', template.variables);
        const author = block.properties?.author;

        blockHtml += `
                    <div style="border-left: 4px solid #2563eb; padding: 8px 0 8px 20px; margin: 12px 0;">
                      <p style="margin: 0 0 8px 0; font-family: ${fontValue}; font-size: 18px; font-style: italic; color: #334155; line-height: 1.5;">"${quoteText}"</p>
                      ${author ? `<cite style="font-family: ${fontValue}; font-size: 13px; font-weight: bold; color: #64748b; font-style: normal; display: block;">— ${author}</cite>` : ''}
                    </div>
        `;
        break;
      }

      case 'navbar': {
        const logo = replaceVariables(block.content || 'Brand Logo', template.variables);
        const navLinks = block.properties?.socialLinks || [];

        blockHtml += `
                    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="border-bottom: 1px solid #f1f5f9; padding-bottom: 15px; margin-bottom: 15px;">
                      <tr>
                        <td align="left" style="font-family: ${fontValue}; font-size: 18px; font-weight: 800; color: #0f172a;">
                          ${logo}
                        </td>
                        <td align="right" style="font-family: ${fontValue}; font-size: 14px;">
                          ${navLinks.map(link => `
                          <a href="${link.url}" target="_blank" style="margin-left: 16px; color: #475569; text-decoration: none; font-weight: 600;">${link.platform}</a>
                          `).join('')}
                        </td>
                      </tr>
                    </table>
        `;
        break;
      }

      case 'htmlEmbed': {
        blockHtml += `
                    <div style="font-family: ${fontValue};">${block.content || '<!-- Raw HTML Embed -->'}</div>
        `;
        break;
      }

      case 'countdown': {
        const cDate = block.properties?.countdownDate || 'December 31, 2026';
        blockHtml += `
                    <div style="text-align: center; background-color: #0f172a; color: #ffffff; padding: 24px; border-radius: 12px; font-family: ${fontValue}; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">
                      <p style="margin: 0 0 14px 0; font-size: 13px; text-transform: uppercase; letter-spacing: 1.5px; font-weight: bold; color: #38bdf8;">🔥 Limited Time Offer! Ends Soon</p>
                      <table align="center" border="0" cellpadding="0" cellspacing="0">
                        <tr>
                          <td align="center" style="padding: 0 10px;">
                            <div style="background-color: #1e293b; color: #ffffff; padding: 12px 16px; border-radius: 8px; font-size: 26px; font-weight: 800;">02</div>
                            <div style="font-size: 10px; margin-top: 6px; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px;">Days</div>
                          </td>
                          <td align="center" style="padding: 0 10px;">
                            <div style="background-color: #1e293b; color: #ffffff; padding: 12px 16px; border-radius: 8px; font-size: 26px; font-weight: 800;">14</div>
                            <div style="font-size: 10px; margin-top: 6px; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px;">Hours</div>
                          </td>
                          <td align="center" style="padding: 0 10px;">
                            <div style="background-color: #1e293b; color: #ffffff; padding: 12px 16px; border-radius: 8px; font-size: 26px; font-weight: 800;">35</div>
                            <div style="font-size: 10px; margin-top: 6px; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px;">Mins</div>
                          </td>
                          <td align="center" style="padding: 0 10px;">
                            <div style="background-color: #1e293b; color: #ffffff; padding: 12px 16px; border-radius: 8px; font-size: 26px; font-weight: 800;">59</div>
                            <div style="font-size: 10px; margin-top: 6px; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px;">Secs</div>
                          </td>
                        </tr>
                      </table>
                      <p style="margin: 14px 0 0 0; font-size: 11px; color: #64748b;">Target: ${cDate}</p>
                    </div>
        `;
        break;
      }

      default:
        break;
    }

    blockHtml += `
                  </td>
                </tr>
              </table>
    `;
    return blockHtml;
  };

  let html = `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${replaceVariables(subject || 'Email Newsletter', template.variables)}</title>
  <style type="text/css">
    /* Reset styles for email clients */
    body {
      margin: 0;
      padding: 0;
      width: 100% !important;
      -webkit-text-size-adjust: 100%;
      -ms-text-size-adjust: 100%;
      background-color: ${backgroundColor};
    }
    table {
      border-collapse: collapse;
      mso-table-lspace: 0pt;
      mso-table-rspace: 0pt;
    }
    td {
      font-family: ${fontValue};
    }
    img {
      border: 0;
      height: auto;
      line-height: 100%;
      outline: none;
      text-decoration: none;
      display: block;
    }
    a {
      text-decoration: underline;
    }
    
    /* Responsive styles */
    @media only screen and (max-width: 600px) {
      .content-table {
        width: 100% !important;
      }
      .responsive-img {
        width: 100% !important;
        height: auto !important;
      }
      .col-stack {
        display: block !important;
        width: 100% !important;
        box-sizing: border-box;
      }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: ${backgroundColor}; width: 100% !important;">
  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: ${backgroundColor}; table-layout: fixed;">
    <tr>
      <td align="center" valign="top" style="padding: 20px 0;">
        <!-- Email Container -->
        <table border="0" cellpadding="0" cellspacing="0" class="content-table" width="${contentWidth}" style="background-color: ${contentBg}; border-radius: ${borderRadius}px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);">
          <tr>
            <td valign="top">
`;

  blocks.forEach((block) => {
    html += renderBlockHTML(block);
  });

  html += `
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  return html;
}
