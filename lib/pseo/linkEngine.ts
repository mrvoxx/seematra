// lib/pseo/linkEngine.ts — Weighted internal linking engine
import type { WeightedLink, PseoPage, LinkWeight, LinkRelationship } from './types';

const WEIGHT_ORDER: Record<LinkWeight, number> = { high: 0, medium: 1, low: 2 };

/**
 * Generate weighted internal links for a page based on its relationships.
 * Rules:
 * - Same circuit parent/child = high
 * - Same circuit sibling (same page_type) = medium
 * - Same persona cross-circuit = medium
 * - Cross circuit = low
 * - Entity-shared = medium
 */
export function generateWeightedLinks(
  page: PseoPage,
  allPages: PseoPage[],
  maxLinks: number = 15,
): WeightedLink[] {
  const links: WeightedLink[] = [];
  const seen = new Set<string>();
  seen.add(page.slug); // don't link to self

  for (const candidate of allPages) {
    if (seen.has(candidate.slug)) continue;

    const rel = determineRelationship(page, candidate);
    if (!rel) continue;

    const weight = determineWeight(page, candidate, rel);

    links.push({
      slug: candidate.slug,
      title: candidate.title,
      weight,
      relationship: rel,
    });
    seen.add(candidate.slug);
  }

  // Sort by weight (high first), then limit
  links.sort((a, b) => WEIGHT_ORDER[a.weight] - WEIGHT_ORDER[b.weight]);
  return links.slice(0, maxLinks);
}

/**
 * Generate related pages (subset of internal links focused on "related reading").
 */
export function generateRelatedPages(
  page: PseoPage,
  allPages: PseoPage[],
  maxRelated: number = 6,
): WeightedLink[] {
  const candidates: WeightedLink[] = [];
  const seen = new Set<string>();
  seen.add(page.slug);

  for (const candidate of allPages) {
    if (seen.has(candidate.slug)) continue;
    if (candidate.status !== 'published') continue;

    // Related = same circuit + different page type, OR same page type + different circuit
    const sameCircuit = candidate.circuit === page.circuit;
    const sameType = candidate.page_type === page.page_type;

    if (sameCircuit && !sameType) {
      candidates.push({
        slug: candidate.slug,
        title: candidate.title,
        weight: 'high',
        relationship: 'sibling',
      });
    } else if (!sameCircuit && sameType) {
      candidates.push({
        slug: candidate.slug,
        title: candidate.title,
        weight: 'low',
        relationship: 'cross',
      });
    } else if (sameCircuit && sameType && candidate.slug !== page.slug) {
      candidates.push({
        slug: candidate.slug,
        title: candidate.title,
        weight: 'medium',
        relationship: 'sibling',
      });
    }

    seen.add(candidate.slug);
  }

  candidates.sort((a, b) => WEIGHT_ORDER[a.weight] - WEIGHT_ORDER[b.weight]);
  return candidates.slice(0, maxRelated);
}

function determineRelationship(page: PseoPage, candidate: PseoPage): LinkRelationship | null {
  const sameCircuit = page.circuit === candidate.circuit;

  // Parent: circuit_hub is parent to everything in that circuit
  if (sameCircuit && candidate.page_type === 'circuit_hub' && page.page_type !== 'circuit_hub') {
    return 'parent';
  }

  // Child: anything in the circuit where current page is the hub
  if (sameCircuit && page.page_type === 'circuit_hub' && candidate.page_type !== 'circuit_hub') {
    return 'child';
  }

  // Sibling: same circuit, different page
  if (sameCircuit) {
    return 'sibling';
  }

  // Cross: different circuit
  return 'cross';
}

function determineWeight(page: PseoPage, candidate: PseoPage, relationship: LinkRelationship): LinkWeight {
  // Parent/child always high
  if (relationship === 'parent' || relationship === 'child') {
    return 'high';
  }

  // Same circuit sibling
  if (relationship === 'sibling') {
    // Same entity overlap = high
    const pageEntities = new Set(page.entity_tags.map(e => e.slug));
    const candidateEntities = candidate.entity_tags.map(e => e.slug);
    const overlap = candidateEntities.filter(e => pageEntities.has(e)).length;

    if (overlap >= 2) return 'high';
    if (overlap >= 1) return 'medium';
    return 'medium';
  }

  // Cross circuit
  return 'low';
}
