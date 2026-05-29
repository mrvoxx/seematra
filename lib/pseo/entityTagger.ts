// lib/pseo/entityTagger.ts — Entity tagging engine for pSEO pages
import type { EntityTag, EntitySeed, PseoPageContent } from './types';

/**
 * Tag a page with entities found in its content.
 * Scans content text fields for known entity names and returns matching tags.
 */
export function tagEntities(
  content: PseoPageContent,
  circuit: string,
  knownEntities: EntitySeed[],
): EntityTag[] {
  const tags: EntityTag[] = [];
  const seen = new Set<string>();

  // Collect all text from content for scanning
  const textBlob = extractText(content).toLowerCase();

  for (const entity of knownEntities) {
    if (seen.has(entity.slug)) continue;

    const entityName = entity.name.toLowerCase();
    // Check if entity name appears in content
    if (textBlob.includes(entityName)) {
      tags.push({
        type: entity.type,
        name: entity.name,
        slug: entity.slug,
        circuit: entity.circuit || circuit,
      });
      seen.add(entity.slug);
    }
  }

  // Also tag based on circuit relationship
  const circuitEntities = knownEntities.filter(
    e => e.circuit === circuit && !seen.has(e.slug)
  );
  for (const entity of circuitEntities.slice(0, 5)) {
    tags.push({
      type: entity.type,
      name: entity.name,
      slug: entity.slug,
      circuit: entity.circuit,
    });
    seen.add(entity.slug);
  }

  return tags;
}

/**
 * Extract all text content from a page content object for entity scanning.
 */
function extractText(content: PseoPageContent): string {
  const parts: string[] = [];

  // Recursively extract string values from content
  function walk(obj: unknown) {
    if (typeof obj === 'string') {
      parts.push(obj);
    } else if (Array.isArray(obj)) {
      for (const item of obj) walk(item);
    } else if (obj && typeof obj === 'object') {
      for (const value of Object.values(obj)) walk(value);
    }
  }

  walk(content);
  return parts.join(' ');
}

/**
 * Merge entity tags, deduplicating by slug.
 */
export function mergeEntityTags(...tagSets: EntityTag[][]): EntityTag[] {
  const seen = new Set<string>();
  const merged: EntityTag[] = [];

  for (const tags of tagSets) {
    for (const tag of tags) {
      if (!seen.has(tag.slug)) {
        merged.push(tag);
        seen.add(tag.slug);
      }
    }
  }

  return merged;
}
