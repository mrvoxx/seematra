export function stripHtml(html: string): string {
  if (!html) return '';
  return html
    // Remove style blocks (even with weird spacing in closing tags)
    .replace(/<style[^>]*>[\s\S]*?<\/\s*style\s*>/gi, '')
    // Remove script blocks
    .replace(/<script[^>]*>[\s\S]*?<\/\s*script\s*>/gi, '')
    // Remove all HTML tags
    .replace(/<[^>]*>/gm, '')
    // Remove HTML entities like &nbsp;
    .replace(/&[a-z0-9#]+;/gi, ' ')
    // Replace multiple spaces/newlines with a single space
    .replace(/\s+/g, ' ')
    .trim();
}
