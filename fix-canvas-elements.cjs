const fs = require('fs');
let code = fs.readFileSync('src/components/Canvas.tsx', 'utf8');

const anchorRegex = /\{block\.type === 'html' && \([\s\S]*?\}\)/;

const newElements = `{block.type === 'shape' && (
                          <div className={\`flex justify-\${block.style.textAlign === 'center' ? 'center' : block.style.textAlign === 'right' ? 'end' : 'start'}\`}>
                            <div 
                              style={{ 
                                width: block.props?.width || '100px', 
                                height: block.props?.height || '100px',
                                backgroundColor: block.props?.fillColor || '#3b82f6',
                                borderRadius: block.props?.shapeType === 'circle' ? '50%' : (block.props?.shapeType === 'blob' ? '30% 70% 70% 30% / 30% 30% 70% 70%' : '0')
                              }}
                            />
                          </div>
                        )}
                        {block.type === 'line' && (
                          <div style={{ padding: '10px 0' }}>
                            <div 
                              style={{ 
                                width: '100%', 
                                height: block.props?.thickness || '1px',
                                backgroundColor: block.props?.color || '#e2e8f0',
                                borderTop: block.props?.lineStyle === 'dashed' ? \`\${block.props?.thickness || '1px'} dashed \${block.props?.color || '#e2e8f0'}\` : 
                                          (block.props?.lineStyle === 'dotted' ? \`\${block.props?.thickness || '1px'} dotted \${block.props?.color || '#e2e8f0'}\` : 'none')
                              }}
                            />
                          </div>
                        )}
                        {block.type === 'icon' && (
                          <div className={\`flex justify-\${block.style.textAlign === 'center' ? 'center' : block.style.textAlign === 'right' ? 'end' : 'start'} text-[\${block.props?.fillColor || '#f59e0b'}]\`}>
                            <div style={{ width: block.props?.width || '40px', height: block.props?.width || '40px', color: block.props?.fillColor || '#f59e0b' }}>
                              <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                            </div>
                          </div>
                        )}
                        $&`;

code = code.replace(anchorRegex, newElements);
fs.writeFileSync('src/components/Canvas.tsx', code);
