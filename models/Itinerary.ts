// models/Itinerary.ts
import mongoose, { Schema, Document, Model } from 'mongoose';
import { ITINERARY_GENRES } from '@/types';

export interface IVehicle {
  name: string;
  image?: string;
  capacity?: number;
}

export interface IPricingTier {
  persons: 1 | 2 | 4 | 6;
  totalPrice: number;
  vehicle?: string;
  hotelIndex?: number;
}

export interface IRoadmapPoint {
  day: number;
  locationName: string;
  coords: { lat: number; lng: number };
  image: string;
  overview: string;
  nightStay?: { image: string; description: string };
}

export interface ItineraryDocument extends Document {
  title: string;
  duration: string;
  tags: string[];
  genres: string[];
  description: string;
  price: number;
  thumbnail: string;
  video?: string;
  vehicles: IVehicle[];
  inclusions: string[];
  exclusions: string[];
  pricingTiers: IPricingTier[];
  hotels: any[]; // Using any to avoid repetitive interface duplication since types/index covers it
  roadmap: IRoadmapPoint[];
  mapCoords?: { lat: number; lng: number };
  isRecommended: boolean;
  hasDiscount: boolean;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const RoadmapPointSchema = new Schema(
  {
    day: { type: Number, required: true },
    locationName: { type: String, required: true },
    coords: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
    },
    image: { type: String, required: true },
    overview: { type: String, required: true },
    nightStay: {
      image: String,
      description: String,
    },
  },
  { _id: false },
);

// Using 'name' instead of 'type' to avoid Mongoose reserved keyword conflict
const VehicleSchema = new Schema(
  {
    name: { type: String, required: true },
    image: { type: String },
    capacity: { type: Number },
  },
  { _id: false },
);

const PricingTierSchema = new Schema(
  {
    persons: { type: Number, required: true, enum: [1, 2, 4, 6] },
    totalPrice: { type: Number, required: true, min: 0 },
    vehicle: { type: String },
    hotelIndex: { type: Number, default: 0 },
  },
  { _id: false },
);

const HotelSchema = new Schema(
  {
    name: { type: String, required: true },
    rating: { type: String, required: true },
    images: [{ type: String }],
    contactNumber: { type: String },
  },
  { _id: false },
);

const ItinerarySchema = new Schema<ItineraryDocument>(
  {
    title: { type: String, required: true, trim: true, index: true },
    duration: { type: String, required: true },
    tags: [{ type: String, lowercase: true, trim: true }],
    genres: [{ type: String, enum: ITINERARY_GENRES }],
    description: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    thumbnail: { type: String, required: true },
    video: String,
    vehicles: [VehicleSchema],
    inclusions: [{ type: String }],
    exclusions: [{ type: String }],
    pricingTiers: [PricingTierSchema],
    hotels: [HotelSchema],
    roadmap: [RoadmapPointSchema],
    mapCoords: {
      lat: Number,
      lng: Number,
    },
    isRecommended: { type: Boolean, default: false, index: true },
    hasDiscount: { type: Boolean, default: false },
    active: { type: Boolean, default: true, index: true },
  },
  { timestamps: true },
);

// Text search index
ItinerarySchema.index({ title: 'text', tags: 'text', description: 'text' });

const Itinerary: Model<ItineraryDocument> =
  mongoose.models.Itinerary ??
  mongoose.model<ItineraryDocument>('Itinerary', ItinerarySchema);

export default Itinerary;
