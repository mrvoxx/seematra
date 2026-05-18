// lib/validations.ts – Zod schemas for API input validation
import { z } from 'zod';
import { ITINERARY_GENRES } from '@/types';

// ─── Auth ─────────────────────────────────────────────────────────────────────

export const RegisterSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit Indian mobile number').optional().or(z.literal('')),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const LoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

// ─── Roadmap Point ────────────────────────────────────────────────────────────

export const RoadmapPointSchema = z.object({
  day: z.number().int().positive(),
  locationName: z.string().min(1, 'Location name is required'),
  coords: z.object({
    lat: z.number(),
    lng: z.number(),
  }),
  image: z.string().optional().or(z.literal('')),
  overview: z.string().min(1, 'Overview is required'),
  nightStay: z
    .object({
      image: z.string().optional().or(z.literal('')),
      description: z.string().min(1),
    })
    .optional(),
});

// ─── Vehicle ──────────────────────────────────────────────────────────────────

export const VehicleSchema = z.object({
  name: z.string().min(1),
  image: z.string().optional().or(z.literal('')),
  capacity: z.number().int().positive().optional(),
});

// ─── Pricing Tier ─────────────────────────────────────────────────────────────

export const PricingTierSchema = z.object({
  persons: z.union([z.literal(1), z.literal(2), z.literal(4), z.literal(6)]),
  totalPrice: z.number().min(0, 'Price must be positive'),
  vehicle: z.string().optional().or(z.literal('')),
});

// ─── Hotel ────────────────────────────────────────────────────────────────────

export const HotelSchema = z.object({
  name: z.string().min(1, 'Hotel name is required'),
  rating: z.string().min(1, 'Rating is required (e.g. 4 Star, Best Value)'),
  images: z.array(z.string()).default([]),
  description: z.string().optional(),
  contactNumber: z.string().optional(),
});

// ─── Itinerary ────────────────────────────────────────────────────────────────

export const ItinerarySchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  duration: z.string().min(1, 'Duration is required'),
  tags: z.array(z.string()).min(1, 'At least one tag is required'),
  genres: z
    .array(z.enum(ITINERARY_GENRES))
    .min(1, 'At least one genre is required'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  price: z.number().positive('Price must be positive'),
  thumbnail: z.string().min(1, 'Thumbnail is required'),
  video: z.string().optional().or(z.literal('')),
  vehicles: z.array(VehicleSchema).default([]),
  inclusions: z.array(z.string()).default([]),
  exclusions: z.array(z.string()).default([]),
  pricingTiers: z.array(PricingTierSchema).default([]),
  hotels: z.array(HotelSchema).default([]),
  roadmap: z.array(RoadmapPointSchema).min(1, 'At least one roadmap point required'),
  mapCoords: z
    .object({ lat: z.number(), lng: z.number() })
    .optional(),
  isRecommended: z.boolean().default(false),
  active: z.boolean().default(true),
});

export const ItineraryUpdateSchema = ItinerarySchema.partial();

// ─── Blog ─────────────────────────────────────────────────────────────────────

export const BlogSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  slug: z.string().min(3).regex(/^[a-z0-9-]+$/, 'Slug must be URL-safe'),
  content: z.string().min(10, 'Content is required'),
  thumbnail: z.string().min(1, 'Thumbnail is required'),
  tags: z.array(z.string()).default([]),
  author: z.string().default('Seematra Team'),
  isRecommended: z.boolean().default(false),
  videoUrl: z.string().optional().or(z.literal('')),
  relatedItinerary: z.string().optional().or(z.literal('')).or(z.null()),
});

export const BlogUpdateSchema = BlogSchema.partial();

// ─── Booking ──────────────────────────────────────────────────────────────────

export const BookingSchema = z.object({
  itineraryId: z.string().min(1, 'Itinerary ID is required'),
  paymentType: z.enum(['online', 'direct']),
  pickupPoint: z.string().min(2, 'Pickup point is required'),
  contactPhone: z.string().min(10, 'Valid contact number is required'),
  tourDate: z.string().min(1, 'Tour date is required'),
  groupSize: z.union([z.literal(1), z.literal(2), z.literal(4), z.literal(6)]),
});

// ─── Payment Verify ───────────────────────────────────────────────────────────

export const PaymentVerifySchema = z.object({
  razorpay_order_id: z.string().min(1),
  razorpay_payment_id: z.string().min(1),
  razorpay_signature: z.string().min(1),
  bookingId: z.string().min(1),
});

// ─── Review ───────────────────────────────────────────────────────────────────

export const ReviewSchema = z.object({
  itineraryId: z.string().min(1, 'Itinerary ID is required'),
  rating: z.number().int().min(1).max(5),
  title: z.string().min(3, 'Title too short').max(100, 'Title too long'),
  comment: z.string().min(10, 'Comment too short').max(1000, 'Comment too long'),
  images: z.array(z.string().url()).optional().default([]),
  tripDate: z.string().datetime().optional(),
});

export const HelpfulVoteSchema = z.object({
  reviewId: z.string().min(1, 'Review ID is required'),
});

