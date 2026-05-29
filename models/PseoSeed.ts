// models/PseoSeed.ts — MongoDB model for pSEO seed data (circuits, destinations, activities, entities)
import mongoose, { Schema, Document, Model } from 'mongoose';

// ─── Generic Seed Document ────────────────────────────────────────────────────
// All seed types share one collection with a `seed_type` discriminator.

export interface PseoSeedDocument extends Document {
  seed_type: 'circuit' | 'destination' | 'activity' | 'entity' | 'intent_template';
  slug: string;
  name: string;
  data: Record<string, unknown>;
  circuit?: string;
  updated_at: Date;
}

const PseoSeedSchema = new Schema<PseoSeedDocument>(
  {
    seed_type: {
      type: String,
      enum: ['circuit', 'destination', 'activity', 'entity', 'intent_template'],
      required: true,
    },
    slug: { type: String, required: true, trim: true },
    name: { type: String, required: true, trim: true },
    data: { type: Schema.Types.Mixed, required: true },
    circuit: { type: String, trim: true },
    updated_at: { type: Date, default: Date.now },
  },
  {
    timestamps: false,
    collection: 'pseo_seeds',
  },
);

// ─── Indexes ──────────────────────────────────────────────────────────────────

// Unique per seed_type + slug combination
PseoSeedSchema.index({ seed_type: 1, slug: 1 }, { unique: true });

// Filter by type
PseoSeedSchema.index({ seed_type: 1 });

// Filter by circuit (for circuit-scoped seeds)
PseoSeedSchema.index({ circuit: 1, seed_type: 1 });

// ─── Model ────────────────────────────────────────────────────────────────────

const PseoSeed: Model<PseoSeedDocument> =
  mongoose.models.PseoSeed ??
  mongoose.model<PseoSeedDocument>('PseoSeed', PseoSeedSchema);

export default PseoSeed;
