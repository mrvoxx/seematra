// models/PseoPage.ts — MongoDB model for generated pSEO pages
import mongoose, { Schema, Document, Model } from 'mongoose';
import { PSEO_PAGE_TYPES, ENTITY_TYPES, LINK_WEIGHTS, LINK_RELATIONSHIPS } from '@/types/pseo';

export interface PseoPageDocument extends Document {
  slug: string;
  page_type: string;
  status: 'draft' | 'published' | 'archived';
  circuit: string;
  title: string;
  content: Record<string, unknown>;
  seo: {
    title: string;
    meta_description: string;
    primary_keyword: string;
    secondary_keywords: string[];
    target_intent: string;
  };
  internal_links: {
    slug: string;
    title: string;
    weight: string;
    relationship: string;
  }[];
  related_pages: {
    slug: string;
    title: string;
    weight: string;
    relationship: string;
  }[];
  faq: { question: string; answer: string }[];
  entity_tags: {
    type: string;
    name: string;
    slug: string;
    circuit?: string;
  }[];
  schema_markup: Record<string, unknown>;
  generated_at: Date;
  updated_at: Date;
  word_count: number;
  content_hash: string;
}

// ─── Sub-Schemas ──────────────────────────────────────────────────────────────

const WeightedLinkSchema = new Schema(
  {
    slug: { type: String, required: true },
    title: { type: String, required: true },
    weight: { type: String, enum: LINK_WEIGHTS, required: true },
    relationship: { type: String, enum: LINK_RELATIONSHIPS, required: true },
  },
  { _id: false },
);

const FaqSchema = new Schema(
  {
    question: { type: String, required: true },
    answer: { type: String, required: true },
  },
  { _id: false },
);

const EntityTagSchema = new Schema(
  {
    type: { type: String, enum: ENTITY_TYPES, required: true },
    name: { type: String, required: true },
    slug: { type: String, required: true },
    circuit: { type: String },
  },
  { _id: false },
);

const SeoSchema = new Schema(
  {
    title: { type: String, required: true },
    meta_description: { type: String, required: true },
    primary_keyword: { type: String, required: true },
    secondary_keywords: [{ type: String }],
    target_intent: { type: String, default: '' },
  },
  { _id: false },
);

// ─── Main Schema ──────────────────────────────────────────────────────────────

const PseoPageSchema = new Schema<PseoPageDocument>(
  {
    slug: { type: String, required: true, unique: true, trim: true },
    page_type: { type: String, enum: PSEO_PAGE_TYPES, required: true },
    status: { type: String, enum: ['draft', 'published', 'archived'], default: 'published' },
    circuit: { type: String, required: true, trim: true },
    title: { type: String, required: true, trim: true },
    content: { type: Schema.Types.Mixed, required: true },
    seo: { type: SeoSchema, required: true },
    internal_links: [WeightedLinkSchema],
    related_pages: [WeightedLinkSchema],
    faq: [FaqSchema],
    entity_tags: [EntityTagSchema],
    schema_markup: { type: Schema.Types.Mixed, default: {} },
    generated_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now },
    word_count: { type: Number, required: true, min: 0 },
    content_hash: { type: String, required: true },
  },
  {
    timestamps: false, // We manage generated_at and updated_at manually
    collection: 'pseo_pages',
  },
);

// ─── Indexes ──────────────────────────────────────────────────────────────────

// Primary lookup by slug (unique)
PseoPageSchema.index({ slug: 1 }, { unique: true });

// Filter by page type and status
PseoPageSchema.index({ page_type: 1, status: 1 });

// Dedup checking by primary keyword
PseoPageSchema.index({ 'seo.primary_keyword': 1 });

// Intent dedup — no two pages target the same search query
PseoPageSchema.index({ 'seo.target_intent': 1 });

// Circuit-scoped queries (all pages for a circuit silo)
PseoPageSchema.index({ circuit: 1, page_type: 1 });

// Entity graph queries (find pages by entity)
PseoPageSchema.index({ 'entity_tags.slug': 1 });

// Chronological listing
PseoPageSchema.index({ generated_at: -1 });

// Similarity detection
PseoPageSchema.index({ content_hash: 1 });

// ─── Model ────────────────────────────────────────────────────────────────────

const PseoPage: Model<PseoPageDocument> =
  mongoose.models.PseoPage ??
  mongoose.model<PseoPageDocument>('PseoPage', PseoPageSchema);

export default PseoPage;
