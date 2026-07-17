import { EmailTemplate } from '../types';

export interface EmailMetrics {
  characterCount: number;
  wordCount: number;
  imageCount: number;
  readingTimeStr: string;
}

/**
 * Strips HTML tags from a string to get plain text.
 */
function stripHtml(html: string): string {
  if (!html) return '';
  return html.replace(/<[^>]*>/g, ' ');
}

export function calculateMetrics(template: EmailTemplate): EmailMetrics {
  let characterCount = 0;
  let wordCount = 0;
  let imageCount = 0;

  template.blocks.forEach((block) => {
    if (block.type === 'image') {
      imageCount++;
    }

    // Process text content
    if (block.content && ['text', 'header', 'footer', 'button'].includes(block.type)) {
      const plainText = stripHtml(block.content).trim();
      if (plainText) {
        characterCount += plainText.length;
        
        // Count words: split by whitespace and filter out empty strings
        const words = plainText.split(/\s+/).filter(word => word.length > 0);
        wordCount += words.length;
      }
    }
  });

  // Calculate estimated reading time assuming 200 words per minute
  let readingTimeStr = '0 sec';
  if (wordCount > 0) {
    const readingTimeSeconds = Math.round((wordCount / 200) * 60);
    if (readingTimeSeconds < 60) {
      readingTimeStr = `${Math.max(5, readingTimeSeconds)} sec`;
    } else {
      const mins = Math.ceil(readingTimeSeconds / 60);
      readingTimeStr = `${mins} min${mins > 1 ? 's' : ''}`;
    }
  }

  return {
    characterCount,
    wordCount,
    imageCount,
    readingTimeStr,
  };
}
