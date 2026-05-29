// types/index.ts – Canonical type definitions for the entire Seematra platform

export type UserRole = 'user' | 'admin';
export type PaymentStatus = 'PENDING' | 'RESERVED' | 'PARTIAL_PAID' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
export type PaymentType = 'online' | 'direct';
export type PaymentMode  = 'full' | 'advance_40' | 'reservation_500' | 'direct';
export type BookingStatus = 'pending' | 'reserved' | 'partially_paid' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';

// ─── Roadmap ─────────────────────────────────────────────────────────────────

export interface IRoadmapPoint {
  day: number;
  locationName: string;
  coords: { lat: number; lng: number };
  image: string;
  overview: string;
  nightStay?: {
    image: string;
    description: string;
  };
}

// ─── Vehicle ──────────────────────────────────────────────────────────────────

export interface IVehicle {
  name: string;
  image: string;
  capacity?: number;
}

// ─── Pricing Tier ─────────────────────────────────────────────────────────────

export interface IPricingTier {
  persons: 1 | 2 | 4 | 6;
  totalPrice: number;   // flat total (not per-person)
  vehicle?: string;     // vehicle assigned for this group size
}

// ─── Hotel / Accommodation ────────────────────────────────────────────────────

export interface IHotel {
  name: string;
  rating: string;
  images: string[];
  description?: string;
  contactNumber?: string;
}

// ─── Map Pin ──────────────────────────────────────────────────────────────────

export interface IMapPin {
  itineraryId: string;
  title: string;
  lat: number;
  lng: number;
  thumbnail: string;
  price: number;
}

// ─── User ─────────────────────────────────────────────────────────────────────

export interface IUser {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
}

// ─── Itinerary ────────────────────────────────────────────────────────────────

export const ITINERARY_GENRES = [
  'Adventure',
  'Spiritual',
  'Family',
  'Couple',
  'Solo',
  'Luxury',
  'Wildlife',
  'Trekking',
] as const;

export type ItineraryGenre = (typeof ITINERARY_GENRES)[number];

export interface IItinerary {
  _id: string;
  title: string;
  duration: string;
  tags: string[];
  genres: ItineraryGenre[];
  description: string;
  price: number;
  thumbnail: string;
  video?: string;         // YouTube/Vimeo URL or embed ID
  vehicles: IVehicle[];
  inclusions: string[];
  exclusions: string[];   // what's NOT included
  pricingTiers: IPricingTier[]; // 1 / 2 / 4 / 6 person flat prices
  hotels: IHotel[];
  roadmap: IRoadmapPoint[];
  mapCoords?: { lat: number; lng: number }; // last destination
  isRecommended: boolean;
  hasDiscount?: boolean;
  originalPrice?: number;   // for price anchoring display
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

// ─── Blog ─────────────────────────────────────────────────────────────────────

export interface IBlog {
  _id: string;
  title: string;
  slug: string;
  content?: string;           // HTML from rich text editor
  thumbnail: string;
  tags: string[];
  author: string;
  isRecommended: boolean;
  publishedAt: string;
  createdAt: string;
  videoUrl?: string;          // Social video (Instagram Reel, YouTube, etc.)
  relatedItinerary?: string;  // linked itinerary ObjectId
  sections?: {
    header?: string;
    paragraph?: string;
    image?: string;
  }[];
  // ─── pSEO integration fields ──────────────────────────────────────
  source?: 'blog' | 'pseo';     // content origin
  href?: string;                 // override link (pSEO → /explore/...)
  pageType?: string;             // pSEO page_type for badges
  circuit?: string;              // pSEO circuit
}

// ─── Booking ──────────────────────────────────────────────────────────────────

export interface IBooking {
  _id: string;
  user: string | IUser;
  itinerary: string | IItinerary;
  paymentType: PaymentType;
  paymentMode: PaymentMode;
  totalAmount: number;
  amountPaidOnline: number;
  reservationFee: number;
  balanceDue: number;
  balanceDueDate?: string;
  paymentStatus: PaymentStatus;
  bookingStatus: BookingStatus;
  pickupPoint: string;
  contactPhone: string;
  tourDate?: string;
  groupSize?: number;
  vehicleAssigned?: string;
  guideAssigned?: string;
  hotelStatus?: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  invoiceToken?: string;          // Set after invoice generation
  disclaimerAccepted?: boolean;
  createdAt: string;
  updatedAt: string;
}

// ─── Payment ──────────────────────────────────────────────────────────────────

export interface IPayment {
  _id: string;
  booking: string | IBooking;
  razorpayPaymentId: string;
  razorpaySignature: string;
  status: 'success' | 'failed';
  amount: number;
  createdAt: string;
}

// ─── API Responses ────────────────────────────────────────────────────────────

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  total: number;
  page: number;
  totalPages: number;
}

// ─── Filter Params ────────────────────────────────────────────────────────────

export interface ItineraryFilters {
  genre?: ItineraryGenre;
  tags?: string[];
  search?: string;
  minDuration?: number;
  maxDuration?: number;
  page?: number;
  limit?: number;
}

// ─── Review (Static for carousels) ───────────────────────────────────────────

export interface IReview {
  id: string;
  name: string;
  location: string;
  rating: number;
  comment: string;
  avatar?: string;
  itinerary?: string;
}

// ─── Review (DB-backed) ────────────────────────────────────────────────────────

export interface IDbReview {
  _id: string;
  user: string | IUser;
  itinerary: string;
  booking: string;
  rating: number;
  title: string;
  comment: string;
  images: string[];
  isVerified: boolean;
  isHidden: boolean;
  isHighlighted: boolean;
  helpfulCount: number;
  tripDate?: string;
  createdAt: string;
}

