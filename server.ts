import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';

// Load env variables
dotenv.config();

const app = express();
const PORT = 3000;

// Set up server-side Gemini client
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("WARNING: GEMINI_API_KEY environment variable is not defined.");
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });
};

app.use(express.json({ limit: '10mb' }));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', hasApiKey: !!process.env.GEMINI_API_KEY });
});

/**
 * AI API 1: Generate 3 Email Template Layouts from scratch based on user prompt
 * Uses gemini-3.5-flash with gemma fallback
 */
app.post('/api/gemini/generate-templates', async (req, res) => {
  const { prompt } = req.body;
  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required.' });
  }

  const ai = getGeminiClient();
  if (!ai) {
    return res.status(500).json({ 
      error: 'API key is missing. Please add GEMINI_API_KEY to your Secrets in Settings.',
      isMissingKey: true
    });
  }

  const systemInstruction = `You are a world-class professional email design specialist.
Your goal is to generate exactly THREE completely unique, stunning, responsive, and distinct email templates in JSON format based on the user's prompt.
Each option should offer a different visual perspective or style theme (e.g., Option 1: Elegant & Minimalist, Option 2: Bold & Modern, Option 3: Technical or Editorial/Thematic).

Structure requirements:
Each template must contain:
1. "name": A creative descriptive name with an emoji (e.g. "🌞 Summer Kickoff Flyer").
2. "subject": A highly engaging, click-worthy email subject line.
3. "subtitle": A catchy preview subtitle/teaser paragraph text.
4. "globalSettings": Configured with backgroundColor, contentWidth (usually 600), contentBg, fontFamily (e.g., '"Inter", sans-serif', '"Space Grotesk", sans-serif', '"Georgia", serif'), and borderRadius (0 to 24).
5. "blocks": An array of at least 5 to 10 block objects. Each block MUST have:
   - "id": A unique string ID (e.g. "header-1", "text-2").
   - "type": One of: "header", "text", "image", "button", "social", "divider", "spacer", "footer".
   - "content": Text or HTML content. (For "text" and "footer", use clean simple HTML tags like <p>, <strong>, etc.).
   - "style": An object specifying relevant styling (color, backgroundColor, fontSize, fontWeight, textAlign, paddingTop, paddingBottom, paddingLeft, paddingRight, marginTop, marginBottom, lineHeight, borderRadius, borderColor, borderWidth, borderStyle). Use real, elegant hexadecimal colors that match the selected theme.
   - "properties": For "image", include "src" (use relevant high-quality Unsplash URLs such as https://images.unsplash.com/photo-1557804506-669a67965ba0?w=600&auto=format&fit=crop&q=80, etc.), "alt", and "href". For "button", include "href". For "spacer", include "height" (number, e.g. 20). For "social", include "socialLinks" as an array of {platform, url}.

The response MUST be a valid JSON array of exactly 3 templates. Do NOT wrap in markdown code blocks unless forced, and strictly return clean, compilable JSON matching the schema.`;

  const modelsToTry = ['gemini-3.5-flash', 'gemma-2-9b-it', 'gemma-2-2b-it'];
  let lastError: any = null;

  for (const model of modelsToTry) {
    try {
      console.log(`Attempting layout generation with model: ${model}`);
      const response = await ai.models.generateContent({
        model,
        contents: `Create 3 distinct beautiful email template options for this prompt: "${prompt}"`,
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.ARRAY,
            description: "An array of exactly 3 email templates matching the specification",
            items: {
              type: Type.OBJECT,
              required: ['name', 'subject', 'subtitle', 'globalSettings', 'blocks'],
              properties: {
                name: { type: Type.STRING },
                subject: { type: Type.STRING },
                subtitle: { type: Type.STRING },
                globalSettings: {
                  type: Type.OBJECT,
                  required: ['backgroundColor', 'contentWidth', 'contentBg', 'fontFamily', 'borderRadius'],
                  properties: {
                    backgroundColor: { type: Type.STRING },
                    contentWidth: { type: Type.INTEGER },
                    contentBg: { type: Type.STRING },
                    fontFamily: { type: Type.STRING },
                    borderRadius: { type: Type.INTEGER },
                  }
                },
                blocks: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    required: ['id', 'type', 'style'],
                    properties: {
                      id: { type: Type.STRING },
                      type: { type: Type.STRING },
                      content: { type: Type.STRING },
                      style: {
                        type: Type.OBJECT,
                        properties: {
                          color: { type: Type.STRING },
                          backgroundColor: { type: Type.STRING },
                          fontSize: { type: Type.STRING },
                          fontWeight: { type: Type.STRING },
                          textAlign: { type: Type.STRING },
                          paddingTop: { type: Type.INTEGER },
                          paddingBottom: { type: Type.INTEGER },
                          paddingLeft: { type: Type.INTEGER },
                          paddingRight: { type: Type.INTEGER },
                          marginTop: { type: Type.INTEGER },
                          marginBottom: { type: Type.INTEGER },
                          lineHeight: { type: Type.STRING },
                          borderRadius: { type: Type.INTEGER },
                          borderColor: { type: Type.STRING },
                          borderWidth: { type: Type.INTEGER },
                          borderStyle: { type: Type.STRING },
                        }
                      },
                      properties: {
                        type: Type.OBJECT,
                        properties: {
                          src: { type: Type.STRING },
                          alt: { type: Type.STRING },
                          href: { type: Type.STRING },
                          width: { type: Type.STRING },
                          height: { type: Type.INTEGER },
                          socialLinks: {
                            type: Type.ARRAY,
                            items: {
                              type: Type.OBJECT,
                              properties: {
                                platform: { type: Type.STRING },
                                url: { type: Type.STRING }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      });

      const text = response.text;
      if (text) {
        const templates = JSON.parse(text);
        return res.json({ templates });
      }
    } catch (err: any) {
      console.error(`Error with model ${model}:`, err.message || err);
      lastError = err;
    }
  }

  // Fallback if both models fail
  return res.status(500).json({
    error: 'AI Generation failed. This usually happens if the API key is invalid or rate limited.',
    details: lastError?.message || lastError || 'Unknown error'
  });
});

/**
 * AI API 2: Tweak current template based on a user prompt
 * Returns 3 different tweaked design options of the active template
 */
app.post('/api/gemini/tweak-template', async (req, res) => {
  const { template, prompt } = req.body;
  if (!template || !prompt) {
    return res.status(400).json({ error: 'Template and Prompt are required.' });
  }

  const ai = getGeminiClient();
  if (!ai) {
    return res.status(500).json({ 
      error: 'API key is missing. Please add GEMINI_API_KEY to your Secrets.',
      isMissingKey: true
    });
  }

  const systemInstruction = `You are a world-class email design developer.
Your task is to take the user's CURRENT active email template structure (provided in the prompt) and generate THREE completely unique tweaked options based on their instructions (e.g. "apply dark mode", "make the CTA buttons neon", "add a discount card element").

Requirements:
- Preserve the general content unless asked to change it, but dramatically enhance or tweak styles, layouts, sizes, background colors, and typography to fit the user's prompt.
- Option 1 should apply the request in a subtle, highly elegant and refined manner.
- Option 2 should apply the request in a bold, rich, and high-contrast styling.
- Option 3 should offer a highly creative, themed, or stylized interpretation of the prompt.
- Make sure block IDs remain unique and styles are deeply customized.
- Ensure all blocks are properly populated and compatible with the EmailTemplate schema.

The response MUST be a valid JSON array of exactly 3 modified templates. Do NOT return markdown formatting inside the JSON, strictly return a parsable JSON array.`;

  const modelsToTry = ['gemini-3.5-flash', 'gemma-2-9b-it', 'gemma-2-2b-it'];
  let lastError: any = null;

  for (const model of modelsToTry) {
    try {
      console.log(`Attempting layout tweaking with model: ${model}`);
      const response = await ai.models.generateContent({
        model,
        contents: `Here is the current template:
${JSON.stringify(template, null, 2)}

And here is the tweak request: "${prompt}"

Generate 3 unique modified options based on this current template.`,
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.ARRAY,
            description: "An array of exactly 3 tweaked email templates matching the specification",
            items: {
              type: Type.OBJECT,
              required: ['name', 'subject', 'subtitle', 'globalSettings', 'blocks'],
              properties: {
                name: { type: Type.STRING },
                subject: { type: Type.STRING },
                subtitle: { type: Type.STRING },
                globalSettings: {
                  type: Type.OBJECT,
                  required: ['backgroundColor', 'contentWidth', 'contentBg', 'fontFamily', 'borderRadius'],
                  properties: {
                    backgroundColor: { type: Type.STRING },
                    contentWidth: { type: Type.INTEGER },
                    contentBg: { type: Type.STRING },
                    fontFamily: { type: Type.STRING },
                    borderRadius: { type: Type.INTEGER },
                  }
                },
                blocks: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    required: ['id', 'type', 'style'],
                    properties: {
                      id: { type: Type.STRING },
                      type: { type: Type.STRING },
                      content: { type: Type.STRING },
                      style: {
                        type: Type.OBJECT,
                        properties: {
                          color: { type: Type.STRING },
                          backgroundColor: { type: Type.STRING },
                          fontSize: { type: Type.STRING },
                          fontWeight: { type: Type.STRING },
                          textAlign: { type: Type.STRING },
                          paddingTop: { type: Type.INTEGER },
                          paddingBottom: { type: Type.INTEGER },
                          paddingLeft: { type: Type.INTEGER },
                          paddingRight: { type: Type.INTEGER },
                          marginTop: { type: Type.INTEGER },
                          marginBottom: { type: Type.INTEGER },
                          lineHeight: { type: Type.STRING },
                          borderRadius: { type: Type.INTEGER },
                          borderColor: { type: Type.STRING },
                          borderWidth: { type: Type.INTEGER },
                          borderStyle: { type: Type.STRING },
                        }
                      },
                      properties: {
                        type: Type.OBJECT,
                        properties: {
                          src: { type: Type.STRING },
                          alt: { type: Type.STRING },
                          href: { type: Type.STRING },
                          width: { type: Type.STRING },
                          height: { type: Type.INTEGER },
                          socialLinks: {
                            type: Type.ARRAY,
                            items: {
                              type: Type.OBJECT,
                              properties: {
                                platform: { type: Type.STRING },
                                url: { type: Type.STRING }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      });

      const text = response.text;
      if (text) {
        const templates = JSON.parse(text);
        return res.json({ templates });
      }
    } catch (err: any) {
      console.error(`Tweaking failed with model ${model}:`, err.message || err);
      lastError = err;
    }
  }

  return res.status(500).json({
    error: 'AI Tweaking failed. This usually happens if the API key is invalid or rate limited.',
    details: lastError?.message || lastError || 'Unknown error'
  });
});

/**
 * AI API 3: Suggest copy for headings, paragraphs, and buttons
 * Returns 5 short text variations
 */
app.post('/api/gemini/generate-copy', async (req, res) => {
  const { prompt, blockType, currentText } = req.body;
  if (!prompt || !blockType) {
    return res.status(400).json({ error: 'Prompt and blockType are required.' });
  }

  const ai = getGeminiClient();
  if (!ai) {
    return res.status(500).json({ 
      error: 'API key is missing. Please add GEMINI_API_KEY to your Secrets.',
      isMissingKey: true
    });
  }

  const systemInstruction = `You are a high-converting email copywriter.
Based on the user's prompt and active block type, suggest exactly FIVE distinct copy options that are highly compelling, modern, and direct.
- If the block type is 'header', return 5 short, impactful headlines or email subject lines.
- If the block type is 'text', return 5 paragraphs of engaging body copy. You can include clean HTML tags like <p>, <strong>, etc.
- If the block type is 'button', return 5 extremely active, urgent call-to-action button labels (e.g., "Claim My 20% Off Now ⚡").

Format your response as a valid JSON array of exactly 5 strings. Direct and clean output only.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: `Prompt: "${prompt}"
Active Block Type: "${blockType}"
Current existing text in block (if any): "${currentText || ''}"`,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          description: "An array of exactly 5 suggested copy strings",
          items: { type: Type.STRING }
        }
      }
    });

    const text = response.text;
    if (text) {
      const suggestions = JSON.parse(text);
      return res.json({ suggestions });
    }
  } catch (err: any) {
    console.error('Copy generation error:', err);
    return res.status(500).json({ error: err.message || 'Copy generation failed.' });
  }
});

/**
 * AI API 4: Generate a relevant placeholder image graphic
 * Returns a base64 image or a beautiful high-quality styled Unsplash search URL as fallback
 */
app.post('/api/gemini/generate-image', async (req, res) => {
  const { prompt } = req.body;
  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required.' });
  }

  const ai = getGeminiClient();
  if (!ai) {
    // If no API key is set, use a beautiful Unsplash search category fallback URL
    const keywords = prompt.trim().toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter(Boolean).slice(0, 3);
    const searchWord = keywords.join(',') || 'design';
    const randSig = Math.floor(Math.random() * 1000);
    const fallbackUrl = `https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80&sig=${randSig}&q_term=${encodeURIComponent(searchWord)}`;
    return res.json({ url: fallbackUrl, isFallback: true });
  }

  try {
    console.log(`Generating image for prompt: "${prompt}"`);
    // Call the correct, officially supported Image Generation model
    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-lite-image',
      contents: {
        parts: [
          {
            text: `Create a clean, highly professional, modern graphic or illustration suitable as an email template image banner: "${prompt}". Minimalist aesthetic, beautiful matching colors, high contrast. No text, no frames, pure vector/graphic representation.`,
          },
        ],
      },
      config: {
        imageConfig: {
          aspectRatio: '16:9'
        }
      }
    });

    let base64Image: string | undefined;
    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          base64Image = part.inlineData.data;
          break;
        }
      }
    }

    if (base64Image) {
      const mimeType = 'image/png';
      const dataUrl = `data:${mimeType};base64,${base64Image}`;
      return res.json({ url: dataUrl });
    }

    throw new Error('No image parts returned from Gemini API.');
  } catch (err: any) {
    console.warn('Gemini image generation failed or requires paid tier. Falling back to styled Unsplash photo...', err.message || err);
    
    // Unsplash search fallback based on keywords from the prompt
    const keywords = prompt.trim().toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter(Boolean).slice(0, 3);
    const searchWord = keywords.join(',') || 'graphic';
    const randSig = Math.floor(Math.random() * 1000);
    const fallbackUrl = `https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&auto=format&fit=crop&q=80&sig=${randSig}&query=${encodeURIComponent(searchWord)}`;
    
    return res.json({ url: fallbackUrl, isFallback: true });
  }
});

/**
 * AI API 5: Smart Layout Analyzer & Style Suggestion
 * Uses gemini-3.5-flash to suggest spacing and color enhancements based on template content
 */
app.post('/api/gemini/smart-layout', async (req, res) => {
  const { template } = req.body;
  if (!template) {
    return res.status(400).json({ error: 'Template is required.' });
  }

  const ai = getGeminiClient();
  if (!ai) {
    return res.status(500).json({ 
      error: 'API key is missing. Please add GEMINI_API_KEY to your Secrets.',
      isMissingKey: true
    });
  }

  const systemInstruction = `You are a world-class professional email design strategist and brand aesthetic coordinator.
Your task is to analyze the user's CURRENT active email template (its content, copy language, images, and layout structure) and automatically suggest style-only improvements.
Specifically, you must:
1. Suggest a beautifully unified, cohesive color theme (backgroundColor, contentBg, and block styles like text colors, heading colors, button colors/backgrounds, etc.) that perfectly matches the mood, theme, and purpose of the template's content.
2. Suggest spacing enhancements (vertical margins, block-level paddingTop/paddingBottom/paddingLeft/paddingRight, divider spacing, and container boundaries) to establish a highly polished vertical rhythm, professional spacing, and outstanding readability.

Requirements:
- Preserve the block ids exactly so they can be merged back.
- DO NOT modify or suggest changes to the text content, inner HTML, block types, image source URLs, or URLs of any blocks. Only suggest styling properties.
- Ensure all color selections are high-contrast and fully accessible.
- Return a valid JSON object matching the requested schema.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: `Here is the current template content and layout settings:
${JSON.stringify(template, null, 2)}

Provide color theme and spacing improvements based on this template's contents.`,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          required: ['summaryOfChanges', 'improvedTemplate'],
          properties: {
            summaryOfChanges: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Short bullets describing why these custom color combinations and spacing adjustments are recommended."
            },
            improvedTemplate: {
              type: Type.OBJECT,
              required: ['globalSettings', 'blocks'],
              properties: {
                globalSettings: {
                  type: Type.OBJECT,
                  required: ['backgroundColor', 'contentWidth', 'contentBg', 'fontFamily', 'borderRadius'],
                  properties: {
                    backgroundColor: { type: Type.STRING },
                    contentWidth: { type: Type.INTEGER },
                    contentBg: { type: Type.STRING },
                    fontFamily: { type: Type.STRING },
                    borderRadius: { type: Type.INTEGER }
                  }
                },
                blocks: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    required: ['id', 'type', 'style'],
                    properties: {
                      id: { type: Type.STRING },
                      type: { type: Type.STRING },
                      style: {
                        type: Type.OBJECT,
                        properties: {
                          color: { type: Type.STRING },
                          backgroundColor: { type: Type.STRING },
                          fontSize: { type: Type.STRING },
                          fontWeight: { type: Type.STRING },
                          textAlign: { type: Type.STRING },
                          paddingTop: { type: Type.INTEGER },
                          paddingBottom: { type: Type.INTEGER },
                          paddingLeft: { type: Type.INTEGER },
                          paddingRight: { type: Type.INTEGER },
                          marginTop: { type: Type.INTEGER },
                          marginBottom: { type: Type.INTEGER },
                          lineHeight: { type: Type.STRING },
                          borderRadius: { type: Type.INTEGER },
                          borderColor: { type: Type.STRING },
                          borderWidth: { type: Type.INTEGER },
                          borderStyle: { type: Type.STRING }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });

    const text = response.text;
    if (text) {
      const data = JSON.parse(text);
      return res.json(data);
    }
    throw new Error('Empty response from Gemini API.');
  } catch (err: any) {
    console.error('Smart layout suggestion error:', err);
    return res.status(500).json({ error: err.message || 'Smart layout suggestion failed.' });
  }
});

/**
 * AI API 6: Rewrite text content
 * Uses gemini-3.5-flash to rewrite text based on a given tone or operation
 */
app.post('/api/gemini/rewrite-text', async (req, res) => {
  const { text, operation } = req.body;
  if (!text || !operation) {
    return res.status(400).json({ error: 'Text and operation are required.' });
  }

  const ai = getGeminiClient();
  if (!ai) {
    return res.status(500).json({ 
      error: 'API key is missing. Please add GEMINI_API_KEY to your Secrets.',
      isMissingKey: true
    });
  }

  let prompt = '';
  if (operation === 'professional') {
    prompt = `Rewrite the following text to sound highly professional, polite, and formal. Preserve HTML tags if they exist:\n\n${text}`;
  } else if (operation === 'friendly') {
    prompt = `Rewrite the following text to sound warm, friendly, and approachable. Preserve HTML tags if they exist:\n\n${text}`;
  } else if (operation === 'urgent') {
    prompt = `Rewrite the following text to sound urgent, compelling, and action-oriented. Preserve HTML tags if they exist:\n\n${text}`;
  } else if (operation === 'shorten') {
    prompt = `Shorten the following text significantly while keeping the main point. Make it concise and punchy. Preserve HTML tags if they exist:\n\n${text}`;
  } else if (operation === 'expand') {
    prompt = `Expand the following text by adding more detail, elaboration, and descriptive language. Preserve HTML tags if they exist:\n\n${text}`;
  } else {
    return res.status(400).json({ error: 'Invalid operation.' });
  }

  const systemInstruction = `You are a world-class copywriter. 
Rewrite the text exactly as requested. 
If the input contains HTML tags (like <strong>, <p>, <br>), try to preserve the structure or use appropriate HTML formatting in your response. 
Do NOT wrap your response in markdown blocks or quotes, just output the raw rewritten text.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: 'text/plain',
      }
    });

    const rewrittenText = response.text;
    if (rewrittenText) {
      return res.json({ text: rewrittenText.trim() });
    }
    throw new Error('Empty response from Gemini API.');
  } catch (err: any) {
    console.error('Rewrite text error:', err);
    return res.status(500).json({ error: err.message || 'Rewrite text failed.' });
  }
});

// Vite middleware / Static serving setup
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
