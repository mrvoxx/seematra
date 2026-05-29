// lib/pseo/ctrOptimizer.ts — CTR optimization for titles and meta descriptions

const CURRENT_YEAR = new Date().getFullYear();

/**
 * Validate and optimize title for CTR.
 * Rules: Must include number OR intent keyword + outcome promise.
 */
export function validateTitle(title: string): { valid: boolean; issues: string[] } {
  const issues: string[] = [];

  if (title.length < 30) issues.push('Title too short (min 30 chars)');
  if (title.length > 70) issues.push('Title too long (max 70 chars for SERP display)');

  // Check for numbers (durations, lists, years)
  const hasNumber = /\d/.test(title);
  if (!hasNumber) issues.push('Title should include a number (duration, year, or list count)');

  // Check for outcome promise words
  const outcomeWords = ['guide', 'itinerary', 'plan', 'tips', 'things', 'places', 'best', 'complete', 'ultimate', 'top'];
  const hasOutcome = outcomeWords.some(w => title.toLowerCase().includes(w));
  if (!hasOutcome) issues.push('Title should include an outcome promise (guide, itinerary, plan, tips, etc.)');

  return { valid: issues.length === 0, issues };
}

/**
 * Validate meta description for CTR.
 * Rules: Must include cost/duration + emotion + destination clarity.
 */
export function validateMetaDescription(meta: string): { valid: boolean; issues: string[] } {
  const issues: string[] = [];

  if (meta.length < 80) issues.push('Meta description too short (min 80 chars)');
  if (meta.length > 160) issues.push('Meta description too long (max 160 chars for SERP display)');

  return { valid: issues.length === 0, issues };
}

/**
 * Inject current year into title/meta patterns.
 */
export function injectYear(text: string): string {
  return text.replace(/\{Year\}/g, String(CURRENT_YEAR));
}

/**
 * Generate a CTR-optimized title from a pattern.
 */
export function buildTitle(pattern: string, replacements: Record<string, string>): string {
  let title = injectYear(pattern);
  for (const [key, value] of Object.entries(replacements)) {
    title = title.replace(new RegExp(`\\{${key}\\}`, 'gi'), value);
  }
  return title;
}

/**
 * Generate a CTR-optimized meta description from a pattern.
 */
export function buildMetaDescription(pattern: string, replacements: Record<string, string>): string {
  let meta = injectYear(pattern);
  for (const [key, value] of Object.entries(replacements)) {
    meta = meta.replace(new RegExp(`\\{${key}\\}`, 'gi'), value);
  }
  // Truncate to 160 chars if needed
  if (meta.length > 160) {
    meta = meta.slice(0, 157) + '...';
  }
  return meta;
}

/**
 * Generate a URL-safe slug from a pattern.
 */
export function buildSlug(pattern: string, replacements: Record<string, string>): string {
  let slug = pattern;
  for (const [key, value] of Object.entries(replacements)) {
    slug = slug.replace(new RegExp(`\\{${key}\\}`, 'gi'), value);
  }
  return slug
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * Title case a destination/circuit name.
 */
export function titleCase(str: string): string {
  return str
    .split(/[-_]/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
