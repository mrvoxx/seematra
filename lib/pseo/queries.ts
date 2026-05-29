// lib/pseo/queries.ts — Server-side query helpers for pSEO pages
import { connectDB } from '@/lib/mongodb';
import PseoPage from '@/models/PseoPage';
import type { PseoPageDocument } from '@/models/PseoPage';
import type { PseoPageType } from './types';

/**
 * Get a single page by its slug.
 */
export async function getPageBySlug(slug: string): Promise<PseoPageDocument | null> {
  await connectDB();
  return PseoPage.findOne({ slug, status: 'published' }).lean<PseoPageDocument>();
}

/**
 * Batch fetch pages by their slugs (for internal linking sections).
 */
export async function getRelatedPagesBySlug(
  slugs: string[],
  limit: number = 10,
): Promise<PseoPageDocument[]> {
  if (!slugs.length) return [];
  await connectDB();
  return PseoPage.find({ slug: { $in: slugs }, status: 'published' })
    .select('slug title page_type circuit seo.title content.type')
    .limit(limit)
    .lean<PseoPageDocument[]>();
}

/**
 * Get all pages within a circuit silo.
 */
export async function getCircuitPages(
  circuit: string,
  type?: PseoPageType,
  limit: number = 50,
): Promise<PseoPageDocument[]> {
  await connectDB();
  const query: Record<string, unknown> = { circuit, status: 'published' };
  if (type) query.page_type = type;
  return PseoPage.find(query)
    .select('slug title page_type circuit seo.title')
    .limit(limit)
    .lean<PseoPageDocument[]>();
}

/**
 * Get pages by type across all circuits.
 */
export async function getPagesByType(
  type: PseoPageType,
  limit: number = 50,
): Promise<PseoPageDocument[]> {
  await connectDB();
  return PseoPage.find({ page_type: type, status: 'published' })
    .select('slug title circuit seo.title seo.meta_description')
    .limit(limit)
    .lean<PseoPageDocument[]>();
}

/**
 * Find pages containing a specific entity.
 */
export async function getPagesByEntity(
  entitySlug: string,
  limit: number = 20,
): Promise<PseoPageDocument[]> {
  await connectDB();
  return PseoPage.find({ 'entity_tags.slug': entitySlug, status: 'published' })
    .select('slug title page_type circuit')
    .limit(limit)
    .lean<PseoPageDocument[]>();
}

/**
 * Get all intent pages for a circuit.
 */
export async function getIntentPages(
  circuit: string,
  limit: number = 20,
): Promise<PseoPageDocument[]> {
  await connectDB();
  return PseoPage.find({ circuit, page_type: 'intent', status: 'published' })
    .select('slug title seo.title seo.target_intent')
    .limit(limit)
    .lean<PseoPageDocument[]>();
}

/**
 * Get all published page slugs for sitemap generation.
 */
export async function getAllPublishedSlugs(): Promise<{ slug: string; page_type: string; updated_at: Date }[]> {
  await connectDB();
  return PseoPage.find({ status: 'published' })
    .select('slug page_type updated_at')
    .lean();
}

/**
 * Get page stats (counts by type).
 */
export async function getPageStats(): Promise<Record<string, number>> {
  await connectDB();
  const result = await PseoPage.aggregate([
    { $match: { status: 'published' } },
    { $group: { _id: '$page_type', count: { $sum: 1 } } },
  ]);
  const stats: Record<string, number> = {};
  for (const r of result) {
    stats[r._id] = r.count;
  }
  return stats;
}
